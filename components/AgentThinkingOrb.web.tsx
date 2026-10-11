import { useEffect, useState } from "react";
import { ThinkingOrb, type OrbState } from "thinking-orbs";
import { orbStates } from "./agent-thinking-orb-states";

export default function AgentThinkingOrb({ size = 20 }: { size?: 20 | 64 }) {
  const [stateIndex, setStateIndex] = useState(0);

  useEffect(() => {
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const interval = window.setInterval(() => {
      if (!motionPreference.matches) {
        setStateIndex((current) => (current + 1) % orbStates.length);
      }
    }, 1800);
    const handleMotionPreferenceChange = () => {
      if (motionPreference.matches) setStateIndex(0);
    };
    motionPreference.addEventListener("change", handleMotionPreferenceChange);

    return () => {
      window.clearInterval(interval);
      motionPreference.removeEventListener(
        "change",
        handleMotionPreferenceChange,
      );
    };
  }, []);

  const state = orbStates[stateIndex] as OrbState;
  return <ThinkingOrb state={state} size={size} aria-label={`Assistant ${state}`} />;
}
