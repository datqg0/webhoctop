import React, { useEffect, useState } from 'react';
import { AlertCircle, BookOpen, ChevronDown, ChevronRight, FileText, Filter, Loader2, Search, X } from 'lucide-react';
import { api } from '../services/api';

const selectClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100';

export default function ExamSearchPage({ activeSubject = '', onStartPractice, initialSearchQuery = '', searchRequest = 0 }) {
  const [query, setQuery] = useState('');
  const [subjectCode, setSubjectCode] = useState(activeSubject);
  const [topic, setTopic] = useState('');
  const [lesson, setLesson] = useState('');
  const [grade, setGrade] = useState('');
  const [filters, setFilters] = useState({ subjects: [], topics: [], lessons: [], grades: [] });
  const [filterOpen, setFilterOpen] = useState(false);
  const [exams, setExams] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSubjectCode(activeSubject);
    setTopic('');
    setLesson('');
  }, [activeSubject]);

  useEffect(() => {
    let active = true;
    api.getExamFilters(subjectCode, topic).then((data) => {
      if (active) setFilters(data);
    }).catch(() => {
      if (active) setFilters({ subjects: [], topics: [], lessons: [], grades: [] });
    });
    return () => { active = false; };
  }, [subjectCode, topic]);

  const runSearch = async (event, searchTerm = query) => {
    event?.preventDefault();
    setLoading(true);
    setSearched(true);
    setError('');
    try {
      const result = await api.getExams(subjectCode, { query: searchTerm, topic, lesson, grade });
      setExams(result);
    } catch {
      setError('Không thể tải đề luyện tập lúc này. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchRequest) return;
    setQuery(initialSearchQuery);
    runSearch(null, initialSearchQuery);
  }, [searchRequest]);

  const clearFilters = () => {
    setSubjectCode('');
    setTopic('');
    setLesson('');
    setGrade('');
  };

  const activeFilterCount = [subjectCode, topic, lesson, grade].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-moon-700"><Search className="h-5 w-5" /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-moon-700">Thư viện luyện tập</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Tìm đề luyện tập</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Tìm theo tên đề hoặc lọc theo môn, chủ đề, bài học và lớp.</p>
          </div>
        </div>

        <form onSubmit={runSearch} className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nhập tên đề, chủ đề hoặc từ khóa..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100" />
          </div>
          <button type="button" onClick={() => setFilterOpen((open) => !open)} aria-expanded={filterOpen} className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${filterOpen || activeFilterCount ? 'border-sky-200 bg-sky-50 text-sky-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
            <Filter className="h-4 w-4" /> Bộ lọc {activeFilterCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-700 px-1 text-[11px] text-white">{activeFilterCount}</span>}<ChevronDown className={`h-4 w-4 transition ${filterOpen ? 'rotate-180' : ''}`} />
          </button>
          <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-moon-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-moon-700 disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}Tìm đề
          </button>
        </form>

        {filterOpen && <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-800">Lọc đề theo chương trình học</p>
            {activeFilterCount > 0 && <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-700"><X className="h-3.5 w-3.5" /> Xóa bộ lọc</button>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1.5 text-xs font-semibold text-slate-600">Môn học
              <select className={selectClass} value={subjectCode} onChange={(event) => { setSubjectCode(event.target.value); setTopic(''); setLesson(''); }}><option value="">Tất cả môn</option>{filters.subjects.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select>
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-slate-600">Chủ đề
              <select className={selectClass} value={topic} onChange={(event) => { setTopic(event.target.value); setLesson(''); }}><option value="">Tất cả chủ đề</option>{filters.topics.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-slate-600">Bài học
              <select className={selectClass} value={lesson} onChange={(event) => setLesson(event.target.value)} disabled={!topic}><option value="">Tất cả bài học</option>{filters.lessons.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-slate-600">Lớp
              <select className={selectClass} value={grade} onChange={(event) => setGrade(event.target.value)}><option value="">Tất cả các lớp</option>{filters.grades.map((item) => <option key={item} value={item}>Lớp {item}</option>)}</select>
            </label>
          </div>
          <div className="mt-4 flex justify-end"><button type="button" onClick={runSearch} className="rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-700">Áp dụng bộ lọc</button></div>
        </div>}
      </section>

      <section className="space-y-4">
        {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
        {loading && <div className="py-14 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-moon-600" /><p className="mt-3 text-sm text-slate-500">Đang tìm đề luyện tập...</p></div>}
        {!loading && searched && !error && exams.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center"><AlertCircle className="mx-auto h-8 w-8 text-slate-400" /><h2 className="mt-3 font-bold text-slate-800">Chưa tìm thấy đề phù hợp</h2><p className="mt-1 text-sm text-slate-500">Thử đổi từ khóa hoặc chọn bộ lọc khác.</p></div>}
        {!loading && exams.length > 0 && <>
          <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-slate-800">Đề luyện tập phù hợp</h2><span className="text-xs font-medium text-slate-500">{exams.length} đề</span></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {exams.map((exam) => <article key={exam.id} className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800">{exam.subject_name || 'Đề tổng hợp'}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500"><FileText className="h-3.5 w-3.5" />{exam.total_questions} câu</span>
                </div>
                <h3 className="mt-3 text-base font-bold leading-6 text-slate-900 group-hover:text-moon-700">{exam.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">{exam.description || 'Bộ câu hỏi giúp củng cố kiến thức và rèn luyện kỹ năng.'}</p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"><BookOpen className="h-4 w-4" /> Luyện tập có AI hỗ trợ</span>
                <button onClick={() => onStartPractice(exam.id)} className="inline-flex items-center gap-1 rounded-lg bg-moon-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-moon-700">Bắt đầu <ChevronRight className="h-4 w-4" /></button>
              </div>
            </article>)}
          </div>
        </>}
      </section>
    </div>
  );
}
