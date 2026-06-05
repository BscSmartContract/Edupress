import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface SeriesCardProps {
  name: string;
  description?: string | null;
  color?: string | null;
  classCount: number;
  onPress: () => void;
}

const SUBJECT_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  Science: "zap",
  Mathematics: "hash",
  "Hindi Vyakaran": "type",
  "Hindi Literature": "feather",
  "Nursery Series": "star",
  English: "globe",
  "Social Studies": "map",
};

export function SeriesCard({ name, description, color, classCount, onPress }: SeriesCardProps) {
  const bgColor = color ?? "#1E90FF";
  const iconName = SUBJECT_ICONS[name] ?? "book-open";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: bgColor, opacity: pressed ? 0.88 : 1 }]}
    >
      <View style={styles.iconWrapper}>
        <Feather name={iconName} size={26} color="rgba(255,255,255,0.9)" />
      </View>
      <Text style={styles.name} numberOfLines={2}>{name}</Text>
      {description ? (
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
      ) : null}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{classCount} {classCount === 1 ? "class" : "classes"}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    padding: 16,
    minHeight: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  description: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 10,
    lineHeight: 15,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: "auto",
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});
