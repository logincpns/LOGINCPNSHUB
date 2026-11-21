export type UserRole = 'SUPER_ADMIN' | 'MEMBER';

export type MembershipType = 'FREE' | 'STANDAR' | 'PREMIUM' | 'INTENSIF';

export type QuestionCategory = 'TWK' | 'TIU' | 'TKP';

export type ExamType = 
  | 'TRYOUT_SKD_LENGKAP' // 110 soal, 100 menit (TWK 30, TIU 35, TKP 45) - Fitur Premium
  | 'TRYOUT_KATEGORI'     // 30 soal, 25 menit (TWK, TIU, atau TKP) - Fitur Premium
  | 'LATIHAN_HARIAN'      // 15 soal, 10 menit (TWK, TIU, atau TKP) - Free & Premium
  | 'TRYOUT_BERSAMA';     // Sesi terjadwal serentak dengan Zoom & Leaderboard

export type DifficultyLevel = 'Mudah' | 'Sedang' | 'Sukar';

export type PaymentStatus = 
  | 'WAITING_PAYMENT' 
  | 'WAITING_VERIFICATION' 
  | 'APPROVED' 
  | 'REJECTED';

export type CommissionStatus = 'UNPAID' | 'PAID' | 'NOT_APPLICABLE';

export type AffiliateStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

// 17.1 users table
export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  password_hash?: string;
  photo_url: string;
  role: UserRole;
  account_status: 'ACTIVE' | 'INACTIVE';
  membership_type: MembershipType;
  premium_start?: string;
  premium_end?: string;
  created_at: string;
  updated_at?: string;
  targetAgency?: string;
  targetFormation?: string;
  // Affiliate & Referral fields
  is_affiliate?: boolean;
  affiliate_status?: AffiliateStatus;
  affiliate_joined_at?: string;
  affiliate_requested_at?: string;
  affiliate_approved_at?: string;
  affiliate_approved_by?: string;
  affiliate_rejection_reason?: string;
  affiliate_motivation?: string;
  affiliate_terms_accepted_at?: string;
  referral_code?: string;
  affiliate_bank_name?: string;
  affiliate_account_number?: string;
  affiliate_account_holder?: string;
  registered_referral_code?: string;
  // Additional Registration & Profile fields
  info_source?: string;
  education?: string;
  current_job?: string;
  address?: string;
  age?: number;
}

// 17.2 questions table
export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
  score?: number; // 1 to 5 for TKP
}

export type PackageAccessTier = 'GRATIS' | 'PREMIUM' | 'PLATINUM';
export type PackageType = 'TRYOUT_SKD' | 'LATIHAN_HARIAN' | 'DRILL_KATEGORI' | 'TRYOUT_AKBAR';

export interface PracticePackage {
  id: string;
  title: string; // e.g. "Latihan TIU 50 – Penalaran Logis" or "Try Out SKD 2026 – Platinum #2"
  subtitle?: string; // e.g. "Penalaran Logis & Silogisme HOTS"
  package_type: PackageType;
  category: QuestionCategory | 'CAMPURAN';
  access_tier: PackageAccessTier;
  question_count: number;
  duration_minutes: number;
  rating?: number;
  review_count?: number;
  completed_count?: number;
  is_popular?: boolean;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface Question {
  id: string;
  category: QuestionCategory;
  topic: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: 'A' | 'B' | 'C' | 'D' | 'E'; // For TWK & TIU
  weight_a: number; // 1 to 5 for TKP
  weight_b: number;
  weight_c: number;
  weight_d: number;
  weight_e: number;
  explanation: string;
  difficulty: DifficultyLevel;
  is_active: boolean;
  package_id?: string; // primary id of package/box
  package_title?: string; // e.g. "TIU 1 : Penalaran Logis"
  package_ids?: string[]; // all package/box IDs that include this question
  created_at: string;
  updated_at?: string;
}

export type MaterialCategory = QuestionCategory | 'STRATEGI';

export type ShortVideoCategory = 'KIAT_BELAJAR' | 'TIU' | 'TWK' | 'TKP' | 'STRATEGI';

export type ShortVideoSourceType = 'UPLOAD' | 'URL';

export interface MaterialExample {
  question: string;
  answer: string;
  analysis: string;
}

// 17.3 materials table
export interface Material {
  id: string;
  title: string;
  category: MaterialCategory;
  summary: string;
  content: string;
  intro?: string;
  key_points?: string[];
  quick_formulas?: string[];
  example?: MaterialExample;
  file_url?: string;
  is_premium: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  video_url?: string;
  video_blob_id?: string;
  video_file_name?: string;
  video_file_size_bytes?: number;
  drive_file_id?: string;
}

export interface ShortVideo {
  id: string;
  title: string;
  category: ShortVideoCategory;
  topic?: string;
  description: string;
  source_type: ShortVideoSourceType;
  video_blob_id?: string;
  video_url?: string;
  file_name?: string;
  file_size_bytes?: number;
  mime_type?: string;
  duration_label?: string;
  is_premium: boolean;
  is_active: boolean;
  author_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface PackageFeatureItem {
  label: string;
  included: boolean;
}

// 17.8 packages table
export interface PremiumPackage {
  id: string;
  tier_key?: 'STANDAR' | 'PREMIUM' | 'INTENSIF';
  package_name: string;
  price: number;
  original_price?: number;
  promo_badge?: string;
  allow_discount?: boolean; // false for Paket Standar (Tanpa Promo & Diskon)
  duration_days: number;
  description: string;
  is_active: boolean;
  is_recommended?: boolean;
  features: string[];
  feature_items?: PackageFeatureItem[];
}

// 17.9 payments table
export interface Payment {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  user_registered_at?: string;
  package_id: string;
  package_name: string;
  original_amount?: number;
  promo_discount?: number;
  is_package_upgrade?: boolean;
  previous_membership_type?: MembershipType;
  previous_package_name?: string;
  upgrade_credit_amount?: number;
  referral_code?: string;
  referral_discount?: number;
  amount: number;
  affiliate_user_id?: string;
  affiliate_name?: string;
  affiliate_commission?: number;
  commission_status?: CommissionStatus;
  commission_paid_at?: string;
  commission_paid_by?: string;
  commission_proof_url?: string;
  payment_method: 'TRANSFER_BANK' | 'EWALLET' | 'QRIS' | 'COD_WHATSAPP';
  bank_name?: string;
  sender_name?: string;
  proof_url: string;
  status: PaymentStatus;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface CommissionWithdrawal {
  id: string;
  affiliate_user_id: string;
  affiliate_name: string;
  affiliate_email: string;
  affiliate_phone: string;
  referral_code: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
  identity_number?: string;
  status: 'REQUESTED' | 'PAID' | 'CANCELLED';
  requested_at: string;
  paid_at?: string;
  paid_by?: string;
  proof_url?: string;
  notes?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
}

// 17.10 group_sessions table
export interface GroupSession {
  id: string;
  title: string;
  description: string;
  exam_type: ExamType;
  question_count: number;
  duration_minutes: number;
  start_at: string;
  end_at: string;
  quota: number;
  zoom_url: string;
  coach_name: string;
  status: 'UPCOMING' | 'ACTIVE' | 'FINISHED';
  session_category?: 'TRYOUT_BARENG' | 'ZOOM_BIMBEL_MALAM';
  schedule_note?: string;
  poster_url?: string;
  evidence_screenshots?: string[];
  attendance_count?: number;
  summary_notes?: string;
  created_at: string;
  updated_at?: string;
}

// 17.11 session_participants table
export interface SessionParticipant {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  exam_id?: string;
  registration_status: 'REGISTERED' | 'ATTENDED';
}

// 17.12 leaderboard table
export interface LeaderboardEntry {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  twk_score: number;
  tiu_score: number;
  tkp_score: number;
  total_score: number;
  completion_time_seconds: number;
  rank: number;
}

// 17.4 exams & 17.7 results
export interface PassingGradeConfig {
  twk: number; // e.g. 65
  tiu: number; // e.g. 80
  tkp: number; // e.g. 166
  regulation_info: string; // e.g. "KepmenPAN-RB No. 321 Tahun 2024"
}

export interface ExamSessionInstance {
  id: string;
  user_id: string;
  session_id?: string; // If group tryout
  exam_type: ExamType;
  category?: QuestionCategory;
  total_questions: number;
  duration_minutes: number;
  started_at: string;
  deadline_at: string;
  submitted_at?: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
  total_score: number;
  twk_score: number;
  tiu_score: number;
  tkp_score: number;
  pass_status: 'MEMENUHI_AMBANG_BATAS' | 'BELUM_MEMENUHI_AMBANG_BATAS';
}

export interface ExamResult {
  id: string;
  exam_id: string;
  user_id: string;
  user_name: string;
  exam_title: string;
  exam_type: ExamType;
  category?: QuestionCategory;
  session_id?: string;
  completed_at: string;
  duration_seconds: number;
  total_questions: number;
  answered_count: number;
  unanswered_count: number;
  twk_score: number;
  tiu_score: number;
  tkp_score: number;
  total_score: number;
  pass_status: 'MEMENUHI_AMBANG_BATAS' | 'BELUM_MEMENUHI_AMBANG_BATAS';
  passing_grade_snapshot: PassingGradeConfig;
  user_answers: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>; // question_id -> answer
  flagged_map: Record<string, boolean>; // question_id -> is_doubtful
  questions_snapshot: Question[];
}

export interface SkdCalculatorConfig {
  enabled: boolean;
  access_tier: 'INTENSIF_ONLY' | 'PREMIUM_AND_INTENSIF' | 'ALL_PAID';
  enable_auto_import_110: boolean;
  skd_weight_percent: number; // default 40
  skb_weight_percent: number; // default 60
  max_twk: number; // default 150
  max_tiu: number; // default 175
  max_tkp: number; // default 225
  max_skb_cat: number; // default 500
  default_competitor_skd: number; // default 420
  default_competitor_skb: number; // default 72
  calculator_note?: string;
}

export interface CalculatorImportPayload {
  resultId: string;
  examTitle: string;
  completedAt: string;
  twk: number;
  tiu: number;
  tkp: number;
  totalScore: number;
  importedAt: string;
}

export interface InstallTutorialImage {
  id: string;
  title: string;
  caption?: string;
  image_url: string;
  created_at: string;
}

export type PaymentChannelCategory = 'BANK' | 'EWALLET' | 'QRIS' | 'COD';

export interface PaymentChannelConfig {
  id: string;
  category: PaymentChannelCategory;
  provider_name: string;
  account_number: string;
  account_holder: string;
  qr_image_url?: string;
  instructions?: string;
  is_active: boolean;
}

// 17.13 settings table
export interface AppSettings {
  app_name: string;
  headline: string;
  admin_whatsapp: string; // 081312139893
  non_cash_phone?: string; // Nomor HP pembayaran non-tunai (DANA / OVO / GoPay / konfirmasi)
  admin_email?: string; // loginbimbelasn@gmail.com
  affiliate_commission_amount?: number; // default Rp 10.000
  referral_discount_amount?: number; // default Rp 20.000
  min_commission_withdrawal?: number; // default Rp 50.000
  lock_materials_for_premium_only?: boolean; // default true: kunci materi hanya untuk Premium & Intensif (bukan Standar)
  standar_questions_only?: boolean; // default true: Paket Standar hanya akses soal saja
  default_passing_grade: PassingGradeConfig;
  skd_calculator_config?: SkdCalculatorConfig;
  daily_limit_free_user: number;
  maintenance_mode: boolean;
  bank_accounts: {
    bank_name: string;
    account_number: string;
    account_holder: string;
  }[];
  payment_channels?: PaymentChannelConfig[];
  qris_image_url?: string;
  qris_merchant_name?: string;
  qris_notes?: string;
  google_drive_folder_id: string;
  google_drive_status: 'CONNECTED_SIMULATED' | 'READY';
  install_tutorial_poster_url?: string;
  install_tutorial_images?: InstallTutorialImage[];
}

// 17.14 audit_logs table
export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  created_at: string;
}

// App In-App Notification (Section 19)
export interface AppNotification {
  id: string;
  user_id?: string; // undefined means broadcast
  title: string;
  message: string;
  type: 'PAYMENT' | 'PREMIUM' | 'TRYOUT' | 'ANNOUNCEMENT';
  created_at: string;
  is_read: boolean;
}

export type AnnouncementCategory = 'JADWAL_CPNS' | 'MAINTENANCE' | 'TRYOUT' | 'BERITA_UMUM';

export interface AdminAnnouncement {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: AnnouncementCategory;
  is_pinned: boolean;
  is_active: boolean;
  author_name: string;
  created_at: string;
  updated_at?: string;
}

export type EmailLogCategory =
  | 'ACCOUNT_WELCOME'
  | 'WAITING_PAYMENT'
  | 'PAYMENT_APPROVED'
  | 'PAYMENT_REJECTED'
  | 'PREMIUM_ACTIVE'
  | 'AFFILIATE_REQUESTED'
  | 'AFFILIATE_APPROVED'
  | 'AFFILIATE_REJECTED'
  | 'COMMISSION_WITHDRAWAL_REQUESTED'
  | 'COMMISSION_PAID'
  | 'COMMISSION_CANCELLED';

export interface EmailNotificationLog {
  id: string;
  recipient_user_id: string;
  recipient_name: string;
  recipient_email: string;
  sender_email: string;
  subject: string;
  body: string;
  category: EmailLogCategory;
  related_entity_id?: string;
  is_read: boolean;
  created_at: string;
}
