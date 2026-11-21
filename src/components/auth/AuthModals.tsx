import React, { useState } from 'react';
import { useApp, OFFICIAL_SENDER_EMAIL } from '../../context/AppContext';
import { X, Lock, Mail, User, Phone, CheckCircle2, AlertCircle, ShieldCheck, GraduationCap, Briefcase, MapPin, Calendar, Compass, LogOut } from 'lucide-react';

export const INFO_SOURCE_OPTIONS = [
  'Teman',
  'Keluarga',
  'Saran Orang Lain',
  'Facebook',
  'Instagram (IG)',
  'WhatsApp (WA)',
  'TikTok',
  'YouTube',
  'Pencarian Google',
  'Lainnya'
];

export const AuthModals: React.FC = () => {
  const { currentUser, authModalMode, setAuthModalMode, login, loginWithGoogle, register, resetPassword, logout, settings } = useApp();
  const senderEmail = settings.admin_email || OFFICIAL_SENDER_EMAIL;
  const activeReferralDiscount = settings.referral_discount_amount ?? 20000;

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regInfoSource, setRegInfoSource] = useState('');
  const [regInfoSourceOther, setRegInfoSourceOther] = useState('');
  const [regEducation, setRegEducation] = useState('');
  const [regJob, setRegJob] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regReferralCode, setRegReferralCode] = useState('LOGINCPNS');
  const [regAgreedTerms, setRegAgreedTerms] = useState(false);
  const [showRegisterTerms, setShowRegisterTerms] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  if (authModalMode === 'NONE') return null;

  if (currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 text-amber-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="font-extrabold text-sm text-slate-900">Sesi Akun Aktif</h3>
            </div>
            <button
              type="button"
              onClick={() => setAuthModalMode('NONE')}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Saat ini Anda sedang masuk sebagai <strong>{currentUser.full_name}</strong> ({currentUser.email}). Aplikasi hanya mengizinkan satu akun aktif dalam satu waktu. Untuk masuk atau mendaftar dengan akun lain, silakan keluar (Logout) terlebih dahulu.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAuthModalMode('NONE')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                setAuthModalMode('LOGIN');
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout &amp; Masuk Akun Lain</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail || !loginPassword) {
      setLoginError('Mohon isi email dan password Anda.');
      return;
    }
    const res = login(loginEmail, loginPassword);
    if (!res.success) {
      setLoginError(res.message);
    } else {
      setLoginPassword('');
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setLoginError(res.message);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword) {
      setRegError('Seluruh bidang utama formulir wajib diisi.');
      return;
    }
    if (!regInfoSource) {
      setRegError('Mohon pilih dari mana Anda mengetahui aplikasi LOGIN CPNS.');
      return;
    }
    if (!regEducation.trim()) {
      setRegError('Mohon isi pendidikan terakhir / pendidikan yang digunakan mendaftar CPNS.');
      return;
    }
    if (!regJob.trim()) {
      setRegError('Mohon isi pekerjaan Anda saat ini.');
      return;
    }
    const parsedAge = Number(regAge);
    if (!regAge || Number.isNaN(parsedAge) || parsedAge < 15 || parsedAge > 70) {
      setRegError('Mohon isi umur Anda dengan angka yang valid (15–70 tahun).');
      return;
    }
    if (!regAddress.trim()) {
      setRegError('Mohon isi alamat lengkap / domisili Anda.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      setRegError('Format email tidak valid. Masukkan alamat email aktif yang benar (contoh: nama@gmail.com).');
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password minimal 6 karakter.');
      return;
    }
    if (!regAgreedTerms) {
      setRegError('Anda wajib menyetujui Syarat & Ketentuan Layanan Bimbel LOGIN CPNS sebelum mendaftar.');
      return;
    }

    const finalInfoSource =
      regInfoSource === 'Lainnya' && regInfoSourceOther.trim()
        ? `Lainnya: ${regInfoSourceOther.trim()}`
        : regInfoSource;

    const res = register(regName, regEmail.trim(), regPhone, regPassword, regReferralCode, {
      info_source: finalInfoSource,
      education: regEducation.trim(),
      current_job: regJob.trim(),
      address: regAddress.trim(),
      age: parsedAge
    });
    if (!res.success) {
      setRegError(res.message);
    } else {
      setRegSuccess(res.message);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (forgotStep === 1) {
      if (!forgotEmail.trim() || !forgotPhone.trim()) {
        setForgotError('Masukkan email dan nomor WhatsApp terdaftar Anda.');
        return;
      }
      setForgotStep(2);
    } else {
      if (!forgotNewPassword || forgotNewPassword.length < 6) {
        setForgotError('Password baru minimal 6 karakter.');
        return;
      }
      const res = resetPassword(forgotEmail, forgotPhone, forgotNewPassword);
      if (!res.success) {
        setForgotError(res.message);
        setForgotStep(1);
      } else {
        setForgotSuccess(res.message);
        setTimeout(() => {
          setAuthModalMode('LOGIN');
          setForgotStep(1);
          setForgotEmail('');
          setForgotPhone('');
          setForgotNewPassword('');
          setForgotSuccess('');
        }, 1500);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-[10px] overflow-hidden shrink-0 flex items-start justify-center shadow-2xs">
              <img
                src="/assets/aistudio/image_171e0b3e.png"
                alt="Logo LOGIN CPNS"
                className="w-[136%] max-w-none -mt-[3%] select-none pointer-events-none"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-base text-slate-900">
                {authModalMode === 'LOGIN' && 'Masuk ke LOGIN CPNS'}
                {authModalMode === 'REGISTER' && 'Pendaftaran Akun Baru'}
                {authModalMode === 'FORGOT_PASSWORD' && 'Reset Password Akun'}
              </h3>
              <p className="text-xs text-slate-500">
                {authModalMode === 'LOGIN' && 'Gunakan email terdaftar Anda'}
                {authModalMode === 'REGISTER' && 'Lengkapi identitas untuk memulai simulasi CAT'}
                {authModalMode === 'FORGOT_PASSWORD' && 'Pulihkan akses akun Anda dengan aman'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAuthModalMode('NONE')}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= LOGIN FORM ================= */}
        {authModalMode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Terdaftar</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setAuthModalMode('FORGOT_PASSWORD')}
                  className="text-[11px] text-blue-700 hover:underline"
                >
                  Lupa Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors mt-2 cursor-pointer"
            >
              Masuk Sekarang
            </button>

            <div className="relative flex items-center py-1">
              <div className="grow border-t border-slate-200" />
              <span className="shrink mx-3 text-[11px] text-slate-400 font-semibold">atau</span>
              <div className="grow border-t border-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
                <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
              </svg>
              <span>{isGoogleLoading ? 'Menghubungkan Google...' : 'Masuk dengan Google'}</span>
            </button>

            <div className="pt-2 text-center text-xs text-slate-600">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('REGISTER')}
                className="font-bold text-blue-700 hover:underline"
              >
                Daftar Akun Baru
              </button>
            </div>
          </form>
        )}

        {/* ================= REGISTER FORM ================= */}
        {authModalMode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5">
            {regError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}
            {regSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Nama sesuai KTP"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Email Aktif (Untuk Notifikasi Transaksi &amp; Akun)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="nama@gmail.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">
                Bukti menunggu bayar, konfirmasi lunas, aktivasi Premium &amp; komisi dikirim dari <strong className="font-mono text-slate-700">{senderEmail}</strong> ke email ini.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">Nomor WhatsApp Aktif</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400/70"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Umur (Tahun)</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min={15}
                    max={70}
                    value={regAge}
                    onChange={e => setRegAge(e.target.value)}
                    placeholder="Misal: 24"
                    className="w-full pl-9 pr-2 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400/70"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Pendidikan Terakhir / Pendidikan Daftar CPNS
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={regEducation}
                  onChange={e => setRegEducation(e.target.value)}
                  placeholder="Misal: S1 Akuntansi / D3 Keperawatan / SMA Sederajat"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400/70"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Pekerjaan Saat Ini</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={regJob}
                  onChange={e => setRegJob(e.target.value)}
                  placeholder="Misal: Guru Honorer, Karyawan Swasta, Mahasiswa"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400/70"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Alamat</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={regAddress}
                  onChange={e => setRegAddress(e.target.value)}
                  placeholder="Misal: Kampung Jawa, Blangkejeren"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400/60"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Anda Tahu Aplikasi Ini Dari Mana?
              </label>
              <div className="relative">
                <Compass className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <select
                  value={regInfoSource}
                  onChange={e => setRegInfoSource(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  required
                >
                  <option value="">-- Pilih Sumber Informasi --</option>
                  {INFO_SOURCE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              {regInfoSource === 'Lainnya' && (
                <input
                  type="text"
                  value={regInfoSourceOther}
                  onChange={e => setRegInfoSourceOther(e.target.value)}
                  placeholder="Tulis sumber informasi lainnya (opsional)..."
                  className="mt-1.5 w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400/70"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Min 6 karakter"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Konfirmasi</label>
                <input
                  type="password"
                  value={regConfirm}
                  onChange={e => setRegConfirm(e.target.value)}
                  placeholder="Ulangi password"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-blue-950">Kode Referral (Diskon Rp {activeReferralDiscount.toLocaleString('id-ID')})</label>
                {regReferralCode && (
                  <button
                    type="button"
                    onClick={() => setRegReferralCode('')}
                    className="text-[11px] font-bold text-slate-500 hover:text-red-600 cursor-pointer"
                  >
                    Hapus
                  </button>
                )}
              </div>
              <input
                type="text"
                value={regReferralCode}
                onChange={e => setRegReferralCode(e.target.value.toUpperCase())}
                placeholder="Ketik kode teman atau LOGINCPNS"
                className="w-full px-3 py-2 text-xs font-mono font-bold uppercase bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-800"
              />
              <p className="text-[10px] text-blue-800 leading-snug">
                Kode bawaan <strong>LOGINCPNS</strong> memberi potongan Rp {activeReferralDiscount.toLocaleString('id-ID')} saat upgrade Premium. Bisa diganti kode referral teman Anda.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regAgreedTerms}
                  onChange={e => setRegAgreedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                />
                <span className="text-[11px] text-slate-700 leading-snug">
                  Saya menyetujui{' '}
                  <button
                    type="button"
                    onClick={() => setShowRegisterTerms(prev => !prev)}
                    className="font-bold text-blue-700 hover:underline inline-flex items-center gap-0.5"
                  >
                    <ShieldCheck className="w-3 h-3 inline" />
                    Syarat &amp; Ketentuan Layanan Bimbel LOGIN CPNS
                  </button>
                  {' '}serta kebijakan privasi &amp; hak cipta materi soal.
                </span>
              </label>

              {showRegisterTerms && (
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[10px] text-slate-600 space-y-1 leading-relaxed max-h-32 overflow-y-auto">
                  <p><strong>1. Independen &amp; Non-Afiliasi Pemerintah:</strong> LOGIN CPNS adalah bimbingan belajar independen dan bukan bagian resmi dari BKN/PANRB serta tidak menjamin kelulusan ASN.</p>
                  <p><strong>2. Hak Cipta &amp; Anti-Pembajakan:</strong> Seluruh soal, modul, video, dan akun hanya untuk 1 pengguna pribadi. Dilarang memperjualbelikan atau menyebarluaskan materi tanpa izin tertulis.</p>
                  <p><strong>3. Privasi &amp; Transaksi:</strong> Data email digunakan untuk pengiriman status transaksi resmi dari {senderEmail}. Pelanggaran hukum/kecurangan berakibat penonaktifan akun sepihak.</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors mt-1 cursor-pointer"
            >
              Daftar Sekarang
            </button>

            <div className="pt-1 text-center text-xs text-slate-600">
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('LOGIN')}
                className="font-bold text-blue-700 hover:underline"
              >
                Masuk Disini
              </button>
            </div>
          </form>
        )}

        {/* ================= FORGOT PASSWORD FORM ================= */}
        {authModalMode === 'FORGOT_PASSWORD' && (
          <form onSubmit={handleForgotSubmit} className="p-6 space-y-4">
            {forgotError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}
            {forgotSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Masukkan email dan nomor WhatsApp akun terdaftar Anda untuk verifikasi identitas dan pengaturan ulang kata sandi.
                </p>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Akun</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nomor WhatsApp Terdaftar</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={forgotPhone}
                      onChange={e => setForgotPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Lanjutkan &amp; Buat Password Baru
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-800">
                  Email diverifikasi: <strong>{forgotEmail}</strong>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Password Baru</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={forgotNewPassword}
                      onChange={e => setForgotNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Simpan Password Baru
                </button>
              </div>
            )}

            <div className="pt-2 text-center text-xs text-slate-600">
              <button
                type="button"
                onClick={() => setAuthModalMode('LOGIN')}
                className="font-bold text-blue-700 hover:underline"
              >
                Kembali ke Halaman Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
