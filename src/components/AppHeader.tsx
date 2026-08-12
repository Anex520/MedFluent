import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, LogOut, LayoutDashboard, History, User, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 group">
      <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
        <HeartPulse className="w-5 h-5 text-white" />
      </div>
      <span className="text-xl font-bold text-slate-800">
        Med<span className="text-primary-600">Fluent</span>
      </span>
    </Link>
  );
}

export function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast('Signed out successfully', 'success');
      navigate('/');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/history', label: 'History', icon: History },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Logo to={user ? '/dashboard' : '/'} />

          {user ? (
            <>
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-primary-700 transition"
                  >
                    <l.icon className="w-4 h-4" />
                    {l.label}
                  </Link>
                ))}
                <button onClick={handleSignOut} className="btn-ghost ml-2">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </nav>
              <button className="md:hidden p-2 text-slate-600" onClick={() => setOpen((o) => !o)}>
                {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="btn-ghost">Sign in</Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </div>
          )}
        </div>

        {open && user && (
          <div className="md:hidden pb-4 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  <l.icon className="w-4 h-4" />
                  {l.label}
                </Link>
              ))}
              <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 text-left">
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </nav>
          </div>
        )}

        {open && !user && (
          <div className="md:hidden pb-4 flex flex-col gap-2 animate-fade-in">
            <Link to="/login" className="btn-secondary w-full">Sign in</Link>
            <Link to="/register" className="btn-primary w-full">Get started</Link>
          </div>
        )}
      </div>
    </header>
  );
}
