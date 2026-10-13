import React, { useState } from 'react';
import { Atom, BookOpen, Calculator, Code2, Database, Dna, FlaskConical, Languages, Menu, UserRound, X } from 'lucide-react';

const subjects = [
  { code: '', name: 'Tất cả môn', icon: BookOpen },
  { code: 'toan', name: 'Toán học', icon: Calculator },
  { code: 'ly', name: 'Vật lý', icon: Atom },
  { code: 'hoa', name: 'Hóa học', icon: FlaskConical },
  { code: 'sinh', name: 'Sinh học', icon: Dna },
  { code: 'anh', name: 'Tiếng Anh', icon: Languages },
  { code: 'tin', name: 'Tin học', icon: Code2 },
];

export default function Navbar({ activeSubject, onSelectSubject, currentView, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navButton = (view, label, Icon) => (
    <button onClick={() => { onNavigate(view); setMobileMenuOpen(false); }} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${currentView === view ? 'bg-sky-50 text-sky-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
      {Icon && <Icon className="h-4 w-4" />}{label}
    </button>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button onClick={() => onNavigate('home')} className="flex shrink-0 items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-moon-700 to-sky-500 text-sm font-black tracking-tight text-white shadow-md">DP</span>
          <span>
            <span className="block text-base font-black tracking-tight text-slate-900 sm:text-lg">DP <span className="text-moon-orange">EXAM</span></span>
            <span className="hidden text-[11px] font-medium text-slate-500 sm:block">Luyện tập và tìm kiếm đề</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {navButton('home', 'Luyện tập')}
          {navButton('search', 'Tìm kiếm đề')}
          {navButton('profile', 'Tài khoản', UserRound)}
          {navButton('knowledge', 'Quản trị', Database)}
        </nav>
        <button onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={mobileMenuOpen} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="overflow-x-auto border-t border-slate-100 bg-slate-50/80 px-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-1 py-1.5">
          {subjects.map(({ code, name, icon: Icon }) => {
            const active = activeSubject === code;
            return <button key={code || 'all'} onClick={() => { onSelectSubject(code); if (currentView !== 'home') onNavigate('home'); }} className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? 'bg-moon-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}><Icon className="h-3.5 w-3.5" />{name}</button>;
          })}
        </div>
      </div>

      {mobileMenuOpen && <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
        <div className="flex flex-wrap gap-2">{navButton('home', 'Luyện tập')}{navButton('search', 'Tìm kiếm đề')}{navButton('profile', 'Tài khoản', UserRound)}{navButton('knowledge', 'Quản trị', Database)}</div>
      </div>}
    </header>
  );
}
