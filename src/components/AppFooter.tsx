import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MedFluent</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              MedFluent helps you understand medical reports in plain language. It is for educational purposes only
              and is not a substitute for professional medical advice.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/dashboard" className="hover:text-primary-400 transition">Dashboard</Link></li>
              <li><Link to="/history" className="hover:text-primary-400 transition">History</Link></li>
              <li><Link to="/settings" className="hover:text-primary-400 transition">Settings</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Trusted Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://medlineplus.gov" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition">MedlinePlus</a></li>
              <li><a href="https://www.who.int" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition">WHO</a></li>
              <li><a href="https://www.heart.org" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition">American Heart Association</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} MedFluent. For educational purposes only.</p>
          <p className="text-xs text-slate-500">Not a substitute for professional medical advice.</p>
        </div>
      </div>
    </footer>
  );
}
