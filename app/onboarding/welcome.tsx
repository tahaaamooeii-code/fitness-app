import React, { useState } from "react";
import { View, Image, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { MadeByBadge } from "@/components/credit/MadeByBadge";
import { useTheme } from "@/src/theme/ThemeProvider";
import { saveProfilePhoto } from "@/src/services/photoService";
import { spacing } from "@/src/theme/tokens";

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  async function pickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const savedUri = saveProfilePhoto(result.assets[0].uri);
      setPhotoUri(savedUri);
    }
  }

  function handleContinue() {
    router.push({
      pathname: "/onboarding/protein-goal",
      params: {
        name,
        photoUri: photoUri ?? "",
        heightCm,
        weightKg,
      },
    });
  }

  return (
    <ScreenContainer>
      <AppText variant="heading" weight="bold" style={{ marginTop: spacing.lg }}>
        خوش اومدی! بیا شروع کنیم
      </AppText>
      <AppText variant="muted">
        اول یه معرفی کوتاه از خودت بهمون بده
      </AppText>

      <Pressable onPress={pickPhoto} style={styles.photoWrap}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <View
            style={[
              styles.photo,
              styles.photoPlaceholder,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <Ionicons name="camera-outline" size={28} color={colors.muted} />
          </View>
        )}
        <AppText variant="muted" style={{ marginTop: spacing.xs }}>
          {photoUri ? "تغییر عکس" : "افزودن عکس پروفایل"}
        </AppText>
      </Pressable>

      <TextField label="اسم" value={name} onChangeText={setName} placeholder="اسمت رو وارد کن" />
      <TextField
        label="قد (سانتی‌متر)"
        value={heightCm}
        onChangeText={setHeightCm}
        keyboardType="numeric"
        placeholder="مثلاً 178"
      />
      <TextField
        label="وزن (کیلوگرم)"
        value={weightKg}
        onChangeText={setWeightKg}
        keyboardType="numeric"
        placeholder="مثلاً 75"
      />

      <View style={{ marginTop: spacing.lg }}>
        <Button label="ادامه" onPress={handleContinue} disabled={!name.trim()} />
      </View>

      <MadeByBadge />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  photoWrap: { alignItems: "center", marginVertical: spacing.md },
  photo: { width: 88, height: 88, borderRadius: 44 },
  photoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
});
