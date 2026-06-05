import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useListSeries } from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";
import { SeriesCard } from "@/components/SeriesCard";
import { EmptyState } from "@/components/EmptyState";

export default function BrowseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  const { data: series, isLoading, isError, refetch } = useListSeries(
    search ? { search } : undefined
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.logo, { color: colors.primary }]}>EduPress</Text>
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>Your Learning Companion</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.secondary, marginHorizontal: 16, marginVertical: 12, borderColor: colors.border }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search subjects..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { color: colors.foreground }]}
        />
        {search.length > 0 && (
          <Feather
            name="x"
            size={16}
            color={colors.mutedForeground}
            onPress={() => setSearch("")}
          />
        )}
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <EmptyState
            icon="wifi-off"
            title="Couldn't load subjects"
            subtitle="Check your connection and try again"
          />
        </View>
      ) : (
        <FlatList
          data={series}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={[styles.grid, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 90 }]}
          renderItem={({ item }) => (
            <SeriesCard
              name={item.name}
              description={item.description}
              color={item.color}
              classCount={item.classCount ?? 0}
              onPress={() => router.push(`/series/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <EmptyState icon="book" title="No subjects found" subtitle="Try a different search" />
          }
          onRefresh={refetch}
          refreshing={isLoading}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  logo: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  grid: {
    padding: 10,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
