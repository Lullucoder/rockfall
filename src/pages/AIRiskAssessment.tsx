import React, { useState } from 'react';
import { Brain, Camera, Mountain, BarChart3, Zap } from 'lucide-react';
import { RockfallImageAnalysis } from '../components/RockfallImageAnalysis';
import { ElevationDataInput } from '../components/ElevationDataInput';
import { ComprehensiveRiskAnalysis } from '../components/ComprehensiveRiskAnalysis';

export const AIRiskAssessment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'elevation' | 'comprehensive'>('image');
  const [analysisResults, setAnalysisResults] = useState<{
    image?: string;
    elevation?: string;
    comprehensive?: string;
  }>({});

  const tabs = [
    {
      id: 'image' as const,
      label: 'Image Analysis',
      icon: Camera,
      description: 'AI-powered visual inspection of slope conditions'
    },
    {
      id: 'elevation' as const,
      label: 'Topographic Analysis',
      icon: Mountain,
      description: 'DEM data and slope stability assessment'
    },
    {
      id: 'comprehensive' as const,
      label: 'Multi-Source Analysis',
      icon: Brain,
      description: 'Integrated risk assessment from all data sources'
    }
  ];

  const handleAnalysisComplete = (type: keyof typeof analysisResults, result: string) => {
    setAnalysisResults(prev => ({ ...prev, [type]: result }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-navy-100 rounded-xl">
                <Brain className="w-8 h-8 text-navy-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI-Powered Risk Assessment</h1>
                <p className="text-gray-600 mt-1">
                  Advanced geological analysis using Google Gemini AI for comprehensive rockfall prediction
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-navy-50 border border-navy-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Camera className="w-5 h-5 text-navy-600" />
                  <div>
                    <p className="text-sm font-medium text-navy-900">Image Analysis</p>
                    <p className="text-xs text-navy-600">Visual slope inspection</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Mountain className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">DEM Processing</p>
                    <p className="text-xs text-green-600">Topographic analysis</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">Multi-Source</p>
                    <p className="text-xs text-purple-600">Integrated assessment</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">Real-time AI</p>
                    <p className="text-xs text-orange-600">Gemini-powered insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-navy-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Description */}
        <div className="mb-6">
          <p className="text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {activeTab === 'image' && (
            <RockfallImageAnalysis 
              onAnalysisComplete={(result) => handleAnalysisComplete('image', result)}
            />
          )}

          {activeTab === 'elevation' && (
            <ElevationDataInput 
              onAnalysisComplete={(result) => handleAnalysisComplete('elevation', result)}
            />
          )}

          {activeTab === 'comprehensive' && (
            <ComprehensiveRiskAnalysis 
              onAnalysisComplete={(result) => handleAnalysisComplete('comprehensive', result)}
            />
          )}
        </div>

        {/* Analysis Results Summary */}
        {Object.keys(analysisResults).length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results Summary</h3>
            
            <div className="space-y-4">
              {analysisResults.image && (
                <div className="border-l-4 border-navy-500 pl-4">
                  <h4 className="font-medium text-navy-900 mb-2">Image Analysis</h4>
                  <p className="text-sm text-gray-600 line-clamp-3">{analysisResults.image}</p>
                </div>
              )}

              {analysisResults.elevation && (
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium text-green-900 mb-2">Topographic Analysis</h4>
                  <p className="text-sm text-gray-600 line-clamp-3">{analysisResults.elevation}</p>
                </div>
              )}

              {analysisResults.comprehensive && (
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-medium text-purple-900 mb-2">Comprehensive Assessment</h4>
                  <p className="text-sm text-gray-600 line-clamp-3">{analysisResults.comprehensive}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  const allResults = Object.entries(analysisResults)
                    .map(([type, result]) => `${type.toUpperCase()} ANALYSIS:\n${result}`)
                    .join('\n\n---\n\n');
                  navigator.clipboard.writeText(allResults);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                Copy All Results
              </button>
              <button
                onClick={() => {
                  const timestamp = new Date().toISOString().split('T')[0];
                  const allResults = Object.entries(analysisResults)
                    .map(([type, result]) => `${type.toUpperCase()} ANALYSIS:\n${result}`)
                    .join('\n\n---\n\n');
                  const blob = new Blob([allResults], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `ai-risk-assessment-${timestamp}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-navy-100 text-navy-700 rounded-lg hover:bg-navy-200 text-sm"
              >
                Download Complete Report
              </button>
            </div>
          </div>
        )}

        {/* AI Technology Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">About the AI Technology</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Google Gemini Integration</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Advanced multi-modal AI capable of analyzing images and text</li>
                <li>• Trained on geological and engineering datasets</li>
                <li>• Real-time processing with professional-grade insights</li>
                <li>• Continuous learning from mining industry best practices</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Analysis Capabilities</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Structural geology assessment from images</li>
                <li>• Slope stability calculations from elevation data</li>
                <li>• Environmental factor integration</li>
                <li>• Risk probability estimation with confidence levels</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
