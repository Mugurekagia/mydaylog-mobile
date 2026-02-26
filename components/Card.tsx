import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../constants/theme";

type Props = {
  children: ReactNode;
};

export default function Card({ children }: Props) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.light.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
});

