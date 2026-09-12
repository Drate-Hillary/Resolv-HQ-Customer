import React, { useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Add01Icon, TaskDone01Icon } from "@hugeicons/core-free-icons";
import { useAppState } from "@/lib/app-state";
import { ServiceRequest } from "@/lib/types";
import RequestCard from "@/components/RequestCard";
import Chip from "@/components/ui/Chip";
import IconButton from "@/components/ui/IconButton";
import EmptyState from "@/components/ui/EmptyState";

type Filter = "All" | "Active" | "Completed";

export default function Requests() {
  const router = useRouter();
  const { requests } = useAppState();
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = useMemo(() => {
    if (filter === "Active") return requests.filter((r) => r.status !== "completed");
    if (filter === "Completed") return requests.filter((r) => r.status === "completed");
    return requests;
  }, [filter, requests]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center justify-between px-6 pb-2 pt-4">
        <Text className="font-manrope-extrabold text-[26px] text-black">My Requests</Text>
        <IconButton
          icon={Add01Icon}
          variant="filled"
          onPress={() => router.push("/request/create")}
        />
      </View>

      <View className="flex-row gap-2 px-6 pb-4 pt-2">
        {(["All", "Active", "Completed"] as Filter[]).map((f) => (
          <Chip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </View>

      <FlatList<ServiceRequest>
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => <RequestCard request={item} index={index} />}
        ListEmptyComponent={
          <EmptyState
            icon={TaskDone01Icon}
            title="No requests here yet"
            description="Anything you submit will show up in this list so you can track it end to end."
            action={
              <Chip
                label="Create your first request"
                onPress={() => router.push("/request/create")}
              />
            }
          />
        }
      />
    </SafeAreaView>
  );
}
