/**
 * Admin Users Page
 * 
 * Displays user list with search, filter, and management capabilities.
 * Features: Plan change, Usage modification, Admin management
 * API: GET /api/admin/users
 */

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Calendar,
  Shield,
  UserPlus,
  Trash2,
  Check,
  X
} from "lucide-react";
// Toast notifications - using simple alerts for now

const API_BASE = "https://emjvw2an6oynf9-8000.proxy.runpod.net/api";

// Admin emails that can manage other admins
const SUPER_ADMIN_EMAILS = [
  "ceo@detectx.app",
  "skyclans2@gmail.com",
  "support@detectx.app",
  "coolkimy@naver.com",
  "skyclans@naver.com"
];

interface User {
  user_id: string;
  email: string;
  name: string;
  plan_type: string;
  monthly_limit: number;
  used_this_month: number;
  remaining: number;
  total_verifications: number;
  last_verification_at: string | null;
  created_at: string;
  reset_date: string;
}

interface UsersResponse {
  users: User[];
  count: number;
  total: number;
}

interface Admin {
  email: string;
  added_by: string;
  added_at: string;
}

const PLAN_OPTIONS = [
  { value: "free", label: "Free", limit: 5 },
  { value: "pro", label: "Professional", limit: 30 },
  { value: "enterprise", label: "Enterprise (기관)", limit: 1000 },
  { value: "master", label: "Master (Unlimited)", limit: -1 },
];

export default function AdminUsers() {
  // Simple toast function using alerts
  const toast = ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    if (variant === "destructive") {
      alert(`Error: ${title}\n${description}`);
    } else {
      console.log(`${title}: ${description}`);
    }
  };
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const limit = 20;

  // Modal states
  const [editPlanModal, setEditPlanModal] = useState(false);
  const [editUsageModal, setEditUsageModal] = useState(false);
  const [adminModal, setAdminModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Edit form states
  const [newPlan, setNewPlan] = useState("");
  const [newUsageCount, setNewUsageCount] = useState(0);
  const [newMonthlyLimit, setNewMonthlyLimit] = useState(0);
  const [extensionDays, setExtensionDays] = useState(0);
  
  // Admin management states
  const [admins, setAdmins] = useState<Admin[]>([
    { email: "ceo@detectx.app", added_by: "system", added_at: "2026-01-01T00:00:00" },
    { email: "skyclans2@gmail.com", added_by: "system", added_at: "2026-01-01T00:00:00" },
    { email: "support@detectx.app", added_by: "system", added_at: "2026-01-01T00:00:00" },
    { email: "coolkimy@naver.com", added_by: "system", added_at: "2026-01-01T00:00:00" },
    { email: "skyclans@naver.com", added_by: "system", added_at: "2026-01-01T00:00:00" },
  ]);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [page, planFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
      });
      if (search) params.append("search", search);
      if (planFilter) params.append("plan", planFilter);

      const response = await fetch(`${API_BASE}/admin/users?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      // Use mock data for development
      setData({
        users: [
          {
            user_id: "user_001",
            email: "user1@example.com",
            name: "John Doe",
            plan_type: "free",
            monthly_limit: 5,
            used_this_month: 3,
            remaining: 2,
            total_verifications: 45,
            last_verification_at: "2026-01-18T14:33:27",
            created_at: "2026-01-05T10:00:00",
            reset_date: "2026-02-01T00:00:00",
          },
          {
            user_id: "user_002",
            email: "pro@example.com",
            name: "Jane Smith",
            plan_type: "pro",
            monthly_limit: 30,
            used_this_month: 15,
            remaining: 15,
            total_verifications: 156,
            last_verification_at: "2026-01-19T09:15:00",
            created_at: "2026-01-01T08:00:00",
            reset_date: "2026-02-01T00:00:00",
          },
          {
            user_id: "user_003",
            email: "enterprise@company.com",
            name: "Enterprise User",
            plan_type: "enterprise",
            monthly_limit: 1000,
            used_this_month: 234,
            remaining: 766,
            total_verifications: 1250,
            last_verification_at: "2026-01-19T10:00:00",
            created_at: "2025-12-15T10:00:00",
            reset_date: "2026-02-01T00:00:00",
          },
        ],
        count: 3,
        total: 128,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchUsers();
  };

  const handleResetUsage = async (userId: string) => {
    if (!confirm("Are you sure you want to reset this user's monthly usage?")) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}/reset-usage`, {
        method: "POST",
      });
      if (response.ok) {
        fetchUsers();
        toast({
          title: "Usage Reset",
          description: "User's monthly usage has been reset to 0.",
        });
      }
    } catch (err) {
      console.error("Failed to reset usage:", err);
      toast({
        title: "Reset Successful (Mock)",
        description: "User's monthly usage has been reset.",
        variant: "default",
      });
    }
  };

  // Open Plan Edit Modal
  const openPlanEditModal = (user: User) => {
    setSelectedUser(user);
    setNewPlan(user.plan_type);
    setEditPlanModal(true);
  };

  // Handle Plan Change
  const handlePlanChange = async () => {
    if (!selectedUser) return;
    
    try {
      const planOption = PLAN_OPTIONS.find(p => p.value === newPlan);
      const response = await fetch(`${API_BASE}/admin/users/${selectedUser.user_id}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          plan_type: newPlan,
          monthly_limit: planOption?.limit || 5
        }),
      });
      
      if (response.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error("Failed to change plan:", err);
    }
    
    toast({
      title: "Plan Updated",
      description: `${selectedUser.email}'s plan changed to ${newPlan.toUpperCase()}.`,
    });
    setEditPlanModal(false);
    
    // Update mock data locally
    if (data) {
      const planOption = PLAN_OPTIONS.find(p => p.value === newPlan);
      setData({
        ...data,
        users: data.users.map(u => 
          u.user_id === selectedUser.user_id 
            ? { ...u, plan_type: newPlan, monthly_limit: planOption?.limit || u.monthly_limit }
            : u
        )
      });
    }
  };

  // Open Usage Edit Modal
  const openUsageEditModal = (user: User) => {
    setSelectedUser(user);
    setNewUsageCount(user.used_this_month);
    setNewMonthlyLimit(user.monthly_limit);
    setExtensionDays(0);
    setEditUsageModal(true);
  };

  // Handle Usage Modification
  const handleUsageModification = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`${API_BASE}/admin/users/${selectedUser.user_id}/usage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          used_this_month: newUsageCount,
          monthly_limit: newMonthlyLimit,
          extension_days: extensionDays
        }),
      });
      
      if (response.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error("Failed to modify usage:", err);
    }
    
    toast({
      title: "Usage Modified",
      description: `${selectedUser.email}'s usage has been updated.`,
    });
    setEditUsageModal(false);
    
    // Update mock data locally
    if (data) {
      setData({
        ...data,
        users: data.users.map(u => 
          u.user_id === selectedUser.user_id 
            ? { 
                ...u, 
                used_this_month: newUsageCount, 
                monthly_limit: newMonthlyLimit,
                remaining: newMonthlyLimit - newUsageCount
              }
            : u
        )
      });
    }
  };

  // Handle Add Admin
  const handleAddAdmin = async () => {
    if (!newAdminEmail || !newAdminEmail.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    if (admins.some(a => a.email === newAdminEmail)) {
      toast({
        title: "Already Admin",
        description: "This email is already an admin.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/admin/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newAdminEmail }),
      });
      
      if (response.ok) {
        // Refresh admin list
      }
    } catch (err) {
      console.error("Failed to add admin:", err);
    }
    
    // Add locally
    setAdmins([...admins, {
      email: newAdminEmail,
      added_by: "current_admin",
      added_at: new Date().toISOString()
    }]);
    
    toast({
      title: "Admin Added",
      description: `${newAdminEmail} has been added as an admin.`,
    });
    setNewAdminEmail("");
  };

  // Handle Remove Admin
  const handleRemoveAdmin = async (email: string) => {
    if (SUPER_ADMIN_EMAILS.includes(email)) {
      toast({
        title: "Cannot Remove",
        description: "Super admins cannot be removed.",
        variant: "destructive",
      });
      return;
    }
    
    if (!confirm(`Are you sure you want to remove ${email} from admins?`)) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/admin/admins/${encodeURIComponent(email)}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        // Refresh admin list
      }
    } catch (err) {
      console.error("Failed to remove admin:", err);
    }
    
    // Remove locally
    setAdmins(admins.filter(a => a.email !== email));
    
    toast({
      title: "Admin Removed",
      description: `${email} has been removed from admins.`,
    });
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "free":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      case "pro":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "enterprise":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "master":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-muted-foreground">Manage DetectX users and admins</p>
          </div>
          <Button onClick={() => setAdminModal(true)} variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Manage Admins
          </Button>
        </div>

        {error && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-600 dark:text-yellow-400 text-sm">
            Using mock data: {error}
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">All Plans</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
                <option value="master">Master</option>
              </select>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" onClick={() => { setSearch(""); setPlanFilter(""); setPage(0); fetchUsers(); }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Users ({data?.total || 0} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Plan</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Usage</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Last Active</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.users.map((user) => (
                        <tr key={user.user_id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{user.name || "Unknown"}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPlanBadgeColor(user.plan_type)}`}>
                              {user.plan_type.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-muted rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    user.remaining === 0 ? "bg-red-500" : "bg-primary"
                                  }`}
                                  style={{ width: `${user.monthly_limit > 0 ? (user.used_this_month / user.monthly_limit) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="text-sm">
                                {user.monthly_limit === -1 ? "∞" : `${user.used_this_month}/${user.monthly_limit}`}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {user.total_verifications.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {user.last_verification_at 
                              ? new Date(user.last_verification_at).toLocaleDateString()
                              : "Never"}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openPlanEditModal(user)}
                                title="Change Plan"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openUsageEditModal(user)}
                                title="Modify Usage"
                              >
                                <Calendar className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleResetUsage(user.user_id)}
                                title="Reset monthly usage"
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

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Showing {page * limit + 1} - {Math.min((page + 1) * limit, data?.total || 0)} of {data?.total || 0}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">Page {page + 1}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={(page + 1) * limit >= (data?.total || 0)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Edit Modal */}
      <Dialog open={editPlanModal} onOpenChange={setEditPlanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Plan</DialogTitle>
            <DialogDescription>
              Change the plan for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Plan</Label>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getPlanBadgeColor(selectedUser?.plan_type || "")}`}>
                {selectedUser?.plan_type?.toUpperCase()}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPlan">New Plan</Label>
              <select
                id="newPlan"
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                {PLAN_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.limit === -1 ? "Unlimited" : `${option.limit}/month`})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlanModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlanChange}>
              <Check className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Usage Edit Modal */}
      <Dialog open={editUsageModal} onOpenChange={setEditUsageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modify User Usage</DialogTitle>
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
                Add extra days before usage resets. Current reset: {selectedUser?.reset_date ? new Date(selectedUser.reset_date).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUsageModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUsageModification}>
              <Check className="h-4 w-4 mr-2" />
              Save Changes
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
                <Button onClick={handleAddAdmin}>
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
                        {SUPER_ADMIN_EMAILS.includes(admin.email) ? (
                          <span className="text-purple-500">Super Admin</span>
                        ) : (
                          <>Added by {admin.added_by} on {new Date(admin.added_at).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                    {!SUPER_ADMIN_EMAILS.includes(admin.email) && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveAdmin(admin.email)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
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
    </AdminLayout>
  );
}
