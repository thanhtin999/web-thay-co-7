import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  School,
  BookOpen,
  Mail,
  Phone,
  Calendar,
  Save,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserAccount } from '../types';
import {
  updateUserProfile,
  changeUserPassword,
  getAvatarInitials
} from '../services/auth';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onUserUpdated: (user: UserAccount) => void;
  onRequestLogout: () => void;
  onNotify: (type: 'success' | 'warning' | 'error' | 'info', title: string, desc?: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
  onRequestLogout,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');

  // Profile Edit State
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [subject, setSubject] = useState(currentUser.subject || 'Ngữ văn');
  const [school, setSchool] = useState(currentUser.school || 'THCS Phan Bội Châu');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!fullName.trim()) {
      setMessage({ type: 'error', text: 'Họ và tên giáo viên không được để trống.' });
      return;
    }

    const res = updateUserProfile(currentUser.id, {
      fullName: fullName.trim(),
      subject: subject.trim(),
      school: school.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });

    if (res.success && res.user) {
      onUserUpdated(res.user);
      setMessage({ type: 'success', text: 'Cập nhật thông tin tài khoản thành công!' });
      onNotify('success', 'Đã cập nhật tài khoản', 'Thông tin hồ sơ giáo viên đã được lưu.');
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!oldPassword) {
      setMessage({ type: 'error', text: 'Vui lòng nhập mật khẩu hiện tại.' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'Xác nhận mật khẩu mới không khớp.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await changeUserPassword(currentUser.id, oldPassword, newPassword);
      if (res.success && res.user) {
        onUserUpdated(res.user);
        setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
        onNotify('success', 'Đổi mật khẩu thành công', 'Mật khẩu mới đã được kích hoạt.');
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    } catch {
      setMessage({ type: 'error', text: 'Đã xảy ra lỗi khi đổi mật khẩu.' });
    } finally {
      setIsLoading(false);
    }
  };

  const initials = getAvatarInitials(currentUser.fullName);
  const createdDate = new Date(currentUser.createdAt).toLocaleDateString('vi-VN');

  return (
    <div
      id="user-profile-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="user-profile-modal-card"
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with Avatar */}
        <div className="relative bg-linear-to-r from-blue-700 to-indigo-800 p-6 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 text-white flex items-center justify-center font-extrabold text-2xl shadow-inner shrink-0`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold tracking-tight truncate">
                {currentUser.fullName}
              </h2>
              <div className="flex items-center gap-2 text-blue-100 text-xs mt-1">
                <span className="font-mono bg-white/15 px-2 py-0.5 rounded-md font-bold">
                  @{currentUser.username}
                </span>
                <span>•</span>
                <span>{currentUser.role || 'Giáo viên'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab('info');
              setMessage(null);
            }}
            className={`py-3.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Thông tin cá nhân</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('password');
              setMessage(null);
            }}
            className={`py-3.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'password'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Đổi mật khẩu</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {message && (
            <div
              className={`mb-5 p-3.5 rounded-2xl flex items-center gap-2.5 text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          {activeTab === 'info' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Họ và tên giáo viên
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Bộ môn giảng dạy
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Trường công tác
                  </label>
                  <div className="relative">
                    <School className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Email liên hệ
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@vidu.edu.vn"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09xx xxx xxx"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Extra Info Pills */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Ngày tạo tài khoản: {createdDate}</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi hồ sơ</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Mật khẩu hiện tại *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="Nhập mật khẩu đang dùng"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Mật khẩu mới *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Xác nhận mật khẩu mới *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>Xác nhận đổi mật khẩu</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer with Logout Option */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onRequestLogout();
            }}
            className="px-3.5 py-2 rounded-xl text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Đăng xuất tài khoản</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
