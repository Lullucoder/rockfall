import React, { useState } from 'react';
import { Mountain, Upload, FileText, Loader2, BarChart3, AlertCircle } from 'lucide-react';
import { analyzeElevationData } from '../ai/geminiService';

interface ElevationDataInputProps {
  onAnalysisComplete?: (result: string) => void;
}

export const ElevationDataInput: React.FC<ElevationDataInputProps> = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [manualData, setManualData] = useState({
    minElevation: '',
    maxElevation: '',
    slopeAngle: '',
    benchHeight: '',
    rockType: '',
    weatheringDegree: 'slight'
  });
  const [inputMethod, setInputMethod] = useState<'file' | 'manual'>('manual');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysis(null);
      setError(null);
    }
  };

  const handleManualInputChange = (field: string, value: string) => {
    setManualData(prev => ({ ...prev, [field]: value }));
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let elevationData;
      
      if (inputMethod === 'file' && file) {
        // For file upload, we'd normally parse the file
        // For demo, we'll use the filename and file size as data
        elevationData = {
          source: 'file',
          filename: file.name,
          size: file.size,
          // In reality, you'd parse DEM/CSV/JSON data here
          mockData: true
        };
      } else {
        // Use manual input data
        elevationData = {
          source: 'manual',
          ...manualData,
          minElevation: parseFloat(manualData.minElevation) || 0,
          maxElevation: parseFloat(manualData.maxElevation) || 0,
          slopeAngle: parseFloat(manualData.slopeAngle) || 0,
          benchHeight: parseFloat(manualData.benchHeight) || 0
        };
      }
      
  const result = await analyzeElevationData(elevationData);
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    if (inputMethod === 'file') return !!file;
    return !!(manualData.minElevation && manualData.maxElevation && manualData.slopeAngle);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-navy-100 rounded-lg">
          <Mountain className="w-6 h-6 text-navy-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Elevation & Topographic Analysis</h3>
          <p className="text-sm text-gray-600">Input DEM data or slope parameters for stability assessment</p>
        </div>
      </div>

      {/* Input Method Selection */}
      <div className="flex space-x-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            value="manual"
            checked={inputMethod === 'manual'}
            onChange={(e) => setInputMethod(e.target.value as 'manual')}
            className="text-navy-600"
          />
          <span className="text-sm">Manual Parameters</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            value="file"
            checked={inputMethod === 'file'}
            onChange={(e) => setInputMethod(e.target.value as 'file')}
            className="text-navy-600"
          />
          <span className="text-sm">DEM/CSV Upload</span>
        </label>
      </div>

      {/* File Upload Method */}
      {inputMethod === 'file' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-navy-400 transition-colors">
            <input
              type="file"
              accept=".dem,.csv,.txt,.json,.asc"
              onChange={handleFileSelect}
              className="hidden"
              id="elevation-upload"
            />
            <label htmlFor="elevation-upload" className="cursor-pointer">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">Upload DEM/Elevation Data</p>
                  <p className="text-sm text-gray-600">
                    Supported: .dem, .csv, .txt, .json, .asc files
                  </p>
                </div>
              </div>
            </label>
          </div>
          
          {file && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-600">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Input Method */}
      {inputMethod === 'manual' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Elevation (m)
            </label>
            <input
              type="number"
              value={manualData.minElevation}
              onChange={(e) => handleManualInputChange('minElevation', e.target.value)}
              placeholder="e.g., 1200"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Elevation (m)
            </label>
            <input
              type="number"
              value={manualData.maxElevation}
              onChange={(e) => handleManualInputChange('maxElevation', e.target.value)}
              placeholder="e.g., 1450"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Average Slope Angle (°)
            </label>
            <input
              type="number"
              value={manualData.slopeAngle}
              onChange={(e) => handleManualInputChange('slopeAngle', e.target.value)}
              placeholder="e.g., 45"
              min="0"
              max="90"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bench Height (m)
            </label>
            <input
              type="number"
              value={manualData.benchHeight}
              onChange={(e) => handleManualInputChange('benchHeight', e.target.value)}
              placeholder="e.g., 15"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rock Type
            </label>
            <input
              type="text"
              value={manualData.rockType}
              onChange={(e) => handleManualInputChange('rockType', e.target.value)}
              placeholder="e.g., Granite, Limestone, Sandstone"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weathering Degree
            </label>
            <select
              value={manualData.weatheringDegree}
              onChange={(e) => handleManualInputChange('weatheringDegree', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            >
              <option value="fresh">Fresh (I)</option>
              <option value="slight">Slightly Weathered (II)</option>
              <option value="moderate">Moderately Weathered (III)</option>
              <option value="highly">Highly Weathered (IV)</option>
              <option value="completely">Completely Weathered (V)</option>
            </select>
          </div>
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!isFormValid() || loading}
        className="w-full py-3 px-4 bg-navy-600 text-white rounded-lg hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing Slope Stability...</span>
          </>
        ) : (
          <>
            <BarChart3 className="w-4 h-4" />
            <span>Analyze Topographic Data</span>
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-safe-600" />
            <h4 className="font-semibold text-gray-900">Topographic Analysis Complete</h4>
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
              Copy Analysis
            </button>
            <button
              onClick={() => {
                const blob = new Blob([analysis], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `elevation-analysis-${new Date().toISOString().split('T')[0]}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-navy-100 text-navy-700 rounded-lg hover:bg-navy-200 text-sm"
            >
              Download Report
            </button>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 mb-2">Slope Stability Guidelines</h5>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <strong>Safe slopes:</strong> &lt;45° for most rock types</p>
          <p>• <strong>Moderate risk:</strong> 45-60° requires monitoring</p>
          <p>• <strong>High risk:</strong> 60-75° needs enhanced controls</p>
          <p>• <strong>Critical:</strong> &gt;75° immediate attention required</p>
        </div>
      </div>
    </div>
  );
};
