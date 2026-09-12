import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Cancel01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { useAppState } from "@/lib/app-state";
import { classifyRequest } from "@/lib/ai-responses";
import IconButton from "@/components/ui/IconButton";
import Button from "@/components/ui/Button";

const PRIORITY_LABEL: Record<string, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
};

export default function CreateRequest() {
  const router = useRouter();
  const { createRequest } = useAppState();
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const classification = useMemo(
    () => (description.trim().length > 8 ? classifyRequest(description) : null),
    [description],
  );

  const handleSubmit = () => {
    if (!description.trim() || submitting) return;
    setSubmitting(true);
    const created = createRequest(description.trim());
    setTimeout(() => {
      router.replace({ pathname: "/request/[id]", params: { id: created.id } });
    }, 500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-row items-center justify-between px-6 pb-2 pt-2">
          <Text className="font-manrope-extrabold text-[22px] text-black">
            Create Request
          </Text>
          <IconButton icon={Cancel01Icon} onPress={() => router.back()} />
        </View>

        <View className="flex-1 px-6 pt-4">
          <Text className="font-manrope-bold text-[14px] text-black">
            What do you need help with?
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="I need help with my service..."
            placeholderTextColor="#A3A3A3"
            multiline
            autoFocus
            className="mt-3 min-h-[140px] rounded-3xl border border-neutral-200 bg-neutral-50 px-4 py-4 font-manrope-medium text-[15px] leading-6 text-black"
          />

          {classification ? (
            <Animated.View entering={FadeIn.duration(300)} className="mt-5">
              <View className="flex-row items-center gap-2">
                <HugeiconsIcon icon={SparklesIcon} size={14} color="#000000" />
                <Text className="font-manrope-semibold text-[12px] text-neutral-500">
                  Automatically identified by the assistant
                </Text>
              </View>

              <View className="mt-3 flex-row gap-3">
                <View className="flex-1">
                  <Text className="mb-1.5 font-manrope-semibold text-[12px] text-neutral-400">
                    Category
                  </Text>
                  <View className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                    <Text className="font-manrope-bold text-[13px] text-black">
                      {classification.category}
                    </Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="mb-1.5 font-manrope-semibold text-[12px] text-neutral-400">
                    Priority
                  </Text>
                  <View className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                    <Text className="font-manrope-bold text-[13px] text-black">
                      {PRIORITY_LABEL[classification.priority]}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          ) : (
            <Text className="mt-4 font-manrope-medium text-[12px] text-neutral-400">
              Keep typing — the assistant will suggest a category and priority
              automatically once there&apos;s enough detail.
            </Text>
          )}
        </View>

        <View className="px-6 pb-8 pt-3">
          <Button
            label={submitting ? "Submitting..." : "Submit Request"}
            onPress={handleSubmit}
            disabled={!description.trim()}
            loading={submitting}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
