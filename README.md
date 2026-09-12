# Resolv HQ — Customer App

The customer-facing mobile app for Resolv HQ: a simple, focused surface for
requesting help, chatting with an AI assistant grounded in approved
knowledge, and tracking requests end to end. The heavier agentic system
(RAG, tools, guardrails, evaluation) lives on the backend — this app is
intentionally just the customer experience on top of it.

Built with Expo Router, TypeScript, NativeWind (Tailwind for React Native),
HugeIcons, the Manrope typeface, and React Native Reanimated for motion.

## Get started

```bash
npm install
npx expo start
```

This build has no backend — `lib/app-state.tsx` holds everything (requests,
notifications, chat, saved information) in memory so the UI can be explored
end to end. `lib/ai-responses.ts` stands in for the real RAG-grounded answer
engine, ranking a small local knowledge base (`lib/mock-data.ts`) by keyword
overlap and citing whichever article it drew from.

## Structure

- `app/onboarding.tsx`, `app/(auth)` — first-run onboarding and sign in/up.
- `app/(root)/(tabs)` — the five main tabs: Home, Requests, AI, Alerts, Profile.
- `app/(root)/request`, `app/(root)/help`, `app/(root)/profile` — request
  detail/creation, the help centre, and profile sub-screens, pushed above
  the tabs.
- `components/` — feature components (chat bubbles, request cards, the
  status timeline) and `components/ui/` — shared design-system primitives.
- `lib/` — app state, mock data, types, and formatting helpers.

## Notes

- `experiments.reactCompiler` is off in `app.json`: this app leans on
  react-native-reanimated's shared-value mutation throughout for animation,
  which the compiler's static immutability assumptions don't yet support.
  The matching ESLint rules (`react-hooks/immutability`, `react-hooks/refs`)
  are disabled in `eslint.config.js` for the same reason.
