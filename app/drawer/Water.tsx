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
import { useAppContext } from "../../context/AppContext";
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

const DAILY_GOAL = 2000; // ml

export default function Water() {
  const { water, setWater } = useAppContext();
  const [customAmount, setCustomAmount] = useState("");
  const [focused, setFocused] = useState(false);

  const progress = Math.min(water / DAILY_GOAL, 1);
  const glasses = Math.round(water / 250);
  const progressPercent = Math.round(progress * 100);

  const addWater = (amount: number) => {
    setWater((prev: number) => {
      const newAmount = Math.min(prev + amount, DAILY_GOAL);
      if (newAmount === DAILY_GOAL) {
        Alert.alert("🎉 Goal reached!", "You hit your daily water goal!");
      }
      return newAmount;
    });
  };

  const addCustomWater = () => {
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount > 0) {
      addWater(amount);
      setCustomAmount("");
    } else {
      Alert.alert("Invalid amount", "Please enter a valid number");
    }
  };

  const saveWaterToBackend = async () => {
    try {
      const response = await api.post("/api/water/add/", {
        glasses_count: Math.round(water / 250),
      });

      if (response.ok) {
        Alert.alert("Success", "Water intake saved!");
      } else {
        const data = await response.json();
        Alert.alert("Error", data.detail || "Failed to save water");
      }
    } catch {
      Alert.alert("Error", "Could not connect to server");
    }
  };

  const getProgressColor = () => {
    if (progress >= 1) return "#34c77b";
    if (progress >= 0.6) return THEME.primary;
    if (progress >= 0.3) return "#70c8f0";
    return THEME.primaryMid;
  };

  const getStatusMessage = () => {
    if (progress >= 1) return "Daily goal reached! 🎉";
    if (progress >= 0.75) return "Almost there, keep going!";
    if (progress >= 0.5) return "Halfway through, great job!";
    if (progress >= 0.25) return "Good start, keep drinking!";
    return "Let's start hydrating! 💧";
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <View style={styles.card}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>💧</Text>
        </View>

        <Text style={styles.title}>Water Intake</Text>
        <Text style={styles.subtitle}>{getStatusMessage()}</Text>

        {/* Progress ring display */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercent}%` as any,
                  backgroundColor: getProgressColor(),
                },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLeft}>{water} ml</Text>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
            <Text style={styles.progressRight}>{DAILY_GOAL} ml</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{glasses}</Text>
            <Text style={styles.statLabel}>Glasses</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{DAILY_GOAL - water > 0 ? DAILY_GOAL - water : 0}</Text>
            <Text style={styles.statLabel}>ml left</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{progressPercent}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>

        {/* Quick add buttons */}
        <Text style={styles.label}>Quick Add</Text>
        <View style={styles.quickRow}>
          {[250, 500, 750].map((amount) => (
            <TouchableOpacity
              key={amount}
              style={styles.quickBtn}
              onPress={() => addWater(amount)}
              activeOpacity={0.8}
            >
              <Text style={styles.quickBtnEmoji}>💧</Text>
              <Text style={styles.quickBtnText}>+{amount}</Text>
              <Text style={styles.quickBtnUnit}>ml</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom amount */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Custom Amount</Text>
          <View style={[styles.inputContainer, focused && styles.inputFocused]}>
            <Text style={styles.inputIcon}>🥤</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount in ml"
              placeholderTextColor={THEME.primaryMid}
              keyboardType="numeric"
              value={customAmount}
              onChangeText={setCustomAmount}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            <Text style={styles.unit}>ml</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={addCustomWater}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>Add Water</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={saveWaterToBackend}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>💾  Save to Profile</Text>
        </TouchableOpacity>
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
    width: "88%", maxWidth: 420,
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
  subtitle: { fontSize: 14, color: THEME.textLight, marginBottom: 20 },

  // Progress bar
  progressContainer: { width: "100%", marginBottom: 20 },
  progressTrack: {
    width: "100%", height: 14, borderRadius: 7,
    backgroundColor: THEME.primaryLight,
    borderWidth: 1, borderColor: THEME.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%", borderRadius: 7,
    minWidth: 8,
  },
  progressLabels: {
    flexDirection: "row", justifyContent: "space-between",
    marginTop: 6,
  },
  progressLeft: { fontSize: 12, color: THEME.textLight, fontWeight: "600" },
  progressPercent: { fontSize: 12, color: THEME.primary, fontWeight: "700" },
  progressRight: { fontSize: 12, color: THEME.textLight, fontWeight: "600" },

  // Stats
  statsRow: {
    flexDirection: "row", width: "100%",
    backgroundColor: THEME.primaryLight,
    borderRadius: 14, padding: 14,
    marginBottom: 22,
    borderWidth: 1, borderColor: THEME.border,
  },
  statBox: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800", color: THEME.text },
  statLabel: { fontSize: 11, color: THEME.textLight, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: THEME.border, marginHorizontal: 8 },

  // Quick add
  label: {
    fontSize: 13, fontWeight: "600",
    color: THEME.text, marginBottom: 10,
    alignSelf: "flex-start", marginLeft: 2,
  },
  quickRow: {
    flexDirection: "row", gap: 10, marginBottom: 20, width: "100%",
  },
  quickBtn: {
    flex: 1, backgroundColor: THEME.primaryLight,
    borderRadius: 14, paddingVertical: 12,
    alignItems: "center", borderWidth: 1.5,
    borderColor: THEME.border,
  },
  quickBtnEmoji: { fontSize: 18, marginBottom: 2 },
  quickBtnText: { fontSize: 14, fontWeight: "700", color: THEME.primary },
  quickBtnUnit: { fontSize: 10, color: THEME.textLight, marginTop: 1 },

  // Custom input
  inputWrapper: { width: "100%", marginBottom: 14 },
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

  // Buttons
  addBtn: {
    width: "100%", backgroundColor: THEME.primaryMid,
    borderRadius: 12, height: 48,
    justifyContent: "center", alignItems: "center",
    marginBottom: 10,
    borderWidth: 1, borderColor: THEME.primaryDark + "44",
  },
  addBtnText: { color: THEME.primaryDark, fontSize: 15, fontWeight: "700" },
  saveBtn: {
    width: "100%", backgroundColor: THEME.primary,
    borderRadius: 12, height: 50,
    justifyContent: "center", alignItems: "center",
    shadowColor: THEME.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
});
