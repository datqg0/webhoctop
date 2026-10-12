import React, { lazy, Suspense, useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';

const ExamRoomPage = lazy(() => import('./pages/ExamRoomPage'));
const ExamSearchPage = lazy(() => import('./pages/ExamSearchPage'));
const AdminKnowledgePage = lazy(() => import('./pages/AdminKnowledgePage'));

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'practice' | 'search' | 'knowledge'
  const [activeSubject, setActiveSubject] = useState('');
  const [activeExamId, setActiveExamId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRequest, setSearchRequest] = useState(0);

  const navigateTo = (view) => {
    if (view !== 'search') setSearchRequest(0);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartPractice = (examId) => {
    setActiveExamId(examId);
    navigateTo('practice');
  };

  const handleHomeSearch = (query) => {
    setSearchQuery(query.trim());
    setSearchRequest((request) => request + 1);
    navigateTo('search');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Main navigation */}
      <Navbar
        activeSubject={activeSubject}
        onSelectSubject={(sub) => setActiveSubject(sub)}
        currentView={currentView}
        onNavigate={navigateTo}
      />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 pt-4 sm:px-6 sm:pt-6">
        {currentView === 'home' && (
          <HomePage
            activeSubject={activeSubject}
            onStartPractice={handleStartPractice}
            onNavigate={navigateTo}
            onSearch={handleHomeSearch}
          />
        )}

        <Suspense fallback={<div className="py-16 text-center text-sm font-semibold text-slate-500">Đang tải trang…</div>}>
          {currentView === 'practice' && activeExamId && (
            <ExamRoomPage
              examId={activeExamId}
              onBack={() => navigateTo('home')}
            />
          )}

          {currentView === 'search' && (
            <ExamSearchPage
              activeSubject={activeSubject}
              onStartPractice={handleStartPractice}
              initialSearchQuery={searchQuery}
              searchRequest={searchRequest}
            />
          )}

          {currentView === 'knowledge' && (
            <AdminKnowledgePage />
          )}
        </Suspense>
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        <p>2026 DP EXAM · Học tập chủ động, tiến bộ mỗi ngày</p>
      </footer>
    </div>
  );
}
