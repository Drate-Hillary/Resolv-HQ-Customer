import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Mail01Icon, MailSend01Icon } from "@hugeicons/core-free-icons";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useAppState } from "@/lib/app-state";
import ScreenHeader from "@/components/ui/ScreenHeader";
import Button from "@/components/ui/Button";

export default function ForgotPassword() {
  const router = useRouter();
  const { sendPasswordReset } = useAppState();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (email.trim().length < 4 || loading) return;
    setError(null);
    setLoading(true);
    const { error: resetError } = await sendPasswordReset(email.trim());
    setLoading(false);
    if (resetError) {
      setError(resetError);
      return;
    }
    setSent(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScreenHeader title="" showBack />
        <View className="flex-1 px-7 pt-4">
          {!sent ? (
            <Animated.View entering={FadeInDown.duration(400)}>
              <Text className="font-manrope-extrabold text-[26px] text-black">
                Reset your password
              </Text>
              <Text className="mt-2 font-manrope-medium text-[14px] leading-5 text-neutral-500">
                Enter the email associated with your account and we&rsquo;ll send
                you a secure link to reset your password.
              </Text>

              <Text className="mb-1.5 mt-8 font-manrope-semibold text-[12px] text-neutral-400">
                EMAIL
              </Text>
              <View className="flex-row items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3.5">
                <HugeiconsIcon icon={Mail01Icon} size={17} color="#A3A3A3" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#A3A3A3"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 font-manrope-medium text-[14px] text-black"
                />
              </View>

              {error && (
                <Text className="mt-3 font-manrope-medium text-[13px] text-red-600">{error}</Text>
              )}

              <View className="mt-8">
                <Button label="Send reset link" onPress={handleSend} loading={loading} />
              </View>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeIn.duration(400)} className="items-center pt-14">
              <View className="mb-5 h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                <HugeiconsIcon icon={MailSend01Icon} size={28} color="#171717" />
              </View>
              <Text className="text-center font-manrope-bold text-[19px] text-black">
                Check your inbox
              </Text>
              <Text className="mt-2 text-center font-manrope-medium text-[13px] leading-5 text-neutral-500">
                We&rsquo;ve sent a secure reset link to {email}. It expires in 30
                minutes for your security.
              </Text>
              <View className="mt-8 w-full">
                <Button label="Back to Sign In" variant="secondary" onPress={() => router.replace("/sign-in")} />
              </View>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
