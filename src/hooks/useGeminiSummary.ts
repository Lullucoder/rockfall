import { useCallback, useState } from 'react';
import { summarizeAlerts, summarizeSensorData, summarizeImage } from '../ai/geminiService';

interface UseGeminiSummaryOptions {
  mode: 'alerts' | 'sensors' | 'image';
}

export function useGeminiSummary({ mode }: UseGeminiSummaryOptions) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (data: any, extra?: any) => {
    setLoading(true);
    setError(null);
    try {
      let text: string;
      if (mode === 'alerts') {
        text = await summarizeAlerts(data);
      } else if (mode === 'sensors') {
        text = await summarizeSensorData(data.series, data.risk);
      } else {
        text = await summarizeImage(extra.file);
      }
      setSummary(text);
    } catch (e: any) {
      setError(e.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  return { loading, summary, error, generate };
}
