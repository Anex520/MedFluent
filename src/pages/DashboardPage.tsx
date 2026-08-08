import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Clock, FileText, Loader2, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { UploadCard } from '@/components/UploadCard';
import { AnalysisView } from '@/components/AnalysisView';
import { EmptyState } from '@/components/ui';
import { analyzeReport, fetchReports, saveReport } from '@/lib/ai';
import type { Report } from '@/types';

export function DashboardPage() {
  const { user, profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const data = await fetchReports();
      setReports(data);
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setLoadingReports(false);
    }
  }, [toast]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleAnalyze = async (text: string) => {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const report = await saveReport(text);
      const result = await analyzeReport({
        reportText: text,
        language: profile?.preferred_language,
        reportId: report.id,
      });
      setAnalysis(result);
      toast('Analysis complete!', 'success');
      loadReports();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const stats = {
    total: reports.length,
    analyzed: reports.filter((r) => r.ai_response).length,
    thisWeek: reports.filter((r) => {
      const d = new Date(r.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d > weekAgo;
    }).length,
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-teal-600 p-6 sm:p-8 mb-8 animate-fade-in-up">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-primary-100 text-sm mb-1">Welcome back,</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{firstName} 👋</h1>
              <p className="text-primary-100 text-sm mt-2">Upload a medical report and let MedFluent explain it in plain language.</p>
            </div>
            <button onClick={() => navigate('/history')} className="bg-white/15 hover:bg-white/25 text-white font-medium px-4 py-2.5 rounded-xl backdrop-blur-sm transition flex items-center gap-2 self-start">
              <Clock className="w-4 h-4" /> View history
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard icon={FileText} label="Total reports" value={stats.total} color="primary" />
          <StatCard icon={Sparkles} label="Analyzed" value={stats.analyzed} color="teal" />
          <StatCard icon={TrendingUp} label="This week" value={stats.thisWeek} color="emerald" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: upload + analysis */}
          <div className="space-y-6">
            <UploadCard onAnalyze={handleAnalyze} analyzing={analyzing} />

            {analyzing && (
              <div className="card p-8 text-center animate-fade-in">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">Analyzing your report…</p>
                <p className="text-xs text-slate-400 mt-1">This may take a few seconds.</p>
              </div>
            )}

            {analysis && !analyzing && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-500" /> Your Analysis
                </h2>
                <AnalysisView markdown={analysis} />
              </div>
            )}
          </div>

          {/* Right: recent reports */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" /> Recent reports
              </h2>
              {reports.length > 0 && (
                <Link to="/history" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all</Link>
              )}
            </div>

            {loadingReports ? (
              <div className="card p-8 text-center">
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin mx-auto" />
              </div>
            ) : reports.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-7 h-7" />}
                title="No reports yet"
                description="Upload your first medical report to get a plain-language explanation."
                action={
                  <button onClick={() => navigate('/dashboard')} className="btn-secondary mt-2">
                    <Plus className="w-4 h-4" /> Upload a report
                  </button>
                }
              />
            ) : (
              <div className="space-y-3">
                {reports.slice(0, 5).map((r) => (
                  <Link
                    key={r.id}
                    to={`/history?id=${r.id}`}
                    className="card p-4 flex items-start gap-3 hover:shadow-soft-lg hover:border-primary-100 transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.ai_response ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {r.ai_response ? <Sparkles className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate group-hover:text-primary-700 transition">
                        {r.original_text.slice(0, 80)}…
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(r.created_at).toLocaleDateString()} · {r.ai_response ? 'Analyzed' : 'Pending'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof FileText; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    teal: 'bg-teal-50 text-teal-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <div className="card p-4 sm:p-5 animate-fade-in-up">
      <div className={`w-9 h-9 rounded-lg ${colors[color]} flex items-center justify-center mb-2`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
