import React, { useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { File01Icon } from "@hugeicons/core-free-icons";
import { RequestAttachment, RequestMessage } from "@/lib/types";
import { formatClock } from "@/lib/format";
import { isDocx, isPdf, openDocument } from "@/lib/documents";
import PdfThumb from "@/components/PdfThumb";

const SENDER_LABEL: Record<RequestMessage["sender"], string> = {
  customer: "You",
  support: "Support Team",
  ai: "Assistant",
};

const THUMB_WIDTH = 120;

/** A document as a small card: a picture of it (image, or the first page of a PDF on web) over its name. */
function AttachmentChip({ attachment }: { attachment: RequestAttachment }) {
  const isImage = attachment.fileType?.startsWith("image/");
  const pdf = isPdf(attachment.fileType, attachment.fileName);
  const docx = isDocx(attachment.fileType, attachment.fileName);
  const [viewingImage, setViewingImage] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const label = docx ? "DOCX" : pdf ? "PDF" : (attachment.fileName.split(".").pop()?.toUpperCase().slice(0, 4) ?? "FILE");
  // Native has no PDF renderer, so only web gets a real first-page picture.
  const showPdfThumb = pdf && Platform.OS === "web" && !thumbFailed;

  return (
    <>
      <Pressable
        onPress={() =>
          isImage ? setViewingImage(true) : openDocument(attachment.fileUrl, attachment.fileName, attachment.fileType)
        }
        style={{ width: THUMB_WIDTH }}
        className="mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white"
      >
        <View style={{ height: 150 }} className="items-center justify-start overflow-hidden bg-neutral-100">
          {isImage ? (
            <Image source={{ uri: attachment.fileUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
          ) : showPdfThumb ? (
            <PdfThumb url={attachment.fileUrl} width={THUMB_WIDTH} onFail={() => setThumbFailed(true)} />
          ) : (
            <View className="h-full items-center justify-center gap-1">
              <HugeiconsIcon icon={File01Icon} size={28} color="#737373" />
              <Text className="font-manrope-bold text-[11px] text-neutral-500">{label}</Text>
            </View>
          )}
        </View>
        <Text className="px-2.5 py-2 font-manrope-semibold text-[11px] text-neutral-700" numberOfLines={1}>
          {attachment.fileName}
        </Text>
      </Pressable>

      {isImage && (
        <Modal visible={viewingImage} transparent animationType="fade" onRequestClose={() => setViewingImage(false)}>
          <Pressable
            onPress={() => setViewingImage(false)}
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", padding: 16 }}
          >
            <Image source={{ uri: attachment.fileUrl }} style={{ width: "100%", height: "80%" }} contentFit="contain" />
            <Text className="mt-3 text-center font-manrope-semibold text-[12px] text-white" numberOfLines={1}>
              {attachment.fileName}
            </Text>
          </Pressable>
        </Modal>
      )}
    </>
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
