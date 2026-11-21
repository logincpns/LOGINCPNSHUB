import React, { useEffect, useState } from 'react';
import {
  useApp,
  hasFullMaterialAccess,
  isStandarRestrictedToQuestions
} from '../../context/AppContext';
import {
  FileText,
  Lock,
  Download,
  CheckCircle2,
  BookOpen,
  ExternalLink,
  Search,
  ChevronDown,
  ChevronUp,
  Zap,
  Lightbulb,
  Copy,
  Check,
  Video,
  Play,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
  Crown,
  ArrowRight
} from 'lucide-react';
import { Material, MaterialCategory, ShortVideo, ShortVideoCategory } from '../../types';
import {
  ShortVideoPlayer,
  ShortVideoThumbnail,
  UploadedBlobVideo,
  getShortVideoCategoryLabel
} from './ShortVideoPlayer';

const COMPLETED_STORAGE_KEY = 'LOGINCPNS_COMPLETED_MATERIALS';

function renderHighlightedLine(text: string) {
  // Match "Label (Parenthetical Note): rest" first (e.g. TKP aspects), then "Label: rest"
  const parenMatch = text.match(/^(.+?\([^)]+\)\s*:)\s*(.+)$/);
  const colonMatch = !parenMatch ? text.match(/^([^:]{2,55}:)\s*(.+)$/) : null;
  const match = parenMatch || colonMatch;

  if (match) {
    return (
      <>
        <span className="font-bold text-slate-950">{match[1]}</span>{' '}
        <span className="text-slate-700 font-medium">{match[2]}</span>
      </>
    );
  }

  // Fallback: support **bold** spans inside plain text
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={idx} className="font-bold text-slate-950">
          {part.slice(2, -2)}
        </span>
      );
    }
    return (
      <span key={idx} className="text-slate-700 font-medium">
        {part}
      </span>
    );
  });
}

function renderFallbackContent(content: string) {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  return (
    <div className="space-y-3">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
          const cleanHeading = line.replace(/^#{1,3}\s+/, '');
          return (
            <h4
              key={idx}
              className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-950 pt-2"
            >
              {cleanHeading}
            </h4>
          );
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          const bulletText = line.replace(/^[-*]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-[13.5px] leading-[1.7]">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
              <div>{renderHighlightedLine(bulletText)}</div>
            </div>
          );
        }
        return (
          <p key={idx} className="text-xs sm:text-[13.5px] leading-[1.7] text-slate-700">
            {renderHighlightedLine(line)}
          </p>
        );
      })}
    </div>
  );
}

function getCategoryBadgeStyle(category: MaterialCategory) {
  switch (category) {
    case 'TWK':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'TIU':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'TKP':
      return 'bg-amber-50 text-amber-800 border border-amber-200';
    case 'STRATEGI':
      return 'bg-purple-50 text-purple-700 border border-purple-200';
  }
}

export const MateriBelajarView: React.FC = () => {
  const {
    materials,
    shortVideos,
    currentUser,
    settings,
    setActiveView,
    setPreferredUpgradePackageId,
    materiTab: viewMode,
    setMateriTab: setViewMode,
    pendingShortVideoId,
    setPendingShortVideoId
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'ALL' | MaterialCategory>('ALL');
  const [activeVideoCategory, setActiveVideoCategory] = useState<'ALL' | ShortVideoCategory>('ALL');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>(['mat-004']);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [completedMaterialIds, setCompletedMaterialIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(COMPLETED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['mat-001'];
    } catch {
      return ['mat-001'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(completedMaterialIds));
    } catch {
      // ignore storage errors
    }
  }, [completedMaterialIds]);

  const isPremiumUser = hasFullMaterialAccess(currentUser, settings);
  const isStandarLocked = isStandarRestrictedToQuestions(currentUser, settings);

  const activeMaterials = materials.filter(m => m.is_active);
  const activeShortVideos = shortVideos.filter(v => v.is_active);

  const hasExplicitPremiumMaterial = activeMaterials.some(m => m.is_premium);
  const freePreviewMaterialId =
    activeMaterials.find(m => !m.is_premium)?.id || activeMaterials[0]?.id;

  const hasExplicitPremiumVideo = activeShortVideos.some(v => v.is_premium);
  const freePreviewVideoId =
    activeShortVideos.find(v => !v.is_premium)?.id || activeShortVideos[0]?.id;

  const isMaterialLocked = (mat: Material) => {
    if (isPremiumUser) return false;
    const isEffectivelyPremium = hasExplicitPremiumMaterial
      ? mat.is_premium
      : mat.id !== freePreviewMaterialId;
    return isEffectivelyPremium;
  };

  const isShortVideoLocked = (sv: ShortVideo) => {
    if (isPremiumUser) return false;
    const isEffectivelyPremium = hasExplicitPremiumVideo
      ? sv.is_premium
      : sv.id !== freePreviewVideoId;
    return isEffectivelyPremium;
  };

  useEffect(() => {
    if (!pendingShortVideoId) return;
    const target = activeShortVideos.find(v => v.id === pendingShortVideoId);
    setViewMode('SHORT_VIDEO');
    setActiveVideoCategory('ALL');
    setPendingShortVideoId(null);
    if (target) {
      const targetLocked =
        !isPremiumUser &&
        (hasExplicitPremiumVideo ? target.is_premium : target.id !== freePreviewVideoId);
      if (targetLocked) {
        setPreferredUpgradePackageId('pkg-1');
        setActiveView('premium');
      } else {
        setSelectedVideoId(target.id);
      }
    }
  }, [
    pendingShortVideoId,
    activeShortVideos,
    isPremiumUser,
    hasExplicitPremiumVideo,
    freePreviewVideoId,
    setActiveView,
    setPendingShortVideoId,
    setViewMode,
    setPreferredUpgradePackageId
  ]);

  const filteredMaterials = activeMaterials.filter(m => {
    if (activeCategory !== 'ALL' && m.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inPoints = m.key_points?.some(p => p.toLowerCase().includes(q));
      const inFormulas = m.quick_formulas?.some(f => f.toLowerCase().includes(q));
      return (
        m.title.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        Boolean(inPoints) ||
        Boolean(inFormulas)
      );
    }
    return true;
  });

  const filteredShortVideos = activeShortVideos.filter(v => {
    if (activeVideoCategory !== 'ALL' && v.category !== activeVideoCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.title.toLowerCase().includes(q) ||
        (v.topic || '').toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedShortVideoIndex = selectedVideoId
    ? filteredShortVideos.findIndex(v => v.id === selectedVideoId)
    : -1;
  const selectedShortVideo: ShortVideo | null =
    selectedShortVideoIndex >= 0 ? filteredShortVideos[selectedShortVideoIndex] : null;

  useEffect(() => {
    if (!selectedVideoId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedVideoId(null);
      } else if (e.key === 'ArrowRight' && selectedShortVideoIndex >= 0 && selectedShortVideoIndex < filteredShortVideos.length - 1) {
        const next = filteredShortVideos[selectedShortVideoIndex + 1];
        const nextLocked =
          !isPremiumUser &&
          (hasExplicitPremiumVideo ? next.is_premium : next.id !== freePreviewVideoId);
        if (!nextLocked) {
          setSelectedVideoId(next.id);
        }
      } else if (e.key === 'ArrowLeft' && selectedShortVideoIndex > 0) {
        const prev = filteredShortVideos[selectedShortVideoIndex - 1];
        const prevLocked =
          !isPremiumUser &&
          (hasExplicitPremiumVideo ? prev.is_premium : prev.id !== freePreviewVideoId);
        if (!prevLocked) {
          setSelectedVideoId(prev.id);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedVideoId, selectedShortVideoIndex, filteredShortVideos, isPremiumUser, hasExplicitPremiumVideo, freePreviewVideoId]);

  const toggleExpand = (id: string, isLocked: boolean) => {
    if (isLocked) {
      setPreferredUpgradePackageId('pkg-1');
      setActiveView('premium');
      return;
    }
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleCompleted = (id: string) => {
    setCompletedMaterialIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCopySummary = (mat: Material, e: React.MouseEvent) => {
    e.stopPropagation();
    const lines: string[] = [
      `[${mat.category}] ${mat.title}`,
      '',
      mat.intro || mat.summary,
      ''
    ];
    if (mat.key_points && mat.key_points.length > 0) {
      lines.push('POIN-POIN KUNCI WAJIB HAFAL:');
      mat.key_points.forEach(p => lines.push(`- ${p}`));
      lines.push('');
    }
    if (mat.quick_formulas && mat.quick_formulas.length > 0) {
      lines.push('RUMUS CEPAT & KETENTUAN HUKUM:');
      mat.quick_formulas.forEach(f => lines.push(`* ${f}`));
      lines.push('');
    }
    if (mat.example) {
      lines.push('CONTOH SOAL HOTS:');
      lines.push(mat.example.question);
      lines.push(mat.example.answer);
      lines.push(`Analisis: ${mat.example.analysis}`);
    }
    if (!mat.key_points && mat.content) {
      lines.push(mat.content);
    }
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
    setCopiedId(mat.id);
    setTimeout(() => setCopiedId(prev => (prev === mat.id ? null : prev)), 2000);
  };

  const handleSelectCategory = (cat: 'ALL' | MaterialCategory) => {
    setActiveCategory(cat);
    if (cat === 'STRATEGI') {
      const strategyIds = activeMaterials
        .filter(m => m.category === 'STRATEGI' && (!m.is_premium || isPremiumUser))
        .map(m => m.id);
      if (strategyIds.length > 0) {
        setExpandedIds(prev => Array.from(new Set([...prev, ...strategyIds])));
      }
    }
  };

  const categoryTabs: {
    key: 'ALL' | MaterialCategory;
    label: string;
    fullWidthOnMobile?: boolean;
  }[] = [
    { key: 'ALL', label: `Semua Kategori (${activeMaterials.length})` },
    { key: 'TWK', label: 'Materi TWK' },
    { key: 'TIU', label: 'Materi TIU' },
    { key: 'TKP', label: 'Materi TKP' },
    { key: 'STRATEGI', label: 'Strategi Jawab Soal', fullWidthOnMobile: true }
  ];

  const videoCategoryTabs: {
    key: 'ALL' | ShortVideoCategory;
    label: string;
  }[] = [
    { key: 'ALL', label: `Semua Video (${activeShortVideos.length})` },
    { key: 'KIAT_BELAJAR', label: 'Kiat-Kiat Belajar' },
    { key: 'TIU', label: 'TIU / Matematika' },
    { key: 'TWK', label: 'Materi TWK' },
    { key: 'TKP', label: 'Materi TKP' },
    { key: 'STRATEGI', label: 'Strategi Ujian' }
  ];

  const handleOpenShortVideo = (sv: ShortVideo) => {
    if (isShortVideoLocked(sv)) {
      setPreferredUpgradePackageId('pkg-1');
      setActiveView('premium');
      return;
    }
    setSelectedVideoId(sv.id);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header & Category Filter Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              {viewMode === 'SHORT_VIDEO' ? (
                <Video className="w-3.5 h-3.5 text-blue-700" />
              ) : (
                <BookOpen className="w-3.5 h-3.5 text-blue-700" />
              )}
              <span>
                {viewMode === 'SHORT_VIDEO'
                  ? 'Short Video Kiat & Pembahasan'
                  : 'Modul Bimbingan Belajar SKD'}
              </span>
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight leading-snug">
              {viewMode === 'SHORT_VIDEO'
                ? 'Short Video: Kiat Belajar & Pembahasan Soal'
                : 'Rangkuman Materi & Rumus Sakti SKD CPNS'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              {viewMode === 'SHORT_VIDEO'
                ? 'Tonton video singkat pembahasan soal hitungan matematika TIU, kiat manajemen waktu ujian, dan trik cepat SKD langsung dari mentor.'
                : 'Rangkuman kilat to the point: poin kunci, rumus cepat, kiat skor maksimal, contoh soal HOTS, serta tautan modul lengkap di Google Drive.'}
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={
                viewMode === 'SHORT_VIDEO'
                  ? 'Cari video atau kiat belajar...'
                  : 'Cari materi atau rumus...'
              }
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Primary Menu Mode Switcher: Modul Materi vs Short Video */}
        <div className="pt-3.5 border-t border-slate-100 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
              Pilih Sub-Menu Materi Pembelajaran:
            </span>
            {currentUser?.role === 'SUPER_ADMIN' && viewMode === 'SHORT_VIDEO' && (
              <button
                type="button"
                onClick={() => setActiveView('admin-short-videos')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload / Kelola Video (Admin)</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
            <button
              type="button"
              onClick={() => setViewMode('MODUL')}
              className={`min-w-0 w-full flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                viewMode === 'MODUL'
                  ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-500/25'
                  : 'bg-blue-50/90 hover:bg-blue-100 text-blue-950 border-blue-300 shadow-2xs'
              }`}
            >
              <div
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  viewMode === 'MODUL'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] sm:text-xs font-extrabold leading-tight truncate">
                    Modul Rangkuman
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md shrink-0 ${
                      viewMode === 'MODUL'
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-200/80 text-blue-900'
                    }`}
                  >
                    {activeMaterials.length}
                  </span>
                </div>
                <p
                  className={`hidden sm:block text-[10px] mt-0.5 truncate ${
                    viewMode === 'MODUL' ? 'text-blue-100' : 'text-blue-700/80'
                  }`}
                >
                  Ringkasan materi, rumus cepat &amp; HOTS
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('SHORT_VIDEO')}
              className={`min-w-0 w-full flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                viewMode === 'SHORT_VIDEO'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-500/25'
                  : 'bg-indigo-50/90 hover:bg-indigo-100 text-indigo-950 border-indigo-300 shadow-2xs'
              }`}
            >
              <div
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  viewMode === 'SHORT_VIDEO'
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] sm:text-xs font-extrabold leading-tight truncate">
                    Short Video
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md shrink-0 ${
                      viewMode === 'SHORT_VIDEO'
                        ? 'bg-amber-300 text-slate-950'
                        : 'bg-amber-400 text-slate-950'
                    }`}
                  >
                    {activeShortVideos.length}
                  </span>
                </div>
                <p
                  className={`hidden sm:block text-[10px] mt-0.5 truncate ${
                    viewMode === 'SHORT_VIDEO' ? 'text-indigo-100' : 'text-indigo-700/80'
                  }`}
                >
                  Kiat belajar &amp; video pembahasan soal
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Category Sub-Tabs */}
        <div className="pt-1">
          {viewMode === 'MODUL' ? (
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {categoryTabs.map(tab => {
                const isActive = activeCategory === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleSelectCategory(tab.key)}
                    className={`px-3 sm:px-4 py-2.5 text-xs font-bold rounded-xl transition-all text-center cursor-pointer ${
                      tab.fullWidthOnMobile ? 'col-span-2 sm:col-auto' : ''
                    } ${
                      isActive
                        ? tab.key === 'STRATEGI'
                          ? 'bg-purple-700 text-white shadow-xs ring-2 ring-purple-700/20'
                          : 'bg-blue-700 text-white shadow-xs ring-2 ring-blue-700/20'
                        : tab.key === 'STRATEGI'
                          ? 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-950'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {videoCategoryTabs.map(tab => {
                const isActive = activeVideoCategory === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveVideoCategory(tab.key)}
                    className={`px-2.5 sm:px-3.5 py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-colors text-center truncate cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-500/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-950'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview Notice for Paket Standar (Hanya Latihan Soal) */}
      {isStandarLocked && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-amber-700" />
            </div>
            <div className="space-y-1 text-xs">
              <h2 className="font-extrabold text-amber-950 text-sm">
                Mode Pratinjau Materi (1 Contoh Materi Gratis Terbuka)
              </h2>
              <p className="text-amber-900 leading-relaxed">
                Paket Anda saat ini (<strong>Paket Standar</strong>) difokuskan untuk akses latihan soal. Anda tetap bisa membaca <strong>1 contoh materi gratis</strong> di bawah sebagai pratinjau. Untuk membuka seluruh materi &amp; short video berlogo <strong>Premium</strong>, klik tombol <strong>Buka Akses</strong> atau upgrade ke <strong>Paket Premium (Belajar Mandiri)</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setPreferredUpgradePackageId('pkg-1');
              setActiveView('premium');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Upgrade ke Paket Premium</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SHORT VIDEO VIEW */}
      {viewMode === 'SHORT_VIDEO' ? (
        filteredShortVideos.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border border-slate-300/80 shadow-sm text-center space-y-2">
            <p className="text-sm font-bold text-slate-900">Belum ada short video di kategori ini</p>
            <p className="text-xs text-slate-600">
              Coba ubah kata kunci pencarian atau pilih kategori video lainnya.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredShortVideos.map(sv => {
              const isLocked = isShortVideoLocked(sv);
              const showPremiumLabel = hasExplicitPremiumVideo ? sv.is_premium : sv.id !== freePreviewVideoId;
              return (
                <article
                  key={sv.id}
                  className={`group rounded-2xl bg-white border overflow-hidden shadow-sm transition-colors flex flex-col ${
                    isLocked
                      ? 'border-amber-300 hover:border-amber-400'
                      : 'border-slate-300/80 hover:border-blue-500'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleOpenShortVideo(sv)}
                    className="text-left w-full focus:outline-none"
                  >
                    <ShortVideoThumbnail video={sv} isLocked={isLocked} />
                  </button>

                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                        <span className="font-semibold text-blue-700">
                          {getShortVideoCategoryLabel(sv.category)}
                        </span>
                        {sv.duration_label && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{sv.duration_label}</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className={showPremiumLabel ? 'font-semibold text-amber-700' : 'text-emerald-700 font-semibold'}>
                          {showPremiumLabel ? 'Premium' : 'Gratis'}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-extrabold text-slate-950 leading-snug line-clamp-2">
                        {sv.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {sv.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 truncate">
                        {sv.author_name || 'Mentor LOGIN CPNS'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleOpenShortVideo(sv)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                          isLocked
                            ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                            : 'bg-blue-700 hover:bg-blue-800 text-white'
                        }`}
                      >
                        {isLocked ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Buka Akses</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Tonton Video</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : /* MODUL VIEW */
      filteredMaterials.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white border border-slate-300/80 shadow-sm text-center space-y-2">
          <p className="text-sm font-bold text-slate-900">Materi tidak ditemukan</p>
          <p className="text-xs text-slate-600">
            Coba ubah kata kunci pencarian atau pilih kategori lain.
          </p>
        </div>
      ) : (
        /* Expandable Quick-Summary Modules List */
        <div className="space-y-4">
          {filteredMaterials.map(mat => {
            const isLocked = isMaterialLocked(mat);
            const showPremiumBadge = hasExplicitPremiumMaterial ? mat.is_premium : mat.id !== freePreviewMaterialId;
            const isExpanded = !isLocked && expandedIds.includes(mat.id);
            const isDone = completedMaterialIds.includes(mat.id);
            const isCopied = copiedId === mat.id;

            return (
              <div
                key={mat.id}
                className={`rounded-2xl bg-white border transition-all shadow-sm overflow-hidden ${
                  isLocked
                    ? 'border-amber-300 bg-amber-50/15'
                    : isExpanded
                    ? 'border-blue-400 ring-1 ring-blue-100'
                    : 'border-slate-300/80 hover:border-blue-400'
                }`}
              >
                {/* Module Header Row (Click to Expand/Collapse) */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpand(mat.id, isLocked)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpand(mat.id, isLocked);
                    }
                  }}
                  className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-3 sm:gap-4 cursor-pointer select-none hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                    <span
                      className={`shrink-0 mt-0.5 text-[11px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wide ${getCategoryBadgeStyle(
                        mat.category
                      )}`}
                    >
                      {mat.category}
                    </span>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-950 leading-snug tracking-tight">
                          {mat.title}
                        </h3>
                        {showPremiumBadge ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                            <Lock className="w-3 h-3" />
                            <span>Premium</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Gratis
                          </span>
                        )}
                        {isDone && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                            <CheckCircle2 className="w-3 h-3 text-blue-700" />
                            <span>Selesai</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-2">
                        {mat.summary}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={e => handleCopySummary(mat, e)}
                        title="Salin rangkuman materi"
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    {isLocked ? (
                      <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-2xs">
                        Buka Akses
                      </span>
                    ) : (
                      <span className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Structured Content */}
                {isExpanded && (
                  <div className="px-4 sm:px-6 pb-6 pt-4 border-t border-slate-100 space-y-5 bg-white">
                    {/* 1. Pengantar Modul */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                      <div className="text-xs font-extrabold text-slate-950 tracking-wide">
                        Pengantar Modul:
                      </div>
                      <p className="text-xs sm:text-[13.5px] text-slate-700 leading-[1.7] font-medium">
                        {mat.intro || mat.summary}
                      </p>
                    </div>

                    {/* 2. Poin-Poin Kunci Wajib Hafal OR Fallback Rich Content */}
                    {mat.key_points && mat.key_points.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-950">
                          POIN-POIN KUNCI WAJIB HAFAL
                        </h4>
                        <ul className="space-y-3">
                          {mat.key_points.map((point, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2.5 text-xs sm:text-[13.5px] leading-[1.7]"
                            >
                              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                              <div className="min-w-0">{renderHighlightedLine(point)}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      renderFallbackContent(mat.content)
                    )}

                    {/* 3. Rumus Cepat & Ketentuan Hukum */}
                    {mat.quick_formulas && mat.quick_formulas.length > 0 && (
                      <div className="p-4 sm:p-5 rounded-xl bg-amber-50/75 border border-amber-200 space-y-3">
                        <div className="flex items-center gap-2 text-amber-900">
                          <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                          <h4 className="text-xs font-extrabold uppercase tracking-wider">
                            RUMUS CEPAT &amp; KETENTUAN HUKUM
                          </h4>
                        </div>
                        <div className="space-y-2.5">
                          {mat.quick_formulas.map((formula, idx) => (
                            <div
                              key={idx}
                              className="px-3.5 py-2.5 rounded-lg bg-white border border-amber-200/80 text-xs sm:text-[13px] leading-[1.65] font-mono sm:font-sans"
                            >
                              {renderHighlightedLine(formula)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Contoh Soal HOTS & Jawaban */}
                    {mat.example && (
                      <div className="p-4 sm:p-5 rounded-xl bg-slate-900 text-white space-y-3">
                        <div className="flex items-center gap-2 text-amber-400">
                          <Lightbulb className="w-4 h-4 shrink-0" />
                          <h4 className="text-xs font-extrabold uppercase tracking-wider">
                            CONTOH SOAL HOTS &amp; JAWABAN
                          </h4>
                        </div>

                        <p className="text-xs sm:text-sm font-semibold text-white leading-[1.7]">
                          {mat.example.question}
                        </p>

                        <div className="px-3.5 py-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-xs sm:text-sm font-extrabold text-emerald-300">
                          {mat.example.answer}
                        </div>

                        <p className="text-xs sm:text-[13px] text-slate-200 leading-[1.7]">
                          <span className="font-bold text-white">Analisis: </span>
                          {mat.example.analysis}
                        </p>
                      </div>
                    )}

                    {/* Uploaded Video Pembahasan directly inside module */}
                    {mat.video_blob_id && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-950">
                            <Video className="w-4 h-4 text-blue-700" />
                            <span>Video Pembahasan Materi</span>
                          </div>
                          {mat.video_file_name && (
                            <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                              {mat.video_file_name}
                            </span>
                          )}
                        </div>
                        <UploadedBlobVideo blobId={mat.video_blob_id} title={mat.title} />
                      </div>
                    )}

                    {/* 5. Google Drive Full Module Bar + Completion Toggle */}
                    <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-blue-950">
                          <Download className="w-4 h-4 text-blue-700 shrink-0" />
                          <span>Materi Lengkap Tersedia di Google Drive</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-blue-800 leading-relaxed">
                          Tampilan web berisi rangkuman kilat to the point. Unduh PDF atau tonton video lengkapnya melalui Google Drive.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {mat.file_url && (
                          <a
                            href={mat.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Buka PDF Drive</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {mat.video_url && (
                          <a
                            href={mat.video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Tonton Video Drive</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleCompleted(mat.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isDone ? 'Selesai Dibaca' : 'Tandai Selesai'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Short Video Player Modal */}
      {selectedShortVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-5xl bg-white rounded-2xl border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Top Bar */}
            <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-2 min-w-0 text-xs text-slate-600">
                <Video className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="font-bold text-slate-900 truncate">
                  {getShortVideoCategoryLabel(selectedShortVideo.category)}
                </span>
                {selectedShortVideo.duration_label && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums shrink-0">
                      {selectedShortVideo.duration_label}
                    </span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums shrink-0">
                  {selectedShortVideoIndex + 1} / {filteredShortVideos.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  disabled={selectedShortVideoIndex <= 0}
                  onClick={() => {
                    if (selectedShortVideoIndex > 0) {
                      handleOpenShortVideo(filteredShortVideos[selectedShortVideoIndex - 1]);
                    }
                  }}
                  title="Video sebelumnya"
                  className="p-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={selectedShortVideoIndex >= filteredShortVideos.length - 1}
                  onClick={() => {
                    if (selectedShortVideoIndex < filteredShortVideos.length - 1) {
                      handleOpenShortVideo(filteredShortVideos[selectedShortVideoIndex + 1]);
                    }
                  }}
                  title="Video berikutnya"
                  className="p-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVideoId(null)}
                  aria-label="Tutup pemutar video"
                  className="p-2 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-7">
                  <ShortVideoPlayer video={selectedShortVideo} autoPlay />
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="space-y-1.5">
                    {selectedShortVideo.topic && (
                      <div className="text-xs font-bold text-blue-700">
                        {selectedShortVideo.topic}
                      </div>
                    )}
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-950 leading-snug">
                      {selectedShortVideo.title}
                    </h2>
                    <div className="text-xs text-slate-500">
                      Oleh {selectedShortVideo.author_name || 'Mentor LOGIN CPNS'}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-xs font-extrabold text-slate-900">
                      Catatan Pembahasan &amp; Kiat
                    </div>
                    <p className="text-xs sm:text-[13px] text-slate-700 leading-[1.7] whitespace-pre-line">
                      {selectedShortVideo.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard
                          ?.writeText(`${selectedShortVideo.title}\n\n${selectedShortVideo.description}`)
                          .catch(() => {});
                        setCopiedId(selectedShortVideo.id);
                        setTimeout(
                          () => setCopiedId(prev => (prev === selectedShortVideo.id ? null : prev)),
                          2000
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700"
                    >
                      {copiedId === selectedShortVideo.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Catatan Disalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Catatan</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedVideoId(null)}
                      className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
