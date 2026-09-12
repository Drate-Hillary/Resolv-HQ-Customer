import React from "react";
import { Text, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { RequestStatus, TimelineStep } from "@/lib/types";
import { formatFullDate } from "@/lib/format";

const ORDER: RequestStatus[] = ["submitted", "processing", "review", "completed"];

export default function StatusTimeline({
  steps,
  currentStatus,
}: {
  steps: TimelineStep[];
  currentStatus: RequestStatus;
}) {
  const currentIndex =
    currentStatus === "needs_info" ? 1 : ORDER.indexOf(currentStatus);

  return (
    <View>
      {steps.map((step, i) => {
        const completed = i < currentIndex || currentStatus === "completed" && i <= currentIndex;
        const isCurrent = i === currentIndex && currentStatus !== "completed";
        const isLast = i === steps.length - 1;
        return (
          <View key={step.key} className="flex-row">
            <View className="items-center" style={{ width: 28 }}>
              <View
                className={`h-6 w-6 items-center justify-center rounded-full ${
                  completed
                    ? "bg-black"
                    : isCurrent
                      ? "border-2 border-black bg-white"
                      : "border-2 border-neutral-200 bg-white"
                }`}
              >
                {completed && (
                  <HugeiconsIcon icon={Tick02Icon} size={12} color="#ffffff" />
                )}
                {isCurrent && <View className="h-2 w-2 rounded-full bg-black" />}
              </View>
              {!isLast && (
                <View
                  className={`w-[2px] flex-1 ${completed ? "bg-black" : "bg-neutral-200"}`}
                  style={{ minHeight: 28 }}
                />
              )}
            </View>
            <View className="flex-1 pb-6">
              <Text
                className={`font-manrope-bold text-[14px] ${
                  completed || isCurrent ? "text-black" : "text-neutral-400"
                }`}
              >
                {step.label}
              </Text>
              {step.timestamp && (
                <Text className="mt-0.5 font-manrope-medium text-[12px] text-neutral-400">
                  {formatFullDate(step.timestamp)}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
