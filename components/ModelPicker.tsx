import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowDown01Icon, CpuIcon, SparklesIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { apiClient } from "@/backend/api-client";
import { useAppState } from "@/lib/app-state";

interface ModelOption {
  id: string;
  name: string;
  provider: string;
  model: string | null;
}

/** A pill above the chat box showing the chosen model; tapping it opens a sheet to pick another or leave it on Automatic. */
export default function ModelPicker() {
  const { selectedModelId, setSelectedModelId } = useAppState();
  const [models, setModels] = useState<ModelOption[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<ModelOption[]>("/chat/models")
      .then(({ data }) => {
        if (cancelled) return;
        setModels(data);
        // A model that was disabled or removed since last time can't be used any more.
        if (selectedModelId && !data.some((m) => m.id === selectedModelId)) setSelectedModelId(null);
      })
      .catch(() => !cancelled && setModels([]));
    return () => {
      cancelled = true;
    };
    // Only the first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (models.length === 0) return null;

  const current = models.find((m) => m.id === selectedModelId);
  const choose = (id: string | null) => {
    setSelectedModelId(id);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityLabel="Choose model"
        className="flex-row items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5"
      >
        <HugeiconsIcon icon={current ? CpuIcon : SparklesIcon} size={14} color="#525252" />
        <Text className="max-w-[180px] font-manrope-semibold text-[12px] text-neutral-700" numberOfLines={1}>
          {current ? current.name : "Automatic"}
        </Text>
        <HugeiconsIcon icon={ArrowDown01Icon} size={12} color="#737373" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }} onPress={() => setOpen(false)}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="max-h-[70%] rounded-t-3xl bg-white px-4 pb-8 pt-3"
          >
            <View className="mb-3 h-1 w-10 self-center rounded-full bg-neutral-200" />
            <Text className="mb-1 font-manrope-bold text-[16px] text-black">Choose a model</Text>
            <Text className="mb-3 font-manrope-medium text-[12px] text-neutral-500">
              Used for your next messages. If it is unavailable, another model answers.
            </Text>
            <ScrollView>
              <Row
                active={!current}
                onPress={() => choose(null)}
                icon={<HugeiconsIcon icon={SparklesIcon} size={16} color="#171717" />}
                title="Automatic"
                hint="The assistant picks, and falls back if one fails"
              />
              {models.map((m) => (
                <Row
                  key={m.id}
                  active={m.id === selectedModelId}
                  onPress={() => choose(m.id)}
                  icon={
                    <Text className="font-manrope-bold text-[13px] uppercase text-neutral-900">{m.provider.charAt(0)}</Text>
                  }
                  title={m.name}
                  hint={[m.model ?? "default model", m.provider].join(" · ")}
                />
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function Row({
  active,
  onPress,
  icon,
  title,
  hint,
}: {
  active: boolean;
  onPress: () => void;
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-1 flex-row items-center gap-3 rounded-2xl px-3 py-3 ${active ? "bg-neutral-100" : ""}`}
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-neutral-100">{icon}</View>
      <View className="flex-1">
        <Text className="font-manrope-semibold text-[14px] text-black" numberOfLines={1}>
          {title}
        </Text>
        <Text className="font-manrope-medium text-[12px] text-neutral-500" numberOfLines={1}>
          {hint}
        </Text>
      </View>
      {active && <HugeiconsIcon icon={Tick02Icon} size={18} color="#000000" />}
    </Pressable>
  );
}
