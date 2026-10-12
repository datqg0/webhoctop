import json
from sqlalchemy.orm import Session
from app.models import Subject, Question, Exam, ExamQuestion, KnowledgeDocument, KnowledgeChunk
from app.services.gemini_service import gemini_service

def seed_initial_data(db: Session):
    # Check if already seeded
    if db.query(Subject).first():
        return

    print("--- [SEEDING] Khoi tao du lieu mau phong cach Moon.vn ---")

    # 1. Subjects
    subjects = [
        Subject(id="sub-toan", name="Toán học", code="toan", icon="Calculator", description="Giải tích & Hình học không gian"),
        Subject(id="sub-ly", name="Vật lý", code="ly", icon="Atom", description="Dao động cơ, Sóng cơ, Điện xoay chiều"),
        Subject(id="sub-hoa", name="Hóa học", code="hoa", icon="FlaskConical", description="Hóa hữu cơ Este-Lipit, Kim loại"),
        Subject(id="sub-sinh", name="Sinh học", code="sinh", icon="Dna", description="Di truyền học, Tiến hóa & Sinh thái"),
        Subject(id="sub-anh", name="Tiếng Anh", code="anh", icon="Languages", description="Ngữ pháp, Đọc hiểu & Điền từ"),
    ]
    db.add_all(subjects)
    db.flush()

    # 2. Sample Questions (ID 1001 -> 1010) với công thức LaTeX chuẩn Moon.vn
    questions = [
        Question(
            id=1001,
            subject_id="sub-toan",
            content="Cho hàm số $y = f(x)$ có bảng xét dấu đạo hàm như sau: $f'(x) > 0$ trên khoảng $(-\\infty; 1)$ và $(3; +\\infty)$, $f'(x) < 0$ trên khoảng $(1; 3)$. Mệnh đề nào dưới đây đúng?",
            option_a="Hàm số nghịch biến trên khoảng $(-\\infty; 1)$.",
            option_b="Hàm số đồng biến trên khoảng $(1; 3)$.",
            option_c="Hàm số đạt cực đại tại điểm $x = 1$.",
            option_d="Hàm số đạt cực tiểu tại điểm $x = 1$.",
            correct_option="C",
            difficulty=2,
            chapter="Ứng dụng đạo hàm khảo sát hàm số",
            topic="Khảo sát hàm số", lesson="Cực trị của hàm số", grade=12,
            raw_explanation="Đạo hàm $f'(x)$ đổi dấu từ dương sang âm khi qua điểm $x = 1$, do đó theo định lý về cực trị, hàm số đạt cực đại tại $x = 1$.",
            tags="cực trị, đạo hàm"
        ),
        Question(
            id=1002,
            subject_id="sub-toan",
            content="Đồ thị hàm số $y = \\frac{2x - 1}{x + 1}$ có đường tiệm cận đứng là đường thẳng nào sau đây?",
            option_a="$x = 2$",
            option_b="$x = -1$",
            option_c="$y = 2$",
            option_d="$y = -1$",
            correct_option="B",
            difficulty=1,
            chapter="Đường tiệm cận của đồ thị hàm số",
            topic="Khảo sát hàm số", lesson="Đường tiệm cận", grade=12,
            raw_explanation="Tiệm cận đứng của hàm phân thức $y = \\frac{ax + b}{cx + d}$ là nghiệm của mẫu $cx + d = 0 \\Leftrightarrow x + 1 = 0 \\Leftrightarrow x = -1$.",
            tags="tiệm cận đứng, phân thức"
        ),
        Question(
            id=1003,
            subject_id="sub-toan",
            content="Giá trị lớn nhất của hàm số $f(x) = x^3 - 3x + 2$ trên đoạn $[0; 2]$ bằng bao nhiêu?",
            option_a="2",
            option_b="4",
            option_c="0",
            option_d="6",
            correct_option="B",
            difficulty=2,
            chapter="Giá trị lớn nhất và nhỏ nhất của hàm số",
            topic="Khảo sát hàm số", lesson="Giá trị lớn nhất, nhỏ nhất", grade=12,
            raw_explanation="Ta có $f'(x) = 3x^2 - 3 = 0 \\Leftrightarrow x = 1 \\in [0; 2]$ hoặc $x = -1 \\notin [0; 2]$. Tính $f(0) = 2, f(1) = 0, f(2) = 8 - 6 + 2 = 4$. Vậy $\\max_{[0; 2]} f(x) = 4$ tại $x = 2$.",
            tags="GTLN, GTNN"
        ),
        Question(
            id=1004,
            subject_id="sub-toan",
            content="Trong không gian $Oxyz$, cho mặt phẳng $(P): 2x - y + 3z - 5 = 0$. Một vectơ pháp tuyến của $(P)$ là:",
            option_a="$\\vec{n}_1 = (2; -1; 3)$",
            option_b="$\\vec{n}_2 = (2; 1; 3)$",
            option_c="$\\vec{n}_3 = (-2; -1; 3)$",
            option_d="$\\vec{n}_4 = (2; -1; -5)$",
            correct_option="A",
            difficulty=1,
            chapter="Phương trình mặt phẳng",
            topic="Hình học Oxyz", lesson="Phương trình mặt phẳng", grade=12,
            raw_explanation="Mặt phẳng $(P): Ax + By + Cz + D = 0$ có một vectơ pháp tuyến là $\\vec{n} = (A; B; C) = (2; -1; 3)$.",
            tags="Oxyz, pháp tuyến"
        ),
        Question(
            id=1005,
            subject_id="sub-ly",
            content="Một vật dao động điều hòa theo phương trình $x = 5\\cos(4\\pi t - \\frac{\\pi}{3})\\text{ (cm)}$. Pha ban đầu của dao động là:",
            option_a="$4\\pi\\text{ rad}$",
            option_b="$5\\text{ cm}$",
            option_c="$-\\frac{\\pi}{3}\\text{ rad}$",
            option_d="$\\frac{\\pi}{3}\\text{ rad}$",
            correct_option="C",
            difficulty=1,
            chapter="Dao động điều hòa",
            topic="Dao động cơ", lesson="Dao động điều hòa", grade=12,
            raw_explanation="Phương trình tổng quát $x = A\\cos(\\omega t + \\varphi)$. Đối chiếu ta có pha ban đầu $\\varphi = -\\frac{\\pi}{3}\\text{ rad}$.",
            tags="pha ban đầu, dao động"
        ),
        Question(
            id=1006,
            subject_id="sub-ly",
            content="Một con lắc đơn có chiều dài dây treo $l = 1\\text{ m}$ dao động tại nơi có gia tốc trọng trường $g = \\pi^2 \\approx 9.8\\text{ m/s}^2$. Chu kỳ dao động của con lắc là:",
            option_a="$T = 1\\text{ s}$",
            option_b="$T = 2\\text{ s}$",
            option_c="$T = 4\\text{ s}$",
            option_d="$T = 0.5\\text{ s}$",
            correct_option="B",
            difficulty=2,
            chapter="Con lắc đơn",
            topic="Dao động cơ", lesson="Con lắc đơn", grade=12,
            raw_explanation="Công thức chu kỳ con lắc đơn: $T = 2\\pi \\sqrt{\\frac{l}{g}} = 2\\pi \\sqrt{\\frac{1}{\\pi^2}} = 2\\text{ s}$.",
            tags="con lắc đơn, chu kỳ"
        ),
        Question(
            id=1007,
            subject_id="sub-hoa",
            content="Thủy phân hoàn toàn este $\\text{CH}_3\\text{COOC}_2\\text{H}_5$ trong dung dịch $\\text{NaOH}$ đun nóng, thu được sản phẩm gồm:",
            option_a="$\\text{HCOONa}$ và $\\text{C}_2\\text{H}_5\\text{OH}$",
            option_b="$\\text{CH}_3\\text{COONa}$ và $\\text{CH}_3\\text{OH}$",
            option_c="$\\text{CH}_3\\text{COONa}$ và $\\text{C}_2\\text{H}_5\\text{OH}$",
            option_d="$\\text{C}_2\\text{H}_5\\text{COONa}$ và $\\text{CH}_3\\text{OH}$",
            correct_option="C",
            difficulty=1,
            chapter="Este - Lipit",
            topic="Este - Lipit", lesson="Phản ứng thủy phân este", grade=12,
            raw_explanation="Phương trình hóa học: $\\text{CH}_3\\text{COOC}_2\\text{H}_5 + \\text{NaOH} \\rightarrow \\text{CH}_3\\text{COONa} + \\text{C}_2\\text{H}_5\\text{OH}$ (Natri axetat và Etanol).",
            tags="este, thủy phân, xà phòng hóa"
        )
    ]
    db.add_all(questions)
    db.flush()

    # 3. Sample Exam
    exam_toan = Exam(
        id="exam-toan-01",
        title="Đề Thi Thử Tốt Nghiệp THPT - Môn Toán (Chuyên Đề Hàm Số & Khảo Sát)",
        subject_id="sub-toan",
        duration_minutes=45,
        total_questions=4,
        description="Đề thi rèn luyện kỹ năng nhận biết bảng biến thiên, cực trị, tiệm cận và giá trị lớn nhất nhỏ nhất chuẩn format Moon.vn.",
        is_active=True
    )
    exam_ly = Exam(
        id="exam-ly-01",
        title="Đề Thi Rèn Luyện Vật Lý 12 - Chuyên Đề Dao Động Cơ Học",
        subject_id="sub-ly",
        duration_minutes=30,
        total_questions=2,
        description="Tổng hợp các câu hỏi điển hình về phương trình dao động điều hòa và con lắc đơn.",
        is_active=True
    )
    db.add_all([exam_toan, exam_ly])
    db.flush()

    # 4. Link questions to Exam
    db.add_all([
        ExamQuestion(exam_id="exam-toan-01", question_id=1001, question_order=1),
        ExamQuestion(exam_id="exam-toan-01", question_id=1002, question_order=2),
        ExamQuestion(exam_id="exam-toan-01", question_id=1003, question_order=3),
        ExamQuestion(exam_id="exam-toan-01", question_id=1004, question_order=4),
        ExamQuestion(exam_id="exam-ly-01", question_id=1005, question_order=1),
        ExamQuestion(exam_id="exam-ly-01", question_id=1006, question_order=2),
    ])

    # 5. Pre-seed Knowledge Documents with Vectors
    doc_toan = KnowledgeDocument(
        id="doc-toan-sgk",
        title="SGK Giải Tích 12 - Chương 1: Ứng Dụng Đạo Hàm Khảo Sát Hàm Số",
        doc_type="pdf",
        subject_code="toan",
        file_name="sgk_giai_tich_12_ch1.pdf",
        total_chunks=3
    )
    doc_ly = KnowledgeDocument(
        id="doc-ly-slide",
        title="Slide Bài Giảng Vật Lý 12 - Bài 1 & 2: Dao Động Cơ & Con Lắc Đơn",
        doc_type="slide",
        subject_code="ly",
        file_name="slide_vat_ly_ch1.pptx",
        total_chunks=2
    )
    db.add_all([doc_toan, doc_ly])
    db.flush()

    toan_chunks = [
        (
            "Định lý Cực trị: Nếu hàm số y = f(x) liên tục trên khoảng (a; b) và đạo hàm f'(x) đổi dấu từ dương sang âm khi x đi qua điểm x0 thì x0 là điểm cực đại của hàm số. Ngược lại, nếu f'(x) đổi dấu từ âm sang dương khi qua x0 thì x0 là điểm cực tiểu.",
            "Trang 15",
            "Mục 2: Điều kiện đủ để hàm số có cực trị"
        ),
        (
            "Đường tiệm cận đứng của đồ thị hàm số y = f(x) là đường thẳng x = x0 nếu ít nhất một trong các điều kiện sau thỏa mãn: lim (x->x0+) f(x) = +- vô cùng hoặc lim (x->x0-) f(x) = +- vô cùng. Với hàm y = (ax+b)/(cx+d), tiệm cận đứng là x = -d/c, tiệm cận ngang là y = a/c.",
            "Trang 28",
            "Mục 4: Đường tiệm cận đứng và tiệm cận ngang"
        ),
        (
            "Quy tắc tìm Giá trị lớn nhất và nhỏ nhất trên đoạn [a; b]: 1. Tìm các điểm x_i thuộc khoảng (a; b) mà tại đó f'(x_i) = 0 hoặc f'(x) không xác định. 2. Tính f(a), f(b) và các f(x_i). 3. Số lớn nhất trong các giá trị đó là GTLN, số nhỏ nhất là GTNN.",
            "Trang 22",
            "Mục 3: Giá trị lớn nhất và nhỏ nhất của hàm số trên một đoạn"
        )
    ]

    ly_chunks = [
        (
            "Đại lượng dao động điều hòa: Phương trình li độ x = A*cos(omega*t + phi). A là biên độ (độ lệch cực đại khỏi VTCB, A > 0). omega là tần số góc (rad/s). (omega*t + phi) là pha dao động tại thời điểm t. phi là pha ban đầu tại t = 0.",
            "Slide 6",
            "Slide: Khảo sát phương trình dao động điều hòa"
        ),
        (
            "Con lắc đơn: Gồm một vật nhỏ khối lượng m treo vào đầu một sợi dây không dãn chiều dài l. Khi góc lệch nhỏ (alpha <= 10 độ), con lắc dao động điều hòa với chu kỳ T = 2*pi*sqrt(l/g). Chu kỳ không phụ thuộc vào biên độ và không phụ thuộc vào khối lượng m của vật nặng.",
            "Slide 12",
            "Slide: Chu kỳ con lắc đơn và các yếu tố ảnh hưởng"
        )
    ]

    for text, page, sec in toan_chunks:
        emb = gemini_service.get_embedding(text, task_type="retrieval_document")
        db.add(KnowledgeChunk(
            doc_id=doc_toan.id,
            chunk_text=text,
            page_or_slide=page,
            section_title=sec,
            embedding_json=json.dumps(emb)
        ))

    for text, page, sec in ly_chunks:
        emb = gemini_service.get_embedding(text, task_type="retrieval_document")
        db.add(KnowledgeChunk(
            doc_id=doc_ly.id,
            chunk_text=text,
            page_or_slide=page,
            section_title=sec,
            embedding_json=json.dumps(emb)
        ))

    db.commit()
    print("--- [SEEDING COMPLETE] Da nap thanh cong du lieu mau Moon.vn ---")


def seed_filter_demo_questions(db: Session):
    """Add a small, repeatable dataset so grade/topic/lesson dropdowns have coverage."""
    math = db.query(Subject).filter(Subject.code == "toan").first()
    if not math:
        return

    samples = [
        Question(
            id=990001,
            subject_id=math.id,
            content="Tập hợp số tự nhiên $\\mathbb{N}$ được viết là tập hợp nào sau đây?",
            option_a="$\\{1, 2, 3, \\ldots\\}$",
            option_b="$\\{0, 1, 2, 3, \\ldots\\}$",
            option_c="$\\{\\ldots, -2, -1, 0, 1, 2, \\ldots\\}$",
            option_d="$\\{0, 1\\}$",
            correct_option="B",
            difficulty=1,
            chapter="Mệnh đề và tập hợp",
            topic="Mệnh đề và tập hợp",
            lesson="Tập hợp số tự nhiên",
            grade=10,
            raw_explanation="Theo quy ước phổ thông, tập hợp số tự nhiên gồm 0 và các số nguyên dương: $\\mathbb{N} = \\{0, 1, 2, 3, \\ldots\\}$.",
            tags="mock, tập hợp, lớp 10",
        ),
        Question(
            id=990002,
            subject_id=math.id,
            content="Giá trị của $\\sin(\\frac{\\pi}{6})$ bằng bao nhiêu?",
            option_a="$0$",
            option_b="$\\frac{1}{2}$",
            option_c="$\\frac{\\sqrt{2}}{2}$",
            option_d="$1$",
            correct_option="B",
            difficulty=1,
            chapter="Hàm số lượng giác",
            topic="Hàm số lượng giác",
            lesson="Giá trị lượng giác cơ bản",
            grade=11,
            raw_explanation="Ta có $\\sin(\\frac{\\pi}{6}) = \\sin(30^\\circ) = \\frac{1}{2}$.",
            tags="mock, lượng giác, lớp 11",
        ),
    ]

    for sample in samples:
        if not db.query(Question).filter(Question.id == sample.id).first():
            db.add(sample)
    db.commit()
