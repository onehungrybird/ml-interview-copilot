"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Question = {
  id: string;
  category: string;
  difficulty: string;
  company_tags: string[];
  question_text: string;
};

type Feedback = {
  score: number;
  strengths: string[];
  gaps: string[];
  ideal_answer_summary: string;
  follow_up_question: string;
};

export default function InterviewPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const router = useRouter();
  const { sessionId } = use(params);  // ← React.use() unwraps the Promise
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState("");

  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    loadNextQuestion();
  }, []);

  const loadNextQuestion = async () => {
    setLoading(true);
    setFeedback(null);
    setAnswer("");
    setError("");
    try {
      const data = await api.getNextQuestion(sessionId);
      if (data.status === "completed") { await handleEndSession(); return; }
      setQuestion(data.question);
      setQuestionsAnswered(data.questions_answered_so_far ?? 0);
      setTimeout(() => textareaRef.current?.focus(), 100);
    } catch {
      setError("Failed to load question.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!question || answer.trim().length < 50) {
      setError("Write at least 50 characters");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const result = await api.submitAnswer(sessionId, question.id, answer);
      setFeedback(result.feedback);
      setQuestionsAnswered((p) => p + 1);
    } catch {
      setError("Submission failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndSession = async () => {
    setEnding(true);
    try {
      const summary = await api.endSession(sessionId);
      sessionStorage.setItem("mlcopilot_summary", JSON.stringify(summary));
      router.push(`/summary/${sessionId}`);
    } catch {
      setError("Failed to end session.");
      setEnding(false);
    }
  };

  const scoreColor = (s: number) =>
    s >= 8 ? "#22c55e" : s >= 6 ? "#eab308" : s >= 4 ? "#f97316" : "#ef4444";

  const categoryLabel = (c: string) =>
    c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#222] border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#444] text-sm">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* Top Bar */}
      <div className="border-b border-[#111] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-xs font-bold">M</div>
          <span className="text-sm text-[#444]">
            {questionsAnswered} answered
          </span>
        </div>
        <button
          onClick={handleEndSession}
          disabled={ending || questionsAnswered === 0}
          className="text-xs text-[#444] hover:text-white border border-[#1f1f1f] hover:border-[#333] px-4 py-2 rounded-lg transition-all disabled:opacity-30"
        >
          {ending ? "Ending..." : "End & Summary →"}
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Question */}
        {question && (
          <div className="mb-8">
            {/* Meta tags */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs font-medium text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2.5 py-1 rounded-md">
                {categoryLabel(question.category)}
              </span>
              <span className="text-xs text-[#444] bg-[#111] border border-[#1f1f1f] px-2.5 py-1 rounded-md capitalize">
                {question.difficulty}
              </span>
              {question.company_tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs text-[#333] bg-[#111] border border-[#1a1a1a] px-2.5 py-1 rounded-md capitalize">
                  {tag}
                </span>
              ))}
            </div>

            {/* Question text */}
            <h2 className="text-2xl font-semibold text-white leading-relaxed">
              {question.question_text}
            </h2>
          </div>
        )}

        {/* Answer Input */}
        {!feedback && (
          <div>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.metaKey) handleSubmit();
                }}
                placeholder="Walk through your approach clearly. Cover architecture, tradeoffs, real-world constraints. Vague answers score 1–3."
                rows={9}
                className="w-full bg-[#0d0d0d] border border-[#1f1f1f] focus:border-[#2f2f2f] rounded-2xl px-5 py-4 text-sm text-white placeholder-[#3a3a3a] focus:outline-none transition-colors resize-none leading-relaxed font-[family-name:var(--font-mono)]"
              />
              <div className="absolute bottom-4 right-4 text-xs text-[#2a2a2a] font-[family-name:var(--font-mono)]">
                {answer.length < 50 ? (
                  <span className="text-[#333]">{50 - answer.length} min</span>
                ) : (
                  <span className="text-[#444]">{answer.length}</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-[#333]">⌘ + Enter to submit</span>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={submitting || answer.trim().length < 50}
                className="bg-white hover:bg-[#ededed] disabled:bg-[#111] disabled:text-[#333] text-black text-sm font-semibold px-6 py-2.5 rounded-xl transition-all"
              >
                {submitting ? "Evaluating..." : "Submit →"}
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="space-y-4">

            {/* Score */}
            <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-2xl p-6">
              <div className="flex items-start justify-between mb-1">
                <span className="text-xs text-[#444] uppercase tracking-wider font-medium">Score</span>
              </div>
              <div className="flex items-end gap-3">
                <span
                  className="text-6xl font-bold font-[family-name:var(--font-mono)] leading-none"
                  style={{ color: scoreColor(feedback.score) }}
                >
                  {feedback.score}
                </span>
                <span className="text-2xl text-[#333] font-[family-name:var(--font-mono)] mb-1">/10</span>
                <span className="text-sm text-[#444] mb-2 ml-2">
                  {feedback.score >= 8 ? "Strong answer — hire signal"
                    : feedback.score >= 6 ? "Solid — minor gaps"
                    : feedback.score >= 4 ? "Developing — needs depth"
                    : "Significant gaps — keep practicing"}
                </span>
              </div>
            </div>

            {/* Strengths */}
            {feedback.strengths.length > 0 && (
              <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5">
                <h3 className="text-xs font-medium text-[#22c55e] uppercase tracking-wider mb-3">
                  What you got right
                </h3>
                <ul className="space-y-2">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[#888]">
                      <span className="text-[#22c55e] mt-0.5 flex-shrink-0">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gaps */}
            {feedback.gaps.length > 0 && (
              <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5">
                <h3 className="text-xs font-medium text-[#ef4444] uppercase tracking-wider mb-3">
                  What you missed
                </h3>
                <ul className="space-y-2">
                  {feedback.gaps.map((g, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[#888]">
                      <span className="text-[#ef4444] mt-0.5 flex-shrink-0">✗</span>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ideal Answer */}
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5">
              <h3 className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-3">
                What a great answer looks like
              </h3>
              <p className="text-sm text-[#666] leading-relaxed">
                {feedback.ideal_answer_summary}
              </p>
            </div>

            {/* Follow-up */}
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5">
              <h3 className="text-xs font-medium text-[#eab308] uppercase tracking-wider mb-3">
                Follow-up question
              </h3>
              <p className="text-sm text-[#555] italic leading-relaxed">
                "{feedback.follow_up_question}"
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={loadNextQuestion}
                className="flex-1 bg-white hover:bg-[#ededed] text-black text-sm font-semibold py-3 rounded-xl transition-all"
              >
                Next Question →
              </button>
              <button
                onClick={handleEndSession}
                disabled={ending}
                className="flex-1 border border-[#1f1f1f] hover:border-[#333] text-[#555] hover:text-white text-sm font-medium py-3 rounded-xl transition-all"
              >
                {ending ? "Ending..." : "End & See Summary"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}