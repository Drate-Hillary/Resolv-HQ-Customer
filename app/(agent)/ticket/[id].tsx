import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { SendIcon, SparklesIcon, UserAdd01Icon } from "@hugeicons/core-free-icons";
import { useAppState } from "@/lib/app-state";
import { RequestStatus } from "@/lib/types";
import ScreenHeader from "@/components/ui/ScreenHeader";
import StatusPill from "@/components/ui/StatusPill";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import StatusTimeline from "@/components/StatusTimeline";
import RequestMessageBubble from "@/components/RequestMessageBubble";
import Button from "@/components/ui/Button";
import AnimatedPressable from "@/components/ui/AnimatedPressable";

const STATUS_OPTIONS: { key: RequestStatus; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "processing", label: "Processing" },
  { key: "review", label: "In progress" },
  { key: "needs_info", label: "Needs info" },
  { key: "completed", label: "Completed" },
];

export default function AgentTicket() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    user,
    getRequest,
    loadRequestDetail,
    sendSupportMessage,
    updateRequestStatus,
    assignRequestToMe,
  } = useAppState();
  const request = getRequest(String(id));
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (id) loadRequestDetail(String(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!request) return <Redirect href="/queue" />;

  const isMine = request.assignedAdminId === user.id;

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft("");
    await sendSupportMessage(request.id, text);
    setSending(false);
  };

  const handleAssign = async () => {
    setAssigning(true);
    await assignRequestToMe(request.id);
    setAssigning(false);
  };

  const handleStatusChange = async (status: RequestStatus) => {
    if (status === request.status || statusUpdating) return;
    setStatusUpdating(true);
    await updateRequestStatus(request.id, status);
    setStatusUpdating(false);
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
          subtitle={request.customerName ?? "Unknown customer"}
          showBack
          right={<StatusPill status={request.status} />}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          <View className="px-6">
            <Text className="mb-2 font-manrope-bold text-[13px] text-neutral-400">REQUEST</Text>
            <Card className="mb-4">
              <Text className="font-manrope-bold text-[16px] text-black">{request.title}</Text>
              <Text className="mt-1 font-manrope-medium text-[13px] leading-5 text-neutral-600">
                {request.description}
              </Text>
            </Card>

            {!request.assignedAdminId ? (
              <View className="mb-4">
                <Button
                  label="Assign to me"
                  variant="secondary"
                  icon={UserAdd01Icon}
                  loading={assigning}
                  onPress={handleAssign}
                />
              </View>
            ) : (
              <Text className="mb-4 font-manrope-medium text-[12px] text-neutral-400">
                {isMine ? "Assigned to you" : `Assigned to ${request.assignedAdminName ?? "another agent"}`}
              </Text>
            )}

            <Text className="mb-2 font-manrope-bold text-[13px] text-neutral-400">STATUS</Text>
            <View className="mb-4 flex-row flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <Chip
                  key={opt.key}
                  label={opt.label}
                  active={opt.key === request.status}
                  onPress={() => handleStatusChange(opt.key)}
                />
              ))}
            </View>

            <Card className="mb-4">
              <StatusTimeline steps={request.timeline} currentStatus={request.status} />
            </Card>

            {request.aiSummary.length > 0 && (
              <>
                <Text className="mb-2 font-manrope-bold text-[13px] text-neutral-400">AI SUMMARY</Text>
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
              </>
            )}

            <Text className="mb-2 font-manrope-bold text-[13px] text-neutral-400">MESSAGES</Text>
            <View className="mb-4">
              {!request.detailsLoaded ? (
                <ActivityIndicator color="#000000" />
              ) : (
                request.messages.map((m) => <RequestMessageBubble key={m.id} message={m} />)
              )}
            </View>
          </View>
        </ScrollView>

        <View className="border-t border-neutral-100 px-4 pb-8 pt-3">
          <View className="flex-row items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1.5">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Reply as support..."
              placeholderTextColor="#A3A3A3"
              className="flex-1 px-3 font-manrope-medium text-[14px] text-black"
              onSubmitEditing={handleSend}
            />
            <AnimatedPressable
              scaleTo={0.85}
              onPress={handleSend}
              disabled={!draft.trim() || sending}
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
