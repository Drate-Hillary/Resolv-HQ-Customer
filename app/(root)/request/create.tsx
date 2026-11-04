import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Attachment01Icon,
  Cancel01Icon,
  Edit02Icon,
  File01Icon,
  Image01Icon,
  SparklesIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { useAppState } from "@/lib/app-state";
import { apiClient, apiErrorMessage } from "@/backend/api-client";
import type { RequestCategoryOption, RequestResponseMode } from "@/lib/types";
import { pickDocumentAttachment, pickImageAttachment, PickedAsset } from "@/lib/attachments";
import IconButton from "@/components/ui/IconButton";
import Button from "@/components/ui/Button";
import AnimatedPressable from "@/components/ui/AnimatedPressable";

const PRIORITY_LABEL: Record<string, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
};

interface Classification {
  category: string;
  priority: "low" | "normal" | "high";
}

/** Same matching rules as resolv-hq-backend's resolveCategoryId (src/lib/mappers.ts) — kept local since it's pure UI-preview logic, not data access. */
function findCategoryIdByName(
  categories: RequestCategoryOption[],
  suggestedName: string,
): string | null {
  if (categories.length === 0) return null;
  const exact = categories.find((c) => c.name.toLowerCase() === suggestedName.toLowerCase());
  if (exact) return exact.id;
  const fallback = categories.find((c) => c.name.toLowerCase() === "general inquiry");
  return (fallback ?? categories[0]).id;
}

export default function CreateRequest() {
  const router = useRouter();
  const { createRequest, categories } = useAppState();
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [attachments, setAttachments] = useState<PickedAsset[]>([]);
  const [responseMode, setResponseMode] = useState<RequestResponseMode>("human");

  const [classification, setClassification] = useState<Classification | null>(null);

  useEffect(() => {
    const trimmed = description.trim();
    const timeout = setTimeout(async () => {
      if (trimmed.length <= 8) {
        setClassification(null);
        return;
      }
      try {
        const { data } = await apiClient.post<Classification>("/ai/classify", {
          description: trimmed,
        });
        setClassification(data);
      } catch (e) {
        console.warn("Failed to classify request", apiErrorMessage(e));
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [description]);

  const suggestedCategoryId = useMemo(
    () => (classification ? findCategoryIdByName(categories, classification.category) : null),
    [classification, categories],
  );

  const effectiveCategoryId = selectedCategoryId ?? suggestedCategoryId;
  const effectiveCategoryName =
    categories.find((c) => c.id === effectiveCategoryId)?.name ?? classification?.category ?? null;

  const handleAddAttachment = () => {
    Alert.alert("Add attachment", "Choose a photo or a document", [
      {
        text: "Photo",
        onPress: async () => {
          const asset = await pickImageAttachment();
          if (asset) setAttachments((prev) => [...prev, asset]);
        },
      },
      {
        text: "Document",
        onPress: async () => {
          const asset = await pickDocumentAttachment();
          if (asset) setAttachments((prev) => [...prev, asset]);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const removeAttachment = (uri: string) => {
    setAttachments((prev) => prev.filter((a) => a.uri !== uri));
  };

  const handleSubmit = async () => {
    if (!description.trim() || submitting) return;
    setError(null);
    setSubmitting(true);
    const created = await createRequest(description.trim(), effectiveCategoryId, attachments, responseMode);
    setSubmitting(false);
    if (!created) {
      setError("Something went wrong submitting your request. Please try again.");
      return;
    }
    router.replace({ pathname: "/request/[id]", params: { id: created.id } });
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

        <ScrollView className="flex-1 px-6 pt-4" keyboardShouldPersistTaps="handled">
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

          <View className="mt-5">
            <Text className="font-manrope-bold text-[14px] text-black">
              Who should respond?
            </Text>
            <View className="mt-2 flex-row gap-3">
              {([
                { mode: "human", title: "Human support", detail: "A staff member will reply" },
                { mode: "ai", title: "AI assistant", detail: "Get an AI response in this ticket" },
              ] as const).map(({ mode, title, detail }) => {
                const active = responseMode === mode;
                return (
                  <AnimatedPressable
                    key={mode}
                    scaleTo={0.98}
                    onPress={() => setResponseMode(mode)}
                    className={`flex-1 rounded-2xl border px-3 py-3 ${
                      active ? "border-black bg-neutral-50" : "border-neutral-200 bg-white"
                    }`}
                  >
                    <Text className="font-manrope-bold text-[12px] text-black">{title}</Text>
                    <Text className="mt-1 font-manrope-medium text-[10px] leading-4 text-neutral-500">
                      {detail}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>

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
                  <AnimatedPressable
                    scaleTo={0.98}
                    onPress={() => setPickerOpen(true)}
                    className="flex-row items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-3"
                  >
                    <Text className="flex-1 font-manrope-bold text-[13px] text-black" numberOfLines={1}>
                      {effectiveCategoryName ?? classification.category}
                    </Text>
                    <HugeiconsIcon icon={Edit02Icon} size={13} color="#A3A3A3" />
                  </AnimatedPressable>
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

          <View className="mt-5">
            <AnimatedPressable
              scaleTo={0.98}
              onPress={handleAddAttachment}
              className="flex-row items-center gap-2 self-start rounded-2xl border border-dashed border-neutral-300 px-4 py-2.5"
            >
              <HugeiconsIcon icon={Attachment01Icon} size={15} color="#404040" />
              <Text className="font-manrope-semibold text-[12px] text-neutral-600">
                Attach photo or file
              </Text>
            </AnimatedPressable>

            {attachments.length > 0 && (
              <View className="mt-3 flex-row flex-wrap gap-2">
                {attachments.map((a) => (
                  <View
                    key={a.uri}
                    className="flex-row items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 py-1.5 pl-3 pr-1.5"
                  >
                    <HugeiconsIcon
                      icon={a.mimeType?.startsWith("image/") ? Image01Icon : File01Icon}
                      size={13}
                      color="#525252"
                    />
                    <Text className="max-w-[140px] font-manrope-semibold text-[11px] text-neutral-600" numberOfLines={1}>
                      {a.name}
                    </Text>
                    <Pressable onPress={() => removeAttachment(a.uri)} className="p-1">
                      <HugeiconsIcon icon={Cancel01Icon} size={12} color="#A3A3A3" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          {error && (
            <Text className="mt-4 font-manrope-medium text-[12px] text-red-600">{error}</Text>
          )}
        </ScrollView>

        <View className="px-6 pb-8 pt-3">
          <Button
            label={submitting ? "Submitting..." : "Submit Request"}
            onPress={handleSubmit}
            disabled={!description.trim()}
            loading={submitting}
          />
        </View>
      </KeyboardAvoidingView>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable
          className="flex-1 items-center justify-end bg-black/40"
          onPress={() => setPickerOpen(false)}
        >
          <Pressable
            onPress={() => {}}
            className="w-full rounded-t-3xl bg-white px-6 pb-10 pt-5"
          >
            <Text className="mb-3 font-manrope-bold text-[16px] text-black">
              Choose a category
            </Text>
            {categories.map((c) => {
              const active = c.id === effectiveCategoryId;
              return (
                <AnimatedPressable
                  key={c.id}
                  scaleTo={0.99}
                  onPress={() => {
                    setSelectedCategoryId(c.id);
                    setPickerOpen(false);
                  }}
                  className="flex-row items-center justify-between border-b border-neutral-100 py-3.5"
                >
                  <Text className="font-manrope-semibold text-[14px] text-black">{c.name}</Text>
                  {active && <HugeiconsIcon icon={Tick02Icon} size={16} color="#000000" />}
                </AnimatedPressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
