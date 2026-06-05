import React, { useState } from "react";
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
import { useGetClass, useListContent } from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";
import { ContentCard } from "@/components/ContentCard";
import { EmptyState } from "@/components/EmptyState";

type ContentTab = "all" | "video" | "pdf" | "worksheet" | "answer_key";

const TABS: { key: ContentTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "video", label: "Videos" },
  { key: "pdf", label: "Books" },
  { key: "worksheet", label: "Worksheets" },
  { key: "answer_key", label: "Answer Keys" },
];

export default function ClassScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const classId = parseInt(id ?? "0");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ContentTab>("all");

  const { data: cls, isLoading: loadingClass } = useGetClass(classId);
  const { data: allContent, isLoading: loadingContent, refetch } = useListContent(classId);

  const filtered = activeTab === "all" ? allContent : allContent?.filter((c) => c.type === activeTab);
  const isLoading = loadingClass || loadingContent;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          {cls ? (
            <>
              <Text style={[styles.classLabel, { color: colors.foreground }]}>{cls.label}</Text>
              {cls.seriesName ? (
                <Text style={[styles.seriesName, { color: colors.mutedForeground }]}>{cls.seriesName}</Text>
              ) : null}
            </>
          ) : isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : null}
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabBar, { borderBottomColor: colors.border }]}
        contentContainerStyle={{ paddingHorizontal: 12 }}
      >
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[
              styles.tab,
              activeTab === tab.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab.key ? colors.primary : colors.mutedForeground },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Content */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.list, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 16 }]}
          renderItem={({ item }) => (
            <ContentCard
              type={item.type as "video" | "pdf" | "worksheet" | "answer_key"}
              title={item.title}
              description={item.description}
              duration={item.duration}
              questionCount={item.questionCount ?? 0}
              onPress={() => router.push(`/content/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="folder"
              title="No content here"
              subtitle="Content will appear once the admin adds it"
            />
          }
          onRefresh={refetch}
          refreshing={!!loadingContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  back: { padding: 4 },
  classLabel: { fontSize: 18, fontFamily: "Inter_700Bold" },
  seriesName: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  tabBar: {
    borderBottomWidth: 1,
    maxHeight: 50,
    flexGrow: 0,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginHorizontal: 2,
  },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  list: { paddingTop: 8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
