/**
 * @file AppNavigator.tsx
 * @description Sets up the navigation stack for the app.
 */

import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebaseConfig";

import HomeScreen from "../screens/HomeScreen";
import CameraScreen from "../screens/CameraScreen";
import ResultsScreen from "../screens/ResultsScreen";
import AuthScreen from "../screens/AuthScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import HistoryScreen from "../screens/HistoryScreen";
import RoutineScreen from "../screens/RoutineScreen";
import { ActivityIndicator, View } from "react-native";
import { getUserProfile } from "../services/firebaseService";

import ProductResultsScreen from "../screens/ProductResultsScreen";
import { AcneType, IngredientResult } from "../services/classificationService";

/**
 * Defines the shape of our root stack params.
 */
export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Camera: undefined;
  Results: {
    imageUri: string;
    classification: AcneType;
    confidence: number;
    croppedRegions?: { [key: string]: string }; // Make optional
  };
  ProductResults: {
    result: IngredientResult;
  };
  Onboarding: undefined;
  History: undefined;
  Routine: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Main navigator for the entire app.
 * @returns NavigationContainer with stack routes.
 */
export default function AppNavigator(): React.JSX.Element {
  const [user, setUser] = useState<any>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null); // null = loading check
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // User logged in, check for profile
        const result = await getUserProfile(u.uid);
        
        if (result.error) {
          // Network error - assume they have a profile and let them in
          // (Better UX than blocking them with Onboarding every time)
          console.log("Network error checking profile, defaulting to Home");
          setHasProfile(true);
        } else {
          // No error - trust the result
          setHasProfile(!!result.profile);
        }
      } else {
        setHasProfile(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          hasProfile ? (
             <>
               <Stack.Screen name="Home" component={HomeScreen} />
               <Stack.Screen name="Camera" component={CameraScreen} />
               <Stack.Screen name="Results" component={ResultsScreen} />
               <Stack.Screen name="ProductResults" component={ProductResultsScreen} />
               <Stack.Screen name="History" component={HistoryScreen} />
               <Stack.Screen name="Routine" component={RoutineScreen} />
             </>
          ) : (
             <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
          )
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
