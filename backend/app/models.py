import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Float, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False) # e.g. "Toán học", "Vật lý", "Hóa học"
    code = Column(String(20), unique=True, nullable=False) # e.g. "toan", "ly", "hoa"
    icon = Column(String(50), default="BookOpen")
    description = Column(String(255), default="")

    questions = relationship("Question", back_populates="subject")
    exams = relationship("Exam", back_populates="subject")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True) # ID 4-6 chữ số kiểu Moon.vn (1001, 1002...)
    subject_id = Column(String(36), ForeignKey("subjects.id"), nullable=False)
    content = Column(Text, nullable=False) # Hỗ trợ Markdown & LaTeX KaTeX
    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)
    correct_option = Column(String(1), nullable=False) # 'A', 'B', 'C', 'D'
    difficulty = Column(Integer, default=2) # 1: Nhận biết, 2: Thông hiểu, 3: Vận dụng, 4: Vận dụng cao
    chapter = Column(String(200), default="")
    topic = Column(String(200), default="")
    lesson = Column(String(200), default="")
    grade = Column(Integer, default=12, nullable=False)
    raw_explanation = Column(Text, default="") # Lời giải chuẩn của giáo viên
    tags = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    subject = relationship("Subject", back_populates="questions")
    exam_links = relationship("ExamQuestion", back_populates="question")

class Exam(Base):
    __tablename__ = "exams"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id"), nullable=False)
    duration_minutes = Column(Integer, default=50)
    total_questions = Column(Integer, default=40)
    description = Column(Text, default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    subject = relationship("Subject", back_populates="exams")
    exam_questions = relationship("ExamQuestion", back_populates="exam", order_by="ExamQuestion.question_order")
    submissions = relationship("ExamSubmission", back_populates="exam")

class ExamQuestion(Base):
    __tablename__ = "exam_questions"

    exam_id = Column(String(36), ForeignKey("exams.id"), primary_key=True)
    question_id = Column(Integer, ForeignKey("questions.id"), primary_key=True)
    question_order = Column(Integer, nullable=False) # 1 -> 40/50

    exam = relationship("Exam", back_populates="exam_questions")
    question = relationship("Question", back_populates="exam_links")

class ExamSubmission(Base):
    __tablename__ = "exam_submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    exam_id = Column(String(36), ForeignKey("exams.id"), nullable=False)
    user_id = Column(String(36), nullable=True, index=True)
    user_name = Column(String(100), default="Thí sinh tự do")
    selected_answers = Column(JSON, nullable=False) # {"1": "A", "2": "C", ...}
    score = Column(Float, nullable=False) # Thang điểm 10.0
    total_correct = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False, default=0)
    completed_seconds = Column(Integer, default=0)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    exam = relationship("Exam", back_populates="submissions")


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    google_sub = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    full_name = Column(String(100), nullable=False, default="")
    school = Column(String(200), nullable=False, default="")
    grade = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    doc_type = Column(String(20), nullable=False) # 'pdf', 'slide', 'qa_bank'
    subject_code = Column(String(20), nullable=False)
    file_name = Column(String(255), default="")
    total_chunks = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    chunks = relationship("KnowledgeChunk", back_populates="document", cascade="all, delete-orphan")

class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    doc_id = Column(String(36), ForeignKey("knowledge_documents.id"), nullable=False)
    chunk_text = Column(Text, nullable=False)
    page_or_slide = Column(String(50), default="") # e.g. "Trang 45", "Slide 12", "Câu 102"
    section_title = Column(String(200), default="")
    embedding_json = Column(Text, nullable=True) # Lưu trữ vector float[] dạng JSON string

    document = relationship("KnowledgeDocument", back_populates="chunks")
