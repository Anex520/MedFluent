import { useNavigate } from 'react-router-dom';
import { Bell, Globe, LogOut, Shield, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function SettingsPage() {
  const { user, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      toast('Signed out successfully.', 'success');
      navigate('/');
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Settings</h1>
        <p className="text-sm text-slate-500 mb-6">Manage your account and preferences.</p>

        {/* Account */}
        <div className="card p-6 mb-4">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-500" /> Account
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-slate-800">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-slate-500">Name</span>
              <span className="font-medium text-slate-800">{profile?.full_name || 'Not set'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">Preferred language</span>
              <span className="font-medium text-slate-800">{profile?.preferred_language || 'English'}</span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card p-6 mb-4">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-500" /> Preferences
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-700">Explanation language</p>
                <p className="text-xs text-slate-400">Change this in your profile settings.</p>
              </div>
              <button onClick={() => navigate('/profile')} className="btn-secondary text-xs px-3 py-1.5">
                <Globe className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          </div>
        </div>

        {/* Data & privacy */}
        <div className="card p-6 mb-4">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-500" /> Data & Privacy
          </h2>
          <p className="text-sm text-slate-500 mb-3">Your reports are protected by row-level security. Only you can access them.</p>
          <p className="text-xs text-slate-400">To delete all your data, delete your reports from the History page and contact support to delete your account.</p>
        </div>

        {/* Sign out */}
        <button onClick={handleSignOut} disabled={signingOut} className="btn-danger w-full">
          <LogOut className="w-4 h-4" />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}
