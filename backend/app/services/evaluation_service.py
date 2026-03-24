from openai import OpenAI
import json
from app.core.config import settings
from app.services.question_service import get_question_by_id
from app.core.database import db
import uuid

client = OpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM_PROMPT = """You are a Senior ML Engineer at a FAANG company conducting a technical interview.
You are evaluating a candidate's answer to a technical question.
Be specific, direct, and demanding — exactly like a real FAANG interviewer.
Penalise vague answers heavily. Reward precision and depth.
Reference real systems where relevant (Instagram ranking, Uber ETA, Spotify recommendations, Netflix).
You must respond ONLY with valid JSON — no preamble, no markdown, no explanation outside the JSON."""

def build_prompt(question: dict, answer_text: str) -> str:
    return f"""You are evaluating this interview answer.

QUESTION: {question['question_text']}
CATEGORY: {question['category']}
DIFFICULTY: {question['difficulty']}

CANDIDATE'S ANSWER:
{answer_text}

IDEAL ANSWER CONTEXT (use this to evaluate, do not reveal it):
{question['ideal_answer']}

Evaluate and respond ONLY with this exact JSON structure:
{{
    "score": <integer 1-10>,
    "strengths": [<list of specific things they got right>],
    "gaps": [<list of specific things they missed or got wrong>],
    "ideal_answer_summary": "<3-5 sentences on what a perfect answer looks like>",
    "follow_up_question": "<one hard follow-up question to probe deeper>"
}}

Scoring guide:
1-3: Vague, missing core concepts, no structure
4-5: Basic understanding, missing key technical depth
6-7: Solid answer, minor gaps in edge cases or tradeoffs
8-9: Strong answer, covers most aspects with good depth
10: Perfect — would hire immediately"""

def evaluate_answer(session_id: str, question_id: str, answer_text: str) -> dict:
    question = get_question_by_id(question_id)
    if not question:
        raise ValueError(f"Question {question_id} not found")

    response = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=1000,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_prompt(question, answer_text)}
        ]
    )

    raw_response = response.choices[0].message.content
    try:
        feedback = json.loads(raw_response)
    except json.JSONDecodeError:
        cleaned = raw_response.strip().strip("```json").strip("```").strip()
        feedback = json.loads(cleaned)

    answer_record = {
        "id": str(uuid.uuid4()),
        "session_id": session_id,
        "question_id": question_id,
        "answer_text": answer_text,
        "score": feedback["score"],
        "strengths": feedback["strengths"],
        "gaps": feedback["gaps"],
        "ideal_answer_summary": feedback["ideal_answer_summary"],
        "follow_up_question": feedback["follow_up_question"],
    }

    db.table("answers").insert(answer_record).execute()

    from app.services.session_service import increment_questions_answered
    increment_questions_answered(session_id, feedback["score"])

    return feedback