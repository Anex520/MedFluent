import { AlertTriangle, BookOpen, ClipboardList, FileText, HelpCircle, Info, Link2, Stethoscope } from 'lucide-react';
import { parseAnalysis } from '@/lib/parseAnalysis';
import { DISCLAIMER_TEXT } from '@/types';

const SECTION_ICONS: Record<string, typeof FileText> = {
  Summary: FileText,
  'Plain Language Explanation': Stethoscope,
  'Medical Terms': BookOpen,
  'Questions To Ask Your Doctor': HelpCircle,
  'Learn More': Link2,
  Disclaimer: AlertTriangle,
};

const SECTION_STYLES: Record<string, string> = {
  Summary: 'border-primary-100 bg-primary-50/50',
  'Plain Language Explanation': 'border-teal-100 bg-teal-50/50',
  'Medical Terms': 'border-amber-100 bg-amber-50/40',
  'Questions To Ask Your Doctor': 'border-violet-100 bg-violet-50/40',
  'Learn More': 'border-sky-100 bg-sky-50/40',
  Disclaimer: 'border-rose-100 bg-rose-50/50',
};

export function AnalysisView({ markdown }: { markdown: string }) {
  const sections = parseAnalysis(markdown);

  return (
    <div className="space-y-4 animate-fade-in">
      {sections.map((section, idx) => {
        const Icon = SECTION_ICONS[section.heading] || ClipboardList;
        const style = SECTION_STYLES[section.heading] || 'border-slate-100 bg-white';

        if (section.heading === 'Disclaimer') {
          return (
            <div key={idx} className="rounded-2xl border border-rose-200 bg-rose-50 p-5 flex gap-3 animate-fade-in-up">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-rose-900 mb-1">Disclaimer</h3>
                <p className="text-sm text-rose-700 leading-relaxed">{section.body || DISCLAIMER_TEXT}</p>
              </div>
            </div>
          );
        }

        return (
          <div key={idx} className={`rounded-2xl border p-5 sm:p-6 ${style} animate-fade-in-up`} style={{ animationDelay: `${idx * 60}ms` }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                <Icon className="w-4 h-4 text-slate-700" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">{section.heading}</h3>
            </div>

            {section.items ? (
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 shrink-0" />
                    <span>{renderLinks(item)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{renderLinks(section.body)}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function renderLinks(text: string): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(\[.+?\]\(https?:\/\/.+?\))/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[(.+?)\]\((https?:\/\/.+?)\)$/);
    if (match) {
      return (
        <a
          key={i}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:text-primary-700 underline underline-offset-2 inline-flex items-center gap-0.5"
        >
          {match[1]}
          <Info className="w-3 h-3" />
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
