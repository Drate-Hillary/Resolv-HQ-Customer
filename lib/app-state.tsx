import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { answerQuestion, classifyRequest } from "./ai-responses";
import {
  CURRENT_USER,
  HELP_ARTICLES,
  INITIAL_NOTIFICATIONS,
  INITIAL_REQUESTS,
  MEMORY_FACTS,
} from "./mock-data";
import {
  AppNotification,
  ChatMessage,
  HelpArticle,
  MemoryFact,
  RequestPriority,
  ServiceRequest,
  UserProfile,
} from "./types";

/**
 * Frontend-only app state for the customer experience. There is no backend in
 * this build, so requests/notifications/chat/memory all live in memory here.
 * The shape mirrors what a real API would return so it can be swapped for
 * network calls without touching the screens that consume this context.
 */
interface AppStateShape {
  hasOnboarded: boolean;
  completeOnboarding: () => void;

  isAuthenticated: boolean;
  user: UserProfile;
  signIn: () => void;
  signUp: () => void;
  signOut: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;

  requests: ServiceRequest[];
  getRequest: (id: string) => ServiceRequest | undefined;
  createRequest: (description: string) => ServiceRequest;
  sendRequestMessage: (requestId: string, text: string) => void;
  submitRequestFeedback: (
    requestId: string,
    rating: number,
    comment?: string,
  ) => void;

  notifications: AppNotification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
  rateChatMessage: (id: string, feedback: "up" | "down") => void;
  resetChat: () => void;

  helpArticles: HelpArticle[];

  memoryFacts: MemoryFact[];
  toggleMemoryFact: (id: string) => void;
}

const AppStateContext = createContext<AppStateShape | null>(null);

function makeWelcomeMessage(): ChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    text: "Hi! I'm your Resolv HQ assistant. Ask me anything about your account, or how to get something done — I'll ground my answers in our approved help content.",
    createdAt: new Date().toISOString(),
    suggestions: [
      "How do I submit a request?",
      "What's the status of REQ-1042?",
      "How does the AI assistant work?",
    ],
  };
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile>(CURRENT_USER);

  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [notifications, setNotifications] = useState<AppNotification[]>(
    INITIAL_NOTIFICATIONS,
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    makeWelcomeMessage(),
  ]);
  const [memoryFacts, setMemoryFacts] = useState<MemoryFact[]>(MEMORY_FACTS);

  const completeOnboarding = useCallback(() => setHasOnboarded(true), []);
  const signIn = useCallback(() => setIsAuthenticated(true), []);
  const signUp = useCallback(() => setIsAuthenticated(true), []);
  const signOut = useCallback(() => setIsAuthenticated(false), []);
  const updateProfile = useCallback(
    (patch: Partial<UserProfile>) => setUser((prev) => ({ ...prev, ...patch })),
    [],
  );

  const getRequest = useCallback(
    (id: string) => requests.find((r) => r.id === id),
    [requests],
  );

  const createRequest = useCallback((description: string): ServiceRequest => {
    const { category, priority } = classifyRequest(description);
    const nextNumber = 1000 + requests.length + Math.floor(Math.random() * 20) + 1;
    const now = new Date().toISOString();
    const newRequest: ServiceRequest = {
      id: String(nextNumber),
      code: `REQ-${nextNumber}`,
      title: category,
      category,
      description,
      status: "submitted",
      priority: priority as RequestPriority,
      createdAt: now,
      updatedAt: now,
      aiSummary:
        "Your request has just been submitted. The assistant has classified it and it's now queued for processing.",
      timeline: [
        { key: "submitted", label: "Submitted", timestamp: now },
        { key: "processing", label: "Processing" },
        { key: "review", label: "Agent review" },
        { key: "completed", label: "Completed" },
      ],
      messages: [
        {
          id: "m1",
          sender: "customer",
          text: description,
          timestamp: now,
        },
        {
          id: "m2",
          sender: "ai",
          text: `Thanks — I've classified this as "${category}" with ${priority} priority and sent it to our team.`,
          timestamp: now,
        },
      ],
      csat: null,
    };
    setRequests((prev) => [newRequest, ...prev]);
    setNotifications((prev) => [
      {
        id: `n-${newRequest.id}`,
        type: "request_update",
        title: "Request received",
        body: `We've received your request ${newRequest.code} and it's now in the queue.`,
        createdAt: now,
        read: false,
        requestId: newRequest.id,
      },
      ...prev,
    ]);
    return newRequest;
  }, [requests.length]);

  const sendRequestMessage = useCallback((requestId: string, text: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          updatedAt: new Date().toISOString(),
          messages: [
            ...r.messages,
            {
              id: `m-${r.messages.length + 1}`,
              sender: "customer",
              text,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      }),
    );
  }, []);

  const submitRequestFeedback = useCallback(
    (requestId: string, rating: number, comment?: string) => {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, csat: { rating, comment } } : r,
        ),
      );
    },
    [],
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const sendChatMessage = useCallback(
    (text: string) => {
      const userMessage: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        text,
        createdAt: new Date().toISOString(),
      };
      const pendingId = `a-${Date.now()}`;
      const answer = answerQuestion(text, requests);
      const pendingMessage: ChatMessage = {
        id: pendingId,
        role: "assistant",
        text: "",
        pending: true,
        steps: answer.steps,
        createdAt: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, userMessage, pendingMessage]);

      setTimeout(() => {
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
      }, 1450);
    },
    [requests],
  );

  const rateChatMessage = useCallback((id: string, feedback: "up" | "down") => {
    setChatMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, feedback } : m)),
    );
  }, []);

  const resetChat = useCallback(() => setChatMessages([makeWelcomeMessage()]), []);

  const toggleMemoryFact = useCallback((id: string) => {
    setMemoryFacts((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
    );
  }, []);

  const value: AppStateShape = {
    hasOnboarded,
    completeOnboarding,
    isAuthenticated,
    user,
    signIn,
    signUp,
    signOut,
    updateProfile,
    requests,
    getRequest,
    createRequest,
    sendRequestMessage,
    submitRequestFeedback,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    chatMessages,
    sendChatMessage,
    rateChatMessage,
    resetChat,
    helpArticles: HELP_ARTICLES,
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
