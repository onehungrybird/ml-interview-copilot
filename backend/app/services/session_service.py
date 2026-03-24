from app.core.database import db
from typing import Optional
import uuid

def create_session(category: str, difficulty: str, user_email: str) -> dict:
    session_data = {
        "id": str(uuid.uuid4()),
        "category": category,
        "difficulty": difficulty,
        "status": "active",
        "questions_answered": 0,
    }
    result = db.table("sessions").insert(session_data).execute()
    return result.data[0]

def get_session(session_id: str) -> Optional[dict]:
    result = db.table("sessions")\
        .select("*")\
        .eq("id", session_id)\
        .execute()
    return result.data[0] if result.data else None

def get_answered_question_ids(session_id: str) -> list:
    result = db.table("answers")\
        .select("question_id")\
        .eq("session_id", session_id)\
        .execute()
    return [row["question_id"] for row in result.data]

def increment_questions_answered(session_id: str, new_score: int):
    session = get_session(session_id)
    if not session:
        return
    current_count = session.get("questions_answered", 0) or 0
    db.table("sessions")\
        .update({"questions_answered": current_count + 1})\
        .eq("id", session_id)\
        .execute()

def end_session(session_id: str) -> dict:
    answers = db.table("answers")\
        .select("*")\
        .eq("session_id", session_id)\
        .execute()

    if not answers.data:
        raise ValueError("No answers found for this session")

    scores = [a["score"] for a in answers.data]
    avg_score = round(sum(scores) / len(scores), 1)
    all_gaps = []
    for answer in answers.data:
        if answer.get("gaps"):
            all_gaps.extend(answer["gaps"])

    follow_ups = [a["follow_up_question"] for a in answers.data if a.get("follow_up_question")]

    if avg_score >= 8:
        performance = "Strong — Ready to interview"
    elif avg_score >= 6:
        performance = "Solid — A few gaps to address"
    elif avg_score >= 4:
        performance = "Developing — Needs more depth"
    else:
        performance = "Early stage — Focus on fundamentals"

    from datetime import datetime, timezone
    db.table("sessions").update({
        "status": "completed",
        "total_score": avg_score,
        "questions_answered": len(answers.data),
        "completed_at": datetime.now(timezone.utc).isoformat()
    }).eq("id", session_id).execute()

    return {
        "session_id": session_id,
        "status": "completed",
        "questions_answered": len(answers.data),
        "average_score": avg_score,
        "performance": performance,
        "scores_per_question": scores,
        "gaps_to_study": all_gaps,
        "follow_up_questions": follow_ups,
    }