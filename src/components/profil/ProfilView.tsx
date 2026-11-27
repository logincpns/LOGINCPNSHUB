import React, { useState, useEffect, useRef } from 'react';
import {
  useApp,
  AFFILIATE_COMMISSION_AMOUNT,
  REFERRAL_DISCOUNT_AMOUNT,
  MIN_COMMISSION_WITHDRAWAL,
  OFFICIAL_SENDER_EMAIL,
  getMembershipDisplayLabel,
  hashUserPassword
} from '../../context/AppContext';
import {
  CheckCircle2,
  Save,
  Camera,
  Upload,
  X,
  ZoomIn,
  User as UserIcon,
  Handshake,
  Copy,
  Check,
  Wallet,
  Banknote,
  Users,
  Clock,
  Share2,
  MessageCircle,
  Edit3,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Mail,
  ShieldCheck,
  FileText,
  LayoutDashboard,
  XCircle,
  Lock,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Briefcase,
  MapPin,
  Calendar,
  LogOut,
  Crop
} from 'lucide-react';
import { PhotoCropModal } from './PhotoCropModal';

const PROMO_MEDIA_OPTIONS = [
  'WA Grup',
  'Ajakan Langsung',
  'Status Media Sosial',
  'Facebook (FB)',
  'Instagram (IG)',
  'TikTok',
  'Telegram / Komunitas Belajar',
  'YouTube',
  'Lainnya'
];

export const ProfilView: React.FC = () => {
  const {
    currentUser,
    users,
    packages,
    payments,
    commissionWithdrawals,
    emailLogs,
    settings,
    setActiveView,
    updateCurrentUserProfile,
    joinAffiliateProgram,
    updateAffiliateReferralCode,
    requestCommissionWithdrawal,
    markEmailLogRead,
    markAllMyEmailsRead,
    logout
  } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const senderEmail = settings.admin_email || OFFICIAL_SENDER_EMAIL;
  const activeCommissionAmount = settings.affiliate_commission_amount ?? AFFILIATE_COMMISSION_AMOUNT;
  const activeReferralDiscount = settings.referral_discount_amount ?? REFERRAL_DISCOUNT_AMOUNT;
  const activeMinWithdrawal = settings.min_commission_withdrawal ?? MIN_COMMISSION_WITHDRAWAL;

  // Panel Switcher: Panel Member vs Panel Mitra Afiliasi
  const [activePanel, setActivePanel] = useState<'MEMBER' | 'MITRA'>('MEMBER');
  const [memberSubTab, setMemberSubTab] = useState<'PROFIL' | 'EMAIL_INBOX'>('PROFIL');
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);

  // Profile form states
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [targetAgency, setTargetAgency] = useState(currentUser?.targetAgency || '');
  const [targetFormation, setTargetFormation] = useState(currentUser?.targetFormation || '');
  const [education, setEducation] = useState(currentUser?.education || '');
  const [currentJob, setCurrentJob] = useState(currentUser?.current_job || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [age, setAge] = useState(currentUser?.age ? String(currentUser.age) : '');
  const [photoUrl, setPhotoUrl] = useState(currentUser?.photo_url || '');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [profileError, setProfileError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [photoNotice, setPhotoNotice] = useState('');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);

  // Affiliate join / edit referral code states
  const suggestedCode = currentUser
    ? `${currentUser.full_name.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8) || 'MITRA'}26`
    : 'MITRA26';
  const [desiredCode, setDesiredCode] = useState(suggestedCode);
  const [selectedPromoMedia, setSelectedPromoMedia] = useState<string[]>([]);
  const [manualPromoMedia, setManualPromoMedia] = useState('');
  const [isPromoDropdownOpen, setIsPromoDropdownOpen] = useState(false);
  const promoDropdownRef = useRef<HTMLDivElement>(null);
  const [acceptedAffiliateTerms, setAcceptedAffiliateTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const [isEditingCode, setIsEditingCode] = useState(false);
  const [editCodeValue, setEditCodeValue] = useState(currentUser?.referral_code || '');
  const [affiliateFeedback, setAffiliateFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPromoText, setCopiedPromoText] = useState(false);

  // Commission withdrawal modal states
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [wdFullName, setWdFullName] = useState(currentUser?.full_name || '');
  const [wdPhone, setWdPhone] = useState(currentUser?.phone || '');
  const [wdIdentityNumber, setWdIdentityNumber] = useState('');
  const [wdBankName, setWdBankName] = useState(currentUser?.affiliate_bank_name || 'BCA');
  const [wdAccountNumber, setWdAccountNumber] = useState(currentUser?.affiliate_account_number || '');
  const [wdAccountHolder, setWdAccountHolder] = useState(currentUser?.affiliate_account_holder || currentUser?.full_name || '');
  const [wdAmount, setWdAmount] = useState<number>(activeMinWithdrawal);
  const [wdError, setWdError] = useState('');
  const [wdSuccess, setWdSuccess] = useState<{ amount: number; whatsappUrl: string; bankInfo: string } | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);

  // Close promo dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (promoDropdownRef.current && !promoDropdownRef.current.contains(event.target as Node)) {
        setIsPromoDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync form states when switching accounts or updating profile
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name);
      setEmail(currentUser.email);
      setPhone(currentUser.phone);
      setTargetAgency(currentUser.targetAgency || '');
      setTargetFormation(currentUser.targetFormation || '');
      setEducation(currentUser.education || '');
      setCurrentJob(currentUser.current_job || '');
      setAddress(currentUser.address || '');
      setAge(currentUser.age ? String(currentUser.age) : '');
      setPhotoUrl(currentUser.photo_url);
      setEditCodeValue(currentUser.referral_code || '');
      setDesiredCode(
        currentUser.referral_code ||
          `${currentUser.full_name.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8) || 'MITRA'}26`
      );
      if (currentUser.affiliate_motivation) {
        const parts = currentUser.affiliate_motivation.split(' | Catatan Manual: ');
        const checkedCandidates = parts[0]
          .split(',')
          .map(s => s.trim())
          .filter(s => PROMO_MEDIA_OPTIONS.includes(s));
        setSelectedPromoMedia(checkedCandidates);
        if (parts[1]) {
          setManualPromoMedia(parts[1].trim());
        } else if (checkedCandidates.length === 0) {
          setManualPromoMedia(currentUser.affiliate_motivation);
        } else {
          setManualPromoMedia('');
        }
      } else {
        setSelectedPromoMedia([]);
        setManualPromoMedia('');
      }
      setWdFullName(currentUser.full_name);
      setWdPhone(currentUser.phone);
      setWdBankName(currentUser.affiliate_bank_name || 'BCA');
      setWdAccountNumber(currentUser.affiliate_account_number || '');
      setWdAccountHolder(currentUser.affiliate_account_holder || currentUser.full_name);
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    fullName || currentUser.full_name
  )}&background=2563eb&color=fff&size=256`;

  const affiliateStatus =
    currentUser.affiliate_status || (currentUser.is_affiliate ? 'APPROVED' : 'NONE');
  const isApprovedAffiliate = currentUser.is_affiliate && affiliateStatus === 'APPROVED';

  // Transactional Email Logs for current user
  const myEmailLogs = emailLogs
    .filter(
      log =>
        log.recipient_user_id === currentUser.id ||
        log.recipient_email.toLowerCase() === currentUser.email.toLowerCase()
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const unreadEmailCount = myEmailLogs.filter(e => !e.is_read).length;

  // Affiliate metrics for currentUser
  const myCodeUpper = currentUser.referral_code?.toUpperCase();
  const referredPayments = payments.filter(
    p =>
      p.affiliate_user_id === currentUser.id ||
      (myCodeUpper && p.referral_code && p.referral_code.toUpperCase() === myCodeUpper)
  );
  const approvedReferredPayments = referredPayments.filter(p => p.status === 'APPROVED');
  const waitingReferredPayments = referredPayments.filter(p => p.status === 'WAITING_VERIFICATION');

  const getEffectiveCommission = (p: (typeof payments)[number]) => {
    if (currentUser.role === 'SUPER_ADMIN') return p.affiliate_commission || 0;
    return p.affiliate_commission !== undefined ? p.affiliate_commission : activeCommissionAmount;
  };

  const totalEarnedCommission = approvedReferredPayments.reduce(
    (sum, p) => sum + getEffectiveCommission(p),
    0
  );
  const paidCommission = approvedReferredPayments
    .filter(p => p.commission_status === 'PAID')
    .reduce((sum, p) => sum + getEffectiveCommission(p), 0);
  const unpaidCommission = approvedReferredPayments
    .filter(p => p.commission_status !== 'PAID')
    .reduce((sum, p) => sum + getEffectiveCommission(p), 0);

  const minWithdrawProgress = Math.min(
    100,
    activeMinWithdrawal > 0 ? Math.round((unpaidCommission / activeMinWithdrawal) * 100) : 100
  );
  const canWithdraw = unpaidCommission >= activeMinWithdrawal;
  const shortageAmount = Math.max(0, activeMinWithdrawal - unpaidCommission);

  const registeredWithMyCode = users.filter(
    u =>
      u.id !== currentUser.id &&
      myCodeUpper &&
      u.registered_referral_code?.toUpperCase() === myCodeUpper
  );

  const myWithdrawals = commissionWithdrawals.filter(
    w => w.affiliate_user_id === currentUser.id
  );

  const rawAdminWa = (settings.admin_whatsapp || '081312139893').replace(/\D/g, '');
  const adminWaPhone = rawAdminWa.startsWith('0') ? `62${rawAdminWa.slice(1)}` : rawAdminWa;

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError('');
    setPhotoNotice('');
    if (!file.type.startsWith('image/')) {
      setPhotoError('Mohon pilih file gambar (JPG, PNG, WEBP).');
      e.target.value = '';
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setPhotoError('Ukuran file gambar maksimal 8 MB.');
      e.target.value = '';
      return;
    }

    setIsProcessingPhoto(true);
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        setIsProcessingPhoto(false);
        setCropSourceUrl(rawDataUrl);
      };
      img.onerror = () => {
        setIsProcessingPhoto(false);
        setPhotoError('Gagal memuat gambar. Silakan coba gambar lain.');
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      setIsProcessingPhoto(false);
      setPhotoError('Gagal membaca file gambar.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropConfirm = (croppedDataUrl: string) => {
    setPhotoUrl(croppedDataUrl);
    updateCurrentUserProfile({ photo_url: croppedDataUrl });
    setCropSourceUrl(null);
    setPhotoError('');
    setPhotoNotice('Foto profil berhasil di-crop dan diperbarui!');
    setNotice('Foto profil berhasil diperbarui!');
    setTimeout(() => {
      setPhotoNotice('');
      setNotice('');
    }, 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice('');
    setProfileError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setProfileError('Format email tidak valid. Masukkan alamat email aktif yang benar.');
      return;
    }

    const emailTakenByOther = users.some(
      u => u.id !== currentUser.id && u.email.toLowerCase() === normalizedEmail
    );
    if (emailTakenByOther) {
      setProfileError('Email tersebut sudah terdaftar pada akun peserta lain. Gunakan email lain.');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setProfileError('Password baru minimal 6 karakter.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setProfileError('Password baru dan konfirmasi password tidak cocok.');
        return;
      }
    }

    const parsedAge = age.trim() ? Number(age) : undefined;
    if (parsedAge !== undefined && (Number.isNaN(parsedAge) || parsedAge < 15 || parsedAge > 70)) {
      setProfileError('Umur harus berupa angka valid antara 15 hingga 70 tahun.');
      return;
    }

    updateCurrentUserProfile({
      full_name: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      targetAgency,
      targetFormation,
      education: education.trim() || undefined,
      current_job: currentJob.trim() || undefined,
      address: address.trim() || undefined,
      age: parsedAge,
      photo_url: photoUrl || fallbackAvatar,
      ...(newPassword ? { password_hash: hashUserPassword(newPassword) } : {})
    });

    setNotice(
      newPassword
        ? `Data profil, alamat email (${normalizedEmail}), dan password baru berhasil disimpan!`
        : `Data profil & alamat email (${normalizedEmail}) berhasil disimpan! Seluruh notifikasi transaksi dikirim dari ${senderEmail}.`
    );
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setNotice(''), 4500);
  };

  const togglePromoMediaOption = (opt: string) => {
    setSelectedPromoMedia(prev =>
      prev.includes(opt) ? prev.filter(item => item !== opt) : [...prev, opt]
    );
  };

  const handleJoinAffiliate = (e: React.FormEvent) => {
    e.preventDefault();
    setAffiliateFeedback(null);

    const cleanManual = manualPromoMedia.trim();
    if (selectedPromoMedia.length === 0 && !cleanManual) {
      setAffiliateFeedback({
        type: 'error',
        text: 'Mohon centang minimal satu pilihan Media Promosi atau tulis media promosi secara manual.'
      });
      return;
    }

    const combinedMotivation =
      selectedPromoMedia.length > 0 && cleanManual
        ? `${selectedPromoMedia.join(', ')} | Catatan Manual: ${cleanManual}`
        : selectedPromoMedia.length > 0
        ? selectedPromoMedia.join(', ')
        : cleanManual;

    const res = joinAffiliateProgram(desiredCode, combinedMotivation, acceptedAffiliateTerms);
    setAffiliateFeedback({
      type: res.success ? 'success' : 'error',
      text: res.message
    });
  };

  const handleUpdateCode = (e: React.FormEvent) => {
    e.preventDefault();
    setAffiliateFeedback(null);
    const res = updateAffiliateReferralCode(editCodeValue);
    setAffiliateFeedback({
      type: res.success ? 'success' : 'error',
      text: res.message
    });
    if (res.success) {
      setIsEditingCode(false);
    }
  };

  const handleCopyCode = () => {
    if (!currentUser.referral_code) return;
    navigator.clipboard?.writeText(currentUser.referral_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const mainPkg = packages[0];
  const mainPkgOrig = mainPkg?.original_price && mainPkg.original_price > mainPkg.price ? mainPkg.original_price : (mainPkg?.price || 200000);
  const mainPkgPrice = mainPkg?.price || 150000;
  const mainPkgFinal = Math.max(0, mainPkgPrice - activeReferralDiscount);
  const promoShareText = `Yuk persiapan lolos CPNS bareng di LOGIN CPNS! Paket Premium lagi Promo dari Rp ${mainPkgOrig.toLocaleString('id-ID')} jadi Rp ${mainPkgPrice.toLocaleString('id-ID')}. Pakai kode referral saya *${currentUser.referral_code || 'LOGINCPNS'}* saat daftar/bayar biar langsung dapat EXTRA DISKON Rp ${activeReferralDiscount.toLocaleString('id-ID')} (cukup bayar Rp ${mainPkgFinal.toLocaleString('id-ID')})!`;

  const handleCopyPromoText = () => {
    navigator.clipboard?.writeText(promoShareText);
    setCopiedPromoText(true);
    setTimeout(() => setCopiedPromoText(false), 2200);
  };

  const handleOpenWithdrawModal = () => {
    setWdError('');
    setWdSuccess(null);
    setWdFullName(currentUser.full_name);
    setWdPhone(currentUser.phone);
    setWdBankName(currentUser.affiliate_bank_name || 'BCA');
    setWdAccountNumber(currentUser.affiliate_account_number || '');
    setWdAccountHolder(currentUser.affiliate_account_holder || currentUser.full_name);
    setWdAmount(
      unpaidCommission >= activeMinWithdrawal
        ? unpaidCommission
        : activeMinWithdrawal
    );
    setIsWithdrawModalOpen(true);
  };

  const handleSubmitWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setWdError('');

    if (!wdFullName.trim() || !wdPhone.trim() || !wdBankName.trim() || !wdAccountNumber.trim() || !wdAccountHolder.trim()) {
      setWdError('Mohon lengkapi nama identitas, nomor WhatsApp, nama bank/e-wallet, nomor rekening, dan nama pemilik rekening.');
      return;
    }
    if (unpaidCommission < activeMinWithdrawal) {
      setWdError(
        `Minimal pencairan komisi adalah Rp ${activeMinWithdrawal.toLocaleString('id-ID')}. Saldo siap cair Anda saat ini Rp ${unpaidCommission.toLocaleString('id-ID')}.`
      );
      return;
    }
    if (wdAmount < activeMinWithdrawal || wdAmount > unpaidCommission) {
      setWdError(
        `Nominal pencairan harus minimal Rp ${activeMinWithdrawal.toLocaleString('id-ID')} hingga saldo tersedia (Rp ${unpaidCommission.toLocaleString('id-ID')}).`
      );
      return;
    }

    const result = requestCommissionWithdrawal({
      fullName: wdFullName,
      phone: wdPhone,
      bankName: wdBankName,
      accountNumber: wdAccountNumber,
      accountHolder: wdAccountHolder,
      identityNumber: wdIdentityNumber,
      amount: wdAmount
    });

    if (!result.success) {
      setWdError(result.message || 'Gagal memproses pengajuan pencairan komisi.');
      return;
    }

    setWdSuccess({
      amount: wdAmount,
      whatsappUrl: result.whatsappUrl || '',
      bankInfo: `${wdBankName} · ${wdAccountNumber} a.n. ${wdAccountHolder}`
    });
  };

  const getEmailCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'WAITING_PAYMENT':
        return { label: 'MENUNGGU BAYAR', cls: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'PAYMENT_APPROVED':
        return { label: 'PEMBAYARAN BERHASIL', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'PREMIUM_ACTIVE':
        return { label: 'AKUN PREMIUM AKTIF', cls: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'PAYMENT_REJECTED':
        return { label: 'PEMBAYARAN DITOLAK', cls: 'bg-red-50 text-red-700 border-red-200' };
      case 'AFFILIATE_REQUESTED':
        return { label: 'PENGAJUAN MITRA', cls: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'AFFILIATE_APPROVED':
        return { label: 'MITRA DISETUJUI', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'AFFILIATE_REJECTED':
        return { label: 'MITRA DITOLAK', cls: 'bg-red-50 text-red-700 border-red-200' };
      case 'COMMISSION_WITHDRAWAL_REQUESTED':
        return { label: 'AJUAN PENCAIRAN', cls: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'COMMISSION_PAID':
        return { label: 'KOMISI CAIR', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'ACCOUNT_WELCOME':
        return { label: 'SELAMAT DATANG', cls: 'bg-blue-50 text-blue-700 border-blue-200' };
      default:
        return { label: 'INFO AKUN', cls: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Hidden File Input shared by avatar camera button & form upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handlePhotoFileChange}
        className="hidden"
      />

      {/* Top Header with Clickable Photo (Lightbox) & Camera Edit Button */}
      <div className="p-6 rounded-2xl bg-white border border-slate-300/80 shadow-sm flex flex-col md:flex-row items-center gap-5">
        <div className="relative group shrink-0">
          <button
            type="button"
            onClick={() => setIsPhotoPreviewOpen(true)}
            title="Klik untuk memperbesar foto profil"
            className="relative block rounded-full overflow-hidden ring-4 ring-blue-100 hover:ring-blue-400 shadow-sm cursor-zoom-in transition-all"
          >
            <img
              src={photoUrl || currentUser.photo_url}
              alt={currentUser.full_name}
              className="w-24 h-24 rounded-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = fallbackAvatar;
              }}
            />
            <span className="inset-0 absolute bg-slate-900/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <ZoomIn className="w-5 h-5" />
            </span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            title="Ganti / Upload Foto Profil"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-700 hover:bg-blue-800 text-white border-2 border-white shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-105 z-10"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center md:text-left space-y-1 flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">{currentUser.full_name}</h1>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                currentUser.membership_type === 'INTENSIF'
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                  : currentUser.membership_type === 'PREMIUM'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : currentUser.membership_type === 'STANDAR'
                  ? 'bg-sky-50 text-sky-800 border-sky-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {getMembershipDisplayLabel(currentUser.membership_type).toUpperCase()}
            </span>
            {isApprovedAffiliate && currentUser.referral_code && (
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                MITRA AKTIF · {currentUser.referral_code}
              </span>
            )}
            {affiliateStatus === 'PENDING' && (
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                MITRA MENUNGGU PERSETUJUAN ADMIN
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 flex items-center justify-center md:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentUser.email}</span>
            {unreadEmailCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setActivePanel('MEMBER');
                  setMemberSubTab('EMAIL_INBOX');
                }}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer"
              >
                {unreadEmailCount} Email Transaksi Baru
              </button>
            )}
          </p>
          <p className="text-xs text-blue-700 font-semibold">
            {currentUser.targetAgency
              ? `Target: ${currentUser.targetAgency}${currentUser.targetFormation ? ` - ${currentUser.targetFormation}` : ''}`
              : 'Belum memilih formasi'}
          </p>
          <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingPhoto}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline disabled:opacity-60 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isProcessingPhoto ? 'Memuat Gambar...' : 'Ganti / Upload Foto Profil (Dengan Crop)'}</span>
            </button>
            {(photoUrl || currentUser.photo_url || '').startsWith('data:image/') && (
              <button
                type="button"
                onClick={() => setCropSourceUrl(photoUrl || currentUser.photo_url)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                <Crop className="w-3.5 h-3.5" />
                <span>Atur Crop Foto</span>
              </button>
            )}
          </div>
          {photoNotice && (
            <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{photoNotice}</span>
            </p>
          )}
          {photoError && (
            <p className="text-[11px] font-semibold text-red-600 mt-1">{photoError}</p>
          )}
        </div>

        {/* Quick Dashboard, Panel Shortcut & Logout */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveView(currentUser.role === 'SUPER_ADMIN' ? 'admin-dashboard' : 'dashboard')}
            className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{currentUser.role === 'SUPER_ADMIN' ? 'Ke Dashboard Admin' : 'Ke Dashboard Belajar'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePanel(prev => (prev === 'MEMBER' ? 'MITRA' : 'MEMBER'))}
            className={`px-4 py-2 rounded-xl text-white text-xs font-extrabold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              activePanel === 'MEMBER'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-slate-800 hover:bg-slate-900'
            }`}
          >
            <Handshake className="w-4 h-4" />
            <span>
              {activePanel === 'MEMBER' ? 'Beralih ke Panel Mitra' : 'Beralih ke Panel Member'}
            </span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </div>

      {/* PANEL SWITCHER BAR (Panel Member <-> Panel Mitra Afiliasi) */}
      <div className="p-2 bg-white rounded-2xl border border-slate-300/80 shadow-xs space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActivePanel('MEMBER')}
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
              activePanel === 'MEMBER'
                ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserIcon className="w-4 h-4 shrink-0" />
              <div className="text-left">
                <span className="block leading-tight">Panel Member (Peserta)</span>
                <span
                  className={`text-[10px] font-normal ${
                    activePanel === 'MEMBER' ? 'text-blue-100' : 'text-slate-500'
                  }`}
                >
                  Profil, Email Transaksi &amp; Keamanan Akun
                </span>
              </div>
            </div>
            {unreadEmailCount > 0 && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  activePanel === 'MEMBER'
                    ? 'bg-white text-blue-700'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {unreadEmailCount} Pesan
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActivePanel('MITRA')}
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
              activePanel === 'MITRA'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Handshake className="w-4 h-4 shrink-0" />
              <div className="text-left">
                <span className="block leading-tight">Panel Mitra Afiliasi</span>
                <span
                  className={`text-[10px] font-normal ${
                    activePanel === 'MITRA' ? 'text-emerald-100' : 'text-slate-500'
                  }`}
                >
                  {isApprovedAffiliate
                    ? `Kode ${currentUser.referral_code} · Min. Cair Rp 50rb`
                    : affiliateStatus === 'PENDING'
                    ? 'Pengajuan Menunggu Verifikasi Admin'
                    : 'Daftar Mitra (Persetujuan Admin)'}
                </span>
              </div>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                activePanel === 'MITRA'
                  ? 'bg-white/20 text-white'
                  : isApprovedAffiliate
                  ? 'bg-emerald-100 text-emerald-800'
                  : affiliateStatus === 'PENDING'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isApprovedAffiliate
                ? `Saldo Rp ${unpaidCommission.toLocaleString('id-ID')}`
                : affiliateStatus === 'PENDING'
                ? 'PENDING ADMIN'
                : 'KOMISI Rp 10rb'}
            </span>
          </button>
        </div>

        {/* Sub-tab switcher inside Panel Member */}
        {activePanel === 'MEMBER' && (
          <div className="flex flex-wrap items-center gap-2 pt-1 px-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setMemberSubTab('PROFIL')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                memberSubTab === 'PROFIL'
                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Profil, Email &amp; Password</span>
            </button>

            <button
              type="button"
              onClick={() => setMemberSubTab('EMAIL_INBOX')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                memberSubTab === 'EMAIL_INBOX'
                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Kotak Pesan Email Transaksi ({myEmailLogs.length})</span>
              {unreadEmailCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-extrabold">
                  {unreadEmailCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ================= PANEL MEMBER: SUB-TAB 1 PROFIL, EMAIL & PASSWORD ================= */}
      {activePanel === 'MEMBER' && memberSubTab === 'PROFIL' && (
        <>
          {/* Account Info Details Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-slate-300/80 shadow-xs text-xs">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Peran Akun</span>
              <span className="font-extrabold text-slate-800 mt-1 block">{currentUser.role}</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-slate-300/80 shadow-xs text-xs">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Status Akun</span>
              <span className="font-extrabold text-emerald-600 mt-1 block">{currentUser.account_status}</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-slate-300/80 shadow-xs text-xs">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Tanggal Daftar</span>
              <span className="font-bold text-slate-800 font-mono mt-1 block">
                {new Date(currentUser.created_at).toLocaleDateString('id-ID')}
              </span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-slate-300/80 shadow-xs text-xs">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Masa Aktif Premium</span>
              <span className="font-bold text-slate-800 font-mono mt-1 block">
                {currentUser.premium_end ? new Date(currentUser.premium_end).toLocaleDateString('id-ID') : 'Tidak Aktif'}
              </span>
            </div>
          </div>

          {/* Data Biodata Tambahan dari Pendaftaran (Minimalis) */}
          <div className="p-3 rounded-xl bg-white border border-slate-300/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <h4 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wide">
                Ringkasan Biodata
              </h4>
              <span className="text-[10px] font-semibold text-slate-400">Tersimpan di Profil</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-600 shrink-0" /> Umur
                </span>
                <span className="font-bold text-slate-800 mt-0.5 block leading-snug">
                  {currentUser.age ? `${currentUser.age} Tahun` : '-'}
                </span>
              </div>
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-blue-600 shrink-0" /> Pendidikan
                </span>
                <span className="font-bold text-slate-800 mt-0.5 block leading-snug break-words">
                  {currentUser.education || '-'}
                </span>
              </div>
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-blue-600 shrink-0" /> Pekerjaan
                </span>
                <span className="font-bold text-slate-800 mt-0.5 block leading-snug break-words">
                  {currentUser.current_job || '-'}
                </span>
              </div>
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-600 shrink-0" /> Alamat
                </span>
                <span className="font-bold text-slate-800 mt-0.5 block leading-snug break-words">
                  {currentUser.address || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="p-6 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                Ubah Informasi Profil, Alamat Email &amp; Password
              </h3>
              <button
                type="button"
                onClick={() => setMemberSubTab('EMAIL_INBOX')}
                className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Lihat Log Pesan Email Masuk ({myEmailLogs.length})</span>
              </button>
            </div>

            {notice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{notice}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">

              {/* Email Aktif Highlight Card */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="font-extrabold text-blue-950 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-blue-700" />
                    <span>Alamat Email Aktif (Penerima Notifikasi Transaksi &amp; Akun)</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold text-blue-700">
                    Pengirim Resmi: {senderEmail}
                  </span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nama@gmail.com"
                  className="w-full px-3 py-2.5 bg-white border border-blue-300 rounded-lg text-slate-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-[11px] text-blue-900 leading-relaxed">
                  Pastikan email aktif dan benar. Seluruh informasi transaksi (menunggu pembayaran, pembayaran berhasil, akun aktif Premium silakan belajar, status mitra, hingga pencairan komisi) dikirim ke alamat email ini dari <strong>{senderEmail}</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Lengkap</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Target Instansi CPNS</label>
                  <input
                    type="text"
                    value={targetAgency}
                    onChange={e => setTargetAgency(e.target.value)}
                    placeholder="Misal: Kementerian Keuangan, BKN, Kemenkumham"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400/70"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Target Jabatan / Formasi</label>
                  <input
                    type="text"
                    value={targetFormation}
                    onChange={e => setTargetFormation(e.target.value)}
                    placeholder="Misal: Analis Kebijakan, Pranata Komputer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400/70"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Umur (Tahun)</label>
                  <input
                    type="number"
                    min={15}
                    max={70}
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    placeholder="Misal: 24"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400/70"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Pendidikan Terakhir / Daftar CPNS</label>
                  <input
                    type="text"
                    value={education}
                    onChange={e => setEducation(e.target.value)}
                    placeholder="Misal: S1 Akuntansi / D3 / SMA"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400/70"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Pekerjaan Saat Ini</label>
                  <input
                    type="text"
                    value={currentJob}
                    onChange={e => setCurrentJob(e.target.value)}
                    placeholder="Misal: Karyawan Swasta, Mahasiswa"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400/70"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Alamat</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Misal: Kampung Jawa, Blangkejeren"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400/60"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-xs text-slate-800 mb-2">Ubah Kata Sandi (Opsional)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600">Password Baru</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Kosongkan jika tidak diubah"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password baru"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Profil &amp; Email</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ================= PANEL MEMBER: SUB-TAB 2 KOTAK PESAN EMAIL TRANSAKSI ================= */}
      {activePanel === 'MEMBER' && memberSubTab === 'EMAIL_INBOX' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-700" />
                <span>Kotak Pesan Email &amp; Log Transaksi ({myEmailLogs.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Rekaman notifikasi resmi dari <strong className="font-mono text-slate-700">{senderEmail}</strong> ke email Anda (<strong className="font-mono text-slate-700">{currentUser.email}</strong>).
              </p>
            </div>
            {unreadEmailCount > 0 && (
              <button
                type="button"
                onClick={markAllMyEmailsRead}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold cursor-pointer self-start sm:self-auto"
              >
                Tandai Semua Sudah Dibaca ({unreadEmailCount})
              </button>
            )}
          </div>

          {myEmailLogs.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-2">
              <Mail className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Belum ada pesan log transaksi email.</p>
              <p className="text-[11px] text-slate-500">
                Pesan otomatis akan muncul saat Anda mendaftar, melakukan pembayaran paket, aktivasi Premium, pengajuan mitra, atau pencairan komisi.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myEmailLogs.map(log => {
                const badge = getEmailCategoryBadge(log.category);
                const isExpanded = expandedEmailId === log.id;
                return (
                  <div
                    key={log.id}
                    className={`rounded-xl border transition-colors ${
                      log.is_read
                        ? 'bg-white border-slate-200'
                        : 'bg-blue-50/40 border-blue-300 shadow-2xs'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedEmailId(prev => (prev === log.id ? null : log.id));
                        if (!log.is_read) {
                          markEmailLogRead(log.id);
                        }
                      }}
                      className="w-full p-4 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {!log.is_read && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                          )}
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${badge.cls}`}>
                            {badge.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Dari: {log.sender_email} &rarr; {log.recipient_email}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                          {log.subject}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-[11px] font-mono text-slate-500">
                        <span>{new Date(log.created_at).toLocaleString('id-ID')}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/60 text-xs space-y-2">
                        <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 font-mono pb-2 border-b border-slate-200/70">
                          <span>Pengirim: <strong className="text-slate-700">{log.sender_email}</strong></span>
                          <span>Penerima: <strong className="text-slate-700">{log.recipient_email}</strong></span>
                        </div>
                        <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200">
                          {log.body}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= PANEL MITRA AFILIASI ================= */}
      {activePanel === 'MITRA' && (
        <div className="space-y-6">
          {affiliateFeedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 font-semibold ${
                affiliateFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {affiliateFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{affiliateFeedback.text}</span>
            </div>
          )}

          {affiliateStatus === 'PENDING' && !isApprovedAffiliate ? (
            /* -------- CASE A: PENGAJUAN MITRA MENUNGGU PERSETUJUAN ADMIN -------- */
            <div className="bg-white rounded-2xl border border-amber-300 shadow-sm overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/20 text-[11px] font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>MENUNGGU VERIFIKASI &amp; PERSETUJUAN ADMIN</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold">
                  Pengajuan Mitra Afiliasi Anda Sedang Ditinjau Admin
                </h2>
                <p className="text-xs text-amber-50 max-w-2xl leading-relaxed">
                  Untuk mencegah penyalahgunaan kode referral dan menjaga profesionalisme program kemitraan, setiap pendaftaran Mitra Afiliasi wajib disetujui oleh Super Admin terlebih dahulu.
                </p>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">Kode Diajukan</span>
                    <span className="text-base font-extrabold font-mono text-amber-950 mt-0.5 block">
                      {currentUser.referral_code || '-'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Tanggal Pengajuan</span>
                    <span className="font-bold font-mono text-slate-800 mt-1 block">
                      {currentUser.affiliate_requested_at
                        ? new Date(currentUser.affiliate_requested_at).toLocaleString('id-ID')
                        : '-'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Notifikasi Email Tujuan</span>
                    <span className="font-bold font-mono text-blue-700 mt-1 block truncate">
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                {currentUser.affiliate_motivation && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Rencana Promosi / Channel Anda:
                    </span>
                    <p className="text-slate-700">{currentUser.affiliate_motivation}</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={`https://wa.me/${adminWaPhone}?text=${encodeURIComponent(
                      `Halo Admin LOGIN CPNS, saya ${currentUser.full_name} (${currentUser.email}) sudah mengajukan diri menjadi Mitra Afiliasi dengan kode referral ${currentUser.referral_code}. Mohon bantuannya untuk peninjauan persetujuan.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Konfirmasi Persetujuan ke WA Admin</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsTermsModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Baca Syarat &amp; Ketentuan Mitra</span>
                  </button>
                </div>
              </div>
            </div>
          ) : !isApprovedAffiliate ? (
            /* -------- CASE B: PENGAJUAN / PENDAFTARAN MITRA AFILIASI (DENGAN S&K + PERSETUJUAN ADMIN) -------- */
            <div className="bg-white rounded-2xl border border-slate-300/80 shadow-sm overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-emerald-700 via-teal-700 to-slate-900 text-white space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/15 border border-white/25 text-[11px] font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>PROGRAM KEMITRAAN &amp; AFILIASI RESMI LOGIN CPNS</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold leading-tight">
                  Ajukan Menjadi Mitra Afiliasi &amp; Dapatkan Komisi Rp {activeCommissionAmount.toLocaleString('id-ID')} / Peserta!
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
                  Peserta yang memakai kode Anda hemat <strong>Rp {activeReferralDiscount.toLocaleString('id-ID')}</strong> dari Promo Rp {mainPkgPrice.toLocaleString('id-ID')} (cukup bayar Rp {mainPkgFinal.toLocaleString('id-ID')}), dan Anda memperoleh komisi <strong>Rp {activeCommissionAmount.toLocaleString('id-ID')}</strong>. Minimal pencairan komisi adalah <strong>Rp {activeMinWithdrawal.toLocaleString('id-ID')}</strong> &amp; pendaftaran wajib persetujuan Admin.
                </p>
              </div>

              <div className="p-6 space-y-6">
                {affiliateStatus === 'REJECTED' && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-1">
                    <div className="font-extrabold flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>Pengajuan Mitra Sebelumnya Ditolak Admin</span>
                    </div>
                    <p>
                      Alasan: <strong>{currentUser.affiliate_rejection_reason || 'Tidak memenuhi kriteria kemitraan.'}</strong>. Anda dapat memperbaiki pengajuan di bawah ini.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center">
                      1
                    </span>
                    <h4 className="font-extrabold text-slate-900">Ajukan Kode &amp; Verifikasi Admin</h4>
                    <p className="text-slate-600 leading-relaxed">
                      Usulkan kode unik (contoh: <span className="font-mono font-bold text-slate-800">{suggestedCode}</span>) beserta channel promosi. Admin meninjau agar kode tidak disalahgunakan.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center">
                      2
                    </span>
                    <h4 className="font-extrabold text-slate-900">Teman Hemat Rp {activeReferralDiscount.toLocaleString('id-ID')}</h4>
                    <p className="text-slate-600 leading-relaxed">
                      Dari harga promo <strong>Rp {mainPkgPrice.toLocaleString('id-ID')}</strong>, teman Anda cukup membayar <strong>Rp {mainPkgFinal.toLocaleString('id-ID')}</strong> saat memakai kode Anda.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 font-extrabold flex items-center justify-center">
                      3
                    </span>
                    <h4 className="font-extrabold text-slate-900">
                      Komisi Rp {activeCommissionAmount.toLocaleString('id-ID')} &amp; Min. Cair Rp {activeMinWithdrawal.toLocaleString('id-ID')}
                    </h4>
                    <p className="text-slate-600 leading-relaxed">
                      Kumpulkan komisi hingga minimal <strong>Rp {activeMinWithdrawal.toLocaleString('id-ID')}</strong> lalu ajukan pencairan ke rekening/e-wallet yang terhubung WA &amp; email resmi {senderEmail}.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleJoinAffiliate}
                  className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="font-extrabold text-emerald-950 block">
                        Formulir Pendaftaran Mitra Afiliasi
                      </label>
                      <p className="text-[11px] text-emerald-800">
                        Kode referral aktif setelah mendapat persetujuan Super Admin (notifikasi dikirim ke {currentUser.email}).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTermsModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[11px] cursor-pointer self-start"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Baca Syarat &amp; Ketentuan Lengkap</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800">Usulan Kode Referral (4–20 karakter)</label>
                      <input
                        type="text"
                        value={desiredCode}
                        onChange={e => setDesiredCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                        placeholder="Contoh: BUDICPNS26"
                        maxLength={20}
                        className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl font-mono font-extrabold text-sm tracking-wider text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div className="space-y-1.5" ref={promoDropdownRef}>
                      <label className="font-bold text-slate-800 block">
                        Media / Rencana Promosi (Pilih &ge;1 atau Tulis Manual)
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsPromoDropdownOpen(prev => !prev)}
                          className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          <span
                            className={`truncate ${
                              selectedPromoMedia.length > 0 ? 'font-bold text-slate-900' : 'text-slate-400'
                            }`}
                          >
                            {selectedPromoMedia.length > 0
                              ? `${selectedPromoMedia.length} dipilih: ${selectedPromoMedia.join(', ')}`
                              : 'Pilih media promosi (bisa centang lebih dari satu)...'}
                          </span>
                          {isPromoDropdownOpen ? (
                            <ChevronUp className="w-4 h-4 text-emerald-700 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-emerald-700 shrink-0" />
                          )}
                        </button>

                        {isPromoDropdownOpen && (
                          <div className="absolute left-0 right-0 mt-1.5 z-30 bg-white border border-emerald-200 rounded-xl shadow-xl p-2 max-h-56 overflow-y-auto space-y-1">
                            {PROMO_MEDIA_OPTIONS.map(opt => {
                              const isChecked = selectedPromoMedia.includes(opt);
                              return (
                                <label
                                  key={opt}
                                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                                    isChecked
                                      ? 'bg-emerald-50 text-emerald-950 font-bold'
                                      : 'hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => togglePromoMediaOption(opt)}
                                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
                                  />
                                  <span className="text-xs">{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {selectedPromoMedia.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {selectedPromoMedia.map(item => (
                            <span
                              key={item}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold"
                            >
                              <span>{item}</span>
                              <button
                                type="button"
                                onClick={() => togglePromoMediaOption(item)}
                                className="hover:text-red-600 cursor-pointer"
                                title={`Hapus ${item}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <input
                        type="text"
                        value={manualPromoMedia}
                        onChange={e => setManualPromoMedia(e.target.value)}
                        placeholder="Atau tulis manual media promosi (misal: Grup Telegram Pejuang NIP, Brosur Kampus)"
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400/75 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Legal Terms & Conditions Box */}
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-200 space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedAffiliateTerms}
                        onChange={e => setAcceptedAffiliateTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
                      />
                      <span className="text-[11px] text-slate-700 leading-relaxed">
                        Saya menyatakan telah membaca dan menyetujui{' '}
                        <button
                          type="button"
                          onClick={() => setIsTermsModalOpen(true)}
                          className="font-bold text-emerald-700 hover:underline"
                        >
                          Syarat &amp; Ketentuan Program Mitra Afiliasi LOGIN CPNS
                        </button>
                        , termasuk: (1) persetujuan wajib oleh Admin, (2) komisi <strong>Rp {activeCommissionAmount.toLocaleString('id-ID')}/pembeli lunas</strong>, (3) <strong>minimal pencairan komisi Rp {activeMinWithdrawal.toLocaleString('id-ID')}</strong>, (4) larangan self-referral, manipulasi data, spamming, dan pelanggaran hukum/hak cipta, serta (5) hak penuh LOGIN CPNS untuk <strong>membatalkan pencairan komisi</strong> apabila mitra melakukan kesalahan, penyalahgunaan, atau memberikan data yang tidak benar.
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Handshake className="w-4 h-4" />
                      <span>Ajukan Pendaftaran Mitra ke Admin</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* -------- CASE C: PANEL MITRA AFILIASI AKTIF (DISETUJUI ADMIN) -------- */
            <>
              {/* Referral Code & Share Card */}
              <div className="p-6 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex flex-wrap items-center gap-2 text-[11px] font-bold text-emerald-700 uppercase">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Status: Mitra Afiliasi Aktif (Disetujui Admin)</span>
                      </span>
                      {(currentUser.affiliate_approved_at || currentUser.affiliate_joined_at) && (
                        <span className="text-slate-400 font-normal">
                          · Disetujui{' '}
                          {new Date(
                            currentUser.affiliate_approved_at || currentUser.affiliate_joined_at || currentUser.created_at
                          ).toLocaleDateString('id-ID')}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsTermsModalOpen(true)}
                        className="text-blue-700 hover:underline normal-case font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>Baca S&amp;K Mitra</span>
                      </button>
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      Panel Mitra Afiliasi &amp; Kode Referral Anda
                    </h2>
                    <p className="text-xs text-slate-500">
                      Dapatkan komisi <strong className="text-emerald-700">Rp {activeCommissionAmount.toLocaleString('id-ID')}</strong> setiap ada peserta membeli paket premium memakai kode referral Anda. Minimal pencairan <strong>Rp {activeMinWithdrawal.toLocaleString('id-ID')}</strong>.
                    </p>
                  </div>

                  {/* Active Referral Code Display */}
                  <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                        Kode Referral Saya
                      </span>
                      <span className="text-lg font-extrabold font-mono text-emerald-900 tracking-wider">
                        {currentUser.referral_code}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
                    </button>
                    {currentUser.role !== 'SUPER_ADMIN' && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditCodeValue(currentUser.referral_code || '');
                          setIsEditingCode(prev => !prev);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Ubah Kode</span>
                      </button>
                    )}
                  </div>
                </div>

                {isEditingCode && currentUser.role !== 'SUPER_ADMIN' && (
                  <form
                    onSubmit={handleUpdateCode}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs"
                  >
                    <label className="font-bold text-slate-700 shrink-0">Kode Baru:</label>
                    <input
                      type="text"
                      value={editCodeValue}
                      onChange={e => setEditCodeValue(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                      maxLength={20}
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold uppercase text-slate-900"
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg cursor-pointer"
                      >
                        Simpan Kode
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingCode(false)}
                        className="px-3 py-2 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}

                {/* Share Promo Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 flex-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-blue-600" />
                      Teks Promosi Siap Bagikan (Otomatis Potong Harga Rp {activeReferralDiscount.toLocaleString('id-ID')} untuk Pembeli)
                    </span>
                    <p className="text-[11px] text-slate-600 italic leading-relaxed">
                      &ldquo;{promoShareText}&rdquo;
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyPromoText}
                      className="px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedPromoText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPromoText ? 'Teks Tersalin' : 'Salin Teks'}</span>
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(promoShareText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Bagikan ke WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Commission Summary Cards + Pencairan Button (Min Rp 50.000) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-300/80 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Peserta Beli Paket</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-slate-900">
                    {approvedReferredPayments.length} <span className="text-xs font-semibold text-slate-500">Lunas</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    +{waitingReferredPayments.length} menunggu verifikasi · {registeredWithMyCode.length} terdaftar
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-300/80 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Total Komisi Didapat</span>
                    <Banknote className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-slate-900">
                    Rp {totalEarnedCommission.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {currentUser.role === 'SUPER_ADMIN'
                      ? 'Kode resmi admin (diskon platform)'
                      : `Rp ${activeCommissionAmount.toLocaleString('id-ID')} × ${approvedReferredPayments.length} pembeli lunas`}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-emerald-100 text-xs font-bold">
                    <span>Komisi Belum Dicairkan</span>
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono">
                    Rp {unpaidCommission.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-emerald-100">
                    Minimal cair: Rp {activeMinWithdrawal.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-blue-700 text-xs font-bold">
                    <span>Komisi Sudah Dibayar</span>
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-blue-800">
                    Rp {paidCommission.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Sudah ditransfer oleh Admin
                  </p>
                </div>
              </div>

              {/* Action Banner: Pencairan Komisi */}
              <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-emerald-600" />
                      <span>Pencairan Komisi Mitra ke Rekening / E-Wallet (Minimal Rp {activeMinWithdrawal.toLocaleString('id-ID')})</span>
                    </h3>
                    <p className="text-xs text-slate-600">
                      Isi identitas &amp; nomor rekening tujuan pencairan. Saldo minimal pencairan adalah{' '}
                      <strong className="text-slate-900">Rp {activeMinWithdrawal.toLocaleString('id-ID')}</strong>. Status pencairan dikirim via email (<span className="font-mono">{currentUser.email}</span>) dan WhatsApp Admin ({settings.admin_whatsapp}).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenWithdrawModal}
                    disabled={!canWithdraw}
                    className={`px-5 py-3 text-xs font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-2 shrink-0 transition-colors ${
                      canWithdraw
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {canWithdraw ? <Banknote className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    <span>
                      {canWithdraw ? 'Cairkan Komisi Sekarang' : `Minimal Saldo Rp ${activeMinWithdrawal.toLocaleString('id-ID')}`}
                    </span>
                  </button>
                </div>

                {/* Progress Bar Menuju Minimal Pencairan */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">
                      Progress Batas Minimal Pencairan (Rp {activeMinWithdrawal.toLocaleString('id-ID')})
                    </span>
                    <span className="font-mono font-extrabold text-emerald-700">
                      Rp {unpaidCommission.toLocaleString('id-ID')} / Rp {activeMinWithdrawal.toLocaleString('id-ID')} ({minWithdrawProgress}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        canWithdraw ? 'bg-emerald-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${minWithdrawProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {canWithdraw
                      ? `Saldo Anda telah memenuhi syarat minimal Rp ${activeMinWithdrawal.toLocaleString('id-ID')} dan siap diajukan pencairan kapan saja.`
                      : `Kumpulkan Rp ${shortageAmount.toLocaleString('id-ID')} lagi (${activeCommissionAmount > 0 ? Math.ceil(shortageAmount / activeCommissionAmount) : 1} pembeli lunas lagi) untuk membuka tombol pencairan.`}
                  </p>
                </div>
              </div>

              {/* Laporan Peserta yang Bergabung Membeli Paket Soal */}
              <div className="p-6 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Laporan Peserta yang Bergabung Membeli Paket Soal ({referredPayments.length})
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Daftar peserta yang bertransaksi menggunakan kode referral <strong className="font-mono text-emerald-700">{currentUser.referral_code}</strong>.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                    Komisi per Pembeli Lunas: Rp {activeCommissionAmount.toLocaleString('id-ID')}
                  </span>
                </div>

                {referredPayments.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-2">
                    <Users className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      Belum ada peserta yang membeli paket menggunakan kode referral Anda.
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Bagikan kode <span className="font-mono font-bold text-emerald-700">{currentUser.referral_code}</span> agar teman Anda dapat diskon Rp {activeReferralDiscount.toLocaleString('id-ID')} dan Anda meraih komisi Rp {activeCommissionAmount.toLocaleString('id-ID')}!
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                          <th className="py-2.5 px-3 text-center">No</th>
                          <th className="py-2.5 px-3">Tgl Daftar</th>
                          <th className="py-2.5 px-3">Tgl Bayar</th>
                          <th className="py-2.5 px-3">Nama &amp; Kontak Peserta</th>
                          <th className="py-2.5 px-3">Paket Dibeli</th>
                          <th className="py-2.5 px-3 text-right">Nominal Bayar</th>
                          <th className="py-2.5 px-3 text-center">Status Bayar</th>
                          <th className="py-2.5 px-3 text-right">Komisi Anda</th>
                          <th className="py-2.5 px-3 text-center">Status Komisi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {referredPayments.map((p, idx) => {
                          const buyer = users.find(u => u.id === p.user_id || u.email === p.user_email);
                          const regDate = p.user_registered_at || buyer?.created_at || p.created_at;
                          const commissionVal = getEffectiveCommission(p);
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/70">
                              <td className="py-2.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                                {new Date(regDate).toLocaleDateString('id-ID')}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                                {new Date(p.created_at).toLocaleDateString('id-ID')}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-slate-900">{p.user_name}</div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  {p.user_phone || buyer?.phone || '-'}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-700 font-medium">{p.package_name}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                                Rp {p.amount.toLocaleString('id-ID')}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${
                                    p.status === 'APPROVED'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : p.status === 'REJECTED'
                                      ? 'bg-red-50 text-red-700 border-red-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                >
                                  {p.status === 'APPROVED'
                                    ? 'LUNAS'
                                    : p.status === 'REJECTED'
                                    ? 'DITOLAK'
                                    : 'VERIFIKASI'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-extrabold text-emerald-700 whitespace-nowrap">
                                {p.status === 'REJECTED' ? 'Rp 0' : `Rp ${commissionVal.toLocaleString('id-ID')}`}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {p.status !== 'APPROVED' ? (
                                  <span className="text-[10px] font-semibold text-slate-400">
                                    Menunggu Lunas
                                  </span>
                                ) : p.commission_status === 'PAID' ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                                    <CheckCircle2 className="w-3 h-3" /> SUDAH DIBAYAR
                                  </span>
                                ) : p.commission_status === 'NOT_APPLICABLE' ? (
                                  <span className="text-[10px] text-slate-400">Kode Resmi</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                                    <Clock className="w-3 h-3" /> BELUM DICAIRKAN
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {registeredWithMyCode.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                    <span className="font-bold text-slate-800">Peserta Mendaftar Akun dengan Kode Anda:</span>{' '}
                    {registeredWithMyCode.map(u => `${u.full_name} (${u.membership_type})`).join(', ')}
                  </div>
                )}
              </div>

              {/* Riwayat Pengajuan Pencairan Komisi */}
              <div className="p-6 rounded-2xl bg-white border border-slate-300/80 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                  Riwayat Pengajuan Pencairan Komisi ({myWithdrawals.length})
                </h3>
                {myWithdrawals.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Belum ada riwayat pengajuan pencairan. Klik tombol &ldquo;Cairkan Komisi Sekarang&rdquo; ketika saldo Anda mencapai minimal Rp 50.000.
                  </p>
                ) : (
                  <div className="space-y-2.5 text-xs">
                    {myWithdrawals.map(wd => {
                      const followUpText = `Halo Admin LOGIN CPNS, saya ingin konfirmasi pengajuan pencairan komisi ID ${wd.id} (${wd.referral_code}) sebesar Rp ${wd.amount.toLocaleString('id-ID')} ke ${wd.bank_name} ${wd.account_number} a.n ${wd.account_holder}.`;
                      return (
                        <div
                          key={wd.id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-extrabold text-slate-900">
                                Rp {wd.amount.toLocaleString('id-ID')}
                              </span>
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                                  wd.status === 'PAID'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : wd.status === 'CANCELLED'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                {wd.status === 'PAID'
                                  ? 'SUDAH DIBAYARKAN'
                                  : wd.status === 'CANCELLED'
                                  ? 'DIBATALKAN ADMIN'
                                  : 'MENUNGGU TRANSFER ADMIN'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600">
                              Tujuan: <strong>{wd.bank_name}</strong> · <span className="font-mono">{wd.account_number}</span> a.n. {wd.account_holder}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              Diajukan: {new Date(wd.requested_at).toLocaleString('id-ID')}
                              {wd.paid_at ? ` · Dibayar: ${new Date(wd.paid_at).toLocaleDateString('id-ID')}` : ''}
                              {wd.paid_by ? ` oleh ${wd.paid_by}` : ''}
                              {wd.cancelled_at ? ` · Dibatalkan: ${new Date(wd.cancelled_at).toLocaleDateString('id-ID')}` : ''}
                              {wd.cancelled_by ? ` oleh ${wd.cancelled_by}` : ''}
                            </p>
                            {wd.cancellation_reason && (
                              <p className="text-[11px] text-red-700 font-semibold">
                                Alasan Pembatalan: {wd.cancellation_reason}
                              </p>
                            )}
                            {wd.notes && !wd.cancellation_reason && (
                              <p className="text-[11px] text-slate-600 italic">Catatan Admin: {wd.notes}</p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {wd.proof_url && (
                              <button
                                type="button"
                                onClick={() => setProofPreviewUrl(wd.proof_url || null)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-[11px] cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Lihat Bukti Transfer</span>
                              </button>
                            )}
                            {wd.status === 'REQUESTED' && (
                              <a
                                href={`https://wa.me/${adminWaPhone}?text=${encodeURIComponent(followUpText)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shrink-0"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Konfirmasi ke WA Admin</span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {proofPreviewUrl && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs"
                  onClick={() => setProofPreviewUrl(null)}
                >
                  <div
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                      <h4 className="font-extrabold text-sm text-slate-900">Bukti Transfer Pembayaran Komisi</h4>
                      <button
                        type="button"
                        onClick={() => setProofPreviewUrl(null)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4 bg-slate-950 flex items-center justify-center">
                      <img
                        src={proofPreviewUrl}
                        alt="Bukti Transfer Komisi"
                        className="max-h-[65vh] w-auto object-contain rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modal Syarat & Ketentuan Program Bimbel & Mitra Afiliasi */}
      {isTermsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
          onClick={() => setIsTermsModalOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-8"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-sm">
                    Syarat &amp; Ketentuan Resmi Program Bimbel &amp; Mitra Afiliasi LOGIN CPNS
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Kepatuhan Hukum, Hak Cipta, Privasi &amp; Ketentuan Pencairan Komisi Mitra
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-[11px]">
                Dokumen ini mengikat seluruh Peserta (Member) maupun Mitra Afiliasi pada platform bimbingan belajar <strong>LOGIN CPNS</strong>. Komunikasi resmi transaksi diterbitkan melalui email <strong className="font-mono">{senderEmail}</strong> dan WhatsApp Admin <strong>{settings.admin_whatsapp}</strong>.
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900">Pasal 1 — Status Independen &amp; Non-Afiliasi Pemerintah</h4>
                <p>
                  LOGIN CPNS adalah lembaga bimbingan belajar dan penyedia simulasi CAT SKD CPNS independen milik swasta. Platform ini bukan merupakan instansi pemerintah, bukan bagian resmi dari BKN atau KemenPAN-RB, dan keikutsertaan dalam bimbingan tidak memberikan jaminan kelulusan seleksi CPNS/ASN maupun praktik percaloan dalam bentuk apa pun (sesuai ketentuan peraturan perundang-undangan RI).
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900">Pasal 2 — Hak Kekayaan Intelektual &amp; Larangan Pembajakan</h4>
                <p>
                  Seluruh bank soal, modul pembelajaran PDF, video pembahasan, dan desain sistem dilindungi oleh Undang-Undang Hak Cipta No. 28 Tahun 2014. Satu akun Premium hanya berlaku untuk penggunaan pribadi 1 (satu) peserta. Dilarang keras memperjualbelikan akun (sharing account), menggandakan, merekam ulang, atau menyebarluaskan materi/soal tanpa izin tertulis dari pengelola LOGIN CPNS.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900">Pasal 3 — Pendaftaran Mitra &amp; Persetujuan Wajib Admin</h4>
                <p>
                  Pengajuan bergabung sebagai Mitra Afiliasi wajib melalui proses peninjauan dan persetujuan Super Admin. Pengelola berhak menyetujui atau menolak pengajuan tanpa kewajiban ganti rugi apabila terindikasi potensi penyalahgunaan kode referral, akun ganda, atau metode promosi yang melanggar etika/hukum.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900">Pasal 4 — Ketentuan Komisi &amp; Minimal Pencairan Rp {activeMinWithdrawal.toLocaleString('id-ID')}</h4>
                <p>
                  Mitra berhak memperoleh komisi sebesar <strong>Rp {activeCommissionAmount.toLocaleString('id-ID')}</strong> per peserta baru yang menyelesaikan pembayaran Paket Premium berstatus Lunas (<em>Approved</em>) menggunakan kode referral Mitra. Pengajuan pencairan komisi hanya dapat dilakukan apabila saldo komisi terverifikasi mencapai batas minimal <strong>Rp {activeMinWithdrawal.toLocaleString('id-ID')}</strong>. Transfer pencairan diproses maksimal 1–3 hari kerja ke rekening bank atau e-wallet sesuai data identitas valid milik Mitra.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900">Pasal 5 — Larangan Kecurangan, Self-Referral &amp; Pencemaran Nama Baik</h4>
                <p>
                  Mitra dilarang keras melakukan <em>self-referral</em> (memakai kode sendiri untuk akun pribadi/keluarga demi memanipulasi komisi), membuat klaim menyesatkan (&ldquo;dijamin lolos NIP 100%&rdquo;, &ldquo;soal bocoran BKN&rdquo;), melakukan spamming massal, atau memalsukan bukti transfer. Pelanggaran terhadap pasal ini berakibat pembatalan seluruh komisi, pemblokiran permanen akun, dan bila menimbulkan kerugian materiil dapat diproses sesuai hukum yang berlaku termasuk UU ITE.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900">Pasal 6 — Perlindungan Data Pribadi &amp; Transaksi</h4>
                <p>
                  Data pribadi (nama, alamat email aktif, nomor WhatsApp, dan nomor rekening pencairan) dijaga kerahasiaannya sesuai prinsip perlindungan data pribadi (UU No. 27 Tahun 2022) dan hanya digunakan untuk administrasi pembelajaran, verifikasi pembayaran, audit internal, serta pengiriman log notifikasi resmi dari <span className="font-mono font-bold">{senderEmail}</span>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200 space-y-1">
                <h4 className="font-extrabold text-red-900">
                  Pasal 7 — Pembatalan Pencairan Komisi atas Kesalahan, Penyalahgunaan, atau Ketidakbenaran Data
                </h4>
                <p className="text-red-950">
                  Apabila Mitra melakukan kesalahan, penyalahgunaan program atau kode referral, pengisian atau penyampaian data yang tidak benar (termasuk identitas, kontak, media promosi, maupun data rekening), manipulasi transaksi, ataupun pelanggaran Syarat &amp; Ketentuan lainnya, maka <strong>LOGIN CPNS berhak penuh untuk menunda, menahan, atau membatalkan pencairan komisi</strong> secara sepihak tanpa kewajiban ganti rugi dalam bentuk apa pun.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              {!isApprovedAffiliate && affiliateStatus !== 'PENDING' && (
                <button
                  type="button"
                  onClick={() => {
                    setAcceptedAffiliateTerms(true);
                    setIsTermsModalOpen(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  Saya Setuju &amp; Tutup
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajukan Pencairan Komisi (Identitas + No Rek + Min Rp 50.000 + Terhubung WA Admin) */}
      {isWithdrawModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto"
          onClick={() => setIsWithdrawModalOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-8"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50">
              <div>
                <h3 className="font-extrabold text-sm text-emerald-950">
                  Formulir Pencairan Komisi Mitra Afiliasi
                </h3>
                <p className="text-[11px] text-emerald-800">
                  Saldo siap cair: <strong className="font-mono">Rp {unpaidCommission.toLocaleString('id-ID')}</strong> · Minimal pencairan <strong className="font-mono">Rp {activeMinWithdrawal.toLocaleString('id-ID')}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-emerald-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {wdSuccess ? (
              <div className="p-6 space-y-4 text-xs text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-slate-900">
                    Pengajuan Pencairan Tercatat!
                  </h4>
                  <p className="text-slate-600">
                    Nominal <strong className="font-mono text-emerald-700">Rp {wdSuccess.amount.toLocaleString('id-ID')}</strong> ke{' '}
                    <strong>{wdSuccess.bankInfo}</strong> telah masuk ke antrean Super Admin dan notifikasi tercatat di email Anda ({currentUser.email}).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] text-left">
                  Klik tombol hijau di bawah ini untuk langsung mengirim detail identitas &amp; nomor rekening pencairan ke <strong>WhatsApp Admin ({settings.admin_whatsapp})</strong> agar segera diproses transfernya (maks. 1–3 hari kerja).
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <a
                    href={wdSuccess.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-2 text-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Kirim Pengajuan Pencairan ke WA Admin</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="w-full py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-xl cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitWithdrawal} className="p-5 space-y-3.5 text-xs">
                {wdError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{wdError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Nama Lengkap (Sesuai KTP/Identitas)</label>
                    <input
                      type="text"
                      value={wdFullName}
                      onChange={e => setWdFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">No. WhatsApp Mitra</label>
                    <input
                      type="tel"
                      value={wdPhone}
                      onChange={e => setWdPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">No. Identitas / NIK (Opsional untuk verifikasi transfer)</label>
                  <input
                    type="text"
                    value={wdIdentityNumber}
                    onChange={e => setWdIdentityNumber(e.target.value)}
                    placeholder="Contoh: 3201xxxxxxxxxxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Bank / E-Wallet Tujuan</label>
                    <input
                      type="text"
                      value={wdBankName}
                      onChange={e => setWdBankName(e.target.value)}
                      placeholder="Misal: BCA, BRI, BSI, Mandiri, DANA, GoPay"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Nomor Rekening / No. E-Wallet</label>
                    <input
                      type="text"
                      value={wdAccountNumber}
                      onChange={e => setWdAccountNumber(e.target.value)}
                      placeholder="Masukkan nomor rekening pencairan"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Atas Nama Pemilik Rekening</label>
                    <input
                      type="text"
                      value={wdAccountHolder}
                      onChange={e => setWdAccountHolder(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Nominal Pencairan (Min. Rp {activeMinWithdrawal.toLocaleString('id-ID')})</label>
                    <input
                      type="number"
                      min={activeMinWithdrawal}
                      step={5000}
                      max={Math.max(unpaidCommission, activeMinWithdrawal)}
                      value={wdAmount}
                      onChange={e => setWdAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-lg font-mono font-extrabold text-emerald-800"
                      required
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                  Dengan mengajukan pencairan, Anda menyatakan data rekening benar milik Anda sesuai Syarat &amp; Ketentuan Mitra LOGIN CPNS. Bukti status transfer dikirim dari <strong className="font-mono">{senderEmail}</strong> ke <strong>{currentUser.email}</strong>.
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Ajukan &amp; Hubungkan ke WA Admin</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Tampilan Besar Foto Profil (Lightbox) */}
      {isPhotoPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs"
          onClick={() => setIsPhotoPreviewOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Foto Profil</h3>
                <p className="text-[11px] text-slate-500">{currentUser.full_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoPreviewOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-center">
              <img
                src={photoUrl || currentUser.photo_url}
                alt={currentUser.full_name}
                className="w-full max-h-[65vh] object-contain rounded-xl shadow-lg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = fallbackAvatar;
                }}
              />
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPhotoPreviewOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ganti Foto</span>
                </button>
                {(photoUrl || currentUser.photo_url || '').startsWith('data:image/') && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPhotoPreviewOpen(false);
                      setCropSourceUrl(photoUrl || currentUser.photo_url);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>Crop Foto</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoPreviewOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crop Foto Profil sebelum disimpan */}
      {cropSourceUrl && (
        <PhotoCropModal
          key={cropSourceUrl}
          imageSrc={cropSourceUrl}
          onCancel={() => setCropSourceUrl(null)}
          onConfirm={handleCropConfirm}
          onChooseAnotherFile={() => fileInputRef.current?.click()}
        />
      )}
    </div>
  );
};
