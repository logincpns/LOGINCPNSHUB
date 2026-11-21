import React from 'react';
import { useApp } from '../../context/AppContext';
import { Monitor, Clock, FileText, Play, X, AlertTriangle, Target } from 'lucide-react';
import { getCompactTargetRowsForExam } from '../../utils/passingGradeScale';

export const ExamStartConfirmModal: React.FC = () => {
  const { pendingExamLaunch, settings, confirmPendingExamLaunch, cancelPendingExamLaunch } = useApp();

  if (!pendingExamLaunch) return null;

  const resolvedCategory =
    pendingExamLaunch.questionCount >= 100
      ? undefined
      : pendingExamLaunch.category ??
        (pendingExamLaunch.pkg?.category && pendingExamLaunch.pkg.category !== 'CAMPURAN'
          ? pendingExamLaunch.pkg.category
          : undefined);

  const targetRows = getCompactTargetRowsForExam(
    pendingExamLaunch.questionCount,
    settings.default_passing_grade,
    resolvedCategory,
    settings.skd_calculator_config
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs"
      onClick={cancelPendingExamLaunch}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 to-sky-800 text-white flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
              <Play className="w-5 h-5 text-sky-200 fill-current" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-snug">
                Siap Memulai Simulasi Ujian?
              </h3>
              <p className="text-[11px] text-sky-200">
                Pastikan Anda memilih paket soal yang tepat sebelum timer berjalan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={cancelPendingExamLaunch}
            className="p-1 rounded-lg text-sky-200 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-3 text-xs">
          {/* Package Summary */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {pendingExamLaunch.categoryLabel}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Sistem Simulasi CAT</span>
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
              {pendingExamLaunch.title}
            </h4>
            {pendingExamLaunch.subtitle && (
              <p className="text-[11px] text-slate-500 leading-snug">
                {pendingExamLaunch.subtitle}
              </p>
            )}
            <div className="flex items-center gap-4 pt-1 border-t border-slate-200 text-slate-700 font-semibold">
              <span className="inline-flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                {pendingExamLaunch.questionCount} Butir Soal
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {pendingExamLaunch.durationMinutes} Menit
              </span>
            </div>
          </div>

          {/* Target Minimal Soal Lulus Passing Grade */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-extrabold text-[11px] text-slate-800">
                <Target className="w-3.5 h-3.5 text-blue-700" />
                <span>Target Minimal Lulus PG</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Benar +5 · Salah 0</span>
            </div>
            <div className={`grid gap-1.5 ${targetRows.length === 3 ? 'grid-cols-3' : 'grid-cols-1'}`}>
              {targetRows.map(row => (
                <div
                  key={row.code}
                  className={`p-2 rounded-lg border text-center leading-tight ${row.colorClass}`}
                >
                  <div className="font-extrabold text-[11px]">{row.code}</div>
                  <div className="text-[10px] font-mono font-semibold opacity-90">{row.pgLabel}</div>
                  <div className="text-[10px] font-extrabold mt-0.5">{row.minQuestionLabel}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Highlighted Device Recommendation Box */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-2.5">
            <Monitor className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-extrabold text-[11px] uppercase tracking-wide text-amber-800 block">
                Peringatan Tampilan Perangkat
              </span>
              <p className="text-xs font-semibold leading-snug">
                Untuk tampilan terbaik saat simulasi ujian tryout, gunakan tablet/laptop/PC.
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 text-[11px] text-slate-500">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Timer akan langsung berjalan setelah Anda menekan tombol <strong>Mulai Kerjakan Ujian</strong>. Anda tetap bisa menekan <strong>Batalkan Ujian</strong> jika salah memilih paket soal.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={cancelPendingExamLaunch}
              className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={confirmPendingExamLaunch}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Mulai Kerjakan Ujian</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
