/**
 * auth.ts
 * Quản lý xác thực người dùng (Đăng ký, Đăng nhập, Phiên làm việc, Đổi mật khẩu)
 * Dành cho hệ thống "TRỢ LÝ QUẢN TRỊ HỌC TẬP"
 * 
 * Lưu trữ an toàn trong localStorage:
 * - Hỗ trợ đăng ký tài khoản mới với username & mật khẩu
 * - Quản lý phiên đăng nhập hiện tại
 * - Cung cấp tài khoản mẫu mặc định (Thầy Dương Thành Tín)
 */

import { UserAccount } from '../types';

const ACCOUNTS_STORAGE_KEY = 'tro_ly_giao_vien_accounts_v1';
const SESSION_STORAGE_KEY = 'tro_ly_giao_vien_current_session_v1';

// Mã hóa mật khẩu an toàn mức client (SHA-256 với salt)
export async function hashPassword(password: string): Promise<string> {
  const salt = 'tro_ly_giao_vien_salt_2026_';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback nếu crypto.subtle không khả dụng
    return btoa(unescape(encodeURIComponent(salt + password)));
  }
}

// Bảng màu cho avatar đại diện giáo viên
const AVATAR_COLORS = [
  'from-blue-600 to-indigo-700',
  'from-emerald-600 to-teal-700',
  'from-violet-600 to-purple-700',
  'from-amber-600 to-orange-700',
  'from-rose-600 to-pink-700',
  'from-cyan-600 to-blue-700',
];

// Khởi tạo tài khoản mẫu mặc định nếu chưa có tài khoản nào
export async function initializeAccounts(): Promise<UserAccount[]> {
  const existingRaw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  if (existingRaw) {
    try {
      const accounts = JSON.parse(existingRaw) as UserAccount[];
      if (Array.isArray(accounts) && accounts.length > 0) {
        return accounts;
      }
    } catch (e) {
      console.error('Lỗi khi đọc danh sách tài khoản:', e);
    }
  }

  // Tạo tài khoản mặc định Thầy Dương Thành Tín
  const defaultHash = await hashPassword('123456');
  const defaultAccount: UserAccount = {
    id: 'user_duongthanhtin',
    username: 'duongthanhtin',
    passwordHash: defaultHash,
    fullName: 'Thầy Dương Thành Tín',
    role: 'Giáo viên bộ môn',
    subject: 'Ngữ văn',
    school: 'THCS Phan Bội Châu',
    email: 'thanhtin.nguvan@phanboichau.edu.vn',
    phone: '0908 123 456',
    avatarColor: AVATAR_COLORS[0],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  const initialList = [defaultAccount];
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(initialList));
  return initialList;
}

// Lấy danh sách tất cả tài khoản
export function getStoredAccounts(): UserAccount[] {
  const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as UserAccount[];
  } catch {
    return [];
  }
}

// Lưu danh sách tài khoản
function saveAccounts(accounts: UserAccount[]): void {
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

// Lấy thông tin người dùng đang đăng nhập
export function getCurrentUser(): UserAccount | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserAccount;
  } catch {
    return null;
  }
}

// Đặt phiên đăng nhập
export function setCurrentUserSession(user: UserAccount | null): void {
  if (user) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

// Kiểm tra tính hợp lệ của username
export function validateUsername(username: string): { valid: boolean; message?: string } {
  const trimmed = username.trim();
  if (trimmed.length < 3) {
    return { valid: false, message: 'Tên đăng nhập phải có ít nhất 3 ký tự.' };
  }
  if (trimmed.length > 30) {
    return { valid: false, message: 'Tên đăng nhập không được quá 30 ký tự.' };
  }
  // Chỉ cho phép chữ cái, chữ số, dấu gạch dưới và dấu chấm
  const usernameRegex = /^[a-zA-Z0-9_.]+$/;
  if (!usernameRegex.test(trimmed)) {
    return { valid: false, message: 'Tên đăng nhập chỉ gồm chữ cái không dấu, số, dấu gạch dưới (_) hoặc dấu chấm (.).' };
  }
  return { valid: true };
}

export interface RegisterParams {
  username: string;
  password: string;
  fullName: string;
  subject?: string;
  school?: string;
  email?: string;
  phone?: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: UserAccount;
}

// Đăng ký tài khoản mới
export async function registerUser(params: RegisterParams): Promise<AuthResult> {
  const cleanUsername = params.username.trim().toLowerCase();
  const usernameCheck = validateUsername(cleanUsername);
  if (!usernameCheck.valid) {
    return { success: false, message: usernameCheck.message || 'Tên đăng nhập không hợp lệ.' };
  }

  if (!params.fullName || params.fullName.trim().length < 2) {
    return { success: false, message: 'Vui lòng nhập họ và tên giáo viên (tối thiểu 2 ký tự).' };
  }

  if (!params.password || params.password.length < 6) {
    return { success: false, message: 'Mật khẩu phải chứa ít nhất 6 ký tự.' };
  }

  // Đảm bảo accounts đã được khởi tạo
  let accounts = getStoredAccounts();
  if (accounts.length === 0) {
    accounts = await initializeAccounts();
  }

  // Kiểm tra trùng username
  const isDuplicate = accounts.some((a) => a.username.toLowerCase() === cleanUsername);
  if (isDuplicate) {
    return {
      success: false,
      message: `Tên đăng nhập "${cleanUsername}" đã được sử dụng. Vui lòng chọn tên khác.`,
    };
  }

  // Mã hóa mật khẩu
  const passwordHash = await hashPassword(params.password);
  const colorIndex = accounts.length % AVATAR_COLORS.length;

  const newUser: UserAccount = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    username: cleanUsername,
    passwordHash,
    fullName: params.fullName.trim(),
    role: 'Giáo viên bộ môn',
    subject: params.subject?.trim() || 'Ngữ văn',
    school: params.school?.trim() || 'THCS Phan Bội Châu',
    email: params.email?.trim() || '',
    phone: params.phone?.trim() || '',
    avatarColor: AVATAR_COLORS[colorIndex],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  accounts.push(newUser);
  saveAccounts(accounts);
  setCurrentUserSession(newUser);

  return {
    success: true,
    message: `Đăng ký thành công! Chào mừng ${newUser.fullName} đến với hệ thống.`,
    user: newUser,
  };
}

// Đăng nhập
export async function loginUser(username: string, password: string): Promise<AuthResult> {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername) {
    return { success: false, message: 'Vui lòng nhập tên đăng nhập.' };
  }
  if (!password) {
    return { success: false, message: 'Vui lòng nhập mật khẩu.' };
  }

  // Đảm bảo accounts đã được khởi tạo
  let accounts = getStoredAccounts();
  if (accounts.length === 0) {
    accounts = await initializeAccounts();
  }

  const user = accounts.find((a) => a.username.toLowerCase() === cleanUsername);
  if (!user) {
    return {
      success: false,
      message: 'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.',
    };
  }

  const inputHash = await hashPassword(password);
  if (user.passwordHash !== inputHash) {
    return {
      success: false,
      message: 'Mật khẩu không chính xác. Vui lòng thử lại.',
    };
  }

  // Cập nhật lastLoginAt
  const updatedUser: UserAccount = {
    ...user,
    lastLoginAt: new Date().toISOString(),
  };

  const updatedAccounts = accounts.map((a) => (a.id === user.id ? updatedUser : a));
  saveAccounts(updatedAccounts);
  setCurrentUserSession(updatedUser);

  return {
    success: true,
    message: `Đăng nhập thành công! Chào mừng ${updatedUser.fullName}.`,
    user: updatedUser,
  };
}

// Đăng xuất
export function logoutUser(): void {
  setCurrentUserSession(null);
}

// Cập nhật thông tin tài khoản
export function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserAccount, 'fullName' | 'subject' | 'school' | 'email' | 'phone' | 'avatarColor'>>
): AuthResult {
  const accounts = getStoredAccounts();
  const index = accounts.findIndex((a) => a.id === userId);
  if (index === -1) {
    return { success: false, message: 'Không tìm thấy tài khoản cần cập nhật.' };
  }

  const updatedUser: UserAccount = {
    ...accounts[index],
    ...updates,
  };

  accounts[index] = updatedUser;
  saveAccounts(accounts);

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    setCurrentUserSession(updatedUser);
  }

  return {
    success: true,
    message: 'Cập nhật thông tin tài khoản thành công.',
    user: updatedUser,
  };
}

// Đổi mật khẩu
export async function changeUserPassword(
  userId: string,
  oldPass: string,
  newPass: string
): Promise<AuthResult> {
  if (!newPass || newPass.length < 6) {
    return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
  }

  const accounts = getStoredAccounts();
  const user = accounts.find((a) => a.id === userId);
  if (!user) {
    return { success: false, message: 'Không tìm thấy tài khoản.' };
  }

  const oldHash = await hashPassword(oldPass);
  if (user.passwordHash !== oldHash) {
    return { success: false, message: 'Mật khẩu hiện tại không chính xác.' };
  }

  const newHash = await hashPassword(newPass);
  const updatedUser: UserAccount = {
    ...user,
    passwordHash: newHash,
  };

  const updatedAccounts = accounts.map((a) => (a.id === userId ? updatedUser : a));
  saveAccounts(updatedAccounts);

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    setCurrentUserSession(updatedUser);
  }

  return {
    success: true,
    message: 'Đổi mật khẩu thành công.',
    user: updatedUser,
  };
}

// Lấy chữ viết tắt làm Avatar Monogram (ví dụ: "Dương Thành Tín" -> "DT", "Nguyễn Văn An" -> "NA")
export function getAvatarInitials(name?: string): string {
  if (!name) return 'GV';
  const clean = name.replace(/^(Thầy|Cô|Ths|Ts|Gs)\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'GV';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
}
