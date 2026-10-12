from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime

# Subject Schemas
class SubjectBase(BaseModel):
    name: str
    code: str
    icon: Optional[str] = "BookOpen"
    description: Optional[str] = ""

class SubjectResponse(SubjectBase):
    id: str

    class Config:
        from_attributes = True

# Question Schemas
class QuestionBase(BaseModel):
    id: int
    content: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    difficulty: int
    chapter: Optional[str] = ""
    topic: Optional[str] = ""
    lesson: Optional[str] = ""
    grade: Optional[int] = 12
    raw_explanation: Optional[str] = ""
    tags: Optional[str] = ""

class QuestionInExam(BaseModel):
    id: int
    order: int
    content: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    raw_explanation: Optional[str] = ""
    difficulty: int
    chapter: Optional[str] = ""
    topic: Optional[str] = ""
    lesson: Optional[str] = ""
    grade: Optional[int] = 12

class QuestionResponse(QuestionBase):
    subject_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Exam Schemas
class ExamSummary(BaseModel):
    id: str
    title: str
    subject_id: str
    subject_name: Optional[str] = ""
    subject_code: Optional[str] = ""
    duration_minutes: int
    total_questions: int
    description: Optional[str] = ""
    created_at: datetime

    class Config:
        from_attributes = True

class ExamDetail(ExamSummary):
    questions: List[QuestionInExam]

# Submission Schemas
class SubmitExamRequest(BaseModel):
    user_name: Optional[str] = "Thí sinh tự do"
    selected_answers: Dict[str, str] # {"1": "A", "2": "B"} (order or question_id)
    completed_seconds: int

class QuestionEvaluation(BaseModel):
    question_id: int
    order: int
    content: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    student_answer: Optional[str]
    correct_answer: str
    is_correct: bool
    raw_explanation: Optional[str] = ""

class SubmissionResult(BaseModel):
    submission_id: str
    exam_id: str
    user_name: str
    score: float
    total_correct: int
    total_questions: int
    completed_seconds: int
    submitted_at: datetime
    questions_review: List[QuestionEvaluation]

# Explain / RAG Schemas
class ExplainRequest(BaseModel):
    question_id: int
    student_answer: Optional[str] = None
    force_refresh: Optional[bool] = False

class Citation(BaseModel):
    doc_title: str
    doc_type: str
    page_or_slide: str
    section_title: Optional[str] = ""
    snippet: str
    similarity_score: float

class ExplainResponse(BaseModel):
    question_id: int
    correct_answer: str
    student_answer: Optional[str]
    is_correct: Optional[bool]
    explanation: str
    method_summary: Optional[str] = ""
    citations: List[Citation]
    grounded_in_school_docs: bool

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=3000)

class QuestionChatRequest(BaseModel):
    question_id: int
    message: str = Field(min_length=1, max_length=2000)
    student_answer: Optional[str] = None
    history: List[ChatMessage] = Field(default_factory=list, max_length=12)

class QuestionChatResponse(BaseModel):
    answer: str
    citations: List[Citation]

# Knowledge Schemas
class DocumentResponse(BaseModel):
    id: str
    title: str
    doc_type: str
    subject_code: str
    file_name: str
    total_chunks: int
    created_at: datetime

    class Config:
        from_attributes = True
