import React, { useEffect, useMemo, useState } from 'react';
import {
  useApp,
  hasCalculatorAccess,
  getMembershipDisplayLabel,
  DEFAULT_SKD_CALCULATOR_CONFIG
} from '../../context/AppContext';
import {
  Calculator,
  Crown,
  Lock,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Sliders,
  Trophy,
  Info,
  Plus,
  Trash2,
  X,
  ClipboardList
} from 'lucide-react';
import { getSkdScaleTargets } from '../../utils/passingGradeScale';

interface SkbComponent {
  id: string;
  label: string;
  score: number; // 0 - 100 scale (or 0 - maxSkbCat for CAT if mode === 'CAT_500')
  weightPercent: number;
  maxScale: number;
}

export const SkdSkbCalculatorView: React.FC = () => {
  const {
    currentUser,
    results,
    settings,
    setActiveView,
    setPreferredUpgradePackageId,
    calculatorImportData,
    clearCalculatorImportData
  } = useApp();

  const calcConfig = settings.skd_calculator_config || DEFAULT_SKD_CALCULATOR_CONFIG;
  const isCalcGloballyEnabled = calcConfig.enabled !== false;
  const canAccess = hasCalculatorAccess(currentUser, settings);
  const pg = settings.default_passing_grade;

  const skdWeightPercent = calcConfig.skd_weight_percent || 40;
  const skbWeightPercent = calcConfig.skb_weight_percent || 60;
  const skdWeightRatio = skdWeightPercent / 100;
  const skbWeightRatio = skbWeightPercent / 100;
  const scaleTargets = getSkdScaleTargets(pg, calcConfig);
  const maxTwk = scaleTargets.maxTwk;
  const maxTiu = scaleTargets.maxTiu;
  const maxTkp = scaleTargets.maxTkp;
  const maxSkdTotal = scaleTargets.maxSkdTotal;
  const maxSkbCat = scaleTargets.maxSkbCat;

  const user110Results = useMemo(() => {
    if (!currentUser) return [];
    return results.filter(r => r.user_id === currentUser.id && r.total_questions === 110);
  }, [results, currentUser]);

  const latestResult = user110Results[0] || (currentUser ? results.find(r => r.user_id === currentUser.id) : undefined);

  // SKD Raw Scores
  const [twkScore, setTwkScore] = useState<number>(
    calculatorImportData?.twk ?? latestResult?.twk_score ?? 105
  );
  const [tiuScore, setTiuScore] = useState<number>(
    calculatorImportData?.tiu ?? latestResult?.tiu_score ?? 135
  );
  const [tkpScore, setTkpScore] = useState<number>(
    calculatorImportData?.tkp ?? latestResult?.tkp_score ?? 192
  );
  const [selected110ResultId, setSelected110ResultId] = useState<string>(
    calculatorImportData?.resultId ?? user110Results[0]?.id ?? ''
  );

  // Sync automatically whenever member clicks "Hitung di Kalkulator SKD" from a 110-question exam result
  useEffect(() => {
    if (calculatorImportData) {
      setTwkScore(calculatorImportData.twk);
      setTiuScore(calculatorImportData.tiu);
      setTkpScore(calculatorImportData.tkp);
      setSelected110ResultId(calculatorImportData.resultId);
    }
  }, [calculatorImportData]);

  // SKB Mode: 'CAT_ONLY' (100% CAT BKN scale 0-maxSkbCat) or 'MULTI_SUBTES' (CAT + Instansi)
  const [skbMode, setSkbMode] = useState<'CAT_ONLY' | 'MULTI_SUBTES'>('CAT_ONLY');
  const [skbCatScore500, setSkbCatScore500] = useState<number>(Math.min(maxSkbCat, 360));

  const [skbComponents, setSkbComponents] = useState<SkbComponent[]>([
    { id: 'skb-cat', label: `SKB CAT BKN (Skala 0–${maxSkbCat})`, score: 360, weightPercent: 50, maxScale: maxSkbCat },
    { id: 'skb-wawancara', label: 'Wawancara / Psikotes (Skala 0–100)', score: 84, weightPercent: 30, maxScale: 100 },
    { id: 'skb-praktik', label: 'Praktik Kerja / Microteaching (Skala 0–100)', score: 88, weightPercent: 20, maxScale: 100 }
  ]);

  // Competitor target simulation
  const [competitorSkdTotal, setCompetitorSkdTotal] = useState<number>(
    calcConfig.default_competitor_skd ?? 420
  );
  const [competitorSkbScale100, setCompetitorSkbScale100] = useState<number>(
    calcConfig.default_competitor_skb ?? 72
  );

  useEffect(() => {
    setCompetitorSkdTotal(calcConfig.default_competitor_skd ?? 420);
    setCompetitorSkbScale100(calcConfig.default_competitor_skb ?? 72);
  }, [calcConfig.default_competitor_skd, calcConfig.default_competitor_skb]);

  const redirectToIntensif = () => {
    setPreferredUpgradePackageId('pkg-2');
    setActiveView('premium');
  };

  const clampedTwk = Math.max(0, Math.min(maxTwk, Number(twkScore) || 0));
  const clampedTiu = Math.max(0, Math.min(maxTiu, Number(tiuScore) || 0));
  const clampedTkp = Math.max(0, Math.min(maxTkp, Number(tkpScore) || 0));
  const clampedSkbCat = Math.max(0, Math.min(maxSkbCat, Number(skbCatScore500) || 0));
  const totalSkdRaw = clampedTwk + clampedTiu + clampedTkp;

  const isPassTwk = clampedTwk >= pg.twk;
  const isPassTiu = clampedTiu >= pg.tiu;
  const isPassTkp = clampedTkp >= pg.tkp;
  const isPassAllPg = isPassTwk && isPassTiu && isPassTkp;

  const skdScale100 = maxSkdTotal > 0 ? (totalSkdRaw / maxSkdTotal) * 100 : 0;
  const skdContribution = skdScale100 * skdWeightRatio;

  // SKB Calculation
  const totalComponentWeight = skbComponents.reduce((acc, c) => acc + (Number(c.weightPercent) || 0), 0);
  const skbScale100 = (() => {
    if (skbMode === 'CAT_ONLY') {
      const clampedCat = Math.max(0, Math.min(maxSkbCat, Number(skbCatScore500) || 0));
      return maxSkbCat > 0 ? (clampedCat / maxSkbCat) * 100 : 0;
    }
    if (totalComponentWeight <= 0) return 0;
    const weightedSum = skbComponents.reduce((acc, c) => {
      const maxVal = c.maxScale;
      const clamped = Math.max(0, Math.min(maxVal, Number(c.score) || 0));
      const normalized100 = maxVal > 0 ? (clamped / maxVal) * 100 : 0;
      return acc + normalized100 * ((Number(c.weightPercent) || 0) / totalComponentWeight);
    }, 0);
    return weightedSum;
  })();

  const skbContribution = skbScale100 * skbWeightRatio;
  const finalIntegrationScore = skdContribution + skbContribution;

  // Competitor simulation
  const compSkdClamped = Math.max(0, Math.min(maxSkdTotal, Number(competitorSkdTotal) || 0));
  const compSkbClamped = Math.max(0, Math.min(100, Number(competitorSkbScale100) || 0));
  const compFinalScore =
    (maxSkdTotal > 0 ? (compSkdClamped / maxSkdTotal) * 100 * skdWeightRatio : 0) +
    compSkbClamped * skbWeightRatio;
  const neededSkbScale100 = skbWeightRatio > 0 ? Math.max(0, (compFinalScore - skdContribution) / skbWeightRatio) : 0;
  const neededSkbCat500 = (neededSkbScale100 / 100) * maxSkbCat;

  const pointPerSkdRaw = maxSkdTotal > 0 ? (1 / maxSkdTotal) * 100 * skdWeightRatio : 0;
  const pointPerSkbScale = skbWeightRatio;

  const handleLoadResultById = (resId: string) => {
    if (!canAccess) {
      redirectToIntensif();
      return;
    }
    const target = user110Results.find(r => r.id === resId) || latestResult;
    if (!target) return;
    setSelected110ResultId(target.id);
    setTwkScore(target.twk_score);
    setTiuScore(target.tiu_score);
    setTkpScore(target.tkp_score);
  };

  const handleLoadLatestResult = () => {
    handleLoadResultById(selected110ResultId || user110Results[0]?.id || latestResult?.id || '');
  };

  const handleAddComponent = () => {
    if (!canAccess) {
      redirectToIntensif();
      return;
    }
    setSkbComponents(prev => [
      ...prev,
      {
        id: `skb-${Date.now()}`,
        label: `Subtes Instansi #${prev.length + 1}`,
        score: 80,
        weightPercent: 10,
        maxScale: 100
      }
    ]);
  };

  const handleUpdateComponent = (id: string, patch: Partial<SkbComponent>) => {
    if (!canAccess) {
      redirectToIntensif();
      return;
    }
    setSkbComponents(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));
  };

  const handleRemoveComponent = (id: string) => {
    if (!canAccess) {
      redirectToIntensif();
      return;
    }
    if (skbComponents.length <= 1) return;
    setSkbComponents(prev => prev.filter(c => c.id !== id));
  };

  const accessTierText =
    calcConfig.access_tier === 'ALL_PAID'
      ? 'Semua Paket Berbayar'
      : calcConfig.access_tier === 'PREMIUM_AND_INTENSIF'
        ? 'Paket Premium & Intensif'
        : 'Paket Intensif Bimbel';

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-800 text-white shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold text-amber-300">
            <Calculator className="w-3.5 h-3.5" />
            <span>Fasilitas {accessTierText}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Kalkulator Nilai Integrasi SKD ({skdWeightPercent}%) &amp; SKB ({skbWeightPercent}%)
          </h1>
          <p className="text-xs text-sky-100 max-w-2xl leading-relaxed">
            Hitung simulasi skor akhir kelulusan CPNS berdasarkan pembobotan SKD {skdWeightPercent}% + SKB {skbWeightPercent}% beserta pemetaan target skor untuk mengungguli pesaing formasi.
          </p>
        </div>

        {(user110Results.length > 0 || latestResult) && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            {user110Results.length > 1 && canAccess && (
              <select
                aria-label="Pilih riwayat Try Out 110 Soal"
                value={selected110ResultId}
                onChange={e => handleLoadResultById(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/15 border border-white/25 text-white text-xs font-semibold max-w-[240px]"
              >
                {user110Results.map(r => (
                  <option key={r.id} value={r.id} className="text-slate-900">
                    {r.exam_title.slice(0, 34)} ({r.total_score})
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={handleLoadLatestResult}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer transition-colors ${
                canAccess
                  ? 'bg-white text-blue-900 hover:bg-sky-50'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
            >
              {!canAccess ? <Lock className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>
                {user110Results.length > 0
                  ? `Muat Try Out 110 Soal (${(user110Results.find(r => r.id === selected110ResultId) || user110Results[0]).total_score})`
                  : `Isi dari Ujian Terakhir (${latestResult?.total_score ?? 0})`}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Imported 110-question Try Out Notification Banner */}
      {calculatorImportData && canAccess && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-extrabold text-emerald-950">
                Nilai Try Out 110 Soal Otomatis Masuk ke Kalkulator!
              </div>
              <p className="text-emerald-800">
                Sumber: <strong>{calculatorImportData.examTitle}</strong> · TWK{' '}
                <strong className="font-mono">{calculatorImportData.twk}</strong>, TIU{' '}
                <strong className="font-mono">{calculatorImportData.tiu}</strong>, TKP{' '}
                <strong className="font-mono">{calculatorImportData.tkp}</strong> (Total{' '}
                <strong className="font-mono">{calculatorImportData.totalScore}</strong>)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveView('riwayat-ujian')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-bold hover:bg-emerald-100 cursor-pointer"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Riwayat Ujian</span>
            </button>
            <button
              type="button"
              onClick={clearCalculatorImportData}
              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 cursor-pointer"
              title="Tutup pemberitahuan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Admin Disabled Notice (shown if Super Admin disabled calculator) */}
      {!isCalcGloballyEnabled && (
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 text-xs text-slate-700 flex items-center gap-2.5">
          <Info className="w-4 h-4 text-slate-600 shrink-0" />
          <span>
            Fitur Kalkulator SKD &amp; SKB saat ini sedang dinonaktifkan sementara oleh Super Admin di menu{' '}
            <strong>12. Pengaturan Ujian</strong>.
          </span>
        </div>
      )}

      {/* Admin Custom Guidance Note */}
      {calcConfig.calculator_note && (
        <div className="px-4 py-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-[11px] text-blue-900 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-blue-700 shrink-0" />
          <span>{calcConfig.calculator_note}</span>
        </div>
      )}

      {/* Preview Notice Banner for non-authorized members */}
      {!canAccess && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-amber-700" />
            </div>
            <div className="space-y-1 text-xs">
              <h2 className="font-extrabold text-amber-950 text-sm">
                Pratinjau Kalkulator SKD &amp; SKB — Input &amp; Simulasi Terkunci
              </h2>
              <p className="text-amber-900 leading-relaxed">
                Status keanggotaan Anda saat ini: <strong>{getMembershipDisplayLabel(currentUser?.membership_type)}</strong>. Anda dapat melihat tampilan dan rumus kalkulator integrasi SKD ({skdWeightPercent}%) + SKB ({skbWeightPercent}%). Untuk menginput skor atau menghitung hasil Try Out 110 Soal langsung di kalkulator, silakan upgrade ke <strong>Paket Intensif Bimbel (Belajar Bersama)</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={redirectToIntensif}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Buka Akses Paket Intensif</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input SKD & SKB (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Input SKD */}
          <div className="p-6 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-4 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  1. Nilai SKD (Bobot Integrasi {skdWeightPercent}%)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Skor maksimal SKD adalah {maxSkdTotal} (TWK {maxTwk}, TIU {maxTiu}, TKP {maxTkp}).
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                  isPassAllPg
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {isPassAllPg ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Memenuhi Ambang Batas</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Belum Memenuhi PG</span>
                  </>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <label className="font-extrabold text-slate-800">TWK</label>
                  <span className={`text-[10px] font-bold ${isPassTwk ? 'text-emerald-700' : 'text-red-600'}`}>
                    PG {pg.twk}/{maxTwk}
                  </span>
                </div>
                <div className={`text-[11px] font-bold px-2 py-1 rounded-md border text-center ${
                  isPassTwk
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                    : 'bg-blue-50/80 border-blue-200 text-blue-800'
                }`}>
                  Min {scaleTargets.twkMinQ}/{scaleTargets.twkTotalQ} soal benar
                </div>
                <input
                  type="number"
                  min={0}
                  max={maxTwk}
                  step={5}
                  value={twkScore}
                  readOnly={!canAccess}
                  onClick={() => {
                    if (!canAccess) redirectToIntensif();
                  }}
                  onChange={e => {
                    if (!canAccess) {
                      redirectToIntensif();
                      return;
                    }
                    setTwkScore(Number(e.target.value));
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-base font-extrabold text-blue-700"
                />
                <input
                  type="range"
                  min={0}
                  max={maxTwk}
                  step={5}
                  value={clampedTwk}
                  onChange={e => {
                    if (!canAccess) {
                      redirectToIntensif();
                      return;
                    }
                    setTwkScore(Number(e.target.value));
                  }}
                  className="w-full accent-blue-700"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium">
                  <span>Saat ini:</span>
                  <strong className="font-mono text-slate-900">
                    {Math.floor(clampedTwk / 5)}/{scaleTargets.twkTotalQ} benar
                  </strong>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <label className="font-extrabold text-slate-800">TIU</label>
                  <span className={`text-[10px] font-bold ${isPassTiu ? 'text-emerald-700' : 'text-red-600'}`}>
                    PG {pg.tiu}/{maxTiu}
                  </span>
                </div>
                <div className={`text-[11px] font-bold px-2 py-1 rounded-md border text-center ${
                  isPassTiu
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                    : 'bg-sky-50/80 border-sky-200 text-sky-800'
                }`}>
                  Min {scaleTargets.tiuMinQ}/{scaleTargets.tiuTotalQ} soal benar
                </div>
                <input
                  type="number"
                  min={0}
                  max={maxTiu}
                  step={5}
                  value={tiuScore}
                  readOnly={!canAccess}
                  onClick={() => {
                    if (!canAccess) redirectToIntensif();
                  }}
                  onChange={e => {
                    if (!canAccess) {
                      redirectToIntensif();
                      return;
                    }
                    setTiuScore(Number(e.target.value));
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-base font-extrabold text-sky-700"
                />
                <input
                  type="range"
                  min={0}
                  max={maxTiu}
                  step={5}
                  value={clampedTiu}
                  onChange={e => {
                    if (!canAccess) {
                      redirectToIntensif();
                      return;
                    }
                    setTiuScore(Number(e.target.value));
                  }}
                  className="w-full accent-sky-600"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium">
                  <span>Saat ini:</span>
                  <strong className="font-mono text-slate-900">
                    {Math.floor(clampedTiu / 5)}/{scaleTargets.tiuTotalQ} benar
                  </strong>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <label className="font-extrabold text-slate-800">TKP</label>
                  <span className={`text-[10px] font-bold ${isPassTkp ? 'text-emerald-700' : 'text-red-600'}`}>
                    PG {pg.tkp}/{maxTkp}
                  </span>
                </div>
                <div className={`text-[11px] font-bold px-2 py-1 rounded-md border text-center ${
                  isPassTkp
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                    : 'bg-teal-50/80 border-teal-200 text-teal-800'
                }`}>
                  Min {scaleTargets.tkpMinQ5}/{scaleTargets.tkpTotalQ} poin 5
                </div>
                <input
                  type="number"
                  min={0}
                  max={maxTkp}
                  step={1}
                  value={tkpScore}
                  readOnly={!canAccess}
                  onClick={() => {
                    if (!canAccess) redirectToIntensif();
                  }}
                  onChange={e => {
                    if (!canAccess) {
                      redirectToIntensif();
                      return;
                    }
                    setTkpScore(Number(e.target.value));
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-base font-extrabold text-emerald-700"
                />
                <input
                  type="range"
                  min={0}
                  max={maxTkp}
                  step={1}
                  value={clampedTkp}
                  onChange={e => {
                    if (!canAccess) {
                      redirectToIntensif();
                      return;
                    }
                    setTkpScore(Number(e.target.value));
                  }}
                  className="w-full accent-emerald-600"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium">
                  <span>Rata² poin ({scaleTargets.tkpTotalQ} soal):</span>
                  <strong className="font-mono text-slate-900">
                    {(clampedTkp / scaleTargets.tkpTotalQ).toFixed(1)}/soal
                  </strong>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-slate-600">Total SKD: </span>
                <strong className="font-mono text-blue-800 text-sm">{totalSkdRaw} / {maxSkdTotal}</strong>
                <span className="text-[11px] text-slate-500 ml-1.5">
                  (Min Total PG: {pg.twk + pg.tiu + pg.tkp})
                </span>
              </div>
              <div>
                <span className="text-slate-600">Skala 100: </span>
                <strong className="font-mono text-slate-900">{skdScale100.toFixed(2)}</strong>
                <span className="mx-2 text-slate-400">·</span>
                <span className="text-slate-600">Poin {skdWeightPercent}%: </span>
                <strong className="font-mono text-blue-700 text-sm">{skdContribution.toFixed(3)}</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Input SKB */}
          <div className="p-6 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  2. Nilai SKB (Bobot Integrasi {skbWeightPercent}%)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Pilih format SKB CAT BKN murni (100% CAT) atau gabungan beberapa subtes instansi.
                </p>
              </div>

              <div className="inline-flex rounded-xl bg-slate-100 p-1 text-[11px] font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (!canAccess) {
                      redirectToIntensif();
                      return;
                    }
                    setSkbMode('CAT_ONLY');
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    skbMode === 'CAT_ONLY' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  CAT BKN (100%)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!canAccess) {
                      redirectToIntensif();
                      return;
                    }
                    setSkbMode('MULTI_SUBTES');
                  }}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    skbMode === 'MULTI_SUBTES' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {!canAccess && <Lock className="w-3 h-3 text-amber-600" />}
                  <span>Multi-Subtes Instansi</span>
                </button>
              </div>
            </div>

            {skbMode === 'CAT_ONLY' ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-extrabold text-slate-800">
                    Skor SKB CAT BKN (Maks {maxSkbCat} · {scaleTargets.skbTotalQ} Soal)
                  </label>
                  <span className="font-mono font-bold text-indigo-700">
                    Skala 100: {skbScale100.toFixed(2)}
                  </span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={maxSkbCat}
                  step={5}
                  value={skbCatScore500}
                  readOnly={!canAccess}
                  onClick={() => {
                    if (!canAccess) redirectToIntensif();
                  }}
                  onChange={e => {
                    if (!canAccess) {
                      redirectToIntensif();
                      return;
                    }
                    setSkbCatScore500(Number(e.target.value));
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-lg font-extrabold text-indigo-700"
                />
                <input
                  type="range"
                  min={0}
                  max={maxSkbCat}
                  step={5}
                  value={clampedSkbCat}
                  onChange={e => {
                    if (!canAccess) {
                      redirectToIntensif();
                      return;
                    }
                    setSkbCatScore500(Number(e.target.value));
                  }}
                  className="w-full accent-indigo-600"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] bg-indigo-50/80 border border-indigo-200 rounded-lg px-3 py-2 text-indigo-950">
                  <span>
                    Target Anda:{' '}
                    <strong className="font-mono text-indigo-700">
                      {Math.round(clampedSkbCat / 5)}/{scaleTargets.skbTotalQ} soal benar
                    </strong>{' '}
                    (skor {clampedSkbCat}/{maxSkbCat})
                  </span>
                  <span>
                    Poin {skbWeightPercent}%:{' '}
                    <strong className="font-mono text-indigo-700">{skbContribution.toFixed(3)}</strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {skbComponents.map(comp => (
                  <div
                    key={comp.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
                  >
                    <div className="sm:col-span-5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Nama Subtes
                      </label>
                      <input
                        type="text"
                        value={comp.label}
                        onChange={e => handleUpdateComponent(comp.id, { label: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Skala Maks
                      </label>
                      <select
                        value={comp.maxScale}
                        onChange={e =>
                          handleUpdateComponent(comp.id, {
                            maxScale: Number(e.target.value)
                          })
                        }
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      >
                        <option value={100}>100</option>
                        <option value={maxSkbCat}>{maxSkbCat}</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Nilai
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={comp.maxScale}
                        value={comp.score}
                        onChange={e => handleUpdateComponent(comp.id, { score: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-indigo-700"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Bobot (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={comp.weightPercent}
                        onChange={e =>
                          handleUpdateComponent(comp.id, { weightPercent: Number(e.target.value) })
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveComponent(comp.id)}
                        disabled={skbComponents.length <= 1}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 cursor-pointer"
                        title="Hapus komponen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAddComponent}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Subtes SKB</span>
                  </button>
                  <span
                    className={`font-mono font-bold ${
                      totalComponentWeight === 100 ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    Total Bobot Subtes: {totalComponentWeight}% {totalComponentWeight !== 100 && '(disarankan 100%)'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Hasil Integrasi & Simulasi Pesaing (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Result Card */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-md space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                Hasil Nilai Integrasi Akhir
              </span>
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>

            <div className="text-center py-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-4xl sm:text-5xl font-extrabold font-mono text-amber-300 tabular-nums">
                {finalIntegrationScore.toFixed(3)}
              </div>
              <p className="text-xs text-slate-300">Skor Akhir Skala 0 – 100,000</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Kontribusi SKD ({skdWeightPercent}%)</span>
                  <span className="font-mono font-bold text-sky-300">
                    {skdContribution.toFixed(3)} / {skdWeightPercent.toFixed(3)}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-sky-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, skdWeightPercent > 0 ? (skdContribution / skdWeightPercent) * 100 : 0)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Kontribusi SKB ({skbWeightPercent}%)</span>
                  <span className="font-mono font-bold text-emerald-300">
                    {skbContribution.toFixed(3)} / {skbWeightPercent.toFixed(3)}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, skbWeightPercent > 0 ? (skbContribution / skbWeightPercent) * 100 : 0)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/10 border border-white/15 text-[11px] text-slate-200 flex items-start gap-2 leading-relaxed">
              <Info className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
              <span>
                1 poin ekstra pada <strong>SKD (skala {maxSkdTotal})</strong> bernilai{' '}
                <strong>{pointPerSkdRaw.toFixed(3)} poin akhir</strong>, sedangkan 1 poin ekstra pada{' '}
                <strong>SKB (skala 100)</strong> bernilai{' '}
                <strong>{pointPerSkbScale.toFixed(3)} poin akhir</strong>.
              </span>
            </div>
          </div>

          {/* Simulasi Ngejar Pesaing */}
          <div className="p-6 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Sliders className="w-4 h-4 text-blue-700" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Simulasi Kejar Skor Pesaing Formasi
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Skor SKD Pesaing (/{maxSkdTotal})</label>
                <input
                  type="number"
                  min={0}
                  max={maxSkdTotal}
                  value={competitorSkdTotal}
                  readOnly={!canAccess}
                  onClick={() => {
                    if (!canAccess) redirectToIntensif();
                  }}
                  onChange={e => {
                    if (!canAccess) {
                      redirectToIntensif();
                      return;
                    }
                    setCompetitorSkdTotal(Number(e.target.value));
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Est. SKB Pesaing (/100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={competitorSkbScale100}
                  readOnly={!canAccess}
                  onClick={() => {
                    if (!canAccess) redirectToIntensif();
                  }}
                  onChange={e => {
                    if (!canAccess) {
                      redirectToIntensif();
                      return;
                    }
                    setCompetitorSkbScale100(Number(e.target.value));
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-indigo-900 font-semibold">Nilai Akhir Pesaing:</span>
                <span className="font-mono font-extrabold text-indigo-800">{compFinalScore.toFixed(3)}</span>
              </div>
              <div className="border-t border-indigo-200 pt-2">
                {neededSkbScale100 > 100 ? (
                  <p className="text-red-700 font-bold">
                    Target SKB melebihi 100 ({neededSkbScale100.toFixed(2)}). Tingkatkan skor SKD Anda terlebih dulu agar selisih poin terkejar.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-indigo-950 leading-relaxed">
                      Target kejar pesaing: min SKB{' '}
                      <strong className="font-mono text-blue-700">{neededSkbScale100.toFixed(2)}/100</strong>{' '}
                      (skor <strong className="font-mono text-blue-700">{Math.ceil(neededSkbCat500)}/{maxSkbCat}</strong>).
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-900 font-bold">
                      <span>
                        Wajib benar minimal{' '}
                        <strong className="font-mono text-blue-700">
                          {Math.min(scaleTargets.skbTotalQ, Math.ceil(neededSkbCat500 / 5))} dari {scaleTargets.skbTotalQ} soal SKB
                        </strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!canAccess ? (
              <button
                type="button"
                onClick={redirectToIntensif}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-2xs cursor-pointer transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Buka Kalkulator Penuh via Paket Intensif</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Bawa hasil kalkulasi ini ke sesi Zoom Bimbel malam untuk konsultasi formasi bersama tutor.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
