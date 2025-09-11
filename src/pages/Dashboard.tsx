import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Shield, Play, Pause, Brain, ExternalLink, Camera, FileText } from 'lucide-react';
import { RiskMap } from '../components/RiskMap';
import { AlertsPanel } from '../components/AlertsPanel';
import { SensorCharts } from '../components/SensorCharts';
import { RiskGauge } from '../components/RiskGauge';
import { ExportReport } from '../components/ExportReport';
import { ImageSummaryUploader } from '../components/ImageSummaryUploader';
import { MultiImageRockfallAnalysis } from '../components/MultiImageRockfallAnalysis';
import { EnhancedAlertsSystem } from '../components/EnhancedAlertsSystem';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'alerts' | 'reports'>('overview');

  // Mock overall statistics
  const overallStats = {
    totalZones: 6,
    criticalAlerts: 1,
    highRiskZones: 2,
    overallRiskScore: 7.2,
    lastUpdate: new Date().toISOString()
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col space-y-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Monitoring Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Real-time rockfall prediction and monitoring system
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRealTimeActive(!isRealTimeActive)}
            className={`flex items-center justify-center px-4 py-3 sm:py-2 rounded-lg font-medium transition-colors touch-target ${
              isRealTimeActive
                ? 'bg-safe-600 text-white hover:bg-safe-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isRealTimeActive ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause Updates
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume Updates
              </>
            )}
          </motion.button>
          
          <div className="sm:ml-auto">
            <ExportReport />
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Zones</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.totalZones}</p>
            </div>
            <div className="p-3 bg-navy-100 rounded-lg">
              <Shield className="w-6 h-6 text-navy-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
              <p className="text-2xl font-bold text-danger-600">{overallStats.criticalAlerts}</p>
            </div>
            <div className="p-3 bg-danger-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-danger-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk Zones</p>
              <p className="text-2xl font-bold text-warning-600">{overallStats.highRiskZones}</p>
            </div>
            <div className="p-3 bg-warning-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Risk Score</p>
              <p className="text-2xl font-bold text-navy-600">{overallStats.overallRiskScore}</p>
            </div>
            <RiskGauge value={overallStats.overallRiskScore} size="small" />
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border-b border-gray-200"
      >
        <nav className="flex overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview', icon: Shield },
            { key: 'analysis', label: 'Analysis', icon: Camera },
            { key: 'alerts', label: 'Alerts', icon: AlertTriangle },
            { key: 'reports', label: 'Reports', icon: FileText }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap touch-target ${
                activeTab === key
                  ? 'border-navy-500 text-navy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(' ')[0]}</span>
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
      <div>
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Map and Alerts */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          {/* Risk Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Risk Map</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-safe-500 rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">Live Data</span>
                <span className="sm:hidden">Live</span>
              </div>
            </div>
            <div className="h-64 sm:h-80 lg:h-96">
              <RiskMap 
                onZoneSelect={setSelectedZone}
                isRealTimeActive={isRealTimeActive}
              />
            </div>
          </motion.div>

          {/* Sensor Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sensor Data Trends</h2>
            <div className="min-h-64">
              <SensorCharts 
                selectedZone={selectedZone}
                isRealTimeActive={isRealTimeActive}
              />
            </div>
          </motion.div>
        </div>

        {/* Alerts and Zone Details */}
        <div className="space-y-4 sm:space-y-6">
          {/* Alerts Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AlertsPanel />
          </motion.div>

          {/* Zone Details */}
          {selectedZone && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <span className="hidden sm:inline">Zone Details: </span>
                <span className="sm:hidden">Zone: </span>
                {selectedZone}
              </h3>
              {/* Zone details content will be populated based on selectedZone */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">Risk Level:</span>
                  <span className="font-medium text-warning-600 text-sm sm:text-base">High</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">Last Inspection:</span>
                  <span className="font-medium text-sm sm:text-base">2 hours ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">Slope Angle:</span>
                  <span className="font-medium text-sm sm:text-base">65°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">Rock Type:</span>
                  <span className="font-medium text-sm sm:text-base">Limestone</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Risk Gauge */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Risk Assessment
            </h3>
            <div className="flex flex-col items-center">
              <RiskGauge value={overallStats.overallRiskScore} size="large" />
              <p className="text-sm text-gray-600 mt-4 text-center">
                Overall site risk score based on AI analysis
              </p>
            </div>
          </motion.div>

          {/* AI Quick Analysis */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-navy-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">AI Analysis</h3>
              </div>
              <Link 
                to="/ai-assessment"
                className="text-xs sm:text-sm text-navy-600 hover:text-navy-700 flex items-center space-x-1"
              >
                <span className="hidden sm:inline">View Full Analysis</span>
                <span className="sm:hidden">View</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="space-y-4">
              <ImageSummaryUploader />
              
              <div className="pt-4 border-t border-gray-200">
                <Link 
                  to="/ai-assessment"
                  className="w-full py-3 px-4 bg-navy-50 text-navy-700 rounded-lg hover:bg-navy-100 flex items-center justify-center space-x-2 text-sm font-medium touch-target"
                >
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">Open Full AI Assessment Suite</span>
                  <span className="sm:hidden">Full AI Assessment</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      </div>
      )}

      {/* Image Analysis Tab */}
      {activeTab === 'analysis' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Multi-Image Rockfall Analysis</h2>
            <MultiImageRockfallAnalysis />
          </div>
        </motion.div>
      )}

      {/* Enhanced Alerts Tab */}
      {activeTab === 'alerts' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="card">
            <EnhancedAlertsSystem 
              alerts={[
                {
                  id: 'alert-001',
                  zone_id: 'zone-1',
                  zone_name: 'North Bench Level 1200m',
                  severity: 'critical',
                  status: 'active',
                  message: 'Significant rock fractures detected with increasing displacement rates',
                  risk_probability: 0.87,
                  timestamp: new Date().toISOString(),
                  predicted_timeline: '6-12 hours',
                  recommended_actions: [
                    'Immediate evacuation of personnel from Zone 1',
                    'Establish 150m safety perimeter',
                    'Deploy additional monitoring sensors',
                    'Contact emergency response team'
                  ],
                  affected_personnel: 8,
                  equipment_at_risk: ['Excavator CAT-320', 'Drill Rig DR-150', 'Haul Truck Fleet A']
                },
                {
                  id: 'alert-002',
                  zone_id: 'zone-3',
                  zone_name: 'East Wall Section B',
                  severity: 'high',
                  status: 'acknowledged',
                  message: 'Water seepage increasing after recent rainfall',
                  risk_probability: 0.65,
                  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                  predicted_timeline: '24-48 hours',
                  recommended_actions: [
                    'Install drainage measures',
                    'Increase monitoring frequency',
                    'Review slope stability calculations'
                  ],
                  affected_personnel: 3,
                  equipment_at_risk: ['Survey Equipment', 'Mobile Platform MP-1']
                }
              ]}
              onAlertAction={(alertId, action) => {
                console.log(`Alert ${alertId} - Action: ${action}`);
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
              <ExportReport />
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report History</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm sm:text-base truncate">Daily Risk Assessment</div>
                    <div className="text-xs sm:text-sm text-gray-500">Generated today, 8:00 AM</div>
                  </div>
                  <button className="text-navy-600 hover:text-navy-700 text-xs sm:text-sm ml-2 touch-target">Download</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm sm:text-base truncate">Weekly Analysis Report</div>
                    <div className="text-xs sm:text-sm text-gray-500">Generated yesterday</div>
                  </div>
                  <button className="text-navy-600 hover:text-navy-700 text-xs sm:text-sm ml-2 touch-target">Download</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm sm:text-base truncate">Emergency Response Log</div>
                    <div className="text-xs sm:text-sm text-gray-500">Generated 3 days ago</div>
                  </div>
                  <button className="text-navy-600 hover:text-navy-700 text-xs sm:text-sm ml-2 touch-target">Download</button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Real-time Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${
              isRealTimeActive ? 'bg-safe-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm font-medium text-gray-700">
              {isRealTimeActive ? 'Real-time monitoring active' : 'Real-time monitoring paused'}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            Last update: {new Date(overallStats.lastUpdate).toLocaleTimeString()}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
