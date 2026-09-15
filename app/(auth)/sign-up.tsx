import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Mail01Icon,
  MailSend01Icon,
  SparklesIcon,
  SquareLock02Icon,
  Tick02Icon,
  User03Icon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useAppState } from "@/lib/app-state";
import Button from "@/components/ui/Button";
import AnimatedPressable from "@/components/ui/AnimatedPressable";

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAppState();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const canSubmit =
    name.trim().length > 1 && email.trim().length > 3 && password.trim().length >= 6 && agreed;

  const handleSignUp = async () => {
    if (!canSubmit || loading) return;
    setError(null);
    setLoading(true);
    const { error: signUpError, needsEmailConfirmation } = await signUp(
      name.trim(),
      email.trim(),
      password,
    );
    setLoading(false);
    if (signUpError) {
      setError(signUpError);
      return;
    }
    if (needsEmailConfirmation) {
      setConfirmationSent(true);
      return;
    }
    router.replace("/home");
  };

  if (confirmationSent) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-8">
          <Animated.View entering={FadeIn.duration(400)} className="items-center">
            <View className="mb-5 h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <HugeiconsIcon icon={MailSend01Icon} size={28} color="#171717" />
            </View>
            <Text className="text-center font-manrope-bold text-[19px] text-black">
              Confirm your email
            </Text>
            <Text className="mt-2 text-center font-manrope-medium text-[13px] leading-5 text-neutral-500">
              We&rsquo;ve sent a confirmation link to {email}. Verify your email, then
              sign in to get started.
            </Text>
            <View className="mt-8 w-full">
              <Button label="Back to Sign In" variant="secondary" onPress={() => router.replace("/sign-in")} />
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.duration(400)}>
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-black">
              <HugeiconsIcon icon={SparklesIcon} size={24} color="#ffffff" />
            </View>
            <Text className="mt-6 font-manrope-extrabold text-[28px] text-black">
              Create your account
            </Text>
            <Text className="mt-1 font-manrope-medium text-[14px] text-neutral-500">
              Get personalized, AI-assisted support in minutes
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(400)} className="mt-9">
            <Text className="mb-1.5 font-manrope-semibold text-[12px] text-neutral-400">
              FULL NAME
            </Text>
            <View className="mb-4 flex-row items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3.5">
              <HugeiconsIcon icon={User03Icon} size={17} color="#A3A3A3" />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Jane Doe"
                placeholderTextColor="#A3A3A3"
                className="flex-1 font-manrope-medium text-[14px] text-black"
              />
            </View>

            <Text className="mb-1.5 font-manrope-semibold text-[12px] text-neutral-400">
              EMAIL
            </Text>
            <View className="mb-4 flex-row items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3.5">
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

            <Text className="mb-1.5 font-manrope-semibold text-[12px] text-neutral-400">
              PASSWORD
            </Text>
            <View className="flex-row items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3.5">
              <HugeiconsIcon icon={SquareLock02Icon} size={17} color="#A3A3A3" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                placeholderTextColor="#A3A3A3"
                secureTextEntry={!showPassword}
                className="flex-1 font-manrope-medium text-[14px] text-black"
              />
              <AnimatedPressable scaleTo={0.85} onPress={() => setShowPassword((s) => !s)}>
                <HugeiconsIcon
                  icon={showPassword ? ViewOffIcon : ViewIcon}
                  size={17}
                  color="#A3A3A3"
                />
              </AnimatedPressable>
            </View>

            <AnimatedPressable
              scaleTo={0.97}
              onPress={() => setAgreed((a) => !a)}
              className="mt-4 flex-row items-center gap-2.5"
            >
              <View
                className={`h-5 w-5 items-center justify-center rounded-md border ${
                  agreed ? "border-black bg-black" : "border-neutral-300"
                }`}
              >
                {agreed && <HugeiconsIcon icon={Tick02Icon} size={12} color="#ffffff" />}
              </View>
              <Text className="flex-1 font-manrope-medium text-[12px] leading-4 text-neutral-500">
                I agree to the Terms of Service and Privacy Policy
              </Text>
            </AnimatedPressable>

            {error && (
              <Animated.View entering={FadeInDown.duration(250)} className="mt-4">
                <Text className="font-manrope-medium text-[13px] text-red-600">{error}</Text>
              </Animated.View>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).duration(400)} className="mt-8">
            <Button
              label="Create Account"
              onPress={handleSignUp}
              loading={loading}
              disabled={!canSubmit}
            />
          </Animated.View>

          <View className="flex-1" />

          <Animated.View
            entering={FadeInDown.delay(240).duration(400)}
            className="flex-row items-center justify-center gap-1.5 pt-8"
          >
            <Text className="font-manrope-medium text-[13px] text-neutral-500">
              Already have an account?
            </Text>
            <AnimatedPressable onPress={() => router.push("/sign-in")}>
              <Text className="font-manrope-bold text-[13px] text-black">Sign In</Text>
            </AnimatedPressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
