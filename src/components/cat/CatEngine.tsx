import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  CheckCircle2,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Save,
  XCircle,
  LayoutGrid,
  X,
  ZoomIn
} from 'lucide-react';

export const CatEngine: React.FC = () => {
  const {
    examSession,
    currentUser,
    answerQuestion,
    toggleFlagQuestion,
    setQuestionIndex,
    finishCurrentExam,
    cancelExam
  } = useApp();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [autoSavedNotice, setAutoSavedNotice] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'TWK' | 'TIU' | 'TKP'>('ALL');
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    return examSession ? examSession.timeRemainingSeconds : 0;
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!examSession) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Auto submit when time expires (PRD Section 8.4)
          setTimeout(() => {
            finishCurrentExam();
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examSession]);

  useEffect(() => {
    setAutoSavedNotice(true);
    const timeout = setTimeout(() => setAutoSavedNotice(false), 1200);
    return () => clearTimeout(timeout);
  }, [examSession?.userAnswers]);

  if (!examSession || !currentUser) return null;

  const currentQ = examSession.questions[examSession.currentQuestionIndex];
  if (!currentQ) return null;

  const currentAnswer = examSession.userAnswers[currentQ.id];
  const isCurrentFlagged = !!examSession.flaggedMap[currentQ.id];

  // Timer format
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${hours > 0 ? String(hours).padStart(2, '0') + ':' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalCount = examSession.questions.length;
  const answeredCount = Object.keys(examSession.userAnswers).length;
  const flaggedCount = Object.values(examSession.flaggedMap).filter(Boolean).length;
  const unansweredCount = totalCount - answeredCount;

  const handleSelect = (key: 'A' | 'B' | 'C' | 'D' | 'E') => {
    answerQuestion(currentQ.id, key);
  };

  const handleNext = () => {
    if (examSession.currentQuestionIndex < totalCount - 1) {
      setQuestionIndex(examSession.currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (examSession.currentQuestionIndex > 0) {
      setQuestionIndex(examSession.currentQuestionIndex - 1);
    }
  };

  const filteredQuestions = examSession.questions.filter(q => {
    if (categoryFilter === 'ALL') return true;
    return q.category === categoryFilter;
  });

  const getOptionText = (key: 'A' | 'B' | 'C' | 'D' | 'E'): string => {
    switch (key) {
      case 'A': return currentQ.option_a;
      case 'B': return currentQ.option_b;
      case 'C': return currentQ.option_c;
      case 'D': return currentQ.option_d;
      case 'E': return currentQ.option_e;
    }
  };

  // Helper 3 warna status navigasi soal: Oranye (Ragu-ragu), Hijau (Sudah Dijawab), Abu (Belum Dijawab)
  const getNavButtonStyle = (qId: string, isSelected: boolean) => {
    const hasAnswer = !!examSession.userAnswers[qId];
    const isFlagged = !!examSession.flaggedMap[qId];

    let btnStyle = 'bg-slate-200 text-slate-700 border-slate-300';
    if (isFlagged) {
      btnStyle = 'bg-amber-500 text-white font-bold border-amber-600';
    } else if (hasAnswer) {
      btnStyle = 'bg-emerald-600 text-white font-bold border-emerald-700';
    }

    if (isSelected) {
      btnStyle += ' ring-2 ring-blue-600 ring-offset-1 z-10';
    }
    return btnStyle;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* 8.1 Header Ujian CAT (Compact di Mobile & Desktop + Tombol Batalkan) */}
      <header className="bg-slate-900 text-white px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-2 border-b border-slate-800 shadow-md shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img
            src={currentUser.photo_url}
            alt={currentUser.full_name}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-sky-400 object-cover shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.full_name) + '&background=2563eb&color=fff';
            }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-white tracking-wide truncate max-w-[115px] sm:max-w-none">
                {currentUser.full_name}
              </span>
              <span className="hidden sm:inline-block text-[10px] bg-blue-950 text-sky-200 border border-blue-700 px-1.5 py-0.2 rounded font-mono shrink-0">
                CAT-BKN-SIM
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-300 truncate max-w-[130px] sm:max-w-md">
              {examSession.examTitle}
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
          <Save className={`w-3.5 h-3.5 ${autoSavedNotice ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span>{autoSavedNotice ? 'Jawaban Tersimpan Otomatis' : 'Waktu Server Tersinkronisasi'}</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Timer */}
          <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-800 rounded-lg border border-slate-700 shadow-inner">
            <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${secondsLeft < 300 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
            <div className="text-right">
              <div className="hidden sm:block text-[9px] uppercase font-semibold text-slate-400 leading-none">
                Sisa Waktu
              </div>
              <div className={`font-mono text-xs sm:text-base font-bold leading-none ${secondsLeft < 300 ? 'text-red-400' : 'text-white'}`}>
                {timeFormatted}
              </div>
            </div>
          </div>

          {/* Tombol Batalkan Ujian */}
          <button
            type="button"
            onClick={() => setCancelModalOpen(true)}
            title="Batalkan ujian jika salah pilih paket soal (tidak tersimpan)"
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-[11px] sm:text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Batalkan Ujian</span>
            <span className="sm:hidden">Batal</span>
          </button>

          {/* Tombol Selesai Ujian */}
          <button
            type="button"
            onClick={() => setConfirmModalOpen(true)}
            className="flex items-center gap-1 px-2 sm:px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Selesai Ujian</span>
            <span className="sm:hidden">Selesai</span>
          </button>
        </div>
      </header>

      {/* 8.2 & 8.3 Area Soal & Navigasi Nomor Soal */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Column: Soal & Opsi Jawaban (Minimalis & Mudah Dibaca di Mobile) */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden md:border-r border-slate-200">
          {/* Subheader */}
          <div className="bg-slate-50 px-3.5 sm:px-6 py-2 sm:py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="font-extrabold text-sm sm:text-base md:text-lg text-slate-900">
                Soal {examSession.currentQuestionIndex + 1}
              </span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                {currentQ.category}
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline truncate">
                ({currentQ.topic})
              </span>
            </div>

            <div className="text-[11px] sm:text-xs text-slate-500 shrink-0">
              Total: <span className="font-bold text-slate-800">{totalCount}</span>
            </div>
          </div>

          {/* Question Text + Optional Image (Compact spacing on mobile so minimal scroll) */}
          <div className="flex-1 overflow-y-auto px-3.5 py-3 sm:p-6 md:p-8">
            {currentQ.question_text?.trim() && (
              <div className="text-slate-800 text-[13px] sm:text-sm md:text-base leading-snug sm:leading-relaxed whitespace-pre-line mb-3.5 sm:mb-5 font-normal">
                {currentQ.question_text}
              </div>
            )}

            {currentQ.question_image_url && (
              <div className="mb-4 sm:mb-6">
                <div className="inline-flex flex-col items-start gap-1.5 p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 max-w-full shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setZoomImageUrl(currentQ.question_image_url || null)}
                    className="group relative block rounded-lg overflow-hidden bg-white border border-slate-200 cursor-zoom-in"
                    title="Klik untuk memperbesar gambar soal"
                  >
                    <img
                      src={currentQ.question_image_url}
                      alt={`Gambar Soal ${examSession.currentQuestionIndex + 1}`}
                      className="max-h-64 sm:max-h-80 w-auto max-w-full object-contain mx-auto"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomImageUrl(currentQ.question_image_url || null)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Perbesar Gambar Soal</span>
                  </button>
                </div>
              </div>
            )}

            {/* Opsi A - E */}
            <div className="space-y-2 sm:space-y-3 max-w-3xl">
              {(['A', 'B', 'C', 'D', 'E'] as const).map(key => {
                const isSelected = currentAnswer === key;
                return (
                  <label
                    key={key}
                    onClick={() => handleSelect(key)}
                    className={`flex items-start gap-2.5 sm:gap-4 p-2.5 sm:p-3.5 md:p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-[11px] sm:text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {key}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-800 pt-0.5 leading-snug">
                      {getOptionText(key)}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-slate-50 px-3 sm:px-6 py-2 sm:py-3 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handlePrev}
                disabled={examSession.currentQuestionIndex === 0}
                className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-[11px] sm:text-xs font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              <button
                onClick={() => toggleFlagQuestion(currentQ.id)}
                className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-colors border shadow-2xs cursor-pointer ${
                  isCurrentFlagged
                    ? 'bg-amber-500 border-amber-600 text-white'
                    : 'bg-white border-amber-300 text-amber-800 hover:bg-amber-50'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Ragu-ragu</span>
              </button>
            </div>

            <button
              onClick={handleNext}
              disabled={examSession.currentQuestionIndex === totalCount - 1}
              className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-[11px] sm:text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline">Simpan dan Lanjutkan</span>
              <span className="sm:hidden">Lanjutkan</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MOBILE Minimalist Navigation Strip (Tidak Terjepit!) */}
        <div className="md:hidden bg-white border-t border-slate-200 shrink-0">
          {/* Bar Info Ringkas + Tombol Buka Grid */}
          <div className="px-3 py-1.5 flex items-center justify-between border-b border-slate-100 text-[11px]">
            <div className="flex items-center gap-2.5 text-slate-600 font-semibold">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>{answeredCount}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{flaggedCount}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span>{unansweredCount}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200 cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Semua Nomor ({examSession.currentQuestionIndex + 1}/{totalCount})</span>
            </button>
          </div>

          {/* Horizontal Scrollable Question Numbers (Crisp 36x36px, Zero Cramping) */}
          <div className="px-3 py-2 bg-slate-50 flex items-center gap-1.5 overflow-x-auto">
            {examSession.questions.map((q, idx) => {
              const isSelected = examSession.currentQuestionIndex === idx;
              const hasAnswer = !!examSession.userAnswers[q.id];
              return (
                <button
                  key={q.id}
                  onClick={() => setQuestionIndex(idx)}
                  className={`shrink-0 w-9 h-9 flex flex-col items-center justify-center rounded-lg text-xs border transition-all cursor-pointer ${getNavButtonStyle(
                    q.id,
                    isSelected
                  )}`}
                >
                  <span className="leading-none">{idx + 1}</span>
                  {hasAnswer && (
                    <span className="text-[8px] mt-0.5 leading-none opacity-90 font-mono">
                      {examSession.userAnswers[q.id]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* DESKTOP Right Column: Palette Grid CAT BKN */}
        <div className="hidden md:flex md:w-80 bg-slate-50 flex-col overflow-hidden shrink-0">
          {/* Header */}
          <div className="p-3 bg-white border-b border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Navigasi Nomor Soal
              </span>
              <span className="text-xs font-mono font-semibold text-slate-600">
                {examSession.currentQuestionIndex + 1} / {totalCount}
              </span>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 p-0.5 bg-slate-100 rounded-md">
              {(['ALL', 'TWK', 'TIU', 'TKP'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`flex-1 py-1 text-[11px] font-bold rounded transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'ALL' ? 'Semua' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Palette Grid Buttons */}
          <div className="flex-1 p-3 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2">
              {filteredQuestions.map((q) => {
                const originalIndex = examSession.questions.findIndex(item => item.id === q.id);
                const isSelected = examSession.currentQuestionIndex === originalIndex;
                const hasAnswer = !!examSession.userAnswers[q.id];

                return (
                  <button
                    key={q.id}
                    onClick={() => setQuestionIndex(originalIndex)}
                    className={`h-9 flex flex-col items-center justify-center rounded-lg text-xs border transition-all cursor-pointer ${getNavButtonStyle(
                      q.id,
                      isSelected
                    )}`}
                  >
                    <span>{originalIndex + 1}</span>
                    {hasAnswer && (
                      <span className="text-[9px] -mt-0.5 leading-none opacity-90 font-mono">
                        {examSession.userAnswers[q.id]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tally and Legend (Hanya 3 Status: Hijau, Oranye, Abu) */}
          <div className="p-3 bg-white border-t border-slate-200 text-xs space-y-2">
            <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
              <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                <span className="block font-bold">{answeredCount}</span>
                <span className="text-[10px]">Dijawab</span>
              </div>
              <div className="p-1.5 rounded bg-amber-50 border border-amber-200 text-amber-800">
                <span className="block font-bold">{flaggedCount}</span>
                <span className="text-[10px]">Ragu-ragu</span>
              </div>
              <div className="p-1.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                <span className="block font-bold">{unansweredCount}</span>
                <span className="text-[10px]">Kosong</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 text-[10px] text-slate-600 pt-1.5 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-600 shrink-0" /> Sudah Dijawab
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500 shrink-0" /> Ragu-ragu
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-300 shrink-0" /> Belum Dijawab
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE Full Navigation Sheet Overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-xs flex items-end"
          onClick={() => setMobileNavOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full bg-white rounded-t-2xl border-t border-slate-200 shadow-2xl p-4 space-y-3 max-h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                  Navigasi Nomor Soal ({examSession.currentQuestionIndex + 1}/{totalCount})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category filter tabs */}
            <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg">
              {(['ALL', 'TWK', 'TIU', 'TKP'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-colors ${
                    categoryFilter === cat
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  {cat === 'ALL' ? 'Semua' : cat}
                </button>
              ))}
            </div>

            {/* Grid Numbers */}
            <div className="overflow-y-auto py-1 flex-1">
              <div className="grid grid-cols-6 gap-2">
                {filteredQuestions.map(q => {
                  const originalIndex = examSession.questions.findIndex(item => item.id === q.id);
                  const isSelected = examSession.currentQuestionIndex === originalIndex;
                  const hasAnswer = !!examSession.userAnswers[q.id];

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setQuestionIndex(originalIndex);
                        setMobileNavOpen(false);
                      }}
                      className={`h-10 flex flex-col items-center justify-center rounded-lg text-xs border transition-all ${getNavButtonStyle(
                        q.id,
                        isSelected
                      )}`}
                    >
                      <span>{originalIndex + 1}</span>
                      {hasAnswer && (
                        <span className="text-[9px] -mt-0.5 leading-none opacity-90 font-mono">
                          {examSession.userAnswers[q.id]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tally + 3 Status Legend */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <span className="block font-bold">{answeredCount}</span>
                  <span className="text-[10px]">Dijawab</span>
                </div>
                <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                  <span className="block font-bold">{flaggedCount}</span>
                  <span className="text-[10px]">Ragu-ragu</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                  <span className="block font-bold">{unansweredCount}</span>
                  <span className="text-[10px]">Kosong</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 text-[10px] text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-600" /> Sudah Dijawab
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Ragu-ragu
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-slate-300" /> Belum Dijawab
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Batalkan Ujian (Tidak Tersimpan) */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Batalkan Sesi Ujian?
                </h3>
                <p className="text-xs text-slate-500">
                  Jawaban pada sesi ini <strong>tidak akan disimpan</strong> ke riwayat nilai Anda.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              Cocok digunakan jika Anda salah memilih kotak soal atau ingin berganti paket Try Out / Latihan yang lain.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Lanjut Mengerjakan
              </button>
              <button
                type="button"
                onClick={() => {
                  setCancelModalOpen(false);
                  cancelExam();
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Ya, Batalkan Ujian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal (Selesai Ujian) */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center gap-3 text-amber-600">
              <ShieldAlert className="w-8 h-8 shrink-0 text-amber-500" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Konfirmasi Pengiriman Ujian
                </h3>
                <p className="text-xs text-slate-500">
                  Apakah Anda yakin ingin mengakhiri sesi ujian ini?
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Butir Soal:</span>
                <span className="font-bold text-slate-900">{totalCount} Butir</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Sudah Dijawab:</span>
                <span className="font-bold">{answeredCount} Soal</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>Ditandai Ragu-ragu:</span>
                <span className="font-bold">{flaggedCount} Soal</span>
              </div>
              <div className="flex justify-between text-red-600 font-semibold">
                <span>Belum Dijawab (Kosong):</span>
                <span className="font-bold">{unansweredCount} Soal</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                Perhatian: Terdapat <strong>{unansweredCount} butir soal</strong> yang belum Anda jawab. Jawaban kosong bernilai 0.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Periksa Kembali
              </button>
              <button
                onClick={() => {
                  setConfirmModalOpen(false);
                  finishCurrentExam();
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Yakin &amp; Kirim Ujian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Zoom Gambar Soal */}
      {zoomImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
          onClick={() => setZoomImageUrl(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-slate-200 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-extrabold text-slate-800">
                Tampilan Penuh Gambar Soal #{examSession.currentQuestionIndex + 1}
              </span>
              <button
                type="button"
                onClick={() => setZoomImageUrl(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 flex items-center justify-center max-h-[78vh] overflow-auto">
              <img
                src={zoomImageUrl}
                alt="Gambar Soal Penuh"
                className="max-w-full max-h-[72vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
