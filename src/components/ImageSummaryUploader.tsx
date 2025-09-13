import React, { useState, useEffect } from 'react';
import { useGeminiSummary } from '../hooks/useGeminiSummary';

function formatAge(ts: number) {
  const ageMs = Date.now() - ts;
  const mins = Math.floor(ageMs / 60000);
  if (mins < 1) return '<1m ago';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  return hrs + 'h ago';
}

export const ImageSummaryUploader: React.FC = () => {
  const { loading, summary, error, generate } = useGeminiSummary({ mode: 'image' });
  const [file, setFile] = useState<File | null>(null);

  const [usedCache, setUsedCache] = useState(false);
  const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setUsedCache(false);
    }
  };

  useEffect(() => {
    if (file) {
      generate(null, { file });
      setLastTimestamp(Date.now());
      const start = performance.now();
      const timeout = setTimeout(() => {
        if (performance.now() - start < 160) setUsedCache(true);
      }, 170);
      return () => clearTimeout(timeout);
    }
  }, [file, generate]);

  const onGenerate = () => {
    if (file) {
      generate(null, { file });
      setLastTimestamp(Date.now());
    }
  };

  const onForceRefresh = () => {
    if (file) {
      setUsedCache(false);
      generate(null, { file, force: true });
      setLastTimestamp(Date.now());
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
      <h3 className="font-semibold text-sm text-gray-800">Image Risk Note</h3>
      <input type="file" accept="image/*" onChange={onChange} className="text-xs" />
      <div className="flex items-center space-x-2">
        <button
          onClick={onGenerate}
          disabled={!file || loading}
          className="text-xs px-3 py-1 rounded bg-navy-600 text-white hover:bg-navy-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Re-Analyze'}
        </button>
        <button
          onClick={onForceRefresh}
          disabled={!file || loading}
          className="text-xs px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          Force Fresh
        </button>
        {usedCache && !loading && summary && (
          <span className="text-[10px] text-gray-400">(cached)</span>
        )}
        {lastTimestamp && !loading && (
          <span className="text-[10px] text-gray-400">{formatAge(lastTimestamp)}</span>
        )}
      </div>
      {error && <div className="text-xs text-red-600">{error}</div>}
      {summary && <div className="text-xs text-gray-700 whitespace-pre-line">{summary}</div>}
    </div>
  );
};
