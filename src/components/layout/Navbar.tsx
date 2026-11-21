import React, { useState, useRef, useEffect } from 'react';
import { useApp, getMembershipDisplayLabel } from '../../context/AppContext';
import { BrandLogo } from './BrandLogo';
import {
  Menu,
  LogIn,
  UserPlus,
  ShieldCheck,
  Crown,
  UserCheck,
  ChevronDown,
  User as UserIcon,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  isDesktopSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isDesktopSidebarOpen = true }) => {
  const {
    currentUser,
    examSession,
    setAuthModalMode,
    activeView,
    setActiveView,
    logout
  } = useApp();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAccountMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  if (examSession) return null;

  const handleLogoClick = () => {
    if (!currentUser) {
      setActiveView('landing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (currentUser.role === 'SUPER_ADMIN' && activeView.startsWith('admin-')) {
      setActiveView('admin-dashboard');
    } else {
      setActiveView('dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRoleOrPackageLabel = () => {
    if (!currentUser) return 'Tamu';
    if (currentUser.role === 'SUPER_ADMIN') return 'Super Admin';
    switch (currentUser.membership_type) {
      case 'INTENSIF':
        return 'Intensif';
      case 'PREMIUM':
        return 'Premium';
      case 'STANDAR':
        return 'Standar';
      default:
        return 'Gratis';
    }
  };

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-300 shadow-2xs transition-colors">
      <div className="px-3 sm:px-4 md:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Dynamic Sidebar Toggle (Mobile, Tablet & PC) & Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {currentUser && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors shrink-0 cursor-pointer border ${
                !isDesktopSidebarOpen
                  ? 'md:bg-blue-50 md:text-blue-700 md:border-blue-200 md:hover:bg-blue-100 text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'
              }`}
              aria-label="Buka atau Ciutkan Sidebar Kiri"
              title={isDesktopSidebarOpen ? 'Ciutkan Sidebar Kiri (Layar Lebih Luas)' : 'Aktifkan Sidebar Kiri'}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleLogoClick}
            title="Kembali ke Dashboard"
            aria-label="Kembali ke Dashboard"
            className="flex items-center gap-2 shrink-0 text-left rounded-xl px-1.5 py-1 -mx-1.5 -my-1 hover:bg-slate-100/80 active:scale-[0.98] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <BrandLogo size="md" showSubtitle />
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 whitespace-nowrap">
              SIMULASI CAT SKD
            </span>
          </button>
        </div>

        {/* Center: System Trust Notice */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-slate-500">
          <span>Passing Grade: TWK 65</span>
          <span aria-hidden="true">·</span>
          <span>TIU 80</span>
          <span aria-hidden="true">·</span>
          <span>TKP 166</span>
        </div>

        {/* Right: Role/Package Badge + Profile Avatar & Logout Dropdown (No account/role switching) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {currentUser ? (
            <div className="relative flex items-center gap-2 sm:gap-2.5" ref={accountMenuRef}>
              {/* Role / Package Pill Badge next to Profile Photo (Read-only status + Logout menu) */}
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(prev => !prev)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg border transition-colors shadow-2xs shrink-0 whitespace-nowrap cursor-pointer ${
                  isSuperAdmin
                    ? 'border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100'
                    : currentUser.membership_type === 'INTENSIF' || currentUser.membership_type === 'PREMIUM'
                    ? 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100'
                    : 'border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100'
                }`}
                title="Klik untuk melihat menu akun & Logout"
                aria-expanded={isAccountMenuOpen}
              >
                {isSuperAdmin ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                ) : currentUser.membership_type === 'INTENSIF' || currentUser.membership_type === 'PREMIUM' ? (
                  <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                )}
                <span className="hidden sm:inline">{isSuperAdmin ? 'Peran:' : 'Paket:'}</span>
                <span className="font-bold">{getRoleOrPackageLabel()}</span>
                <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Photo + Name Trigger */}
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(prev => !prev)}
                title="Menu Akun & Logout"
                aria-expanded={isAccountMenuOpen}
                className="flex items-center gap-2 pl-2 border-l border-slate-200 shrink-0 group cursor-pointer rounded-lg hover:bg-slate-50 pr-1.5 py-0.5 transition-colors"
              >
                <img
                  src={currentUser.photo_url}
                  alt={currentUser.full_name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-200 group-hover:ring-blue-500 transition-all shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://ui-avatars.com/api/?name=' +
                      encodeURIComponent(currentUser.full_name) +
                      '&background=2563eb&color=fff';
                  }}
                />
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[150px] group-hover:text-blue-700">
                    {currentUser.full_name}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-tight truncate max-w-[150px]">
                    {currentUser.targetAgency || currentUser.email}
                  </p>
                </div>
              </button>

              {/* Account Dropdown Menu (Profil & Logout Only) */}
              {isAccountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70">
                    <p className="text-xs font-extrabold text-slate-900 truncate">
                      {currentUser.full_name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {currentUser.email}
                    </p>
                    <div className="mt-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isSuperAdmin
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-sky-50 text-sky-800 border-sky-200'
                      }`}>
                        {isSuperAdmin ? 'Peran: Super Admin' : getMembershipDisplayLabel(currentUser.membership_type)}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveView('profil-saya');
                        setIsAccountMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700 flex items-center gap-2.5 cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Profil Saya &amp; Keamanan</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAuthModalMode('LOGIN')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </button>
              <button
                onClick={() => setAuthModalMode('REGISTER')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar Akun</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
