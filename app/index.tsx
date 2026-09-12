import { Redirect } from "expo-router";
import { useAppState } from "@/lib/app-state";

export default function Index() {
  const { hasOnboarded, isAuthenticated } = useAppState();

  if (!hasOnboarded) return <Redirect href="/onboarding" />;
  if (!isAuthenticated) return <Redirect href="/sign-in" />;
  return <Redirect href="/home" />;
}
