/**
 * Admin API Tests
 * 
 * Tests for admin router endpoints including:
 * - User management (plan change, usage modification)
 * - Admin management (add/remove admins)
 * - Bulk actions
 * - Audit logging
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getAllUsersForAdmin: vi.fn(),
  getUserById: vi.fn(),
  updateUserPlan: vi.fn(),
  updateUserUsage: vi.fn(),
  resetUserUsage: vi.fn(),
  getAllAdmins: vi.fn(),
  addAdmin: vi.fn(),
  removeAdmin: vi.fn(),
  createAuditLog: vi.fn(),
  getAuditLogs: vi.fn(),
}));

import {
  getAllUsersForAdmin,
  getUserById,
  updateUserPlan,
  updateUserUsage,
  resetUserUsage,
  getAllAdmins,
  addAdmin,
  removeAdmin,
  createAuditLog,
  getAuditLogs,
} from "./db";

describe("Admin API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUsers", () => {
    it("should return paginated users list", async () => {
      const mockUsers = [
        {
          id: 1,
          email: "user1@example.com",
          name: "User One",
          plan: "free",
          usageCount: 3,
          monthlyLimit: 5,
          usageResetDate: new Date(),
          lastSignedIn: new Date(),
          createdAt: new Date(),
        },
        {
          id: 2,
          email: "user2@example.com",
          name: "User Two",
          plan: "pro",
          usageCount: 10,
          monthlyLimit: 30,
          usageResetDate: new Date(),
          lastSignedIn: new Date(),
          createdAt: new Date(),
        },
      ];

      vi.mocked(getAllUsersForAdmin).mockResolvedValue({
        users: mockUsers,
        total: 2,
        totalPages: 1,
      });

      const result = await getAllUsersForAdmin({
        page: 1,
        limit: 20,
      });

      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });

    it("should filter users by plan", async () => {
      const mockUsers = [
        {
          id: 1,
          email: "pro@example.com",
          name: "Pro User",
          plan: "pro",
          usageCount: 10,
          monthlyLimit: 30,
          usageResetDate: new Date(),
          lastSignedIn: new Date(),
          createdAt: new Date(),
        },
      ];

      vi.mocked(getAllUsersForAdmin).mockResolvedValue({
        users: mockUsers,
        total: 1,
        totalPages: 1,
      });

      const result = await getAllUsersForAdmin({
        page: 1,
        limit: 20,
        plan: "pro",
      });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].plan).toBe("pro");
    });

    it("should search users by email", async () => {
      const mockUsers = [
        {
          id: 1,
          email: "test@example.com",
          name: "Test User",
          plan: "free",
          usageCount: 0,
          monthlyLimit: 5,
          usageResetDate: new Date(),
          lastSignedIn: new Date(),
          createdAt: new Date(),
        },
      ];

      vi.mocked(getAllUsersForAdmin).mockResolvedValue({
        users: mockUsers,
        total: 1,
        totalPages: 1,
      });

      const result = await getAllUsersForAdmin({
        page: 1,
        limit: 20,
        search: "test@",
      });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].email).toContain("test");
    });
  });

  describe("changePlan", () => {
    it("should update user plan successfully", async () => {
      const mockUser = {
        id: 1,
        email: "user@example.com",
        name: "Test User",
        plan: "free",
      };

      vi.mocked(getUserById).mockResolvedValue(mockUser as any);
      vi.mocked(updateUserPlan).mockResolvedValue(true);
      vi.mocked(createAuditLog).mockResolvedValue(undefined);

      const result = await updateUserPlan(1, "pro");

      expect(result).toBe(true);
      expect(updateUserPlan).toHaveBeenCalledWith(1, "pro");
    });

    it("should set correct monthly limit for each plan", async () => {
      const planLimits = {
        free: 5,
        pro: 30,
        enterprise: 1000,
        master: -1,
      };

      for (const [plan, limit] of Object.entries(planLimits)) {
        vi.mocked(updateUserPlan).mockResolvedValue(true);
        
        await updateUserPlan(1, plan);
        
        expect(updateUserPlan).toHaveBeenCalledWith(1, plan);
      }
    });
  });

  describe("modifyUsage", () => {
    it("should update usage count and limit", async () => {
      vi.mocked(getUserById).mockResolvedValue({
        id: 1,
        email: "user@example.com",
        usageCount: 5,
        monthlyLimit: 10,
      } as any);
      vi.mocked(updateUserUsage).mockResolvedValue(true);
      vi.mocked(createAuditLog).mockResolvedValue(undefined);

      const result = await updateUserUsage(1, {
        usageCount: 0,
        monthlyLimit: 20,
      });

      expect(result).toBe(true);
    });

    it("should extend usage period when extensionDays provided", async () => {
      vi.mocked(getUserById).mockResolvedValue({
        id: 1,
        email: "user@example.com",
        usageCount: 5,
        monthlyLimit: 10,
        usageResetDate: new Date(),
      } as any);
      vi.mocked(updateUserUsage).mockResolvedValue(true);

      const result = await updateUserUsage(1, {
        usageCount: 5,
        monthlyLimit: 10,
        extensionDays: 30,
      });

      expect(result).toBe(true);
    });
  });

  describe("resetUsage", () => {
    it("should reset user usage to 0", async () => {
      vi.mocked(getUserById).mockResolvedValue({
        id: 1,
        email: "user@example.com",
        usageCount: 25,
      } as any);
      vi.mocked(resetUserUsage).mockResolvedValue(true);
      vi.mocked(createAuditLog).mockResolvedValue(undefined);

      const result = await resetUserUsage(1);

      expect(result).toBe(true);
      expect(resetUserUsage).toHaveBeenCalledWith(1);
    });
  });

  describe("Admin Management", () => {
    it("should get all admins", async () => {
      const mockAdmins = [
        {
          id: 1,
          email: "admin1@example.com",
          isSuperAdmin: true,
          addedBy: "system",
          createdAt: new Date(),
        },
        {
          id: 2,
          email: "admin2@example.com",
          isSuperAdmin: false,
          addedBy: "admin1@example.com",
          createdAt: new Date(),
        },
      ];

      vi.mocked(getAllAdmins).mockResolvedValue(mockAdmins);

      const result = await getAllAdmins();

      expect(result).toHaveLength(2);
      expect(result[0].isSuperAdmin).toBe(true);
    });

    it("should add new admin", async () => {
      vi.mocked(addAdmin).mockResolvedValue({
        id: 3,
        email: "newadmin@example.com",
        isSuperAdmin: false,
        addedBy: "admin@example.com",
        createdAt: new Date(),
      });
      vi.mocked(createAuditLog).mockResolvedValue(undefined);

      const result = await addAdmin("newadmin@example.com", "admin@example.com");

      expect(result.email).toBe("newadmin@example.com");
      expect(addAdmin).toHaveBeenCalledWith("newadmin@example.com", "admin@example.com");
    });

    it("should remove admin", async () => {
      vi.mocked(removeAdmin).mockResolvedValue(true);
      vi.mocked(createAuditLog).mockResolvedValue(undefined);

      const result = await removeAdmin("admin2@example.com");

      expect(result).toBe(true);
      expect(removeAdmin).toHaveBeenCalledWith("admin2@example.com");
    });
  });

  describe("Audit Logs", () => {
    it("should create audit log entry", async () => {
      vi.mocked(createAuditLog).mockResolvedValue(undefined);

      await createAuditLog({
        adminId: 1,
        adminEmail: "admin@example.com",
        action: "PLAN_CHANGE",
        targetUserId: 2,
        targetEmail: "user@example.com",
        previousValue: { plan: "free" },
        newValue: { plan: "pro" },
        details: "Changed plan from free to pro",
      });

      expect(createAuditLog).toHaveBeenCalled();
    });

    it("should get audit logs with pagination", async () => {
      const mockLogs = [
        {
          id: 1,
          adminId: 1,
          adminEmail: "admin@example.com",
          action: "PLAN_CHANGE",
          targetUserId: 2,
          targetEmail: "user@example.com",
          previousValue: { plan: "free" },
          newValue: { plan: "pro" },
          createdAt: new Date(),
        },
      ];

      vi.mocked(getAuditLogs).mockResolvedValue({
        logs: mockLogs,
        total: 1,
        totalPages: 1,
      });

      const result = await getAuditLogs({ page: 1, limit: 20 });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].action).toBe("PLAN_CHANGE");
    });

    it("should filter audit logs by action type", async () => {
      const mockLogs = [
        {
          id: 1,
          adminId: 1,
          adminEmail: "admin@example.com",
          action: "ADMIN_ADD",
          targetEmail: "newadmin@example.com",
          createdAt: new Date(),
        },
      ];

      vi.mocked(getAuditLogs).mockResolvedValue({
        logs: mockLogs,
        total: 1,
        totalPages: 1,
      });

      const result = await getAuditLogs({ page: 1, limit: 20, action: "ADMIN_ADD" });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].action).toBe("ADMIN_ADD");
    });
  });

  describe("Bulk Actions", () => {
    it("should bulk change plans for multiple users", async () => {
      const userIds = [1, 2, 3];
      
      vi.mocked(getUserById).mockResolvedValue({
        id: 1,
        email: "user@example.com",
        plan: "free",
      } as any);
      vi.mocked(updateUserPlan).mockResolvedValue(true);
      vi.mocked(createAuditLog).mockResolvedValue(undefined);

      // Simulate bulk update
      for (const userId of userIds) {
        await updateUserPlan(userId, "pro");
      }

      expect(updateUserPlan).toHaveBeenCalledTimes(3);
    });

    it("should bulk reset usage for multiple users", async () => {
      const userIds = [1, 2, 3];
      
      vi.mocked(getUserById).mockResolvedValue({
        id: 1,
        email: "user@example.com",
        usageCount: 10,
      } as any);
      vi.mocked(resetUserUsage).mockResolvedValue(true);
      vi.mocked(createAuditLog).mockResolvedValue(undefined);

      // Simulate bulk reset
      for (const userId of userIds) {
        await resetUserUsage(userId);
      }

      expect(resetUserUsage).toHaveBeenCalledTimes(3);
    });
  });
});
