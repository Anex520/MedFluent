import { useCallback, useRef, useState } from 'react';
import { FileText, Upload, Type, X, FileCheck2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { uploadReportFile } from '@/lib/ai';

type Mode = 'idle' | 'text';

interface UploadCardProps {
  onAnalyze: (text: string) => void;
  analyzing: boolean;
}

export function UploadCard({ onAnalyze, analyzing }: UploadCardProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState<Mode>('idle');
  const [text, setText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setMode('idle');
    setText('');
    setFileName(null);
    setExtractedText(null);
    setUploadProgress(0);
  };

  const handleFile = useCallback(async (file: File) => {
    if (!user) return;
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'text/plain'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|png|jpe?g|webp|txt)$/i)) {
      toast('Please upload a PDF, image, or text file.', 'error');
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    setFileName(file.name);

    try {
      // Simulate progress while uploading to storage
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 15, 85));
      }, 200);

      await uploadReportFile(file, user.id);
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Extract text: for text files, read directly. For PDFs/images, read as text placeholder.
      let extracted = '';
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        extracted = await file.text();
      } else {
        // For PDFs and images we can't extract text client-side without heavy deps.
        // We store the file and ask the user to paste the relevant text.
        toast('File uploaded. Please paste the text from your report below to analyze it.', 'info');
        setMode('text');
        setUploading(false);
        return;
      }

      if (extracted.trim()) {
        setExtractedText(extracted);
        setText(extracted);
        setMode('text');
        toast('File uploaded and text extracted.', 'success');
      } else {
        toast('The file appears to be empty. Please paste the text manually.', 'info');
        setMode('text');
      }
    } catch (e) {
      toast((e as Error).message, 'error');
      setFileName(null);
    } finally {
      setUploading(false);
    }
  }, [user, toast]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleSubmit = () => {
    const finalText = text.trim() || extractedText?.trim();
    if (!finalText) {
      toast('Please enter some text to analyze.', 'error');
      return;
    }
    if (finalText.length < 20) {
      toast('Please enter at least a few sentences for a meaningful analysis.', 'error');
      return;
    }
    onAnalyze(finalText);
  };

  return (
    <div className="card p-6 sm:p-8 animate-fade-in-up">
      {/* Mode tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setMode('idle')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'idle' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'}`}
        >
          <Upload className="w-4 h-4" /> Upload
        </button>
        <button
          onClick={() => setMode('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'text' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'}`}
        >
          <Type className="w-4 h-4" /> Paste Text
        </button>
      </div>

      {mode === 'idle' && !uploading && !fileName && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all ${dragOver ? 'border-primary-400 bg-primary-50 scale-[1.01]' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'}`}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Drop your medical report here</h3>
          <p className="text-sm text-slate-500 mb-4">PDF, PNG, JPG, or text file</p>
          <button className="btn-primary">Browse files</button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,application/pdf,image/*,text/plain"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>
      )}

      {uploading && (
        <div className="border-2 border-dashed rounded-2xl p-10 text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-700 mb-3">Uploading {fileName}…</p>
          <div className="max-w-xs mx-auto bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-500 to-teal-500 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">{uploadProgress}%</p>
        </div>
      )}

      {mode === 'text' && (
        <div className="animate-fade-in">
          {fileName && !uploading && (
            <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
              <FileCheck2 className="w-4 h-4" />
              <span className="flex-1 truncate">{fileName} uploaded</span>
              <button onClick={() => setFileName(null)} className="text-emerald-600 hover:text-emerald-800"><X className="w-4 h-4" /></button>
            </div>
          )}
          <label className="label">Paste your medical report text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder="Paste the text of your medical report here. For example: lab results, discharge summaries, radiology reports, etc."
            className="input resize-y font-mono text-xs leading-relaxed"
          />
          <p className="text-xs text-slate-400 mt-1.5">{text.length} characters</p>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit} disabled={analyzing} className="btn-primary flex-1">
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {analyzing ? 'Analyzing…' : 'Analyze Report'}
            </button>
            <button onClick={reset} className="btn-ghost">Clear</button>
          </div>
        </div>
      )}

      {mode === 'idle' && !uploading && fileName && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
            <FileCheck2 className="w-4 h-4" />
            <span className="flex-1 truncate">{fileName} uploaded</span>
          </div>
          <p className="text-sm text-slate-600 mb-3">Now paste the text content from your report to analyze it.</p>
          <button onClick={() => setMode('text')} className="btn-secondary"><Type className="w-4 h-4" /> Paste text to analyze</button>
        </div>
      )}
    </div>
  );
}
