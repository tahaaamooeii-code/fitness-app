import React from "react";
import { Link } from "expo-router";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { AppText } from "@/components/ui/AppText";

export default function NotFoundScreen() {
  return (
    <ScreenContainer>
      <AppText variant="heading" weight="bold">
        این صفحه پیدا نشد
      </AppText>
      <Link href="/(tabs)/nutrition">
        <AppText variant="accent">برگشت به خانه</AppText>
      </Link>
    </ScreenContainer>
  );
}
