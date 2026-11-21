import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import { db, auth, OperationType, handleFirestoreError, stripUndefined } from './firebase';
import type {
  User,
  Question,
  PracticePackage,
  Material,
  ShortVideo,
  PremiumPackage,
  Payment,
  CommissionWithdrawal,
  GroupSession,
  ExamResult,
  AppSettings,
  AppNotification,
  AdminAnnouncement,
  EmailNotificationLog,
  AuditLog,
} from '../types';

export const ADMIN_EMAIL = 'loginbimbelasn@gmail.com';

export function isFirebaseAdminUser(fbUser: FirebaseAuthUser | null): boolean {
  return Boolean(
    fbUser &&
      fbUser.emailVerified &&
      fbUser.email?.toLowerCase() === ADMIN_EMAIL
  );
}

const USER_ALLOWED_KEYS: (keyof User | 'uid')[] = [
  'id',
  'uid',
  'full_name',
  'email',
  'phone',
  'photo_url',
  'role',
  'account_status',
  'membership_type',
  'premium_start',
  'premium_end',
  'created_at',
  'updated_at',
  'targetAgency',
  'targetFormation',
  'is_affiliate',
  'affiliate_status',
  'affiliate_joined_at',
  'affiliate_requested_at',
  'affiliate_approved_at',
  'affiliate_approved_by',
  'affiliate_rejection_reason',
  'affiliate_motivation',
  'affiliate_terms_accepted_at',
  'referral_code',
  'affiliate_bank_name',
  'affiliate_account_number',
  'affiliate_account_holder',
  'registered_referral_code',
  'info_source',
  'education',
  'current_job',
  'address',
  'age',
  'password_hash',
];

export function toFirestoreUserPayload(user: User, uidOverride?: string): Record<string, unknown> {
  const raw: Record<string, unknown> = {
    ...user,
    uid: uidOverride || user.id,
  };
  const out: Record<string, unknown> = {};
  for (const key of USER_ALLOWED_KEYS) {
    if (raw[key] !== undefined) {
      out[key] = raw[key];
    }
  }
  return out;
}

export async function syncDoc<T extends Record<string, unknown>>(
  collectionName: string,
  docId: string,
  data: T,
  opType: OperationType = OperationType.WRITE
): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;
  const path = `${collectionName}/${docId}`;
  try {
    const cleanData = stripUndefined(data);
    await setDoc(doc(db, collectionName, docId), cleanData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, opType, path);
  }
}

export async function removeDoc(collectionName: string, docId: string): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;
  const path = `${collectionName}/${docId}`;
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function ensureFirebaseUserProfile(
  fbUser: FirebaseAuthUser,
  existingLocalUsers: User[]
): Promise<User> {
  const uid = fbUser.uid;
  const userPath = `users/${uid}`;
  const isAdminEmail = fbUser.email?.toLowerCase() === ADMIN_EMAIL && fbUser.emailVerified;

  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const data = snap.data() as User;
      if (isAdminEmail && data.role !== 'SUPER_ADMIN') {
        const promoted: User = {
          ...data,
          role: 'SUPER_ADMIN',
          membership_type: 'INTENSIF',
          account_status: 'ACTIVE',
          updated_at: new Date().toISOString(),
        };
        await setDoc(
          doc(db, 'users', uid),
          toFirestoreUserPayload(promoted, uid),
          { merge: true }
        );
        return promoted;
      }
      return data;
    }

    const emailLower = (fbUser.email || '').toLowerCase();
    const matchedLocal = existingLocalUsers.find(u => u.email.toLowerCase() === emailLower);
    const nowIso = new Date().toISOString();

    const newProfile: User = matchedLocal
      ? {
          ...matchedLocal,
          id: uid,
          full_name: matchedLocal.full_name || fbUser.displayName || 'Peserta CPNS',
          email: emailLower || matchedLocal.email,
          photo_url: matchedLocal.photo_url || fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'User')}&background=2563eb&color=fff`,
          role: isAdminEmail ? 'SUPER_ADMIN' : matchedLocal.role,
          membership_type: isAdminEmail ? 'INTENSIF' : matchedLocal.membership_type,
          account_status: 'ACTIVE',
          updated_at: nowIso,
        }
      : {
          id: uid,
          full_name: fbUser.displayName || (isAdminEmail ? 'Super Admin LOGIN CPNS' : 'Peserta CPNS'),
          email: emailLower,
          phone: '',
          photo_url: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'Peserta')}&background=2563eb&color=fff`,
          role: isAdminEmail ? 'SUPER_ADMIN' : 'MEMBER',
          account_status: 'ACTIVE',
          membership_type: isAdminEmail ? 'INTENSIF' : 'FREE',
          created_at: nowIso,
          ...(isAdminEmail
            ? {
                is_affiliate: true,
                affiliate_status: 'APPROVED' as const,
                referral_code: 'LOGINCPNS',
                affiliate_joined_at: nowIso,
                affiliate_approved_at: nowIso,
              }
            : {
                registered_referral_code: 'LOGINCPNS',
              }),
        };

    await setDoc(doc(db, 'users', uid), toFirestoreUserPayload(newProfile, uid));
    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export async function fetchPublicCatalog(): Promise<{
  packages?: PremiumPackage[];
  settings?: AppSettings;
  announcements?: AdminAnnouncement[];
  groupSessions?: GroupSession[];
}> {
  const result: {
    packages?: PremiumPackage[];
    settings?: AppSettings;
    announcements?: AdminAnnouncement[];
    groupSessions?: GroupSession[];
  } = {};

  try {
    const pkgSnap = await getDocs(
      query(collection(db, 'packages'), where('is_active', '==', true))
    );
    if (!pkgSnap.empty) {
      result.packages = pkgSnap.docs.map(d => d.data() as PremiumPackage);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'packages');
  }

  try {
    const settingsSnap = await getDoc(doc(db, 'app_settings', 'global'));
    if (settingsSnap.exists()) {
      result.settings = settingsSnap.data() as AppSettings;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'app_settings/global');
  }

  try {
    const annSnap = await getDocs(
      query(collection(db, 'announcements'), where('is_active', '==', true))
    );
    if (!annSnap.empty) {
      result.announcements = annSnap.docs.map(d => d.data() as AdminAnnouncement);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'announcements');
  }

  try {
    const sessSnap = await getDocs(
      query(
        collection(db, 'group_sessions'),
        where('status', 'in', ['UPCOMING', 'ACTIVE', 'FINISHED'])
      )
    );
    if (!sessSnap.empty) {
      result.groupSessions = sessSnap.docs.map(d => d.data() as GroupSession);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'group_sessions');
  }

  return result;
}

export async function fetchAuthenticatedData(fbUser: FirebaseAuthUser): Promise<{
  users?: User[];
  questions?: Question[];
  practicePackages?: PracticePackage[];
  materials?: Material[];
  shortVideos?: ShortVideo[];
  packages?: PremiumPackage[];
  payments?: Payment[];
  withdrawals?: CommissionWithdrawal[];
  emailLogs?: EmailNotificationLog[];
  results?: ExamResult[];
  notifications?: AppNotification[];
  announcements?: AdminAnnouncement[];
  groupSessions?: GroupSession[];
  auditLogs?: AuditLog[];
  settings?: AppSettings;
}> {
  const admin = isFirebaseAdminUser(fbUser);
  const uid = fbUser.uid;
  const out: {
    users?: User[];
    questions?: Question[];
    practicePackages?: PracticePackage[];
    materials?: Material[];
    shortVideos?: ShortVideo[];
    packages?: PremiumPackage[];
    payments?: Payment[];
    withdrawals?: CommissionWithdrawal[];
    emailLogs?: EmailNotificationLog[];
    results?: ExamResult[];
    notifications?: AppNotification[];
    announcements?: AdminAnnouncement[];
    groupSessions?: GroupSession[];
    auditLogs?: AuditLog[];
    settings?: AppSettings;
  } = {};

  const safeList = async <T,>(
    path: string,
    q: ReturnType<typeof query> | ReturnType<typeof collection>
  ): Promise<T[] | undefined> => {
    try {
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as T);
      }
      return undefined;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  };

  if (admin) {
    out.users = await safeList<User>('users', collection(db, 'users'));
    out.questions = await safeList<Question>('questions', collection(db, 'questions'));
    out.practicePackages = await safeList<PracticePackage>('practice_packages', collection(db, 'practice_packages'));
    out.materials = await safeList<Material>('materials', collection(db, 'materials'));
    out.shortVideos = await safeList<ShortVideo>('short_videos', collection(db, 'short_videos'));
    out.packages = await safeList<PremiumPackage>('packages', collection(db, 'packages'));
    out.payments = await safeList<Payment>('payments', collection(db, 'payments'));
    out.withdrawals = await safeList<CommissionWithdrawal>('commission_withdrawals', collection(db, 'commission_withdrawals'));
    out.emailLogs = await safeList<EmailNotificationLog>('email_logs', collection(db, 'email_logs'));
    out.results = await safeList<ExamResult>('exam_results', collection(db, 'exam_results'));
    out.notifications = await safeList<AppNotification>('notifications', collection(db, 'notifications'));
    out.announcements = await safeList<AdminAnnouncement>('announcements', collection(db, 'announcements'));
    out.groupSessions = await safeList<GroupSession>('group_sessions', collection(db, 'group_sessions'));
    out.auditLogs = await safeList<AuditLog>('audit_logs', collection(db, 'audit_logs'));
  } else {
    out.questions = await safeList<Question>(
      'questions',
      query(collection(db, 'questions'), where('is_active', '==', true))
    );
    out.practicePackages = await safeList<PracticePackage>(
      'practice_packages',
      query(collection(db, 'practice_packages'), where('is_active', '==', true))
    );
    out.materials = await safeList<Material>(
      'materials',
      query(collection(db, 'materials'), where('is_active', '==', true))
    );
    out.shortVideos = await safeList<ShortVideo>(
      'short_videos',
      query(collection(db, 'short_videos'), where('is_active', '==', true))
    );
    out.payments = await safeList<Payment>(
      'payments',
      query(collection(db, 'payments'), where('user_id', '==', uid))
    );
    out.withdrawals = await safeList<CommissionWithdrawal>(
      'commission_withdrawals',
      query(collection(db, 'commission_withdrawals'), where('affiliate_user_id', '==', uid))
    );
    out.emailLogs = await safeList<EmailNotificationLog>(
      'email_logs',
      query(collection(db, 'email_logs'), where('recipient_user_id', '==', uid))
    );
    out.results = await safeList<ExamResult>(
      'exam_results',
      query(collection(db, 'exam_results'), where('user_id', '==', uid))
    );
    out.notifications = await safeList<AppNotification>(
      'notifications',
      query(collection(db, 'notifications'), where('user_id', '==', uid))
    );
  }

  return out;
}

export async function seedInitialFirestoreIfAdmin(
  fbUser: FirebaseAuthUser,
  seed: {
    packages: PremiumPackage[];
    practicePackages: PracticePackage[];
    questions: Question[];
    materials: Material[];
    shortVideos: ShortVideo[];
    groupSessions: GroupSession[];
    announcements: AdminAnnouncement[];
    settings: AppSettings;
  }
): Promise<void> {
  if (!isFirebaseAdminUser(fbUser)) return;
  try {
    const settingsSnap = await getDoc(doc(db, 'app_settings', 'global'));
    if (settingsSnap.exists()) return;

    const batch = writeBatch(db);
    batch.set(doc(db, 'app_settings', 'global'), stripUndefined(seed.settings as unknown as Record<string, unknown>));

    for (const pkg of seed.packages) {
      batch.set(doc(db, 'packages', pkg.id), stripUndefined(pkg as unknown as Record<string, unknown>));
    }
    for (const pp of seed.practicePackages) {
      batch.set(doc(db, 'practice_packages', pp.id), stripUndefined(pp as unknown as Record<string, unknown>));
    }
    for (const mat of seed.materials) {
      batch.set(doc(db, 'materials', mat.id), stripUndefined(mat as unknown as Record<string, unknown>));
    }
    for (const vid of seed.shortVideos) {
      batch.set(doc(db, 'short_videos', vid.id), stripUndefined(vid as unknown as Record<string, unknown>));
    }
    for (const sess of seed.groupSessions) {
      batch.set(doc(db, 'group_sessions', sess.id), stripUndefined(sess as unknown as Record<string, unknown>));
    }
    for (const ann of seed.announcements) {
      batch.set(doc(db, 'announcements', ann.id), stripUndefined(ann as unknown as Record<string, unknown>));
    }
    await batch.commit();

    // Seed questions in chunks of 400 (Firestore batch limit is 500)
    for (let i = 0; i < seed.questions.length; i += 400) {
      const qBatch = writeBatch(db);
      const chunk = seed.questions.slice(i, i + 400);
      for (const q of chunk) {
        qBatch.set(doc(db, 'questions', q.id), stripUndefined(q as unknown as Record<string, unknown>));
      }
      await qBatch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'app_settings/global');
  }
}
