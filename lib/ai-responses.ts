import { HelpArticle, ServiceRequest } from "./types";

export interface AiAnswer {
  text: string;
  sources: { id: string; title: string }[];
  suggestions: string[];
  steps: string[];
}

const DEFAULT_STEPS = [
  "Understanding your request",
  "Checking available information",
  "Finding relevant guidance",
  "Preparing your response",
];

function scoreArticle(query: string, haystack: string): number {
  const words = query
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2);
  let score = 0;
  for (const w of words) {
    if (haystack.toLowerCase().includes(w)) score += 1;
  }
  return score;
}

/**
 * Lightweight, fully client-side stand-in for the RAG-grounded answer engine
 * that lives on the backend. It ranks the approved knowledge base by keyword
 * overlap and cites whichever article it drew from, so the UI can demonstrate
 * source-grounded answers without a live model in this customer-only build.
 */
export function answerQuestion(
  query: string,
  helpArticles: HelpArticle[],
  activeRequests: ServiceRequest[],
): AiAnswer {
  const lower = query.toLowerCase();

  const requestMatch = activeRequests.find((r) =>
    lower.includes(r.code.toLowerCase().replace("req-", "")),
  );
  if (requestMatch || /\brequest\b|\bstatus\b|\bREQ-/i.test(query)) {
    const target = requestMatch ?? activeRequests[0];
    if (target) {
      return {
        text: `Request ${target.code} (${target.title}) is currently ${statusLabel(
          target.status,
        )}. ${target.aiSummary}`,
        sources: [{ id: "live", title: "Your request history" }],
        suggestions: [
          `What happens after ${target.code} is reviewed?`,
          "How do I add more details to a request?",
        ],
        steps: [...DEFAULT_STEPS.slice(0, 2), "Checking your open requests", "Preparing your response"],
      };
    }
  }

  const ranked = helpArticles.map((article) => ({
    article,
    score: scoreArticle(lower, `${article.title} ${article.summary} ${article.body.join(" ")}`),
  }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length > 0) {
    const top = ranked[0].article;
    return {
      text: top.body[0],
      sources: [{ id: top.id, title: top.source }],
      suggestions: ranked
        .slice(1, 3)
        .map((r) => r.article.title)
        .concat(ranked.length === 1 ? ["How do I submit a request?"] : []),
      steps: DEFAULT_STEPS,
    };
  }

  return {
    text:
      "I couldn't find an exact match in our knowledge base, but I can create a request so a specialist can help directly. Want me to start one?",
    sources: [],
    suggestions: [
      "Create a request about this",
      "How do I submit a request?",
      "What's the status of my last request?",
    ],
    steps: DEFAULT_STEPS,
  };
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Billing": ["invoice", "charge", "payment", "bill", "refund", "price"],
  "Account support": ["password", "login", "account", "email", "profile", "access"],
  "Service assistance": ["sync", "integration", "error", "bug", "broken", "not working", "issue"],
  "Product question": ["how", "what", "can i", "does", "feature"],
};

export function classifyRequest(description: string): {
  category: string;
  priority: "low" | "normal" | "high";
} {
  const lower = description.toLowerCase();
  let best = "Service assistance";
  let bestScore = 0;
  for (const [category, words] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = words.reduce((acc, w) => acc + (lower.includes(w) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = category;
    }
  }
  const urgentWords = ["urgent", "asap", "immediately", "broken", "down", "can't", "cannot"];
  const priority: "low" | "normal" | "high" = urgentWords.some((w) => lower.includes(w))
    ? "high"
    : description.length < 40
      ? "low"
      : "normal";
  return { category: best, priority };
}

function statusLabel(status: ServiceRequest["status"]): string {
  switch (status) {
    case "submitted":
      return "submitted and waiting to be processed";
    case "processing":
      return "being processed";
    case "review":
      return "under agent review";
    case "needs_info":
      return "waiting on a bit more information from you";
    case "completed":
      return "completed";
  }
}
