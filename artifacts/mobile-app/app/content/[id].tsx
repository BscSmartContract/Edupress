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
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useGetContent, useListQuestions } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/useColors";

type QuestionState = {
  answers: Record<number, string>;
  submitted: boolean;
};

export default function ContentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const contentId = parseInt(id ?? "0");
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { data: content, isLoading: loadingContent } = useGetContent(contentId);
  const { data: questions, isLoading: loadingQ } = useListQuestions(contentId);

  const [qs, setQs] = useState<QuestionState>({ answers: {}, submitted: false });

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const openUrl = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const handleAnswer = (questionId: number, answer: string) => {
    if (qs.submitted) return;
    Haptics.selectionAsync();
    setQs((prev) => ({ ...prev, answers: { ...prev.answers, [questionId]: answer } }));
  };

  const handleSubmit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setQs((prev) => ({ ...prev, submitted: true }));
  };

  const getScore = () => {
    if (!questions || !qs.submitted) return null;
    const correct = questions.filter((q) => qs.answers[q.id] === q.correctAnswer).length;
    return { correct, total: questions.length };
  };

  if (loadingContent) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!content) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Content not found</Text>
      </View>
    );
  }

  const score = getScore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          {content.title}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: botPad + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Content info card */}
        <View style={[styles.infoCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Text style={[styles.contentTitle, { color: colors.foreground }]}>{content.title}</Text>
          {content.description ? (
            <Text style={[styles.contentDesc, { color: colors.mutedForeground }]}>{content.description}</Text>
          ) : null}
          {content.duration ? (
            <View style={styles.metaRow}>
              <Feather name="clock" size={13} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{content.duration}</Text>
            </View>
          ) : null}
        </View>

        {/* Video */}
        {content.type === "video" && content.fileUrl ? (
          <Pressable
            onPress={() => openUrl(content.fileUrl!)}
            style={({ pressed }) => [styles.actionBtn, { backgroundColor: "#E65100", opacity: pressed ? 0.85 : 1 }]}
          >
            <Feather name="play-circle" size={22} color="#fff" />
            <Text style={styles.actionBtnText}>Watch Video</Text>
          </Pressable>
        ) : content.type === "video" ? (
          <View style={[styles.noContent, { backgroundColor: colors.secondary }]}>
            <Feather name="video-off" size={28} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, marginTop: 8, fontFamily: "Inter_400Regular" }}>Video not available yet</Text>
          </View>
        ) : null}

        {/* PDF / Book */}
        {content.type === "pdf" && content.fileUrl ? (
          <Pressable
            onPress={() => openUrl(content.fileUrl!)}
            style={({ pressed }) => [styles.actionBtn, { backgroundColor: "#1565C0", opacity: pressed ? 0.85 : 1 }]}
          >
            <Feather name="book-open" size={22} color="#fff" />
            <Text style={styles.actionBtnText}>Open Book / PDF</Text>
          </Pressable>
        ) : content.type === "pdf" ? (
          <View style={[styles.noContent, { backgroundColor: colors.secondary }]}>
            <Feather name="file" size={28} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, marginTop: 8, fontFamily: "Inter_400Regular" }}>PDF not available yet</Text>
          </View>
        ) : null}

        {/* Answer Key */}
        {content.type === "answer_key" && content.fileUrl ? (
          <Pressable
            onPress={() => openUrl(content.fileUrl!)}
            style={({ pressed }) => [styles.actionBtn, { backgroundColor: "#6A1B9A", opacity: pressed ? 0.85 : 1 }]}
          >
            <Feather name="check-circle" size={22} color="#fff" />
            <Text style={styles.actionBtnText}>View Answer Key</Text>
          </Pressable>
        ) : content.type === "answer_key" ? (
          <View style={[styles.noContent, { backgroundColor: colors.secondary }]}>
            <Feather name="file-text" size={28} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, marginTop: 8, fontFamily: "Inter_400Regular" }}>Answer key not available yet</Text>
          </View>
        ) : null}

        {/* Worksheet */}
        {content.type === "worksheet" && (
          <>
            {qs.submitted && score ? (
              <View style={[styles.scoreCard, { borderColor: colors.border }]}>
                <Feather name="award" size={40} color={score.correct === score.total ? "#22C55E" : colors.primary} />
                <Text style={[styles.scoreTitle, { color: colors.foreground }]}>
                  {score.correct}/{score.total} Correct
                </Text>
                <Text style={[styles.scorePct, { color: score.correct === score.total ? "#22C55E" : colors.primary }]}>
                  {Math.round((score.correct / score.total) * 100)}%
                </Text>
                <Pressable
                  onPress={() => setQs({ answers: {}, submitted: false })}
                  style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.retryBtnText}>Try Again</Text>
                </Pressable>
              </View>
            ) : null}

            {loadingQ ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
            ) : questions && questions.length > 0 ? (
              <>
                {!qs.submitted ? (
                  <View style={styles.questionsHeader}>
                    <Feather name="edit-3" size={16} color={colors.primary} />
                    <Text style={[styles.questionsTitle, { color: colors.foreground }]}>
                      Worksheet — {questions.length} Questions
                    </Text>
                  </View>
                ) : null}

                {questions.map((q, idx) => {
                  const answer = qs.answers[q.id];
                  const isCorrect = qs.submitted && answer === q.correctAnswer;
                  const isWrong = qs.submitted && answer !== undefined && answer !== q.correctAnswer;

                  return (
                    <View
                      key={q.id}
                      style={[
                        styles.questionCard,
                        {
                          backgroundColor: colors.card,
                          borderColor: qs.submitted
                            ? isCorrect ? "#22C55E" : isWrong ? "#EF4444" : colors.border
                            : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.qNum, { color: colors.mutedForeground }]}>Q{idx + 1}</Text>
                      <Text style={[styles.qText, { color: colors.foreground }]}>{q.questionText}</Text>

                      {/* MCQ */}
                      {q.questionType === "mcq" && q.options?.map((opt) => (
                        <Pressable
                          key={opt}
                          onPress={() => handleAnswer(q.id, opt)}
                          style={[
                            styles.option,
                            {
                              backgroundColor:
                                qs.submitted && opt === q.correctAnswer ? "#E8F5E9" :
                                qs.submitted && opt === answer ? "#FFEBEE" :
                                answer === opt ? colors.secondary : colors.background,
                              borderColor:
                                qs.submitted && opt === q.correctAnswer ? "#22C55E" :
                                qs.submitted && opt === answer ? "#EF4444" :
                                answer === opt ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <View style={[
                            styles.radio,
                            {
                              borderColor: answer === opt ? colors.primary : colors.border,
                              backgroundColor: answer === opt ? colors.primary : "transparent",
                            },
                          ]}>
                            {answer === opt && <View style={styles.radioDot} />}
                          </View>
                          <Text style={[styles.optText, { color: colors.foreground }]}>{opt}</Text>
                          {qs.submitted && opt === q.correctAnswer && (
                            <Feather name="check" size={14} color="#22C55E" />
                          )}
                        </Pressable>
                      ))}

                      {/* True/False */}
                      {q.questionType === "true_false" && (
                        <View style={styles.tfRow}>
                          {["True", "False"].map((opt) => (
                            <Pressable
                              key={opt}
                              onPress={() => handleAnswer(q.id, opt)}
                              style={[
                                styles.tfBtn,
                                {
                                  backgroundColor:
                                    qs.submitted && opt === q.correctAnswer ? "#E8F5E9" :
                                    qs.submitted && opt === answer ? "#FFEBEE" :
                                    answer === opt ? colors.primary : colors.secondary,
                                  borderColor:
                                    qs.submitted && opt === q.correctAnswer ? "#22C55E" :
                                    qs.submitted && opt === answer ? "#EF4444" :
                                    answer === opt ? colors.primary : colors.border,
                                },
                              ]}
                            >
                              <Text style={[
                                styles.tfText,
                                { color: answer === opt && !qs.submitted ? "#fff" : colors.foreground },
                              ]}>{opt}</Text>
                            </Pressable>
                          ))}
                        </View>
                      )}

                      {/* Fill in blank / Short answer */}
                      {(q.questionType === "fill_blank" || q.questionType === "short_answer") && (
                        <TextInput
                          value={answer ?? ""}
                          onChangeText={(text) => handleAnswer(q.id, text)}
                          placeholder="Type your answer..."
                          placeholderTextColor={colors.mutedForeground}
                          editable={!qs.submitted}
                          style={[
                            styles.textAnswer,
                            {
                              borderColor: qs.submitted
                                ? isCorrect ? "#22C55E" : isWrong ? "#EF4444" : colors.border
                                : colors.border,
                              color: colors.foreground,
                              backgroundColor: colors.background,
                            },
                          ]}
                        />
                      )}

                      {/* Show correct answer on submit if wrong */}
                      {qs.submitted && isWrong && (
                        <View style={styles.correctHint}>
                          <Feather name="check-circle" size={13} color="#22C55E" />
                          <Text style={{ fontSize: 12, color: "#22C55E", fontFamily: "Inter_500Medium" }}>
                            Correct: {q.correctAnswer}
                          </Text>
                        </View>
                      )}
                      {qs.submitted && q.explanation ? (
                        <Text style={[styles.explanation, { color: colors.mutedForeground }]}>
                          {q.explanation}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}

                {!qs.submitted ? (
                  <Pressable
                    onPress={handleSubmit}
                    style={({ pressed }) => [styles.submitBtn, { backgroundColor: "#2E7D32", opacity: pressed ? 0.85 : 1 }]}
                  >
                    <Feather name="check-circle" size={18} color="#fff" />
                    <Text style={styles.submitBtnText}>Submit Worksheet</Text>
                  </Pressable>
                ) : null}
              </>
            ) : (
              <View style={[styles.noContent, { backgroundColor: colors.secondary }]}>
                <Feather name="clipboard" size={28} color={colors.mutedForeground} />
                <Text style={{ color: colors.mutedForeground, marginTop: 8, fontFamily: "Inter_400Regular" }}>
                  No questions added yet
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  back: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 16, fontFamily: "Inter_600SemiBold" },
  infoCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  contentTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 6 },
  contentDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, marginBottom: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    padding: 16,
    gap: 10,
    marginBottom: 16,
  },
  actionBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  noContent: {
    borderRadius: 14,
    padding: 32,
    alignItems: "center",
    marginBottom: 16,
  },
  scoreCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 20,
    gap: 6,
  },
  scoreTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  scorePct: { fontSize: 36, fontFamily: "Inter_700Bold" },
  retryBtn: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10, marginTop: 8 },
  retryBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  questionsHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  questionsTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  questionCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 12,
    gap: 8,
  },
  qNum: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  qText: { fontSize: 15, fontFamily: "Inter_600SemiBold", lineHeight: 21, marginBottom: 4 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    gap: 10,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  optText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  tfRow: { flexDirection: "row", gap: 10 },
  tfBtn: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 1.5,
  },
  tfText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  textAnswer: {
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  correctHint: { flexDirection: "row", alignItems: "center", gap: 6 },
  explanation: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic", marginTop: 2 },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    padding: 16,
    gap: 10,
    marginTop: 4,
  },
  submitBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
