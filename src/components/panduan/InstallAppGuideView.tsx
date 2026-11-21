import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Smartphone,
  Tablet,
  MoreVertical,
  Download,
  PlusSquare,
  CheckCircle2,
  ZoomIn,
  X,
  Lock,
  RefreshCw,
  Share2,
  Star,
  Info,
  BookmarkPlus,
  MonitorSmartphone,
  ArrowDown,
  ArrowUpRight,
  Image as ImageIcon,
  Award,
  BookOpen,
  Sparkles,
  ExternalLink
} from 'lucide-react';

type DeviceMode = 'PHONE' | 'TABLET';

const ChromeMiniAppScreen: React.FC = () => (
  <div className="bg-[#d4dce6] flex-1 p-2.5 space-y-2 overflow-hidden select-none">
    {/* Mini Navbar inside Chrome Preview */}
    <div className="bg-white rounded-lg border border-slate-200 px-2.5 py-1.5 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-md overflow-hidden bg-blue-600 shrink-0 flex items-center justify-center">
          <img
            src="/assets/aistudio/image_171e0b3e.png"
            alt="LOGIN CPNS"
            className="w-[136%] max-w-none -mt-[3%]"
          />
        </div>
        <div className="leading-none">
          <p className="text-[10px] font-extrabold text-[#122649] tracking-tight">
            LOGIN<span className="text-[#2896d3]">CPNS</span>
          </p>
          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">Bimbel SKD</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
          Member
        </span>
      </div>
    </div>

    {/* Mini Hero Card */}
    <div className="rounded-lg bg-gradient-to-r from-[#122649] to-blue-700 p-2.5 text-white shadow-xs">
      <p className="text-[8px] text-sky-200 font-semibold">Selamat Belajar, Pejuang NIP</p>
      <p className="text-[11px] font-extrabold leading-tight mt-0.5">
        Simulasi CAT SKD CPNS 110 Soal
      </p>
      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white text-[#122649] text-[8px] font-bold">
        <span>Mulai Try Out</span>
      </div>
    </div>

    {/* Mini Feature Cards */}
    <div className="grid grid-cols-2 gap-1.5">
      <div className="bg-white rounded-lg p-2 border border-slate-200 shadow-2xs">
        <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
          <Award className="w-3 h-3" />
        </div>
        <p className="text-[9px] font-bold text-slate-900 leading-tight">Try Out SKD</p>
        <p className="text-[7px] text-slate-500 mt-0.5">TWK · TIU · TKP</p>
      </div>
      <div className="bg-white rounded-lg p-2 border border-slate-200 shadow-2xs">
        <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
          <BookOpen className="w-3 h-3" />
        </div>
        <p className="text-[9px] font-bold text-slate-900 leading-tight">Materi Belajar</p>
        <p className="text-[7px] text-slate-500 mt-0.5">Modul &amp; Video</p>
      </div>
    </div>
  </div>
);

export const InstallAppGuideView: React.FC = () => {
  const { settings } = useApp();
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('PHONE');
  const [browserTab, setBrowserTab] = useState<'ANDROID_CHROME' | 'IOS_SAFARI'>('ANDROID_CHROME');
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; caption?: string } | null>(null);

  const posterUrl = settings.install_tutorial_poster_url?.trim() || '';
  const tutorialImages = settings.install_tutorial_images || [];
  const currentHostLabel =
    typeof window !== 'undefined' && window.location?.host
      ? window.location.host
      : 'logincpns.bimbel.id';

  const ChromeAddressBar = ({ highlightThreeDots = false }: { highlightThreeDots?: boolean }) => (
    <div className="bg-[#f1f3f4] border-b border-slate-200 px-2 py-1.5 flex items-center gap-1.5">
      {/* Status URL pill */}
      <div className="flex-1 min-w-0 bg-white border border-slate-200/90 rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-2xs">
        <Lock className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
        <span className="text-[9px] font-medium text-slate-700 truncate">{currentHostLabel}</span>
      </div>
      {/* Tab square */}
      <div className="w-4 h-4 rounded-[4px] border-[1.5px] border-slate-600 flex items-center justify-center text-[8px] font-extrabold text-slate-700 shrink-0">
        1
      </div>
      {/* Three dots menu button */}
      <div
        className={`relative w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
          highlightThreeDots
            ? 'bg-red-600 text-white ring-4 ring-red-400/50 shadow-md animate-pulse'
            : 'text-slate-700 hover:bg-slate-200'
        }`}
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </div>
    </div>
  );

  const DeviceStatusBar = () => (
    <div className="bg-slate-900 text-white px-3 py-1 flex items-center justify-between text-[9px] font-semibold tracking-tight">
      <span>09:41</span>
      <div className="w-12 h-2.5 rounded-full bg-slate-800 border border-slate-700/80" />
      <div className="flex items-center gap-1">
        <span>5G</span>
        <span>98%</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-300/80 shadow-xs p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Panduan Pengguna HP &amp; Tablet
            </p>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              Cara Instal Aplikasi LOGIN CPNS di Layar Utama HP / Tablet
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Pasang pintasan aplikasi <strong>LOGIN CPNS</strong> langsung di layar utama HP atau Tablet Anda melalui{' '}
              <strong>Google Chrome</strong> agar bisa dibuka sekali ketuk dengan tampilan layar penuh seperti aplikasi Android/iOS tanpa perlu mengetik alamat link ulang.
            </p>
          </div>

          {/* Toggle HP vs Tablet View */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="inline-flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl">
              <button
                type="button"
                onClick={() => setDeviceMode('PHONE')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  deviceMode === 'PHONE'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Layar HP</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('TABLET')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  deviceMode === 'TABLET'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Layar Tablet</span>
              </button>
            </div>
          </div>
        </div>

        {/* Browser Switcher */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setBrowserTab('ANDROID_CHROME')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                browserTab === 'ANDROID_CHROME'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Android / Tablet (Google Chrome)
            </button>
            <button
              type="button"
              onClick={() => setBrowserTab('IOS_SAFARI')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                browserTab === 'IOS_SAFARI'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              iPhone / iPad (Safari)
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Tip: Klik gambar atau poster di bawah ini untuk memperbesar tampilan layar.
          </p>
        </div>
      </div>

      {/* Poster Tutorial Resmi (Upload dari Super Admin jika tersedia) */}
      {posterUrl && (
        <div className="bg-white rounded-2xl border border-slate-300/80 shadow-xs p-5 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base md:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-700" />
                <span>Poster Panduan Instalasi Aplikasi</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Poster panduan resmi dari admin untuk memudahkan instalasi di HP atau Tablet.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setLightboxImage({
                  url: posterUrl,
                  title: 'Poster Panduan Instal Aplikasi LOGIN CPNS',
                  caption: 'Ketuk atau perbesar poster untuk melihat langkah instalasi dengan jelas.'
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold cursor-pointer self-start sm:self-auto"
            >
              <ZoomIn className="w-4 h-4" />
              <span>Perbesar Poster</span>
            </button>
          </div>

          <div
            onClick={() =>
              setLightboxImage({
                url: posterUrl,
                title: 'Poster Panduan Instal Aplikasi LOGIN CPNS'
              })
            }
            className="relative group cursor-zoom-in rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-w-3xl mx-auto"
          >
            <img
              src={posterUrl}
              alt="Poster Panduan Instal Aplikasi LOGIN CPNS"
              className="w-full h-auto max-h-[560px] object-contain mx-auto"
            />
            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-end justify-end p-3">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 text-white text-xs font-bold shadow-sm">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Klik untuk perbesar</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Panduan Visual Layar HP / Tablet Lengkap */}
      {browserTab === 'ANDROID_CHROME' ? (
        <div className="bg-white rounded-2xl border border-slate-300/80 shadow-xs p-5 md:p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base md:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <MonitorSmartphone className="w-5 h-5 text-blue-700" />
                <span>
                  Panduan Layar {deviceMode === 'TABLET' ? 'Tablet' : 'HP'} Lengkap via Google Chrome (4 Langkah)
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ikuti urutan gambar layar di bawah ini dari Langkah 1 sampai Langkah 4.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Browser: Google Chrome Android / Tab
            </span>
          </div>

          <div
            className={`grid gap-6 ${
              deviceMode === 'TABLET'
                ? 'grid-cols-1 lg:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
            }`}
          >
            {/* STEP 1: Buka di Chrome & Ketuk Titik Tiga */}
            <div className="flex flex-col bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
                  Langkah 1
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Buka Aplikasi di Chrome &amp; Pilih Titik Tiga (⋮)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Buka <strong>LOGIN CPNS</strong> lewat aplikasi <strong>Google Chrome</strong>, lalu ketuk ikon{' '}
                  <strong className="text-red-600">titik tiga (⋮)</strong> di pojok kanan atas layar.
                </p>
              </div>

              {/* Device Mockup Frame */}
              <div
                className={`mx-auto w-full ${
                  deviceMode === 'TABLET' ? 'max-w-[360px]' : 'max-w-[240px]'
                } rounded-[24px] bg-slate-900 p-2 shadow-lg border border-slate-700`}
              >
                <div className="rounded-[18px] overflow-hidden bg-white flex flex-col h-[340px] relative">
                  <DeviceStatusBar />
                  <ChromeAddressBar highlightThreeDots />

                  {/* Pointer Callout Arrow to Three Dots */}
                  <div className="absolute top-[54px] right-2 z-20 flex flex-col items-end pointer-events-none">
                    <div className="mr-1.5 text-red-600">
                      <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div className="bg-red-600 text-white text-[9px] font-extrabold px-2 py-1 rounded-lg shadow-md border border-red-400 leading-tight text-right">
                      1. Ketuk Titik Tiga (⋮)
                      <br />
                      <span className="font-medium text-red-100">di pojok kanan atas</span>
                    </div>
                  </div>

                  <ChromeMiniAppScreen />
                </div>
              </div>
            </div>

            {/* STEP 2: Pilih "Instal aplikasi" / "Tambahkan ke layar utama" */}
            <div className="flex flex-col bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
                  Langkah 2
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Pilih &ldquo;Instal aplikasi&rdquo; / &ldquo;Tambahkan ke layar utama&rdquo;
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pada daftar menu Chrome yang muncul, gulir ke bawah lalu pilih menu{' '}
                  <strong>Tambahkan ke layar utama</strong> atau <strong>Instal aplikasi</strong>.
                </p>
              </div>

              {/* Device Mockup Frame */}
              <div
                className={`mx-auto w-full ${
                  deviceMode === 'TABLET' ? 'max-w-[360px]' : 'max-w-[240px]'
                } rounded-[24px] bg-slate-900 p-2 shadow-lg border border-slate-700`}
              >
                <div className="rounded-[18px] overflow-hidden bg-white flex flex-col h-[340px] relative">
                  <DeviceStatusBar />
                  <ChromeAddressBar />
                  <ChromeMiniAppScreen />

                  {/* Dimmed backdrop behind Chrome 3-dots popup menu */}
                  <div className="absolute inset-0 top-[24px] bg-slate-900/20 z-10" />

                  {/* Authentic Chrome Dropdown Menu */}
                  <div className="absolute top-[28px] right-1.5 w-[186px] bg-white rounded-xl shadow-2xl border border-slate-200 z-20 overflow-hidden text-slate-800">
                    {/* Top Icon Row (Forward, Bookmark, Download, Info, Refresh) */}
                    <div className="grid grid-cols-5 px-2 py-2 bg-slate-50 border-b border-slate-200 text-slate-600">
                      <div className="flex justify-center"><ArrowUpRight className="w-3.5 h-3.5" /></div>
                      <div className="flex justify-center"><Star className="w-3.5 h-3.5" /></div>
                      <div className="flex justify-center"><Download className="w-3.5 h-3.5" /></div>
                      <div className="flex justify-center"><Info className="w-3.5 h-3.5" /></div>
                      <div className="flex justify-center"><RefreshCw className="w-3.5 h-3.5" /></div>
                    </div>

                    <div className="py-1 text-[10px]">
                      <div className="px-3 py-1.5 flex items-center gap-2 text-slate-600">
                        <PlusSquare className="w-3.5 h-3.5 text-slate-500" />
                        <span>Tab baru</span>
                      </div>
                      <div className="px-3 py-1.5 flex items-center gap-2 text-slate-600">
                        <Share2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Bagikan...</span>
                      </div>

                      {/* Highlighted Option */}
                      <div className="mx-1 my-0.5 px-2.5 py-2 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-between shadow-sm ring-2 ring-amber-300">
                        <div className="flex items-center gap-2 min-w-0">
                          <BookmarkPlus className="w-3.5 h-3.5 shrink-0 text-amber-200" />
                          <span className="leading-tight text-[10px]">
                            Tambahkan ke layar utama / Instal aplikasi
                          </span>
                        </div>
                      </div>

                      <div className="px-3 py-1.5 flex items-center gap-2 text-slate-500">
                        <MonitorSmartphone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Situs desktop</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: Konfirmasi Instal / Tambah Pintasan */}
            <div className="flex flex-col bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
                  Langkah 3
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Ketuk Tombol &ldquo;Instal&rdquo; atau &ldquo;Tambahkan&rdquo;
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Akan muncul jendela konfirmasi bertuliskan <strong>LOGIN CPNS</strong>. Pilih{' '}
                  <strong>Instal</strong> (atau <strong>Buat pintasan &rarr; Tambahkan</strong>).
                </p>
              </div>

              {/* Device Mockup Frame */}
              <div
                className={`mx-auto w-full ${
                  deviceMode === 'TABLET' ? 'max-w-[360px]' : 'max-w-[240px]'
                } rounded-[24px] bg-slate-900 p-2 shadow-lg border border-slate-700`}
              >
                <div className="rounded-[18px] overflow-hidden bg-white flex flex-col h-[340px] relative">
                  <DeviceStatusBar />
                  <ChromeAddressBar />
                  <ChromeMiniAppScreen />

                  {/* Modal Backdrop */}
                  <div className="absolute inset-0 bg-slate-900/55 z-10 flex items-center justify-center p-3">
                    {/* Chrome Install Confirmation Dialog */}
                    <div className="w-full bg-white rounded-2xl p-3.5 shadow-2xl border border-slate-200 space-y-3">
                      <p className="text-[11px] font-extrabold text-slate-900">
                        Tambahkan ke layar utama
                      </p>

                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-blue-600 shrink-0 shadow-xs flex items-center justify-center">
                          <img
                            src="/assets/aistudio/image_171e0b3e.png"
                            alt="Ikon LOGIN CPNS"
                            className="w-[136%] max-w-none -mt-[3%]"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-extrabold text-slate-900 truncate">
                            LOGIN CPNS
                          </p>
                          <p className="text-[8px] text-slate-500 truncate">{currentHostLabel}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-500">
                          Batal
                        </span>
                        <div className="relative">
                          <span className="inline-block px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-extrabold shadow-md ring-4 ring-blue-300/60">
                            Instal / Tambah
                          </span>
                          <div className="absolute -bottom-5 right-1 flex items-center gap-0.5 text-[8px] font-extrabold text-blue-700 whitespace-nowrap">
                            <ArrowDown className="w-2.5 h-2.5 rotate-180" />
                            <span>Ketuk ini</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 4: Ikon Terpasang di Layar Utama */}
            <div className="flex flex-col bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                  Langkah 4
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Pintasan Terpasang di Layar Utama HP
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Selesai! Ikon aplikasi <strong>LOGIN CPNS</strong> kini tampil di layar utama HP atau Tablet Anda. Ketuk ikon kapan saja untuk belajar.
                </p>
              </div>

              {/* Device Mockup Frame: Home Screen Wallpaper */}
              <div
                className={`mx-auto w-full ${
                  deviceMode === 'TABLET' ? 'max-w-[360px]' : 'max-w-[240px]'
                } rounded-[24px] bg-slate-900 p-2 shadow-lg border border-slate-700`}
              >
                <div className="rounded-[18px] overflow-hidden bg-gradient-to-br from-slate-800 via-[#122649] to-sky-900 flex flex-col h-[340px] relative justify-between">
                  <DeviceStatusBar />

                  {/* Home Screen Clock Widget */}
                  <div className="px-4 pt-3 text-white/90 text-center">
                    <p className="text-2xl font-extrabold tracking-tight">09:42</p>
                    <p className="text-[9px] text-sky-200 font-medium">Layar Utama Perangkat</p>
                  </div>

                  {/* App Icons Grid */}
                  <div className="px-3 py-2 grid grid-cols-4 gap-2.5 items-start">
                    {/* Sample system icons */}
                    {[
                      { name: 'Chrome', color: 'bg-white text-blue-600', letter: 'C' },
                      { name: 'WhatsApp', color: 'bg-emerald-500 text-white', letter: 'W' },
                      { name: 'Kamera', color: 'bg-slate-700 text-slate-200', letter: 'K' }
                    ].map(app => (
                      <div key={app.name} className="flex flex-col items-center gap-1 opacity-75">
                        <div
                          className={`w-9 h-9 rounded-xl ${app.color} flex items-center justify-center text-xs font-extrabold shadow-sm`}
                        >
                          {app.letter}
                        </div>
                        <span className="text-[8px] text-slate-200 truncate max-w-full">
                          {app.name}
                        </span>
                      </div>
                    ))}

                    {/* Highlighted Installed LOGIN CPNS App Icon */}
                    <div className="flex flex-col items-center gap-1 relative">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-blue-600 shadow-lg ring-3 ring-emerald-400 flex items-center justify-center">
                        <img
                          src="/assets/aistudio/image_171e0b3e.png"
                          alt="LOGIN CPNS App"
                          className="w-[136%] max-w-none -mt-[3%]"
                        />
                      </div>
                      <span className="text-[8px] font-extrabold text-white bg-emerald-600/90 px-1.5 py-0.2 rounded">
                        LOGIN CPNS
                      </span>
                    </div>
                  </div>

                  {/* Installed Success Banner */}
                  <div className="m-2.5 p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span className="text-[9px] font-bold leading-tight">
                      Siap dibuka langsung dari layar utama!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Catatan Opsi Menu Chrome */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-blue-950">
            <Sparkles className="w-5 h-5 text-blue-700 shrink-0" />
            <div className="space-y-0.5 leading-relaxed">
              <p className="font-bold">Catatan Tampilan Menu di Beberapa Versi Chrome:</p>
              <p className="text-blue-900/90">
                Pada sebagian HP Android atau Tablet, pilihan di titik tiga (<strong>⋮</strong>) bertuliskan{' '}
                <strong>&ldquo;Tambahkan ke layar utama&rdquo;</strong> lalu muncul opsi{' '}
                <strong>&ldquo;Instal&rdquo;</strong> atau <strong>&ldquo;Buat pintasan&rdquo;</strong>. Keduanya sama-sama akan memasang ikon{' '}
                <strong>LOGIN CPNS</strong> di layar utama perangkat Anda.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* iPhone / iPad Safari Guide */
        <div className="bg-white rounded-2xl border border-slate-300/80 shadow-xs p-5 md:p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base md:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-blue-700" />
              <span>Panduan Instal di iPhone / iPad (Browser Safari)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Untuk pengguna perangkat Apple iOS / iPadOS, gunakan browser bawaan <strong>Safari</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
                Langkah 1
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">Buka di Safari &amp; Ketuk Bagikan</h3>
              <p className="text-slate-600 leading-relaxed">
                Buka aplikasi <strong>LOGIN CPNS</strong> di browser <strong>Safari</strong>, lalu ketuk ikon{' '}
                <strong>Bagikan (kotak dengan panah ke atas ↑)</strong> di bagian bawah/atas layar.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
                Langkah 2
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">Pilih &ldquo;Tambah ke Layar Utama&rdquo;</h3>
              <p className="text-slate-600 leading-relaxed">
                Gulir daftar menu ke bawah dan pilih opsi <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                Langkah 3
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">Ketuk &ldquo;Tambah&rdquo; di Pojok Kanan Atas</h3>
              <p className="text-slate-600 leading-relaxed">
                Pastikan nama bertuliskan <strong>LOGIN CPNS</strong>, lalu ketuk <strong>Tambah (Add)</strong>. Ikon aplikasi langsung muncul di layar utama.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Galeri Gambar Tutorial Langkah Demi Langkah (Diupload oleh Super Admin) */}
      {tutorialImages.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-300/80 shadow-xs p-5 md:p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base md:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-700" />
              <span>Gambar Tutorial Instal Aplikasi ({tutorialImages.length} Panduan)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tangkapan layar tutorial tambahan yang diunggah oleh Admin. Klik gambar untuk memperbesar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tutorialImages.map((item, idx) => (
              <div
                key={item.id}
                className="flex flex-col bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:border-blue-300 transition-colors"
              >
                <div
                  onClick={() =>
                    setLightboxImage({
                      url: item.image_url,
                      title: item.title || `Gambar Tutorial ${idx + 1}`,
                      caption: item.caption
                    })
                  }
                  className="relative group cursor-zoom-in bg-white border-b border-slate-200 aspect-[4/3] overflow-hidden flex items-center justify-center"
                >
                  <img
                    src={item.image_url}
                    alt={item.title || `Tutorial ${idx + 1}`}
                    className="w-full h-full object-contain p-2"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-end justify-end p-2.5">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-[11px] font-bold">
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Perbesar</span>
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-1 flex-1">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
                    Tutorial #{idx + 1}
                  </p>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {item.title || `Langkah ${idx + 1}`}
                  </h3>
                  {item.caption && (
                    <p className="text-xs text-slate-600 leading-relaxed">{item.caption}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal untuk Perbesar Poster / Gambar Tutorial */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm md:text-base font-extrabold text-slate-900 truncate">
                  {lightboxImage.title}
                </h3>
                {lightboxImage.caption && (
                  <p className="text-xs text-slate-500 truncate">{lightboxImage.caption}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer shrink-0"
                aria-label="Tutup Pratinjau"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-100 flex-1 overflow-auto flex items-center justify-center">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
