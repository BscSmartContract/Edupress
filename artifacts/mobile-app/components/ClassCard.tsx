import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface ClassCardProps {
  label: string;
  contentCount: number;
  accentColor?: string | null;
  onPress: () => void;
}

export function ClassCard({ label, contentCount, accentColor, onPress }: ClassCardProps) {
  const colors = useColors();
  const accent = accentColor ?? colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: colors.card, opacity: pressed ? 0.85 : 1, borderLeftColor: accent }]}
    >
      <View style={styles.content}>
        <View style={[styles.dot, { backgroundColor: accent }]} />
        <View style={styles.textGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            {contentCount} {contentCount === 1 ? "item" : "items"}
          </Text>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 5,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  textGroup: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  sub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
