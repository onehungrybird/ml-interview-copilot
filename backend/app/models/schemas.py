from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class SessionCreate(BaseModel):
    category: str
    difficulty: str
    user_email: str

class SessionResponse(BaseModel):
    id: UUID
    category: str
    difficulty: str
    status: str
    created_at: datetime

class QuestionResponse(BaseModel):
    id: UUID
    category: str
    difficulty: str
    company_tags: List[str]
    question_text: str

class AnswerSubmit(BaseModel):
    session_id: UUID
    question_id: UUID
    answer_text: str

class AnswerFeedback(BaseModel):
    score: int
    strengths: List[str]
    gaps: List[str]
    ideal_answer_summary: str
    follow_up_question: str