import React, { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  ArrowUp02Icon,
  Clock01Icon,
  Mic01Icon,
  PencilEdit02Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { useAppState } from "@/lib/app-state";
import { ChatMessage } from "@/lib/types";
import ChatBubble from "@/components/ChatBubble";
import IconButton from "@/components/ui/IconButton";
import AnimatedPressable from "@/components/ui/AnimatedPressable";

export default function AiAssistant() {
  const router = useRouter();
  const { chatMessages, sendChatMessage, rateChatMessage, resetChat } = useAppState();
  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // Before the first question the list holds only the seeded welcome message (or nothing).
  // Show that as a centred greeting with starter prompts instead of a chat bubble.
  const welcome = chatMessages.length <= 1 && (chatMessages[0]?.id === "welcome" || chatMessages.length === 0)
    ? chatMessages[0]
    : undefined;
  const isEmpty = chatMessages.length === 0 || welcome !== undefined;

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendChatMessage(trimmed);
    setDraft("");
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const canSend = draft.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
          <Text className="font-manrope-bold text-[18px] text-black">AI Assistant</Text>
          <View className="flex-row items-center gap-1">
            <IconButton variant="plain" icon={Clock01Icon} onPress={() => router.push("/ai-history")} />
            <IconButton variant="plain" icon={PencilEdit02Icon} onPress={resetChat} />
          </View>
        </View>

        {isEmpty ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 24,
              paddingBottom: 24,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-black">
                <HugeiconsIcon icon={SparklesIcon} size={22} color="#ffffff" />
              </View>
              <Text className="mt-5 text-center font-manrope-bold text-[24px] leading-8 text-black">
                How can I help you today?
              </Text>
              {welcome?.text ? (
                <Text className="mt-2 text-center font-manrope-medium text-[14px] leading-5 text-neutral-500">
                  {welcome.text}
                </Text>
              ) : null}
              <Text className="mt-2 font-manrope-medium text-[12px] text-emerald-600">
                ● Grounded in approved knowledge
              </Text>
            </View>

            {welcome?.suggestions && welcome.suggestions.length > 0 && (
              <View className="mt-8 gap-2.5">
                {welcome.suggestions.map((s) => (
                  <AnimatedPressable
                    key={s}
                    scaleTo={0.98}
                    onPress={() => handleSend(s)}
                    className="rounded-2xl border border-neutral-200 bg-white px-4 py-3.5"
                  >
                    <Text className="font-manrope-semibold text-[14px] text-neutral-800">{s}</Text>
                  </AnimatedPressable>
                ))}
              </View>
            )}
          </ScrollView>
        ) : (
          <FlatList
            ref={listRef}
            data={chatMessages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
              <ChatBubble
                message={item}
                onSuggestionPress={handleSend}
                onFeedback={(v) => rateChatMessage(item.id, v)}
              />
            )}
          />
        )}

        <View className="px-4 pb-28 pt-2">
          <View className="flex-row items-end gap-1 rounded-[28px] border border-neutral-200 bg-white py-1.5 pl-4 pr-1.5 shadow-sm">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Ask anything..."
              placeholderTextColor="#A3A3A3"
              className="max-h-32 min-h-[40px] flex-1 py-2 font-manrope-medium text-[15px] text-black"
              multiline
              onSubmitEditing={() => handleSend(draft)}
            />
            {!canSend && (
              <AnimatedPressable
                scaleTo={0.85}
                className="h-10 w-10 items-center justify-center rounded-full"
              >
                <HugeiconsIcon icon={Mic01Icon} size={20} color="#737373" />
              </AnimatedPressable>
            )}
            <AnimatedPressable
              scaleTo={0.85}
              onPress={() => handleSend(draft)}
              disabled={!canSend}
              className={`h-10 w-10 items-center justify-center rounded-full ${
                canSend ? "bg-black" : "bg-neutral-200"
              }`}
            >
              <HugeiconsIcon icon={ArrowUp02Icon} size={18} color="#ffffff" strokeWidth={2.25} />
            </AnimatedPressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
