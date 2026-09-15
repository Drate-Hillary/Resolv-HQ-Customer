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

export interface RequestAttachment {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string | null;
  fileSizeBytes: number | null;
  createdAt: string;
  messageId?: string | null;
}

export interface RequestMessage {
  id: string;
  sender: "customer" | "support" | "ai";
  text: string;
  timestamp: string;
  attachments?: RequestAttachment[];
}

export interface ServiceRequest {
  id: string;
  code: string;
  title: string;
  category: string;
  categoryId?: string | null;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  createdAt: string;
  updatedAt: string;
  aiSummary: string;
  messages: RequestMessage[];
  timeline: TimelineStep[];
  csat?: { rating: number; comment?: string } | null;
  attachments?: RequestAttachment[];
  /** Whether messages/timeline/attachments/csat have been fetched from Supabase yet. */
  detailsLoaded?: boolean;
  /** Populated for agent/staff views only — the requesting customer and the assignee. */
  customerId?: string;
  customerName?: string | null;
  assignedAdminId?: string | null;
  assignedAdminName?: string | null;
}

export interface RequestCategoryOption {
  id: string;
  name: string;
  description?: string | null;
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
  /** True once this message is confirmed persisted as a real ai_messages row. */
  persisted?: boolean;
}

export interface AiConversationSummary {
  id: string;
  startedAt: string;
  preview: string;
  messageCount: number;
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
  id: string;
  role: "customer" | "agent";
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  avatarInitials: string;
  plan: string;
  pushNotifications: boolean;
  emailNotifications: boolean;
  aiPersonalization: boolean;
  memoryEnabled: boolean;
}
