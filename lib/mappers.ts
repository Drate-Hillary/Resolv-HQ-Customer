// Pure mapping helpers between Supabase rows (lib/database.types.ts) and the
// app-facing shapes in lib/types.ts. Keeping these in one place is what lets
// screens/components stay mostly unaware of the DB column names.
import {
  AiConversationRow,
  AiMessageRow,
  CustomerMemoryFactRow,
  HelpArticleRow,
  NotificationRow,
  RequestAttachmentRow,
  RequestCategory,
  RequestMessageRow,
  RequestPriority as DbRequestPriority,
  RequestRow,
  RequestStatus as DbRequestStatus,
  RequestStatusHistoryRow,
} from "./database.types";
import {
  AiConversationSummary,
  AppNotification,
  ChatMessage,
  HelpArticle,
  MemoryFact,
  RequestAttachment,
  RequestCategoryOption,
  RequestMessage,
  RequestPriority,
  RequestStatus,
  ServiceRequest,
  TimelineStep,
} from "./types";

/** Customer app uses "normal", the DB enum uses "medium" — map at the boundary. */
export function priorityToDb(priority: RequestPriority): DbRequestPriority {
  return priority === "normal" ? "medium" : priority;
}

export function priorityFromDb(priority: DbRequestPriority): RequestPriority {
  return priority === "medium" ? "normal" : priority;
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function feedbackFromDb(value: number | null): "up" | "down" | null {
  if (value === 1) return "up";
  if (value === -1) return "down";
  return null;
}

export function feedbackToDb(value: "up" | "down"): number {
  return value === "up" ? 1 : -1;
}

const STAGE_ORDER: { key: RequestStatus; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "processing", label: "Processing" },
  { key: "review", label: "Agent review" },
  { key: "completed", label: "Completed" },
];

/** Builds the four-stage timeline UI from request_status_history rows. */
export function buildTimeline(
  history: RequestStatusHistoryRow[],
  createdAt: string,
): TimelineStep[] {
  const sorted = [...history].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const firstReached = new Map<DbRequestStatus, string>();
  for (const h of sorted) {
    if (!firstReached.has(h.to_status)) firstReached.set(h.to_status, h.created_at);
  }
  return STAGE_ORDER.map(({ key, label }) => ({
    key,
    label,
    timestamp: key === "submitted" ? createdAt : firstReached.get(key),
  }));
}

export function mapRequestRow(
  row: RequestRow,
  categoryName: string | null,
  /** Only populated when loaded for a staff (agent/admin) view — see loadAllData. */
  staffExtra?: { customerName?: string | null; assignedAdminName?: string | null },
): ServiceRequest {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    category: categoryName ?? "General Inquiry",
    categoryId: row.category_id,
    description: row.description,
    status: row.status,
    priority: priorityFromDb(row.priority),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    aiSummary: row.ai_summary ?? "",
    messages: [],
    timeline: buildTimeline([], row.created_at),
    csat: null,
    attachments: [],
    detailsLoaded: false,
    customerId: row.customer_id,
    customerName: staffExtra?.customerName ?? null,
    assignedAdminId: row.assigned_admin_id,
    assignedAdminName: staffExtra?.assignedAdminName ?? null,
  };
}

export function mapAttachmentRow(row: RequestAttachmentRow): RequestAttachment {
  return {
    id: row.id,
    fileUrl: row.file_url,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSizeBytes: row.file_size_bytes,
    createdAt: row.created_at,
    messageId: row.message_id,
  };
}

export function mapMessageRow(
  row: RequestMessageRow,
  attachments: RequestAttachment[] = [],
): RequestMessage {
  return {
    id: row.id,
    sender: row.sender_type,
    text: row.text,
    timestamp: row.created_at,
    attachments,
  };
}

export function mapNotificationRow(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    read: row.read,
    requestId: row.request_id ?? undefined,
  };
}

export function mapHelpArticleRow(row: HelpArticleRow): HelpArticle {
  const body = Array.isArray(row.body)
    ? (row.body as unknown[]).filter((p): p is string => typeof p === "string")
    : [];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    summary: row.summary,
    body,
    source: row.source,
    readMinutes: row.read_minutes,
  };
}

export function mapMemoryFactRow(row: CustomerMemoryFactRow): MemoryFact {
  return {
    id: row.id,
    label: row.label,
    detail: row.detail,
    enabled: row.enabled,
  };
}

export function mapCategoryRow(row: RequestCategory): RequestCategoryOption {
  return { id: row.id, name: row.name, description: row.description };
}

export function mapAiMessageRow(row: AiMessageRow): ChatMessage {
  const suggestions = Array.isArray(row.suggestions)
    ? (row.suggestions as unknown[]).filter((s): s is string => typeof s === "string")
    : undefined;
  const steps = Array.isArray(row.steps)
    ? (row.steps as unknown[]).filter((s): s is string => typeof s === "string")
    : undefined;
  return {
    id: row.id,
    role: row.role,
    text: row.content,
    suggestions,
    steps,
    createdAt: row.created_at,
    feedback: feedbackFromDb(row.feedback),
    persisted: true,
  };
}

export function mapConversationRow(
  row: AiConversationRow,
  preview: string,
  messageCount: number,
): AiConversationSummary {
  return {
    id: row.id,
    startedAt: row.started_at,
    preview,
    messageCount,
  };
}

/** Picks the best matching category id for the assistant's free-text suggestion. */
export function resolveCategoryId(
  categories: RequestCategoryOption[],
  suggestedName: string,
): string | null {
  if (categories.length === 0) return null;
  const exact = categories.find(
    (c) => c.name.toLowerCase() === suggestedName.toLowerCase(),
  );
  if (exact) return exact.id;
  const fallback = categories.find((c) => c.name.toLowerCase() === "general inquiry");
  return (fallback ?? categories[0]).id;
}
