"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0";
import Navbar from "@/components/Navbar";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

interface AdminUser {
  user_id: string;
  credit_limit: number;
  total_spent: number;
  remaining: number;
  total_forecasts: number;
  first_seen: string;
  last_seen: string;
  is_admin: boolean;
}

export default function AdminPage() {
  const { user, isLoading: authLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  // Check if current user is admin
  useEffect(() => {
    if (!user?.sub) return;
    fetch(`${API_BASE}/api/admin/check?user_id=${encodeURIComponent(user.sub as string)}`)
      .then((r) => r.json())
      .then((data) => setIsAdmin(data.is_admin === true))
      .catch(() => setIsAdmin(false));
  }, [user]);

  // Load users list
  const loadUsers = useCallback(async () => {
    if (!user?.sub) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/users?admin_user_id=${encodeURIComponent(user.sub as string)}`
      );
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin, loadUsers]);

  const handleSaveCredit = async (targetUserId: string) => {
    if (!user?.sub) return;
    const limit = parseFloat(editValue);
    if (isNaN(limit) || limit < 0) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_user_id: user.sub,
          target_user_id: targetUserId,
          credit_limit: limit,
        }),
      });
      if (res.ok) {
        setEditingUserId(null);
        loadUsers();
      }
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-dvh flex flex-col bg-ground">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-muted">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-dvh flex flex-col bg-ground">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted mb-3">Please log in to access the admin panel.</p>
            <a href="/auth/login" className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-ground hover:bg-accent-dim transition-colors">
              Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-dvh flex flex-col bg-ground">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted">Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-ground">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-primary">User Management</h1>
          <button
            onClick={loadUsers}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-edge text-secondary hover:text-primary hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-muted text-center py-12">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-sm text-muted text-center py-12">No users found.</div>
        ) : (
          <div className="border border-edge rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface border-b border-edge">
                    <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">User</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Credit Limit</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Spent</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Remaining</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Forecasts</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Last Active</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge">
                  {users.map((u) => (
                    <tr key={u.user_id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-medium truncate max-w-[200px]" title={u.user_id}>
                            {u.user_id.length > 30 ? `${u.user_id.slice(0, 30)}...` : u.user_id}
                          </span>
                          {u.is_admin && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-accent/15 text-accent rounded">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editingUserId === u.user_id ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveCredit(u.user_id);
                              if (e.key === "Escape") setEditingUserId(null);
                            }}
                            autoFocus
                            className="w-24 px-2 py-1 text-right text-sm bg-ground border border-accent/50 rounded-md text-primary outline-none focus:ring-1 focus:ring-accent/50"
                          />
                        ) : (
                          <span className="text-primary font-medium">${u.credit_limit.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-secondary">${u.total_spent.toFixed(4)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={u.remaining <= 0 ? "text-danger font-medium" : u.remaining < 1 ? "text-warning" : "text-success"}>
                          ${u.remaining.toFixed(4)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-secondary">{u.total_forecasts}</td>
                      <td className="px-4 py-3 text-right text-muted text-xs">
                        {u.last_seen ? new Date(u.last_seen).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editingUserId === u.user_id ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleSaveCredit(u.user_id)}
                              disabled={saving}
                              className="px-2 py-1 text-xs font-medium rounded bg-accent text-ground hover:bg-accent-dim transition-colors disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="px-2 py-1 text-xs font-medium rounded border border-edge text-muted hover:text-primary transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingUserId(u.user_id);
                              setEditValue(u.credit_limit.toString());
                            }}
                            className="px-2 py-1 text-xs font-medium rounded border border-edge text-secondary hover:text-primary hover:bg-surface-hover transition-colors"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
