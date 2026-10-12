import React, { useState } from 'react';
import QuestionCard from '../components/QuestionCard';
import AIExplanationModal from '../components/AIExplanationModal';
import { 
  Award, CheckCircle2, XCircle, Clock, RotateCcw, 
  Home, Sparkles, BookOpen, Share2 
} from 'lucide-react';

export default function ResultPage({ submission, onRetake, onGoHome }) {
  const [selectedQuestionForAI, setSelectedQuestionForAI] = useState(null);

  if (!submission) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-slate-600">Không có dữ liệu bài nộp.</p>
        <button onClick={onGoHome} className="bg-moon-600 text-white px-4 py-2 rounded-lg text-xs">
          Về Trang Chủ
        </button>
      </div>
    );
  }

  const { score, total_correct, total_questions, completed_seconds, questions_review } = submission;
  const minutes = Math.floor(completed_seconds / 60);
  const seconds = completed_seconds % 60;
  const wrongCount = total_questions - total_correct;

  // Grade performance title
  let gradeTitle = "Cần cố gắng thêm!";
  let gradeColor = "text-amber-600";
  if (score >= 9.0) {
    gradeTitle = "Xuất sắc! Thủ khoa tương lai! 🏆";
    gradeColor = "text-emerald-600";
  } else if (score >= 7.0) {
    gradeTitle = "Khá tốt! Giữ vững phong độ! 🌟";
    gradeColor = "text-moon-600";
  } else if (score >= 5.0) {
    gradeTitle = "Đạt yêu cầu cơ bản! Cần ôn luyện thêm.";
    gradeColor = "text-sky-600";
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Score Summary Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 overflow-hidden relative">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center sm:text-left">
            <span className="bg-moon-50 text-moon-700 text-xs font-bold px-3 py-1 rounded-full border border-moon-100">
              Kết Quả Bài Thi Trắc Nghiệm
            </span>
            <h1 className={`text-2xl sm:text-3xl font-black ${gradeColor}`}>
              {gradeTitle}
            </h1>
            <p className="text-xs text-slate-500">
              Bạn có thể xem lời giải chi tiết và đối chiếu tài liệu trích dẫn của từng câu bên dưới.
            </p>
          </div>

          {/* Big Score Box */}
          <div className="flex items-center gap-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:px-8">
            <div className="text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Điểm Số</span>
              <span className="text-4xl sm:text-5xl font-black text-moon-orange tracking-tight">
                {score.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400 font-bold block">/ 10.0</span>
            </div>

            <div className="h-12 w-px bg-slate-200" />

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Đúng: <strong>{total_correct}</strong>/{total_questions}</span>
              </div>
              <div className="flex items-center gap-2 text-rose-700 font-semibold">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Sai: <strong>{wrongCount}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{minutes}p {seconds}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Mẹo: Bấm <strong>"AI Giải Thích & Trích Dẫn SGK"</strong> để xem phân tích bước giải chuẩn xác.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRetake}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm Lại Đề Này</span>
            </button>
            <button
              onClick={onGoHome}
              className="bg-moon-600 hover:bg-moon-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Về Trang Chủ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Review All Questions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-moon-600" />
            Xem Chi Tiết Từng Câu Hỏi & Lời Giải Chuẩn
          </h2>
          <span className="text-xs text-slate-500">
            Tổng cộng {questions_review.length} câu
          </span>
        </div>

        <div className="space-y-4">
          {questions_review.map((item) => (
            <QuestionCard
              key={item.question_id}
              question={{
                id: item.question_id,
                content: item.content,
                option_a: item.option_a,
                option_b: item.option_b,
                option_c: item.option_c,
                option_d: item.option_d,
                difficulty: 2
              }}
              order={item.order}
              selectedAnswer={item.student_answer}
              isReviewMode={true}
              correctAnswer={item.correct_answer}
              rawExplanation={item.raw_explanation}
              onOpenAIExplain={(qId, studentAns) => {
                setSelectedQuestionForAI({ questionId: qId, studentAnswer: studentAns });
              }}
            />
          ))}
        </div>
      </div>

      {/* RAG Modal if triggered */}
      {selectedQuestionForAI && (
        <AIExplanationModal
          questionId={selectedQuestionForAI.questionId}
          studentAnswer={selectedQuestionForAI.studentAnswer}
          onClose={() => setSelectedQuestionForAI(null)}
        />
      )}
    </div>
  );
}
