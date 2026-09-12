import React, { useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowRight02Icon, Search01Icon } from "@hugeicons/core-free-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { HELP_CATEGORIES } from "@/lib/mock-data";
import { useAppState } from "@/lib/app-state";
import { HelpArticle } from "@/lib/types";
import ScreenHeader from "@/components/ui/ScreenHeader";
import Chip from "@/components/ui/Chip";
import AnimatedPressable from "@/components/ui/AnimatedPressable";
import EmptyState from "@/components/ui/EmptyState";

export default function HelpCentre() {
  const router = useRouter();
  const { helpArticles } = useAppState();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const filtered = useMemo(() => {
    return helpArticles.filter((a) => {
      const matchesCategory = category === "All" || a.category === category;
      const matchesQuery =
        query.trim().length === 0 ||
        `${a.title} ${a.summary}`.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [helpArticles, query, category]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="Help Centre" showBack />

      <View className="px-6 pb-4">
        <View className="flex-row items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <HugeiconsIcon icon={Search01Icon} size={16} color="#A3A3A3" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search for help..."
            placeholderTextColor="#A3A3A3"
            className="flex-1 font-manrope-medium text-[14px] text-black"
          />
        </View>
      </View>

      <FlatList
        data={["All", ...HELP_CATEGORIES]}
        keyExtractor={(c) => c}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
        renderItem={({ item }) => (
          <Chip label={item} active={category === item} onPress={() => setCategory(item)} />
        )}
        style={{ flexGrow: 0, marginBottom: 16 }}
      />

      <FlatList<HelpArticle>
        data={filtered}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
            <AnimatedPressable
              scaleTo={0.98}
              onPress={() =>
                router.push({ pathname: "/help/[slug]", params: { slug: item.slug } })
              }
              className="mb-3 rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <Text className="font-manrope-semibold text-[11px] text-neutral-400">
                {item.category} · {item.readMinutes} min read
              </Text>
              <View className="mt-1 flex-row items-center justify-between gap-3">
                <Text className="flex-1 font-manrope-bold text-[15px] text-black">
                  {item.title}
                </Text>
                <HugeiconsIcon icon={ArrowRight02Icon} size={16} color="#C4C4C4" />
              </View>
              <Text className="mt-1 font-manrope-medium text-[13px] leading-5 text-neutral-500">
                {item.summary}
              </Text>
            </AnimatedPressable>
          </Animated.View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={Search01Icon}
            title="No articles found"
            description="Try a different search term, or ask the AI assistant directly."
          />
        }
      />
    </SafeAreaView>
  );
}
