import React from 'react';
import MathRenderer from './MathRenderer';
import { Flag, Sparkles, CheckCircle2, XCircle, BookOpen } from 'lucide-react';

export default function QuestionCard({
  question,
  order,
  selectedAnswer,
  onSelectAnswer,
  isFlagged,
  onToggleFlag,
  isReviewMode = false,
  showAnswer = false,
  correctAnswer = null,
  rawExplanation = null,
  onOpenAIExplain = null
}) {
  const options = [
    { key: 'A', text: question.option_a },
    { key: 'B', text: question.option_b },
    { key: 'C', text: question.option_c },
    { key: 'D', text: question.option_d },
  ];

  const difficultyLabels = {
    1: { label: 'Nhận biết', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    2: { label: 'Thông hiểu', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    3: { label: 'Vận dụng', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    4: { label: 'Vận dụng cao', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  };

  const diff = difficultyLabels[question.difficulty] || difficultyLabels[2];

  return (
    <div 
      id={`question-card-${order}`}
      className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 sm:p-5"
    >
      {/* Question Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-extrabold text-moon-800 text-base">Câu {order}:</span>
          <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-mono font-medium border border-slate-200">
            ID: {question.id}
          </span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${diff.color}`}>
            {diff.label}
          </span>
          {question.chapter && (
            <span className="text-xs text-slate-500 hidden sm:inline">
              • {question.chapter}
            </span>
          )}
        </div>

        {/* Flag button (only in test mode) */}
        {!isReviewMode && onToggleFlag && (
          <button
            onClick={onToggleFlag}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors border ${
              isFlagged
                ? 'bg-amber-100 border-amber-300 text-amber-800 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-amber-600'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{isFlagged ? 'Đã đánh dấu' : 'Gắn cờ'}</span>
          </button>
        )}
      </div>

      {/* Question Content with LaTeX */}
      <div className="text-slate-800 text-[15px] font-medium leading-relaxed mb-4">
        <MathRenderer content={question.content} />
      </div>

      {/* Options List */}
      <div className="space-y-2.5">
        {options.map((opt) => {
          const isSelected = selectedAnswer === opt.key;
          let optStyle = "border-slate-200 hover:bg-slate-50/80 bg-white text-slate-800";
          let badgeStyle = "bg-slate-100 text-slate-700 border-slate-300";

          if (!isReviewMode && !showAnswer) {
            if (isSelected) {
              optStyle = "border-moon-600 bg-moon-50/60 text-moon-900 ring-1 ring-moon-500";
              badgeStyle = "bg-moon-600 text-white border-moon-600";
            }
          } else {
            // Review mode styling
            const isCorrectOption = correctAnswer === opt.key;
            const isStudentChoice = isSelected;

            if (isCorrectOption) {
              optStyle = "border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold ring-1 ring-emerald-400";
              badgeStyle = "bg-emerald-600 text-white border-emerald-600";
            } else if (isStudentChoice && !isCorrectOption) {
              optStyle = "border-rose-400 bg-rose-50/70 text-rose-950 ring-1 ring-rose-400";
              badgeStyle = "bg-rose-500 text-white border-rose-500";
            }
          }

          return (
            <div
              key={opt.key}
              onClick={() => {
                if (!isReviewMode && onSelectAnswer) onSelectAnswer(opt.key);
              }}
              onKeyDown={(event) => {
                if (!isReviewMode && onSelectAnswer && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  onSelectAnswer(opt.key);
                }
              }}
              role={!isReviewMode ? 'button' : undefined}
              tabIndex={!isReviewMode ? 0 : undefined}
              aria-pressed={!isReviewMode ? isSelected : undefined}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                !isReviewMode ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moon-500 focus-visible:ring-offset-2' : ''
              } ${optStyle}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 border transition-all mt-0.5 ${badgeStyle}`}>
                {opt.key}
              </div>
              <div className="flex-1 text-sm pt-0.5">
                <MathRenderer content={opt.text} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Mode Action Footer: Standard Explanation + AI Gemini RAG Explanation */}
      {(isReviewMode || showAnswer) && (
        <div className="-mx-4 -mb-4 mt-5 flex flex-col items-stretch gap-3 rounded-b-xl border-t border-slate-100 bg-slate-50/60 p-4 pt-4 sm:-mx-5 sm:-mb-5 sm:flex-row sm:items-start">
          <div className="flex flex-wrap items-center gap-2">
            {selectedAnswer === correctAnswer ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" /> Chính xác
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                <XCircle className="w-4 h-4" /> Sai (Bạn chọn {selectedAnswer || 'Bỏ trống'})
              </span>
            )}
            <span className="text-xs text-slate-500">
              Đáp án đúng: <strong className="text-emerald-700 font-bold">{correctAnswer}</strong>
            </span>
          </div>

          {rawExplanation && <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-600"><BookOpen className="h-3.5 w-3.5" /> Giải thích</p>
            <MathRenderer content={rawExplanation} />
          </div>}

          <div className="flex items-center gap-2 sm:ml-auto">
            {onOpenAIExplain && (
              <button
                onClick={() => onOpenAIExplain(question.id, selectedAnswer)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-moon-600 via-sky-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm shadow-moon-600/20 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{showAnswer ? 'Hỏi AI về câu này' : 'AI Giải Thích & Trích Dẫn SGK'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
