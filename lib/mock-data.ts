// Static, non-persisted UI copy that isn't backed by a table (suggested
// prompts shown in the AI assistant composer). Everything else that used to
// live here (users, requests, notifications, help articles, memory facts) is
// now read from Supabase via lib/app-state.tsx.
export const QUICK_PROMPTS = [
  "How do I submit a request?",
  "What's the status of my last request?",
  "How do I update my payment method?",
  "How does the AI assistant work?",
];
