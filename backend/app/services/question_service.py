from app.core.database import db
from typing import List, Optional
import random

def get_questions(category: str, difficulty: str, exclude_ids: List[str] = []) -> List[dict]:
    query = db.table("questions")\
        .select("id, category, difficulty, company_tags, question_text")\
        .eq("category", category)\
        .eq("difficulty", difficulty)\
        .eq("is_active", True)

    result = query.execute()
    questions = result.data

    if exclude_ids:
        questions = [q for q in questions if str(q["id"]) not in exclude_ids]

    return questions

def get_next_question(category: str, difficulty: str, exclude_ids: List[str] = []) -> Optional[dict]:
    questions = get_questions(category, difficulty, exclude_ids)
    if not questions:
        return None
    return random.choice(questions)

def get_question_by_id(question_id: str) -> Optional[dict]:
    result = db.table("questions")\
        .select("*")\
        .eq("id", question_id)\
        .execute()
    return result.data[0] if result.data else None