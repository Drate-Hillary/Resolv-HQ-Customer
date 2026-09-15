import React from "react";
import { Stack } from "expo-router";

// Minimal stack for agent-role users: a queue of open requests, a work
// screen per request, and a bare-bones account/sign-out screen. No tabs —
// agents don't need the customer-facing Home/AI/Alerts surfaces.
export default function AgentGroupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="queue" />
      <Stack.Screen name="ticket/[id]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="account" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}
