import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import { BookOpen, Clock3, GraduationCap, LogOut, RotateCcw, Save, Sparkles, Trophy, UserRound } from 'lucide-react';

const GOOGLE_SCRIPT_ID = 'google-identity-services';

function formatDuration(seconds = 0) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes ? `${minutes} phút ${remainingSeconds} giây` : `${remainingSeconds} giây`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function UserProfilePage({ onStartPractice }) {
  const [signedIn, setSignedIn] = useState(() => Boolean(sessionStorage.getItem('moon_user_token')));
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [activeTab, setActiveTab] = useState('history');
  const [historySubject, setHistorySubject] = useState('');
  const [form, setForm] = useState({ full_name: '', school: '', grade: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [googleError, setGoogleError] = useState('');
  const googleButtonRef = useRef(null);
  const googleCredentialHandler = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const loadAccount = useCallback(async () => {
    setLoading(true);
    try {
      const [nextProfile, nextHistory, nextMistakes] = await Promise.all([
        api.getMyProfile(),
        api.getMyHistory(),
        api.getMyMistakes(),
      ]);
      setProfile(nextProfile);
      setForm({
        full_name: nextProfile.full_name || '',
        school: nextProfile.school || '',
        grade: nextProfile.grade ? String(nextProfile.grade) : '',
      });
      setHistory(nextHistory);
      setMistakes(nextMistakes);
      setMessage('');
    } catch (error) {
      if (error.response?.status === 401) {
        sessionStorage.removeItem('moon_user_token');
        setSignedIn(false);
        setProfile(null);
        setHistory([]);
        setMistakes([]);
      } else {
        setMessage(error.response?.data?.detail || 'Không thể tải thông tin tài khoản.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGoogleCredential = async (credential) => {
    if (!credential) {
      setMessage('Google không trả về thông tin đăng nhập. Vui lòng thử lại.');
      return;
    }
    setGoogleLoading(true);
    setMessage('');
    try {
      await api.loginUserWithGoogle(credential);
      setSignedIn(true);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Không thể đăng nhập bằng Google. Vui lòng thử lại.');
    } finally {
      setGoogleLoading(false);
    }
  };
  googleCredentialHandler.current = handleGoogleCredential;

  useEffect(() => {
    if (signedIn) loadAccount();
  }, [signedIn, loadAccount]);

  useEffect(() => {
    if (!googleClientId || signedIn) return undefined;

    let cancelled = false;
    const renderGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => googleCredentialHandler.current?.(response.credential),
        auto_select: false,
      });
      googleButtonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: Math.min(360, googleButtonRef.current.parentElement?.clientWidth || 320),
      });
      setGoogleError('');
    };

    let script = document.getElementById(GOOGLE_SCRIPT_ID);
    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else if (script) {
      script.addEventListener('load', renderGoogleButton);
    } else {
      script = document.createElement('script');
      script.id = GOOGLE_SCRIPT_ID;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = renderGoogleButton;
      script.onerror = () => setGoogleError('Không tải được dịch vụ đăng nhập Google.');
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      script?.removeEventListener('load', renderGoogleButton);
    };
  }, [googleClientId, signedIn]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const updated = await api.updateMyProfile({
        full_name: form.full_name.trim(),
        school: form.school.trim(),
        grade: form.grade ? Number(form.grade) : null,
      });
      setProfile(updated);
      setForm({
        full_name: updated.full_name || '',
        school: updated.school || '',
        grade: updated.grade ? String(updated.grade) : '',
      });
      setMessage('Đã lưu thông tin cá nhân.');
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Không thể lưu thông tin. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('moon_user_token');
    setSignedIn(false);
    setProfile(null);
    setHistory([]);
    setMistakes([]);
    setMessage('');
  };

  if (!signedIn) {
    return (
      <section className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700"><UserRound className="h-7 w-7" /></div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Tài khoản học tập</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">Hồ sơ và lịch sử luyện tập</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">Đăng nhập để lưu các lần luyện đề, xem điểm số và cập nhật thông tin cá nhân trên mọi thiết bị.</p>
        <div className="mt-7 flex justify-center">
          {googleClientId ? <div ref={googleButtonRef} /> : <p className="text-sm text-slate-500">Google sign-in chưa được cấu hình.</p>}
        </div>
        {googleLoading && <p role="status" className="mt-3 text-sm text-slate-500">Đang xác thực tài khoản…</p>}
        {googleError && <p role="status" className="mt-3 text-sm text-rose-600">{googleError}</p>}
        {message && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p>}
      </section>
    );
  }

  const averageScore = history.length
    ? (history.reduce((sum, attempt) => sum + attempt.score, 0) / history.length).toFixed(1)
    : '—';
  const bestScore = history.length ? Math.max(...history.map((attempt) => attempt.score)).toFixed(1) : '—';
  const historySubjects = [...new Map(history.map((attempt) => [attempt.subject_code, attempt.subject_name])).entries()];
  const visibleHistory = historySubject
    ? history.filter((attempt) => attempt.subject_code === historySubject)
    : history;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <header className="flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 p-6 text-white shadow-md sm:flex-row sm:items-center sm:p-8">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><GraduationCap className="h-6 w-6 text-sky-300" /></div>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-sky-300">Tài khoản học tập</p>
          <h1 className="mt-1 text-2xl font-black sm:text-3xl">Xin chào, {profile?.full_name || 'bạn'}!</h1>
          <p className="mt-1 text-sm text-slate-300">{profile?.email}</p>
        </div>
        <button onClick={handleSignOut} className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:self-center"><LogOut className="h-4 w-4" /> Đăng xuất</button>
      </header>

      {message && <p role="status" className="rounded-xl bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800">{message}</p>}

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-2"><UserRound className="h-5 w-5 text-sky-700" /><h2 className="text-lg font-extrabold text-slate-900">Thông tin cá nhân</h2></div>
          {loading && !profile ? <p className="py-8 text-center text-sm text-slate-500">Đang tải hồ sơ…</p> : (
            <form onSubmit={handleSave} className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Họ và tên
                <input required maxLength={100} value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">Email Google
                <input disabled value={profile?.email || ''} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-500" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">Trường học
                <input maxLength={200} value={form.school} onChange={(event) => setForm({ ...form, school: event.target.value })} placeholder="Tên trường (không bắt buộc)" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">Lớp
                <select value={form.grade} onChange={(event) => setForm({ ...form, grade: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
                  <option value="">Chưa chọn</option>
                  {[10, 11, 12].map((grade) => <option key={grade} value={grade}>Lớp {grade}</option>)}
                </select>
              </label>
              <button disabled={saving || loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-800 disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'Đang lưu…' : 'Lưu thay đổi'}</button>
            </form>
          )}
        </section>

        <section className="space-y-5 lg:col-span-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><BookOpen className="h-5 w-5 text-sky-700" /><p className="mt-3 text-2xl font-black text-slate-900">{history.length}</p><p className="text-xs font-medium text-slate-500">Lần luyện đề</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><Sparkles className="h-5 w-5 text-amber-500" /><p className="mt-3 text-2xl font-black text-slate-900">{averageScore}</p><p className="text-xs font-medium text-slate-500">Điểm trung bình</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><Trophy className="h-5 w-5 text-emerald-600" /><p className="mt-3 text-2xl font-black text-slate-900">{bestScore}</p><p className="text-xs font-medium text-slate-500">Điểm cao nhất</p></div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setActiveTab('history')} className={`rounded-lg px-3 py-2 text-sm font-bold ${activeTab === 'history' ? 'bg-sky-50 text-sky-800' : 'text-slate-500 hover:bg-slate-50'}`}>Lịch sử làm bài</button>
                  <button onClick={() => setActiveTab('mistakes')} className={`rounded-lg px-3 py-2 text-sm font-bold ${activeTab === 'mistakes' ? 'bg-rose-50 text-rose-700' : 'text-slate-500 hover:bg-slate-50'}`}>Câu cần ôn <span className="ml-1 rounded-full bg-white/80 px-1.5 py-0.5 text-xs">{mistakes.length}</span></button>
                </div>
                <p className="mt-2 text-xs text-slate-500">{activeTab === 'history' ? 'Các lần luyện đề đã hoàn thành khi đăng nhập.' : 'Câu bạn từng trả lời sai, sắp xếp theo số lần sai.'}</p>
              </div>
              {activeTab === 'history' ? <Clock3 className="h-5 w-5 shrink-0 text-slate-400" /> : <RotateCcw className="h-5 w-5 shrink-0 text-rose-400" />}
            </div>
            {activeTab === 'history' && <div className="mb-4 flex justify-end">
              <select aria-label="Lọc lịch sử theo môn" value={historySubject} onChange={(event) => setHistorySubject(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 outline-none focus:border-sky-500">
                <option value="">Tất cả môn</option>
                {historySubjects.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
              </select>
            </div>}
            {loading ? <p className="py-8 text-center text-sm text-slate-500">Đang tải dữ liệu…</p> : activeTab === 'history' ? visibleHistory.length ? (
              <div className="space-y-3">
                {visibleHistory.map((attempt) => (
                  <article key={attempt.submission_id} className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-slate-900">{attempt.exam_title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{attempt.subject_name} · {formatDate(attempt.submitted_at)}</p>
                      <p className="mt-1 text-xs text-slate-500">{attempt.total_correct}/{attempt.total_questions} câu đúng · {formatDuration(attempt.completed_seconds)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 self-end sm:self-auto">
                      <div className="rounded-xl bg-white px-4 py-2 text-center shadow-sm">
                        <span className="block text-2xl font-black text-sky-700">{Number(attempt.score).toFixed(1)}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">/ 10 điểm</span>
                      </div>
                      <button onClick={() => onStartPractice?.(attempt.exam_id)} className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-50"><RotateCcw className="h-3.5 w-3.5" /> Làm lại</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : visibleHistory.length === 0 && history.length > 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">Không có lần làm bài cho môn này.</p>
            ) : (
              <div className="py-10 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-600">Chưa có lần luyện đề nào</p>
                <p className="mt-1 text-xs text-slate-500">Hãy đăng nhập trước khi hoàn thành một bộ câu hỏi để lưu kết quả vào đây.</p>
              </div>
            ) : mistakes.length ? (
              <div className="space-y-4">
                {mistakes.map((mistake, index) => (
                  <div key={mistake.question_id}>
                    <p className="mb-2 text-xs font-semibold text-rose-600">{mistake.subject_name} · Sai {mistake.mistake_count} lần · Gần nhất: {formatDate(mistake.last_missed_at)}</p>
                    <QuestionCard
                      question={{ ...mistake, id: mistake.question_id }}
                      order={index + 1}
                      selectedAnswer={mistake.student_answer}
                      isReviewMode
                      showAnswer
                      correctAnswer={mistake.correct_answer}
                      rawExplanation={mistake.raw_explanation}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <Trophy className="mx-auto h-8 w-8 text-emerald-400" />
                <p className="mt-3 text-sm font-semibold text-slate-600">Chưa có câu sai cần ôn</p>
                <p className="mt-1 text-xs text-slate-500">Hoàn thành các bộ luyện tập, câu sai sẽ xuất hiện tại đây.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
