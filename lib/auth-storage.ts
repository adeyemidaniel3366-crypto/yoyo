"use client";

import { ServiceSlug } from "./constants";

export type StaffSubsidiaryAccess = ServiceSlug | "ALL";

// ---------------------------------------------------------------------------
// Zino One — Unified Auth & Security Questions Storage
// Handles Super Admin, Staff Management Credentials, and Top Builders Auth
// ---------------------------------------------------------------------------

export const SECURITY_QUESTIONS = [
  "What was a special moment in your life?",
  "What is your 4-digit security PIN?",
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What city were you born in?",
  "What was the name of your first school?",
  "What is your favorite personal memory?",
] as const;

export type SecurityQuestion = typeof SECURITY_QUESTIONS[number];

// ---------------------------------------------------------------------------
// 1. Super Admin Accounts
// ---------------------------------------------------------------------------
export interface SuperAdminAccount {
  id: string;
  name: string;
  username: string; // or email
  email: string;
  password: string;
  role: "SUPER_ADMIN" | "ADMIN";
  securityQuestion: string;
  securityAnswer: string; // stored lowercase for matching
  pin?: string;
  createdAt: string;
}

const DEFAULT_ADMIN_ACCOUNTS: SuperAdminAccount[] = [];

const ADMIN_STORAGE_KEY = "zino_admin_accounts_prod_v1";
let memoryAdminAccounts: SuperAdminAccount[] = [...DEFAULT_ADMIN_ACCOUNTS];

export function getAdminAccounts(): SuperAdminAccount[] {
  if (typeof window === "undefined") {
    return memoryAdminAccounts;
  }
  try {
    const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) {
      return memoryAdminAccounts;
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [];
    memoryAdminAccounts = list;
    return list;
  } catch {
    return memoryAdminAccounts;
  }
}

export function registerAdminAccount(data: {
  name: string;
  username: string;
  email?: string;
  password: string;
  role?: "SUPER_ADMIN" | "ADMIN";
  securityQuestion: string;
  securityAnswer: string;
  pin?: string;
}): { success: boolean; error?: string; account?: SuperAdminAccount } {
  const accounts = getAdminAccounts();
  const cleanUsername = data.username.trim().toLowerCase();
  const cleanEmail = (data.email || data.username).trim().toLowerCase();

  const existing = accounts.find(
    (a) => a.username.toLowerCase() === cleanUsername || a.email.toLowerCase() === cleanEmail
  );
  if (existing) {
    return { success: false, error: "An admin account with this username or email already exists." };
  }

  const newAccount: SuperAdminAccount = {
    id: `adm_${Date.now()}`,
    name: data.name.trim(),
    username: data.username.trim(),
    email: cleanEmail,
    password: data.password,
    role: data.role || "SUPER_ADMIN",
    securityQuestion: data.securityQuestion,
    securityAnswer: data.securityAnswer.trim().toLowerCase(),
    pin: data.pin?.trim() || "",
    createdAt: new Date().toISOString(),
  };

  const updated = [newAccount, ...accounts];
  memoryAdminAccounts = updated;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(updated));
  }
  return { success: true, account: newAccount };
}

export function verifyAdminLogin(
  usernameOrEmail: string,
  password: string
): SuperAdminAccount | null {
  const accounts = getAdminAccounts();
  const clean = usernameOrEmail.trim().toLowerCase();
  const matched = accounts.find(
    (a) =>
      (a.username.toLowerCase() === clean || a.email.toLowerCase() === clean) &&
      a.password === password
  );
  return matched || null;
}

export function getAdminByUsername(usernameOrEmail: string): SuperAdminAccount | null {
  const accounts = getAdminAccounts();
  const clean = usernameOrEmail.trim().toLowerCase();
  return accounts.find((a) => a.username.toLowerCase() === clean || a.email.toLowerCase() === clean) || null;
}

export function resetAdminPassword(
  usernameOrEmail: string,
  securityAnswer: string,
  newPassword: string
): { success: boolean; error?: string } {
  const accounts = [...getAdminAccounts()];
  const clean = usernameOrEmail.trim().toLowerCase();
  const index = accounts.findIndex(
    (a) => a.username.toLowerCase() === clean || a.email.toLowerCase() === clean
  );

  if (index === -1) {
    return { success: false, error: "Admin account not found." };
  }

  const user = accounts[index];
  const givenAnswer = securityAnswer.trim().toLowerCase();
  if (user.securityAnswer !== givenAnswer && user.pin !== securityAnswer.trim()) {
    return { success: false, error: "Incorrect security answer or PIN." };
  }

  accounts[index] = { ...user, password: newPassword };
  memoryAdminAccounts = accounts;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(accounts));
  }
  return { success: true };
}

// ---------------------------------------------------------------------------
// 2. Top Builders User Accounts
// ---------------------------------------------------------------------------
export interface BuilderUserAccount {
  id: string;
  name: string;
  username: string; // e.g. "chimatop" or "@chimatop"
  password: string;
  role: "Owner" | "Manager" | "Sales Rep" | "Cashier";
  securityQuestion: string;
  securityAnswer: string;
  pin?: string;
  createdAt: string;
}

const DEFAULT_BUILDER_ACCOUNTS: BuilderUserAccount[] = [];

const BUILDERS_STORAGE_KEY = "zino_top_builders_accounts_prod_v1";
let memoryBuilderAccounts: BuilderUserAccount[] = [...DEFAULT_BUILDER_ACCOUNTS];

export function getBuilderAccounts(): BuilderUserAccount[] {
  if (typeof window === "undefined") {
    return memoryBuilderAccounts;
  }
  try {
    const raw = window.localStorage.getItem(BUILDERS_STORAGE_KEY);
    if (!raw) {
      return memoryBuilderAccounts;
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [];
    memoryBuilderAccounts = list;
    return list;
  } catch {
    return memoryBuilderAccounts;
  }
}

export function registerBuilderAccount(data: {
  name: string;
  username: string;
  password: string;
  role?: "Owner" | "Manager" | "Sales Rep" | "Cashier";
  securityQuestion: string;
  securityAnswer: string;
  pin?: string;
}): { success: boolean; error?: string; account?: BuilderUserAccount } {
  const accounts = getBuilderAccounts();
  const cleanUsername = data.username.replace(/^@/, "").trim().toLowerCase();

  const existing = accounts.find((a) => a.username.replace(/^@/, "").toLowerCase() === cleanUsername);
  if (existing) {
    return { success: false, error: "A user with this username already exists in Top Builders." };
  }

  const newAccount: BuilderUserAccount = {
    id: `b_usr_${Date.now()}`,
    name: data.name.trim(),
    username: cleanUsername,
    password: data.password,
    role: data.role || "Manager",
    securityQuestion: data.securityQuestion,
    securityAnswer: data.securityAnswer.trim().toLowerCase(),
    pin: data.pin?.trim() || "",
    createdAt: new Date().toISOString(),
  };

  const updated = [newAccount, ...accounts];
  memoryBuilderAccounts = updated;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(BUILDERS_STORAGE_KEY, JSON.stringify(updated));
  }
  return { success: true, account: newAccount };
}

export function verifyBuilderLogin(
  username: string,
  password: string
): BuilderUserAccount | null {
  const accounts = getBuilderAccounts();
  const clean = username.replace(/^@/, "").trim().toLowerCase();
  return (
    accounts.find(
      (a) => a.username.replace(/^@/, "").toLowerCase() === clean && a.password === password
    ) || null
  );
}

export function getBuilderByUsername(username: string): BuilderUserAccount | null {
  const accounts = getBuilderAccounts();
  const clean = username.replace(/^@/, "").trim().toLowerCase();
  return accounts.find((a) => a.username.replace(/^@/, "").toLowerCase() === clean) || null;
}

export function resetBuilderPassword(
  username: string,
  securityAnswer: string,
  newPassword: string
): { success: boolean; error?: string } {
  const accounts = [...getBuilderAccounts()];
  const clean = username.replace(/^@/, "").trim().toLowerCase();
  const index = accounts.findIndex((a) => a.username.replace(/^@/, "").toLowerCase() === clean);

  if (index === -1) {
    return { success: false, error: "Top Builders user not found." };
  }

  const user = accounts[index];
  const givenAnswer = securityAnswer.trim().toLowerCase();
  if (user.securityAnswer !== givenAnswer && user.pin !== securityAnswer.trim()) {
    return { success: false, error: "Incorrect security answer or PIN." };
  }

  accounts[index] = { ...user, password: newPassword };
  memoryBuilderAccounts = accounts;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(BUILDERS_STORAGE_KEY, JSON.stringify(accounts));
  }
  return { success: true };
}

// ---------------------------------------------------------------------------
// 3. Staff Portal Credentials (Configured under Super Admin Staff Management)
// ---------------------------------------------------------------------------
export interface StaffCredential {
  id: string;
  staffCode: string;
  name: string;
  username: string; // login identifier e.g. "chinedu.eze" or "chinedu.eze@zinogroup.com"
  email: string;
  password: string;
  role: string;
  department: string;
  subsidiary?: StaffSubsidiaryAccess;
  branch: string;
  pin: string;
  status: "ACTIVE" | "ON_LEAVE" | "OFF_DUTY" | "SUSPENDED";
  createdAt: string;
}

const DEFAULT_STAFF_CREDENTIALS: StaffCredential[] = [];

const STAFF_CREDENTIALS_KEY = "zino_staff_credentials_prod_v1";
let memoryStaffCredentials: StaffCredential[] = [...DEFAULT_STAFF_CREDENTIALS];

export function getStaffCredentials(): StaffCredential[] {
  if (typeof window === "undefined") {
    return memoryStaffCredentials;
  }
  try {
    const raw = window.localStorage.getItem(STAFF_CREDENTIALS_KEY);
    if (!raw) {
      return memoryStaffCredentials;
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [];
    memoryStaffCredentials = list;
    return list;
  } catch {
    return memoryStaffCredentials;
  }
}

export function saveStaffCredential(
  staff: Omit<StaffCredential, "id"> & { id?: string }
): StaffCredential {
  const list = getStaffCredentials();
  const staffId = staff.id || `stf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const fullStaff: StaffCredential = { ...staff, id: staffId };
  const existingIdx = list.findIndex(
    (s) => (staff.id && s.id === staff.id) || s.staffCode === staff.staffCode || s.email === staff.email
  );
  let updated: StaffCredential[];
  if (existingIdx >= 0) {
    updated = [...list];
    updated[existingIdx] = { ...updated[existingIdx], ...fullStaff };
  } else {
    updated = [fullStaff, ...list];
  }
  memoryStaffCredentials = updated;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STAFF_CREDENTIALS_KEY, JSON.stringify(updated));
  }
  return fullStaff;
}

export function updateStaffLogin(
  idOrStaffCode: string,
  username: string,
  password: string
): { success: boolean; error?: string } {
  const list = [...getStaffCredentials()];
  const index = list.findIndex((s) => s.id === idOrStaffCode || s.staffCode === idOrStaffCode);
  if (index === -1) {
    return { success: false, error: "Staff member not found." };
  }
  list[index] = {
    ...list[index],
    username: username.trim(),
    email: username.includes("@") ? username.trim() : list[index].email,
    password: password.trim(),
  };
  memoryStaffCredentials = list;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STAFF_CREDENTIALS_KEY, JSON.stringify(list));
  }
  return { success: true };
}

export function resetAuthStorageForTesting(): void {
  memoryAdminAccounts = [...DEFAULT_ADMIN_ACCOUNTS];
  memoryBuilderAccounts = [...DEFAULT_BUILDER_ACCOUNTS];
  memoryStaffCredentials = [...DEFAULT_STAFF_CREDENTIALS];
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(ADMIN_STORAGE_KEY);
      window.localStorage.removeItem(BUILDERS_STORAGE_KEY);
      window.localStorage.removeItem(STAFF_CREDENTIALS_KEY);
    } catch {
      // ignore
    }
  }
}

export function verifyStaffLogin(
  usernameOrEmail: string,
  password: string
): StaffCredential | null {
  const list = getStaffCredentials();
  const clean = usernameOrEmail.trim().toLowerCase();
  const matched = list.find((s) => {
    const matchUser = s.username.toLowerCase() === clean || s.email.toLowerCase() === clean;
    const matchPass = s.password === password;
    return matchUser && matchPass;
  });
  return matched || null;
}
