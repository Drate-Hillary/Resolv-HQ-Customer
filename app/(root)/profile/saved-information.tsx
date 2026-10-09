import React, { useState } from "react";
import { Alert, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Delete02Icon, Download04Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { useAppState } from "@/lib/app-state";
import ScreenHeader from "@/components/ui/ScreenHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";

export default function SavedInformation() {
  const { user, memoryFacts, addMemoryFact, toggleMemoryFact, deleteAllMemoryFacts, updatePreferences } = useAppState();
  const [exported, setExported] = useState(false);
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);

  // The backend key must start with a letter: letters, digits, _ . - only.
  const topicKey = topic.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const canSave = /^[a-z]/.test(topicKey) && details.trim().length > 0 && !saving;

  const handleAdd = async () => {
    setSaving(true);
    const result = await addMemoryFact(topicKey.slice(0, 64), details.trim());
    setSaving(false);
    if (result.error) {
      Alert.alert("Couldn't save information", result.error);
      return;
    }
    setTopic("");
    setDetails("");
  };

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const handleDeleteAll = () => {
    Alert.alert(
      "Delete saved information?",
      "This removes everything the assistant remembers about you. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await deleteAllMemoryFacts();
            if (result.error) Alert.alert("Couldn't delete saved information", result.error);
          },
        },
      ],
    );
  };

  const memoryFactLabel = (key: string) =>
    key.replace(/[_-]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="Saved Information" showBack />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="px-6">
          <Card className="mb-5 bg-neutral-50">
            <View className="flex-row items-center gap-2">
              <HugeiconsIcon icon={SparklesIcon} size={16} color="#000000" />
              <Text className="font-manrope-bold text-[14px] text-black">
                Personalized Assistance
              </Text>
            </View>
            <Text className="mt-2 font-manrope-medium text-[13px] leading-5 text-neutral-600">
              The assistant can remember useful information from your previous
              requests to make future support faster and more relevant. You
              stay in control of what&apos;s remembered at all times.
            </Text>
          </Card>

          <Text className="mb-2 font-manrope-bold text-[13px] text-neutral-400">
            MASTER CONTROLS
          </Text>
          <View className="mb-6 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
            <View className="flex-row items-center gap-3 border-b border-neutral-100 px-4 py-4">
              <View className="flex-1">
                <Text className="font-manrope-bold text-[13px] text-black">
                  AI personalization
                </Text>
                <Text className="mt-0.5 font-manrope-medium text-[12px] text-neutral-500">
                  Let the assistant tailor answers using your account and request history.
                </Text>
              </View>
              <Switch
                value={user.aiPersonalization}
                onValueChange={(v) => {
                  void updatePreferences({ aiPersonalization: v });
                }}
                trackColor={{ false: "#E5E5E5", true: "#000000" }}
                thumbColor="#ffffff"
              />
            </View>
            <View className="flex-row items-center gap-3 px-4 py-4">
              <View className="flex-1">
                <Text className="font-manrope-bold text-[13px] text-black">Memory enabled</Text>
                <Text className="mt-0.5 font-manrope-medium text-[12px] text-neutral-500">
                  Master switch for everything remembered below. Turning this off stops new
                  memories from being used, without deleting them.
                </Text>
              </View>
              <Switch
                value={user.memoryEnabled}
                onValueChange={(v) => {
                  void updatePreferences({ memoryEnabled: v });
                }}
                trackColor={{ false: "#E5E5E5", true: "#000000" }}
                thumbColor="#ffffff"
              />
            </View>
          </View>

          <Text className="mb-2 font-manrope-bold text-[13px] text-neutral-400">
            REMEMBERED INFORMATION
          </Text>
          <View className="mb-6 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
            {memoryFacts.map((fact, i) => (
              <View
                key={fact.id}
                className={`flex-row items-center gap-3 px-4 py-4 ${
                  i !== memoryFacts.length - 1 ? "border-b border-neutral-100" : ""
                }`}
              >
                <View className="flex-1">
                  <Text className="font-manrope-bold text-[13px] text-black">
                    {memoryFactLabel(fact.key)}
                  </Text>
                  <Text className="mt-0.5 font-manrope-medium text-[12px] text-neutral-500">
                    {fact.value}
                  </Text>
                </View>
                <Switch
                  value={fact.enabled}
                  onValueChange={() => toggleMemoryFact(fact.id)}
                  trackColor={{ false: "#E5E5E5", true: "#000000" }}
                  thumbColor="#ffffff"
                />
              </View>
            ))}
            {memoryFacts.length === 0 && (
              <Text className="px-4 py-4 font-manrope-medium text-[12px] text-neutral-500">
                You have no saved information yet.
              </Text>
            )}
          </View>

          <Text className="mb-2 font-manrope-bold text-[13px] text-neutral-400">
            ADD INFORMATION
          </Text>
          <Card className="mb-6">
            <FormField
              label="Topic (e.g. Preferred contact)"
              value={topic}
              onChangeText={setTopic}
              maxLength={64}
              autoCapitalize="none"
            />
            <FormField
              label="Details (e.g. SMS, weekdays after 5pm)"
              value={details}
              onChangeText={setDetails}
              maxLength={2000}
            />
            <Button label="Save" onPress={() => void handleAdd()} disabled={!canSave} loading={saving} />
          </Card>

          <Text className="mb-2 font-manrope-bold text-[13px] text-neutral-400">
            RETENTION & CONTROL
          </Text>
          <Card className="mb-3">
            <Text className="font-manrope-medium text-[13px] leading-5 text-neutral-600">
              Saved information is kept until you delete it. You can turn it off
              or permanently delete it at any time.
            </Text>
          </Card>

          <View className="mb-3">
            <Button
              label={exported ? "Export ready ✓" : "Export as CSV"}
              variant="secondary"
              icon={Download04Icon}
              onPress={handleExport}
            />
          </View>
          <Button
            label="Delete all saved information"
            variant="danger"
            icon={Delete02Icon}
            onPress={handleDeleteAll}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
