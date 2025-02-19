/**
 * @file AppNavigator.tsx
 * @description Sets up the navigation stack for the app.
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "../screens/HomeScreen";
import CameraScreen from "../screens/CameraScreen";
import ResultsScreen from "../screens/ResultsScreen";

/**
 * Defines the shape of our root stack params.
 */
export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Results: {
    imageUri: string;
    classification: any;
    croppedRegions?: { [key: string]: string }; // Make optional
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Main navigator for the entire app.
 * @returns NavigationContainer with stack routes.
 */
export default function AppNavigator(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
