import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { AppText } from "@/components/ui/AppText";
import { darkColors } from "@/src/theme/tokens";

const DURATION_MS = 2500;

interface IntroScreenProps {
  onFinish: () => void;
}

export function IntroScreen({ onFinish }: IntroScreenProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 400 }, (finished) => {
        if (finished) runOnJS(onFinish)();
      });
    }, DURATION_MS - 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <Image
          source={require("@/assets/images/logo-credit.jpg")}
          style={styles.logo}
        />
        <AppText
          style={styles.signature}
          allowFontScaling={false}
        >
          Made by Taha Amooei
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkColors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    gap: 18,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  signature: {
    fontFamily: "DancingScript_700Bold",
    fontSize: 32,
    color: darkColors.secondaryAccent,
  },
});
