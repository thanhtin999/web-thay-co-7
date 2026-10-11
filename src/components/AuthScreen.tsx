import React, { useState } from 'react';
import {
  BookMarked,
  Lock,
  User,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  School,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { UserAccount } from '../types';
import { loginUser, registerUser, hashPassword, initializeAccounts } from '../services/auth';

interface AuthScreenProps {
  onAuthSuccess: (user: UserAccount, message: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regSubject, setRegSubject] = useState('Ngữ văn');
  const [regSchool, setRegSchool] = useState('THCS Phan Bội Châu');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Switch modes cleanly
  const handleSwitchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Quick fill demo account
  const handleFillDemoAccount = async (autoLogin: boolean = false) => {
    // Ensure default account exists in storage
    await initializeAccounts();
    setLoginUsername('duongthanhtin');
    setLoginPassword('123456');
    setErrorMessage(null);

    if (autoLogin) {
      setIsLoading(true);
      try {
        const res = await loginUser('duongthanhtin', '123456');
        if (res.success && res.user) {
          onAuthSuccess(res.user, 'Chào mừng Thầy Dương Thành Tín quay trở lại!');
        } else {
          setErrorMessage(res.message);
        }
      } catch (err) {
        console.error(err);
        setErrorMessage('Không thể đăng nhập tài khoản mẫu.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginUsername.trim()) {
      setErrorMessage('Vui lòng nhập tên đăng nhập.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginUser(loginUsername, loginPassword);
      if (res.success && res.user) {
        onAuthSuccess(res.user, res.message);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regUsername.trim()) {
      setErrorMessage('Vui lòng nhập tên đăng nhập (Username).');
      return;
    }
    if (!regFullName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên giáo viên.');
      return;
    }
    if (!regPassword) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp với mật khẩu đã nhập.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser({
        username: regUsername,
        password: regPassword,
        fullName: regFullName,
        subject: regSubject,
        school: regSchool,
      });

      if (res.success && res.user) {
        setSuccessMessage('Đăng ký tài khoản thành công! Đang chuyển vào hệ thống...');
        setTimeout(() => {
          onAuthSuccess(res.user!, res.message);
        }, 600);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      console.error('Register error:', err);
      setErrorMessage('Đã xảy ra lỗi khi tạo tài khoản. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Background Decorative Blur Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md sm:max-w-lg relative z-10">
        {/* App Title & Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-500/30 mb-4 ring-4 ring-white/10">
            <BookMarked className="w-9 h-9 sm:w-11 sm:h-11" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            TRỢ LÝ QUẢN TRỊ HỌC TẬP
          </h1>
          <p className="text-sm sm:text-base text-blue-200/90 font-medium mt-1">
            Hệ thống quản lý dạy học & theo dõi học sinh THCS
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/20 text-blue-300 text-xs font-semibold mt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Lưu trữ nội bộ an toàn & Ngoại tuyến (Offline)</span>
          </div>
        </div>

        {/* Main Auth Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* Mode Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1.5">
            <button
              id="tab-login-btn"
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'login'
                  ? 'bg-white text-blue-700 shadow-sm shadow-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập</span>
            </button>
            <button
              id="tab-register-btn"
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'register'
                  ? 'bg-white text-blue-700 shadow-sm shadow-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Đăng ký mới</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* Error Message */}
            {errorMessage && (
              <div
                id="auth-error-alert"
                className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm animate-fadeIn"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div
                id="auth-success-alert"
                className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-sm animate-fadeIn"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{successMessage}</div>
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="login-username-input"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Tên đăng nhập (Username)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      id="login-username-input"
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Ví dụ: duongthanhtin"
                      autoComplete="username"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all outline-hidden bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password-input"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                    >
                      Mật khẩu
                    </label>
                    <span className="text-xs text-slate-400">Tối thiểu 6 ký tự</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Nhập mật khẩu của bạn"
                      autoComplete="current-password"
                      required
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all outline-hidden bg-slate-50/50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                      title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-slate-600">Ghi nhớ đăng nhập</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleFillDemoAccount(false)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Điền tài khoản mẫu
                  </button>
                </div>

                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Đăng nhập vào hệ thống</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Quick 1-Click Demo Login Box */}
                <div className="mt-6 pt-5 border-t border-slate-100 bg-slate-50/70 -mx-6 -mb-6 p-6 rounded-b-3xl">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Tài khoản mẫu Thầy Dương Thành Tín:
                    </span>
                    <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600">
                      duongthanhtin / 123456
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFillDemoAccount(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <span>Truy cập nhanh 1-Click với tài khoản Thầy Tín</span>
                  </button>
                </div>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label
                    htmlFor="reg-username-input"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Tên đăng nhập (Username) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      id="reg-username-input"
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="viết liền không dấu, vd: tinnguyen"
                      required
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all outline-hidden bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tối thiểu 3 ký tự, chỉ gồm chữ cái, số, dấu gạch dưới (_).
                  </p>
                </div>

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="reg-fullname-input"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Họ và tên giáo viên *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <BookMarked className="w-5 h-5" />
                    </div>
                    <input
                      id="reg-fullname-input"
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Ví dụ: Thầy Dương Thành Tín hoặc Cô Hoàng Lan"
                      required
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all outline-hidden bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Subject & School (2 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="reg-subject-input"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                    >
                      Môn giảng dạy
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-subject-input"
                        type="text"
                        value={regSubject}
                        onChange={(e) => setRegSubject(e.target.value)}
                        placeholder="Vd: Ngữ văn, Toán..."
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all outline-hidden bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-school-input"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                    >
                      Trường học
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <School className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-school-input"
                        type="text"
                        value={regSchool}
                        onChange={(e) => setRegSchool(e.target.value)}
                        placeholder="Vd: THCS Phan Bội Châu"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all outline-hidden bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="reg-password-input"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Mật khẩu *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      id="reg-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      required
                      minLength={6}
                      className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all outline-hidden bg-slate-50/50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="reg-confirm-password-input"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Xác nhận lại mật khẩu *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      id="reg-confirm-password-input"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu để xác nhận"
                      required
                      minLength={6}
                      className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all outline-hidden bg-slate-50/50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-submit-register"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Đăng ký & Bắt đầu sử dụng</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-xs text-slate-500 pt-1">
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    Đăng nhập ngay
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed">
          Hệ thống Quản trị Học tập môn Ngữ văn THCS • Phiên bản 2026
          <br />
          Dữ liệu của giáo viên được bảo mật trực tiếp trên thiết bị của bạn.
        </p>
      </div>
    </div>
  );
};
