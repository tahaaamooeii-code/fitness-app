import React, { useState } from "react";
import { View, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/src/theme/ThemeProvider";
import { generateText, GeminiNotConfiguredError } from "@/src/services/geminiClient";
import { uuid } from "@/src/utils/uuid";
import { spacing } from "@/src/theme/tokens";
import type { ChatMessage } from "@/src/types/ai";

const SYSTEM_INSTRUCTION =
  "You are a friendly bodybuilding and nutrition assistant inside a personal fitness app. " +
  "The user writes in Persian (Farsi) — always reply in Persian. Be concise, practical, and " +
  "clearly mark anything approximate as an estimate, not a guaranteed fact.";

export default function AiChatScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");

    const userMsg: ChatMessage = {
      id: uuid(),
      role: "user",
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const reply = await generateText(text, {
        systemInstruction: SYSTEM_INSTRUCTION,
      });
      setMessages((prev) => [
        ...prev,
        { id: uuid(), role: "assistant", text: reply, createdAt: new Date().toISOString() },
      ]);
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      const errText =
        e instanceof GeminiNotConfiguredError
          ? "کلید Gemini تنظیم نشده. یه کلید رایگان از Google AI Studio بگیر و توی فایل .env بذار."
          : `الان نمی‌تونم جواب بدم.\n[جزئیات فنی: ${detail}]`;
      setMessages((prev) => [
        ...prev,
        { id: uuid(), role: "assistant", text: errText, createdAt: new Date().toISOString() },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScreenContainer scroll={false}>
        <View style={styles.header}>
          <AppText variant="heading" weight="bold">
            دستیار هوش مصنوعی
          </AppText>
          <Pressable onPress={() => router.push("/(tabs)/ai/insights")}>
            <Ionicons name="analytics-outline" size={22} color={colors.muted} />
          </Pressable>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.md }}
          ListEmptyComponent={
            <AppText variant="muted" style={{ textAlign: "center", marginTop: spacing.lg }}>
              هر سوالی درباره تمرین و تغذیه داری بپرس
            </AppText>
          }
          renderItem={({ item }) => (
            <Card
              style={[
                styles.bubble,
                item.role === "user"
                  ? { backgroundColor: colors.accent, alignSelf: "flex-start" }
                  : { alignSelf: "flex-end" },
              ]}
            >
              <AppText style={item.role === "user" ? { color: "#fff" } : undefined}>
                {item.text}
              </AppText>
            </Card>
          )}
        />

        <View style={styles.inputRow}>
          <View style={{ flex: 1 }}>
            <TextField
              value={input}
              onChangeText={setInput}
              placeholder="سوالت رو بنویس..."
              onSubmitEditing={handleSend}
            />
          </View>
          <Pressable onPress={handleSend} disabled={sending} style={styles.sendBtn}>
            <Ionicons name="send" size={22} color={colors.accent} />
          </Pressable>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bubble: { maxWidth: "85%" },
  inputRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  sendBtn: { paddingHorizontal: spacing.xs },
});
