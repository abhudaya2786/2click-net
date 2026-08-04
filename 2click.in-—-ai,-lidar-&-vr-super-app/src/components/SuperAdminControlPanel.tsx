import React, { useState } from 'react';
import { ShieldAlert, Users, FileText, CheckCircle, XCircle, UserCheck, ShieldCheck, Search, Trash2 } from 'lucide-react';
import { UserProfile, AuditLog, ApprovalRequest, UserRole } from '../types';

interface SuperAdminControlPanelProps {
  currentUser: {
    role: UserRole;
    fullName?: string;
    name?: string;
    emailOrPhone?: string;
    email?: string;
  };
}

export const SuperAdminControlPanel: React.FC<SuperAdminControlPanelProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'LOGS' | 'APPROVALS'>('USERS');

  // Sample Users Data
  const [users, setUsers] = useState<UserProfile[]>([
    { id: '1', fullName: 'Abhudaya Pratap Singh', emailOrPhone: 'admin@2click.in', role: 'super_admin', location: 'Gorakhpur', pincode: '273001', is2FAEnabled: true, createdAt: '2026-01-01', lastLogin: 'Just now' },
    { id: '2', fullName: 'Rahul Sharma', emailOrPhone: 'rahul@example.com', role: 'manager', location: 'Lucknow', pincode: '226001', is2FAEnabled: false, createdAt: '2026-03-12', lastLogin: '2 hours ago' },
    { id: '3', fullName: 'Vikram Patel', emailOrPhone: 'vikram@example.com', role: 'regular_user', location: 'Kanpur', pincode: '208001', is2FAEnabled: false, createdAt: '2026-04-05', lastLogin: 'Yesterday' },
  ]);

  // Sample Audit Logs
  const [auditLogs] = useState<AuditLog[]>([
    { id: 'l1', userId: '1', userName: 'Abhudaya Pratap Singh', userRole: 'super_admin', action: 'System Config Updated', timestamp: '2026-08-01 13:20', status: 'SUCCESS' },
    { id: 'l2', userId: '2', userName: 'Rahul Sharma', userRole: 'manager', action: 'Failed Admin Access Attempt', timestamp: '2026-08-01 11:15', status: 'WARNING' },
    { id: 'l3', userId: '3', userName: 'Vikram Patel', userRole: 'regular_user', action: 'Password Changed', timestamp: '2026-07-31 18:40', status: 'SUCCESS' },
  ]);

  // Sample Pending Approval Requests
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([
    { id: 'a1', requestedBy: 'Rahul Sharma (Manager)', userRole: 'manager', actionType: 'DELETE_USER', details: 'User account removal request for ID #3', status: 'PENDING', timestamp: '2026-08-01 10:00' },
  ]);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Handle Role Change
  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    alert(`User role updated to ${newRole}`);
  };

  // Handle User Delete
  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  // Approval Handlers
  const handleApproval = (id: string, approve: boolean) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: approve ? 'APPROVED' : 'REJECTED' } : a));
  };

  if (currentUser.role !== 'super_admin' && currentUser.role !== 'SuperAdmin') {
    return (
      <div className="p-8 text-center bg-red-950/40 border border-red-500/30 rounded-2xl text-red-300">
        <ShieldAlert size={48} className="mx-auto mb-3 text-red-500" />
        <h3 className="text-xl font-bold">Access Denied</h3>
        <p className="text-sm mt-1">Super Admin access is available only for high-level administrator accounts.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 max-w-6xl mx-auto shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center pb-5 border-b border-slate-800 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2 text-emerald-400">
            <ShieldCheck size={28} /> Super Admin Security Control Panel
          </h2>
          <p className="text-xs text-slate-400 mt-1">RBAC controls, user role management & system security audit logs</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mt-3 sm:mt-0">
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition ${activeTab === 'USERS' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Users size={16} /> Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition ${activeTab === 'LOGS' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <FileText size={16} /> Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('APPROVALS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition ${activeTab === 'APPROVALS' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <UserCheck size={16} /> Approvals ({approvals.filter(a => a.status === 'PENDING').length})
          </button>
        </div>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'USERS' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <Search size={16} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search user..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Name / Contact</th>
                  <th className="p-3">Current Role</th>
                  <th className="p-3">Location &amp; Pincode</th>
                  <th className="p-3">2FA Status</th>
                  <th className="p-3">Last Login</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users
                  .filter(u => u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || u.emailOrPhone.includes(searchTerm))
                  .map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/40">
                      <td className="p-3">
                        <div className="font-bold text-white">{u.fullName}</div>
                        <div className="text-[11px] text-slate-400">{u.emailOrPhone}</div>
                      </td>
                      <td className="p-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="bg-slate-950 border border-slate-700 rounded-lg p-1 text-xs text-emerald-400 font-semibold focus:outline-none"
                        >
                          <option value="super_admin">👑 Super Admin</option>
                          <option value="admin">🛡️ Admin</option>
                          <option value="manager">💼 Manager</option>
                          <option value="regular_user">👤 Regular User</option>
                        </select>
                      </td>
                      <td className="p-3 text-slate-300">{u.location} ({u.pincode})</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.is2FAEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                          {u.is2FAEnabled ? 'Active (2FA)' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{u.lastLogin}</td>
                      <td className="p-3 text-right">
                        {u.role !== 'super_admin' && u.role !== 'SuperAdmin' && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"
                            title="Delete User"
                          >
                            <Trash2 size={14} />
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

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'LOGS' && (
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Action</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="p-3 text-slate-400">{log.timestamp}</td>
                  <td className="p-3 font-semibold text-white">{log.userName}</td>
                  <td className="p-3 text-emerald-400">{log.userRole}</td>
                  <td className="p-3 text-slate-200">{log.action}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: APPROVAL SYSTEM */}
      {activeTab === 'APPROVALS' && (
        <div className="space-y-3">
          {approvals.map(req => (
            <div key={req.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-400">{req.actionType}</div>
                <div className="text-sm font-semibold text-white mt-0.5">{req.details}</div>
                <div className="text-[11px] text-slate-400 mt-1">Anurodh Karta: {req.requestedBy} • {req.timestamp}</div>
              </div>
              <div>
                {req.status === 'PENDING' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproval(req.id, true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 hover:bg-emerald-400"
                    >
                      <CheckCircle size={14} /> Manzoori Dein
                    </button>
                    <button
                      onClick={() => handleApproval(req.id, false)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 font-bold text-xs flex items-center gap-1 hover:bg-red-500 hover:text-white"
                    >
                      <XCircle size={14} /> Radd Karein
                    </button>
                  </div>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {req.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
