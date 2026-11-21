import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Question,
  Material,
  PremiumPackage,
  PracticePackage,
  Payment,
  GroupSession,
  LeaderboardEntry,
  ExamResult,
  AppSettings,
  AuditLog,
  AppNotification,
  AdminAnnouncement,
  ShortVideo,
  ExamType,
  QuestionCategory,
  PassingGradeConfig,
  CommissionWithdrawal,
  EmailNotificationLog,
  EmailLogCategory,
  MembershipType,
  AffiliateStatus,
  SkdCalculatorConfig,
  CalculatorImportPayload
} from '../types';
import {
  SEED_USERS,
  SEED_QUESTIONS,
  SEED_MATERIALS,
  SEED_PACKAGES,
  SEED_PRACTICE_PACKAGES,
  SEED_PAYMENTS,
  SEED_WITHDRAWALS,
  SEED_GROUP_SESSIONS,
  SEED_LEADERBOARD,
  SEED_RESULTS,
  SEED_SETTINGS,
  SEED_AUDIT_LOGS,
  SEED_NOTIFICATIONS,
  SEED_ANNOUNCEMENTS,
  SEED_SHORT_VIDEOS,
  SEED_EMAIL_LOGS
} from '../data/mockData';
import { deleteVideoBlob, clearAllVideoBlobs } from '../utils/videoStorage';

export const DEFAULT_REFERRAL_CODE = 'LOGINCPNS';
export const REFERRAL_DISCOUNT_AMOUNT = 20000;
export const AFFILIATE_COMMISSION_AMOUNT = 10000;
export const MIN_COMMISSION_WITHDRAWAL = 50000;
export const OFFICIAL_SENDER_EMAIL = 'loginbimbelasn@gmail.com';

export function hashUserPassword(password: string): string {
  let h1 = 0xdeadbeef ^ password.length;
  let h2 = 0x41c6ce57 ^ password.length;
  for (let i = 0; i < password.length; i++) {
    const ch = password.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `pw_h1_${(h1 >>> 0).toString(16)}_${(h2 >>> 0).toString(16)}`;
}

function getDefaultSeedPassword(user: User): string {
  return user.role === 'SUPER_ADMIN' ? 'Sy@fr1z_@l' : 'Cpns2026!';
}

function normalizePhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('62')) return '0' + digits.slice(2);
  return digits;
}

export interface ReferralValidationResult {
  isValid: boolean;
  isEmpty?: boolean;
  isOfficial?: boolean;
  isSelfReferral?: boolean;
  normalizedCode?: string;
  discount: number;
  commission: number;
  affiliateUser?: User;
  affiliateName?: string;
  message: string;
}

export type MemberNavView =
  | 'dashboard'
  | 'materi-belajar'
  | 'tryout-latihan'
  | 'zoom-bimbel'
  | 'kalkulator-skd-skb'
  | 'riwayat-ujian'
  | 'premium'
  | 'profil-saya';

export function hasPaidQuestionAccess(user: User | null): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return (
    user.membership_type === 'STANDAR' ||
    user.membership_type === 'PREMIUM' ||
    user.membership_type === 'INTENSIF'
  );
}

export function hasFullMaterialAccess(user: User | null, settings: AppSettings): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.membership_type === 'PREMIUM' || user.membership_type === 'INTENSIF') return true;
  if (user.membership_type === 'STANDAR') {
    const lockMaterials = settings.lock_materials_for_premium_only ?? true;
    const standarQuestionsOnly = settings.standar_questions_only ?? true;
    return !lockMaterials && !standarQuestionsOnly;
  }
  return false;
}

export function isStandarRestrictedToQuestions(user: User | null, settings: AppSettings): boolean {
  if (!user || user.role === 'SUPER_ADMIN') return false;
  if (user.membership_type !== 'STANDAR') return false;
  const lockMaterials = settings.lock_materials_for_premium_only ?? true;
  const standarQuestionsOnly = settings.standar_questions_only ?? true;
  return lockMaterials || standarQuestionsOnly;
}

export function hasZoomAccess(user: User | null): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return user.membership_type === 'INTENSIF';
}

export const DEFAULT_SKD_CALCULATOR_CONFIG: SkdCalculatorConfig = {
  enabled: true,
  access_tier: 'INTENSIF_ONLY',
  enable_auto_import_110: true,
  skd_weight_percent: 40,
  skb_weight_percent: 60,
  max_twk: 150,
  max_tiu: 175,
  max_tkp: 225,
  max_skb_cat: 500,
  default_competitor_skd: 420,
  default_competitor_skb: 72,
  calculator_note:
    'Gunakan skor Try Out SKD 110 Soal untuk memetakan peluang kelulusan akhir dan target nilai SKB bersama tutor di sesi Zoom Bimbel malam.'
};

export function hasCalculatorAccess(user: User | null, settings?: AppSettings): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  const calcConfig = settings?.skd_calculator_config;
  if (calcConfig && calcConfig.enabled === false) return false;
  const tier = calcConfig?.access_tier ?? 'INTENSIF_ONLY';
  if (tier === 'ALL_PAID') {
    return (
      user.membership_type === 'STANDAR' ||
      user.membership_type === 'PREMIUM' ||
      user.membership_type === 'INTENSIF'
    );
  }
  if (tier === 'PREMIUM_AND_INTENSIF') {
    return user.membership_type === 'PREMIUM' || user.membership_type === 'INTENSIF';
  }
  return user.membership_type === 'INTENSIF';
}

export function getMembershipDisplayLabel(type?: MembershipType): string {
  switch (type) {
    case 'STANDAR':
      return 'Paket Standar (Hanya Soal)';
    case 'PREMIUM':
      return 'Paket Premium (Belajar Mandiri)';
    case 'INTENSIF':
      return 'Paket Intensif Bimbel (Belajar Bersama)';
    default:
      return 'Member Gratis';
  }
}

export function getQuestionPackageIds(q: Question): string[] {
  const ids = new Set<string>();
  if (Array.isArray(q.package_ids)) {
    q.package_ids.forEach(id => {
      if (id) ids.add(id);
    });
  }
  if (q.package_id) {
    ids.add(q.package_id);
  }
  return Array.from(ids);
}

export function isQuestionInPackage(q: Question, pkg: { id: string; title?: string }): boolean {
  if (Array.isArray(q.package_ids) && q.package_ids.includes(pkg.id)) return true;
  if (q.package_id === pkg.id) return true;
  if (pkg.title && q.package_title === pkg.title) return true;
  return false;
}

export type AdminNavView =
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-questions'
  | 'admin-import'
  | 'admin-materials'
  | 'admin-short-videos'
  | 'admin-packages'
  | 'admin-payments'
  | 'admin-premium-activation'
  | 'admin-together-sessions'
  | 'admin-zoom'
  | 'admin-results'
  | 'admin-exam-settings'
  | 'admin-announcements'
  | 'admin-app-settings'
  | 'admin-audit-logs'
  | 'admin-sheets';

export type ActiveAppView = MemberNavView | AdminNavView | 'landing';

export type TryoutHubTab = 'TRYOUT_SKD' | 'LATIHAN_SOAL' | 'SIMULASI_AKBAR' | 'BARENG';

export interface ActiveExamSession {
  examType: ExamType;
  examTitle: string;
  category?: QuestionCategory;
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>;
  flaggedMap: Record<string, boolean>; // ragu-ragu
  durationSeconds: number;
  timeRemainingSeconds: number;
  isStarted: boolean;
  isFinished: boolean;
  sessionId?: string; // If tryout bersama
}

export interface PendingExamLaunch {
  kind: 'TYPE' | 'PACKAGE';
  title: string;
  subtitle?: string;
  questionCount: number;
  durationMinutes: number;
  categoryLabel: string;
  type?: ExamType;
  category?: QuestionCategory;
  sessionId?: string;
  pkg?: PracticePackage;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  questions: Question[];
  materials: Material[];
  shortVideos: ShortVideo[];
  practicePackages: PracticePackage[];
  packages: PremiumPackage[];
  payments: Payment[];
  commissionWithdrawals: CommissionWithdrawal[];
  emailLogs: EmailNotificationLog[];
  groupSessions: GroupSession[];
  leaderboards: LeaderboardEntry[];
  results: ExamResult[];
  settings: AppSettings;
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  announcements: AdminAnnouncement[];
  activeView: ActiveAppView;
  setActiveView: (view: ActiveAppView) => void;
  materiTab: 'MODUL' | 'SHORT_VIDEO';
  setMateriTab: (tab: 'MODUL' | 'SHORT_VIDEO') => void;
  pendingShortVideoId: string | null;
  setPendingShortVideoId: (id: string | null) => void;
  tryoutHubTab: TryoutHubTab;
  setTryoutHubTab: (tab: TryoutHubTab) => void;
  preferredUpgradePackageId: string | null;
  setPreferredUpgradePackageId: (pkgId: string | null) => void;
  examSession: ActiveExamSession | null;
  pendingExamLaunch: PendingExamLaunch | null;
  confirmPendingExamLaunch: () => void;
  cancelPendingExamLaunch: () => void;
  selectedResultReview: ExamResult | null;
  setSelectedResultReview: (res: ExamResult | null) => void;
  calculatorImportData: CalculatorImportPayload | null;
  openCalculatorWithResult: (res: ExamResult) => void;
  clearCalculatorImportData: () => void;
  authModalMode: 'NONE' | 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';
  setAuthModalMode: (mode: 'NONE' | 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD') => void;

  // Auth
  login: (email: string, password: string) => { success: boolean; message: string };
  register: (
    name: string,
    email: string,
    phone: string,
    password: string,
    referralCode?: string,
    extraProfile?: {
      info_source?: string;
      education?: string;
      current_job?: string;
      address?: string;
      age?: number;
    }
  ) => { success: boolean; message: string };
  resetPassword: (email: string, phone: string, newPassword: string) => { success: boolean; message: string };
  logout: () => void;
  updateCurrentUserProfile: (data: Partial<User>) => void;

  // Email Notification Log Helpers
  markEmailLogRead: (emailId: string) => void;
  markAllMyEmailsRead: () => void;

  // Affiliate & Referral Features
  validateReferralCode: (code: string, buyerUserId?: string) => ReferralValidationResult;
  joinAffiliateProgram: (
    desiredCode: string,
    motivation?: string,
    acceptedTerms?: boolean
  ) => { success: boolean; message: string; code?: string; status?: 'PENDING' | 'APPROVED' };
  updateAffiliateReferralCode: (newCode: string) => { success: boolean; message: string; code?: string };
  approveAffiliateApplication: (userId: string) => void;
  rejectAffiliateApplication: (userId: string, reason: string) => void;
  requestCommissionWithdrawal: (payload: {
    fullName: string;
    phone: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    identityNumber?: string;
    amount: number;
  }) => { success: boolean; message?: string; withdrawal?: CommissionWithdrawal; whatsappUrl?: string };
  toggleCommissionPaidStatus: (paymentId: string, isPaid: boolean) => void;
  markWithdrawalPaid: (withdrawalId: string, proofUrl?: string, notes?: string) => void;
  cancelWithdrawalByAdmin: (withdrawalId: string, reason: string) => { success: boolean; message: string };
  payPartnerCommissionDirect: (payload: {
    partnerId: string;
    amount: number;
    proofUrl?: string;
    notes?: string;
  }) => { success: boolean; message: string };
  updatePartnerByAdmin: (
    userId: string,
    payload: {
      full_name: string;
      email: string;
      phone: string;
      referral_code: string;
      affiliate_status: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
      affiliate_rejection_reason?: string;
      affiliate_bank_name?: string;
      affiliate_account_number?: string;
      affiliate_account_holder?: string;
    }
  ) => { success: boolean; message: string };
  removePartnerByAdmin: (userId: string, deleteUserAccount?: boolean) => void;

  // Exam Actions
  startExamByType: (type: ExamType, category?: QuestionCategory, sessionId?: string) => void;
  startExamByPackage: (pkg: PracticePackage) => void;
  answerQuestion: (questionId: string, answer: 'A' | 'B' | 'C' | 'D' | 'E') => void;
  toggleFlagQuestion: (questionId: string) => void;
  setQuestionIndex: (index: number) => void;
  finishCurrentExam: () => ExamResult;
  cancelExam: () => void;

  // Member Features
  submitPaymentProof: (
    packageId: string,
    paymentMethod: 'TRANSFER_BANK' | 'QRIS' | 'COD_WHATSAPP',
    bankName: string,
    senderName: string,
    proofUrl: string,
    referralCode?: string
  ) => void;
  registerGroupSession: (sessionId: string) => void;

  // Admin Features
  addPracticePackage: (pkg: Omit<PracticePackage, 'id' | 'created_at'>) => void;
  updatePracticePackage: (pkg: PracticePackage) => void;
  deletePracticePackage: (id: string) => void;
  addQuestion: (q: Omit<Question, 'id' | 'created_at'>) => void;
  updateQuestion: (q: Question) => void;
  deleteQuestion: (id: string) => void;
  bulkImportQuestions: (imported: Question[]) => void;
  assignQuestionsToPackage: (questionIds: string[], packageId: string) => number;
  removeQuestionFromPackage: (questionId: string, packageId: string) => void;
  approvePayment: (paymentId: string) => void;
  rejectPayment: (paymentId: string, reason: string) => void;
  manualTogglePremium: (userId: string, isPremium: boolean, days?: number) => void;
  manualSetMembershipTier: (userId: string, tier: MembershipType, days?: number) => void;
  addMaterial: (m: Omit<Material, 'id' | 'created_at'>) => void;
  updateMaterial: (m: Material) => void;
  deleteMaterial: (id: string) => void;
  addShortVideo: (v: Omit<ShortVideo, 'id' | 'created_at'>) => void;
  updateShortVideo: (v: ShortVideo) => void;
  deleteShortVideo: (id: string) => void;
  addGroupSession: (s: Omit<GroupSession, 'id' | 'created_at'>) => void;
  updateGroupSession: (s: GroupSession) => void;
  deleteGroupSession: (id: string) => void;
  addAnnouncement: (a: Omit<AdminAnnouncement, 'id' | 'created_at' | 'author_name'>) => void;
  updateAnnouncement: (a: AdminAnnouncement) => void;
  deleteAnnouncement: (id: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updatePassingGrade: (pg: PassingGradeConfig) => void;
  updateSkdCalculatorConfig: (cfg: SkdCalculatorConfig) => void;
  updatePackage: (pkg: PremiumPackage) => void;
  adjustActiveSubscribersDuration: (tierKey: MembershipType, deltaDays: number) => number;
  resetAllDemoData: () => void;
}

const STORAGE_KEYS = {
  USER: 'LOGINCPNS_USER_SESSION',
  USERS: 'LOGINCPNS_USERS',
  QUESTIONS: 'LOGINCPNS_QUESTIONS',
  MATERIALS: 'LOGINCPNS_MATERIALS',
  SHORT_VIDEOS: 'LOGINCPNS_SHORT_VIDEOS',
  PACKAGES: 'LOGINCPNS_PACKAGES',
  PRACTICE_PACKAGES: 'LOGINCPNS_PRACTICE_PACKAGES',
  PAYMENTS: 'LOGINCPNS_PAYMENTS',
  WITHDRAWALS: 'LOGINCPNS_WITHDRAWALS',
  EMAIL_LOGS: 'LOGINCPNS_EMAIL_LOGS',
  SESSIONS: 'LOGINCPNS_SESSIONS',
  RESULTS: 'LOGINCPNS_RESULTS',
  SETTINGS: 'LOGINCPNS_SETTINGS',
  LOGS: 'LOGINCPNS_LOGS',
  NOTIFS: 'LOGINCPNS_NOTIFS',
  ANNOUNCEMENTS: 'LOGINCPNS_ANNOUNCEMENTS'
};

function getStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, val: T) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn(`Failed writing ${key}`, e);
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const stored = getStorage<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
    const upgraded: User[] = stored.map((u): User => {
      const normalizedPasswordHash =
        !u.password_hash || u.password_hash.startsWith('sha256_mock_hash_')
          ? hashUserPassword(getDefaultSeedPassword(u))
          : u.password_hash;

      if (u.id === 'usr-superadmin') {
        const legacyAdminEmail = u.email.toLowerCase() === 'superadmin@cpns.id';
        const legacyAdminPassword = u.password_hash === hashUserPassword('AdminCpns2026!');
        return {
          ...u,
          email: legacyAdminEmail ? 'loginbimbelasn@gmail.com' : u.email,
          password_hash: legacyAdminPassword ? hashUserPassword('Sy@fr1z_@l') : normalizedPasswordHash,
          is_affiliate: true,
          affiliate_status: u.affiliate_status || ('APPROVED' as AffiliateStatus),
          referral_code: u.referral_code || 'LOGINCPNS',
          affiliate_joined_at: u.affiliate_joined_at || u.created_at
        };
      }
      if (u.id === 'usr-2' && !u.referral_code && u.is_affiliate === undefined) {
        return {
          ...u,
          password_hash: normalizedPasswordHash,
          is_affiliate: true,
          affiliate_status: 'APPROVED' as AffiliateStatus,
          affiliate_joined_at: '2025-02-01T09:00:00Z',
          affiliate_approved_at: '2025-02-01T09:10:00Z',
          affiliate_approved_by: 'Dr. Hendra Wijaya',
          referral_code: 'DIANCPNS',
          affiliate_bank_name: 'BSI (Bank Syariah Indonesia)',
          affiliate_account_number: '7098123456',
          affiliate_account_holder: 'Dian Paramitha'
        };
      }
      if (u.is_affiliate && !u.affiliate_status) {
        return { ...u, password_hash: normalizedPasswordHash, affiliate_status: 'APPROVED' as AffiliateStatus };
      }
      if (normalizedPasswordHash !== u.password_hash) {
        return { ...u, password_hash: normalizedPasswordHash };
      }
      return u;
    });
    const existingIds = new Set(upgraded.map(u => u.id));
    const missingSeedUsers = SEED_USERS.filter(su => !existingIds.has(su.id)).map(su => ({
      ...su,
      password_hash:
        !su.password_hash || su.password_hash.startsWith('sha256_mock_hash_')
          ? hashUserPassword(getDefaultSeedPassword(su))
          : su.password_hash
    }));
    return missingSeedUsers.length > 0 ? [...upgraded, ...missingSeedUsers] : upgraded;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = getStorage<User | null>(STORAGE_KEYS.USER, null);
    if (!saved || !saved.id) return null;
    const match = users.find(u => u.id === saved.id);
    if (!match || match.account_status === 'INACTIVE') return null;
    return match;
  });

  const [questions, setQuestions] = useState<Question[]>(() => getStorage(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS));
  const [practicePackages, setPracticePackages] = useState<PracticePackage[]>(() => getStorage(STORAGE_KEYS.PRACTICE_PACKAGES, SEED_PRACTICE_PACKAGES));
  const [materials, setMaterials] = useState<Material[]>(() => {
    const stored = getStorage<Material[]>(STORAGE_KEYS.MATERIALS, SEED_MATERIALS);
    const seedMap = new Map(SEED_MATERIALS.map(s => [s.id, s]));
    const upgraded = stored.map(m => {
      const seed = seedMap.get(m.id);
      if (seed && !m.key_points) {
        return {
          ...seed,
          file_url: m.file_url || seed.file_url,
          video_url: m.video_url || seed.video_url,
          is_active: m.is_active
        };
      }
      return m;
    });
    const existingIds = new Set(upgraded.map(m => m.id));
    const missingSeeds = SEED_MATERIALS.filter(s => !existingIds.has(s.id));
    if (missingSeeds.length === 0) return upgraded;
    // Order seed modules neatly before any custom materials
    const customMaterials = upgraded.filter(m => !seedMap.has(m.id));
    const orderedSeeds = SEED_MATERIALS.map(
      s => upgraded.find(m => m.id === s.id) || s
    );
    return [...orderedSeeds, ...customMaterials];
  });
  const [shortVideos, setShortVideos] = useState<ShortVideo[]>(() =>
    getStorage(STORAGE_KEYS.SHORT_VIDEOS, SEED_SHORT_VIDEOS)
  );
  const [packages, setPackages] = useState<PremiumPackage[]>(() => {
    const stored = getStorage<PremiumPackage[]>(STORAGE_KEYS.PACKAGES, SEED_PACKAGES);
    const seedMap = new Map(SEED_PACKAGES.map(s => [s.id, s]));
    const upgraded = stored.map(pkg => {
      const seed = seedMap.get(pkg.id);
      if (pkg.id === 'pkg-1' && seed) {
        const shouldUpgradeTitle =
          pkg.package_name === 'Paket Premium 1 Tahun' || !pkg.feature_items || !pkg.tier_key;
        return {
          ...seed,
          price: pkg.price === 99000 || pkg.price === 120000 ? seed.price : pkg.price,
          original_price: pkg.original_price ?? seed.original_price,
          promo_badge: pkg.promo_badge ?? seed.promo_badge,
          is_active: pkg.is_active ?? true,
          package_name: shouldUpgradeTitle ? seed.package_name : pkg.package_name,
          description: shouldUpgradeTitle ? seed.description : pkg.description,
          feature_items: pkg.feature_items || seed.feature_items
        };
      }
      if (pkg.id === 'pkg-2' && seed) {
        const shouldUpgradeTitle =
          pkg.package_name.includes('3 Bulan') || !pkg.feature_items || !pkg.tier_key;
        return {
          ...seed,
          price: pkg.price ?? seed.price,
          original_price: pkg.original_price,
          promo_badge: pkg.promo_badge,
          is_active: pkg.is_active ?? true,
          package_name: shouldUpgradeTitle ? seed.package_name : pkg.package_name,
          description: shouldUpgradeTitle ? seed.description : pkg.description,
          feature_items: pkg.feature_items || seed.feature_items
        };
      }
      if (pkg.id === 'pkg-standar' && seed) {
        return {
          ...seed,
          ...pkg,
          allow_discount: pkg.allow_discount ?? false,
          tier_key: 'STANDAR' as const,
          feature_items: pkg.feature_items || seed.feature_items
        };
      }
      return pkg;
    });
    const existingIds = new Set(upgraded.map(p => p.id));
    const missingSeeds = SEED_PACKAGES.filter(s => !existingIds.has(s.id));
    const combined = [...upgraded, ...missingSeeds];
    const order = ['pkg-standar', 'pkg-1', 'pkg-2'];
    return combined.sort((a, b) => {
      const ia = order.indexOf(a.id);
      const ib = order.indexOf(b.id);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  });
  const [payments, setPayments] = useState<Payment[]>(() => {
    const stored = getStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, SEED_PAYMENTS);
    const seedMap = new Map(SEED_PAYMENTS.map(s => [s.id, s]));
    return stored.map(p => {
      const seed = seedMap.get(p.id);
      if (seed && p.referral_code === undefined && seed.referral_code !== undefined) {
        return {
          ...seed,
          status: p.status,
          verified_by: p.verified_by,
          verified_at: p.verified_at,
          rejection_reason: p.rejection_reason
        };
      }
      return p;
    });
  });
  const [commissionWithdrawals, setCommissionWithdrawals] = useState<CommissionWithdrawal[]>(() =>
    getStorage(STORAGE_KEYS.WITHDRAWALS, SEED_WITHDRAWALS)
  );
  const [emailLogs, setEmailLogs] = useState<EmailNotificationLog[]>(() =>
    getStorage(STORAGE_KEYS.EMAIL_LOGS, SEED_EMAIL_LOGS)
  );
  const [groupSessions, setGroupSessions] = useState<GroupSession[]>(() => {
    const stored = getStorage<GroupSession[]>(STORAGE_KEYS.SESSIONS, SEED_GROUP_SESSIONS);
    const existingIds = new Set(stored.map(s => s.id));
    const missing = SEED_GROUP_SESSIONS.filter(s => !existingIds.has(s.id));
    return missing.length > 0 ? [...stored, ...missing] : stored;
  });
  const [leaderboards, setLeaderboards] = useState<LeaderboardEntry[]>(SEED_LEADERBOARD);
  const [results, setResults] = useState<ExamResult[]>(() => getStorage(STORAGE_KEYS.RESULTS, SEED_RESULTS));
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = getStorage<AppSettings>(STORAGE_KEYS.SETTINGS, SEED_SETTINGS);
    const hasLegacyDemoBanks = stored.bank_accounts?.some(
      b => b.account_number === '8830-1234-5678' || b.account_number === '137-00-9876543-2'
    );
    const base =
      hasLegacyDemoBanks || !stored.bank_accounts || stored.bank_accounts.length === 0
        ? { ...stored, bank_accounts: SEED_SETTINGS.bank_accounts }
        : stored;
    return {
      ...SEED_SETTINGS,
      ...base,
      admin_email: base.admin_email || OFFICIAL_SENDER_EMAIL,
      affiliate_commission_amount:
        base.affiliate_commission_amount ?? SEED_SETTINGS.affiliate_commission_amount ?? AFFILIATE_COMMISSION_AMOUNT,
      referral_discount_amount:
        base.referral_discount_amount ?? SEED_SETTINGS.referral_discount_amount ?? REFERRAL_DISCOUNT_AMOUNT,
      min_commission_withdrawal:
        base.min_commission_withdrawal ?? SEED_SETTINGS.min_commission_withdrawal ?? MIN_COMMISSION_WITHDRAWAL,
      lock_materials_for_premium_only:
        base.lock_materials_for_premium_only ?? SEED_SETTINGS.lock_materials_for_premium_only ?? true,
      standar_questions_only:
        base.standar_questions_only ?? SEED_SETTINGS.standar_questions_only ?? true,
      skd_calculator_config: {
        ...DEFAULT_SKD_CALCULATOR_CONFIG,
        ...(SEED_SETTINGS.skd_calculator_config || {}),
        ...(base.skd_calculator_config || {})
      }
    };
  });

  const activeCommissionAmount = settings.affiliate_commission_amount ?? AFFILIATE_COMMISSION_AMOUNT;
  const activeReferralDiscount = settings.referral_discount_amount ?? REFERRAL_DISCOUNT_AMOUNT;
  const activeMinWithdrawal = settings.min_commission_withdrawal ?? MIN_COMMISSION_WITHDRAWAL;
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getStorage(STORAGE_KEYS.LOGS, SEED_AUDIT_LOGS));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getStorage(STORAGE_KEYS.NOTIFS, SEED_NOTIFICATIONS));
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>(() => getStorage(STORAGE_KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS));

  const [activeView, setActiveView] = useState<ActiveAppView>(() => {
    if (!currentUser) return 'landing';
    return currentUser.role === 'SUPER_ADMIN' ? 'admin-dashboard' : 'dashboard';
  });
  const [materiTab, setMateriTab] = useState<'MODUL' | 'SHORT_VIDEO'>('MODUL');
  const [pendingShortVideoId, setPendingShortVideoId] = useState<string | null>(null);
  const [tryoutHubTab, setTryoutHubTab] = useState<TryoutHubTab>('TRYOUT_SKD');
  const [preferredUpgradePackageId, setPreferredUpgradePackageId] = useState<string | null>(null);
  const [examSession, setExamSession] = useState<ActiveExamSession | null>(null);
  const [pendingExamLaunch, setPendingExamLaunch] = useState<PendingExamLaunch | null>(null);
  const [selectedResultReview, setSelectedResultReview] = useState<ExamResult | null>(null);
  const [calculatorImportData, setCalculatorImportData] = useState<CalculatorImportPayload | null>(null);
  const [authModalMode, setAuthModalMode] = useState<'NONE' | 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'>('NONE');

  // Sync state to localStorage (only persist single active session when logged in)
  useEffect(() => setStorage(STORAGE_KEYS.USERS, users), [users]);
  useEffect(() => {
    if (currentUser) {
      setStorage(STORAGE_KEYS.USER, currentUser);
    } else {
      try {
        localStorage.removeItem(STORAGE_KEYS.USER);
      } catch {
        // ignore
      }
    }
  }, [currentUser]);
  useEffect(() => setStorage(STORAGE_KEYS.QUESTIONS, questions), [questions]);
  useEffect(() => setStorage(STORAGE_KEYS.PRACTICE_PACKAGES, practicePackages), [practicePackages]);
  useEffect(() => setStorage(STORAGE_KEYS.MATERIALS, materials), [materials]);
  useEffect(() => setStorage(STORAGE_KEYS.SHORT_VIDEOS, shortVideos), [shortVideos]);
  useEffect(() => setStorage(STORAGE_KEYS.PACKAGES, packages), [packages]);
  useEffect(() => setStorage(STORAGE_KEYS.PAYMENTS, payments), [payments]);
  useEffect(() => setStorage(STORAGE_KEYS.WITHDRAWALS, commissionWithdrawals), [commissionWithdrawals]);
  useEffect(() => setStorage(STORAGE_KEYS.EMAIL_LOGS, emailLogs), [emailLogs]);
  useEffect(() => setStorage(STORAGE_KEYS.SESSIONS, groupSessions), [groupSessions]);
  useEffect(() => setStorage(STORAGE_KEYS.RESULTS, results), [results]);
  useEffect(() => setStorage(STORAGE_KEYS.SETTINGS, settings), [settings]);
  useEffect(() => setStorage(STORAGE_KEYS.LOGS, auditLogs), [auditLogs]);
  useEffect(() => setStorage(STORAGE_KEYS.NOTIFS, notifications), [notifications]);
  useEffect(() => setStorage(STORAGE_KEYS.ANNOUNCEMENTS, announcements), [announcements]);

  const addAudit = (action: string, entityType: string, entityId: string, details: string) => {
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      actor_id: currentUser ? currentUser.id : 'anonymous',
      actor_name: currentUser ? currentUser.full_name : 'Pengunjung',
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      created_at: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const addNotification = (title: string, message: string, type: 'PAYMENT' | 'PREMIUM' | 'TRYOUT' | 'ANNOUNCEMENT', userId?: string) => {
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      user_id: userId,
      title,
      message,
      type,
      created_at: new Date().toISOString(),
      is_read: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const recordEmailLog = (params: {
    recipientUserId: string;
    recipientName: string;
    recipientEmail: string;
    subject: string;
    body: string;
    category: EmailLogCategory;
    relatedEntityId?: string;
  }) => {
    const sender = settings.admin_email || OFFICIAL_SENDER_EMAIL;
    const entry: EmailNotificationLog = {
      id: `eml-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      recipient_user_id: params.recipientUserId,
      recipient_name: params.recipientName,
      recipient_email: params.recipientEmail,
      sender_email: sender,
      subject: params.subject,
      body: params.body,
      category: params.category,
      related_entity_id: params.relatedEntityId,
      is_read: false,
      created_at: new Date().toISOString()
    };
    setEmailLogs(prev => [entry, ...prev]);
    addAudit(
      'EMAIL_NOTIFICATION_LOG',
      'EMAIL_LOGS',
      entry.id,
      `Log email [${params.category}] dari ${sender} ke ${params.recipientEmail}: ${params.subject}`
    );
  };

  const markEmailLogRead = (emailId: string) => {
    setEmailLogs(prev => prev.map(e => (e.id === emailId ? { ...e, is_read: true } : e)));
  };

  const markAllMyEmailsRead = () => {
    if (!currentUser) return;
    setEmailLogs(prev =>
      prev.map(e => (e.recipient_user_id === currentUser.id ? { ...e, is_read: true } : e))
    );
  };

  // Auth Methods (Single Active Account Enforcement)
  const login = (email: string, password: string) => {
    if (currentUser) {
      return {
        success: false,
        message: `Anda masih masuk sebagai ${currentUser.full_name}. Silakan keluar (Logout) terlebih dahulu untuk beralih ke akun lain.`
      };
    }
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return { success: false, message: 'Email tidak ditemukan. Silakan periksa kembali atau daftar akun baru.' };
    }
    if (found.account_status === 'INACTIVE') {
      return { success: false, message: 'Akun Anda sedang dinonaktifkan. Hubungi admin di WhatsApp 081312139893.' };
    }
    const expectedHash =
      found.password_hash && !found.password_hash.startsWith('sha256_mock_hash_')
        ? found.password_hash
        : hashUserPassword(getDefaultSeedPassword(found));
    if (!password || hashUserPassword(password) !== expectedHash) {
      return { success: false, message: 'Email atau password tidak sesuai. Silakan periksa kembali.' };
    }

    setCurrentUser(found);
    if (found.role === 'SUPER_ADMIN') {
      setActiveView('admin-dashboard');
    } else {
      setActiveView('dashboard');
    }
    setAuthModalMode('NONE');
    addAudit('LOGIN', 'USERS', found.id, `Pengguna ${found.full_name} berhasil masuk (${found.role})`);
    return { success: true, message: 'Login berhasil.' };
  };

  const register = (
    name: string,
    email: string,
    phone: string,
    password: string,
    referralCode?: string,
    extraProfile?: {
      info_source?: string;
      education?: string;
      current_job?: string;
      address?: string;
      age?: number;
    }
  ) => {
    if (currentUser) {
      return {
        success: false,
        message: `Anda masih masuk sebagai ${currentUser.full_name}. Silakan keluar (Logout) terlebih dahulu sebelum mendaftarkan akun baru.`
      };
    }
    const cleanEmail = email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' };
    }
    const cleanRef = referralCode?.trim().toUpperCase();
    const newUser: User = {
      id: `usr-${Date.now()}`,
      full_name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      password_hash: hashUserPassword(password),
      photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`,
      role: 'MEMBER',
      account_status: 'ACTIVE',
      membership_type: 'FREE',
      registered_referral_code: cleanRef || DEFAULT_REFERRAL_CODE,
      info_source: extraProfile?.info_source?.trim() || undefined,
      education: extraProfile?.education?.trim() || undefined,
      current_job: extraProfile?.current_job?.trim() || undefined,
      address: extraProfile?.address?.trim() || undefined,
      age: extraProfile?.age,
      created_at: new Date().toISOString()
    };
    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setActiveView('dashboard');
    setAuthModalMode('NONE');
    addAudit('REGISTER', 'USERS', newUser.id, `Pendaftaran akun baru: ${newUser.full_name}${cleanRef ? ` (Kode Referral: ${cleanRef})` : ''}`);
    addNotification('Pendaftaran Akun Berhasil', `Selamat datang di LOGIN CPNS, ${newUser.full_name}!`, 'ANNOUNCEMENT', newUser.id);
    recordEmailLog({
      recipientUserId: newUser.id,
      recipientName: newUser.full_name,
      recipientEmail: newUser.email,
      subject: '[LOGIN CPNS] Pendaftaran Akun Berhasil - Selamat Bergabung!',
      body: `Halo ${newUser.full_name},\n\nAkun LOGIN CPNS Anda telah aktif dengan email ${newUser.email}.\nKode referral tersimpan: ${newUser.registered_referral_code} (hemat Rp ${activeReferralDiscount.toLocaleString('id-ID')} saat upgrade Paket Premium).\n\nSeluruh pemberitahuan status pembayaran, aktivasi akun Premium, dan pencairan komisi akan tercatat ke email ini.\n\nSalam Sukses ASN,\nTim LOGIN CPNS (${settings.admin_email || OFFICIAL_SENDER_EMAIL})`,
      category: 'ACCOUNT_WELCOME',
      relatedEntityId: newUser.id
    });
    return { success: true, message: 'Pendaftaran berhasil! Akun Anda aktif.' };
  };

  const resetPassword = (email: string, phone: string, newPassword: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return { success: false, message: 'Email tidak terdaftar dalam sistem.' };
    }
    if (found.role === 'SUPER_ADMIN') {
      return {
        success: false,
        message: 'Reset password akun Super Admin tidak dapat dilakukan melalui halaman publik. Ubah password melalui menu Profil Saya setelah login.'
      };
    }
    if (normalizePhoneDigits(found.phone) !== normalizePhoneDigits(phone)) {
      return {
        success: false,
        message: 'Nomor WhatsApp tidak cocok dengan data akun terdaftar.'
      };
    }
    const newHash = hashUserPassword(newPassword);
    setUsers(prev =>
      prev.map(u =>
        u.id === found.id ? { ...u, password_hash: newHash, updated_at: new Date().toISOString() } : u
      )
    );
    addAudit('RESET_PASSWORD', 'USERS', found.id, `Reset password berhasil untuk ${cleanEmail}`);
    return { success: true, message: 'Password Anda telah berhasil direset. Silakan login dengan password baru.' };
  };

  const logout = () => {
    if (currentUser) {
      addAudit('LOGOUT', 'USERS', currentUser.id, `Pengguna ${currentUser.full_name} keluar`);
    }
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch {
      // ignore
    }
    setExamSession(null);
    setPendingExamLaunch(null);
    setSelectedResultReview(null);
    setCalculatorImportData(null);
    setCurrentUser(null);
    setActiveView('landing');
    setAuthModalMode('NONE');
  };

  const updateCurrentUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data, updated_at: new Date().toISOString() };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => (u.id === currentUser.id ? updated : u)));
    addAudit('UPDATE_PROFILE', 'USERS', currentUser.id, 'Memperbarui data profil');
  };

  // Affiliate & Referral Logic
  const validateReferralCode = (code: string, buyerUserId?: string): ReferralValidationResult => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      return {
        isValid: false,
        isEmpty: true,
        discount: 0,
        commission: 0,
        message: `Masukkan kode referral temanmu (atau pakai kode bawaan ${DEFAULT_REFERRAL_CODE}) untuk dapatkan diskon Rp ${activeReferralDiscount.toLocaleString('id-ID')}.`
      };
    }

    if (normalized === DEFAULT_REFERRAL_CODE) {
      const adminOwner = users.find(u => u.id === 'usr-superadmin') || users.find(u => u.role === 'SUPER_ADMIN');
      return {
        isValid: true,
        isOfficial: true,
        normalizedCode: DEFAULT_REFERRAL_CODE,
        discount: activeReferralDiscount,
        commission: 0,
        affiliateUser: adminOwner,
        affiliateName: 'Official LOGIN CPNS (Admin)',
        message: `Kode referral bawaan ${DEFAULT_REFERRAL_CODE} aktif! Anda mendapat diskon Rp ${activeReferralDiscount.toLocaleString('id-ID')}.`
      };
    }

    const pendingMatch = users.find(
      u => u.referral_code && u.referral_code.toUpperCase() === normalized && u.affiliate_status === 'PENDING'
    );
    if (pendingMatch) {
      return {
        isValid: false,
        isEmpty: false,
        discount: 0,
        commission: 0,
        message: `Kode referral "${normalized}" sedang menunggu persetujuan Admin dan belum dapat digunakan. Gunakan kode teman aktif atau ${DEFAULT_REFERRAL_CODE}.`
      };
    }

    const partner = users.find(
      u =>
        u.is_affiliate &&
        (u.affiliate_status === undefined || u.affiliate_status === 'APPROVED') &&
        u.referral_code &&
        u.referral_code.toUpperCase() === normalized
    );

    if (!partner) {
      return {
        isValid: false,
        isEmpty: false,
        discount: 0,
        commission: 0,
        message: `Kode referral "${normalized}" tidak terdaftar atau belum disetujui Admin. Periksa kembali atau gunakan kode bawaan ${DEFAULT_REFERRAL_CODE}.`
      };
    }

    if (buyerUserId && partner.id === buyerUserId) {
      return {
        isValid: false,
        isSelfReferral: true,
        discount: 0,
        commission: 0,
        message: `Anda tidak dapat menggunakan kode referral milik Anda sendiri. Gunakan kode teman atau ${DEFAULT_REFERRAL_CODE}.`
      };
    }

    const isSuperAdminOwner = partner.role === 'SUPER_ADMIN';
    return {
      isValid: true,
      isOfficial: isSuperAdminOwner,
      normalizedCode: normalized,
      discount: activeReferralDiscount,
      commission: isSuperAdminOwner ? 0 : activeCommissionAmount,
      affiliateUser: partner,
      affiliateName: partner.full_name,
      message: `Kode referral ${normalized} (Mitra: ${partner.full_name}) aktif! Anda hemat Rp ${activeReferralDiscount.toLocaleString('id-ID')}.`
    };
  };

  const joinAffiliateProgram = (desiredCode: string, motivation?: string, acceptedTerms = false) => {
    if (!currentUser) {
      return { success: false, message: 'Silakan masuk ke akun Anda terlebih dahulu.' };
    }
    if (!acceptedTerms) {
      return {
        success: false,
        message: 'Anda wajib membaca dan menyetujui Syarat & Ketentuan Program Mitra Afiliasi LOGIN CPNS.'
      };
    }
    const cleanCode = desiredCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (cleanCode.length < 4 || cleanCode.length > 20) {
      return { success: false, message: 'Kode referral harus terdiri dari 4–20 karakter (huruf/angka).' };
    }
    if (cleanCode === DEFAULT_REFERRAL_CODE && currentUser.role !== 'SUPER_ADMIN') {
      return { success: false, message: `Kode ${DEFAULT_REFERRAL_CODE} sudah digunakan sebagai kode bawaan resmi.` };
    }
    const duplicate = users.find(
      u => u.id !== currentUser.id && u.referral_code && u.referral_code.toUpperCase() === cleanCode
    );
    if (duplicate) {
      return { success: false, message: `Kode "${cleanCode}" sudah dipakai atau diajukan mitra lain. Silakan pilih kombinasi lain.` };
    }

    const now = new Date().toISOString();
    const isAdmin = currentUser.role === 'SUPER_ADMIN';
    const updated: User = {
      ...currentUser,
      is_affiliate: isAdmin,
      affiliate_status: isAdmin ? 'APPROVED' : 'PENDING',
      affiliate_requested_at: now,
      affiliate_joined_at: isAdmin ? currentUser.affiliate_joined_at || now : undefined,
      affiliate_approved_at: isAdmin ? now : undefined,
      affiliate_motivation: motivation?.trim() || currentUser.affiliate_motivation,
      affiliate_terms_accepted_at: now,
      affiliate_rejection_reason: undefined,
      referral_code: cleanCode,
      updated_at: now
    };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => (u.id === currentUser.id ? updated : u)));
    addAudit(
      'REQUEST_JOIN_AFFILIATE',
      'USERS',
      currentUser.id,
      `Mengajukan pendaftaran Mitra Afiliasi dengan kode: ${cleanCode} (Status: ${updated.affiliate_status})`
    );
    addNotification(
      isAdmin ? 'Mitra Afiliasi Aktif' : 'Pengajuan Mitra Dikirim ke Admin',
      isAdmin
        ? `Kode referral "${cleanCode}" telah aktif.`
        : `Pengajuan kode referral "${cleanCode}" sedang ditinjau Admin untuk mencegah penyalahgunaan. Notifikasi persetujuan akan dikirim ke ${currentUser.email}.`,
      'ANNOUNCEMENT',
      currentUser.id
    );
    recordEmailLog({
      recipientUserId: currentUser.id,
      recipientName: currentUser.full_name,
      recipientEmail: currentUser.email,
      subject: '[LOGIN CPNS] Pengajuan Mitra Afiliasi Diterima - Menunggu Persetujuan Admin',
      body: `Halo ${currentUser.full_name},\n\nTerima kasih telah mendaftar sebagai calon Mitra Afiliasi LOGIN CPNS.\n\nDetail Pengajuan:\n- Usulan Kode Referral: ${cleanCode}\n- Status Saat Ini: MENUNGGU PERSETUJUAN ADMIN\n\nSesuai ketentuan keamanan & kepatuhan platform, Admin akan meninjau permohonan Anda sebelum kode referral diaktifkan.\n\nSalam Hormat,\nTim LOGIN CPNS (${settings.admin_email || OFFICIAL_SENDER_EMAIL})`,
      category: 'AFFILIATE_REQUESTED',
      relatedEntityId: currentUser.id
    });
    return {
      success: true,
      message: isAdmin
        ? `Kode mitra aktif: ${cleanCode}`
        : `Pengajuan Mitra Afiliasi dengan kode "${cleanCode}" berhasil dikirim! Menunggu persetujuan Super Admin sebelum kode dapat digunakan.`,
      code: cleanCode,
      status: updated.affiliate_status as 'PENDING' | 'APPROVED'
    };
  };

  const approveAffiliateApplication = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    const now = new Date().toISOString();
    const adminName = currentUser?.full_name || 'Super Admin';
    const updatedTarget: User = {
      ...target,
      is_affiliate: true,
      affiliate_status: 'APPROVED',
      affiliate_joined_at: target.affiliate_joined_at || now,
      affiliate_approved_at: now,
      affiliate_approved_by: adminName,
      affiliate_rejection_reason: undefined,
      updated_at: now
    };
    setUsers(prev => prev.map(u => (u.id === userId ? updatedTarget : u)));
    if (currentUser?.id === userId) {
      setCurrentUser(updatedTarget);
    }
    addAudit(
      'APPROVE_AFFILIATE',
      'USERS',
      userId,
      `Menyetujui Mitra Afiliasi ${target.full_name} dengan kode referral ${target.referral_code || '-'}`
    );
    addNotification(
      'Selamat! Pengajuan Mitra Afiliasi Disetujui',
      `Akun Mitra Afiliasi Anda telah disetujui Admin! Kode referral "${target.referral_code}" kini aktif dan siap dibagikan (Komisi Rp ${activeCommissionAmount.toLocaleString('id-ID')}/peserta lunas, min. pencairan Rp ${activeMinWithdrawal.toLocaleString('id-ID')}).`,
      'ANNOUNCEMENT',
      userId
    );
    recordEmailLog({
      recipientUserId: target.id,
      recipientName: target.full_name,
      recipientEmail: target.email,
      subject: `[LOGIN CPNS] Selamat! Akun Mitra Afiliasi Anda Disetujui (Kode: ${target.referral_code})`,
      body: `Halo ${target.full_name},\n\nPengajuan Anda sebagai Mitra Afiliasi LOGIN CPNS telah DISETUJUI oleh Admin (${adminName}).\n\nInformasi Mitra:\n- Kode Referral Aktif: ${target.referral_code}\n- Komisi Mitra: Rp ${activeCommissionAmount.toLocaleString('id-ID')} per peserta lunas\n- Diskon Pembeli: Rp ${activeReferralDiscount.toLocaleString('id-ID')} otomatis\n- Minimal Pencairan Komisi: Rp ${activeMinWithdrawal.toLocaleString('id-ID')}\n\nAnda kini dapat beralih ke Panel Mitra melalui menu Profil Saya untuk membagikan kode dan memantau laporan komisi.\n\nSalam Sukses,\nTim LOGIN CPNS (${settings.admin_email || OFFICIAL_SENDER_EMAIL})`,
      category: 'AFFILIATE_APPROVED',
      relatedEntityId: userId
    });
  };

  const rejectAffiliateApplication = (userId: string, reason: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    const now = new Date().toISOString();
    const cleanReason = reason.trim() || 'Tidak memenuhi syarat verifikasi kemitraan.';
    const updatedTarget: User = {
      ...target,
      is_affiliate: false,
      affiliate_status: 'REJECTED',
      affiliate_rejection_reason: cleanReason,
      updated_at: now
    };
    setUsers(prev => prev.map(u => (u.id === userId ? updatedTarget : u)));
    if (currentUser?.id === userId) {
      setCurrentUser(updatedTarget);
    }
    addAudit(
      'REJECT_AFFILIATE',
      'USERS',
      userId,
      `Menolak/menonaktifkan Mitra Afiliasi ${target.full_name}: ${cleanReason}`
    );
    addNotification(
      'Status Mitra Afiliasi Ditolak / Dinonaktifkan',
      `Pengajuan mitra Anda belum disetujui: ${cleanReason}`,
      'ANNOUNCEMENT',
      userId
    );
    recordEmailLog({
      recipientUserId: target.id,
      recipientName: target.full_name,
      recipientEmail: target.email,
      subject: '[LOGIN CPNS] Pemberitahuan Status Pengajuan Mitra Afiliasi',
      body: `Halo ${target.full_name},\n\nPermohonan/status Mitra Afiliasi Anda untuk kode ${target.referral_code || '-'} belum dapat disetujui atau telah dinonaktifkan.\n\nAlasan: ${cleanReason}\n\nJika ada pertanyaan atau klarifikasi, silakan hubungi Admin via WhatsApp ${settings.admin_whatsapp}.\n\nSalam Hormat,\nTim LOGIN CPNS (${settings.admin_email || OFFICIAL_SENDER_EMAIL})`,
      category: 'AFFILIATE_REJECTED',
      relatedEntityId: userId
    });
  };

  const updateAffiliateReferralCode = (newCode: string) => {
    if (!currentUser) {
      return { success: false, message: 'Silakan login terlebih dahulu.' };
    }
    if (!currentUser.is_affiliate || currentUser.affiliate_status !== 'APPROVED') {
      return { success: false, message: 'Akun mitra Anda harus disetujui Admin terlebih dahulu sebelum mengubah kode.' };
    }
    const cleanCode = newCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (cleanCode.length < 4 || cleanCode.length > 20) {
      return { success: false, message: 'Kode referral harus 4–20 karakter huruf/angka.' };
    }
    if (cleanCode === DEFAULT_REFERRAL_CODE && currentUser.role !== 'SUPER_ADMIN') {
      return { success: false, message: `Kode ${DEFAULT_REFERRAL_CODE} adalah kode resmi platform.` };
    }
    const duplicate = users.find(
      u => u.id !== currentUser.id && u.referral_code && u.referral_code.toUpperCase() === cleanCode
    );
    if (duplicate) {
      return { success: false, message: `Kode "${cleanCode}" sudah digunakan mitra lain.` };
    }

    const updated: User = {
      ...currentUser,
      referral_code: cleanCode,
      updated_at: new Date().toISOString()
    };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => (u.id === currentUser.id ? updated : u)));
    addAudit('UPDATE_REFERRAL_CODE', 'USERS', currentUser.id, `Mengubah kode referral mitra menjadi: ${cleanCode}`);
    return { success: true, message: `Kode referral berhasil diperbarui menjadi ${cleanCode}.`, code: cleanCode };
  };

  const requestCommissionWithdrawal = (payload: {
    fullName: string;
    phone: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    identityNumber?: string;
    amount: number;
  }) => {
    if (!currentUser) {
      return { success: false, message: 'Silakan masuk ke akun Anda terlebih dahulu.' };
    }
    if (!currentUser.is_affiliate || currentUser.affiliate_status !== 'APPROVED') {
      return { success: false, message: 'Status Mitra Afiliasi Anda belum disetujui oleh Admin.' };
    }
    if (payload.amount < activeMinWithdrawal) {
      return {
        success: false,
        message: `Minimal pencairan komisi mitra adalah Rp ${activeMinWithdrawal.toLocaleString('id-ID')}.`
      };
    }

    const now = new Date().toISOString();
    const updatedUser: User = {
      ...currentUser,
      full_name: payload.fullName.trim() || currentUser.full_name,
      phone: payload.phone.trim() || currentUser.phone,
      affiliate_bank_name: payload.bankName.trim(),
      affiliate_account_number: payload.accountNumber.trim(),
      affiliate_account_holder: payload.accountHolder.trim(),
      updated_at: now
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));

    const withdrawal: CommissionWithdrawal = {
      id: `wd-${Date.now()}`,
      affiliate_user_id: currentUser.id,
      affiliate_name: updatedUser.full_name,
      affiliate_email: updatedUser.email,
      affiliate_phone: updatedUser.phone,
      referral_code: currentUser.referral_code || '-',
      amount: payload.amount,
      bank_name: payload.bankName.trim(),
      account_number: payload.accountNumber.trim(),
      account_holder: payload.accountHolder.trim(),
      identity_number: payload.identityNumber?.trim() || undefined,
      status: 'REQUESTED',
      requested_at: now
    };
    setCommissionWithdrawals(prev => [withdrawal, ...prev]);
    addAudit(
      'REQUEST_COMMISSION_WITHDRAWAL',
      'WITHDRAWALS',
      withdrawal.id,
      `Mitra ${updatedUser.full_name} (${withdrawal.referral_code}) mengajukan pencairan komisi Rp ${payload.amount.toLocaleString('id-ID')} ke ${payload.bankName} ${payload.accountNumber}`
    );

    recordEmailLog({
      recipientUserId: updatedUser.id,
      recipientName: updatedUser.full_name,
      recipientEmail: updatedUser.email,
      subject: `[LOGIN CPNS] Pengajuan Pencairan Komisi Mitra Rp ${payload.amount.toLocaleString('id-ID')} Diterima`,
      body: `Halo ${updatedUser.full_name},\n\nPengajuan pencairan komisi mitra Anda telah tercatat dalam sistem.\n\nDetail Pengajuan:\n- ID Pencairan: ${withdrawal.id}\n- Kode Referral: ${withdrawal.referral_code}\n- Nominal Pencairan: Rp ${payload.amount.toLocaleString('id-ID')}\n- Bank / E-Wallet: ${withdrawal.bank_name}\n- No. Rekening: ${withdrawal.account_number} a.n. ${withdrawal.account_holder}\n- Status: MENUNGGU TRANSFER ADMIN\n\nAdmin akan memproses transfer maksimal 1–3 hari kerja sesuai Syarat & Ketentuan Kemitraan.\n\nSalam Sukses,\nTim LOGIN CPNS (${settings.admin_email || OFFICIAL_SENDER_EMAIL})`,
      category: 'COMMISSION_WITHDRAWAL_REQUESTED',
      relatedEntityId: withdrawal.id
    });

    const rawWa = (settings.admin_whatsapp || '081312139893').replace(/\D/g, '');
    const waPhone = rawWa.startsWith('0') ? `62${rawWa.slice(1)}` : rawWa.startsWith('62') ? rawWa : `62${rawWa}`;
    const waText = [
      'Halo Admin LOGIN CPNS, saya ingin mengajukan PENCAIRAN KOMISI AFILIASI:',
      `- Nama Mitra: ${updatedUser.full_name}`,
      `- Email Akun: ${updatedUser.email}`,
      `- No. WhatsApp: ${updatedUser.phone}`,
      payload.identityNumber ? `- No. Identitas (NIK): ${payload.identityNumber}` : null,
      `- Kode Referral: ${currentUser.referral_code || '-'}`,
      `- Nominal Pencairan: Rp ${payload.amount.toLocaleString('id-ID')}`,
      `- Bank / E-Wallet: ${payload.bankName.trim()}`,
      `- No. Rekening: ${payload.accountNumber.trim()}`,
      `- Atas Nama: ${payload.accountHolder.trim()}`,
      '',
      'Mohon dibantu proses pencairannya. Terima kasih!'
    ]
      .filter(Boolean)
      .join('\n');

    const whatsappUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}`;
    return { success: true, withdrawal, whatsappUrl };
  };

  const toggleCommissionPaidStatus = (paymentId: string, isPaid: boolean) => {
    const target = payments.find(p => p.id === paymentId);
    if (!target) return;
    const now = new Date().toISOString();
    const adminName = currentUser?.full_name || 'Super Admin';

    setPayments(prev =>
      prev.map(p =>
        p.id === paymentId
          ? {
              ...p,
              commission_status: isPaid ? 'PAID' : 'UNPAID',
              commission_paid_at: isPaid ? now : undefined,
              commission_paid_by: isPaid ? adminName : undefined
            }
          : p
      )
    );

    addAudit(
      isPaid ? 'PAY_COMMISSION' : 'UNPAY_COMMISSION',
      'PAYMENTS',
      paymentId,
      `${isPaid ? 'Menandai komisi SUDAH DIBAYARKAN' : 'Mengembalikan status komisi ke BELUM DIBAYAR'} sebesar Rp ${(target.affiliate_commission || 0).toLocaleString('id-ID')} untuk Mitra ${target.affiliate_name || '-'}`
    );

    if (isPaid && target.affiliate_user_id && target.affiliate_user_id !== 'usr-superadmin') {
      const partnerUser = users.find(u => u.id === target.affiliate_user_id);
      const commAmount = target.affiliate_commission || activeCommissionAmount;
      addNotification(
        'Komisi Afiliasi Telah Dibayarkan!',
        `Komisi Rp ${commAmount.toLocaleString('id-ID')} dari peserta ${target.user_name} telah ditandai SUDAH DIBAYARKAN oleh Admin.`,
        'PAYMENT',
        target.affiliate_user_id
      );
      if (partnerUser) {
        recordEmailLog({
          recipientUserId: partnerUser.id,
          recipientName: partnerUser.full_name,
          recipientEmail: partnerUser.email,
          subject: `[LOGIN CPNS] Komisi Mitra Rp ${commAmount.toLocaleString('id-ID')} Telah Dibayarkan`,
          body: `Halo ${partnerUser.full_name},\n\nKomisi afiliasi Anda sebesar Rp ${commAmount.toLocaleString('id-ID')} dari peserta ${target.user_name} (Kode: ${target.referral_code || partnerUser.referral_code}) telah ditandai SUDAH DIBAYARKAN oleh Admin (${adminName}).\n\nTerima kasih telah bermitra bersama LOGIN CPNS!\n\nSalam Sukses,\nTim LOGIN CPNS (${settings.admin_email || OFFICIAL_SENDER_EMAIL})`,
          category: 'COMMISSION_PAID',
          relatedEntityId: paymentId
        });
      }
    }
  };

  const markPaymentsCommissionSettled = (
    partnerId: string,
    partnerCodeUpper: string | undefined,
    targetAmount: number,
    now: string,
    adminName: string,
    proofUrl?: string
  ) => {
    setPayments(prev => {
      const matchingUnpaidIds = prev
        .filter(
          p =>
            (p.affiliate_user_id === partnerId ||
              (partnerCodeUpper && p.referral_code?.toUpperCase() === partnerCodeUpper)) &&
            p.status === 'APPROVED' &&
            (p.affiliate_commission || 0) > 0 &&
            p.commission_status !== 'PAID'
        )
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      let remaining = targetAmount;
      const idsToMark = new Set<string>();
      for (const p of matchingUnpaidIds) {
        const comm = p.affiliate_commission || activeCommissionAmount;
        if (remaining >= comm || idsToMark.size === 0) {
          idsToMark.add(p.id);
          remaining -= comm;
        }
        if (remaining <= 0) break;
      }

      return prev.map(p =>
        idsToMark.has(p.id)
          ? {
              ...p,
              commission_status: 'PAID',
              commission_paid_at: now,
              commission_paid_by: adminName,
              commission_proof_url: proofUrl || p.commission_proof_url
            }
          : p
      );
    });
  };

  const markWithdrawalPaid = (withdrawalId: string, proofUrl?: string, notes?: string) => {
    const wd = commissionWithdrawals.find(w => w.id === withdrawalId);
    if (!wd) return;
    const now = new Date().toISOString();
    const adminName = currentUser?.full_name || 'Super Admin';
    const cleanProof = proofUrl?.trim() || wd.proof_url;
    const cleanNotes = notes?.trim() || wd.notes;

    setCommissionWithdrawals(prev =>
      prev.map(item =>
        item.id === withdrawalId
          ? {
              ...item,
              status: 'PAID',
              paid_at: now,
              paid_by: adminName,
              proof_url: cleanProof,
              notes: cleanNotes
            }
          : item
      )
    );

    const partnerUser = users.find(u => u.id === wd.affiliate_user_id);
    markPaymentsCommissionSettled(
      wd.affiliate_user_id,
      partnerUser?.referral_code?.toUpperCase() || wd.referral_code?.toUpperCase(),
      wd.amount,
      now,
      adminName,
      cleanProof
    );

    addAudit(
      'APPROVE_WITHDRAWAL',
      'WITHDRAWALS',
      withdrawalId,
      `Menandai pencairan komisi Rp ${wd.amount.toLocaleString('id-ID')} untuk ${wd.affiliate_name} (${wd.bank_name} ${wd.account_number}) SUDAH DIBAYARKAN${cleanProof ? ' + Bukti Transfer diunggah' : ''}`
    );

    addNotification(
      'Pencairan Komisi Berhasil!',
      `Pengajuan pencairan komisi Rp ${wd.amount.toLocaleString('id-ID')} ke ${wd.bank_name} (${wd.account_number}) telah dibayarkan Admin.`,
      'PAYMENT',
      wd.affiliate_user_id
    );

    recordEmailLog({
      recipientUserId: wd.affiliate_user_id,
      recipientName: wd.affiliate_name,
      recipientEmail: partnerUser?.email || wd.affiliate_email,
      subject: `[LOGIN CPNS] Pencairan Komisi Mitra Rp ${wd.amount.toLocaleString('id-ID')} Berhasil Dibayarkan`,
      body: `Halo ${wd.affiliate_name},\n\nKabar baik! Pencairan komisi afiliasi Anda telah BERHASIL DIBAYARKAN oleh Admin (${adminName}).\n\nRincian Transfer:\n- ID Pengajuan: ${wd.id}\n- Kode Referral: ${wd.referral_code}\n- Nominal Ditransfer: Rp ${wd.amount.toLocaleString('id-ID')}\n- Bank / E-Wallet: ${wd.bank_name}\n- No. Rekening: ${wd.account_number} a.n. ${wd.account_holder}\n${cleanNotes ? `- Catatan Admin: ${cleanNotes}\n` : ''}\nSaldo komisi belum dibayar Anda telah otomatis berkurang. Silakan periksa mutasi rekening/e-wallet serta bukti transfer pada Riwayat Pencairan di Panel Mitra.\n\nSalam Sukses,\nTim LOGIN CPNS (${settings.admin_email || OFFICIAL_SENDER_EMAIL})`,
      category: 'COMMISSION_PAID',
      relatedEntityId: wd.id
    });
  };

  const cancelWithdrawalByAdmin = (withdrawalId: string, reason: string) => {
    const wd = commissionWithdrawals.find(w => w.id === withdrawalId);
    if (!wd) return { success: false, message: 'Data pengajuan pencairan tidak ditemukan.' };
    const cleanReason = reason.trim();
    if (!cleanReason) {
      return { success: false, message: 'Alasan pembatalan pencairan komisi wajib diisi.' };
    }
    const now = new Date().toISOString();
    const adminName = currentUser?.full_name || 'Super Admin';

    setCommissionWithdrawals(prev =>
      prev.map(item =>
        item.id === withdrawalId
          ? {
              ...item,
              status: 'CANCELLED',
              cancelled_at: now,
              cancelled_by: adminName,
              cancellation_reason: cleanReason,
              notes: cleanReason
            }
          : item
      )
    );

    const partnerUser = users.find(u => u.id === wd.affiliate_user_id);
    addAudit(
      'CANCEL_WITHDRAWAL',
      'WITHDRAWALS',
      withdrawalId,
      `Membatalkan pencairan komisi Rp ${wd.amount.toLocaleString('id-ID')} untuk ${wd.affiliate_name}: ${cleanReason}`
    );

    addNotification(
      'Pencairan Komisi Dibatalkan Admin',
      `Pengajuan pencairan Rp ${wd.amount.toLocaleString('id-ID')} dibatalkan sesuai S&K: ${cleanReason}`,
      'PAYMENT',
      wd.affiliate_user_id
    );

    recordEmailLog({
      recipientUserId: wd.affiliate_user_id,
      recipientName: wd.affiliate_name,
      recipientEmail: partnerUser?.email || wd.affiliate_email,
      subject: `[LOGIN CPNS] Pemberitahuan Pembatalan Pencairan Komisi (${wd.referral_code})`,
      body: `Halo ${wd.affiliate_name},\n\nSesuai Syarat & Ketentuan Program Mitra Afiliasi LOGIN CPNS (Pasal 7), pengajuan pencairan komisi Anda sebesar Rp ${wd.amount.toLocaleString('id-ID')} (ID: ${wd.id}) DIBATALKAN oleh Admin (${adminName}).\n\nAlasan Pembatalan: ${cleanReason}\n\nJika Anda ingin memperbaiki data atau mengajukan klarifikasi, silakan hubungi Admin via WhatsApp ${settings.admin_whatsapp}.\n\nSalam Hormat,\nTim LOGIN CPNS (${settings.admin_email || OFFICIAL_SENDER_EMAIL})`,
      category: 'COMMISSION_CANCELLED',
      relatedEntityId: wd.id
    });

    return {
      success: true,
      message: `Pencairan komisi ${wd.affiliate_name} sebesar Rp ${wd.amount.toLocaleString('id-ID')} berhasil dibatalkan.`
    };
  };

  const payPartnerCommissionDirect = (payload: {
    partnerId: string;
    amount: number;
    proofUrl?: string;
    notes?: string;
  }) => {
    const partner = users.find(u => u.id === payload.partnerId);
    if (!partner) {
      return { success: false, message: 'Data mitra tidak ditemukan.' };
    }
    const partnerCodeUpper = partner.referral_code?.toUpperCase();
    const unpaidPayments = payments.filter(
      p =>
        (p.affiliate_user_id === partner.id ||
          (partnerCodeUpper && p.referral_code?.toUpperCase() === partnerCodeUpper)) &&
        p.status === 'APPROVED' &&
        (p.affiliate_commission || 0) > 0 &&
        p.commission_status !== 'PAID'
    );
    const totalUnpaid = unpaidPayments.reduce(
      (sum, p) => sum + (p.affiliate_commission || activeCommissionAmount),
      0
    );

    if (totalUnpaid <= 0) {
      return { success: false, message: 'Tidak ada saldo komisi belum dibayar untuk mitra ini.' };
    }
    if (payload.amount <= 0 || payload.amount > totalUnpaid) {
      return {
        success: false,
        message: `Nominal pembayaran harus antara Rp 1.000 hingga Rp ${totalUnpaid.toLocaleString('id-ID')}.`
      };
    }

    const now = new Date().toISOString();
    const adminName = currentUser?.full_name || 'Super Admin';
    const withdrawal: CommissionWithdrawal = {
      id: `wd-${Date.now()}`,
      affiliate_user_id: partner.id,
      affiliate_name: partner.full_name,
      affiliate_email: partner.email,
      affiliate_phone: partner.phone,
      referral_code: partner.referral_code || '-',
      amount: payload.amount,
      bank_name: partner.affiliate_bank_name || 'Transfer Langsung Admin',
      account_number: partner.affiliate_account_number || partner.phone || '-',
      account_holder: partner.affiliate_account_holder || partner.full_name,
      status: 'PAID',
      requested_at: now,
      paid_at: now,
      paid_by: adminName,
      proof_url: payload.proofUrl?.trim() || undefined,
      notes: payload.notes?.trim() || 'Pembayaran komisi langsung oleh Admin'
    };

    setCommissionWithdrawals(prev => [withdrawal, ...prev]);
    markPaymentsCommissionSettled(
      partner.id,
      partnerCodeUpper,
      payload.amount,
      now,
      adminName,
      payload.proofUrl?.trim()
    );

    addAudit(
      'DIRECT_PAY_PARTNER_COMMISSION',
      'WITHDRAWALS',
      withdrawal.id,
      `Membayar komisi Rp ${payload.amount.toLocaleString('id-ID')} langsung kepada Mitra ${partner.full_name} (${partner.referral_code || '-'})`
    );

    addNotification(
      'Pembayaran Komisi Diterima!',
      `Admin telah membayarkan komisi sebesar Rp ${payload.amount.toLocaleString('id-ID')} untuk kode ${partner.referral_code || '-'}. Saldo belum dibayar Anda otomatis berkurang.`,
      'PAYMENT',
      partner.id
    );

    recordEmailLog({
      recipientUserId: partner.id,
      recipientName: partner.full_name,
      recipientEmail: partner.email,
      subject: `[LOGIN CPNS] Pembayaran Komisi Mitra Rp ${payload.amount.toLocaleString('id-ID')} Telah Dikirim`,
      body: `Halo ${partner.full_name},\n\nAdmin (${adminName}) telah membayarkan komisi afiliasi Anda.\n\nRincian Pembayaran:\n- ID Referensi: ${withdrawal.id}\n- Kode Referral: ${withdrawal.referral_code}\n- Nominal Dibayar: Rp ${payload.amount.toLocaleString('id-ID')}\n- Tujuan: ${withdrawal.bank_name} ${withdrawal.account_number} a.n. ${withdrawal.account_holder}\n${withdrawal.notes ? `- Catatan: ${withdrawal.notes}\n` : ''}\nSaldo komisi belum dibayar Anda otomatis berkurang sesuai pembayaran ini. Bukti transfer dapat dilihat di Riwayat Pencairan Panel Mitra.\n\nSalam Sukses,\nTim LOGIN CPNS (${settings.admin_email || OFFICIAL_SENDER_EMAIL})`,
      category: 'COMMISSION_PAID',
      relatedEntityId: withdrawal.id
    });

    return {
      success: true,
      message: `Pembayaran komisi Rp ${payload.amount.toLocaleString('id-ID')} kepada ${partner.full_name} berhasil dicatat & saldo komisi otomatis berkurang.`
    };
  };

  const updatePartnerByAdmin = (
    userId: string,
    payload: {
      full_name: string;
      email: string;
      phone: string;
      referral_code: string;
      affiliate_status: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
      affiliate_rejection_reason?: string;
      affiliate_bank_name?: string;
      affiliate_account_number?: string;
      affiliate_account_holder?: string;
    }
  ) => {
    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, message: 'Data mitra tidak ditemukan.' };

    const cleanEmail = payload.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, message: 'Format email tidak valid.' };
    }
    const emailDuplicate = users.find(u => u.id !== userId && u.email.toLowerCase() === cleanEmail);
    if (emailDuplicate) {
      return { success: false, message: 'Email sudah digunakan oleh akun lain.' };
    }

    const cleanCode = payload.referral_code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (cleanCode && (cleanCode.length < 4 || cleanCode.length > 20)) {
      return { success: false, message: 'Kode referral harus 4–20 karakter huruf/angka.' };
    }
    if (cleanCode) {
      const codeDuplicate = users.find(
        u => u.id !== userId && u.referral_code && u.referral_code.toUpperCase() === cleanCode
      );
      if (codeDuplicate) {
        return { success: false, message: `Kode referral "${cleanCode}" sudah dipakai mitra lain.` };
      }
    }

    const cleanRejectReason = payload.affiliate_rejection_reason?.trim();
    if (payload.affiliate_status === 'REJECTED' && !cleanRejectReason) {
      return { success: false, message: 'Alasan penolakan mitra wajib diisi agar mitra dapat memperbaiki kesalahannya.' };
    }

    const now = new Date().toISOString();
    const isApproved = payload.affiliate_status === 'APPROVED';
    const isRejected = payload.affiliate_status === 'REJECTED';
    const updatedUser: User = {
      ...target,
      full_name: payload.full_name.trim() || target.full_name,
      email: cleanEmail,
      phone: payload.phone.trim() || target.phone,
      referral_code: cleanCode || undefined,
      affiliate_status: payload.affiliate_status,
      is_affiliate: isApproved,
      affiliate_joined_at: isApproved ? target.affiliate_joined_at || now : target.affiliate_joined_at,
      affiliate_approved_at: isApproved ? target.affiliate_approved_at || now : target.affiliate_approved_at,
      affiliate_approved_by: isApproved ? target.affiliate_approved_by || currentUser?.full_name || 'Super Admin' : target.affiliate_approved_by,
      affiliate_rejection_reason: isRejected ? cleanRejectReason : isApproved ? undefined : target.affiliate_rejection_reason,
      affiliate_bank_name: payload.affiliate_bank_name?.trim() || undefined,
      affiliate_account_number: payload.affiliate_account_number?.trim() || undefined,
      affiliate_account_holder: payload.affiliate_account_holder?.trim() || undefined,
      updated_at: now
    };

    setUsers(prev => prev.map(u => (u.id === userId ? updatedUser : u)));
    if (currentUser?.id === userId) {
      setCurrentUser(updatedUser);
    }

    setPayments(prev =>
      prev.map(p =>
        p.affiliate_user_id === userId
          ? {
              ...p,
              affiliate_name: updatedUser.full_name,
              referral_code: updatedUser.referral_code || p.referral_code
            }
          : p
      )
    );

    addAudit(
      'UPDATE_PARTNER_DATA',
      'USERS',
      userId,
      `Memperbarui data mitra ${updatedUser.full_name} (Kode: ${updatedUser.referral_code || '-'}, Status: ${updatedUser.affiliate_status}${isRejected && cleanRejectReason ? `, Alasan: ${cleanRejectReason}` : ''})`
    );

    if (isRejected && target.affiliate_status !== 'REJECTED') {
      addNotification(
        'Status Mitra Afiliasi Ditolak / Dinonaktifkan',
        `Pengajuan atau status mitra Anda ditolak/dinonaktifkan: ${cleanRejectReason}`,
        'ANNOUNCEMENT',
        userId
      );
      recordEmailLog({
        recipientUserId: updatedUser.id,
        recipientName: updatedUser.full_name,
        recipientEmail: updatedUser.email,
        subject: '[LOGIN CPNS] Pemberitahuan Status Mitra Afiliasi - Perlu Perbaikan',
        body: `Halo ${updatedUser.full_name},\n\nStatus Mitra Afiliasi Anda untuk kode ${updatedUser.referral_code || '-'} saat ini ditolak / dinonaktifkan oleh Admin.\n\nAlasan: ${cleanRejectReason}\n\nSilakan perbaiki kesalahan sesuai catatan di atas melalui Panel Mitra di menu Profil Saya.\n\nSalam Hormat,\nTim LOGIN CPNS (${settings.admin_email || OFFICIAL_SENDER_EMAIL})`,
        category: 'AFFILIATE_REJECTED',
        relatedEntityId: userId
      });
    }

    return {
      success: true,
      message: `Data mitra ${updatedUser.full_name} (${updatedUser.referral_code || '-'}) berhasil diperbarui.`
    };
  };

  const removePartnerByAdmin = (userId: string, deleteUserAccount = false) => {
    const target = users.find(u => u.id === userId);
    if (!target || target.role === 'SUPER_ADMIN') return;

    if (deleteUserAccount) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      addAudit(
        'DELETE_PARTNER_ACCOUNT',
        'USERS',
        userId,
        `Menghapus akun mitra ${target.full_name} (${target.referral_code || target.email}) secara permanen`
      );
    } else {
      const updatedUser: User = {
        ...target,
        is_affiliate: false,
        affiliate_status: 'NONE',
        referral_code: undefined,
        affiliate_bank_name: undefined,
        affiliate_account_number: undefined,
        affiliate_account_holder: undefined,
        affiliate_motivation: undefined,
        updated_at: new Date().toISOString()
      };
      setUsers(prev => prev.map(u => (u.id === userId ? updatedUser : u)));
      if (currentUser?.id === userId) {
        setCurrentUser(updatedUser);
      }
      addAudit(
        'REMOVE_PARTNER_STATUS',
        'USERS',
        userId,
        `Menghapus status & kode mitra dari ${target.full_name} (kembali menjadi member biasa)`
      );
    }
  };

  // Exam Engine Setup
  const launchExamByType = (type: ExamType, category?: QuestionCategory, sessionId?: string) => {
    let questionPool: Question[] = [];
    let durationMinutes = 10;
    let examTitle = '';

    const activeQuestions = questions.filter(q => q.is_active);

    if (type === 'TRYOUT_SKD_LENGKAP') {
      durationMinutes = 100;
      examTitle = 'Simulasi Tryout SKD Lengkap (Standar BKN 110 Soal)';
      const twkPool = activeQuestions.filter(q => q.category === 'TWK');
      const tiuPool = activeQuestions.filter(q => q.category === 'TIU');
      const tkpPool = activeQuestions.filter(q => q.category === 'TKP');

      const pickCount = (pool: Question[], count: number): Question[] => {
        if (pool.length === 0) return [];
        const result: Question[] = [];
        for (let i = 0; i < count; i++) {
          const item = pool[i % pool.length];
          result.push({ ...item, id: `${item.id}-c${i}` });
        }
        return result;
      };

      questionPool = [
        ...pickCount(twkPool, 30),
        ...pickCount(tiuPool, 35),
        ...pickCount(tkpPool, 45)
      ];
    } else if (type === 'TRYOUT_KATEGORI') {
      durationMinutes = 25;
      const cat = category || 'TWK';
      examTitle = `Tryout Kategori ${cat} (30 Soal HOTS)`;
      const catPool = activeQuestions.filter(q => q.category === cat);
      const result: Question[] = [];
      for (let i = 0; i < 30; i++) {
        if (catPool.length > 0) {
          const item = catPool[i % catPool.length];
          result.push({ ...item, id: `${item.id}-cat${i}` });
        }
      }
      questionPool = result;
    } else if (type === 'LATIHAN_HARIAN') {
      durationMinutes = 10;
      const cat = category || 'TWK';
      examTitle = `Latihan Harian Cepat ${cat} (15 Soal)`;
      const catPool = activeQuestions.filter(q => q.category === cat);
      const result: Question[] = [];
      for (let i = 0; i < 15; i++) {
        if (catPool.length > 0) {
          const item = catPool[i % catPool.length];
          result.push({ ...item, id: `${item.id}-daily${i}` });
        }
      }
      questionPool = result;
    } else if (type === 'TRYOUT_BERSAMA') {
      durationMinutes = 100;
      examTitle = 'Tryout Bareng Nasional Akbar SKD CPNS 2026';
      const twkPool = activeQuestions.filter(q => q.category === 'TWK');
      const tiuPool = activeQuestions.filter(q => q.category === 'TIU');
      const tkpPool = activeQuestions.filter(q => q.category === 'TKP');

      const pickCount = (pool: Question[], count: number): Question[] => {
        if (pool.length === 0) return [];
        const result: Question[] = [];
        for (let i = 0; i < count; i++) {
          const item = pool[i % pool.length];
          result.push({ ...item, id: `${item.id}-bg${i}` });
        }
        return result;
      };

      questionPool = [
        ...pickCount(twkPool, 30),
        ...pickCount(tiuPool, 35),
        ...pickCount(tkpPool, 45)
      ];
    }

    setExamSession({
      examType: type,
      examTitle,
      category,
      questions: questionPool,
      currentQuestionIndex: 0,
      userAnswers: {},
      flaggedMap: {},
      durationSeconds: durationMinutes * 60,
      timeRemainingSeconds: durationMinutes * 60,
      isStarted: true,
      isFinished: false,
      sessionId
    });

    addAudit('START_EXAM', 'EXAMS', type, `Memulai ujian: ${examTitle}`);
  };

  const launchExamByPackage = (pkg: PracticePackage) => {
    let examType: ExamType = 'TRYOUT_SKD_LENGKAP';
    if (pkg.package_type === 'TRYOUT_SKD' || pkg.package_type === 'TRYOUT_AKBAR') {
      examType = 'TRYOUT_SKD_LENGKAP';
    } else if (pkg.question_count <= 15) {
      examType = 'LATIHAN_HARIAN';
    } else {
      examType = 'TRYOUT_KATEGORI';
    }

    // Filter questions specific to this package (including questions linked from other boxes)
    const assignedRaw = questions.filter(
      q => q.is_active && isQuestionInPackage(q, pkg)
    );

    const catOrder: Record<QuestionCategory, number> = { TWK: 0, TIU: 1, TKP: 2 };
    const assigned =
      pkg.category === 'CAMPURAN'
        ? [...assignedRaw].sort((a, b) => catOrder[a.category] - catOrder[b.category])
        : assignedRaw;

    let finalQuestions: Question[] = [...assigned];

    if (finalQuestions.length < pkg.question_count) {
      let pool: Question[] = [];
      if (pkg.category === 'CAMPURAN') {
        const twk = questions.filter(q => q.is_active && q.category === 'TWK');
        const tiu = questions.filter(q => q.is_active && q.category === 'TIU');
        const tkp = questions.filter(q => q.is_active && q.category === 'TKP');
        pool = [...twk, ...tiu, ...tkp];
      } else {
        pool = questions.filter(q => q.is_active && q.category === pkg.category);
      }
      if (pool.length === 0) {
        pool = questions.filter(q => q.is_active);
      }

      const assignedIds = new Set(finalQuestions.map(q => q.id));
      const unusedPool = pool.filter(q => !assignedIds.has(q.id));
      for (const item of unusedPool) {
        if (finalQuestions.length >= pkg.question_count) break;
        finalQuestions.push(item);
      }

      let i = 0;
      while (finalQuestions.length < pkg.question_count && pool.length > 0) {
        const item = pool[i % pool.length];
        finalQuestions.push({
          ...item,
          id: `${item.id}-pkg-${finalQuestions.length + 1}`
        });
        i++;
      }
    } else {
      finalQuestions = finalQuestions.slice(0, pkg.question_count);
    }

    setExamSession({
      examType,
      examTitle: pkg.title,
      category: pkg.category === 'CAMPURAN' ? undefined : (pkg.category as QuestionCategory),
      questions: finalQuestions,
      currentQuestionIndex: 0,
      userAnswers: {},
      flaggedMap: {},
      durationSeconds: pkg.duration_minutes * 60,
      timeRemainingSeconds: pkg.duration_minutes * 60,
      isStarted: true,
      isFinished: false
    });

    addAudit('START_EXAM', 'EXAMS', pkg.id, `Memulai paket latihan/tryout: ${pkg.title}`);
  };

  const startExamByType = (type: ExamType, category?: QuestionCategory, sessionId?: string) => {
    if (!currentUser) {
      setAuthModalMode('LOGIN');
      return;
    }

    // Access check: Standar, Premium, Intensif, and Super Admin can run Tryout SKD & Tryout Kategori
    if (type === 'TRYOUT_SKD_LENGKAP' || type === 'TRYOUT_KATEGORI') {
      if (!hasPaidQuestionAccess(currentUser)) {
        alert('Fitur ini memerlukan keanggotaan berbayar (Standar, Premium, atau Intensif). Silakan pilih paket belajar Anda.');
        setActiveView('premium');
        return;
      }
    }

    const cat = category || 'TWK';
    let title = 'Latihan Harian Cepat';
    let questionCount = 15;
    let durationMinutes = 10;
    let categoryLabel: string = cat;

    if (type === 'TRYOUT_SKD_LENGKAP') {
      title = 'Simulasi Tryout SKD Lengkap (Standar BKN 110 Soal)';
      questionCount = 110;
      durationMinutes = 100;
      categoryLabel = 'TWK · TIU · TKP';
    } else if (type === 'TRYOUT_KATEGORI') {
      title = `Tryout Kategori ${cat} (30 Soal HOTS)`;
      questionCount = 30;
      durationMinutes = 25;
      categoryLabel = cat;
    } else if (type === 'LATIHAN_HARIAN') {
      title = `Latihan Harian Cepat ${cat} (15 Soal)`;
      questionCount = 15;
      durationMinutes = 10;
      categoryLabel = cat;
    } else if (type === 'TRYOUT_BERSAMA') {
      title = 'Tryout Bareng Nasional Akbar SKD CPNS 2026';
      questionCount = 110;
      durationMinutes = 100;
      categoryLabel = 'TRYOUT BARENG';
    }

    setPendingExamLaunch({
      kind: 'TYPE',
      title,
      questionCount,
      durationMinutes,
      categoryLabel,
      type,
      category,
      sessionId
    });
  };

  const startExamByPackage = (pkg: PracticePackage) => {
    if (!currentUser) {
      setAuthModalMode('LOGIN');
      return;
    }

    setPendingExamLaunch({
      kind: 'PACKAGE',
      title: pkg.title,
      subtitle: pkg.subtitle,
      questionCount: pkg.question_count,
      durationMinutes: pkg.duration_minutes,
      categoryLabel: pkg.category === 'CAMPURAN' ? 'TWK · TIU · TKP' : pkg.category,
      pkg
    });
  };

  const confirmPendingExamLaunch = () => {
    if (!pendingExamLaunch) return;
    const pending = pendingExamLaunch;
    setPendingExamLaunch(null);
    if (pending.kind === 'PACKAGE' && pending.pkg) {
      launchExamByPackage(pending.pkg);
    } else if (pending.kind === 'TYPE' && pending.type) {
      launchExamByType(pending.type, pending.category, pending.sessionId);
    }
  };

  const cancelPendingExamLaunch = () => {
    setPendingExamLaunch(null);
  };

  const addPracticePackage = (pkg: Omit<PracticePackage, 'id' | 'created_at'>) => {
    const newPkg: PracticePackage = {
      ...pkg,
      id: `pkg-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setPracticePackages(prev => [newPkg, ...prev]);
    addAudit('CREATE_PACKAGE', 'PRACTICE_PACKAGES', newPkg.id, `Membuat paket soal baru: ${newPkg.title}`);
  };

  const updatePracticePackage = (pkg: PracticePackage) => {
    setPracticePackages(prev =>
      prev.map(p => (p.id === pkg.id ? { ...pkg, updated_at: new Date().toISOString() } : p))
    );
    addAudit('UPDATE_PACKAGE', 'PRACTICE_PACKAGES', pkg.id, `Memperbarui paket soal: ${pkg.title}`);
  };

  const deletePracticePackage = (id: string) => {
    const targetPkg = practicePackages.find(p => p.id === id);
    setPracticePackages(prev => prev.filter(p => p.id !== id));
    setQuestions(prev =>
      prev.map(q => {
        const currentIds = getQuestionPackageIds(q);
        if (!currentIds.includes(id) && q.package_id !== id && (!targetPkg || q.package_title !== targetPkg.title)) {
          return q;
        }
        const nextIds = currentIds.filter(pid => pid !== id);
        const primaryId = q.package_id === id ? nextIds[0] : q.package_id;
        const primaryPkg = primaryId ? practicePackages.find(p => p.id === primaryId) : undefined;
        return {
          ...q,
          package_id: primaryId,
          package_title: primaryId ? primaryPkg?.title : undefined,
          package_ids: nextIds
        };
      })
    );
    addAudit('DELETE_PACKAGE', 'PRACTICE_PACKAGES', id, `Menghapus paket soal`);
  };

  const answerQuestion = (questionId: string, answer: 'A' | 'B' | 'C' | 'D' | 'E') => {
    setExamSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        userAnswers: {
          ...prev.userAnswers,
          [questionId]: answer
        }
      };
    });
  };

  const toggleFlagQuestion = (questionId: string) => {
    setExamSession(prev => {
      if (!prev) return null;
      const curr = !!prev.flaggedMap[questionId];
      return {
        ...prev,
        flaggedMap: {
          ...prev.flaggedMap,
          [questionId]: !curr
        }
      };
    });
  };

  const setQuestionIndex = (index: number) => {
    setExamSession(prev => {
      if (!prev) return null;
      if (index < 0 || index >= prev.questions.length) return prev;
      return { ...prev, currentQuestionIndex: index };
    });
  };

  const finishCurrentExam = (): ExamResult => {
    if (!examSession || !currentUser) throw new Error('Ujian tidak aktif');

    const { examType, examTitle, category, questions: examQuestions, userAnswers, flaggedMap, durationSeconds, timeRemainingSeconds } = examSession;

    let twk_score = 0;
    let tiu_score = 0;
    let tkp_score = 0;
    let answered_count = 0;

    examQuestions.forEach(q => {
      const ans = userAnswers[q.id];
      if (ans) {
        answered_count++;
        if (q.category === 'TWK') {
          if (ans === q.correct_answer) twk_score += 5;
        } else if (q.category === 'TIU') {
          if (ans === q.correct_answer) tiu_score += 5;
        } else if (q.category === 'TKP') {
          const weightKey = `weight_${ans.toLowerCase()}` as keyof Question;
          const val = (q[weightKey] as number) || 3;
          tkp_score += val;
        }
      }
    });

    const total_score = twk_score + tiu_score + tkp_score;
    const unanswered_count = examQuestions.length - answered_count;

    const pg = settings.default_passing_grade;
    let pass_status: 'MEMENUHI_AMBANG_BATAS' | 'BELUM_MEMENUHI_AMBANG_BATAS' = 'MEMENUHI_AMBANG_BATAS';

    if (examType === 'TRYOUT_SKD_LENGKAP' || examType === 'TRYOUT_BERSAMA') {
      if (twk_score < pg.twk || tiu_score < pg.tiu || tkp_score < pg.tkp) {
        pass_status = 'BELUM_MEMENUHI_AMBANG_BATAS';
      }
    } else if (examType === 'TRYOUT_KATEGORI' || examType === 'LATIHAN_HARIAN') {
      if (category === 'TWK' && twk_score < (examType === 'TRYOUT_KATEGORI' ? pg.twk : 25)) pass_status = 'BELUM_MEMENUHI_AMBANG_BATAS';
      if (category === 'TIU' && tiu_score < (examType === 'TRYOUT_KATEGORI' ? pg.tiu : 25)) pass_status = 'BELUM_MEMENUHI_AMBANG_BATAS';
      if (category === 'TKP' && tkp_score < (examType === 'TRYOUT_KATEGORI' ? pg.tkp : 50)) pass_status = 'BELUM_MEMENUHI_AMBANG_BATAS';
    }

    const newResult: ExamResult = {
      id: `res-${Date.now()}`,
      exam_id: `ex-${Date.now()}`,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      exam_title: examTitle,
      exam_type: examType,
      category,
      completed_at: new Date().toISOString(),
      duration_seconds: durationSeconds - timeRemainingSeconds,
      total_questions: examQuestions.length,
      answered_count,
      unanswered_count,
      twk_score,
      tiu_score,
      tkp_score,
      total_score,
      pass_status,
      passing_grade_snapshot: { ...pg },
      user_answers: { ...userAnswers },
      flagged_map: { ...flaggedMap },
      questions_snapshot: examQuestions
    };

    setResults(prev => [newResult, ...prev]);
    setExamSession(null);
    setSelectedResultReview(newResult);
    setActiveView('riwayat-ujian');

    addAudit('SUBMIT_EXAM', 'RESULTS', newResult.id, `Menyelesaikan ${examTitle} nilai: ${total_score} (${pass_status})`);
    addNotification('Ujian Selesai', `Hasil ${examTitle}: Total Skor ${total_score} (${pass_status === 'MEMENUHI_AMBANG_BATAS' ? 'Lulus PG' : 'Belum Lulus PG'})`, 'ANNOUNCEMENT', currentUser.id);

    return newResult;
  };

  const cancelExam = () => {
    setExamSession(null);
  };

  // Member Payment Submission
  const submitPaymentProof = (
    packageId: string,
    paymentMethod: 'TRANSFER_BANK' | 'QRIS' | 'COD_WHATSAPP',
    bankName: string,
    senderName: string,
    proofUrl: string,
    referralCode?: string
  ) => {
    if (!currentUser) return;
    const pkg = packages.find(p => p.id === packageId) || packages[0];
    const allowDiscount = pkg.allow_discount !== false;
    const originalAmount =
      allowDiscount && pkg.original_price && pkg.original_price > pkg.price ? pkg.original_price : pkg.price;
    const promoDiscount = allowDiscount ? Math.max(0, originalAmount - pkg.price) : 0;

    const refValidation = allowDiscount && referralCode ? validateReferralCode(referralCode, currentUser.id) : null;
    const hasValidRef = Boolean(allowDiscount && refValidation && refValidation.isValid);
    const referralDiscount = hasValidRef ? refValidation!.discount : 0;
    const finalAmount = Math.max(0, pkg.price - referralDiscount);
    const affiliateCommission = hasValidRef ? refValidation!.commission : 0;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_email: currentUser.email,
      user_phone: currentUser.phone,
      user_registered_at: currentUser.created_at,
      package_id: pkg.id,
      package_name: pkg.package_name,
      original_amount: originalAmount,
      promo_discount: promoDiscount,
      referral_code: hasValidRef ? refValidation!.normalizedCode : undefined,
      referral_discount: referralDiscount,
      amount: finalAmount,
      affiliate_user_id: hasValidRef ? refValidation!.affiliateUser?.id : undefined,
      affiliate_name: hasValidRef ? refValidation!.affiliateName : undefined,
      affiliate_commission: affiliateCommission,
      commission_status: affiliateCommission > 0 ? 'UNPAID' : 'NOT_APPLICABLE',
      payment_method: paymentMethod,
      bank_name: bankName,
      sender_name: senderName,
      proof_url: proofUrl,
      status: 'WAITING_VERIFICATION',
      created_at: new Date().toISOString()
    };
    setPayments(prev => [newPayment, ...prev]);
    addAudit(
      'SUBMIT_PAYMENT',
      'PAYMENTS',
      newPayment.id,
      `Mengajukan pembayaran ${pkg.package_name} Rp ${finalAmount.toLocaleString('id-ID')}${hasValidRef ? ` (Kode Referral: ${refValidation!.normalizedCode})` : ''}`
    );
    addNotification(
      'Pembayaran Menunggu Verifikasi',
      `Bukti transfer Rp ${finalAmount.toLocaleString('id-ID')} Anda sedang diverifikasi admin.`,
      'PAYMENT',
      currentUser.id
    );
    recordEmailLog({
      recipientUserId: currentUser.id,
      recipientName: currentUser.full_name,
      recipientEmail: currentUser.email,
      subject: `[LOGIN CPNS] Menunggu Verifikasi Pembayaran - ${pkg.package_name}`,
      body: `Halo ${currentUser.full_name},\n\nBukti pembayaran Anda telah kami terima dan berstatus MENUNGGU VERIFIKASI ADMIN.\n\nDetail Pembayaran:\n- ID Transaksi: ${newPayment.id}\n- Paket: ${pkg.package_name}\n- Metode: ${paymentMethod} (${bankName})\n- Kode Referral: ${newPayment.referral_code || '-'} (-Rp ${referralDiscount.toLocaleString('id-ID')})\n- Total Dibayar: Rp ${finalAmount.toLocaleString('id-ID')}\n\nSetelah Admin selesai memeriksa bukti transfer, Anda akan menerima email konfirmasi bahwa akun Premium telah aktif.\n\nSalam Sukses ASN,\nTim LOGIN CPNS (${settings.admin_email || OFFICIAL_SENDER_EMAIL})`,
      category: 'WAITING_PAYMENT',
      relatedEntityId: newPayment.id
    });
  };

  const registerGroupSession = (sessionId: string) => {
    if (!currentUser) return;
    setLeaderboards(prev => {
      if (prev.some(l => l.session_id === sessionId && l.user_id === currentUser.id)) return prev;
      return [
        ...prev,
        {
          id: `lb-${Date.now()}`,
          session_id: sessionId,
          user_id: currentUser.id,
          user_name: currentUser.full_name,
          twk_score: 0,
          tiu_score: 0,
          tkp_score: 0,
          total_score: 0,
          completion_time_seconds: 0,
          rank: prev.length + 1
        }
      ];
    });
    addAudit('REGISTER_SESSION', 'GROUP_SESSIONS', sessionId, `Mendaftar Tryout Bareng ${sessionId}`);
  };

  // Admin Actions
  const addQuestion = (q: Omit<Question, 'id' | 'created_at'>) => {
    const mergedPackageIds = Array.from(
      new Set([...(q.package_ids || []), ...(q.package_id ? [q.package_id] : [])])
    );
    const newQ: Question = {
      ...q,
      package_ids: mergedPackageIds.length > 0 ? mergedPackageIds : undefined,
      id: `${q.category.toLowerCase()}-${Date.now().toString().slice(-4)}-${Math.random().toString(36).slice(2, 5)}`,
      created_at: new Date().toISOString()
    };
    setQuestions(prev => [newQ, ...prev]);
    addAudit('ADD_QUESTION', 'QUESTIONS', newQ.id, `Menambahkan soal [${q.category}] ${q.topic}`);
  };

  const updateQuestion = (q: Question) => {
    const mergedPackageIds = Array.from(
      new Set([...(q.package_ids || []), ...(q.package_id ? [q.package_id] : [])])
    );
    setQuestions(prev =>
      prev.map(item =>
        item.id === q.id
          ? {
              ...q,
              package_ids: mergedPackageIds,
              updated_at: new Date().toISOString()
            }
          : item
      )
    );
    addAudit('UPDATE_QUESTION', 'QUESTIONS', q.id, `Memperbarui soal ID: ${q.id}`);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    addAudit('DELETE_QUESTION', 'QUESTIONS', id, `Menghapus soal ID: ${id}`);
  };

  const bulkImportQuestions = (imported: Question[]) => {
    const normalized = imported.map(q => {
      const mergedIds = Array.from(
        new Set([...(q.package_ids || []), ...(q.package_id ? [q.package_id] : [])])
      );
      return mergedIds.length > 0 ? { ...q, package_ids: mergedIds } : q;
    });
    setQuestions(prev => [...normalized, ...prev]);
    addAudit('IMPORT_QUESTIONS', 'QUESTIONS', 'BULK', `Berhasil mengimpor ${imported.length} butir soal`);
  };

  const assignQuestionsToPackage = (questionIds: string[], packageId: string) => {
    const targetPkg = practicePackages.find(p => p.id === packageId);
    if (!targetPkg || questionIds.length === 0) return 0;

    const idSet = new Set(questionIds);
    let addedCount = 0;

    setQuestions(prev =>
      prev.map(q => {
        if (!idSet.has(q.id)) return q;
        const currentIds = getQuestionPackageIds(q);
        const alreadyInPkg = isQuestionInPackage(q, targetPkg);
        const nextIds = Array.from(new Set([...currentIds, packageId]));
        if (!alreadyInPkg) {
          addedCount++;
        }
        return {
          ...q,
          package_id: q.package_id || packageId,
          package_title: q.package_title || targetPkg.title,
          package_ids: nextIds,
          updated_at: new Date().toISOString()
        };
      })
    );

    addAudit(
      'ASSIGN_QUESTIONS_TO_PACKAGE',
      'PRACTICE_PACKAGES',
      packageId,
      `Memasukkan ${questionIds.length} butir soal dari Bank Soal ke kotak "${targetPkg.title}"`
    );
    return addedCount;
  };

  const removeQuestionFromPackage = (questionId: string, packageId: string) => {
    const targetPkg = practicePackages.find(p => p.id === packageId);
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId) return q;
        const currentIds = getQuestionPackageIds(q);
        const nextIds = currentIds.filter(id => id !== packageId);
        const wasPrimary = q.package_id === packageId || (targetPkg && q.package_title === targetPkg.title);
        const nextPrimaryId = wasPrimary ? nextIds[0] : q.package_id;
        const nextPrimaryPkg = nextPrimaryId ? practicePackages.find(p => p.id === nextPrimaryId) : undefined;
        return {
          ...q,
          package_id: nextPrimaryId,
          package_title: nextPrimaryId ? nextPrimaryPkg?.title : undefined,
          package_ids: nextIds,
          updated_at: new Date().toISOString()
        };
      })
    );
    addAudit(
      'UNLINK_QUESTION_FROM_PACKAGE',
      'PRACTICE_PACKAGES',
      packageId,
      `Mengeluarkan soal ID ${questionId} dari kotak "${targetPkg?.title || packageId}"`
    );
  };

  const approvePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;
    setPayments(prev =>
      prev.map(p =>
        p.id === paymentId
          ? {
              ...p,
              status: 'APPROVED',
              verified_by: currentUser?.full_name || 'Super Admin',
              verified_at: new Date().toISOString()
            }
          : p
      )
    );
    const boughtPkg = packages.find(pk => pk.id === payment.package_id);
    const resolvedTier: MembershipType =
      boughtPkg?.tier_key ||
      (payment.package_id === 'pkg-standar' || payment.package_name.toLowerCase().includes('standar')
        ? 'STANDAR'
        : payment.package_id === 'pkg-2' || payment.package_name.toLowerCase().includes('intensif')
        ? 'INTENSIF'
        : 'PREMIUM');
    const durationDays = boughtPkg?.duration_days || (resolvedTier === 'INTENSIF' ? 90 : 365);

    // Activate purchased membership tier for user
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + durationDays);
    const expiryStr = expiry.toISOString();

    setUsers(prev =>
      prev.map(u =>
        u.id === payment.user_id
          ? {
              ...u,
              membership_type: resolvedTier,
              premium_start: new Date().toISOString(),
              premium_end: expiryStr
            }
          : u
      )
    );

    if (currentUser?.id === payment.user_id) {
      setCurrentUser(prev =>
        prev
          ? {
              ...prev,
              membership_type: resolvedTier,
              premium_start: new Date().toISOString(),
              premium_end: expiryStr
            }
          : null
      );
    }

    const buyerUser = users.find(u => u.id === payment.user_id);
    const recipientEmail = buyerUser?.email || payment.user_email;
    const tierLabel = getMembershipDisplayLabel(resolvedTier);

    addAudit('APPROVE_PAYMENT', 'PAYMENTS', paymentId, `Menyetujui pembayaran ${paymentId} & mengaktifkan ${tierLabel} untuk ${payment.user_name}`);
    addNotification('Pembayaran Disetujui!', `Selamat! Paket ${tierLabel} Anda telah aktif selama ${durationDays} hari.`, 'PREMIUM', payment.user_id);
    recordEmailLog({
      recipientUserId: payment.user_id,
      recipientName: payment.user_name,
      recipientEmail,
      subject: `[LOGIN CPNS] Pembayaran Berhasil & ${tierLabel} Aktif - Silakan Belajar!`,
      body: `Halo ${payment.user_name},\n\nSelamat! Pembayaran Anda untuk paket "${payment.package_name}" sebesar Rp ${payment.amount.toLocaleString('id-ID')} telah BERHASIL diverifikasi.\n\nStatus Akun Anda Sekarang: ${tierLabel.toUpperCase()} AKTIF (Berlaku hingga ${new Date(expiryStr).toLocaleDateString('id-ID')}).\n\nSilakan langsung login dan manfaatkan seluruh fasilitas belajar sesuai paket Anda!\n\nSalam Sukses ASN,\nTim LOGIN CPNS (${settings.admin_email || OFFICIAL_SENDER_EMAIL})`,
      category: 'PAYMENT_APPROVED',
      relatedEntityId: payment.id
    });

    if (payment.affiliate_user_id && payment.affiliate_user_id !== 'usr-superadmin' && (payment.affiliate_commission || 0) > 0) {
      const partnerUser = users.find(u => u.id === payment.affiliate_user_id);
      if (partnerUser) {
        addNotification(
          'Komisi Referral Baru Masuk!',
          `Peserta ${payment.user_name} baru saja melunasi paket dengan kode ${payment.referral_code}. Komisi Anda bertambah Rp ${(payment.affiliate_commission || activeCommissionAmount).toLocaleString('id-ID')}!`,
          'PAYMENT',
          partnerUser.id
        );
      }
    }
  };

  const rejectPayment = (paymentId: string, reason: string) => {
    setPayments(prev =>
      prev.map(p =>
        p.id === paymentId
          ? {
              ...p,
              status: 'REJECTED',
              verified_by: currentUser?.full_name || 'Super Admin',
              verified_at: new Date().toISOString(),
              rejection_reason: reason
            }
          : p
      )
    );
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      const buyerUser = users.find(u => u.id === payment.user_id);
      const recipientEmail = buyerUser?.email || payment.user_email;
      addAudit('REJECT_PAYMENT', 'PAYMENTS', paymentId, `Menolak pembayaran ${paymentId}: ${reason}`);
      addNotification('Pembayaran Ditolak', `Pembayaran ditolak: ${reason}. Hubungi WhatsApp ${settings.admin_whatsapp}.`, 'PAYMENT', payment.user_id);
      recordEmailLog({
        recipientUserId: payment.user_id,
        recipientName: payment.user_name,
        recipientEmail,
        subject: `[LOGIN CPNS] Pemberitahuan Verifikasi Pembayaran - Perlu Konfirmasi Ulang`,
        body: `Halo ${payment.user_name},\n\nMohon maaf, pengajuan pembayaran Anda (${payment.package_name} senilai Rp ${payment.amount.toLocaleString('id-ID')}) belum dapat disetujui.\n\nAlasan: ${reason}\n\nSilakan unggah ulang bukti transfer yang jelas atau hubungi Admin melalui WhatsApp ${settings.admin_whatsapp}.\n\nSalam Hormat,\nTim LOGIN CPNS (${settings.admin_email || OFFICIAL_SENDER_EMAIL})`,
        category: 'PAYMENT_REJECTED',
        relatedEntityId: payment.id
      });
    }
  };

  const manualSetMembershipTier = (userId: string, tier: MembershipType, days?: number) => {
    const matchedPkg = packages.find(pk => pk.tier_key === tier);
    const resolvedDays = days ?? matchedPkg?.duration_days ?? (tier === 'INTENSIF' ? 90 : 365);
    const isPaid = tier !== 'FREE';
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + resolvedDays);
    const targetUser = users.find(u => u.id === userId);
    setUsers(prev =>
      prev.map(u =>
        u.id === userId
          ? {
              ...u,
              membership_type: tier,
              premium_start: isPaid ? new Date().toISOString() : undefined,
              premium_end: isPaid ? expiry.toISOString() : undefined
            }
          : u
      )
    );
    if (currentUser?.id === userId) {
      setCurrentUser(prev =>
        prev
          ? {
              ...prev,
              membership_type: tier,
              premium_start: isPaid ? new Date().toISOString() : undefined,
              premium_end: isPaid ? expiry.toISOString() : undefined
            }
          : null
      );
    }
    const label = getMembershipDisplayLabel(tier);
    addAudit('MANUAL_SET_MEMBERSHIP', 'USERS', userId, `Admin mengubah status keanggotaan user ${userId} menjadi ${tier}`);
    if (isPaid && targetUser) {
      addNotification(`Paket ${label} Aktif!`, `Status keanggotaan Anda telah diaktifkan ke ${label} oleh Admin.`, 'PREMIUM', userId);
      recordEmailLog({
        recipientUserId: targetUser.id,
        recipientName: targetUser.full_name,
        recipientEmail: targetUser.email,
        subject: `[LOGIN CPNS] Akun Anda Aktif: ${label}`,
        body: `Halo ${targetUser.full_name},\n\nAkun LOGIN CPNS Anda kini telah diaktifkan ke status ${label.toUpperCase()} oleh Admin.\nMasa aktif berlaku hingga: ${expiry.toLocaleDateString('id-ID')}.\n\nSilakan login dan langsung mulai persiapan CPNS Anda!\n\nSalam Sukses ASN,\nTim LOGIN CPNS (${settings.admin_email || OFFICIAL_SENDER_EMAIL})`,
        category: 'PREMIUM_ACTIVE',
        relatedEntityId: targetUser.id
      });
    }
  };

  const manualTogglePremium = (userId: string, isPremium: boolean, days = 365) => {
    manualSetMembershipTier(userId, isPremium ? 'PREMIUM' : 'FREE', days);
  };

  const addMaterial = (m: Omit<Material, 'id' | 'created_at'>) => {
    const newM: Material = {
      ...m,
      id: `mat-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setMaterials(prev => [newM, ...prev]);
    addAudit('ADD_MATERIAL', 'MATERIALS', newM.id, `Menambah materi: ${m.title}`);
  };

  const updateMaterial = (m: Material) => {
    const prevItem = materials.find(item => item.id === m.id);
    if (prevItem?.video_blob_id && prevItem.video_blob_id !== m.video_blob_id) {
      void deleteVideoBlob(prevItem.video_blob_id);
    }
    setMaterials(prev => prev.map(item => (item.id === m.id ? { ...m, updated_at: new Date().toISOString() } : item)));
    addAudit('UPDATE_MATERIAL', 'MATERIALS', m.id, `Mengubah materi: ${m.title}`);
  };

  const deleteMaterial = (id: string) => {
    const prevItem = materials.find(item => item.id === id);
    if (prevItem?.video_blob_id) {
      void deleteVideoBlob(prevItem.video_blob_id);
    }
    setMaterials(prev => prev.filter(item => item.id !== id));
    addAudit('DELETE_MATERIAL', 'MATERIALS', id, `Menghapus materi ID: ${id}`);
  };

  const addShortVideo = (v: Omit<ShortVideo, 'id' | 'created_at'>) => {
    const newVideo: ShortVideo = {
      ...v,
      id: `sv-${Date.now()}`,
      author_name: v.author_name || currentUser?.full_name || 'Super Admin',
      created_at: new Date().toISOString()
    };
    setShortVideos(prev => [newVideo, ...prev]);
    addAudit('ADD_SHORT_VIDEO', 'SHORT_VIDEOS', newVideo.id, `Menambah short video: ${v.title}`);
  };

  const updateShortVideo = (v: ShortVideo) => {
    const prevVideo = shortVideos.find(item => item.id === v.id);
    if (prevVideo?.video_blob_id && prevVideo.video_blob_id !== v.video_blob_id) {
      void deleteVideoBlob(prevVideo.video_blob_id);
    }
    setShortVideos(prev =>
      prev.map(item => (item.id === v.id ? { ...v, updated_at: new Date().toISOString() } : item))
    );
    addAudit('UPDATE_SHORT_VIDEO', 'SHORT_VIDEOS', v.id, `Memperbarui short video: ${v.title}`);
  };

  const deleteShortVideo = (id: string) => {
    const target = shortVideos.find(item => item.id === id);
    if (target?.video_blob_id) {
      void deleteVideoBlob(target.video_blob_id);
    }
    setShortVideos(prev => prev.filter(item => item.id !== id));
    addAudit('DELETE_SHORT_VIDEO', 'SHORT_VIDEOS', id, `Menghapus short video ID: ${id}`);
  };

  const addGroupSession = (s: Omit<GroupSession, 'id' | 'created_at'>) => {
    const newS: GroupSession = {
      ...s,
      id: `sess-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setGroupSessions(prev => [newS, ...prev]);
    addAudit('ADD_GROUP_SESSION', 'GROUP_SESSIONS', newS.id, `Menambah jadwal sesi: ${s.title}`);
    addNotification(
      s.session_category === 'ZOOM_BIMBEL_MALAM' ? 'Jadwal Zoom Baru' : 'Tryout Bareng Baru',
      `Sesi baru "${s.title}" telah dijadwalkan!`,
      'TRYOUT'
    );
  };

  const updateGroupSession = (s: GroupSession) => {
    setGroupSessions(prev =>
      prev.map(item => (item.id === s.id ? { ...s, updated_at: new Date().toISOString() } : item))
    );
    addAudit('UPDATE_GROUP_SESSION', 'GROUP_SESSIONS', s.id, `Memperbarui sesi: ${s.title}`);
  };

  const deleteGroupSession = (id: string) => {
    setGroupSessions(prev => prev.filter(item => item.id !== id));
    addAudit('DELETE_GROUP_SESSION', 'GROUP_SESSIONS', id, `Menghapus jadwal sesi ID: ${id}`);
  };

  const addAnnouncement = (a: Omit<AdminAnnouncement, 'id' | 'created_at' | 'author_name'>) => {
    const newA: AdminAnnouncement = {
      ...a,
      id: `ann-${Date.now()}`,
      author_name: currentUser?.full_name || 'Super Admin',
      created_at: new Date().toISOString()
    };
    setAnnouncements(prev => [newA, ...prev]);
    addAudit('ADD_ANNOUNCEMENT', 'ANNOUNCEMENTS', newA.id, `Menerbitkan pengumuman: ${a.title}`);
  };

  const updateAnnouncement = (a: AdminAnnouncement) => {
    setAnnouncements(prev =>
      prev.map(item => (item.id === a.id ? { ...a, updated_at: new Date().toISOString() } : item))
    );
    addAudit('UPDATE_ANNOUNCEMENT', 'ANNOUNCEMENTS', a.id, `Memperbarui pengumuman: ${a.title}`);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(item => item.id !== id));
    addAudit('DELETE_ANNOUNCEMENT', 'ANNOUNCEMENTS', id, `Menghapus pengumuman ID: ${id}`);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addAudit('UPDATE_SETTINGS', 'SETTINGS', 'APP', 'Memperbarui konfigurasi sistem');
  };

  const updatePassingGrade = (pg: PassingGradeConfig) => {
    setSettings(prev => ({ ...prev, default_passing_grade: pg }));
    addAudit('UPDATE_PASSING_GRADE', 'SETTINGS', 'PASSING_GRADE', `Nilai baru: TWK ${pg.twk}, TIU ${pg.tiu}, TKP ${pg.tkp}`);
  };

  const updateSkdCalculatorConfig = (cfg: SkdCalculatorConfig) => {
    setSettings(prev => ({ ...prev, skd_calculator_config: cfg }));
    addAudit(
      'UPDATE_CALCULATOR_SETTINGS',
      'SETTINGS',
      'SKD_CALCULATOR',
      `Bobot SKD ${cfg.skd_weight_percent}% / SKB ${cfg.skb_weight_percent}% · Akses: ${cfg.access_tier} · Auto-import 110 soal: ${cfg.enable_auto_import_110 ? 'Aktif' : 'Nonaktif'}`
    );
  };

  const openCalculatorWithResult = (res: ExamResult) => {
    setCalculatorImportData({
      resultId: res.id,
      examTitle: res.exam_title,
      completedAt: res.completed_at,
      twk: res.twk_score,
      tiu: res.tiu_score,
      tkp: res.tkp_score,
      totalScore: res.total_score,
      importedAt: new Date().toISOString()
    });
    setActiveView('kalkulator-skd-skb');
  };

  const clearCalculatorImportData = () => {
    setCalculatorImportData(null);
  };

  const updatePackage = (pkg: PremiumPackage) => {
    setPackages(prev => prev.map(p => (p.id === pkg.id ? pkg : p)));
    addAudit('UPDATE_PACKAGE', 'PACKAGES', pkg.id, `Memperbarui paket: ${pkg.package_name} (${pkg.duration_days} hari)`);
  };

  const adjustActiveSubscribersDuration = (tierKey: MembershipType, deltaDays: number): number => {
    if (!deltaDays || tierKey === 'FREE') return 0;
    let affected = 0;
    const shiftIso = (iso?: string) => {
      const base = iso ? new Date(iso) : new Date();
      if (Number.isNaN(base.getTime())) return new Date(Date.now() + Math.max(1, deltaDays) * 86400000).toISOString();
      base.setDate(base.getDate() + deltaDays);
      return base.toISOString();
    };
    setUsers(prev =>
      prev.map(u => {
        if (u.membership_type === tierKey && u.role !== 'SUPER_ADMIN') {
          affected++;
          return { ...u, premium_end: shiftIso(u.premium_end) };
        }
        return u;
      })
    );
    if (currentUser && currentUser.membership_type === tierKey && currentUser.role !== 'SUPER_ADMIN') {
      setCurrentUser(prev => (prev ? { ...prev, premium_end: shiftIso(prev.premium_end) } : null));
    }
    if (affected > 0) {
      addAudit(
        'ADJUST_SUBSCRIBER_DURATION',
        'USERS',
        tierKey,
        `Menyesuaikan masa aktif ${affected} peserta paket ${tierKey} sebanyak ${deltaDays > 0 ? `+${deltaDays}` : deltaDays} hari`
      );
    }
    return affected;
  };

  const resetAllDemoData = () => {
    localStorage.clear();
    void clearAllVideoBlobs();
    const resetUsers = SEED_USERS.map(su => ({
      ...su,
      password_hash:
        !su.password_hash || su.password_hash.startsWith('sha256_mock_hash_')
          ? hashUserPassword(getDefaultSeedPassword(su))
          : su.password_hash
    }));
    setUsers(resetUsers);
    setCurrentUser(null);
    setQuestions(SEED_QUESTIONS);
    setMaterials(SEED_MATERIALS);
    setShortVideos(SEED_SHORT_VIDEOS);
    setPackages(SEED_PACKAGES);
    setPayments(SEED_PAYMENTS);
    setCommissionWithdrawals(SEED_WITHDRAWALS);
    setEmailLogs(SEED_EMAIL_LOGS);
    setGroupSessions(SEED_GROUP_SESSIONS);
    setLeaderboards(SEED_LEADERBOARD);
    setResults(SEED_RESULTS);
    setSettings(SEED_SETTINGS);
    setAuditLogs(SEED_AUDIT_LOGS);
    setNotifications(SEED_NOTIFICATIONS);
    setAnnouncements(SEED_ANNOUNCEMENTS);
    setExamSession(null);
    setSelectedResultReview(null);
    setCalculatorImportData(null);
    setActiveView('landing');
  };

  return (
    <AppContext.Provider
      value={{
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
        notifications,
        announcements,
        activeView,
        setActiveView,
        materiTab,
        setMateriTab,
        pendingShortVideoId,
        setPendingShortVideoId,
        tryoutHubTab,
        setTryoutHubTab,
        preferredUpgradePackageId,
        setPreferredUpgradePackageId,
        examSession,
        pendingExamLaunch,
        confirmPendingExamLaunch,
        cancelPendingExamLaunch,
        selectedResultReview,
        setSelectedResultReview,
        calculatorImportData,
        openCalculatorWithResult,
        clearCalculatorImportData,
        authModalMode,
        setAuthModalMode,
        login,
        register,
        resetPassword,
        logout,
        updateCurrentUserProfile,
        markEmailLogRead,
        markAllMyEmailsRead,
        validateReferralCode,
        joinAffiliateProgram,
        updateAffiliateReferralCode,
        approveAffiliateApplication,
        rejectAffiliateApplication,
        requestCommissionWithdrawal,
        toggleCommissionPaidStatus,
        markWithdrawalPaid,
        cancelWithdrawalByAdmin,
        payPartnerCommissionDirect,
        updatePartnerByAdmin,
        removePartnerByAdmin,
        startExamByType,
        startExamByPackage,
        answerQuestion,
        toggleFlagQuestion,
        setQuestionIndex,
        finishCurrentExam,
        cancelExam,
        submitPaymentProof,
        registerGroupSession,
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
        adjustActiveSubscribersDuration,
        resetAllDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
