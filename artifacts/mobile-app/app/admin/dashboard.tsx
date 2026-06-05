import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useGetDashboardStats } from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: keyof typeof Feather.glyphMap; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { adminName, logout } = useAuth();
  const { data: stats, isLoading, refetch } = useGetDashboardStats();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Dashboard</Text>
          {adminName ? (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Welcome, {adminName}</Text>
          ) : null}
        </View>
        <Pressable
          onPress={async () => { await logout(); router.replace("/"); }}
          style={[styles.logoutBtn, { borderColor: colors.border }]}
        >
          <Feather name="log-out" size={16} color={colors.destructive} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: botPad + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <>
            {/* Stats Grid */}
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Overview</Text>
            <View style={styles.statsGrid}>
              <StatCard label="Series" value={stats?.totalSeries ?? 0} icon="layers" color="#1E90FF" />
              <StatCard label="Classes" value={stats?.totalClasses ?? 0} icon="users" color="#4CAF50" />
              <StatCard label="Videos" value={stats?.totalVideos ?? 0} icon="play-circle" color="#E65100" />
              <StatCard label="Books" value={stats?.totalPdfs ?? 0} icon="book" color="#1565C0" />
              <StatCard label="Worksheets" value={stats?.totalWorksheets ?? 0} icon="edit-3" color="#2E7D32" />
              <StatCard label="Answer Keys" value={stats?.totalAnswerKeys ?? 0} icon="check-circle" color="#6A1B9A" />
            </View>

            {/* Quick Actions */}
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Manage</Text>
            <View style={{ paddingHorizontal: 16, gap: 10 }}>
              <Pressable
                onPress={() => router.push("/admin/series")}
                style={({ pressed }) => [styles.actionItem, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
              >
                <View style={[styles.actionIcon, { backgroundColor: "#EBF5FF" }]}>
                  <Feather name="layers" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionTitle, { color: colors.foreground }]}>Series & Classes</Text>
                  <Text style={[styles.actionSub, { color: colors.mutedForeground }]}>
                    {stats?.totalSeries ?? 0} series, {stats?.totalClasses ?? 0} classes
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
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
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 8,
  },
  statCard: {
    width: "30%",
    flexGrow: 1,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
    minWidth: 90,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  actionSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
});
