import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import api from '../../services/api';
import {
  ArrowLeft,
  Plus,
  User,
  Mail,
  Lock,
  UserCheck,
  Loader2,
  AlertTriangle,
  UserPlus,
  CheckCircle,
  Copy,
  Users,
} from 'lucide-react';

interface StaffUser {
  id: string;
  displayId: string;
  name: string;
  email: string;
  role: 'doctor' | 'therapist' | 'receptionist' | 'admin';
}

export function ManageStaff() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ name: string; email: string; tempPassword?: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'therapist',
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const fetchStaff = async () => {
    setLoadingList(true);
    try {
      const { data } = await api.get('/staff');
      setStaffList(data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch staff directory:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessData(null);

    if (!formData.name.trim()) return setError('Name is required.');
    if (!formData.email.trim() || !formData.email.includes('@')) return setError('Valid email is required.');
    if (!formData.password || formData.password.length < 6) return setError('Password must be at least 6 characters.');

    setSubmitting(true);
    try {
      const response = await api.post('/staff/create', formData);
      setSuccessData({
        name: response.data.data.name,
        email: response.data.data.email,
        tempPassword: response.data.data.tempPassword,
      });
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'therapist',
      });
      fetchStaff();
      // Keep form open but show success block
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to create staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'doctor':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900';
      case 'therapist':
      case 'nurse':
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900';
      case 'receptionist':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800';
    }
  };

  return (
    <div className="flex flex-col h-full font-sans bg-[#E8E9F1] dark:bg-slate-950">
      {/* Header */}
      <div className="px-5 pb-5 shrink-0 relative overflow-hidden pt-7 bg-gradient-to-br from-[#262842] to-[#3B3E66] dark:from-slate-900 dark:to-slate-800 shadow-[0_4px_24px_rgba(38,40,66,0.15)] dark:shadow-none">
        <div className="absolute -right-16 -top-16 rounded-full opacity-10 w-[200px] h-[200px] bg-white pointer-events-none" />
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <button
            onClick={() => navigate('/doctor')}
            className="flex items-center justify-center rounded-xl w-9 h-9 bg-white/15 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-[19px] font-extrabold text-white tracking-[-0.5px]">Manage Staff</h1>
            <p className="text-[11px] text-white/70">Create accounts and manage credentials</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setSuccessData(null);
              setError(null);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-colors"
          >
            <Plus size={14} /> Add Staff Account
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-4xl mx-auto w-full">
        {showAddForm && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-6">
            <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-white mb-4">
              Add New Staff Account
            </h2>

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-start gap-2.5 text-xs font-bold mb-4 border border-rose-100 dark:border-rose-900/50">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successData && (
              <div className="p-5 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 rounded-2xl mb-4 text-slate-800 dark:text-slate-100">
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold mb-3 text-sm">
                  <CheckCircle size={18} />
                  <span>Staff Account Created Successfully</span>
                </div>
                <div className="space-y-2 text-xs font-medium">
                  <p>
                    <strong>Name:</strong> {successData.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {successData.email}
                  </p>
                  {successData.tempPassword && (
                    <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-teal-100 dark:border-teal-900/50 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
                          Temporary Password
                        </p>
                        <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">
                          {successData.tempPassword}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(successData.tempPassword!)}
                        className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:opacity-80 transition-opacity"
                        title="Copy to Clipboard"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  )}
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-3">
                    ⚠️ Share this temporary password securely. It will not be displayed again.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. John Doe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100"
                    />
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. johndoe@clinic.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100"
                    />
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    Temporary Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type="text"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Temporary password (min 6 chars)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100"
                    />
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100 appearance-none"
                    >
                      <option value="therapist">Therapist</option>
                      <option value="doctor">Doctor</option>
                      <option value="receptionist">Receptionist</option>
                    </select>
                    <UserCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 shadow-md shadow-indigo-600/10 disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <UserPlus size={14} />
                  )}
                  Create Account
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Staff Directory */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-indigo-600 dark:text-teal-400" />
            <h2 className="text-[15px] font-black text-slate-900 dark:text-white">Staff Directory</h2>
          </div>

          {loadingList ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
          ) : staffList.length === 0 ? (
            <p className="text-sm text-slate-400 italic text-center py-6">No staff accounts found.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {staffList.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {item.displayId}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getRoleBadge(item.role)}`}>
                      {item.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav role="doctor" />
    </div>
  );
}
