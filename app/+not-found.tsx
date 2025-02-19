import React from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { RootStackParamList } from "./navigation/AppNavigator";

export default function NotFoundScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Explicitly type the navigation prop

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">This screen doesn't exist.</ThemedText>
      <TouchableOpacity
        onPress={() => navigation.navigate("Home")}
        style={styles.link}
      >
        <ThemedText type="link">Go to home screen!</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
