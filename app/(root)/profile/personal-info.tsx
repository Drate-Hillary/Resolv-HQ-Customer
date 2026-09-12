import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppState } from "@/lib/app-state";
import ScreenHeader from "@/components/ui/ScreenHeader";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";

export default function PersonalInfo() {
  const { user, updateProfile } = useAppState();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile({ name, email, phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="Personal Information" showBack />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="items-center pb-6">
          <Avatar initials={user.avatarInitials} size={72} />
        </View>
        <View className="px-6">
          <FormField label="Full name" value={name} onChangeText={setName} />
          <FormField
            label="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormField
            label="Phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Text className="mb-6 font-manrope-medium text-[12px] text-neutral-400">
            Member since {user.memberSince} · {user.plan}
          </Text>
          <Button label={saved ? "Saved ✓" : "Save changes"} onPress={handleSave} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
