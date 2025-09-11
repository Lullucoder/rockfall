import React, { useState, useEffect } from 'react';
import { Brain, Thermometer, Cloud, Activity, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { comprehensiveRiskAnalysis } from '../ai/geminiService';

interface ComprehensiveRiskAnalysisProps {
  sensorData?: any[];
  onAnalysisComplete?: (result: string) => void;
}

export const ComprehensiveRiskAnalysis: React.FC<ComprehensiveRiskAnalysisProps> = ({ 
  sensorData, 
  onAnalysisComplete 
}) => {
  const [environmentalData, setEnvironmentalData] = useState({
    temperature: '',
    rainfall: '',
    windSpeed: '',
    humidity: '',
    visibility: 'good'
  });

  const [weatherData, setWeatherData] = useState({
    recentRain: '',
    freezeThaw: '0',
    lastStorm: '',
    forecast: 'stable'
  });

  const [elevationNotes, setElevationNotes] = useState('');
  const [imageAnalysisResults, setImageAnalysisResults] = useState('');
  const [additionalFactors, setAdditionalFactors] = useState({
    recentBlasting: false,
    equipmentVibration: false,
    previousFailures: false,
    accessRoads: 'safe'
  });

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [mockSensorData, setMockSensorData] = useState<any[]>([]);

  // Load mock sensor data if none provided
  useEffect(() => {
    if (!sensorData) {
      fetch('/data/sensor_timeseries.json')
        .then(res => res.json())
        .then(data => {
          setMockSensorData(data.series || []);
        })
        .catch(console.error);
    }
  }, [sensorData]);

  const handleEnvironmentalChange = (field: string, value: string) => {
    setEnvironmentalData(prev => ({ ...prev, [field]: value }));
  };

  const handleWeatherChange = (field: string, value: string) => {
    setWeatherData(prev => ({ ...prev, [field]: value }));
  };

  const handleAdditionalFactorChange = (field: string, value: boolean | string) => {
    setAdditionalFactors(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const analysisData = {
        sensorData: sensorData || mockSensorData,
        environmentalData: {
          ...environmentalData,
          temperature: parseFloat(environmentalData.temperature) || 20,
          rainfall: parseFloat(environmentalData.rainfall) || 0,
          windSpeed: parseFloat(environmentalData.windSpeed) || 10
        },
        elevationData: elevationNotes ? { notes: elevationNotes } : undefined,
        imageAnalysis: imageAnalysisResults || undefined,
        weatherData: {
          ...weatherData,
          recentRain: parseFloat(weatherData.recentRain) || 0,
          freezeThaw: parseInt(weatherData.freezeThaw) || 0
        },
        additionalFactors
      };

  const result = await comprehensiveRiskAnalysis(analysisData);
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (err: any) {
      setError(err.message || 'Comprehensive analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('critical')) return 'critical';
    if (lower.includes('high')) return 'high';
    if (lower.includes('moderate') || lower.includes('medium')) return 'moderate';
    return 'low';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-danger-600 bg-danger-50 border-danger-200';
      case 'high': return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-safe-600 bg-safe-50 border-safe-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-navy-100 rounded-lg">
          <Brain className="w-6 h-6 text-navy-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Comprehensive Risk Analysis</h3>
          <p className="text-sm text-gray-600">Multi-source data integration for complete assessment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Environmental Conditions */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Thermometer className="w-5 h-5 text-orange-600" />
            <h4 className="font-medium text-gray-900">Environmental Conditions</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Temperature (°C)</label>
              <input
                type="number"
                value={environmentalData.temperature}
                onChange={(e) => handleEnvironmentalChange('temperature', e.target.value)}
                placeholder="25"
                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-navy-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rainfall (mm)</label>
              <input
                type="number"
                value={environmentalData.rainfall}
                onChange={(e) => handleEnvironmentalChange('rainfall', e.target.value)}
                placeholder="0"
                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-navy-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Wind Speed (km/h)</label>
              <input
                type="number"
                value={environmentalData.windSpeed}
                onChange={(e) => handleEnvironmentalChange('windSpeed', e.target.value)}
                placeholder="15"
                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-navy-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Visibility</label>
              <select
                value={environmentalData.visibility}
                onChange={(e) => handleEnvironmentalChange('visibility', e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-navy-500"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Weather Impact */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Weather Impact</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Recent Rain (72h mm)</label>
              <input
                type="number"
                value={weatherData.recentRain}
                onChange={(e) => handleWeatherChange('recentRain', e.target.value)}
                placeholder="0"
                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-navy-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Freeze-Thaw Cycles</label>
              <input
                type="number"
                value={weatherData.freezeThaw}
                onChange={(e) => handleWeatherChange('freezeThaw', e.target.value)}
                placeholder="0"
                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-navy-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Weather Forecast</label>
              <select
                value={weatherData.forecast}
                onChange={(e) => handleWeatherChange('forecast', e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-navy-500"
              >
                <option value="stable">Stable</option>
                <option value="deteriorating">Deteriorating</option>
                <option value="storm">Storm Expected</option>
                <option value="improving">Improving</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Data Inputs */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-gray-900">Additional Data Sources</h4>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Elevation/Topographic Notes
            </label>
            <textarea
              value={elevationNotes}
              onChange={(e) => setElevationNotes(e.target.value)}
              placeholder="Paste elevation analysis results or topographic observations..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Analysis Results
            </label>
            <textarea
              value={imageAnalysisResults}
              onChange={(e) => setImageAnalysisResults(e.target.value)}
              placeholder="Paste image analysis results or visual observations..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            />
          </div>
        </div>
      </div>

      {/* Additional Risk Factors */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Additional Risk Factors</h4>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={additionalFactors.recentBlasting}
              onChange={(e) => handleAdditionalFactorChange('recentBlasting', e.target.checked)}
              className="text-navy-600"
            />
            <span className="text-sm">Recent Blasting</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={additionalFactors.equipmentVibration}
              onChange={(e) => handleAdditionalFactorChange('equipmentVibration', e.target.checked)}
              className="text-navy-600"
            />
            <span className="text-sm">Equipment Vibration</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={additionalFactors.previousFailures}
              onChange={(e) => handleAdditionalFactorChange('previousFailures', e.target.checked)}
              className="text-navy-600"
            />
            <span className="text-sm">Previous Failures</span>
          </label>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Access Roads</label>
            <select
              value={additionalFactors.accessRoads}
              onChange={(e) => handleAdditionalFactorChange('accessRoads', e.target.value)}
              className="w-full p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-navy-500"
            >
              <option value="safe">Safe</option>
              <option value="at-risk">At Risk</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sensor Data Status */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Sensor Data: {(sensorData || mockSensorData).length} sources available
          </span>
          <span className="text-xs text-gray-500">
            Including displacement, strain, and environmental sensors
          </span>
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full py-3 px-4 bg-navy-600 text-white rounded-lg hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing Comprehensive Analysis...</span>
          </>
        ) : (
          <>
            <Brain className="w-4 h-4" />
            <span>Generate Comprehensive Risk Assessment</span>
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-safe-600" />
              <h4 className="font-semibold text-gray-900">Comprehensive Assessment Complete</h4>
            </div>
            
            {/* Risk Level Badge */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(getRiskLevel(analysis))}`}>
              Overall Risk: {getRiskLevel(analysis).toUpperCase()}
            </div>
          </div>
          
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                {analysis}
              </pre>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => navigator.clipboard.writeText(analysis)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Copy Assessment
            </button>
            <button
              onClick={() => {
                const timestamp = new Date().toISOString().split('T')[0];
                const blob = new Blob([analysis], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `comprehensive-risk-assessment-${timestamp}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-navy-100 text-navy-700 rounded-lg hover:bg-navy-200 text-sm"
            >
              Download Report
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
            >
              Print Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
