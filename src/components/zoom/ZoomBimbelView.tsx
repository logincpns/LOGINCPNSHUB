import React, { useState } from 'react';
import { useApp, hasZoomAccess, getMembershipDisplayLabel } from '../../context/AppContext';
import {
  Video,
  Crown,
  Lock,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  Moon,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  Play,
  Camera,
  ZoomIn,
  X,
  History
} from 'lucide-react';

export const ZoomBimbelView: React.FC = () => {
  const {
    currentUser,
    groupSessions,
    leaderboards,
    settings,
    registerGroupSession,
    startExamByType,
    setActiveView,
    setPreferredUpgradePackageId
  } = useApp();

  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  const canAccess = hasZoomAccess(currentUser);

  const redirectToIntensif = () => {
    setPreferredUpgradePackageId('pkg-2');
    setActiveView('premium');
  };

  const upcomingNightSessions = groupSessions.filter(
    s => s.session_category === 'ZOOM_BIMBEL_MALAM' && s.status !== 'FINISHED'
  );
  const upcomingTryoutZoomSessions = groupSessions.filter(
    s => s.session_category !== 'ZOOM_BIMBEL_MALAM' && s.status !== 'FINISHED'
  );
  const pastZoomSessions = groupSessions
    .filter(s => s.status === 'FINISHED')
    .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());

  const waClean = settings.admin_whatsapp.replace(/\D/g, '').replace(/^0/, '62');
  const waCommunityHref = `https://wa.me/${waClean}?text=${encodeURIComponent(
    `Halo Admin LOGIN CPNS, saya peserta Paket Intensif Bimbel (${currentUser?.full_name || ''}) ingin konfirmasi link Grup WhatsApp Eksklusif & jadwal Zoom Bimbel malam hari.`
  )}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-blue-900 to-indigo-800 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold text-amber-300">
            <Moon className="w-3.5 h-3.5" />
            <span>Jadwal Zoom Bimbel Disesuaikan Pada Malam Hari</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Zoom Bimbel &amp; Coaching Live (Belajar Bersama)
          </h1>
          <p className="text-xs text-sky-100 max-w-2xl leading-relaxed">
            Seluruh kelas bimbingan tatap muka daring dilaksanakan pada <strong>malam hari (19.30 – 21.30 WIB)</strong> agar nyaman diikuti oleh peserta yang bekerja atau kuliah.
          </p>
        </div>

        {canAccess ? (
          <a
            href={waCommunityHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm shrink-0 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Gabung Grup WA Tutor &amp; 1-on-1</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={redirectToIntensif}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm shrink-0 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Grup WA Tutor (Khusus Intensif)</span>
          </button>
        )}
      </div>

      {/* Preview Upgrade Banner for non-Intensif */}
      {!canAccess ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-amber-700" />
            </div>
            <div className="space-y-1 text-xs">
              <h2 className="font-extrabold text-amber-950 text-sm">
                Pratinjau Jadwal Zoom Bimbel — Akses Room Terkunci
              </h2>
              <p className="text-amber-900 leading-relaxed">
                Status akun Anda saat ini: <strong>{getMembershipDisplayLabel(currentUser?.membership_type)}</strong>. Anda dapat melihat daftar jadwal kelas malam di bawah ini. Untuk mendaftar sesi, masuk ke Room Zoom, dan bergabung di Grup WA Tutor, silakan upgrade ke <strong>Paket Intensif Bimbel (Belajar Bersama)</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={redirectToIntensif}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Buka Akses Paket Intensif</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-950">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block">Jadwal Fleksibel Malam Hari · 19.30 – 21.30 WIB</strong>
              <span className="text-indigo-800">
                Link Zoom aktif dibuka 15 menit sebelum sesi dimulai. Daftar terlebih dahulu agar kuota kelas Anda terkunci.
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-lg bg-white border border-indigo-200 font-bold text-indigo-700 shrink-0 text-[11px]">
            Akses Aktif: Intensif Bimbel
          </span>
        </div>
      )}

      {/* Section 1: Jadwal Zoom Bimbel Malam Hari (Akan Datang) */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Moon className="w-4 h-4 text-indigo-700" />
          <span>Jadwal Kelas Zoom Bimbel Malam Hari ({upcomingNightSessions.length} Sesi)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingNightSessions.map(session => {
            const isRegistered = currentUser
              ? leaderboards.some(l => l.session_id === session.id && l.user_id === currentUser.id)
              : false;
            return (
              <div
                key={session.id}
                className={`p-5 rounded-2xl bg-white border shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                  canAccess
                    ? 'border-slate-300/80 hover:border-indigo-400'
                    : 'border-amber-300/90 hover:border-amber-400'
                }`}
              >
                <div className="space-y-2.5">
                  {session.poster_url && (
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxImage({
                          url: session.poster_url!,
                          title: session.title,
                          subtitle: `Jadwal: ${new Date(session.start_at).toLocaleString('id-ID')}`
                        })
                      }
                      className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200 group cursor-pointer block"
                    >
                      <img
                        src={session.poster_url}
                        alt={`Poster ${session.title}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-[10px] font-bold inline-flex items-center gap-1">
                        <ZoomIn className="w-3 h-3" /> Lihat Poster
                      </span>
                    </button>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        <Moon className="w-3 h-3" />
                        <span>ZOOM BIMBEL MALAM</span>
                      </span>
                      {!canAccess && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Intensif</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                      Mentor: <strong className="text-slate-800">{session.coach_name}</strong>
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                    {session.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{session.description}</p>

                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Tanggal</span>
                      <span className="font-bold text-slate-800">
                        {new Date(session.start_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Jam Malam</span>
                      <span className="font-bold text-indigo-700">
                        {new Date(session.start_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}{' '}
                        WIB
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Durasi / Kuota</span>
                      <span className="font-bold text-slate-800">
                        {session.duration_minutes}m · {session.quota} org
                      </span>
                    </div>
                  </div>

                  {session.schedule_note && (
                    <div className="text-[11px] font-semibold text-indigo-700 bg-indigo-50/70 px-3 py-1.5 rounded-lg border border-indigo-100">
                      {session.schedule_note}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  {canAccess ? (
                    <>
                      <button
                        type="button"
                        onClick={() => registerGroupSession(session.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                          isRegistered
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {isRegistered ? 'Terdaftar di Sesi Ini ✓' : 'Daftar Sesi Malam'}
                      </button>

                      <a
                        href={session.zoom_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Masuk Room Zoom</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={redirectToIntensif}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-700 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Lock className="w-3 h-3 text-amber-700" />
                        <span>Daftar Sesi Malam</span>
                      </button>

                      <button
                        type="button"
                        onClick={redirectToIntensif}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-2xs cursor-pointer transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Buka Akses Zoom</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Pembahasan Zoom Tryout Akbar (Akan Datang) */}
      {upcomingTryoutZoomSessions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-700" />
            <span>Sesi Tryout Bareng &amp; Bedah Soal Live ({upcomingTryoutZoomSessions.length} Sesi)</span>
          </h2>

          <div className="space-y-3">
            {upcomingTryoutZoomSessions.map(session => (
              <div
                key={session.id}
                className="p-5 rounded-2xl bg-white border border-slate-300/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {session.poster_url && (
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxImage({
                          url: session.poster_url!,
                          title: session.title,
                          subtitle: session.coach_name
                        })
                      }
                      className="w-full sm:w-36 h-24 rounded-xl overflow-hidden border border-slate-200 shrink-0 cursor-pointer"
                    >
                      <img
                        src={session.poster_url}
                        alt={`Poster ${session.title}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold uppercase">
                        {session.status}
                      </span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(session.start_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {session.duration_minutes} Menit
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                      {session.title}
                    </h3>
                    <p className="text-xs text-slate-600">{session.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {canAccess ? (
                    <a
                      href={session.zoom_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Link Zoom</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={redirectToIntensif}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Link Zoom (Intensif)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => startExamByType('TRYOUT_BERSAMA', undefined, session.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Mulai Tryout</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Riwayat & Bukti Pelaksanaan Zoom Sebelumnya */}
      {pastZoomSessions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-700" />
            <span>Riwayat &amp; Dokumentasi Zoom Sebelumnya ({pastZoomSessions.length} Sesi)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastZoomSessions.map(session => {
              const screenshots = session.evidence_screenshots || [];
              return (
                <div
                  key={session.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      TERLAKSANA
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {new Date(session.start_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                      {session.attendance_count ? ` · ${session.attendance_count} Peserta Hadir` : ''}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900">{session.title}</h3>
                  <p className="text-xs text-slate-600">{session.summary_notes || session.description}</p>

                  {screenshots.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 inline-flex items-center gap-1">
                        <Camera className="w-3 h-3 text-emerald-700" />
                        Bukti Screenshot Sesi ({screenshots.length} Foto)
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {screenshots.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setLightboxImage({
                                url: imgUrl,
                                title: `Dokumentasi: ${session.title}`,
                                subtitle: `Mentor: ${session.coach_name}`
                              })
                            }
                            className="h-20 rounded-lg overflow-hidden border border-slate-200 cursor-pointer group"
                          >
                            <img
                              src={imgUrl}
                              alt={`Dokumentasi ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
          onClick={() => setLightboxImage(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">{lightboxImage.title}</h3>
                {lightboxImage.subtitle && (
                  <p className="text-[11px] text-slate-500">{lightboxImage.subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-900 flex items-center justify-center max-h-[75vh]">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-w-full max-h-[68vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
