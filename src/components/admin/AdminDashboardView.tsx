import React, { useState, useEffect } from 'react';
import {
  useApp,
  AdminNavView,
  AFFILIATE_COMMISSION_AMOUNT,
  REFERRAL_DISCOUNT_AMOUNT,
  MIN_COMMISSION_WITHDRAWAL,
  OFFICIAL_SENDER_EMAIL,
  DEFAULT_SKD_CALCULATOR_CONFIG,
  getQuestionPackageIds,
  isQuestionInPackage
} from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Database,
  FileSpreadsheet,
  FileText,
  Crown,
  CreditCard,
  ShieldCheck,
  Calendar,
  Video,
  ClipboardList,
  Settings,
  History,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Upload,
  Download,
  Search,
  ExternalLink,
  Eye,
  AlertCircle,
  Save,
  RefreshCw,
  Printer,
  FileDown,
  FolderPlus,
  Layers,
  TrendingUp,
  Wallet,
  DollarSign,
  Filter,
  Flame,
  Sparkles,
  Megaphone,
  Pin,
  EyeOff,
  Film,
  Play,
  Handshake,
  Banknote,
  Clock,
  MessageCircle,
  Check,
  Mail,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  X,
  Award,
  Trophy,
  Moon,
  Camera,
  ArrowUpDown,
  ZoomIn,
  Calculator,
  ListPlus,
  MinusCircle,
  Smartphone,
  QrCode,
  Phone,
  Building2
} from 'lucide-react';
import {
  User,
  AffiliateStatus,
  Question,
  QuestionCategory,
  DifficultyLevel,
  Material,
  MaterialCategory,
  ShortVideo,
  ShortVideoCategory,
  ShortVideoSourceType,
  PremiumPackage,
  PracticePackage,
  PackageAccessTier,
  PackageType,
  PaymentStatus,
  GroupSession,
  ExamType,
  PassingGradeConfig,
  AdminAnnouncement,
  AnnouncementCategory,
  MembershipType,
  SkdCalculatorConfig,
  InstallTutorialImage,
  PaymentChannelConfig,
  PaymentChannelCategory
} from '../../types';
import {
  saveVideoBlob,
  formatFileSize,
  readVideoDurationFromFile
} from '../../utils/videoStorage';
import {
  exportTableToExcel,
  exportTableToWord,
  exportTableToPdf,
  readAndCompressImageFile,
  resolveReportOrientation,
  ReportOrientation,
  ReportPaperSize,
  ReportBrandInfo,
  ReportDetailItem
} from '../../utils/reportExport';
import {
  ShortVideoPlayer,
  getShortVideoCategoryLabel
} from '../materi/ShortVideoPlayer';

export const AdminDashboardView: React.FC = () => {
  const {
    currentUser,
    users,
    questions,
    practicePackages,
    materials,
    shortVideos,
    packages,
    payments,
    commissionWithdrawals,
    emailLogs,
    groupSessions,
    leaderboards,
    results,
    settings,
    auditLogs,
    announcements,
    activeView,
    setActiveView,
    addPracticePackage,
    updatePracticePackage,
    deletePracticePackage,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    bulkImportQuestions,
    assignQuestionsToPackage,
    removeQuestionFromPackage,
    approvePayment,
    rejectPayment,
    toggleCommissionPaidStatus,
    markWithdrawalPaid,
    cancelWithdrawalByAdmin,
    payPartnerCommissionDirect,
    updatePartnerByAdmin,
    removePartnerByAdmin,
    approveAffiliateApplication,
    rejectAffiliateApplication,
    manualTogglePremium,
    manualSetMembershipTier,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addShortVideo,
    updateShortVideo,
    deleteShortVideo,
    addGroupSession,
    updateGroupSession,
    deleteGroupSession,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    updateSettings,
    updatePassingGrade,
    updateSkdCalculatorConfig,
    updatePackage,
    adjustActiveSubscribersDuration
  } = useApp();

  // Internal tab state if within admin view
  const currentAdminTab = activeView.startsWith('admin-') ? (activeView as AdminNavView) : 'admin-dashboard';

  // --- Sub-state for Add Question Modal ---
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [qCat, setQCat] = useState<QuestionCategory>('TWK');
  const [qTopic, setQTopic] = useState('');
  const [qText, setQText] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qOptE, setQOptE] = useState('');
  const [qKey, setQKey] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [qWeightA, setQWeightA] = useState(1);
  const [qWeightB, setQWeightB] = useState(2);
  const [qWeightC, setQWeightC] = useState(3);
  const [qWeightD, setQWeightD] = useState(4);
  const [qWeightE, setQWeightE] = useState(5);
  const [qExp, setQExp] = useState('');
  const [qDiff, setQDiff] = useState<DifficultyLevel>('Sedang');
  const [qPackageId, setQPackageId] = useState('');
  const [qPackageTitle, setQPackageTitle] = useState('');
  const [qExtraPackageIds, setQExtraPackageIds] = useState<string[]>([]);
  const [questionModalMode, setQuestionModalMode] = useState<'NEW' | 'PICK_EXISTING'>('NEW');
  const [pickSearch, setPickSearch] = useState('');
  const [pickCatFilter, setPickCatFilter] = useState<'ALL' | QuestionCategory>('ALL');
  const [pickSourcePkgFilter, setPickSourcePkgFilter] = useState<string>('ALL');
  const [pickHideAlreadyAssigned, setPickHideAlreadyAssigned] = useState<boolean>(false);
  const [pickSelectedIds, setPickSelectedIds] = useState<string[]>([]);

  // --- Sub-state for Bank Soal View Mode & Hierarchical Menu + Package Filter ---
  const [questionViewMode, setQuestionViewMode] = useState<'PACKAGES' | 'ALL_QUESTIONS'>('PACKAGES');
  const [adminBankMenuFilter, setAdminBankMenuFilter] = useState<
    'ALL' | 'TRYOUT_LENGKAP' | 'LATIHAN_HARIAN' | 'TRYOUT_KATEGORI' | 'TRYOUT_BARENG'
  >('ALL');
  const [adminBankCatFilter, setAdminBankCatFilter] = useState<'ALL' | QuestionCategory | 'CAMPURAN'>('ALL');
  const [adminBankTierFilter, setAdminBankTierFilter] = useState<'ALL' | PackageAccessTier>('ALL');
  const [adminBankSortBy, setAdminBankSortBy] = useState<
    | 'DEFAULT'
    | 'NAME_ASC'
    | 'NAME_DESC'
    | 'NEWEST'
    | 'OLDEST'
    | 'MOST_QUESTIONS'
    | 'FEWEST_QUESTIONS'
    | 'PUBLISHED_FIRST'
    | 'UNPUBLISHED_FIRST'
  >('DEFAULT');
  const [adminBankSearch, setAdminBankSearch] = useState<string>('');
  const [selectedPackageFilter, setSelectedPackageFilter] = useState('ALL');
  const [selectedBankQuestionIds, setSelectedBankQuestionIds] = useState<string[]>([]);
  const [bulkTargetPkgId, setBulkTargetPkgId] = useState<string>('');
  const [bankAssignNotice, setBankAssignNotice] = useState<string>('');
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  // --- Sub-state for Create/Edit Package / Kotak Soal Modal ---
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PracticePackage | null>(null);
  const [pTitle, setPTitle] = useState('');
  const [pSubtitle, setPSubtitle] = useState('');
  const [pType, setPType] = useState<PackageType>('LATIHAN_HARIAN');
  const [pCat, setPCat] = useState<QuestionCategory | 'CAMPURAN'>('TIU');
  const [pTier, setPTier] = useState<PackageAccessTier>('PREMIUM');
  const [pCount, setPCount] = useState<number>(15);
  const [pDuration, setPDuration] = useState<number>(15);
  const [pDesc, setPDesc] = useState('');

  // --- Sub-state for Payment Filter, Search, Referral & Commission ---
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [paymentReferralFilter, setPaymentReferralFilter] = useState<'ALL' | 'WITH_REFERRAL' | 'PARTNER_ONLY' | 'UPGRADE_ONLY'>('ALL');
  const [commissionStatusFilter, setCommissionStatusFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const [activationSearch, setActivationSearch] = useState('');
  const [rejectingPaymentId, setRejectingPaymentId] = useState<string | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  // --- Sub-state for Premium Package & Commission Pricing Editor (admin-packages) ---
  const activeCommissionAmount = settings.affiliate_commission_amount ?? AFFILIATE_COMMISSION_AMOUNT;
  const activeReferralDiscount = settings.referral_discount_amount ?? REFERRAL_DISCOUNT_AMOUNT;
  const activeMinWithdrawal = settings.min_commission_withdrawal ?? MIN_COMMISSION_WITHDRAWAL;

  const [editingPremPkg, setEditingPremPkg] = useState<PremiumPackage | null>(null);
  const [premName, setPremName] = useState<string>('');
  const [premPrice, setPremPrice] = useState<number>(150000);
  const [premOriginalPrice, setPremOriginalPrice] = useState<number>(200000);
  const [premPromoBadge, setPremPromoBadge] = useState<string>('PROMO TAHUN BARU');
  const [premDesc, setPremDesc] = useState<string>('');
  const [premAllowDiscount, setPremAllowDiscount] = useState<boolean>(true);
  const [premIsActive, setPremIsActive] = useState<boolean>(true);
  const [premDurationDays, setPremDurationDays] = useState<number>(365);
  const [premSyncActiveUsers, setPremSyncActiveUsers] = useState<boolean>(false);
  const [premNotice, setPremNotice] = useState<string>('');

  const [isEditingCommission, setIsEditingCommission] = useState(false);
  const [commAmountInput, setCommAmountInput] = useState<number>(activeCommissionAmount);
  const [refDiscountInput, setRefDiscountInput] = useState<number>(activeReferralDiscount);
  const [minWdInput, setMinWdInput] = useState<number>(activeMinWithdrawal);

  // --- Sub-state for 9. Tryout Bersama & 10. Jadwal Zoom ---
  const [tbSearch, setTbSearch] = useState('');
  const [tbSessionFilter, setTbSessionFilter] = useState<string>('ALL');
  const [tbStatusFilter, setTbStatusFilter] = useState<'ALL' | 'UPCOMING' | 'ACTIVE' | 'FINISHED'>('ALL');
  const [tbExamTypeFilter, setTbExamTypeFilter] = useState<'ALL' | ExamType>('ALL');
  const [tbPassFilter, setTbPassFilter] = useState<'ALL' | 'LULUS' | 'BELUM'>('ALL');
  const [tbRankSort, setTbRankSort] = useState<'TOTAL_DESC' | 'TWK_DESC' | 'TIU_DESC' | 'TKP_DESC' | 'TIME_ASC'>('TOTAL_DESC');
  const [tbNotice, setTbNotice] = useState('');

  const [zoomTimeTab, setZoomTimeTab] = useState<'ALL' | 'UPCOMING' | 'PAST'>('ALL');
  const [zoomCatFilter, setZoomCatFilter] = useState<'ALL' | 'ZOOM_BIMBEL_MALAM' | 'TRYOUT_BARENG'>('ALL');
  const [zoomSearch, setZoomSearch] = useState('');
  const [zoomNotice, setZoomNotice] = useState('');
  const [reportOrientation, setReportOrientation] = useState<ReportOrientation>('auto');
  const [reportPaperSize, setReportPaperSize] = useState<ReportPaperSize>('A4');

  const [userSearch, setUserSearch] = useState('');
  const [userFilterBy, setUserFilterBy] = useState<
    | 'ALL'
    | 'PACKAGE'
    | 'ACCOUNT_STATUS'
    | 'PREMIUM_STATUS'
    | 'EDUCATION'
    | 'JOB'
    | 'ADDRESS'
    | 'INFO_SOURCE'
    | 'ROLE'
  >('ALL');
  const [userFilterValue, setUserFilterValue] = useState<string>('ALL');
  const [userSortBy, setUserSortBy] = useState<'CREATED_DESC' | 'NAME_ASC' | 'REMAINING_ASC' | 'REMAINING_DESC'>(
    'CREATED_DESC'
  );
  const [userExportScope, setUserExportScope] = useState<'FILTERED' | 'ALL'>('FILTERED');

  const officialBrandInfo: ReportBrandInfo = {
    appName: 'LOGIN CPNS',
    tagline: 'BIMBEL SKD & SIMULASI CAT',
    subTagline: 'Lembaga Bimbingan Belajar Mandiri · Bank Soal HOTS & Tryout Akbar CPNS',
    whatsapp: settings.admin_whatsapp
      ? settings.admin_whatsapp.startsWith('62')
        ? `0${settings.admin_whatsapp.slice(2)}`
        : settings.admin_whatsapp
      : '0813-1213-9893',
    email: settings.admin_email || OFFICIAL_SENDER_EMAIL,
    address: 'Kampung Jawa, Blangkejeren, Kab. Gayo Lues, Aceh',
    promoInfo:
      'Layanan Bimbel: Simulasi CAT 110 Soal · Tryout Bareng Nasional · Bimbel Zoom Malam · Kalkulator SKD & SKB · Paket Mulai Rp 150.000',
    websiteInfo: 'Bimbel Mandiri Independen · Info Paket & Jadwal Hubungi Admin Blangkejeren'
  };

  const renderPaperAndOrientationControls = (headers: string[], rows: (string | number)[][]) => {
    const resolved = resolveReportOrientation(reportOrientation, reportPaperSize, headers, rows);
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <div
          title="Pilih ukuran kertas siap cetak"
          className="inline-flex rounded-xl border border-slate-300 bg-slate-100 p-0.5 text-[11px] font-bold"
        >
          <button
            type="button"
            onClick={() => setReportPaperSize('A4')}
            className={`px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
              reportPaperSize === 'A4'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            A4
          </button>
          <button
            type="button"
            onClick={() => setReportPaperSize('F4')}
            className={`px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
              reportPaperSize === 'F4'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            F4
          </button>
        </div>

        <div
          title="Otomatis menyesuaikan orientasi Portrait atau Landscape berdasarkan panjang kolom tabel"
          className="inline-flex rounded-xl border border-slate-300 bg-slate-100 p-0.5 text-[11px] font-bold"
        >
          <button
            type="button"
            onClick={() => setReportOrientation('auto')}
            className={`px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
              reportOrientation === 'auto'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Auto ({resolved === 'landscape' ? 'L' : 'P'})
          </button>
          <button
            type="button"
            onClick={() => setReportOrientation('portrait')}
            className={`px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
              reportOrientation === 'portrait'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Portrait
          </button>
          <button
            type="button"
            onClick={() => setReportOrientation('landscape')}
            className={`px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
              reportOrientation === 'landscape'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Landscape
          </button>
        </div>
      </div>
    );
  };

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<GroupSession | null>(null);
  const [sessTitle, setSessTitle] = useState('');
  const [sessDesc, setSessDesc] = useState('');
  const [sessCategory, setSessCategory] = useState<'TRYOUT_BARENG' | 'ZOOM_BIMBEL_MALAM'>('ZOOM_BIMBEL_MALAM');
  const [sessExamType, setSessExamType] = useState<ExamType>('TRYOUT_BERSAMA');
  const [sessStatus, setSessStatus] = useState<'UPCOMING' | 'ACTIVE' | 'FINISHED'>('UPCOMING');
  const [sessStartAt, setSessStartAt] = useState('');
  const [sessEndAt, setSessEndAt] = useState('');
  const [sessDuration, setSessDuration] = useState<number>(100);
  const [sessQuestionCount, setSessQuestionCount] = useState<number>(110);
  const [sessQuota, setSessQuota] = useState<number>(300);
  const [sessCoach, setSessCoach] = useState('');
  const [sessZoomUrl, setSessZoomUrl] = useState('');
  const [sessScheduleNote, setSessScheduleNote] = useState('');
  const [sessPosterUrl, setSessPosterUrl] = useState('');
  const [sessEvidenceList, setSessEvidenceList] = useState<string[]>([]);
  const [sessAttendanceCount, setSessAttendanceCount] = useState<number>(0);
  const [sessSummaryNotes, setSessSummaryNotes] = useState('');
  const [sessIsUploading, setSessIsUploading] = useState(false);
  const [sessionImagePreview, setSessionImagePreview] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  // --- Sub-state for 11. Hasil Ujian Search, Filter & Ranking ---
  const [resSearch, setResSearch] = useState('');
  const [resExamTypeFilter, setResExamTypeFilter] = useState<'ALL' | ExamType>('ALL');
  const [resCategoryFilter, setResCategoryFilter] = useState<'ALL' | QuestionCategory>('ALL');
  const [resPassFilter, setResPassFilter] = useState<'ALL' | 'MEMENUHI_AMBANG_BATAS' | 'BELUM_MEMENUHI'>('ALL');
  const [resRankSort, setResRankSort] = useState<'SCORE_DESC' | 'LATEST_DESC' | 'TWK_DESC' | 'TIU_DESC' | 'TKP_DESC' | 'TIME_ASC'>('SCORE_DESC');

  // --- Sub-state for Import Soal (PRD Section 11.3) ---
  const [importText, setImportText] = useState('');
  const [importPreview, setImportPreview] = useState<Question[]>([]);
  const [importError, setImportError] = useState('');
  const [importPackageId, setImportPackageId] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // --- Sub-state for Material CRUD & Google Drive (PRD Section 12) ---
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [mTitle, setMTitle] = useState('');
  const [mCategory, setMCategory] = useState<MaterialCategory>('TWK');
  const [mSummary, setMSummary] = useState('');
  const [mContent, setMContent] = useState('');
  const [mFileUrl, setMFileUrl] = useState('');
  const [mVideoUrl, setMVideoUrl] = useState('');
  const [mVideoFile, setMVideoFile] = useState<File | null>(null);
  const [mVideoBlobId, setMVideoBlobId] = useState<string | undefined>(undefined);
  const [mVideoFileName, setMVideoFileName] = useState<string | undefined>(undefined);
  const [mVideoFileSize, setMVideoFileSize] = useState<number | undefined>(undefined);
  const [mIsPremium, setMIsPremium] = useState(false);
  const [mIsActive, setMIsActive] = useState(true);
  const [mIsSaving, setMIsSaving] = useState(false);

  // --- Sub-state for Short Video Upload & Management ---
  const [svCategoryFilter, setSvCategoryFilter] = useState<'ALL' | ShortVideoCategory>('ALL');
  const [svSearch, setSvSearch] = useState('');
  const [isShortVideoModalOpen, setIsShortVideoModalOpen] = useState(false);
  const [editingShortVideo, setEditingShortVideo] = useState<ShortVideo | null>(null);
  const [svTitle, setSvTitle] = useState('');
  const [svCategory, setSvCategory] = useState<ShortVideoCategory>('TIU');
  const [svTopic, setSvTopic] = useState('');
  const [svDescription, setSvDescription] = useState('');
  const [svSourceType, setSvSourceType] = useState<ShortVideoSourceType>('UPLOAD');
  const [svVideoUrl, setSvVideoUrl] = useState('');
  const [svDuration, setSvDuration] = useState('01:30');
  const [svIsPremium, setSvIsPremium] = useState(false);
  const [svIsActive, setSvIsActive] = useState(true);
  const [svSelectedFile, setSvSelectedFile] = useState<File | null>(null);
  const [svPreviewUrl, setSvPreviewUrl] = useState<string | null>(null);
  const [svExistingBlobId, setSvExistingBlobId] = useState<string | undefined>(undefined);
  const [svExistingFileName, setSvExistingFileName] = useState<string | undefined>(undefined);
  const [svExistingFileSize, setSvExistingFileSize] = useState<number | undefined>(undefined);
  const [svUploadError, setSvUploadError] = useState('');
  const [svIsSaving, setSvIsSaving] = useState(false);
  const [previewShortVideo, setPreviewShortVideo] = useState<ShortVideo | null>(null);

  // --- Sub-state for Payment Proof Inspection Modal ---
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);

  // --- Passing Grade & Kalkulator SKD local form ---
  const [twkPG, setTwkPG] = useState(settings.default_passing_grade.twk);
  const [tiuPG, setTiuPG] = useState(settings.default_passing_grade.tiu);
  const [tkpPG, setTkpPG] = useState(settings.default_passing_grade.tkp);
  const [regInfo, setRegInfo] = useState(settings.default_passing_grade.regulation_info);
  const [pgSaveNotice, setPgSaveNotice] = useState('');

  const initialCalcCfg = settings.skd_calculator_config || DEFAULT_SKD_CALCULATOR_CONFIG;
  const [calcEnabled, setCalcEnabled] = useState<boolean>(initialCalcCfg.enabled);
  const [calcAccessTier, setCalcAccessTier] = useState<SkdCalculatorConfig['access_tier']>(initialCalcCfg.access_tier);
  const [calcAutoImport110, setCalcAutoImport110] = useState<boolean>(initialCalcCfg.enable_auto_import_110);
  const [calcSkdWeight, setCalcSkdWeight] = useState<number>(initialCalcCfg.skd_weight_percent);
  const [calcSkbWeight, setCalcSkbWeight] = useState<number>(initialCalcCfg.skb_weight_percent);
  const [calcMaxTwk, setCalcMaxTwk] = useState<number>(initialCalcCfg.max_twk);
  const [calcMaxTiu, setCalcMaxTiu] = useState<number>(initialCalcCfg.max_tiu);
  const [calcMaxTkp, setCalcMaxTkp] = useState<number>(initialCalcCfg.max_tkp);
  const [calcMaxSkbCat, setCalcMaxSkbCat] = useState<number>(initialCalcCfg.max_skb_cat);
  const [calcCompSkd, setCalcCompSkd] = useState<number>(initialCalcCfg.default_competitor_skd);
  const [calcCompSkb, setCalcCompSkb] = useState<number>(initialCalcCfg.default_competitor_skb);
  const [calcNote, setCalcNote] = useState<string>(initialCalcCfg.calculator_note || '');
  const [calcSaveNotice, setCalcSaveNotice] = useState('');

  // --- Pengumuman Admin CRUD state ---
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AdminAnnouncement | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annSummary, setAnnSummary] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<AnnouncementCategory>('JADWAL_CPNS');
  const [annIsPinned, setAnnIsPinned] = useState(false);
  const [annIsActive, setAnnIsActive] = useState(true);

  // --- Pengaturan Aplikasi local form ---
  const [appHeadline, setAppHeadline] = useState(settings.headline);
  const [appWhatsapp, setAppWhatsapp] = useState(settings.admin_whatsapp);
  const [appEmail, setAppEmail] = useState(settings.admin_email || OFFICIAL_SENDER_EMAIL);
  const [appMaintenance, setAppMaintenance] = useState(settings.maintenance_mode);
  const [lockMaterialsForPremiumOnly, setLockMaterialsForPremiumOnly] = useState(
    settings.lock_materials_for_premium_only ?? true
  );
  const [standarQuestionsOnly, setStandarQuestionsOnly] = useState(
    settings.standar_questions_only ?? true
  );
  const [installPosterUrl, setInstallPosterUrl] = useState(
    settings.install_tutorial_poster_url || ''
  );
  const [installTutorialImages, setInstallTutorialImages] = useState<InstallTutorialImage[]>(
    settings.install_tutorial_images || []
  );
  const [newTutorialTitle, setNewTutorialTitle] = useState('');
  const [newTutorialCaption, setNewTutorialCaption] = useState('');
  const [isProcessingTutorialMedia, setIsProcessingTutorialMedia] = useState(false);
  const [tutorialUploadError, setTutorialUploadError] = useState('');
  const [tutorialPreviewModal, setTutorialPreviewModal] = useState<{ url: string; title: string } | null>(null);
  const [settingsSavedNotice, setSettingsSavedNotice] = useState('');

  // --- Pengaturan Pembayaran Paket Belajar (Rekening, E-Wallet Non-Tunai, QRIS) ---
  const [nonCashPhone, setNonCashPhone] = useState(
    settings.non_cash_phone || settings.admin_whatsapp || ''
  );
  const [qrisImageUrl, setQrisImageUrl] = useState(settings.qris_image_url || '');
  const [qrisMerchantName, setQrisMerchantName] = useState(
    settings.qris_merchant_name || 'QRIS LOGIN CPNS EDUKASI'
  );
  const [qrisNotes, setQrisNotes] = useState(
    settings.qris_notes || 'Mendukung GoPay, OVO, DANA, ShopeePay, LinkAja, BSI Mobile & Seluruh Bank'
  );
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannelConfig[]>(
    settings.payment_channels || []
  );
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayChannelId, setEditingPayChannelId] = useState<string | null>(null);
  const [payChCategory, setPayChCategory] = useState<PaymentChannelCategory>('BANK');
  const [payChProvider, setPayChProvider] = useState('');
  const [payChNumber, setPayChNumber] = useState('');
  const [payChHolder, setPayChHolder] = useState('');
  const [payChQrUrl, setPayChQrUrl] = useState('');
  const [payChNotes, setPayChNotes] = useState('');
  const [payChActive, setPayChActive] = useState(true);
  const [paymentSettingsError, setPaymentSettingsError] = useState('');
  const [isProcessingQrMedia, setIsProcessingQrMedia] = useState(false);

  useEffect(() => {
    setAppHeadline(settings.headline);
    setAppWhatsapp(settings.admin_whatsapp);
    setAppEmail(settings.admin_email || OFFICIAL_SENDER_EMAIL);
    setAppMaintenance(settings.maintenance_mode);
    setLockMaterialsForPremiumOnly(settings.lock_materials_for_premium_only ?? true);
    setStandarQuestionsOnly(settings.standar_questions_only ?? true);
    setInstallPosterUrl(settings.install_tutorial_poster_url || '');
    setInstallTutorialImages(settings.install_tutorial_images || []);
    setNonCashPhone(settings.non_cash_phone || settings.admin_whatsapp || '');
    setQrisImageUrl(settings.qris_image_url || '');
    setQrisMerchantName(settings.qris_merchant_name || 'QRIS LOGIN CPNS EDUKASI');
    setQrisNotes(
      settings.qris_notes || 'Mendukung GoPay, OVO, DANA, ShopeePay, LinkAja, BSI Mobile & Seluruh Bank'
    );
    setPaymentChannels(settings.payment_channels || []);
  }, [settings]);

  // --- Affiliate approval, vertical partner directory, CRUD & payout states ---
  const [rejectingPartnerUser, setRejectingPartnerUser] = useState<User | null>(null);
  const [rejectAffiliateReason, setRejectAffiliateReason] = useState('');
  const [rejectAffiliateError, setRejectAffiliateError] = useState('');
  const [cancellingWithdrawal, setCancellingWithdrawal] = useState<(typeof commissionWithdrawals)[number] | null>(null);
  const [cancelWithdrawalReason, setCancelWithdrawalReason] = useState('');
  const [cancelWithdrawalError, setCancelWithdrawalError] = useState('');
  const [affiliateAdminFeedback, setAffiliateAdminFeedback] = useState('');
  const [emailLogSearch, setEmailLogSearch] = useState('');

  const [partnerSearch, setPartnerSearch] = useState('');
  const [partnerStatusFilter, setPartnerStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'HAS_UNPAID'>('ALL');
  const [expandedPartnerId, setExpandedPartnerId] = useState<string | null>(null);

  // Edit Mitra Modal state
  const [editingPartner, setEditingPartner] = useState<User | null>(null);
  const [epFullName, setEpFullName] = useState('');
  const [epEmail, setEpEmail] = useState('');
  const [epPhone, setEpPhone] = useState('');
  const [epReferralCode, setEpReferralCode] = useState('');
  const [epStatus, setEpStatus] = useState<AffiliateStatus>('APPROVED');
  const [epRejectionReason, setEpRejectionReason] = useState('');
  const [epBankName, setEpBankName] = useState('');
  const [epAccountNumber, setEpAccountNumber] = useState('');
  const [epAccountHolder, setEpAccountHolder] = useState('');
  const [epError, setEpError] = useState('');

  // Hapus Mitra Modal state
  const [deletingPartner, setDeletingPartner] = useState<User | null>(null);

  // Upload Bukti Transfer & Bayar Komisi Modal state
  const [payoutModal, setPayoutModal] = useState<{
    mode: 'WITHDRAWAL' | 'DIRECT';
    partnerId: string;
    partnerName: string;
    referralCode: string;
    bankInfo: string;
    maxAmount: number;
    withdrawalId?: string;
  } | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutProofUrl, setPayoutProofUrl] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [payoutError, setPayoutError] = useState('');
  const [isProcessingProof, setIsProcessingProof] = useState(false);

  // Preview Bukti Transfer Modal
  const [commissionProofPreview, setCommissionProofPreview] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  const openEditPartnerModal = (partner: User) => {
    setEditingPartner(partner);
    setEpFullName(partner.full_name);
    setEpEmail(partner.email);
    setEpPhone(partner.phone);
    setEpReferralCode(partner.referral_code || '');
    setEpStatus(partner.affiliate_status || (partner.is_affiliate ? 'APPROVED' : 'NONE'));
    setEpRejectionReason(partner.affiliate_rejection_reason || '');
    setEpBankName(partner.affiliate_bank_name || '');
    setEpAccountNumber(partner.affiliate_account_number || '');
    setEpAccountHolder(partner.affiliate_account_holder || '');
    setEpError('');
  };

  const openRejectPartnerModal = (partner: User) => {
    setRejectingPartnerUser(partner);
    setRejectAffiliateReason(partner.affiliate_rejection_reason || '');
    setRejectAffiliateError('');
  };

  const handleConfirmRejectPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPartnerUser) return;
    const cleanReason = rejectAffiliateReason.trim();
    if (!cleanReason) {
      setRejectAffiliateError('Alasan penolakan wajib diisi agar mitra dapat mengetahui dan memperbaiki kesalahannya.');
      return;
    }
    rejectAffiliateApplication(rejectingPartnerUser.id, cleanReason);
    setAffiliateAdminFeedback(
      `Mitra ${rejectingPartnerUser.full_name} ditolak dengan alasan: "${cleanReason}". Notifikasi perbaikan telah dikirim ke ${rejectingPartnerUser.email}.`
    );
    setRejectingPartnerUser(null);
    setRejectAffiliateReason('');
    setRejectAffiliateError('');
  };

  const handleConfirmCancelWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingWithdrawal) return;
    const cleanReason = cancelWithdrawalReason.trim();
    if (!cleanReason) {
      setCancelWithdrawalError('Alasan pembatalan pencairan komisi wajib diisi.');
      return;
    }
    const res = cancelWithdrawalByAdmin(cancellingWithdrawal.id, cleanReason);
    if (!res.success) {
      setCancelWithdrawalError(res.message);
      return;
    }
    setAffiliateAdminFeedback(res.message);
    setCancellingWithdrawal(null);
    setCancelWithdrawalReason('');
    setCancelWithdrawalError('');
  };

  const handleSaveEditPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;
    setEpError('');
    if (epStatus === 'REJECTED' && !epRejectionReason.trim()) {
      setEpError('Alasan penolakan mitra wajib diisi agar mitra dapat memperbaiki kesalahannya.');
      return;
    }
    const res = updatePartnerByAdmin(editingPartner.id, {
      full_name: epFullName,
      email: epEmail,
      phone: epPhone,
      referral_code: epReferralCode,
      affiliate_status: epStatus,
      affiliate_rejection_reason: epStatus === 'REJECTED' ? epRejectionReason.trim() : undefined,
      affiliate_bank_name: epBankName,
      affiliate_account_number: epAccountNumber,
      affiliate_account_holder: epAccountHolder
    });
    if (!res.success) {
      setEpError(res.message);
      return;
    }
    setAffiliateAdminFeedback(res.message);
    setEditingPartner(null);
  };

  const openPayoutModalForPartner = (
    partner: User,
    unpaidBalance: number,
    pendingWithdrawal?: (typeof commissionWithdrawals)[number]
  ) => {
    setPayoutError('');
    setPayoutProofUrl('');
    setPayoutNotes('');
    if (pendingWithdrawal) {
      setPayoutModal({
        mode: 'WITHDRAWAL',
        partnerId: partner.id,
        partnerName: partner.full_name,
        referralCode: partner.referral_code || pendingWithdrawal.referral_code,
        bankInfo: `${pendingWithdrawal.bank_name} · ${pendingWithdrawal.account_number} a.n. ${pendingWithdrawal.account_holder}`,
        maxAmount: Math.max(unpaidBalance, pendingWithdrawal.amount),
        withdrawalId: pendingWithdrawal.id
      });
      setPayoutAmount(pendingWithdrawal.amount);
    } else {
      const bankSummary = partner.affiliate_bank_name
        ? `${partner.affiliate_bank_name} · ${partner.affiliate_account_number || '-'} a.n. ${partner.affiliate_account_holder || partner.full_name}`
        : `Transfer Manual (${partner.phone || partner.email})`;
      setPayoutModal({
        mode: 'DIRECT',
        partnerId: partner.id,
        partnerName: partner.full_name,
        referralCode: partner.referral_code || '-',
        bankInfo: bankSummary,
        maxAmount: unpaidBalance
      });
      setPayoutAmount(unpaidBalance);
    }
  };

  const handlePayoutFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPayoutError('');
    if (!file.type.startsWith('image/')) {
      setPayoutError('Mohon unggah file gambar bukti transfer (JPG, PNG, atau WEBP).');
      e.target.value = '';
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setPayoutError('Ukuran file bukti transfer maksimal 6 MB.');
      e.target.value = '';
      return;
    }

    setIsProcessingProof(true);
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        const maxW = 900;
        let w = img.width;
        let h = img.height;
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          setPayoutProofUrl(canvas.toDataURL('image/jpeg', 0.82));
        } else {
          setPayoutProofUrl(rawDataUrl);
        }
        setIsProcessingProof(false);
      };
      img.onerror = () => {
        setIsProcessingProof(false);
        setPayoutError('Gagal memproses file gambar bukti transfer.');
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      setIsProcessingProof(false);
      setPayoutError('Gagal membaca file gambar.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleConfirmPayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutModal) return;
    setPayoutError('');

    if (!payoutProofUrl.trim()) {
      setPayoutError('Mohon upload bukti transfer terlebih dahulu sebelum klik Sudah Bayar.');
      return;
    }

    if (payoutModal.mode === 'WITHDRAWAL' && payoutModal.withdrawalId) {
      markWithdrawalPaid(payoutModal.withdrawalId, payoutProofUrl, payoutNotes);
      setAffiliateAdminFeedback(
        `Pembayaran komisi Rp ${payoutAmount.toLocaleString('id-ID')} untuk ${payoutModal.partnerName} ditandai SUDAH BAYAR + bukti transfer tersimpan. Saldo belum dibayar otomatis berkurang.`
      );
      setPayoutModal(null);
      return;
    }

    const res = payPartnerCommissionDirect({
      partnerId: payoutModal.partnerId,
      amount: payoutAmount,
      proofUrl: payoutProofUrl,
      notes: payoutNotes
    });
    if (!res.success) {
      setPayoutError(res.message);
      return;
    }
    setAffiliateAdminFeedback(res.message);
    setPayoutModal(null);
  };

  // Admin summary counters per PRD Section 16.1
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(u => u.account_status === 'ACTIVE').length;
  const premiumUsersCount = users.filter(u => u.membership_type !== 'FREE').length;
  const pendingPaymentsCount = payments.filter(p => p.status === 'WAITING_VERIFICATION').length;
  const pendingAffiliatesCount = users.filter(u => u.affiliate_status === 'PENDING').length;
  const activeQuestionsCount = questions.filter(q => q.is_active).length;
  const materialsCount = materials.length;
  const upcomingSessionsCount = groupSessions.filter(s => s.status === 'UPCOMING').length;

  const handleOpenNewMaterial = () => {
    setEditingMaterial(null);
    setMTitle('');
    setMCategory('TWK');
    setMSummary('');
    setMContent('');
    setMFileUrl('');
    setMVideoUrl('');
    setMVideoFile(null);
    setMVideoBlobId(undefined);
    setMVideoFileName(undefined);
    setMVideoFileSize(undefined);
    setMIsPremium(false);
    setMIsActive(true);
    setIsMaterialModalOpen(true);
  };

  const handleOpenEditMaterial = (m: Material) => {
    setEditingMaterial(m);
    setMTitle(m.title);
    setMCategory(m.category);
    setMSummary(m.summary);
    setMContent(m.content);
    setMFileUrl(m.file_url || '');
    setMVideoUrl(m.video_url || '');
    setMVideoFile(null);
    setMVideoBlobId(m.video_blob_id);
    setMVideoFileName(m.video_file_name);
    setMVideoFileSize(m.video_file_size_bytes);
    setMIsPremium(m.is_premium);
    setMIsActive(m.is_active);
    setIsMaterialModalOpen(true);
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle.trim()) {
      alert('Mohon isi judul materi.');
      return;
    }

    setMIsSaving(true);
    try {
      let nextBlobId = mVideoBlobId;
      let nextFileName = mVideoFileName;
      let nextFileSize = mVideoFileSize;

      if (mVideoFile) {
        nextBlobId = `mat-vid-${Date.now()}`;
        await saveVideoBlob(nextBlobId, mVideoFile);
        nextFileName = mVideoFile.name;
        nextFileSize = mVideoFile.size;
      }

      if (editingMaterial) {
        updateMaterial({
          ...editingMaterial,
          title: mTitle,
          category: mCategory,
          summary: mSummary,
          intro: editingMaterial.intro === editingMaterial.summary ? mSummary : editingMaterial.intro,
          content: mContent,
          file_url: mFileUrl.trim() || undefined,
          video_url: mVideoUrl.trim() || undefined,
          video_blob_id: nextBlobId,
          video_file_name: nextFileName,
          video_file_size_bytes: nextFileSize,
          is_premium: mIsPremium,
          is_active: mIsActive,
          updated_at: new Date().toISOString()
        });
      } else {
        addMaterial({
          title: mTitle,
          category: mCategory,
          summary: mSummary,
          content: mContent,
          file_url: mFileUrl.trim() || undefined,
          video_url: mVideoUrl.trim() || undefined,
          video_blob_id: nextBlobId,
          video_file_name: nextFileName,
          video_file_size_bytes: nextFileSize,
          is_premium: mIsPremium,
          is_active: mIsActive
        });
      }

      setIsMaterialModalOpen(false);
      setEditingMaterial(null);
      setMVideoFile(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan file video ke browser.');
    } finally {
      setMIsSaving(false);
    }
  };

  const clearSvPreviewUrl = () => {
    if (svPreviewUrl) {
      URL.revokeObjectURL(svPreviewUrl);
      setSvPreviewUrl(null);
    }
  };

  const handleOpenNewShortVideo = () => {
    clearSvPreviewUrl();
    setEditingShortVideo(null);
    setSvTitle('');
    setSvCategory('TIU');
    setSvTopic('');
    setSvDescription('');
    setSvSourceType('UPLOAD');
    setSvVideoUrl('');
    setSvDuration('01:30');
    setSvIsPremium(false);
    setSvIsActive(true);
    setSvSelectedFile(null);
    setSvExistingBlobId(undefined);
    setSvExistingFileName(undefined);
    setSvExistingFileSize(undefined);
    setSvUploadError('');
    setIsShortVideoModalOpen(true);
  };

  const handleOpenEditShortVideo = (sv: ShortVideo) => {
    clearSvPreviewUrl();
    setEditingShortVideo(sv);
    setSvTitle(sv.title);
    setSvCategory(sv.category);
    setSvTopic(sv.topic || '');
    setSvDescription(sv.description);
    setSvSourceType(sv.source_type);
    setSvVideoUrl(sv.video_url || '');
    setSvDuration(sv.duration_label || '01:30');
    setSvIsPremium(sv.is_premium);
    setSvIsActive(sv.is_active);
    setSvSelectedFile(null);
    setSvExistingBlobId(sv.video_blob_id);
    setSvExistingFileName(sv.file_name);
    setSvExistingFileSize(sv.file_size_bytes);
    setSvUploadError('');
    setIsShortVideoModalOpen(true);
  };

  const handleShortVideoFileSelect = async (file: File | null) => {
    setSvUploadError('');
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setSvUploadError('Format file harus berupa video (MP4, WebM, MOV, atau format video lain).');
      return;
    }

    const maxBytes = 150 * 1024 * 1024; // 150 MB
    if (file.size > maxBytes) {
      setSvUploadError('Ukuran video maksimal 150 MB agar dapat diputar lancar di browser.');
      return;
    }

    clearSvPreviewUrl();
    const preview = URL.createObjectURL(file);
    setSvPreviewUrl(preview);
    setSvSelectedFile(file);

    if (!svTitle.trim()) {
      const cleanName = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
      setSvTitle(cleanName);
    }

    const detectedDuration = await readVideoDurationFromFile(file);
    if (detectedDuration) {
      setSvDuration(detectedDuration);
    }
  };

  const handleSaveShortVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSvUploadError('');

    if (!svTitle.trim()) {
      setSvUploadError('Judul short video wajib diisi.');
      return;
    }

    if (svSourceType === 'UPLOAD' && !svSelectedFile && !svExistingBlobId) {
      setSvUploadError('Silakan pilih file video (MP4/WebM/MOV) untuk diupload terlebih dahulu.');
      return;
    }

    if (svSourceType === 'URL' && !svVideoUrl.trim() && !editingShortVideo) {
      setSvUploadError('Masukkan link video (YouTube / Google Drive / URL MP4) atau beralih ke tab Upload File.');
      return;
    }

    setSvIsSaving(true);
    try {
      let nextBlobId: string | undefined = svSourceType === 'UPLOAD' ? svExistingBlobId : undefined;
      let nextFileName: string | undefined = svSourceType === 'UPLOAD' ? svExistingFileName : undefined;
      let nextFileSize: number | undefined = svSourceType === 'UPLOAD' ? svExistingFileSize : undefined;
      let nextMimeType: string | undefined = svSourceType === 'UPLOAD' ? editingShortVideo?.mime_type : undefined;

      if (svSourceType === 'UPLOAD' && svSelectedFile) {
        nextBlobId = `sv-blob-${Date.now()}`;
        await saveVideoBlob(nextBlobId, svSelectedFile);
        nextFileName = svSelectedFile.name;
        nextFileSize = svSelectedFile.size;
        nextMimeType = svSelectedFile.type || 'video/mp4';
      }

      const payload: Omit<ShortVideo, 'id' | 'created_at'> = {
        title: svTitle.trim(),
        category: svCategory,
        topic: svTopic.trim() || undefined,
        description: svDescription.trim() || 'Pembahasan singkat materi SKD CPNS.',
        source_type: svSourceType,
        video_blob_id: nextBlobId,
        video_url: svSourceType === 'URL' ? svVideoUrl.trim() || undefined : undefined,
        file_name: nextFileName,
        file_size_bytes: nextFileSize,
        mime_type: nextMimeType,
        duration_label: svDuration.trim() || undefined,
        is_premium: svIsPremium,
        is_active: svIsActive,
        author_name: editingShortVideo?.author_name || currentUser?.full_name || 'Super Admin'
      };

      if (editingShortVideo) {
        updateShortVideo({
          ...editingShortVideo,
          ...payload
        });
      } else {
        addShortVideo(payload);
      }

      clearSvPreviewUrl();
      setIsShortVideoModalOpen(false);
      setEditingShortVideo(null);
      setSvSelectedFile(null);
    } catch (err) {
      setSvUploadError(err instanceof Error ? err.message : 'Gagal menyimpan file video.');
    } finally {
      setSvIsSaving(false);
    }
  };

  // Handlers for Question CRUD with Package Assignment
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !qOptA.trim() || !qOptB.trim()) {
      alert('Mohon lengkapi pertanyaan dan pilihan jawaban.');
      return;
    }

    const allAssignedPkgIds = Array.from(
      new Set([...(qPackageId ? [qPackageId] : []), ...qExtraPackageIds])
    );

    if (editingQuestion) {
      updateQuestion({
        ...editingQuestion,
        category: qCat,
        topic: qTopic || 'Umum',
        question_text: qText,
        option_a: qOptA,
        option_b: qOptB,
        option_c: qOptC,
        option_d: qOptD,
        option_e: qOptE,
        correct_answer: qKey,
        weight_a: Number(qWeightA),
        weight_b: Number(qWeightB),
        weight_c: Number(qWeightC),
        weight_d: Number(qWeightD),
        weight_e: Number(qWeightE),
        explanation: qExp,
        difficulty: qDiff,
        package_id: qPackageId || allAssignedPkgIds[0] || undefined,
        package_title:
          qPackageTitle ||
          (allAssignedPkgIds[0]
            ? practicePackages.find(p => p.id === allAssignedPkgIds[0])?.title
            : undefined),
        package_ids: allAssignedPkgIds,
        is_active: editingQuestion.is_active
      });
    } else {
      addQuestion({
        category: qCat,
        topic: qTopic || 'Umum',
        question_text: qText,
        option_a: qOptA,
        option_b: qOptB,
        option_c: qOptC,
        option_d: qOptD,
        option_e: qOptE,
        correct_answer: qKey,
        weight_a: Number(qWeightA),
        weight_b: Number(qWeightB),
        weight_c: Number(qWeightC),
        weight_d: Number(qWeightD),
        weight_e: Number(qWeightE),
        explanation: qExp,
        difficulty: qDiff,
        package_id: qPackageId || allAssignedPkgIds[0] || undefined,
        package_title:
          qPackageTitle ||
          (allAssignedPkgIds[0]
            ? practicePackages.find(p => p.id === allAssignedPkgIds[0])?.title
            : undefined),
        package_ids: allAssignedPkgIds,
        is_active: true
      });
    }

    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const handleOpenNewQuestion = (
    packageId?: string,
    packageTitle?: string,
    initialMode: 'NEW' | 'PICK_EXISTING' = 'NEW'
  ) => {
    setEditingQuestion(null);
    setQuestionModalMode(initialMode);
    setQPackageId(packageId || '');
    setQPackageTitle(packageTitle || '');
    setQExtraPackageIds([]);
    setPickSearch('');
    setPickCatFilter('ALL');
    setPickSourcePkgFilter('ALL');
    setPickHideAlreadyAssigned(false);
    setPickSelectedIds([]);
    const matchedPkg = practicePackages.find(p => p.id === packageId);
    if (matchedPkg && matchedPkg.category !== 'CAMPURAN') {
      setQCat(matchedPkg.category);
    } else if (!matchedPkg && adminBankCatFilter !== 'ALL' && adminBankCatFilter !== 'CAMPURAN') {
      setQCat(adminBankCatFilter);
    }
    setQText('');
    setQTopic(packageTitle || '');
    setQOptA('');
    setQOptB('');
    setQOptC('');
    setQOptD('');
    setQOptE('');
    setQExp('');
    setIsQuestionModalOpen(true);
  };

  const openEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setQuestionModalMode('NEW');
    setQCat(q.category);
    setQTopic(q.topic);
    const primaryId = q.package_id || '';
    setQPackageId(primaryId);
    setQPackageTitle(q.package_title || '');
    setQExtraPackageIds(getQuestionPackageIds(q).filter(id => id !== primaryId));
    setQText(q.question_text);
    setQOptA(q.option_a);
    setQOptB(q.option_b);
    setQOptC(q.option_c);
    setQOptD(q.option_d);
    setQOptE(q.option_e);
    setQKey(q.correct_answer);
    setQWeightA(q.weight_a);
    setQWeightB(q.weight_b);
    setQWeightC(q.weight_c);
    setQWeightD(q.weight_d);
    setQWeightE(q.weight_e);
    setQExp(q.explanation);
    setQDiff(q.difficulty);
    setIsQuestionModalOpen(true);
  };

  const handleConfirmPickQuestions = () => {
    if (!qPackageId) {
      alert('Silakan pilih Kotak / Paket Soal tujuan terlebih dahulu.');
      return;
    }
    if (pickSelectedIds.length === 0) {
      alert('Pilih minimal satu butir soal dari Daftar Semua Butir Soal.');
      return;
    }
    const targetPkg = practicePackages.find(p => p.id === qPackageId);
    const newlyAdded = assignQuestionsToPackage(pickSelectedIds, qPackageId);
    setIsQuestionModalOpen(false);
    setPickSelectedIds([]);
    setBankAssignNotice(
      `Berhasil memasukkan ${pickSelectedIds.length} soal (${newlyAdded} soal baru ditambahkan) ke kotak "${targetPkg?.title || qPackageTitle}". Soal tetap tersimpan di kotak asalnya.`
    );
    setTimeout(() => setBankAssignNotice(''), 6000);
  };

  const handleBulkAssignFromTable = () => {
    if (!bulkTargetPkgId) {
      alert('Pilih Kotak / Paket Soal tujuan terlebih dahulu.');
      return;
    }
    if (selectedBankQuestionIds.length === 0) {
      alert('Centang minimal satu soal pada tabel terlebih dahulu.');
      return;
    }
    const targetPkg = practicePackages.find(p => p.id === bulkTargetPkgId);
    const newlyAdded = assignQuestionsToPackage(selectedBankQuestionIds, bulkTargetPkgId);
    setSelectedBankQuestionIds([]);
    setBankAssignNotice(
      `Berhasil memasukkan ${selectedBankQuestionIds.length} soal (${newlyAdded} soal baru ditambahkan) ke kotak "${targetPkg?.title || ''}".`
    );
    setTimeout(() => setBankAssignNotice(''), 6000);
  };

  // Handlers for Practice Package / Kotak Soal CRUD
  const handleOpenNewPackage = () => {
    setEditingPackage(null);
    setPTitle('');
    setPSubtitle('');
    if (adminBankMenuFilter === 'TRYOUT_LENGKAP') {
      setPType('TRYOUT_SKD');
      setPCat('CAMPURAN');
      setPCount(110);
      setPDuration(100);
    } else if (adminBankMenuFilter === 'TRYOUT_KATEGORI') {
      setPType('DRILL_KATEGORI');
      setPCat(adminBankCatFilter !== 'ALL' && adminBankCatFilter !== 'CAMPURAN' ? adminBankCatFilter : 'TWK');
      setPCount(30);
      setPDuration(25);
    } else if (adminBankMenuFilter === 'TRYOUT_BARENG') {
      setPType('TRYOUT_AKBAR');
      setPCat('CAMPURAN');
      setPCount(110);
      setPDuration(100);
    } else {
      setPType('LATIHAN_HARIAN');
      setPCat(adminBankCatFilter !== 'ALL' && adminBankCatFilter !== 'CAMPURAN' ? adminBankCatFilter : 'TIU');
      setPCount(15);
      setPDuration(15);
    }
    setPTier(adminBankTierFilter !== 'ALL' ? adminBankTierFilter : 'PREMIUM');
    setPDesc('');
    setIsPackageModalOpen(true);
  };

  const handleOpenEditPackage = (pkg: PracticePackage) => {
    setEditingPackage(pkg);
    setPTitle(pkg.title);
    setPSubtitle(pkg.subtitle || '');
    setPType(pkg.package_type);
    setPCat(pkg.category);
    setPTier(pkg.access_tier);
    setPCount(pkg.question_count);
    setPDuration(pkg.duration_minutes);
    setPDesc(pkg.description || '');
    setIsPackageModalOpen(true);
  };

  const handleSavePracticePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle.trim()) {
      alert('Mohon isi judul paket/kotak soal.');
      return;
    }

    if (editingPackage) {
      updatePracticePackage({
        ...editingPackage,
        title: pTitle.trim(),
        subtitle: pSubtitle.trim() || undefined,
        package_type: pType,
        category: pCat,
        access_tier: pTier,
        question_count: Number(pCount) || 10,
        duration_minutes: Number(pDuration) || 10,
        description: pDesc.trim() || undefined
      });
    } else {
      addPracticePackage({
        title: pTitle.trim(),
        subtitle: pSubtitle.trim() || undefined,
        package_type: pType,
        category: pCat,
        access_tier: pTier,
        question_count: Number(pCount) || 10,
        duration_minutes: Number(pDuration) || 10,
        description: pDesc.trim() || undefined,
        rating: 4.6,
        review_count: 50,
        completed_count: 100,
        is_active: true
      });
    }

    setIsPackageModalOpen(false);
    setEditingPackage(null);
  };

  // Payment & Affiliate Referral Export Functions (CSV, Word DOCX, and Print / PDF)
  const getPaymentPartnerDetails = (p: (typeof payments)[number]) => {
    const buyer = users.find(u => u.id === p.user_id || u.email === p.user_email);
    const partner = p.affiliate_user_id
      ? users.find(u => u.id === p.affiliate_user_id)
      : p.referral_code
      ? users.find(u => u.referral_code && u.referral_code.toUpperCase() === p.referral_code?.toUpperCase())
      : undefined;

    const regDate = p.user_registered_at || buyer?.created_at || p.created_at;
    const commission = p.affiliate_commission ?? 0;
    const isPartnerCommissionable = commission > 0 && p.commission_status !== 'NOT_APPLICABLE';
    const commissionLabel = !isPartnerCommissionable
      ? '-'
      : p.commission_status === 'PAID'
      ? 'SUDAH DIBAYARKAN'
      : p.status !== 'APPROVED'
      ? 'MENUNGGU BAYAR LUNAS'
      : 'BELUM DIBAYAR';

    const partnerBank = partner?.affiliate_bank_name
      ? `${partner.affiliate_bank_name} ${partner.affiliate_account_number || ''} a.n. ${partner.affiliate_account_holder || partner.full_name}`
      : '-';

    const isUpgrade = Boolean(p.is_package_upgrade);
    const previousPkgName =
      p.previous_package_name ||
      (p.previous_membership_type ? `Paket ${p.previous_membership_type}` : '-');
    const upgradeCredit = p.upgrade_credit_amount ?? 0;

    return {
      buyer,
      partner,
      phone: p.user_phone || buyer?.phone || '-',
      regDate,
      isUpgrade,
      previousPkgName,
      upgradeCredit,
      originalAmount: p.original_amount ?? p.amount,
      promoDiscount: p.promo_discount ?? 0,
      referralCode: p.referral_code || '-',
      referralDiscount: p.referral_discount ?? 0,
      partnerName: p.affiliate_name || partner?.full_name || '-',
      partnerPhone: partner?.phone || '-',
      partnerBank,
      commission,
      isPartnerCommissionable,
      commissionLabel
    };
  };

  const approvedRevenueTotal = payments.filter(p => p.status === 'APPROVED').reduce((sum, p) => sum + p.amount, 0);
  const pendingRevenueTotal = payments.filter(p => p.status === 'WAITING_VERIFICATION').reduce((sum, p) => sum + p.amount, 0);
  const commissionPaidTotal = payments
    .filter(p => p.status === 'APPROVED' && (p.affiliate_commission || 0) > 0 && p.commission_status === 'PAID')
    .reduce((sum, p) => sum + (p.affiliate_commission || 0), 0);
  const commissionUnpaidTotal = payments
    .filter(p => p.status === 'APPROVED' && (p.affiliate_commission || 0) > 0 && p.commission_status !== 'PAID')
    .reduce((sum, p) => sum + (p.affiliate_commission || 0), 0);
  const totalCommissionPayable = commissionPaidTotal + commissionUnpaidTotal;

  const exportPaymentsToCSV = () => {
    const upgradeCount = payments.filter(p => p.is_package_upgrade).length;
    let csv = '\uFEFF'; // UTF-8 BOM for Microsoft Excel
    csv += 'LAPORAN REKAPITULASI PEMBAYARAN, PERALIHAN PAKET, AFILIASI MITRA & KOMISI REFERRAL - LOGIN CPNS\n';
    csv += `Tanggal Ekspor;${new Date().toLocaleString('id-ID')}\n`;
    csv += `Total Pemasukan Bersih (Disetujui);Rp ${approvedRevenueTotal.toLocaleString('id-ID')}\n`;
    csv += `Total Menunggu Verifikasi;Rp ${pendingRevenueTotal.toLocaleString('id-ID')}\n`;
    csv += `Total Komisi Mitra Wajib Dibayar (Lunas);Rp ${totalCommissionPayable.toLocaleString('id-ID')}\n`;
    csv += `Total Komisi Sudah Dibayarkan;Rp ${commissionPaidTotal.toLocaleString('id-ID')}\n`;
    csv += `Total Komisi Belum Dibayar;Rp ${commissionUnpaidTotal.toLocaleString('id-ID')}\n`;
    csv += `Total Transaksi Masuk;${payments.length} (Peralihan/Upgrade Paket: ${upgradeCount})\n\n`;
    csv += 'No;ID Transaksi;Tanggal Daftar;Tanggal Bayar;Nama Siswa;Email;No. WhatsApp;Jenis Transaksi;Paket Tujuan;Paket Sebelumnya;Harga Asli Paket (Rp);Potongan Paket Sblm (Rp);Diskon Promo (Rp);Kode Referral;Potongan Referral (Rp);Total Selisih / Nominal Bayar (Rp);Metode Pembayaran;Status Pembayaran;Mitra Pemilik Kode;WA Mitra;Rekening Mitra;Komisi Mitra (Rp);Status Komisi;Tgl Bayar Komisi;Diverifikasi Oleh;Catatan\n';

    payments.forEach((p, idx) => {
      const d = getPaymentPartnerDetails(p);
      const regDateStr = new Date(d.regDate).toLocaleDateString('id-ID');
      const payDateStr = new Date(p.created_at).toLocaleDateString('id-ID');
      const commPaidAtStr = p.commission_paid_at ? new Date(p.commission_paid_at).toLocaleDateString('id-ID') : '-';
      const cleanName = `"${p.user_name.replace(/"/g, '""')}"`;
      const cleanEmail = `"${p.user_email.replace(/"/g, '""')}"`;
      const txType = d.isUpgrade ? '"Peralihan / Upgrade Paket"' : '"Pembelian Baru"';
      const cleanPkg = `"${p.package_name.replace(/"/g, '""')}"`;
      const cleanPrevPkg = `"${d.previousPkgName.replace(/"/g, '""')}"`;
      const cleanPartner = `"${d.partnerName.replace(/"/g, '""')}"`;
      const cleanBank = `"${d.partnerBank.replace(/"/g, '""')}"`;
      const cleanReason = p.rejection_reason ? `"${p.rejection_reason.replace(/"/g, '""')}"` : '-';

      csv += `${idx + 1};${p.id};${regDateStr};${payDateStr};${cleanName};${cleanEmail};${d.phone};${txType};${cleanPkg};${cleanPrevPkg};${d.originalAmount};${d.upgradeCredit};${d.promoDiscount};${d.referralCode};${d.referralDiscount};${p.amount};${p.payment_method};${p.status};${cleanPartner};${d.partnerPhone};${cleanBank};${d.commission};${d.commissionLabel};${commPaidAtStr};${p.verified_by || '-'};${cleanReason}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Pembayaran_Afiliasi_LOGINCPNS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportPaymentsToWord = () => {
    const approvedCount = payments.filter(p => p.status === 'APPROVED').length;

    const rowsHtml = payments
      .map((p, idx) => {
        const d = getPaymentPartnerDetails(p);
        const regDate = new Date(d.regDate).toLocaleDateString('id-ID');
        const payDate = new Date(p.created_at).toLocaleDateString('id-ID');
        const statusBadge =
          p.status === 'APPROVED'
            ? '<span style="color: #059669; font-weight: bold;">DISETUJUI</span>'
            : p.status === 'REJECTED'
            ? '<span style="color: #dc2626; font-weight: bold;">DITOLAK</span>'
            : '<span style="color: #d97706; font-weight: bold;">MENUNGGU</span>';
        const commBadge =
          d.commissionLabel === 'SUDAH DIBAYARKAN'
            ? '<span style="color: #1d4ed8; font-weight: bold;">SUDAH DIBAYAR</span>'
            : d.commissionLabel === 'BELUM DIBAYAR'
            ? '<span style="color: #b45309; font-weight: bold;">BELUM DIBAYAR</span>'
            : `<span style="color: #64748b;">${d.commissionLabel}</span>`;

        const pkgDetailHtml = d.isUpgrade
          ? `${p.package_name}<br><small style="color: #4f46e5; font-weight: bold;">PERALIHAN (Dari ${d.previousPkgName})</small><br><small style="color: #64748b;">Asli Rp ${d.originalAmount.toLocaleString('id-ID')} - Sblm Rp ${d.upgradeCredit.toLocaleString('id-ID')} · Ref: Rp 0</small>`
          : `${p.package_name}<br><small>Ref: <strong>${d.referralCode}</strong> (-Rp ${d.referralDiscount.toLocaleString('id-ID')})</small>`;

        return `
          <tr>
            <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; font-size: 9pt;">Daftar: ${regDate}<br>Bayar: ${payDate}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;"><strong>${p.user_name}</strong><br><small style="color: #64748b;">${p.user_email} | ${d.phone}</small></td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${pkgDetailHtml}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; text-align: right;">Rp ${p.amount.toLocaleString('id-ID')}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;"><strong>${d.partnerName}</strong><br><small style="color: #64748b;">WA: ${d.partnerPhone}<br>Rek: ${d.partnerBank}</small></td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: right;"><strong>Rp ${d.commission.toLocaleString('id-ID')}</strong><br>${commBadge}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${statusBadge}</td>
          </tr>
        `;
      })
      .join('');

    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Laporan Keuangan, Referral & Komisi Mitra LOGIN CPNS</title>
      <style>
        body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; margin: 24px; font-size: 10pt; color: #1e293b; }
        h1 { color: #1d4ed8; font-size: 16pt; margin-bottom: 4px; }
        h2 { color: #334155; font-size: 12pt; margin-top: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
        .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .summary-table td { padding: 8px; border: 1px solid #cbd5e1; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 9pt; }
        .data-table th { background-color: #f1f5f9; padding: 8px; border: 1px solid #94a3b8; font-weight: bold; text-align: left; }
      </style>
      </head>
      <body>
        <div style="border-bottom: 2px solid #1d4ed8; padding-bottom: 10px; margin-bottom: 18px;">
          <h1>LOGIN CPNS – PLATFORM BIMBEL &amp; SIMULASI CAT SKD</h1>
          <p style="margin: 0; color: #64748b; font-weight: bold;">Laporan Rekapitulasi Pembayaran, Penggunaan Kode Referral &amp; Komisi Mitra Afiliasi</p>
          <p style="margin: 4px 0 0 0; font-size: 9pt; color: #64748b;">Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <h2>I. Ringkasan Keuangan, Omzet &amp; Komisi Mitra</h2>
        <table class="summary-table">
          <tr style="background-color: #f8fafc;">
            <td><strong>Total Pemasukan Bersih (Disetujui)</strong></td>
            <td style="font-size: 12pt; font-weight: bold; color: #15803d; text-align: right;">Rp ${approvedRevenueTotal.toLocaleString('id-ID')}</td>
          </tr>
          <tr>
            <td><strong>Potensi Pemasukan (Menunggu Verifikasi)</strong></td>
            <td style="font-size: 11pt; font-weight: bold; color: #b45309; text-align: right;">Rp ${pendingRevenueTotal.toLocaleString('id-ID')}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td><strong>Total Komisi Mitra Sudah Dibayarkan</strong></td>
            <td style="font-size: 11pt; font-weight: bold; color: #1d4ed8; text-align: right;">Rp ${commissionPaidTotal.toLocaleString('id-ID')}</td>
          </tr>
          <tr>
            <td><strong>Total Komisi Mitra Belum Dibayar</strong></td>
            <td style="font-size: 11pt; font-weight: bold; color: #dc2626; text-align: right;">Rp ${commissionUnpaidTotal.toLocaleString('id-ID')}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td><strong>Total Siswa Berbayar Aktif / Total Transaksi</strong></td>
            <td style="font-size: 11pt; font-weight: bold; text-align: right;">${approvedCount} Siswa Lunas / ${payments.length} Transaksi</td>
          </tr>
        </table>

        <h2>II. Rincian Transaksi Peserta, Kode Referral &amp; Data Mitra</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Tgl Daftar &amp; Bayar</th>
              <th>Siswa &amp; Kontak</th>
              <th>Paket &amp; Referral</th>
              <th>Nominal Bayar</th>
              <th>Mitra Pemilik Kode &amp; Rek</th>
              <th>Komisi &amp; Status</th>
              <th>Status Bayar</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div style="margin-top: 32px; text-align: right;">
          <p style="margin-bottom: 45px;">Disahkan oleh Bendahara / Super Admin,</p>
          <p><strong>Dr. Hendra Wijaya</strong><br><span style="font-size: 9pt; color: #64748b;">LOGIN CPNS Management</span></p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([wordHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Keuangan_Afiliasi_LOGINCPNS_${new Date().toISOString().slice(0, 10)}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintPaymentReport = () => {
    setIsPrintReportOpen(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Template Download & File Upload Helpers for Import Soal
  const downloadTemplateTxt = (targetPkg?: PracticePackage) => {
    const pkgTitle = targetPkg?.title || 'TIU 1 : Penalaran Logis';
    const pkgCat = targetPkg && targetPkg.category !== 'CAMPURAN' ? targetPkg.category : 'TIU';

    const content = `# TEMPLATE IMPORT SOAL LOGIN CPNS (FORMAT TEKS / WORD)
# =====================================================================
# PANDUAN PENGISIAN:
# 1. Setiap butir soal WAJIB dipisahkan dengan baris ===SOAL===
# 2. KATEGORI isi dengan: TWK, TIU, atau TKP
# 3. Untuk TWK & TIU: KUNCI JAWABAN isi huruf A / B / C / D / E
# 4. Untuk TKP: isi BOBOT_A s/d BOBOT_E angka 1 sampai 5
# 5. Simpan sebagai .txt atau salin langsung ke kotak Import Soal
# =====================================================================

===SOAL===
KATEGORI: ${pkgCat}
JUDUL: ${pkgTitle}
PERTANYAAN: Semua ASN wajib menjunjung tinggi netralitas. Budi adalah seorang ASN. Kesimpulan yang paling tepat adalah...
A: Budi tidak harus bersikap netral di luar jam kerja
B: Budi wajib menjunjung tinggi netralitas
C: Sebagian ASN seperti Budi bersifat netral
D: Netralitas hanya berlaku bagi pimpinan instansi
E: Budi bukan ASN yang netral
KUNCI JAWABAN: B
PEMBAHASAN: Berdasarkan silogisme kategorik (Modus Barbara): Semua A adalah B, X adalah A, maka X adalah B. Jadi Budi wajib menjunjung tinggi netralitas.
TINGKAT KESULITAN: Sedang

===SOAL===
KATEGORI: TWK
JUDUL: Pilar Kebangsaan
PERTANYAAN: Landasan konstitusional negara Republik Indonesia yang memuat tujuan nasional pada alinea keempat adalah...
A: Ketetapan MPR
B: Pembukaan UUD Negara Republik Indonesia Tahun 1945
C: Peraturan Pemerintah Pengganti Undang-Undang
D: Dekrit Presiden 5 Juli 1959
E: Piagam Jakarta 22 Juni 1945
KUNCI JAWABAN: B
PEMBAHASAN: Tujuan nasional bangsa Indonesia tercantum secara tegas dalam Pembukaan UUD 1945 Alinea ke-4.
TINGKAT KESULITAN: Mudah

===SOAL===
KATEGORI: TKP
JUDUL: Pelayanan Publik
PERTANYAAN: Antrean warga membludak di loket layanan Anda menjelang jam istirahat siang. Sikap Anda yang paling tepat adalah...
A: Menutup loket tepat waktu agar bisa istirahat
B: Meminta warga kembali lagi besok pagi
C: Menyelesaikan antrean yang sudah terdaftar dengan sigap atau mengatur mekanisme piket bergantian
D: Meminta bantuan satpam mengusir warga yang antre
E: Bekerja seadanya sambil mengeluh lelah
KUNCI JAWABAN: C
BOBOT_A: 2
BOBOT_B: 1
BOBOT_C: 5
BOBOT_D: 1
BOBOT_E: 2
PEMBAHASAN: Orientasi pelayanan publik menuntut ASN tetap melayani masyarakat secara ramah, cepat, dan solutif.
TINGKAT KESULITAN: Sedang
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Template_Import_Soal_Teks_LOGINCPNS.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadTemplateCsv = (targetPkg?: PracticePackage) => {
    const pkgTitle = targetPkg?.title || 'TIU 1 : Penalaran Logis';
    const pkgCat = targetPkg && targetPkg.category !== 'CAMPURAN' ? targetPkg.category : 'TIU';

    let csv = '\uFEFF'; // UTF-8 BOM for Microsoft Excel
    csv += 'KATEGORI;JUDUL_TOPIK;PERTANYAAN;OPSI_A;OPSI_B;OPSI_C;OPSI_D;OPSI_E;KUNCI_JAWABAN;BOBOT_A;BOBOT_B;BOBOT_C;BOBOT_D;BOBOT_E;PEMBAHASAN;KESULITAN\n';
    csv += `${pkgCat};"${pkgTitle}";"Jika semua peserta lulus SKD mengikuti SKB dan sebagian peserta bimbel lulus SKD, maka...";"Semua peserta bimbel ikut SKB";"Sebagian peserta bimbel mengikuti SKB";"Tidak ada peserta bimbel ikut SKB";"Semua peserta SKB bukan peserta bimbel";"Peserta bimbel pasti lulus CPNS";B;0;5;0;0;0;"Silogisme partikular menghasilkan kesimpulan sebagian.";Sedang\n`;
    csv += `TWK;"Integritas ASN";"Menolak pemberian hadiah/parsel dari mitra kerja proyek instansi merupakan cerminan nilai...";"Loyalitas";"Kejujuran dan Anti Gratifikasi";"Efisiensi";"Kemandirian";"Disiplin waktu";B;0;5;0;0;0;"Menolak gratifikasi adalah implementasi nyata integritas dan UU Tipikor.";Sedang\n`;
    csv += `TKP;"Pelayanan Publik";"Warga mengeluh prosedur layanan lambat di unit Anda. Sikap Anda...";"Membela diri";"Diam saja";"Menerima masukan dengan ramah dan mengevaluasi alur layanan";"Menyalahkan bagian lain";"Menunda perbaikan";C;2;1;5;1;2;"Sikap terbaik adalah responsif, ramah, dan solutif (Skor 5 pada opsi C).";Mudah\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Template_Import_Soal_Excel_LOGINCPNS.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenImportForPackage = (pkg?: PracticePackage) => {
    setImportError('');
    setImportPreview([]);
    setImportText('');
    setImportPackageId(pkg ? pkg.id : '');
    setIsImportModalOpen(true);
  };

  // Structured DOCX/Text & CSV Parser per PRD Section 11.3
  const parseStructuredText = (rawOverride?: string) => {
    setImportError('');
    const sourceText = (rawOverride !== undefined ? rawOverride : importText).trim();
    if (!sourceText) {
      setImportError('Silakan tempel teks soal berformat terstruktur, atau muat file template .txt / .csv.');
      return;
    }

    const targetPkg = practicePackages.find(p => p.id === importPackageId);
    const parsed: Question[] = [];

    // Detect CSV format (starts with KATEGORI; or KATEGORI,)
    const lines = sourceText.split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith('#'));
    const isCsv = lines.length > 0 && (lines[0].toUpperCase().startsWith('KATEGORI;') || lines[0].toUpperCase().startsWith('KATEGORI,'));

    if (isCsv) {
      const delimiter = lines[0].includes(';') ? ';' : ',';
      const splitCsvRow = (row: string) => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < row.length; i++) {
          const ch = row[i];
          if (ch === '"') {
            if (inQuotes && row[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (ch === delimiter && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += ch;
          }
        }
        result.push(cur.trim());
        return result;
      };

      lines.slice(1).forEach((row, idx) => {
        const cols = splitCsvRow(row);
        if (cols.length < 9 || !cols[2]) return;
        const rawCat = (cols[0] || '').toUpperCase();
        const category = (['TWK', 'TIU', 'TKP'].includes(rawCat)
          ? rawCat
          : targetPkg && targetPkg.category !== 'CAMPURAN'
          ? targetPkg.category
          : 'TWK') as QuestionCategory;
        const topic = cols[1] || targetPkg?.title || `Topik #${idx + 1}`;
        const question_text = cols[2];
        const option_a = cols[3] || 'Pilihan A';
        const option_b = cols[4] || 'Pilihan B';
        const option_c = cols[5] || 'Pilihan C';
        const option_d = cols[6] || 'Pilihan D';
        const option_e = cols[7] || 'Pilihan E';
        const correct_answer = ((cols[8] || 'A').toUpperCase()[0] || 'A') as 'A' | 'B' | 'C' | 'D' | 'E';

        const wA = Number(cols[9]) || (category === 'TKP' ? 1 : (correct_answer === 'A' ? 5 : 0));
        const wB = Number(cols[10]) || (category === 'TKP' ? 2 : (correct_answer === 'B' ? 5 : 0));
        const wC = Number(cols[11]) || (category === 'TKP' ? 3 : (correct_answer === 'C' ? 5 : 0));
        const wD = Number(cols[12]) || (category === 'TKP' ? 4 : (correct_answer === 'D' ? 5 : 0));
        const wE = Number(cols[13]) || (category === 'TKP' ? 5 : (correct_answer === 'E' ? 5 : 0));

        const explanation = cols[14] || 'Pembahasan soal.';
        const diffRaw = cols[15] || 'Sedang';
        const difficulty = (['Mudah', 'Sedang', 'Sukar'].includes(diffRaw) ? diffRaw : 'Sedang') as DifficultyLevel;

        parsed.push({
          id: `import-csv-${Date.now()}-${idx}`,
          category,
          topic,
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          option_e,
          correct_answer,
          weight_a: wA,
          weight_b: wB,
          weight_c: wC,
          weight_d: wD,
          weight_e: wE,
          explanation,
          difficulty,
          package_id: targetPkg?.id,
          package_title: targetPkg?.title,
          is_active: true,
          created_at: new Date().toISOString()
        });
      });
    } else {
      // Structured text blocks (===SOAL===)
      const cleanedText = sourceText
        .split(/\r?\n/)
        .filter(l => !l.trim().startsWith('#'))
        .join('\n');
      const blocks = cleanedText.split(/===SOAL===|---SOAL---|\n\s*\n\s*---\s*\n/).filter(b => b.trim());

      blocks.forEach((block, idx) => {
        const getVal = (prefix: string) => {
          const regex = new RegExp(`^${prefix}\\s*[:.]\\s*(.*?)(?=\\n[A-Z_\\s]+[:.]|$)`, 'ims');
          const match = block.match(regex);
          return match ? match[1].trim() : '';
        };

        const rawCat = getVal('KATEGORI').toUpperCase();
        const category = (['TWK', 'TIU', 'TKP'].includes(rawCat)
          ? rawCat
          : targetPkg && targetPkg.category !== 'CAMPURAN'
          ? targetPkg.category
          : 'TWK') as QuestionCategory;
        const topic = getVal('JUDUL') || getVal('TOPIK') || targetPkg?.title || `Topik Soal #${idx + 1}`;
        const question_text = getVal('PERTANYAAN');
        if (!question_text) return;

        const option_a = getVal('A') || 'Pilihan A';
        const option_b = getVal('B') || 'Pilihan B';
        const option_c = getVal('C') || 'Pilihan C';
        const option_d = getVal('D') || 'Pilihan D';
        const option_e = getVal('E') || 'Pilihan E';
        const correct_answer = (getVal('KUNCI JAWABAN').toUpperCase()[0] || 'A') as 'A' | 'B' | 'C' | 'D' | 'E';

        const wA = Number(getVal('BOBOT_A')) || (category === 'TKP' ? 1 : (correct_answer === 'A' ? 5 : 0));
        const wB = Number(getVal('BOBOT_B')) || (category === 'TKP' ? 2 : (correct_answer === 'B' ? 5 : 0));
        const wC = Number(getVal('BOBOT_C')) || (category === 'TKP' ? 3 : (correct_answer === 'C' ? 5 : 0));
        const wD = Number(getVal('BOBOT_D')) || (category === 'TKP' ? 4 : (correct_answer === 'D' ? 5 : 0));
        const wE = Number(getVal('BOBOT_E')) || (category === 'TKP' ? 5 : (correct_answer === 'E' ? 5 : 0));

        const explanation = getVal('PEMBAHASAN') || 'Pembahasan soal.';
        const diffRaw = getVal('TINGKAT KESULITAN') || 'Sedang';
        const difficulty = (['Mudah', 'Sedang', 'Sukar'].includes(diffRaw) ? diffRaw : 'Sedang') as DifficultyLevel;

        parsed.push({
          id: `import-${Date.now()}-${idx}`,
          category,
          topic,
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          option_e,
          correct_answer,
          weight_a: wA,
          weight_b: wB,
          weight_c: wC,
          weight_d: wD,
          weight_e: wE,
          explanation,
          difficulty,
          package_id: targetPkg?.id,
          package_title: targetPkg?.title,
          is_active: true,
          created_at: new Date().toISOString()
        });
      });
    }

    if (parsed.length === 0) {
      setImportError('Gagal membaca format soal. Pastikan mengikuti format template (unduh contoh template .txt atau .csv di atas agar tidak salah format).');
    } else {
      setImportPreview(parsed);
    }
  };

  const handleImportFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const content = String(ev.target?.result || '');
      setImportText(content);
      parseStructuredText(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCommitImport = () => {
    if (importPreview.length === 0) return;
    const targetPkg = practicePackages.find(p => p.id === importPackageId);
    const enriched = importPreview.map(q => ({
      ...q,
      package_id: targetPkg?.id || q.package_id,
      package_title: targetPkg?.title || q.package_title
    }));
    bulkImportQuestions(enriched);
    alert(
      targetPkg
        ? `Berhasil mengimpor ${enriched.length} butir soal langsung ke kotak "${targetPkg.title}"!`
        : `Berhasil mengimpor ${enriched.length} butir soal ke Bank Soal!`
    );
    setImportPreview([]);
    setImportText('');
    setIsImportModalOpen(false);
    setActiveView('admin-questions');
  };

  const handleSavePassingGrade = (e: React.FormEvent) => {
    e.preventDefault();
    updatePassingGrade({
      twk: Number(twkPG),
      tiu: Number(tiuPG),
      tkp: Number(tkpPG),
      regulation_info: regInfo
    });
    setPgSaveNotice('Ambang batas (Passing Grade) berhasil disimpan dan langsung diterapkan ke seluruh ujian & kalkulator.');
  };

  const handleSaveSkdCalculatorConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const skdW = Math.max(10, Math.min(90, Number(calcSkdWeight) || 40));
    const skbW = 100 - skdW;
    setCalcSkdWeight(skdW);
    setCalcSkbWeight(skbW);
    updateSkdCalculatorConfig({
      enabled: calcEnabled,
      access_tier: calcAccessTier,
      enable_auto_import_110: calcAutoImport110,
      skd_weight_percent: skdW,
      skb_weight_percent: skbW,
      max_twk: Math.max(50, Number(calcMaxTwk) || 150),
      max_tiu: Math.max(50, Number(calcMaxTiu) || 175),
      max_tkp: Math.max(50, Number(calcMaxTkp) || 225),
      max_skb_cat: Math.max(100, Number(calcMaxSkbCat) || 500),
      default_competitor_skd: Math.max(0, Number(calcCompSkd) || 420),
      default_competitor_skb: Math.max(0, Math.min(100, Number(calcCompSkb) || 72)),
      calculator_note: calcNote.trim()
    });
    setCalcSaveNotice(
      'Pengaturan Kalkulator SKD & SKB berhasil disimpan dan langsung diterapkan ke menu Kalkulator member serta tombol hasil Try Out 110 Soal.'
    );
  };

  const handleResetSkdCalculatorDefault = () => {
    setCalcEnabled(DEFAULT_SKD_CALCULATOR_CONFIG.enabled);
    setCalcAccessTier(DEFAULT_SKD_CALCULATOR_CONFIG.access_tier);
    setCalcAutoImport110(DEFAULT_SKD_CALCULATOR_CONFIG.enable_auto_import_110);
    setCalcSkdWeight(DEFAULT_SKD_CALCULATOR_CONFIG.skd_weight_percent);
    setCalcSkbWeight(DEFAULT_SKD_CALCULATOR_CONFIG.skb_weight_percent);
    setCalcMaxTwk(DEFAULT_SKD_CALCULATOR_CONFIG.max_twk);
    setCalcMaxTiu(DEFAULT_SKD_CALCULATOR_CONFIG.max_tiu);
    setCalcMaxTkp(DEFAULT_SKD_CALCULATOR_CONFIG.max_tkp);
    setCalcMaxSkbCat(DEFAULT_SKD_CALCULATOR_CONFIG.max_skb_cat);
    setCalcCompSkd(DEFAULT_SKD_CALCULATOR_CONFIG.default_competitor_skd);
    setCalcCompSkb(DEFAULT_SKD_CALCULATOR_CONFIG.default_competitor_skb);
    setCalcNote(DEFAULT_SKD_CALCULATOR_CONFIG.calculator_note || '');
    updateSkdCalculatorConfig(DEFAULT_SKD_CALCULATOR_CONFIG);
    setCalcSaveNotice('Pengaturan Kalkulator SKD dikembalikan ke standar resmi BKN (SKD 40% / SKB 60%, Maks 550).');
  };

  const handleOpenNewAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnTitle('');
    setAnnSummary('');
    setAnnContent('');
    setAnnCategory('JADWAL_CPNS');
    setAnnIsPinned(false);
    setAnnIsActive(true);
    setIsAnnouncementModalOpen(true);
  };

  const handleOpenEditAnnouncement = (ann: AdminAnnouncement) => {
    setEditingAnnouncement(ann);
    setAnnTitle(ann.title);
    setAnnSummary(ann.summary);
    setAnnContent(ann.content);
    setAnnCategory(ann.category);
    setAnnIsPinned(ann.is_pinned);
    setAnnIsActive(ann.is_active);
    setIsAnnouncementModalOpen(true);
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annSummary.trim() || !annContent.trim()) {
      alert('Mohon lengkapi judul, garis besar ringkasan, dan isi pengumuman.');
      return;
    }

    if (editingAnnouncement) {
      updateAnnouncement({
        ...editingAnnouncement,
        title: annTitle.trim(),
        summary: annSummary.trim(),
        content: annContent.trim(),
        category: annCategory,
        is_pinned: annIsPinned,
        is_active: annIsActive
      });
    } else {
      addAnnouncement({
        title: annTitle.trim(),
        summary: annSummary.trim(),
        content: annContent.trim(),
        category: annCategory,
        is_pinned: annIsPinned,
        is_active: annIsActive
      });
    }

    setIsAnnouncementModalOpen(false);
    setEditingAnnouncement(null);
  };

  const applyAnnouncementTemplate = (preset: 'JADWAL' | 'MAINTENANCE' | 'BERITA') => {
    if (preset === 'JADWAL') {
      setAnnCategory('JADWAL_CPNS');
      setAnnTitle('Update Jadwal Resmi Pendaftaran & Tahapan CPNS 2026/2027');
      setAnnSummary('Pengumuman resmi pembukaan pendaftaran SSCASN BKN, verifikasi berkas administrasi, dan jadwal pelaksanaan ujian SKD.');
      setAnnContent(
        'Informasi Jadwal Resmi Seleksi CPNS 2026/2027:\n\n1. Pendaftaran Akun SSCASN: [Isi Tanggal]\n2. Seleksi Administrasi: [Isi Tanggal]\n3. Pelaksanaan Ujian SKD CAT: [Isi Tanggal]\n\nPastikan seluruh berkas persyaratan telah disiapkan dan terus berlatih menggunakan Tryout SKD 110 Soal di LOGIN CPNS.'
      );
      setAnnIsPinned(true);
    } else if (preset === 'MAINTENANCE') {
      setAnnCategory('MAINTENANCE');
      setAnnTitle('Pemberitahuan Gangguan Jaringan / Maintenance Sistem');
      setAnnSummary('Sedang dilakukan pemeliharaan dan optimalisasi server sementara. Mohon maaf atas ketidaknyamanan akses sementara ini.');
      setAnnContent(
        'Kepada seluruh peserta LOGIN CPNS,\n\nSaat ini tim teknis sedang melakukan pemeliharaan server dan perbaikan konektivitas jaringan agar simulasi CAT berjalan lebih stabil.\n\nEstimasi waktu normal kembali: [Isi Jam/Waktu].\nJika mengalami kendala darurat, silakan hubungi WhatsApp Admin di 0813-1213-9893.'
      );
      setAnnIsPinned(true);
    } else {
      setAnnCategory('BERITA_UMUM');
      setAnnTitle('Pengumuman & Informasi Terbaru LOGIN CPNS');
      setAnnSummary('Simak pembaruan bank soal HOTS, fitur baru, serta informasi penting bagi seluruh peserta bimbel CPNS.');
      setAnnContent(
        'Halo Pejuang NIP,\n\nBerikut kami sampaikan informasi terbaru terkait program bimbel dan latihan soal di platform LOGIN CPNS:\n\n- [Tulis poin pengumuman 1]\n- [Tulis poin pengumuman 2]\n\nTerima kasih dan tetap semangat berlatih!'
      );
      setAnnIsPinned(false);
    }
  };

  const handleUploadTutorialPoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setTutorialUploadError('');
    if (!file.type.startsWith('image/')) {
      setTutorialUploadError('File poster harus berupa gambar (JPG, PNG, atau WEBP).');
      return;
    }
    setIsProcessingTutorialMedia(true);
    try {
      const compressed = await readAndCompressImageFile(file, 960, 0.78);
      const projectedBytes = compressed.length + JSON.stringify(installTutorialImages).length;
      if (projectedBytes > 780000) {
        setTutorialUploadError(
          'Ukuran total gambar melebihi batas penyimpanan dokumen (maks ~780 KB). Gunakan gambar yang lebih ringkas atau hapus beberapa gambar lama.'
        );
        return;
      }
      setInstallPosterUrl(compressed);
    } catch {
      setTutorialUploadError('Gagal memproses file poster tutorial.');
    } finally {
      setIsProcessingTutorialMedia(false);
    }
  };

  const handleUploadTutorialImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;
    setTutorialUploadError('');
    setIsProcessingTutorialMedia(true);
    try {
      const nextItems: InstallTutorialImage[] = [...installTutorialImages];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          setTutorialUploadError('Semua file gambar tutorial harus berformat JPG, PNG, atau WEBP.');
          continue;
        }
        const compressed = await readAndCompressImageFile(file, 840, 0.74);
        const projectedBytes =
          installPosterUrl.length + JSON.stringify(nextItems).length + compressed.length;
        if (projectedBytes > 780000) {
          setTutorialUploadError(
            'Kapasitas total gambar tutorial mencapai batas aman penyimpanan (~780 KB). Kurangi jumlah gambar atau gunakan resolusi lebih kecil.'
          );
          break;
        }
        const stepNumber = nextItems.length + 1;
        const customTitle = newTutorialTitle.trim();
        nextItems.push({
          id: `tut-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title:
            files.length === 1 && customTitle
              ? customTitle
              : customTitle
              ? `${customTitle} (${stepNumber})`
              : `Langkah ${stepNumber}`,
          caption: newTutorialCaption.trim() || undefined,
          image_url: compressed,
          created_at: new Date().toISOString()
        });
      }
      setInstallTutorialImages(nextItems);
      setNewTutorialTitle('');
      setNewTutorialCaption('');
    } catch {
      setTutorialUploadError('Gagal memproses gambar tutorial.');
    } finally {
      setIsProcessingTutorialMedia(false);
    }
  };

  const handleMoveTutorialImage = (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= installTutorialImages.length) return;
    setInstallTutorialImages(prev => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const estimateSettingsPayloadBytes = (
    nextQrisUrl: string,
    nextChannels: PaymentChannelConfig[]
  ) =>
    installPosterUrl.length +
    JSON.stringify(installTutorialImages).length +
    nextQrisUrl.length +
    JSON.stringify(nextChannels).length;

  const handleUploadMainQris = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPaymentSettingsError('');
    if (!file.type.startsWith('image/')) {
      setPaymentSettingsError('File QR Code harus berupa gambar (JPG, PNG, atau WEBP).');
      return;
    }
    setIsProcessingQrMedia(true);
    try {
      const compressed = await readAndCompressImageFile(file, 720, 0.82);
      if (estimateSettingsPayloadBytes(compressed, paymentChannels) > 820000) {
        setPaymentSettingsError(
          'Ukuran total media pengaturan melebihi batas aman penyimpanan (~820 KB). Gunakan gambar QR yang lebih ringkas.'
        );
        return;
      }
      setQrisImageUrl(compressed);
      updateSettings({
        qris_image_url: compressed,
        qris_merchant_name: qrisMerchantName.trim() || 'QRIS LOGIN CPNS EDUKASI',
        qris_notes: qrisNotes.trim()
      });
      setSettingsSavedNotice('Gambar QR Code QRIS berhasil diupload dan langsung aktif di panel peserta!');
      setTimeout(() => setSettingsSavedNotice(''), 4000);
    } catch {
      setPaymentSettingsError('Gagal memproses file gambar QR Code.');
    } finally {
      setIsProcessingQrMedia(false);
    }
  };

  const handleUploadChannelQr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPaymentSettingsError('');
    if (!file.type.startsWith('image/')) {
      setPaymentSettingsError('File QR Code metode harus berupa gambar (JPG, PNG, atau WEBP).');
      return;
    }
    setIsProcessingQrMedia(true);
    try {
      const compressed = await readAndCompressImageFile(file, 640, 0.8);
      if (compressed.length > 260000) {
        setPaymentSettingsError('Ukuran gambar QR metode terlalu besar. Gunakan gambar dengan resolusi lebih kecil.');
        return;
      }
      setPayChQrUrl(compressed);
    } catch {
      setPaymentSettingsError('Gagal memproses gambar QR metode.');
    } finally {
      setIsProcessingQrMedia(false);
    }
  };

  const openAddPaymentChannel = (defaultCat: PaymentChannelCategory = 'BANK') => {
    setPaymentSettingsError('');
    setEditingPayChannelId(null);
    setPayChCategory(defaultCat);
    setPayChProvider('');
    setPayChNumber(defaultCat === 'EWALLET' || defaultCat === 'COD' ? nonCashPhone || appWhatsapp : '');
    setPayChHolder('');
    setPayChQrUrl('');
    setPayChNotes('');
    setPayChActive(true);
    setIsPaymentModalOpen(true);
  };

  const openEditPaymentChannel = (ch: PaymentChannelConfig) => {
    setPaymentSettingsError('');
    setEditingPayChannelId(ch.id);
    setPayChCategory(ch.category);
    setPayChProvider(ch.provider_name);
    setPayChNumber(ch.account_number);
    setPayChHolder(ch.account_holder);
    setPayChQrUrl(ch.qr_image_url || '');
    setPayChNotes(ch.instructions || '');
    setPayChActive(ch.is_active);
    setIsPaymentModalOpen(true);
  };

  const handleSavePaymentChannel = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSettingsError('');

    const provider = payChProvider.trim();
    const accNumber = payChNumber.trim();
    const holder = payChHolder.trim();

    if (!provider) {
      setPaymentSettingsError('Nama bank / media pembayaran wajib diisi.');
      return;
    }
    if (payChCategory !== 'QRIS' && !accNumber) {
      setPaymentSettingsError(
        payChCategory === 'BANK'
          ? 'Nomor rekening wajib diisi.'
          : 'Nomor HP / nomor tujuan wajib diisi.'
      );
      return;
    }
    if (payChCategory === 'QRIS' && !accNumber && !payChQrUrl) {
      setPaymentSettingsError('Untuk QRIS, unggah gambar QR Code atau isi ID Merchant/NMID.');
      return;
    }
    if (!holder) {
      setPaymentSettingsError('Nama pemilik rekening / akun wajib diisi.');
      return;
    }

    const nextItem: PaymentChannelConfig = {
      id: editingPayChannelId || `paych-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: payChCategory,
      provider_name: provider,
      account_number: accNumber || 'SCAN QRIS',
      account_holder: holder,
      qr_image_url: payChQrUrl || undefined,
      instructions: payChNotes.trim() || undefined,
      is_active: payChActive
    };

    const nextChannels = editingPayChannelId
      ? paymentChannels.map(item => (item.id === editingPayChannelId ? nextItem : item))
      : [...paymentChannels, nextItem];

    if (estimateSettingsPayloadBytes(qrisImageUrl, nextChannels) > 840000) {
      setPaymentSettingsError(
        'Kapasitas penyimpanan media QR melebihi batas aman (~840 KB). Gunakan gambar QR yang lebih ringkas.'
      );
      return;
    }

    setPaymentChannels(nextChannels);
    updateSettings({ payment_channels: nextChannels });
    setIsPaymentModalOpen(false);
    setSettingsSavedNotice(
      editingPayChannelId
        ? `Metode pembayaran "${provider}" berhasil diperbarui dan otomatis tersinkron ke panel peserta!`
        : `Metode pembayaran "${provider}" berhasil ditambahkan dan otomatis tampil di panel peserta!`
    );
    setTimeout(() => setSettingsSavedNotice(''), 4000);
  };

  const handleTogglePaymentChannelActive = (id: string) => {
    const nextChannels = paymentChannels.map(ch =>
      ch.id === id ? { ...ch, is_active: !ch.is_active } : ch
    );
    setPaymentChannels(nextChannels);
    updateSettings({ payment_channels: nextChannels });
    setSettingsSavedNotice('Status aktif metode pembayaran diperbarui di panel peserta.');
    setTimeout(() => setSettingsSavedNotice(''), 3000);
  };

  const handleDeletePaymentChannel = (id: string) => {
    const target = paymentChannels.find(c => c.id === id);
    const nextChannels = paymentChannels.filter(c => c.id !== id);
    setPaymentChannels(nextChannels);
    updateSettings({ payment_channels: nextChannels });
    setSettingsSavedNotice(
      `Metode pembayaran "${target?.provider_name || ''}" dihapus dan langsung hilang dari panel peserta.`
    );
    setTimeout(() => setSettingsSavedNotice(''), 3500);
  };

  const handleSaveAppSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setTutorialUploadError('');
    setPaymentSettingsError('');
    updateSettings({
      headline: appHeadline.trim(),
      admin_whatsapp: appWhatsapp.trim(),
      non_cash_phone: nonCashPhone.trim() || appWhatsapp.trim(),
      admin_email: appEmail.trim() || OFFICIAL_SENDER_EMAIL,
      maintenance_mode: appMaintenance,
      lock_materials_for_premium_only: lockMaterialsForPremiumOnly,
      standar_questions_only: standarQuestionsOnly,
      qris_image_url: qrisImageUrl || '',
      qris_merchant_name: qrisMerchantName.trim() || 'QRIS LOGIN CPNS EDUKASI',
      qris_notes: qrisNotes.trim(),
      payment_channels: paymentChannels,
      install_tutorial_poster_url: installPosterUrl || '',
      install_tutorial_images: installTutorialImages
    });
    setSettingsSavedNotice(
      'Seluruh pengaturan aplikasi, metode pembayaran, QR Code, nomor non-tunai & tutorial berhasil disimpan dan tersinkron ke panel peserta!'
    );
    setTimeout(() => setSettingsSavedNotice(''), 4500);
  };

  const handleExportResultsCSV = (targetRows = results) => {
    let csv = '\uFEFFPeringkat,ID,Nama Peserta,Nama Ujian,Jenis Ujian,TWK,TIU,TKP,Total Nilai,Status,Durasi (Detik),Tanggal\n';
    targetRows.forEach((r, idx) => {
      csv += `${idx + 1},"${r.id}","${r.user_name}","${r.exam_title}","${r.exam_type}",${r.twk_score},${r.tiu_score},${r.tkp_score},${r.total_score},"${r.pass_status}",${r.duration_seconds},"${r.completed_at}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap_hasil_ujian_cpns_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const toDatetimeLocalInput = (isoString?: string) => {
    const d = isoString ? new Date(isoString) : new Date(Date.now() + 86400000);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const openCreateSessionModal = (defaultCat: 'TRYOUT_BARENG' | 'ZOOM_BIMBEL_MALAM') => {
    setEditingSession(null);
    setSessTitle('');
    setSessDesc('');
    setSessCategory(defaultCat);
    setSessExamType('TRYOUT_BERSAMA');
    setSessStatus('UPCOMING');
    const tomorrow = new Date(Date.now() + 2 * 86400000);
    tomorrow.setHours(defaultCat === 'ZOOM_BIMBEL_MALAM' ? 19 : 9, defaultCat === 'ZOOM_BIMBEL_MALAM' ? 30 : 0, 0, 0);
    const endDt = new Date(tomorrow.getTime() + (defaultCat === 'ZOOM_BIMBEL_MALAM' ? 120 : 100) * 60000);
    setSessStartAt(toDatetimeLocalInput(tomorrow.toISOString()));
    setSessEndAt(toDatetimeLocalInput(endDt.toISOString()));
    setSessDuration(defaultCat === 'ZOOM_BIMBEL_MALAM' ? 120 : 100);
    setSessQuestionCount(defaultCat === 'ZOOM_BIMBEL_MALAM' ? 0 : 110);
    setSessQuota(defaultCat === 'ZOOM_BIMBEL_MALAM' ? 300 : 500);
    setSessCoach('Coach Aditya Pratama, S.E., M.M.');
    setSessZoomUrl('https://zoom.us/j/logincpns-bimbel');
    setSessScheduleNote(
      defaultCat === 'ZOOM_BIMBEL_MALAM'
        ? 'Jadwal malam hari (19.30 – 21.30 WIB)'
        : 'Serentak Nasional · Pembahasan via Zoom'
    );
    setSessPosterUrl('');
    setSessEvidenceList([]);
    setSessAttendanceCount(0);
    setSessSummaryNotes('');
    setIsSessionModalOpen(true);
  };

  const openEditSessionModal = (s: GroupSession) => {
    setEditingSession(s);
    setSessTitle(s.title);
    setSessDesc(s.description);
    setSessCategory(s.session_category === 'ZOOM_BIMBEL_MALAM' ? 'ZOOM_BIMBEL_MALAM' : 'TRYOUT_BARENG');
    setSessExamType(s.exam_type || 'TRYOUT_BERSAMA');
    setSessStatus(s.status);
    setSessStartAt(toDatetimeLocalInput(s.start_at));
    setSessEndAt(toDatetimeLocalInput(s.end_at));
    setSessDuration(s.duration_minutes);
    setSessQuestionCount(s.question_count);
    setSessQuota(s.quota);
    setSessCoach(s.coach_name);
    setSessZoomUrl(s.zoom_url);
    setSessScheduleNote(s.schedule_note || '');
    setSessPosterUrl(s.poster_url || '');
    setSessEvidenceList(s.evidence_screenshots || []);
    setSessAttendanceCount(s.attendance_count || 0);
    setSessSummaryNotes(s.summary_notes || '');
    setIsSessionModalOpen(true);
  };

  const handleSaveGroupSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessTitle.trim()) return;
    const startIso = sessStartAt ? new Date(sessStartAt).toISOString() : new Date().toISOString();
    const endIso = sessEndAt
      ? new Date(sessEndAt).toISOString()
      : new Date(new Date(startIso).getTime() + Math.max(30, sessDuration) * 60000).toISOString();

    const payload: Omit<GroupSession, 'id' | 'created_at'> = {
      title: sessTitle.trim(),
      description: sessDesc.trim() || 'Sesi bimbingan dan simulasi CAT SKD CPNS LOGIN CPNS.',
      exam_type: sessExamType,
      session_category: sessCategory,
      start_at: startIso,
      end_at: endIso,
      duration_minutes: Math.max(15, Number(sessDuration) || 90),
      question_count: Math.max(0, Number(sessQuestionCount) || 0),
      zoom_url: sessZoomUrl.trim() || 'https://zoom.us/j/logincpns-bimbel',
      coach_name: sessCoach.trim() || 'Tim Mentor LOGIN CPNS',
      quota: Math.max(10, Number(sessQuota) || 200),
      status: sessStatus,
      schedule_note: sessScheduleNote.trim() || undefined,
      poster_url: sessPosterUrl.trim() || undefined,
      evidence_screenshots: sessEvidenceList.length > 0 ? sessEvidenceList : undefined,
      attendance_count: Number(sessAttendanceCount) > 0 ? Number(sessAttendanceCount) : undefined,
      summary_notes: sessSummaryNotes.trim() || undefined
    };

    if (editingSession) {
      updateGroupSession({ ...editingSession, ...payload });
      setZoomNotice(`Jadwal "${payload.title}" berhasil diperbarui!`);
      setTbNotice(`Sesi "${payload.title}" berhasil diperbarui!`);
    } else {
      addGroupSession(payload);
      setZoomNotice(`Jadwal baru "${payload.title}" berhasil ditambahkan!`);
      setTbNotice(`Sesi Tryout Bersama "${payload.title}" berhasil dibuat!`);
    }
    setIsSessionModalOpen(false);
    setEditingSession(null);
  };

  const handleQuickUploadPoster = async (session: GroupSession, file: File) => {
    const compressed = await readAndCompressImageFile(file, 1100, 0.82);
    updateGroupSession({ ...session, poster_url: compressed });
    setZoomNotice(`Poster iklan untuk "${session.title}" berhasil diunggah!`);
    setTbNotice(`Poster untuk "${session.title}" berhasil diunggah!`);
  };

  const handleQuickUploadEvidence = async (session: GroupSession, files: FileList) => {
    const uploaded: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files.item(i);
      if (!f) continue;
      const compressed = await readAndCompressImageFile(f, 1100, 0.8);
      uploaded.push(compressed);
    }
    if (uploaded.length > 0) {
      const existing = session.evidence_screenshots || [];
      updateGroupSession({
        ...session,
        evidence_screenshots: [...existing, ...uploaded]
      });
      setZoomNotice(`${uploaded.length} bukti screenshot untuk "${session.title}" berhasil ditambahkan!`);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 max-w-7xl mx-auto pb-10 font-sans">
      {/* Admin Header Bar */}
      <div className="px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-2.5 shadow-sm">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-950 px-1.5 py-0.5 rounded border border-sky-800 shrink-0">
              Super Admin
            </span>
            <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
              LOGIN CPNS Database &amp; System Administration
            </span>
          </div>
          <h1 className="text-sm sm:text-xl font-extrabold tracking-tight mt-0.5 truncate">
            Super Admin Control Center
          </h1>
        </div>

        <button
          onClick={() => setActiveView('dashboard')}
          className="px-2.5 py-1.5 sm:px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] sm:text-xs font-semibold text-slate-200 border border-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
        >
          &larr; <span className="sm:hidden">Member</span><span className="hidden sm:inline">Ke Tampilan Member</span>
        </button>
      </div>

      {/* Admin Quick View Navigation Pills */}
      <div className="flex border-b border-slate-300 gap-1.5 overflow-x-auto pb-2 text-xs">
        <button
          onClick={() => setActiveView('admin-dashboard')}
          className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-colors ${
            currentAdminTab === 'admin-dashboard' ? 'bg-blue-700 text-white shadow-xs' : 'bg-white/75 text-slate-700 border border-slate-300/80 hover:bg-white hover:text-slate-900'
          }`}
        >
          1. Dashboard
        </button>
        <button
          onClick={() => setActiveView('admin-users')}
          className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-colors ${
            currentAdminTab === 'admin-users' ? 'bg-blue-700 text-white shadow-xs' : 'bg-white/75 text-slate-700 border border-slate-300/80 hover:bg-white hover:text-slate-900'
          }`}
        >
          2. Pengguna
        </button>
        <button
          onClick={() => setActiveView('admin-questions')}
          className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-colors ${
            currentAdminTab === 'admin-questions' ? 'bg-blue-700 text-white shadow-xs' : 'bg-white/75 text-slate-700 border border-slate-300/80 hover:bg-white hover:text-slate-900'
          }`}
        >
          3. Bank Soal
        </button>
        <button
          onClick={() => setActiveView('admin-import')}
          className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-colors ${
            currentAdminTab === 'admin-import' ? 'bg-blue-700 text-white shadow-xs' : 'bg-white/75 text-slate-700 border border-slate-300/80 hover:bg-white hover:text-slate-900'
          }`}
        >
          4. Import Soal
        </button>
        <button
          onClick={() => setActiveView('admin-materials')}
          className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-colors ${
            currentAdminTab === 'admin-materials' ? 'bg-blue-700 text-white shadow-xs' : 'bg-white/75 text-slate-700 border border-slate-300/80 hover:bg-white hover:text-slate-900'
          }`}
        >
          5. Materi
        </button>
        <button
          onClick={() => setActiveView('admin-short-videos')}
          className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            currentAdminTab === 'admin-short-videos' ? 'bg-blue-700 text-white shadow-xs' : 'bg-white/75 text-slate-700 border border-slate-300/80 hover:bg-white hover:text-slate-900'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Short Video &amp; Upload</span>
        </button>
        <button
          onClick={() => setActiveView('admin-packages')}
          className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-colors ${
            currentAdminTab === 'admin-packages' ? 'bg-blue-700 text-white shadow-xs' : 'bg-white/75 text-slate-700 border border-slate-300/80 hover:bg-white hover:text-slate-900'
          }`}
        >
          6. Paket Premium
        </button>
        <button
          onClick={() => setActiveView('admin-payments')}
          className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-colors relative ${
            currentAdminTab === 'admin-payments' ? 'bg-blue-700 text-white shadow-xs' : 'bg-white/75 text-slate-700 border border-slate-300/80 hover:bg-white hover:text-slate-900'
          }`}
        >
          7. Pembayaran
          {pendingPaymentsCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-amber-950 font-extrabold">
              {pendingPaymentsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveView('admin-premium-activation')}
          className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
            currentAdminTab === 'admin-premium-activation' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white/75 text-slate-700 border border-slate-300/80 hover:bg-white hover:text-slate-900'
          }`}
        >
          <span>8. Aktivasi &amp; Afiliasi</span>
          {pendingAffiliatesCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-amber-950 font-extrabold">
              {pendingAffiliatesCount} Mitra
            </span>
          )}
          {commissionUnpaidTotal > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-extrabold">
              Rp {(commissionUnpaidTotal / 1000).toFixed(0)}rb
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveView('admin-together-sessions')}
          className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-colors ${
            currentAdminTab === 'admin-together-sessions' ? 'bg-blue-700 text-white shadow-xs' : 'bg-white/75 text-slate-700 border border-slate-300/80 hover:bg-white hover:text-slate-900'
          }`}
        >
          9. Tryout Bersama
        </button>
        <button
          onClick={() => setActiveView('admin-zoom')}
          className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-colors ${
            currentAdminTab === 'admin-zoom' ? 'bg-blue-700 text-white shadow-xs' : 'bg-white/75 text-slate-700 border border-slate-300/80 hover:bg-white hover:text-slate-900'
          }`}
        >
          10. Jadwal Zoom
        </button>
        <button
          onClick={() => setActiveView('admin-results')}
          className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-colors ${
            currentAdminTab === 'admin-results' ? 'bg-blue-700 text-white shadow-xs' : 'bg-white/75 text-slate-700 border border-slate-300/80 hover:bg-white hover:text-slate-900'
          }`}
        >
          11. Hasil Ujian
        </button>
        <button
          onClick={() => setActiveView('admin-exam-settings')}
          className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-colors ${
            currentAdminTab === 'admin-exam-settings' ? 'bg-blue-700 text-white shadow-xs' : 'bg-white/75 text-slate-700 border border-slate-300/80 hover:bg-white hover:text-slate-900'
          }`}
        >
          12. Pengaturan Ujian
        </button>
        <button
          onClick={() => setActiveView('admin-announcements')}
          className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            currentAdminTab === 'admin-announcements' ? 'bg-blue-700 text-white shadow-xs' : 'bg-white/75 text-slate-700 border border-slate-300/80 hover:bg-white hover:text-slate-900'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>13. Pengumuman Admin</span>
        </button>
        <button
          onClick={() => setActiveView('admin-app-settings')}
          className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-colors ${
            currentAdminTab === 'admin-app-settings' ? 'bg-blue-700 text-white shadow-xs' : 'bg-white/75 text-slate-700 border border-slate-300/80 hover:bg-white hover:text-slate-900'
          }`}
        >
          14. Pengaturan Aplikasi
        </button>
        <button
          onClick={() => setActiveView('admin-audit-logs')}
          className={`px-3 py-1.5 font-bold rounded-lg whitespace-nowrap transition-colors ${
            currentAdminTab === 'admin-audit-logs' ? 'bg-blue-700 text-white shadow-xs' : 'bg-white/75 text-slate-700 border border-slate-300/80 hover:bg-white hover:text-slate-900'
          }`}
        >
          15. Audit Log
        </button>
      </div>

      {/* ================= 1. DASHBOARD ADMIN ================= */}
      {currentAdminTab === 'admin-dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-slate-500 text-[10px] sm:text-[11px] font-bold truncate">Total Pengguna</span>
                <span className="text-base sm:text-xl font-extrabold text-slate-900 font-mono tabular-nums leading-none shrink-0">{totalUsersCount}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate tabular-nums">{activeUsersCount} pengguna aktif</p>
            </div>
            <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 bg-white rounded-xl border border-amber-200">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-amber-700 text-[10px] sm:text-[11px] font-bold truncate">Member Premium</span>
                <span className="text-base sm:text-xl font-extrabold text-amber-700 font-mono tabular-nums leading-none shrink-0">{premiumUsersCount}</span>
              </div>
              <p className="text-[10px] text-amber-700/80 mt-0.5 truncate">Masa aktif valid</p>
            </div>
            <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 bg-white rounded-xl border border-red-200">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-red-700 text-[10px] sm:text-[11px] font-bold truncate">Verifikasi Bayar</span>
                <span className="text-base sm:text-xl font-extrabold text-red-600 font-mono tabular-nums leading-none shrink-0">{pendingPaymentsCount}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">Bukti transfer masuk</p>
            </div>
            <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 bg-white rounded-xl border border-blue-200">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-blue-700 text-[10px] sm:text-[11px] font-bold truncate">Total Soal Aktif</span>
                <span className="text-base sm:text-xl font-extrabold text-blue-700 font-mono tabular-nums leading-none shrink-0">{activeQuestionsCount}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">TWK, TIU, TKP</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick pending payments */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-xs uppercase text-slate-800">
                  Verifikasi Pembayaran Terbaru
                </h3>
                <button
                  onClick={() => setActiveView('admin-payments')}
                  className="text-xs text-blue-700 hover:underline font-semibold"
                >
                  Kelola Semua &rarr;
                </button>
              </div>

              {payments.slice(0, 3).map(p => (
                <div key={p.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <strong className="text-slate-900">{p.user_name}</strong>
                      {p.is_package_upgrade && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] font-extrabold uppercase">
                          Peralihan Paket
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500 text-[11px] block">
                      {p.package_name} · Rp {p.amount.toLocaleString('id-ID')}
                      {p.is_package_upgrade && p.previous_package_name ? ` (Dari ${p.previous_package_name})` : ''}
                    </span>
                  </div>
                  <div className="shrink-0">
                    {p.status === 'WAITING_VERIFICATION' ? (
                      <button
                        onClick={() => approvePayment(p.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer"
                      >
                        {p.is_package_upgrade ? 'Setujui & Naikkan' : 'Setujui'}
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500">{p.status}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick System Settings snapshot */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <h3 className="font-bold text-xs uppercase text-slate-800 border-b border-slate-100 pb-2">
                Konfigurasi Ambang Batas Aktif
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Dasar Regulasi:</span>
                  <span className="font-bold text-slate-900">{settings.default_passing_grade.regulation_info}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Ambang Batas TWK:</span>
                  <span className="font-mono font-bold text-blue-700">{settings.default_passing_grade.twk} Poin</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Ambang Batas TIU:</span>
                  <span className="font-mono font-bold text-sky-700">{settings.default_passing_grade.tiu} Poin</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Ambang Batas TKP:</span>
                  <span className="font-mono font-bold text-emerald-700">{settings.default_passing_grade.tkp} Poin</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Nomor WhatsApp Admin:</span>
                  <span className="font-mono font-bold text-slate-900">{settings.admin_whatsapp}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. DATA PENGGUNA (DASHBOARD KPI, FILTER DINAMIS, TABEL PRESISI & EKSPOR) ================= */}
      {currentAdminTab === 'admin-users' && (() => {
        const nowMs = Date.now();
        const getUserRemainingMeta = (u: User) => {
          if (u.membership_type === 'FREE') {
            return {
              days: -1,
              label: 'Gratis (Non-Paket)',
              shortLabel: 'Gratis',
              expiryStr: '-',
              state: 'FREE' as const
            };
          }
          if (!u.premium_end) {
            return {
              days: 9999,
              label: 'Aktif (Tanpa Batas)',
              shortLabel: 'Tanpa Batas',
              expiryStr: '-',
              state: 'ACTIVE_PKG' as const
            };
          }
          const endMs = new Date(u.premium_end).getTime();
          const diffDays = Math.ceil((endMs - nowMs) / 86400000);
          const expiryStr = new Date(u.premium_end).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
          if (diffDays < 0) {
            return {
              days: diffDays,
              label: `Kedaluwarsa (${Math.abs(diffDays)} hr lalu)`,
              shortLabel: 'Kedaluwarsa',
              expiryStr,
              state: 'EXPIRED' as const
            };
          }
          if (diffDays === 0) {
            return {
              days: 0,
              label: 'Berakhir Hari Ini',
              shortLabel: '0 Hari',
              expiryStr,
              state: 'EXPIRING_SOON' as const
            };
          }
          if (diffDays <= 30) {
            return {
              days: diffDays,
              label: `${diffDays} Hari Lagi`,
              shortLabel: `${diffDays} Hari`,
              expiryStr,
              state: 'EXPIRING_SOON' as const
            };
          }
          return {
            days: diffDays,
            label: `${diffDays} Hari Lagi`,
            shortLabel: `${diffDays} Hari`,
            expiryStr,
            state: 'ACTIVE_PKG' as const
          };
        };

        const getUserPurchaseDate = (u: User): string => {
          const userApprovedPays = payments
            .filter(p => p.user_id === u.id && p.status === 'APPROVED')
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          if (userApprovedPays.length > 0) {
            return new Date(userApprovedPays[0].created_at).toLocaleDateString('id-ID');
          }
          if (u.premium_start) {
            return new Date(u.premium_start).toLocaleDateString('id-ID');
          }
          return '-';
        };

        // Dashboard Summary Metrics
        const totalUsersCount = users.length;
        const memberUsers = users.filter(u => u.role === 'MEMBER');
        const freeCount = users.filter(u => u.membership_type === 'FREE').length;
        const standarCount = users.filter(u => u.membership_type === 'STANDAR').length;
        const premiumCount = users.filter(u => u.membership_type === 'PREMIUM').length;
        const intensifCount = users.filter(u => u.membership_type === 'INTENSIF').length;
        const activeCount = users.filter(u => u.account_status === 'ACTIVE').length;
        const inactiveCount = users.filter(u => u.account_status === 'INACTIVE').length;
        const expiringSoonCount = users.filter(u => {
          const meta = getUserRemainingMeta(u);
          return meta.state === 'EXPIRING_SOON' || meta.state === 'EXPIRED';
        }).length;

        // Dynamic filter options depending on userFilterBy
        const uniqueValues = (getter: (u: User) => string | undefined): string[] =>
          Array.from(
            new Set(
              users
                .map(getter)
                .map(v => (v || '').trim())
                .filter(Boolean)
            )
          ).sort((a, b) => a.localeCompare(b, 'id'));

        const dynamicFilterOptions: { value: string; label: string }[] = (() => {
          switch (userFilterBy) {
            case 'PACKAGE':
              return [
                { value: 'FREE', label: `Gratis / FREE (${freeCount})` },
                { value: 'STANDAR', label: `Paket Standar (${standarCount})` },
                { value: 'PREMIUM', label: `Paket Premium (${premiumCount})` },
                { value: 'INTENSIF', label: `Paket Intensif (${intensifCount})` }
              ];
            case 'ACCOUNT_STATUS':
              return [
                { value: 'ACTIVE', label: `Akun Aktif (${activeCount})` },
                { value: 'INACTIVE', label: `Akun Nonaktif (${inactiveCount})` }
              ];
            case 'PREMIUM_STATUS':
              return [
                { value: 'ACTIVE_PKG', label: 'Paket Aktif (> 30 Hari)' },
                { value: 'EXPIRING_SOON', label: 'Segera Habis (≤ 30 Hari)' },
                { value: 'EXPIRED', label: 'Sudah Kedaluwarsa' },
                { value: 'FREE', label: 'Gratis / Tanpa Paket' }
              ];
            case 'EDUCATION':
              return uniqueValues(u => u.education).map(v => ({ value: v, label: v }));
            case 'JOB':
              return uniqueValues(u => u.current_job).map(v => ({ value: v, label: v }));
            case 'ADDRESS':
              return uniqueValues(u => u.address).map(v => ({ value: v, label: v }));
            case 'INFO_SOURCE':
              return uniqueValues(u => u.info_source).map(v => ({ value: v, label: v }));
            case 'ROLE':
              return [
                { value: 'MEMBER', label: `Peserta / Member (${memberUsers.length})` },
                { value: 'SUPER_ADMIN', label: `Super Admin (${users.length - memberUsers.length})` }
              ];
            default:
              return [];
          }
        })();

        const filteredUsers = users
          .filter(u => {
            if (userSearch.trim()) {
              const q = userSearch.toLowerCase();
              const matched =
                u.full_name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                u.phone.toLowerCase().includes(q) ||
                (u.education || '').toLowerCase().includes(q) ||
                (u.current_job || '').toLowerCase().includes(q) ||
                (u.address || '').toLowerCase().includes(q) ||
                (u.info_source || '').toLowerCase().includes(q) ||
                (u.targetAgency || '').toLowerCase().includes(q) ||
                (u.referral_code || '').toLowerCase().includes(q);
              if (!matched) return false;
            }

            if (userFilterBy !== 'ALL' && userFilterValue !== 'ALL') {
              if (userFilterBy === 'PACKAGE' && u.membership_type !== userFilterValue) return false;
              if (userFilterBy === 'ACCOUNT_STATUS' && u.account_status !== userFilterValue) return false;
              if (userFilterBy === 'PREMIUM_STATUS' && getUserRemainingMeta(u).state !== userFilterValue) return false;
              if (userFilterBy === 'EDUCATION' && (u.education || '').trim() !== userFilterValue) return false;
              if (userFilterBy === 'JOB' && (u.current_job || '').trim() !== userFilterValue) return false;
              if (userFilterBy === 'ADDRESS' && (u.address || '').trim() !== userFilterValue) return false;
              if (userFilterBy === 'INFO_SOURCE' && (u.info_source || '').trim() !== userFilterValue) return false;
              if (userFilterBy === 'ROLE' && u.role !== userFilterValue) return false;
            }
            return true;
          })
          .sort((a, b) => {
            if (userSortBy === 'NAME_ASC') return a.full_name.localeCompare(b.full_name, 'id');
            if (userSortBy === 'REMAINING_ASC') {
              return getUserRemainingMeta(a).days - getUserRemainingMeta(b).days;
            }
            if (userSortBy === 'REMAINING_DESC') {
              return getUserRemainingMeta(b).days - getUserRemainingMeta(a).days;
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });

        const exportTargetUsers = userExportScope === 'ALL' ? users : filteredUsers;
        // Format Excel: Lengkap semua kolom agar mudah diolah kembali
        const userExcelHeaders = [
          'No',
          'Tanggal Daftar',
          'Nama Lengkap',
          'Umur',
          'Email',
          'No. HP / WhatsApp',
          'Pendidikan',
          'Pekerjaan',
          'Alamat',
          'Tau Dari Mana',
          'Instansi Target',
          'Formasi Target',
          'Peran',
          'Status Akun',
          'Status Paket',
          'Tanggal Beli / Mulai Paket',
          'Berlaku Sampai',
          'Sisa Masa Aktif',
          'Kode Referral'
        ];
        const userExcelRows = exportTargetUsers.map((u, idx) => {
          const rem = getUserRemainingMeta(u);
          const regDate = new Date(u.created_at).toLocaleDateString('id-ID');
          const buyDate = getUserPurchaseDate(u);
          const refInfo = u.referral_code || u.registered_referral_code || '-';
          return [
            idx + 1,
            regDate,
            u.full_name,
            u.age ? `${u.age} Thn` : '-',
            u.email,
            u.phone || '-',
            u.education || '-',
            u.current_job || '-',
            u.address || '-',
            u.info_source || '-',
            u.targetAgency || '-',
            u.targetFormation || '-',
            u.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Member',
            u.account_status,
            u.membership_type,
            buyDate,
            rem.expiryStr,
            rem.label,
            refInfo
          ];
        });

        // Format Word & PDF: Kolom penting saja (tanpa Peran, Umur, Tau Dari Mana, Sisa Masa Aktif, Kode Referral) + Instansi & Formasi terpisah
        const userPrintHeaders = [
          'No',
          'Tgl Daftar',
          'Nama Lengkap',
          'Email',
          'No. HP / WA',
          'Pendidikan',
          'Pekerjaan',
          'Alamat',
          'Instansi',
          'Formasi',
          'Status Akun',
          'Status Paket',
          'Tgl Beli Paket',
          'Berlaku Sampai'
        ];
        const userPrintRows = exportTargetUsers.map((u, idx) => {
          const rem = getUserRemainingMeta(u);
          const regDate = new Date(u.created_at).toLocaleDateString('id-ID');
          const buyDate = getUserPurchaseDate(u);
          return [
            idx + 1,
            regDate,
            u.full_name,
            u.email,
            u.phone || '-',
            u.education || '-',
            u.current_job || '-',
            u.address || '-',
            u.targetAgency || '-',
            u.targetFormation || '-',
            u.account_status,
            u.membership_type,
            buyDate,
            rem.expiryStr
          ];
        });

        const filterDimensionLabelMap: Record<typeof userFilterBy, string> = {
          ALL: 'Semua Pengguna',
          PACKAGE: 'Paket Keanggotaan',
          ACCOUNT_STATUS: 'Status Akun',
          PREMIUM_STATUS: 'Sisa Masa Aktif Paket',
          EDUCATION: 'Pendidikan',
          JOB: 'Pekerjaan',
          ADDRESS: 'Alamat / Domisili',
          INFO_SOURCE: 'Tau Dari Mana',
          ROLE: 'Peran Akun'
        };

        const userReportSubtitle =
          userExportScope === 'ALL'
            ? `Seluruh Data Pengguna Terdaftar (${exportTargetUsers.length} Akun)`
            : `Data Hasil Filter & Pencarian (${exportTargetUsers.length} dari ${users.length} Akun)`;

        const userDetailRows: ReportDetailItem[] = [
          {
            label: 'Cakupan Ekspor',
            value:
              userExportScope === 'ALL'
                ? `Semua Data Pengguna (${users.length} Akun)`
                : `Data Terfilter / Pencarian (${filteredUsers.length} Akun)`
          },
          {
            label: 'Filter Aktif',
            value:
              userFilterBy === 'ALL' || userFilterValue === 'ALL'
                ? 'Tidak Ada Filter (Semua)'
                : `${filterDimensionLabelMap[userFilterBy]}: ${userFilterValue}`
          },
          {
            label: 'Kata Kunci Pencarian',
            value: userSearch.trim() ? `"${userSearch.trim()}"` : 'Tidak Ada'
          },
          {
            label: 'Urutan Data',
            value:
              userSortBy === 'NAME_ASC'
                ? 'Nama (A–Z)'
                : userSortBy === 'REMAINING_ASC'
                  ? 'Sisa Masa Aktif Terpendek'
                  : userSortBy === 'REMAINING_DESC'
                    ? 'Sisa Masa Aktif Terlama'
                    : 'Pendaftar Terbaru'
          }
        ];

        const userSummaryCards = [
          { label: 'Total Akun', value: `${exportTargetUsers.length} Akun` },
          {
            label: 'Gratis / Standar',
            value: `${exportTargetUsers.filter(u => u.membership_type === 'FREE').length} / ${exportTargetUsers.filter(u => u.membership_type === 'STANDAR').length}`
          },
          {
            label: 'Premium / Intensif',
            value: `${exportTargetUsers.filter(u => u.membership_type === 'PREMIUM').length} / ${exportTargetUsers.filter(u => u.membership_type === 'INTENSIF').length}`
          },
          {
            label: 'Akun Aktif',
            value: `${exportTargetUsers.filter(u => u.account_status === 'ACTIVE').length} Aktif`
          }
        ];

        const hasActiveFilter = userSearch.trim() !== '' || (userFilterBy !== 'ALL' && userFilterValue !== 'ALL');

        return (
          <div className="space-y-3">
            {/* 1. Dashboard Kartu Statistik Pengguna (Minimalis & Presisi Tablet/HP) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <div className="px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl bg-white border border-slate-200">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 truncate">Total Pengguna</span>
                  <span className="text-base sm:text-lg font-extrabold text-slate-900 font-mono tabular-nums leading-none shrink-0">
                    {totalUsersCount}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate tabular-nums">
                  {memberUsers.length} Mbr · {totalUsersCount - memberUsers.length} Adm
                </div>
              </div>

              <div className="px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl bg-white border border-slate-200">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 truncate">Peserta Gratis</span>
                  <span className="text-base sm:text-lg font-extrabold text-slate-800 font-mono tabular-nums leading-none shrink-0">
                    {freeCount}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate tabular-nums">
                  {totalUsersCount > 0 ? Math.round((freeCount / totalUsersCount) * 100) : 0}% Uji Coba
                </div>
              </div>

              <div className="px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl bg-white border border-sky-200">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] sm:text-[11px] font-bold text-sky-700 truncate">Paket Standar</span>
                  <span className="text-base sm:text-lg font-extrabold text-sky-900 font-mono tabular-nums leading-none shrink-0">
                    {standarCount}
                  </span>
                </div>
                <div className="text-[10px] text-sky-700/80 mt-0.5 truncate">Latihan Soal</div>
              </div>

              <div className="px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl bg-white border border-amber-200">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 truncate">Paket Premium</span>
                  <span className="text-base sm:text-lg font-extrabold text-amber-900 font-mono tabular-nums leading-none shrink-0">
                    {premiumCount}
                  </span>
                </div>
                <div className="text-[10px] text-amber-700/80 mt-0.5 truncate">Belajar Mandiri</div>
              </div>

              <div className="px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl bg-white border border-indigo-200">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] sm:text-[11px] font-bold text-indigo-700 truncate">Paket Intensif</span>
                  <span className="text-base sm:text-lg font-extrabold text-indigo-900 font-mono tabular-nums leading-none shrink-0">
                    {intensifCount}
                  </span>
                </div>
                <div className="text-[10px] text-indigo-700/80 mt-0.5 truncate">Zoom &amp; Kalkulator</div>
              </div>

              <div className="px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl bg-white border border-emerald-200">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 truncate">Akun Aktif</span>
                  <span className="text-base sm:text-lg font-extrabold text-emerald-800 font-mono tabular-nums leading-none shrink-0">
                    {activeCount}
                  </span>
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5 truncate tabular-nums">
                  {inactiveCount} Nonaktif · {expiringSoonCount} ≤30Hr
                </div>
              </div>
            </div>

            {/* 2. Panel Utama Data Pengguna */}
            <div className="p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-slate-200 space-y-3">
              {/* Header & Toolbar Ekspor */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Data Pengguna &amp; Keanggotaan ({filteredUsers.length} dari {users.length} Akun)
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 hidden sm:block">
                    Pantau biodata, status paket, sisa masa aktif premium, cari atau filter dinamis, dan ekspor laporan ke Excel, Word, atau PDF.
                  </p>
                </div>

                {/* Toolbar Ekspor Lengkap */}
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    title="Pilih data yang akan diunduh"
                    className="inline-flex rounded-xl border border-slate-300 bg-slate-100 p-0.5 text-[11px] font-bold"
                  >
                    <button
                      type="button"
                      onClick={() => setUserExportScope('FILTERED')}
                      className={`px-2.5 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors ${
                        userExportScope === 'FILTERED'
                          ? 'bg-white text-blue-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Terfilter ({filteredUsers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserExportScope('ALL')}
                      className={`px-2.5 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors ${
                        userExportScope === 'ALL'
                          ? 'bg-white text-blue-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Semua ({users.length})
                    </button>
                  </div>

                  {renderPaperAndOrientationControls(userPrintHeaders, userPrintRows)}

                  <button
                    type="button"
                    onClick={() =>
                      void exportTableToExcel(
                        `Data_Pengguna_LOGINCPNS_${new Date().toISOString().slice(0, 10)}.xlsx`,
                        'Data Pengguna',
                        userExcelHeaders,
                        userExcelRows,
                        {
                          orientation: reportOrientation,
                          paperSize: reportPaperSize,
                          title: 'Laporan Data Pengguna & Keanggotaan LOGIN CPNS',
                          subtitle: userReportSubtitle,
                          summaryCards: userSummaryCards,
                          detailRows: userDetailRows,
                          brandInfo: officialBrandInfo
                        }
                      )
                    }
                    className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void exportTableToWord(
                        `Data_Pengguna_LOGINCPNS_${new Date().toISOString().slice(0, 10)}.doc`,
                        'Laporan Data Pengguna & Keanggotaan LOGIN CPNS',
                        userReportSubtitle,
                        userPrintHeaders,
                        userPrintRows,
                        {
                          orientation: reportOrientation,
                          paperSize: reportPaperSize,
                          summaryCards: userSummaryCards,
                          detailRows: userDetailRows,
                          brandInfo: officialBrandInfo
                        }
                      )
                    }
                    className="px-3 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Word (.doc)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void exportTableToPdf(
                        `Data_Pengguna_LOGINCPNS_${new Date().toISOString().slice(0, 10)}.pdf`,
                        'Laporan Data Pengguna & Keanggotaan LOGIN CPNS',
                        userReportSubtitle,
                        userPrintHeaders,
                        userPrintRows,
                        {
                          orientation: reportOrientation,
                          paperSize: reportPaperSize,
                          summaryCards: userSummaryCards,
                          detailRows: userDetailRows,
                          brandInfo: officialBrandInfo
                        }
                      )
                    }
                    className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>PDF (.pdf)</span>
                  </button>
                </div>
              </div>

              {/* Search & Compact "Filter Berdasarkan" Bar */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-2.5 text-xs items-center">
                <div className="relative md:col-span-5">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Cari nama, no. HP, email, pendidikan, pekerjaan, atau alamat..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div className="md:col-span-3">
                  <select
                    aria-label="Filter berdasarkan kategori"
                    value={userFilterBy}
                    onChange={e => {
                      const nextDim = e.target.value as typeof userFilterBy;
                      setUserFilterBy(nextDim);
                      setUserFilterValue('ALL');
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    <option value="ALL">Filter Berdasarkan: Semua Data</option>
                    <option value="PACKAGE">Paket (Gratis / Standar / Premium / Intensif)</option>
                    <option value="ACCOUNT_STATUS">Status Akun (Aktif / Tidak Aktif)</option>
                    <option value="PREMIUM_STATUS">Sisa Masa Aktif Paket</option>
                    <option value="EDUCATION">Pendidikan Terakhir</option>
                    <option value="JOB">Pekerjaan</option>
                    <option value="ADDRESS">Alamat / Domisili</option>
                    <option value="INFO_SOURCE">Tau Dari Mana</option>
                    <option value="ROLE">Peran (Member / Admin)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <select
                    aria-label="Pilih nilai filter"
                    disabled={userFilterBy === 'ALL'}
                    value={userFilterValue}
                    onChange={e => setUserFilterValue(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold ${
                      userFilterBy === 'ALL'
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white border-blue-300 text-slate-800'
                    }`}
                  >
                    <option value="ALL">
                      {userFilterBy === 'ALL' ? 'Pilih Kategori Dulu' : 'Semua Nilai'}
                    </option>
                    {dynamicFilterOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 flex items-center gap-1.5">
                  <select
                    aria-label="Urutkan data pengguna"
                    value={userSortBy}
                    onChange={e => setUserSortBy(e.target.value as typeof userSortBy)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    <option value="CREATED_DESC">Terbaru Daftar</option>
                    <option value="NAME_ASC">Nama (A–Z)</option>
                    <option value="REMAINING_ASC">Sisa Aktif Terpendek</option>
                    <option value="REMAINING_DESC">Sisa Aktif Terlama</option>
                  </select>

                  {hasActiveFilter && (
                    <button
                      type="button"
                      title="Reset pencarian dan filter"
                      onClick={() => {
                        setUserSearch('');
                        setUserFilterBy('ALL');
                        setUserFilterValue('ALL');
                      }}
                      className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tabel Dinamis & Presisi (Hemat Ruang Saat Sidebar Muncul) */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-bold">
                      <th className="py-2.5 px-2.5 w-10 text-center">No</th>
                      <th className="py-2.5 px-3 min-w-[185px]">Peserta &amp; Kontak</th>
                      <th className="py-2.5 px-3 min-w-[265px]">Biodata &amp; Info</th>
                      <th className="py-2.5 px-3 w-[135px]">Akun &amp; Paket</th>
                      <th className="py-2.5 px-3 w-[145px]">Sisa Masa Aktif</th>
                      <th className="py-2.5 px-3 w-[155px] text-center">Kelola Paket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-500">
                          Tidak ada pengguna yang sesuai dengan pencarian atau filter yang dipilih.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u, idx) => {
                        const rem = getUserRemainingMeta(u);
                        const buyDate = getUserPurchaseDate(u);
                        const regDate = new Date(u.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        });
                        return (
                          <tr key={u.id} className="align-top hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-2.5 text-center font-mono tabular-nums text-slate-500 font-semibold">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-3 space-y-1">
                              <div className="font-bold text-slate-900 leading-snug">
                                {u.full_name}
                              </div>
                              <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-1.5">
                                <span>{u.age ? `${u.age} thn` : 'Umur -'}</span>
                                <span aria-hidden="true">·</span>
                                <span className="font-medium text-slate-600">
                                  {u.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Member'}
                                </span>
                              </div>
                              <div className="text-[11px] font-mono text-slate-700 break-all">
                                {u.email}
                              </div>
                              <div className="text-[11px] font-mono text-slate-600 tabular-nums">
                                {u.phone || '-'} · Daftar {regDate}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <table className="w-full border-collapse border border-slate-200 text-[11px]">
                                <tbody>
                                  <tr>
                                    <td className="w-[74px] bg-slate-50 px-2 py-1 border-b border-r border-slate-200 font-semibold text-slate-600">
                                      Pendidikan
                                    </td>
                                    <td className="px-2 py-1 border-b border-slate-200 text-slate-800">
                                      {u.education || '-'}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="bg-slate-50 px-2 py-1 border-b border-r border-slate-200 font-semibold text-slate-600">
                                      Pekerjaan
                                    </td>
                                    <td className="px-2 py-1 border-b border-slate-200 text-slate-800">
                                      {u.current_job || '-'}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="bg-slate-50 px-2 py-1 border-b border-r border-slate-200 font-semibold text-slate-600">
                                      Alamat
                                    </td>
                                    <td className="px-2 py-1 border-b border-slate-200 text-slate-800">
                                      {u.address || '-'}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="bg-slate-50 px-2 py-1 border-r border-slate-200 font-semibold text-slate-600">
                                      Tau Dari
                                    </td>
                                    <td className="px-2 py-1 text-slate-800">
                                      {u.info_source || '-'}
                                      {u.targetAgency ? (
                                        <span className="text-slate-500"> · Target: {u.targetAgency}</span>
                                      ) : null}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                            <td className="py-3 px-3 space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    u.account_status === 'ACTIVE'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-red-50 text-red-700 border border-red-200'
                                  }`}
                                >
                                  {u.account_status === 'ACTIVE' ? 'AKTIF' : 'NONAKTIF'}
                                </span>
                              </div>
                              <div>
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                    u.membership_type === 'INTENSIF'
                                      ? 'bg-indigo-100 text-indigo-800'
                                      : u.membership_type === 'PREMIUM'
                                        ? 'bg-amber-100 text-amber-800'
                                        : u.membership_type === 'STANDAR'
                                          ? 'bg-sky-100 text-sky-800'
                                          : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {u.membership_type}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 tabular-nums">
                                Beli: {buyDate}
                              </div>
                            </td>
                            <td className="py-3 px-3 space-y-1">
                              <div
                                className={`text-xs font-extrabold font-mono tabular-nums ${
                                  rem.state === 'ACTIVE_PKG'
                                    ? 'text-emerald-700'
                                    : rem.state === 'EXPIRING_SOON'
                                      ? 'text-amber-700'
                                      : rem.state === 'EXPIRED'
                                        ? 'text-red-700'
                                        : 'text-slate-500'
                                }`}
                              >
                                {rem.label}
                              </div>
                              {rem.expiryStr !== '-' && (
                                <div className="text-[10px] text-slate-500 tabular-nums">
                                  s.d. {rem.expiryStr}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <select
                                aria-label={`Ubah paket ${u.full_name}`}
                                value={u.membership_type}
                                onChange={e => {
                                  const nextTier = e.target.value as MembershipType;
                                  manualSetMembershipTier(
                                    u.id,
                                    nextTier,
                                    nextTier === 'INTENSIF' ? 90 : nextTier === 'FREE' ? 0 : 365
                                  );
                                }}
                                className="w-full px-2 py-1.5 text-[11px] font-bold rounded-lg bg-slate-50 border border-slate-300 text-slate-800 hover:border-blue-400 cursor-pointer"
                              >
                                <option value="FREE">FREE (Gratis)</option>
                                <option value="STANDAR">STANDAR (Soal)</option>
                                <option value="PREMIUM">PREMIUM (Mandiri)</option>
                                <option value="INTENSIF">INTENSIF (Bimbel)</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= 3. BANK SOAL TERPILAH PER MENU PESERTA & KOTAK / PAKET ================= */}
      {currentAdminTab === 'admin-questions' && (() => {
        const matchesAdminBankMenu = (
          pkg: PracticePackage,
          menu: typeof adminBankMenuFilter
        ): boolean => {
          if (menu === 'ALL') return true;
          if (menu === 'TRYOUT_LENGKAP') {
            return pkg.package_type === 'TRYOUT_SKD' || pkg.package_type === 'TRYOUT_AKBAR';
          }
          if (menu === 'LATIHAN_HARIAN') {
            return pkg.package_type === 'LATIHAN_HARIAN' || pkg.package_type === 'DRILL_KATEGORI';
          }
          if (menu === 'TRYOUT_KATEGORI') {
            return pkg.package_type === 'DRILL_KATEGORI';
          }
          if (menu === 'TRYOUT_BARENG') {
            return pkg.package_type === 'TRYOUT_AKBAR';
          }
          return true;
        };

        const handleSelectBankMenu = (menu: typeof adminBankMenuFilter) => {
          setAdminBankMenuFilter(menu);
          setSelectedPackageFilter('ALL');
          setAdminBankCatFilter('ALL');
          setAdminBankTierFilter('ALL');
          setSelectedBankQuestionIds([]);
        };

        const menuMeta: Array<{
          key: typeof adminBankMenuFilter;
          label: string;
          subLabel: string;
          boxCount: number;
          badgeText: string;
          icon: React.ReactNode;
        }> = [
          {
            key: 'ALL',
            label: 'Semua Menu',
            subLabel: 'Seluruh kotak & bank soal',
            boxCount: practicePackages.length,
            badgeText: `${practicePackages.length} Kotak · ${questions.length} Soal`,
            icon: <Layers className="w-4 h-4 shrink-0" />
          },
          {
            key: 'TRYOUT_LENGKAP',
            label: 'Tryout Lengkap',
            subLabel: 'Tab 1 Peserta (SKD & Akbar)',
            boxCount: practicePackages.filter(p => matchesAdminBankMenu(p, 'TRYOUT_LENGKAP')).length,
            badgeText: `${practicePackages.filter(p => matchesAdminBankMenu(p, 'TRYOUT_LENGKAP')).length} Kotak`,
            icon: <Award className="w-4 h-4 shrink-0" />
          },
          {
            key: 'LATIHAN_HARIAN',
            label: 'Latihan Harian & Drill',
            subLabel: 'Tab 2 Peserta (TIU, TWK, TKP)',
            boxCount: practicePackages.filter(p => matchesAdminBankMenu(p, 'LATIHAN_HARIAN')).length,
            badgeText: `${practicePackages.filter(p => matchesAdminBankMenu(p, 'LATIHAN_HARIAN')).length} Kotak`,
            icon: <Clock className="w-4 h-4 shrink-0" />
          },
          {
            key: 'TRYOUT_KATEGORI',
            label: 'Tryout Kategori & Spesialis',
            subLabel: 'Tab 3 Peserta (TWK/TIU/TKP)',
            boxCount: practicePackages.filter(p => matchesAdminBankMenu(p, 'TRYOUT_KATEGORI')).length,
            badgeText: `${practicePackages.filter(p => matchesAdminBankMenu(p, 'TRYOUT_KATEGORI')).length} Kotak · ${questions.length} Bank`,
            icon: <Sparkles className="w-4 h-4 shrink-0" />
          },
          {
            key: 'TRYOUT_BARENG',
            label: 'Tryout Bareng',
            subLabel: 'Tab 4 Peserta (Akbar & Sesi)',
            boxCount: practicePackages.filter(p => matchesAdminBankMenu(p, 'TRYOUT_BARENG')).length,
            badgeText: `${practicePackages.filter(p => matchesAdminBankMenu(p, 'TRYOUT_BARENG')).length} Kotak · ${groupSessions.length} Sesi`,
            icon: <Users className="w-4 h-4 shrink-0" />
          }
        ];

        const sortPracticePackages = (list: PracticePackage[]): PracticePackage[] => {
          const arr = [...list];
          if (adminBankSortBy === 'NAME_ASC') {
            return arr.sort((a, b) =>
              a.title.localeCompare(b.title, 'id', { numeric: true, sensitivity: 'base' })
            );
          }
          if (adminBankSortBy === 'NAME_DESC') {
            return arr.sort((a, b) =>
              b.title.localeCompare(a.title, 'id', { numeric: true, sensitivity: 'base' })
            );
          }
          if (adminBankSortBy === 'NEWEST') {
            return arr.sort(
              (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            );
          }
          if (adminBankSortBy === 'OLDEST') {
            return arr.sort(
              (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
            );
          }
          if (adminBankSortBy === 'MOST_QUESTIONS') {
            return arr.sort((a, b) => {
              const ca = questions.filter(q => isQuestionInPackage(q, a)).length;
              const cb = questions.filter(q => isQuestionInPackage(q, b)).length;
              return cb !== ca ? cb - ca : b.question_count - a.question_count;
            });
          }
          if (adminBankSortBy === 'FEWEST_QUESTIONS') {
            return arr.sort((a, b) => {
              const ca = questions.filter(q => isQuestionInPackage(q, a)).length;
              const cb = questions.filter(q => isQuestionInPackage(q, b)).length;
              return ca !== cb ? ca - cb : a.question_count - b.question_count;
            });
          }
          if (adminBankSortBy === 'PUBLISHED_FIRST') {
            return arr.sort((a, b) => (b.is_active !== false ? 1 : 0) - (a.is_active !== false ? 1 : 0));
          }
          if (adminBankSortBy === 'UNPUBLISHED_FIRST') {
            return arr.sort((a, b) => (a.is_active !== false ? 1 : 0) - (b.is_active !== false ? 1 : 0));
          }
          return arr;
        };

        const sortQuestionsList = (list: Question[]): Question[] => {
          const arr = [...list];
          if (adminBankSortBy === 'NAME_ASC') {
            return arr.sort((a, b) =>
              a.question_text.localeCompare(b.question_text, 'id', {
                numeric: true,
                sensitivity: 'base'
              })
            );
          }
          if (adminBankSortBy === 'NAME_DESC') {
            return arr.sort((a, b) =>
              b.question_text.localeCompare(a.question_text, 'id', {
                numeric: true,
                sensitivity: 'base'
              })
            );
          }
          if (adminBankSortBy === 'NEWEST') {
            return arr.sort(
              (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            );
          }
          if (adminBankSortBy === 'OLDEST') {
            return arr.sort(
              (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
            );
          }
          if (adminBankSortBy === 'PUBLISHED_FIRST') {
            return arr.sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0));
          }
          if (adminBankSortBy === 'UNPUBLISHED_FIRST') {
            return arr.sort((a, b) => (a.is_active ? 1 : 0) - (b.is_active ? 1 : 0));
          }
          return arr;
        };

        const packagesInMenu = sortPracticePackages(
          practicePackages.filter(pkg => matchesAdminBankMenu(pkg, adminBankMenuFilter))
        );

        const packagesMatchingSubFilters = packagesInMenu.filter(pkg => {
          if (adminBankCatFilter !== 'ALL' && pkg.category !== adminBankCatFilter) return false;
          if (adminBankTierFilter !== 'ALL' && pkg.access_tier !== adminBankTierFilter) return false;
          if (adminBankSearch.trim()) {
            const q = adminBankSearch.toLowerCase();
            const matchPkg =
              pkg.title.toLowerCase().includes(q) ||
              (pkg.subtitle && pkg.subtitle.toLowerCase().includes(q)) ||
              pkg.category.toLowerCase().includes(q);
            if (!matchPkg) return false;
          }
          return true;
        });

        const visiblePackageCards =
          selectedPackageFilter === 'ALL'
            ? packagesMatchingSubFilters
            : packagesInMenu.filter(pkg => pkg.id === selectedPackageFilter);

        const selectedFocusedPkg =
          selectedPackageFilter !== 'ALL'
            ? practicePackages.find(p => p.id === selectedPackageFilter) || null
            : null;

        const availableCategoriesInMenu: Array<'ALL' | QuestionCategory | 'CAMPURAN'> = ['ALL'];
        (['TWK', 'TIU', 'TKP', 'CAMPURAN'] as const).forEach(cat => {
          if (
            adminBankMenuFilter === 'ALL' ||
            adminBankMenuFilter === 'TRYOUT_KATEGORI' ||
            packagesInMenu.some(p => p.category === cat)
          ) {
            availableCategoriesInMenu.push(cat);
          }
        });

        const activeMenuObj = menuMeta.find(m => m.key === adminBankMenuFilter) || menuMeta[0];

        const filteredTableQuestions = sortQuestionsList(
          questions.filter(q => {
            if (selectedFocusedPkg) {
              if (!isQuestionInPackage(q, selectedFocusedPkg)) return false;
            } else if (adminBankMenuFilter === 'TRYOUT_LENGKAP' || adminBankMenuFilter === 'LATIHAN_HARIAN') {
              // Tampilkan soal yang masuk ke salah satu kotak di menu terpilih
              const belongsToMenuPkg = packagesMatchingSubFilters.some(pkg => isQuestionInPackage(q, pkg));
              if (!belongsToMenuPkg) return false;
            }

            if (adminBankCatFilter !== 'ALL' && adminBankCatFilter !== 'CAMPURAN') {
              if (q.category !== adminBankCatFilter) return false;
            }

            if (adminBankSearch.trim()) {
              const s = adminBankSearch.toLowerCase();
              const matchQ =
                q.question_text.toLowerCase().includes(s) ||
                q.topic.toLowerCase().includes(s) ||
                (q.package_title && q.package_title.toLowerCase().includes(s));
              if (!matchQ) return false;
            }
            return true;
          })
        );

        return (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Bank Soal &amp; Pengelolaan Kotak Paket ({practicePackages.length} Kotak · {questions.length} Butir Soal)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pilih menu sesuai tampilan peserta terlebih dahulu, lalu filter kotak-kotak soal di dalamnya untuk menambah atau mengelola soal dengan cepat.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleOpenImportForPackage(selectedFocusedPkg || undefined)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Import Massal
                  </button>
                  <button
                    onClick={handleOpenNewPackage}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>+ Buat Kotak Soal Baru</span>
                  </button>
                  <button
                    onClick={() =>
                      handleOpenNewQuestion(
                        selectedFocusedPkg?.id,
                        selectedFocusedPkg?.title,
                        'NEW'
                      )
                    }
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>
                      {selectedFocusedPkg ? '+ Tambah Soal ke Kotak Ini' : '+ Tambah Soal Baru'}
                    </span>
                  </button>
                </div>
              </div>

              {/* TAHAP 1: KOTAK FILTER BERDASARKAN MENU PESERTA (Mirrors TryoutHubView Tabs) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-blue-600" />
                    1. Filter Menu Peserta
                  </span>
                  {adminBankMenuFilter !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => handleSelectBankMenu('ALL')}
                      className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      Lihat Semua Menu
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {menuMeta.map(menu => {
                    const isActive = adminBankMenuFilter === menu.key;
                    return (
                      <button
                        key={menu.key}
                        type="button"
                        onClick={() => handleSelectBankMenu(menu.key)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                          isActive
                            ? 'bg-blue-700 text-white border-blue-700 shadow-sm ring-2 ring-blue-200'
                            : 'bg-slate-50/80 hover:bg-white text-slate-800 border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 font-extrabold text-xs leading-tight">
                            <span className={isActive ? 'text-amber-300' : 'text-blue-600'}>
                              {menu.icon}
                            </span>
                            <span>{menu.label}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p
                            className={`text-[10px] leading-tight line-clamp-1 ${
                              isActive ? 'text-blue-100' : 'text-slate-500'
                            }`}
                          >
                            {menu.subLabel}
                          </p>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-white border border-slate-200 text-slate-700'
                            }`}
                          >
                            {menu.badgeText}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TAHAP 2: SUB-FILTER KOTAK-KOTAK SOAL, KATEGORI, TIER & PENCARIAN DI MENU TERPILIH */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mr-1">
                      2. Filter Kotak Soal ({activeMenuObj.label}):
                    </span>

                    {/* Category Filter Pills */}
                    {availableCategoriesInMenu.map(cat => {
                      const isCatActive = adminBankCatFilter === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setAdminBankCatFilter(cat);
                            setSelectedPackageFilter('ALL');
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            isCatActive
                              ? 'bg-slate-900 text-white shadow-2xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {cat === 'ALL' ? 'Semua Kategori' : cat}
                        </button>
                      );
                    })}

                    {/* Tier Filter Select */}
                    <select
                      value={adminBankTierFilter}
                      onChange={e => {
                        setAdminBankTierFilter(e.target.value as 'ALL' | PackageAccessTier);
                        setSelectedPackageFilter('ALL');
                      }}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 cursor-pointer"
                    >
                      <option value="ALL">Semua Tier</option>
                      <option value="GRATIS">GRATIS</option>
                      <option value="PREMIUM">PREMIUM</option>
                      <option value="PLATINUM">PLATINUM</option>
                    </select>

                    {/* Sort Order Select (A-Z, Z-A, Terbaru, Terlama, Jumlah Soal, Status Terbit) */}
                    <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                      <ArrowUpDown className="w-3 h-3 text-blue-600 shrink-0" />
                      <select
                        value={adminBankSortBy}
                        onChange={e =>
                          setAdminBankSortBy(e.target.value as typeof adminBankSortBy)
                        }
                        className="bg-transparent text-[11px] font-bold text-slate-800 focus:outline-none cursor-pointer"
                        title="Urutkan Kotak Soal & Butir Soal"
                      >
                        <option value="DEFAULT">Urutan: Bawaan</option>
                        <option value="NAME_ASC">Urutan: A – Z</option>
                        <option value="NAME_DESC">Urutan: Z – A</option>
                        <option value="NEWEST">Terbaru Ditambahkan</option>
                        <option value="OLDEST">Terlama Ditambahkan</option>
                        <option value="MOST_QUESTIONS">Soal Terbanyak</option>
                        <option value="FEWEST_QUESTIONS">Soal Tersedikit</option>
                        <option value="PUBLISHED_FIRST">Status: Terbit Dulu</option>
                        <option value="UNPUBLISHED_FIRST">Status: Nonterbit Dulu</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick Search Input */}
                  <div className="relative w-full lg:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={adminBankSearch}
                      onChange={e => setAdminBankSearch(e.target.value)}
                      placeholder="Cari nama kotak atau teks soal..."
                      className="w-full pl-8 pr-8 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                    {adminBankSearch && (
                      <button
                        type="button"
                        onClick={() => setAdminBankSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Precision Symmetrical Kotak-Kotak Soal Selector (Try Out Top, Latihan TWK Kiri | TIU Tengah | TKP Kanan) */}
                {(() => {
                  const renderBoxFilterButton = (pkg: PracticePackage) => {
                    const countInPkg = questions.filter(q => isQuestionInPackage(q, pkg)).length;
                    const isBoxSelected = selectedPackageFilter === pkg.id;
                    const isUnpublished = pkg.is_active === false;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => {
                          setSelectedPackageFilter(isBoxSelected ? 'ALL' : pkg.id);
                          setSelectedBankQuestionIds([]);
                        }}
                        className={`w-full px-2.5 py-2 rounded-lg text-[11px] font-bold border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          isBoxSelected
                            ? 'bg-indigo-700 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-200'
                            : isUnpublished
                            ? 'bg-amber-50/70 text-slate-600 border-dashed border-amber-300 hover:border-amber-500'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase shrink-0 ${
                              isBoxSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {pkg.category === 'CAMPURAN' ? 'SKD' : pkg.category}
                          </span>
                          <span className="truncate text-left">{pkg.title}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isUnpublished && (
                            <span
                              className={`px-1 py-0.5 rounded text-[9px] font-extrabold ${
                                isBoxSelected
                                  ? 'bg-white/20 text-amber-200'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              OFF
                            </span>
                          )}
                          <span
                            className={`min-w-[24px] text-center px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                              isBoxSelected
                                ? 'bg-amber-300 text-slate-950'
                                : countInPkg > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {countInPkg}
                          </span>
                        </div>
                      </button>
                    );
                  };

                  const filterTryoutBoxes = packagesMatchingSubFilters.filter(
                    p => p.package_type === 'TRYOUT_SKD' || p.package_type === 'TRYOUT_AKBAR'
                  );
                  const filterLatihanBoxes = packagesMatchingSubFilters.filter(
                    p => p.package_type === 'LATIHAN_HARIAN' || p.package_type === 'DRILL_KATEGORI'
                  );
                  const filterTwkBoxes = filterLatihanBoxes.filter(p => p.category === 'TWK');
                  const filterTiuBoxes = filterLatihanBoxes.filter(p => p.category === 'TIU');
                  const filterTkpBoxes = filterLatihanBoxes.filter(p => p.category === 'TKP');
                  const hasSplitLatihanCols =
                    adminBankCatFilter === 'ALL' &&
                    (filterTwkBoxes.length > 0 || filterTiuBoxes.length > 0 || filterTkpBoxes.length > 0) &&
                    [filterTwkBoxes.length, filterTiuBoxes.length, filterTkpBoxes.length].filter(n => n > 0).length > 1;

                  return (
                    <div className="space-y-3 pt-2 border-t border-slate-200/80">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500">
                          Klik salah satu <strong>Kotak Soal</strong> di bawah untuk fokus mengelola atau menerbitkan/menonaktifkan soalnya:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPackageFilter('ALL');
                              setSelectedBankQuestionIds([]);
                            }}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                              selectedPackageFilter === 'ALL'
                                ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                            }`}
                          >
                            Semua Kotak ({packagesMatchingSubFilters.length})
                          </button>
                        </div>
                      </div>

                      {packagesMatchingSubFilters.length === 0 ? (
                        <div className="p-3 bg-white rounded-lg border border-dashed border-slate-300 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
                          <span>Tidak ada kotak paket yang cocok dengan filter menu/kategori/pencarian ini.</span>
                          <button
                            type="button"
                            onClick={handleOpenNewPackage}
                            className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                          >
                            + Buat Kotak Baru di Menu Ini
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* AREA ATAS: TRY OUT SKD & AKBAR (Grid 3 Kolom Presisi) */}
                          {filterTryoutBoxes.length > 0 && (
                            <div className="p-3 rounded-xl bg-white border border-blue-200/80 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                                  <Award className="w-3.5 h-3.5 text-blue-600" />
                                  Area Try Out (SKD &amp; Akbar) · {filterTryoutBoxes.length} Kotak
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {filterTryoutBoxes.map(renderBoxFilterButton)}
                              </div>
                            </div>
                          )}

                          {/* AREA BAWAH: LATIHAN TWK (Kiri) · TIU (Tengah) · TKP (Kanan) */}
                          {filterLatihanBoxes.length > 0 && (
                            hasSplitLatihanCols ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                                {/* KOLOM KIRI: TWK */}
                                <div className="p-3 rounded-xl bg-white border border-blue-200/80 flex flex-col gap-2">
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
                                      Kiri · Latihan TWK
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono font-bold text-[10px]">
                                      {filterTwkBoxes.length} Kotak
                                    </span>
                                  </div>
                                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                                    {filterTwkBoxes.length > 0 ? (
                                      filterTwkBoxes.map(renderBoxFilterButton)
                                    ) : (
                                      <p className="text-[11px] text-slate-400 italic py-2 text-center">
                                        Belum ada kotak TWK
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* KOLOM TENGAH: TIU */}
                                <div className="p-3 rounded-xl bg-white border border-sky-200/80 flex flex-col gap-2">
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-700">
                                      Tengah · Latihan TIU
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-mono font-bold text-[10px]">
                                      {filterTiuBoxes.length} Kotak
                                    </span>
                                  </div>
                                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                                    {filterTiuBoxes.length > 0 ? (
                                      filterTiuBoxes.map(renderBoxFilterButton)
                                    ) : (
                                      <p className="text-[11px] text-slate-400 italic py-2 text-center">
                                        Belum ada kotak TIU
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* KOLOM KANAN: TKP */}
                                <div className="p-3 rounded-xl bg-white border border-emerald-200/80 flex flex-col gap-2">
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                                      Kanan · Latihan TKP
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px]">
                                      {filterTkpBoxes.length} Kotak
                                    </span>
                                  </div>
                                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                                    {filterTkpBoxes.length > 0 ? (
                                      filterTkpBoxes.map(renderBoxFilterButton)
                                    ) : (
                                      <p className="text-[11px] text-slate-400 italic py-2 text-center">
                                        Belum ada kotak TKP
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                                    Area Latihan &amp; Drill · {filterLatihanBoxes.length} Kotak
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {filterLatihanBoxes.map(renderBoxFilterButton)}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Contextual Helper Info for Tab 3 (Tryout Kategori) & Tab 4 (Tryout Bareng) */}
                {adminBankMenuFilter === 'TRYOUT_KATEGORI' && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong>Info Menu Tryout Kategori &amp; Spesialis:</strong> Selain kotak Drill Kategori di atas, item Spesialis TWK (30), TIU (35), TKP (45), &amp; SKD pada halaman peserta mengambil soal langsung dari Bank Soal berdasarkan kategorinya.
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuestionViewMode('ALL_QUESTIONS')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shrink-0 cursor-pointer"
                    >
                      Kelola Butir Soal per Kategori &rarr;
                    </button>
                  </div>
                )}

                {adminBankMenuFilter === 'TRYOUT_BARENG' && (
                  <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-[11px] text-purple-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong>Jadwal Sesi Tryout Bareng Aktif ({groupSessions.length} sesi):</strong>{' '}
                      {groupSessions.map(s => s.title).join(' · ') || 'Belum ada jadwal sesi.'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveView('admin-together-sessions')}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold shrink-0 cursor-pointer"
                    >
                      Kelola Jadwal di 9. Tryout Bersama &rarr;
                    </button>
                  </div>
                )}
              </div>

              {/* View Mode Toggle Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                  <button
                    onClick={() => setQuestionViewMode('PACKAGES')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                      questionViewMode === 'PACKAGES'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Tampilan Kotak / Paket Soal ({visiblePackageCards.length})</span>
                  </button>
                  <button
                    onClick={() => setQuestionViewMode('ALL_QUESTIONS')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                      questionViewMode === 'ALL_QUESTIONS'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Daftar Butir Soal ({filteredTableQuestions.length})</span>
                  </button>
                </div>

                {questionViewMode === 'ALL_QUESTIONS' && (
                  <div className="flex items-center gap-2 text-xs">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={selectedPackageFilter}
                      onChange={e => {
                        setSelectedPackageFilter(e.target.value);
                        setSelectedBankQuestionIds([]);
                      }}
                      className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 max-w-xs"
                    >
                      <option value="ALL">
                        {adminBankMenuFilter === 'ALL'
                          ? 'Semua Kotak & Soal Umum'
                          : `Semua Kotak di ${activeMenuObj.label}`}
                      </option>
                      {packagesInMenu.map(pkg => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.title} ({pkg.category})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {bankAssignNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{bankAssignNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBankAssignNotice('')}
                    className="text-emerald-700 hover:text-emerald-900 font-bold px-1.5"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* MODE 1: PACKAGES / KOTAK SOAL (Symmetric Precision Grid + Terbitkan/Nonterbitkan) */}
              {questionViewMode === 'PACKAGES' && (() => {
                const togglePackagePublish = (pkg: PracticePackage) => {
                  const nextPublished = pkg.is_active === false;
                  updatePracticePackage({
                    ...pkg,
                    is_active: nextPublished
                  });
                  setBankAssignNotice(
                    nextPublished
                      ? `Kotak "${pkg.title}" DITERBITKAN — sekarang tampil di halaman Peserta.`
                      : `Kotak "${pkg.title}" DINONTERBITKAN — disembunyikan sementara dari halaman Peserta.`
                  );
                  setTimeout(() => setBankAssignNotice(''), 5000);
                };

                const renderPackageCard = (pkg: PracticePackage) => {
                  const assignedList = questions.filter(q => isQuestionInPackage(q, pkg));
                  const assignedCount = assignedList.length;
                  const publishedQCount = assignedList.filter(q => q.is_active).length;
                  const twkCount = assignedList.filter(q => q.category === 'TWK').length;
                  const tiuCount = assignedList.filter(q => q.category === 'TIU').length;
                  const tkpCount = assignedList.filter(q => q.category === 'TKP').length;
                  const isFocused = selectedPackageFilter === pkg.id;
                  const isPublished = pkg.is_active !== false;

                  return (
                    <div
                      key={pkg.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 h-full ${
                        isFocused
                          ? 'border-indigo-500 bg-indigo-50/30 shadow-sm ring-2 ring-indigo-100'
                          : !isPublished
                          ? 'border-dashed border-amber-300 bg-amber-50/30 hover:bg-amber-50/50'
                          : 'border-slate-200 bg-slate-50/40 hover:bg-white hover:border-blue-400 hover:shadow-sm'
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* Top Badges Row — strictly single line, flush left & right */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 whitespace-nowrap shrink-0">
                            {pkg.package_type === 'TRYOUT_SKD' || pkg.package_type === 'TRYOUT_AKBAR'
                              ? 'TRY OUT'
                              : pkg.package_type === 'DRILL_KATEGORI'
                              ? 'DRILL'
                              : 'LATIHAN'}{' '}
                            · {pkg.category === 'CAMPURAN' ? 'SKD' : pkg.category}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase whitespace-nowrap ${
                                isPublished
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isPublished ? 'TERBIT' : 'NONTERBIT'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase whitespace-nowrap ${
                                pkg.access_tier === 'PLATINUM'
                                  ? 'bg-purple-600 text-white'
                                  : pkg.access_tier === 'PREMIUM'
                                  ? 'bg-sky-500 text-white'
                                  : 'bg-emerald-600 text-white'
                              }`}
                            >
                              {pkg.access_tier}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <h3 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-2 min-h-[40px]">
                            {pkg.title}
                          </h3>
                          <p className="text-[11px] text-slate-500 line-clamp-1 min-h-[16px]">
                            {pkg.subtitle || 'Paket latihan & simulasi SKD CPNS'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] bg-white px-2.5 py-2 rounded-lg border border-slate-200">
                          <span className="text-slate-500">Target / Waktu:</span>
                          <span className="font-mono font-bold text-slate-800 whitespace-nowrap">
                            {pkg.question_count} Soal · {pkg.duration_minutes} Menit
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Soal Terkait Langsung:</span>
                            <span className="font-mono font-bold text-blue-700 whitespace-nowrap">
                              {assignedCount} butir{assignedCount > 0 ? ` (${publishedQCount} terbit)` : ''}
                            </span>
                          </div>
                          {assignedCount > 0 && pkg.category === 'CAMPURAN' && (
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600">
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">
                                TWK {twkCount}
                              </span>
                              <span className="px-1.5 py-0.5 bg-sky-50 text-sky-700 rounded">
                                TIU {tiuCount}
                              </span>
                              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded">
                                TKP {tkpCount}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Precision Symmetrical 3-Row Action Grid (Equal Left/Right Alignment) */}
                      <div className="pt-2.5 border-t border-slate-200 space-y-1.5">
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenNewQuestion(pkg.id, pkg.title, 'NEW')}
                            className="h-8 px-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                            title="Tambah 1 Soal Manual ke Kotak Ini"
                          >
                            <Plus className="w-3.5 h-3.5 shrink-0" />
                            <span>+ Soal</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenNewQuestion(pkg.id, pkg.title, 'PICK_EXISTING')
                            }
                            className="h-8 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                            title="Ambil soal yang sudah ada dari Bank Soal ke Kotak Ini"
                          >
                            <ListPlus className="w-3.5 h-3.5 shrink-0" />
                            <span>Ambil Bank</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenImportForPackage(pkg)}
                            className="h-8 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                            title="Import Banyak Soal Sekaligus ke Kotak Ini"
                          >
                            <Upload className="w-3.5 h-3.5 shrink-0" />
                            <span>Import Soal</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPackageFilter(pkg.id);
                              setSelectedBankQuestionIds([]);
                              setQuestionViewMode('ALL_QUESTIONS');
                            }}
                            className="h-8 px-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                            title="Lihat & Kelola Daftar Soal di Kotak Ini"
                          >
                            <Database className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                            <span>Lihat ({assignedCount})</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => togglePackagePublish(pkg)}
                            className={`flex-1 h-8 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 whitespace-nowrap border transition-colors cursor-pointer ${
                              isPublished
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                            }`}
                            title={
                              isPublished
                                ? 'Nonterbitkan kotak soal ini agar sementara tidak tampil di Peserta'
                                : 'Terbitkan kotak soal ini agar langsung tampil di Peserta'
                            }
                          >
                            {isPublished ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5 shrink-0" />
                                <span>Nonterbitkan</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5 shrink-0" />
                                <span>Terbitkan</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditPackage(pkg)}
                            className="w-8 h-8 shrink-0 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 bg-white cursor-pointer"
                            title="Edit Kotak Soal"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteConfirmDialog({
                                title: 'Hapus Kotak Paket Soal?',
                                message: `Kotak soal "${pkg.title}" akan dihapus permanen. Butir soal yang ada di Bank Soal tetap tersimpan aman.`,
                                confirmLabel: 'Ya, Hapus Kotak',
                                onConfirm: () => {
                                  if (selectedPackageFilter === pkg.id) {
                                    setSelectedPackageFilter('ALL');
                                  }
                                  deletePracticePackage(pkg.id);
                                  setBankAssignNotice(`Kotak soal "${pkg.title}" berhasil dihapus.`);
                                  setTimeout(() => setBankAssignNotice(''), 5000);
                                }
                              });
                            }}
                            className="w-8 h-8 shrink-0 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 bg-white cursor-pointer"
                            title="Hapus Kotak Soal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                };

                const cardTryoutBoxes = visiblePackageCards.filter(
                  p => p.package_type === 'TRYOUT_SKD' || p.package_type === 'TRYOUT_AKBAR'
                );
                const cardLatihanBoxes = visiblePackageCards.filter(
                  p => p.package_type === 'LATIHAN_HARIAN' || p.package_type === 'DRILL_KATEGORI'
                );
                const cardTwkBoxes = cardLatihanBoxes.filter(p => p.category === 'TWK');
                const cardTiuBoxes = cardLatihanBoxes.filter(p => p.category === 'TIU');
                const cardTkpBoxes = cardLatihanBoxes.filter(p => p.category === 'TKP');
                const shouldShowSplitSections =
                  selectedPackageFilter === 'ALL' &&
                  adminBankCatFilter === 'ALL' &&
                  (adminBankMenuFilter === 'ALL' || adminBankMenuFilter === 'LATIHAN_HARIAN') &&
                  cardLatihanBoxes.length > 0;

                return (
                  <div className="space-y-6 pt-2">
                    {visiblePackageCards.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 space-y-2.5">
                        <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs sm:text-sm font-bold text-slate-700">
                          Belum ada kotak paket soal yang cocok dengan filter saat ini.
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectBankMenu('ALL')}
                            className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-100"
                          >
                            Reset Semua Filter
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenNewPackage}
                            className="px-3.5 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-sky-700"
                          >
                            + Buat Kotak Soal Baru
                          </button>
                        </div>
                      </div>
                    ) : shouldShowSplitSections ? (
                      <div className="space-y-6">
                        {/* AREA ATAS: KOTAK TRY OUT SKD & AKBAR */}
                        {cardTryoutBoxes.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-50 border border-blue-200">
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-blue-700" />
                                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-blue-950">
                                  Area Atas · Paket Try Out SKD &amp; Akbar
                                </h3>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full bg-blue-700 text-white text-[11px] font-mono font-bold">
                                {cardTryoutBoxes.length} Kotak
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                              {cardTryoutBoxes.map(renderPackageCard)}
                            </div>
                          </div>
                        )}

                        {/* AREA BAWAH: 3 KOLOM PRESISI LATIHAN (TWK Kiri | TIU Tengah | TKP Kanan) */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-700" />
                              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-900">
                                Area Latihan Harian &amp; Drill · TWK (Kiri) · TIU (Tengah) · TKP (Kanan)
                              </h3>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-white text-[11px] font-mono font-bold">
                              {cardLatihanBoxes.length} Kotak
                            </span>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                            {/* KOLOM KIRI: TWK */}
                            <div className="space-y-3 p-3 rounded-2xl bg-blue-50/40 border border-blue-200/80">
                              <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-blue-700 text-white">
                                <span className="text-xs font-extrabold uppercase tracking-wider">
                                  TWK · Wawasan Kebangsaan
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-bold">
                                  {cardTwkBoxes.length} Kotak
                                </span>
                              </div>
                              <div className="space-y-3">
                                {cardTwkBoxes.length > 0 ? (
                                  cardTwkBoxes.map(renderPackageCard)
                                ) : (
                                  <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                                    Tidak ada kotak latihan TWK.
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* KOLOM TENGAH: TIU */}
                            <div className="space-y-3 p-3 rounded-2xl bg-sky-50/40 border border-sky-200/80">
                              <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-sky-600 text-white">
                                <span className="text-xs font-extrabold uppercase tracking-wider">
                                  TIU · Inteligensia Umum
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-bold">
                                  {cardTiuBoxes.length} Kotak
                                </span>
                              </div>
                              <div className="space-y-3">
                                {cardTiuBoxes.length > 0 ? (
                                  cardTiuBoxes.map(renderPackageCard)
                                ) : (
                                  <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                                    Tidak ada kotak latihan TIU.
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* KOLOM KANAN: TKP */}
                            <div className="space-y-3 p-3 rounded-2xl bg-emerald-50/40 border border-emerald-200/80">
                              <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-emerald-700 text-white">
                                <span className="text-xs font-extrabold uppercase tracking-wider">
                                  TKP · Karakteristik Pribadi
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-bold">
                                  {cardTkpBoxes.length} Kotak
                                </span>
                              </div>
                              <div className="space-y-3">
                                {cardTkpBoxes.length > 0 ? (
                                  cardTkpBoxes.map(renderPackageCard)
                                ) : (
                                  <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                                    Tidak ada kotak latihan TKP.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                        {visiblePackageCards.map(renderPackageCard)}
                      </div>
                    )}

                    {/* Focused Inline Question List when a specific Kotak Soal chip is selected */}
                    {selectedFocusedPkg && (() => {
                      const focusedQuestions = sortQuestionsList(
                        questions.filter(q => isQuestionInPackage(q, selectedFocusedPkg))
                      );
                      const isFocusedPkgPublished = selectedFocusedPkg.is_active !== false;
                      const bulkToggleFocusedQuestions = (publish: boolean) => {
                        focusedQuestions.forEach(q => {
                          if (q.is_active !== publish) {
                            updateQuestion({ ...q, is_active: publish });
                          }
                        });
                        setBankAssignNotice(
                          publish
                            ? `Semua ${focusedQuestions.length} butir soal di "${selectedFocusedPkg.title}" berhasil DITERBITKAN.`
                            : `Semua ${focusedQuestions.length} butir soal di "${selectedFocusedPkg.title}" DINONTERBITKAN.`
                        );
                        setTimeout(() => setBankAssignNotice(''), 5000);
                      };

                      return (
                        <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-200/80 pb-3">
                            <div>
                              <h3 className="text-sm font-extrabold text-indigo-950">
                                Daftar Butir Soal di Kotak: {selectedFocusedPkg.title} ({focusedQuestions.length} butir)
                              </h3>
                              <p className="text-[11px] text-indigo-800">
                                Kelola, terbitkan, atau nonterbitkan kotak soal &amp; setiap butir soal di dalamnya secara langsung.
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => togglePackagePublish(selectedFocusedPkg)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer border ${
                                  isFocusedPkgPublished
                                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                                }`}
                              >
                                {isFocusedPkgPublished ? (
                                  <>
                                    <EyeOff className="w-3.5 h-3.5" />
                                    <span>Nonterbitkan Kotak</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Terbitkan Kotak</span>
                                  </>
                                )}
                              </button>
                              {focusedQuestions.length > 0 && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => bulkToggleFocusedQuestions(true)}
                                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold cursor-pointer"
                                  >
                                    Terbitkan Semua Soal
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => bulkToggleFocusedQuestions(false)}
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold cursor-pointer"
                                  >
                                    Nonterbitkan Semua Soal
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenNewQuestion(
                                    selectedFocusedPkg.id,
                                    selectedFocusedPkg.title,
                                    'NEW'
                                  )
                                }
                                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Soal</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenNewQuestion(
                                    selectedFocusedPkg.id,
                                    selectedFocusedPkg.title,
                                    'PICK_EXISTING'
                                  )
                                }
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <ListPlus className="w-3.5 h-3.5" />
                                <span>Ambil Bank</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPackageFilter('ALL');
                                  setSelectedBankQuestionIds([]);
                                }}
                                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-semibold cursor-pointer"
                              >
                                Tampilkan Semua Kotak
                              </button>
                            </div>
                          </div>

                          {focusedQuestions.length === 0 ? (
                            <div className="p-4 bg-white rounded-xl border border-dashed border-indigo-300 text-xs text-slate-600 text-center space-y-1">
                              <p className="font-bold text-slate-800">
                                Belum ada soal yang dikaitkan secara khusus ke kotak &quot;{selectedFocusedPkg.title}&quot;.
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Saat peserta mengerjakan, sistem sementara mengambil cadangan dari Bank Soal kategori{' '}
                                <strong>{selectedFocusedPkg.category}</strong>. Klik <strong>+ Soal</strong>,{' '}
                                <strong>Ambil Bank</strong>, atau <strong>Import Soal</strong> untuk mengisi kotak ini.
                              </p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                              <table className="w-full text-xs text-left">
                                <thead>
                                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                                    <th className="py-2 px-3">Kat</th>
                                    <th className="py-2 px-3">Pertanyaan</th>
                                    <th className="py-2 px-3">Kunci / Bobot</th>
                                    <th className="py-2 px-3">Status Terbit</th>
                                    <th className="py-2 px-3 text-center">Aksi</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {focusedQuestions.map(q => (
                                    <tr key={q.id} className={!q.is_active ? 'bg-amber-50/40' : undefined}>
                                      <td className="py-2 px-3">
                                        <span className="px-1.5 py-0.5 rounded font-mono font-bold bg-blue-50 text-blue-700 text-[10px]">
                                          {q.category}
                                        </span>
                                      </td>
                                      <td className="py-2 px-3 text-slate-700 max-w-md truncate">
                                        {q.question_text}
                                      </td>
                                      <td className="py-2 px-3 font-mono font-bold">
                                        {q.category === 'TKP' ? '1-5' : q.correct_answer}
                                      </td>
                                      <td className="py-2 px-3">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            updateQuestion({ ...q, is_active: !q.is_active });
                                            setBankAssignNotice(
                                              !q.is_active
                                                ? 'Butir soal diterbitkan untuk ujian peserta.'
                                                : 'Butir soal dinonterbitkan sementara.'
                                            );
                                            setTimeout(() => setBankAssignNotice(''), 3500);
                                          }}
                                          className={`px-2 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer border ${
                                            q.is_active
                                              ? 'bg-emerald-50 hover:bg-amber-50 text-emerald-700 hover:text-amber-800 border-emerald-200'
                                              : 'bg-amber-100 hover:bg-emerald-100 text-amber-900 hover:text-emerald-800 border-amber-300'
                                          }`}
                                          title={q.is_active ? 'Klik untuk Nonterbitkan soal ini' : 'Klik untuk Terbitkan soal ini'}
                                        >
                                          {q.is_active ? (
                                            <>
                                              <Eye className="w-3 h-3" />
                                              <span>Terbit</span>
                                            </>
                                          ) : (
                                            <>
                                              <EyeOff className="w-3 h-3" />
                                              <span>Nonterbit</span>
                                            </>
                                          )}
                                        </button>
                                      </td>
                                      <td className="py-2 px-3 text-center whitespace-nowrap space-x-1">
                                        <button
                                          onClick={() => openEditQuestion(q)}
                                          className="p-1 rounded text-blue-600 hover:bg-blue-50 cursor-pointer"
                                          title="Edit Soal"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            removeQuestionFromPackage(q.id, selectedFocusedPkg.id);
                                            setBankAssignNotice(
                                              `Soal dikeluarkan dari kotak "${selectedFocusedPkg.title}" (butir soal tetap aman di Bank Soal).`
                                            );
                                            setTimeout(() => setBankAssignNotice(''), 4000);
                                          }}
                                          className="p-1 rounded text-amber-600 hover:bg-amber-50 cursor-pointer"
                                          title="Keluarkan dari Kotak Ini"
                                        >
                                          <MinusCircle className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })()}

              {/* MODE 2: FLAT TABLE FILTERED BY MENU PESERTA & KOTAK / JUDUL */}
              {questionViewMode === 'ALL_QUESTIONS' && (() => {
                const allFilteredSelected =
                  filteredTableQuestions.length > 0 &&
                  filteredTableQuestions.every(q => selectedBankQuestionIds.includes(q.id));

                return (
                  <div className="space-y-3 pt-2">
                    {/* Bulk Assign Bar (Salin/Masukkan Soal Latihan ke Full Tryout atau Kotak Lain) */}
                    <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
                      <div className="flex items-center gap-2 text-indigo-950">
                        <ListPlus className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>
                          {selectedBankQuestionIds.length > 0 ? (
                            <>
                              <strong>{selectedBankQuestionIds.length} butir soal</strong> dipilih — pilih kotak tujuan (misal Try Out Full) untuk memasukkan soal yang sama:
                            </>
                          ) : (
                            'Centang soal di tabel bawah untuk memasukkannya ke kotak lain (misalnya memasukkan soal Try Out Latihan ke Try Out Full).'
                          )}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={bulkTargetPkgId}
                          onChange={e => setBulkTargetPkgId(e.target.value)}
                          className="p-2 bg-white border border-indigo-300 rounded-lg text-xs font-semibold text-slate-800 max-w-xs"
                        >
                          <option value="">-- Pilih Kotak / Paket Tujuan --</option>
                          {practicePackages.map(pkg => (
                            <option key={pkg.id} value={pkg.id}>
                              [{pkg.category}] {pkg.title}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleBulkAssignFromTable}
                          disabled={selectedBankQuestionIds.length === 0 || !bulkTargetPkgId}
                          className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Masukkan ke Kotak Ini
                        </button>
                        {selectedBankQuestionIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedBankQuestionIds([])}
                            className="px-2.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Batal Pilih
                          </button>
                        )}
                      </div>
                    </div>

                    {filteredTableQuestions.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 space-y-2.5">
                        <Database className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs sm:text-sm font-bold text-slate-700">
                          {selectedFocusedPkg
                            ? `Belum ada butir soal yang terkait langsung dengan kotak "${selectedFocusedPkg.title}".`
                            : `Belum ada butir soal terkait pada filter "${activeMenuObj.label}".`}
                        </p>
                        <p className="text-[11px] text-slate-500 max-w-lg mx-auto">
                          Anda dapat menambah soal baru langsung ke kotak/menu ini, mengambil soal yang sudah ada dari seluruh Bank Soal, atau reset ke Semua Menu untuk melihat seluruh butir soal.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenNewQuestion(
                                selectedFocusedPkg?.id,
                                selectedFocusedPkg?.title,
                                selectedFocusedPkg ? 'PICK_EXISTING' : 'NEW'
                              )
                            }
                            className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            {selectedFocusedPkg ? 'Ambil Soal dari Bank ke Kotak Ini' : '+ Tambah Soal Baru'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectBankMenu('ALL')}
                            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Lihat Semua Soal Bank ({questions.length})
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                              <th className="py-2.5 px-2.5 text-center w-9">
                                <input
                                  type="checkbox"
                                  checked={allFilteredSelected}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      const merged = Array.from(
                                        new Set([
                                          ...selectedBankQuestionIds,
                                          ...filteredTableQuestions.map(q => q.id)
                                        ])
                                      );
                                      setSelectedBankQuestionIds(merged);
                                    } else {
                                      const visibleSet = new Set(filteredTableQuestions.map(q => q.id));
                                      setSelectedBankQuestionIds(prev => prev.filter(id => !visibleSet.has(id)));
                                    }
                                  }}
                                  title="Pilih semua soal yang tampil"
                                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                                />
                              </th>
                              <th className="py-2.5 px-3">Kat</th>
                              <th className="py-2.5 px-3">Kotak / Judul Soal</th>
                              <th className="py-2.5 px-3">Pertanyaan</th>
                              <th className="py-2.5 px-3">Kunci / Bobot TKP</th>
                              <th className="py-2.5 px-3">Kesulitan</th>
                              <th className="py-2.5 px-3">Terbit / Nonterbit</th>
                              <th className="py-2.5 px-3 text-center">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredTableQuestions.map(q => {
                              const assignedBoxIds = getQuestionPackageIds(q);
                              const assignedBoxTitles = assignedBoxIds
                                .map(id => practicePackages.find(p => p.id === id)?.title)
                                .filter(Boolean) as string[];
                              const displayBoxes =
                                assignedBoxTitles.length > 0
                                  ? assignedBoxTitles
                                  : q.package_title
                                  ? [q.package_title]
                                  : [];
                              const isChecked = selectedBankQuestionIds.includes(q.id);

                              return (
                                <tr
                                  key={q.id}
                                  className={
                                    isChecked
                                      ? 'bg-indigo-50/40'
                                      : !q.is_active
                                      ? 'bg-amber-50/30'
                                      : undefined
                                  }
                                >
                                  <td className="py-2.5 px-2.5 text-center">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        setSelectedBankQuestionIds(prev =>
                                          prev.includes(q.id)
                                            ? prev.filter(id => id !== q.id)
                                            : [...prev, q.id]
                                        );
                                      }}
                                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                                    />
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="px-1.5 py-0.5 rounded font-mono font-bold bg-blue-50 text-blue-700 text-[10px]">
                                      {q.category}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    {displayBoxes.length > 0 ? (
                                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                                        {displayBoxes.map((title, idx) => (
                                          <span
                                            key={idx}
                                            className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-800 leading-tight"
                                          >
                                            {title}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-slate-900 font-bold">{q.topic}</div>
                                    )}
                                    {q.topic && !displayBoxes.includes(q.topic) && (
                                      <div className="text-[10px] text-slate-500 mt-0.5">{q.topic}</div>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">{q.question_text}</td>
                                  <td className="py-2.5 px-3 font-mono font-bold">
                                    {q.category === 'TKP' ? 'A:1 B:2 C:3 D:4 E:5' : q.correct_answer}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-500">{q.difficulty}</td>
                                  <td className="py-2.5 px-3">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateQuestion({ ...q, is_active: !q.is_active });
                                        setBankAssignNotice(
                                          !q.is_active
                                            ? 'Butir soal diterbitkan dan aktif untuk ujian peserta.'
                                            : 'Butir soal dinonterbitkan sementara.'
                                        );
                                        setTimeout(() => setBankAssignNotice(''), 3500);
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer border whitespace-nowrap ${
                                        q.is_active
                                          ? 'bg-emerald-50 hover:bg-amber-50 text-emerald-700 hover:text-amber-800 border-emerald-200'
                                          : 'bg-amber-100 hover:bg-emerald-100 text-amber-900 hover:text-emerald-800 border-amber-300'
                                      }`}
                                      title={q.is_active ? 'Klik untuk Nonterbitkan' : 'Klik untuk Terbitkan'}
                                    >
                                      {q.is_active ? (
                                        <>
                                          <Eye className="w-3 h-3" />
                                          <span>Terbit · Nonterbitkan</span>
                                        </>
                                      ) : (
                                        <>
                                          <EyeOff className="w-3 h-3" />
                                          <span>Nonterbit · Terbitkan</span>
                                        </>
                                      )}
                                    </button>
                                  </td>
                                  <td className="py-2.5 px-3 text-center whitespace-nowrap space-x-1">
                                    <button
                                      onClick={() => openEditQuestion(q)}
                                      className="p-1 rounded text-blue-600 hover:bg-blue-50 cursor-pointer"
                                      title="Edit Soal"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    {selectedPackageFilter !== 'ALL' && (
                                      <button
                                        onClick={() => {
                                          removeQuestionFromPackage(q.id, selectedPackageFilter);
                                          setBankAssignNotice(
                                            'Soal dikeluarkan dari kotak ini (butir soal tetap aman di Bank Soal).'
                                          );
                                          setTimeout(() => setBankAssignNotice(''), 4000);
                                        }}
                                        className="p-1 rounded text-amber-600 hover:bg-amber-50 cursor-pointer"
                                        title="Keluarkan dari Kotak Ini (Tidak menghapus soal dari Bank Soal)"
                                      >
                                        <MinusCircle className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDeleteConfirmDialog({
                                          title: 'Hapus Permanen Butir Soal?',
                                          message:
                                            'Butir soal ini akan dihapus permanen dari seluruh Bank Soal dan semua kotak paket terkait.',
                                          confirmLabel: 'Ya, Hapus Soal',
                                          onConfirm: () => {
                                            deleteQuestion(q.id);
                                            setBankAssignNotice('Butir soal berhasil dihapus permanen.');
                                            setTimeout(() => setBankAssignNotice(''), 4000);
                                          }
                                        });
                                      }}
                                      className="p-1 rounded text-red-600 hover:bg-red-50 cursor-pointer"
                                      title="Hapus Permanen Soal"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        );
      })()}

      {/* ================= 4. IMPORT SOAL (PRD 11.3) ================= */}
      {currentAdminTab === 'admin-import' && (() => {
        const selectedPkg = practicePackages.find(p => p.id === importPackageId);
        return (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">
                Import Soal Massal (Teks / Word / Excel CSV Terstruktur)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Unduh format contoh terlebih dahulu agar susunan soal sesuai, pilih kotak paket soal tujuan, lalu upload file atau tempel teks soal Anda.
              </p>
            </div>

            {/* Step 1: Download Template Box */}
            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold text-blue-950 block">
                  1. Unduh Format Contoh (Agar Tidak Salah Format)
                </span>
                <span className="text-[11px] text-blue-700">
                  Tersedia format Teks/Word (.txt) dengan pemisah <code className="font-mono bg-white px-1 rounded">===SOAL===</code> atau format tabel Excel (.csv).
                </span>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => downloadTemplateTxt(selectedPkg)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-xl text-xs font-bold shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Contoh Format Teks (.txt)</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadTemplateCsv(selectedPkg)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Contoh Format Excel (.csv)</span>
                </button>
              </div>
            </div>

            {/* Step 2: Target Kotak Paket Soal */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                2. Pilih Kotak / Judul Paket Soal Tujuan (Opsional):
              </label>
              <select
                value={importPackageId}
                onChange={e => setImportPackageId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-blue-800"
              >
                <option value="">-- Bank Soal Umum (Tanpa Kotak Spesifik) --</option>
                {practicePackages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    [{pkg.category}] {pkg.title} ({pkg.question_count} Soal)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    3. Tempel Teks Soal atau Unggah File (.txt / .csv):
                  </label>
                  <label className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1 border border-slate-300">
                    <Upload className="w-3 h-3" />
                    <span>Upload File .txt / .csv</span>
                    <input
                      type="file"
                      accept=".txt,.csv"
                      onChange={handleImportFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <textarea
                  rows={12}
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder={`===SOAL===
KATEGORI: ${selectedPkg && selectedPkg.category !== 'CAMPURAN' ? selectedPkg.category : 'TWK'}
JUDUL: ${selectedPkg ? selectedPkg.title : 'Nasionalisme'}
PERTANYAAN: Contoh pertanyaan nasionalisme...
A: Opsi jawaban A
B: Opsi jawaban B
C: Opsi jawaban C
D: Opsi jawaban D
E: Opsi jawaban E
KUNCI JAWABAN: B
PEMBAHASAN: Penjelasan lengkap...
TINGKAT KESULITAN: Sedang`}
                  className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => parseStructuredText()}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Proses &amp; Tampilkan Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cat = selectedPkg && selectedPkg.category !== 'CAMPURAN' ? selectedPkg.category : 'TIU';
                      const title = selectedPkg ? selectedPkg.title : 'Silogisme Logika';
                      const sample = `===SOAL===
KATEGORI: ${cat}
JUDUL: ${title}
PERTANYAAN: Semua mobil dinas berbahan bakar bensin. Sebagian kendaraan dinas adalah mobil dinas. Kesimpulannya...
A: Semua kendaraan dinas berbahan bakar bensin
B: Sebagian kendaraan dinas berbahan bakar bensin
C: Kendaraan dinas tidak berbahan bakar bensin
D: Tidak ada kendaraan dinas berbahan bakar solar
E: Bensin hanya untuk mobil dinas
KUNCI JAWABAN: B
PEMBAHASAN: Premis partikular menghasilkan kesimpulan partikular (sebagian).
TINGKAT KESULITAN: Sedang
===SOAL===
KATEGORI: TKP
JUDUL: Jejaring Kerja
PERTANYAAN: Anda menemui konflik kepentingan dalam tim kerja lintas departemen...
A: Diam saja
B: Mengajak mediasi terbuka
C: Memaksa pendapat sendiri
D: Mengabaikan tim
E: Melaporkan ke direktur
KUNCI JAWABAN: B
BOBOT_A: 2
BOBOT_B: 5
BOBOT_C: 1
BOBOT_D: 1
BOBOT_E: 3
PEMBAHASAN: Kemampuan jejaring kerja mengutamakan musyawarah dan komunikasi asertif.
TINGKAT KESULITAN: Sedang`;
                      setImportText(sample);
                      parseStructuredText(sample);
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Muat Sampel Format
                  </button>
                </div>

                {importError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{importError}</span>
                  </div>
                )}
              </div>

              {/* Preview Box per PRD Section 11.3 */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-xs uppercase text-slate-800 border-b border-slate-200 pb-2">
                    Preview Hasil Pembacaan ({importPreview.length} Soal Valid)
                  </h3>

                  {importPreview.length === 0 ? (
                    <p className="text-xs text-slate-500 py-8 text-center">
                      Belum ada soal diproses. Upload file template atau tempel teks di kolom sebelah kiri, lalu tekan &quot;Proses &amp; Tampilkan Preview&quot;.
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pt-2">
                      {importPreview.map((item, i) => (
                        <div key={i} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="text-blue-700">#{i + 1} [{item.category}] {item.topic}</span>
                            <span className="font-mono text-emerald-700">Kunci: {item.correct_answer}</span>
                          </div>
                          <p className="text-slate-600 line-clamp-2">{item.question_text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {importPreview.length > 0 && (
                  <button
                    type="button"
                    onClick={handleCommitImport}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Konfirmasi &amp; Simpan {importPreview.length} Soal ke {selectedPkg ? `"${selectedPkg.title}"` : 'Bank Soal'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= 5. MATERI BELAJAR & GOOGLE DRIVE INTEGRASI ================= */}
      {currentAdminTab === 'admin-materials' && (
        <div className="space-y-6">
          {/* Google Drive Guide Card per PRD Section 12 */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-sky-900 text-white shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-sky-300" />
              <h3 className="font-extrabold text-sm sm:text-base">
                Panduan Mengunggah Materi (PDF, Video &amp; Dokumen) dari Google Drive
              </h3>
            </div>
            <p className="text-xs text-sky-100 leading-relaxed">
              Sesuai PRD Section 12: Penyimpanan materi terpusat di Google Drive. Anda cukup mengunggah file PDF, Video, atau Rangkuman ke Google Drive Anda, lalu salin tautan link-nya ke form materi di bawah ini:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur border border-white/20">
                <span className="font-bold block text-sky-200">Langkah 1: Upload ke Drive</span>
                <span className="text-[11px] text-sky-100">Upload file PDF/Video Anda ke folder Google Drive akun Anda.</span>
              </div>
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur border border-white/20">
                <span className="font-bold block text-sky-200">Langkah 2: Atur Akses Link</span>
                <span className="text-[11px] text-sky-100">Klik kanan file &rarr; <strong>Bagikan (Share)</strong> &rarr; pilih <em>&quot;Siapa saja yang memiliki link dapat melihat&quot;</em>.</span>
              </div>
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur border border-white/20">
                <span className="font-bold block text-sky-200">Langkah 3: Tempel di LOGIN CPNS</span>
                <span className="text-[11px] text-sky-100">Klik <strong>&quot;+ Tambah Materi Baru&quot;</strong> lalu tempelkan link Google Drive tersebut.</span>
              </div>
            </div>
          </div>

          {/* Quick switch to Short Video Upload Manager */}
          <div className="p-4 rounded-2xl bg-white border border-slate-300/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Ingin Upload Video Pembahasan atau Kiat Belajar (Short Video)?
                </h3>
                <p className="text-xs text-slate-600">
                  Unggah video MP4/WebM langsung dari perangkat untuk pembahasan soal matematika TIU, TWK, TKP, dan kiat belajar di menu Short Video peserta.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('admin-short-videos')}
              className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 self-start sm:self-center"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Kelola &amp; Upload Short Video ({shortVideos.length})</span>
            </button>
          </div>

          {/* Table & Actions */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Daftar Materi Pembelajaran ({materials.length} Modul)
                </h2>
                <p className="text-xs text-slate-500">
                  Kelola materi artikel, modul PDF Google Drive, video pembahasan, dan batasan akses Premium.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenNewMaterial}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-center"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Materi Baru</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Judul Materi</th>
                    <th className="py-2.5 px-3">Tautan Google Drive (PDF / Video)</th>
                    <th className="py-2.5 px-3">Akses</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {materials.map(m => (
                    <tr key={m.id}>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          m.category === 'TWK' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          m.category === 'TIU' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          m.category === 'TKP' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {m.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{m.title}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-sm">{m.summary}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1.5">
                          {m.file_url ? (
                            <a
                              href={m.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-semibold"
                            >
                              <FileText className="w-3 h-3" />
                              <span>PDF Drive</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : !m.video_blob_id && !m.video_url ? (
                            <span className="text-slate-400 text-[10px]">Teks Saja</span>
                          ) : null}
                          {m.video_url && (
                            <a
                              href={m.video_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 text-[11px] font-semibold"
                            >
                              <Video className="w-3 h-3" />
                              <span>Video Link</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                          {m.video_blob_id && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                              <Film className="w-3 h-3" />
                              <span>Video Upload ({formatFileSize(m.video_file_size_bytes)})</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.is_premium ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {m.is_premium ? 'Premium' : 'Gratis'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {m.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditMaterial(m)}
                          className="p-1 rounded text-blue-600 hover:bg-blue-50"
                          title="Edit Materi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteConfirmDialog({
                              title: 'Hapus Modul Materi?',
                              message: `Materi "${m.title}" akan dihapus permanen dari daftar materi peserta.`,
                              confirmLabel: 'Ya, Hapus Materi',
                              onConfirm: () => deleteMaterial(m.id)
                            });
                          }}
                          className="p-1 rounded text-red-600 hover:bg-red-50"
                          title="Hapus Materi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= SHORT VIDEO & UPLOAD MANAGER ================= */}
      {currentAdminTab === 'admin-short-videos' && (() => {
        const uploadedCount = shortVideos.filter(v => v.source_type === 'UPLOAD' && v.video_blob_id).length;
        const activeCount = shortVideos.filter(v => v.is_active).length;
        const filteredAdminVideos = shortVideos.filter(v => {
          if (svCategoryFilter !== 'ALL' && v.category !== svCategoryFilter) return false;
          if (svSearch.trim()) {
            const q = svSearch.toLowerCase();
            return (
              v.title.toLowerCase().includes(q) ||
              (v.topic || '').toLowerCase().includes(q) ||
              v.description.toLowerCase().includes(q)
            );
          }
          return true;
        });

        return (
          <div className="space-y-4">
            {/* Summary Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white border border-slate-200">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 truncate">Total Short Video</span>
                  <span className="text-base sm:text-xl font-extrabold text-slate-900 font-mono tabular-nums leading-none shrink-0">
                    {shortVideos.length}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">Tersedia di bank video</p>
              </div>
              <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white border border-blue-200">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] sm:text-[11px] font-bold text-blue-700 truncate">Upload Perangkat</span>
                  <span className="text-base sm:text-xl font-extrabold text-blue-700 font-mono tabular-nums leading-none shrink-0">
                    {uploadedCount}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">File MP4 / WebM tersimpan</p>
              </div>
              <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white border border-emerald-200">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 truncate">Tayang Aktif</span>
                  <span className="text-base sm:text-xl font-extrabold text-emerald-700 font-mono tabular-nums leading-none shrink-0">
                    {activeCount}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">Dapat ditonton peserta</p>
              </div>
              <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white border border-slate-200">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 truncate">Pembahasan TIU</span>
                  <span className="text-base sm:text-xl font-extrabold text-slate-900 font-mono tabular-nums leading-none shrink-0">
                    {shortVideos.filter(v => v.category === 'TIU').length}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">Matematika &amp; Penalaran</p>
              </div>
            </div>

            {/* Main Short Video Management Table */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Kelola &amp; Upload Short Video Materi Belajar
                  </h2>
                  <p className="text-xs text-slate-600">
                    Upload video langsung (MP4, WebM, MOV) atau tempel tautan YouTube/Drive untuk pembahasan matematika TIU, kiat belajar, TWK, dan TKP.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveView('admin-materials')}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 whitespace-nowrap"
                  >
                    Ke Modul Materi
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenNewShortVideo}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors whitespace-nowrap"
                  >
                    <Upload className="w-4 h-4" />
                    <span>+ Upload / Tambah Video</span>
                  </button>
                </div>
              </div>

              {/* Search & Category Filters */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { key: 'ALL', label: `Semua (${shortVideos.length})` },
                      { key: 'KIAT_BELAJAR', label: 'Kiat Belajar' },
                      { key: 'TIU', label: 'TIU / Matematika' },
                      { key: 'TWK', label: 'TWK' },
                      { key: 'TKP', label: 'TKP' },
                      { key: 'STRATEGI', label: 'Strategi' }
                    ] as const
                  ).map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSvCategoryFilter(tab.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                        svCategoryFilter === tab.key
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full lg:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={svSearch}
                    onChange={e => setSvSearch(e.target.value)}
                    placeholder="Cari judul atau topik video..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {filteredAdminVideos.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-slate-300 text-center space-y-3 bg-slate-50/50">
                  <p className="text-sm font-bold text-slate-900">Belum ada short video ditemukan</p>
                  <p className="text-xs text-slate-600">
                    Klik tombol Upload / Tambah Video untuk mengunggah video pembahasan materi dari komputer atau HP Anda.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenNewShortVideo}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Short Video Pertama</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                        <th className="py-2.5 px-3">Kategori</th>
                        <th className="py-2.5 px-3">Judul &amp; Pembahasan</th>
                        <th className="py-2.5 px-3">Sumber Video</th>
                        <th className="py-2.5 px-3">Durasi</th>
                        <th className="py-2.5 px-3">Akses</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAdminVideos.map(sv => (
                        <tr key={sv.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-bold text-slate-800">
                              {getShortVideoCategoryLabel(sv.category)}
                            </span>
                          </td>
                          <td className="py-3 px-3 max-w-sm">
                            <div className="font-bold text-slate-900 line-clamp-1">{sv.title}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">
                              {sv.topic || sv.description}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            {sv.source_type === 'UPLOAD' && sv.video_blob_id ? (
                              <div className="space-y-0.5">
                                <span className="font-semibold text-blue-700 block truncate max-w-[180px]">
                                  Upload: {sv.file_name || 'Video Lokal'}
                                </span>
                                <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                                  {formatFileSize(sv.file_size_bytes)}
                                </span>
                              </div>
                            ) : sv.video_url ? (
                              <span className="font-semibold text-sky-700 truncate block max-w-[180px]">
                                Link URL Eksternal
                              </span>
                            ) : (
                              <span className="text-slate-500">Slide Kiat (Belum upload file)</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono tabular-nums text-slate-700 whitespace-nowrap">
                            {sv.duration_label || '-'}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`text-[11px] font-bold ${
                                sv.is_premium ? 'text-amber-700' : 'text-emerald-700'
                              }`}
                            >
                              {sv.is_premium ? 'Premium' : 'Gratis'}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => updateShortVideo({ ...sv, is_active: !sv.is_active })}
                              className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors ${
                                sv.is_active
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              {sv.is_active ? 'Aktif' : 'Draft'}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap space-x-1">
                            <button
                              type="button"
                              onClick={() => setPreviewShortVideo(sv)}
                              className="p-1.5 rounded text-slate-700 hover:bg-slate-100"
                              title="Putar Preview Video"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditShortVideo(sv)}
                              className="p-1.5 rounded text-blue-600 hover:bg-blue-50"
                              title="Edit / Ganti Video"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteConfirmDialog({
                                  title: 'Hapus Short Video?',
                                  message: `Short video "${sv.title}" akan dihapus permanen dari daftar video belajar.`,
                                  confirmLabel: 'Ya, Hapus Video',
                                  onConfirm: () => deleteShortVideo(sv.id)
                                });
                              }}
                              className="p-1.5 rounded text-red-600 hover:bg-red-50"
                              title="Hapus Short Video"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
      })()}

      {/* ================= 6. PAKET PREMIUM, HARGA PROMO & KOMISI MITRA (3 KOLOM) ================= */}
      {currentAdminTab === 'admin-packages' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Pengaturan Harga Paket Premium, Promo &amp; Komisi Mitra
                </h2>
                <p className="text-xs text-slate-500">
                  Kelola harga normal coret, harga promo Tahun Baru, potongan kode referral Rp {activeReferralDiscount.toLocaleString('id-ID')}, serta komisi mitra Rp {activeCommissionAmount.toLocaleString('id-ID')}.
                </p>
              </div>
              <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                Kode Referral Bawaan: LOGINCPNS (-Rp {activeReferralDiscount.toLocaleString('id-ID')})
              </span>
            </div>

            {premNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{premNotice}</span>
              </div>
            )}

            {/* Grid Paket (Standar, Premium, Intensif) + Komisi Mitra */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
              {packages.map(pkg => {
                const allowsDisc = pkg.allow_discount !== false;
                return (
                  <div
                    key={pkg.id}
                    className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                      pkg.is_active
                        ? 'border-slate-200 bg-slate-50/70'
                        : 'border-red-200 bg-red-50/30 opacity-75'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                            pkg.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-100 text-red-700 border-red-200'
                          }`}
                        >
                          {pkg.is_active ? 'PAKET AKTIF' : 'NONAKTIF'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const nextActive = !pkg.is_active;
                            updatePackage({ ...pkg, is_active: nextActive });
                            setPremNotice(
                              `Paket "${pkg.package_name}" berhasil ${nextActive ? 'diaktifkan' : 'dinonaktifkan'}.`
                            );
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition-colors ${
                            pkg.is_active
                              ? 'bg-white border-red-200 text-red-700 hover:bg-red-50'
                              : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {pkg.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {allowsDisc && pkg.promo_badge ? (
                            <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 mb-1">
                              {pkg.promo_badge}
                            </span>
                          ) : !allowsDisc ? (
                            <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-200 text-slate-700 border border-slate-300 mb-1">
                              TANPA PROMO &amp; DISKON
                            </span>
                          ) : null}
                          <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{pkg.package_name}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                              <Clock className="w-3 h-3" />
                              Masa aktif: {pkg.duration_days} hari
                              {pkg.duration_days >= 30 && ` (~${Math.round((pkg.duration_days / 30) * 10) / 10} bln)`}
                            </span>
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                title="Perpendek masa aktif paket 30 hari"
                                onClick={() => {
                                  const nextDays = Math.max(7, pkg.duration_days - 30);
                                  updatePackage({ ...pkg, duration_days: nextDays });
                                  setPremNotice(`Masa aktif "${pkg.package_name}" diperpendek menjadi ${nextDays} hari.`);
                                }}
                                className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-white border border-slate-300 hover:bg-amber-50 hover:border-amber-300 text-slate-700 cursor-pointer"
                              >
                                -30 Hr
                              </button>
                              <button
                                type="button"
                                title="Perpanjang masa aktif paket 30 hari"
                                onClick={() => {
                                  const nextDays = pkg.duration_days + 30;
                                  updatePackage({ ...pkg, duration_days: nextDays });
                                  setPremNotice(`Masa aktif "${pkg.package_name}" diperpanjang menjadi ${nextDays} hari.`);
                                }}
                                className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-white border border-slate-300 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-700 cursor-pointer"
                              >
                                +30 Hr
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          {allowsDisc && pkg.original_price && pkg.original_price > pkg.price && (
                            <span className="text-xs text-slate-400 line-through font-mono">
                              Rp {pkg.original_price.toLocaleString('id-ID')}
                            </span>
                          )}
                          <span className="text-lg font-extrabold font-mono text-blue-700">
                            Rp {pkg.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                        {allowsDisc ? (
                          <span className="text-[11px] font-bold text-emerald-700 block">
                            Pakai Referral: Rp {Math.max(0, pkg.price - activeReferralDiscount).toLocaleString('id-ID')}
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-500 block">
                            Harga tetap (tanpa potongan referral)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-[11px] text-slate-600 leading-relaxed">{pkg.description}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingCommission(false);
                          setEditingPremPkg(pkg);
                          setPremName(pkg.package_name);
                          setPremPrice(pkg.price);
                          setPremOriginalPrice(pkg.original_price || pkg.price);
                          setPremPromoBadge(pkg.promo_badge || '');
                          setPremDesc(pkg.description);
                          setPremAllowDiscount(pkg.allow_discount !== false);
                          setPremIsActive(pkg.is_active);
                          setPremDurationDays(pkg.duration_days);
                          setPremSyncActiveUsers(false);
                          setPremNotice('');
                        }}
                        className="w-full py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Ubah Harga, Durasi &amp; Status</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Kolom Kanan: Pengaturan Harga Komisi Mitra & Diskon Referral */}
              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 mb-1">
                        ATURAN KOMISI AKTIF
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900">Komisi Mitra &amp; Referral</h3>
                      <p className="text-[11px] text-slate-500">Berlaku otomatis saat transaksi</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPremPkg(null);
                        setCommAmountInput(activeCommissionAmount);
                        setRefDiscountInput(activeReferralDiscount);
                        setMinWdInput(activeMinWithdrawal);
                        setIsEditingCommission(true);
                        setPremNotice('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Ubah Komisi</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-emerald-200/90 space-y-1.5">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-xl font-extrabold font-mono text-emerald-700">
                        Rp {activeCommissionAmount.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        komisi / pembeli lunas
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold">
                      <span className="text-blue-700">
                        Diskon Referral: Rp {activeReferralDiscount.toLocaleString('id-ID')}
                      </span>
                      <span className="text-amber-700">
                        Min. Cair: Rp {activeMinWithdrawal.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Mitra meraih komisi Rp {activeCommissionAmount.toLocaleString('id-ID')} per pembeli lunas pada paket berpromo/diskon, peserta hemat Rp {activeReferralDiscount.toLocaleString('id-ID')}, dan pencairan minimal Rp {activeMinWithdrawal.toLocaleString('id-ID')}.
                </p>
              </div>
            </div>

            {editingPremPkg && (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  const nextDuration = Math.max(1, Number(premDurationDays) || editingPremPkg.duration_days);
                  const deltaDays = nextDuration - editingPremPkg.duration_days;
                  updatePackage({
                    ...editingPremPkg,
                    package_name: premName.trim() || editingPremPkg.package_name,
                    price: Number(premPrice),
                    original_price:
                      premAllowDiscount && Number(premOriginalPrice) > Number(premPrice)
                        ? Number(premOriginalPrice)
                        : undefined,
                    promo_badge: premAllowDiscount ? premPromoBadge.trim() || undefined : undefined,
                    description: premDesc.trim(),
                    allow_discount: premAllowDiscount,
                    is_active: premIsActive,
                    duration_days: nextDuration
                  });
                  let syncNote = '';
                  if (premSyncActiveUsers && deltaDays !== 0 && editingPremPkg.tier_key) {
                    const updatedCount = adjustActiveSubscribersDuration(editingPremPkg.tier_key, deltaDays);
                    syncNote = ` (${updatedCount} peserta aktif ikut disesuaikan ${deltaDays > 0 ? `+${deltaDays}` : deltaDays} hari)`;
                  }
                  setPremNotice(
                    `Pengaturan paket "${premName.trim() || editingPremPkg.package_name}" (masa berlaku ${nextDuration} hari) berhasil diperbarui!${syncNote}`
                  );
                  setEditingPremPkg(null);
                }}
                className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-4 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-extrabold text-blue-950">Edit Paket: {editingPremPkg.package_name}</h4>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-blue-200 text-blue-700">
                    Masa aktif saat ini: {editingPremPkg.duration_days} hari
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nama Paket</label>
                    <input
                      type="text"
                      value={premName}
                      onChange={e => setPremName(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Harga Coret / Asli (Rp)</label>
                    <input
                      type="number"
                      value={premOriginalPrice}
                      onChange={e => setPremOriginalPrice(Number(e.target.value))}
                      disabled={!premAllowDiscount}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-mono font-bold disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Harga Aktif (Rp)</label>
                    <input
                      type="number"
                      value={premPrice}
                      onChange={e => setPremPrice(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-blue-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Label Badge Promo</label>
                    <input
                      type="text"
                      value={premPromoBadge}
                      onChange={e => setPremPromoBadge(e.target.value)}
                      disabled={!premAllowDiscount}
                      placeholder="PROMO TAHUN BARU"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-bold disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Masa Berlaku Paket (Perpanjang / Perpendek) */}
                <div className="p-3.5 rounded-xl bg-white border border-blue-200 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="font-extrabold text-slate-900 block">
                        Pengaturan Masa Berlaku Paket (Hari)
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Perpanjang atau perpendek durasi aktif paket (mis. 365 hari = 1 tahun, 90 hari = 3 bulan).
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPremDurationDays(d => Math.max(1, d - 30))}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold cursor-pointer"
                      >
                        -30 Hari
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={3650}
                        value={premDurationDays}
                        onChange={e => setPremDurationDays(Math.max(1, Number(e.target.value) || 1))}
                        className="w-24 p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-extrabold text-center text-blue-700"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setPremDurationDays(d => d + 30)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold cursor-pointer"
                      >
                        +30 Hari
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 mr-1">Preset Cepat:</span>
                    {[
                      { label: '30 Hari (1 Bln)', days: 30 },
                      { label: '90 Hari (3 Bln)', days: 90 },
                      { label: '180 Hari (6 Bln)', days: 180 },
                      { label: '365 Hari (1 Thn)', days: 365 },
                      { label: '730 Hari (2 Thn)', days: 730 }
                    ].map(preset => (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => setPremDurationDays(preset.days)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors ${
                          premDurationDays === preset.days
                            ? 'bg-blue-700 text-white border-blue-700'
                            : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <label className="inline-flex items-center gap-2 font-semibold text-slate-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={premSyncActiveUsers}
                      onChange={e => setPremSyncActiveUsers(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>
                      Terapkan selisih perubahan masa berlaku (
                      {premDurationDays - editingPremPkg.duration_days >= 0
                        ? `+${premDurationDays - editingPremPkg.duration_days}`
                        : premDurationDays - editingPremPkg.duration_days}{' '}
                      hari) ke peserta yang sedang aktif di paket ini
                    </span>
                  </label>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Deskripsi Paket</label>
                  <input
                    type="text"
                    value={premDesc}
                    onChange={e => setPremDesc(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="inline-flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={premAllowDiscount}
                      onChange={e => setPremAllowDiscount(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>Izinkan Promo &amp; Diskon Referral</span>
                  </label>
                  <label className="inline-flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={premIsActive}
                      onChange={e => setPremIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                    <span>Paket Aktif (Tampil ke Peserta)</span>
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPremPkg(null)}
                    className="px-4 py-2 border border-slate-300 bg-white rounded-xl font-semibold text-slate-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Simpan Perubahan Paket
                  </button>
                </div>
              </form>
            )}

            {/* Pengaturan Penguncian Materi & Akses Paket Standar */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Pengaturan Hak Akses Materi &amp; Pembatasan Paket Standar
                </h3>
                <p className="text-[11px] text-slate-500">
                  Atur penguncian modul materi agar hanya tersedia untuk Paket Premium &amp; Intensif, serta pastikan Paket Standar hanya mengakses latihan soal.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.lock_materials_for_premium_only ?? true}
                    onChange={e => {
                      const val = e.target.checked;
                      setLockMaterialsForPremiumOnly(val);
                      updateSettings({ lock_materials_for_premium_only: val });
                      setPremNotice(
                        val
                          ? 'Materi belajar dikunci hanya untuk Paket Premium & Intensif (bukan Paket Standar).'
                          : 'Kunci materi khusus Premium/Intensif dinonaktifkan.'
                      );
                    }}
                    className="w-4 h-4 rounded text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-extrabold text-slate-900 block">
                      Kunci Materi Belajar Hanya Untuk Premium &amp; Intensif (Bukan Standar)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Jika aktif, peserta Paket Standar tidak dapat membuka modul PDF, Google Drive, maupun Short Video.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.standar_questions_only ?? true}
                    onChange={e => {
                      const val = e.target.checked;
                      setStandarQuestionsOnly(val);
                      updateSettings({ standar_questions_only: val });
                      setPremNotice(
                        val
                          ? 'Mode Paket Standar Hanya Untuk Soal Saja diaktifkan.'
                          : 'Pembatasan Paket Standar hanya soal dinonaktifkan.'
                      );
                    }}
                    className="w-4 h-4 rounded text-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-extrabold text-slate-900 block">
                      Aktifkan Paket Standar Hanya Untuk Latihan Soal Saja
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Mengunci menu Materi Belajar, Zoom Bimbel, &amp; Kalkulator pada navigasi peserta Paket Standar.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {isEditingCommission && (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  const nextComm = Math.max(0, Number(commAmountInput) || 0);
                  const nextRefDiscount = Math.max(0, Number(refDiscountInput) || 0);
                  const nextMinWd = Math.max(1000, Number(minWdInput) || 0);
                  updateSettings({
                    affiliate_commission_amount: nextComm,
                    referral_discount_amount: nextRefDiscount,
                    min_commission_withdrawal: nextMinWd
                  });
                  setPremNotice(
                    `Pengaturan komisi berhasil diperbarui: Komisi Mitra Rp ${nextComm.toLocaleString('id-ID')}, Diskon Referral Rp ${nextRefDiscount.toLocaleString('id-ID')}, Minimal Pencairan Rp ${nextMinWd.toLocaleString('id-ID')}.`
                  );
                  setIsEditingCommission(false);
                }}
                className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-extrabold text-emerald-950">
                    Edit Harga Komisi Mitra, Diskon Referral &amp; Batas Minimal Pencairan
                  </h4>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    Langsung berlaku untuk checkout &amp; komisi mitra baru
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Komisi Mitra / Pembeli Lunas (Rp)</label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={commAmountInput}
                      onChange={e => setCommAmountInput(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-emerald-300 rounded-lg font-mono font-bold text-emerald-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Diskon Kode Referral Pembeli (Rp)</label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={refDiscountInput}
                      onChange={e => setRefDiscountInput(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-blue-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Minimal Pencairan Komisi (Rp)</label>
                    <input
                      type="number"
                      min={1000}
                      step={5000}
                      value={minWdInput}
                      onChange={e => setMinWdInput(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-amber-800"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingCommission(false)}
                    className="px-4 py-2 border border-slate-300 bg-white rounded-xl font-semibold text-slate-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Simpan Perubahan Komisi
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= 7. VERIFIKASI PEMBAYARAN, LAPORAN REFERRAL & EKSPOR REKAP KEUNTUNGAN ================= */}
      {currentAdminTab === 'admin-payments' && (() => {
        const approvedPayments = payments.filter(p => p.status === 'APPROVED');
        const pendingPayments = payments.filter(p => p.status === 'WAITING_VERIFICATION');

        const filteredPayments = payments
          .filter(p => {
            if (paymentStatusFilter !== 'ALL' && p.status !== paymentStatusFilter) return false;
            if (paymentReferralFilter === 'WITH_REFERRAL' && !p.referral_code) return false;
            if (paymentReferralFilter === 'PARTNER_ONLY' && (!p.affiliate_commission || p.affiliate_commission <= 0)) return false;
            if (paymentReferralFilter === 'UPGRADE_ONLY' && !p.is_package_upgrade) return false;
            if (!paymentSearch.trim()) return true;
            const q = paymentSearch.toLowerCase();
            return (
              p.user_name.toLowerCase().includes(q) ||
              p.user_email.toLowerCase().includes(q) ||
              p.package_name.toLowerCase().includes(q) ||
              (p.previous_package_name || '').toLowerCase().includes(q) ||
              (p.is_package_upgrade && 'peralihan upgrade'.includes(q)) ||
              (p.referral_code || '').toLowerCase().includes(q) ||
              (p.affiliate_name || '').toLowerCase().includes(q)
            );
          });

        return (
          <div className="space-y-4">
            {/* Revenue & Affiliate Commission Summary Cards (Minimalis Tablet/HP) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <div className="col-span-2 sm:col-span-1 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
                <div className="flex items-center justify-between text-emerald-100 text-[10px] sm:text-[11px] font-semibold gap-1">
                  <span className="truncate">Pemasukan Bersih</span>
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                </div>
                <div className="text-base sm:text-lg font-extrabold font-mono tabular-nums mt-0.5 truncate">
                  Rp {approvedRevenueTotal.toLocaleString('id-ID')}
                </div>
                <p className="text-[10px] text-emerald-100 truncate tabular-nums">
                  {approvedPayments.length} transaksi lunas
                </p>
              </div>

              <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white border border-amber-200">
                <div className="flex items-center justify-between text-amber-700 text-[10px] sm:text-[11px] font-semibold gap-1">
                  <span className="truncate">Menunggu Verif</span>
                  <Wallet className="w-3.5 h-3.5 shrink-0" />
                </div>
                <div className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-amber-800 mt-0.5 truncate">
                  Rp {pendingRevenueTotal.toLocaleString('id-ID')}
                </div>
                <p className="text-[10px] text-slate-500 truncate tabular-nums">
                  {pendingPayments.length} bukti masuk
                </p>
              </div>

              <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white border border-blue-200">
                <div className="flex items-center justify-between text-blue-700 text-[10px] sm:text-[11px] font-semibold gap-1">
                  <span className="truncate">Komisi Dibayar</span>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                </div>
                <div className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-blue-800 mt-0.5 truncate">
                  Rp {commissionPaidTotal.toLocaleString('id-ID')}
                </div>
                <p className="text-[10px] text-slate-500 truncate">Sudah ke mitra</p>
              </div>

              <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white border border-red-200">
                <div className="flex items-center justify-between text-red-700 text-[10px] sm:text-[11px] font-semibold gap-1">
                  <span className="truncate">Komisi Belum</span>
                  <Banknote className="w-3.5 h-3.5 shrink-0" />
                </div>
                <div className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-red-700 mt-0.5 truncate">
                  Rp {commissionUnpaidTotal.toLocaleString('id-ID')}
                </div>
                <p className="text-[10px] text-slate-500 truncate">Hak komisi mitra</p>
              </div>

              <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white border border-slate-200">
                <div className="flex items-center justify-between text-slate-600 text-[10px] sm:text-[11px] font-semibold gap-1">
                  <span className="truncate">Total Transaksi</span>
                  <DollarSign className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </div>
                <div className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-slate-900 mt-0.5 truncate">
                  {payments.length} Data
                </div>
                <p className="text-[10px] text-slate-500 truncate tabular-nums">
                  Komisi Rp {totalCommissionPayable.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Export & Table Container */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Rekap Pembayaran, Kode Referral &amp; Komisi Mitra
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Unduh laporan keuangan, detail peserta pengguna kode referral, dan status komisi mitra dalam format Excel/CSV, Word, atau PDF.
                  </p>
                </div>

                {/* Export Buttons Toolbar */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={exportPaymentsToCSV}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export Excel / CSV</span>
                  </button>
                  <button
                    onClick={exportPaymentsToWord}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Export Word (.doc)</span>
                  </button>
                  <button
                    onClick={handlePrintPaymentReport}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak / PDF</span>
                  </button>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={paymentSearch}
                    onChange={e => setPaymentSearch(e.target.value)}
                    placeholder="Cari nama siswa, email, kode referral, atau nama mitra..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <select
                  value={paymentReferralFilter}
                  onChange={e => setPaymentReferralFilter(e.target.value as 'ALL' | 'WITH_REFERRAL' | 'PARTNER_ONLY' | 'UPGRADE_ONLY')}
                  className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="ALL">Semua Sumber &amp; Jenis</option>
                  <option value="UPGRADE_ONLY">Khusus Peralihan / Upgrade Paket</option>
                  <option value="WITH_REFERRAL">Semua Pakai Kode Referral</option>
                  <option value="PARTNER_ONLY">Khusus Mitra Berkomisi (Rp 10rb)</option>
                </select>
                <select
                  value={paymentStatusFilter}
                  onChange={e => setPaymentStatusFilter(e.target.value as 'ALL' | PaymentStatus)}
                  className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="ALL">Semua Status ({payments.length})</option>
                  <option value="WAITING_VERIFICATION">Menunggu Verifikasi ({pendingPayments.length})</option>
                  <option value="APPROVED">Disetujui / Lunas ({approvedPayments.length})</option>
                  <option value="REJECTED">Ditolak</option>
                </select>
              </div>

              {/* Inline Reject Reason Box */}
              {rejectingPaymentId && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                  <span className="font-bold text-red-800 shrink-0">Alasan Penolakan:</span>
                  <input
                    type="text"
                    value={rejectReasonInput}
                    onChange={e => setRejectReasonInput(e.target.value)}
                    placeholder="Misal: Bukti transfer buram / nominal tidak sesuai"
                    className="flex-1 px-3 py-1.5 bg-white border border-red-300 rounded-lg text-slate-900"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (rejectReasonInput.trim()) {
                          rejectPayment(rejectingPaymentId, rejectReasonInput.trim());
                          setRejectingPaymentId(null);
                          setRejectReasonInput('');
                        }
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer"
                    >
                      Konfirmasi Tolak
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingPaymentId(null);
                        setRejectReasonInput('');
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Clean Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                      <th className="py-2.5 px-3">Tgl Daftar &amp; Bayar</th>
                      <th className="py-2.5 px-3">Data Siswa &amp; Kontak</th>
                      <th className="py-2.5 px-3">Paket &amp; Rincian Harga</th>
                      <th className="py-2.5 px-3">Referral &amp; Mitra</th>
                      <th className="py-2.5 px-3">Komisi Mitra</th>
                      <th className="py-2.5 px-3">Bukti</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-center">Tindakan Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPayments.map(p => {
                      const d = getPaymentPartnerDetails(p);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 align-top">
                          <td className="py-2.5 px-3 text-slate-500 font-mono whitespace-nowrap text-[11px]">
                            <div><span className="text-slate-400">Daf:</span> {new Date(d.regDate).toLocaleDateString('id-ID')}</div>
                            <div><span className="text-slate-400">Byr:</span> {new Date(p.created_at).toLocaleDateString('id-ID')}</div>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            <div>{p.user_name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{p.user_email}</div>
                            <div className="text-[10px] text-slate-500 font-mono">WA: {d.phone}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-800">{p.package_name}</span>
                              {d.isUpgrade && (
                                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-extrabold text-[9px] uppercase">
                                  Peralihan Paket
                                </span>
                              )}
                            </div>
                            <div className="text-blue-700 font-mono font-extrabold">
                              {d.isUpgrade ? 'Selisih: ' : ''}Rp {p.amount.toLocaleString('id-ID')}
                            </div>
                            {d.isUpgrade ? (
                              <div className="text-[10px] text-indigo-700 font-mono space-y-0.5">
                                <div>Dari: {d.previousPkgName}</div>
                                <div>
                                  Asli Rp {d.originalAmount.toLocaleString('id-ID')} - Sblm Rp {d.upgradeCredit.toLocaleString('id-ID')}
                                </div>
                              </div>
                            ) : (
                              (d.promoDiscount > 0 || d.referralDiscount > 0) && (
                                <div className="text-[10px] text-slate-500 font-mono">
                                  Asli {d.originalAmount.toLocaleString('id-ID')}
                                  {d.referralDiscount > 0 ? ` · Ref -${d.referralDiscount.toLocaleString('id-ID')}` : ''}
                                </div>
                              )
                            )}
                            <div className="text-[10px] text-slate-400">{p.payment_method}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            {d.isUpgrade ? (
                              <span className="text-[10px] text-slate-500 font-medium">
                                Tidak berlaku (Peralihan paket)
                              </span>
                            ) : p.referral_code ? (
                              <div className="space-y-0.5">
                                <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-extrabold text-[10px]">
                                  {p.referral_code}
                                </span>
                                <div className="text-[11px] font-bold text-slate-800">{d.partnerName}</div>
                                {d.partnerPhone !== '-' && (
                                  <div className="text-[10px] text-slate-500 font-mono">WA: {d.partnerPhone}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400">Tanpa kode</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {d.isPartnerCommissionable ? (
                              <div className="space-y-1">
                                <div className="font-mono font-extrabold text-emerald-700">
                                  Rp {d.commission.toLocaleString('id-ID')}
                                </div>
                                <span
                                  className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${
                                    p.commission_status === 'PAID'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : p.status === 'APPROVED'
                                      ? 'bg-red-50 text-red-700 border-red-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}
                                >
                                  {d.commissionLabel}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400">Rp 0</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => setViewingProofUrl(p.proof_url)}
                              className="px-2 py-1 text-[11px] font-bold rounded bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" /> Lihat
                            </button>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${
                              p.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              p.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {p.status === 'APPROVED' ? 'DISETUJUI' :
                               p.status === 'REJECTED' ? 'DITOLAK' : 'MENUNGGU VERIFIKASI'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap space-y-1">
                            {p.status === 'WAITING_VERIFICATION' ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => approvePayment(p.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-2xs cursor-pointer"
                                >
                                  {p.is_package_upgrade ? 'Setujui & Naikkan Status' : 'Setujui & Aktifkan'}
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectingPaymentId(p.id);
                                    setRejectReasonInput('');
                                  }}
                                  className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-[11px] font-semibold cursor-pointer"
                                >
                                  Tolak
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="text-slate-400 text-[10px]">Selesai ({p.verified_by || 'Admin'})</div>
                                {p.status === 'APPROVED' && d.isPartnerCommissionable && (
                                  <button
                                    type="button"
                                    onClick={() => toggleCommissionPaidStatus(p.id, p.commission_status !== 'PAID')}
                                    className={`px-2 py-1 rounded text-[10px] font-extrabold cursor-pointer transition-colors ${
                                      p.commission_status === 'PAID'
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-slate-100'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                    }`}
                                  >
                                    {p.commission_status === 'PAID' ? '✓ Komisi Dibayar' : 'Bayar Komisi'}
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= 8. AKTIVASI PREMIUM & LAPORAN MITRA AFILIASI / REFERRAL ================= */}
      {currentAdminTab === 'admin-premium-activation' && (() => {
        const referralPayments = payments.filter(p => !!p.referral_code || !!p.affiliate_user_id);
        const filteredReferralPayments = referralPayments.filter(p => {
          const d = getPaymentPartnerDetails(p);
          if (commissionStatusFilter === 'PAID' && p.commission_status !== 'PAID') return false;
          if (commissionStatusFilter === 'UNPAID' && (!d.isPartnerCommissionable || p.status !== 'APPROVED' || p.commission_status === 'PAID')) return false;
          if (!activationSearch.trim()) return true;
          const q = activationSearch.toLowerCase();
          return (
            p.user_name.toLowerCase().includes(q) ||
            p.user_email.toLowerCase().includes(q) ||
            (p.referral_code || '').toLowerCase().includes(q) ||
            d.partnerName.toLowerCase().includes(q)
          );
        });

        const pendingAffiliates = users.filter(u => u.affiliate_status === 'PENDING');
        const allPartnerUsers = users.filter(
          u =>
            u.role !== 'SUPER_ADMIN' &&
            (u.is_affiliate ||
              u.affiliate_status === 'PENDING' ||
              u.affiliate_status === 'APPROVED' ||
              u.affiliate_status === 'REJECTED' ||
              !!u.referral_code)
        );
        const approvedPartners = allPartnerUsers.filter(
          u => u.is_affiliate && (u.affiliate_status === undefined || u.affiliate_status === 'APPROVED')
        );

        // Compute per-partner integrated metrics
        const partnerDirectoryRows = allPartnerUsers
          .map(partner => {
            const codeUpper = partner.referral_code?.toUpperCase();
            const partnerPayments = payments.filter(
              p =>
                p.affiliate_user_id === partner.id ||
                (codeUpper && p.referral_code && p.referral_code.toUpperCase() === codeUpper)
            );
            const approvedPayments = partnerPayments.filter(p => p.status === 'APPROVED');
            const totalCommission = approvedPayments.reduce(
              (sum, p) => sum + (p.affiliate_commission ?? activeCommissionAmount),
              0
            );
            const paidCommission = approvedPayments
              .filter(p => p.commission_status === 'PAID')
              .reduce((sum, p) => sum + (p.affiliate_commission ?? activeCommissionAmount), 0);
            const unpaidCommission = approvedPayments
              .filter(p => p.commission_status !== 'PAID')
              .reduce((sum, p) => sum + (p.affiliate_commission ?? activeCommissionAmount), 0);

            const registeredMembers = users.filter(
              u =>
                u.id !== partner.id &&
                codeUpper &&
                u.registered_referral_code?.toUpperCase() === codeUpper
            );
            const partnerWithdrawals = commissionWithdrawals.filter(
              w => w.affiliate_user_id === partner.id
            );
            const pendingWithdrawal = partnerWithdrawals.find(w => w.status === 'REQUESTED');
            const status = partner.affiliate_status || (partner.is_affiliate ? 'APPROVED' : 'NONE');

            return {
              partner,
              status,
              partnerPayments,
              approvedPayments,
              registeredMembers,
              partnerWithdrawals,
              pendingWithdrawal,
              totalCommission,
              paidCommission,
              unpaidCommission
            };
          })
          .filter(row => {
            if (partnerStatusFilter === 'APPROVED' && row.status !== 'APPROVED') return false;
            if (partnerStatusFilter === 'PENDING' && row.status !== 'PENDING') return false;
            if (partnerStatusFilter === 'REJECTED' && row.status !== 'REJECTED') return false;
            if (partnerStatusFilter === 'HAS_UNPAID' && row.unpaidCommission <= 0) return false;

            if (!partnerSearch.trim()) return true;
            const q = partnerSearch.toLowerCase();
            return (
              row.partner.full_name.toLowerCase().includes(q) ||
              row.partner.email.toLowerCase().includes(q) ||
              row.partner.phone.toLowerCase().includes(q) ||
              (row.partner.referral_code || '').toLowerCase().includes(q)
            );
          })
          .sort((a, b) => b.unpaidCommission - a.unpaidCommission || b.totalCommission - a.totalCommission);

        const affiliatePartners = users.filter(u => u.is_affiliate);
        const memberUsers = users.filter(u => u.role !== 'SUPER_ADMIN');
        const senderEmail = settings.admin_email || OFFICIAL_SENDER_EMAIL;
        const filteredEmailLogs = emailLogs
          .filter(log => {
            if (!emailLogSearch.trim()) return true;
            const q = emailLogSearch.toLowerCase();
            return (
              log.recipient_email.toLowerCase().includes(q) ||
              log.recipient_name.toLowerCase().includes(q) ||
              log.subject.toLowerCase().includes(q) ||
              log.category.toLowerCase().includes(q)
            );
          })
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return (
          <div className="space-y-6">
            {affiliateAdminFeedback && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{affiliateAdminFeedback}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAffiliateAdminFeedback('')}
                  className="text-[11px] text-emerald-700 hover:underline cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            )}

            {/* Top Banner & Export Controls */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 uppercase mb-1">
                    <Handshake className="w-3.5 h-3.5" />
                    <span>Menu Aktivasi Premium, Data Mitra Terintegrasi &amp; Komisi Afiliasi</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Manajemen Mitra Afiliasi, Laporan Peserta Referral &amp; Aktivasi Premium
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pantau daftar mitra bergabung secara terstruktur ke bawah, lihat peserta per kode mitra, edit/hapus data mitra, serta upload bukti transfer pencairan komisi.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={exportPaymentsToCSV}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export Excel / CSV</span>
                  </button>
                  <button
                    onClick={exportPaymentsToWord}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Export Word (.doc)</span>
                  </button>
                  <button
                    onClick={handlePrintPaymentReport}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak / PDF</span>
                  </button>
                </div>
              </div>

              {/* 4 Commission Calculation Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-slate-600 text-xs font-bold">
                    <span>Mitra &amp; Peserta Referral</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-slate-900">
                    {allPartnerUsers.length} <span className="text-xs font-semibold text-slate-500">Mitra</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {approvedPartners.length} aktif · {pendingAffiliates.length} antrean · {referralPayments.length} transaksi
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-slate-600 text-xs font-bold">
                    <span>Total Komisi Wajib Dibayar</span>
                    <Banknote className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-slate-900">
                    Rp {totalCommissionPayable.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Akumulasi komisi transaksi lunas
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white space-y-1">
                  <div className="flex items-center justify-between text-blue-100 text-xs font-bold">
                    <span>Komisi Sudah Dibayar</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono">
                    Rp {commissionPaidTotal.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-blue-100">
                    Telah ditransfer ke rekening mitra
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white space-y-1">
                  <div className="flex items-center justify-between text-amber-100 text-xs font-bold">
                    <span>Saldo Komisi Belum Dibayar</span>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono">
                    Rp {commissionUnpaidTotal.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-amber-100">
                    Otomatis berkurang saat dibayar
                  </p>
                </div>
              </div>
            </div>

            {/* Section 0: Antrean Persetujuan Mitra Baru (Tampil jika ada PENDING) */}
            {pendingAffiliates.length > 0 && (
              <div className="p-6 bg-white rounded-2xl border-2 border-amber-300 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 uppercase mb-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Butuh Persetujuan Admin</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Pendaftar Mitra Afiliasi Menunggu Verifikasi ({pendingAffiliates.length} Pengajuan)
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  {pendingAffiliates.map(u => (
                    <div
                      key={u.id}
                      className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{u.full_name}</span>
                          <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono font-extrabold">
                            Usulan Kode: {u.referral_code || '-'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Diajukan: {u.affiliate_requested_at ? new Date(u.affiliate_requested_at).toLocaleString('id-ID') : '-'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono">
                          Email: {u.email} · WA: {u.phone}
                        </div>
                        {u.affiliate_motivation && (
                          <p className="text-[11px] text-slate-700">
                            <strong>Rencana Promosi:</strong> {u.affiliate_motivation}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              approveAffiliateApplication(u.id);
                              setAffiliateAdminFeedback(
                                `Mitra ${u.full_name} (${u.referral_code}) disetujui & notifikasi dikirim ke ${u.email}.`
                              );
                            }}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Setujui Jadi Mitra</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openRejectPartnerModal(u)}
                            className="px-3.5 py-2 bg-white hover:bg-red-50 text-red-700 border border-red-300 rounded-xl font-bold cursor-pointer flex items-center gap-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Tolak Mitra</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 1: LIST DATA MITRA YANG BERGABUNG (MODEL TURUN KE BAWAH + TERINTEGRASI DETAIL, EDIT, HAPUS & UPLOAD BUKTI TRANSFER) */}
            <div className="p-6 bg-white rounded-2xl border border-emerald-200 shadow-xs space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 uppercase mb-0.5">
                    <Handshake className="w-3.5 h-3.5" />
                    <span>Direktori Mitra Afiliasi Terintegrasi (Model Turun ke Bawah)</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Daftar Data Mitra yang Bergabung ({partnerDirectoryRows.length} Mitra)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Klik <strong>Detail</strong> untuk melihat jumlah &amp; daftar nama peserta pengguna kode mitra tersebut serta riwayat pembayarannya. Gunakan <strong>Bayar &amp; Upload Bukti</strong> untuk melampirkan bukti transfer &amp; otomatis mengurangi saldo komisi belum dibayar.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={partnerSearch}
                      onChange={e => setPartnerSearch(e.target.value)}
                      placeholder="Cari nama mitra, email, WA, kode..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <select
                    value={partnerStatusFilter}
                    onChange={e =>
                      setPartnerStatusFilter(
                        e.target.value as 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'HAS_UNPAID'
                      )
                    }
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="ALL">Semua Mitra ({allPartnerUsers.length})</option>
                    <option value="HAS_UNPAID">Punya Saldo Belum Dibayar</option>
                    <option value="APPROVED">Mitra Aktif</option>
                    <option value="PENDING">Menunggu Persetujuan</option>
                    <option value="REJECTED">Ditolak / Nonaktif</option>
                  </select>
                </div>
              </div>

              {partnerDirectoryRows.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-500">
                  Tidak ada data mitra yang sesuai filter pencarian saat ini.
                </div>
              ) : (
                <div className="space-y-4">
                  {partnerDirectoryRows.map((row, idx) => {
                    const {
                      partner,
                      status,
                      partnerPayments,
                      approvedPayments,
                      registeredMembers,
                      partnerWithdrawals,
                      pendingWithdrawal,
                      totalCommission,
                      paidCommission,
                      unpaidCommission
                    } = row;
                    const isExpanded = expandedPartnerId === partner.id;
                    const rawPartnerWa = (partner.phone || '').replace(/\D/g, '');
                    const partnerWaPhone = rawPartnerWa.startsWith('0')
                      ? `62${rawPartnerWa.slice(1)}`
                      : rawPartnerWa;

                    return (
                      <div
                        key={partner.id}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          isExpanded
                            ? 'border-emerald-400 shadow-md bg-white'
                            : 'border-slate-200 hover:border-emerald-300 bg-slate-50/40'
                        }`}
                      >
                        {/* Horizontal-Optimized Card Header for Desktop/Laptop */}
                        <div className="p-4 sm:p-5 space-y-3">
                          {/* Row 1: Partner Name/Status (Left) & Compact Action Buttons (Right) */}
                          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-[11px] font-mono font-extrabold text-slate-400 shrink-0">
                                #{idx + 1}
                              </span>
                              <img
                                src={partner.photo_url}
                                alt={partner.full_name}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-200 bg-white shrink-0"
                                onError={e => {
                                  (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    partner.full_name
                                  )}&background=059669&color=fff`;
                                }}
                              />
                              <div className="flex flex-wrap items-center gap-2 min-w-0">
                                <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                                  {partner.full_name}
                                </h4>
                                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono font-extrabold text-xs">
                                  {partner.referral_code || 'BELUM ADA KODE'}
                                </span>
                                <span
                                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                                    status === 'APPROVED'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : status === 'PENDING'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : 'bg-red-50 text-red-700 border-red-200'
                                  }`}
                                >
                                  {status === 'APPROVED'
                                    ? 'MITRA AKTIF'
                                    : status === 'PENDING'
                                    ? 'MENUNGGU PERSETUJUAN'
                                    : 'NONAKTIF / DITOLAK'}
                                </span>
                                {pendingWithdrawal && (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-600 text-white animate-pulse">
                                    Ajuan Cair: Rp {pendingWithdrawal.amount.toLocaleString('id-ID')}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Menu: Compact horizontal bar */}
                            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedPartnerId(prev => (prev === partner.id ? null : partner.id))
                                }
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer border transition-colors ${
                                  isExpanded
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                                }`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Detail ({approvedPayments.length} Lunas / {registeredMembers.length} Daftar)</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {(unpaidCommission > 0 || pendingWithdrawal) && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openPayoutModalForPartner(partner, unpaidCommission, pendingWithdrawal)
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>
                                    {pendingWithdrawal ? 'Bayar Ajuan & Bukti' : 'Bayar & Upload Bukti'}
                                  </span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => openEditPartnerModal(partner)}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              {status !== 'REJECTED' && (
                                <button
                                  type="button"
                                  onClick={() => openRejectPartnerModal(partner)}
                                  className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Tolak Mitra</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setDeletingPartner(partner)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>

                              {partnerWaPhone && (
                                <a
                                  href={`https://wa.me/${partnerWaPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Hubungi Mitra via WhatsApp"
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Row 2: Full-Width Horizontal Contact & Payout Bank Strip */}
                          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 text-[11px] bg-white/80 px-3.5 py-2 rounded-xl border border-slate-200/80">
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-slate-600 font-mono">
                              <span>
                                <strong className="font-sans text-slate-700">Email:</strong> {partner.email}
                              </span>
                              <span>
                                <strong className="font-sans text-slate-700">WA:</strong> {partner.phone}
                              </span>
                              <span>
                                <strong className="font-sans text-slate-700">Gabung:</strong>{' '}
                                {new Date(
                                  partner.affiliate_joined_at ||
                                    partner.affiliate_requested_at ||
                                    partner.created_at
                                ).toLocaleDateString('id-ID')}
                              </span>
                            </div>

                            <div className="text-slate-600">
                              <span className="font-bold text-slate-700">Rekening Pencairan:</span>{' '}
                              {partner.affiliate_bank_name ? (
                                <span className="font-mono text-blue-800 font-semibold">
                                  {partner.affiliate_bank_name} · {partner.affiliate_account_number} a.n.{' '}
                                  {partner.affiliate_account_holder || partner.full_name}
                                </span>
                              ) : (
                                <span className="italic text-slate-400">Belum mengisi nomor rekening</span>
                              )}
                            </div>
                          </div>

                          {status === 'REJECTED' && partner.affiliate_rejection_reason && (
                            <div className="px-3.5 py-2 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-800">
                              <strong>Alasan Penolakan:</strong> {partner.affiliate_rejection_reason}
                            </div>
                          )}

                          {/* Row 3: Compact 4 Financial & Member Summary Columns Across Width */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                            <div className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                Peserta Bergabung
                              </span>
                              <div className="text-sm sm:text-base font-extrabold font-mono text-slate-900 mt-0.5">
                                {approvedPayments.length} Beli Lunas
                              </div>
                              <span className="text-[10px] text-slate-500">
                                {registeredMembers.length} daftar akun · {partnerPayments.length} total order
                              </span>
                            </div>

                            <div className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                Jumlah Total Komisi
                              </span>
                              <div className="text-sm sm:text-base font-extrabold font-mono text-slate-900 mt-0.5">
                                Rp {totalCommission.toLocaleString('id-ID')}
                              </div>
                              <span className="text-[10px] text-slate-500">
                                Akumulasi komisi lunas
                              </span>
                            </div>

                            <div className="px-3.5 py-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
                              <span className="text-[10px] font-bold text-blue-700 uppercase block">
                                Komisi Sudah Dibayar
                              </span>
                              <div className="text-sm sm:text-base font-extrabold font-mono text-blue-800 mt-0.5">
                                Rp {paidCommission.toLocaleString('id-ID')}
                              </div>
                              <span className="text-[10px] text-blue-600">
                                {partnerWithdrawals.filter(w => w.status === 'PAID').length} riwayat transfer
                              </span>
                            </div>

                            <div
                              className={`px-3.5 py-2.5 rounded-xl border ${
                                unpaidCommission > 0
                                  ? 'bg-amber-50 border-amber-300'
                                  : 'bg-emerald-50/60 border-emerald-200'
                              }`}
                            >
                              <span
                                className={`text-[10px] font-bold uppercase block ${
                                  unpaidCommission > 0 ? 'text-amber-800' : 'text-emerald-700'
                                }`}
                              >
                                Komisi Belum Dibayar
                              </span>
                              <div
                                className={`text-sm sm:text-base font-extrabold font-mono mt-0.5 ${
                                  unpaidCommission > 0 ? 'text-red-700' : 'text-emerald-700'
                                }`}
                              >
                                Rp {unpaidCommission.toLocaleString('id-ID')}
                              </div>
                              <span className="text-[10px] text-slate-600">
                                {unpaidCommission > 0 ? 'Saldo siap dibayarkan' : 'Seluruh komisi sudah lunas'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* EXPANDED INTEGRATED DETAIL PANEL FOR THIS PARTNER */}
                        {isExpanded && (
                          <div className="border-t border-slate-200 bg-slate-50/80 p-5 space-y-5">
                            {/* Sub-panel A: Peserta yang Mendaftar & Membeli Menggunakan Kode Mitra Ini */}
                            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                                <div>
                                  <h5 className="text-xs sm:text-sm font-extrabold text-slate-900">
                                    1. Detail Peserta yang Bergabung Menggunakan Kode{' '}
                                    <span className="font-mono text-emerald-700">{partner.referral_code}</span>
                                  </h5>
                                  <p className="text-[11px] text-slate-500">
                                    Menampilkan {partnerPayments.length} transaksi pembelian paket dan {registeredMembers.length} akun terdaftar dengan kode mitra ini.
                                  </p>
                                </div>
                              </div>

                              {partnerPayments.length === 0 ? (
                                <p className="text-xs text-slate-500 py-2">
                                  Belum ada transaksi pembelian paket menggunakan kode mitra ini.
                                </p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs text-left">
                                    <thead>
                                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                                        <th className="py-2 px-2.5 text-center">No</th>
                                        <th className="py-2 px-2.5">Tgl Daftar / Bayar</th>
                                        <th className="py-2 px-2.5">Nama &amp; Kontak Peserta</th>
                                        <th className="py-2 px-2.5">Paket &amp; Nominal</th>
                                        <th className="py-2 px-2.5 text-center">Status Bayar</th>
                                        <th className="py-2 px-2.5 text-right">Komisi</th>
                                        <th className="py-2 px-2.5 text-center">Status Komisi</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {partnerPayments.map((p, pIdx) => {
                                        const buyer = users.find(
                                          u => u.id === p.user_id || u.email === p.user_email
                                        );
                                        const regDate = p.user_registered_at || buyer?.created_at || p.created_at;
                                        const comm = p.affiliate_commission ?? activeCommissionAmount;
                                        return (
                                          <tr key={p.id} className="hover:bg-slate-50/70">
                                            <td className="py-2 px-2.5 text-center font-mono text-slate-500">
                                              {pIdx + 1}
                                            </td>
                                            <td className="py-2 px-2.5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                                              <div>Daftar: {new Date(regDate).toLocaleDateString('id-ID')}</div>
                                              <div>Bayar: {new Date(p.created_at).toLocaleDateString('id-ID')}</div>
                                            </td>
                                            <td className="py-2 px-2.5">
                                              <div className="font-bold text-slate-900">{p.user_name}</div>
                                              <div className="text-[10px] font-mono text-slate-500">{p.user_email}</div>
                                              <div className="text-[10px] font-mono text-slate-500">
                                                WA: {p.user_phone || buyer?.phone || '-'}
                                              </div>
                                            </td>
                                            <td className="py-2 px-2.5">
                                              <div className="font-semibold text-slate-800">{p.package_name}</div>
                                              <div className="font-mono font-bold text-blue-700">
                                                Rp {p.amount.toLocaleString('id-ID')}
                                              </div>
                                            </td>
                                            <td className="py-2 px-2.5 text-center">
                                              <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                                  p.status === 'APPROVED'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : p.status === 'REJECTED'
                                                    ? 'bg-red-50 text-red-700 border-red-200'
                                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                                }`}
                                              >
                                                {p.status === 'APPROVED' ? 'LUNAS' : p.status}
                                              </span>
                                            </td>
                                            <td className="py-2 px-2.5 text-right font-mono font-extrabold text-emerald-700 whitespace-nowrap">
                                              {p.status === 'REJECTED' ? 'Rp 0' : `Rp ${comm.toLocaleString('id-ID')}`}
                                            </td>
                                            <td className="py-2 px-2.5 text-center whitespace-nowrap">
                                              {p.status !== 'APPROVED' ? (
                                                <span className="text-[10px] text-slate-400">Menunggu Lunas</span>
                                              ) : p.commission_status === 'PAID' ? (
                                                <div className="space-y-0.5">
                                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                                    <Check className="w-3 h-3" /> SUDAH DIBAYAR
                                                  </span>
                                                  {p.commission_proof_url && (
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        setCommissionProofPreview({
                                                          url: p.commission_proof_url || '',
                                                          title: `Bukti Transfer Komisi - ${partner.full_name}`,
                                                          subtitle: `Peserta: ${p.user_name} · Komisi Rp ${comm.toLocaleString('id-ID')}`
                                                        })
                                                      }
                                                      className="block mx-auto text-[10px] text-blue-700 hover:underline font-bold cursor-pointer"
                                                    >
                                                      Lihat Bukti
                                                    </button>
                                                  )}
                                                </div>
                                              ) : (
                                                <button
                                                  type="button"
                                                  onClick={() => toggleCommissionPaidStatus(p.id, true)}
                                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                                                >
                                                  Tandai Dibayar
                                                </button>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {registeredMembers.length > 0 && (
                                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-700">
                                  <span className="font-extrabold text-slate-800">
                                    Akun Terdaftar Memakai Kode {partner.referral_code} ({registeredMembers.length} Orang):
                                  </span>
                                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    {registeredMembers.map(rm => (
                                      <span
                                        key={rm.id}
                                        className={`px-2 py-1 rounded-lg border text-[10px] font-semibold ${
                                          rm.membership_type !== 'FREE'
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                            : 'bg-slate-50 text-slate-700 border-slate-200'
                                        }`}
                                      >
                                        {rm.full_name} ({rm.membership_type}) ·{' '}
                                        {new Date(rm.created_at).toLocaleDateString('id-ID')}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Sub-panel B: Riwayat Pembayaran / Pencairan Komisi Mitra + Upload Bukti Transfer */}
                            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                                <div>
                                  <h5 className="text-xs sm:text-sm font-extrabold text-slate-900">
                                    2. Riwayat Pencairan &amp; Bukti Transfer Komisi ({partnerWithdrawals.length} Riwayat)
                                  </h5>
                                  <p className="text-[11px] text-slate-500">
                                    Upload bukti transfer dan klik sudah bayar untuk otomatis mengurangi saldo komisi belum dibayar mitra ini.
                                  </p>
                                </div>
                                {unpaidCommission > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => openPayoutModalForPartner(partner, unpaidCommission)}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer self-start"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Bayar Saldo (Rp {unpaidCommission.toLocaleString('id-ID')}) &amp; Upload Bukti</span>
                                  </button>
                                )}
                              </div>

                              {partnerWithdrawals.length === 0 ? (
                                <p className="text-xs text-slate-500 py-1">
                                  Belum ada riwayat pencairan komisi untuk mitra ini.
                                </p>
                              ) : (
                                <div className="space-y-2 text-xs">
                                  {partnerWithdrawals.map(wd => (
                                    <div
                                      key={wd.id}
                                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                    >
                                      <div className="space-y-0.5">
                                        <div className="flex flex-wrap items-center gap-2">
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
                                              ? 'DIBATALKAN'
                                              : 'MENUNGGU TRANSFER'}
                                          </span>
                                          <span className="text-[10px] font-mono text-slate-400">
                                            Diajukan: {new Date(wd.requested_at).toLocaleString('id-ID')}
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-slate-600">
                                          Rekening: <strong>{wd.bank_name}</strong> ·{' '}
                                          <span className="font-mono">{wd.account_number}</span> a.n. {wd.account_holder}
                                        </p>
                                        {wd.paid_at && (
                                          <p className="text-[10px] text-emerald-700 font-mono">
                                            Dibayar: {new Date(wd.paid_at).toLocaleString('id-ID')}
                                            {wd.paid_by ? ` oleh ${wd.paid_by}` : ''}
                                          </p>
                                        )}
                                        {wd.cancellation_reason && (
                                          <p className="text-[11px] text-red-700 font-semibold">
                                            Alasan Pembatalan: {wd.cancellation_reason}
                                          </p>
                                        )}
                                        {wd.notes && !wd.cancellation_reason && (
                                          <p className="text-[11px] text-slate-600 italic">Catatan: {wd.notes}</p>
                                        )}
                                      </div>

                                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                                        {wd.proof_url && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setCommissionProofPreview({
                                                url: wd.proof_url || '',
                                                title: `Bukti Transfer Komisi - ${wd.affiliate_name}`,
                                                subtitle: `Rp ${wd.amount.toLocaleString('id-ID')} ke ${wd.bank_name} ${wd.account_number}`
                                              })
                                            }
                                            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                          >
                                            <ImageIcon className="w-3.5 h-3.5" />
                                            <span>Lihat Bukti Transfer</span>
                                          </button>
                                        )}
                                        {wd.status === 'REQUESTED' && (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                openPayoutModalForPartner(partner, unpaidCommission, wd)
                                              }
                                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                            >
                                              <Upload className="w-3.5 h-3.5" />
                                              <span>Upload Bukti &amp; Klik Sudah Bayar</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setCancellingWithdrawal(wd);
                                                setCancelWithdrawalReason('');
                                                setCancelWithdrawalError('');
                                              }}
                                              className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                            >
                                              <XCircle className="w-3.5 h-3.5" />
                                              <span>Batalkan</span>
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2: Rekap Antrean & Riwayat Pencairan Komisi Global */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Rekap Semua Permintaan &amp; Riwayat Pencairan Komisi ({commissionWithdrawals.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Minimal pengajuan pencairan: <strong>Rp {activeMinWithdrawal.toLocaleString('id-ID')}</strong>. Unggah bukti transfer dan klik Sudah Bayar agar saldo komisi mitra otomatis berkurang serta notifikasi dikirim dari <span className="font-mono">{senderEmail}</span>.
                  </p>
                </div>
              </div>

              {commissionWithdrawals.length === 0 ? (
                <p className="text-xs text-slate-500">Belum ada pengajuan pencairan komisi.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                        <th className="py-2.5 px-3">Tgl Ajuan</th>
                        <th className="py-2.5 px-3">Mitra &amp; Identitas</th>
                        <th className="py-2.5 px-3">Kode Referral</th>
                        <th className="py-2.5 px-3">Rekening Tujuan Pencairan</th>
                        <th className="py-2.5 px-3 text-right">Nominal</th>
                        <th className="py-2.5 px-3 text-center">Status &amp; Bukti</th>
                        <th className="py-2.5 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {commissionWithdrawals.map(wd => {
                        const rawWa = wd.affiliate_phone.replace(/\D/g, '');
                        const waPhone = rawWa.startsWith('0') ? `62${rawWa.slice(1)}` : rawWa;
                        const wdPartner = users.find(u => u.id === wd.affiliate_user_id);
                        return (
                          <tr key={wd.id} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                              {new Date(wd.requested_at).toLocaleDateString('id-ID')}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{wd.affiliate_name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                WA: {wd.affiliate_phone} · {wd.affiliate_email}
                              </div>
                              {wd.identity_number && (
                                <div className="text-[10px] text-slate-500 font-mono">NIK: {wd.identity_number}</div>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold text-[11px]">
                                {wd.referral_code}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-800">{wd.bank_name}</div>
                              <div className="font-mono text-[11px] text-slate-700">{wd.account_number}</div>
                              <div className="text-[10px] text-slate-500">a.n. {wd.account_holder}</div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-extrabold text-emerald-700 whitespace-nowrap">
                              Rp {wd.amount.toLocaleString('id-ID')}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span
                                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded border whitespace-nowrap ${
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
                                    ? 'DIBATALKAN'
                                    : 'MENUNGGU TRANSFER'}
                                </span>
                                {wd.cancellation_reason && (
                                  <span className="text-[10px] text-red-700 max-w-[180px] truncate" title={wd.cancellation_reason}>
                                    {wd.cancellation_reason}
                                  </span>
                                )}
                                {wd.proof_url && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCommissionProofPreview({
                                        url: wd.proof_url || '',
                                        title: `Bukti Transfer Komisi - ${wd.affiliate_name}`,
                                        subtitle: `Rp ${wd.amount.toLocaleString('id-ID')} · ${wd.bank_name} ${wd.account_number}`
                                      })
                                    }
                                    className="text-[10px] font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <ImageIcon className="w-3 h-3" />
                                    <span>Lihat Bukti</span>
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                {wd.status === 'REQUESTED' ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (wdPartner) {
                                          openPayoutModalForPartner(wdPartner, wd.amount, wd);
                                        } else {
                                          setPayoutError('');
                                          setPayoutProofUrl('');
                                          setPayoutNotes('');
                                          setPayoutAmount(wd.amount);
                                          setPayoutModal({
                                            mode: 'WITHDRAWAL',
                                            partnerId: wd.affiliate_user_id,
                                            partnerName: wd.affiliate_name,
                                            referralCode: wd.referral_code,
                                            bankInfo: `${wd.bank_name} · ${wd.account_number} a.n. ${wd.account_holder}`,
                                            maxAmount: wd.amount,
                                            withdrawalId: wd.id
                                          });
                                        }
                                      }}
                                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1"
                                    >
                                      <Upload className="w-3 h-3" />
                                      <span>Upload Bukti &amp; Bayar</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCancellingWithdrawal(wd);
                                        setCancelWithdrawalReason('');
                                        setCancelWithdrawalError('');
                                      }}
                                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1"
                                      title="Batalkan pencairan komisi sesuai Pasal 7 S&K"
                                    >
                                      <XCircle className="w-3 h-3" />
                                      <span>Batalkan</span>
                                    </button>
                                  </>
                                ) : wd.status === 'PAID' ? (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    Lunas {wd.paid_at ? new Date(wd.paid_at).toLocaleDateString('id-ID') : ''}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-red-600 font-semibold">
                                    Dibatalkan
                                  </span>
                                )}
                                <a
                                  href={`https://wa.me/${waPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                  title="Chat WA Mitra"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Section 2: Laporan Detail Peserta Pengguna Kode Referral & Komisi */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Laporan Detail Peserta Pengguna Kode Referral &amp; Data Mitra Pemilik Kode
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Klik tombol status komisi untuk menandai komisi <strong>Sudah Dibayarkan</strong> atau menghitung komisi belum dibayar.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={activationSearch}
                    onChange={e => setActivationSearch(e.target.value)}
                    placeholder="Cari nama peserta, email, kode referral, atau mitra..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <select
                  value={commissionStatusFilter}
                  onChange={e => setCommissionStatusFilter(e.target.value as 'ALL' | 'UNPAID' | 'PAID')}
                  className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="ALL">Semua Komisi Referral ({referralPayments.length})</option>
                  <option value="UNPAID">Komisi Belum Dibayar</option>
                  <option value="PAID">Komisi Sudah Dibayar</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                      <th className="py-2.5 px-3 text-center">No</th>
                      <th className="py-2.5 px-3">Tgl Daftar &amp; Tgl Bayar</th>
                      <th className="py-2.5 px-3">Data Peserta</th>
                      <th className="py-2.5 px-3">Paket &amp; Rincian Harga</th>
                      <th className="py-2.5 px-3">Kode Referral</th>
                      <th className="py-2.5 px-3">Data Mitra Pemilik Kode</th>
                      <th className="py-2.5 px-3 text-right">Komisi Mitra</th>
                      <th className="py-2.5 px-3 text-center">Status &amp; Klik Bayar Komisi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReferralPayments.map((p, idx) => {
                      const d = getPaymentPartnerDetails(p);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 align-top">
                          <td className="py-2.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            <div><strong className="text-slate-700">Daftar:</strong> {new Date(d.regDate).toLocaleDateString('id-ID')}</div>
                            <div><strong className="text-slate-700">Bayar:</strong> {new Date(p.created_at).toLocaleDateString('id-ID')}</div>
                            {p.verified_at && (
                              <div className="text-[10px] text-emerald-700">Lunas: {new Date(p.verified_at).toLocaleDateString('id-ID')}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{p.user_name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{p.user_email}</div>
                            <div className="text-[10px] text-slate-500 font-mono">WA: {d.phone}</div>
                            <div className="text-[10px] text-slate-400">
                              Instansi: {d.buyer?.targetAgency || '-'}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-800">{p.package_name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Asli: Rp {d.originalAmount.toLocaleString('id-ID')} · Ref: -Rp {d.referralDiscount.toLocaleString('id-ID')}
                            </div>
                            <div className="font-mono font-extrabold text-blue-700">
                              Bayar: Rp {p.amount.toLocaleString('id-ID')}
                            </div>
                            <span
                              className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                p.status === 'APPROVED'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : p.status === 'REJECTED'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {p.status === 'APPROVED' ? 'PEMBAYARAN LUNAS' : p.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-extrabold text-[11px]">
                              {d.referralCode}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{d.partnerName}</div>
                            {d.partner?.email && (
                              <div className="text-[10px] text-slate-500 font-mono">{d.partner.email}</div>
                            )}
                            <div className="text-[10px] text-slate-500 font-mono">WA: {d.partnerPhone}</div>
                            {d.partnerBank !== '-' && (
                              <div className="text-[10px] text-blue-700 font-medium mt-0.5">Rek: {d.partnerBank}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-extrabold text-emerald-700 whitespace-nowrap">
                            Rp {d.commission.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {!d.isPartnerCommissionable ? (
                              <span className="text-[10px] font-semibold text-slate-400">
                                Kode Bawaan Platform
                              </span>
                            ) : p.status !== 'APPROVED' ? (
                              <span className="text-[10px] font-semibold text-amber-700">
                                Menunggu Lunas
                              </span>
                            ) : p.commission_status === 'PAID' ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                  <Check className="w-3 h-3" /> SUDAH DIBAYARKAN
                                </span>
                                {p.commission_paid_at && (
                                  <div className="text-[9px] text-slate-400 font-mono">
                                    {new Date(p.commission_paid_at).toLocaleDateString('id-ID')}
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => toggleCommissionPaidStatus(p.id, false)}
                                  className="block mx-auto text-[10px] text-slate-500 hover:text-red-600 underline cursor-pointer"
                                >
                                  Batalkan Lunas
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                                  BELUM DIBAYAR
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleCommissionPaidStatus(p.id, true)}
                                  className="block mx-auto px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-extrabold shadow-2xs cursor-pointer"
                                >
                                  Klik: Komisi Sudah Dibayarkan
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Aktivasi Premium Manual Pengguna */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Aktivasi Premium Manual Pengguna ({memberUsers.length} Akun)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Aktifkan atau nonaktifkan status Premium peserta secara manual kapan saja.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                      <th className="py-2.5 px-3">Peserta</th>
                      <th className="py-2.5 px-3">Tgl Daftar</th>
                      <th className="py-2.5 px-3">Kode Referral Daftar / Mitra</th>
                      <th className="py-2.5 px-3">Status Premium</th>
                      <th className="py-2.5 px-3 text-center">Aktivasi Manual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {memberUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{u.full_name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{u.email} · WA: {u.phone}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                          {new Date(u.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="text-[11px] text-slate-700">
                            Daftar pakai: <span className="font-mono font-bold">{u.registered_referral_code || '-'}</span>
                          </div>
                          {u.is_affiliate && u.referral_code && (
                            <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                              Mitra: {u.referral_code}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              u.membership_type === 'INTENSIF'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                : u.membership_type === 'PREMIUM'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : u.membership_type === 'STANDAR'
                                ? 'bg-sky-50 text-sky-800 border-sky-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {u.membership_type !== 'FREE'
                              ? `${u.membership_type} (s/d ${u.premium_end ? new Date(u.premium_end).toLocaleDateString('id-ID') : '-'})`
                              : 'FREE'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <select
                            aria-label={`Aktivasi manual ${u.full_name}`}
                            value={u.membership_type}
                            onChange={e => {
                              const nextTier = e.target.value as MembershipType;
                              manualSetMembershipTier(
                                u.id,
                                nextTier,
                                nextTier === 'INTENSIF' ? 90 : nextTier === 'FREE' ? 0 : 365
                              );
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-[11px] font-bold text-slate-800 hover:border-blue-400 cursor-pointer"
                          >
                            <option value="FREE">FREE (Nonaktifkan)</option>
                            <option value="STANDAR">STANDAR (1 Thn · Soal)</option>
                            <option value="PREMIUM">PREMIUM (1 Thn · Mandiri)</option>
                            <option value="INTENSIF">INTENSIF (90 Hr · Bimbel)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 4: Log Pesan Email Transaksi Resmi (Dari loginbimbelasn@gmail.com) */}
            <div className="p-6 bg-white rounded-2xl border border-blue-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 uppercase mb-0.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Pengirim Resmi: {senderEmail}</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Log Pesan Email Transaksi &amp; Notifikasi Peserta ({filteredEmailLogs.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Rekaman otomatis setiap aktivitas transaksi (menunggu bayar, pembayaran lunas, aktivasi Premium, persetujuan mitra &amp; pencairan komisi). Klik tombol <em>Kirim via Email App</em> jika ingin mengirim ulang lewat klien Gmail Anda.
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={emailLogSearch}
                    onChange={e => setEmailLogSearch(e.target.value)}
                    placeholder="Cari email, nama, atau subjek..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {filteredEmailLogs.slice(0, 30).map(log => {
                  const mailtoHref = `mailto:${encodeURIComponent(log.recipient_email)}?subject=${encodeURIComponent(
                    log.subject
                  )}&body=${encodeURIComponent(log.body)}`;
                  return (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px]">
                            {log.category}
                          </span>
                          <span className="font-bold text-slate-900">{log.recipient_name}</span>
                          <span className="font-mono text-[11px] text-blue-700">&lt;{log.recipient_email}&gt;</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            · {new Date(log.created_at).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <p className="font-extrabold text-slate-800">{log.subject}</p>
                        <p className="text-[11px] text-slate-600 line-clamp-2">{log.body}</p>
                      </div>
                      <a
                        href={mailtoHref}
                        className="px-3 py-2 rounded-lg bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px] inline-flex items-center gap-1.5 shrink-0 self-start md:self-center"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Kirim via Email App</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= 9. TRYOUT BERSAMA (SESUAI TAMPILAN PESERTA + FILTER, RANGKING & EKSPOR) ================= */}
      {currentAdminTab === 'admin-together-sessions' && (() => {
        const pgConfig = settings.default_passing_grade;
        const togetherSessions = groupSessions.filter(s => s.session_category !== 'ZOOM_BIMBEL_MALAM');

        const filteredSessions = togetherSessions.filter(s => {
          if (tbSessionFilter !== 'ALL' && s.id !== tbSessionFilter) return false;
          if (tbStatusFilter !== 'ALL' && s.status !== tbStatusFilter) return false;
          if (tbExamTypeFilter !== 'ALL' && s.exam_type !== tbExamTypeFilter) return false;
          if (tbSearch.trim()) {
            const q = tbSearch.toLowerCase();
            return (
              s.title.toLowerCase().includes(q) ||
              s.coach_name.toLowerCase().includes(q) ||
              s.description.toLowerCase().includes(q)
            );
          }
          return true;
        });

        // Gabungkan entri leaderboard + hasil ujian bertipe TRYOUT_BERSAMA yang belum ada di leaderboard
        const sessionById = new Map(groupSessions.map(s => [s.id, s]));
        const seenKeys = new Set(leaderboards.map(l => `${l.session_id}__${l.user_id}`));
        const combinedRows = [
          ...leaderboards.map(l => {
            const sess = sessionById.get(l.session_id);
            const passed =
              l.twk_score >= pgConfig.twk && l.tiu_score >= pgConfig.tiu && l.tkp_score >= pgConfig.tkp;
            return {
              id: l.id,
              session_id: l.session_id,
              session_title: sess?.title || 'Tryout Bareng Nasional',
              session_status: sess?.status || 'ACTIVE',
              exam_type: sess?.exam_type || ('TRYOUT_BERSAMA' as ExamType),
              user_id: l.user_id,
              user_name: l.user_name,
              twk_score: l.twk_score,
              tiu_score: l.tiu_score,
              tkp_score: l.tkp_score,
              total_score: l.total_score,
              completion_time_seconds: l.completion_time_seconds,
              is_passed: passed
            };
          }),
          ...results
            .filter(r => r.exam_type === 'TRYOUT_BERSAMA')
            .filter(r => !seenKeys.has(`${r.session_id || 'sess-001'}__${r.user_id}`))
            .map(r => {
              const sid = r.session_id || togetherSessions[0]?.id || 'sess-001';
              const sess = sessionById.get(sid);
              return {
                id: `res-${r.id}`,
                session_id: sid,
                session_title: sess?.title || r.exam_title,
                session_status: sess?.status || 'ACTIVE',
                exam_type: r.exam_type,
                user_id: r.user_id,
                user_name: r.user_name,
                twk_score: r.twk_score,
                tiu_score: r.tiu_score,
                tkp_score: r.tkp_score,
                total_score: r.total_score,
                completion_time_seconds: r.duration_seconds,
                is_passed: r.pass_status === 'MEMENUHI_AMBANG_BATAS'
              };
            })
        ];

        const filteredLeaderboard = combinedRows
          .filter(row => {
            if (tbSessionFilter !== 'ALL' && row.session_id !== tbSessionFilter) return false;
            if (tbStatusFilter !== 'ALL' && row.session_status !== tbStatusFilter) return false;
            if (tbExamTypeFilter !== 'ALL' && row.exam_type !== tbExamTypeFilter) return false;
            if (tbPassFilter === 'LULUS' && !row.is_passed) return false;
            if (tbPassFilter === 'BELUM' && row.is_passed) return false;
            if (tbSearch.trim()) {
              const q = tbSearch.toLowerCase();
              return (
                row.user_name.toLowerCase().includes(q) ||
                row.session_title.toLowerCase().includes(q)
              );
            }
            return true;
          })
          .sort((a, b) => {
            if (tbRankSort === 'TWK_DESC') return b.twk_score - a.twk_score || b.total_score - a.total_score;
            if (tbRankSort === 'TIU_DESC') return b.tiu_score - a.tiu_score || b.total_score - a.total_score;
            if (tbRankSort === 'TKP_DESC') return b.tkp_score - a.tkp_score || b.total_score - a.total_score;
            if (tbRankSort === 'TIME_ASC') return a.completion_time_seconds - b.completion_time_seconds;
            return b.total_score - a.total_score || a.completion_time_seconds - b.completion_time_seconds;
          });

        const exportHeaders = [
          'Peringkat',
          'Nama Peserta',
          'Nama Sesi Tryout Bersama',
          'Jenis Soal',
          'TWK',
          'TIU',
          'TKP',
          'Total Nilai',
          'Status PG',
          'Waktu Pengerjaan'
        ];
        const exportRows = filteredLeaderboard.map((row, idx) => [
          idx + 1,
          row.user_name,
          row.session_title,
          row.exam_type,
          row.twk_score,
          row.tiu_score,
          row.tkp_score,
          row.total_score,
          row.is_passed ? 'LULUS PG' : 'BELUM LULUS PG',
          `${Math.floor(row.completion_time_seconds / 60)}m ${row.completion_time_seconds % 60}s`
        ]);

        return (
          <div className="space-y-6">
            {/* Header & Quick Create */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Manajemen Sesi &amp; Peringkat Tryout Bersama ({togetherSessions.length} Sesi)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tampilan sesi sesuai menu Tryout Bareng peserta, lengkap dengan pencarian, filter sesi &amp; jenis soal, peringkat, serta ekspor Excel, Word, dan PDF.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openCreateSessionModal('TRYOUT_BARENG')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Sesi Tryout Bersama</span>
                </button>
              </div>

              {tbNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 font-semibold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{tbNotice}</span>
                  </div>
                  <button type="button" onClick={() => setTbNotice('')} className="text-emerald-700 hover:text-emerald-950 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Search, Filter Sesi, Jenis Soal, Status & Ranking */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
                <div className="relative lg:col-span-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tbSearch}
                    onChange={e => setTbSearch(e.target.value)}
                    placeholder="Cari nama peserta, judul sesi, mentor..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <select
                  aria-label="Filter sesi tryout bersama"
                  value={tbSessionFilter}
                  onChange={e => setTbSessionFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">Semua Sesi ({togetherSessions.length})</option>
                  {togetherSessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filter jenis soal tryout bersama"
                  value={tbExamTypeFilter}
                  onChange={e => setTbExamTypeFilter(e.target.value as 'ALL' | ExamType)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">Semua Jenis Soal</option>
                  <option value="TRYOUT_BERSAMA">Tryout Bersama</option>
                  <option value="TRYOUT_SKD_LENGKAP">SKD Lengkap (110 Soal)</option>
                  <option value="TRYOUT_KATEGORI">Tryout Kategori</option>
                </select>
                <select
                  aria-label="Filter status sesi"
                  value={tbStatusFilter}
                  onChange={e => setTbStatusFilter(e.target.value as 'ALL' | 'UPCOMING' | 'ACTIVE' | 'FINISHED')}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">Semua Status Sesi</option>
                  <option value="UPCOMING">Akan Datang</option>
                  <option value="ACTIVE">Sedang Aktif</option>
                  <option value="FINISHED">Sudah Selesai</option>
                </select>
                <select
                  aria-label="Urutkan peringkat leaderboard"
                  value={tbRankSort}
                  onChange={e => setTbRankSort(e.target.value as typeof tbRankSort)}
                  className="px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-blue-800"
                >
                  <option value="TOTAL_DESC">Ranking: Total Tertinggi</option>
                  <option value="TWK_DESC">Ranking: TWK Tertinggi</option>
                  <option value="TIU_DESC">Ranking: TIU Tertinggi</option>
                  <option value="TKP_DESC">Ranking: TKP Tertinggi</option>
                  <option value="TIME_ASC">Ranking: Waktu Tercepat</option>
                </select>
              </div>

              {/* Session Cards (Mirroring Participant Tryout Bareng View) */}
              <div className="space-y-4">
                {filteredSessions.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-500">
                    Tidak ada sesi Tryout Bersama yang cocok dengan filter pencarian.
                  </div>
                ) : (
                  filteredSessions.map(session => (
                    <div
                      key={session.id}
                      className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded w-fit ${
                              session.status === 'FINISHED'
                                ? 'bg-slate-200 text-slate-700'
                                : session.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {session.status} · Kuota {session.quota}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {session.exam_type}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          Instruktur: <strong className="text-slate-800">{session.coach_name}</strong>
                        </span>
                      </div>

                      <div className="flex flex-col md:flex-row gap-4">
                        {session.poster_url && (
                          <button
                            type="button"
                            onClick={() =>
                              setSessionImagePreview({
                                url: session.poster_url!,
                                title: `Poster Sesi: ${session.title}`,
                                subtitle: session.coach_name
                              })
                            }
                            className="relative w-full md:w-44 h-28 rounded-xl overflow-hidden border border-slate-200 shrink-0 group cursor-pointer"
                          >
                            <img
                              src={session.poster_url}
                              alt={session.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-slate-900/75 text-white text-[10px] font-bold inline-flex items-center gap-1">
                              <ZoomIn className="w-3 h-3" /> Poster
                            </span>
                          </button>
                        )}
                        <div className="flex-1 space-y-2">
                          <h3 className="font-extrabold text-base text-slate-900">{session.title}</h3>
                          <p className="text-xs text-slate-600 leading-relaxed">{session.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Jadwal:</span>
                          <span className="font-semibold text-slate-800">
                            {new Date(session.start_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Waktu:</span>
                          <span className="font-semibold text-slate-800 font-mono">
                            {session.duration_minutes} Menit
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Jumlah Soal:</span>
                          <span className="font-semibold text-slate-800 font-mono">
                            {session.question_count} Butir
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Kuota / Hadir:</span>
                          <span className="font-semibold text-slate-800">
                            {session.attendance_count ? `${session.attendance_count} hadir / ` : ''}
                            {session.quota} Peserta
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 text-xs">
                        <div className="flex flex-wrap items-center gap-2 text-slate-600">
                          <Video className="w-4 h-4 text-purple-600" />
                          <span>Zoom:</span>
                          <a
                            href={session.zoom_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-700 hover:underline font-semibold inline-flex items-center gap-1"
                          >
                            Buka Link Room <ExternalLink className="w-3 h-3" />
                          </a>
                          <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-blue-400 text-[11px] font-bold text-slate-700 cursor-pointer ml-1">
                            <ImageIcon className="w-3 h-3 text-blue-600" />
                            <span>{session.poster_url ? 'Ganti Poster' : 'Upload Poster'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) void handleQuickUploadPoster(session, file);
                                e.target.value = '';
                              }}
                            />
                          </label>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setTbSessionFilter(session.id)}
                            className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trophy className="w-3.5 h-3.5" />
                            <span>Lihat Peringkat Sesi</span>
                          </button>
                          <select
                            aria-label={`Ubah status ${session.title}`}
                            value={session.status}
                            onChange={e => {
                              updateGroupSession({
                                ...session,
                                status: e.target.value as 'UPCOMING' | 'ACTIVE' | 'FINISHED'
                              });
                              setTbNotice(`Status sesi "${session.title}" diubah ke ${e.target.value}.`);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-[11px] font-bold text-slate-700"
                          >
                            <option value="UPCOMING">Akan Datang</option>
                            <option value="ACTIVE">Sedang Aktif</option>
                            <option value="FINISHED">Sudah Selesai</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => openEditSessionModal(session)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Ubah</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteGroupSession(session.id);
                              setTbNotice(`Sesi "${session.title}" telah dihapus.`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Leaderboard & Peringkat Peserta Tryout Bersama + Ekspor Excel, Word, PDF */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Leaderboard Peringkat Peserta Tryout Bersama ({filteredLeaderboard.length} Peserta)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Filter berdasarkan status kelulusan PG, urutkan peringkat, dan unduh laporan ke Excel, Word, atau PDF.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label="Filter kelulusan passing grade"
                    value={tbPassFilter}
                    onChange={e => setTbPassFilter(e.target.value as 'ALL' | 'LULUS' | 'BELUM')}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    <option value="ALL">Semua Kelulusan PG</option>
                    <option value="LULUS">Lulus Passing Grade</option>
                    <option value="BELUM">Belum Memenuhi PG</option>
                  </select>

                  {renderPaperAndOrientationControls(exportHeaders, exportRows)}

                  {(() => {
                    const selectedSession =
                      tbSessionFilter !== 'ALL' ? togetherSessions.find(s => s.id === tbSessionFilter) : null;
                    const tbDetailRows: ReportDetailItem[] = selectedSession
                      ? [
                          { label: 'Nama Sesi Tryout', value: selectedSession.title },
                          {
                            label: 'Hari & Tanggal',
                            value: new Date(selectedSession.start_at).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          },
                          {
                            label: 'Jam Pelaksanaan',
                            value: `${new Date(selectedSession.start_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} - ${new Date(selectedSession.end_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} WIB`
                          },
                          {
                            label: 'Durasi & Jumlah Soal',
                            value: `${selectedSession.duration_minutes} Menit · ${selectedSession.question_count} Soal CAT`
                          },
                          {
                            label: 'Mentor / Pembina',
                            value: selectedSession.coach_name || 'Tim Pengajar LOGIN CPNS'
                          },
                          {
                            label: 'Ambang Batas (PG)',
                            value: `TWK ≥ ${pgConfig.twk} · TIU ≥ ${pgConfig.tiu} · TKP ≥ ${pgConfig.tkp}`
                          }
                        ]
                      : [
                          {
                            label: 'Cakupan Sesi',
                            value: `Semua Sesi Tryout Bersama (${filteredSessions.length} Sesi)`
                          },
                          {
                            label: 'Jadwal Terdekat',
                            value:
                              filteredSessions.length > 0
                                ? new Date(filteredSessions[0].start_at).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })
                                : 'Seluruh Periode Tryout'
                          },
                          {
                            label: 'Filter Jenis Soal',
                            value:
                              tbExamTypeFilter === 'ALL' ? 'Semua Jenis (SKD & Tryout Bersama)' : tbExamTypeFilter
                          },
                          {
                            label: 'Filter Kelulusan PG',
                            value:
                              tbPassFilter === 'LULUS'
                                ? 'Hanya Lulus PG'
                                : tbPassFilter === 'BELUM'
                                  ? 'Belum Memenuhi PG'
                                  : 'Semua Status Kelulusan'
                          },
                          {
                            label: 'Ambang Batas (PG)',
                            value: `TWK ≥ ${pgConfig.twk} · TIU ≥ ${pgConfig.tiu} · TKP ≥ ${pgConfig.tkp}`
                          },
                          {
                            label: 'Urutan Peringkat',
                            value:
                              tbRankSort === 'TOTAL_DESC'
                                ? 'Total Nilai Tertinggi'
                                : tbRankSort === 'TIME_ASC'
                                  ? 'Waktu Tercepat'
                                  : `Nilai ${tbRankSort.replace('_DESC', '')} Tertinggi`
                          }
                        ];

                    const tbSummary = [
                      { label: 'Total Peserta', value: `${filteredLeaderboard.length} Orang` },
                      {
                        label: 'Lulus Passing Grade',
                        value: `${filteredLeaderboard.filter(e => e.is_passed).length} Peserta`
                      },
                      {
                        label: 'Nilai Tertinggi',
                        value: `${filteredLeaderboard.reduce((m, e) => Math.max(m, e.total_score), 0)}`
                      },
                      {
                        label: 'Rata-rata Nilai',
                        value: `${
                          filteredLeaderboard.length > 0
                            ? Math.round(
                                filteredLeaderboard.reduce((s, e) => s + e.total_score, 0) /
                                  filteredLeaderboard.length
                              )
                            : 0
                        }`
                      }
                    ];
                    const tbReportSubtitle = selectedSession
                      ? `${selectedSession.title} · Total Peserta: ${filteredLeaderboard.length} Orang`
                      : `Rekapitulasi Seluruh Sesi · Total Peserta: ${filteredLeaderboard.length} Orang`;

                    return (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            void exportTableToExcel(
                              `Ranking_Tryout_Bersama_${new Date().toISOString().slice(0, 10)}.xlsx`,
                              'Ranking Tryout Bersama',
                              exportHeaders,
                              exportRows,
                              {
                                orientation: reportOrientation,
                                paperSize: reportPaperSize,
                                title: 'Laporan Peringkat Tryout Bersama',
                                subtitle: tbReportSubtitle,
                                summaryCards: tbSummary,
                                detailRows: tbDetailRows,
                                brandInfo: officialBrandInfo
                              }
                            )
                          }
                          className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Excel (.xlsx)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void exportTableToWord(
                              `Ranking_Tryout_Bersama_${new Date().toISOString().slice(0, 10)}.doc`,
                              'Laporan Peringkat Tryout Bersama',
                              tbReportSubtitle,
                              exportHeaders,
                              exportRows,
                              {
                                orientation: reportOrientation,
                                paperSize: reportPaperSize,
                                summaryCards: tbSummary,
                                detailRows: tbDetailRows,
                                brandInfo: officialBrandInfo
                              }
                            )
                          }
                          className="px-3 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Word (.doc)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void exportTableToPdf(
                              `Ranking_Tryout_Bersama_${new Date().toISOString().slice(0, 10)}.pdf`,
                              'Laporan Peringkat Tryout Bersama',
                              tbReportSubtitle,
                              exportHeaders,
                              exportRows,
                              {
                                orientation: reportOrientation,
                                paperSize: reportPaperSize,
                                summaryCards: tbSummary,
                                detailRows: tbDetailRows,
                                brandInfo: officialBrandInfo
                              }
                            )
                          }
                          className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>PDF (.pdf)</span>
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                      <th className="py-2.5 px-3">Peringkat</th>
                      <th className="py-2.5 px-3">Nama Peserta</th>
                      <th className="py-2.5 px-3">Sesi &amp; Jenis Soal</th>
                      <th className="py-2.5 px-3 font-mono">TWK</th>
                      <th className="py-2.5 px-3 font-mono">TIU</th>
                      <th className="py-2.5 px-3 font-mono">TKP</th>
                      <th className="py-2.5 px-3 font-mono">Total Nilai</th>
                      <th className="py-2.5 px-3">Status PG</th>
                      <th className="py-2.5 px-3">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-500">
                          Tidak ada data peringkat peserta sesuai filter yang dipilih.
                        </td>
                      </tr>
                    ) : (
                      filteredLeaderboard.map((entry, idx) => (
                        <tr key={entry.id} className={idx < 3 ? 'bg-amber-50/30' : ''}>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-bold ${
                                idx === 0
                                  ? 'bg-amber-400 text-amber-950'
                                  : idx === 1
                                  ? 'bg-slate-300 text-slate-800'
                                  : idx === 2
                                  ? 'bg-amber-600/30 text-amber-900'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{entry.user_name}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800">{entry.session_title}</div>
                            <span className="text-[10px] text-slate-500">{entry.exam_type}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-blue-700">{entry.twk_score}</td>
                          <td className="py-2.5 px-3 font-mono text-sky-700">{entry.tiu_score}</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-700">{entry.tkp_score}</td>
                          <td className="py-2.5 px-3 font-mono font-extrabold text-blue-700">
                            {entry.total_score}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                entry.is_passed
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              {entry.is_passed ? 'LULUS PG' : 'BELUM LULUS'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono">
                            {Math.floor(entry.completion_time_seconds / 60)}m {entry.completion_time_seconds % 60}s
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= 10. JADWAL ZOOM (CRUD, LAPORAN AKAN DATANG & BERLALU, POSTER IKLAN & BUKTI SCREENSHOT) ================= */}
      {currentAdminTab === 'admin-zoom' && (() => {
        const upcomingSessions = groupSessions.filter(s => s.status !== 'FINISHED');
        const pastSessions = groupSessions.filter(s => s.status === 'FINISHED');
        const posterCount = groupSessions.filter(s => Boolean(s.poster_url)).length;
        const evidenceCount = groupSessions.reduce(
          (acc, s) => acc + (s.evidence_screenshots?.length || 0),
          0
        );

        const filteredZoomSessions = groupSessions
          .filter(s => {
            if (zoomTimeTab === 'UPCOMING' && s.status === 'FINISHED') return false;
            if (zoomTimeTab === 'PAST' && s.status !== 'FINISHED') return false;
            if (zoomCatFilter !== 'ALL') {
              const cat = s.session_category === 'ZOOM_BIMBEL_MALAM' ? 'ZOOM_BIMBEL_MALAM' : 'TRYOUT_BARENG';
              if (cat !== zoomCatFilter) return false;
            }
            if (zoomSearch.trim()) {
              const q = zoomSearch.toLowerCase();
              return (
                s.title.toLowerCase().includes(q) ||
                s.coach_name.toLowerCase().includes(q) ||
                s.description.toLowerCase().includes(q)
              );
            }
            return true;
          })
          .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());

        const zoomExportHeaders = [
          'Judul Sesi Zoom',
          'Kategori',
          'Status',
          'Tanggal & Jam',
          'Durasi (Menit)',
          'Mentor',
          'Kuota / Hadir',
          'Poster Iklan',
          'Bukti Screenshot'
        ];
        const zoomExportRows = filteredZoomSessions.map(s => [
          s.title,
          s.session_category === 'ZOOM_BIMBEL_MALAM' ? 'Zoom Bimbel Malam' : 'Zoom Tryout Bareng',
          s.status === 'FINISHED' ? 'Sudah Berlalu' : s.status === 'ACTIVE' ? 'Sedang Aktif' : 'Akan Datang',
          new Date(s.start_at).toLocaleString('id-ID'),
          s.duration_minutes,
          s.coach_name,
          `${s.attendance_count || 0} / ${s.quota}`,
          s.poster_url ? 'Ada Poster' : 'Belum Ada',
          `${s.evidence_screenshots?.length || 0} File`
        ]);

        return (
          <div className="space-y-6">
            {/* Header & KPI Strip */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Manajemen Jadwal, Poster Iklan &amp; Riwayat Bukti Zoom
                  </h2>
                  <p className="text-xs text-slate-500">
                    Kelola jadwal Zoom yang akan datang (unggah poster promosi iklan) maupun riwayat Zoom yang sudah berlalu (unggah bukti screenshot dokumentasi &amp; laporan kehadiran).
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openCreateSessionModal('ZOOM_BIMBEL_MALAM')}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Jadwal Zoom</span>
                  </button>
                </div>
              </div>

              {zoomNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 font-semibold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{zoomNotice}</span>
                  </div>
                  <button type="button" onClick={() => setZoomNotice('')} className="text-emerald-700 hover:text-emerald-950 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] sm:text-[11px] font-bold text-blue-700 truncate">Akan Datang</span>
                    <span className="text-base sm:text-xl font-extrabold text-slate-900 font-mono tabular-nums leading-none shrink-0">
                      {upcomingSessions.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">Siap tayang &amp; poster</span>
                </div>
                <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 truncate">Sudah Berlalu</span>
                    <span className="text-base sm:text-xl font-extrabold text-slate-900 font-mono tabular-nums leading-none shrink-0">
                      {pastSessions.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">Arsip &amp; bukti kelas</span>
                </div>
                <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-purple-50/70 border border-purple-200">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] sm:text-[11px] font-bold text-purple-700 truncate">Poster Iklan</span>
                    <span className="text-base sm:text-xl font-extrabold text-slate-900 font-mono tabular-nums leading-none shrink-0">{posterCount}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">Tampil di jadwal peserta</span>
                </div>
                <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 truncate">Bukti Zoom</span>
                    <span className="text-base sm:text-xl font-extrabold text-slate-900 font-mono tabular-nums leading-none shrink-0">{evidenceCount}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">Screenshot kelas berlalu</span>
                </div>
              </div>

              {/* Filter Tabs & Export */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setZoomTimeTab('ALL')}
                    className={`px-3.5 py-2 rounded-xl font-bold border cursor-pointer transition-colors ${
                      zoomTimeTab === 'ALL'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Semua ({groupSessions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomTimeTab('UPCOMING')}
                    className={`px-3.5 py-2 rounded-xl font-bold border cursor-pointer transition-colors ${
                      zoomTimeTab === 'UPCOMING'
                        ? 'bg-indigo-700 text-white border-indigo-700'
                        : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                    }`}
                  >
                    Akan Datang ({upcomingSessions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomTimeTab('PAST')}
                    className={`px-3.5 py-2 rounded-xl font-bold border cursor-pointer transition-colors ${
                      zoomTimeTab === 'PAST'
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    Riwayat Sudah Berlalu ({pastSessions.length})
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={zoomSearch}
                      onChange={e => setZoomSearch(e.target.value)}
                      placeholder="Cari jadwal atau mentor..."
                      className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs w-48 sm:w-56"
                    />
                  </div>
                  <select
                    aria-label="Filter kategori sesi zoom"
                    value={zoomCatFilter}
                    onChange={e => setZoomCatFilter(e.target.value as typeof zoomCatFilter)}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    <option value="ALL">Semua Jenis Zoom</option>
                    <option value="ZOOM_BIMBEL_MALAM">Zoom Bimbel Malam</option>
                    <option value="TRYOUT_BARENG">Zoom Tryout Bareng</option>
                  </select>
                  {renderPaperAndOrientationControls(zoomExportHeaders, zoomExportRows)}
                  {(() => {
                    const zoomSummary = [
                      { label: 'Total Sesi', value: `${filteredZoomSessions.length} Jadwal` },
                      { label: 'Akan Datang', value: `${upcomingSessions.length} Sesi` },
                      { label: 'Sudah Berlalu', value: `${pastSessions.length} Sesi` },
                      { label: 'Poster / Bukti', value: `${posterCount} / ${evidenceCount}` }
                    ];
                    const zoomDetailRows: ReportDetailItem[] = [
                      {
                        label: 'Periode Jadwal',
                        value:
                          zoomTimeTab === 'UPCOMING'
                            ? 'Sesi Akan Datang & Aktif'
                            : zoomTimeTab === 'PAST'
                              ? 'Riwayat Sesi Sudah Berlalu'
                              : 'Semua Jadwal & Riwayat Zoom'
                      },
                      {
                        label: 'Kategori Zoom',
                        value:
                          zoomCatFilter === 'ZOOM_BIMBEL_MALAM'
                            ? 'Zoom Bimbel Malam'
                            : zoomCatFilter === 'TRYOUT_BARENG'
                              ? 'Zoom Tryout Bareng'
                              : 'Semua Kategori Zoom'
                      },
                      {
                        label: 'Total Dokumentasi',
                        value: `${posterCount} Poster Iklan · ${evidenceCount} Bukti Screenshot`
                      },
                      {
                        label: 'Tanggal Laporan',
                        value: new Date().toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      }
                    ];
                    return (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            void exportTableToExcel(
                              `Laporan_Jadwal_Zoom_${new Date().toISOString().slice(0, 10)}.xlsx`,
                              'Laporan Jadwal Zoom',
                              zoomExportHeaders,
                              zoomExportRows,
                              {
                                orientation: reportOrientation,
                                paperSize: reportPaperSize,
                                title: 'Laporan Jadwal & Riwayat Sesi Zoom Bimbel',
                                subtitle: `Akan Datang: ${upcomingSessions.length} Sesi · Sudah Berlalu: ${pastSessions.length} Sesi`,
                                summaryCards: zoomSummary,
                                detailRows: zoomDetailRows,
                                brandInfo: officialBrandInfo
                              }
                            )
                          }
                          className="px-2.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Excel</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void exportTableToWord(
                              `Laporan_Jadwal_Zoom_${new Date().toISOString().slice(0, 10)}.doc`,
                              'Laporan Jadwal & Riwayat Sesi Zoom Bimbel',
                              `Akan Datang: ${upcomingSessions.length} Sesi · Sudah Berlalu: ${pastSessions.length} Sesi`,
                              zoomExportHeaders,
                              zoomExportRows,
                              {
                                orientation: reportOrientation,
                                paperSize: reportPaperSize,
                                summaryCards: zoomSummary,
                                detailRows: zoomDetailRows,
                                brandInfo: officialBrandInfo
                              }
                            )
                          }
                          className="px-2.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Word</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void exportTableToPdf(
                              `Laporan_Jadwal_Zoom_${new Date().toISOString().slice(0, 10)}.pdf`,
                              'Laporan Jadwal & Riwayat Sesi Zoom Bimbel',
                              `Akan Datang: ${upcomingSessions.length} Sesi · Sudah Berlalu: ${pastSessions.length} Sesi`,
                              zoomExportHeaders,
                              zoomExportRows,
                              {
                                orientation: reportOrientation,
                                paperSize: reportPaperSize,
                                summaryCards: zoomSummary,
                                detailRows: zoomDetailRows,
                                brandInfo: officialBrandInfo
                              }
                            )
                          }
                          className="px-2.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Zoom Sessions Cards */}
              <div className="space-y-4">
                {filteredZoomSessions.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-500">
                    Tidak ada jadwal Zoom pada filter ini. Klik tombol &ldquo;Tambah Jadwal Zoom&rdquo; untuk membuat jadwal baru.
                  </div>
                ) : (
                  filteredZoomSessions.map(session => {
                    const isPast = session.status === 'FINISHED';
                    const isNight = session.session_category === 'ZOOM_BIMBEL_MALAM';
                    const screenshots = session.evidence_screenshots || [];

                    return (
                      <div
                        key={session.id}
                        className={`p-5 rounded-2xl border space-y-4 transition-all ${
                          isPast
                            ? 'bg-slate-50/70 border-slate-200'
                            : 'bg-white border-indigo-200 shadow-2xs'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                  isPast
                                    ? 'bg-slate-200 text-slate-800 border-slate-300'
                                    : session.status === 'ACTIVE'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                }`}
                              >
                                {isPast ? 'SUDAH BERLALU' : session.status === 'ACTIVE' ? 'BERLANGSUNG' : 'AKAN DATANG'}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                {isNight ? <Moon className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                                <span>{isNight ? 'ZOOM BIMBEL MALAM' : 'ZOOM TRYOUT BARENG'}</span>
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500">
                                Mentor: <strong className="text-slate-900">{session.coach_name}</strong>
                              </span>
                            </div>

                            <h3 className="text-base font-extrabold text-slate-900">{session.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">{session.description}</p>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 pt-1">
                              <span className="inline-flex items-center gap-1 font-semibold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                                {new Date(session.start_at).toLocaleDateString('id-ID', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}{' '}
                                ·{' '}
                                {new Date(session.start_at).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}{' '}
                                WIB
                              </span>
                              <span className="inline-flex items-center gap-1 font-semibold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                <Clock className="w-3.5 h-3.5 text-blue-600" />
                                {session.duration_minutes} Menit · Kuota {session.quota} org
                              </span>
                              {session.attendance_count !== undefined && (
                                <span className="inline-flex items-center gap-1 font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
                                  <Users className="w-3.5 h-3.5" />
                                  Hadir: {session.attendance_count} Peserta
                                </span>
                              )}
                              <a
                                href={session.zoom_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Link Zoom</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>

                            {session.summary_notes && (
                              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-700">
                                <strong className="text-slate-900">Catatan Laporan:</strong> {session.summary_notes}
                              </div>
                            )}
                          </div>

                          {/* Poster Iklan Preview (Utama untuk Akan Datang, juga tersedia jika ada) */}
                          <div className="w-full lg:w-64 shrink-0 space-y-2">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                                  Poster Iklan Jadwal Zoom
                                </span>
                                {session.poster_url && (
                                  <button
                                    type="button"
                                    onClick={() => updateGroupSession({ ...session, poster_url: undefined })}
                                    className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                                  >
                                    Hapus
                                  </button>
                                )}
                              </div>
                              {session.poster_url ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSessionImagePreview({
                                      url: session.poster_url!,
                                      title: `Poster Iklan: ${session.title}`,
                                      subtitle: new Date(session.start_at).toLocaleString('id-ID')
                                    })
                                  }
                                  className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-300 group cursor-pointer block"
                                >
                                  <img
                                    src={session.poster_url}
                                    alt={`Poster ${session.title}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                  <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-slate-900/75 text-white text-[10px] font-bold inline-flex items-center gap-1">
                                    <ZoomIn className="w-3 h-3" /> Perbesar
                                  </span>
                                </button>
                              ) : (
                                <div className="h-20 rounded-lg border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-[11px] text-slate-400">
                                  <ImageIcon className="w-5 h-5 mb-1 text-slate-300" />
                                  <span>Belum ada poster iklan</span>
                                </div>
                              )}
                              <label className="w-full py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                                <Upload className="w-3.5 h-3.5" />
                                <span>{session.poster_url ? 'Ganti Poster Iklan' : 'Upload Poster Iklan'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) void handleQuickUploadPoster(session, file);
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Bukti Screenshot Pelaksanaan Zoom (Khusus yang Sudah Berlalu / atau siap diisi) */}
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                                <Camera className="w-3.5 h-3.5 text-emerald-700" />
                                <span>
                                  Bukti Screenshot Zoom ({screenshots.length} Foto)
                                </span>
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                Unggah tangkapan layar kehadiran peserta / rekaman layar Zoom yang sudah berlalu.
                              </p>
                            </div>
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold cursor-pointer shrink-0">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Bukti Screenshot</span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={e => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    void handleQuickUploadEvidence(session, e.target.files);
                                  }
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          </div>

                          {screenshots.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
                              {screenshots.map((imgUrl, idx) => (
                                <div key={`${session.id}-ev-${idx}`} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 h-24">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSessionImagePreview({
                                        url: imgUrl,
                                        title: `Bukti Screenshot #${idx + 1}: ${session.title}`,
                                        subtitle: `Mentor: ${session.coach_name}`
                                      })
                                    }
                                    className="w-full h-full cursor-pointer block"
                                  >
                                    <img
                                      src={imgUrl}
                                      alt={`Bukti ${idx + 1}`}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                  </button>
                                  <button
                                    type="button"
                                    title="Hapus screenshot ini"
                                    onClick={() => {
                                      const next = screenshots.filter((_, i) => i !== idx);
                                      updateGroupSession({
                                        ...session,
                                        evidence_screenshots: next.length > 0 ? next : undefined
                                      });
                                    }}
                                    className="absolute top-1 right-1 p-1 rounded-full bg-red-600/90 hover:bg-red-700 text-white shadow-xs cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 italic">
                              Belum ada bukti screenshot yang diunggah untuk sesi ini.
                            </div>
                          )}
                        </div>

                        {/* Action Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            {!isPast ? (
                              <button
                                type="button"
                                onClick={() => {
                                  updateGroupSession({ ...session, status: 'FINISHED' });
                                  setZoomNotice(`Jadwal "${session.title}" dipindahkan ke Riwayat Sudah Berlalu.`);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Tandai Sudah Berlalu</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  updateGroupSession({ ...session, status: 'UPCOMING' });
                                  setZoomNotice(`Jadwal "${session.title}" dijadwalkan ulang sebagai Akan Datang.`);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Jadwalkan Lagi</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditSessionModal(session)}
                              className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit Jadwal</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteGroupSession(session.id);
                                setZoomNotice(`Jadwal Zoom "${session.title}" berhasil dihapus.`);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= 11. HASIL UJIAN (CARI, FILTER, RANGKING & EKSPOR) ================= */}
      {currentAdminTab === 'admin-results' && (() => {
        const filteredResults = results
          .filter(r => {
            if (resExamTypeFilter !== 'ALL' && r.exam_type !== resExamTypeFilter) return false;
            if (resCategoryFilter !== 'ALL') {
              if (r.category && r.category !== resCategoryFilter) return false;
              if (!r.category) {
                const titleUpper = r.exam_title.toUpperCase();
                if (!titleUpper.includes(resCategoryFilter)) return false;
              }
            }
            if (resPassFilter !== 'ALL' && r.pass_status !== resPassFilter) return false;
            if (resSearch.trim()) {
              const q = resSearch.toLowerCase();
              return (
                r.user_name.toLowerCase().includes(q) ||
                r.exam_title.toLowerCase().includes(q) ||
                r.id.toLowerCase().includes(q)
              );
            }
            return true;
          })
          .sort((a, b) => {
            if (resRankSort === 'LATEST_DESC') {
              return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
            }
            if (resRankSort === 'TWK_DESC') return b.twk_score - a.twk_score || b.total_score - a.total_score;
            if (resRankSort === 'TIU_DESC') return b.tiu_score - a.tiu_score || b.total_score - a.total_score;
            if (resRankSort === 'TKP_DESC') return b.tkp_score - a.tkp_score || b.total_score - a.total_score;
            if (resRankSort === 'TIME_ASC') return a.duration_seconds - b.duration_seconds;
            return b.total_score - a.total_score || a.duration_seconds - b.duration_seconds;
          });

        const avgScore =
          filteredResults.length > 0
            ? Math.round(filteredResults.reduce((sum, r) => sum + r.total_score, 0) / filteredResults.length)
            : 0;
        const passCount = filteredResults.filter(r => r.pass_status === 'MEMENUHI_AMBANG_BATAS').length;
        const topScore = filteredResults.reduce((max, r) => Math.max(max, r.total_score), 0);

        const resExportHeaders = [
          'Rank',
          'Tanggal',
          'Nama Peserta',
          'Nama Ujian',
          'Jenis Ujian',
          'TWK',
          'TIU',
          'TKP',
          'Total Nilai',
          'Status PG',
          'Durasi'
        ];
        const resExportRows = filteredResults.map((r, idx) => [
          idx + 1,
          new Date(r.completed_at).toLocaleDateString('id-ID'),
          r.user_name,
          r.exam_title,
          r.exam_type,
          r.twk_score,
          r.tiu_score,
          r.tkp_score,
          r.total_score,
          r.pass_status === 'MEMENUHI_AMBANG_BATAS' ? 'LULUS PG' : 'TIDAK LULUS',
          `${Math.floor(r.duration_seconds / 60)}m ${r.duration_seconds % 60}s`
        ]);

        return (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Laporan &amp; Peringkat Hasil Ujian Peserta ({filteredResults.length} / {results.length} Rekaman)
                </h2>
                <p className="text-xs text-slate-500">
                  Cari peserta, filter jenis ujian &amp; kategori soal, urutkan peringkat nilai tertinggi, serta ekspor ke Excel, Word, PDF, atau CSV.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {renderPaperAndOrientationControls(resExportHeaders, resExportRows)}
                {(() => {
                  const pgRes = settings.default_passing_grade;
                  const resSummary = [
                    { label: 'Total Rekaman', value: `${filteredResults.length} Ujian` },
                    { label: 'Skor Tertinggi', value: `${topScore}` },
                    { label: 'Rata-rata Nilai', value: `${avgScore}` },
                    {
                      label: 'Lulus PG',
                      value: `${passCount} (${
                        filteredResults.length > 0
                          ? Math.round((passCount / filteredResults.length) * 100)
                          : 0
                      }%)`
                    }
                  ];
                  const resDetailRows: ReportDetailItem[] = [
                    {
                      label: 'Filter Jenis Ujian',
                      value: resExamTypeFilter === 'ALL' ? 'Semua Jenis Ujian' : resExamTypeFilter
                    },
                    {
                      label: 'Filter Kategori Soal',
                      value: resCategoryFilter === 'ALL' ? 'Semua Kategori (TWK / TIU / TKP)' : resCategoryFilter
                    },
                    {
                      label: 'Ambang Batas (PG)',
                      value: `TWK ≥ ${pgRes.twk} · TIU ≥ ${pgRes.tiu} · TKP ≥ ${pgRes.tkp}`
                    },
                    {
                      label: 'Tanggal Laporan',
                      value: new Date().toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                    }
                  ];
                  return (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          void exportTableToExcel(
                            `Hasil_Ujian_LOGINCPNS_${new Date().toISOString().slice(0, 10)}.xlsx`,
                            'Hasil Ujian CPNS',
                            resExportHeaders,
                            resExportRows,
                            {
                              orientation: reportOrientation,
                              paperSize: reportPaperSize,
                              title: 'Rekapitulasi & Peringkat Hasil Ujian Peserta',
                              subtitle: `Total Rekaman: ${filteredResults.length} · Lulus PG: ${passCount} Peserta`,
                              summaryCards: resSummary,
                              detailRows: resDetailRows,
                              brandInfo: officialBrandInfo
                            }
                          )
                        }
                        className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Excel (.xlsx)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void exportTableToWord(
                            `Hasil_Ujian_LOGINCPNS_${new Date().toISOString().slice(0, 10)}.doc`,
                            'Rekapitulasi & Peringkat Hasil Ujian Peserta',
                            `Total Rekaman: ${filteredResults.length} · Lulus PG: ${passCount} Peserta`,
                            resExportHeaders,
                            resExportRows,
                            {
                              orientation: reportOrientation,
                              paperSize: reportPaperSize,
                              summaryCards: resSummary,
                              detailRows: resDetailRows,
                              brandInfo: officialBrandInfo
                            }
                          )
                        }
                        className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Word (.doc)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void exportTableToPdf(
                            `Hasil_Ujian_LOGINCPNS_${new Date().toISOString().slice(0, 10)}.pdf`,
                            'Rekapitulasi & Peringkat Hasil Ujian Peserta',
                            `Total Rekaman: ${filteredResults.length} · Lulus PG: ${passCount} Peserta`,
                            resExportHeaders,
                            resExportRows,
                            {
                              orientation: reportOrientation,
                              paperSize: reportPaperSize,
                              summaryCards: resSummary,
                              detailRows: resDetailRows,
                              brandInfo: officialBrandInfo
                            }
                          )
                        }
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>PDF (.pdf)</span>
                      </button>
                    </>
                  );
                })()}
                <button
                  type="button"
                  onClick={() => handleExportResultsCSV(filteredResults)}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Summary KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 truncate">Data Tersaring</span>
                <span className="text-base sm:text-lg font-extrabold font-mono tabular-nums text-slate-900 shrink-0">{filteredResults.length}</span>
              </div>
              <div className="px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-semibold text-blue-700 truncate">Skor Tertinggi</span>
                <span className="text-base sm:text-lg font-extrabold font-mono tabular-nums text-blue-800 shrink-0">{topScore}</span>
              </div>
              <div className="px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-semibold text-indigo-700 truncate">Rata-rata</span>
                <span className="text-base sm:text-lg font-extrabold font-mono tabular-nums text-indigo-800 shrink-0">{avgScore}</span>
              </div>
              <div className="px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 truncate">Lulus PG</span>
                <span className="text-base sm:text-lg font-extrabold font-mono tabular-nums text-emerald-800 shrink-0">
                  {passCount}{' '}
                  <span className="text-[10px] sm:text-xs font-bold">
                    ({filteredResults.length > 0 ? Math.round((passCount / filteredResults.length) * 100) : 0}%)
                  </span>
                </span>
              </div>
            </div>

            {/* Search, Filter & Ranking Controls */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={resSearch}
                  onChange={e => setResSearch(e.target.value)}
                  placeholder="Cari nama peserta atau judul ujian..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <select
                aria-label="Filter jenis ujian hasil"
                value={resExamTypeFilter}
                onChange={e => setResExamTypeFilter(e.target.value as 'ALL' | ExamType)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="ALL">Semua Jenis Ujian</option>
                <option value="TRYOUT_SKD_LENGKAP">Tryout SKD Lengkap</option>
                <option value="TRYOUT_BERSAMA">Tryout Bersama</option>
                <option value="TRYOUT_KATEGORI">Tryout Kategori</option>
                <option value="LATIHAN_HARIAN">Latihan Harian</option>
              </select>

              <select
                aria-label="Filter kategori soal hasil"
                value={resCategoryFilter}
                onChange={e => setResCategoryFilter(e.target.value as 'ALL' | QuestionCategory)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="ALL">Semua Kategori (TWK/TIU/TKP)</option>
                <option value="TWK">TWK</option>
                <option value="TIU">TIU</option>
                <option value="TKP">TKP</option>
              </select>

              <select
                aria-label="Filter kelulusan hasil"
                value={resPassFilter}
                onChange={e =>
                  setResPassFilter(e.target.value as 'ALL' | 'MEMENUHI_AMBANG_BATAS' | 'BELUM_MEMENUHI')
                }
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="ALL">Semua Status PG</option>
                <option value="MEMENUHI_AMBANG_BATAS">Lulus Passing Grade</option>
                <option value="BELUM_MEMENUHI">Belum Lulus PG</option>
              </select>

              <select
                aria-label="Urutkan peringkat hasil ujian"
                value={resRankSort}
                onChange={e => setResRankSort(e.target.value as typeof resRankSort)}
                className="px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-blue-800"
              >
                <option value="SCORE_DESC">Ranking: Total Tertinggi</option>
                <option value="TWK_DESC">Ranking: TWK Tertinggi</option>
                <option value="TIU_DESC">Ranking: TIU Tertinggi</option>
                <option value="TKP_DESC">Ranking: TKP Tertinggi</option>
                <option value="TIME_ASC">Ranking: Waktu Tercepat</option>
                <option value="LATEST_DESC">Urutkan: Terbaru</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Nama Peserta</th>
                    <th className="py-2.5 px-3">Nama Ujian &amp; Jenis</th>
                    <th className="py-2.5 px-3 font-mono">TWK</th>
                    <th className="py-2.5 px-3 font-mono">TIU</th>
                    <th className="py-2.5 px-3 font-mono">TKP</th>
                    <th className="py-2.5 px-3 font-mono font-bold">Total Nilai</th>
                    <th className="py-2.5 px-3">Durasi</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500">
                        Tidak ada data hasil ujian yang cocok dengan pencarian/filter.
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((r, idx) => (
                      <tr key={r.id} className={resRankSort !== 'LATEST_DESC' && idx < 3 ? 'bg-amber-50/30' : ''}>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-bold ${
                              resRankSort !== 'LATEST_DESC' && idx === 0
                                ? 'bg-amber-400 text-amber-950'
                                : resRankSort !== 'LATEST_DESC' && idx === 1
                                ? 'bg-slate-300 text-slate-800'
                                : resRankSort !== 'LATEST_DESC' && idx === 2
                                ? 'bg-amber-600/30 text-amber-900'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {new Date(r.completed_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{r.user_name}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800">{r.exam_title}</div>
                          <span className="text-[10px] text-slate-500">{r.exam_type}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-blue-700">{r.twk_score}</td>
                        <td className="py-2.5 px-3 font-mono text-sky-700">{r.tiu_score}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-700">{r.tkp_score}</td>
                        <td className="py-2.5 px-3 font-mono font-extrabold text-slate-900">{r.total_score}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {Math.floor(r.duration_seconds / 60)}m {r.duration_seconds % 60}s
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              r.pass_status === 'MEMENUHI_AMBANG_BATAS'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {r.pass_status === 'MEMENUHI_AMBANG_BATAS' ? 'LULUS PG' : 'TIDAK LULUS'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* ================= 12. PENGATURAN UJIAN & KALKULATOR SKD ================= */}
      {currentAdminTab === 'admin-exam-settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Kartu A: Passing Grade Dinamis */}
          <div className="lg:col-span-5 p-4 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-700" />
                <span>Pengaturan Ambang Batas (Passing Grade)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Nilai passing grade dinamis yang diterapkan pada seluruh ujian CAT SKD dan pengecekan kelulusan di Kalkulator.
              </p>
            </div>

            {pgSaveNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{pgSaveNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPgSaveNotice('')}
                  className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSavePassingGrade} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Dasar Regulasi / Tahun Seleksi</label>
                <input
                  type="text"
                  value={regInfo}
                  onChange={e => setRegInfo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-blue-800">Min TWK</label>
                  <input
                    type="number"
                    value={twkPG}
                    onChange={e => setTwkPG(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-blue-700"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-sky-800">Min TIU</label>
                  <input
                    type="number"
                    value={tiuPG}
                    onChange={e => setTiuPG(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-sky-700"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-emerald-800">Min TKP</label>
                  <input
                    type="number"
                    value={tkpPG}
                    onChange={e => setTkpPG(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-semibold">Total Minimal Lulus PG (TWK+TIU+TKP):</span>
                <span className="font-mono font-extrabold text-slate-900">
                  {Number(twkPG || 0) + Number(tiuPG || 0) + Number(tkpPG || 0)} Poin
                </span>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Simpan &amp; Terapkan ke Seluruh Ujian
                </button>
              </div>
            </form>
          </div>

          {/* Kartu B: Pengaturan Kalkulator SKD & Integrasi Try Out 110 Soal */}
          <div className="lg:col-span-7 p-4 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-indigo-700" />
                  <span>Pengaturan Kalkulator SKD &amp; SKB</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atur bobot integrasi SKD/SKB, skala nilai maksimal, hak akses paket, serta tombol kirim otomatis hasil Try Out 110 Soal ke Kalkulator untuk member Intensif.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetSkdCalculatorDefault}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Standar 40/60</span>
              </button>
            </div>

            {calcSaveNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{calcSaveNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCalcSaveNotice('')}
                  className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSaveSkdCalculatorConfig} className="space-y-4 text-xs">
              {/* Toggle Aktivasi & Integrasi 110 Soal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={calcEnabled}
                    onChange={e => setCalcEnabled(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-indigo-700 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Aktifkan Kalkulator SKD &amp; SKB</span>
                    <span className="text-[11px] text-slate-500">
                      Menampilkan kalkulator interaktif bagi peserta sesuai hak akses paket.
                    </span>
                  </div>
                </label>

                <label className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={calcAutoImport110}
                    onChange={e => setCalcAutoImport110(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-indigo-700 rounded"
                  />
                  <div>
                    <span className="font-bold text-indigo-950 block">
                      Tombol Hitung di Hasil Try Out 110 Soal
                    </span>
                    <span className="text-[11px] text-indigo-800/80">
                      Member Intensif dapat klik tombol pada hasil Try Out 110 Soal agar nilai TWK, TIU, TKP langsung masuk ke Kalkulator.
                    </span>
                  </div>
                </label>
              </div>

              {/* Hak Akses & Bobot Integrasi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1 space-y-1">
                  <label className="font-bold text-slate-700 block">Hak Akses Paket Kalkulator</label>
                  <select
                    value={calcAccessTier}
                    onChange={e => setCalcAccessTier(e.target.value as SkdCalculatorConfig['access_tier'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900"
                  >
                    <option value="INTENSIF_ONLY">Khusus Paket Intensif Bimbel</option>
                    <option value="PREMIUM_AND_INTENSIF">Paket Premium &amp; Intensif</option>
                    <option value="ALL_PAID">Semua Paket Berbayar</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-blue-800 block">Bobot SKD (%)</label>
                  <input
                    type="number"
                    min={10}
                    max={90}
                    value={calcSkdWeight}
                    onChange={e => {
                      const val = Math.max(10, Math.min(90, Number(e.target.value) || 0));
                      setCalcSkdWeight(val);
                      setCalcSkbWeight(100 - val);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-blue-700"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-emerald-800 block">Bobot SKB (% Otomatis)</label>
                  <input
                    type="number"
                    min={10}
                    max={90}
                    value={calcSkbWeight}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              {/* Skala Maksimal Komponen */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Skala Skor Maksimal Komponen SKD &amp; SKB</span>
                  <span className="font-mono font-extrabold text-indigo-700 text-[11px]">
                    Total Maks SKD: {Number(calcMaxTwk || 0) + Number(calcMaxTiu || 0) + Number(calcMaxTkp || 0)}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 text-[11px]">Maks TWK</label>
                    <input
                      type="number"
                      min={50}
                      max={300}
                      value={calcMaxTwk}
                      onChange={e => setCalcMaxTwk(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-blue-700"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 text-[11px]">Maks TIU</label>
                    <input
                      type="number"
                      min={50}
                      max={300}
                      value={calcMaxTiu}
                      onChange={e => setCalcMaxTiu(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-sky-700"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 text-[11px]">Maks TKP</label>
                    <input
                      type="number"
                      min={50}
                      max={350}
                      value={calcMaxTkp}
                      onChange={e => setCalcMaxTkp(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 text-[11px]">Maks SKB CAT</label>
                    <input
                      type="number"
                      min={100}
                      max={1000}
                      value={calcMaxSkbCat}
                      onChange={e => setCalcMaxSkbCat(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-indigo-700"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Default Pesaing & Catatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Default Skor SKD Pesaing (Simulasi)</label>
                  <input
                    type="number"
                    min={0}
                    max={Number(calcMaxTwk || 0) + Number(calcMaxTiu || 0) + Number(calcMaxTkp || 0)}
                    value={calcCompSkd}
                    onChange={e => setCalcCompSkd(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Default Est. SKB Pesaing (/100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={calcCompSkb}
                    onChange={e => setCalcCompSkb(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Catatan / Arahan di Halaman Kalkulator SKD</label>
                <textarea
                  rows={2}
                  value={calcNote}
                  onChange={e => setCalcNote(e.target.value)}
                  placeholder="Contoh: Gunakan skor Try Out SKD 110 Soal untuk konsultasi formasi..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500">
                  Rumus Aktif: (SKD/{Number(calcMaxTwk || 0) + Number(calcMaxTiu || 0) + Number(calcMaxTkp || 0)} &times; {calcSkdWeight}%) + (SKB &times; {calcSkbWeight}%)
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Pengaturan Kalkulator SKD</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 13. PENGATURAN PENGUMUMAN ADMIN ================= */}
      {currentAdminTab === 'admin-announcements' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-700" />
                <span>Pengaturan Pengumuman Admin ({announcements.length} Berita)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola berita &amp; pengumuman resmi untuk peserta (Jadwal Pendaftaran CPNS, Gangguan Jaringan/Maintenance, Info Tryout, dll). Di dashboard peserta akan tampil garis besarnya beserta tombol <strong>Baca Selengkapnya</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenNewAnnouncement}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-extrabold rounded-xl shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Pengumuman Baru</span>
            </button>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                Belum ada pengumuman yang dibuat. Klik tombol &quot;Buat Pengumuman Baru&quot; untuk mempublikasikan informasi ke dashboard peserta.
              </div>
            ) : (
              announcements.map(ann => {
                const catLabel =
                  ann.category === 'JADWAL_CPNS'
                    ? 'Jadwal Resmi'
                    : ann.category === 'MAINTENANCE'
                    ? 'Gangguan / Maintenance'
                    : ann.category === 'TRYOUT'
                    ? 'Info Tryout'
                    : 'Berita & Info';
                const catClass =
                  ann.category === 'MAINTENANCE'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : ann.category === 'JADWAL_CPNS'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : ann.category === 'TRYOUT'
                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                    : 'bg-sky-100 text-sky-800 border-sky-200';

                return (
                  <div
                    key={ann.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                      ann.is_active ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-100/70 border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="space-y-1.5 text-xs flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${catClass}`}>
                          {catLabel}
                        </span>
                        {ann.is_pinned && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                            <Pin className="w-3 h-3" />
                            Disematkan
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            ann.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-200 text-slate-600 border-slate-300'
                          }`}
                        >
                          {ann.is_active ? 'TAYANG KE PESERTA' : 'DISEMBUNYIKAN (DRAFT)'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(ann.updated_at || ann.created_at).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-sm text-slate-900">{ann.title}</h3>
                      <p className="text-slate-600 leading-relaxed">
                        <strong className="text-slate-700">Garis Besar:</strong> {ann.summary}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 whitespace-pre-line bg-white p-2.5 rounded-lg border border-slate-200">
                        {ann.content}
                      </p>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0 text-xs">
                      <button
                        type="button"
                        onClick={() => handleOpenEditAnnouncement(ann)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit / Update</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateAnnouncement({ ...ann, is_active: !ann.is_active })
                        }
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        {ann.is_active ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                            <span>Sembunyikan</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tayangkan</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDeleteConfirmDialog({
                            title: 'Hapus Pengumuman?',
                            message: `Pengumuman "${ann.title}" akan dihapus permanen dari halaman informasi peserta.`,
                            confirmLabel: 'Ya, Hapus Pengumuman',
                            onConfirm: () => deleteAnnouncement(ann.id)
                          });
                        }}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================= 14. PENGATURAN APLIKASI ================= */}
      {currentAdminTab === 'admin-app-settings' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Pengaturan Aplikasi &amp; Kontak Admin
              </h2>
              <p className="text-xs text-slate-500">
                Kelola headline landing page, nomor WhatsApp Admin, dan akses cepat ke Pengumuman Admin.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('admin-announcements')}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              <span>Kelola Pengumuman Admin &rarr;</span>
            </button>
          </div>

          <form onSubmit={handleSaveAppSettings} className="space-y-6 text-xs">
            {settingsSavedNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{settingsSavedNotice}</span>
              </div>
            )}

            <div className="space-y-4 max-w-lg">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Headline Aplikasi</label>
                <input
                  type="text"
                  value={appHeadline}
                  onChange={e => setAppHeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email Resmi Pengirim Notifikasi Transaksi</label>
                <input
                  type="email"
                  value={appEmail}
                  onChange={e => setAppEmail(e.target.value)}
                  placeholder="loginbimbelasn@gmail.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-blue-800"
                  required
                />
                <p className="text-[11px] text-slate-500">
                  Digunakan sebagai identitas pengirim resmi pada log email transaksi peserta &amp; mitra.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nomor WhatsApp Admin</label>
                <input
                  type="text"
                  value={appWhatsapp}
                  onChange={e => setAppWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  required
                />
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lockMaterialsForPremiumOnly}
                  onChange={e => setLockMaterialsForPremiumOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <div>
                  <span className="font-bold text-slate-800 block">
                    Kunci Materi Belajar Hanya Untuk Premium &amp; Intensif (Bukan Standar)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Peserta Paket Standar tidak dapat mengakses modul materi PDF, Google Drive, &amp; Short Video.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={standarQuestionsOnly}
                  onChange={e => setStandarQuestionsOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <div>
                  <span className="font-bold text-slate-800 block">
                    Aktifkan Paket Standar Hanya Untuk Soal Saja
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Menonaktifkan menu berbayar (Materi, Zoom, Kalkulator) pada akun Paket Standar dan mengarahkannya ke upgrade.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={appMaintenance}
                  onChange={e => setAppMaintenance(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Status Mode Maintenance</span>
                  <span className="text-[11px] text-slate-500">
                    Tandai bila sistem sedang dalam pemeliharaan jaringan.
                  </span>
                </div>
              </label>
            </div>

            {/* Pengaturan Rekening Bank, E-Wallet Non-Tunai (DANA, OVO, dll) & Upload Gambar QR Code */}
            <div className="pt-5 border-t border-slate-200 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-700" />
                    <span>Pengaturan Rekening, QR Code &amp; Media Pembayaran Paket Belajar</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tambah, edit, atau hapus rekening bank, akun non-tunai (DANA, OVO, GoPay, No. HP), serta gambar QR Code. Setiap perubahan otomatis tersinkron ke menu <strong>7. Paket Belajar</strong> peserta.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openAddPaymentChannel('BANK')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Metode Pembayaran</span>
                  </button>
                </div>
              </div>

              {paymentSettingsError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{paymentSettingsError}</span>
                </div>
              )}

              {/* Ringkasan QRIS Utama & Nomor HP Non-Tunai */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Upload Gambar QR Code Utama */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-sky-700" />
                        <span>Upload Gambar QR Code (QRIS Pembayaran)</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Gambar QRIS ini tampil langsung di tab <strong>QRIS / Scan QR</strong> pada halaman checkout peserta.
                      </p>
                    </div>
                  </div>

                  {qrisImageUrl ? (
                    <div className="space-y-3">
                      <div
                        onClick={() =>
                          setTutorialPreviewModal({
                            url: qrisImageUrl,
                            title: qrisMerchantName || 'Pratinjau Gambar QR Code Pembayaran'
                          })
                        }
                        className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white cursor-zoom-in flex items-center justify-center p-3"
                      >
                        <img
                          src={qrisImageUrl}
                          alt="QR Code Pembayaran"
                          className="max-h-52 w-auto object-contain"
                        />
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-slate-900/75 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                          <ZoomIn className="w-3 h-3" />
                          <span>Perbesar</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Ganti Gambar QR</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleUploadMainQris}
                            className="hidden"
                            disabled={isProcessingQrMedia}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setQrisImageUrl('');
                            updateSettings({ qris_image_url: '' });
                            setSettingsSavedNotice('Gambar QR Code QRIS dihapus.');
                            setTimeout(() => setSettingsSavedNotice(''), 3000);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus QR</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/40 transition-colors cursor-pointer text-center">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">
                          {isProcessingQrMedia ? 'Memproses QR...' : 'Klik untuk Upload Gambar QR Code'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          JPG, PNG, atau WEBP (otomatis dikompres agar tajam &amp; ringan)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleUploadMainQris}
                        className="hidden"
                        disabled={isProcessingQrMedia}
                      />
                    </label>
                  )}

                  <div className="space-y-2 pt-1">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nama Merchant / Judul QRIS</label>
                      <input
                        type="text"
                        value={qrisMerchantName}
                        onChange={e => setQrisMerchantName(e.target.value)}
                        placeholder="Contoh: QRIS LOGIN CPNS EDUKASI"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Keterangan Pembayaran QRIS</label>
                      <input
                        type="text"
                        value={qrisNotes}
                        onChange={e => setQrisNotes(e.target.value)}
                        placeholder="Mendukung GoPay, OVO, DANA, ShopeePay, Mobile Banking"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Nomor HP Non-Tunai Utama & Akses Cepat Tambah Media */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-emerald-700" />
                        <span>Nomor HP Utama Non-Tunai &amp; Konfirmasi Pembayaran</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Digunakan sebagai nomor tujuan utama non-tunai (DANA/OVO/GoPay) serta kontak konfirmasi WhatsApp pada tab Tunai/COD di panel peserta.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">No. HP Non-Tunai / E-Wallet Utama</label>
                      <input
                        type="text"
                        value={nonCashPhone}
                        onChange={e => setNonCashPhone(e.target.value)}
                        placeholder="Contoh: 081312139893"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-emerald-800"
                      />
                      <p className="text-[10px] text-slate-500">
                        Klik <strong>Simpan Pengaturan Aplikasi</strong> di bawah setelah mengubah nomor ini atau teks QRIS.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                      <p className="font-bold text-slate-800 text-[11px]">
                        Tambah Cepat Media Pembayaran Baru:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openAddPaymentChannel('BANK')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-[11px] cursor-pointer"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>+ Rekening Bank</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openAddPaymentChannel('EWALLET')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>+ E-Wallet (DANA / OVO / GoPay)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openAddPaymentChannel('QRIS')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-[11px] cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>+ QR Code Tambahan</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900">
                    Saat ini terdapat <strong>{paymentChannels.filter(c => c.is_active).length} metode aktif</strong> dari total <strong>{paymentChannels.length} metode pembayaran</strong> yang terhubung ke halaman Paket Belajar peserta.
                  </div>
                </div>
              </div>

              {/* Daftar Semua Metode Pembayaran (Tambah / Edit / Hapus / Aktifkan) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-extrabold text-slate-800 text-xs">
                    Daftar Rekening, E-Wallet Non-Tunai &amp; Metode Pembayaran ({paymentChannels.length})
                  </p>
                </div>

                {paymentChannels.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-slate-500">
                    Belum ada metode pembayaran ditambahkan. Klik <strong>Tambah Metode Pembayaran</strong> untuk menambahkan Rekening Bank, DANA, OVO, atau QRIS.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {paymentChannels.map(ch => (
                      <div
                        key={ch.id}
                        className={`p-4 rounded-xl border transition-colors flex flex-col justify-between gap-3 ${
                          ch.is_active
                            ? 'bg-white border-slate-200 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                                  ch.category === 'BANK'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : ch.category === 'EWALLET'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : ch.category === 'QRIS'
                                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                {ch.category === 'BANK'
                                  ? 'Rekening Bank'
                                  : ch.category === 'EWALLET'
                                  ? 'Non-Tunai / E-Wallet'
                                  : ch.category === 'QRIS'
                                  ? 'QRIS / QR Code'
                                  : 'Tunai / COD WA'}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  ch.is_active
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {ch.is_active ? 'Aktif di Peserta' : 'Disembunyikan'}
                              </span>
                            </div>

                            <h4 className="font-extrabold text-sm text-slate-900 truncate">
                              {ch.provider_name}
                            </h4>
                            <p className="font-mono font-extrabold text-blue-700 text-sm tracking-wide">
                              {ch.account_number}
                            </p>
                            <p className="text-[11px] text-slate-600">
                              a.n. <strong className="text-slate-800">{ch.account_holder}</strong>
                            </p>
                            {ch.instructions && (
                              <p className="text-[11px] text-slate-500 leading-snug pt-0.5">
                                {ch.instructions}
                              </p>
                            )}
                          </div>

                          {ch.qr_image_url && (
                            <button
                              type="button"
                              onClick={() =>
                                setTutorialPreviewModal({
                                  url: ch.qr_image_url!,
                                  title: `QR Code - ${ch.provider_name}`
                                })
                              }
                              className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-50 p-1 shrink-0 cursor-zoom-in hover:border-blue-400"
                              title="Klik untuk perbesar QR Code"
                            >
                              <img
                                src={ch.qr_image_url}
                                alt={`QR ${ch.provider_name}`}
                                className="w-full h-full object-contain"
                              />
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleTogglePaymentChannelActive(ch.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                              ch.is_active
                                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {ch.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditPaymentChannel(ch)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-[11px] cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePaymentChannel(ch.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-[11px] cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pengaturan Upload Gambar Poster & Gambar Tutorial Instal Aplikasi (HP / Tablet) */}
            <div className="pt-4 border-t border-slate-200 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-700" />
                    <span>Gambar Tutorial &amp; Poster Panduan Instal Aplikasi di HP / Tablet</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Upload gambar poster tutorial dan gambar langkah tutorial agar tampil di menu <strong>9. Panduan Instal Aplikasi di HP</strong> peserta.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView('panduan-instal')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer self-start sm:self-auto"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Halaman Panduan</span>
                </button>
              </div>

              {tutorialUploadError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{tutorialUploadError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* 1. Upload Gambar Poster Tutorial */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">
                        1. Upload Gambar Poster Tutorial
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Poster utama panduan instalasi aplikasi (format JPG, PNG, atau WEBP).
                      </p>
                    </div>
                  </div>

                  {installPosterUrl ? (
                    <div className="space-y-2.5">
                      <div
                        onClick={() =>
                          setTutorialPreviewModal({
                            url: installPosterUrl,
                            title: 'Pratinjau Gambar Poster Tutorial'
                          })
                        }
                        className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white cursor-zoom-in"
                      >
                        <img
                          src={installPosterUrl}
                          alt="Poster Tutorial"
                          className="w-full h-52 object-contain p-2"
                        />
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-slate-900/75 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                          <ZoomIn className="w-3 h-3" />
                          <span>Perbesar</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Ganti Poster</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleUploadTutorialPoster}
                            className="hidden"
                            disabled={isProcessingTutorialMedia}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setInstallPosterUrl('')}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Poster</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/40 transition-colors cursor-pointer text-center">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">
                          {isProcessingTutorialMedia ? 'Memproses gambar...' : 'Klik untuk Upload Poster Tutorial'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          JPG, PNG, atau WEBP (otomatis dikompres agar cepat dimuat)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleUploadTutorialPoster}
                        className="hidden"
                        disabled={isProcessingTutorialMedia}
                      />
                    </label>
                  )}
                </div>

                {/* 2. Upload Gambar Tutorial Langkah Demi Langkah */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs">
                      2. Upload Gambar Tutorial ({installTutorialImages.length} Gambar)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Tambahkan screenshot atau gambar langkah instalasi dari Chrome HP/Tablet (bisa pilih beberapa gambar sekaligus).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newTutorialTitle}
                      onChange={e => setNewTutorialTitle(e.target.value)}
                      placeholder="Judul langkah (opsional, cth: Ketuk Titik Tiga)"
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg font-medium"
                    />
                    <input
                      type="text"
                      value={newTutorialCaption}
                      onChange={e => setNewTutorialCaption(e.target.value)}
                      placeholder="Keterangan singkat (opsional)"
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg font-medium"
                    />
                  </div>

                  <label className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/40 transition-colors cursor-pointer text-center">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        {isProcessingTutorialMedia ? 'Memproses gambar...' : 'Pilih / Upload Gambar Tutorial'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Bisa pilih 1 atau beberapa file gambar sekaligus
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      onChange={handleUploadTutorialImages}
                      className="hidden"
                      disabled={isProcessingTutorialMedia}
                    />
                  </label>
                </div>
              </div>

              {/* Daftar Gambar Tutorial yang Sudah Diupload */}
              {installTutorialImages.length > 0 && (
                <div className="space-y-3">
                  <p className="font-bold text-slate-800">
                    Daftar Gambar Tutorial Tersimpan ({installTutorialImages.length}):
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {installTutorialImages.map((imgItem, idx) => (
                      <div
                        key={imgItem.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 flex flex-col"
                      >
                        <div
                          onClick={() =>
                            setTutorialPreviewModal({
                              url: imgItem.image_url,
                              title: imgItem.title || `Gambar Tutorial ${idx + 1}`
                            })
                          }
                          className="relative rounded-lg overflow-hidden border border-slate-200 bg-white h-40 cursor-zoom-in flex items-center justify-center"
                        >
                          <img
                            src={imgItem.image_url}
                            alt={imgItem.title}
                            className="w-full h-full object-contain p-1.5"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/75 text-white text-[10px] font-bold">
                            #{idx + 1}
                          </span>
                        </div>

                        <div className="space-y-1.5 flex-1">
                          <input
                            type="text"
                            value={imgItem.title}
                            onChange={e => {
                              const val = e.target.value;
                              setInstallTutorialImages(prev =>
                                prev.map(it => (it.id === imgItem.id ? { ...it, title: val } : it))
                              );
                            }}
                            placeholder={`Langkah ${idx + 1}`}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                          />
                          <input
                            type="text"
                            value={imgItem.caption || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setInstallTutorialImages(prev =>
                                prev.map(it => (it.id === imgItem.id ? { ...it, caption: val } : it))
                              );
                            }}
                            placeholder="Keterangan langkah (opsional)"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-600"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveTutorialImage(idx, -1)}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                              title="Geser Naik"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === installTutorialImages.length - 1}
                              onClick={() => handleMoveTutorialImage(idx, 1)}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                              title="Geser Turun"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setInstallTutorialImages(prev =>
                                prev.filter(it => it.id !== imgItem.id)
                              )
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Aplikasi</span>
              </button>
              <span className="text-[11px] text-slate-500">
                Jangan lupa klik <strong>Simpan Pengaturan Aplikasi</strong> setelah upload/ubah gambar poster atau tutorial.
              </span>
            </div>
          </form>

          {tutorialPreviewModal && (
            <div
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setTutorialPreviewModal(null)}
            >
              <div
                className="bg-white rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200"
                onClick={e => e.stopPropagation()}
              >
                <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {tutorialPreviewModal.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setTutorialPreviewModal(null)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 bg-slate-100 flex-1 overflow-auto flex items-center justify-center">
                  <img
                    src={tutorialPreviewModal.url}
                    alt={tutorialPreviewModal.title}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Tambah / Edit Metode Pembayaran (Rekening Bank, DANA, OVO, QRIS, COD) */}
          {isPaymentModalOpen && (
            <div
              className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              <div
                className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
                onClick={e => e.stopPropagation()}
              >
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {editingPayChannelId ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran Baru'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Otomatis muncul di menu 7. Paket Belajar peserta setelah disimpan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSavePaymentChannel} className="p-5 space-y-4 text-xs">
                  {paymentSettingsError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{paymentSettingsError}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Jenis Media Pembayaran</label>
                    <select
                      value={payChCategory}
                      onChange={e => setPayChCategory(e.target.value as PaymentChannelCategory)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800"
                    >
                      <option value="BANK">Transfer Bank (No. Rekening)</option>
                      <option value="EWALLET">Non-Tunai / E-Wallet (No. HP: DANA, OVO, GoPay, dll)</option>
                      <option value="QRIS">QRIS / Gambar QR Code Khusus</option>
                      <option value="COD">Tunai / COD via WhatsApp Admin</option>
                    </select>
                  </div>

                  {(payChCategory === 'BANK' || payChCategory === 'EWALLET') && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 block">Pilih Cepat Nama Media:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(payChCategory === 'BANK'
                          ? ['BSI (Bank Syariah Indonesia)', 'Bank BPD Aceh', 'BCA', 'BRI', 'Mandiri', 'BNI', 'SeaBank']
                          : ['DANA', 'OVO', 'GoPay', 'ShopeePay', 'LinkAja']
                        ).map(preset => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setPayChProvider(preset)}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                              payChProvider === preset
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      {payChCategory === 'BANK'
                        ? 'Nama Bank'
                        : payChCategory === 'EWALLET'
                        ? 'Nama E-Wallet / Aplikasi Non-Tunai'
                        : payChCategory === 'QRIS'
                        ? 'Nama QRIS / Merchant'
                        : 'Label Layanan COD / Tunai'}
                    </label>
                    <input
                      type="text"
                      value={payChProvider}
                      onChange={e => setPayChProvider(e.target.value)}
                      placeholder={
                        payChCategory === 'BANK'
                          ? 'Misal: BCA / BRI / Mandiri'
                          : payChCategory === 'EWALLET'
                          ? 'Misal: DANA / OVO / GoPay'
                          : payChCategory === 'QRIS'
                          ? 'Misal: QRIS Utama / QR DANA Bisnis'
                          : 'Misal: Tunai / COD WhatsApp Admin'
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">
                        {payChCategory === 'BANK'
                          ? 'Nomor Rekening'
                          : payChCategory === 'EWALLET'
                          ? 'Nomor HP Non-Tunai'
                          : payChCategory === 'COD'
                          ? 'Nomor WhatsApp Admin'
                          : 'ID Merchant / NMID (Opsional)'}
                      </label>
                      <input
                        type="text"
                        value={payChNumber}
                        onChange={e => setPayChNumber(e.target.value)}
                        placeholder={
                          payChCategory === 'BANK'
                            ? 'Contoh: 721506012'
                            : payChCategory === 'QRIS'
                            ? 'Contoh: ID1020304050'
                            : 'Contoh: 081312139893'
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-blue-800"
                        required={payChCategory !== 'QRIS'}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Atas Nama (Pemilik)</label>
                      <input
                        type="text"
                        value={payChHolder}
                        onChange={e => setPayChHolder(e.target.value)}
                        placeholder="Contoh: Syafrizal"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="font-bold text-slate-700 block">
                      Gambar QR Code ({payChCategory === 'QRIS' ? 'Disarankan' : 'Opsional'})
                    </label>
                    {payChQrUrl ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={payChQrUrl}
                          alt="QR Preview"
                          className="w-20 h-20 object-contain rounded-lg border border-slate-200 bg-white p-1"
                        />
                        <div className="flex flex-wrap gap-2">
                          <label className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer">
                            Ganti QR
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              onChange={handleUploadChannelQr}
                              className="hidden"
                              disabled={isProcessingQrMedia}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setPayChQrUrl('')}
                            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold cursor-pointer"
                          >
                            Hapus QR
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-slate-300 bg-white hover:border-blue-400 cursor-pointer text-slate-700 font-semibold">
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>{isProcessingQrMedia ? 'Memproses gambar...' : 'Upload Gambar QR Code (JPG/PNG)'}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleUploadChannelQr}
                          className="hidden"
                          disabled={isProcessingQrMedia}
                        />
                      </label>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Catatan / Petunjuk Pembayaran (Opsional)</label>
                    <input
                      type="text"
                      value={payChNotes}
                      onChange={e => setPayChNotes(e.target.value)}
                      placeholder="Contoh: Transfer sesuai nominal tagihan lalu unggah bukti screenshot."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
                    />
                  </div>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={payChActive}
                      onChange={e => setPayChActive(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span className="font-bold text-slate-800">Aktifkan &amp; tampilkan di panel peserta</span>
                  </label>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingPayChannelId ? 'Simpan Perubahan' : 'Simpan Metode Pembayaran'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 15. AUDIT LOG ================= */}
      {currentAdminTab === 'admin-audit-logs' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900">
              Audit Log Aktivitas Sistem ({auditLogs.length} Entri)
            </h2>
            <p className="text-xs text-slate-500">
              Rekaman riwayat perubahan konfigurasi, persetujuan transaksi, dan aktivitas pengujian.
            </p>
          </div>

          <div className="space-y-2">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">[{log.entity_type}]</span>
                  </div>
                  <p className="text-slate-700 mt-0.5">{log.details}</p>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-mono shrink-0 pl-3">
                  <div>{log.actor_name}</div>
                  <div>{new Date(log.created_at).toLocaleTimeString('id-ID')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proof Inspection Modal */}
      {viewingProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Pratinjau Bukti Transfer Pembayaran</h3>
              <button
                onClick={() => setViewingProofUrl(null)}
                className="px-2.5 py-1 rounded-lg hover:bg-slate-100 text-xs font-semibold text-slate-600 cursor-pointer"
              >
                Tutup
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-96">
              {viewingProofUrl.startsWith('data:application/pdf') || viewingProofUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={viewingProofUrl}
                  title="Bukti Transfer PDF"
                  className="w-full h-96 border-0"
                />
              ) : (
                <img src={viewingProofUrl} alt="Bukti Transfer" className="w-full max-h-96 object-contain mx-auto" />
              )}
            </div>
            <div className="flex justify-end">
              <a
                href={viewingProofUrl}
                download="Bukti_Transfer_LOGINCPNS"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh / Buka Bukti Asli</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit / Pick Existing Question Modal */}
      {isQuestionModalOpen && (() => {
        const targetPkgObj = practicePackages.find(p => p.id === qPackageId);
        const targetCurrentCount = targetPkgObj
          ? questions.filter(q => isQuestionInPackage(q, targetPkgObj)).length
          : 0;
        const pickFilteredQuestions = questions.filter(q => {
          if (pickCatFilter !== 'ALL' && q.category !== pickCatFilter) return false;
          if (pickSourcePkgFilter === 'GENERAL') {
            if (getQuestionPackageIds(q).length > 0 || q.package_title) return false;
          } else if (pickSourcePkgFilter !== 'ALL') {
            const srcPkg = practicePackages.find(p => p.id === pickSourcePkgFilter);
            if (srcPkg ? !isQuestionInPackage(q, srcPkg) : q.package_id !== pickSourcePkgFilter) {
              return false;
            }
          }
          if (pickHideAlreadyAssigned && targetPkgObj && isQuestionInPackage(q, targetPkgObj)) {
            return false;
          }
          if (pickSearch.trim()) {
            const s = pickSearch.trim().toLowerCase();
            const match =
              q.question_text.toLowerCase().includes(s) ||
              (q.topic || '').toLowerCase().includes(s) ||
              (q.package_title || '').toLowerCase().includes(s);
            if (!match) return false;
          }
          return true;
        });

        const selectableVisibleIds = pickFilteredQuestions.map(q => q.id);
        const allVisibleSelected =
          selectableVisibleIds.length > 0 &&
          selectableVisibleIds.every(id => pickSelectedIds.includes(id));

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center gap-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {editingQuestion
                      ? 'Edit Butir Soal'
                      : questionModalMode === 'PICK_EXISTING'
                      ? 'Ambil Soal dari Daftar Semua Butir Soal'
                      : 'Tambah Soal Baru ke Bank Soal'}
                  </h3>
                  {!editingQuestion && (
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Anda bisa menulis soal baru atau mengambil soal yang sudah ada dari Try Out Latihan / Bank Soal ke kotak tujuan (misal Try Out Full).
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 font-semibold text-xs px-2 py-1 rounded-lg hover:bg-slate-200/70"
                >
                  Batal
                </button>
              </div>

              {/* Mode Switcher when creating/adding to box */}
              {!editingQuestion && (
                <div className="px-5 pt-3.5 pb-1 bg-white border-b border-slate-100">
                  <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setQuestionModalMode('NEW')}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
                        questionModalMode === 'NEW'
                          ? 'bg-white text-blue-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tulis Soal Baru</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuestionModalMode('PICK_EXISTING')}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
                        questionModalMode === 'PICK_EXISTING'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ListPlus className="w-3.5 h-3.5" />
                      <span>Ambil dari Daftar Semua Butir Soal ({questions.length})</span>
                    </button>
                  </div>
                </div>
              )}

              {!editingQuestion && questionModalMode === 'PICK_EXISTING' ? (
                <div className="p-5 overflow-y-auto space-y-3.5 text-xs flex-1">
                  {/* Target Kotak Soal */}
                  <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="font-bold text-indigo-950">
                        Kotak / Paket Soal Tujuan (Misal: Try Out SKD Full)
                      </label>
                      {targetPkgObj && (
                        <span className="text-[11px] font-mono font-bold text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200">
                          Terisi: {targetCurrentCount} / {targetPkgObj.question_count} Soal
                        </span>
                      )}
                    </div>
                    <select
                      value={qPackageId}
                      onChange={e => {
                        const id = e.target.value;
                        setQPackageId(id);
                        const found = practicePackages.find(p => p.id === id);
                        setQPackageTitle(found ? found.title : '');
                      }}
                      className="w-full p-2.5 bg-white border border-indigo-300 rounded-lg font-bold text-indigo-900"
                    >
                      <option value="">-- Pilih Kotak / Paket Soal Tujuan --</option>
                      {practicePackages.map(pkg => {
                        const cnt = questions.filter(q => isQuestionInPackage(q, pkg)).length;
                        return (
                          <option key={pkg.id} value={pkg.id}>
                            [{pkg.category}] {pkg.title} ({cnt}/{pkg.question_count} Soal)
                          </option>
                        );
                      })}
                    </select>
                    <p className="text-[11px] text-indigo-800">
                      Soal yang diambil akan ikut masuk ke kotak tujuan ini <strong>tanpa menghapusnya</strong> dari kotak latihan/asalnya.
                    </p>
                  </div>

                  {/* Filter Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={pickSearch}
                        onChange={e => setPickSearch(e.target.value)}
                        placeholder="Cari pertanyaan atau topik..."
                        className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <select
                      value={pickCatFilter}
                      onChange={e => setPickCatFilter(e.target.value as 'ALL' | QuestionCategory)}
                      className="p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-700"
                    >
                      <option value="ALL">Semua Kategori (TWK/TIU/TKP)</option>
                      <option value="TWK">TWK</option>
                      <option value="TIU">TIU</option>
                      <option value="TKP">TKP</option>
                    </select>
                    <select
                      value={pickSourcePkgFilter}
                      onChange={e => setPickSourcePkgFilter(e.target.value)}
                      className="p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-700"
                    >
                      <option value="ALL">Semua Kotak Asal</option>
                      <option value="GENERAL">Soal Umum (Tanpa Kotak)</option>
                      {practicePackages.map(pkg => (
                        <option key={pkg.id} value={pkg.id}>
                          Asal: {pkg.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 py-1">
                    <label className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pickHideAlreadyAssigned}
                        onChange={e => setPickHideAlreadyAssigned(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600"
                      />
                      <span>Sembunyikan yang sudah ada di kotak tujuan</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (allVisibleSelected) {
                            const visibleSet = new Set(selectableVisibleIds);
                            setPickSelectedIds(prev => prev.filter(id => !visibleSet.has(id)));
                          } else {
                            setPickSelectedIds(prev => Array.from(new Set([...prev, ...selectableVisibleIds])));
                          }
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] cursor-pointer"
                      >
                        {allVisibleSelected ? 'Batal Pilih Semua Tampil' : `Pilih Semua Tampil (${selectableVisibleIds.length})`}
                      </button>
                      {pickSelectedIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setPickSelectedIds([])}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-bold text-[11px] cursor-pointer"
                        >
                          Reset ({pickSelectedIds.length})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Checklist Soal */}
                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-[38vh] overflow-y-auto">
                    {pickFilteredQuestions.length === 0 ? (
                      <div className="p-6 text-center text-slate-500">
                        Tidak ada butir soal yang cocok dengan filter pencarian.
                      </div>
                    ) : (
                      pickFilteredQuestions.map(q => {
                        const isChecked = pickSelectedIds.includes(q.id);
                        const alreadyInTarget = targetPkgObj ? isQuestionInPackage(q, targetPkgObj) : false;
                        const boxTitles = getQuestionPackageIds(q)
                          .map(id => practicePackages.find(p => p.id === id)?.title)
                          .filter(Boolean) as string[];

                        return (
                          <label
                            key={q.id}
                            className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
                              isChecked ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setPickSelectedIds(prev =>
                                  prev.includes(q.id)
                                    ? prev.filter(id => id !== q.id)
                                    : [...prev, q.id]
                                );
                              }}
                              className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 shrink-0"
                            />
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded font-mono font-bold bg-blue-100 text-blue-800 text-[10px]">
                                  {q.category}
                                </span>
                                <span className="font-bold text-slate-800 text-[11px]">
                                  {q.topic}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500">
                                  ({q.category === 'TKP' ? 'Bobot 1-5' : `Kunci: ${q.correct_answer}`})
                                </span>
                                {alreadyInTarget && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                    Sudah ada di kotak ini
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-700 text-xs leading-snug line-clamp-2">
                                {q.question_text}
                              </p>
                              {boxTitles.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                  {boxTitles.map((bt, idx) => (
                                    <span
                                      key={idx}
                                      className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px]"
                                    >
                                      {bt}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>

                  {/* Modal Footer for Pick Mode */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-600">
                      Dipilih: <strong className="text-indigo-700">{pickSelectedIds.length} butir soal</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsQuestionModalOpen(false)}
                        className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmPickQuestions}
                        disabled={!qPackageId || pickSelectedIds.length === 0}
                        className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl cursor-pointer"
                      >
                        Masukkan {pickSelectedIds.length} Soal ke Kotak Ini
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveQuestion} className="p-5 overflow-y-auto space-y-3.5 text-xs">
                  {/* Pilihan Judul Kotak / Paket Soal */}
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                    <label className="font-bold text-blue-950 block">
                      Pilih Kotak / Judul Paket Soal Utama (Tampil di Menu Peserta)
                    </label>
                    <select
                      value={qPackageId}
                      onChange={e => {
                        const id = e.target.value;
                        setQPackageId(id);
                        setQExtraPackageIds(prev => prev.filter(x => x !== id));
                        const found = practicePackages.find(p => p.id === id);
                        setQPackageTitle(found ? found.title : '');
                        if (found && found.category !== 'CAMPURAN') {
                          setQCat(found.category);
                        }
                      }}
                      className="w-full p-2.5 bg-white border border-blue-300 rounded-lg font-bold text-blue-800"
                    >
                      <option value="">-- Soal Umum Bank Soal (Tanpa Kotak Spesifik) --</option>
                      {practicePackages.map(pkg => (
                        <option key={pkg.id} value={pkg.id}>
                          [{pkg.category}] {pkg.title} ({pkg.question_count} Soal)
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-blue-700">
                      Soal ini akan otomatis masuk ke dalam kotak paket soal tersebut ketika peserta mengerjakannya.
                    </p>

                    {/* Optional Multi-Kotak Assignment */}
                    {practicePackages.length > 1 && (
                      <div className="pt-2 border-t border-blue-200/80 space-y-1.5">
                        <span className="text-[11px] font-bold text-blue-950 block">
                          Ikutsertakan Juga di Kotak Soal Lain (Misal: Try Out Full):
                        </span>
                        <div className="max-h-24 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2 bg-white/80 rounded-lg border border-blue-200">
                          {practicePackages
                            .filter(pkg => pkg.id !== qPackageId)
                            .map(pkg => {
                              const checked = qExtraPackageIds.includes(pkg.id);
                              return (
                                <label
                                  key={pkg.id}
                                  className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {
                                      setQExtraPackageIds(prev =>
                                        prev.includes(pkg.id)
                                          ? prev.filter(id => id !== pkg.id)
                                          : [...prev, pkg.id]
                                      );
                                    }}
                                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-700 shrink-0"
                                  />
                                  <span className="truncate">
                                    [{pkg.category}] {pkg.title}
                                  </span>
                                </label>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Kategori</label>
                      <select
                        value={qCat}
                        onChange={e => setQCat(e.target.value as QuestionCategory)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-blue-700"
                      >
                        <option value="TWK">TWK</option>
                        <option value="TIU">TIU</option>
                        <option value="TKP">TKP</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Topik / Subtopik</label>
                      <input
                        type="text"
                        value={qTopic}
                        onChange={e => setQTopic(e.target.value)}
                        placeholder="Misal: Silogisme, Pancasila"
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Kesulitan</label>
                      <select
                        value={qDiff}
                        onChange={e => setQDiff(e.target.value as DifficultyLevel)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                      >
                        <option value="Mudah">Mudah</option>
                        <option value="Sedang">Sedang</option>
                        <option value="Sukar">Sukar</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Pertanyaan Soal</label>
                    <textarea
                      rows={3}
                      value={qText}
                      onChange={e => setQText(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                      required
                    />
                  </div>

                  {/* Options A-E */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-700 block">Pilihan Jawaban (A s/d E):</label>
                    {(['A', 'B', 'C', 'D', 'E'] as const).map(key => {
                      const stateVal = key === 'A' ? qOptA : key === 'B' ? qOptB : key === 'C' ? qOptC : key === 'D' ? qOptD : qOptE;
                      const setVal = key === 'A' ? setQOptA : key === 'B' ? setQOptB : key === 'C' ? setQOptC : key === 'D' ? setQOptD : setQOptE;
                      const weightVal = key === 'A' ? qWeightA : key === 'B' ? qWeightB : key === 'C' ? qWeightC : key === 'D' ? qWeightD : qWeightE;
                      const setWeight = key === 'A' ? setQWeightA : key === 'B' ? setQWeightB : key === 'C' ? setQWeightC : key === 'D' ? setQWeightD : setQWeightE;

                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="w-6 font-bold text-center text-slate-700">{key}.</span>
                          <input
                            type="text"
                            value={stateVal}
                            onChange={e => setVal(e.target.value)}
                            placeholder={`Teks pilihan ${key}`}
                            className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg"
                            required
                          />
                          {qCat === 'TKP' && (
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] text-slate-500">Bobot:</span>
                              <input
                                type="number"
                                min={1}
                                max={5}
                                value={weightVal}
                                onChange={e => setWeight(Number(e.target.value))}
                                className="w-12 p-1.5 font-mono text-center bg-slate-50 border border-slate-300 rounded-lg font-bold"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {qCat !== 'TKP' && (
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Kunci Jawaban Benar</label>
                      <select
                        value={qKey}
                        onChange={e => setQKey(e.target.value as 'A' | 'B' | 'C' | 'D' | 'E')}
                        className="p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-emerald-700"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Penjelasan / Pembahasan</label>
                    <textarea
                      rows={3}
                      value={qExp}
                      onChange={e => setQExp(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsQuestionModalOpen(false)}
                      className="px-4 py-2 border rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl"
                    >
                      Simpan Soal
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        );
      })()}

      {/* Modal Tambah / Edit Materi Belajar (Integrasi Google Drive) */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {editingMaterial ? 'Edit Modul Materi Belajar' : 'Tambah Materi Belajar Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Mendukung tautan Google Drive (PDF, Video Pembelajaran, Modul)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMaterialModalOpen(false);
                  setEditingMaterial(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Judul Materi Belajar *</label>
                  <input
                    type="text"
                    value={mTitle}
                    onChange={e => setMTitle(e.target.value)}
                    placeholder="Contoh: Modul Rangkuman TWK - Pilar Kebangsaan & UUD 1945"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori SKD *</label>
                  <select
                    value={mCategory}
                    onChange={e => setMCategory(e.target.value as MaterialCategory)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-blue-700 focus:outline-blue-500"
                  >
                    <option value="TWK">TWK (Wawasan Kebangsaan)</option>
                    <option value="TIU">TIU (Inteligensia Umum)</option>
                    <option value="TKP">TKP (Karakteristik Pribadi)</option>
                    <option value="STRATEGI">STRATEGI (Strategi Ujian BKN)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ringkasan Singkat</label>
                <input
                  type="text"
                  value={mSummary}
                  onChange={e => setMSummary(e.target.value)}
                  placeholder="Ringkasan inti yang akan dipelajari dalam modul ini"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              {/* Google Drive Link Box */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-blue-950 font-bold">
                  <Download className="w-4 h-4 text-blue-700" />
                  <span>Tautan File Google Drive (PDF / Modul / E-Book)</span>
                </div>
                <div>
                  <input
                    type="url"
                    value={mFileUrl}
                    onChange={e => setMFileUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/xxxxxx/view?usp=sharing"
                    className="w-full p-2.5 bg-white border border-blue-300 rounded-lg text-slate-900 text-xs font-mono"
                  />
                  <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">
                    💡 <strong>Tips:</strong> Di Google Drive Anda, klik kanan file PDF &rarr; <em>Bagikan (Share)</em> &rarr; atur akses umum menjadi <em>&quot;Siapa saja yang memiliki link dapat melihat&quot;</em> &rarr; Salin link dan tempel di sini.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-blue-950 block mb-1 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-blue-700" />
                    <span>Tautan Video Pembelajaran (Google Drive / YouTube)</span>
                  </label>
                  <input
                    type="url"
                    value={mVideoUrl}
                    onChange={e => setMVideoUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... atau https://youtube.com/watch?v=..."
                    className="w-full p-2.5 bg-white border border-blue-300 rounded-lg text-slate-900 text-xs font-mono"
                  />
                </div>

                {/* Upload File Video Langsung untuk Modul Materi */}
                <div className="pt-2 border-t border-blue-200/80 space-y-2">
                  <label className="font-bold text-blue-950 block flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-blue-700" />
                    <span>Atau Upload Langsung File Video Pembahasan (MP4 / WebM / MOV)</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-blue-300 hover:bg-blue-50 text-blue-800 font-bold cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{mVideoFile || mVideoFileName ? 'Ganti File Video' : 'Pilih File Video'}</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0] || null;
                          if (file && !file.type.startsWith('video/')) {
                            alert('Format file harus video (MP4/WebM/MOV).');
                            return;
                          }
                          setMVideoFile(file);
                        }}
                      />
                    </label>
                    {(mVideoFile || mVideoFileName) && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                        <span className="font-semibold truncate max-w-[180px]">
                          {mVideoFile ? mVideoFile.name : mVideoFileName}
                        </span>
                        <span className="font-mono tabular-nums text-slate-500">
                          {formatFileSize(mVideoFile ? mVideoFile.size : mVideoFileSize)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setMVideoFile(null);
                            setMVideoBlobId(undefined);
                            setMVideoFileName(undefined);
                            setMVideoFileSize(undefined);
                          }}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Isi &amp; Rangkuman Catatan Pembelajaran</label>
                <textarea
                  rows={4}
                  value={mContent}
                  onChange={e => setMContent(e.target.value)}
                  placeholder="Tuliskan catatan, rumus cepat, konsep penting, atau kisi-kisi materi di sini..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 leading-relaxed font-sans"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                  <input
                    type="checkbox"
                    checked={mIsPremium}
                    onChange={e => setMIsPremium(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-700 focus:ring-blue-500"
                  />
                  <span className="font-semibold">Materi Khusus Paket Premium</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                  <input
                    type="checkbox"
                    checked={mIsActive}
                    onChange={e => setMIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-700 focus:ring-blue-500"
                  />
                  <span className="font-semibold">Terbitkan (Status Aktif)</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsMaterialModalOpen(false);
                    setEditingMaterial(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={mIsSaving}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{mIsSaving ? 'Menyimpan...' : 'Simpan Materi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Kotak Paket Soal */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {editingPackage ? 'Edit Kotak Paket Soal' : 'Buat Kotak Paket Soal Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Kotak ini akan langsung tampil sebagai kartu di halaman Tryout &amp; Latihan Peserta
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPackageModalOpen(false);
                  setEditingPackage(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePracticePackage} className="p-5 overflow-y-auto space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Kotak / Paket Soal *</label>
                <input
                  type="text"
                  value={pTitle}
                  onChange={e => setPTitle(e.target.value)}
                  placeholder="Misal: TIU 1 : Penalaran Logis atau Try Out SKD 2026 - Premium #4"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subjudul / Topik Fokus</label>
                <input
                  type="text"
                  value={pSubtitle}
                  onChange={e => setPSubtitle(e.target.value)}
                  placeholder="Misal: Silogisme, Modus Ponens & Penarikan Kesimpulan"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Tampilan Tab</label>
                  <select
                    value={pType}
                    onChange={e => setPType(e.target.value as PackageType)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-blue-700"
                  >
                    <option value="LATIHAN_HARIAN">Latihan Harian &amp; Drill</option>
                    <option value="DRILL_KATEGORI">Drill Kategori Khusus</option>
                    <option value="TRYOUT_SKD">Tryout Lengkap SKD</option>
                    <option value="TRYOUT_AKBAR">Tryout Akbar</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Soal</label>
                  <select
                    value={pCat}
                    onChange={e => setPCat(e.target.value as QuestionCategory | 'CAMPURAN')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="TIU">TIU (Inteligensia Umum)</option>
                    <option value="TWK">TWK (Wawasan Kebangsaan)</option>
                    <option value="TKP">TKP (Karakteristik Pribadi)</option>
                    <option value="CAMPURAN">CAMPURAN (SKD Lengkap TWK+TIU+TKP)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tier Akses</label>
                  <select
                    value={pTier}
                    onChange={e => setPTier(e.target.value as PackageAccessTier)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="GRATIS">GRATIS</option>
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="PLATINUM">PLATINUM</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jumlah Soal</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={pCount}
                    onChange={e => setPCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    min={1}
                    max={240}
                    value={pDuration}
                    onChange={e => setPDuration(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsPackageModalOpen(false);
                    setEditingPackage(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Kotak Soal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Financial & Affiliate Commission Report Modal / Preview for PDF Export */}
      {isPrintReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:bg-white print:p-0">
          <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 my-8 print:shadow-none print:my-0 print:max-w-none print:rounded-none">
            <div className="flex items-start justify-between border-b-2 border-blue-700 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-blue-800">
                  LAPORAN REKAPITULASI PEMBAYARAN, REFERRAL &amp; KOMISI MITRA
                </h2>
                <p className="text-xs font-bold text-slate-600 mt-0.5">
                  LOGIN CPNS · Platform Bimbingan Belajar &amp; Simulasi CAT SKD
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Dicetak pada: {new Date().toLocaleString('id-ID')}
                </p>
              </div>
              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setIsPrintReportOpen(false)}
                  className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Ringkasan Laba, Omzet & Komisi Mitra */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] sm:text-[11px] text-emerald-700 font-bold block truncate">Pemasukan Disetujui</span>
                <span className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-emerald-800 truncate block">
                  Rp {approvedRevenueTotal.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] sm:text-[11px] text-amber-700 font-bold block truncate">Menunggu Verifikasi</span>
                <span className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-amber-800 truncate block">
                  Rp {pendingRevenueTotal.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-[10px] sm:text-[11px] text-blue-700 font-bold block truncate">Komisi Sudah Dibayar</span>
                <span className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-blue-800 truncate block">
                  Rp {commissionPaidTotal.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl bg-red-50 border border-red-200">
                <span className="text-[10px] sm:text-[11px] text-red-700 font-bold block truncate">Komisi Belum Dibayar</span>
                <span className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-red-800 truncate block">
                  Rp {commissionUnpaidTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="p-2 border border-slate-300 text-center">No</th>
                    <th className="p-2 border border-slate-300">Tgl Daftar / Bayar</th>
                    <th className="p-2 border border-slate-300">Siswa &amp; Kontak</th>
                    <th className="p-2 border border-slate-300">Paket &amp; Referral</th>
                    <th className="p-2 border border-slate-300 text-right">Bayar</th>
                    <th className="p-2 border border-slate-300">Mitra Pemilik Kode</th>
                    <th className="p-2 border border-slate-300 text-right">Komisi &amp; Status</th>
                    <th className="p-2 border border-slate-300 text-center">Status Bayar</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, idx) => {
                    const d = getPaymentPartnerDetails(p);
                    return (
                      <tr key={p.id}>
                        <td className="p-2 border border-slate-300 text-center">{idx + 1}</td>
                        <td className="p-2 border border-slate-300 font-mono">
                          D: {new Date(d.regDate).toLocaleDateString('id-ID')}<br />
                          B: {new Date(p.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="p-2 border border-slate-300">
                          <strong>{p.user_name}</strong><br />
                          <span className="font-mono text-[10px]">{p.user_email} ({d.phone})</span>
                        </td>
                        <td className="p-2 border border-slate-300">
                          {p.package_name}<br />
                          {d.isUpgrade ? (
                            <span className="font-mono text-[10px] text-indigo-700">
                              PERALIHAN (Dari {d.previousPkgName} · Asli Rp {d.originalAmount.toLocaleString('id-ID')} - Rp {d.upgradeCredit.toLocaleString('id-ID')})
                            </span>
                          ) : (
                            <span className="font-mono text-[10px]">Kode: {d.referralCode} (-Rp {d.referralDiscount.toLocaleString('id-ID')})</span>
                          )}
                        </td>
                        <td className="p-2 border border-slate-300 text-right font-mono font-bold">
                          Rp {p.amount.toLocaleString('id-ID')}
                        </td>
                        <td className="p-2 border border-slate-300">
                          <strong>{d.partnerName}</strong><br />
                          <span className="font-mono text-[10px]">{d.partnerPhone}</span>
                        </td>
                        <td className="p-2 border border-slate-300 text-right font-mono">
                          <strong>Rp {d.commission.toLocaleString('id-ID')}</strong><br />
                          <span className="text-[10px]">{d.commissionLabel}</span>
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-bold">{p.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import Soal Langsung ke Kotak Soal */}
      {isImportModalOpen && (() => {
        const selectedPkg = practicePackages.find(p => p.id === importPackageId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Import Soal Massal ke Kotak Paket
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Target: <strong className="text-blue-700">{selectedPkg ? selectedPkg.title : 'Bank Soal Umum'}</strong> · Download contoh format agar tidak salah struktur
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                {/* Step 1: Download Template Box */}
                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-extrabold text-blue-950 block">
                      1. Unduh Format Contoh (Wajib sesuai agar terbaca otomatis)
                    </span>
                    <span className="text-[11px] text-blue-700">
                      Pilih format Teks/Word (.txt) atau Excel (.csv), isi soal Anda, lalu unggah atau tempel ke kotak di bawah.
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => downloadTemplateTxt(selectedPkg)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-[11px] font-bold shadow-2xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Contoh Format Teks (.txt)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadTemplateCsv(selectedPkg)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-2xs cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Contoh Format Excel (.csv)</span>
                    </button>
                  </div>
                </div>

                {/* Target Kotak Selector */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kotak / Judul Paket Soal Tujuan:</label>
                  <select
                    value={importPackageId}
                    onChange={e => setImportPackageId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-blue-800"
                  >
                    <option value="">-- Bank Soal Umum (Tanpa Kotak Spesifik) --</option>
                    {practicePackages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        [{pkg.category}] {pkg.title} ({pkg.question_count} Soal)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step 2: Upload or Paste */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700">2. Tempel Isi Soal atau Unggah File:</label>
                      <label className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1 border border-slate-300">
                        <Upload className="w-3 h-3" />
                        <span>Upload .txt / .csv</span>
                        <input
                          type="file"
                          accept=".txt,.csv"
                          onChange={handleImportFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <textarea
                      rows={10}
                      value={importText}
                      onChange={e => setImportText(e.target.value)}
                      placeholder={`===SOAL===
KATEGORI: ${selectedPkg && selectedPkg.category !== 'CAMPURAN' ? selectedPkg.category : 'TIU'}
JUDUL: ${selectedPkg ? selectedPkg.title : 'Penalaran Logis'}
PERTANYAAN: Tulis soal di sini...
A: Pilihan A
B: Pilihan B
C: Pilihan C
D: Pilihan D
E: Pilihan E
KUNCI JAWABAN: B
PEMBAHASAN: Tulis pembahasan di sini...
TINGKAT KESULITAN: Sedang`}
                      className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => parseStructuredText()}
                        className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-2xs cursor-pointer"
                      >
                        Proses &amp; Preview Soal
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const cat = selectedPkg && selectedPkg.category !== 'CAMPURAN' ? selectedPkg.category : 'TIU';
                          const title = selectedPkg ? selectedPkg.title : 'Penalaran Logis';
                          const sample = `===SOAL===
KATEGORI: ${cat}
JUDUL: ${title}
PERTANYAAN: Semua pegawai instansi X wajib mengikuti apel pagi. Sebagian pegawai instansi X adalah peserta diklat. Kesimpulan yang tepat adalah...
A: Semua peserta diklat adalah pegawai instansi X
B: Sebagian peserta diklat wajib mengikuti apel pagi
C: Tidak ada peserta diklat yang ikut apel pagi
D: Semua yang ikut apel pagi adalah peserta diklat
E: Pegawai instansi X tidak ikut diklat
KUNCI JAWABAN: B
PEMBAHASAN: Karena sebagian pegawai adalah peserta diklat dan semua pegawai wajib apel pagi, maka sebagian peserta diklat wajib mengikuti apel pagi.
TINGKAT KESULITAN: Sedang`;
                          setImportText(sample);
                          parseStructuredText(sample);
                        }}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                      >
                        Isi Contoh Soal
                      </button>
                    </div>

                    {importError && (
                      <div className="p-2.5 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2 text-[11px]">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{importError}</span>
                      </div>
                    )}
                  </div>

                  {/* Preview Panel */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold uppercase text-slate-800 border-b border-slate-200 pb-2 text-[11px]">
                        Preview Soal Terdeteksi ({importPreview.length} Butir)
                      </h4>
                      {importPreview.length === 0 ? (
                        <p className="text-[11px] text-slate-500 py-10 text-center">
                          Tempel teks soal atau upload file .txt / .csv di sebelah kiri, lalu klik &quot;Proses &amp; Preview Soal&quot;.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pt-2">
                          {importPreview.map((item, i) => (
                            <div key={i} className="p-2 bg-white rounded-lg border border-slate-200 space-y-1 text-[11px]">
                              <div className="flex justify-between font-bold">
                                <span className="text-blue-700">#{i + 1} [{item.category}] {item.topic}</span>
                                <span className="text-emerald-700 font-mono">Kunci: {item.correct_answer}</span>
                              </div>
                              <p className="text-slate-600 line-clamp-2">{item.question_text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {importPreview.length > 0 && (
                      <button
                        type="button"
                        onClick={handleCommitImport}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                      >
                        Simpan {importPreview.length} Soal ke Kotak Ini &rarr;
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* Modal Buat / Edit Pengumuman Admin */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {editingAnnouncement ? 'Edit / Update Pengumuman Admin' : 'Buat Pengumuman Admin Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tampil langsung di kotak Pengumuman Admin pada dashboard seluruh peserta
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAnnouncementModalOpen(false);
                  setEditingAnnouncement(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="p-5 overflow-y-auto space-y-3.5 text-xs">
              {/* Template Cepat */}
              {!editingAnnouncement && (
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <span className="font-bold text-blue-900 block text-[11px]">
                    Isi Cepat Berdasarkan Jenis Pengumuman:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyAnnouncementTemplate('JADWAL')}
                      className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      Jadwal Resmi CPNS
                    </button>
                    <button
                      type="button"
                      onClick={() => applyAnnouncementTemplate('MAINTENANCE')}
                      className="px-2.5 py-1 bg-white hover:bg-red-50 text-red-700 border border-red-300 rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      Gangguan Jaringan / Maintenance
                    </button>
                    <button
                      type="button"
                      onClick={() => applyAnnouncementTemplate('BERITA')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      Berita / Pengumuman Lain
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Judul Pengumuman *</label>
                  <input
                    type="text"
                    value={annTitle}
                    onChange={e => setAnnTitle(e.target.value)}
                    placeholder="Misal: Jadwal Resmi Pendaftaran CPNS 2026/2027"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Berita</label>
                  <select
                    value={annCategory}
                    onChange={e => setAnnCategory(e.target.value as AnnouncementCategory)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-blue-800"
                  >
                    <option value="JADWAL_CPNS">Jadwal Resmi CPNS</option>
                    <option value="MAINTENANCE">Gangguan / Maintenance</option>
                    <option value="TRYOUT">Info Tryout</option>
                    <option value="BERITA_UMUM">Berita &amp; Pengumuman Lain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Garis Besar / Ringkasan (Tampil di Dashboard Peserta) *
                </label>
                <textarea
                  rows={2}
                  value={annSummary}
                  onChange={e => setAnnSummary(e.target.value)}
                  placeholder="Tulis ringkasan singkat (1-2 kalimat) yang langsung terlihat peserta sebelum menekan Baca Selengkapnya..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Isi Pengumuman Lengkap (Tampil saat klik Baca Selengkapnya) *
                </label>
                <textarea
                  rows={7}
                  value={annContent}
                  onChange={e => setAnnContent(e.target.value)}
                  placeholder="Tulis detail jadwal resmi, panduan, informasi gangguan jaringan, atau pengumuman lengkap di sini..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 leading-relaxed"
                  required
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={annIsPinned}
                    onChange={e => setAnnIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Sematkan di Posisi Teratas (Penting)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={annIsActive}
                    onChange={e => setAnnIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Langsung Tayangkan ke Peserta</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAnnouncementModalOpen(false);
                    setEditingAnnouncement(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingAnnouncement ? 'Simpan Perubahan' : 'Terbitkan Pengumuman'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upload / Edit Short Video */}
      {isShortVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {editingShortVideo ? 'Edit Short Video Materi' : 'Upload Short Video Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Unggah video penjelasan (misalnya soal matematika TIU atau kiat belajar) agar peserta lebih mudah memahami.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  clearSvPreviewUrl();
                  setIsShortVideoModalOpen(false);
                  setEditingShortVideo(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShortVideo} className="p-5 overflow-y-auto space-y-4 text-xs">
              {svUploadError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{svUploadError}</span>
                </div>
              )}

              {/* Source Mode Selector */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">Sumber Video *</span>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSvSourceType('UPLOAD')}
                    className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      svSourceType === 'UPLOAD'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSvSourceType('URL')}
                    className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      svSourceType === 'URL'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Link YouTube / Drive / MP4</span>
                  </button>
                </div>
              </div>

              {svSourceType === 'UPLOAD' ? (
                <div className="p-4 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 space-y-3">
                  {svPreviewUrl ? (
                    <div className="space-y-3">
                      <video
                        src={svPreviewUrl}
                        controls
                        playsInline
                        className="w-full max-h-56 rounded-lg bg-slate-950 object-contain"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate max-w-xs">
                            {svSelectedFile?.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                            {formatFileSize(svSelectedFile?.size)} · Durasi: {svDuration}
                          </div>
                        </div>
                        <label className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold cursor-pointer">
                          Ganti File
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime,video/*"
                            className="hidden"
                            onChange={e => void handleShortVideoFileSelect(e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>
                    </div>
                  ) : svExistingBlobId ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
                      <div>
                        <div className="font-bold text-slate-900">
                          File terupload saat ini: {svExistingFileName || 'Video Tersimpan'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                          Ukuran: {formatFileSize(svExistingFileSize)}
                        </div>
                      </div>
                      <label className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer">
                        Upload Video Pengganti
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,video/*"
                          className="hidden"
                          onChange={e => void handleShortVideoFileSelect(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center py-5 text-center cursor-pointer space-y-2">
                      <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          Klik di sini untuk memilih file video dari komputer atau HP
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Mendukung format MP4, WebM, MOV (Maksimal 150 MB). Cocok untuk video penjelasan papan tulis/matematika.
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/*"
                        className="hidden"
                        onChange={e => void handleShortVideoFileSelect(e.target.files?.[0] || null)}
                      />
                    </label>
                  )}
                </div>
              ) : (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Link URL Video (YouTube / YouTube Shorts / Google Drive / MP4)
                  </label>
                  <input
                    type="url"
                    value={svVideoUrl}
                    onChange={e => setSvVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/shorts/... atau https://drive.google.com/file/d/.../view"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Judul Short Video *</label>
                  <input
                    type="text"
                    value={svTitle}
                    onChange={e => setSvTitle(e.target.value)}
                    placeholder="Contoh: Pembahasan Cepat Soal Perbandingan Matematika TIU"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori *</label>
                  <select
                    value={svCategory}
                    onChange={e => setSvCategory(e.target.value as ShortVideoCategory)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-blue-700"
                  >
                    <option value="TIU">TIU / Matematika</option>
                    <option value="KIAT_BELAJAR">Kiat-Kiat Belajar</option>
                    <option value="TWK">Materi TWK</option>
                    <option value="TKP">Materi TKP</option>
                    <option value="STRATEGI">Strategi Ujian</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Topik / Sub-Bahasan</label>
                  <input
                    type="text"
                    value={svTopic}
                    onChange={e => setSvTopic(e.target.value)}
                    placeholder="Contoh: Matematika TIU · Aljabar & Pecahan"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Durasi Singkat</label>
                  <input
                    type="text"
                    value={svDuration}
                    onChange={e => setSvDuration(e.target.value)}
                    placeholder="01:30"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Catatan Pembahasan / Rumus / Kiat-Kiat
                </label>
                <textarea
                  rows={4}
                  value={svDescription}
                  onChange={e => setSvDescription(e.target.value)}
                  placeholder="Tuliskan langkah perhitungan, rumus cepat, atau poin kiat-kiat yang dibahas di video agar peserta bisa membaca ulang sambil menonton..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 leading-relaxed"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                  <input
                    type="checkbox"
                    checked={svIsPremium}
                    onChange={e => setSvIsPremium(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-700"
                  />
                  <span className="font-semibold">Khusus Member Premium</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                  <input
                    type="checkbox"
                    checked={svIsActive}
                    onChange={e => setSvIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-700"
                  />
                  <span className="font-semibold">Langsung Terbitkan (Aktif)</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    clearSvPreviewUrl();
                    setIsShortVideoModalOpen(false);
                    setEditingShortVideo(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={svIsSaving}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{svIsSaving ? 'Mengupload...' : editingShortVideo ? 'Simpan Perubahan' : 'Publikasikan Video'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Preview Short Video di Panel Super Admin */}
      {previewShortVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-blue-700">
                  Preview Short Video · {getShortVideoCategoryLabel(previewShortVideo.category)}
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 truncate">
                  {previewShortVideo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewShortVideo(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              <ShortVideoPlayer video={previewShortVideo} autoPlay />
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {previewShortVideo.description}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Bayar Komisi & Upload Bukti Transfer (Otomatis Kurangi Saldo Komisi Mitra) */}
      {payoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
          onClick={() => setPayoutModal(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-8"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50">
              <div>
                <h3 className="font-extrabold text-sm text-emerald-950">
                  Upload Bukti Transfer &amp; Konfirmasi Sudah Bayar Komisi
                </h3>
                <p className="text-[11px] text-emerald-800">
                  Mitra: <strong>{payoutModal.partnerName}</strong> (<span className="font-mono">{payoutModal.referralCode}</span>)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPayoutModal(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-emerald-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayoutSubmit} className="p-5 space-y-4 text-xs">
              {payoutError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{payoutError}</span>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[11px] text-slate-500">Rekening / Tujuan Pencairan:</div>
                <div className="font-bold text-slate-900">{payoutModal.bankInfo}</div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  Nominal Komisi Dibayar (Rp) — Saldo Tersedia: Rp {payoutModal.maxAmount.toLocaleString('id-ID')}
                </label>
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  max={Math.max(payoutModal.maxAmount, 1000)}
                  value={payoutAmount}
                  disabled={payoutModal.mode === 'WITHDRAWAL'}
                  onChange={e => setPayoutAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-emerald-50 border border-emerald-300 rounded-xl font-mono font-extrabold text-emerald-900 disabled:opacity-75"
                  required
                />
                <p className="text-[11px] text-slate-500">
                  Setelah diklik <strong>Sudah Bayar</strong>, saldo komisi belum dibayar mitra otomatis berkurang sebesar Rp {payoutAmount.toLocaleString('id-ID')}.
                </p>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">
                  Upload Bukti Transfer Bank / E-Wallet (Wajib)
                </label>
                <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-emerald-700" />
                  <span className="font-bold text-emerald-900">
                    {isProcessingProof
                      ? 'Memproses gambar bukti transfer...'
                      : payoutProofUrl
                      ? 'Ganti Gambar Bukti Transfer'
                      : 'Pilih Gambar Bukti Transfer (JPG/PNG)'}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handlePayoutFileChange}
                    className="hidden"
                  />
                </label>

                {payoutProofUrl && (
                  <div className="p-2 rounded-xl bg-slate-950 flex flex-col items-center gap-2">
                    <img
                      src={payoutProofUrl}
                      alt="Preview Bukti Transfer"
                      className="max-h-48 w-auto object-contain rounded-lg"
                    />
                    <span className="text-[10px] text-emerald-300 font-bold">
                      ✓ Bukti transfer siap dilampirkan
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Catatan Transfer Admin (Opsional)</label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={e => setPayoutNotes(e.target.value)}
                  placeholder="Misal: Transfer via BCA Mobile ref #20261119"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayoutModal(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessingProof}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Konfirmasi Sudah Bayar &amp; Kurangi Saldo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Preview Bukti Transfer Komisi */}
      {commissionProofPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs"
          onClick={() => setCommissionProofPreview(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="min-w-0">
                <h4 className="font-extrabold text-sm text-slate-900 truncate">
                  {commissionProofPreview.title}
                </h4>
                {commissionProofPreview.subtitle && (
                  <p className="text-[11px] text-slate-500 truncate">{commissionProofPreview.subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setCommissionProofPreview(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center">
              <img
                src={commissionProofPreview.url}
                alt="Bukti Transfer Komisi"
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Data Mitra Afiliasi */}
      {editingPartner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
          onClick={() => setEditingPartner(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-8"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-blue-50">
              <div>
                <h3 className="font-extrabold text-sm text-blue-950">Edit Data Mitra Afiliasi</h3>
                <p className="text-[11px] text-blue-800">{editingPartner.full_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPartner(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-blue-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPartner} className="p-5 space-y-3.5 text-xs">
              {epError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{epError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Lengkap Mitra</label>
                  <input
                    type="text"
                    value={epFullName}
                    onChange={e => setEpFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    value={epPhone}
                    onChange={e => setEpPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Aktif Mitra</label>
                  <input
                    type="email"
                    value={epEmail}
                    onChange={e => setEpEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kode Referral Mitra</label>
                  <input
                    type="text"
                    value={epReferralCode}
                    onChange={e => setEpReferralCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                    maxLength={20}
                    className="w-full px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-lg font-mono font-extrabold uppercase text-emerald-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Status Kemitraan</label>
                <select
                  value={epStatus}
                  onChange={e => setEpStatus(e.target.value as AffiliateStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                >
                  <option value="APPROVED">MITRA AKTIF (Disetujui)</option>
                  <option value="PENDING">MENUNGGU PERSETUJUAN ADMIN</option>
                  <option value="REJECTED">DITOLAK / NONAKTIF</option>
                </select>
              </div>

              {epStatus === 'REJECTED' && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-1.5">
                  <label className="font-extrabold text-red-900 block">
                    Alasan Penolakan Mitra * (Agar Mitra Bisa Memperbaiki Kesalahannya)
                  </label>
                  <textarea
                    rows={3}
                    value={epRejectionReason}
                    onChange={e => setEpRejectionReason(e.target.value)}
                    placeholder="Jelaskan kesalahan mitra secara jelas, misal: Media promosi belum valid / kode referral tidak sesuai / data profil perlu diperbaiki..."
                    className="w-full px-3 py-2 bg-white border border-red-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Bank / E-Wallet</label>
                  <input
                    type="text"
                    value={epBankName}
                    onChange={e => setEpBankName(e.target.value)}
                    placeholder="BCA / BRI / DANA"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">No. Rekening</label>
                  <input
                    type="text"
                    value={epAccountNumber}
                    onChange={e => setEpAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Atas Nama</label>
                  <input
                    type="text"
                    value={epAccountHolder}
                    onChange={e => setEpAccountHolder(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPartner(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Mitra</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Konfirmasi Hapus Data Mitra */}
      {deletingPartner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs"
          onClick={() => setDeletingPartner(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-red-50">
              <h3 className="font-extrabold text-sm text-red-950">Hapus Data Mitra Afiliasi</h3>
              <button
                type="button"
                onClick={() => setDeletingPartner(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-red-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-700 leading-relaxed">
                Anda akan menghapus data mitra untuk <strong>{deletingPartner.full_name}</strong> (Kode Referral:{' '}
                <strong className="font-mono">{deletingPartner.referral_code || '-'}</strong>). Pilih tindakan yang diinginkan:
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    removePartnerByAdmin(deletingPartner.id, false);
                    setAffiliateAdminFeedback(
                      `Status & kode mitra ${deletingPartner.full_name} telah dihapus (akun tetap aktif sebagai Member biasa).`
                    );
                    setDeletingPartner(null);
                  }}
                  className="w-full p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left cursor-pointer"
                >
                  <div className="font-extrabold text-amber-950">
                    1. Hapus Status Mitra Saja (Ubah Jadi Member Biasa)
                  </div>
                  <div className="text-[11px] text-amber-800">
                    Menghapus kode referral &amp; akses Panel Mitra, namun akun peserta tetap dapat login belajar.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    removePartnerByAdmin(deletingPartner.id, true);
                    setAffiliateAdminFeedback(
                      `Akun mitra ${deletingPartner.full_name} telah dihapus permanen dari daftar pengguna.`
                    );
                    setDeletingPartner(null);
                  }}
                  className="w-full p-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-left cursor-pointer"
                >
                  <div className="font-extrabold text-red-900">
                    2. Hapus Akun Mitra Permanen
                  </div>
                  <div className="text-[11px] text-red-700">
                    Menghapus pengguna beserta data kemitraannya secara permanen dari direktori akun.
                  </div>
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setDeletingPartner(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Tolak Mitra Afiliasi dengan Kotak Isian Alasan Penolakan */}
      {rejectingPartnerUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
          onClick={() => setRejectingPartnerUser(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-8"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-red-50">
              <div>
                <h3 className="font-extrabold text-sm text-red-950">
                  Tolak Pengajuan / Status Mitra Afiliasi
                </h3>
                <p className="text-[11px] text-red-800">
                  Mitra: <strong>{rejectingPartnerUser.full_name}</strong> ({rejectingPartnerUser.referral_code || rejectingPartnerUser.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRejectingPartnerUser(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-red-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRejectPartner} className="p-5 space-y-4 text-xs">
              {rejectAffiliateError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{rejectAffiliateError}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                Tuliskan alasan penolakan yang jelas dan spesifik. Alasan ini akan tampil di Panel Mitra milik <strong>{rejectingPartnerUser.full_name}</strong> dan dikirim ke emailnya agar ia dapat memperbaiki kesalahannya.
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Kotak Isian Alasan Penolakan Mitra *
                </label>
                <textarea
                  rows={4}
                  value={rejectAffiliateReason}
                  onChange={e => {
                    setRejectAffiliateReason(e.target.value);
                    if (rejectAffiliateError) setRejectAffiliateError('');
                  }}
                  placeholder="Contoh: Media promosi belum jelas atau tidak aktif, mohon cantumkan akun media sosial/grup promosi yang valid dan ajukan ulang."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-red-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400/75 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 block">Pilih Cepat Template Alasan:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Media promosi belum jelas / perlu dilengkapi',
                    'Usulan kode referral tidak sesuai ketentuan',
                    'Data profil / identitas tidak valid atau belum lengkap',
                    'Terindikasi penyalahgunaan / pelanggaran Syarat & Ketentuan'
                  ].map(tpl => (
                    <button
                      key={tpl}
                      type="button"
                      onClick={() => {
                        setRejectAffiliateReason(tpl);
                        setRejectAffiliateError('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-800 border border-slate-200 hover:border-red-200 text-[10px] font-semibold cursor-pointer transition-colors"
                    >
                      + {tpl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingPartnerUser(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Konfirmasi Tolak Mitra</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 6: Batalkan Pencairan Komisi Mitra (Pasal 7 Syarat & Ketentuan) */}
      {cancellingWithdrawal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
          onClick={() => setCancellingWithdrawal(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-8"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-red-50">
              <div>
                <h3 className="font-extrabold text-sm text-red-950">
                  Batalkan Pencairan Komisi Mitra
                </h3>
                <p className="text-[11px] text-red-800">
                  Mitra: <strong>{cancellingWithdrawal.affiliate_name}</strong> · Rp {cancellingWithdrawal.amount.toLocaleString('id-ID')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCancellingWithdrawal(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-red-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancelWithdrawal} className="p-5 space-y-4 text-xs">
              {cancelWithdrawalError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{cancelWithdrawalError}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                Sesuai <strong>Pasal 7 Syarat &amp; Ketentuan</strong>, LOGIN CPNS berhak membatalkan pencairan komisi apabila ditemukan kesalahan, penyalahgunaan, atau data yang tidak benar dari pihak mitra.
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">Alasan Pembatalan Pencairan Komisi *</label>
                <textarea
                  rows={3}
                  value={cancelWithdrawalReason}
                  onChange={e => {
                    setCancelWithdrawalReason(e.target.value);
                    if (cancelWithdrawalError) setCancelWithdrawalError('');
                  }}
                  placeholder="Contoh: Ditemukan data rekening tidak valid atau terindikasi penyalahgunaan kode referral."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-red-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancellingWithdrawal(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Konfirmasi Batalkan Pencairan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 7: Tambah / Edit Jadwal Zoom & Sesi Tryout Bersama */}
      {isSessionModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
          onClick={() => setIsSessionModalOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-8"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {editingSession ? 'Edit Jadwal Sesi' : 'Tambah Jadwal Sesi Baru'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Lengkapi detail jadwal, link Zoom, poster iklan promosi, serta bukti screenshot riwayat sesi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSessionModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGroupSession} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Sesi</label>
                  <select
                    value={sessCategory}
                    onChange={e =>
                      setSessCategory(e.target.value as 'TRYOUT_BARENG' | 'ZOOM_BIMBEL_MALAM')
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="ZOOM_BIMBEL_MALAM">Zoom Bimbel Malam</option>
                    <option value="TRYOUT_BARENG">Tryout Bersama + Zoom</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Soal / Ujian</label>
                  <select
                    value={sessExamType}
                    onChange={e => setSessExamType(e.target.value as ExamType)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="TRYOUT_BERSAMA">Tryout Bersama</option>
                    <option value="TRYOUT_SKD_LENGKAP">SKD Lengkap (110 Soal)</option>
                    <option value="TRYOUT_KATEGORI">Tryout Kategori</option>
                    <option value="LATIHAN_HARIAN">Latihan Harian</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Sesi</label>
                  <select
                    value={sessStatus}
                    onChange={e => setSessStatus(e.target.value as 'UPCOMING' | 'ACTIVE' | 'FINISHED')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="UPCOMING">Akan Datang</option>
                    <option value="ACTIVE">Sedang Aktif</option>
                    <option value="FINISHED">Sudah Berlalu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Sesi / Kelas Zoom *</label>
                <input
                  type="text"
                  value={sessTitle}
                  onChange={e => setSessTitle(e.target.value)}
                  placeholder="Contoh: Zoom Bimbel Malam #5: Trik Kilat Silogisme & Analitis"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi Materi / Pembahasan</label>
                <textarea
                  rows={2}
                  value={sessDesc}
                  onChange={e => setSessDesc(e.target.value)}
                  placeholder="Jelaskan topik materi atau rangkaian kegiatan sesi..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Waktu Mulai</label>
                  <input
                    type="datetime-local"
                    value={sessStartAt}
                    onChange={e => setSessStartAt(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Waktu Selesai</label>
                  <input
                    type="datetime-local"
                    value={sessEndAt}
                    onChange={e => setSessEndAt(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    min={15}
                    value={sessDuration}
                    onChange={e => setSessDuration(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jumlah Soal</label>
                  <input
                    type="number"
                    min={0}
                    value={sessQuestionCount}
                    onChange={e => setSessQuestionCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kuota Peserta</label>
                  <input
                    type="number"
                    min={10}
                    value={sessQuota}
                    onChange={e => setSessQuota(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jumlah Hadir</label>
                  <input
                    type="number"
                    min={0}
                    value={sessAttendanceCount}
                    onChange={e => setSessAttendanceCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Mentor / Instruktur</label>
                  <input
                    type="text"
                    value={sessCoach}
                    onChange={e => setSessCoach(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Link Room Zoom</label>
                  <input
                    type="url"
                    value={sessZoomUrl}
                    onChange={e => setSessZoomUrl(e.target.value)}
                    placeholder="https://zoom.us/j/..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Jadwal (Opsional)</label>
                <input
                  type="text"
                  value={sessScheduleNote}
                  onChange={e => setSessScheduleNote(e.target.value)}
                  placeholder="Misal: Jadwal malam hari (19.30 – 21.30 WIB)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              {/* Upload Poster Iklan Jadwal Zoom */}
              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-indigo-950">Poster Iklan Jadwal Zoom (Akan Datang)</span>
                  {sessPosterUrl && (
                    <button
                      type="button"
                      onClick={() => setSessPosterUrl('')}
                      className="text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      Hapus Poster
                    </button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {sessPosterUrl && (
                    <img
                      src={sessPosterUrl}
                      alt="Preview Poster"
                      className="w-32 h-20 object-cover rounded-lg border border-indigo-200"
                    />
                  )}
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{sessIsUploading ? 'Memproses...' : 'Pilih / Upload Gambar Poster'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setSessIsUploading(true);
                        try {
                          const dataUrl = await readAndCompressImageFile(file, 1100, 0.82);
                          setSessPosterUrl(dataUrl);
                        } finally {
                          setSessIsUploading(false);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Upload Bukti Screenshot Zoom Berlalu & Ringkasan */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-950">
                    Bukti Screenshot &amp; Laporan Sesi (Sudah Berlalu)
                  </span>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Tambah Screenshot</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async e => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        setSessIsUploading(true);
                        try {
                          const nextUrls: string[] = [];
                          for (let i = 0; i < files.length; i++) {
                            const f = files.item(i);
                            if (f) {
                              nextUrls.push(await readAndCompressImageFile(f, 1100, 0.8));
                            }
                          }
                          setSessEvidenceList(prev => [...prev, ...nextUrls]);
                        } finally {
                          setSessIsUploading(false);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                </div>
                {sessEvidenceList.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {sessEvidenceList.map((url, idx) => (
                      <div key={idx} className="relative h-16 rounded-lg overflow-hidden border border-emerald-200">
                        <img src={url} alt={`Bukti ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setSessEvidenceList(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-red-600 text-white cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ringkasan Laporan Pelaksanaan</label>
                  <input
                    type="text"
                    value={sessSummaryNotes}
                    onChange={e => setSessSummaryNotes(e.target.value)}
                    placeholder="Contoh: 148 peserta hadir aktif, sesi tanya jawab berjalan lancar."
                    className="w-full p-2 bg-white border border-emerald-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSessionModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingSession ? 'Simpan Perubahan' : 'Simpan Jadwal Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 8: Preview Gambar Poster / Bukti Screenshot Zoom */}
      {sessionImagePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
          onClick={() => setSessionImagePreview(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">{sessionImagePreview.title}</h3>
                {sessionImagePreview.subtitle && (
                  <p className="text-[11px] text-slate-500">{sessionImagePreview.subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSessionImagePreview(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-900 flex items-center justify-center max-h-[75vh]">
              <img
                src={sessionImagePreview.url}
                alt={sessionImagePreview.title}
                className="max-w-full max-h-[68vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
      {/* Modal 9: In-App Delete Confirmation Dialog (Safe for Sandboxed iFrame) */}
      {deleteConfirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setDeleteConfirmDialog(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-red-50/70">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {deleteConfirmDialog.title}
                </h3>
                <p className="text-[11px] text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-700 leading-relaxed">
                {deleteConfirmDialog.message}
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmDialog(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const action = deleteConfirmDialog.onConfirm;
                    setDeleteConfirmDialog(null);
                    action();
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {deleteConfirmDialog.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

