import React from 'react';
import { Flag, CheckCircle2, Clock, Send } from 'lucide-react';

export default function QuestionPalette({
  totalQuestions,
  answers,
  flagged,
  currentOrder,
  onSelectOrder,
  onSubmitExam,
  practiceMode = false,
  showSubmit = true,
  submitLabel = 'Nộp Bài Thi Ngay',
  submitHint = 'Sau khi nộp, bạn sẽ xem được điểm số và lời giải AI RAG chi tiết.'
}) {
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100) || 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:sticky lg:top-24">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Bảng Điều Hướng Câu Hỏi</h3>
          <p className="text-xs text-slate-500">
            Đã làm <span className="font-semibold text-moon-600">{answeredCount}</span>/{totalQuestions} câu ({progressPercent}%)
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-moon-50 flex items-center justify-center font-bold text-xs text-moon-700">
          {progressPercent}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 my-3 overflow-hidden">
        <div 
          className="bg-moon-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-1.5 text-[11px] text-slate-600 mb-3 py-1 bg-slate-50 rounded-lg px-2">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /><span>{practiceMode ? 'Đã trả lời' : 'Đã chọn'}</span></div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400 inline-block" /><span>{practiceMode ? 'Câu hiện tại' : 'Gắn cờ'}</span></div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-200 inline-block" /><span>Chưa làm</span></div>
      </div>

      {/* Questions Grid (Matrix 1 to N) */}
      <div className="grid max-h-48 grid-cols-6 gap-2 overflow-y-auto pr-1 sm:max-h-64 sm:grid-cols-8 lg:max-h-[360px] lg:grid-cols-5">
        {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => {
          const numStr = String(num);
          const isAnswered = !!answers[numStr];
          const isFlagged = !!flagged[numStr];
          const isCurrent = currentOrder === num;

          let btnClass = "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200";
          if (isAnswered) {
            btnClass = "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600 shadow-sm";
          }
          if (isFlagged) {
            btnClass = "bg-amber-400 text-slate-900 hover:bg-amber-500 border-amber-400 font-bold shadow-sm";
          }

          return (
            <button
              key={num}
              onClick={() => onSelectOrder(num)}
              className={`h-9 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all relative ${btnClass} ${
                isCurrent ? 'ring-2 ring-moon-600 ring-offset-1 font-bold' : ''
              }`}
            >
              {num}
              {isAnswered && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white text-emerald-700 text-[9px] rounded-full flex items-center justify-center border font-mono shadow-sm">
                  {answers[numStr]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {showSubmit && <div className="pt-4 mt-4 border-t border-slate-100">
        <button
          onClick={onSubmitExam}
          className="w-full bg-gradient-to-r from-moon-600 to-moon-700 hover:from-moon-700 hover:to-moon-800 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-moon-600/20 flex items-center justify-center gap-2 text-sm transition-all"
        >
          <Send className="w-4 h-4" />
          {submitLabel}
        </button>
        <p className="text-[11px] text-center text-slate-400 mt-2">
          {submitHint}
        </p>
      </div>}
    </div>
  );
}
