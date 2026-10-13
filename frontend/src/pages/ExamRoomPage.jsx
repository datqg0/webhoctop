import React, { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import QuestionPalette from '../components/QuestionPalette';
import PracticeAIChatPopup from '../components/PracticeAIChatPopup';
import ResultPage from './ResultPage';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Loader2, MessageCircle } from 'lucide-react';

export default function ExamRoomPage({ examId, onBack }) {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentOrder, setCurrentOrder] = useState(1);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const startedAt = useRef(Date.now());

  useEffect(() => {
    setLoading(true);
    setExam(null);
    setAnswers({});
    setCurrentOrder(1);
    setAiChatOpen(false);
    setSubmission(null);
    setSubmitError('');
    startedAt.current = Date.now();
    api.getExamDetail(examId).then((data) => {
      setExam(data);
      setLoading(false);
    }).catch(() => {
      setExam(null);
      setLoading(false);
    });
  }, [examId]);

  if (loading) {
    return <div className="space-y-3 py-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-moon-600" /><p className="text-sm font-semibold text-slate-700">Đang tải bộ câu hỏi luyện tập…</p></div>;
  }

  if (!exam || !exam.questions?.length) {
    return <div className="space-y-4 py-16 text-center"><p className="font-bold text-rose-600">Chưa có câu hỏi trong bộ luyện tập này.</p><button onClick={onBack} className="rounded-lg bg-slate-800 px-4 py-2 text-xs text-white">Quay lại</button></div>;
  }

  const currentQuestion = exam.questions.find((question) => question.order === currentOrder) || exam.questions[0];
  const selectedAnswer = answers[String(currentQuestion.order)] || null;
  const answeredCount = Object.keys(answers).length;
  const selectAnswer = (answer) => setAnswers((current) => ({ ...current, [String(currentQuestion.order)]: answer }));

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await api.submitExam(examId, {
        user_name: 'Thí sinh tự do',
        selected_answers: answers,
        completed_seconds: Math.max(0, Math.round((Date.now() - startedAt.current) / 1000)),
      });
      setSubmission(result);
    } catch (error) {
      setSubmitError(error.response?.data?.detail || 'Không thể lưu kết quả. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submission) {
    return (
      <ResultPage
        submission={submission}
        onRetake={() => {
          setSubmission(null);
          setAnswers({});
          setCurrentOrder(1);
          startedAt.current = Date.now();
        }}
        onGoHome={onBack}
      />
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <header className="sticky top-20 z-30 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:gap-3 sm:p-4">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={onBack} title="Quay lại thư viện" className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><ArrowLeft className="h-5 w-5" /></button>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-extrabold text-slate-900 sm:text-base">{exam.title}</h1>
            <p className="text-xs text-slate-500">Luyện tập · Câu {currentOrder} / {exam.questions.length}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:inline">Đã trả lời {answeredCount}/{exam.questions.length}</span>
          <button onClick={() => setAiChatOpen(true)} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-2.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 sm:gap-2 sm:px-4 sm:text-sm"><MessageCircle className="h-4 w-4" /> Hỏi AI</button>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <section className="space-y-4 lg:col-span-8">
          <div className="flex items-center gap-2 border-b border-slate-200 px-2 pb-3 text-sm font-bold text-moon-700"><BookOpen className="h-4 w-4" /> Câu hỏi {currentOrder}</div>
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            order={currentQuestion.order}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={selectAnswer}
            isReviewMode={false}
            showAnswer={Boolean(selectedAnswer)}
            correctAnswer={currentQuestion.correct_option}
            rawExplanation={currentQuestion.raw_explanation}
            onOpenAIExplain={() => setAiChatOpen(true)}
          />
          <div className="flex items-center justify-between gap-2">
            <button onClick={() => setCurrentOrder((order) => Math.max(1, order - 1))} disabled={currentOrder <= 1} className="inline-flex min-w-0 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"><ChevronLeft className="h-4 w-4 shrink-0" /> Câu trước</button>
            <button onClick={() => setCurrentOrder((order) => Math.min(exam.questions.length, order + 1))} disabled={currentOrder >= exam.questions.length} className="inline-flex min-w-0 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4">Câu tiếp <ChevronRight className="h-4 w-4 shrink-0" /></button>
          </div>
        </section>

        <aside className="lg:col-span-4">
          {submitError && <p role="alert" className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{submitError}</p>}
          <QuestionPalette
            totalQuestions={exam.questions.length}
            answers={answers}
            flagged={{}}
            currentOrder={currentOrder}
            onSelectOrder={setCurrentOrder}
            practiceMode
            showSubmit
            onSubmitExam={handleSubmit}
            submitDisabled={submitting}
            submitLabel={submitting ? 'Đang lưu kết quả…' : 'Hoàn thành luyện tập'}
            submitHint={sessionStorage.getItem('moon_user_token')
              ? 'Kết quả sẽ được lưu vào lịch sử tài khoản của bạn.'
              : 'Đăng nhập ở mục Tài khoản trước khi nộp để lưu lịch sử làm bài.'}
          />
        </aside>
      </div>

      <PracticeAIChatPopup
        key={currentQuestion.id}
        question={currentQuestion}
        studentAnswer={selectedAnswer}
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
      />
    </div>
  );
}
