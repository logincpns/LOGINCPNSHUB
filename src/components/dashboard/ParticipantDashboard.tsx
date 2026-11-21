import React, { useState } from 'react';
import {
  useApp,
  hasFullMaterialAccess,
  isStandarRestrictedToQuestions,
  hasZoomAccess,
  hasCalculatorAccess,
  getMembershipDisplayLabel
} from '../../context/AppContext';
import { AdminAnnouncement, AnnouncementCategory } from '../../types';
import {
  BookOpen,
  Award,
  Video,
  Sparkles,
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Play,
  ClipboardList,
  Crown,
  Layers,
  Users,
  Megaphone,
  Pin,
  X,
  ArrowRight,
  Lock,
  Calculator
} from 'lucide-react';
import { ShortVideoThumbnail, getShortVideoCategoryLabel } from '../materi/ShortVideoPlayer';
import { getSkdScaleTargets } from '../../utils/passingGradeScale';

const ANNOUNCEMENT_CATEGORY_META: Record<
  AnnouncementCategory,
  { label: string; badgeClass: string }
> = {
  JADWAL_CPNS: {
    label: 'Jadwal Resmi',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  MAINTENANCE: {
    label: 'Gangguan / Maintenance',
    badgeClass: 'bg-red-100 text-red-800 border-red-200'
  },
  TRYOUT: {
    label: 'Info Tryout',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  BERITA_UMUM: {
    label: 'Berita & Info',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200'
  }
};

export const ParticipantDashboard: React.FC = () => {
  const {
    currentUser,
    results,
    groupSessions,
    materials,
    shortVideos,
    payments,
    announcements,
    settings,
    setActiveView,
    setPreferredUpgradePackageId,
    setMateriTab,
    setPendingShortVideoId,
    setTryoutHubTab,
    startExamByType,
    setSelectedResultReview,
    openCalculatorWithResult
  } = useApp();

  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AdminAnnouncement | null>(null);
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);

  if (!currentUser) return null;

  const isPremiumUser = hasFullMaterialAccess(currentUser, settings);
  const isStandarLocked = isStandarRestrictedToQuestions(currentUser, settings);
  const canAccessZoom = hasZoomAccess(currentUser);
  const canAccessCalc = hasCalculatorAccess(currentUser, settings);
  const canImportLast110ToCalc =
    canAccessCalc &&
    (currentUser.membership_type === 'INTENSIF' || currentUser.role === 'SUPER_ADMIN') &&
    (settings.skd_calculator_config?.enable_auto_import_110 ?? true);
  const activeShortVideos = shortVideos.filter(v => v.is_active);

  const userResults = results.filter(r => r.user_id === currentUser.id);
  const lastResult = userResults[0];

  // 6.1 Ringkasan Aktivitas
  const totalExams = userResults.length;
  const totalQuestionsAnswered = userResults.reduce((acc, r) => acc + r.answered_count, 0);

  const pendingPayment = payments.find(p => p.user_id === currentUser.id && p.status === 'WAITING_VERIFICATION');
  const nextSession = groupSessions.find(s => s.status === 'UPCOMING');

  const activeAnnouncements = [...announcements]
    .filter(a => a.is_active)
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
    });

  const visibleAnnouncements = showAllAnnouncements ? activeAnnouncements : activeAnnouncements.slice(0, 3);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      {/* 1. Hero Welcome Card (Adaptif terhadap lebar area saat sidebar dikembangkan/diciutkan) */}
      <div className="@container relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-sky-800 text-white shadow-md">
        <div className="relative z-10 p-5 sm:p-6 @2xl:p-7 flex flex-col @2xl:flex-row items-stretch @2xl:items-center justify-between gap-4 @2xl:gap-6">
          <div className="space-y-2.5 sm:space-y-3 flex-1 min-w-0 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-[11px] sm:text-xs font-semibold text-sky-200 max-w-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">Seleksi Kompetensi Dasar CPNS 2026/2027</span>
            </div>

            <h1 className="text-lg sm:text-xl @2xl:text-2xl @3xl:text-3xl font-extrabold tracking-tight leading-snug">
              Selamat Datang, {currentUser.full_name}
            </h1>

            <p className="text-xs sm:text-[13px] text-sky-100 leading-relaxed max-w-xl">
              Target Instansi: <strong className="text-white">{currentUser.targetAgency || 'Kementerian Keuangan RI'}</strong>
              <br />
              Tingkatkan akurasi dan kecepatan simulasi CAT berstandar resmi BKN (Passing Grade: TWK 65, TIU 80, TKP 166).
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1.5 w-full @2xl:max-w-lg">
              <button
                onClick={() => startExamByType('TRYOUT_SKD_LENGKAP')}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-[11px] sm:text-xs rounded-xl shadow-sm transition-all cursor-pointer min-w-0"
              >
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" />
                <span className="truncate">Tryout SKD (110 Soal)</span>
              </button>

              <button
                onClick={() => startExamByType('LATIHAN_HARIAN', 'TWK')}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] sm:text-xs rounded-xl border border-white/20 transition-all cursor-pointer min-w-0"
              >
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">Latihan Harian (10 Menit)</span>
              </button>
            </div>
          </div>

          <div className="hidden @2xl:block @2xl:w-60 @3xl:w-72 h-40 @3xl:h-44 rounded-xl overflow-hidden shadow-lg border border-white/20 shrink-0">
            <img
              src="/src/assets/images/hero_cpns_study_1794498170403.jpg"
              alt="Belajar SKD CPNS"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* 6.1 Kartu Ringkasan Aktivitas Belajar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Ujian */}
        <div className="p-4 rounded-xl bg-white border border-slate-300/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Ujian Dikerjakan</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {totalExams} <span className="text-xs font-normal text-slate-400">kali</span>
          </div>
          <p className="text-[11px] text-slate-500">Simulasi &amp; latihan</p>
        </div>

        {/* Total Soal Dijawab */}
        <div className="p-4 rounded-xl bg-white border border-slate-300/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Soal Dijawab</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums">
            {totalQuestionsAnswered} <span className="text-xs font-normal text-slate-400">butir</span>
          </div>
          <p className="text-[11px] text-slate-500">Akurasi dan kecepatan</p>
        </div>

        {/* Nilai Ujian Terakhir */}
        <div className="p-4 rounded-xl bg-white border border-slate-300/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Nilai Ujian Terakhir</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-700 font-mono tabular-nums">
            {lastResult ? lastResult.total_score : 0} <span className="text-xs font-normal text-slate-400">/ 550</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {lastResult ? (lastResult.pass_status === 'MEMENUHI_AMBANG_BATAS' ? 'Lulus PG' : 'Belum Lulus PG') : 'Belum ada ujian'}
          </p>
        </div>

        {/* Status Keanggotaan & Sisa Masa Aktif */}
        <div className="p-4 rounded-xl bg-white border border-slate-300/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Status Keanggotaan</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-sm font-extrabold text-slate-900 leading-snug">
            <span
              className={
                currentUser.membership_type === 'INTENSIF'
                  ? 'text-indigo-700'
                  : currentUser.membership_type === 'PREMIUM'
                  ? 'text-amber-600'
                  : currentUser.membership_type === 'STANDAR'
                  ? 'text-sky-700'
                  : 'text-slate-700'
              }
            >
              {getMembershipDisplayLabel(currentUser.membership_type)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {currentUser.membership_type !== 'FREE' && currentUser.premium_end
              ? `Aktif s/d ${new Date(currentUser.premium_end).toLocaleDateString('id-ID')}`
              : 'Fitur latihan dasar terbuka'}
          </p>
        </div>
      </div>

      {/* 6.2 Menu Akses Cepat (Sinkron dengan Paket Belajar Member) */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
          Menu Akses Cepat
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <button
            onClick={() => {
              setMateriTab('MODUL');
              setActiveView('materi-belajar');
            }}
            className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-all text-center space-y-1.5 shadow-2xs group cursor-pointer relative"
          >
            {isStandarLocked && (
              <Crown className="w-3.5 h-3.5 text-amber-500 absolute top-2 right-2" />
            )}
            <BookOpen className="w-5 h-5 mx-auto group-hover:scale-110 transition-transform text-blue-600" />
            <span className="text-xs font-bold text-slate-800 block">Materi Belajar</span>
          </button>

          <button
            onClick={() => {
              setMateriTab('SHORT_VIDEO');
              setActiveView('materi-belajar');
            }}
            className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-100/70 transition-all text-center space-y-1.5 shadow-2xs group cursor-pointer relative"
          >
            {isStandarLocked && (
              <Crown className="w-3.5 h-3.5 text-amber-500 absolute top-2 right-2" />
            )}
            <Video className="w-5 h-5 mx-auto group-hover:scale-110 transition-transform text-indigo-600" />
            <span className="text-xs font-bold text-indigo-950 block">Short Video</span>
          </button>

          <button
            onClick={() => {
              setTryoutHubTab('LATIHAN_SOAL');
              setActiveView('tryout-latihan');
            }}
            className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-all text-center space-y-1.5 shadow-2xs group cursor-pointer"
          >
            <Clock className="w-5 h-5 text-emerald-600 mx-auto group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block">Latihan Harian</span>
          </button>

          <button
            onClick={() => {
              setTryoutHubTab('SIMULASI_AKBAR');
              setActiveView('tryout-latihan');
            }}
            className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-all text-center space-y-1.5 shadow-2xs group cursor-pointer"
          >
            <Layers className="w-5 h-5 text-sky-600 mx-auto group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block">Tryout Kategori</span>
          </button>

          <button
            onClick={() => {
              setTryoutHubTab('TRYOUT_SKD');
              setActiveView('tryout-latihan');
            }}
            className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-all text-center space-y-1.5 shadow-2xs group cursor-pointer"
          >
            <Award className="w-5 h-5 text-amber-600 mx-auto group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block">Tryout Lengkap</span>
          </button>

          <button
            onClick={() => setActiveView('zoom-bimbel')}
            className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-center space-y-1.5 shadow-2xs group cursor-pointer relative"
          >
            {!canAccessZoom && (
              <Crown className="w-3.5 h-3.5 text-amber-500 absolute top-2 right-2" />
            )}
            <Users className="w-5 h-5 mx-auto group-hover:scale-110 transition-transform text-purple-600" />
            <span className="text-xs font-bold text-slate-800 block">Zoom Bimbel</span>
          </button>

          <button
            onClick={() => setActiveView('kalkulator-skd-skb')}
            className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-all text-center space-y-1.5 shadow-2xs group cursor-pointer relative"
          >
            {!canAccessCalc && (
              <Crown className="w-3.5 h-3.5 text-amber-500 absolute top-2 right-2" />
            )}
            <Calculator className="w-5 h-5 mx-auto group-hover:scale-110 transition-transform text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 block">Kalkulator SKD-SKB</span>
          </button>

          <button
            onClick={() => setActiveView('premium')}
            className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 hover:bg-amber-100 transition-all text-center space-y-1.5 shadow-2xs group cursor-pointer"
          >
            <Crown className="w-5 h-5 text-amber-600 mx-auto group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-amber-900 block">Paket Belajar</span>
          </button>
        </div>
      </div>

      {/* 6.3 Informasi Dashboard: Jadwal Tryout Mendatang, Rekomendasi Materi & Riwayat Aktivitas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Riwayat Aktivitas Terakhir & Rekomendasi */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ujian Terakhir Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900">
                Riwayat Aktivitas Ujian Terakhir
              </h3>
              <button
                onClick={() => setActiveView('riwayat-ujian')}
                className="text-xs text-blue-700 hover:underline font-semibold"
              >
                Lihat Semua &rarr;
              </button>
            </div>

            {lastResult ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{lastResult.exam_title}</h4>
                    <p className="text-[11px] text-slate-500">
                      Diselesaikan {new Date(lastResult.completed_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })} · Durasi {Math.floor(lastResult.duration_seconds / 60)} menit
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-blue-700 font-mono block">
                      {lastResult.total_score} Poin
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      lastResult.pass_status === 'MEMENUHI_AMBANG_BATAS'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {lastResult.pass_status === 'MEMENUHI_AMBANG_BATAS' ? 'MEMENUHI PG' : 'BELUM MEMENUHI'}
                    </span>
                  </div>
                </div>

                {(() => {
                  const lastScale = getSkdScaleTargets(
                    lastResult.passing_grade_snapshot,
                    settings.skd_calculator_config
                  );
                  const isFullLast = lastResult.total_questions >= 100 || !lastResult.category;
                  return (
                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                      <div className="p-2 rounded bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">TWK</span>
                        <span className="font-mono font-bold text-blue-700 block">{lastResult.twk_score}</span>
                        {isFullLast && (
                          <span className="text-[9px] text-slate-500 font-semibold block">
                            Min {lastScale.twkMinQ}/{lastScale.twkTotalQ} bnr
                          </span>
                        )}
                      </div>
                      <div className="p-2 rounded bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">TIU</span>
                        <span className="font-mono font-bold text-sky-700 block">{lastResult.tiu_score}</span>
                        {isFullLast && (
                          <span className="text-[9px] text-slate-500 font-semibold block">
                            Min {lastScale.tiuMinQ}/{lastScale.tiuTotalQ} bnr
                          </span>
                        )}
                      </div>
                      <div className="p-2 rounded bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">TKP</span>
                        <span className="font-mono font-bold text-emerald-700 block">{lastResult.tkp_score}</span>
                        {isFullLast && (
                          <span className="text-[9px] text-slate-500 font-semibold block">
                            Min {lastScale.tkpMinQ5}/{lastScale.tkpTotalQ} p5
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="pt-1 flex flex-wrap items-center justify-end gap-2">
                  {canImportLast110ToCalc && lastResult.total_questions === 110 && (
                    <button
                      type="button"
                      onClick={() => openCalculatorWithResult(lastResult)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Hitung di Kalkulator SKD</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedResultReview(lastResult);
                      setActiveView('riwayat-ujian');
                    }}
                    className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
                  >
                    Buka Pembahasan Soal &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">
                Belum ada riwayat pengerjaan ujian. Mulai latihan pertama Anda sekarang!
              </p>
            )}
          </div>

          {/* Rekomendasi Materi Belajar per PRD Section 6.3 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Rekomendasi Materi Hari Ini</span>
              </h3>
              <button
                onClick={() => {
                  setMateriTab('MODUL');
                  setActiveView('materi-belajar');
                }}
                className="text-xs text-blue-700 hover:underline font-semibold cursor-pointer"
              >
                Semua Materi &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {materials.slice(0, 2).map(mat => (
                <div key={mat.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-100 text-blue-800">
                    {mat.category}
                  </span>
                  <h4 className="font-bold text-slate-900 leading-snug line-clamp-1">{mat.title}</h4>
                  <p className="text-slate-500 line-clamp-2 text-[11px]">{mat.summary}</p>
                  <button
                    onClick={() => {
                      if (!isPremiumUser && mat.is_premium) {
                        setPreferredUpgradePackageId('pkg-1');
                        setActiveView('premium');
                        return;
                      }
                      setMateriTab('MODUL');
                      setActiveView('materi-belajar');
                    }}
                    className="text-blue-700 font-bold text-[11px] hover:underline cursor-pointer"
                  >
                    {!isPremiumUser && mat.is_premium ? 'Buka Akses Materi →' : 'Pelajari Modul →'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Rekomendasi Video Belajar & Saran Video PC/Laptop */}
          {activeShortVideos.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Rekomendasi Video Belajar
                  </h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {activeShortVideos.length} Short Video
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMateriTab('SHORT_VIDEO');
                    setActiveView('materi-belajar');
                  }}
                  className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 hover:underline font-bold cursor-pointer"
                >
                  <span>Lihat Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mobile: 2 Video Rekomendasi | PC/Laptop: 3 Video Rekomendasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {activeShortVideos.slice(0, 3).map((sv, idx) => {
                  const isLocked = sv.is_premium && !isPremiumUser;
                  return (
                    <div
                      key={sv.id}
                      className={`group rounded-xl bg-slate-50 border overflow-hidden flex flex-col transition-all ${
                        idx === 2 ? 'hidden lg:flex' : 'flex'
                      } ${
                        isLocked
                          ? 'border-amber-200 hover:border-amber-400'
                          : 'border-slate-200 hover:border-indigo-400 hover:bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (isLocked) {
                            setPreferredUpgradePackageId('pkg-1');
                            setActiveView('premium');
                          } else {
                            setMateriTab('SHORT_VIDEO');
                            setPendingShortVideoId(sv.id);
                            setActiveView('materi-belajar');
                          }
                        }}
                        className="text-left w-full focus:outline-none cursor-pointer"
                      >
                        <ShortVideoThumbnail video={sv} isLocked={isLocked} />
                      </button>

                      <div className="p-3 flex-1 flex flex-col justify-between gap-2 text-xs">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1.5 text-[10px]">
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 truncate">
                              {getShortVideoCategoryLabel(sv.category)}
                            </span>
                            {sv.duration_label && (
                              <span className="font-mono text-slate-500 shrink-0">
                                {sv.duration_label}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 leading-snug line-clamp-2 text-xs">
                            {sv.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {sv.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (isLocked) {
                              setPreferredUpgradePackageId('pkg-1');
                              setActiveView('premium');
                            } else {
                              setMateriTab('SHORT_VIDEO');
                              setPendingShortVideoId(sv.id);
                              setActiveView('materi-belajar');
                            }
                          }}
                          className={`mt-1 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            isLocked
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          {isLocked ? (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>Buka Akses Video</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current" />
                              <span>Tonton Video</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Saran Video Tambahan Khusus Area Luas PC / Laptop */}
              {activeShortVideos.length > 3 && (
                <div className="hidden lg:block pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Saran Video Lainnya untuk Persiapan SKD</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Maksimalkan skor TWK, TIU &amp; manajemen waktu
                    </span>
                  </div>

                  <div
                    className={`grid gap-3 ${
                      activeShortVideos.slice(3, 5).length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                    }`}
                  >
                    {activeShortVideos.slice(3, 5).map(sv => {
                      const isLocked = sv.is_premium && !isPremiumUser;
                      return (
                        <button
                          key={`saran-${sv.id}`}
                          type="button"
                          onClick={() => {
                            if (isLocked) {
                              setPreferredUpgradePackageId('pkg-1');
                              setActiveView('premium');
                            } else {
                              setMateriTab('SHORT_VIDEO');
                              setPendingShortVideoId(sv.id);
                              setActiveView('materi-belajar');
                            }
                          }}
                          className="p-3 rounded-xl bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-200/80 hover:border-indigo-400 flex items-center gap-3 text-left transition-all group cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white flex items-center justify-center shrink-0 shadow-xs transition-colors">
                            {isLocked ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-1.5 text-[10px]">
                              <span className="font-bold text-indigo-700">
                                {getShortVideoCategoryLabel(sv.category)}
                              </span>
                              {sv.duration_label && (
                                <span className="text-slate-400 font-mono">· {sv.duration_label}</span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-800">
                              {sv.title}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {sv.topic || 'Klik untuk putar pembahasan video'}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom CTA: Lihat Selengkapnya */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMateriTab('SHORT_VIDEO');
                    setActiveView('materi-belajar');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Video className="w-4 h-4 text-indigo-600" />
                  <span>Lihat Selengkapnya Video Belajar ({activeShortVideos.length} Video)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right (1 col): Jadwal Tryout Mendatang & Notifikasi Admin */}
        <div className="space-y-6">
          {/* Jadwal Tryout Mendatang */}
          <div className="p-5 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Jadwal Tryout Mendatang</span>
            </h3>

            {nextSession ? (
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2.5 text-xs">
                <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  Sesi Terjadwal
                </span>
                <h4 className="font-bold text-slate-900 text-sm">{nextSession.title}</h4>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{new Date(nextSession.start_at).toLocaleDateString('id-ID')} · {nextSession.duration_minutes} Menit</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Video className="w-3.5 h-3.5 text-purple-600" />
                  <span>Coach: {nextSession.coach_name}</span>
                </div>

                <button
                  onClick={() => {
                    setTryoutHubTab('BARENG');
                    setActiveView('tryout-latihan');
                  }}
                  className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs shadow-2xs transition-colors mt-2 cursor-pointer"
                >
                  Lihat Detail &amp; Masuk Sesi
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">Belum ada sesi tryout mendatang.</p>
            )}
          </div>

          {/* Pengumuman & Notifikasi Admin */}
          <div className="p-5 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-blue-600" />
                <span>Pengumuman Admin</span>
              </h3>
              {activeAnnouncements.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllAnnouncements(prev => !prev)}
                  className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  {showAllAnnouncements ? 'Tampilkan Ringkas' : `Lihat Semua (${activeAnnouncements.length})`}
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {/* Info Pembayaran Menunggu Verifikasi diletakkan di dalam Pengumuman Admin */}
              {pendingPayment && (
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center gap-2 text-[10px]">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                      <AlertCircle className="w-3 h-3 text-amber-700" />
                      Pembayaran Menunggu Verifikasi
                    </span>
                    <span className="text-amber-700 font-mono">
                      {new Date(pendingPayment.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <p className="text-amber-950 leading-snug text-[11px]">
                    Pengajuan <strong>{pendingPayment.package_name}</strong> (Rp {pendingPayment.amount.toLocaleString('id-ID')}) sedang diverifikasi manual oleh Admin.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveView('premium')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 hover:underline cursor-pointer"
                  >
                    <span>Lihat Status Pembayaran</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Daftar Pengumuman Resmi dari Super Admin (Garis Besar + Baca Selengkapnya) */}
              {visibleAnnouncements.length === 0 && !pendingPayment ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Belum ada pengumuman terbaru dari admin.
                </p>
              ) : (
                visibleAnnouncements.map(ann => {
                  const catMeta = ANNOUNCEMENT_CATEGORY_META[ann.category] || ANNOUNCEMENT_CATEGORY_META.BERITA_UMUM;
                  const displayDate = new Date(ann.updated_at || ann.created_at).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  });
                  return (
                    <div
                      key={ann.id}
                      className={`p-3 rounded-xl border space-y-1.5 text-xs transition-colors ${
                        ann.category === 'MAINTENANCE'
                          ? 'bg-red-50/40 border-red-200'
                          : ann.is_pinned
                          ? 'bg-blue-50/50 border-blue-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2 text-[10px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`font-bold px-1.5 py-0.5 rounded border ${catMeta.badgeClass}`}>
                            {catMeta.label}
                          </span>
                          {ann.is_pinned && (
                            <span className="inline-flex items-center gap-0.5 font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                              <Pin className="w-2.5 h-2.5" />
                              Penting
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 font-mono shrink-0">{displayDate}</span>
                      </div>

                      <h4 className="font-bold text-slate-900 leading-snug">{ann.title}</h4>
                      <p className="text-slate-600 leading-snug text-[11px] line-clamp-2">
                        {ann.summary}
                      </p>

                      <div className="pt-0.5">
                        <button
                          type="button"
                          onClick={() => setSelectedAnnouncement(ann)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                        >
                          <span>Baca Selengkapnya</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Baca Selengkapnya Pengumuman Admin */}
      {selectedAnnouncement && (() => {
        const catMeta = ANNOUNCEMENT_CATEGORY_META[selectedAnnouncement.category] || ANNOUNCEMENT_CATEGORY_META.BERITA_UMUM;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setSelectedAnnouncement(null)}
          >
            <div
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
            >
              <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${catMeta.badgeClass}`}>
                      {catMeta.label}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(selectedAnnouncement.updated_at || selectedAnnouncement.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                    {selectedAnnouncement.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Dipublikasikan oleh: <strong className="text-slate-700">{selectedAnnouncement.author_name}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 font-medium leading-relaxed">
                  {selectedAnnouncement.summary}
                </div>

                <div className="text-slate-700 leading-relaxed whitespace-pre-line text-xs sm:text-[13px]">
                  {selectedAnnouncement.content}
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Tutup Pengumuman
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
