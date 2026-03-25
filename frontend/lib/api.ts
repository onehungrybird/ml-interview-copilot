const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = {
  startSession: async (category: string, difficulty: string, email: string) => {
    const res = await fetch(`${API_BASE}/interview/session/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, difficulty, user_email: email }),
    });
    if (!res.ok) throw new Error("Failed to start session");
    return res.json();
  },

  getNextQuestion: async (sessionId: string) => {
    const res = await fetch(`${API_BASE}/interview/question/next?session_id=${sessionId}`);
    if (!res.ok) throw new Error("Failed to get question");
    return res.json();
  },

  submitAnswer: async (sessionId: string, questionId: string, answerText: string) => {
    const res = await fetch(`${API_BASE}/interview/answer/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        question_id: questionId,
        answer_text: answerText,
      }),
    });
    if (!res.ok) throw new Error("Failed to submit answer");
    return res.json();
  },

  endSession: async (sessionId: string) => {
    const res = await fetch(`${API_BASE}/interview/session/${sessionId}/end`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to end session");
    return res.json();
  },
};