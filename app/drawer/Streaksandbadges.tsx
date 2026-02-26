import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Streaks, useAppContext } from "../../context/AppContext";

const { width } = Dimensions.get("window");

const today = () => new Date().toISOString().split("T")[0];
const isLoggedToday = (dateStr: string | null) => dateStr === today();

const BADGE_DEFINITIONS = [
  { milestone: 3,  label: "3-Day Streak",   emoji: "🌱", desc: "3 days in a row" },
  { milestone: 7,  label: "Week Warrior",   emoji: "🔥", desc: "7 days in a row" },
  { milestone: 14, label: "Fortnight Fire", emoji: "⚡", desc: "14 days in a row" },
  { milestone: 30, label: "Monthly Master", emoji: "🏆", desc: "30 days in a row" },
  { milestone: 60, label: "Diamond Mind",   emoji: "💎", desc: "60 days in a row" },
];

const FEATURE_META: Record<keyof Streaks, { label: string; emoji: string; color: string }> = {
  steps: { label: "Steps",  emoji: "👟", color: "#3aade0" },
  water: { label: "Water",  emoji: "💧", color: "#22c55e" },
  mood:  { label: "Mood",   emoji: "😊", color: "#f59e0b" },
  meals: { label: "Meals",  emoji: "🥗", color: "#ec4899" },
};

function StreakCard({ featureKey, index }: { featureKey: keyof Streaks; index: number }) {
  const { streaks } = useAppContext();
  const info = streaks[featureKey];
  const meta = FEATURE_META[featureKey];

  const anim = useRef(new Animated.Value(0)).current;
  const flameAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 400, delay: index * 100, useNativeDriver: true }).start();
    if (info.current > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(flameAnim, { toValue: 1,    duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  const logged = isLoggedToday(info.lastLoggedDate);
  const weekDots = info.current % 7 || (info.current > 0 ? 7 : 0);

  return (
    <Animated.View
      style={[
        styles.streakCard,
        { borderLeftColor: meta.color, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0,1], outputRange: [20,0] }) }] },
      ]}
    >
      <View style={styles.streakTop}>
        <View style={[styles.emojiCircle, { backgroundColor: meta.color + "22" }]}>
          <Text style={styles.streakEmoji}>{meta.emoji}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.streakLabel}>{meta.label}</Text>
          <Text style={styles.streakSub}>Best: {info.best} days</Text>
        </View>
        <View style={[styles.loggedBadge, { backgroundColor: logged ? "#22c55e22" : "#f3f4f6" }]}>
          <Text style={[styles.loggedText, { color: logged ? "#22c55e" : "#9ca3af" }]}>
            {logged ? "✓ Logged" : "Not yet"}
          </Text>
        </View>
      </View>

      <View style={styles.streakBottom}>
        <Animated.Text style={[styles.streakCount, { color: meta.color, transform: [{ scale: flameAnim }] }]}>
          {info.current}
        </Animated.Text>
        <Text style={styles.streakDaysLabel}>day streak 🔥</Text>
      </View>

      <View style={styles.dotsRow}>
        {Array.from({ length: 7 }).map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i < weekDots ? meta.color : "#e5e7eb" }]} />
        ))}
      </View>
    </Animated.View>
  );
}

function BadgeItem({ emoji, title, desc, unlocked, index }: { emoji: string; title: string; desc: string; unlocked: boolean; index: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 350, delay: index * 60, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.badgeItem,
        !unlocked && styles.badgeLocked,
        { opacity: anim, transform: [{ scale: anim.interpolate({ inputRange: [0,1], outputRange: [0.8,1] }) }] },
      ]}
    >
      <Text style={[styles.badgeEmoji, !unlocked && { opacity: 0.3 }]}>{emoji}</Text>
      <Text style={[styles.badgeTitle, !unlocked && styles.badgeLockedText]} numberOfLines={2}>{title}</Text>
      <Text style={styles.badgeDesc}>{desc}</Text>
      {!unlocked && <Text style={styles.lockIcon}>🔒</Text>}
    </Animated.View>
  );
}

export default function StreaksAndBadges() {
  const { streaks } = useAppContext();
  const [tab, setTab] = useState<"streaks" | "badges">("streaks");

  const featureKeys = Object.keys(FEATURE_META) as (keyof Streaks)[];
  const totalStreak = featureKeys.reduce((acc, k) => acc + streaks[k].current, 0);

  const allBadges = featureKeys.flatMap((k) =>
    BADGE_DEFINITIONS.map((b) => ({
      emoji: b.emoji,
      title: `${FEATURE_META[k].label} ${b.label}`,
      desc: `${FEATURE_META[k].label}: ${b.desc}`,
      unlocked: streaks[k].best >= b.milestone,
    }))
  );

  const unlockedCount = allBadges.filter((b) => b.unlocked).length;
  const sortedBadges = [...allBadges.filter((b) => b.unlocked), ...allBadges.filter((b) => !b.unlocked)];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Streaks & Badges</Text>
        <View style={styles.totalPill}>
          <Text style={styles.totalPillText}>🔥 {totalStreak} total days</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        {(["streaks", "badges"] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "streaks" ? "🔥 Streaks" : `🏅 Badges (${unlockedCount}/${allBadges.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {tab === "streaks" ? (
          <>
            <Text style={styles.sectionHint}>Log daily to keep your streak alive!</Text>
            {featureKeys.map((k, i) => <StreakCard key={k} featureKey={k} index={i} />)}
          </>
        ) : (
          <>
            <Text style={styles.sectionHint}>{unlockedCount} of {allBadges.length} badges unlocked</Text>
            <View style={styles.badgeGrid}>
              {sortedBadges.map((b, i) => <BadgeItem key={i} {...b} index={i} />)}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "#ffffff", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9", elevation: 2,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#0f172a", letterSpacing: -0.5 },
  totalPill: { backgroundColor: "#fff7ed", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#fed7aa" },
  totalPillText: { fontSize: 13, fontWeight: "700", color: "#ea580c" },
  tabRow: { flexDirection: "row", backgroundColor: "#ffffff", paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center", backgroundColor: "#f1f5f9" },
  tabActive: { backgroundColor: "#3aade0" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  tabTextActive: { color: "#ffffff" },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionHint: { fontSize: 13, color: "#94a3b8", marginBottom: 14, textAlign: "center" },
  streakCard: {
    backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 4,
    elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
  },
  streakTop: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  emojiCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  streakEmoji: { fontSize: 22 },
  streakLabel: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  streakSub: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  loggedBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  loggedText: { fontSize: 11, fontWeight: "700" },
  streakBottom: { flexDirection: "row", alignItems: "baseline", marginBottom: 12 },
  streakCount: { fontSize: 42, fontWeight: "900", letterSpacing: -1 },
  streakDaysLabel: { fontSize: 16, color: "#64748b", marginLeft: 8, fontWeight: "600" },
  dotsRow: { flexDirection: "row", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  badgeItem: {
    width: (width - 42) / 2, backgroundColor: "#ffffff", borderRadius: 16, padding: 16, alignItems: "center",
    elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
  },
  badgeLocked: { backgroundColor: "#f8fafc", elevation: 0 },
  badgeEmoji: { fontSize: 36, marginBottom: 8 },
  badgeTitle: { fontSize: 13, fontWeight: "700", color: "#0f172a", textAlign: "center", marginBottom: 4 },
  badgeLockedText: { color: "#cbd5e1" },
  badgeDesc: { fontSize: 11, color: "#94a3b8", textAlign: "center" },
  lockIcon: { fontSize: 14, marginTop: 6 },
});
