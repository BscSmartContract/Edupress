import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAdminLogin } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const loginMutation = useAdminLogin();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    try {
      const result = await loginMutation.mutateAsync({ data: { email: email.trim(), password } });
      await login(result.token, result.admin.name, result.admin.email);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/admin/dashboard");
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Login Failed", "Invalid email or password. Please try again.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: botPad + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
          <Feather name="shield" size={36} color="#fff" />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Admin Login</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Sign in to manage your content
        </Text>

        {/* Email */}
        <View style={[styles.inputGroup, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Feather name="mail" size={16} color={colors.mutedForeground} style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Admin email"
            placeholderTextColor={colors.mutedForeground}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={[styles.input, { color: colors.foreground }]}
          />
        </View>

        {/* Password */}
        <View style={[styles.inputGroup, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Feather name="lock" size={16} color={colors.mutedForeground} style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Password"
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPw}
            autoCapitalize="none"
            style={[styles.input, { color: colors.foreground }]}
          />
          <Pressable onPress={() => setShowPw((v) => !v)}>
            <Feather name={showPw ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Hint */}
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Default: admin@edupress.com / Admin@123
        </Text>

        {/* Login Button */}
        <Pressable
          onPress={handleLogin}
          disabled={loginMutation.isPending}
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: colors.primary, opacity: pressed || loginMutation.isPending ? 0.8 : 1 },
          ]}
        >
          {loginMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="log-in" size={18} color="#fff" />
              <Text style={styles.btnText}>Sign In</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingBottom: 8 },
  back: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 24, alignItems: "center" },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 16,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 6 },
  sub: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 28, textAlign: "center" },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    width: "100%",
    marginBottom: 12,
  },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  hint: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 20, textAlign: "center" },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    padding: 16,
    width: "100%",
    gap: 10,
    marginTop: 8,
  },
  btnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
