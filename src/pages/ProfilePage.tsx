import { useState } from 'react';
import { Check, Loader2, User as UserIcon, Calendar, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { SUPPORTED_LANGUAGES } from '@/types';

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [age, setAge] = useState(profile?.age?.toString() ?? '');
  const [language, setLanguage] = useState(profile?.preferred_language ?? 'English');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName || null,
        age: age ? parseInt(age, 10) : null,
        preferred_language: language,
      });
      if (error) throw new Error(error.message);
      await refreshProfile();
      toast('Profile updated successfully.', 'success');
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Your profile</h1>
        <p className="text-sm text-slate-500 mb-6">Manage your personal information and preferences.</p>

        <div className="card p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white text-xl font-bold">
              {(fullName || user?.email || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{fullName || 'Your name'}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="label">Full name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Age (optional)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="number" min="0" max="150" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Not set" className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Preferred explanation language</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input pl-10">
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">The AI will respond in this language when possible.</p>
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
