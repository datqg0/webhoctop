from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import KnowledgeDocument, KnowledgeChunk
from app.schemas import DocumentResponse
from app.services.ingestion_service import ingestion_service
from app.services.gemini_service import gemini_service
from app.auth import require_admin
import json

router = APIRouter(prefix="/knowledge", tags=["Knowledge Ingestion (RAG)"])

@router.get("/documents", response_model=List[DocumentResponse])
def get_documents(db: Session = Depends(get_db), _admin: str = Depends(require_admin)):
    return db.query(KnowledgeDocument).order_by(KnowledgeDocument.created_at.desc()).all()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    title: str = Form(...),
    subject_code: str = Form(...),
    doc_type: str = Form(...), # 'pdf' | 'slide' | 'qa_bank'
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _admin: str = Depends(require_admin)
):
    if not gemini_service.is_configured:
        raise HTTPException(status_code=503, detail="Cần cấu hình GEMINI_API_KEY để phân tích và lập chỉ mục tài liệu.")

    content = await file.read()
    filename = file.filename or "uploaded_file"
    if not content:
        raise HTTPException(status_code=400, detail="Tệp tải lên đang trống.")
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Dung lượng tệp tối đa là 20 MB.")

    expected_extension = {"pdf": ".pdf", "slide": ".pptx", "qa_bank": ".json"}.get(doc_type)
    if not expected_extension:
        raise HTTPException(status_code=400, detail="Loại tài liệu không được hỗ trợ.")
    if not filename.lower().endswith(expected_extension):
        raise HTTPException(status_code=400, detail=f"Loại tài liệu này cần tệp {expected_extension}.")

    if doc_type == "pdf":
        try:
            doc = ingestion_service.process_pdf(db, title, subject_code, content, filename)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    elif doc_type == "slide":
        try:
            doc = ingestion_service.process_pptx(db, title, subject_code, content, filename)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    elif doc_type == "qa_bank":
        # Expecting JSON array of items
        try:
            items = json.loads(content.decode("utf-8"))
            if not isinstance(items, list) or not all(isinstance(item, dict) for item in items):
                raise ValueError("Nội dung phải là một mảng các đối tượng JSON.")
            doc = ingestion_service.process_qa_bank(db, title, subject_code, items, filename)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"File JSON Q&A không hợp lệ: {e}")
    else:
        raise HTTPException(status_code=400, detail="Loại tài liệu không được hỗ trợ (chỉ nhận pdf, slide, qa_bank)")

    return doc

@router.post("/seed-sample")
def seed_sample_knowledge(db: Session = Depends(get_db), _admin: str = Depends(require_admin)):
    """
    Seed sample textbook and slide chunks for instant RAG testing
    """
    if not gemini_service.is_configured:
        raise HTTPException(status_code=503, detail="Cần cấu hình GEMINI_API_KEY để lập chỉ mục tài liệu mẫu.")

    sample_docs = [
        {
            "title": "SGK Giải Tích 12 - Khảo Sát Sự Biến Thiên Và Vẽ Đồ Thị Hàm Số",
            "doc_type": "pdf",
            "subject_code": "toan",
            "file_name": "giai_tich_12_ch1.pdf",
            "chunks": [
                {
                    "text": "Định lý 1 (Tính đơn điệu của hàm số): Cho hàm số y = f(x) có đạo hàm trên khoảng K. Nếu f'(x) > 0 với mọi x thuộc K thì hàm số đồng biến trên K. Nếu f'(x) < 0 với mọi x thuộc K thì hàm số nghịch biến trên K. Cực trị của hàm số xảy ra tại các điểm mà tại đó đạo hàm bằng 0 hoặc không xác định và đạo hàm đổi dấu khi qua điểm đó.",
                    "page": "Trang 8",
                    "section": "Bài 1: Sự đồng biến, nghịch biến của hàm số"
                },
                {
                    "text": "Quy tắc tìm tiệm cận của đồ thị hàm phân thức y = (ax + b) / (cx + d) (với c khác 0, ad - bc khác 0): Tiệm cận đứng là đường thẳng x = -d/c; Tiệm cận ngang là đường thẳng y = a/c. Điểm I(-d/c; a/c) là tâm đối xứng của đồ thị hypebol.",
                    "page": "Trang 30",
                    "section": "Bài 4: Đường tiệm cận của đồ thị hàm số"
                }
            ]
        },
        {
            "title": "Slide Bài Giảng: Dao Động Điều Hòa & Con Lắc Đơn",
            "doc_type": "slide",
            "subject_code": "ly",
            "file_name": "slide_vat_ly_ch1.pptx",
            "chunks": [
                {
                    "text": "Phương trình dao động điều hòa có dạng: x = A*cos(omega*t + phi). Trong đó A là biên độ dao động (A > 0), omega là tần số góc (rad/s), phi là pha ban đầu tại thời điểm t = 0. Vận tốc v = x' = -omega*A*sin(omega*t + phi), đạt giá trị cực đại v_max = omega*A khi qua vị trí cân bằng theo chiều dương.",
                    "page": "Slide 5",
                    "section": "Định nghĩa và các đại lượng dao động điều hòa"
                },
                {
                    "text": "Chu kỳ dao động của con lắc đơn: T = 2*pi*sqrt(l/g). Chu kỳ T chỉ phụ thuộc vào chiều dài dây treo l và gia tốc trọng trường g tại nơi treo con lắc, hoàn toàn không phụ thuộc vào khối lượng m của vật nặng.",
                    "page": "Slide 14",
                    "section": "Khảo sát dao động con lắc đơn"
                }
            ]
        },
        {
            "title": "Tài Liệu Chuyên Đề: Este - Lipit & Phản Ứng Thủy Phân",
            "doc_type": "qa_bank",
            "subject_code": "hoa",
            "file_name": "chuyen_de_este_lipit.json",
            "chunks": [
                {
                    "text": "Phản ứng thủy phân Este trong môi trường kiềm (Phản ứng xà phòng hóa): RCOOR' + NaOH -> RCOONa + R'OH. Đây là phản ứng một chiều. Đặc biệt este của phenol có dạng RCOOC6H5 + 2NaOH -> RCOONa + C6H5ONa + H2O sinh ra hai muối và nước.",
                    "page": "Mục 2.3",
                    "section": "Tính chất hóa học đặc trưng của Este"
                }
            ]
        }
    ]

    created = 0
    for sdoc in sample_docs:
        existing = db.query(KnowledgeDocument).filter(KnowledgeDocument.title == sdoc["title"]).first()
        if not existing:
            doc = KnowledgeDocument(
                title=sdoc["title"],
                doc_type=sdoc["doc_type"],
                subject_code=sdoc["subject_code"],
                file_name=sdoc["file_name"],
                total_chunks=len(sdoc["chunks"])
            )
            db.add(doc)
            db.flush()
            for ch in sdoc["chunks"]:
                emb = gemini_service.get_embedding(ch["text"], task_type="retrieval_document")
                chunk = KnowledgeChunk(
                    doc_id=doc.id,
                    chunk_text=ch["text"],
                    page_or_slide=ch["page"],
                    section_title=ch["section"],
                    embedding_json=json.dumps(emb)
                )
                db.add(chunk)
            created += 1

    db.commit()
    return {"message": f"Đã nạp thành công {created} bộ tài liệu mẫu"}


@router.post("/reindex")
def reindex_knowledge(db: Session = Depends(get_db), _admin: str = Depends(require_admin)):
    if not gemini_service.is_configured:
        raise HTTPException(status_code=503, detail="Cần cấu hình GEMINI_API_KEY để lập chỉ mục tài liệu.")

    chunks = db.query(KnowledgeChunk).all()
    updated = 0
    for chunk in chunks:
        embedding = gemini_service.get_embedding(chunk.chunk_text, task_type="retrieval_document")
        if not embedding:
            db.rollback()
            raise HTTPException(status_code=502, detail="Không thể tạo vector cho tài liệu. Vui lòng thử lại.")
        chunk.embedding_json = json.dumps(embedding)
        updated += 1

    db.commit()
    return {"updated_chunks": updated, "message": f"Đã lập chỉ mục lại {updated} đoạn tài liệu."}
