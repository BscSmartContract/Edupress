import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  useGetContent,
  useListQuestions,
  useCreateQuestion,
  useDeleteQuestion,
} from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";
import { EmptyState } from "@/components/EmptyState";

const Q_TYPES = [
  { key: "mcq", label: "MCQ" },
  { key: "true_false", label: "True/False" },
  { key: "fill_blank", label: "Fill Blank" },
  { key: "short_answer", label: "Short Answer" },
];

export default function AdminContentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const contentId = parseInt(id ?? "0");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    questionType: "mcq",
    questionText: "",
    option1: "", option2: "", option3: "", option4: "",
    correctAnswer: "",
    explanation: "",
  });

  const { data: content } = useGetContent(contentId);
  const { data: questions, isLoading, refetch } = useListQuestions(contentId);
  const createQuestion = useCreateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleCreate = async () => {
    if (!form.questionText.trim() || !form.correctAnswer.trim()) {
      Alert.alert("Error", "Question text and correct answer are required");
      return;
    }
    const options = form.questionType === "mcq"
      ? [form.option1, form.option2, form.option3, form.option4].filter(Boolean)
      : form.questionType === "true_false"
      ? ["True", "False"]
      : undefined;

    try {
      await createQuestion.mutateAsync({
        contentId,
        data: {
          questionType: form.questionType as "mcq" | "fill_blank" | "true_false" | "short_answer",
          questionText: form.questionText.trim(),
          options,
          correctAnswer: form.correctAnswer.trim(),
          explanation: form.explanation.trim() || undefined,
          sortOrder: (questions?.length ?? 0) + 1,
        },
      });
      setShowModal(false);
      setForm({ questionType: "mcq", questionText: "", option1: "", option2: "", option3: "", option4: "", correctAnswer: "", explanation: "" });
      refetch();
    } catch {
      Alert.alert("Error", "Failed to add question");
    }
  };

  const handleDelete = (qId: number) => {
    Alert.alert("Delete Question", "Delete this question?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteQuestion.mutateAsync({ questionId: qId });
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
          {content?.title ?? "Content"}
        </Text>
        {content?.type === "worksheet" && (
          <Pressable
            onPress={() => setShowModal(true)}
            style={[styles.addBtn, { backgroundColor: "#2E7D32" }]}
          >
            <Feather name="plus" size={18} color="#fff" />
          </Pressable>
        )}
      </View>

      {/* Content info */}
      {content && (
        <View style={[styles.infoCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Text style={[styles.infoType, { color: colors.mutedForeground }]}>
            {content.type.replace("_", " ").toUpperCase()}
          </Text>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>{content.title}</Text>
          {content.description ? <Text style={[styles.infoDesc, { color: colors.mutedForeground }]}>{content.description}</Text> : null}
          {content.fileUrl ? (
            <Text style={[styles.infoUrl, { color: colors.primary }]} numberOfLines={1}>{content.fileUrl}</Text>
          ) : null}
        </View>
      )}

      {/* Questions (worksheets only) */}
      {content?.type === "worksheet" ? (
        isLoading ? (
          <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20 }}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              Questions ({questions?.length ?? 0})
            </Text>
            {questions?.map((q, idx) => (
              <View key={q.id} style={[styles.qItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.qHeader}>
                  <Text style={[styles.qNum, { color: colors.primary }]}>Q{idx + 1}</Text>
                  <Text style={[styles.qType, { color: colors.mutedForeground }]}>{q.questionType.replace("_", " ")}</Text>
                  <Pressable onPress={() => handleDelete(q.id)} style={{ marginLeft: "auto" }}>
                    <Feather name="trash-2" size={14} color={colors.destructive} />
                  </Pressable>
                </View>
                <Text style={[styles.qText, { color: colors.foreground }]}>{q.questionText}</Text>
                <Text style={[styles.qAnswer, { color: "#22C55E" }]}>✓ {q.correctAnswer}</Text>
              </View>
            ))}
            {(!questions || questions.length === 0) && (
              <EmptyState icon="edit-3" title="No questions yet" subtitle="Tap + to add questions" />
            )}
          </ScrollView>
        )
      ) : (
        <View style={[styles.center, { paddingTop: 20 }]}>
          <Feather name="info" size={24} color={colors.mutedForeground} />
          <Text style={[styles.infoMsg, { color: colors.mutedForeground }]}>
            Questions are only for worksheet content
          </Text>
        </View>
      )}

      {/* Add Question Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Question</Text>
            <Pressable onPress={() => setShowModal(false)}>
              <Feather name="x" size={22} color={colors.foreground} />
            </Pressable>
          </View>
          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={[styles.label, { color: colors.foreground }]}>Type</Text>
            <View style={styles.typeRow}>
              {Q_TYPES.map((t) => (
                <Pressable
                  key={t.key}
                  onPress={() => setForm((f) => ({ ...f, questionType: t.key }))}
                  style={[styles.typeBtn, {
                    backgroundColor: form.questionType === t.key ? "#2E7D32" : colors.secondary,
                    borderColor: form.questionType === t.key ? "#2E7D32" : colors.border,
                  }]}
                >
                  <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: form.questionType === t.key ? "#fff" : colors.foreground }}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.label, { color: colors.foreground }]}>Question *</Text>
            <TextInput
              value={form.questionText}
              onChangeText={(v) => setForm((f) => ({ ...f, questionText: v }))}
              placeholder="Enter question..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, height: 80 }]}
            />
            {form.questionType === "mcq" && (
              <>
                <Text style={[styles.label, { color: colors.foreground }]}>Options</Text>
                {["option1", "option2", "option3", "option4"].map((key, i) => (
                  <TextInput
                    key={key}
                    value={form[key as keyof typeof form]}
                    onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
                    placeholder={`Option ${i + 1}`}
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
                  />
                ))}
              </>
            )}
            <Text style={[styles.label, { color: colors.foreground }]}>Correct Answer *</Text>
            <TextInput
              value={form.correctAnswer}
              onChangeText={(v) => setForm((f) => ({ ...f, correctAnswer: v }))}
              placeholder={form.questionType === "true_false" ? "True or False" : "Correct answer"}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
            />
            <Text style={[styles.label, { color: colors.foreground }]}>Explanation (optional)</Text>
            <TextInput
              value={form.explanation}
              onChangeText={(v) => setForm((f) => ({ ...f, explanation: v }))}
              placeholder="Explain the answer..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, height: 70 }]}
            />
            <Pressable
              onPress={handleCreate}
              disabled={createQuestion.isPending}
              style={[styles.saveBtn, { backgroundColor: "#2E7D32" }]}
            >
              {createQuestion.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Add Question</Text>}
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
  infoCard: {
    margin: 16,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  infoType: { fontSize: 10, fontFamily: "Inter_700Bold", textTransform: "uppercase", marginBottom: 4 },
  infoTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 4 },
  infoDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  infoUrl: { fontSize: 12, fontFamily: "Inter_400Regular" },
  center: { alignItems: "center", paddingTop: 40, gap: 10 },
  infoMsg: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 32 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 10,
  },
  qItem: {
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    gap: 4,
  },
  qHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  qNum: { fontSize: 12, fontFamily: "Inter_700Bold" },
  qType: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "capitalize" },
  qText: { fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 19 },
  qAnswer: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 2 },
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
