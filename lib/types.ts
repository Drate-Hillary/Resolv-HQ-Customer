export type RequestStatus =
  | "submitted"
  | "processing"
  | "review"
  | "completed"
  | "needs_info";

export type RequestPriority = "low" | "normal" | "high";

export interface TimelineStep {
  key: RequestStatus;
  label: string;
  timestamp?: string;
}

export interface RequestMessage {
  id: string;
  sender: "customer" | "support" | "ai";
  text: string;
  timestamp: string;
}

export interface ServiceRequest {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  createdAt: string;
  updatedAt: string;
  aiSummary: string;
  messages: RequestMessage[];
  timeline: TimelineStep[];
  csat?: { rating: number; comment?: string } | null;
}

export type ChatRole = "user" | "assistant";

export interface ChatSource {
  id: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  sources?: ChatSource[];
  suggestions?: string[];
  createdAt: string;
  feedback?: "up" | "down" | null;
  pending?: boolean;
  steps?: string[];
}

export type NotificationType =
  | "request_update"
  | "ai"
  | "support"
  | "completed"
  | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  requestId?: string;
}

export interface HelpArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  body: string[];
  source: string;
  readMinutes: number;
}

export interface MemoryFact {
  id: string;
  label: string;
  detail: string;
  enabled: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  avatarInitials: string;
  plan: string;
}
