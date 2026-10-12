from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Question, Subject
from app.schemas import QuestionResponse

router = APIRouter(prefix="/questions", tags=["Questions"])

@router.get("/search", response_model=List[QuestionResponse])
def search_questions(
    q: Optional[str] = Query(None, description="Tìm theo ID câu hỏi (VD: 1001) hoặc từ khóa"),
    subject_code: Optional[str] = None,
    topic: Optional[str] = None,
    lesson: Optional[str] = None,
    grade: Optional[int] = None,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Question)
    if q and q.strip():
        term = q.strip()
        if term.isdigit():
            # Moon.vn ID search direct match
            query = query.filter(Question.id == int(term))
        else:
            query = query.filter(
                or_(
                    Question.content.ilike(f"%{term}%"),
                    Question.chapter.ilike(f"%{term}%"),
                    Question.topic.ilike(f"%{term}%"),
                    Question.lesson.ilike(f"%{term}%"),
                    Question.tags.ilike(f"%{term}%")
                )
            )

    if subject_code:
        query = query.join(Question.subject).filter(Subject.code == subject_code)
    if topic:
        query = query.filter(Question.topic == topic)
    if lesson:
        query = query.filter(Question.lesson == lesson)
    if grade is not None:
        query = query.filter(Question.grade == grade)

    return query.limit(limit).all()

@router.get("/filters")
def get_question_filters(
    subject_code: Optional[str] = None,
    topic: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Question)
    if subject_code:
        query = query.join(Question.subject).filter(Subject.code == subject_code)
    topic_query = query.with_entities(Question.topic).filter(Question.topic.isnot(None), Question.topic != "").distinct()
    if topic:
        query = query.filter(Question.topic == topic)
    lessons = query.with_entities(Question.lesson).filter(Question.lesson.isnot(None), Question.lesson != "").distinct().all()
    grades = query.with_entities(Question.grade).filter(Question.grade.isnot(None)).distinct().all()
    subjects = db.query(Subject).join(Question, Question.subject_id == Subject.id).distinct().order_by(Subject.name).all()
    return {
        "subjects": [{"code": subject.code, "name": subject.name} for subject in subjects],
        "topics": sorted(value[0] for value in topic_query.all()),
        "lessons": sorted(value[0] for value in lessons),
        "grades": sorted(value[0] for value in grades),
    }

@router.get("/{question_id}", response_model=QuestionResponse)
def get_question_by_id(question_id: int, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy câu hỏi với ID {question_id}")
    return question
