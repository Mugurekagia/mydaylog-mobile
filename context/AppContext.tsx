// app/context/AppContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type Mood = {
  type: "happy" | "neutral" | "sad" | "stressed" | "energetic";
  description: string;
};

export type StreakInfo = {
  current: number;
  best: number;
  lastLoggedDate: string | null; // "YYYY-MM-DD"
};

export type Streaks = {
  steps: StreakInfo;
  water: StreakInfo;
  mood: StreakInfo;
  meals: StreakInfo;
};

const DEFAULT_STREAK: StreakInfo = { current: 0, best: 0, lastLoggedDate: null };

const DEFAULT_STREAKS: Streaks = {
  steps: { ...DEFAULT_STREAK },
  water: { ...DEFAULT_STREAK },
  mood:  { ...DEFAULT_STREAK },
  meals: { ...DEFAULT_STREAK },
};

const today = () => new Date().toISOString().split("T")[0];
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};

// Call this whenever a feature is logged for the day
function updateStreak(info: StreakInfo): StreakInfo {
  const todayStr = today();
  if (info.lastLoggedDate === todayStr) return info; // already logged today

  const newCurrent =
    info.lastLoggedDate === yesterday() ? info.current + 1 : 1; // continue or reset

  const newBest = Math.max(newCurrent, info.best);

  return { current: newCurrent, best: newBest, lastLoggedDate: todayStr };
}

type AppContextType = {
  water: number;
  setWater: (value: number | ((prev: number) => number)) => void;
  steps: number;
  setSteps: (value: number | ((prev: number) => number)) => void;
  sleep: number;
  setSleep: (value: number | ((prev: number) => number)) => void;
  mood: Mood | null;
  setMood: (mood: Mood) => void;
  // Auth
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  // Theme settings
  theme: string;
  setTheme: (theme: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  // Streaks
  streaks: Streaks;
  logStreak: (feature: keyof Streaks) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [water, setWaterRaw] = useState(0);
  const [steps, setStepsRaw] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [mood, setMoodRaw] = useState<Mood | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState("medium");
  const [language, setLanguage] = useState("en");
  const [streaks, setStreaks] = useState<Streaks>(DEFAULT_STREAKS);

  // Load streaks from storage on mount
  useEffect(() => {
    AsyncStorage.getItem("streaks").then((val) => {
      if (val) setStreaks(JSON.parse(val));
    });
  }, []);

  // Save streaks to storage whenever they change
  useEffect(() => {
    AsyncStorage.setItem("streaks", JSON.stringify(streaks));
  }, [streaks]);

  // Log a streak for a feature
  const logStreak = (feature: keyof Streaks) => {
    setStreaks((prev) => ({
      ...prev,
      [feature]: updateStreak(prev[feature]),
    }));
  };

  // Wrap setters to also log streaks automatically
  const setWater = (value: number | ((prev: number) => number)) => {
    setWaterRaw(value);
    logStreak("water");
  };

  const setSteps = (value: number | ((prev: number) => number)) => {
    setStepsRaw(value);
    logStreak("steps");
  };

  const setMood = (m: Mood) => {
    setMoodRaw(m);
    logStreak("mood");
  };

  // For meals, call logStreak("meals") manually when user logs a meal

  return (
    <AppContext.Provider
      value={{
        water,
        setWater,
        steps,
        setSteps,
        sleep,
        setSleep,
        mood,
        setMood,
        isAuthenticated,
        setIsAuthenticated,
        theme,
        setTheme,
        fontSize,
        setFontSize,
        language,
        setLanguage,
        streaks,
        logStreak,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
