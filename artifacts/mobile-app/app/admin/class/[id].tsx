import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  useGetClass,
  useListContent,
  useCreateContent,
  useDeleteContent,
} from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";
import { EmptyState } from "@/components/EmptyState";

const CONTENT_TYPES = [
  { key: "video", label: "Video" },
  { key: "pdf", label: "PDF / Book" },
  { key: "worksheet", label: "Worksheet" },
  { key: "answer_key", label: "Answer Key" },
];

export default function AdminClassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const classId = parseInt(id ?? "0");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "video", title: "", description: "", fileUrl: "", duration: "" });

  const { data: cls } = useGetClass(classId);
  const { data: content, isLoading, refetch } = useListContent(classId);
  const createContent = useCreateContent();
  const deleteContent = useDeleteContent();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleCreate = async () => {
    if (!form.title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }
    try {
      await createContent.mutateAsync({
        classId,
        data: {
          type: form.type as "video" | "pdf" | "worksheet" | "answer_key",
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          fileUrl: form.fileUrl.trim() || undefined,
          duration: form.duration.trim() || undefined,
          sortOrder: (content?.length ?? 0) + 1,
        },
      });
      setShowModal(false);
      setForm({ type: "video", title: "", description: "", fileUrl: "", duration: "" });
      refetch();
    } catch {
      Alert.alert("Error", "Failed to add content");
    }
  };

  const handleDelete = (contentId: number, title: string) => {
    Alert.alert("Delete Content", `Delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteContent.mutateAsync({ contentId });
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
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {cls?.label ?? "Class"}
        </Text>
        <Pressable
          onPress={() => setShowModal(true)}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="plus" size={18} color="#fff" />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : (
        <FlatList
          data={content}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/admin/content/${item.id}`)}
              style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.itemLeft}>
                <Text style={[styles.itemType, { color: colors.mutedForeground }]}>{item.type.replace("_", " ").toUpperCase()}</Text>
                <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
              </View>
              <Pressable onPress={() => handleDelete(item.id, item.title)}>
                <Feather name="trash-2" size={15} color={colors.destructive} />
              </Pressable>
            </Pressable>
          )}
          ListEmptyComponent={<EmptyState icon="folder" title="No content yet" subtitle="Tap + to add content" />}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}

      {/* Add Content Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Content</Text>
            <Pressable onPress={() => setShowModal(false)}>
              <Feather name="x" size={22} color={colors.foreground} />
            </Pressable>
          </View>
          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={[styles.label, { color: colors.foreground }]}>Type</Text>
            <View style={styles.typeRow}>
              {CONTENT_TYPES.map((t) => (
                <Pressable
                  key={t.key}
                  onPress={() => setForm((f) => ({ ...f, type: t.key }))}
                  style={[styles.typeBtn, {
                    backgroundColor: form.type === t.key ? colors.primary : colors.secondary,
                    borderColor: form.type === t.key ? colors.primary : colors.border,
                  }]}
                >
                  <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: form.type === t.key ? "#fff" : colors.foreground }}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.label, { color: colors.foreground }]}>Title *</Text>
            <TextInput
              value={form.title}
              onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
              placeholder="Content title"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
            />
            <Text style={[styles.label, { color: colors.foreground }]}>Description</Text>
            <TextInput
              value={form.description}
              onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
              placeholder="Optional description"
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, height: 70 }]}
            />
            {form.type !== "worksheet" && (
              <>
                <Text style={[styles.label, { color: colors.foreground }]}>File / Video URL</Text>
                <TextInput
                  value={form.fileUrl}
                  onChangeText={(v) => setForm((f) => ({ ...f, fileUrl: v }))}
                  placeholder="https://..."
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="none"
                  style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
                />
              </>
            )}
            {form.type === "video" && (
              <>
                <Text style={[styles.label, { color: colors.foreground }]}>Duration</Text>
                <TextInput
                  value={form.duration}
                  onChangeText={(v) => setForm((f) => ({ ...f, duration: v }))}
                  placeholder="e.g. 12:30"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
                />
              </>
            )}
            <Pressable
              onPress={handleCreate}
              disabled={createContent.isPending}
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            >
              {createContent.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Add Content</Text>}
            </Pressable>
          </ScrollView>
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
  title: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold" },
  addBtn: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
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
  },
  itemLeft: { flex: 1 },
  itemType: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", marginBottom: 2 },
  itemTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalBody: { padding: 20 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 6, marginTop: 8 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 4 },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  typeBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1 },
  saveBtn: { borderRadius: 12, padding: 14, alignItems: "center", marginTop: 16, marginBottom: 32 },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
