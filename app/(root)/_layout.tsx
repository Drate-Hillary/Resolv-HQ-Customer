import React from "react";
import { Stack } from "expo-router";

export default function RootGroupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="request/[id]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="request/create" options={{ presentation: "modal" }} />
      <Stack.Screen name="ai-history" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="help" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="help/[slug]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="profile/personal-info" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="profile/saved-information" options={{ animation: "slide_from_right" }} />
      <Stack.Screen
        name="profile/notification-settings"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen name="profile/help-support" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="profile/privacy" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}
