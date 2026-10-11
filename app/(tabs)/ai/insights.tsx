import React, { useState } from "react";
import { View } from "react-native";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/src/theme/ThemeProvider";
import { repos } from "@/src/repositories";
import { generateText, GeminiNotConfiguredError } from "@/src/services/geminiClient";
import { daysAgoBucket, todayBucket } from "@/src/utils/dateBuckets";
import { spacing } from "@/src/theme/tokens";

export default function AiInsightsScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const start = daysAgoBucket(20);
      const end = todayBucket();
      const [dailyTotals, goal] = await Promise.all([
        repos.foodLog.getDailyTotals(start, end),
        repos.foodLog.getGoal(),
      ]);

      const program = await repos.workout.getActiveProgram();
      const exerciseSummaries: string[] = [];
      if (program) {
        for (const ex of program.exercises) {
          const logs = await repos.workoutLog.getSetLogsForExercise(ex.id);
          if (logs.length === 0) continue;
          const best = Math.max(...logs.map((l) => l.weightKg));
          const first = logs[0].weightKg;
          exerciseSummaries.push(`${ex.name}: از ${first} به ${best} کیلوگرم`);
        }
      }

      const summary =
        `هدف پروتیین روزانه: ${goal?.targetGramsPerDay ?? "نامشخص"} گرم\n` +
        `پروتیین ۲۰ روز اخیر (میانگین): ${(
          dailyTotals.reduce((s, t) => s + t.totalProtein, 0) /
          Math.max(1, dailyTotals.length)
        ).toFixed(0)} گرم\n` +
        `روند وزنه‌ها:\n${exerciseSummaries.join("\n") || "داده‌ای ثبت نشده"}`;

      const reply = await generateText(
        `این خلاصه پیشرفت کاربر است:\n${summary}\n\nبر اساس این اطلاعات، ۲ یا ۳ پیشنهاد مشخص و دلگرم‌کننده بده.`,
        {
          systemInstruction:
            "You are a bodybuilding coach reviewing a user's saved protein and workout progress. " +
            "Reply in Persian, be specific and encouraging, avoid generic advice.",
        }
      );
      setInsight(reply);
    } catch (e) {
      setError(
        e instanceof GeminiNotConfiguredError
          ? "کلید Gemini تنظیم نشده."
          : "مشکلی پیش اومد، دوباره امتحان کن."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <AppText variant="heading" weight="bold">
        تحلیل پیشرفت
      </AppText>
      <AppText variant="muted">
        بر اساس پروتیین و وزنه‌هایی که ثبت کردی، تحلیل می‌گیریم
      </AppText>

      <Button label="تحلیل کن" onPress={handleAnalyze} loading={loading} />

      {error && <AppText style={{ color: colors.destructive }}>{error}</AppText>}

      {insight && (
        <Card>
          <AppText>{insight}</AppText>
        </Card>
      )}
    </ScreenContainer>
  );
}
