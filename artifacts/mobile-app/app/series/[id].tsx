import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useGetSeries, useListClasses } from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";
import { ClassCard } from "@/components/ClassCard";
import { EmptyState } from "@/components/EmptyState";

export default function SeriesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const seriesId = parseInt(id ?? "0");
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { data: series, isLoading: loadingSeries } = useGetSeries(seriesId);
  const { data: classes, isLoading: loadingClasses, refetch } = useListClasses(seriesId);

  const isLoading = loadingSeries || loadingClasses;
  const color = series?.color ?? colors.primary;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero Header */}
      <View style={[styles.hero, { backgroundColor: color, paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        {isLoading ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 12 }} />
        ) : (
          <>
            <Text style={styles.heroTitle}>{series?.name ?? "Series"}</Text>
            {series?.description ? (
              <Text style={styles.heroSub}>{series.description}</Text>
            ) : null}
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                {classes?.length ?? 0} {(classes?.length ?? 0) === 1 ? "class" : "classes"}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Class List */}
      <FlatList
        data={classes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.list, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 16 }]}
        renderItem={({ item }) => (
          <ClassCard
            label={item.label}
            contentCount={item.contentCount ?? 0}
            accentColor={color}
            onPress={() => router.push(`/class/${item.id}`)}
          />
        )}
        ListHeaderComponent={
          classes && classes.length > 0 ? (
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Select a Class</Text>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState icon="layers" title="No classes yet" subtitle="Classes will appear here once added" />
          ) : null
        }
        onRefresh={refetch}
        refreshing={!!loadingClasses}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    marginBottom: 12,
    lineHeight: 18,
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  heroBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  list: { paddingTop: 8 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 6,
  },
});
