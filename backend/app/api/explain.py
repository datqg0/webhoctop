from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ExplainRequest, ExplainResponse, QuestionChatRequest, QuestionChatResponse
from app.services.rag_service import rag_service

router = APIRouter(prefix="", tags=["RAG Explanation"])

@router.post("/explain", response_model=ExplainResponse)
def explain_question(payload: ExplainRequest, db: Session = Depends(get_db)):
    try:
        response = rag_service.explain_question(
            db=db,
            question_id=payload.question_id,
            student_answer=payload.student_answer
        )
        return response
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi tạo lời giải AI: {str(e)}")

@router.post("/chat/explain", response_model=QuestionChatResponse)
def chat_about_question(payload: QuestionChatRequest, db: Session = Depends(get_db)):
    try:
        return rag_service.chat_about_question(
            db=db,
            question_id=payload.question_id,
            message=payload.message,
            student_answer=payload.student_answer,
            history=payload.history,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi chat với AI: {str(e)}")
