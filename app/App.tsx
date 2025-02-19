/**
 * @file App.tsx
 * @description Entry point for the AI Skin Health Monitor app.
 */

import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./navigation/AppNavigator";

/**
 * Renders the entire application, wrapping navigation in a SafeAreaProvider.
 */
export default function App(): JSX.Element {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
