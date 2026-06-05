import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="series" />
      <Stack.Screen name="series/[id]" />
      <Stack.Screen name="class/[id]" />
      <Stack.Screen name="content/[id]" />
    </Stack>
  );
}
