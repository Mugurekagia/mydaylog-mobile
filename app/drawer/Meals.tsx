import { useState } from "react";
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


type MealType = "breakfast" | "lunch" | "dinner" | "snack";

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

const MEAL_OPTIONS: { value: MealType; label: string; emoji: string }[] = [
  { value: "breakfast", label: "Breakfast", emoji: "🌅" },
  { value: "lunch",     label: "Lunch",     emoji: "☀️" },
  { value: "dinner",    label: "Dinner",    emoji: "🌙" },
  { value: "snack",     label: "Snack",     emoji: "🍎" },
];

export default function MealScreen() {
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [description, setDescription] = useState<string>("");
  const [descFocused, setDescFocused] = useState(false);
  const [saved, setSaved] = useState(false);
  const { logStreak } = useAppContext();

  const selectedMeal = MEAL_OPTIONS.find((m) => m.value === mealType)!;

  const handleSave = async (): Promise<void> => {
    if (!description.trim()) {
      Alert.alert("Error", "Please enter a description for your meal.");
      return;
    }

    try {
      const response = await api.post("/api/meals/add/", {
        meal_type: mealType,
        description,
      });
      const data = await response.json();

      if (response.ok) {
        logStreak("meals"); 
        setSaved(true);
        Alert.alert("Success", "Meal saved!");
        setDescription("");
        setMealType("breakfast");
        setTimeout(() => setSaved(false), 3000);
      } else {
        Alert.alert("Error", data.detail || "Could not save meal.");
      }
    } catch {
      Alert.alert("Error", "Could not connect to server.");
    }
  };

  const handleCancel = (): void => {
    setMealType("breakfast");
    setDescription("");
    setSaved(false);
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
          {/* Icon */}
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>{selectedMeal.emoji}</Text>
          </View>

          <Text style={styles.title}>Meal Tracker</Text>
          <Text style={styles.subtitle}>Log what you ate</Text>

          {/* Meal type chips */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Meal Type</Text>
            <View style={styles.mealChipsRow}>
              {MEAL_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.mealChip,
                    mealType === opt.value && styles.mealChipActive,
                  ]}
                  onPress={() => setMealType(opt.value)}
                >
                  <Text style={styles.mealChipEmoji}>{opt.emoji}</Text>
                  <Text
                    style={[
                      styles.mealChipLabel,
                      mealType === opt.value && styles.mealChipLabelActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>What did you eat?</Text>
            <View style={[styles.textAreaContainer, descFocused && styles.inputFocused]}>
              <TextInput
                style={styles.textArea}
                placeholder="e.g. Oatmeal with berries and honey..."
                placeholderTextColor={THEME.primaryMid}
                value={description}
                onChangeText={setDescription}
                onFocus={() => setDescFocused(true)}
                onBlur={() => setDescFocused(false)}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>Save Meal</Text>
            </TouchableOpacity>
          </View>

          {saved && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>✅ Meal logged!</Text>
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
  subtitle: { fontSize: 14, color: THEME.textLight, marginBottom: 24 },
  inputWrapper: { width: "100%", marginBottom: 20 },
  label: {
    fontSize: 13, fontWeight: "600",
    color: THEME.text, marginBottom: 10, marginLeft: 2,
  },
  mealChipsRow: {
    flexDirection: "row", justifyContent: "space-between", gap: 8,
  },
  mealChip: {
    flex: 1, paddingVertical: 12,
    borderRadius: 14, borderWidth: 1.5,
    borderColor: THEME.border, backgroundColor: THEME.primaryLight,
    alignItems: "center",
  },
  mealChipActive: {
    backgroundColor: THEME.primary, borderColor: THEME.primary,
  },
  mealChipEmoji: { fontSize: 20, marginBottom: 4 },
  mealChipLabel: { fontSize: 11, fontWeight: "600", color: THEME.textLight },
  mealChipLabelActive: { color: "#fff" },
  textAreaContainer: {
    borderWidth: 1.5, borderColor: THEME.border,
    borderRadius: 12, backgroundColor: "#f5fbff",
    padding: 12, minHeight: 110,
  },
  inputFocused: {
    borderColor: THEME.primary, backgroundColor: "#fff",
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 3,
  },
  textArea: {
    fontSize: 15, color: THEME.text,
    textAlignVertical: "top", minHeight: 90,
  },
  buttonsRow: {
    flexDirection: "row", gap: 12, width: "100%",
  },
  cancelBtn: {
    flex: 1, height: 50,
    borderRadius: 12, borderWidth: 1.5,
    borderColor: THEME.border,
    justifyContent: "center", alignItems: "center",
  },
  cancelBtnText: { color: THEME.textLight, fontSize: 15, fontWeight: "600" },
  saveBtn: {
    flex: 2, height: 50,
    backgroundColor: THEME.primary, borderRadius: 12,
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
