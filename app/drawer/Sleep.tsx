import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../utils/api";

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

export default function Sleep() {
  const [hours, setHours] = useState("");
  const [savedHours, setSavedHours] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);

  const saveSleep = async () => {
    const value = parseFloat(hours);
    if (isNaN(value) || value <= 0) {
      Alert.alert("Invalid input", "Please enter a valid number of hours.");
      return;
    }

    try {
      const response = await api.post("/api/sleep/add/", { hours_slept: value });
      const data = await response.json();

      if (response.ok) {
        setSavedHours(value);
        Alert.alert("Success", "Sleep hours saved successfully!");
        setHours("");
      } else {
        Alert.alert("Error", data.detail || "Failed to save sleep hours");
      }
    } catch {
      Alert.alert("Error", "Could not connect to server.");
    }
  };

  const getSleepEmoji = (h: number) => {
    if (h >= 7) return "😴✨";
    if (h >= 5) return "😐";
    return "😓";
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>🌙</Text>
        </View>

        <Text style={styles.title}>Sleep Tracker</Text>
        <Text style={styles.subtitle}>How many hours did you sleep?</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Hours slept</Text>
          <View style={[styles.inputContainer, focused && styles.inputFocused]}>
            <Text style={styles.inputIcon}>💤</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 8"
              placeholderTextColor={THEME.primaryMid}
              keyboardType="numeric"
              value={hours}
              onChangeText={(v) => { setHours(v); setSavedHours(null); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            <Text style={styles.unit}>hrs</Text>
          </View>
        </View>

        {/* Quick pick chips */}
        <View style={styles.chipsRow}>
          {["5", "6", "7", "8", "9"].map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.chip, hours === val && styles.chipActive]}
              onPress={() => setHours(val)}
            >
              <Text style={[styles.chipText, hours === val && styles.chipTextActive]}>
                {val}h
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={saveSleep} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save Sleep</Text>
        </TouchableOpacity>

        {savedHours !== null && (
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>{getSleepEmoji(savedHours)}</Text>
            <Text style={styles.resultText}>You slept {savedHours} hours</Text>
            <Text style={styles.resultSub}>
              {savedHours >= 7 ? "Great rest! Keep it up." : savedHours >= 5 ? "Try to aim for 7–9 hours." : "You need more sleep!"}
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: THEME.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  blobTop: {
    position: "absolute", top: -80, left: -80,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: THEME.primaryMid, opacity: 0.45,
  },
  blobBottom: {
    position: "absolute", bottom: -100, right: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: THEME.primaryMid, opacity: 0.3,
  },
  card: {
    width: "88%", maxWidth: 400,
    backgroundColor: THEME.card,
    borderRadius: 24, padding: 28,
    alignItems: "center",
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 10,
  },
  iconCircle: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: THEME.primaryLight,
    justifyContent: "center", alignItems: "center",
    marginBottom: 16,
    borderWidth: 2, borderColor: THEME.primaryMid,
  },
  iconEmoji: { fontSize: 32 },
  title: { fontSize: 26, fontWeight: "800", color: THEME.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: THEME.textLight, marginBottom: 28 },
  inputWrapper: { width: "100%", marginBottom: 16 },
  label: {
    fontSize: 13, fontWeight: "600",
    color: THEME.text, marginBottom: 8, marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderColor: THEME.border,
    borderRadius: 12, backgroundColor: "#f5fbff",
    paddingHorizontal: 12, height: 52,
  },
  inputFocused: {
    borderColor: THEME.primary, backgroundColor: "#fff",
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 3,
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: THEME.text },
  unit: { fontSize: 14, color: THEME.textLight, fontWeight: "600" },
  chipsRow: {
    flexDirection: "row", gap: 8, marginBottom: 24,
  },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: THEME.border, backgroundColor: THEME.primaryLight,
  },
  chipActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  chipText: { fontSize: 13, fontWeight: "600", color: THEME.textLight },
  chipTextActive: { color: "#fff" },
  saveBtn: {
    width: "100%", backgroundColor: THEME.primary,
    borderRadius: 12, height: 50,
    justifyContent: "center", alignItems: "center",
    shadowColor: THEME.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
  resultCard: {
    marginTop: 20, width: "100%",
    backgroundColor: THEME.primaryLight,
    borderRadius: 14, padding: 16,
    alignItems: "center",
    borderWidth: 1, borderColor: THEME.primaryMid,
  },
  resultEmoji: { fontSize: 28, marginBottom: 6 },
  resultText: { fontSize: 17, fontWeight: "700", color: THEME.text, marginBottom: 4 },
  resultSub: { fontSize: 13, color: THEME.textLight, textAlign: "center" },
});
