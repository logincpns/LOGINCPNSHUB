import React, { useState } from 'react';
import { useApp, hasCalculatorAccess } from '../../context/AppContext';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Award,
  Sparkles,
  ArrowLeft,
  Calculator
} from 'lucide-react';
import { ExamResult, ExamType } from '../../types';
import { getSkdScaleTargets, getCompactTargetRowsForExam } from '../../utils/passingGradeScale';

export const RiwayatUjianView: React.FC = () => {
  const {
    results,
    currentUser,
    settings,
    selectedResultReview,
    setSelectedResultReview,
    openCalculatorWithResult
  } = useApp();

  const canImport110ToCalculator = (res: ExamResult) =>
    Boolean(
      currentUser &&
        (currentUser.membership_type === 'INTENSIF' || currentUser.role === 'SUPER_ADMIN') &&
        hasCalculatorAccess(currentUser, settings) &&
        (settings.skd_calculator_config?.enable_auto_import_110 ?? true) &&
        res.total_questions === 110
    );

  const [filterType, setFilterType] = useState<ExamType | 'ALL'>('ALL');
  const [reviewQuestionIdx, setReviewQuestionIdx] = useState<number>(0);

  const userResults = results.filter(r => r.user_id === currentUser?.id);

  const filteredResults = userResults.filter(r => {
    if (filterType === 'ALL') return true;
    return r.exam_type === filterType;
  });

  // If a result is selected for detailed question review (PRD Section 10)
  if (selectedResultReview) {
    const qList = selectedResultReview.questions_snapshot;
    const currentQ = qList[reviewQuestionIdx] || qList[0];
    const userAns = selectedResultReview.user_answers[currentQ?.id];
    const isCorrect = currentQ?.category !== 'TKP' ? userAns === currentQ?.correct_answer : undefined;

    const getOptionWeight = (optKey: 'A' | 'B' | 'C' | 'D' | 'E') => {
      const key = `weight_${optKey.toLowerCase()}` as keyof typeof currentQ;
      return (currentQ[key] as number) || 0;
    };

    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* Back Button & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-300/80 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedResultReview(null)}
              className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900">
                Detail Hasil &amp; Pembahasan Soal
              </h1>
              <p className="text-xs text-slate-500">
                {selectedResultReview.exam_title} · {new Date(selectedResultReview.completed_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block uppercase">Total Nilai</span>
              <span className="font-mono text-xl font-extrabold text-blue-700">
                {selectedResultReview.total_score}
              </span>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                selectedResultReview.pass_status === 'MEMENUHI_AMBANG_BATAS'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {selectedResultReview.pass_status === 'MEMENUHI_AMBANG_BATAS' ? 'LULUS AMBANG BATAS' : 'BELUM MEMENUHI'}
            </span>
          </div>
        </div>

        {/* Score Summary Cards */}
        {(() => {
          const pgSnap = selectedResultReview.passing_grade_snapshot;
          const isFullSkd = selectedResultReview.total_questions >= 100 || !selectedResultReview.category;
          const scale = getSkdScaleTargets(pgSnap, settings.skd_calculator_config);
          const singleRows = !isFullSkd
            ? getCompactTargetRowsForExam(
                selectedResultReview.total_questions,
                pgSnap,
                selectedResultReview.category,
                settings.skd_calculator_config
              )
            : [];
          const singleTarget = singleRows[0];

          const twkGapQ = Math.max(0, Math.ceil((pgSnap.twk - selectedResultReview.twk_score) / 5));
          const tiuGapQ = Math.max(0, Math.ceil((pgSnap.tiu - selectedResultReview.tiu_score) / 5));
          const tkpGapPts = Math.max(0, pgSnap.tkp - selectedResultReview.tkp_score);

          const singleCat = selectedResultReview.category;
          const singlePgScore =
            singleCat === 'TWK'
              ? selectedResultReview.total_questions <= 15
                ? 25
                : Math.min(selectedResultReview.total_questions * 5, pgSnap.twk)
              : singleCat === 'TIU'
                ? selectedResultReview.total_questions <= 15
                  ? 25
                  : Math.min(selectedResultReview.total_questions * 5, pgSnap.tiu)
                : selectedResultReview.total_questions <= 15
                  ? 50
                  : Math.min(selectedResultReview.total_questions * 5, pgSnap.tkp);

          return (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-slate-300/80 shadow-xs text-center space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Skor TWK</span>
                  <span className="text-lg font-mono font-extrabold text-blue-700 block">
                    {selectedResultReview.twk_score}
                  </span>
                  {isFullSkd ? (
                    <>
                      <span className="text-[10px] font-semibold text-slate-600 block">
                        Benar: {Math.floor(selectedResultReview.twk_score / 5)}/{scale.twkTotalQ} soal
                      </span>
                      <span className={`text-[10px] font-bold block ${selectedResultReview.twk_score >= pgSnap.twk ? 'text-emerald-700' : 'text-red-600'}`}>
                        PG {pgSnap.twk} · Min {scale.twkMinQ}/{scale.twkTotalQ} benar
                      </span>
                    </>
                  ) : singleCat === 'TWK' && singleTarget ? (
                    <>
                      <span className="text-[10px] font-semibold text-slate-600 block">
                        Benar: {Math.floor(selectedResultReview.twk_score / 5)}/{selectedResultReview.total_questions} soal
                      </span>
                      <span className={`text-[10px] font-bold block ${selectedResultReview.twk_score >= singlePgScore ? 'text-emerald-700' : 'text-red-600'}`}>
                        {singleTarget.pgLabel} · {singleTarget.minQuestionLabel}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-400 block">Tidak diujikan</span>
                  )}
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-300/80 shadow-xs text-center space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Skor TIU</span>
                  <span className="text-lg font-mono font-extrabold text-sky-700 block">
                    {selectedResultReview.tiu_score}
                  </span>
                  {isFullSkd ? (
                    <>
                      <span className="text-[10px] font-semibold text-slate-600 block">
                        Benar: {Math.floor(selectedResultReview.tiu_score / 5)}/{scale.tiuTotalQ} soal
                      </span>
                      <span className={`text-[10px] font-bold block ${selectedResultReview.tiu_score >= pgSnap.tiu ? 'text-emerald-700' : 'text-red-600'}`}>
                        PG {pgSnap.tiu} · Min {scale.tiuMinQ}/{scale.tiuTotalQ} benar
                      </span>
                    </>
                  ) : singleCat === 'TIU' && singleTarget ? (
                    <>
                      <span className="text-[10px] font-semibold text-slate-600 block">
                        Benar: {Math.floor(selectedResultReview.tiu_score / 5)}/{selectedResultReview.total_questions} soal
                      </span>
                      <span className={`text-[10px] font-bold block ${selectedResultReview.tiu_score >= singlePgScore ? 'text-emerald-700' : 'text-red-600'}`}>
                        {singleTarget.pgLabel} · {singleTarget.minQuestionLabel}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-400 block">Tidak diujikan</span>
                  )}
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-300/80 shadow-xs text-center space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Skor TKP</span>
                  <span className="text-lg font-mono font-extrabold text-emerald-700 block">
                    {selectedResultReview.tkp_score}
                  </span>
                  {isFullSkd ? (
                    <>
                      <span className="text-[10px] font-semibold text-slate-600 block">
                        Rata² {(selectedResultReview.tkp_score / scale.tkpTotalQ).toFixed(1)}/soal ({scale.tkpTotalQ} soal)
                      </span>
                      <span className={`text-[10px] font-bold block ${selectedResultReview.tkp_score >= pgSnap.tkp ? 'text-emerald-700' : 'text-red-600'}`}>
                        PG {pgSnap.tkp} · Min {scale.tkpMinQ5}/{scale.tkpTotalQ} poin 5
                      </span>
                    </>
                  ) : singleCat === 'TKP' && singleTarget ? (
                    <>
                      <span className="text-[10px] font-semibold text-slate-600 block">
                        Rata² {(selectedResultReview.tkp_score / Math.max(1, selectedResultReview.total_questions)).toFixed(1)}/soal
                      </span>
                      <span className={`text-[10px] font-bold block ${selectedResultReview.tkp_score >= singlePgScore ? 'text-emerald-700' : 'text-red-600'}`}>
                        {singleTarget.pgLabel} · {singleTarget.minQuestionLabel}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-400 block">Tidak diujikan</span>
                  )}
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-300/80 shadow-xs text-center space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Durasi</span>
                  <span className="text-lg font-mono font-extrabold text-slate-800 block">
                    {Math.floor(selectedResultReview.duration_seconds / 60)}m
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Dijawab: {selectedResultReview.answered_count}/{selectedResultReview.total_questions}
                  </span>
                </div>
              </div>

              {isFullSkd && (twkGapQ > 0 || tiuGapQ > 0 || tkpGapPts > 0) && (
                <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-900 flex flex-wrap items-center gap-2">
                  <span>Kekurangan PG:</span>
                  {twkGapQ > 0 && <span>TWK kurang {twkGapQ} soal benar</span>}
                  {tiuGapQ > 0 && <span>· TIU kurang {tiuGapQ} soal benar</span>}
                  {tkpGapPts > 0 && <span>· TKP kurang {tkpGapPts} poin</span>}
                </div>
              )}
            </div>
          );
        })()}

        {/* Tombol Hitung Kalkulator SKD Khusus Member Intensif untuk Try Out Full 110 Soal */}
        {canImport110ToCalculator(selectedResultReview) && (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5 text-xs">
              <div className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-indigo-700" />
                <span>Integrasi Kalkulator SKD &amp; SKB (Paket Intensif · Try Out 110 Soal)</span>
              </div>
              <p className="text-indigo-800">
                Kirim nilai SKD hasil try out ini (TWK{' '}
                <strong className="font-mono">{selectedResultReview.twk_score}</strong> · TIU{' '}
                <strong className="font-mono">{selectedResultReview.tiu_score}</strong> · TKP{' '}
                <strong className="font-mono">{selectedResultReview.tkp_score}</strong>) langsung ke menu Kalkulator untuk menghitung nilai akhir &amp; target SKB.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openCalculatorWithResult(selectedResultReview)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-extrabold rounded-xl shadow-xs shrink-0 cursor-pointer transition-colors"
            >
              <Calculator className="w-4 h-4" />
              <span>Hitung di Kalkulator SKD</span>
            </button>
          </div>
        )}

        {/* Question Review Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question + Explanation */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">
                  Soal Nomor {reviewQuestionIdx + 1}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-bold uppercase bg-blue-100 text-blue-800">
                  {currentQ?.category}
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  ({currentQ?.topic})
                </span>
              </div>

              {/* Status Badge */}
              <div>
                {!userAns ? (
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    Tidak Dijawab
                  </span>
                ) : currentQ?.category === 'TKP' ? (
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Poin Anda: {getOptionWeight(userAns)} / 5
                  </span>
                ) : isCorrect ? (
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Benar (+5)
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Salah (0)
                  </span>
                )}
              </div>
            </div>

            {/* Question Text */}
            <div className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
              {currentQ?.question_text}
            </div>

            {/* Options with Answer Highlight */}
            <div className="space-y-2.5">
              {(['A', 'B', 'C', 'D', 'E'] as const).map(optKey => {
                const optText = currentQ[`option_${optKey.toLowerCase()}` as keyof typeof currentQ] as string;
                const isUserChoice = userAns === optKey;
                const isCorrectKey = currentQ?.correct_answer === optKey && currentQ?.category !== 'TKP';
                const tkpWeight = currentQ?.category === 'TKP' ? getOptionWeight(optKey) : undefined;

                let rowStyle = 'border-slate-200 bg-white';
                if (isCorrectKey) {
                  rowStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold';
                } else if (isUserChoice && !isCorrectKey && currentQ?.category !== 'TKP') {
                  rowStyle = 'border-red-400 bg-red-50/70 text-red-950';
                } else if (isUserChoice && currentQ?.category === 'TKP') {
                  rowStyle = 'border-blue-500 bg-blue-50/70 text-blue-950 font-semibold';
                }

                return (
                  <div
                    key={optKey}
                    className={`flex items-start justify-between p-3.5 rounded-xl border text-xs leading-snug transition-colors ${rowStyle}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 ${
                        isCorrectKey ? 'bg-emerald-600 text-white' :
                        isUserChoice ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {optKey}
                      </span>
                      <span className="pt-0.5">{optText}</span>
                    </div>

                    <div className="shrink-0 pl-3">
                      {currentQ?.category === 'TKP' && (
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white/80 border border-slate-300">
                          Bobot: {tkpWeight}
                        </span>
                      )}
                      {isUserChoice && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded ml-1">
                          Jawaban Anda
                        </span>
                      )}
                      {isCorrectKey && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded ml-1">
                          Kunci Benar
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanation / Pembahasan per PRD Section 10 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Kunci &amp; Pembahasan Lengkap:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {currentQ?.explanation}
              </p>
            </div>

            {/* Pagination / Prev & Next */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setReviewQuestionIdx(prev => Math.max(0, prev - 1))}
                disabled={reviewQuestionIdx === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
              <span className="text-xs font-mono text-slate-500">
                {reviewQuestionIdx + 1} / {qList.length}
              </span>
              <button
                onClick={() => setReviewQuestionIdx(prev => Math.min(qList.length - 1, prev + 1))}
                disabled={reviewQuestionIdx === qList.length - 1}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 disabled:opacity-40"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Palette Grid for Review */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-800">
              Daftar Soal Ujian
            </h4>

            <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto p-1">
              {qList.map((q, idx) => {
                const ans = selectedResultReview.user_answers[q.id];
                const active = reviewQuestionIdx === idx;
                let bg = 'bg-slate-100 text-slate-600 border-slate-200';

                if (!ans) {
                  bg = 'bg-slate-200 text-slate-600 border-slate-300';
                } else if (q.category === 'TKP') {
                  bg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                } else if (ans === q.correct_answer) {
                  bg = 'bg-emerald-600 text-white font-bold border-emerald-700';
                } else {
                  bg = 'bg-red-500 text-white font-bold border-red-600';
                }

                if (active) {
                  bg += ' ring-2 ring-blue-600 ring-offset-1 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setReviewQuestionIdx(idx)}
                    className={`h-8 rounded-lg text-xs border flex items-center justify-center transition-all ${bg}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
                <span>Benar / Bobot TKP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-red-500" />
                <span>Salah</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-slate-200" />
                <span>Tidak Dijawab</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper format tanggal singkat & padat (contoh: 20/11/2026)
  const formatCompactDate = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

  // List of all exam history per PRD Section 15
  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Header */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-300/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4">
        <div>
          <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900">
            Riwayat Ujian &amp; Hasil Latihan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar seluruh simulasi dan latihan yang telah Anda selesaikan beserta skor TWK, TIU, TKP, dan pembahasan soal.
          </p>
        </div>

        {/* Filter per PRD Section 15 */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Ujian
          </button>
          <button
            onClick={() => setFilterType('TRYOUT_SKD_LENGKAP')}
            className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterType === 'TRYOUT_SKD_LENGKAP'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tryout Lengkap
          </button>
          <button
            onClick={() => setFilterType('TRYOUT_KATEGORI')}
            className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterType === 'TRYOUT_KATEGORI'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tryout Kategori
          </button>
          <button
            onClick={() => setFilterType('LATIHAN_HARIAN')}
            className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterType === 'LATIHAN_HARIAN'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Latihan Harian
          </button>
          <button
            onClick={() => setFilterType('TRYOUT_BERSAMA')}
            className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterType === 'TRYOUT_BERSAMA'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tryout Bareng
          </button>
        </div>
      </div>

      {/* Results List (Mobile Compact Cards + Tablet/Desktop Compact Table) */}
      <div className="bg-white rounded-2xl border border-slate-300/80 shadow-sm overflow-hidden">
        {filteredResults.length === 0 ? (
          <div className="p-10 sm:p-12 text-center space-y-3">
            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">Belum Ada Riwayat Ujian</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Anda belum memiliki riwayat ujian pada filter ini. Mulai latihan pertama Anda di menu Tryout &amp; Latihan.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Compact Card Layout (Tanpa Scroll Samping) */}
            <div className="md:hidden divide-y divide-slate-200">
              {filteredResults.map(res => (
                <div key={res.id} className="p-3.5 space-y-2.5">
                  {/* Top meta: tanggal padat + soal + durasi + status */}
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-500 font-mono tabular-nums min-w-0">
                      <span className="font-semibold text-slate-700">
                        {formatCompactDate(res.completed_at)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{res.total_questions} Soal</span>
                      <span aria-hidden="true">·</span>
                      <span>{Math.floor(res.duration_seconds / 60)}m</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                        res.pass_status === 'MEMENUHI_AMBANG_BATAS'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {res.pass_status === 'MEMENUHI_AMBANG_BATAS' ? 'LULUS PG' : 'TIDAK LULUS'}
                    </span>
                  </div>

                  {/* Exam Title */}
                  <h3 className="font-extrabold text-[13px] text-slate-900 leading-snug">
                    {res.exam_title}
                  </h3>

                  {/* Compact Score Grid + Pembahasan */}
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="py-1.5 px-1 rounded-lg bg-blue-50/70 border border-blue-100">
                      <span className="text-[9px] font-bold text-slate-500 uppercase block leading-none">
                        TWK
                      </span>
                      <span className="text-xs font-mono font-extrabold text-blue-700 mt-1 block tabular-nums">
                        {res.twk_score}
                      </span>
                    </div>
                    <div className="py-1.5 px-1 rounded-lg bg-sky-50/70 border border-sky-100">
                      <span className="text-[9px] font-bold text-slate-500 uppercase block leading-none">
                        TIU
                      </span>
                      <span className="text-xs font-mono font-extrabold text-sky-700 mt-1 block tabular-nums">
                        {res.tiu_score}
                      </span>
                    </div>
                    <div className="py-1.5 px-1 rounded-lg bg-emerald-50/70 border border-emerald-100">
                      <span className="text-[9px] font-bold text-slate-500 uppercase block leading-none">
                        TKP
                      </span>
                      <span className="text-xs font-mono font-extrabold text-emerald-700 mt-1 block tabular-nums">
                        {res.tkp_score}
                      </span>
                    </div>
                    <div className="py-1.5 px-1 rounded-lg bg-slate-100 border border-slate-200">
                      <span className="text-[9px] font-bold text-slate-600 uppercase block leading-none">
                        Total
                      </span>
                      <span className="text-xs font-mono font-extrabold text-slate-900 mt-1 block tabular-nums">
                        {res.total_score}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedResultReview(res);
                        setReviewQuestionIdx(0);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Pembahasan Soal</span>
                    </button>
                    {canImport110ToCalculator(res) && (
                      <button
                        type="button"
                        onClick={() => openCalculatorWithResult(res)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Hitung Kalkulator SKD</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tablet & Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                    <th className="py-3 px-3">Tanggal</th>
                    <th className="py-3 px-3">Nama Ujian &amp; Mode</th>
                    <th className="py-3 px-3 whitespace-nowrap">Soal</th>
                    <th className="py-3 px-2.5 font-mono text-center">TWK</th>
                    <th className="py-3 px-2.5 font-mono text-center">TIU</th>
                    <th className="py-3 px-2.5 font-mono text-center">TKP</th>
                    <th className="py-3 px-3 font-mono font-bold text-center">Total</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResults.map(res => (
                    <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 text-slate-600 font-mono tabular-nums whitespace-nowrap">
                        {formatCompactDate(res.completed_at)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{res.exam_title}</div>
                        <div className="text-[11px] text-slate-500">
                          Durasi: {Math.floor(res.duration_seconds / 60)} menit
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                        {res.total_questions} Soal
                      </td>
                      <td className="py-3 px-2.5 font-mono text-blue-700 font-semibold text-center tabular-nums">
                        {res.twk_score}
                      </td>
                      <td className="py-3 px-2.5 font-mono text-sky-700 font-semibold text-center tabular-nums">
                        {res.tiu_score}
                      </td>
                      <td className="py-3 px-2.5 font-mono text-emerald-700 font-semibold text-center tabular-nums">
                        {res.tkp_score}
                      </td>
                      <td className="py-3 px-3 font-mono font-extrabold text-slate-900 text-sm text-center tabular-nums">
                        {res.total_score}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            res.pass_status === 'MEMENUHI_AMBANG_BATAS'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {res.pass_status === 'MEMENUHI_AMBANG_BATAS' ? 'LULUS PG' : 'TIDAK LULUS'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedResultReview(res);
                              setReviewQuestionIdx(0);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Pembahasan</span>
                          </button>
                          {canImport110ToCalculator(res) && (
                            <button
                              type="button"
                              onClick={() => openCalculatorWithResult(res)}
                              title="Kirim nilai Try Out 110 Soal ke Kalkulator SKD"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                            >
                              <Calculator className="w-3.5 h-3.5" />
                              <span>Kalkulator SKD</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
