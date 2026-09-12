import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useLocalSearchParams } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { SendIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { useAppState } from "@/lib/app-state";
import { RequestStatus } from "@/lib/types";
import ScreenHeader from "@/components/ui/ScreenHeader";
import StatusPill from "@/components/ui/StatusPill";
import Card from "@/components/ui/Card";
import StatusTimeline from "@/components/StatusTimeline";
import RequestMessageBubble from "@/components/RequestMessageBubble";
import StarRating from "@/components/ui/StarRating";
import Button from "@/components/ui/Button";
import AnimatedPressable from "@/components/ui/AnimatedPressable";

const STATUS_COPY: Record<RequestStatus, string> = {
  submitted: "We've received your request and it's queued for processing.",
  processing: "We're actively working through the details of your request.",
  review: "We're reviewing your request. A specialist is confirming the best next step.",
  needs_info: "We need a bit more information from you before we can continue.",
  completed: "This request has been completed.",
};

export default function RequestDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRequest, sendRequestMessage, submitRequestFeedback } = useAppState();
  const request = getRequest(String(id));
  const [draft, setDraft] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!request) return <Redirect href="/requests" />;

  const handleSend = () => {
    if (!draft.trim()) return;
    sendRequestMessage(request.id, draft.trim());
    setDraft("");
  };

  const handleFeedback = () => {
    if (rating === 0) return;
    submitRequestFeedback(request.id, rating, comment.trim() || undefined);
    setSubmitted(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <ScreenHeader
          title={request.code}
          subtitle={request.title}
          showBack
          right={<StatusPill status={request.status} />}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          <View className="px-6">
            <Card className="mb-4">
              <StatusTimeline steps={request.timeline} currentStatus={request.status} />
            </Card>

            <Text className="mb-2 font-manrope-bold text-[13px] text-neutral-400">
              CURRENT STATUS
            </Text>
            <Card className="mb-4">
              <Text className="font-manrope-medium text-[14px] leading-5 text-black">
                {STATUS_COPY[request.status]}
              </Text>
            </Card>

            <Text className="mb-2 font-manrope-bold text-[13px] text-neutral-400">
              AI SUMMARY
            </Text>
            <Card className="mb-4 bg-neutral-50">
              <View className="flex-row items-start gap-2.5">
                <View className="mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-black">
                  <HugeiconsIcon icon={SparklesIcon} size={12} color="#ffffff" />
                </View>
                <Text className="flex-1 font-manrope-medium text-[13px] leading-5 text-neutral-700">
                  {request.aiSummary}
                </Text>
              </View>
            </Card>

            {request.status === "completed" && !request.csat && !submitted && (
              <Card className="mb-4">
                <Text className="font-manrope-bold text-[15px] text-black">
                  How was your experience?
                </Text>
                <View className="mt-3">
                  <StarRating value={rating} onChange={setRating} />
                </View>
                <TextInput
                  value={comment}
                  onChangeText={setComment}
                  placeholder="What could we improve?"
                  placeholderTextColor="#A3A3A3"
                  multiline
                  className="mt-4 min-h-[64px] rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 font-manrope-medium text-[13px] text-black"
                />
                <View className="mt-3">
                  <Button label="Submit feedback" onPress={handleFeedback} disabled={rating === 0} />
                </View>
              </Card>
            )}

            {(request.csat || submitted) && (
              <Card className="mb-4">
                <Text className="font-manrope-bold text-[14px] text-black">
                  Thanks for your feedback ⭐
                </Text>
                <Text className="mt-1 font-manrope-medium text-[12px] text-neutral-500">
                  Your rating helps us improve future support.
                </Text>
              </Card>
            )}

            <Text className="mb-2 font-manrope-bold text-[13px] text-neutral-400">
              MESSAGES
            </Text>
            <View className="mb-4">
              {request.messages.map((m) => (
                <RequestMessageBubble key={m.id} message={m} />
              ))}
            </View>
          </View>
        </ScrollView>

        <View className="border-t border-neutral-100 px-4 pb-8 pt-3">
          <View className="flex-row items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1.5">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Send a message..."
              placeholderTextColor="#A3A3A3"
              className="flex-1 px-3 font-manrope-medium text-[14px] text-black"
              onSubmitEditing={handleSend}
            />
            <AnimatedPressable
              scaleTo={0.85}
              onPress={handleSend}
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
