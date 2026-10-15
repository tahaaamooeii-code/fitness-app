import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "TA Fitness App",
  slug: "fitness-app",
  version: "1.1.0",
  orientation: "portrait",
  scheme: "fitnessapp",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    infoPlist: {
      NSPhotoLibraryUsageDescription:
        "برای انتخاب عکس پروفایل به گالری شما نیاز داریم.",
    },
  },
  android: {
    package: "ir.tahaamouei.fitnessapp",
    versionCode: 5,
    adaptiveIcon: {
      backgroundColor: "#04061A",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/splash-icon.png",
        imageWidth: 220,
        resizeMode: "contain",
        backgroundColor: "#04061a",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission: "برای انتخاب عکس پروفایل به گالری شما نیاز داریم.",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["arm64-v8a"],
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? null,
    eas: {
      projectId: "022c6462-a105-4a70-9aaa-51ed45ade3bc",
    },
  },
};

export default config;
