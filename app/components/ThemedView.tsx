/**
 * @file ThemedView.tsx
 * @description A themed view component that adapts to light/dark mode
 */

import React from "react";
import { View, type ViewProps } from "react-native";

export function ThemedView(props: ViewProps): JSX.Element {
  return <View {...props} />;
}
