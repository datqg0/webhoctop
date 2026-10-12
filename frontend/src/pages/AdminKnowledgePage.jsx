import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { 
  Database, Upload, FileText, Presentation, HelpCircle, RefreshCw,
  CheckCircle2, Layers, ShieldCheck, Sparkles, Loader2, Plus,
  LockKeyhole, LogOut
} from 'lucide-react';

export default function AdminKnowledgePage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('toan');
  const [docType, setDocType] = useState('pdf');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('moon_admin_token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const loadDocuments = () => {
    if (!adminToken) {
      setDocs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    api.getKnowledgeDocs().then((data) => {
      setDocs(data);
    }).catch((err) => {
      if (err.response?.status === 401) {
        sessionStorage.removeItem('moon_admin_token');
        setAdminToken('');
      }
      setMessage(err.response?.data?.detail || 'Không thể tải danh sách tài liệu.');
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocuments();
  }, [adminToken]);

  const handleSeedSample = async () => {
    setSeeding(true);
    setMessage('');
    try {
      const res = await api.seedSampleKnowledge();
      setMessage('✅ ' + (res.message || 'Đã nạp thành công bộ tài liệu giáo trình mẫu!'));
      loadDocuments();
    } catch (e) {
      if (e.response?.status === 401) {
        sessionStorage.removeItem('moon_admin_token');
        setAdminToken('');
      }
      setMessage('❌ ' + (e.response?.data?.detail || 'Không thể nạp dữ liệu mẫu.'));
    } finally {
      setSeeding(false);
    }
  };

  const handleReindex = async () => {
    setReindexing(true);
    setMessage('');
    try {
      const res = await api.reindexKnowledge();
      setMessage('✅ ' + res.message);
    } catch (err) {
      if (err.response?.status === 401) {
        sessionStorage.removeItem('moon_admin_token');
        setAdminToken('');
      }
      setMessage('❌ ' + (err.response?.data?.detail || 'Không thể lập chỉ mục lại tài liệu.'));
    } finally {
      setReindexing(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      alert('Vui lòng nhập tên tài liệu và chọn file.');
      return;
    }

    setUploading(true);
    setMessage('');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject_code', subjectCode);
    formData.append('doc_type', docType);
    formData.append('file', file);

    try {
      await api.uploadKnowledge(formData);
      setMessage('✅ Tải lên và phân tách Vector Chunks thành công!');
      setTitle('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadDocuments();
    } catch (err) {
      if (err.response?.status === 401) {
        sessionStorage.removeItem('moon_admin_token');
        setAdminToken('');
      }
      setMessage('❌ Lỗi khi xử lý file: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setMessage('');
    try {
      await api.loginAdmin(username, password);
      setAdminToken(sessionStorage.getItem('moon_admin_token'));
      setPassword('');
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Không thể đăng nhập. Vui lòng thử lại.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('moon_admin_token');
    setAdminToken('');
    setDocs([]);
    setMessage('');
  };

  if (!adminToken) {
    return (
      <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-9">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><LockKeyhole className="h-6 w-6" /></div>
        <p className="text-xs font-bold uppercase tracking-widest text-sky-700">Khu vực quản trị</p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Đăng nhập admin</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Chỉ tài khoản quản trị được phép cập nhật kho tri thức.</p>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-700">Tên đăng nhập
            <input required autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          </label>
          <label className="block text-sm font-semibold text-slate-700">Mật khẩu
            <input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          </label>
          {message && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p>}
          <button disabled={loggingIn} className="w-full rounded-lg bg-moon-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-moon-800 disabled:opacity-60">{loggingIn ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
        </form>
      </section>
    );
  }

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
            <Database className="w-3.5 h-3.5 text-amber-600" />
            <span>Trung Tâm Nạp Tri Thức RAG (Grounding Engine)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý & Số Hóa Tài Liệu Giáo Trình
          </h1>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Nạp <strong>PDF giáo trình, Slide bài giảng PPTX</strong> và <strong>Ngân hàng Q&A</strong>. 
            Hệ thống sẽ tự động bóc tách thành các đoạn nội dung và lập chỉ mục bằng Gemini Embedding để hỗ trợ tìm tài liệu liên quan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleReindex}
          disabled={reindexing || seeding || uploading}
          className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {reindexing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span>Lập chỉ mục lại</span>
        </button>
        <button
          onClick={handleSeedSample}
          disabled={seeding || reindexing || uploading}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all flex-shrink-0"
        >
          {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Nạp Mẫu SGK & Slide Ngay</span>
        </button>
        <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"><LogOut className="h-4 w-4" /> Đăng xuất</button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl text-xs font-semibold bg-slate-800 text-white shadow-md">
          {message}
        </div>
      )}

      {/* Grid: Upload Form + Anti-Hallucination Explainer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upload Card */}
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-7">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Upload className="w-5 h-5 text-moon-600" />
            <h3 className="font-extrabold text-slate-900 text-base">Tải Lên Tài Liệu Mới</h3>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tên tài liệu / Tiêu đề giáo trình:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Sách Giáo Khoa Giải Tích 12 - Chương 1"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moon-600 bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Môn học:</label>
                <select
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moon-600 bg-slate-50 font-medium"
                >
                  <option value="toan">Toán học</option>
                  <option value="ly">Vật lý</option>
                  <option value="hoa">Hóa học</option>
                  <option value="sinh">Sinh học</option>
                  <option value="anh">Tiếng Anh</option>
                  <option value="tin">Tin học</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Định dạng tài liệu:</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moon-600 bg-slate-50 font-medium"
                >
                  <option value="pdf">📕 PDF (Giáo trình / Sách)</option>
                  <option value="slide">📊 Slide (PPTX Bài giảng)</option>
                  <option value="qa_bank">📋 Q&A Bank (JSON / Bảng)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Chọn file tải lên (.pdf, .pptx, .json):</label>
              <input
                ref={fileInputRef}
                type="file"
                accept={docType === 'pdf' ? '.pdf,application/pdf' : docType === 'slide' ? '.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation' : '.json,application/json'}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-moon-50 file:text-moon-700 hover:file:bg-moon-100 cursor-pointer border border-dashed border-slate-300 p-2 rounded-lg bg-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={uploading || reindexing || seeding}
              className="w-full bg-moon-600 hover:bg-moon-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang bóc tách & Vectorize...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Bắt Đầu Bóc Tách & Index Vào Vector DB</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Anti-Hallucination Explainer */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-moon-900 text-white rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="font-bold text-sm">Cơ Chế RAG Tránh Bịa Đặt</h4>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[11px] text-amber-300 flex-shrink-0">1</span>
              <p>
                <strong>Chunking & Metadata:</strong> Mỗi trang sách hoặc slide được cắt đoạn thông minh và lưu kèm số trang, số slide chuẩn xác.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[11px] text-amber-300 flex-shrink-0">2</span>
              <p>
                <strong>Semantic Search:</strong> Câu hỏi trắc nghiệm được đối chiếu cosine similarity để rút ra 3-5 đoạn chứng cứ liên quan nhất.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[11px] text-amber-300 flex-shrink-0">3</span>
              <p>
                <strong>Giải thích có căn cứ:</strong> Gemini nhận nội dung câu hỏi cùng các đoạn tài liệu phù hợp để giải thích và nêu nguồn tham khảo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Existing Documents List */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex min-w-0 items-center gap-2">
            <Layers className="w-5 h-5 text-moon-600" />
            <h3 className="font-extrabold text-slate-900 text-base">Tài Liệu Đã Nạp Trong Hệ Thống</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">{docs.length} tài liệu đã index</span>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-6 h-6 text-moon-600 animate-spin mx-auto" />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {docs.map((d) => (
              <div key={d.id} className="flex flex-col items-start justify-between gap-3 py-3.5 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                    {d.doc_type === 'pdf' ? <FileText className="w-4 h-4 text-rose-500" /> : <Presentation className="w-4 h-4 text-sky-500" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="break-words text-sm font-bold text-slate-900">{d.title}</h4>
                    <p className="break-all text-xs text-slate-500">
                      Môn: <strong className="uppercase">{d.subject_code}</strong> • File: {d.file_name || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pl-12 sm:pl-0">
                  <span className="bg-emerald-50 text-emerald-700 font-mono font-bold text-xs px-2.5 py-1 rounded-md border border-emerald-200">
                    {d.total_chunks || 0} chunks
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 hidden sm:flex">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng RAG
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
