/**
 * Admin Users Page
 * 
 * Displays user list with search, filter, and management capabilities.
 * Features: Plan change, Usage modification, Admin management, Bulk actions
 * Uses tRPC for real database operations
 */

import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
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
import { trpc } from "@/lib/trpc";

// Plan options with limits
const PLAN_OPTIONS = [
  { value: "free", label: "Free", limit: 5 },
  { value: "pro", label: "Professional", limit: 30 },
  { value: "enterprise", label: "Enterprise (기관)", limit: 1000 },
  { value: "master", label: "Master (Unlimited)", limit: -1 },
];

// Plan badge colors
const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-500/20 text-gray-400",
  pro: "bg-blue-500/20 text-blue-400",
  enterprise: "bg-purple-500/20 text-purple-400",
  master: "bg-amber-500/20 text-amber-400",
};

export default function AdminUsers() {
  // Search and filter states
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;
  
  // Selection states for bulk actions
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Modal states
  const [editPlanModal, setEditPlanModal] = useState(false);
  const [editUsageModal, setEditUsageModal] = useState(false);
  const [adminModal, setAdminModal] = useState(false);
  const [bulkActionModal, setBulkActionModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  // Edit form states
  const [newPlan, setNewPlan] = useState<"free" | "pro" | "enterprise" | "master">("free");
  const [newUsageCount, setNewUsageCount] = useState(0);
  const [newMonthlyLimit, setNewMonthlyLimit] = useState(0);
  const [extensionDays, setExtensionDays] = useState(0);
  
  // Admin management states
  const [newAdminEmail, setNewAdminEmail] = useState("");
  
  // Bulk action states
  const [bulkAction, setBulkAction] = useState<"plan" | "reset">("plan");
  const [bulkPlan, setBulkPlan] = useState<"free" | "pro" | "enterprise" | "master">("free");
  
  // Fetch users from API
  const { data: usersData, isLoading, refetch } = trpc.admin.getUsers.useQuery({
    search: search || undefined,
    plan: planFilter !== "all" ? planFilter : undefined,
    page,
    limit,
  });
  
  // Fetch admins
  const { data: adminsData, refetch: refetchAdmins } = trpc.admin.getAdmins.useQuery();
  
  // Check admin status
  const { data: adminStatus } = trpc.admin.checkAdminStatus.useQuery();
  
  // Mutations
  const changePlanMutation = trpc.admin.changePlan.useMutation({
    onSuccess: () => {
      refetch();
      setEditPlanModal(false);
      alert("Plan changed successfully");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });
  
  const modifyUsageMutation = trpc.admin.modifyUsage.useMutation({
    onSuccess: () => {
      refetch();
      setEditUsageModal(false);
      alert("Usage settings updated successfully");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });
  
  const resetUsageMutation = trpc.admin.resetUsage.useMutation({
    onSuccess: () => {
      refetch();
      alert("Usage reset successfully");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });
  
  const addAdminMutation = trpc.admin.addAdmin.useMutation({
    onSuccess: () => {
      refetchAdmins();
      setNewAdminEmail("");
      alert("Admin added successfully");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });
  
  const removeAdminMutation = trpc.admin.removeAdmin.useMutation({
    onSuccess: () => {
      refetchAdmins();
      alert("Admin removed successfully");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });
  
  const bulkChangePlanMutation = trpc.admin.bulkChangePlan.useMutation({
    onSuccess: (data) => {
      refetch();
      setBulkActionModal(false);
      setSelectedUsers(new Set());
      setSelectAll(false);
      alert(data.message);
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });
  
  const bulkResetUsageMutation = trpc.admin.bulkResetUsage.useMutation({
    onSuccess: (data) => {
      refetch();
      setBulkActionModal(false);
      setSelectedUsers(new Set());
      setSelectAll(false);
      alert(data.message);
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });
  
  // Computed values
  const users = usersData?.users || [];
  const totalPages = usersData?.totalPages || 1;
  const total = usersData?.total || 0;
  const admins = adminsData || [];
  const isSuperAdmin = adminStatus?.isSuperAdmin || false;
  
  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return users.find(u => u.id === selectedUserId);
  }, [selectedUserId, users]);
  
  // Handlers
  const handleSearch = () => {
    setPage(1);
    refetch();
  };
  
  const handleSelectUser = (userId: number, checked: boolean) => {
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
  
  const openPlanModal = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUserId(userId);
      setNewPlan(user.plan as "free" | "pro" | "enterprise" | "master");
      setEditPlanModal(true);
    }
  };
  
  const openUsageModal = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUserId(userId);
      setNewUsageCount(user.usageCount);
      setNewMonthlyLimit(user.monthlyLimit);
      setExtensionDays(0);
      setEditUsageModal(true);
    }
  };
  
  const handlePlanChange = () => {
    if (!selectedUserId) return;
    changePlanMutation.mutate({ userId: selectedUserId, plan: newPlan });
  };
  
  const handleUsageModification = () => {
    if (!selectedUserId) return;
    modifyUsageMutation.mutate({
      userId: selectedUserId,
      usageCount: newUsageCount,
      monthlyLimit: newMonthlyLimit,
      extensionDays: extensionDays > 0 ? extensionDays : undefined,
    });
  };
  
  const handleResetUsage = (userId: number) => {
    if (confirm("Are you sure you want to reset this user's usage?")) {
      resetUsageMutation.mutate({ userId });
    }
  };
  
  const handleAddAdmin = () => {
    if (!newAdminEmail.trim()) return;
    addAdminMutation.mutate({ email: newAdminEmail.trim() });
  };
  
  const handleRemoveAdmin = (email: string) => {
    if (confirm(`Are you sure you want to remove ${email} from admin?`)) {
      removeAdminMutation.mutate({ email });
    }
  };
  
  const handleBulkAction = () => {
    const userIds = Array.from(selectedUsers);
    if (userIds.length === 0) return;
    
    if (bulkAction === "plan") {
      bulkChangePlanMutation.mutate({ userIds, plan: bulkPlan });
    } else {
      bulkResetUsageMutation.mutate({ userIds });
    }
  };
  
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toISOString().replace("T", " ").substring(0, 19) + " UTC";
  };
  
  const [, setLocation] = useLocation();
  
  const handleUserClick = (userId: number) => {
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
            <Button variant="outline" onClick={() => refetch()}>
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
                onChange={(e) => setPlanFilter(e.target.value)}
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
        
        {/* Bulk Actions Bar */}
        {selectedUsers.size > 0 && (
          <Card className="border-blue-500/50 bg-blue-500/5">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-blue-400" />
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
                    Clear Selection
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
              Users ({total} total)
            </CardTitle>
            <CardDescription>
              Click on a user to manage their plan and usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 px-2 text-left">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">User</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Plan</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Usage</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Last Active</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <Checkbox
                            checked={selectedUsers.has(user.id)}
                            onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{user.name || "Unknown"}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${PLAN_COLORS[user.plan] || PLAN_COLORS.free}`}>
                            {PLAN_OPTIONS.find(p => p.value === user.plan)?.label || user.plan}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <span className="font-medium">{user.usageCount}</span>
                            <span className="text-muted-foreground">
                              / {user.monthlyLimit === -1 ? "∞" : user.monthlyLimit}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDate(user.lastSignedIn)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
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
                              title="Edit Usage"
                            >
                              <Shield className="h-4 w-4" />
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
            <Button onClick={handlePlanChange} disabled={changePlanMutation.isPending}>
              <Check className="h-4 w-4 mr-2" />
              {changePlanMutation.isPending ? "Saving..." : "Save Changes"}
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
            <Button onClick={handleUsageModification} disabled={modifyUsageMutation.isPending}>
              <Check className="h-4 w-4 mr-2" />
              {modifyUsageMutation.isPending ? "Saving..." : "Save Changes"}
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
                <Button onClick={handleAddAdmin} disabled={addAdminMutation.isPending}>
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
                        disabled={removeAdminMutation.isPending}
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
              disabled={bulkChangePlanMutation.isPending || bulkResetUsageMutation.isPending}
            >
              <Check className="h-4 w-4 mr-2" />
              {bulkChangePlanMutation.isPending || bulkResetUsageMutation.isPending 
                ? "Processing..." 
                : `Apply to ${selectedUsers.size} Users`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
