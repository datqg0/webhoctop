# DP EXAM — Luyện tập trắc nghiệm có AI hỗ trợ

DP EXAM giúp học sinh luyện câu hỏi trắc nghiệm, tra cứu theo môn học, chủ đề, bài học và lớp, rồi hỏi AI về câu đang làm. Khi không tìm được tài liệu tham khảo phù hợp, giao diện sẽ báo rõ để học sinh tự đối chiếu.

---

## 🌟 Điểm Nhấn Cốt Lõi

1. **Luyện tập theo câu**:
   - Chọn bộ câu hỏi theo môn học hoặc tra cứu bằng ID và từ khóa.
   - Nhận phản hồi đáp án ngay, chuyển nhanh giữa các câu và hỏi AI trong cửa sổ chat.
   - **Hỗ trợ công thức Toán, Lý, Hóa (KaTeX)**: Render mượt mà mọi ký hiệu $\int, \lim, \vec{v}, \text{H}_2\text{SO}_4$.
2. **AI có nguồn tham khảo**:
   - AI tìm kiếm trong PDF, slide và bộ Q&A do quản trị viên nạp.
   - Lời giải hiển thị các tài liệu phù hợp; nếu không có nguồn, giao diện sẽ nói rõ.
3. **Bộ Công Nghệ Hiện Đại & Tiết Kiệm**:
   - **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons + KaTeX.
   - **Backend**: FastAPI (Python 3.11).
   - **AI**: Google GenAI SDK with Gemini Flash and Gemini Embedding.
   - **Database & Vector DB**: **Neon Serverless Postgres** (chuẩn Postgres, hỗ trợ `pgvector`, PgBouncer connection pooling).
   - **Hạ tầng triển khai**: **Vercel** (Frontend) + **Render** (Backend).

---

## 🏗️ Cấu Trúc Thư Mục

```
.
├── frontend/                     # React (Vite) App - Deploy Vercel
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json               # Cấu hình routing cho Vercel
│   └── src/
│       ├── components/           # Navbar, ExamTimer, QuestionCard, QuestionPalette, AIExplanationModal
│       ├── pages/                # HomePage, ExamRoomPage, ResultPage, QuestionSearchPage, AdminKnowledgePage
│       └── services/api.js       # Kết nối API Backend
│
├── backend/                      # FastAPI Backend - Deploy Render
│   ├── app/
│   │   ├── main.py               # Entrypoint FastAPI & CORS
│   │   ├── config.py             # Cấu hình Settings & Biến môi trường
│   │   ├── database.py           # Kết nối Neon Postgres / SQLite fallback
│   │   ├── models.py             # SQLAlchemy ORM (Question, Exam, KnowledgeChunk...)
│   │   ├── schemas.py            # Pydantic Schemas
│   │   ├── api/                  # Endpoints: /exams, /questions, /explain, /knowledge
│   │   └── services/             # Gemini API, RAG Pipeline, Document Ingestion (PDF/PPTX)
│   ├── seed_data.py              # Dữ liệu đề thi mẫu Toán/Lý/Hóa chuẩn Moon.vn
│   ├── requirements.txt
│   ├── Dockerfile                # Docker image cho Render Web Service
│   ├── render.yaml               # Blueprint Render 1-click deploy
│   └── .env.example
│
└── README.md
```

---

## 🚀 Hướng Dẫn Chạy Cục Bộ (Local Development)

### 1. Khởi chạy Backend (FastAPI)

```bash
cd backend

# 1. Cài đặt thư viện Python
pip install -r requirements.txt

# 2. Tạo file .env từ file mẫu
copy .env.example .env

# (Tùy chọn) Điền GEMINI_API_KEY và DATABASE_URL (Neon Postgres) vào .env
# Nếu để trống DATABASE_URL, hệ thống tự động dùng SQLite nội bộ không cần cài đặt gì thêm!

# 3. Chạy server FastAPI
uvicorn app.main:app --reload --port 8000
```
👉 API docs Swagger có tại: `http://localhost:8000/docs`

---

### 2. Khởi chạy Frontend (React Vite)

```bash
cd frontend

# 1. Cài đặt packages
npm install

# 2. Chạy Vite dev server
npm run dev
```
👉 Truy cập giao diện tại: `http://localhost:5173`

---

## ☁️ Hướng Dẫn Triển Khai (Deploy Vercel + Render + Neon)

### Bước 1: Khởi tạo Neon Database
1. Truy cập [Neon.tech](https://neon.tech) tạo tài khoản miễn phí.
2. Tạo project mới (chọn Region Singapore hoặc gần bạn nhất).
3. Copy chuỗi kết nối **Pooled connection** (có dạng `postgresql://user:password@ep-xyz-pooler...neon.tech/neondb?sslmode=require`).
4. (Tùy chọn) Bật tiện ích mở rộng vector trong Neon SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### Bước 2: Deploy Backend lên Render
1. Đẩy code lên GitHub repository của bạn.
2. Vào [Render.com](https://render.com) -> Chọn **New Web Service** (hoặc chọn **Blueprint** để dùng file `render.yaml`).
3. Cấu hình:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Cấu hình **Environment Variables** trên Render:
   - `DATABASE_URL`: Dán chuỗi kết nối Neon Postgres ở Bước 1.
   - `GEMINI_API_KEY`: Dán API key từ [Google AI Studio](https://aistudio.google.com/).
   - `LLM_MODEL`: `gemini-3.8-flash`
   - `EMBEDDING_MODEL`: `gemini-embedding-001`
5. Nhấn **Create Web Service** -> Chờ Render build xong, bạn sẽ có domain API: `https://your-backend.onrender.com`.

### Bước 3: Deploy Frontend lên Vercel
1. Vào [Vercel.com](https://vercel.com) -> Chọn **Add New Project** -> Chọn GitHub repo của bạn.
2. Cấu hình:
   - **Root Directory**: Chọn thư mục `frontend`.
   - **Framework Preset**: Chọn **Vite**.
3. Cấu hình **Environment Variable** trên Vercel:
   - `VITE_API_URL`: Điền URL backend Render ở Bước 2 kèm `/api` (VD: `https://your-backend.onrender.com/api`).
4. Nhấn **Deploy** -> Vercel hoàn tất build trong ~30 giây và cấp domain truy cập trực tuyến!

---

## 🛡️ Cơ Chế RAG Tránh Bịa Đặt Của Gemini

```
Câu hỏi thi + Đáp án đúng
          │
          ▼
Embedding Query (gemini-embedding-001)
          │
          ▼
Cosine Similarity Search trong Neon Postgres / Chunks
          │
          ▼
Top 3 - 5 đoạn chứng cứ SGK / Slide phù hợp nhất (Similarity >= 0.75)
          │
          ▼
Strict System Instruction đưa vào Gemini Flash:
"Chỉ được giải thích dựa trên tài liệu được nạp. Luôn trích dẫn tên sách, trang/slide."
          │
          ▼
Lời giải từng bước chuẩn sư phạm + Thẻ trích dẫn minh bạch
```


## Admin access

Knowledge base updates require the backend admin account. Configure these backend environment variables before logging in:

- `ADMIN_USERNAME`: the admin login name.
- `ADMIN_PASSWORD`: a unique, strong admin password.
- `ADMIN_TOKEN_SECRET`: a long random secret used to sign 12-hour admin sessions. Render generates this value through `render.yaml`.

For local development, set all three values in `backend/.env` (copy `backend/.env.example` first). Generate a token secret with `python -c "import secrets; print(secrets.token_urlsafe(48))"`. The account is created by setting these server-side values; credentials are never stored in the frontend. Without these settings, admin login and knowledge updates remain disabled. The upload and sample-seed endpoints both require the signed admin token.


## Filter data and deployment migrations

The selected deployment setup is the existing Render Blueprint for the FastAPI backend, Neon Postgres for persistent data, and Vercel for the frontend. Set `DATABASE_URL` to the Neon pooled connection string in Render, and set `VITE_API_URL` to the Render API URL ending in `/api` in Vercel.

On every backend startup, the FastAPI lifespan creates missing tables, adds missing `topic`, `lesson`, and `grade` columns, backfills existing questions, and inserts the demo filter questions if their IDs do not already exist. Render's `/api/health` check only succeeds after startup initialization completes; a database or migration failure therefore fails the deployment instead of serving an outdated schema.

The demo question IDs `990001` and `990002` populate class 10 and 11 dropdown choices; existing seeded questions cover class 12. Demo records are tagged and shown as `demo data` in search results.
#   w e b h o c t o p  
 