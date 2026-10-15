import React, { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, Vazirmatn_400Regular, Vazirmatn_500Medium, Vazirmatn_600SemiBold, Vazirmatn_700Bold } from "@expo-google-fonts/vazirmatn";
import { MarkaziText_400Regular, MarkaziText_500Medium, MarkaziText_700Bold } from "@expo-google-fonts/markazi-text";
import { DancingScript_700Bold } from "@expo-google-fonts/dancing-script";
import { ThemeProvider, useTheme } from "@/src/theme/ThemeProvider";
import { initRepos } from "@/src/repositories";
import { IntroScreen } from "@/components/intro/IntroScreen";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootStack() {
  const { scheme, colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Vazirmatn_400Regular,
    Vazirmatn_500Medium,
    Vazirmatn_600SemiBold,
    Vazirmatn_700Bold,
    MarkaziText_400Regular,
    MarkaziText_500Medium,
    MarkaziText_700Bold,
    DancingScript_700Bold,
  });
  const [reposReady, setReposReady] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    initRepos().then(() => setReposReady(true));
  }, []);

  const ready = fontsLoaded && reposReady;

  const onLayout = useCallback(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
      <ThemeProvider>
        {showIntro ? (
          <IntroScreen onFinish={() => setShowIntro(false)} />
        ) : (
          <RootStack />
        )}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
