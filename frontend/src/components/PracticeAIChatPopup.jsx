import React, { useEffect, useRef, useState } from 'react';
import { Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { api } from '../services/api';
import MathRenderer from './MathRenderer';

export default function PracticeAIChatPopup({ question, studentAnswer, isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Mình đang theo dõi câu ${question.order}. Bạn có thể hỏi về cách giải, đáp án hoặc kiến thức liên quan.` },
  ]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const endOfMessages = useRef(null);

  useEffect(() => {
    endOfMessages.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending, isOpen]);

  const handleSend = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    const conversation = messages;
    setMessages((current) => [...current, { role: 'user', content: text }]);
    setDraft('');
    setSending(true);
    try {
      const response = await api.chatAboutQuestion(
        question.id,
        text,
        conversation.slice(1).slice(-12).map(({ role, content }) => ({ role, content })),
        studentAnswer,
      );
      setMessages((current) => [...current, {
        role: 'assistant',
        content: response.answer,
        citations: response.citations || [],
      }]);
    } catch (error) {
      setMessages((current) => [...current, {
        role: 'assistant',
        content: error.response?.data?.detail || 'Mình chưa kết nối được với AI. Bạn thử gửi lại sau nhé.',
        isError: true,
      }]);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-2 bottom-2 z-50 flex h-[min(42rem,calc(100dvh-1rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 sm:inset-auto sm:bottom-4 sm:right-4 sm:h-[min(42rem,calc(100vh-2rem))] sm:w-[26rem]">
      <header className="flex items-center justify-between bg-gradient-to-r from-indigo-700 to-violet-700 px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10"><Sparkles className="h-4 w-4 text-amber-300" /></span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold">Chat với AI</h2>
            <p className="truncate text-[11px] text-indigo-100">Đang hỗ trợ câu {question.order} · ID {question.id}</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Đóng chat AI" className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
      </header>

      <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-slate-500">
        {studentAnswer ? `Đáp án bạn chọn: ${studentAnswer}` : 'Chọn đáp án ở câu hỏi để AI có thể nhận xét lựa chọn của bạn.'}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-3 sm:p-4">
        {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${message.role === 'user' ? 'rounded-br-md bg-indigo-600 text-white' : `rounded-bl-md border bg-white text-slate-800 shadow-sm ${message.isError ? 'border-rose-200 text-rose-700' : 'border-slate-200'}`}`}>
            {message.role === 'assistant' && <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-indigo-600"><MessageCircle className="h-3 w-3" /> DP EXAM AI</div>}
            <div className={message.role === 'assistant' ? 'prose prose-sm max-w-none text-inherit' : 'whitespace-pre-wrap'}><MathRenderer content={message.content} /></div>
            {message.citations?.length > 0 && <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Nguồn tham khảo</p>
              {message.citations.map((citation, citationIndex) => <div key={`${citation.doc_title}-${citationIndex}`} className="rounded-lg bg-slate-50 px-2.5 py-2 text-[11px] leading-4 text-slate-600">
                <span className="font-semibold text-slate-800">{citation.doc_title}</span><br />{citation.page_or_slide || citation.section_title}
              </div>)}
            </div>}
          </div>
        </div>)}
        {sending && <div className="flex items-center gap-2 text-xs font-medium text-slate-500"><Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> AI đang trả lời…</div>}
        <div ref={endOfMessages} />
      </div>

      <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-slate-200 bg-white p-3">
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSend(event); }
        }} maxLength={2000} rows={1} placeholder="Hỏi thêm về câu này…" className="max-h-28 min-h-10 flex-1 resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        <button type="submit" disabled={!draft.trim() || sending} aria-label="Gửi tin nhắn" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-4 w-4" /></button>
      </form>
    </div>
  );
}
