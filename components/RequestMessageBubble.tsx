import React from "react";
import { Text, View } from "react-native";
import { RequestMessage } from "@/lib/types";
import { formatClock } from "@/lib/format";

const SENDER_LABEL: Record<RequestMessage["sender"], string> = {
  customer: "You",
  support: "Support Team",
  ai: "Assistant",
};

export default function RequestMessageBubble({ message }: { message: RequestMessage }) {
  const isCustomer = message.sender === "customer";
  return (
    <View className={`mb-3 max-w-[85%] ${isCustomer ? "self-end items-end" : "self-start items-start"}`}>
      <Text className="mb-1 font-manrope-semibold text-[11px] text-neutral-400">
        {SENDER_LABEL[message.sender]} · {formatClock(message.timestamp)}
      </Text>
      <View
        className={`rounded-2xl px-4 py-3 ${
          isCustomer ? "rounded-br-md bg-black" : "rounded-bl-md bg-neutral-100"
        }`}
      >
        <Text
          className={`font-manrope-medium text-[13px] leading-5 ${
            isCustomer ? "text-white" : "text-black"
          }`}
        >
          {message.text}
        </Text>
      </View>
    </View>
  );
}
