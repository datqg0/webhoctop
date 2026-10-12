import React, { useEffect, useState } from 'react';
import MathRenderer from './MathRenderer';
import { api } from '../services/api';
import { 
  Sparkles, X, ShieldCheck, BookOpen, Layers, 
  ExternalLink, CheckCircle2, AlertTriangle, Loader2 
} from 'lucide-react';

export default function AIExplanationModal({ questionId, studentAnswer, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    api.explainQuestion(questionId, studentAnswer)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.detail || 'Không thể kết nối đến dịch vụ giải thích AI.');
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [questionId, studentAnswer]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-moon-800 via-moon-700 to-sky-700 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">AI Giải Thích Chi Tiết (Gemini RAG)</h3>
                <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Grounded
                </span>
              </div>
              <p className="text-xs text-sky-200">
                Câu hỏi ID: <span className="font-mono font-bold text-white">#{questionId}</span> • Đối chiếu tri thức giáo trình trường học
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {loading && (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-moon-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Đang truy xuất tri thức SGK và tạo lời giải với Gemini...</p>
              <p className="text-xs text-slate-400">Đang đối chiếu vector embeddings và kiểm chứng trích dẫn...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {data && (
            <>
              {/* Anti-Hallucination Assurance Banner */}
              <div className={`flex items-start gap-2.5 rounded-xl border p-3 ${data.grounded_in_school_docs ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-950'}`}>
                {data.grounded_in_school_docs ? <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" /> : <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />}
                <div className="text-xs leading-relaxed">
                  <span className="font-bold">{data.grounded_in_school_docs ? 'Đã đối chiếu tài liệu tham khảo: ' : 'Chưa tìm thấy tài liệu tham khảo phù hợp: '}</span>
                  {data.grounded_in_school_docs ? 'Các nguồn liên quan được liệt kê bên dưới để bạn kiểm tra.' : 'Lời giải có thể chưa được đối chiếu với kho tri thức của trường.'}
                </div>
              </div>

              {/* Main Explanation Block */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-moon-600" />
                    Nội dung phân tích sư phạm
                  </span>
                  <span className="text-slate-500">
                    Đáp án chuẩn: <strong className="text-emerald-600 font-bold">{data.correct_answer}</strong>
                  </span>
                </div>
                
                <div className="prose prose-sm max-w-none text-slate-800">
                  <MathRenderer content={data.explanation} />
                </div>
              </div>

              {/* Verified Citations List (Nguồn trích dẫn) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-sky-600" />
                    Căn Cứ Trích Dẫn Tài Liệu ({data.citations?.length || 0} nguồn)
                  </h4>
                  <span className="text-[11px] text-slate-400">Độ tin cậy ngữ nghĩa vector</span>
                </div>

                {data.citations && data.citations.length > 0 ? (
                  <div className="grid gap-2.5">
                    {data.citations.map((cite, idx) => (
                      <div 
                        key={idx} 
                        className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-moon-300 transition-all shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-bold text-xs text-moon-800 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-moon-100 text-moon-700 text-[11px] font-mono flex items-center justify-center font-bold">
                              #{idx + 1}
                            </span>
                            {cite.doc_title}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded border">
                              {cite.page_or_slide}
                            </span>
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                              Khớp {(cite.similarity_score * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 italic bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                          "{cite.snippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Chưa có tài liệu giáo trình cụ thể cho câu hỏi này.</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-slate-500">
            Mô hình: <strong className="text-slate-700">Gemini 3.8 Flash + Gemini Embedding</strong>
          </span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all"
          >
            Đóng Lời Giải
          </button>
        </div>
      </div>
    </div>
  );
}
