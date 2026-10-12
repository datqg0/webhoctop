from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from sqlalchemy import inspect
from app.models import Question
from app.api import exams, questions, explain, knowledge, auth
from seed_data import seed_initial_data, seed_filter_demo_questions
from full_exam_seed import seed_full_practice_catalog

def ensure_question_filter_columns():
    columns = {column["name"] for column in inspect(engine).get_columns("questions")}
    migrations = {
        "topic": "VARCHAR(200)",
        "lesson": "VARCHAR(200)",
        "grade": "INTEGER NOT NULL DEFAULT 12",
    }
    with engine.begin() as connection:
        for name, sql_type in migrations.items():
            if name not in columns:
                connection.exec_driver_sql(f"ALTER TABLE questions ADD COLUMN {name} {sql_type}")

    db = SessionLocal()
    try:
        seeded_metadata = {
            1001: ("Khảo sát hàm số", "Cực trị của hàm số"),
            1002: ("Khảo sát hàm số", "Đường tiệm cận"),
            1003: ("Khảo sát hàm số", "Giá trị lớn nhất, nhỏ nhất"),
            1004: ("Hình học Oxyz", "Phương trình mặt phẳng"),
            1005: ("Dao động cơ", "Dao động điều hòa"),
            1006: ("Dao động cơ", "Con lắc đơn"),
            1007: ("Este - Lipit", "Phản ứng thủy phân este"),
        }
        for question in db.query(Question).all():
            subject_code = question.subject.code if question.subject else ""
            chapter = (question.chapter or "").strip()
            seeded_topic, seeded_lesson = seeded_metadata.get(question.id, (None, None))
            if not question.topic:
                if seeded_topic:
                    question.topic = seeded_topic
                elif subject_code == "toan" and "mặt phẳng" in chapter.lower():
                    question.topic = "Hình học Oxyz"
                elif subject_code == "toan":
                    question.topic = "Khảo sát hàm số"
                elif subject_code == "ly":
                    question.topic = "Dao động cơ"
                else:
                    question.topic = chapter or "Chưa phân loại"
            if not question.lesson:
                question.lesson = seeded_lesson or chapter or "Chưa phân loại"
            if question.grade is None:
                question.grade = 12
        db.commit()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Apply additive schema changes and idempotent seed data before serving requests.
    Base.metadata.create_all(bind=engine)
    ensure_question_filter_columns()
    db = SessionLocal()
    try:
        seed_initial_data(db)
        seed_filter_demo_questions(db)
        seed_full_practice_catalog(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="DP EXAM: luyện thi trắc nghiệm và giải thích bằng AI RAG",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(exams.router, prefix=settings.API_V1_STR)
app.include_router(questions.router, prefix=settings.API_V1_STR)
app.include_router(explain.router, prefix=settings.API_V1_STR)
app.include_router(knowledge.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs",
        "features": [
            "DP EXAM Practice Engine",
            "Gemini grounded explanations",
            "Gemini embedding retrieval",
            "Neon Serverless Postgres / pgvector Support"
        ]
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "FastAPI Exam AI"}
