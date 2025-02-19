/**
 * @file HomeScreen.tsx
 * @description Main entry screen of the app, provides access to camera functionality.
 */

import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props): JSX.Element {
  return (
    <View style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title">AI Skin Health Monitor</ThemedText>
        <ThemedText>
          Take a photo of your skin to get an instant analysis and
          recommendations.
        </ThemedText>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Camera")}
        >
          <ThemedText style={styles.buttonText}>Take Photo</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
