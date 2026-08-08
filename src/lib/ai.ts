import { supabase } from '@/lib/supabase';
import type { Report } from '@/types';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-report`;

export interface AnalyzeOptions {
  reportText: string;
  language?: string;
  reportId?: string;
}

export async function analyzeReport({ reportText, language, reportId }: AnalyzeOptions): Promise<string> {
  const { data: session } = await supabase.auth.getSession();
  const accessToken = session.session?.access_token;
  if (!accessToken) throw new Error('You must be signed in to analyze a report.');

  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ reportText, language, reportId }),
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const err = await res.json();
      if (err?.error) detail = err.error;
    } catch {
      // ignore parse error
    }
    throw new Error(detail);
  }

  const data = await res.json();
  if (!data?.analysis || typeof data.analysis !== 'string') {
    throw new Error('The AI returned an unexpected response. Please try again.');
  }
  return data.analysis as string;
}

export async function saveReport(text: string): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .insert({ original_text: text })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Report;
}

export async function updateReportAiResponse(id: string, aiResponse: string): Promise<void> {
  const { error } = await supabase.from('reports').update({ ai_response: aiResponse }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function fetchReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('id, user_id, original_text, ai_response, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Report[];
}

export async function deleteReport(id: string): Promise<void> {
  const { error } = await supabase.from('reports').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function uploadReportFile(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('reports').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}
