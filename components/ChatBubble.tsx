import React from "react";
import { Text, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { ChatMessage } from "@/lib/types";
import SourceTag from "./SourceTag";
import Chip from "./ui/Chip";
import ThumbsFeedback from "./ui/ThumbsFeedback";
import TypingSteps from "./TypingSteps";

interface ChatBubbleProps {
  message: ChatMessage;
  onSuggestionPress?: (text: string) => void;
  onFeedback?: (feedback: "up" | "down") => void;
}

/**
 * Chat-agent layout: the customer's message is a soft grey pill on the right; the
 * assistant's reply is plain text on the page beside a small mark, with no bubble.
 */
export default function ChatBubble({
  message,
  onSuggestionPress,
  onFeedback,
}: ChatBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <Animated.View
        entering={FadeInUp.duration(300)}
        className="mb-5 max-w-[82%] self-end rounded-3xl bg-neutral-100 px-4 py-2.5"
      >
        <Text className="font-manrope-medium text-[15px] leading-[22px] text-black">
          {message.text}
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      className="mb-6 flex-row items-start gap-3 self-stretch"
    >
      <View className="mt-0.5 h-7 w-7 items-center justify-center rounded-full bg-black">
        <HugeiconsIcon icon={SparklesIcon} size={14} color="#ffffff" />
      </View>
      <View className="flex-1">
        {message.pending ? (
          <TypingSteps steps={message.steps ?? []} />
        ) : (
          <>
            <Text className="font-manrope-medium text-[15px] leading-[24px] text-black">
              {message.text}
            </Text>
            {message.sources?.map((s) => <SourceTag key={s.id} title={s.title} />)}
          </>
        )}

        {!message.pending && message.text.length > 0 && (
          <View className="mt-3">
            <ThumbsFeedback value={message.feedback} onChange={(v) => onFeedback?.(v)} />
          </View>
        )}

        {!message.pending && message.suggestions && message.suggestions.length > 0 && (
          <View className="mt-3 flex-row flex-wrap gap-2">
            {message.suggestions.map((s) => (
              <Chip key={s} label={s} onPress={() => onSuggestionPress?.(s)} />
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
}
