import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors, type ThemeColors } from "./tokens";
import { repos } from "@/src/repositories";
import type { ThemeMode } from "@/src/types/profile";

interface ThemeContextValue {
  colors: ThemeColors;
  scheme: "light" | "dark";
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    repos.settings.getSettings().then((s) => {
      setModeState(s.themeMode);
      setLoaded(true);
    });
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    repos.settings.saveSettings({ themeMode: next });
  }, []);

  const scheme: "light" | "dark" = useMemo(() => {
    if (mode === "system") return systemScheme === "dark" ? "dark" : "light";
    return mode;
  }, [mode, systemScheme]);

  const colors = scheme === "dark" ? darkColors : lightColors;

  const value = useMemo(
    () => ({ colors, scheme, mode, setMode }),
    [colors, scheme, mode, setMode]
  );

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
