import React from "react";
import { ScrollView, View, StyleSheet, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme/ThemeProvider";

interface ScreenContainerProps extends ViewProps {
  scroll?: boolean;
}

export function ScreenContainer({
  scroll = true,
  style,
  children,
  ...rest
}: ScreenContainerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const Wrapper = scroll ? ScrollView : View;
  const wrapperProps = scroll
    ? { contentContainerStyle: styles.scrollContent }
    : {};

  return (
    <View style={[styles.flex, { backgroundColor: colors.bg }]}>
      <Wrapper
        style={styles.flex}
        {...wrapperProps}
      >
        <View
          style={[
            styles.content,
            { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
            style,
          ]}
          {...rest}
        >
          {children}
        </View>
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: 20, gap: 16 },
});
