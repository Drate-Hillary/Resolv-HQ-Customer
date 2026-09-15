import React from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { File01Icon } from "@hugeicons/core-free-icons";
import { RequestAttachment, RequestMessage } from "@/lib/types";
import { formatClock } from "@/lib/format";

const SENDER_LABEL: Record<RequestMessage["sender"], string> = {
  customer: "You",
  support: "Support Team",
  ai: "Assistant",
};

function AttachmentChip({ attachment }: { attachment: RequestAttachment }) {
  const isImage = attachment.fileType?.startsWith("image/");
  return (
    <Pressable
      onPress={() => Linking.openURL(attachment.fileUrl)}
      className="mt-2 flex-row items-center gap-2 self-start rounded-2xl border border-neutral-200 bg-white px-2.5 py-2"
    >
      {isImage ? (
        <Image
          source={{ uri: attachment.fileUrl }}
          style={{ width: 32, height: 32, borderRadius: 8 }}
          contentFit="cover"
        />
      ) : (
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
          <HugeiconsIcon icon={File01Icon} size={15} color="#525252" />
        </View>
      )}
      <Text className="max-w-[160px] font-manrope-semibold text-[12px] text-neutral-700" numberOfLines={1}>
        {attachment.fileName}
      </Text>
    </Pressable>
  );
}

export default function RequestMessageBubble({ message }: { message: RequestMessage }) {
  const isCustomer = message.sender === "customer";
  return (
    <View className={`mb-3 max-w-[85%] ${isCustomer ? "self-end items-end" : "self-start items-start"}`}>
      <Text className="mb-1 font-manrope-semibold text-[11px] text-neutral-400">
        {SENDER_LABEL[message.sender]} · {formatClock(message.timestamp)}
      </Text>
      {message.text.length > 0 && (
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
      )}
      {message.attachments?.map((a) => <AttachmentChip key={a.id} attachment={a} />)}
    </View>
  );
}
