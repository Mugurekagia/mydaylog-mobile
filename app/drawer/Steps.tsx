import { Pedometer } from "expo-sensors";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  AppState,
  Button,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { COLORS, SPACING } from "../../constants/theme";
import { useAppContext } from "../../context/AppContext";
import { api } from "../../utils/api";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const screenWidth = Dimensions.get("window").width;

export default function Steps() {
  const { steps: globalSteps, setSteps: setGlobalSteps } = useAppContext();

  const [steps, setSteps] = useState<number>(globalSteps || 0);
  const [target, setTarget] = useState<number>(10000);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<string>("checking");

  const animatedProgress = useRef(new Animated.Value(0)).current;

  const circleRadius = 100;
  const strokeWidth = 15;
  const circumference = 2 * Math.PI * circleRadius;

  /* ---------- Animation ---------- */
  useEffect(() => {
    const progress = Math.min(steps / target, 1);
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [steps, target]);

  /* ---------- Fetch today's steps ---------- */
  const fetchTodaySteps = async () => {
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const result = await Pedometer.getStepCountAsync(start, end);
    setSteps(result.steps);
    setGlobalSteps && setGlobalSteps(result.steps);
  };

  /* ---------- Pedometer ---------- */
  useEffect(() => {
    Pedometer.isAvailableAsync().then(
      (result) => setIsPedometerAvailable(String(result)),
      () => setIsPedometerAvailable("not available")
    );

    // Get full today count on mount
    fetchTodaySteps();

    // Watch for live incremental updates
    let baseSteps = 0;
    Pedometer.getStepCountAsync(
      new Date(new Date().setHours(0, 0, 0, 0)),
      new Date()
    ).then((r) => { baseSteps = r.steps; });

    const subscription = Pedometer.watchStepCount((result) => {
      const total = baseSteps + result.steps;
      setSteps(total);
      setGlobalSteps && setGlobalSteps(total);
    });

    // Refresh when app comes back to foreground
    const appStateListener = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        fetchTodaySteps();
      }
    });

    return () => {
      subscription && subscription.remove();
      appStateListener.remove();
    };
  }, []);

  /* ---------- Backend Save ---------- */
  const saveStepsToBackend = async () => {
    try {
      const response = await api.post("/api/steps/", { steps, target });
      if (response.ok) {
        Alert.alert("Success", "Steps saved successfully");
      } else {
        const data = await response.json();
        Alert.alert("Error", data.detail || "Failed to save steps");
      }
    } catch (error) {
      Alert.alert("Error", "Could not connect to server");
    }
  };

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Steps</Text>
      <Text style={styles.availability}>
        Pedometer: {isPedometerAvailable}
      </Text>

      <View style={styles.circleContainer}>
        <Svg
          width={circleRadius * 2 + strokeWidth}
          height={circleRadius * 2 + strokeWidth}
        >
          <Circle
            stroke="#ccc"
            fill="none"
            cx={circleRadius + strokeWidth / 2}
            cy={circleRadius + strokeWidth / 2}
            r={circleRadius}
            strokeWidth={strokeWidth}
          />
          <AnimatedCircle
            stroke={COLORS.light.tint}
            fill="none"
            cx={circleRadius + strokeWidth / 2}
            cy={circleRadius + strokeWidth / 2}
            r={circleRadius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset as any}
            strokeLinecap="round"
            rotation="-90"
            originX={circleRadius + strokeWidth / 2}
            originY={circleRadius + strokeWidth / 2}
          />
        </Svg>

        <View style={styles.stepsTextContainer}>
          <Text style={styles.stepsText}>{steps}</Text>
          <Text style={styles.targetText}>/ {target} steps</Text>
        </View>
      </View>

      <View style={styles.targetInputContainer}>
        <Text style={styles.label}>Daily Target</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(target)}
          onChangeText={(v) => setTarget(parseInt(v) || 0)}
        />
        <Button
          title="Save Steps"
          onPress={saveStepsToBackend}
          color={COLORS.light.tint}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.light.text,
  },
  availability: {
    color: "#6B7280",
    marginBottom: SPACING.lg,
  },
  circleContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  stepsTextContainer: {
    position: "absolute",
    alignItems: "center",
  },
  stepsText: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.light.tint,
  },
  targetText: {
    color: "#6B7280",
  },
  targetInputContainer: {
    width: screenWidth > 700 ? 500 : "100%",
  },
  label: {
    color: COLORS.light.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: SPACING.sm,
    color: COLORS.light.text,
  },
});