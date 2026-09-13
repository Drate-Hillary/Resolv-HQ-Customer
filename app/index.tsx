import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAppState } from "@/lib/app-state";
import AnimatedSplash from "@/components/AnimatedSplash";

const SPLASH_DURATION_MS = 1600;

export default function Index() {
  const { hasOnboarded, isAuthenticated } = useAppState();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasOnboarded) router.replace("/onboarding");
      else if (!isAuthenticated) router.replace("/sign-in");
      else router.replace("/home");
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [hasOnboarded, isAuthenticated, router]);

  return <AnimatedSplash />;
}
