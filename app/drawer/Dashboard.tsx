import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { useAppContext } from "../../context/AppContext";
import { api } from "../../utils/api";

const screenWidth = Dimensions.get("window").width;

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

export default function Dashboard() {
  const { mood: globalMood, theme } = useAppContext();
  const router = useRouter();
  const today = new Date().toDateString();

  const [water, setWater] = useState(0);
  const [steps, setSteps] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        if (storedUsername) setUsername(storedUsername);

        const waterData = await (await api.get("/api/water/")).json();
        setWater(Number(waterData[0]?.glasses_count || 0));

        const stepsData = await (await api.get("/api/steps/")).json();
        setSteps(Number(stepsData[0]?.steps || 0));

        try {
          const sleepData = await (await api.get("/api/sleep/")).json();
          setSleep(Number(sleepData[0]?.hours_slept || 0));
        } catch {
          console.log("Sleep endpoint not available");
        }
      } catch (err) {
        console.log("Error fetching dashboard data:", err);
        Alert.alert("Error", "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const moodMap: Record<string, number> = {
    happy: 5,
    neutral: 3,
    sad: 1,
    stressed: 2,
    energetic: 4,
  };

  const moodValue: number = globalMood ? moodMap[globalMood.type] ?? 0 : 0;

  const chartData = {
    labels: ["Water", "Steps", "Sleep", "Mood"],
    datasets: [{ data: [water, steps, sleep, moodValue] }],
  };

  const isDarkMode = theme === "dark";
  const backgroundColor = isDarkMode ? "#1A2A35" : THEME.primaryLight;
  const cardBackground = isDarkMode ? "#1e3444" : THEME.card;
  const textColor = isDarkMode ? "#e8f4fd" : THEME.text;
  const subtextColor = isDarkMode ? "#90b8cc" : THEME.textLight;
  const chartBg = isDarkMode ? "#1e3444" : THEME.card;

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message:
          "Check out this amazing health tracking app! 🏃‍♀️💧😴\n\nTrack your water intake, steps, sleep, mood, and more!\n\nDownload now and start your wellness journey!",
        title: "Share Health Tracker App",
      });
      if (result.action === Share.sharedAction && result.activityType) {
        Alert.alert("Success", "Shared successfully!");
      }
    } catch {
      Alert.alert("Error", "Failed to share the app");
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={[styles.loadingText, { color: THEME.textLight }]}>
            Loading dashboard...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Decorative blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.screenTitle, { color: textColor }]}>
            Dashboard
          </Text>
          <Text style={[styles.date, { color: subtextColor }]}>{today}</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {(username || "?")[0].toUpperCase()}
          </Text>
        </View>
      </View>

      {/* ── Greeting banner ── */}
      <View style={[styles.greetingBanner, { backgroundColor: THEME.primaryMid }]}>
        <Text style={styles.greetingText}>
          Hi {username || "there"} 👋
        </Text>
        <Text style={styles.greetingSubtext}>Here's how you're doing today</Text>
      </View>

      {/* ── Stats Row ── */}
      <View style={styles.statsRow}>
        {[
          { label: "💧 Water", value: `${water}`, unit: "glasses" },
          { label: "👟 Steps", value: `${steps}`, unit: "steps" },
          { label: "😴 Sleep", value: `${sleep}`, unit: "hours" },
        ].map((stat, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: cardBackground }]}>
            <Text style={[styles.statLabel, { color: subtextColor }]}>{stat.label}</Text>
            <Text style={[styles.statValue, { color: textColor }]}>{stat.value}</Text>
            <Text style={[styles.statUnit, { color: subtextColor }]}>{stat.unit}</Text>
          </View>
        ))}
      </View>

      {/* ── Chart Card ── */}
      <View style={[styles.chartCard, { backgroundColor: cardBackground }]}>
        {/* Today's Summary header */}
        <View style={styles.summaryHeader}>
          <View style={styles.summaryAccent} />
          <Text style={[styles.summaryTitle, { color: textColor }]}>
            Today's Summary
          </Text>
        </View>

        {/* Centered chart */}
        <View style={styles.chartWrapper}>
          <BarChart
            data={chartData}
            width={screenWidth - 80}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero
            showValuesOnTopOfBars
            chartConfig={{
              backgroundColor: chartBg,
              backgroundGradientFrom: chartBg,
              backgroundGradientTo: chartBg,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(58, 173, 224, ${opacity})`,
              labelColor: (opacity = 1) =>
                isDarkMode
                  ? `rgba(200, 230, 247, ${opacity})`
                  : `rgba(26, 58, 74, ${opacity})`,
              barPercentage: 0.6,
              style: { borderRadius: 16 },
            }}
            style={{ borderRadius: 16 }}
          />
        </View>
      </View>

      {/* ── Action Buttons ── */}
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: cardBackground }]}
        onPress={() => router.push("./Settings")}
        activeOpacity={0.8}
      >
        <View style={styles.actionIconWrap}>
          <Ionicons name="settings" size={20} color={THEME.primary} />
        </View>
        <Text style={[styles.actionButtonText, { color: textColor }]}>Settings</Text>
        <Ionicons name="chevron-forward" size={20} color={subtextColor} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.shareButton}
        onPress={handleShare}
        activeOpacity={0.85}
      >
        <Ionicons name="share-social" size={20} color="#fff" />
        <Text style={styles.shareButtonText}>Share App with Friends</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
  },
  blobTop: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: THEME.primaryMid,
    opacity: 0.35,
  },
  blobBottom: {
    position: "absolute",
    bottom: 100,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: THEME.primaryMid,
    opacity: 0.2,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  date: {
    fontSize: 13,
    marginTop: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: THEME.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  // Greeting
  greetingBanner: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.text,
  },
  greetingSubtext: {
    fontSize: 13,
    color: THEME.textLight,
    marginTop: 2,
  },

  // Stats row
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  statUnit: {
    fontSize: 10,
    marginTop: 2,
  },

  // Chart card
  chartCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    alignItems: "center",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  summaryAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: THEME.primary,
    marginRight: 8,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  chartWrapper: {
    alignItems: "center",
    width: "100%",
  },

  // Buttons
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 14,
    backgroundColor: THEME.primary,
    shadowColor: THEME.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: {
    backgroundColor: THEME.card,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
  },
});
