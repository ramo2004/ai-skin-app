/**
 * @file ThemedText.tsx
 * @description A themed text component that adapts to light/dark mode
 */

import React from "react";
import { Text, type TextProps } from "react-native";

type ThemedTextProps = TextProps & {
  type?: "title" | "subtitle" | "default" | "defaultSemiBold";
};

export function ThemedText({
  style,
  type = "default",
  ...props
}: ThemedTextProps): JSX.Element {
  const baseStyle = {
    title: { fontSize: 24, fontWeight: "600" as const },
    subtitle: { fontSize: 20, fontWeight: "500" as const },
    default: { fontSize: 16 },
    defaultSemiBold: { fontSize: 16, fontWeight: "600" as const },
  };

  return <Text style={[baseStyle[type], style]} {...props} />;
}
