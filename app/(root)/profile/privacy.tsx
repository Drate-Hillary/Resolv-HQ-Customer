import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ScreenHeader from "@/components/ui/ScreenHeader";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import ContentGate from "@/components/ui/ContentGate";
import { useAppState } from "@/lib/app-state";
import { contentIcon } from "@/lib/content-icons";

export default function Privacy() {
  const router = useRouter();
  const { content, contentLoading, contentError, reloadContent } = useAppState();
  const sections = content?.privacy.sections;
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="Privacy" showBack />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {!sections ? (
          <ContentGate loading={contentLoading} error={contentError} onRetry={reloadContent} />
        ) : (
        <View className="px-6">
          {sections.map((s) => (
            <Card key={s.title} className="mb-4">
              <View className="flex-row items-center gap-2">
                <HugeiconsIcon icon={contentIcon(s.icon)} size={16} color="#171717" />
                <Text className="flex-1 font-manrope-bold text-[14px] text-black">
                  {s.title}
                </Text>
              </View>
              <Text className="mt-2 font-manrope-medium text-[13px] leading-5 text-neutral-600">
                {s.body}
              </Text>
            </Card>
          ))}
          <Chip
            label="Manage saved information"
            onPress={() => router.push("/profile/saved-information")}
          />
        </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
