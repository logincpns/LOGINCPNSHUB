import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthModals } from './components/auth/AuthModals';
import { LandingPage } from './components/landing/LandingPage';
import { ParticipantDashboard } from './components/dashboard/ParticipantDashboard';
import { TryoutHubView } from './components/tryout/TryoutHubView';
import { RiwayatUjianView } from './components/riwayat/RiwayatUjianView';
import { MateriBelajarView } from './components/materi/MateriBelajarView';
import { PremiumView } from './components/premium/PremiumView';
import { ProfilView } from './components/profil/ProfilView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { ZoomBimbelView } from './components/zoom/ZoomBimbelView';
import { SkdSkbCalculatorView } from './components/kalkulator/SkdSkbCalculatorView';
import { CatEngine } from './components/cat/CatEngine';
import { FloatingWhatsAppButton } from './components/layout/FloatingWhatsAppButton';
import { ExamStartConfirmModal } from './components/cat/ExamStartConfirmModal';

function AppContent() {
  const { currentUser, activeView, examSession } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsDesktopSidebarOpen(prev => !prev);
    } else {
      setIsSidebarOpen(prev => !prev);
    }
  };

  // 1. Full-screen CAT Exam Engine if exam is currently running (PRD Section 8) - Tanpa tombol bantuan WA
  if (examSession) {
    return <CatEngine />;
  }

  // 2. Unauthenticated Visitor Mode or explicit landing page (PRD Section 5.1)
  if (!currentUser || activeView === 'landing') {
    return (
      <>
        <LandingPage />
        <AuthModals />
        <FloatingWhatsAppButton />
      </>
    );
  }

  // 3. Logged-in Application Shell (Member or Super Admin)
  return (
    <div className="min-h-screen bg-[#d4dce6] text-slate-900 flex flex-col font-sans">
      <Navbar
        onToggleSidebar={handleToggleSidebar}
        isDesktopSidebarOpen={isDesktopSidebarOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isDesktopOpen={isDesktopSidebarOpen}
          onToggleDesktop={() => setIsDesktopSidebarOpen(prev => !prev)}
        />

        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Member Views per PRD Section 20 */}
          {activeView === 'dashboard' && <ParticipantDashboard />}
          {activeView === 'materi-belajar' && <MateriBelajarView />}
          {activeView === 'tryout-latihan' && <TryoutHubView />}
          {activeView === 'zoom-bimbel' && <ZoomBimbelView />}
          {activeView === 'kalkulator-skd-skb' && <SkdSkbCalculatorView />}
          {activeView === 'riwayat-ujian' && <RiwayatUjianView />}
          {activeView === 'premium' && <PremiumView />}
          {activeView === 'profil-saya' && <ProfilView />}

          {/* Super Admin Views per PRD Section 16 */}
          {activeView.startsWith('admin-') &&
            (currentUser.role === 'SUPER_ADMIN' ? (
              <AdminDashboardView />
            ) : (
              <ParticipantDashboard />
            ))}
        </main>
      </div>

      <AuthModals />
      <ExamStartConfirmModal />
      <FloatingWhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
