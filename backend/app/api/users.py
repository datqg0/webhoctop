from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Exam, ExamQuestion, ExamSubmission, Question, Subject, User
from app.schemas import UserHistoryItem, UserMistakeItem, UserProfileResponse, UserProfileUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfileResponse)
def get_my_profile(user: User = Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserProfileResponse)
def update_my_profile(
    payload: UserProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    full_name = payload.full_name.strip()
    if not full_name:
        raise HTTPException(status_code=422, detail="Name cannot be empty")

    user.full_name = full_name
    user.school = payload.school.strip()
    user.grade = payload.grade
    db.commit()
    db.refresh(user)
    return user


@router.get("/me/history", response_model=List[UserHistoryItem])
def get_my_history(
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(ExamSubmission, Exam, Subject)
        .join(Exam, ExamSubmission.exam_id == Exam.id)
        .join(Subject, Exam.subject_id == Subject.id)
        .filter(ExamSubmission.user_id == user.id)
        .order_by(ExamSubmission.submitted_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [
        UserHistoryItem(
            submission_id=submission.id,
            exam_id=exam.id,
            exam_title=exam.title,
            subject_name=subject.name,
            subject_code=subject.code,
            score=submission.score,
            total_correct=submission.total_correct,
            total_questions=submission.total_questions or exam.total_questions,
            completed_seconds=submission.completed_seconds,
            submitted_at=submission.submitted_at,
        )
        for submission, exam, subject in rows
    ]


@router.get("/me/mistakes", response_model=List[UserMistakeItem])
def get_my_mistakes(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(ExamSubmission, ExamQuestion, Question, Exam, Subject)
        .join(Exam, ExamSubmission.exam_id == Exam.id)
        .join(ExamQuestion, ExamQuestion.exam_id == Exam.id)
        .join(Question, ExamQuestion.question_id == Question.id)
        .join(Subject, Exam.subject_id == Subject.id)
        .filter(ExamSubmission.user_id == user.id)
        .order_by(ExamSubmission.submitted_at.desc())
        .limit(5000)
        .all()
    )

    mistakes = {}
    for submission, exam_question, question, exam, subject in rows:
        answers = submission.selected_answers or {}
        selected = answers.get(str(exam_question.question_order)) or answers.get(str(question.id))
        if (selected or "").strip().upper() == question.correct_option.strip().upper():
            continue

        item = mistakes.get(question.id)
        if item is None:
            item = {
                "question_id": question.id,
                "subject_name": subject.name,
                "exam_title": exam.title,
                "content": question.content,
                "option_a": question.option_a,
                "option_b": question.option_b,
                "option_c": question.option_c,
                "option_d": question.option_d,
                "student_answer": selected,
                "correct_answer": question.correct_option,
                "raw_explanation": question.raw_explanation,
                "difficulty": question.difficulty,
                "chapter": question.chapter,
                "mistake_count": 0,
                "last_missed_at": submission.submitted_at,
            }
            mistakes[question.id] = item
        item["mistake_count"] += 1

    return sorted(mistakes.values(), key=lambda item: item["mistake_count"], reverse=True)
