from fastapi import APIRouter, HTTPException
from app.models.schemas import SessionCreate, AnswerSubmit
from app.services import session_service, question_service
from app.services.evaluation_service import evaluate_answer
from app.core.database import db

router = APIRouter(prefix="/interview", tags=["interview"])

@router.post("/session/start")
async def start_session(payload: SessionCreate):
    valid_categories = ["system_design", "ml_theory", "mlops", "case_study"]
    valid_difficulties = ["easy", "medium", "hard"]

    if payload.category not in valid_categories:
        raise HTTPException(400, f"Invalid category. Choose from: {valid_categories}")
    if payload.difficulty not in valid_difficulties:
        raise HTTPException(400, f"Invalid difficulty. Choose from: {valid_difficulties}")

    session = session_service.create_session(
        category=payload.category,
        difficulty=payload.difficulty,
        user_email=payload.user_email
    )
    return {
        "session_id": session["id"],
        "category": session["category"],
        "difficulty": session["difficulty"],
        "status": session["status"],
        "message": "Session started. Call /interview/question/next to get your first question."
    }

@router.get("/question/next")
async def get_next_question(session_id: str):
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    if session["status"] != "active":
        raise HTTPException(400, "Session is not active")

    answered_ids = session_service.get_answered_question_ids(session_id)
    question = question_service.get_next_question(
        category=session["category"],
        difficulty=session["difficulty"],
        exclude_ids=answered_ids
    )

    if not question:
        return {
            "status": "completed",
            "message": "You've answered all available questions in this category.",
            "questions_answered": session["questions_answered"]
        }

    return {
        "session_id": session_id,
        "question": question,
        "questions_answered_so_far": len(answered_ids)
    }

@router.post("/answer/submit")
async def submit_answer(payload: AnswerSubmit):
    session = session_service.get_session(str(payload.session_id))
    if not session:
        raise HTTPException(404, "Session not found")
    if session["status"] != "active":
        raise HTTPException(400, "Session is not active")
    if not payload.answer_text.strip():
        raise HTTPException(400, "Answer cannot be empty")
    if len(payload.answer_text.strip()) < 50:
        raise HTTPException(400, "Answer too short — give a real answer")

    try:
        feedback = evaluate_answer(
            session_id=str(payload.session_id),
            question_id=str(payload.question_id),
            answer_text=payload.answer_text
        )
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Evaluation failed: {str(e)}")

    return {
        "status": "evaluated",
        "feedback": feedback,
        "next_step": "Call /interview/question/next for your next question"
    }

@router.post("/session/{session_id}/end")
async def end_session(session_id: str):
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    if session["status"] == "completed":
        raise HTTPException(400, "Session already completed")

    try:
        summary = session_service.end_session(session_id)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to end session: {str(e)}")

    return summary

@router.get("/session/{session_id}/summary")
async def get_session_summary(session_id: str):
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")

    answers = db.table("answers")\
        .select("score, strengths, gaps, follow_up_question, question_id")\
        .eq("session_id", session_id)\
        .execute()

    return {
        "session": session,
        "answers": answers.data,
        "total_answers": len(answers.data)
    }