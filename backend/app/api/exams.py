from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Exam, ExamQuestion, Question, Subject, ExamSubmission
from app.schemas import (
    ExamSummary, ExamDetail, QuestionInExam,
    SubmitExamRequest, SubmissionResult, QuestionEvaluation,
    SubjectResponse
)

router = APIRouter(prefix="", tags=["Exams & Subjects"])

@router.get("/subjects", response_model=List[SubjectResponse])
def get_subjects(db: Session = Depends(get_db)):
    return db.query(Subject).all()

@router.get("/exams", response_model=List[ExamSummary])
def get_exams(
    subject_code: Optional[str] = None,
    q: Optional[str] = Query(None, description="Tìm theo tên đề hoặc nội dung câu hỏi"),
    topic: Optional[str] = None,
    lesson: Optional[str] = None,
    grade: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Exam).filter(Exam.is_active == True)
    if subject_code:
        query = query.join(Subject).filter(Subject.code == subject_code)
    if topic or lesson or grade is not None or (q and q.strip()):
        query = query.join(ExamQuestion).join(Question)
        if topic:
            query = query.filter(Question.topic == topic)
        if lesson:
            query = query.filter(Question.lesson == lesson)
        if grade is not None:
            query = query.filter(Question.grade == grade)
        if q and q.strip():
            term = f"%{q.strip()}%"
            query = query.filter(or_(
                Exam.title.ilike(term), Exam.description.ilike(term),
                Question.content.ilike(term), Question.chapter.ilike(term),
                Question.topic.ilike(term), Question.lesson.ilike(term),
                Question.tags.ilike(term),
            ))
        query = query.distinct()

    exams = query.order_by(Exam.created_at.desc()).all()
    summaries = []
    for ex in exams:
        summaries.append(ExamSummary(
            id=ex.id,
            title=ex.title,
            subject_id=ex.subject_id,
            subject_name=ex.subject.name if ex.subject else "",
            subject_code=ex.subject.code if ex.subject else "",
            duration_minutes=ex.duration_minutes,
            total_questions=ex.total_questions,
            description=ex.description,
            created_at=ex.created_at
        ))
    return summaries

@router.get("/exams/filters")
def get_exam_filters(
    subject_code: Optional[str] = None,
    topic: Optional[str] = None,
    db: Session = Depends(get_db),
):
    questions = db.query(Question).join(ExamQuestion).join(Exam).filter(Exam.is_active == True)
    if subject_code:
        questions = questions.join(Subject).filter(Subject.code == subject_code)
    topics = questions.with_entities(Question.topic).filter(Question.topic.isnot(None), Question.topic != "").distinct()
    lesson_query = questions
    if topic:
        lesson_query = lesson_query.filter(Question.topic == topic)
    lessons = lesson_query.with_entities(Question.lesson).filter(Question.lesson.isnot(None), Question.lesson != "").distinct()
    grades = questions.with_entities(Question.grade).filter(Question.grade.isnot(None)).distinct()
    subjects = db.query(Subject).join(Exam, Exam.subject_id == Subject.id).filter(Exam.is_active == True).distinct().order_by(Subject.name).all()
    return {
        "subjects": [{"code": subject.code, "name": subject.name} for subject in subjects],
        "topics": sorted(value[0] for value in topics.all()),
        "lessons": sorted(value[0] for value in lessons.all()),
        "grades": sorted(value[0] for value in grades.all()),
    }

@router.get("/exams/{exam_id}", response_model=ExamDetail)
def get_exam_detail(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Không tìm thấy đề thi")

    links = (
        db.query(ExamQuestion, Question)
        .join(Question, ExamQuestion.question_id == Question.id)
        .filter(ExamQuestion.exam_id == exam_id)
        .order_by(ExamQuestion.question_order.asc())
        .all()
    )

    questions_list = []
    for eq, q in links:
        questions_list.append(QuestionInExam(
            id=q.id,
            order=eq.question_order,
            content=q.content,
            option_a=q.option_a,
            option_b=q.option_b,
            option_c=q.option_c,
            option_d=q.option_d,
            correct_option=q.correct_option,
            raw_explanation=q.raw_explanation,
            difficulty=q.difficulty,
            chapter=q.chapter
        ))

    return ExamDetail(
        id=exam.id,
        title=exam.title,
        subject_id=exam.subject_id,
        subject_name=exam.subject.name if exam.subject else "",
        subject_code=exam.subject.code if exam.subject else "",
        duration_minutes=exam.duration_minutes,
        total_questions=len(questions_list),
        description=exam.description,
        created_at=exam.created_at,
        questions=questions_list
    )

@router.post("/exams/{exam_id}/submit", response_model=SubmissionResult)
def submit_exam(exam_id: str, payload: SubmitExamRequest, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Không tìm thấy đề thi")

    links = (
        db.query(ExamQuestion, Question)
        .join(Question, ExamQuestion.question_id == Question.id)
        .filter(ExamQuestion.exam_id == exam_id)
        .order_by(ExamQuestion.question_order.asc())
        .all()
    )

    if not links:
        raise HTTPException(status_code=400, detail="Đề thi chưa có câu hỏi")

    total_correct = 0
    questions_review = []

    for eq, q in links:
        order_str = str(eq.question_order)
        # Check by order or by question ID
        chosen = payload.selected_answers.get(order_str) or payload.selected_answers.get(str(q.id))
        is_correct = False
        if chosen and chosen.strip().upper() == q.correct_option.strip().upper():
            is_correct = True
            total_correct += 1

        questions_review.append(QuestionEvaluation(
            question_id=q.id,
            order=eq.question_order,
            content=q.content,
            option_a=q.option_a,
            option_b=q.option_b,
            option_c=q.option_c,
            option_d=q.option_d,
            student_answer=chosen,
            correct_answer=q.correct_option,
            is_correct=is_correct,
            raw_explanation=q.raw_explanation
        ))

    total_q = len(links)
    score = round((total_correct / total_q) * 10.0, 2)

    submission = ExamSubmission(
        exam_id=exam_id,
        user_name=payload.user_name,
        selected_answers=payload.selected_answers,
        score=score,
        total_correct=total_correct,
        completed_seconds=payload.completed_seconds
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return SubmissionResult(
        submission_id=submission.id,
        exam_id=exam_id,
        user_name=submission.user_name,
        score=score,
        total_correct=total_correct,
        total_questions=total_q,
        completed_seconds=submission.completed_seconds,
        submitted_at=submission.submitted_at,
        questions_review=questions_review
    )
