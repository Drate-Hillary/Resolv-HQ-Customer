import React, { useEffect } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowRight02Icon, Message01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAppState } from "@/lib/app-state";
import { timeAgo } from "@/lib/format";
import { AiConversationSummary } from "@/lib/types";
import ScreenHeader from "@/components/ui/ScreenHeader";
import AnimatedPressable from "@/components/ui/AnimatedPressable";
import EmptyState from "@/components/ui/EmptyState";

export default function AiHistory() {
  const router = useRouter();
  const { conversations, refreshConversations, loadConversation, resetChat } = useAppState();

  useEffect(() => {
    refreshConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openConversation = async (id: string) => {
    await loadConversation(id);
    router.push("/ai");
  };

  const startNew = () => {
    resetChat();
    router.push("/ai");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader
        title="Past Conversations"
        showBack
        right={
          <AnimatedPressable onPress={startNew} scaleTo={0.95}>
            <Text className="font-manrope-semibold text-[13px] text-black">New chat</Text>
          </AnimatedPressable>
        }
      />

      <FlatList<AiConversationSummary>
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
            <AnimatedPressable
              scaleTo={0.98}
              onPress={() => openConversation(item.id)}
              className="mb-3 flex-row items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-neutral-100">
                <HugeiconsIcon icon={SparklesIcon} size={16} color="#171717" />
              </View>
              <View className="flex-1">
                <Text className="font-manrope-bold text-[13px] text-black" numberOfLines={1}>
                  {item.preview}
                </Text>
                <Text className="mt-0.5 font-manrope-medium text-[11px] text-neutral-400">
                  {item.messageCount} message{item.messageCount === 1 ? "" : "s"} ·{" "}
                  {timeAgo(item.startedAt)}
                </Text>
              </View>
              <HugeiconsIcon icon={ArrowRight02Icon} size={16} color="#C4C4C4" />
            </AnimatedPressable>
          </Animated.View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={Message01Icon}
            title="No conversations yet"
            description="Chats you have with the AI assistant will show up here so you can pick up where you left off."
          />
        }
      />
    </SafeAreaView>
  );
}
