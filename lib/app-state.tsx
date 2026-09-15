import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as Linking from "expo-linking";
import { answerQuestion, classifyRequest } from "./ai-responses";
import { ATTACHMENTS_BUCKET, PickedAsset } from "./attachments";
import { AiMessageRow, Database } from "./database.types";
import {
  buildTimeline,
  feedbackFromDb,
  feedbackToDb,
  formatMemberSince,
  initialsFromName,
  mapAiMessageRow,
  mapAttachmentRow,
  mapCategoryRow,
  mapConversationRow,
  mapHelpArticleRow,
  mapMemoryFactRow,
  mapMessageRow,
  mapNotificationRow,
  mapRequestRow,
  priorityToDb,
  resolveCategoryId,
} from "./mappers";
import { supabase } from "./supabase";
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
 * Single data layer for the customer app, backed by Supabase (auth + Postgres
 * + Storage). Screens consume this context instead of talking to `supabase`
 * directly, mirroring the previous in-memory-mock architecture so the swap
 * didn't require touching every screen's shape expectations.
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

  // Agent-only actions (RLS-gated to role in ('admin', 'agent') server-side).
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

  const loadConversationsList = useCallback(async (uid: string) => {
    const { data: convRows, error } = await supabase
      .from("ai_conversations")
      .select("*")
      .eq("customer_id", uid)
      .order("started_at", { ascending: false });
    if (error || !convRows) {
      if (error) console.warn("Failed to load conversations", error.message);
      setConversations([]);
      return;
    }
    if (convRows.length === 0) {
      setConversations([]);
      return;
    }
    const ids = convRows.map((c) => c.id);
    const { data: msgRows } = await supabase
      .from("ai_messages")
      .select("*")
      .in("conversation_id", ids)
      .order("created_at", { ascending: true });
    const byConversation = new Map<string, AiMessageRow[]>();
    for (const m of msgRows ?? []) {
      const list = byConversation.get(m.conversation_id) ?? [];
      list.push(m);
      byConversation.set(m.conversation_id, list);
    }
    const summaries = convRows.map((c) => {
      const msgs = byConversation.get(c.id) ?? [];
      const firstUser = msgs.find((m) => m.role === "user");
      const preview = firstUser?.content ?? "New conversation";
      return mapConversationRow(c, preview, msgs.length);
    });
    setConversations(summaries);
  }, []);

  const loadAllData = useCallback(
    async (uid: string, authEmail: string | null) => {
      setRequestsLoading(true);

      // Role decides the shape of everything else we fetch, so resolve it first.
      const profileRes = await supabase.from("profiles").select("*").eq("id", uid).single();

      if (profileRes.data?.role === "admin") {
        // Admins manage Resolv-HQ from the Next.js console, not this app —
        // don't load a customer-shaped view for them.
        await supabase.auth.signOut();
        setRequestsLoading(false);
        return;
      }

      const role: UserProfile["role"] = profileRes.data?.role === "agent" ? "agent" : "customer";

      // Agents work every open request across all customers, not just their
      // own — and skip the purely customer-facing tables entirely.
      const [customerProfileRes, requestsRes, notificationsRes, categoriesRes, helpRes, memoryRes] =
        await Promise.all([
          role === "customer"
            ? supabase.from("customer_profiles").select("*").eq("id", uid).single()
            : null,
          role === "agent"
            ? supabase
                .from("requests")
                .select("*")
                .neq("status", "completed")
                .order("created_at", { ascending: true })
            : supabase
                .from("requests")
                .select("*")
                .eq("customer_id", uid)
                .order("created_at", { ascending: false }),
          role === "customer"
            ? supabase
                .from("notifications")
                .select("*")
                .eq("customer_id", uid)
                .order("created_at", { ascending: false })
            : null,
          supabase.from("request_categories").select("*").order("name", { ascending: true }),
          supabase.from("help_articles").select("*").order("category", { ascending: true }),
          role === "customer"
            ? supabase
                .from("customer_memory_facts")
                .select("*")
                .eq("customer_id", uid)
                .order("created_at", { ascending: true })
            : null,
        ]);

      if (profileRes.data) {
        const cp = customerProfileRes?.data;
        setUser({
          id: uid,
          role,
          name: profileRes.data.full_name ?? "",
          email: authEmail ?? "",
          phone: profileRes.data.phone ?? "",
          memberSince: formatMemberSince(profileRes.data.created_at),
          avatarInitials: initialsFromName(profileRes.data.full_name || authEmail || "?"),
          plan: cp?.plan ?? "Free",
          pushNotifications: cp?.push_notifications ?? true,
          emailNotifications: cp?.email_notifications ?? true,
          aiPersonalization: cp?.ai_personalization ?? true,
          memoryEnabled: cp?.memory_enabled ?? true,
        });
      } else if (profileRes.error) {
        console.warn("Failed to load profile", profileRes.error.message);
      }

      const categoryOptions = categoriesRes.data ? categoriesRes.data.map(mapCategoryRow) : [];
      setCategories(categoryOptions);
      const categoryMap = new Map(categoryOptions.map((c) => [c.id, c.name]));

      if (requestsRes.data) {
        if (role === "agent") {
          // Resolve the requesting customer's + assignee's display names in
          // one extra query rather than N+1-ing per row.
          const peopleIds = new Set<string>();
          for (const row of requestsRes.data) {
            peopleIds.add(row.customer_id);
            if (row.assigned_admin_id) peopleIds.add(row.assigned_admin_id);
          }
          const { data: peopleRows } =
            peopleIds.size > 0
              ? await supabase.from("profiles").select("id, full_name").in("id", Array.from(peopleIds))
              : { data: [] as { id: string; full_name: string | null }[] };
          const nameById = new Map((peopleRows ?? []).map((p) => [p.id, p.full_name]));

          setRequests(
            requestsRes.data.map((row) =>
              mapRequestRow(row, row.category_id ? categoryMap.get(row.category_id) ?? null : null, {
                customerName: nameById.get(row.customer_id) ?? null,
                assignedAdminName: row.assigned_admin_id
                  ? nameById.get(row.assigned_admin_id) ?? null
                  : null,
              }),
            ),
          );
        } else {
          setRequests(
            requestsRes.data.map((row) =>
              mapRequestRow(row, row.category_id ? categoryMap.get(row.category_id) ?? null : null),
            ),
          );
        }
      } else if (requestsRes.error) {
        console.warn("Failed to load requests", requestsRes.error.message);
      }

      if (notificationsRes?.data) setNotifications(notificationsRes.data.map(mapNotificationRow));
      if (helpRes.data) setHelpArticles(helpRes.data.map(mapHelpArticleRow));
      if (memoryRes?.data) setMemoryFacts(memoryRes.data.map(mapMemoryFactRow));

      setRequestsLoading(false);
      // AI conversations are a customer-facing concept only.
      if (role === "customer") loadConversationsList(uid);
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
        loadAllData(session.user.id, session.user.email ?? null).finally(() => {
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
        loadAllData(session.user.id, session.user.email ?? null);
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
  // Auth
  // ---------------------------------------------------------------------
  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      if (profile?.role === "admin") {
        await supabase.auth.signOut();
        return { error: "Admin accounts use the Resolv-HQ web console, not this app." };
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
      const profilePatch: Database["public"]["Tables"]["profiles"]["Update"] = {};
      if (patch.name !== undefined) profilePatch.full_name = patch.name;
      if (patch.phone !== undefined) profilePatch.phone = patch.phone;

      if (Object.keys(profilePatch).length > 0) {
        const { error } = await supabase.from("profiles").update(profilePatch).eq("id", userId);
        if (error) return { error: error.message };
      }
      if (patch.email !== undefined && patch.email !== user.email) {
        const { error } = await supabase.auth.updateUser({ email: patch.email });
        if (error) return { error: error.message };
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
    [userId, user.email],
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
      const dbPatch: Database["public"]["Tables"]["customer_profiles"]["Update"] = {};
      if (patch.pushNotifications !== undefined) dbPatch.push_notifications = patch.pushNotifications;
      if (patch.emailNotifications !== undefined)
        dbPatch.email_notifications = patch.emailNotifications;
      if (patch.aiPersonalization !== undefined) dbPatch.ai_personalization = patch.aiPersonalization;
      if (patch.memoryEnabled !== undefined) dbPatch.memory_enabled = patch.memoryEnabled;

      setUser((prev) => ({ ...prev, ...patch }));
      const { error } = await supabase.from("customer_profiles").update(dbPatch).eq("id", userId);
      if (error) {
        console.warn("Failed to update preferences", error.message);
        return { error: error.message };
      }
      return { error: null };
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

  const uploadAttachment = useCallback(
    async (
      requestId: string,
      messageId: string | null,
      asset: PickedAsset,
    ): Promise<RequestAttachment | null> => {
      if (!userId) return null;
      try {
        const safeName = asset.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${userId}/${requestId}/${Date.now()}-${safeName}`;
        const response = await fetch(asset.uri);
        const arrayBuffer = await response.arrayBuffer();
        const { error: uploadError } = await supabase.storage
          .from(ATTACHMENTS_BUCKET)
          .upload(path, arrayBuffer, {
            contentType: asset.mimeType ?? "application/octet-stream",
            upsert: false,
          });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from(ATTACHMENTS_BUCKET)
          .getPublicUrl(path);

        const { data: row, error: insertError } = await supabase
          .from("request_attachments")
          .insert({
            request_id: requestId,
            message_id: messageId,
            uploaded_by: userId,
            file_url: publicUrlData.publicUrl,
            file_name: asset.name,
            file_type: asset.mimeType,
            file_size_bytes: asset.size,
          })
          .select()
          .single();
        if (insertError || !row) throw insertError;
        return mapAttachmentRow(row);
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
      const { category, priority } = classifyRequest(description);
      const resolvedCategoryId = categoryId ?? resolveCategoryId(categories, category);
      const aiSummary = `Thanks — I've classified this as "${category}" with ${priority} priority and sent it to our team.`;

      const { data: requestRow, error } = await supabase
        .from("requests")
        .insert({
          customer_id: userId,
          category_id: resolvedCategoryId,
          title: category,
          description,
          priority: priorityToDb(priority),
          source: "mobile",
          ai_summary: aiSummary,
        })
        .select()
        .single();
      if (error || !requestRow) {
        console.warn("Failed to create request", error?.message);
        return null;
      }

      const { data: messageRow } = await supabase
        .from("request_messages")
        .insert({ request_id: requestRow.id, sender_type: "customer", text: description })
        .select()
        .single();

      const uploaded: RequestAttachment[] = [];
      if (messageRow) {
        for (const asset of attachments) {
          const attachment = await uploadAttachment(requestRow.id, messageRow.id, asset);
          if (attachment) uploaded.push(attachment);
        }
      }

      const categoryName =
        categories.find((c) => c.id === resolvedCategoryId)?.name ?? category;
      const newRequest: ServiceRequest = {
        ...mapRequestRow(requestRow, categoryName),
        messages: messageRow ? [mapMessageRow(messageRow, uploaded)] : [],
        attachments: uploaded,
        detailsLoaded: true,
      };
      setRequests((prev) => [newRequest, ...prev]);
      return newRequest;
    },
    [userId, categories, uploadAttachment],
  );

  const sendRequestMessage = useCallback(async (requestId: string, text: string) => {
    const { data: row, error } = await supabase
      .from("request_messages")
      .insert({ request_id: requestId, sender_type: "customer", text })
      .select()
      .single();
    if (error || !row) {
      console.warn("Failed to send message", error?.message);
      return null;
    }
    const message = mapMessageRow(row);
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, messages: [...r.messages, message] } : r)),
    );
    return message;
  }, []);

  const submitRequestFeedback = useCallback(
    async (requestId: string, rating: number, comment?: string) => {
      const { data: row, error } = await supabase
        .from("request_feedback")
        .insert({ request_id: requestId, rating, comment: comment ?? null })
        .select()
        .single();
      if (error || !row) {
        console.warn("Failed to submit feedback", error?.message);
        return { error: error?.message ?? "Could not submit feedback." };
      }
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, csat: { rating: row.rating, comment: row.comment ?? undefined } }
            : r,
        ),
      );
      return { error: null };
    },
    [],
  );

  const loadRequestDetail = useCallback(async (id: string) => {
    const [messagesRes, attachmentsRes, historyRes, feedbackRes] = await Promise.all([
      supabase
        .from("request_messages")
        .select("*")
        .eq("request_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("request_attachments")
        .select("*")
        .eq("request_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("request_status_history")
        .select("*")
        .eq("request_id", id)
        .order("created_at", { ascending: true }),
      supabase.from("request_feedback").select("*").eq("request_id", id).maybeSingle(),
    ]);

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const allAttachments = (attachmentsRes.data ?? []).map(mapAttachmentRow);
        const attachmentsByMessage = new Map<string, RequestAttachment[]>();
        for (const a of allAttachments) {
          if (!a.messageId) continue;
          const list = attachmentsByMessage.get(a.messageId) ?? [];
          list.push(a);
          attachmentsByMessage.set(a.messageId, list);
        }
        const messages = (messagesRes.data ?? []).map((m) =>
          mapMessageRow(m, attachmentsByMessage.get(m.id) ?? []),
        );
        const feedback = feedbackRes.data;
        return {
          ...r,
          messages,
          attachments: allAttachments,
          timeline: buildTimeline(historyRes.data ?? [], r.createdAt),
          csat: feedback ? { rating: feedback.rating, comment: feedback.comment ?? undefined } : null,
          detailsLoaded: true,
        };
      }),
    );
  }, []);

  // ---------------------------------------------------------------------
  // Agent-only actions
  // ---------------------------------------------------------------------
  const sendSupportMessage = useCallback(
    async (requestId: string, text: string) => {
      if (!userId) return null;
      const { data: row, error } = await supabase
        .from("request_messages")
        .insert({ request_id: requestId, sender_type: "support", sender_id: userId, text })
        .select()
        .single();
      if (error || !row) {
        console.warn("Failed to send support message", error?.message);
        return null;
      }
      const message = mapMessageRow(row);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, messages: [...r.messages, message] } : r)),
      );
      return message;
    },
    [userId],
  );

  const updateRequestStatus = useCallback(
    async (requestId: string, status: RequestStatus) => {
      const { error } = await supabase.from("requests").update({ status }).eq("id", requestId);
      if (error) {
        console.warn("Failed to update request status", error.message);
        return { error: error.message };
      }
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status, updatedAt: new Date().toISOString() } : r,
        ),
      );
      // request_status_history is written by a DB trigger — refresh the
      // timeline (and notifications the trigger also creates for the
      // customer) rather than reconstructing it locally.
      await loadRequestDetail(requestId);
      return { error: null };
    },
    [loadRequestDetail],
  );

  const assignRequestToMe = useCallback(
    async (requestId: string) => {
      if (!userId) return { error: "You need to be signed in." };
      const { error } = await supabase
        .from("requests")
        .update({ assigned_admin_id: userId })
        .eq("id", requestId);
      if (error) {
        console.warn("Failed to assign request", error.message);
        return { error: error.message };
      }
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, assignedAdminId: userId, assignedAdminName: user.name } : r,
        ),
      );
      return { error: null };
    },
    [userId, user.name],
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
    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
    if (error) console.warn("Failed to mark notification read", error.message);
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    if (!userId) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("customer_id", userId)
      .eq("read", false);
    if (error) console.warn("Failed to mark all notifications read", error.message);
  }, [userId]);

  // ---------------------------------------------------------------------
  // AI assistant conversations
  // ---------------------------------------------------------------------
  const refreshConversations = useCallback(async () => {
    if (!userId) return;
    await loadConversationsList(userId);
  }, [userId, loadConversationsList]);

  const loadConversation = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    if (error) {
      console.warn("Failed to load conversation", error.message);
      return;
    }
    setChatMessages(data && data.length > 0 ? data.map(mapAiMessageRow) : [makeWelcomeMessage()]);
    setActiveConversationId(id);
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
      const answer = answerQuestion(text, helpArticles, requests);
      const pendingMessage: ChatMessage = {
        id: pendingId,
        role: "assistant",
        text: "",
        pending: true,
        steps: answer.steps,
        createdAt: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, userMessage, pendingMessage]);

      let conversationId = activeConversationId;
      try {
        if (!conversationId) {
          const { data, error } = await supabase
            .from("ai_conversations")
            .insert({ customer_id: userId, channel: "chat" })
            .select()
            .single();
          if (error || !data) throw error;
          conversationId = data.id;
          setActiveConversationId(conversationId);
        }
        const { data: userRow, error: userErr } = await supabase
          .from("ai_messages")
          .insert({ conversation_id: conversationId, role: "user", content: text })
          .select()
          .single();
        if (!userErr && userRow) {
          const mapped = mapAiMessageRow(userRow);
          setChatMessages((prev) => prev.map((m) => (m.id === localUserId ? mapped : m)));
        }
      } catch (e) {
        console.warn("Failed to persist chat message", e);
      }

      setTimeout(async () => {
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === pendingId
              ? {
                  ...m,
                  pending: false,
                  text: answer.text,
                  sources: answer.sources,
                  suggestions: answer.suggestions,
                }
              : m,
          ),
        );

        if (!conversationId) return;
        try {
          // NOTE: under the deployed RLS policies, ai_messages insert for
          // role='assistant' requires is_staff() — a customer-authenticated
          // client cannot write the assistant's reply. We still attempt it
          // (in case a future service-role-backed function relaxes this)
          // and gracefully keep the reply local-only if it's rejected.
          const { data: assistantRow, error } = await supabase
            .from("ai_messages")
            .insert({
              conversation_id: conversationId,
              role: "assistant",
              content: answer.text,
              suggestions: answer.suggestions,
              steps: answer.steps,
            })
            .select()
            .single();
          if (!error && assistantRow) {
            const mapped = { ...mapAiMessageRow(assistantRow), sources: answer.sources };
            setChatMessages((prev) => prev.map((m) => (m.id === pendingId ? mapped : m)));
          } else if (error) {
            console.warn("Assistant reply not persisted (RLS likely blocked it):", error.message);
          }
        } catch (e) {
          console.warn("Failed to persist assistant reply", e);
        }
        refreshConversations();
      }, 1450);
    },
    [activeConversationId, requests, helpArticles, userId, refreshConversations],
  );

  const rateChatMessage = useCallback(async (id: string, feedback: "up" | "down") => {
    setChatMessages((prev) => prev.map((m) => (m.id === id ? { ...m, feedback } : m)));
    if (id.startsWith("local-")) return; // never made it to a real row
    const { error } = await supabase
      .from("ai_messages")
      .update({ feedback: feedbackToDb(feedback) })
      .eq("id", id);
    if (error) console.warn("Failed to persist feedback", error.message);
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
      const { error } = await supabase
        .from("customer_memory_facts")
        .update({ enabled: next })
        .eq("id", id);
      if (error) console.warn("Failed to toggle memory fact", error.message);
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
