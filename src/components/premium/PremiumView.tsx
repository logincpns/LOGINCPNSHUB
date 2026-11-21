import React, { useState, useEffect } from 'react';
import {
  useApp,
  DEFAULT_REFERRAL_CODE,
  REFERRAL_DISCOUNT_AMOUNT,
  getMembershipDisplayLabel
} from '../../context/AppContext';
import {
  Crown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Upload,
  CreditCard,
  QrCode,
  Phone,
  Check,
  FileText,
  Image as ImageIcon,
  Trash2,
  Copy,
  Tag,
  Gift,
  X,
  RotateCcw,
  Sparkles,
  Ban
} from 'lucide-react';

export const PremiumView: React.FC = () => {
  const {
    currentUser,
    packages,
    payments,
    settings,
    submitPaymentProof,
    validateReferralCode,
    preferredUpgradePackageId,
    setPreferredUpgradePackageId
  } = useApp();

  const activeReferralDiscount = settings.referral_discount_amount ?? REFERRAL_DISCOUNT_AMOUNT;
  const activePackages = packages.filter(p => p.is_active);
  const displayPackages = activePackages.length > 0 ? activePackages : packages;

  const defaultPkgId =
    preferredUpgradePackageId && displayPackages.some(p => p.id === preferredUpgradePackageId)
      ? preferredUpgradePackageId
      : displayPackages.find(p => p.id === 'pkg-1')?.id || displayPackages[0]?.id || 'pkg-1';

  const [selectedPackageId, setSelectedPackageId] = useState<string>(defaultPkgId);
  const [referralCodeInput, setReferralCodeInput] = useState<string>(
    currentUser?.registered_referral_code || DEFAULT_REFERRAL_CODE
  );
  const [paymentMethod, setPaymentMethod] = useState<'TRANSFER_BANK' | 'QRIS' | 'COD_WHATSAPP'>('TRANSFER_BANK');
  const [bankName, setBankName] = useState<string>('');
  const [senderName, setSenderName] = useState<string>(currentUser?.full_name || '');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [proofFileName, setProofFileName] = useState<string>('');
  const [proofFileType, setProofFileType] = useState<'IMAGE' | 'PDF' | ''>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [isSubmittedNotice, setIsSubmittedNotice] = useState(false);

  // Sync preferred upgrade package when redirected from locked menu
  useEffect(() => {
    if (preferredUpgradePackageId && displayPackages.some(p => p.id === preferredUpgradePackageId)) {
      setSelectedPackageId(preferredUpgradePackageId);
      setPreferredUpgradePackageId(null);
    }
  }, [preferredUpgradePackageId, displayPackages, setPreferredUpgradePackageId]);

  // Ensure selectedPackageId remains valid when admin toggles packages active/inactive
  useEffect(() => {
    if (displayPackages.length > 0 && !displayPackages.some(p => p.id === selectedPackageId)) {
      setSelectedPackageId(displayPackages[0].id);
    }
  }, [displayPackages, selectedPackageId]);

  // Sync default sender name & referral code when switching user
  useEffect(() => {
    if (currentUser) {
      setSenderName(currentUser.full_name);
      const initialCode =
        currentUser.registered_referral_code &&
        currentUser.registered_referral_code !== currentUser.referral_code
          ? currentUser.registered_referral_code
          : DEFAULT_REFERRAL_CODE;
      setReferralCodeInput(initialCode);
    }
  }, [currentUser?.id]);

  const selectedPkg = displayPackages.find(p => p.id === selectedPackageId) || displayPackages[0];
  const userPayments = payments.filter(p => p.user_id === currentUser?.id);

  // Pricing breakdown calculations
  const allowsDiscount = selectedPkg?.allow_discount !== false;
  const originalPrice =
    allowsDiscount && selectedPkg.original_price && selectedPkg.original_price > selectedPkg.price
      ? selectedPkg.original_price
      : selectedPkg.price;
  const promoDiscount = allowsDiscount ? Math.max(0, originalPrice - selectedPkg.price) : 0;
  const referralCheck = validateReferralCode(referralCodeInput, currentUser?.id);
  const referralDiscount = allowsDiscount && referralCheck.isValid ? referralCheck.discount : 0;
  const finalPayableAmount = Math.max(0, selectedPkg.price - referralDiscount);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    setIsSubmittedNotice(false);
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (!isImage && !isPdf) {
      setUploadError('Format file tidak didukung. Harap upload file Gambar (JPG/PNG/WEBP) atau PDF.');
      e.target.value = '';
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 3 MB agar dapat diproses dengan cepat.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const result = String(ev.target?.result || '');
      setProofUrl(result);
      setProofFileName(file.name);
      setProofFileType(isPdf ? 'PDF' : 'IMAGE');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClearFile = () => {
    setProofUrl('');
    setProofFileName('');
    setProofFileType('');
    setUploadError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');

    if (!senderName.trim()) {
      setUploadError('Mohon isi nama pengirim atau pemilik rekening terlebih dahulu.');
      return;
    }

    if (!proofUrl) {
      setUploadError('Mohon upload bukti transfer berupa gambar (JPG/PNG) atau PDF terlebih dahulu.');
      return;
    }

    submitPaymentProof(
      selectedPackageId,
      paymentMethod,
      bankName.trim() ||
        (paymentMethod === 'QRIS'
          ? 'QRIS'
          : paymentMethod === 'COD_WHATSAPP'
          ? 'Tunai/COD WA'
          : 'Transfer Bank'),
      senderName.trim(),
      proofUrl,
      referralCheck.isValid ? referralCheck.normalizedCode : undefined
    );
    setIsSubmittedNotice(true);
    setProofUrl('');
    setProofFileName('');
    setProofFileType('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-sky-800 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold text-amber-300">
            <Crown className="w-3.5 h-3.5" />
            <span>Keanggotaan Premium LOGIN CPNS</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
            Tingkatkan Persiapan SKD Tanpa Batas
          </h1>
          <p className="text-xs text-sky-100 max-w-xl">
            Dapatkan akses tak terbatas ke seluruh simulasi 110 soal CAT BKN, tryout kategori, modul rahasia, serta sesi bimbingan interaktif via Zoom.
          </p>
        </div>

        {/* Current User Status */}
        <div className="p-4 bg-white/10 backdrop-blur rounded-xl border border-white/20 text-center shrink-0">
          <span className="text-[10px] text-sky-200 block uppercase font-bold">Status Akun Anda</span>
          <span className="font-extrabold text-sm sm:text-base text-white block">
            {getMembershipDisplayLabel(currentUser?.membership_type).toUpperCase()}
          </span>
          {currentUser &&
            currentUser.membership_type !== 'FREE' &&
            currentUser.premium_end && (
              <span className="text-[10px] text-emerald-300 block mt-0.5">
                Berlaku hingga: {new Date(currentUser.premium_end).toLocaleDateString('id-ID')}
              </span>
            )}
        </div>
      </div>

      {/* Simple & Visible Referral Promo Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-amber-300" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold">
                Hemat Ekstra Rp {activeReferralDiscount.toLocaleString('id-ID')} dengan Kode Referral!
              </h2>
              <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase">
                Langsung Potong Harga
              </span>
            </div>
            <p className="text-xs text-emerald-50 leading-relaxed">
              Punya kode referral dari teman atau mitra? Masukkan di kolom kode referral saat pembayaran untuk langsung memotong harga sebesar <strong>Rp {activeReferralDiscount.toLocaleString('id-ID')}</strong>. Belum punya kode teman? Pakai kode bawaan{' '}
              <strong className="font-mono bg-white/20 px-1.5 py-0.5 rounded">{DEFAULT_REFERRAL_CODE}</strong>{' '}
              (sudah otomatis terisi, bisa Anda hapus &amp; ganti kapan saja!).
            </p>
          </div>
        </div>
        <div className="shrink-0 bg-white/15 border border-white/25 rounded-xl px-4 py-2.5 text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-100 block">Kode Bawaan Resmi</span>
          <span className="font-mono text-base font-extrabold tracking-wider text-amber-300">
            {DEFAULT_REFERRAL_CODE}
          </span>
        </div>
      </div>

      {/* Package Selection Cards */}
      {activePackages.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-amber-300 text-center text-xs text-amber-900 space-y-2">
          <AlertCircle className="w-7 h-7 text-amber-600 mx-auto" />
          <p className="font-extrabold text-sm">Semua paket sedang dinonaktifkan sementara oleh Super Admin.</p>
          <p>Silakan hubungi WhatsApp Admin {settings.admin_whatsapp} untuk informasi pendaftaran paket terbaru.</p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 gap-6 ${
            displayPackages.length >= 3
              ? 'lg:grid-cols-3'
              : displayPackages.length === 2
              ? 'md:grid-cols-2'
              : 'max-w-lg'
          }`}
        >
          {displayPackages.map(pkg => {
            const isSelected = selectedPackageId === pkg.id;
            const pkgAllowsDiscount = pkg.allow_discount !== false;
            const pkgOrig =
              pkgAllowsDiscount && pkg.original_price && pkg.original_price > pkg.price
                ? pkg.original_price
                : pkg.price;
            const pkgAfterRef = pkgAllowsDiscount
              ? Math.max(0, pkg.price - activeReferralDiscount)
              : pkg.price;
            const featureItems =
              pkg.feature_items && pkg.feature_items.length > 0
                ? pkg.feature_items
                : pkg.features.map(f => ({ label: f, included: true }));

            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackageId(pkg.id)}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'border-blue-600 bg-white shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-300/80 bg-white shadow-sm hover:border-slate-400'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {pkg.is_recommended ? (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-700 text-white">
                        PALING HEMAT
                      </span>
                    ) : pkg.tier_key === 'INTENSIF' ? (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                        ZOOM MALAM + KALKULATOR
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        HANYA SOAL · TANPA PROMO
                      </span>
                    )}
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      {pkg.duration_days} Hari
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900">{pkg.package_name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{pkg.description}</p>

                  <div className="pt-1 space-y-1.5">
                    {pkgAllowsDiscount && pkgOrig > pkg.price ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-400 line-through font-mono">
                          Rp {pkgOrig.toLocaleString('id-ID')}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wide">
                          {pkg.promo_badge || 'PROMO TAHUN BARU'}
                        </span>
                      </div>
                    ) : !pkgAllowsDiscount ? (
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300 uppercase tracking-wide">
                        <Ban className="w-3 h-3 text-slate-500" />
                        <span>Tanpa Promo &amp; Diskon</span>
                      </div>
                    ) : null}

                    <div>
                      <span className="text-2xl font-extrabold text-blue-700 font-mono">
                        Rp {pkg.price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">/ masa aktif</span>
                    </div>

                    {pkgAllowsDiscount ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          Pakai Kode Referral hanya Rp {pkgAfterRef.toLocaleString('id-ID')} (Hemat Rp {activeReferralDiscount.toLocaleString('id-ID')}!)
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-600">
                        <span>Harga flat tanpa potongan referral maupun diskon.</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    {featureItems.map((f, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 text-xs ${
                          f.included ? 'text-slate-700' : 'text-slate-600'
                        }`}
                      >
                        {f.included ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        )}
                        <span className={f.included ? '' : 'opacity-90'}>{f.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <div
                    className={`w-full py-2 rounded-xl text-center text-xs font-bold transition-colors ${
                      isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isSelected ? 'Paket Terpilih' : 'Pilih Paket Ini'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Payment Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Referral Input, Detailed Breakdown & Payment Instructions */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-6">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            Kode Referral &amp; Rincian Pembayaran
          </h3>

          {/* Panduan & Input Kode Referral */}
          {allowsDiscount ? (
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-700 shrink-0" />
                  <div>
                    <h4 className="text-xs font-extrabold text-blue-950">
                      Gunakan Kode Referral &amp; Dapatkan Diskon Rp {activeReferralDiscount.toLocaleString('id-ID')}
                    </h4>
                    <p className="text-[11px] text-blue-800">
                      Hapus kode bawaan <strong className="font-mono">{DEFAULT_REFERRAL_CODE}</strong> dan ketik kode temanmu jika punya, lalu harga otomatis terpotong!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={referralCodeInput}
                    onChange={e => setReferralCodeInput(e.target.value.toUpperCase())}
                    placeholder="Ketik kode referral teman atau LOGINCPNS"
                    className="w-full pl-3 pr-9 py-2.5 bg-white border-2 border-blue-300 focus:border-blue-600 rounded-xl font-mono text-xs sm:text-sm font-extrabold uppercase text-blue-900 focus:outline-none"
                  />
                  {referralCodeInput && (
                    <button
                      type="button"
                      onClick={() => setReferralCodeInput('')}
                      title="Hapus kode referral untuk ganti kode lain"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {referralCodeInput.trim().toUpperCase() !== DEFAULT_REFERRAL_CODE && (
                  <button
                    type="button"
                    onClick={() => setReferralCodeInput(DEFAULT_REFERRAL_CODE)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Pakai Kode Bawaan ({DEFAULT_REFERRAL_CODE})</span>
                  </button>
                )}
              </div>

              {/* Live Referral Validation Feedback */}
              <div
                className={`p-2.5 rounded-lg border text-[11px] flex items-center gap-2 font-semibold ${
                  referralCheck.isValid
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : referralCheck.isEmpty
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {referralCheck.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{referralCheck.message}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-extrabold text-slate-900">
                <Ban className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Promo &amp; Potongan Kode Referral Tidak Berlaku pada Paket Standar</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Paket <strong>{selectedPkg.package_name}</strong> hanya melayani latihan soal dengan harga tetap{' '}
                <strong className="font-mono">Rp {selectedPkg.price.toLocaleString('id-ID')}</strong>.
                Ingin lebih hemat dan dapat Modul Lengkap PDF/Drive + Short Video? Pilih{' '}
                <button
                  type="button"
                  onClick={() => setSelectedPackageId('pkg-1')}
                  className="font-bold text-blue-700 underline cursor-pointer"
                >
                  Paket Premium (Belajar Mandiri)
                </button>{' '}
                dan dapatkan potongan <strong>Rp {activeReferralDiscount.toLocaleString('id-ID')}</strong> pakai kode referral!
              </p>
            </div>
          )}

          {/* Detail Rincian Pembayaran Lengkap */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-extrabold text-slate-900">Detail Rincian Pembayaran</span>
              <span className="font-bold text-blue-800">{selectedPkg.package_name}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Harga Asli Paket</span>
              <span className={`font-mono font-bold ${promoDiscount > 0 ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                Rp {originalPrice.toLocaleString('id-ID')}
              </span>
            </div>

            {promoDiscount > 0 && (
              <div className="flex justify-between items-center text-rose-700 font-semibold">
                <span>Diskon {selectedPkg.promo_badge || 'Promo Tahun Baru'}</span>
                <span className="font-mono font-bold">- Rp {promoDiscount.toLocaleString('id-ID')}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-700 font-semibold">
              <span>Harga Paket Aktif</span>
              <span className="font-mono font-bold">Rp {selectedPkg.price.toLocaleString('id-ID')}</span>
            </div>

            <div className="flex justify-between items-center text-emerald-700 font-semibold">
              <span>
                Potongan Kode Referral{' '}
                {!allowsDiscount ? (
                  <span className="text-slate-500 font-normal">(Tidak berlaku)</span>
                ) : referralCheck.isValid && referralCheck.normalizedCode ? (
                  <span className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded text-[10px] border border-emerald-300">
                    {referralCheck.normalizedCode}
                  </span>
                ) : (
                  '(Tidak ada kode)'
                )}
              </span>
              <span className="font-mono font-bold">
                {referralDiscount > 0 ? `- Rp ${referralDiscount.toLocaleString('id-ID')}` : 'Rp 0'}
              </span>
            </div>

            <div className="border-t-2 border-dashed border-slate-300 pt-2.5 flex justify-between items-center">
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">
                  Selisih / Total yang Harus Dibayar
                </span>
                <span className="text-[10px] text-slate-500">
                  Total hemat Anda: Rp {(promoDiscount + referralDiscount).toLocaleString('id-ID')}
                </span>
              </div>
              <span className="font-mono text-xl font-extrabold text-blue-700">
                Rp {finalPayableAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Pilih Metode Pembayaran:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFER_BANK')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'TRANSFER_BANK'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold ring-1 ring-blue-500'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <span className="text-[11px] block">Transfer Bank</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'QRIS'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold ring-1 ring-blue-500'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <QrCode className="w-4 h-4 mx-auto mb-1 text-sky-600" />
                <span className="text-[11px] block">QRIS</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('COD_WHATSAPP')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'COD_WHATSAPP'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold ring-1 ring-blue-500'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Phone className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                <span className="text-[11px] block">Tunai/COD WA</span>
              </button>
            </div>
          </div>

          {/* Bank Accounts details */}
          {paymentMethod === 'TRANSFER_BANK' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Transfer tepat sebesar <strong className="text-blue-700 font-mono">Rp {finalPayableAmount.toLocaleString('id-ID')}</strong> ke Rekening Tujuan:
              </span>
              {settings.bank_accounts.slice(0, 2).map((bank, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center gap-3">
                  <div>
                    <strong className="text-slate-900 block text-xs sm:text-sm">{bank.bank_name}</strong>
                    <span className="font-mono text-sm sm:text-base font-extrabold text-blue-700 tracking-wide">
                      {bank.account_number}
                    </span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">
                      a.n. <strong className="text-slate-800">{bank.account_holder}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(bank.account_number);
                      setCopiedIdx(i);
                      setTimeout(() => setCopiedIdx(null), 2000);
                    }}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1 shrink-0 transition-colors cursor-pointer ${
                      copiedIdx === i
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    {copiedIdx === i ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin No. Rek</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {paymentMethod === 'QRIS' && (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-36 h-36 bg-white p-2 rounded-xl mx-auto border border-slate-300 flex items-center justify-center">
                <QrCode className="w-28 h-28 text-slate-800" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">QRIS LOGIN CPNS EDUKASI</p>
                <p className="text-[11px] text-slate-600">
                  Nominal bayar: <strong className="font-mono text-blue-700">Rp {finalPayableAmount.toLocaleString('id-ID')}</strong>
                </p>
                <p className="text-[11px] text-slate-500">Mendukung GoPay, OVO, Dana, ShopeePay, BSI Mobile &amp; Seluruh Bank</p>
              </div>
            </div>
          )}

          {paymentMethod === 'COD_WHATSAPP' && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs text-emerald-950">
              <p className="font-bold">
                Konfirmasi Pembayaran Tunai / COD sebesar Rp {finalPayableAmount.toLocaleString('id-ID')} ke WhatsApp Admin:
              </p>
              <div className="p-3 bg-white rounded-lg border border-emerald-300 font-mono text-sm font-extrabold text-emerald-700">
                {settings.admin_whatsapp}
              </div>
              <p className="text-[11px] text-emerald-800">
                Sesuai PRD Section 13.4: &quot;Tunai/COD dengan konfirmasi ke nomor admin 081312139893.&quot;
              </p>
            </div>
          )}
        </div>

        {/* Right: Upload Bukti Form */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-5">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            Upload Bukti Pembayaran
          </h3>

          {isSubmittedNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Bukti transfer berhasil dikirim! Menunggu verifikasi admin.</span>
            </div>
          )}

          {uploadError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Ringkasan Tagihan Ringkas di Form */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-600 block">Total yang ditransfer:</span>
              {allowsDiscount && referralCheck.isValid && (
                <span className="text-[10px] font-bold text-emerald-700">
                  Kode {referralCheck.normalizedCode} (-Rp {referralDiscount.toLocaleString('id-ID')}) aktif
                </span>
              )}
              {!allowsDiscount && (
                <span className="text-[10px] font-bold text-slate-500">
                  Harga flat Paket Standar (Tanpa diskon)
                </span>
              )}
            </div>
            <span className="font-mono text-lg font-extrabold text-blue-700">
              Rp {finalPayableAmount.toLocaleString('id-ID')}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Nama Pengirim / Pemilik Rekening</label>
              <input
                type="text"
                value={senderName}
                onChange={e => setSenderName(e.target.value)}
                placeholder="Nama yang tertera pada bukti transfer"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Bank Asal Pengirim (Jika transfer)</label>
              <input
                type="text"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                placeholder="Misal: BSI, Bank BPD Aceh, BCA, Mandiri, BRI"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tombol Upload Bukti Transfer (Gambar / PDF) */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Upload Bukti Transfer (Gambar / PDF)
              </label>

              {!proofUrl ? (
                <label className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-500 transition-all cursor-pointer text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="inline-block px-3.5 py-1.5 bg-blue-700 text-white font-bold rounded-lg text-xs shadow-2xs">
                      Pilih File Gambar / PDF
                    </span>
                    <p className="text-[11px] text-slate-500 pt-1">
                      Mendukung foto struk / screenshot (JPG, PNG) atau file PDF (Maks. 3 MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2.5">
                  {proofFileType === 'IMAGE' ? (
                    <div className="rounded-lg overflow-hidden border border-slate-200 bg-white max-h-44 flex items-center justify-center">
                      <img
                        src={proofUrl}
                        alt="Pratinjau Bukti Transfer"
                        className="max-h-44 w-auto object-contain"
                      />
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-900 block truncate">{proofFileName}</span>
                        <span className="text-[10px] text-slate-500">Dokumen PDF siap dikirim</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold truncate">
                      {proofFileType === 'IMAGE' ? (
                        <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span className="truncate">{proofFileName}</span>
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="px-2.5 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer">
                        Ganti
                        <input
                          type="file"
                          accept="image/*,.pdf,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleClearFile}
                        className="p-1 rounded-md bg-white border border-red-200 hover:bg-red-50 text-red-600 cursor-pointer"
                        title="Hapus file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Kirim Bukti Pembayaran (Rp {finalPayableAmount.toLocaleString('id-ID')})</span>
            </button>
          </form>

          {/* Mandatory PRD Policy Note */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700" /> Ketentuan Verifikasi Admin:
            </span>
            <p className="leading-snug">
              Aktivasi premium dilakukan secara manual oleh Admin setelah memeriksa bukti pembayaran yang Anda unggah.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
          Riwayat Pengajuan Pembayaran Anda
        </h3>

        {userPayments.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500">
            Belum ada riwayat pengajuan pembayaran.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Paket</th>
                  <th className="py-2.5 px-3">Kode Referral</th>
                  <th className="py-2.5 px-3 font-mono">Total Bayar</th>
                  <th className="py-2.5 px-3">Metode</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Catatan / Verifikator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userPayments.map(p => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {new Date(p.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{p.package_name}</td>
                    <td className="py-2.5 px-3">
                      {p.referral_code ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold text-[10px]">
                          {p.referral_code} (-Rp {(p.referral_discount || 0).toLocaleString('id-ID')})
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                      Rp {p.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{p.payment_method}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          p.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : p.status === 'REJECTED'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {p.status === 'APPROVED'
                          ? 'DISETUJUI'
                          : p.status === 'REJECTED'
                          ? 'DITOLAK'
                          : 'MENUNGGU VERIFIKASI'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {p.verified_by
                        ? `Diverifikasi oleh: ${p.verified_by}`
                        : p.rejection_reason || 'Sedang diproses admin'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
