import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as Linking from "expo-linking";
import { apiBaseUrl, apiClient, apiErrorMessage, getAccessToken } from "../backend/api-client";
import { PickedAsset } from "./attachments";
import { supabase } from "../backend/supabase/client";
import {
  AiConversationSummary,
  AppNotification,
  ChatMessage,
  HelpArticle,
  MemoryFact,
  RequestAttachment,
  RequestCategoryOption,
  RequestMessage,
  RequestStatus,
  ServiceRequest,
  UserProfile,
} from "./types";

/**
 * Single data layer for the customer app, backed by resolv-hq-backend (which
 * owns every Postgres/Storage read and write) plus Supabase Auth directly
 * for sign in/up/out and session handling. Screens consume this context
 * instead of talking to the backend or Supabase directly, so the swap from
 * direct-Supabase to backend-over-HTTP didn't require touching every
 * screen's shape expectations.
 */
interface AppStateShape {
  hasOnboarded: boolean;
  completeOnboarding: () => void;

  authLoading: boolean;
  isAuthenticated: boolean;
  user: UserProfile;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (patch: {
    name?: string;
    email?: string;
    phone?: string;
  }) => Promise<{ error: string | null }>;
  updatePreferences: (
    patch: Partial<
      Pick<
        UserProfile,
        "pushNotifications" | "emailNotifications" | "aiPersonalization" | "memoryEnabled"
      >
    >,
  ) => Promise<{ error: string | null }>;

  requests: ServiceRequest[];
  requestsLoading: boolean;
  getRequest: (id: string) => ServiceRequest | undefined;
  loadRequestDetail: (id: string) => Promise<void>;
  createRequest: (
    description: string,
    categoryId: string | null,
    attachments?: PickedAsset[],
  ) => Promise<ServiceRequest | null>;
  sendRequestMessage: (requestId: string, text: string) => Promise<RequestMessage | null>;
  submitRequestFeedback: (
    requestId: string,
    rating: number,
    comment?: string,
  ) => Promise<{ error: string | null }>;
  addRequestAttachment: (
    requestId: string,
    messageId: string | null,
    asset: PickedAsset,
  ) => Promise<RequestAttachment | null>;

  // Agent-only actions (role-gated server-side by resolv-hq-backend).
  sendSupportMessage: (requestId: string, text: string) => Promise<RequestMessage | null>;
  updateRequestStatus: (
    requestId: string,
    status: RequestStatus,
  ) => Promise<{ error: string | null }>;
  assignRequestToMe: (requestId: string) => Promise<{ error: string | null }>;

  categories: RequestCategoryOption[];

  notifications: AppNotification[];
  unreadCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  chatMessages: ChatMessage[];
  activeConversationId: string | null;
  conversations: AiConversationSummary[];
  sendChatMessage: (text: string) => Promise<void>;
  rateChatMessage: (id: string, feedback: "up" | "down") => Promise<void>;
  resetChat: () => void;
  loadConversation: (id: string) => Promise<void>;
  refreshConversations: () => Promise<void>;

  helpArticles: HelpArticle[];

  memoryFacts: MemoryFact[];
  toggleMemoryFact: (id: string) => Promise<void>;
}

const AppStateContext = createContext<AppStateShape | null>(null);

const DEFAULT_USER: UserProfile = {
  id: "",
  role: "customer",
  name: "",
  email: "",
  phone: "",
  memberSince: "",
  avatarInitials: "?",
  plan: "",
  pushNotifications: true,
  emailNotifications: true,
  aiPersonalization: true,
  memoryEnabled: true,
};

/** GET /me's shape — role is widened vs UserProfile since the backend hands back "admin" too (handled by signing that case out below). */
interface MeResponse extends Omit<UserProfile, "role"> {
  role: "customer" | "agent" | "admin";
}

/** resolv-hq-backend's neutral chat shapes (src/types/api.ts ChatConversationOut/ChatMessageOut). */
interface ChatConversationOut {
  id: string;
  title: string | null;
  status: string;
  startedAt: string;
  messageCount: number;
}

interface ChatMessageOut {
  id: string;
  conversationId: string;
  senderType: "customer" | "assistant" | "system";
  content: string;
  createdAt: string;
}

const DEFAULT_CHAT_STEPS = [
  "Understanding your request",
  "Checking available information",
  "Finding relevant guidance",
  "Preparing your response",
];

function mapChatMessageOut(row: ChatMessageOut): ChatMessage {
  return {
    id: row.id,
    role: row.senderType === "customer" ? "user" : "assistant",
    text: row.content,
    createdAt: row.createdAt,
    persisted: true,
  };
}

/** Small pure formatter — no data access, safe to keep local now that backend/mappers.ts is gone. */
function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function makeWelcomeMessage(): ChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    text: "Hi! I'm your Resolv HQ assistant. Ask me anything about your account, or how to get something done — I'll ground my answers in our approved help content.",
    createdAt: new Date().toISOString(),
    suggestions: [
      "How do I submit a request?",
      "What's the status of my last request?",
      "How does the AI assistant work?",
    ],
  };
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState(false);

  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [categories, setCategories] = useState<RequestCategoryOption[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [helpArticles, setHelpArticles] = useState<HelpArticle[]>([]);
  const [memoryFacts, setMemoryFacts] = useState<MemoryFact[]>([]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([makeWelcomeMessage()]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<AiConversationSummary[]>([]);

  const completeOnboarding = useCallback(() => setHasOnboarded(true), []);

  const resetLocalState = useCallback(() => {
    setUser(DEFAULT_USER);
    setRequests([]);
    setNotifications([]);
    setMemoryFacts([]);
    setChatMessages([makeWelcomeMessage()]);
    setActiveConversationId(null);
    setConversations([]);
  }, []);

  // GET /chat/conversations doesn't include a preview string, so we fetch
  // each conversation's messages to derive one from the first user message —
  // an N+1, but the conversation list is small and this is the only way to
  // get real preview text out of the backend's actual contract.
  const loadConversationsList = useCallback(async () => {
    try {
      const { data: convRows } = await apiClient.get<ChatConversationOut[]>("/chat/conversations");
      if (convRows.length === 0) {
        setConversations([]);
        return;
      }
      const summaries = await Promise.all(
        convRows.map(async (c) => {
          let preview = "New conversation";
          try {
            const { data: msgs } = await apiClient.get<ChatMessageOut[]>(
              `/chat/conversations/${c.id}`,
            );
            const firstUser = msgs.find((m) => m.senderType === "customer");
            if (firstUser) preview = firstUser.content;
          } catch {
            // keep default preview
          }
          return { id: c.id, startedAt: c.startedAt, preview, messageCount: c.messageCount };
        }),
      );
      setConversations(summaries);
    } catch (e) {
      console.warn("Failed to load conversations", apiErrorMessage(e));
      setConversations([]);
    }
  }, []);

  const loadAllData = useCallback(
    async (uid: string) => {
      setRequestsLoading(true);

      // Role decides the shape of everything else we fetch, so resolve it first.
      let role: UserProfile["role"] = "customer";
      try {
        const { data: profile } = await apiClient.get<MeResponse>("/me");
        if (profile.role === "admin") {
          // Admins manage Resolv-HQ from the Next.js console, not this app —
          // don't load a customer-shaped view for them.
          await supabase.auth.signOut();
          setRequestsLoading(false);
          return;
        }
        role = profile.role === "agent" ? "agent" : "customer";
        setUser({ ...profile, role });
      } catch (e) {
        console.warn("Failed to load profile", apiErrorMessage(e));
      }

      try {
        // /requests is role-aware server-side: agents get the open queue
        // across every customer, customers get just their own.
        const [requestsRes, categoriesRes, helpRes] = await Promise.all([
          apiClient.get<ServiceRequest[]>("/requests"),
          apiClient.get<RequestCategoryOption[]>("/categories"),
          apiClient.get<HelpArticle[]>("/help-articles"),
        ]);
        setRequests(requestsRes.data);
        setCategories(categoriesRes.data);
        setHelpArticles(helpRes.data);
      } catch (e) {
        console.warn("Failed to load requests", apiErrorMessage(e));
      }

      // Notifications, memory facts, and AI conversations are customer-facing
      // concepts only — agents skip them entirely (the backend also 403s
      // these routes for a staff caller).
      if (role === "customer") {
        try {
          const [notificationsRes, memoryRes] = await Promise.all([
            apiClient.get<AppNotification[]>("/notifications"),
            apiClient.get<MemoryFact[]>("/memory-facts"),
          ]);
          setNotifications(notificationsRes.data);
          setMemoryFacts(memoryRes.data);
        } catch (e) {
          console.warn("Failed to load notifications", apiErrorMessage(e));
        }
        loadConversationsList();
      }

      setRequestsLoading(false);
    },
    [loadConversationsList],
  );

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        loadAllData(session.user.id).finally(() => {
          if (mounted) setAuthLoading(false);
        });
      } else {
        setAuthLoading(false);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_IN" && session?.user) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        loadAllData(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setUserId(null);
        resetLocalState();
      }
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------
  // Auth — Supabase Auth is called directly; this is an intentional scope
  // boundary, not something the backend proxies.
  // ---------------------------------------------------------------------
  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    if (data.user) {
      try {
        const { data: profile } = await apiClient.get<MeResponse>("/me");
        if (profile.role === "admin") {
          await supabase.auth.signOut();
          return { error: "Admin accounts use the Resolv-HQ web console, not this app." };
        }
      } catch (e) {
        console.warn("Failed to verify role after sign-in", apiErrorMessage(e));
      }
    }

    return { error: null };
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) return { error: error.message, needsEmailConfirmation: false };
    return { error: null, needsEmailConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: Linking.createURL("/reset-password"),
    });
    return { error: error?.message ?? null };
  }, []);

  const updateProfile = useCallback(
    async (patch: { name?: string; email?: string; phone?: string }) => {
      if (!userId) return { error: "You need to be signed in." };
      try {
        await apiClient.patch("/me", patch);
      } catch (e) {
        return { error: apiErrorMessage(e) };
      }
      setUser((prev) => ({
        ...prev,
        ...(patch.name !== undefined
          ? { name: patch.name, avatarInitials: initialsFromName(patch.name) }
          : {}),
        ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
        ...(patch.email !== undefined ? { email: patch.email } : {}),
      }));
      return { error: null };
    },
    [userId],
  );

  const updatePreferences = useCallback(
    async (
      patch: Partial<
        Pick<
          UserProfile,
          "pushNotifications" | "emailNotifications" | "aiPersonalization" | "memoryEnabled"
        >
      >,
    ) => {
      if (!userId) return { error: "You need to be signed in." };
      setUser((prev) => ({ ...prev, ...patch }));
      try {
        await apiClient.patch("/me/preferences", patch);
        return { error: null };
      } catch (e) {
        const message = apiErrorMessage(e);
        console.warn("Failed to update preferences", message);
        return { error: message };
      }
    },
    [userId],
  );

  // ---------------------------------------------------------------------
  // Requests
  // ---------------------------------------------------------------------
  const getRequest = useCallback(
    (id: string) => requests.find((r) => r.id === id),
    [requests],
  );

  // Multipart upload via RN's fetch (not the axios instance): RN's FormData
  // needs the `{uri, name, type}` file-field convention, and axios's own
  // FormData detection is unreliable on React Native, so this one call goes
  // straight through fetch with the same bearer token api-client attaches.
  const uploadAttachment = useCallback(
    async (
      requestId: string,
      messageId: string | null,
      asset: PickedAsset,
    ): Promise<RequestAttachment | null> => {
      if (!userId) return null;
      try {
        const form = new FormData();
        form.append("file", {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType ?? "application/octet-stream",
        } as unknown as Blob);
        if (messageId) form.append("messageId", messageId);

        const token = await getAccessToken();
        const response = await fetch(`${apiBaseUrl}/requests/${requestId}/attachments`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: form,
        });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? `Upload failed (${response.status})`);
        }
        const row: RequestAttachment = await response.json();
        return row;
      } catch (e) {
        console.warn("Attachment upload failed", e);
        return null;
      }
    },
    [userId],
  );

  const addRequestAttachment = useCallback(
    async (requestId: string, messageId: string | null, asset: PickedAsset) => {
      const attachment = await uploadAttachment(requestId, messageId, asset);
      if (!attachment) return null;
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r;
          return {
            ...r,
            attachments: [...(r.attachments ?? []), attachment],
            messages: r.messages.map((m) =>
              m.id === messageId
                ? { ...m, attachments: [...(m.attachments ?? []), attachment] }
                : m,
            ),
          };
        }),
      );
      return attachment;
    },
    [uploadAttachment],
  );

  const createRequest = useCallback(
    async (
      description: string,
      categoryId: string | null,
      attachments: PickedAsset[] = [],
    ): Promise<ServiceRequest | null> => {
      if (!userId) return null;
      try {
        // Category/priority classification now happens server-side.
        const { data } = await apiClient.post<ServiceRequest>("/requests", {
          description,
          categoryId,
        });

        const firstMessage = data.messages[0];
        const uploaded: RequestAttachment[] = [];
        if (firstMessage) {
          for (const asset of attachments) {
            const attachment = await uploadAttachment(data.id, firstMessage.id, asset);
            if (attachment) uploaded.push(attachment);
          }
        }

        const newRequest: ServiceRequest = {
          ...data,
          messages: firstMessage
            ? [{ ...firstMessage, attachments: uploaded }]
            : data.messages,
          attachments: uploaded,
          detailsLoaded: true,
        };
        setRequests((prev) => [newRequest, ...prev]);
        return newRequest;
      } catch (e) {
        console.warn("Failed to create request", apiErrorMessage(e));
        return null;
      }
    },
    [userId, uploadAttachment],
  );

  const sendRequestMessage = useCallback(async (requestId: string, text: string) => {
    try {
      const { data } = await apiClient.post<RequestMessage>(`/requests/${requestId}/messages`, {
        text,
      });
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, messages: [...r.messages, data] } : r)),
      );
      return data;
    } catch (e) {
      console.warn("Failed to send message", apiErrorMessage(e));
      return null;
    }
  }, []);

  const submitRequestFeedback = useCallback(
    async (requestId: string, rating: number, comment?: string) => {
      try {
        const { data } = await apiClient.post<{ rating: number; comment?: string }>(
          `/requests/${requestId}/feedback`,
          { rating, comment },
        );
        setRequests((prev) =>
          prev.map((r) =>
            r.id === requestId
              ? { ...r, csat: { rating: data.rating, comment: data.comment } }
              : r,
          ),
        );
        return { error: null };
      } catch (e) {
        const message = apiErrorMessage(e);
        console.warn("Failed to submit feedback", message);
        return { error: message };
      }
    },
    [],
  );

  const loadRequestDetail = useCallback(async (id: string) => {
    try {
      const { data } = await apiClient.get<ServiceRequest>(`/requests/${id}`);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...data, detailsLoaded: true } : r)),
      );
    } catch (e) {
      console.warn("Failed to load request detail", apiErrorMessage(e));
    }
  }, []);

  // ---------------------------------------------------------------------
  // Agent-only actions — same /requests endpoints as the customer flows;
  // the backend's own role checks handle the distinction.
  // ---------------------------------------------------------------------
  const sendSupportMessage = useCallback(
    async (requestId: string, text: string) => {
      if (!userId) return null;
      try {
        const { data } = await apiClient.post<RequestMessage>(
          `/requests/${requestId}/messages`,
          { text },
        );
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, messages: [...r.messages, data] } : r)),
        );
        return data;
      } catch (e) {
        console.warn("Failed to send support message", apiErrorMessage(e));
        return null;
      }
    },
    [userId],
  );

  const updateRequestStatus = useCallback(async (requestId: string, status: RequestStatus) => {
    try {
      // The backend returns the full refreshed detail (timeline + the
      // notification-triggering side effects included), so no follow-up
      // fetch is needed.
      const { data } = await apiClient.patch<ServiceRequest>(`/requests/${requestId}/status`, {
        status,
      });
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...data, detailsLoaded: true } : r)),
      );
      return { error: null };
    } catch (e) {
      const message = apiErrorMessage(e);
      console.warn("Failed to update request status", message);
      return { error: message };
    }
  }, []);

  const assignRequestToMe = useCallback(
    async (requestId: string) => {
      if (!userId) return { error: "You need to be signed in." };
      try {
        const { data } = await apiClient.patch<ServiceRequest>(`/requests/${requestId}/assign`, {});
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...data, detailsLoaded: true } : r)),
        );
        return { error: null };
      } catch (e) {
        const message = apiErrorMessage(e);
        console.warn("Failed to assign request", message);
        return { error: message };
      }
    },
    [userId],
  );

  // ---------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const markNotificationRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch (e) {
      console.warn("Failed to mark notification read", apiErrorMessage(e));
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    if (!userId) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await apiClient.patch("/notifications/read-all");
    } catch (e) {
      console.warn("Failed to mark all notifications read", apiErrorMessage(e));
    }
  }, [userId]);

  // ---------------------------------------------------------------------
  // AI assistant conversations
  // ---------------------------------------------------------------------
  const refreshConversations = useCallback(async () => {
    if (!userId) return;
    await loadConversationsList();
  }, [userId, loadConversationsList]);

  const loadConversation = useCallback(async (id: string) => {
    try {
      const { data } = await apiClient.get<ChatMessageOut[]>(`/chat/conversations/${id}`);
      setChatMessages(data.length > 0 ? data.map(mapChatMessageOut) : [makeWelcomeMessage()]);
      setActiveConversationId(id);
    } catch (e) {
      console.warn("Failed to load conversation", apiErrorMessage(e));
    }
  }, []);

  const resetChat = useCallback(() => {
    setActiveConversationId(null);
    setChatMessages([makeWelcomeMessage()]);
  }, []);

  const sendChatMessage = useCallback(
    async (text: string) => {
      if (!userId) return;
      const localUserId = `local-u-${Date.now()}`;
      const userMessage: ChatMessage = {
        id: localUserId,
        role: "user",
        text,
        createdAt: new Date().toISOString(),
      };
      const pendingId = `local-a-${Date.now()}`;
      const pendingMessage: ChatMessage = {
        id: pendingId,
        role: "assistant",
        text: "",
        pending: true,
        steps: DEFAULT_CHAT_STEPS,
        createdAt: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, userMessage, pendingMessage]);

      try {
        let conversationId = activeConversationId;
        if (!conversationId) {
          const { data } = await apiClient.post<ChatConversationOut>("/chat/conversations", {
            channel: "chat",
          });
          conversationId = data.id;
          setActiveConversationId(conversationId);
        }

        // The backend generates and persists the assistant reply server-side
        // (real answer-engine logic) and returns both messages in one shot —
        // no more separate client-side "simulate the reply" step.
        const { data } = await apiClient.post<{
          userMessage: ChatMessageOut;
          assistantMessage: ChatMessageOut;
        }>(`/chat/conversations/${conversationId}/messages`, { content: text });

        setChatMessages((prev) =>
          prev.map((m) => {
            if (m.id === localUserId) return mapChatMessageOut(data.userMessage);
            if (m.id === pendingId) return mapChatMessageOut(data.assistantMessage);
            return m;
          }),
        );
        refreshConversations();
      } catch (e) {
        console.warn("Failed to send chat message", apiErrorMessage(e));
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === pendingId
              ? {
                  ...m,
                  pending: false,
                  text: "Sorry, I couldn't reach the assistant. Please try again.",
                }
              : m,
          ),
        );
      }
    },
    [activeConversationId, userId, refreshConversations],
  );

  const rateChatMessage = useCallback(async (id: string, feedback: "up" | "down") => {
    setChatMessages((prev) => prev.map((m) => (m.id === id ? { ...m, feedback } : m)));
    if (id.startsWith("local-")) return; // never made it to a real row
    try {
      await apiClient.patch(`/chat/messages/${id}/feedback`, { feedback });
    } catch (e) {
      console.warn("Failed to persist feedback", apiErrorMessage(e));
    }
  }, []);

  // ---------------------------------------------------------------------
  // Saved information / memory
  // ---------------------------------------------------------------------
  const toggleMemoryFact = useCallback(
    async (id: string) => {
      const current = memoryFacts.find((f) => f.id === id);
      if (!current) return;
      const next = !current.enabled;
      setMemoryFacts((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: next } : f)));
      try {
        await apiClient.patch(`/memory-facts/${id}`, { enabled: next });
      } catch (e) {
        console.warn("Failed to toggle memory fact", apiErrorMessage(e));
      }
    },
    [memoryFacts],
  );

  const value: AppStateShape = {
    hasOnboarded,
    completeOnboarding,
    authLoading,
    isAuthenticated,
    user,
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    updateProfile,
    updatePreferences,
    requests,
    requestsLoading,
    getRequest,
    loadRequestDetail,
    createRequest,
    sendRequestMessage,
    submitRequestFeedback,
    addRequestAttachment,
    sendSupportMessage,
    updateRequestStatus,
    assignRequestToMe,
    categories,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    chatMessages,
    activeConversationId,
    conversations,
    sendChatMessage,
    rateChatMessage,
    resetChat,
    loadConversation,
    refreshConversations,
    helpArticles,
    memoryFacts,
    toggleMemoryFact,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateShape {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
