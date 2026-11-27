import React, { useState, useMemo } from 'react';
import {
  useApp,
  hasPaidQuestionAccess,
  hasZoomAccess,
  getMembershipDisplayLabel
} from '../../context/AppContext';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Crown,
  Play,
  Users,
  Video,
  ExternalLink,
  Lock,
  Search,
  SlidersHorizontal,
  Flame,
  Star,
  ChevronDown,
  FileText,
  BarChart2,
  ListOrdered,
  X,
  Sparkles,
  Monitor,
  ArrowUpDown
} from 'lucide-react';
import { PracticePackage, PackageAccessTier, QuestionCategory } from '../../types';

interface LatihanTopicOption {
  id: string;
  label: string;
  category: 'TWK' | 'TIU' | 'TKP';
  keywords: string[];
}

const LATIHAN_TOPIC_OPTIONS: LatihanTopicOption[] = [
  // TWK
  {
    id: 'NASIONALISME',
    label: 'Nasionalisme',
    category: 'TWK',
    keywords: ['nasionalisme', 'cinta tanah air', 'sejarah perjuangan']
  },
  {
    id: 'INTEGRITAS',
    label: 'Integritas',
    category: 'TWK',
    keywords: ['integritas', 'anti korupsi', 'gratifikasi']
  },
  {
    id: 'BELA_NEGARA',
    label: 'Bela Negara',
    category: 'TWK',
    keywords: ['bela negara', 'pertahanan negara']
  },
  {
    id: 'PILAR_NEGARA',
    label: 'Pilar Negara',
    category: 'TWK',
    keywords: ['pilar negara', 'pilar kebangsaan', 'pancasila', 'uud 1945', 'uud nri', 'bhinneka', 'bhineka', 'nkri']
  },
  {
    id: 'BAHASA_INDONESIA',
    label: 'Bahasa Indonesia',
    category: 'TWK',
    keywords: ['bahasa indonesia', 'kalimat efektif', 'eyd', 'puebi', 'ejaan', 'paragraf', 'kata baku']
  },
  // TIU
  {
    id: 'PENALARAN_LOGIS',
    label: 'Penalaran Logis',
    category: 'TIU',
    keywords: ['penalaran logis', 'silogisme', 'premis']
  },
  {
    id: 'ANALITIS_KOMBINASI',
    label: 'Analitis Kombinasi',
    category: 'TIU',
    keywords: ['analitis', 'kombinasi']
  },
  {
    id: 'NUMERIK',
    label: 'Numerik & Hitung',
    category: 'TIU',
    keywords: ['perbandingan', 'numerik', 'aljabar', 'pecahan', 'deret', 'berhitung', 'kuantitatif']
  },
  {
    id: 'KECUKUPAN_DATA',
    label: 'Kecukupan Data',
    category: 'TIU',
    keywords: ['kecukupan data', 'statistika']
  },
  {
    id: 'FIGURAL',
    label: 'Figural (Gambar)',
    category: 'TIU',
    keywords: ['figural', 'gambar', 'pola bentuk']
  },
  // TKP
  {
    id: 'PELAYANAN_PUBLIK',
    label: 'Pelayanan Publik',
    category: 'TKP',
    keywords: ['pelayanan publik', 'keramahan']
  },
  {
    id: 'JEJARING_KERJA',
    label: 'Jejaring Kerja',
    category: 'TKP',
    keywords: ['jejaring kerja', 'kolaborasi']
  },
  {
    id: 'SOSIAL_TIK',
    label: 'Sosial Budaya & TIK',
    category: 'TKP',
    keywords: ['sosial budaya', 'tik', 'teknologi']
  },
  {
    id: 'PROFESIONALISME',
    label: 'Profesionalisme',
    category: 'TKP',
    keywords: ['profesionalisme']
  },
  {
    id: 'ANTI_RADIKALISME',
    label: 'Anti-Radikalisme',
    category: 'TKP',
    keywords: ['anti-radikalisme', 'anti radikalisme', 'radikalisme', 'ideologi']
  }
];

const matchesLatihanTopic = (pkg: PracticePackage, topic: LatihanTopicOption): boolean => {
  if (pkg.category !== topic.category) return false;
  const hay = `${pkg.title} ${pkg.subtitle || ''} ${pkg.description || ''}`.toLowerCase();
  return topic.keywords.some(kw => hay.includes(kw));
};

export const TryoutHubView: React.FC = () => {
  const {
    currentUser,
    practicePackages,
    groupSessions,
    leaderboards,
    tryoutHubTab: activeTab,
    setTryoutHubTab: setActiveTab,
    startExamByPackage,
    startExamByType,
    registerGroupSession,
    setActiveView,
    setPreferredUpgradePackageId
  } = useApp();

  // Search & Filter States for Try Out
  const [searchTryout, setSearchTryout] = useState('');
  const [tierFilterTryout, setTierFilterTryout] = useState<'ALL' | PackageAccessTier>('ALL');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [sortByTryout, setSortByTryout] = useState<'POPULAR' | 'RATING' | 'NEWEST'>('POPULAR');

  // Search & Filter States for Latihan Soal
  const [searchLatihan, setSearchLatihan] = useState('');
  const [catFilterLatihan, setCatFilterLatihan] = useState<'ALL' | QuestionCategory>('ALL');
  const [topicFilterLatihan, setTopicFilterLatihan] = useState<string>('ALL');
  const [tierFilterLatihan, setTierFilterLatihan] = useState<'ALL' | PackageAccessTier>('ALL');
  const [sortByLatihan, setSortByLatihan] = useState<
    'NATURAL_ASC' | 'NATURAL_DESC' | 'NEWEST' | 'OLDEST' | 'POPULAR' | 'SOAL_ASC' | 'SOAL_DESC'
  >('NATURAL_ASC');

  // Search & Filter States for Tryout Kategori & Spesialis
  const [searchKategori, setSearchKategori] = useState('');
  const [catFilterKategori, setCatFilterKategori] = useState<'ALL' | 'SKD' | 'TWK' | 'TIU' | 'TKP'>('ALL');
  const [tierFilterKategori, setTierFilterKategori] = useState<'ALL' | 'GRATIS'>('ALL');

  // Dropdown menu state for "Data ⌄" on Try Out cards
  const [openDataDropdownId, setOpenDataDropdownId] = useState<string | null>(null);

  const isPremiumUser = hasPaidQuestionAccess(currentUser);
  const canAccessZoom = hasZoomAccess(currentUser);

  // Filtered Try Out packages (type TRYOUT_SKD / TRYOUT_AKBAR, published only)
  const filteredTryouts = useMemo(() => {
    return practicePackages
      .filter(p => p.is_active !== false)
      .filter(p => p.package_type === 'TRYOUT_SKD' || p.package_type === 'TRYOUT_AKBAR')
      .filter(p => {
        if (!searchTryout.trim()) return true;
        const q = searchTryout.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          (p.subtitle && p.subtitle.toLowerCase().includes(q))
        );
      })
      .filter(p => {
        if (tierFilterTryout === 'ALL') return true;
        return p.access_tier === tierFilterTryout;
      })
      .sort((a, b) => {
        if (sortByTryout === 'RATING') return (b.rating || 0) - (a.rating || 0);
        if (sortByTryout === 'NEWEST') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return (b.completed_count || 0) - (a.completed_count || 0);
      });
  }, [practicePackages, searchTryout, tierFilterTryout, sortByTryout]);

  // Base published Latihan packages (LATIHAN_HARIAN / DRILL_KATEGORI)
  const publishedLatihanPackages = useMemo(() => {
    return practicePackages.filter(
      p => p.is_active !== false && (p.package_type === 'LATIHAN_HARIAN' || p.package_type === 'DRILL_KATEGORI')
    );
  }, [practicePackages]);

  // Topic options visible based on active category + package counts
  const visibleLatihanTopics = useMemo(() => {
    const scopePackages =
      catFilterLatihan === 'ALL'
        ? publishedLatihanPackages
        : publishedLatihanPackages.filter(p => p.category === catFilterLatihan);

    return LATIHAN_TOPIC_OPTIONS.filter(topic => {
      if (catFilterLatihan !== 'ALL') {
        return topic.category === catFilterLatihan;
      }
      // Always display core TWK topics requested + TIU/TKP topics that have matching packages
      if (topic.category === 'TWK') return true;
      return scopePackages.some(pkg => matchesLatihanTopic(pkg, topic));
    }).map(topic => ({
      ...topic,
      count: scopePackages.filter(pkg => matchesLatihanTopic(pkg, topic)).length
    }));
  }, [publishedLatihanPackages, catFilterLatihan]);

  // Filtered & Sorted Latihan packages
  const filteredLatihan = useMemo(() => {
    const activeTopic = LATIHAN_TOPIC_OPTIONS.find(t => t.id === topicFilterLatihan);

    return publishedLatihanPackages
      .filter(p => {
        if (!searchLatihan.trim()) return true;
        const q = searchLatihan.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
        );
      })
      .filter(p => {
        if (catFilterLatihan === 'ALL') return true;
        return p.category === catFilterLatihan;
      })
      .filter(p => {
        if (!activeTopic) return true;
        return matchesLatihanTopic(p, activeTopic);
      })
      .filter(p => {
        if (tierFilterLatihan === 'ALL') return true;
        return p.access_tier === tierFilterLatihan;
      })
      .sort((a, b) => {
        if (sortByLatihan === 'NATURAL_DESC') {
          return b.title.localeCompare(a.title, 'id', { numeric: true, sensitivity: 'base' });
        }
        if (sortByLatihan === 'NEWEST') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortByLatihan === 'OLDEST') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortByLatihan === 'POPULAR') {
          return (b.completed_count || 0) - (a.completed_count || 0);
        }
        if (sortByLatihan === 'SOAL_ASC') {
          return (a.question_count || 0) - (b.question_count || 0);
        }
        if (sortByLatihan === 'SOAL_DESC') {
          return (b.question_count || 0) - (a.question_count || 0);
        }
        return a.title.localeCompare(b.title, 'id', { numeric: true, sensitivity: 'base' });
      });
  }, [
    publishedLatihanPackages,
    searchLatihan,
    catFilterLatihan,
    topicFilterLatihan,
    tierFilterLatihan,
    sortByLatihan
  ]);

  // Handle start package
  const handleStart = (pkg: PracticePackage) => {
    if ((pkg.access_tier === 'PREMIUM' || pkg.access_tier === 'PLATINUM') && !isPremiumUser) {
      setActiveView('premium');
      return;
    }
    startExamByPackage(pkg);
  };

  return (
    <div className="space-y-4 sm:space-y-5 max-w-7xl mx-auto pb-8" onClick={() => setOpenDataDropdownId(null)}>
      {/* Top Banner Header (Minimalist on mobile, informative on desktop) */}
      <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-sky-800 text-white shadow-sm flex flex-row items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-sky-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
            Sistem Simulasi CAT BKN Terlengkap
          </span>
          <h1 className="text-base sm:text-xl font-extrabold tracking-tight truncate">
            Tryout &amp; Latihan SKD CPNS
          </h1>
          <p className="hidden sm:block text-xs text-sky-100 max-w-xl leading-relaxed">
            Pilih paket latihan terpilah sesuai kebutuhan: Latihan TIU, TWK, TKP, atau Try Out lengkap 110 soal CAT BKN.
          </p>
        </div>

        {/* Membership Status Box */}
        <div className="px-2.5 py-1.5 sm:p-3 bg-white/10 backdrop-blur rounded-lg sm:rounded-xl border border-white/20 text-[11px] sm:text-xs shrink-0 text-right sm:text-center">
          <span className="text-[9px] sm:text-[10px] text-sky-200 block leading-tight">Keanggotaan:</span>
          <span className="font-extrabold text-xs sm:text-sm text-white block leading-tight">
            {currentUser?.role === 'SUPER_ADMIN'
              ? 'SUPER ADMIN'
              : getMembershipDisplayLabel(currentUser?.membership_type).toUpperCase()}
          </span>
          {currentUser?.role !== 'SUPER_ADMIN' && currentUser?.membership_type !== 'INTENSIF' && (
            <button
              onClick={() => setActiveView('premium')}
              className="mt-0.5 block w-full text-[10px] sm:text-[11px] font-bold text-sky-300 hover:text-white underline cursor-pointer"
            >
              Upgrade &rarr;
            </button>
          )}
        </div>
      </div>

      {/* Kotak Peringatan Tampilan Perangkat untuk Peserta */}
      <div className="px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center gap-2.5 shadow-2xs">
        <Monitor className="w-4 h-4 text-amber-700 shrink-0" />
        <span className="font-semibold">
          Untuk tampilan terbaik saat simulasi ujian tryout, gunakan tablet/laptop/PC.
        </span>
      </div>

      {/* Main Tabs Navigation (2x2 kotak minimalis di mobile: 2 atas, 2 bawah; horizontal di tablet/desktop) */}
      <div className="grid grid-cols-2 sm:flex sm:flex-row sm:flex-wrap border-b border-slate-300 gap-1.5 sm:gap-2 pb-2 sm:pb-2">
        <button
          onClick={() => setActiveTab('TRYOUT_SKD')}
          className={`flex items-center justify-center sm:justify-start gap-1.5 px-2.5 sm:px-4 py-2 text-[11px] sm:text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
            activeTab === 'TRYOUT_SKD'
              ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
              : 'bg-white/80 text-slate-800 border-slate-300/80 hover:bg-white'
          }`}
        >
          <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Tryout Lengkap</span>
          <Crown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${activeTab === 'TRYOUT_SKD' ? 'text-amber-300' : 'text-amber-500'}`} />
        </button>

        <button
          onClick={() => setActiveTab('LATIHAN_SOAL')}
          className={`flex items-center justify-center sm:justify-start gap-1.5 px-2.5 sm:px-4 py-2 text-[11px] sm:text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
            activeTab === 'LATIHAN_SOAL'
              ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
              : 'bg-white/80 text-slate-800 border-slate-300/80 hover:bg-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Latihan Harian &amp; Drill</span>
        </button>

        <button
          onClick={() => setActiveTab('SIMULASI_AKBAR')}
          className={`flex items-center justify-center sm:justify-start gap-1.5 px-2.5 sm:px-4 py-2 text-[11px] sm:text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
            activeTab === 'SIMULASI_AKBAR'
              ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
              : 'bg-white/80 text-slate-800 border-slate-300/80 hover:bg-white'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'SIMULASI_AKBAR' ? 'text-amber-300' : 'text-amber-500'}`} />
          <span className="sm:hidden truncate">Tryout Kategori</span>
          <span className="hidden sm:inline truncate">Tryout Kategori &amp; Spesialis</span>
        </button>

        <button
          onClick={() => setActiveTab('BARENG')}
          className={`flex items-center justify-center sm:justify-start gap-1.5 px-2.5 sm:px-4 py-2 text-[11px] sm:text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
            activeTab === 'BARENG'
              ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
              : 'bg-white/80 text-slate-800 border-slate-300/80 hover:bg-white'
          }`}
        >
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Tryout Bareng</span>
        </button>
      </div>

      {/* ================= TAB 1: TRY OUT SKD (Minimalis & Mobile Friendly) ================= */}
      {activeTab === 'TRYOUT_SKD' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Top Search Bar & Filter Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTryout}
                onChange={e => setSearchTryout(e.target.value)}
                placeholder="Cari try out..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              {searchTryout && (
                <button
                  onClick={() => setSearchTryout('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={e => {
                e.stopPropagation();
                setIsFilterModalOpen(prev => !prev);
              }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-xl shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Filter</span>
              {tierFilterTryout !== 'ALL' && (
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              )}
            </button>
          </div>

          {/* Quick Filter Badges */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 text-[11px] sm:text-xs">
            <button
              onClick={() => setTierFilterTryout('ALL')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold transition-colors whitespace-nowrap cursor-pointer ${
                tierFilterTryout === 'ALL'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Semua ({practicePackages.filter(p => p.is_active !== false && (p.package_type === 'TRYOUT_SKD' || p.package_type === 'TRYOUT_AKBAR')).length})
            </button>
            <button
              onClick={() => setTierFilterTryout('GRATIS')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold transition-colors whitespace-nowrap cursor-pointer ${
                tierFilterTryout === 'GRATIS'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Gratis
            </button>
            <button
              onClick={() => setTierFilterTryout('PREMIUM')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold transition-colors whitespace-nowrap cursor-pointer ${
                tierFilterTryout === 'PREMIUM'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Premium
            </button>
            <button
              onClick={() => setTierFilterTryout('PLATINUM')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold transition-colors whitespace-nowrap cursor-pointer ${
                tierFilterTryout === 'PLATINUM'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Platinum
            </button>
          </div>

          {/* Filter Popover Dropdown */}
          {isFilterModalOpen && (
            <div
              onClick={e => e.stopPropagation()}
              className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-lg space-y-3 max-w-sm"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="font-extrabold text-xs text-slate-900">Filter Try Out</span>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Akses Paket:</label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {(['ALL', 'GRATIS', 'PREMIUM', 'PLATINUM'] as const).map(tier => (
                    <button
                      key={tier}
                      onClick={() => setTierFilterTryout(tier)}
                      className={`py-1.5 px-2 rounded-lg font-semibold text-center border cursor-pointer ${
                        tierFilterTryout === tier
                          ? 'bg-blue-50 border-blue-600 text-blue-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {tier === 'ALL' ? 'Semua Akses' : tier}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Urutkan Berdasarkan:</label>
                <select
                  value={sortByTryout}
                  onChange={e => setSortByTryout(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="POPULAR">Paling Populer / Sering Dikerjakan</option>
                  <option value="RATING">Nilai Ulasan Tertinggi (Rating)</option>
                  <option value="NEWEST">Terbaru Ditambahkan</option>
                </select>
              </div>
            </div>
          )}

          {/* Minimalist Cards Grid (Compact horizontal header like screenshot) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
            {filteredTryouts.map(pkg => {
              const isLocked = (pkg.access_tier === 'PREMIUM' || pkg.access_tier === 'PLATINUM') && !isPremiumUser;
              const isDropdownOpen = openDataDropdownId === pkg.id;

              return (
                <div
                  key={pkg.id}
                  className="p-3.5 sm:p-4 bg-white rounded-xl border border-slate-300/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between gap-3 relative"
                >
                  <div className="space-y-2">
                    {/* 1. Judul Besar Paling Atas */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                        <FileText className="w-4.5 h-4.5 stroke-[1.8]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-extrabold text-sm sm:text-[15px] text-slate-900 leading-snug break-words">
                            {pkg.title}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0 pt-0.5">
                            <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center">
                              <Flame className="w-2.5 h-2.5 fill-current" />
                            </span>
                            {pkg.access_tier === 'PLATINUM' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-purple-600 text-white tracking-wider">
                                PLATINUM
                              </span>
                            )}
                            {pkg.access_tier === 'PREMIUM' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-sky-500 text-white tracking-wider">
                                PREMIUM
                              </span>
                            )}
                            {pkg.access_tier === 'GRATIS' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-600 text-white tracking-wider">
                                GRATIS
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Sub Judul Lengkap (Turun ke bawah otomatis jika panjang, tidak terpotong) */}
                    {(pkg.subtitle || pkg.description) && (
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-normal break-words">
                        {pkg.subtitle || pkg.description}
                      </p>
                    )}

                    {/* 3. Jumlah Soal & Waktu */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{pkg.question_count} Soal</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>{pkg.duration_minutes} Menit</span>
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-amber-500 font-bold ml-auto">
                        <Star className="w-3 h-3 fill-current" />
                        {pkg.rating ? pkg.rating.toFixed(1) : '4.6'}
                        <span className="text-blue-600 font-normal ml-0.5">
                          ({(pkg.review_count || 320).toLocaleString('id-ID')})
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* 4. Bottom Action Buttons: Kerjakan & Data ⌄ */}
                  <div className="flex items-center gap-2 relative">
                    <button
                      onClick={() => handleStart(pkg)}
                      className={`flex-1 py-1.5 sm:py-2 px-3 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isLocked
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                          : 'bg-blue-100/90 hover:bg-blue-600 text-blue-700 hover:text-white'
                      }`}
                    >
                      {isLocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Buka Akses</span>
                        </>
                      ) : (
                        <span>Kerjakan</span>
                      )}
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setOpenDataDropdownId(isDropdownOpen ? null : pkg.id);
                      }}
                      className="py-1.5 sm:py-2 px-3 bg-blue-100/90 hover:bg-blue-200 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Data</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {/* "Data ⌄" Dropdown Menu */}
                    {isDropdownOpen && (
                      <div
                        onClick={e => e.stopPropagation()}
                        className="absolute right-0 bottom-10 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 space-y-0.5 text-xs"
                      >
                        <button
                          onClick={() => {
                            setActiveView('riwayat-ujian');
                            setOpenDataDropdownId(null);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Riwayat &amp; Pembahasan</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('BARENG');
                            setOpenDataDropdownId(null);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          <ListOrdered className="w-3.5 h-3.5 text-amber-500" />
                          <span>Peringkat Peserta</span>
                        </button>
                        <button
                          onClick={() => {
                            alert(`Paket "${pkg.title}" telah dikerjakan ${(pkg.completed_count || 1200).toLocaleString('id-ID')} peserta dengan rata-rata skor SKD 385.5.`);
                            setOpenDataDropdownId(null);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Statistik Pengerjaan</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTryouts.length === 0 && (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 space-y-2.5">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs sm:text-sm font-bold text-slate-700">Tidak ada paket try out yang sesuai filter.</p>
              <button
                onClick={() => {
                  setSearchTryout('');
                  setTierFilterTryout('ALL');
                }}
                className="px-4 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: LATIHAN SOAL & DRILL (Minimalis + Kerjakan & Data) ================= */}
      {activeTab === 'LATIHAN_SOAL' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Top Search Bar, Category & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchLatihan}
                onChange={e => setSearchLatihan(e.target.value)}
                placeholder="Cari judul atau materi latihan..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              {searchLatihan && (
                <button
                  onClick={() => setSearchLatihan('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-2">
              <select
                aria-label="Filter Kategori Latihan"
                value={catFilterLatihan}
                onChange={e => {
                  setCatFilterLatihan(e.target.value as any);
                  setTopicFilterLatihan('ALL');
                }}
                className="py-2 px-2.5 sm:px-3 bg-white border border-slate-300 rounded-xl text-[11px] sm:text-xs font-bold text-slate-700 shadow-2xs focus:outline-blue-500 cursor-pointer"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="TWK">TWK</option>
                <option value="TIU">TIU</option>
                <option value="TKP">TKP</option>
              </select>

              <div className="relative flex items-center">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
                <select
                  aria-label="Urutkan Latihan"
                  value={sortByLatihan}
                  onChange={e => setSortByLatihan(e.target.value as any)}
                  className="w-full py-2 pl-7 pr-2.5 sm:pr-3 bg-white border border-slate-300 rounded-xl text-[11px] sm:text-xs font-bold text-slate-700 shadow-2xs focus:outline-blue-500 cursor-pointer"
                >
                  <option value="NATURAL_ASC">Urutan: A–Z / #1–#N</option>
                  <option value="NATURAL_DESC">Urutan: Z–A / #N–#1</option>
                  <option value="NEWEST">Terbaru Ditambahkan</option>
                  <option value="OLDEST">Terlama</option>
                  <option value="POPULAR">Paling Populer</option>
                  <option value="SOAL_ASC">Soal Tersedikit</option>
                  <option value="SOAL_DESC">Soal Terbanyak</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Category & Tier Badges for Latihan */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 text-[11px] sm:text-xs">
            <button
              onClick={() => {
                setCatFilterLatihan('ALL');
                setTopicFilterLatihan('ALL');
                setTierFilterLatihan('ALL');
              }}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold transition-colors whitespace-nowrap cursor-pointer ${
                catFilterLatihan === 'ALL' && tierFilterLatihan === 'ALL' && topicFilterLatihan === 'ALL'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Semua ({publishedLatihanPackages.length})
            </button>
            <button
              onClick={() => {
                setCatFilterLatihan('TIU');
                setTopicFilterLatihan('ALL');
              }}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold transition-colors whitespace-nowrap cursor-pointer ${
                catFilterLatihan === 'TIU'
                  ? 'bg-sky-500 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              TIU ({publishedLatihanPackages.filter(p => p.category === 'TIU').length})
            </button>
            <button
              onClick={() => {
                setCatFilterLatihan('TWK');
                setTopicFilterLatihan('ALL');
              }}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold transition-colors whitespace-nowrap cursor-pointer ${
                catFilterLatihan === 'TWK'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              TWK ({publishedLatihanPackages.filter(p => p.category === 'TWK').length})
            </button>
            <button
              onClick={() => {
                setCatFilterLatihan('TKP');
                setTopicFilterLatihan('ALL');
              }}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold transition-colors whitespace-nowrap cursor-pointer ${
                catFilterLatihan === 'TKP'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              TKP ({publishedLatihanPackages.filter(p => p.category === 'TKP').length})
            </button>
            <button
              onClick={() => setTierFilterLatihan(tierFilterLatihan === 'GRATIS' ? 'ALL' : 'GRATIS')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold transition-colors whitespace-nowrap cursor-pointer ${
                tierFilterLatihan === 'GRATIS'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Gratis
            </button>
          </div>

          {/* Filter Materi / Topik */}
          <div className="bg-white/90 border border-slate-200/90 rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                <span>Filter Materi {catFilterLatihan !== 'ALL' ? `(${catFilterLatihan})` : ''}</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Menampilkan {filteredLatihan.length} paket
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto sm:flex-wrap pb-0.5 text-[11px] sm:text-xs">
              <button
                onClick={() => setTopicFilterLatihan('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  topicFilterLatihan === 'ALL'
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Semua Materi
              </button>
              {visibleLatihanTopics.map(topic => {
                const isSelected = topicFilterLatihan === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => {
                      if (isSelected) {
                        setTopicFilterLatihan('ALL');
                      } else {
                        setTopicFilterLatihan(topic.id);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    <span>{topic.label}</span>
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded leading-none ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-500'
                      }`}
                    >
                      {topic.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minimalist Cards Grid with Kerjakan & Data ⌄ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
            {filteredLatihan.map(pkg => {
              const isLocked = (pkg.access_tier === 'PREMIUM' || pkg.access_tier === 'PLATINUM') && !isPremiumUser;
              const isDropdownOpen = openDataDropdownId === pkg.id;

              const catShort = pkg.category === 'CAMPURAN' ? 'SKD' : pkg.category;

              return (
                <div
                  key={pkg.id}
                  className="p-3.5 sm:p-4 bg-white rounded-xl border border-slate-300/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between gap-3 relative"
                >
                  <div className="space-y-2">
                    {/* 1. Judul Besar Paling Atas */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                        <FileText className="w-4.5 h-4.5 stroke-[1.8]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-extrabold text-sm sm:text-[15px] text-slate-900 leading-snug break-words">
                            {pkg.title}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0 pt-0.5">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-sky-500 text-white tracking-wider">
                              {catShort}
                            </span>
                            {pkg.access_tier === 'PREMIUM' || pkg.access_tier === 'PLATINUM' ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-blue-600 text-white tracking-wider">
                                PREMIUM
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-600 text-white tracking-wider">
                                GRATIS
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Sub Judul Lengkap (Turun ke bawah otomatis jika panjang, tidak terpotong) */}
                    {(pkg.subtitle || pkg.description) && (
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-normal break-words">
                        {pkg.subtitle || pkg.description}
                      </p>
                    )}

                    {/* 3. Jumlah Soal & Waktu */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{pkg.question_count} Soal</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>{pkg.duration_minutes} Menit</span>
                      </span>
                    </div>
                  </div>

                  {/* 4. Bottom Action Buttons: Kerjakan & Data ⌄ */}
                  <div className="flex items-center gap-2 relative">
                    <button
                      onClick={() => handleStart(pkg)}
                      className={`flex-1 py-1.5 sm:py-2 px-3 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isLocked
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                          : 'bg-blue-100/90 hover:bg-blue-600 text-blue-700 hover:text-white'
                      }`}
                    >
                      {isLocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Buka Akses</span>
                        </>
                      ) : (
                        <span>Kerjakan</span>
                      )}
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setOpenDataDropdownId(isDropdownOpen ? null : pkg.id);
                      }}
                      className="py-1.5 sm:py-2 px-3 bg-blue-100/90 hover:bg-blue-200 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Data</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {isDropdownOpen && (
                      <div
                        onClick={e => e.stopPropagation()}
                        className="absolute right-0 bottom-10 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 space-y-0.5 text-xs"
                      >
                        <button
                          onClick={() => {
                            setActiveView('riwayat-ujian');
                            setOpenDataDropdownId(null);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Riwayat &amp; Pembahasan</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('BARENG');
                            setOpenDataDropdownId(null);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          <ListOrdered className="w-3.5 h-3.5 text-amber-500" />
                          <span>Peringkat Peserta</span>
                        </button>
                        <button
                          onClick={() => {
                            alert(`Latihan "${pkg.title}" (${pkg.question_count} soal, ${pkg.duration_minutes} menit) telah dikerjakan oleh ${(pkg.completed_count || 640).toLocaleString('id-ID')} peserta.`);
                            setOpenDataDropdownId(null);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Info &amp; Statistik</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredLatihan.length === 0 && (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 space-y-2.5">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs sm:text-sm font-bold text-slate-700">Tidak ada latihan yang cocok dengan pencarian.</p>
              <button
                onClick={() => {
                  setSearchLatihan('');
                  setCatFilterLatihan('ALL');
                  setTopicFilterLatihan('ALL');
                  setTierFilterLatihan('ALL');
                }}
                className="px-4 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: SIMULASI AKBAR & KATEGORI (Search, Filter & Kotak Minimalis) ================= */}
      {activeTab === 'SIMULASI_AKBAR' && (() => {
        const kategoriItems = [
          {
            id: 'sim-akbar',
            category: 'SKD' as const,
            tier: 'PREMIUM' as const,
            title: 'Try Out Akbar Nasional SKD CPNS 2026',
            subtitle: 'Simulasi CAT BKN 110 Soal TWK, TIU, TKP',
            soal: 110,
            menit: 100,
            peserta: 14820,
            onStart: () => startExamByType('TRYOUT_SKD_LENGKAP')
          },
          {
            id: 'sim-twk',
            category: 'TWK' as const,
            tier: 'PREMIUM' as const,
            title: 'Try Out Spesialis TWK HOTS Penalaran',
            subtitle: 'Integritas, Pilar Kebangsaan & UUD 1945',
            soal: 30,
            menit: 25,
            peserta: 8930,
            onStart: () => startExamByType('TRYOUT_KATEGORI', 'TWK')
          },
          {
            id: 'sim-tiu',
            category: 'TIU' as const,
            tier: 'PREMIUM' as const,
            title: 'Try Out Drill TIU Numerik & Silogisme',
            subtitle: 'Berhitung Cepat, Deret & Logika Analitis',
            soal: 35,
            menit: 35,
            peserta: 11250,
            onStart: () => startExamByType('TRYOUT_KATEGORI', 'TIU')
          },
          {
            id: 'sim-tkp',
            category: 'TKP' as const,
            tier: 'PREMIUM' as const,
            title: 'Try Out TKP Anti-Radikalisme & Integritas',
            subtitle: 'Studi Kasus Etika ASN Pembobotan Skor 1-5',
            soal: 45,
            menit: 40,
            peserta: 9740,
            onStart: () => startExamByType('TRYOUT_KATEGORI', 'TKP')
          },
          {
            id: 'sim-mini',
            category: 'SKD' as const,
            tier: 'GRATIS' as const,
            title: 'Mini Try Out Sprint (15 Soal Kilat)',
            subtitle: 'Latihan Cepat 5 TWK + 5 TIU + 5 TKP',
            soal: 15,
            menit: 15,
            peserta: 16400,
            onStart: () => startExamByType('LATIHAN_HARIAN', 'TWK')
          }
        ];

        const filteredKategori = kategoriItems
          .filter(item => {
            if (!searchKategori.trim()) return true;
            const q = searchKategori.toLowerCase();
            return (
              item.title.toLowerCase().includes(q) ||
              item.subtitle.toLowerCase().includes(q) ||
              item.category.toLowerCase().includes(q)
            );
          })
          .filter(item => {
            if (catFilterKategori === 'ALL') return true;
            return item.category === catFilterKategori;
          })
          .filter(item => {
            if (tierFilterKategori === 'ALL') return true;
            return item.tier === tierFilterKategori;
          });

        return (
          <div className="space-y-3 sm:space-y-4">
            {/* Top Search Bar & Category Select */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchKategori}
                  onChange={e => setSearchKategori(e.target.value)}
                  placeholder="Cari tryout kategori..."
                  className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                {searchKategori && (
                  <button
                    onClick={() => setSearchKategori('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={catFilterKategori}
                onChange={e => setCatFilterKategori(e.target.value as any)}
                className="py-2 px-2.5 sm:px-3 bg-white border border-slate-300 rounded-xl text-[11px] sm:text-xs font-bold text-slate-700 shadow-2xs focus:outline-blue-500 max-w-[135px] sm:max-w-none"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="SKD">SKD</option>
                <option value="TWK">TWK</option>
                <option value="TIU">TIU</option>
                <option value="TKP">TKP</option>
              </select>
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 text-[11px] sm:text-xs">
              <button
                onClick={() => {
                  setCatFilterKategori('ALL');
                  setTierFilterKategori('ALL');
                }}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  catFilterKategori === 'ALL' && tierFilterKategori === 'ALL'
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Semua ({kategoriItems.length})
              </button>
              <button
                onClick={() => setCatFilterKategori('SKD')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  catFilterKategori === 'SKD'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                SKD
              </button>
              <button
                onClick={() => setCatFilterKategori('TWK')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  catFilterKategori === 'TWK'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                TWK
              </button>
              <button
                onClick={() => setCatFilterKategori('TIU')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  catFilterKategori === 'TIU'
                    ? 'bg-sky-500 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                TIU
              </button>
              <button
                onClick={() => setCatFilterKategori('TKP')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  catFilterKategori === 'TKP'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                TKP
              </button>
              <button
                onClick={() => setTierFilterKategori(tierFilterKategori === 'GRATIS' ? 'ALL' : 'GRATIS')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  tierFilterKategori === 'GRATIS'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Gratis
              </button>
            </div>

            {/* Minimalist Cards Grid (Sama seperti tampilan Latihan Drill) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
              {filteredKategori.map(sim => {
                const isLocked = sim.tier === 'PREMIUM' && !isPremiumUser;
                const isDropdownOpen = openDataDropdownId === sim.id;

                return (
                  <div
                    key={sim.id}
                    className="p-3.5 sm:p-4 bg-white rounded-xl border border-slate-300/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between gap-3 relative"
                  >
                    <div className="space-y-2">
                      {/* 1. Judul Besar Paling Atas */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                          <FileText className="w-4.5 h-4.5 stroke-[1.8]" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-extrabold text-sm sm:text-[15px] text-slate-900 leading-snug break-words">
                              {sim.title}
                            </h3>
                            <div className="flex items-center gap-1 shrink-0 pt-0.5">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-sky-500 text-white tracking-wider">
                                {sim.category}
                              </span>
                              {sim.tier === 'PREMIUM' ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-blue-600 text-white tracking-wider">
                                  PREMIUM
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-600 text-white tracking-wider">
                                  GRATIS
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. Sub Judul Lengkap (Turun ke bawah otomatis jika panjang, tidak terpotong) */}
                      {sim.subtitle && (
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-normal break-words">
                          {sim.subtitle}
                        </p>
                      )}

                      {/* 3. Jumlah Soal & Waktu */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                        <span className="inline-flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{sim.soal} Soal</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span>{sim.menit} Menit</span>
                        </span>
                      </div>
                    </div>

                    {/* 4. Bottom Action Buttons: Kerjakan & Data ⌄ */}
                    <div className="flex items-center gap-2 relative">
                      <button
                        onClick={() => {
                          if (isLocked) {
                            setActiveView('premium');
                            return;
                          }
                          sim.onStart();
                        }}
                        className={`flex-1 py-1.5 sm:py-2 px-3 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isLocked
                            ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                            : 'bg-blue-100/90 hover:bg-blue-600 text-blue-700 hover:text-white'
                        }`}
                      >
                        {isLocked ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Buka Akses</span>
                          </>
                        ) : (
                          <span>Kerjakan</span>
                        )}
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setOpenDataDropdownId(isDropdownOpen ? null : sim.id);
                        }}
                        className="py-1.5 sm:py-2 px-3 bg-blue-100/90 hover:bg-blue-200 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Data</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {isDropdownOpen && (
                        <div
                          onClick={e => e.stopPropagation()}
                          className="absolute right-0 bottom-10 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 space-y-0.5 text-xs"
                        >
                          <button
                            onClick={() => {
                              setActiveView('riwayat-ujian');
                              setOpenDataDropdownId(null);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer"
                          >
                            <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Riwayat &amp; Pembahasan</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab('BARENG');
                              setOpenDataDropdownId(null);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer"
                          >
                            <ListOrdered className="w-3.5 h-3.5 text-amber-500" />
                            <span>Peringkat Peserta</span>
                          </button>
                          <button
                            onClick={() => {
                              alert(`Paket "${sim.title}" (${sim.soal} soal, ${sim.menit} menit) telah dikerjakan oleh ${sim.peserta.toLocaleString('id-ID')} peserta.`);
                              setOpenDataDropdownId(null);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer"
                          >
                            <Users className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Info &amp; Statistik</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredKategori.length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 space-y-2.5">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs sm:text-sm font-bold text-slate-700">Tidak ada tryout kategori yang cocok dengan pencarian.</p>
                <button
                  onClick={() => {
                    setSearchKategori('');
                    setCatFilterKategori('ALL');
                    setTierFilterKategori('ALL');
                  }}
                  className="px-4 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* ================= TAB 4: TRYOUT BARENG NASIONAL ================= */}
      {activeTab === 'BARENG' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Jadwal Sesi Tryout Bareng Serentak
                </h2>
                <p className="text-xs text-slate-500">
                  Pengerjaan serentak se-Indonesia dengan passing grade resmi BKN dan pembahasan Zoom.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {groupSessions.map(session => (
                <div
                  key={session.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded w-fit">
                      {session.status} · Kuota Terbatas
                    </span>
                    <span className="text-xs text-slate-500">
                      Instruktur: <strong>{session.coach_name}</strong>
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    {session.poster_url && (
                      <img
                        src={session.poster_url}
                        alt={`Poster ${session.title}`}
                        className="w-full md:w-44 h-28 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                    )}
                    <div className="space-y-2 flex-1">
                      <h3 className="font-extrabold text-base text-slate-900">
                        {session.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {session.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Jadwal:</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(session.start_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Waktu:</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {session.duration_minutes} Menit
                      </span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Jumlah Soal:</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {session.question_count} Butir
                      </span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Kuota:</span>
                      <span className="font-semibold text-slate-800">
                        {session.quota} Peserta
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Video className="w-4 h-4 text-purple-600" />
                      <span>Coaching Zoom: <strong>{session.coach_name}</strong></span>
                      {canAccessZoom ? (
                        <a
                          href={session.zoom_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-700 hover:underline flex items-center gap-1 font-semibold ml-2"
                        >
                          Link Zoom <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setPreferredUpgradePackageId('pkg-2');
                            setActiveView('premium');
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[11px] font-bold ml-2 cursor-pointer"
                        >
                          <Crown className="w-3 h-3 text-amber-700" />
                          <Lock className="w-3 h-3" />
                          <span>Zoom Khusus Paket Intensif</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => registerGroupSession(session.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 cursor-pointer"
                      >
                        Daftar Sesi
                      </button>
                      <button
                        onClick={() => startExamByType('TRYOUT_BERSAMA', undefined, session.id)}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Mulai Tryout Bareng</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Table per PRD Section 14.4 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              Leaderboard Peringkat Peserta Tryout Bareng
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                    <th className="py-2.5 px-3">Peringkat</th>
                    <th className="py-2.5 px-3">Nama Peserta</th>
                    <th className="py-2.5 px-3 font-mono">Nilai TWK</th>
                    <th className="py-2.5 px-3 font-mono">Nilai TIU</th>
                    <th className="py-2.5 px-3 font-mono">Nilai TKP</th>
                    <th className="py-2.5 px-3 font-mono">Total Nilai</th>
                    <th className="py-2.5 px-3">Waktu Pengerjaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaderboards.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      className={entry.user_id === currentUser?.id ? 'bg-blue-50/70 font-bold' : ''}
                    >
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-bold ${
                          idx === 0 ? 'bg-amber-400 text-amber-950' :
                          idx === 1 ? 'bg-slate-300 text-slate-800' :
                          idx === 2 ? 'bg-amber-600/30 text-amber-900' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-900">
                        {entry.user_name} {entry.user_id === currentUser?.id && '(Anda)'}
                      </td>
                      <td className="py-2.5 px-3 font-mono">{entry.twk_score}</td>
                      <td className="py-2.5 px-3 font-mono">{entry.tiu_score}</td>
                      <td className="py-2.5 px-3 font-mono">{entry.tkp_score}</td>
                      <td className="py-2.5 px-3 font-mono font-extrabold text-blue-700">
                        {entry.total_score}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono">
                        {Math.floor(entry.completion_time_seconds / 60)}m {entry.completion_time_seconds % 60}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
