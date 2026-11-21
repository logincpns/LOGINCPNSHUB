import React from 'react';
import {
  useApp,
  ActiveAppView,
  MemberNavView,
  AdminNavView,
  isStandarRestrictedToQuestions,
  hasZoomAccess,
  hasCalculatorAccess,
  getMembershipDisplayLabel
} from '../../context/AppContext';
import { BrandLogo } from './BrandLogo';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  ClipboardList,
  Crown,
  User,
  LogOut,
  Users,
  Database,
  FileSpreadsheet,
  CreditCard,
  Video,
  Settings,
  History,
  X,
  ShieldCheck,
  Megaphone,
  Film,
  PanelLeftClose,
  Calculator
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDesktopOpen?: boolean;
  onToggleDesktop?: () => void;
}

interface SidebarMemberItem {
  id: MemberNavView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isLocked?: boolean;
  lockedBadgeLabel?: string;
  upgradeTargetPkgId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isDesktopOpen = true,
  onToggleDesktop
}) => {
  const {
    currentUser,
    activeView,
    setActiveView,
    logout,
    payments,
    users,
    settings,
    setPreferredUpgradePackageId
  } = useApp();

  if (!currentUser) return null;

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const pendingPaymentsCount = payments.filter(p => p.status === 'WAITING_VERIFICATION').length;
  const pendingAffiliatesCount = users.filter(u => u.affiliate_status === 'PENDING').length;

  const isMateriPremiumBadge =
    !isSuperAdmin &&
    (currentUser.membership_type === 'FREE' ||
      isStandarRestrictedToQuestions(currentUser, settings));
  const isZoomLockedForUser = !hasZoomAccess(currentUser);
  const isCalcLockedForUser = !hasCalculatorAccess(currentUser, settings);

  // Menu Sidebar Kiri Lengkap — urutan sesuai permintaan & menu berbayar/upgrade tetap bisa diklik agar peserta bisa melihat pratinjau isinya
  const memberMenus: SidebarMemberItem[] = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'tryout-latihan', label: '2. Try Out & Latihan', icon: Award },
    { id: 'riwayat-ujian', label: '3. Riwayat Ujian', icon: ClipboardList },
    {
      id: 'materi-belajar',
      label: '4. Materi Belajar',
      icon: BookOpen,
      isLocked: isMateriPremiumBadge,
      lockedBadgeLabel: 'Premium'
    },
    {
      id: 'zoom-bimbel',
      label: '5. Zoom',
      icon: Video,
      isLocked: isZoomLockedForUser,
      lockedBadgeLabel: 'Intensif'
    },
    {
      id: 'kalkulator-skd-skb',
      label: '6. Kalkulator',
      icon: Calculator,
      isLocked: isCalcLockedForUser,
      lockedBadgeLabel: 'Intensif'
    },
    { id: 'premium', label: '7. Paket Belajar', icon: Crown },
    { id: 'profil-saya', label: '8. Profil', icon: User }
  ];

  // PRD Section 16 Super Admin Menus
  const adminMenus = [
    { id: 'admin-dashboard' as AdminNavView, label: '1. Dashboard Admin', icon: LayoutDashboard },
    { id: 'admin-users' as AdminNavView, label: '2. Data Pengguna', icon: Users },
    { id: 'admin-questions' as AdminNavView, label: '3. Bank Soal', icon: Database },
    { id: 'admin-import' as AdminNavView, label: '4. Import Soal', icon: FileSpreadsheet },
    { id: 'admin-materials' as AdminNavView, label: '5. Materi Belajar', icon: BookOpen },
    { id: 'admin-short-videos' as AdminNavView, label: 'Short Video & Upload', icon: Film },
    { id: 'admin-packages' as AdminNavView, label: '6. Paket Premium', icon: Crown },
    {
      id: 'admin-payments' as AdminNavView,
      label: '7. Pembayaran',
      icon: CreditCard,
      badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined
    },
    {
      id: 'admin-premium-activation' as AdminNavView,
      label: '8. Aktivasi & Afiliasi',
      icon: ShieldCheck,
      badge: pendingAffiliatesCount > 0 ? pendingAffiliatesCount : undefined
    },
    { id: 'admin-together-sessions' as AdminNavView, label: '9. Tryout Bersama', icon: Users },
    { id: 'admin-zoom' as AdminNavView, label: '10. Jadwal Zoom', icon: Video },
    { id: 'admin-results' as AdminNavView, label: '11. Hasil Ujian', icon: ClipboardList },
    { id: 'admin-exam-settings' as AdminNavView, label: '12. Pengaturan Ujian', icon: Award },
    { id: 'admin-announcements' as AdminNavView, label: '13. Pengumuman Admin', icon: Megaphone },
    { id: 'admin-app-settings' as AdminNavView, label: '14. Pengaturan Aplikasi', icon: Settings },
    { id: 'admin-audit-logs' as AdminNavView, label: '15. Audit Log', icon: History }
  ];

  const handleNavClick = (viewId: ActiveAppView) => {
    setActiveView(viewId);
    onClose();
  };

  const handleMemberMenuClick = (menu: SidebarMemberItem) => {
    handleNavClick(menu.id);
  };

  const isViewingAdmin = activeView.startsWith('admin-');

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-300 shadow-xs flex flex-col transition-all duration-200 ease-in-out md:static md:z-20 shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDesktopOpen
            ? 'md:translate-x-0 md:w-64 md:opacity-100'
            : 'md:translate-x-0 md:w-0 md:border-r-0 md:overflow-hidden md:opacity-0 md:pointer-events-none'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 md:hidden">
          <button
            type="button"
            onClick={() => handleNavClick(isViewingAdmin ? 'admin-dashboard' : 'dashboard')}
            className="text-left rounded-lg hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
            aria-label="Kembali ke Dashboard"
          >
            <BrandLogo size="sm" showSubtitle />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop & Tablet Collapse Header Bar */}
        <div className="hidden md:flex items-center justify-between px-3.5 py-2 border-b border-slate-100 bg-slate-50/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            Navigasi Menu
          </span>
          {onToggleDesktop && (
            <button
              type="button"
              onClick={onToggleDesktop}
              title="Ciutkan Sidebar untuk Layar Lebih Luas"
              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer whitespace-nowrap"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
              <span>Ciutkan</span>
            </button>
          )}
        </div>

        {/* Super Admin Switcher Pill */}
        {isSuperAdmin && (
          <div className="p-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex rounded-lg bg-slate-200/80 p-1">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`flex-1 py-1 text-xs font-bold rounded-md transition-colors ${
                  !isViewingAdmin
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Peserta
              </button>
              <button
                onClick={() => setActiveView('admin-dashboard')}
                className={`flex-1 py-1 text-xs font-bold rounded-md transition-colors ${
                  isViewingAdmin
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Super Admin
              </button>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {isViewingAdmin && isSuperAdmin ? (
            <>
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Menu Super Admin
              </div>
              {adminMenus.map(menu => {
                const Icon = menu.icon;
                const isActive = activeView === menu.id;
                return (
                  <button
                    key={menu.id}
                    onClick={() => handleNavClick(menu.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="truncate">{menu.label}</span>
                    </div>
                    {menu.badge !== undefined && (
                      <span className="shrink-0 px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-amber-500 text-white">
                        {menu.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          ) : (
            <>
              <div className="px-3 pb-2 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Menu Navigasi Member
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 max-w-full truncate">
                  {isSuperAdmin ? 'Mode Pratinjau Admin' : getMembershipDisplayLabel(currentUser.membership_type)}
                </div>
              </div>
              {memberMenus.map(menu => {
                const Icon = menu.icon;
                const isActive = activeView === menu.id;
                const hasPremiumBadge = Boolean(menu.isLocked);
                return (
                  <button
                    key={menu.id}
                    type="button"
                    onClick={() => handleMemberMenuClick(menu)}
                    title={
                      hasPremiumBadge
                        ? `${menu.label} — Klik untuk melihat pratinjau (Akses penuh di Paket ${menu.lockedBadgeLabel})`
                        : menu.label
                    }
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-xs rounded-lg transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-xs'
                        : 'text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-blue-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{menu.label}</span>
                    </div>

                    {hasPremiumBadge && (
                      <span
                        title={`Fitur Paket ${menu.lockedBadgeLabel}`}
                        className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-extrabold tracking-tight"
                      >
                        <Crown className="w-2.5 h-2.5 text-amber-600 fill-amber-400/60" />
                        <span>{menu.lockedBadgeLabel}</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}

          {/* 9. Keluar / Logout */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
            >
              <LogOut className="w-4 h-4 shrink-0 text-red-500" />
              <span>{isViewingAdmin && isSuperAdmin ? '16. Keluar' : '9. Keluar'}</span>
            </button>
          </div>
        </div>

        {/* Bottom User Card (Clickable -> Profil Saya) */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-xs hover:border-blue-300 transition-colors">
            <button
              type="button"
              onClick={() => handleNavClick('profil-saya')}
              title="Buka Menu Profil Saya"
              className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group"
            >
              <img
                src={currentUser.photo_url}
                alt={currentUser.full_name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-100 group-hover:ring-blue-400 transition-all shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://ui-avatars.com/api/?name=' +
                    encodeURIComponent(currentUser.full_name) +
                    '&background=2563eb&color=fff';
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-700">
                  {currentUser.full_name}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {getMembershipDisplayLabel(currentUser.membership_type)}
                </p>
              </div>
            </button>
            {currentUser.membership_type !== 'INTENSIF' && !isSuperAdmin && (
              <button
                type="button"
                onClick={() => {
                  setPreferredUpgradePackageId(
                    currentUser.membership_type === 'PREMIUM' ? 'pkg-2' : 'pkg-1'
                  );
                  handleNavClick('premium');
                }}
                className="shrink-0 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 cursor-pointer"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
