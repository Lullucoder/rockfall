import React, { useEffect, useState } from 'react';
import { useGeminiSummary } from '../hooks/useGeminiSummary';

interface Props {
  alerts?: any[];
  sensorUrl?: string;
}

export const AISummaryPanel: React.FC<Props> = ({ alerts, sensorUrl = '/data/sensor_timeseries.json' }) => {
  const [sensorData, setSensorData] = useState<any>(null);
  const { loading, summary, error, generate } = useGeminiSummary({ mode: alerts ? 'alerts' : 'sensors' });

  useEffect(() => {
    if (!alerts) {
      fetch(sensorUrl)
        .then(r => r.json())
        .then(json => {
          setSensorData({
            series: json.series ?? json,
            risk: json.risk_calculations ?? []
          });
        })
        .catch(e => console.error('Failed loading sensor data', e));
    }
  }, [alerts, sensorUrl]);

  const handleGenerate = () => {
    if (alerts) generate(alerts);
    else if (sensorData) generate(sensorData);
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm">AI Summary (Gemini)</h3>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="text-xs px-3 py-1 rounded bg-navy-600 text-white hover:bg-navy-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>
      {error && <div className="text-xs text-red-600">{error}</div>}
      {summary && (
        <div className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
          {summary}
        </div>
      )}
      {!summary && !loading && (
        <p className="text-xs text-gray-400">Press Generate to create a concise risk summary.</p>
      )}
    </div>
  );
};
