import React from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

export default function AdminTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isAdmin, isLoading, adminName, adminEmail, logout } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Admin</Text>
      </View>

      <View style={[styles.body, { paddingBottom: botPad + 90 }]}>
        {isAdmin ? (
          <>
            <View style={[styles.profileCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Feather name="user" size={28} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.foreground }]}>{adminName}</Text>
                <Text style={[styles.email, { color: colors.mutedForeground }]}>{adminEmail}</Text>
              </View>
            </View>

            <Pressable
              onPress={() => router.push("/admin/dashboard")}
              style={({ pressed }) => [styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#EBF5FF" }]}>
                <Feather name="grid" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.foreground }]}>Dashboard</Text>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>

            <Pressable
              onPress={() => router.push("/admin/series")}
              style={({ pressed }) => [styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#E8F5E9" }]}>
                <Feather name="layers" size={20} color="#2E7D32" />
              </View>
              <Text style={[styles.menuLabel, { color: colors.foreground }]}>Manage Content</Text>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>

            <Pressable
              onPress={async () => { await logout(); }}
              style={({ pressed }) => [styles.menuItem, { backgroundColor: "#FFF5F5", borderColor: "#FFCDD2", opacity: pressed ? 0.8 : 1 }]}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#FFEBEE" }]}>
                <Feather name="log-out" size={20} color={colors.destructive} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.destructive }]}>Sign Out</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={[styles.lockCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <View style={[styles.lockIcon, { backgroundColor: colors.primary }]}>
                <Feather name="lock" size={32} color="#fff" />
              </View>
              <Text style={[styles.lockTitle, { color: colors.foreground }]}>Admin Access</Text>
              <Text style={[styles.lockSub, { color: colors.mutedForeground }]}>
                Sign in as an administrator to manage series, classes, and content.
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/admin/login")}
              style={({ pressed }) => [styles.loginBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 }]}
            >
              <Feather name="log-in" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.loginBtnText}>Sign In as Admin</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  body: { flex: 1, padding: 16, gap: 12 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 14,
    marginBottom: 4,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 16, fontFamily: "Inter_700Bold" },
  email: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  lockCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  lockIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  lockTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  lockSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    padding: 16,
  },
  loginBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
