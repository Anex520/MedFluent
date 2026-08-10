import { supabase } from '@/lib/supabase';
import type { Report } from '@/types';

const ANALYZE_REPORT_URL =
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-report`;

const ANALYZE_IMAGE_URL =
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`;

export interface AnalyzeOptions {
  reportText: string;
  language?: string;
  reportId?: string;
}

export interface AnalyzeImageOptions {
  image: string;
  language?: string;
  reportId?: string;
}

async function getAccessToken(): Promise<string> {
  const { data: session } = await supabase.auth.getSession();
  const accessToken = session.session?.access_token;

  if (!accessToken) {
    throw new Error('You must be signed in to analyze a report.');
  }

  return accessToken;
}

export async function analyzeReport({
  reportText,
  language,
  reportId,
}: AnalyzeOptions): Promise<string> {
  const accessToken = await getAccessToken();

  const res = await fetch(ANALYZE_REPORT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      reportText,
      language,
      reportId,
    }),
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;

    try {
      const err = await res.json();
      if (err?.error) {
        detail = err.error;
      }
    } catch {
      // Ignore JSON parsing errors.
    }

    throw new Error(detail);
  }

  const data = await res.json();

  if (!data?.analysis || typeof data.analysis !== 'string') {
    throw new Error(
      'The AI returned an unexpected response. Please try again.'
    );
  }

  return data.analysis;
}

export async function analyzeImage({
  image,
  language,
  reportId,
}: AnalyzeImageOptions): Promise<string> {
  const accessToken = await getAccessToken();

  const res = await fetch(ANALYZE_IMAGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      image,
      language,
      reportId,
    }),
  });

  if (!res.ok) {
    let detail = `Image analysis failed (${res.status})`;

    try {
      const err = await res.json();
      if (err?.error) {
        detail = err.error;
      }
    } catch {
      // Ignore JSON parsing errors.
    }

    throw new Error(detail);
  }

  const data = await res.json();

  if (!data?.analysis || typeof data.analysis !== 'string') {
    throw new Error(
      'The AI returned an unexpected response. Please try again.'
    );
  }

  return data.analysis;
}

export async function saveReport(text: string): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      original_text: text,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Report;
}

export async function updateReportAiResponse(
  id: string,
  aiResponse: string
): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .update({
      ai_response: aiResponse,
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select(
      'id, user_id, original_text, ai_response, created_at'
    )
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Report[];
}

export async function deleteReport(id: string): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}