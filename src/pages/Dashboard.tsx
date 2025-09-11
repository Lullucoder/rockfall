import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Shield, Play, Pause, Brain, ExternalLink } from 'lucide-react';
import { RiskMap } from '../components/RiskMap';
import { AlertsPanel } from '../components/AlertsPanel';
import { SensorCharts } from '../components/SensorCharts';
import { RiskGauge } from '../components/RiskGauge';
import { ExportReport } from '../components/ExportReport';
import { ImageSummaryUploader } from '../components/ImageSummaryUploader';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

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
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monitoring Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time rockfall prediction and monitoring system
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRealTimeActive(!isRealTimeActive)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
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
          
          <ExportReport />
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map and Alerts */}
        <div className="lg:col-span-2 space-y-6">
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
                <span>Live Data</span>
              </div>
            </div>
            <div className="h-96">
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
            <SensorCharts 
              selectedZone={selectedZone}
              isRealTimeActive={isRealTimeActive}
            />
          </motion.div>
        </div>

        {/* Alerts and Zone Details */}
        <div className="space-y-6">
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
                Zone Details: {selectedZone}
              </h3>
              {/* Zone details content will be populated based on selectedZone */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Risk Level:</span>
                  <span className="font-medium text-warning-600">High</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Inspection:</span>
                  <span className="font-medium">2 hours ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Slope Angle:</span>
                  <span className="font-medium">65°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rock Type:</span>
                  <span className="font-medium">Limestone</span>
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
                <h3 className="text-lg font-semibold text-gray-900">AI Analysis</h3>
              </div>
              <Link 
                to="/ai-assessment"
                className="text-sm text-navy-600 hover:text-navy-700 flex items-center space-x-1"
              >
                <span>View Full Analysis</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="space-y-4">
              <ImageSummaryUploader />
              
              <div className="pt-4 border-t border-gray-200">
                <Link 
                  to="/ai-assessment"
                  className="w-full py-2 px-4 bg-navy-50 text-navy-700 rounded-lg hover:bg-navy-100 flex items-center justify-center space-x-2 text-sm font-medium"
                >
                  <Brain className="w-4 h-4" />
                  <span>Open Full AI Assessment Suite</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

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
