import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useAppState } from "@/lib/app-state";
import ScreenHeader from "@/components/ui/ScreenHeader";
import SourceTag from "@/components/SourceTag";
import ThumbsFeedback from "@/components/ui/ThumbsFeedback";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";

export default function HelpArticleDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { helpArticles } = useAppState();
  const router = useRouter();
  const article = helpArticles.find((a) => a.slug === slug);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  if (!article) return <Redirect href="/help" />;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="Article" showBack />
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View className="px-6">
          <Chip label={article.category} className="mb-3 self-start" />
          <Text className="font-manrope-extrabold text-[24px] leading-8 text-black">
            {article.title}
          </Text>
          <SourceTag title={article.source} />

          <View className="mt-6 gap-4">
            {article.body.map((paragraph, i) => (
              <Text key={i} className="font-manrope-medium text-[15px] leading-6 text-neutral-700">
                {paragraph}
              </Text>
            ))}
          </View>

          <Card className="mt-8">
            <Text className="font-manrope-bold text-[14px] text-black">
              Was this helpful?
            </Text>
            <View className="mt-3">
              <ThumbsFeedback value={feedback} onChange={setFeedback} />
            </View>
          </Card>

          <View className="mt-6">
            <Chip label="Ask the AI assistant instead" onPress={() => router.push("/ai")} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
