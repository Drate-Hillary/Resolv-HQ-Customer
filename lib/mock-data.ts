import {
  AppNotification,
  HelpArticle,
  MemoryFact,
  ServiceRequest,
  UserProfile,
} from "./types";
import { isoDaysAgo, isoMinutesAgo } from "./format";

export const CURRENT_USER: UserProfile = {
  name: "Taha Amin",
  email: "taha.amin@example.com",
  phone: "+1 (555) 019-2231",
  memberSince: "March 2024",
  avatarInitials: "TA",
  plan: "Growth Plan",
};

export const INITIAL_REQUESTS: ServiceRequest[] = [
  {
    id: "1042",
    code: "REQ-1042",
    title: "Service assistance",
    category: "Service assistance",
    description:
      "My integration stopped syncing overnight and I need help understanding why records are missing from last night's batch.",
    status: "review",
    priority: "high",
    createdAt: isoDaysAgo(1),
    updatedAt: isoMinutesAgo(10),
    aiSummary:
      "Your request concerns a failed overnight sync between your account and the connected service. The assistant found two similar cases resolved by refreshing the connection token, and a specialist is confirming this applies to your account.",
    timeline: [
      { key: "submitted", label: "Submitted", timestamp: isoDaysAgo(1) },
      {
        key: "processing",
        label: "Processing",
        timestamp: isoDaysAgo(1),
      },
      { key: "review", label: "Agent review", timestamp: isoMinutesAgo(45) },
      { key: "completed", label: "Completed" },
    ],
    messages: [
      {
        id: "m1",
        sender: "customer",
        text: "My integration stopped syncing overnight, can someone take a look?",
        timestamp: isoDaysAgo(1),
      },
      {
        id: "m2",
        sender: "ai",
        text: "Thanks for flagging this — I've checked your account and see the last successful sync was 14 hours ago. I've prepared the details for our support team.",
        timestamp: isoDaysAgo(1),
      },
      {
        id: "m3",
        sender: "support",
        text: "We've received your request and started reviewing the sync logs on our end. We'll follow up shortly.",
        timestamp: isoMinutesAgo(45),
      },
    ],
    csat: null,
  },
  {
    id: "1038",
    code: "REQ-1038",
    title: "Account support",
    category: "Account support",
    description: "Need help updating billing details on my account.",
    status: "completed",
    priority: "normal",
    createdAt: isoDaysAgo(3),
    updatedAt: isoDaysAgo(2),
    aiSummary:
      "Your billing contact and payment method were updated successfully. No further action is required.",
    timeline: [
      { key: "submitted", label: "Submitted", timestamp: isoDaysAgo(3) },
      { key: "processing", label: "Processing", timestamp: isoDaysAgo(3) },
      { key: "review", label: "Agent review", timestamp: isoDaysAgo(2) },
      { key: "completed", label: "Completed", timestamp: isoDaysAgo(2) },
    ],
    messages: [
      {
        id: "m1",
        sender: "customer",
        text: "Can you update the card on file for billing?",
        timestamp: isoDaysAgo(3),
      },
      {
        id: "m2",
        sender: "support",
        text: "Done! Your billing details are now up to date.",
        timestamp: isoDaysAgo(2),
      },
    ],
    csat: { rating: 5, comment: "Quick and painless, thank you!" },
  },
  {
    id: "1035",
    code: "REQ-1035",
    title: "Feature question",
    category: "Product question",
    description: "Asked whether saved information can be exported.",
    status: "completed",
    priority: "low",
    createdAt: isoDaysAgo(6),
    updatedAt: isoDaysAgo(5),
    aiSummary:
      "Explained the export options available under Profile > Saved Information, including CSV export.",
    timeline: [
      { key: "submitted", label: "Submitted", timestamp: isoDaysAgo(6) },
      { key: "processing", label: "Processing", timestamp: isoDaysAgo(6) },
      { key: "review", label: "Agent review", timestamp: isoDaysAgo(5) },
      { key: "completed", label: "Completed", timestamp: isoDaysAgo(5) },
    ],
    messages: [
      {
        id: "m1",
        sender: "customer",
        text: "Can I export my saved information?",
        timestamp: isoDaysAgo(6),
      },
      {
        id: "m2",
        sender: "ai",
        text: "Yes — you can export a CSV copy anytime from Profile > Saved Information.",
        timestamp: isoDaysAgo(5),
      },
    ],
    csat: { rating: 4 },
  },
  {
    id: "1051",
    code: "REQ-1051",
    title: "Needs more information",
    category: "Service assistance",
    description: "Reported an unexpected charge on the last invoice.",
    status: "needs_info",
    priority: "normal",
    createdAt: isoMinutesAgo(180),
    updatedAt: isoMinutesAgo(20),
    aiSummary:
      "We need a copy of the invoice in question to confirm which line item looks incorrect before we can proceed.",
    timeline: [
      { key: "submitted", label: "Submitted", timestamp: isoMinutesAgo(180) },
      {
        key: "processing",
        label: "Processing",
        timestamp: isoMinutesAgo(150),
      },
      { key: "review", label: "Agent review" },
      { key: "completed", label: "Completed" },
    ],
    messages: [
      {
        id: "m1",
        sender: "customer",
        text: "There's a charge on my invoice I don't recognize.",
        timestamp: isoMinutesAgo(180),
      },
      {
        id: "m2",
        sender: "support",
        text: "Could you share the invoice number so we can confirm the line item?",
        timestamp: isoMinutesAgo(20),
      },
    ],
    csat: null,
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    type: "request_update",
    title: "Request updated",
    body: "Your request REQ-1042 is now being reviewed by our team.",
    createdAt: isoMinutesAgo(10),
    read: false,
    requestId: "1042",
  },
  {
    id: "n2",
    type: "ai",
    title: "AI assistance ready",
    body: "We've prepared information that may help with REQ-1042.",
    createdAt: isoMinutesAgo(45),
    read: false,
    requestId: "1042",
  },
  {
    id: "n3",
    type: "support",
    title: "New message from support",
    body: "We need a bit more information about REQ-1051.",
    createdAt: isoMinutesAgo(20),
    read: false,
    requestId: "1051",
  },
  {
    id: "n4",
    type: "completed",
    title: "Request completed",
    body: "REQ-1038 has been marked as completed.",
    createdAt: isoDaysAgo(2),
    read: true,
    requestId: "1038",
  },
  {
    id: "n5",
    type: "system",
    title: "Welcome to Resolv HQ",
    body: "Your account is all set up. Explore the AI assistant anytime you need help.",
    createdAt: isoDaysAgo(6),
    read: true,
  },
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: "a1",
    slug: "submit-a-request",
    title: "How do I submit a request?",
    category: "Getting Started",
    summary:
      "Step-by-step guide to creating and submitting a new service request.",
    source: "Customer Service Guide",
    readMinutes: 2,
    body: [
      "Open the Requests tab and tap the Create Request button in the top right corner.",
      "Describe what you need help with in your own words — the assistant will suggest a category and priority automatically.",
      "Review the details, then tap Submit. You'll be able to track progress from the Requests tab at any time.",
    ],
  },
  {
    id: "a2",
    slug: "track-request-status",
    title: "How do I track my request status?",
    category: "Getting Started",
    summary: "Understand each stage of the request timeline.",
    source: "Customer Service Guide",
    readMinutes: 2,
    body: [
      "Every request moves through four stages: Submitted, Processing, Agent Review, and Completed.",
      "You'll receive a notification whenever your request changes stage, and you can always check the live timeline from the request detail screen.",
      "If we need more information from you, the status will show as 'Needs info' with a message describing what's missing.",
    ],
  },
  {
    id: "a3",
    slug: "update-payment-method",
    title: "How do I update my payment method?",
    category: "My Account",
    summary: "Manage billing details from your profile.",
    source: "Account Management Handbook",
    readMinutes: 1,
    body: [
      "Go to Profile > Personal Information > Billing to add or update a payment method.",
      "Changes apply to your next billing cycle immediately.",
    ],
  },
  {
    id: "a4",
    slug: "export-saved-information",
    title: "Can I export my saved information?",
    category: "My Account",
    summary: "Download a copy of the data we keep on file for you.",
    source: "Privacy & Data Handbook",
    readMinutes: 2,
    body: [
      "Yes. Open Profile > Saved Information and tap Export as CSV.",
      "The export includes your request history and any preferences the assistant has remembered, so you always have a portable copy.",
    ],
  },
  {
    id: "a5",
    slug: "ai-assistant-sources",
    title: "How does the AI assistant find its answers?",
    category: "Services",
    summary: "A look at how responses are grounded in approved knowledge.",
    source: "Customer Service Guide",
    readMinutes: 3,
    body: [
      "The assistant searches our approved knowledge base for the most relevant articles before answering, and shows you the source it used.",
      "For anything involving your account or an open request, it checks your information first so the answer is personalized and accurate.",
      "If a question needs a human judgment call, the assistant prepares the details and routes it to our support team for approval.",
    ],
  },
  {
    id: "a6",
    slug: "response-times",
    title: "What are typical response times?",
    category: "Services",
    summary: "What to expect after submitting a request.",
    source: "Service Level Guide",
    readMinutes: 1,
    body: [
      "Most requests receive an initial AI-assisted response within minutes.",
      "Requests requiring a specialist are typically reviewed within one business day, and you'll be notified at every step.",
    ],
  },
  {
    id: "a7",
    slug: "reset-password",
    title: "I forgot my password, what do I do?",
    category: "Troubleshooting",
    summary: "Recover access to your account safely.",
    source: "Account Management Handbook",
    readMinutes: 1,
    body: [
      "From the sign-in screen, tap Forgot password and enter your email address.",
      "We'll send a secure link to reset your password. The link expires after 30 minutes for your security.",
    ],
  },
  {
    id: "a8",
    slug: "data-retention",
    title: "How long is my data kept?",
    category: "Troubleshooting",
    summary: "Understand retention and deletion policies.",
    source: "Privacy & Data Handbook",
    readMinutes: 2,
    body: [
      "Request history is kept for 24 months to help the assistant give you faster, more relevant support.",
      "You can delete any remembered information at any time from Profile > Saved Information > Manage saved information.",
    ],
  },
];

export const MEMORY_FACTS: MemoryFact[] = [
  {
    id: "f1",
    label: "Previous request history",
    detail: "Helps the assistant avoid asking you to repeat yourself.",
    enabled: true,
  },
  {
    id: "f2",
    label: "Preferred communication method",
    detail: "You prefer updates by in-app notification over email.",
    enabled: true,
  },
  {
    id: "f3",
    label: "Account plan details",
    detail: "Used to tailor recommendations to your Growth Plan.",
    enabled: true,
  },
  {
    id: "f4",
    label: "Common topics you ask about",
    detail: "Billing and integration questions, to speed up future answers.",
    enabled: false,
  },
];

export const QUICK_PROMPTS = [
  "How do I submit a request?",
  "What's the status of REQ-1042?",
  "How do I update my payment method?",
  "How does the AI assistant work?",
];

export const HELP_CATEGORIES = Array.from(
  new Set(HELP_ARTICLES.map((a) => a.category)),
);
