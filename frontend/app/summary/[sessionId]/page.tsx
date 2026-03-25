"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Summary = {
  session_id: string;
  questions_answered: number;
  average_score: number;
  performance: string;
  scores_per_question: number[];
  gaps_to_study: string[];
  follow_up_questions: string[];
};

export default function SummaryPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("mlcopilot_summary");
    if (data) setSummary(JSON.parse(data));
    else router.push("/");
  }, []);

  if (!summary) return null;

  const scoreColor = (s: number) =>
    s >= 8 ? "#22c55e" : s >= 6 ? "#eab308" : s >= 4 ? "#f97316" : "#ef4444";

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* Top Bar */}
      <div className="border-b border-[#111] px-6 py-4 flex items-center gap-3">
        <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-xs font-bold">M</div>
        <span className="text-sm text-[#444]">Session Complete</span>
      </div>

      <div className="max-w-xl mx-auto px-6 py-12">

        {/* Score Hero */}
        <div className="text-center mb-10">
          <div
            className="text-8xl font-bold font-[family-name:var(--font-mono)] mb-2 leading-none"
            style={{ color: scoreColor(summary.average_score) }}
          >
            {summary.average_score}
          </div>
          <div className="text-[#333] font-[family-name:var(--font-mono)] text-lg mb-3">/10 average</div>
          <p className="text-white font-medium text-lg">{summary.performance}</p>
          <p className="text-[#444] text-sm mt-1">
            {summary.questions_answered} question{summary.questions_answered !== 1 ? "s" : ""} completed
          </p>
        </div>

        {/* Score breakdown */}
        {summary.scores_per_question.length > 0 && (
          <div className="flex justify-center gap-2 mb-10">
            {summary.scores_per_question.map((s, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-xl border flex items-center justify-center text-sm font-bold font-[family-name:var(--font-mono)] bg-[#0d0d0d]"
                style={{ borderColor: scoreColor(s) + "40", color: scoreColor(s) }}
              >
                {s}
              </div>
            ))}
          </div>
        )}

        {/* Gaps */}
        {summary.gaps_to_study.length > 0 && (
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5 mb-4">
            <h2 className="text-xs font-medium text-[#ef4444] uppercase tracking-wider mb-4">
              Topics to study
            </h2>
            <ul className="space-y-2.5">
              {summary.gaps_to_study.map((gap, i) => (
                <li key={i} className="flex gap-3 text-sm text-[#666]">
                  <span className="text-[#ef4444] flex-shrink-0 mt-0.5">✗</span>
                  {gap}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Follow-ups */}
        {summary.follow_up_questions.length > 0 && (
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5 mb-8">
            <h2 className="text-xs font-medium text-[#eab308] uppercase tracking-wider mb-4">
              Practice these next
            </h2>
            <ul className="space-y-3">
              {summary.follow_up_questions.map((q, i) => (
                <li key={i} className="text-sm text-[#555] italic border-l border-[#222] pl-3 leading-relaxed">
                  "{q}"
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => router.push("/")}
          className="w-full bg-white hover:bg-[#ededed] text-black font-semibold py-3.5 rounded-xl transition-all text-sm"
        >
          Practice Again →
        </button>

      </div>
    </main>
  );
}