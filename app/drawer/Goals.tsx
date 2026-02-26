import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "../../utils/api";

export default function Goals() {
  const [goalType, setGoalType] = useState<string>("weight management");
  const [targetValue, setTargetValue] = useState<string>("");
  const [unit, setUnit] = useState<string>("days");
  const [deadline, setDeadline] = useState<string>("");

  const handleSave = async () => {
    if (!targetValue || isNaN(parseInt(targetValue)) || parseInt(targetValue) <= 0) {
      Alert.alert("Invalid input", "Please enter a valid target value.");
      return;
    }
    if (!deadline) {
      Alert.alert("Missing deadline", "Please enter a deadline date.");
      return;
    }

    try {
      const response = await api.post("/api/goals/add/", {
        goal_type: goalType,
        target_value: parseFloat(targetValue),
        deadline: deadline,
      });

      if (response.ok) {
        Alert.alert("Success", "Goal saved successfully!");
        setTargetValue("");
        setDeadline("");
        setGoalType("weight management");
        setUnit("days");
      } else {
        const errorData = await response.json();
        Alert.alert("Error", JSON.stringify(errorData));
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not connect to server.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set a Goal</Text>

      <Text style={styles.label}>Goal Type:</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={goalType} onValueChange={setGoalType} style={styles.picker}>
          <Picker.Item label="Weight Management" value="weight management" />
          <Picker.Item label="Mental Health" value="mental health" />
          <Picker.Item label="Physical Fitness" value="physical fitness" />
          <Picker.Item label="Improved Sleep Schedule" value="improved sleep schedule" />
          <Picker.Item label="Social and Emotional Health" value="social and emotional health" />
        </Picker>
      </View>

      <Text style={styles.label}>Target Value:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="e.g. 5"
        placeholderTextColor="#888"
        value={targetValue}
        onChangeText={setTargetValue}
      />

      <Text style={styles.label}>Unit:</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={unit} onValueChange={setUnit} style={styles.picker}>
          <Picker.Item label="Days" value="days" />
          <Picker.Item label="Weeks" value="weeks" />
          <Picker.Item label="Months" value="months" />
        </Picker>
      </View>

      <Text style={styles.label}>Deadline Date (YYYY-MM-DD):</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 2026-03-01"
        placeholderTextColor="#888"
        value={deadline}
        onChangeText={setDeadline}
      />

      <View style={styles.buttonContainer}>
        <Button title="Save Goal" onPress={handleSave} color="#3CCF91" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#E6F7FF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: "#111",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#A0D8FF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
    color: "#111",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#A0D8FF",
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  picker: {
    color: "#111",
  },
  buttonContainer: {
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
});
