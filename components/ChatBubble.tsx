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
        className="mb-3 max-w-[82%] self-end rounded-3xl rounded-br-md bg-black px-4 py-3"
      >
        <Text className="font-manrope-medium text-[14px] leading-5 text-white">
          {message.text}
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      className="mb-4 max-w-[88%] self-start"
    >
      <View className="mb-1.5 flex-row items-center gap-1.5">
        <View className="h-5 w-5 items-center justify-center rounded-full bg-black">
          <HugeiconsIcon icon={SparklesIcon} size={11} color="#ffffff" />
        </View>
        <Text className="font-manrope-bold text-[12px] text-neutral-500">
          Assistant
        </Text>
      </View>
      <View className="rounded-3xl rounded-tl-md border border-neutral-200 bg-neutral-50 px-4 py-3.5">
        {message.pending ? (
          <TypingSteps steps={message.steps ?? []} />
        ) : (
          <>
            <Text className="font-manrope-medium text-[14px] leading-5 text-black">
              {message.text}
            </Text>
            {message.sources?.map((s) => <SourceTag key={s.id} title={s.title} />)}
          </>
        )}
      </View>

      {!message.pending && message.text.length > 0 && (
        <View className="mt-2">
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
    </Animated.View>
  );
}
