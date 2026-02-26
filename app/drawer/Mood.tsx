import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppContext } from "../../context/AppContext";
import { api } from "../../utils/api";

type MoodType = "happy" | "neutral" | "sad" | "stressed" | "energetic";

const THEME = {
  primary: "#3aade0",
  primaryLight: "#e8f4fd",
  primaryMid: "#b3ddf5",
  primaryDark: "#1a8abf",
  card: "#ffffff",
  text: "#1a3a4a",
  textLight: "#5a8aa0",
  border: "#c8e6f7",
  shadow: "#90cce8",
};

const MOOD_OPTIONS: { value: MoodType; label: string; emoji: string; color: string }[] = [
  { value: "happy",    label: "Happy",    emoji: "😊", color: "#FFD700" },
  { value: "neutral",  label: "Neutral",  emoji: "😐", color: "#90CAF9" },
  { value: "sad",      label: "Sad",      emoji: "😔", color: "#7986CB" },
  { value: "stressed", label: "Stressed", emoji: "😣", color: "#EF9A9A" },
  { value: "energetic",label: "Energetic",emoji: "⚡", color: "#A5D6A7" },
];

export default function Mood() {
  const { mood: globalMood, setMood: setGlobalMood } = useAppContext();

  const [mood, setMood] = useState<MoodType>(globalMood?.type || "happy");
  const [description, setDescription] = useState(globalMood?.description || "");
  const [saved, setSaved] = useState(false);
  const [descFocused, setDescFocused] = useState(false);

  const selectedMood = MOOD_OPTIONS.find((m) => m.value === mood)!;

  const saveMood = async () => {
    try {
      const response = await api.post("/api/mood/add/", { mood, note: description });

      if (response.ok) {
        setSaved(true);
        setGlobalMood({ type: mood, description });
        setDescription("");
        Alert.alert("Success", "Mood saved successfully 😊");
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await response.json();
        Alert.alert("Error", data.detail || "Failed to save mood");
      }
    } catch {
      Alert.alert("Error", "Could not connect to server");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Big mood display */}
          <View style={[styles.moodDisplay, { backgroundColor: selectedMood.color + "22", borderColor: selectedMood.color + "55" }]}>
            <Text style={styles.moodEmojiBig}>{selectedMood.emoji}</Text>
            <Text style={[styles.moodLabelBig, { color: THEME.text }]}>{selectedMood.label}</Text>
          </View>

          <Text style={styles.title}>Mood Tracker</Text>
          <Text style={styles.subtitle}>How are you feeling today?</Text>

          {/* Mood chips */}
          <View style={styles.moodChipsRow}>
            {MOOD_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.moodChip,
                  mood === opt.value && { backgroundColor: opt.color + "33", borderColor: opt.color },
                ]}
                onPress={() => { setMood(opt.value); setSaved(false); }}
              >
                <Text style={styles.moodChipEmoji}>{opt.emoji}</Text>
                <Text style={[styles.moodChipLabel, mood === opt.value && { color: THEME.text, fontWeight: "700" }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Add a note (optional)</Text>
            <View style={[styles.textAreaContainer, descFocused && styles.inputFocused]}>
              <TextInput
                style={styles.textArea}
                placeholder="Describe how you feel..."
                placeholderTextColor={THEME.primaryMid}
                value={description}
                onChangeText={setDescription}
                onFocus={() => setDescFocused(true)}
                onBlur={() => setDescFocused(false)}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={saveMood} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Save Mood</Text>
          </TouchableOpacity>

          {saved && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>✅ Mood saved!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: THEME.primaryLight,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  blobTop: {
    position: "absolute", top: -80, right: -80,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: THEME.primaryMid, opacity: 0.45,
  },
  blobBottom: {
    position: "absolute", bottom: -100, left: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: THEME.primaryMid, opacity: 0.3,
  },
  card: {
    width: "88%", maxWidth: 420,
    backgroundColor: THEME.card,
    borderRadius: 24, padding: 28,
    alignItems: "center",
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 10,
  },
  moodDisplay: {
    width: 90, height: 90, borderRadius: 45,
    justifyContent: "center", alignItems: "center",
    marginBottom: 16, borderWidth: 2,
  },
  moodEmojiBig: { fontSize: 36 },
  moodLabelBig: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  title: { fontSize: 26, fontWeight: "800", color: THEME.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: THEME.textLight, marginBottom: 24 },
  moodChipsRow: {
    flexDirection: "row", flexWrap: "wrap",
    justifyContent: "center", gap: 8, marginBottom: 24, width: "100%",
  },
  moodChip: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 16, borderWidth: 1.5,
    borderColor: THEME.border, backgroundColor: THEME.primaryLight,
    alignItems: "center", minWidth: 72,
  },
  moodChipEmoji: { fontSize: 20, marginBottom: 2 },
  moodChipLabel: { fontSize: 11, fontWeight: "500", color: THEME.textLight },
  inputWrapper: { width: "100%", marginBottom: 20 },
  label: {
    fontSize: 13, fontWeight: "600",
    color: THEME.text, marginBottom: 8, marginLeft: 2,
  },
  textAreaContainer: {
    borderWidth: 1.5, borderColor: THEME.border,
    borderRadius: 12, backgroundColor: "#f5fbff",
    padding: 12, minHeight: 90,
  },
  inputFocused: {
    borderColor: THEME.primary, backgroundColor: "#fff",
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 3,
  },
  textArea: {
    fontSize: 15, color: THEME.text,
    textAlignVertical: "top", minHeight: 70,
  },
  saveBtn: {
    width: "100%", backgroundColor: THEME.primary,
    borderRadius: 12, height: 50,
    justifyContent: "center", alignItems: "center",
    shadowColor: THEME.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
  successBanner: {
    marginTop: 16, paddingVertical: 10, paddingHorizontal: 20,
    backgroundColor: THEME.primaryLight, borderRadius: 10,
    borderWidth: 1, borderColor: THEME.primaryMid,
  },
  successText: { color: THEME.primary, fontWeight: "600", fontSize: 14 },
});
