import React from 'react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../layout/BrandLogo';
import {
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  ArrowRight,
  ChevronRight,
  Layers,
  Ban
} from 'lucide-react';
import { REFERRAL_DISCOUNT_AMOUNT } from '../../context/AppContext';

export const LandingPage: React.FC = () => {
  const { setAuthModalMode, packages, settings } = useApp();

  return (
    <div className="min-h-screen bg-[#d4dce6] text-slate-900 flex flex-col font-sans">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-300 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BrandLogo size="md" showSubtitle />
            <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
              CAT SKD Resmi
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAuthModalMode('LOGIN')}
              className="px-4 py-2 text-xs md:text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Masuk (Login)
            </button>
            <button
              onClick={() => setAuthModalMode('REGISTER')}
              className="px-4 py-2 text-xs md:text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors"
            >
              Daftar Sekarang
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-sky-900 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold text-sky-200">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Simulasi Sistem Computer Assisted Test (CAT) BKN 2026/2027</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                Persiapkan Dirimu, Raih Kelulusan CPNS.
              </h1>

              <p className="text-sm md:text-base text-sky-100 max-w-2xl leading-relaxed">
                Platform bimbingan belajar dan latihan soal Seleksi Kompetensi Dasar (SKD) dengan pengalaman CAT BKN yang nyata, bank soal HOTS TWK, TIU, TKP, penilaian otomatis berbobot, dan pembahasan tuntas.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => setAuthModalMode('REGISTER')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Mulai Belajar Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setAuthModalMode('LOGIN')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>Coba Simulasi Gratis</span>
                </button>
              </div>

              {/* Trust markers */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-sky-200">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Passing Grade KepmenPAN-RB 2024</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Timer Hitung Mundur Server</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Bobot TKP 1-5 Terstandar</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 max-w-md w-full">
                <img
                  src="/src/assets/images/banner_cat_simulation_1794498170137.jpg"
                  alt="Simulasi CAT BKN"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
                  <div className="text-white space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400">
                      Tampilan Nyata CAT BKN
                    </span>
                    <p className="text-xs font-semibold">
                      110 Soal · 100 Menit · Navigasi Nomor Soal &amp; Ragu-ragu
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Fitur Utama Platform */}
      <section className="py-16 md:py-20 bg-[#d4dce6] border-b border-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-white px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
              Fitur Lengkap
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Dirancang Khusus untuk Memaksimalkan Peluang Kelulusan Anda
            </h2>
            <p className="text-xs sm:text-sm text-slate-700">
              Sistem bimbingan belajar dan simulasi ujian yang telah disesuaikan dengan standar tes Seleksi Kompetensi Dasar CPNS terbaru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-300/90 shadow-sm space-y-3 hover:border-blue-400 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Simulasi CAT SKD Lengkap</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                110 butir soal (30 TWK, 35 TIU, 45 TKP) dalam durasi 100 menit. Dilengkapi nomor navigasi berwarna abu-abu, hijau, dan oranye untuk soal ragu-ragu.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-300/90 shadow-sm space-y-3 hover:border-blue-400 transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Materi &amp; Trik Cepat Poin 5</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rangkuman UUD 1945, rumus kilat deret angka TIU, silogisme logika analitis, dan panduan mindset ASN BerAKHLAK untuk selalu meraih poin 5 pada TKP.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-300/90 shadow-sm space-y-3 hover:border-blue-400 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Tryout Bareng &amp; Coaching Zoom</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ikuti sesi ujian serentak nasional dengan hitung mundur waktu server, pemeringkatan leaderboard nasional, serta pembahasan interaktif via Zoom.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Sistem Tryout & Penilaian */}
      <section className="py-16 bg-[#c8d2df] border-b border-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-white px-3 py-1 rounded-full border border-sky-200 shadow-2xs">
                Akurasi Penilaian
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Standar Penilaian Resmi SKD CPNS
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                LOGIN CPNS menggunakan formula penilaian resmi referensi KepmenPAN-RB 2024 yang membedakan penilaian objektif TWK/TIU dengan pembobotan skala 1 s/d 5 pada seluruh opsi TKP.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">Tes Wawasan Kebangsaan (TWK)</h4>
                    <p className="text-[11px] text-slate-500">30 Soal · Benar +5, Salah 0, Kosong 0</p>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                    PG: 65
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">Tes Inteligensi Umum (TIU)</h4>
                    <p className="text-[11px] text-slate-500">35 Soal · Benar +5, Salah 0, Kosong 0</p>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-sky-700 bg-sky-50 px-3 py-1 rounded-md border border-sky-200">
                    PG: 80
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">Tes Karakteristik Pribadi (TKP)</h4>
                    <p className="text-[11px] text-slate-500">45 Soal · Bobot Opsi 1 s/d 5, Kosong 0</p>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
                    PG: 166
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-md space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">
                Tiga Mode Ujian Siap Pakai:
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
                  <span className="text-xs font-bold text-blue-800">1. Tryout SKD Lengkap</span>
                  <p className="text-xs text-slate-600 mt-0.5">
                    110 soal komprehensif, 100 menit waktu ujian. Pengalaman riil menghitung ritme dan mental simulasi CAT BKN.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
                  <span className="text-xs font-bold text-sky-800">2. Tryout Per Kategori</span>
                  <p className="text-xs text-slate-600 mt-0.5">
                    30 butir soal dalam 25 menit. Fokus memperkuat kategori spesifik (TWK, TIU, atau TKP).
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
                  <span className="text-xs font-bold text-emerald-800">3. Latihan Harian</span>
                  <p className="text-xs text-slate-600 mt-0.5">
                    15 soal cepat dalam 10 menit. Tersedia untuk seluruh member gratis untuk menjaga konsistensi belajar harian.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Informasi Paket Premium */}
      <section className="py-16 md:py-20 bg-[#d4dce6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-white px-3 py-1 rounded-full border border-amber-300 shadow-2xs">
              Paket Belajar
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Investasi Terbaik untuk Masa Depan ASN Anda
            </h2>
            <p className="text-xs sm:text-sm text-slate-700">
              Pilihan keanggotaan fleksibel dengan fasilitas ujian tanpa batas dan pendampingan materi.
            </p>
          </div>

          <div
            className={`grid grid-cols-1 gap-6 lg:gap-7 max-w-7xl mx-auto items-stretch ${
              packages.filter(p => p.is_active).length >= 3
                ? 'lg:grid-cols-3'
                : packages.filter(p => p.is_active).length === 2
                ? 'md:grid-cols-2 max-w-4xl'
                : 'max-w-md'
            }`}
          >
            {packages
              .filter(p => p.is_active)
              .map(pkg => {
                const activeReferralDiscount = settings.referral_discount_amount ?? REFERRAL_DISCOUNT_AMOUNT;
                const allowsDiscount = pkg.allow_discount !== false;
                const isStandar = pkg.tier_key === 'STANDAR';
                const isIntensif = pkg.tier_key === 'INTENSIF';
                const featureItems =
                  pkg.feature_items && pkg.feature_items.length > 0
                    ? pkg.feature_items
                    : pkg.features.map(label => ({ label, included: true }));

                return (
                  <div
                    key={pkg.id}
                    className={`p-6 md:p-7 rounded-2xl bg-white flex flex-col justify-between space-y-6 relative overflow-hidden ${
                      pkg.is_recommended || pkg.tier_key === 'PREMIUM'
                        ? 'border-2 border-blue-600 shadow-lg ring-2 ring-blue-500/15'
                        : isIntensif
                        ? 'border-2 border-indigo-500 shadow-md'
                        : 'border border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {pkg.is_recommended && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-700 text-white">
                            PALING HEMAT &amp; POPULER
                          </span>
                        )}
                        {isIntensif && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                            BIMBINGAN ZOOM MALAM
                          </span>
                        )}
                        {isStandar && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300">
                            PAKET DASAR · TANPA PROMO
                          </span>
                        )}
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 ml-auto">
                          Masa Aktif {pkg.duration_days} Hari
                        </span>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-lg text-slate-900 leading-snug">
                          {pkg.package_name}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                          {pkg.description}
                        </p>
                      </div>

                      <div className="pt-1 space-y-2">
                        {allowsDiscount && pkg.original_price && pkg.original_price > pkg.price ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-bold text-slate-400 line-through font-mono">
                              Rp {pkg.original_price.toLocaleString('id-ID')}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wide">
                              {pkg.promo_badge || 'PROMO TAHUN BARU'}
                            </span>
                          </div>
                        ) : !allowsDiscount ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300 uppercase tracking-wide">
                            <Ban className="w-3 h-3 text-slate-500" />
                            <span>Tanpa Promo &amp; Tanpa Diskon</span>
                          </div>
                        ) : null}

                        <div>
                          <span className="text-3xl font-extrabold text-blue-700 font-mono">
                            Rp {pkg.price.toLocaleString('id-ID')}
                          </span>
                          <span className="text-xs text-slate-500 font-normal ml-2">/ masa aktif</span>
                        </div>

                        {allowsDiscount ? (
                          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 leading-snug">
                            <strong className="text-emerald-800">Diskon Tambahan Rp {activeReferralDiscount.toLocaleString('id-ID')}!</strong>{' '}
                            Pakai kode referral teman atau <span className="font-mono font-extrabold bg-white px-1.5 py-0.5 rounded border border-emerald-300">LOGINCPNS</span>.
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 leading-snug">
                            Harga flat <strong>Rp {pkg.price.toLocaleString('id-ID')}</strong>. Tidak berlaku kode promo maupun potongan kode referral.
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-4 space-y-2">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Rincian Fasilitas Layanan:
                        </div>
                        {featureItems.map((feat, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start gap-2.5 text-xs ${
                              feat.included
                                ? 'text-slate-700'
                                : 'text-slate-600'
                            }`}
                          >
                            {feat.included ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            )}
                            <span className={feat.included ? 'font-medium' : 'opacity-90'}>
                              {feat.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => setAuthModalMode('REGISTER')}
                        className={`w-full py-3 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer ${
                          isStandar
                            ? 'bg-slate-800 hover:bg-slate-900 text-white'
                            : isIntensif
                            ? 'bg-indigo-700 hover:bg-indigo-800 text-white'
                            : 'bg-blue-700 hover:bg-blue-800 text-white'
                        }`}
                      >
                        Daftar &amp; Ambil Paket Ini
                      </button>
                      <p className="text-[10px] text-center text-slate-400 mt-2">
                        Pembayaran via Transfer Bank, QRIS, atau COD WhatsApp Admin {settings.admin_whatsapp}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BrandLogo size="sm" theme="dark" />
            <span className="text-slate-500">·</span>
            <span>Platform Belajar &amp; Simulasi CAT SKD CPNS</span>
          </div>

          <div className="text-slate-400 text-center md:text-right">
            <span>Bantuan &amp; Konfirmasi: WhatsApp Admin <strong>{settings.admin_whatsapp}</strong></span>
            <p className="text-[11px] text-slate-500 mt-1">
              &copy; {new Date().getFullYear()} LOGIN CPNS. Seluruh hak cipta dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
