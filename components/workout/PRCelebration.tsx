import React, { useEffect } from "react";
import { View, StyleSheet, Modal, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import ConfettiCannon from "react-native-confetti-cannon";
import * as Haptics from "expo-haptics";
import { AppText } from "../ui/AppText";
import { Button } from "../ui/Button";
import { WeightProgressionChart } from "../charts/WeightProgressionChart";
import { useTheme } from "@/src/theme/ThemeProvider";
import { radii, spacing } from "@/src/theme/tokens";
import { pickPrMessage } from "@/src/data/prMessages";
import type { PersonalRecord, WorkoutSetLog } from "@/src/types/workout";

const { width } = Dimensions.get("window");

interface PRCelebrationProps {
  visible: boolean;
  exerciseName: string;
  pr: PersonalRecord;
  setLogs: WorkoutSetLog[];
  personalRecords: PersonalRecord[];
  onClose: () => void;
}

export function PRCelebration({
  visible,
  exerciseName,
  pr,
  setLogs,
  personalRecords,
  onClose,
}: PRCelebrationProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(0.7);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 10 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      scale.value = 0.7;
    }
  }, [visible, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  const delta = pr.previousBestWeightKg
    ? pr.weightKg - pr.previousBestWeightKg
    : null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.backdrop}>
        <ConfettiCannon
          count={120}
          origin={{ x: width / 2, y: 0 }}
          fadeOut
          autoStart
        />
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.borderLight },
            animatedStyle,
          ]}
        >
          <AppText variant="heading" weight="bold">
            رکورد جدید! 🎉
          </AppText>
          <AppText style={{ marginTop: spacing.sm }}>
            {pickPrMessage(exerciseName, pr.weightKg)}
          </AppText>
          {delta !== null && (
            <AppText variant="accent" weight="medium" style={{ marginTop: spacing.xs }}>
              +{delta.toFixed(1)} کیلوگرم نسبت به رکورد قبلی
            </AppText>
          )}
          <View style={{ marginTop: spacing.md }}>
            <WeightProgressionChart
              setLogs={setLogs}
              personalRecords={personalRecords}
              height={160}
            />
          </View>
          <View style={{ marginTop: spacing.md }}>
            <Button label="عالی بود!" onPress={onClose} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(4,6,26,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
});
