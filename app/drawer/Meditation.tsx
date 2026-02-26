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

export default function Meditation() {
  const [minutes, setMinutes] = useState<string>("");
  const [focused, setFocused] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const time = parseInt(minutes);
    if (isNaN(time) || time <= 0) {
      Alert.alert("Invalid input", "Please enter a valid number of minutes.");
      return;
    }

    try {
      const response = await api.post("/api/meditation/add/", {
        minutes_spent: time,
      });

      const data = await response.json();

      if (response.ok) {
        setSaved(true);
        Alert.alert("Saved", `Meditation time set for ${time} minutes`);
        setMinutes("");
        setTimeout(() => setSaved(false), 3000);
      } else {
        Alert.alert("Error", data.detail || "Could not save meditation time.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not connect to server.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Background blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <View style={styles.card}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>🧘</Text>
        </View>

        <Text style={styles.title}>Meditation</Text>
        <Text style={styles.subtitle}>Track your mindfulness session</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Minutes spent meditating</Text>
          <View style={[styles.inputContainer, focused && styles.inputFocused]}>
            <Text style={styles.inputIcon}>⏱️</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g. 15"
              placeholderTextColor={THEME.primaryMid}
              value={minutes}
              onChangeText={(v) => { setMinutes(v); setSaved(false); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            <Text style={styles.unit}>min</Text>
          </View>
        </View>

        {/* Preset chips */}
        <View style={styles.chipsRow}>
          {["5", "10", "15", "20", "30"].map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.chip, minutes === val && styles.chipActive]}
              onPress={() => setMinutes(val)}
            >
              <Text style={[styles.chipText, minutes === val && styles.chipTextActive]}>
                {val}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save Session</Text>
        </TouchableOpacity>

        {saved && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✅ Session saved!</Text>
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
    marginBottom: 16,
    borderWidth: 2, borderColor: THEME.primaryMid,
  },
  iconEmoji: { fontSize: 32 },
  title: {
    fontSize: 26, fontWeight: "800",
    color: THEME.text, marginBottom: 4,
  },
  subtitle: {
    fontSize: 14, color: THEME.textLight, marginBottom: 28,
  },
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
    flexDirection: "row", flexWrap: "wrap",
    justifyContent: "center", gap: 8, marginBottom: 24,
  },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: THEME.border, backgroundColor: THEME.primaryLight,
  },
  chipActive: {
    backgroundColor: THEME.primary, borderColor: THEME.primary,
  },
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
  saveBtnText: {
    color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.5,
  },
  successBanner: {
    marginTop: 16, paddingVertical: 10, paddingHorizontal: 20,
    backgroundColor: THEME.primaryLight, borderRadius: 10,
    borderWidth: 1, borderColor: THEME.primaryMid,
  },
  successText: { color: THEME.primary, fontWeight: "600", fontSize: 14 },
});
