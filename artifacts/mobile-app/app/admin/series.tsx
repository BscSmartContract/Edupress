import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  useListSeries,
  useCreateSeries,
  useDeleteSeries,
} from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/useColors";
import { EmptyState } from "@/components/EmptyState";

const COLORS = ["#2196F3", "#4CAF50", "#FF9800", "#9C27B0", "#F44336", "#00BCD4", "#795548"];

export default function AdminSeriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", color: "#2196F3" });

  const { data: series, isLoading, refetch } = useListSeries();
  const createSeries = useCreateSeries();
  const deleteSeries = useDeleteSeries();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleCreate = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      Alert.alert("Error", "Name and slug are required");
      return;
    }
    try {
      await createSeries.mutateAsync({
        data: { name: form.name.trim(), slug: form.slug.trim(), description: form.description.trim() || undefined, color: form.color },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowModal(false);
      setForm({ name: "", slug: "", description: "", color: "#2196F3" });
      refetch();
    } catch {
      Alert.alert("Error", "Failed to create series");
    }
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert("Delete Series", `Delete "${name}" and all its content?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteSeries.mutateAsync({ seriesId: id });
          refetch();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Series</Text>
        <Pressable
          onPress={() => setShowModal(true)}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="plus" size={18} color="#fff" />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={series}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: botPad + 20 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/admin/series/${item.id}`)}
              style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: item.color ?? colors.primary }]}
            >
              <View style={styles.itemLeft}>
                <View style={[styles.dot, { backgroundColor: item.color ?? colors.primary }]} />
                <View>
                  <Text style={[styles.itemName, { color: colors.foreground }]}>{item.name}</Text>
                  <Text style={[styles.itemSub, { color: colors.mutedForeground }]}>
                    {item.classCount} {item.classCount === 1 ? "class" : "classes"}
                  </Text>
                </View>
              </View>
              <View style={styles.itemActions}>
                <Feather name="edit-2" size={16} color={colors.mutedForeground} style={{ marginRight: 12 }} />
                <Pressable onPress={() => handleDelete(item.id, item.name)}>
                  <Feather name="trash-2" size={16} color={colors.destructive} />
                </Pressable>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={<EmptyState icon="layers" title="No series yet" subtitle="Tap + to add your first series" />}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}

      {/* Create Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Series</Text>
            <Pressable onPress={() => setShowModal(false)}>
              <Feather name="x" size={22} color={colors.foreground} />
            </Pressable>
          </View>
          <View style={styles.modalBody}>
            <Text style={[styles.label, { color: colors.foreground }]}>Name *</Text>
            <TextInput
              value={form.name}
              onChangeText={(v) => {
                setForm((f) => ({
                  ...f,
                  name: v,
                  slug: v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                }));
              }}
              placeholder="e.g. Science"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
            />
            <Text style={[styles.label, { color: colors.foreground }]}>Slug *</Text>
            <TextInput
              value={form.slug}
              onChangeText={(v) => setForm((f) => ({ ...f, slug: v }))}
              placeholder="e.g. science"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
            />
            <Text style={[styles.label, { color: colors.foreground }]}>Description</Text>
            <TextInput
              value={form.description}
              onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
              placeholder="Optional description"
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, height: 80 }]}
            />
            <Text style={[styles.label, { color: colors.foreground }]}>Color</Text>
            <View style={styles.colorRow}>
              {COLORS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setForm((f) => ({ ...f, color: c }))}
                  style={[styles.colorDot, { backgroundColor: c, borderWidth: form.color === c ? 3 : 0, borderColor: "#fff" }]}
                />
              ))}
            </View>
            <Pressable
              onPress={handleCreate}
              disabled={createSeries.isPending}
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            >
              {createSeries.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Create Series</Text>}
            </Pressable>
          </View>
        </View>
      </Modal>
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
  title: { flex: 1, fontSize: 20, fontFamily: "Inter_700Bold" },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  itemName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  itemSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  itemActions: { flexDirection: "row", alignItems: "center" },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalBody: { padding: 20, gap: 8 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 4, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  colorRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  saveBtn: {
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
