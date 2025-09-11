import React, { useState } from 'react';
import { Upload, Camera, AlertTriangle, FileImage, Loader2, CheckCircle } from 'lucide-react';
import { analyzeRockfallRisk } from '../ai/geminiService';

interface RockfallImageAnalysisProps {
  onAnalysisComplete?: (result: string) => void;
}

export const RockfallImageAnalysis: React.FC<RockfallImageAnalysisProps> = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<'detailed' | 'quick'>('detailed');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysis(null);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
  const result = await analyzeRockfallRisk(file, analysisType);
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (text: string): string => {
    const upper = text.toLowerCase();
    if (upper.includes('critical')) return 'critical';
    if (upper.includes('high')) return 'high';
    if (upper.includes('medium') || upper.includes('moderate')) return 'medium';
    return 'low';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-danger-600 bg-danger-50 border-danger-200';
      case 'high': return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-safe-600 bg-safe-50 border-safe-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-navy-100 rounded-lg">
          <Camera className="w-6 h-6 text-navy-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Rockfall Risk Analysis</h3>
          <p className="text-sm text-gray-600">Upload slope images for comprehensive geological assessment</p>
        </div>
      </div>

      {/* Analysis Type Selection */}
      <div className="flex space-x-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            value="quick"
            checked={analysisType === 'quick'}
            onChange={(e) => setAnalysisType(e.target.value as 'quick')}
            className="text-navy-600"
          />
          <span className="text-sm">Quick Assessment (30s)</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            value="detailed"
            checked={analysisType === 'detailed'}
            onChange={(e) => setAnalysisType(e.target.value as 'detailed')}
            className="text-navy-600"
          />
          <span className="text-sm">Detailed Analysis (60s)</span>
        </label>
      </div>

      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-navy-400 transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">Upload slope image</p>
              <p className="text-sm text-gray-600">
                Drone photos, bench images, or slope photographs (PNG, JPG, JPEG)
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* Image Preview */}
      {preview && (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={preview}
              alt="Slope preview"
              className="w-full max-h-96 object-contain rounded-lg border"
            />
            <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
              {file?.name}
            </div>
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-3 px-4 bg-navy-600 text-white rounded-lg hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing... ({analysisType === 'detailed' ? 'Detailed' : 'Quick'} Mode)</span>
              </>
            ) : (
              <>
                <FileImage className="w-4 h-4" />
                <span>Analyze Rockfall Risk</span>
              </>
            )}
          </button>
        </div>
      )}

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
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-safe-600" />
            <h4 className="font-semibold text-gray-900">Analysis Complete</h4>
          </div>
          
          {/* Risk Level Badge */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(getRiskLevel(analysis))}`}>
            Risk Level: {getRiskLevel(analysis).toUpperCase()}
          </div>

          {/* Analysis Content */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                {analysis}
              </pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => navigator.clipboard.writeText(analysis)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Copy Report
            </button>
            <button
              onClick={() => {
                const blob = new Blob([analysis], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `rockfall-analysis-${new Date().toISOString().split('T')[0]}.txt`;
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

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 mb-2">Tips for Better Analysis</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Capture images during optimal lighting conditions</li>
          <li>• Include scale references (equipment, personnel) when possible</li>
          <li>• Focus on areas of concern (cracks, overhangs, loose rock)</li>
          <li>• Take multiple angles of the same slope section</li>
          <li>• Include surrounding context (benches, access roads)</li>
        </ul>
      </div>
    </div>
  );
};
