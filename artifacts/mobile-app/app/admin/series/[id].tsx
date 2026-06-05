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
  useGetSeries,
  useUpdateSeries,
  useListClasses,
  useCreateClass,
  useDeleteClass,
} from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";
import { EmptyState } from "@/components/EmptyState";

export default function AdminSeriesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const seriesId = parseInt(id ?? "0");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [showAddClass, setShowAddClass] = useState(false);
  const [classForm, setClassForm] = useState({ classLevel: "", label: "" });

  const { data: series, isLoading, refetch: refetchSeries } = useGetSeries(seriesId);
  const { data: classes, refetch: refetchClasses } = useListClasses(seriesId);
  const createClass = useCreateClass();
  const deleteClass = useDeleteClass();
  const updateSeries = useUpdateSeries();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleAddClass = async () => {
    if (!classForm.classLevel.trim() || !classForm.label.trim()) {
      Alert.alert("Error", "Class level and label are required");
      return;
    }
    try {
      await createClass.mutateAsync({
        seriesId,
        data: {
          classLevel: classForm.classLevel.trim(),
          label: classForm.label.trim(),
          sortOrder: (classes?.length ?? 0) + 1,
        },
      });
      setShowAddClass(false);
      setClassForm({ classLevel: "", label: "" });
      refetchClasses();
    } catch {
      Alert.alert("Error", "Failed to add class");
    }
  };

  const handleDeleteClass = (classId: number, label: string) => {
    Alert.alert("Delete Class", `Delete "${label}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteClass.mutateAsync({ classId });
          refetchClasses();
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
          {series?.name ?? "Series"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20 }}>
        {/* Series Info */}
        {series ? (
          <View style={[styles.infoCard, { backgroundColor: series.color ?? colors.primary }]}>
            <Text style={styles.infoName}>{series.name}</Text>
            {series.description ? <Text style={styles.infoDesc}>{series.description}</Text> : null}
            <Text style={styles.infoBadge}>{classes?.length ?? 0} classes</Text>
          </View>
        ) : isLoading ? <ActivityIndicator color={colors.primary} style={{ margin: 24 }} /> : null}

        {/* Classes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Classes</Text>
            <Pressable
              onPress={() => setShowAddClass(true)}
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="plus" size={16} color="#fff" />
              <Text style={styles.addBtnText}>Add</Text>
            </Pressable>
          </View>

          {classes?.map((cls) => (
            <Pressable
              key={cls.id}
              onPress={() => router.push(`/admin/class/${cls.id}`)}
              style={[styles.classItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.className, { color: colors.foreground }]}>{cls.label}</Text>
              <View style={styles.classActions}>
                <Feather name="edit-2" size={15} color={colors.mutedForeground} style={{ marginRight: 14 }} />
                <Pressable onPress={() => handleDeleteClass(cls.id, cls.label)}>
                  <Feather name="trash-2" size={15} color={colors.destructive} />
                </Pressable>
              </View>
            </Pressable>
          ))}

          {classes?.length === 0 && (
            <EmptyState icon="layers" title="No classes yet" subtitle="Tap Add to create classes" />
          )}
        </View>
      </ScrollView>

      {/* Add Class Modal */}
      <Modal visible={showAddClass} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddClass(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Class</Text>
            <Pressable onPress={() => setShowAddClass(false)}>
              <Feather name="x" size={22} color={colors.foreground} />
            </Pressable>
          </View>
          <View style={styles.modalBody}>
            <Text style={[styles.label, { color: colors.foreground }]}>Class Level *</Text>
            <TextInput
              value={classForm.classLevel}
              onChangeText={(v) => setClassForm((f) => ({ ...f, classLevel: v.toLowerCase().replace(/\s+/g, "-") }))}
              placeholder="e.g. class-1"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
            />
            <Text style={[styles.label, { color: colors.foreground }]}>Label *</Text>
            <TextInput
              value={classForm.label}
              onChangeText={(v) => setClassForm((f) => ({ ...f, label: v }))}
              placeholder="e.g. Class 1"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
            />
            <Pressable
              onPress={handleAddClass}
              disabled={createClass.isPending}
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            >
              {createClass.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Add Class</Text>}
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
  title: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold" },
  infoCard: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  infoName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 4 },
  infoDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)", marginBottom: 10 },
  infoBadge: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.9)" },
  section: { paddingHorizontal: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  addBtn: { flexDirection: "row", alignItems: "center", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, gap: 4 },
  addBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
  classItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  className: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1 },
  classActions: { flexDirection: "row", alignItems: "center" },
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
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, fontFamily: "Inter_400Regular" },
  saveBtn: { borderRadius: 12, padding: 14, alignItems: "center", marginTop: 12 },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
