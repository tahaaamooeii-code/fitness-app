import React, { useEffect, useState } from "react";
import { View, Image, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/src/theme/ThemeProvider";
import { repos } from "@/src/repositories";
import { saveProfilePhoto } from "@/src/services/photoService";
import { spacing } from "@/src/theme/tokens";
import type { UserProfile } from "@/src/types/profile";

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [targetProtein, setTargetProtein] = useState("");
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    repos.profile.getProfile().then((p) => {
      if (!p) return;
      setProfile(p);
      setName(p.name);
      setHeightCm(p.heightCm ? String(p.heightCm) : "");
      setWeightKg(p.weightKg ? String(p.weightKg) : "");
      setTargetProtein(String(p.dailyProteinTargetGrams));
      setPhotoUri(p.photoUri);
    });
  }, []);

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
      setPhotoUri(saveProfilePhoto(result.assets[0].uri));
    }
  }

  async function handleSave() {
    setSaving(true);
    const now = new Date().toISOString();
    const updated: UserProfile = {
      name,
      photoUri,
      heightCm: heightCm ? Number(heightCm) : undefined,
      weightKg: weightKg ? Number(weightKg) : undefined,
      dailyProteinTargetGrams: Number(targetProtein) || 0,
      createdAt: profile?.createdAt ?? now,
      updatedAt: now,
    };
    await repos.profile.saveProfile(updated);
    if (updated.dailyProteinTargetGrams > 0) {
      await repos.foodLog.setGoal(updated.dailyProteinTargetGrams);
    }
    setProfile(updated);
    setSaving(false);
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="heading" weight="bold">
          پروفایل
        </AppText>
        <Pressable onPress={() => router.push("/(tabs)/profile/settings")}>
          <Ionicons name="settings-outline" size={22} color={colors.muted} />
        </Pressable>
      </View>

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
      </Pressable>

      <TextField label="اسم" value={name} onChangeText={setName} />
      <TextField
        label="قد (سانتی‌متر)"
        value={heightCm}
        onChangeText={setHeightCm}
        keyboardType="numeric"
      />
      <TextField
        label="وزن (کیلوگرم)"
        value={weightKg}
        onChangeText={setWeightKg}
        keyboardType="numeric"
      />
      <TextField
        label="هدف پروتیین روزانه (گرم)"
        value={targetProtein}
        onChangeText={setTargetProtein}
        keyboardType="numeric"
      />

      <View style={{ marginTop: spacing.md }}>
        <Button label="ذخیره تغییرات" onPress={handleSave} loading={saving} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  photoWrap: { alignItems: "center", marginVertical: spacing.md },
  photo: { width: 96, height: 96, borderRadius: 48 },
  photoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
});
