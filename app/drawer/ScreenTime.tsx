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

export default function ScreenTime() {
  const [hours, setHours] = useState("");
  const [saved, setSaved] = useState(false);
  const [focused, setFocused] = useState(false);

  const saveScreenTime = async () => {
    const numericHours = parseFloat(hours);
    if (isNaN(numericHours) || numericHours <= 0) {
      Alert.alert("Invalid input", "Please enter a valid number of hours.");
      return;
    }

    try {
      const response = await api.post("/api/screentime/add/", {
        hours_spent: numericHours,
      });
      const data = await response.json();

      if (response.ok) {
        setSaved(true);
        Alert.alert("Success", "Screen time saved successfully!");
        setHours("");
        setTimeout(() => setSaved(false), 3000);
      } else {
        Alert.alert("Error", data.detail || "Failed to save screen time");
      }
    } catch {
      Alert.alert("Error", "Could not connect to server.");
    }
  };

  const getScreenTimeEmoji = (h: number) => {
    if (h <= 2) return "👍";
    if (h <= 5) return "😐";
    return "📵";
  };

  const numericHours = parseFloat(hours);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>📱</Text>
        </View>

        <Text style={styles.title}>Screen Time</Text>
        <Text style={styles.subtitle}>How long were you on your screen?</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Hours on screen</Text>
          <View style={[styles.inputContainer, focused && styles.inputFocused]}>
            <Text style={styles.inputIcon}>🕐</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5"
              placeholderTextColor={THEME.primaryMid}
              value={hours}
              onChangeText={(v) => { setHours(v); setSaved(false); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              keyboardType="numeric"
            />
            <Text style={styles.unit}>hrs</Text>
          </View>
        </View>

        {/* Quick pick chips */}
        <View style={styles.chipsRow}>
          {["1", "2", "3", "5", "8"].map((val) => (
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

        {/* Live feedback bar */}
        {hours && !isNaN(numericHours) && numericHours > 0 && (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackEmoji}>{getScreenTimeEmoji(numericHours)}</Text>
            <Text style={styles.feedbackText}>
              {numericHours <= 2
                ? "Great! Very healthy screen time."
                : numericHours <= 5
                ? "Moderate — try to take breaks."
                : "High screen time. Consider a digital detox!"}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={saveScreenTime} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save Screen Time</Text>
        </TouchableOpacity>

        {saved && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✅ Screen time saved!</Text>
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
    marginBottom: 16, borderWidth: 2, borderColor: THEME.primaryMid,
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
    flexDirection: "row", gap: 8, marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: THEME.border, backgroundColor: THEME.primaryLight,
  },
  chipActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  chipText: { fontSize: 13, fontWeight: "600", color: THEME.textLight },
  chipTextActive: { color: "#fff" },
  feedbackCard: {
    width: "100%", flexDirection: "row", alignItems: "center",
    backgroundColor: THEME.primaryLight,
    borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: THEME.primaryMid,
    marginBottom: 16, gap: 10,
  },
  feedbackEmoji: { fontSize: 22 },
  feedbackText: { flex: 1, fontSize: 13, color: THEME.textLight, fontWeight: "500" },
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
