import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

type ContentType = "video" | "pdf" | "worksheet" | "answer_key";

interface ContentCardProps {
  type: ContentType;
  title: string;
  description?: string | null;
  duration?: string | null;
  questionCount?: number;
  onPress: () => void;
}

const TYPE_CONFIG: Record<ContentType, { icon: string; label: string; bg: string; fg: string }> = {
  video: { icon: "play-circle", label: "Video", bg: "#FFF3E0", fg: "#E65100" },
  pdf: { icon: "book", label: "Book / PDF", bg: "#E3F2FD", fg: "#1565C0" },
  worksheet: { icon: "edit-3", label: "Worksheet", bg: "#E8F5E9", fg: "#2E7D32" },
  answer_key: { icon: "check-circle", label: "Answer Key", bg: "#F3E5F5", fg: "#6A1B9A" },
};

export function ContentCard({ type, title, description, duration, questionCount, onPress }: ContentCardProps) {
  const colors = useColors();
  const cfg = TYPE_CONFIG[type];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: colors.card, opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
        <Feather name={cfg.icon as keyof typeof Feather.glyphMap} size={22} color={cfg.fg} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>{title}</Text>
        {description ? (
          <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={1}>{description}</Text>
        ) : null}
        <View style={styles.meta}>
          <View style={[styles.tag, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.tagText, { color: cfg.fg }]}>{cfg.label}</Text>
          </View>
          {duration ? <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{duration}</Text> : null}
          {type === "worksheet" && questionCount !== undefined ? (
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{questionCount} Qs</Text>
          ) : null}
        </View>
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  body: { flex: 1 },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 3,
  },
  desc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 6,
  },
  meta: { flexDirection: "row", alignItems: "center", gap: 8 },
  tag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  metaText: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
