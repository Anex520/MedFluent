import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Clock, FileText, Loader2, Search, Sparkles, Trash2, X, ArrowLeft } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { deleteReport, fetchReports } from '@/lib/ai';
import { AnalysisView } from '@/components/AnalysisView';
import { EmptyState } from '@/components/ui';
import type { Report } from '@/types';

export function HistoryPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('id');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchReports();
      setReports(data);
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = reports.filter((r) =>
    r.original_text.toLowerCase().includes(search.toLowerCase()) ||
    (r.ai_response?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const selected = reports.find((r) => r.id === selectedId) ?? null;

  const handleDelete = async (id: string) => {
    try {
      await deleteReport(id);
      toast('Report deleted.', 'success');
      setReports((r) => r.filter((x) => x.id !== id));
      if (selectedId === id) setSearchParams({});
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (selected) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button onClick={() => setSearchParams({})} className="btn-ghost mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to history
          </button>
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500">{new Date(selected.created_at).toLocaleString()}</span>
              </div>
              <button
                onClick={() => setConfirmDelete(selected.id)}
                className="text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Original report text</h3>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600 max-h-48 overflow-y-auto whitespace-pre-line font-mono text-xs leading-relaxed">
              {selected.original_text}
            </div>
          </div>

          {selected.ai_response ? (
            <AnalysisView markdown={selected.ai_response} />
          ) : (
            <EmptyState
              icon={<Sparkles className="w-7 h-7" />}
              title="No analysis yet"
              description="This report has not been analyzed. Return to the dashboard to analyze a new report."
              action={<Link to="/dashboard" className="btn-primary mt-2">Go to dashboard</Link>}
            />
          )}

          {confirmDelete === selected.id && (
            <DeleteConfirm onCancel={() => setConfirmDelete(null)} onConfirm={() => handleDelete(selected.id)} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Report history</h1>
            <p className="text-sm text-slate-500 mt-1">View, search, and re-open your past analyses.</p>
          </div>
          <Link to="/dashboard" className="btn-secondary self-start">
            <FileText className="w-4 h-4" /> New report
          </Link>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports by content…"
            className="input pl-10"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-7 h-7" />}
            title={search ? "No matching reports" : "No reports yet"}
            description={search ? "Try a different search term." : "Upload your first medical report from the dashboard."}
            action={!search ? <Link to="/dashboard" className="btn-primary mt-2">Go to dashboard</Link> : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="card p-4 flex items-start gap-3 hover:shadow-soft-lg hover:border-primary-100 transition-all animate-fade-in-up">
                <button
                  onClick={() => setSearchParams({ id: r.id })}
                  className="flex items-start gap-3 flex-1 text-left min-w-0"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.ai_response ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {r.ai_response ? <Sparkles className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 line-clamp-2">{r.original_text.slice(0, 120)}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.ai_response ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {r.ai_response ? 'Analyzed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setConfirmDelete(r.id)}
                  className="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50 transition shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {confirmDelete && (
          <DeleteConfirm
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => handleDelete(confirmDelete)}
          />
        )}
      </div>
    </div>
  );
}

function DeleteConfirm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-scale-in">
        <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6 text-rose-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Delete this report?</h3>
        <p className="text-sm text-slate-500 mb-6">This action cannot be undone. The report and its analysis will be permanently removed.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-ghost flex-1">Cancel</button>
          <button onClick={onConfirm} className="btn-danger flex-1">Delete</button>
        </div>
      </div>
    </div>
  );
}
