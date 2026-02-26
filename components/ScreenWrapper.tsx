import { Dimensions, StyleSheet, View } from "react-native";
import { COLORS, SPACING } from "../constants/theme";

const { width } = Dimensions.get("window");

type Props = {
  children: React.ReactNode;
};

export default function ScreenWrapper({ children }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
    alignItems: "center",
  },
  content: {
    width: width > 700 ? 600 : "100%",
    padding: SPACING.md,
  },
});
