import React from "react";
import { View, Image, Pressable, Linking, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "../ui/AppText";
import { useTheme } from "@/src/theme/ThemeProvider";
import { spacing } from "@/src/theme/tokens";

const WEBSITE_URL = "https://tahaamouei.ir";
const INSTAGRAM_URL = "https://www.instagram.com/taha.amouei";

export function MadeByBadge() {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Image
          source={require("@/assets/images/logo-credit.jpg")}
          style={styles.logo}
        />
        <AppText variant="muted">ساخته شده توسط طاها عمویی</AppText>
      </View>

      <View style={styles.linksRow}>
        <Pressable
          style={styles.linkBtn}
          onPress={() => Linking.openURL(WEBSITE_URL)}
        >
          <Ionicons name="globe-outline" size={16} color={colors.accent} />
          <AppText variant="accent">tahaamouei.ir</AppText>
        </Pressable>
        <Pressable
          style={styles.linkBtn}
          onPress={() => Linking.openURL(INSTAGRAM_URL)}
        >
          <Ionicons name="logo-instagram" size={16} color={colors.accent} />
          <AppText variant="accent">taha.amouei@</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  linksRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  linkBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
  },
});
