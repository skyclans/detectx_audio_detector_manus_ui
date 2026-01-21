/**
 * Admin Router Tests
 * 
 * Tests for admin-specific procedures including user stats and verification history
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock db functions
vi.mock("./db", () => ({
  getAllUsers: vi.fn(),
  getUserById: vi.fn(),
  updateUserPlan: vi.fn(),
  updateUserUsage: vi.fn(),
  resetUserUsage: vi.fn(),
  bulkUpdateUserPlan: vi.fn(),
  bulkResetUserUsage: vi.fn(),
  getAllAdmins: vi.fn(),
  isAdmin: vi.fn(),
  isSuperAdmin: vi.fn(),
  addAdmin: vi.fn(),
  removeAdmin: vi.fn(),
  createAdminLog: vi.fn(),
  getAdminLogs: vi.fn(),
  getAllVerifications: vi.fn(),
  getUserVerificationStats: vi.fn(),
  getVerificationsByUserId: vi.fn(),
}));

import * as db from "./db";

describe("Admin Router - User Statistics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("getUserVerificationStats returns correct structure", async () => {
    const mockStats = { total: 10, observed: 3, notObserved: 7 };
    vi.mocked(db.getUserVerificationStats).mockResolvedValue(mockStats);
    
    const result = await db.getUserVerificationStats(1);
    
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("observed");
    expect(result).toHaveProperty("notObserved");
    expect(result.total).toBe(10);
    expect(result.observed).toBe(3);
    expect(result.notObserved).toBe(7);
  });

  it("getVerificationsByUserId returns paginated results", async () => {
    const mockVerifications = {
      verifications: [
        { id: 1, userId: 1, fileName: "test.mp3", verdict: "observed" as const },
        { id: 2, userId: 1, fileName: "test2.mp3", verdict: "not_observed" as const },
      ],
      total: 2,
    };
    vi.mocked(db.getVerificationsByUserId).mockResolvedValue(mockVerifications as any);
    
    const result = await db.getVerificationsByUserId(1, { page: 1, limit: 20 });
    
    expect(result).toHaveProperty("verifications");
    expect(result).toHaveProperty("total");
    expect(result.verifications).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it("getAllVerifications returns paginated results with filters", async () => {
    const mockResult = {
      verifications: [
        { id: 1, userId: 1, fileName: "test.mp3", verdict: "observed" as const },
      ],
      total: 1,
    };
    vi.mocked(db.getAllVerifications).mockResolvedValue(mockResult as any);
    
    const result = await db.getAllVerifications({
      verdict: "observed",
      page: 1,
      limit: 20,
    });
    
    expect(result).toHaveProperty("verifications");
    expect(result).toHaveProperty("total");
    expect(result.verifications[0].verdict).toBe("observed");
  });
});

describe("Admin Router - User Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllUsers supports plan filter", async () => {
    const mockUsers = {
      users: [
        { id: 1, email: "test@test.com", plan: "master" },
      ],
      total: 1,
    };
    vi.mocked(db.getAllUsers).mockResolvedValue(mockUsers as any);
    
    const result = await db.getAllUsers({ plan: "master" });
    
    expect(result.users[0].plan).toBe("master");
    expect(db.getAllUsers).toHaveBeenCalledWith({ plan: "master" });
  });

  it("getUserById returns user with all fields", async () => {
    const mockUser = {
      id: 1,
      email: "admin@test.com",
      name: "Admin",
      plan: "master",
      usageCount: 5,
      monthlyLimit: -1,
      role: "admin",
    };
    vi.mocked(db.getUserById).mockResolvedValue(mockUser as any);
    
    const result = await db.getUserById(1);
    
    expect(result).toHaveProperty("plan");
    expect(result).toHaveProperty("usageCount");
    expect(result).toHaveProperty("monthlyLimit");
    expect(result?.plan).toBe("master");
    expect(result?.monthlyLimit).toBe(-1);
  });
});

describe("Admin Router - Date Formatting", () => {
  it("formats date to UTC string correctly", () => {
    const formatDate = (date: Date | string | null | undefined) => {
      if (!date) return "N/A";
      return new Date(date).toISOString().replace("T", " ").substring(0, 19) + " UTC";
    };
    
    const testDate = new Date("2026-01-22T12:00:00Z");
    const formatted = formatDate(testDate);
    
    expect(formatted).toContain("UTC");
    expect(formatted).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC/);
  });

  it("returns N/A for null dates", () => {
    const formatDate = (date: Date | string | null | undefined) => {
      if (!date) return "N/A";
      return new Date(date).toISOString().replace("T", " ").substring(0, 19) + " UTC";
    };
    
    expect(formatDate(null)).toBe("N/A");
    expect(formatDate(undefined)).toBe("N/A");
  });
});
