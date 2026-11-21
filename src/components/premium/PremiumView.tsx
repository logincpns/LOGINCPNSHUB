import React, { useState, useEffect } from 'react';
import {
  useApp,
  DEFAULT_REFERRAL_CODE,
  REFERRAL_DISCOUNT_AMOUNT,
  getMembershipDisplayLabel,
  calculatePackagePricing,
  hasUserUsedReferralCode,
  resolvePackageTier,
  getMembershipTierRank
} from '../../context/AppContext';
import { PaymentChannelConfig } from '../../types';
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
  Ban,
  Wallet,
  Download,
  ZoomIn
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

  const effectiveCurrentTier =
    currentUser?.role === 'SUPER_ADMIN' ? 'FREE' : currentUser?.membership_type || 'FREE';
  const currentTierRank = getMembershipTierRank(effectiveCurrentTier);
  const isAlreadyHighestTier = effectiveCurrentTier === 'INTENSIF';

  const findPreferredDefaultPkgId = (): string => {
    if (preferredUpgradePackageId) {
      const prefPkg = displayPackages.find(p => p.id === preferredUpgradePackageId);
      if (prefPkg && getMembershipTierRank(resolvePackageTier(prefPkg)) > currentTierRank) {
        return prefPkg.id;
      }
    }
    const firstUpgradePkg = displayPackages.find(
      p => getMembershipTierRank(resolvePackageTier(p)) > currentTierRank
    );
    if (firstUpgradePkg) return firstUpgradePkg.id;
    return displayPackages.find(p => p.id === 'pkg-1')?.id || displayPackages[0]?.id || 'pkg-1';
  };

  const [selectedPackageId, setSelectedPackageId] = useState<string>(findPreferredDefaultPkgId);
  const [referralCodeInput, setReferralCodeInput] = useState<string>(
    currentUser?.registered_referral_code || DEFAULT_REFERRAL_CODE
  );
  const [paymentMethod, setPaymentMethod] = useState<'TRANSFER_BANK' | 'EWALLET' | 'QRIS' | 'COD_WHATSAPP'>('TRANSFER_BANK');
  const [bankName, setBankName] = useState<string>('');
  const [senderName, setSenderName] = useState<string>(currentUser?.full_name || '');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [proofFileName, setProofFileName] = useState<string>('');
  const [proofFileType, setProofFileType] = useState<'IMAGE' | 'PDF' | ''>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [qrZoomPreview, setQrZoomPreview] = useState<{ url: string; title: string } | null>(null);
  const [isSubmittedNotice, setIsSubmittedNotice] = useState(false);

  const copyPaymentText = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const allPaymentChannels: PaymentChannelConfig[] =
    settings.payment_channels && settings.payment_channels.length > 0
      ? settings.payment_channels
      : settings.bank_accounts.map((b, idx) => ({
          id: `legacy-bank-${idx}`,
          category: 'BANK' as const,
          provider_name: b.bank_name,
          account_number: b.account_number,
          account_holder: b.account_holder,
          is_active: true
        }));

  const activeBankChannels = allPaymentChannels.filter(c => c.category === 'BANK' && c.is_active);
  const activeEwalletChannels = allPaymentChannels.filter(c => c.category === 'EWALLET' && c.is_active);
  const activeQrisChannels = allPaymentChannels.filter(c => c.category === 'QRIS' && c.is_active);
  const activeCodChannels = allPaymentChannels.filter(c => c.category === 'COD' && c.is_active);
  const activeNonCashPhone = settings.non_cash_phone || settings.admin_whatsapp;
  const activeMainQrisUrl =
    settings.qris_image_url || activeQrisChannels.find(c => c.qr_image_url)?.qr_image_url || '';

  // Sync preferred upgrade package when redirected from locked menu
  useEffect(() => {
    if (preferredUpgradePackageId && displayPackages.some(p => p.id === preferredUpgradePackageId)) {
      setSelectedPackageId(preferredUpgradePackageId);
      setPreferredUpgradePackageId(null);
    }
  }, [preferredUpgradePackageId, displayPackages, setPreferredUpgradePackageId]);

  // Ensure selectedPackageId remains valid & points to an available upgrade if user already has a paid tier
  useEffect(() => {
    if (displayPackages.length === 0) return;
    const currentSel = displayPackages.find(p => p.id === selectedPackageId);
    const selRank = currentSel ? getMembershipTierRank(resolvePackageTier(currentSel)) : -1;
    if (!currentSel || (currentTierRank > 0 && !isAlreadyHighestTier && selRank <= currentTierRank)) {
      const nextUpgrade = displayPackages.find(
        p => getMembershipTierRank(resolvePackageTier(p)) > currentTierRank
      );
      if (nextUpgrade) {
        setSelectedPackageId(nextUpgrade.id);
      } else if (!currentSel) {
        setSelectedPackageId(displayPackages[0].id);
      }
    }
  }, [displayPackages, selectedPackageId, currentTierRank, isAlreadyHighestTier]);

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
  const alreadyUsedReferral = hasUserUsedReferralCode(currentUser?.id, payments);

  // Pricing breakdown calculations (supports package upgrade selisih & 1x referral lock)
  const referralCheck = validateReferralCode(referralCodeInput, currentUser?.id);
  const pricing = calculatePackagePricing(selectedPkg, currentUser, packages, payments, referralCheck);
  const allowsDiscount = pricing.referralAllowed;
  const originalPrice = pricing.targetOriginalPrice;
  const promoDiscount = pricing.promoDiscount;
  const referralDiscount = pricing.referralDiscount;
  const finalPayableAmount = pricing.finalPayableAmount;

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

    if (pricing.isCurrentOrLowerTier) {
      setUploadError('Paket yang dipilih sudah Anda miliki atau setara dengan paket aktif Anda saat ini.');
      return;
    }

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
          : paymentMethod === 'EWALLET'
          ? 'Non-Tunai / E-Wallet'
          : paymentMethod === 'COD_WHATSAPP'
          ? 'Tunai/COD WA'
          : 'Transfer Bank'),
      senderName.trim(),
      proofUrl,
      pricing.referralAllowed && referralCheck.isValid ? referralCheck.normalizedCode : undefined
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
            const cardPricing = calculatePackagePricing(pkg, currentUser, packages, payments, null);
            const isSelected = selectedPackageId === pkg.id;
            const isDisabledCard = cardPricing.isCurrentOrLowerTier;
            const pkgAllowsDiscount = cardPricing.referralAllowed;
            const pkgOrig = cardPricing.targetOriginalPrice;
            const pkgAfterRef = pkgAllowsDiscount
              ? Math.max(0, pkg.price - activeReferralDiscount)
              : cardPricing.finalPayableAmount;
            const featureItems =
              pkg.feature_items && pkg.feature_items.length > 0
                ? pkg.feature_items
                : pkg.features.map(f => ({ label: f, included: true }));

            return (
              <div
                key={pkg.id}
                onClick={() => {
                  if (!isDisabledCard) setSelectedPackageId(pkg.id);
                }}
                className={`p-6 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-4 ${
                  isDisabledCard
                    ? 'border-slate-200 bg-slate-50/80 opacity-85 cursor-default'
                    : isSelected
                    ? 'border-blue-600 bg-white shadow-md ring-2 ring-blue-500/20 cursor-pointer'
                    : 'border-slate-300/80 bg-white shadow-sm hover:border-slate-400 cursor-pointer'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {cardPricing.isUpgrade ? (
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-indigo-700 text-white">
                        PERALIHAN DARI {cardPricing.previousTier}
                      </span>
                    ) : cardPricing.targetTier === effectiveCurrentTier && currentTierRank > 0 ? (
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-emerald-600 text-white">
                        PAKET AKTIF ANDA
                      </span>
                    ) : pkg.is_recommended ? (
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
                    {cardPricing.isUpgrade ? (
                      <>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-slate-500 font-semibold">Harga Asli:</span>
                          <span className="font-bold text-slate-500 line-through font-mono">
                            Rp {pkgOrig.toLocaleString('id-ID')}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Selisih Paket
                          </span>
                        </div>
                        <div>
                          <span className="text-2xl font-extrabold text-indigo-700 font-mono">
                            Rp {cardPricing.finalPayableAmount.toLocaleString('id-ID')}
                          </span>
                          <span className="text-xs text-slate-500 ml-1">/ selisih naik paket</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-[11px] font-bold text-indigo-900">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>
                            Dikurangi Paket {cardPricing.previousTier} (-Rp{' '}
                            {cardPricing.upgradeCreditAmount.toLocaleString('id-ID')}) · Tanpa referral 2x
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        {pkg.allow_discount !== false && pkgOrig > pkg.price ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-slate-400 line-through font-mono">
                              Rp {pkgOrig.toLocaleString('id-ID')}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wide">
                              {pkg.promo_badge || 'PROMO TAHUN BARU'}
                            </span>
                          </div>
                        ) : pkg.allow_discount === false ? (
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

                        {pkg.allow_discount === false ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-600">
                            <span>Harga flat tanpa potongan referral maupun diskon.</span>
                          </div>
                        ) : alreadyUsedReferral ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-900">
                            <span>Kode referral sudah pernah dipakai (maksimal 1x).</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>
                              Pakai Kode Referral hanya Rp {pkgAfterRef.toLocaleString('id-ID')} (Hemat Rp {activeReferralDiscount.toLocaleString('id-ID')}!)
                            </span>
                          </div>
                        )}
                      </>
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
                      isDisabledCard
                        ? 'bg-slate-200 text-slate-600'
                        : isSelected
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {cardPricing.targetTier === effectiveCurrentTier && currentTierRank > 0
                      ? 'Paket Aktif Anda Saat Ini'
                      : isDisabledCard
                      ? 'Sudah Termasuk di Paket Anda'
                      : isSelected
                      ? cardPricing.isUpgrade
                        ? 'Peralihan Paket Terpilih'
                        : 'Paket Terpilih'
                      : cardPricing.isUpgrade
                      ? `Beralih ke Paket Ini (Rp ${cardPricing.finalPayableAmount.toLocaleString('id-ID')})`
                      : 'Pilih Paket Ini'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Payment Section */}
      {isAlreadyHighestTier ? (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-extrabold">
                Anda Sudah Berada di Paket Tertinggi (Paket Intensif Bimbel)
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Seluruh fasilitas lengkap (Simulasi CAT 110 Soal, Modul PDF/Drive, Short Video, Zoom Bimbel Malam, dan Kalkulator SKD &amp; SKB) sudah aktif di akun Anda.
              </p>
            </div>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Referral Input, Detailed Breakdown & Payment Instructions */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-6">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            {pricing.isUpgrade
              ? 'Rincian Peralihan Paket & Selisih Pembayaran'
              : 'Kode Referral & Rincian Pembayaran'}
          </h3>

          {/* Panduan & Input Kode Referral / Info Peralihan Paket */}
          {pricing.isUpgrade ? (
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2 text-xs text-indigo-950">
              <div className="flex items-center gap-2 font-extrabold text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-700 shrink-0" />
                <span>
                  Peralihan Paket: {pricing.previousPackageName} &rarr; {selectedPkg.package_name}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-indigo-900">
                Harga otomatis menyesuaikan <strong>selisih dari harga asli paket tujuan</strong> (Rp{' '}
                {originalPrice.toLocaleString('id-ID')}) dikurangi paket Anda saat ini (-Rp{' '}
                {pricing.upgradeCreditAmount.toLocaleString('id-ID')}). Kode referral tidak dapat digunakan kembali (maksimal 1x).
              </p>
            </div>
          ) : alreadyUsedReferral ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-1.5 text-xs text-amber-950">
              <div className="flex items-center gap-2 font-extrabold text-amber-900">
                <Ban className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Kode Referral Sudah Pernah Digunakan (Maksimal 1x)</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Akun Anda sudah pernah menggunakan potongan kode referral pada transaksi sebelumnya, sehingga kode referral tidak dapat digunakan untuk kedua kalinya.
              </p>
            </div>
          ) : allowsDiscount ? (
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
              <span>{pricing.isUpgrade ? `Harga Asli Paket Tujuan (${selectedPkg.package_name})` : 'Harga Asli Paket'}</span>
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

            {pricing.isUpgrade ? (
              <div className="flex justify-between items-center text-indigo-700 font-semibold">
                <span>Dikurangi Paket Anda Saat Ini ({pricing.previousPackageName})</span>
                <span className="font-mono font-bold">
                  - Rp {pricing.upgradeCreditAmount.toLocaleString('id-ID')}
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center text-slate-700 font-semibold">
                <span>Harga Paket Aktif</span>
                <span className="font-mono font-bold">Rp {selectedPkg.price.toLocaleString('id-ID')}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-emerald-700 font-semibold">
              <span>
                Potongan Kode Referral{' '}
                {pricing.isUpgrade ? (
                  <span className="text-slate-500 font-normal">(Tidak berlaku saat peralihan paket)</span>
                ) : alreadyUsedReferral ? (
                  <span className="text-slate-500 font-normal">(Sudah dipakai 1x)</span>
                ) : !allowsDiscount ? (
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
                  {pricing.isUpgrade
                    ? `Total pengurangan paket sebelumnya: Rp ${pricing.upgradeCreditAmount.toLocaleString('id-ID')}`
                    : `Total hemat Anda: Rp ${(promoDiscount + referralDiscount).toLocaleString('id-ID')}`}
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                onClick={() => setPaymentMethod('EWALLET')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'EWALLET'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold ring-1 ring-blue-500'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Wallet className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                <span className="text-[11px] block">E-Wallet / No. HP</span>
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
                <span className="text-[11px] block">QRIS / Scan QR</span>
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
                <Phone className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                <span className="text-[11px] block">Tunai / COD WA</span>
              </button>
            </div>
          </div>

          {/* Bank Accounts details */}
          {paymentMethod === 'TRANSFER_BANK' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Transfer tepat sebesar <strong className="text-blue-700 font-mono">Rp {finalPayableAmount.toLocaleString('id-ID')}</strong> ke Rekening Tujuan:
              </span>
              {activeBankChannels.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                  Belum ada rekening bank aktif. Silakan gunakan metode pembayaran E-Wallet, QRIS, atau hubungi WhatsApp Admin {settings.admin_whatsapp}.
                </div>
              ) : (
                activeBankChannels.map((bank, i) => (
                  <div key={bank.id || i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <strong className="text-slate-900 block text-xs sm:text-sm">{bank.provider_name}</strong>
                      <span className="font-mono text-sm sm:text-base font-extrabold text-blue-700 tracking-wide block">
                        {bank.account_number}
                      </span>
                      <span className="text-[11px] text-slate-600 block">
                        a.n. <strong className="text-slate-800">{bank.account_holder}</strong>
                      </span>
                      {bank.instructions && (
                        <span className="text-[10px] text-slate-500 block">{bank.instructions}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {bank.qr_image_url && (
                        <button
                          type="button"
                          onClick={() =>
                            setQrZoomPreview({
                              url: bank.qr_image_url!,
                              title: `QR ${bank.provider_name}`
                            })
                          }
                          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 cursor-pointer"
                          title="Lihat QR Code"
                        >
                          <QrCode className="w-4 h-4 text-sky-700" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          copyPaymentText(`bank-${bank.id || i}`, bank.account_number);
                          if (!bankName.trim()) setBankName(bank.provider_name);
                        }}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1 shrink-0 transition-colors cursor-pointer ${
                          copiedKey === `bank-${bank.id || i}`
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
                        }`}
                      >
                        {copiedKey === `bank-${bank.id || i}` ? (
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
                  </div>
                ))
              )}
            </div>
          )}

          {/* E-Wallet / Non-Tunai (DANA, OVO, GoPay, No. HP) */}
          {paymentMethod === 'EWALLET' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Transfer Non-Tunai sebesar <strong className="text-emerald-700 font-mono">Rp {finalPayableAmount.toLocaleString('id-ID')}</strong> ke Nomor HP / E-Wallet Tujuan:
              </span>

              {activeEwalletChannels.length > 0 ? (
                activeEwalletChannels.map((ew, i) => (
                  <div key={ew.id || i} className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs flex justify-between items-center gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                        {ew.provider_name}
                      </span>
                      <span className="font-mono text-sm sm:text-base font-extrabold text-emerald-800 tracking-wide block pt-0.5">
                        {ew.account_number}
                      </span>
                      <span className="text-[11px] text-slate-600 block">
                        a.n. <strong className="text-slate-800">{ew.account_holder}</strong>
                      </span>
                      {ew.instructions && (
                        <span className="text-[10px] text-slate-500 block">{ew.instructions}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {ew.qr_image_url && (
                        <button
                          type="button"
                          onClick={() =>
                            setQrZoomPreview({
                              url: ew.qr_image_url!,
                              title: `QR ${ew.provider_name}`
                            })
                          }
                          className="p-1.5 rounded-lg bg-white border border-emerald-200 hover:border-emerald-400 cursor-pointer"
                          title="Lihat QR Code"
                        >
                          <QrCode className="w-4 h-4 text-emerald-700" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          copyPaymentText(`ew-${ew.id || i}`, ew.account_number);
                          setBankName(ew.provider_name);
                        }}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1 shrink-0 transition-colors cursor-pointer ${
                          copiedKey === `ew-${ew.id || i}`
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                        }`}
                      >
                        {copiedKey === `ew-${ew.id || i}` ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin No. HP</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : null}

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Nomor HP Utama Pembayaran Non-Tunai
                  </span>
                  <span className="font-mono text-sm font-extrabold text-slate-900">
                    {activeNonCashPhone}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyPaymentText('non-cash-main', activeNonCashPhone)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1 shrink-0 transition-colors cursor-pointer ${
                    copiedKey === 'non-cash-main'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {copiedKey === 'non-cash-main' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Nomor</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {paymentMethod === 'QRIS' && (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
              {activeMainQrisUrl ? (
                <div className="space-y-2.5">
                  <div
                    onClick={() =>
                      setQrZoomPreview({
                        url: activeMainQrisUrl,
                        title: settings.qris_merchant_name || 'QRIS Pembayaran LOGIN CPNS'
                      })
                    }
                    className="max-w-xs bg-white p-3 rounded-2xl mx-auto border border-slate-300 shadow-2xs cursor-zoom-in group relative"
                  >
                    <img
                      src={activeMainQrisUrl}
                      alt="QR Code Pembayaran"
                      className="w-full max-h-64 object-contain mx-auto rounded-lg"
                    />
                    <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-blue-700">
                      <ZoomIn className="w-3 h-3" /> Ketuk gambar untuk memperbesar QR
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <a
                      href={activeMainQrisUrl}
                      download="QRIS_Pembayaran_LOGINCPNS.png"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Simpan Gambar QR</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="w-36 h-36 bg-white p-2 rounded-xl mx-auto border border-slate-300 flex flex-col items-center justify-center gap-1">
                  <QrCode className="w-24 h-24 text-slate-800" />
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {settings.qris_merchant_name || 'QRIS LOGIN CPNS EDUKASI'}
                </p>
                <p className="text-[11px] text-slate-600">
                  Nominal bayar: <strong className="font-mono text-blue-700">Rp {finalPayableAmount.toLocaleString('id-ID')}</strong>
                </p>
                <p className="text-[11px] text-slate-500">
                  {settings.qris_notes || 'Mendukung GoPay, OVO, DANA, ShopeePay, BSI Mobile & Seluruh Bank'}
                </p>
              </div>

              {activeQrisChannels.length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-2 text-left">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    QR Code Pembayaran Lainnya:
                  </span>
                  {activeQrisChannels.map((qc, idx) => (
                    <div
                      key={qc.id || idx}
                      className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <strong className="text-slate-900 block">{qc.provider_name}</strong>
                        <span className="text-[11px] text-slate-600 block">
                          a.n. {qc.account_holder} {qc.account_number ? `(${qc.account_number})` : ''}
                        </span>
                        {qc.instructions && (
                          <span className="text-[10px] text-slate-500 block">{qc.instructions}</span>
                        )}
                      </div>
                      {qc.qr_image_url && (
                        <button
                          type="button"
                          onClick={() =>
                            setQrZoomPreview({
                              url: qc.qr_image_url!,
                              title: qc.provider_name
                            })
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-[11px] shrink-0 cursor-pointer inline-flex items-center gap-1"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>Lihat QR</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'COD_WHATSAPP' && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2.5 text-xs text-emerald-950">
              <p className="font-bold">
                Konfirmasi Pembayaran Tunai / COD sebesar <span className="font-mono">Rp {finalPayableAmount.toLocaleString('id-ID')}</span> ke WhatsApp / No. HP Admin:
              </p>
              <div className="p-3 bg-white rounded-lg border border-emerald-300 flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-extrabold text-emerald-700">
                  {activeNonCashPhone}
                </span>
                <button
                  type="button"
                  onClick={() => copyPaymentText('cod-phone', activeNonCashPhone)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'cod-phone' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'cod-phone' ? 'Tersalin' : 'Salin No. HP'}</span>
                </button>
              </div>
              {activeCodChannels.map((cod, idx) => (
                <div key={cod.id || idx} className="p-2.5 bg-white rounded-lg border border-emerald-200">
                  <strong className="text-slate-900 block">{cod.provider_name}</strong>
                  <span className="font-mono font-bold text-emerald-700">{cod.account_number}</span>
                  <span className="text-[11px] text-slate-600 ml-1">a.n. {cod.account_holder}</span>
                  {cod.instructions && <p className="text-[10px] text-slate-500 mt-0.5">{cod.instructions}</p>}
                </div>
              ))}
              <p className="text-[11px] text-emerald-800">
                Setelah konfirmasi atau melakukan pembayaran langsung bersama admin, unggah bukti konfirmasi/kwitansi di formulir sebelah agar status paket Anda segera diaktifkan.
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
              {pricing.isUpgrade ? (
                <span className="text-[10px] font-bold text-indigo-700">
                  Selisih peralihan dari {pricing.previousTier} (Asli Rp {originalPrice.toLocaleString('id-ID')} - Rp{' '}
                  {pricing.upgradeCreditAmount.toLocaleString('id-ID')})
                </span>
              ) : allowsDiscount && referralCheck.isValid ? (
                <span className="text-[10px] font-bold text-emerald-700">
                  Kode {referralCheck.normalizedCode} (-Rp {referralDiscount.toLocaleString('id-ID')}) aktif
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-500">
                  {alreadyUsedReferral ? 'Kode referral maksimal 1x per akun' : 'Harga flat (Tanpa diskon)'}
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
              <label className="font-bold text-slate-700">Bank / Media Asal Pengirim</label>
              <input
                type="text"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                placeholder="Misal: BSI, BCA, DANA, OVO, GoPay, QRIS"
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
              {pricing.isUpgrade
                ? 'Peralihan dan kenaikan status paket belajar dilakukan secara manual oleh Admin setelah memeriksa bukti pembayaran selisih yang Anda unggah.'
                : 'Aktivasi premium dilakukan secara manual oleh Admin setelah memeriksa bukti pembayaran yang Anda unggah.'}
            </p>
          </div>
        </div>
      </div>
      )}

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
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div>{p.package_name}</div>
                      {p.is_package_upgrade && (
                        <div className="text-[10px] font-bold text-indigo-700 mt-0.5">
                          Peralihan dari {p.previous_package_name || p.previous_membership_type} · Asli Rp{' '}
                          {(p.original_amount ?? p.amount).toLocaleString('id-ID')} - Rp{' '}
                          {(p.upgrade_credit_amount || 0).toLocaleString('id-ID')}
                        </div>
                      )}
                    </td>
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
                    <td className="py-2.5 px-3 text-slate-600">
                      {p.payment_method === 'EWALLET'
                        ? `E-Wallet${p.bank_name ? ` (${p.bank_name})` : ''}`
                        : p.payment_method === 'TRANSFER_BANK'
                        ? `Transfer Bank${p.bank_name ? ` (${p.bank_name})` : ''}`
                        : p.payment_method}
                    </td>
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

      {qrZoomPreview && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setQrZoomPreview(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-900">{qrZoomPreview.title}</h4>
              <button
                type="button"
                onClick={() => setQrZoomPreview(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 bg-slate-50 flex flex-col items-center gap-3">
              <img
                src={qrZoomPreview.url}
                alt={qrZoomPreview.title}
                className="w-full max-h-[65vh] object-contain bg-white p-2 rounded-xl border border-slate-200"
              />
              <a
                href={qrZoomPreview.url}
                download="QR_Pembayaran_LOGINCPNS.png"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Simpan Gambar QR</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
