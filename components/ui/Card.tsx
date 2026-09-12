import React from "react";
import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  className?: string;
  children?: React.ReactNode;
}

export default function Card({ className = "", children, ...rest }: CardProps) {
  return (
    <View
      className={`rounded-3xl border border-neutral-200 bg-white p-4 ${className}`}
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 1,
      }}
      {...rest}
    >
      {children}
    </View>
  );
}
