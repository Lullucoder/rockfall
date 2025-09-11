import React, { useState } from 'react';
import { useGeminiSummary } from '../hooks/useGeminiSummary';

export const ImageSummaryUploader: React.FC = () => {
  const { loading, summary, error, generate } = useGeminiSummary({ mode: 'image' });
  const [file, setFile] = useState<File | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const onGenerate = () => {
    if (file) generate(null, { file });
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
      <h3 className="font-semibold text-sm text-gray-800">Image Risk Note</h3>
      <input type="file" accept="image/*" onChange={onChange} className="text-xs" />
      <button
        onClick={onGenerate}
        disabled={!file || loading}
        className="text-xs px-3 py-1 rounded bg-navy-600 text-white hover:bg-navy-700 disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
      {error && <div className="text-xs text-red-600">{error}</div>}
      {summary && <div className="text-xs text-gray-700 whitespace-pre-line">{summary}</div>}
    </div>
  );
};
