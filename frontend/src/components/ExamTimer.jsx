import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

export default function ExamTimer({ initialMinutes = 45, onTimeUp, onTick }) {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    setSecondsLeft(initialMinutes * 60);
  }, [initialMinutes]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (onTick) onTick((initialMinutes * 60) - next);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, initialMinutes, onTimeUp, onTick]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft < 300; // Under 5 mins

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm transition-all ${
      isUrgent
        ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
        : 'bg-white border-slate-200 text-slate-700 shadow-sm'
    }`}>
      {isUrgent ? <AlertCircle className="w-4 h-4 text-rose-500" /> : <Clock className="w-4 h-4 text-moon-600" />}
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
