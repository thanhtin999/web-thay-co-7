import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Search,
  Database,
  Volume2,
  VolumeX,
  Menu,
  BookMarked,
  User,
  KeyRound,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { AppData, UserAccount } from '../types';
import { getAvatarInitials } from '../services/auth';

interface HeaderProps {
  data: AppData;
  currentUser: UserAccount | null;
  onOpenSearch: () => void;
  onOpenDataModal: () => void;
  onToggleSound: () => void;
  onToggleMobileSidebar: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  data,
  currentUser,
  onOpenSearch,
  onOpenDataModal,
  onToggleSound,
  onToggleMobileSidebar,
  onOpenProfile,
  onLogout,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format Vietnamese date: e.g. "Thứ Sáu, ngày 18 tháng 09, 2026"
  const now = new Date();
  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = dayNames[now.getDay()];
  const formattedDate = `${dayName}, ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  const displayName = currentUser?.fullName || 'Thầy Dương Thành Tín';
  const displaySubject = currentUser?.subject || 'Ngữ văn';
  const displaySchool = currentUser?.school || 'THCS Phan Bội Châu';
  const initials = getAvatarInitials(displayName);

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left: Branding & Teacher Info */}
          <div className="flex items-center gap-3.5">
            <button
              id="toggle-sidebar-mobile-btn"
              type="button"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Mở bảng điều hướng"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <BookMarked className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-slate-900 leading-tight truncate">
                  TRỢ LÝ QUẢN TRỊ HỌC TẬP
                </h1>
                <p className="text-xs sm:text-sm font-medium text-blue-700 leading-tight mt-0.5 truncate">
                  {displayName} <span className="text-slate-300 font-normal">|</span> {displaySubject}{' '}
                  <span className="text-slate-300 font-normal">|</span> {displaySchool}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Quick Search + Date + Tool Actions + User Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Search Bar trigger */}
            <button
              id="quick-search-trigger"
              type="button"
              onClick={onOpenSearch}
              className="hidden xl:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 text-sm border border-slate-200/80 transition-all w-52 lg:w-60"
              title="Tìm kiếm nhanh (Ctrl + K)"
            >
              <Search className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="flex-1 text-left text-xs truncate">Tìm học sinh, lớp...</span>
              <kbd className="inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white rounded-md border border-slate-300 shadow-2xs">
                Ctrl+K
              </kbd>
            </button>

            <button
              type="button"
              onClick={onOpenSearch}
              className="xl:hidden p-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors"
              title="Tìm kiếm nhanh"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Date Display Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-900 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{formattedDate}</span>
            </div>

            {/* Sound Toggle */}
            <button
              id="header-sound-toggle-btn"
              type="button"
              onClick={onToggleSound}
              className={`p-2.5 rounded-xl border transition-all ${
                data.soundEnabled
                  ? 'bg-blue-600 text-white border-blue-700 shadow-sm shadow-blue-500/20'
                  : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
              }`}
              title={data.soundEnabled ? 'Âm thanh: Đang Bật (Bấm để tắt)' : 'Âm thanh: Đang Tắt (Bấm để bật)'}
            >
              {data.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Backup / Restore Data Button */}
            <button
              id="header-data-manager-btn"
              type="button"
              onClick={onOpenDataModal}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all hover:border-slate-300 active:scale-95"
              title="Quản lý sao lưu & Dữ liệu mẫu"
            >
              <Database className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="hidden md:inline">Sao lưu dữ liệu</span>
            </button>

            {/* User Account Badge & Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                id="header-user-menu-btn"
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-200 transition-all group"
                title="Tài khoản giáo viên"
              >
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  {initials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-blue-700">
                    {currentUser?.username || 'Giaovien'}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">Đang hoạt động</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div
                  id="user-dropdown-menu"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-scaleUp"
                >
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                    <p className="text-[11px] text-blue-700 font-mono mt-0.5">@{currentUser?.username}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{displaySchool}</p>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full px-4 py-2 text-left text-xs sm:text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>Thông tin tài khoản</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full px-4 py-2 text-left text-xs sm:text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <KeyRound className="w-4 h-4 text-slate-500" />
                      <span>Đổi mật khẩu</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-xs sm:text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors font-bold"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
