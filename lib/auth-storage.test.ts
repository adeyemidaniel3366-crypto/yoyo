import { describe, it, expect, beforeEach } from "vitest";
import {
  SECURITY_QUESTIONS,
  registerAdminAccount,
  verifyAdminLogin,
  getAdminByUsername,
  resetAdminPassword,
  registerBuilderAccount,
  verifyBuilderLogin,
  getBuilderByUsername,
  resetBuilderPassword,
  getStaffCredentials,
  saveStaffCredential,
  updateStaffLogin,
  verifyStaffLogin,
  resetAuthStorageForTesting,
} from "./auth-storage";

describe("auth-storage security questions and auth flows", () => {
  beforeEach(() => {
    resetAuthStorageForTesting();
  });

  describe("Security Questions List", () => {
    it("includes special moments, 4-digit PIN, mother's maiden name, and other personal security questions", () => {
      expect(SECURITY_QUESTIONS).toContain("What was a special moment in your life?");
      expect(SECURITY_QUESTIONS).toContain("What is your 4-digit security PIN?");
      expect(SECURITY_QUESTIONS).toContain("What is your mother's maiden name?");
      expect(SECURITY_QUESTIONS).toContain("What was the name of your first pet?");
      expect(SECURITY_QUESTIONS).toContain("What city were you born in?");
      expect(SECURITY_QUESTIONS.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("Super Admin Auth & Password Recovery", () => {
    it("registers new Super Admin with security question and verifies login", () => {
      const reg = registerAdminAccount({
        name: "Chief Technology Officer",
        username: "cto_admin",
        email: "cto@zinoone.com",
        password: "SecurePassword2026!",
        securityQuestion: "What was a special moment in your life?",
        securityAnswer: "Promoted to CTO in 2024",
        pin: "8821",
      });

      expect(reg.success).toBe(true);
      expect(reg.account?.username).toBe("cto_admin");

      // Verify login succeeds with correct password
      const verified = verifyAdminLogin("cto_admin", "SecurePassword2026!");
      expect(verified).not.toBeNull();
      expect(verified?.name).toBe("Chief Technology Officer");

      // Verify login fails with incorrect password
      const failed = verifyAdminLogin("cto_admin", "WrongPassword");
      expect(failed).toBeNull();
    });

    it("resets Super Admin password when answering the security question correctly", () => {
      const reg = registerAdminAccount({
        name: "Security Lead",
        username: "sec_lead",
        password: "OldPassword1!",
        securityQuestion: "What is your mother's maiden name?",
        securityAnswer: "Okonkwo",
      });
      expect(reg.success).toBe(true);

      // Attempt reset with wrong answer
      const wrongAttempt = resetAdminPassword("sec_lead", "WrongAnswer", "BrandNewPass2026!");
      expect(wrongAttempt.success).toBe(false);

      // Attempt reset with correct answer (case-insensitive)
      const correctAttempt = resetAdminPassword("sec_lead", "okonkwo", "BrandNewPass2026!");
      expect(correctAttempt.success).toBe(true);

      // New password works
      const loginNew = verifyAdminLogin("sec_lead", "BrandNewPass2026!");
      expect(loginNew).not.toBeNull();

      // Old password no longer works
      const loginOld = verifyAdminLogin("sec_lead", "OldPassword1!");
      expect(loginOld).toBeNull();
    });
  });

  describe("Top Builders Auth & Password Recovery", () => {
    it("registers a Top Builders user account with security question", () => {
      const reg = registerBuilderAccount({
        name: "Tunde Bakare",
        username: "tundebuilder",
        password: "BuilderPass2026!",
        role: "Manager",
        securityQuestion: "What is your 4-digit security PIN?",
        securityAnswer: "4092",
        pin: "4092",
      });

      expect(reg.success).toBe(true);
      expect(reg.account?.role).toBe("Manager");

      const loggedIn = verifyBuilderLogin("tundebuilder", "BuilderPass2026!");
      expect(loggedIn).not.toBeNull();
      expect(loggedIn?.name).toBe("Tunde Bakare");
    });

    it("allows Top Builders password reset via security question or PIN", () => {
      registerBuilderAccount({
        name: "Ngozi Eze",
        username: "ngozisales",
        password: "InitialPassword!",
        role: "Sales Rep",
        securityQuestion: "What city were you born in?",
        securityAnswer: "Enugu",
      });

      const user = getBuilderByUsername("ngozisales");
      expect(user).not.toBeNull();
      expect(user?.securityQuestion).toBe("What city were you born in?");

      const resetRes = resetBuilderPassword("ngozisales", "enugu", "UpdatedSalesPass123!");
      expect(resetRes.success).toBe(true);

      const loginAfterReset = verifyBuilderLogin("ngozisales", "UpdatedSalesPass123!");
      expect(loginAfterReset).not.toBeNull();
    });
  });

  describe("Staff Portal Credential Management", () => {
    it("allows Super Admin to assign and update staff portal logins and passwords", () => {
      // Save new staff credential from Super Admin Staff Management
      saveStaffCredential({
        staffCode: "STF-2026-99",
        name: "Amaka Obi",
        username: "amaka.obi",
        email: "amaka.obi@zinogroup.com",
        password: "StaffPass99!",
        role: "Finance Officer",
        department: "Finance",
        branch: "Lagos Mainland",
        status: "ACTIVE",
        pin: "1234",
        createdAt: "2026-01-01T00:00:00.000Z",
      });

      // Verify the staff member can authenticate on /staff/login
      const staffLogin = verifyStaffLogin("amaka.obi", "StaffPass99!");
      expect(staffLogin).not.toBeNull();
      expect(staffLogin?.name).toBe("Amaka Obi");
      expect(staffLogin?.role).toBe("Finance Officer");

      // Super Admin updates the login credentials
      updateStaffLogin("STF-2026-99", "amaka.finance", "NewAmakaPass2026!");

      // Old credentials fail
      expect(verifyStaffLogin("amaka.obi", "StaffPass99!")).toBeNull();

      // New credentials succeed
      const updatedLogin = verifyStaffLogin("amaka.finance", "NewAmakaPass2026!");
      expect(updatedLogin).not.toBeNull();
      expect(updatedLogin?.username).toBe("amaka.finance");
    });

    it("persists assigned subsidiary access scope including ALL", () => {
      saveStaffCredential({
        staffCode: "STF-BS-01",
        name: "Bola Billstacks",
        username: "bola.billstacks",
        email: "bola@zinogroup.com",
        password: "BillPass2026!",
        role: "Billing Officer",
        department: "Finance",
        subsidiary: "BILLSTACKS" as any,
        branch: "HQ",
        status: "ACTIVE",
        pin: "1234",
        createdAt: "2026-01-01T00:00:00.000Z",
      });

      const billstacksStaff = verifyStaffLogin("bola.billstacks", "BillPass2026!");
      expect(billstacksStaff?.subsidiary).toBe("BILLSTACKS");

      saveStaffCredential({
        staffCode: "STF-ALL-01",
        name: "Global Manager",
        username: "global.manager",
        email: "global@zinogroup.com",
        password: "AllPass2026!",
        role: "General Manager",
        department: "Executive",
        subsidiary: "ALL",
        branch: "HQ",
        status: "ACTIVE",
        pin: "1234",
        createdAt: "2026-01-01T00:00:00.000Z",
      });

      const allStaff = verifyStaffLogin("global.manager", "AllPass2026!");
      expect(allStaff?.subsidiary).toBe("ALL");
    });
  });
});
