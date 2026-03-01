/**
 * Admin Users Page
 * 
 * Displays user list with search, filter, and management capabilities.
 * Features: Plan change, Usage modification, Admin management, Bulk actions
 * Uses REST API for RunPod server operations
 */

import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { AdminLayout, useAdminStatus } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Edit,
  Shield,
  UserPlus,
  Trash2,
  Check,
  Users,
  CheckSquare,
  Eye
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

// User type with string ID (UUID from RunPod)
interface User {
  id: string;
  name: string | null;
  email: string;
  plan: string;
  role: string;
  usageCount: number;
  monthlyLimit: number;
  usageResetDate: string | null;
  createdAt: string;
  lastSignedIn: string | null;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Admin {
  id: number;
  email: string;
  isSuperAdmin: boolean;
  addedBy: string;
  createdAt: string;
}

// Plan options with limits
const PLAN_OPTIONS = [
  { value: "free", label: "Free", limit: 3 },
  { value: "pro", label: "Pro ($39.99)", limit: 50 },
  { value: "studio", label: "Studio ($399)", limit: 1000 },
  { value: "enterprise", label: "Enterprise (Custom)", limit: -1 },
  { value: "master", label: "Master (Internal)", limit: -1 },
];

// Plan badge colors
const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-500/20 text-gray-400",
  pro: "bg-blue-500/20 text-blue-400",
  studio: "bg-green-500/20 text-green-400",
  enterprise: "bg-purple-500/20 text-purple-400",
  master: "bg-amber-500/20 text-amber-400",
};

export default function AdminUsers() {
  // Search and filter states
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;
  
  // Data states
  const [usersData, setUsersData] = useState<UsersResponse | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Admin status
  const { isSuperAdmin } = useAdminStatus();
  
  // Selection states for bulk actions (using string IDs)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Modal states
  const [editPlanModal, setEditPlanModal] = useState(false);
  const [editUsageModal, setEditUsageModal] = useState(false);
  const [adminModal, setAdminModal] = useState(false);
  const [bulkActionModal, setBulkActionModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Edit form states
  const [newPlan, setNewPlan] = useState<"free" | "pro" | "studio" | "enterprise" | "master">("free");
  const [newUsageCount, setNewUsageCount] = useState(0);
  const [newMonthlyLimit, setNewMonthlyLimit] = useState(0);
  const [extensionDays, setExtensionDays] = useState(0);
  
  // Admin management states
  const [newAdminEmail, setNewAdminEmail] = useState("");
  
  // Bulk action states
  const [bulkAction, setBulkAction] = useState<"plan" | "reset">("plan");
  const [bulkPlan, setBulkPlan] = useState<"free" | "pro" | "studio" | "enterprise" | "master">("free");
  
  // Fetch users from REST API
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (planFilter !== "all") params.set("plan", planFilter);
      params.set("page", String(page));
      params.set("limit", String(limit));
      
      const response = await fetchWithAuth(`/api/admin/users?${params.toString()}`);
      if (response.ok) {
        const data: UsersResponse = await response.json();
        setUsersData(data);
      }
    } catch (error) {
      console.error("[Users] Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [search, planFilter, page, limit]);
  
  // Fetch admins
  const fetchAdmins = useCallback(async () => {
    try {
      const response = await fetchWithAuth("/api/admin/admins");
      if (response.ok) {
        const data: Admin[] = await response.json();
        setAdmins(data);
      }
    } catch (error) {
      console.error("[Users] Failed to fetch admins:", error);
    }
  }, []);
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);
  
  // Computed values
  const users = usersData?.users || [];
  const totalPages = usersData?.totalPages || 1;
  const total = usersData?.total || 0;
  
  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return users.find(u => u.id === selectedUserId);
  }, [selectedUserId, users]);
  
  // Handlers
  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };
  
  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
    setSelectAll(newSelected.size === users.length);
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(users.map(u => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
    setSelectAll(checked);
  };
  
  const openPlanModal = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUserId(userId);
      setNewPlan(user.plan as "free" | "pro" | "studio" | "enterprise" | "master");
      setEditPlanModal(true);
    }
  };
  
  const openUsageModal = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUserId(userId);
      setNewUsageCount(user.usageCount);
      setNewMonthlyLimit(user.monthlyLimit);
      setExtensionDays(0);
      setEditUsageModal(true);
    }
  };
  
  const handlePlanChange = async () => {
    if (!selectedUserId) return;
    try {
      setIsSubmitting(true);
      const response = await fetchWithAuth("/api/admin/users/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId, plan: newPlan }),
      });
      if (response.ok) {
        await fetchUsers();
        setEditPlanModal(false);
        alert("Plan changed successfully");
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || "Failed to change plan"}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUsageModification = async () => {
    if (!selectedUserId) return;
    try {
      setIsSubmitting(true);
      const response = await fetchWithAuth("/api/admin/users/modify-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          usageCount: newUsageCount,
          monthlyLimit: newMonthlyLimit,
          extensionDays: extensionDays > 0 ? extensionDays : null,
        }),
      });
      if (response.ok) {
        await fetchUsers();
        setEditUsageModal(false);
        alert("Usage settings updated successfully");
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || "Failed to modify usage"}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResetUsage = async (userId: string) => {
    if (!confirm("Are you sure you want to reset this user's usage?")) return;
    try {
      const response = await fetchWithAuth("/api/admin/users/reset-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        await fetchUsers();
        alert("Usage reset successfully");
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || "Failed to reset usage"}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };
  
  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    try {
      setIsSubmitting(true);
      const response = await fetchWithAuth("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newAdminEmail.trim(), isSuperAdmin: false }),
      });
      if (response.ok) {
        await fetchAdmins();
        setNewAdminEmail("");
        alert("Admin added successfully");
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || "Failed to add admin"}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveAdmin = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from admin?`)) return;
    try {
      const response = await fetchWithAuth(`/api/admin/admins/${encodeURIComponent(email)}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchAdmins();
        alert("Admin removed successfully");
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || "Failed to remove admin"}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };
  
  const handleBulkAction = async () => {
    const userIds = Array.from(selectedUsers);
    if (userIds.length === 0) return;
    
    try {
      setIsSubmitting(true);
      let response: Response;
      
      if (bulkAction === "plan") {
        response = await fetchWithAuth("/api/admin/users/bulk/change-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds, plan: bulkPlan }),
        });
      } else {
        response = await fetchWithAuth("/api/admin/users/bulk/reset-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds }),
        });
      }
      
      if (response.ok) {
        const data = await response.json();
        await fetchUsers();
        setBulkActionModal(false);
        setSelectedUsers(new Set());
        setSelectAll(false);
        alert(data.message || "Bulk action completed successfully");
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || "Bulk action failed"}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toISOString().replace("T", " ").substring(0, 19) + " UTC";
  };
  
  const [, setLocation] = useLocation();
  
  const handleUserClick = (userId: string) => {
    setLocation(`/admin/users/${userId}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">
              Manage user plans, usage, and admin access
            </p>
          </div>
          <div className="flex gap-2">
            {isSuperAdmin && (
              <Button variant="outline" onClick={() => setAdminModal(true)}>
                <Shield className="h-4 w-4 mr-2" />
                Manage Admins
              </Button>
            )}
            <Button variant="outline" onClick={() => fetchUsers()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <select
                value={planFilter}
                onChange={(e) => {
                  setPlanFilter(e.target.value);
                  setPage(1);
                }}
                className="flex h-10 w-full md:w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Plans</option>
                {PLAN_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  <span className="font-medium">{selectedUsers.size} users selected</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBulkAction("plan");
                      setBulkActionModal(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Change Plan
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBulkAction("reset");
                      setBulkActionModal(true);
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Usage
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedUsers(new Set());
                      setSelectAll(false);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No users found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 w-10">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        />
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">User</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Plan</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Usage</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Reset Date</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Joined</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 px-2">
                          <Checkbox
                            checked={selectedUsers.has(user.id)}
                            onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                          />
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <div className="font-medium text-sm">{user.name || "N/A"}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${PLAN_COLORS[user.plan] || PLAN_COLORS.free}`}>
                            {user.plan}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm">
                            {user.usageCount} / {user.monthlyLimit === -1 ? "∞" : user.monthlyLimit}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm text-muted-foreground">
                            {user.usageResetDate ? new Date(user.usageResetDate).toLocaleDateString() : "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUserClick(user.id)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPlanModal(user.id)}
                              title="Change Plan"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openUsageModal(user.id)}
                              title="Modify Usage"
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResetUsage(user.id)}
                              title="Reset Usage"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Plan Change Modal */}
      <Dialog open={editPlanModal} onOpenChange={setEditPlanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Plan</DialogTitle>
            <DialogDescription>
              Change plan for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Plan</Label>
              <select
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value as typeof newPlan)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {PLAN_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.limit === -1 ? "Unlimited" : `${opt.limit}/month`})
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-muted-foreground">
              Current plan: <span className="font-medium">{selectedUser?.plan}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlanModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlanChange} disabled={isSubmitting}>
              <Check className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Usage Modification Modal */}
      <Dialog open={editUsageModal} onOpenChange={setEditUsageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modify Usage Settings</DialogTitle>
            <DialogDescription>
              Adjust usage settings for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usedCount">Used This Month</Label>
                <Input
                  id="usedCount"
                  type="number"
                  min={0}
                  value={newUsageCount}
                  onChange={(e) => setNewUsageCount(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyLimit">Monthly Limit</Label>
                <Input
                  id="monthlyLimit"
                  type="number"
                  min={-1}
                  value={newMonthlyLimit}
                  onChange={(e) => setNewMonthlyLimit(parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">-1 for unlimited</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="extensionDays">Extend Period (Days)</Label>
              <Input
                id="extensionDays"
                type="number"
                min={0}
                max={365}
                value={extensionDays}
                onChange={(e) => setExtensionDays(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Add extra days before usage resets. Current reset: {formatDate(selectedUser?.usageResetDate)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUsageModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUsageModification} disabled={isSubmitting}>
              <Check className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Admin Management Modal */}
      <Dialog open={adminModal} onOpenChange={setAdminModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Administrators</DialogTitle>
            <DialogDescription>
              Add or remove admin access for DetectX
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Add New Admin */}
            <div className="space-y-2">
              <Label>Add New Admin</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddAdmin()}
                />
                <Button onClick={handleAddAdmin} disabled={isSubmitting}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
            
            {/* Admin List */}
            <div className="space-y-2">
              <Label>Current Admins ({admins.length})</Label>
              <div className="border border-border rounded-lg divide-y divide-border max-h-64 overflow-y-auto">
                {admins.map((admin) => (
                  <div key={admin.email} className="flex items-center justify-between p-3">
                    <div>
                      <div className="font-medium text-sm">{admin.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {admin.isSuperAdmin ? (
                          <span className="text-purple-500">Super Admin</span>
                        ) : (
                          <>Added by {admin.addedBy} on {formatDate(admin.createdAt)}</>
                        )}
                      </div>
                    </div>
                    {!admin.isSuperAdmin && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveAdmin(admin.email)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Action Modal */}
      <Dialog open={bulkActionModal} onOpenChange={setBulkActionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkAction === "plan" ? "Bulk Change Plan" : "Bulk Reset Usage"}
            </DialogTitle>
            <DialogDescription>
              This action will affect {selectedUsers.size} selected users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {bulkAction === "plan" ? (
              <div className="space-y-2">
                <Label>Select Plan for All</Label>
                <select
                  value={bulkPlan}
                  onChange={(e) => setBulkPlan(e.target.value as typeof bulkPlan)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {PLAN_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ({opt.limit === -1 ? "Unlimited" : `${opt.limit}/month`})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-400">
                  This will reset the monthly usage count to 0 for all selected users.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkAction}
              disabled={isSubmitting}
            >
              <Check className="h-4 w-4 mr-2" />
              {isSubmitting 
                ? "Processing..." 
                : `Apply to ${selectedUsers.size} Users`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
