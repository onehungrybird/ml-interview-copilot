"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const CATEGORIES = [
  { value: "system_design", label: "🏗️ ML System Design", desc: "End-to-end ML architecture" },
  { value: "ml_theory", label: "🧠 ML Theory", desc: "Concepts, math, algorithms" },
  { value: "mlops", label: "⚙️ MLOps", desc: "Deployment, monitoring, infra" },
  { value: "case_study", label: "📊 Case Study", desc: "Business problem solving" },
];

const DIFFICULTIES = [
  { value: "easy", label: "Easy", style: "border-green-400 text-green-300 bg-green-500/10" },
  { value: "medium", label: "Medium", style: "border-yellow-400 text-yellow-300 bg-yellow-500/10" },
  { value: "hard", label: "Hard", style: "border-red-400 text-red-300 bg-red-500/10" },
];

export default function Home() {
  const router = useRouter();
  const [category, setCategory] = useState("system_design");
  const [difficulty, setDifficulty] = useState("hard");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    if (!email.trim()) { setError("Email required to track your progress"); return; }
    setLoading(true);
    setError("");
    try {
      const session = await api.startSession(category, difficulty, email);
      router.push(`/interview/${session.session_id}`);
    } catch {
      setError("Cannot connect to backend. Is it running on port 8000?");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-6">

      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px] pointer-events-none" />

      {/* Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#111] border border-[#222] rounded-full px-4 py-1.5 mb-6">
            <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center text-xs font-bold text-white">M</div>
            <span className="text-xs text-[#666] font-medium tracking-widest uppercase">ML Interview Copilot</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-3 tracking-tight">
            Practice like it's<br />the real thing.
          </h1>
          <p className="text-[#666] text-base leading-relaxed">
            FAANG-level questions with AI feedback<br />that tells you exactly what you missed.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded-2xl p-7 shadow-2xl">

          {/* Email */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-[#666] uppercase tracking-widest mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              placeholder="you@company.com"
              className="w-full bg-[#141414] border border-[#242424] hover:border-[#2e2e2e] focus:border-[#3a3a3a] rounded-xl px-4 py-3 text-[#e0e0e0] text-sm placeholder-[#3a3a3a] focus:outline-none transition-colors"
            />
          </div>

          {/* Category */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-[#666] uppercase tracking-widest mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    category === c.value
                      ? "border-blue-500/60 bg-blue-600/10"
                      : "border-[#1e1e1e] bg-[#141414] hover:border-[#2a2a2a] hover:bg-[#161616]"
                  }`}
                >
                  <div className={`text-sm font-semibold mb-0.5 ${
                    category === c.value ? "text-white" : "text-[#999]"
                  }`}>
                    {c.label}
                  </div>
                  <div className="text-xs text-[#444]">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-[#666] uppercase tracking-widest mb-2">
              Difficulty
            </label>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    difficulty === d.value
                      ? "border-[#2a2a2a] bg-[#1a1a1a]"
                      : "border-[#1a1a1a] bg-[#141414] text-[#444] hover:text-[#666] hover:border-[#252525]"
                  }`}
                  // style={difficulty === d.value ? { color: d.color } : {}}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 text-red-400 text-xs bg-red-500/8 border border-red-500/15 rounded-lg px-3 py-2.5">
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full bg-white hover:bg-[#f0f0f0] active:bg-[#e8e8e8] disabled:bg-[#1a1a1a] disabled:text-[#444] text-black font-semibold py-3.5 rounded-xl transition-all text-sm tracking-wide"
          >
            {loading ? "Starting session..." : "Start Interview →"}
          </button>
        </div>

        <p className="text-center text-[#2e2e2e] text-xs mt-5 tracking-wide">
          Questions sourced from real FAANG ML interviews
        </p>
      </div>
    </main>
  );
}
