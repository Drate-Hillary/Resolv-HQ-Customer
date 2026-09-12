import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface FormFieldProps extends TextInputProps {
  label: string;
}

export default function FormField({ label, ...rest }: FormFieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 font-manrope-semibold text-[12px] text-neutral-400">
        {label}
      </Text>
      <TextInput
        placeholderTextColor="#A3A3A3"
        className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 font-manrope-medium text-[14px] text-black"
        {...rest}
      />
    </View>
  );
}
