/**
 * Admin Router
 * 
 * tRPC procedures for admin panel functionality:
 * - User management (list, plan change, usage modification)
 * - Admin management (add/remove admins)
 * - Audit logging
 * - Bulk operations
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getAllUsers,
  getUserById,
  updateUserPlan,
  updateUserUsage,
  resetUserUsage,
  bulkUpdateUserPlan,
  bulkResetUserUsage,
  getAllAdmins,
  isAdmin,
  isSuperAdmin,
  addAdmin,
  removeAdmin,
  createAdminLog,
  getAdminLogs,
  getAllVerifications,
} from "./db";

// Admin procedure - requires admin access
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user?.email) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  
  const adminStatus = await isAdmin(ctx.user.email);
  if (!adminStatus) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  
  return next({
    ctx: {
      ...ctx,
      adminEmail: ctx.user.email,
    },
  });
});

// Super admin procedure - requires super admin access
const superAdminProcedure = adminProcedure.use(async ({ ctx, next }) => {
  const superAdminStatus = await isSuperAdmin(ctx.adminEmail);
  if (!superAdminStatus) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Super admin access required" });
  }
  
  return next({ ctx });
});

export const adminRouter = router({
  // ============================================
  // User Management
  // ============================================
  
  /**
   * Get all users with pagination and filters
   */
  getUsers: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        plan: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const result = await getAllUsers(input);
      return {
        users: result.users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          plan: user.plan,
          usageCount: user.usageCount,
          monthlyLimit: user.monthlyLimit,
          usageResetDate: user.usageResetDate,
          createdAt: user.createdAt,
          lastSignedIn: user.lastSignedIn,
        })),
        total: result.total,
        page: input?.page || 1,
        limit: input?.limit || 20,
        totalPages: Math.ceil(result.total / (input?.limit || 20)),
      };
    }),
  
  /**
   * Get single user by ID
   */
  getUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const user = await getUserById(input.userId);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        usageCount: user.usageCount,
        monthlyLimit: user.monthlyLimit,
        usageResetDate: user.usageResetDate,
        createdAt: user.createdAt,
        lastSignedIn: user.lastSignedIn,
      };
    }),
  
  /**
   * Change user plan
   */
  changePlan: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        plan: z.enum(["free", "pro", "enterprise", "master"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await getUserById(input.userId);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      
      const previousPlan = user.plan;
      await updateUserPlan(input.userId, input.plan);
      
      // Log the action
      await createAdminLog({
        adminEmail: ctx.adminEmail,
        action: "plan_change",
        targetType: "user",
        targetId: input.userId,
        targetEmail: user.email,
        previousValue: { plan: previousPlan },
        newValue: { plan: input.plan },
        details: `Changed plan from ${previousPlan} to ${input.plan}`,
      });
      
      return { success: true, message: `Plan changed to ${input.plan}` };
    }),
  
  /**
   * Modify user usage settings
   */
  modifyUsage: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        usageCount: z.number().min(0).optional(),
        monthlyLimit: z.number().min(-1).optional(), // -1 for unlimited
        extensionDays: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await getUserById(input.userId);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      
      const previousValue = {
        usageCount: user.usageCount,
        monthlyLimit: user.monthlyLimit,
        usageResetDate: user.usageResetDate,
      };
      
      const updateData: {
        usageCount?: number;
        monthlyLimit?: number;
        usageResetDate?: Date | null;
      } = {};
      
      if (input.usageCount !== undefined) {
        updateData.usageCount = input.usageCount;
      }
      
      if (input.monthlyLimit !== undefined) {
        updateData.monthlyLimit = input.monthlyLimit;
      }
      
      if (input.extensionDays && input.extensionDays > 0) {
        const currentResetDate = user.usageResetDate || new Date();
        const newResetDate = new Date(currentResetDate);
        newResetDate.setDate(newResetDate.getDate() + input.extensionDays);
        updateData.usageResetDate = newResetDate;
      }
      
      await updateUserUsage(input.userId, updateData);
      
      // Log the action
      await createAdminLog({
        adminEmail: ctx.adminEmail,
        action: "usage_modify",
        targetType: "user",
        targetId: input.userId,
        targetEmail: user.email,
        previousValue,
        newValue: updateData,
        details: `Modified usage settings`,
      });
      
      return { success: true, message: "Usage settings updated" };
    }),
  
  /**
   * Reset user's monthly usage count
   */
  resetUsage: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserById(input.userId);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      
      const previousUsage = user.usageCount;
      await resetUserUsage(input.userId);
      
      // Log the action
      await createAdminLog({
        adminEmail: ctx.adminEmail,
        action: "usage_reset",
        targetType: "user",
        targetId: input.userId,
        targetEmail: user.email,
        previousValue: { usageCount: previousUsage },
        newValue: { usageCount: 0 },
        details: `Reset monthly usage from ${previousUsage} to 0`,
      });
      
      return { success: true, message: "Usage reset successfully" };
    }),
  
  // ============================================
  // Bulk Operations
  // ============================================
  
  /**
   * Bulk change plan for multiple users
   */
  bulkChangePlan: adminProcedure
    .input(
      z.object({
        userIds: z.array(z.number()).min(1),
        plan: z.enum(["free", "pro", "enterprise", "master"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await bulkUpdateUserPlan(input.userIds, input.plan);
      
      // Log the action
      await createAdminLog({
        adminEmail: ctx.adminEmail,
        action: "bulk_plan_change",
        targetType: "user",
        targetId: null,
        targetEmail: null,
        previousValue: null,
        newValue: { userIds: input.userIds, plan: input.plan },
        details: `Bulk changed ${input.userIds.length} users to ${input.plan} plan`,
      });
      
      return { 
        success: true, 
        message: `Changed ${input.userIds.length} users to ${input.plan} plan` 
      };
    }),
  
  /**
   * Bulk reset usage for multiple users
   */
  bulkResetUsage: adminProcedure
    .input(
      z.object({
        userIds: z.array(z.number()).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await bulkResetUserUsage(input.userIds);
      
      // Log the action
      await createAdminLog({
        adminEmail: ctx.adminEmail,
        action: "bulk_usage_reset",
        targetType: "user",
        targetId: null,
        targetEmail: null,
        previousValue: null,
        newValue: { userIds: input.userIds },
        details: `Bulk reset usage for ${input.userIds.length} users`,
      });
      
      return { 
        success: true, 
        message: `Reset usage for ${input.userIds.length} users` 
      };
    }),
  
  // ============================================
  // Admin Management
  // ============================================
  
  /**
   * Get all admins
   */
  getAdmins: adminProcedure.query(async () => {
    const admins = await getAllAdmins();
    return admins.map(admin => ({
      id: admin.id,
      email: admin.email,
      isSuperAdmin: admin.isSuperAdmin,
      addedBy: admin.addedBy,
      createdAt: admin.createdAt,
    }));
  }),
  
  /**
   * Check if current user is admin
   */
  checkAdminStatus: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.email) {
      return { isAdmin: false, isSuperAdmin: false };
    }
    
    const adminStatus = await isAdmin(ctx.user.email);
    const superAdminStatus = adminStatus ? await isSuperAdmin(ctx.user.email) : false;
    
    return {
      isAdmin: adminStatus,
      isSuperAdmin: superAdminStatus,
    };
  }),
  
  /**
   * Add new admin (super admin only)
   */
  addAdmin: superAdminProcedure
    .input(
      z.object({
        email: z.string().email(),
        isSuperAdmin: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if already an admin
      const existingAdmin = await isAdmin(input.email);
      if (existingAdmin) {
        throw new TRPCError({ code: "CONFLICT", message: "User is already an admin" });
      }
      
      await addAdmin(input.email, ctx.adminEmail, input.isSuperAdmin);
      
      // Log the action
      await createAdminLog({
        adminEmail: ctx.adminEmail,
        action: "admin_add",
        targetType: "admin",
        targetId: null,
        targetEmail: input.email,
        previousValue: null,
        newValue: { email: input.email, isSuperAdmin: input.isSuperAdmin },
        details: `Added ${input.email} as ${input.isSuperAdmin ? 'super admin' : 'admin'}`,
      });
      
      return { success: true, message: `Added ${input.email} as admin` };
    }),
  
  /**
   * Remove admin (super admin only)
   */
  removeAdmin: superAdminProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      // Cannot remove yourself
      if (input.email === ctx.adminEmail) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot remove yourself" });
      }
      
      // Check if admin exists
      const existingAdmin = await isAdmin(input.email);
      if (!existingAdmin) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Admin not found" });
      }
      
      await removeAdmin(input.email);
      
      // Log the action
      await createAdminLog({
        adminEmail: ctx.adminEmail,
        action: "admin_remove",
        targetType: "admin",
        targetId: null,
        targetEmail: input.email,
        previousValue: { email: input.email },
        newValue: null,
        details: `Removed ${input.email} from admin`,
      });
      
      return { success: true, message: `Removed ${input.email} from admin` };
    }),
  
  // ============================================
  // Audit Logs
  // ============================================
  
  /**
   * Get admin activity logs
   */
  getLogs: adminProcedure
    .input(
      z.object({
        adminEmail: z.string().optional(),
        action: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const result = await getAdminLogs(input);
      return {
        logs: result.logs.map(log => ({
          id: log.id,
          adminEmail: log.adminEmail,
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId,
          targetEmail: log.targetEmail,
          previousValue: log.previousValue,
          newValue: log.newValue,
          details: log.details,
          createdAt: log.createdAt,
        })),
        total: result.total,
        page: input?.page || 1,
        limit: input?.limit || 50,
        totalPages: Math.ceil(result.total / (input?.limit || 50)),
      };
    }),
  
  // ============================================
  // Verification Management
  // ============================================
  
  /**
   * Get all verifications with pagination and filters
   */
  getVerifications: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
        verdict: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const result = await getAllVerifications(input);
      return {
        verifications: result.verifications.map(v => ({
          id: v.id,
          userId: v.userId,
          fileName: v.fileName,
          fileSize: v.fileSize,
          duration: v.duration,
          verdict: v.verdict,
          crgStatus: v.crgStatus,
          status: v.status,
          createdAt: v.createdAt,
        })),
        total: result.total,
        page: input?.page || 1,
        limit: input?.limit || 20,
        totalPages: Math.ceil(result.total / (input?.limit || 20)),
      };
    }),
  
  // ============================================
  // Dashboard Statistics
  // ============================================
  
  /**
   * Get dashboard statistics
   */
  getStats: adminProcedure.query(async () => {
    const usersResult = await getAllUsers({ limit: 1 });
    const verificationsResult = await getAllVerifications({ limit: 1 });
    const admins = await getAllAdmins();
    
    // Get plan distribution
    const allUsersResult = await getAllUsers({ limit: 10000 });
    const planDistribution = {
      free: 0,
      pro: 0,
      enterprise: 0,
      master: 0,
    };
    
    allUsersResult.users.forEach(user => {
      if (user.plan in planDistribution) {
        planDistribution[user.plan as keyof typeof planDistribution]++;
      }
    });
    
    return {
      totalUsers: usersResult.total,
      totalVerifications: verificationsResult.total,
      totalAdmins: admins.length,
      planDistribution,
    };
  }),
});

export type AdminRouter = typeof adminRouter;
