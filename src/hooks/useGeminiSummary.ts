import { useCallback, useState } from 'react';
import { summarizeAlerts, summarizeSensorData, summarizeImage, comprehensiveRiskAnalysis } from '../ai/geminiService';

interface UseGeminiSummaryOptions {
  mode: 'alerts' | 'sensors' | 'image' | 'comprehensive';
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
      } else if (mode === 'image') {
        text = await summarizeImage(extra.file);
      } else {
        // comprehensive
        text = await comprehensiveRiskAnalysis(data);
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
