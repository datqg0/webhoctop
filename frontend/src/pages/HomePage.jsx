import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ArrowRight, BookOpen, CheckCircle, ChevronRight, FileText, Search } from 'lucide-react';

export default function HomePage({ activeSubject, onStartPractice, onNavigate, onSearch }) {
  const [exams, setExams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    api.getExams(activeSubject).then((data) => {
      if (mounted) setExams(data);
    }).catch(() => {
      if (mounted) setError('Không thể tải bộ câu hỏi. Vui lòng thử tải lại trang.');
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [activeSubject]);

  return (
    <div className="space-y-10 pb-14">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-moon-900 to-sky-900 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="relative max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-sky-100">
            <BookOpen className="h-4 w-4" /> Ôn tập chủ động, hiểu bài sâu hơn
          </div>
          <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
            Luyện thi thông minh<br />
            <span className="text-sky-300">vững kiến thức mỗi ngày</span>
          </h1>
          <p className="max-w-xl text-sm leading-6 text-slate-200 sm:text-base">
            Luyện tập từng câu theo môn học, nhận giải thích ngay và hỏi AI khi cần.
          </p>
          <form onSubmit={(event) => { event.preventDefault(); onSearch(searchQuery); }} className="flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Tìm đề luyện tập theo môn học hoặc chủ đề..." className="w-full rounded-xl border border-transparent bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-100" />
            </div>
            <button type="submit" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-moon-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-moon-700"><Search className="h-4 w-4" />Tìm đề</button>
          </form>
          <div className="flex flex-wrap gap-3 pt-1">
            <button onClick={() => exams[0] && onStartPractice(exams[0].id)} disabled={!exams.length} className="inline-flex items-center gap-2 rounded-xl bg-moon-orange px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
              Luyện tập ngay <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => onNavigate('search')} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
              <Search className="h-4 w-4" /> Tìm kiếm đề
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-moon-600">Thư viện luyện tập</p>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {activeSubject ? `Bộ luyện tập ${activeSubject.toUpperCase()}` : 'Bộ luyện tập nổi bật'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Chọn một bộ câu hỏi để bắt đầu luyện tập.</p>
          </div>
          {!loading && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{exams.length} bộ luyện tập</span>}
        </div>

        {error ? (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm text-rose-700">{error}</div>
        ) : loading ? (
          <div className="grid gap-4 sm:grid-cols-2">{[1, 2].map((item) => <div key={item} className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div>
        ) : exams.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {exams.map((exam) => (
              <article key={exam.id} className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold uppercase text-sky-800">{exam.subject_name || 'Đề tổng hợp'}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500"><FileText className="h-3.5 w-3.5" />{exam.total_questions} câu</span>
                  </div>
                  <h3 className="text-base font-bold leading-6 text-slate-900 transition group-hover:text-moon-700">{exam.title}</h3>
                  <p className="line-clamp-2 text-sm leading-5 text-slate-500">{exam.description || 'Đề thi giúp củng cố kiến thức và rèn luyện kỹ năng làm bài.'}</p>
                </div>
                <div className="mt-5 flex flex-col items-start gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><CheckCircle className="h-4 w-4" /> Có lời giải chi tiết</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onStartPractice(exam.id)} className="inline-flex items-center gap-1 rounded-lg bg-moon-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-moon-700">
                      Bắt đầu luyện <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-400" />
            <h3 className="font-bold text-slate-800">Chưa có bộ luyện tập cho môn này</h3>
            <p className="mt-1 text-sm text-slate-500">Hãy chọn môn khác để tiếp tục luyện tập.</p>
          </div>
        )}
      </section>
    </div>
  );
}
