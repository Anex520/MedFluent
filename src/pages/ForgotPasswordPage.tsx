import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Logo } from '@/components/AppHeader';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast('Password reset link sent. Check your email.', 'success');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-primary-50">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
            <Logo />
            <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-1">Reset your password</h1>
            <p className="text-sm text-slate-500">We'll send you a reset link</p>
          </div>

          {sent ? (
            <div className="card p-8 text-center animate-scale-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Check your email</h2>
              <p className="text-sm text-slate-500 mb-6">We sent a password reset link to {email}. Follow the link to set a new password.</p>
              <Link to="/login" className="btn-primary w-full">Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input pl-10" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}

          <Link to="/login" className="flex items-center justify-center gap-1.5 mt-6 text-sm text-slate-400 hover:text-slate-600">
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
