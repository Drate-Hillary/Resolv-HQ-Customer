import React, { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Mic01Icon, RefreshIcon, SendIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { useAppState } from "@/lib/app-state";
import { ChatMessage } from "@/lib/types";
import ChatBubble from "@/components/ChatBubble";
import IconButton from "@/components/ui/IconButton";
import AnimatedPressable from "@/components/ui/AnimatedPressable";

export default function AiAssistant() {
  const { chatMessages, sendChatMessage, rateChatMessage, resetChat } = useAppState();
  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendChatMessage(trimmed);
    setDraft("");
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <View className="flex-row items-center justify-between px-6 pb-3 pt-3">
          <View className="flex-row items-center gap-2.5">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-black">
              <HugeiconsIcon icon={SparklesIcon} size={17} color="#ffffff" />
            </View>
            <View>
              <Text className="font-manrope-bold text-[17px] text-black">AI Assistant</Text>
              <Text className="font-manrope-medium text-[11px] text-emerald-600">
                ● Grounded in approved knowledge
              </Text>
            </View>
          </View>
          <IconButton icon={RefreshIcon} onPress={resetChat} />
        </View>

        <FlatList
          ref={listRef}
          data={chatMessages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <ChatBubble
              message={item}
              onSuggestionPress={handleSend}
              onFeedback={(v) => rateChatMessage(item.id, v)}
            />
          )}
        />

        <View className="border-t border-neutral-100 px-4 pb-28 pt-3">
          <View className="flex-row items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1.5">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Ask anything..."
              placeholderTextColor="#A3A3A3"
              className="flex-1 px-3 font-manrope-medium text-[14px] text-black"
              multiline
              onSubmitEditing={() => handleSend(draft)}
            />
            <AnimatedPressable
              scaleTo={0.85}
              className="h-9 w-9 items-center justify-center rounded-full"
            >
              <HugeiconsIcon icon={Mic01Icon} size={18} color="#737373" />
            </AnimatedPressable>
            <AnimatedPressable
              scaleTo={0.85}
              onPress={() => handleSend(draft)}
              disabled={!draft.trim()}
              className={`h-9 w-9 items-center justify-center rounded-full ${
                draft.trim() ? "bg-black" : "bg-neutral-200"
              }`}
            >
              <HugeiconsIcon icon={SendIcon} size={16} color="#ffffff" />
            </AnimatedPressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
