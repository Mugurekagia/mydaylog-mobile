import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View, Switch, TouchableOpacity, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";

export default function Settings() {
  const { theme, setTheme, fontSize, setFontSize, language, setLanguage } = useAppContext();
  
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    setTheme(newTheme);
  };

  const fontSizes = [
    { label: "Small", value: "small" },
    { label: "Medium", value: "medium" },
    { label: "Large", value: "large" },
  ];

  const languages = [
    { label: "English", value: "en" },
    { label: "Spanish", value: "es" },
    { label: "French", value: "fr" },
    { label: "German", value: "de" },
  ];

  const backgroundColor = isDarkMode ? "#1A1A1A" : "#F5FBFF";
  const cardBackground = isDarkMode ? "#2A2A2A" : "#fff";
  const textColor = isDarkMode ? "#FFF" : "#111";
  const subtextColor = isDarkMode ? "#BBB" : "#555";

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Settings</Text>

      {/* Theme Section */}
      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon" size={24} color="#4CAF50" />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: textColor }]}>Dark Mode</Text>
              <Text style={[styles.settingSubtitle, { color: subtextColor }]}>
                Switch between light and dark theme
              </Text>
            </View>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: "#ccc", true: "#4CAF50" }}
            thumbColor={isDarkMode ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Font Size Section */}
      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        <View style={styles.settingColumn}>
          <View style={styles.settingLeft}>
            <Ionicons name="text" size={24} color="#4CAF50" />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: textColor }]}>Font Size</Text>
              <Text style={[styles.settingSubtitle, { color: subtextColor }]}>
                Adjust text size for better readability
              </Text>
            </View>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={fontSize}
              onValueChange={(itemValue) => setFontSize(itemValue)}
              style={[styles.picker, { color: textColor }]}
            >
              {fontSizes.map((size) => (
                <Picker.Item key={size.value} label={size.label} value={size.value} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {/* Language Section */}
      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        <View style={styles.settingColumn}>
          <View style={styles.settingLeft}>
            <Ionicons name="language" size={24} color="#4CAF50" />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: textColor }]}>Language</Text>
              <Text style={[styles.settingSubtitle, { color: subtextColor }]}>
                Choose your preferred language
              </Text>
            </View>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={language}
              onValueChange={(itemValue) => setLanguage(itemValue)}
              style={[styles.picker, { color: textColor }]}
            >
              {languages.map((lang) => (
                <Picker.Item key={lang.value} label={lang.label} value={lang.value} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {/* About Section */}
      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="information-circle" size={24} color="#4CAF50" />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: textColor }]}>About</Text>
              <Text style={[styles.settingSubtitle, { color: subtextColor }]}>
                Version 1.0.0
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={subtextColor} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingColumn: {
    flexDirection: "column",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
  },
  pickerContainer: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
});
