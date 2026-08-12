import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Loader2, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Logo } from '@/components/AppHeader';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
            <Logo />
            <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-1">Welcome back</h1>
            <p className="text-sm text-slate-500">Sign in to access your reports</p>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input pl-10" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <div className="flex justify-between text-sm">
              <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700 font-medium">Forgot password?</Link>
              <Link to="/register" className="text-slate-500 hover:text-slate-700">Need an account?</Link>
            </div>
          </form>

          <Link to="/" className="flex items-center justify-center gap-1.5 mt-6 text-sm text-slate-400 hover:text-slate-600">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
