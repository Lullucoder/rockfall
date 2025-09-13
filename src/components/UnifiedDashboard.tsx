import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Brain, Settings, FileText, 
  AlertTriangle, Shield, TrendingUp, Play, Pause,
  Camera, Mountain, Smartphone, Database,
  Zap, ExternalLink
} from 'lucide-react';

// Import all the existing components we'll consolidate
import { CustomTopographicalMap } from './CustomTopographicalMap';
import { SensorCharts } from './SensorCharts';
import { RiskGauge } from './RiskGauge';
import { RockfallImageAnalysis } from './RockfallImageAnalysis';
import { ElevationDataInput } from './ElevationDataInput';
import { ComprehensiveRiskAnalysis } from './ComprehensiveRiskAnalysis';
import { MultiImageRockfallAnalysis } from './MultiImageRockfallAnalysis';
import { EnhancedAlertsSystem } from './EnhancedAlertsSystem';
import { DataFlowControl } from './DataFlowControl';
import { MobileDeviceRegistration } from './MobileDeviceRegistration';
import { MobileAlertStatusMonitor } from './MobileAlertStatusMonitor';
import { BackendControlPanel } from './BackendControlPanel';
import { ExportReport } from './ExportReport';

// Import hooks
import { useTerrainDataIntegration } from '../hooks/useTerrainDataIntegration';
import { useRockfallDataGenerator } from '../hooks/useRockfallDataGenerator';
import { useBackendIntegration } from '../hooks/useBackendIntegration';

type Section = 'monitor' | 'analyze' | 'control' | 'reports';

export const UnifiedDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('monitor');
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Initialize all hooks
  const {
    terrainMaps,
    simulationThresholds,
    analytics,
    updateTerrainData,
    updateSimulationThresholds,
    setIsRealTimeActive: setTerrainRealTime,
    getRiskAssessment,
    getSectionData
  } = useTerrainDataIntegration();

  const {
    isRunning: isSimulationRunning,
    start: startSimulation,
    stop: stopSimulation
  } = useRockfallDataGenerator();

  const {
    backendConfig,
    setBackendConfig,
    simulateAlert: backendSimulateAlert,
    testAlertSystem: backendTestAlert,
    isConnected,
    lastResponse,
    error: backendError,
    loading: backendLoading
  } = useBackendIntegration();

  // Sync terrain real-time status
  useEffect(() => {
    setTerrainRealTime(isRealTimeActive);
  }, [isRealTimeActive, setTerrainRealTime]);

  // Enhanced statistics
  const terrainRiskAssessment = getRiskAssessment();
  const overallStats = {
    totalZones: terrainRiskAssessment?.totalZones || analytics.totalSections || 12,
    criticalAlerts: terrainRiskAssessment?.criticalAlerts || analytics.activeCriticalSections || 2,
    highRiskZones: terrainRiskAssessment?.highRiskZones || analytics.sectionsAboveThreshold || 5,
    overallRiskScore: terrainRiskAssessment?.overallRiskScore || analytics.averageRiskScore || 0.72,
    lastUpdate: terrainRiskAssessment?.lastUpdate || new Date().toISOString(),
    simulationStatus: isSimulationRunning ? 'Running' : 'Stopped',
    detectionAccuracy: 95.2,
    sectionsAboveThreshold: analytics.sectionsAboveThreshold || 3
  };

  const sections = [
    {
      id: 'monitor' as const,
      label: 'Monitor',
      icon: Activity,
      description: 'Real-time monitoring & alerts'
    },
    {
      id: 'analyze' as const,
      label: 'Analyze',
      icon: Brain,
      description: 'AI analysis & assessment'
    },
    {
      id: 'control' as const,
      label: 'Control',
      icon: Settings,
      description: 'System settings & simulation'
    },
    {
      id: 'reports' as const,
      label: 'Reports',
      icon: FileText,
      description: 'Data export & analytics'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Welcome Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent mb-2">
              Rockfall Monitoring System
            </h1>
            <p className="text-gray-600 text-lg">
              Real-time intelligence for slope stability and safety management
            </p>
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className={`w-3 h-3 rounded-full ${
                  isRealTimeActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}></div>
                <span>{isRealTimeActive ? 'Live Monitoring' : 'Monitoring Paused'}</span>
              </div>
              <div className="text-sm text-gray-500">
                Last update: {new Date(overallStats.lastUpdate).toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsRealTimeActive(!isRealTimeActive)}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg ${
                isRealTimeActive
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
              }`}
            >
              {isRealTimeActive ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause Monitoring
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Resume Monitoring
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Enhanced Key Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Zones</p>
                <p className="text-3xl font-bold text-gray-900">{overallStats.totalZones}</p>
                <p className="text-xs text-green-600 mt-1">↗ All active</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-navy-100 to-navy-200 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-navy-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-white to-red-50 rounded-2xl p-6 shadow-lg border border-red-100 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Critical Alerts</p>
                <p className="text-3xl font-bold text-red-600">{overallStats.criticalAlerts}</p>
                <p className="text-xs text-red-500 mt-1">Requires attention</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">High Risk Zones</p>
                <p className="text-3xl font-bold text-orange-600">{overallStats.highRiskZones}</p>
                <p className="text-xs text-orange-500 mt-1">Monitor closely</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Risk Score</p>
                <p className="text-3xl font-bold text-purple-600">{overallStats.overallRiskScore.toFixed(2)}</p>
                <p className="text-xs text-purple-500 mt-1">AI Assessment</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <RiskGauge value={overallStats.overallRiskScore} size="small" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Section Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 backdrop-blur-sm"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {sections.map((section, index) => (
            <motion.button
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSection(section.id)}
              className={`relative flex items-center space-x-4 p-5 rounded-xl transition-all duration-300 overflow-hidden group ${
                activeSection === section.id
                  ? 'bg-gradient-to-br from-navy-500 to-navy-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 hover:text-navy-700'
              }`}
            >
              {/* Background Animation */}
              <div className={`absolute inset-0 bg-gradient-to-r from-navy-400/20 to-navy-600/20 transform transition-transform duration-300 ${
                activeSection === section.id ? 'translate-x-0' : '-translate-x-full group-hover:translate-x-0'
              }`} />
              
              <div className={`relative z-10 p-2 rounded-lg transition-all duration-300 ${
                activeSection === section.id 
                  ? 'bg-white/20' 
                  : 'bg-gray-100 group-hover:bg-navy-100'
              }`}>
                <section.icon className={`w-6 h-6 transition-colors duration-300 ${
                  activeSection === section.id ? 'text-white' : 'text-navy-600'
                }`} />
              </div>
              
              <div className="relative z-10 flex-1 text-left">
                <p className={`font-semibold text-base transition-colors duration-300 ${
                  activeSection === section.id ? 'text-white' : 'text-gray-900'
                }`}>
                  {section.label}
                </p>
                <p className={`text-sm opacity-75 transition-colors duration-300 ${
                  activeSection === section.id ? 'text-white' : 'text-gray-500'
                }`}>
                  {section.description}
                </p>
              </div>
              
              {/* Active Indicator */}
              {activeSection === section.id && (
                <motion.div
                  layoutId="activeSection"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-white rounded-full"
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Section Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeSection === 'monitor' && (
            <MonitorSection
              selectedZone={selectedZone}
              setSelectedZone={setSelectedZone}
              isRealTimeActive={isRealTimeActive}
              terrainMaps={terrainMaps}
              updateTerrainData={updateTerrainData}
              getSectionData={getSectionData}
              simulationThresholds={simulationThresholds}
              overallStats={overallStats}
            />
          )}

          {activeSection === 'analyze' && (
            <AnalyzeSection />
          )}

          {activeSection === 'control' && (
            <ControlSection
              isSimulationRunning={isSimulationRunning}
              startSimulation={startSimulation}
              stopSimulation={stopSimulation}
              simulationThresholds={simulationThresholds}
              updateSimulationThresholds={updateSimulationThresholds}
              analytics={analytics}
              backendConfig={backendConfig}
              setBackendConfig={setBackendConfig}
              isConnected={isConnected}
              backendError={backendError}
              backendLoading={backendLoading}
              simulateAlert={(alertData: any) => {
                backendSimulateAlert(alertData.zoneId, alertData.severity);
              }}
              testAlertSystem={() => {
                backendTestAlert();
              }}
              lastResponse={lastResponse}
              terrainMaps={terrainMaps}
              backendSimulateAlert={backendSimulateAlert}
              backendTestAlert={backendTestAlert}
            />
          )}

          {activeSection === 'reports' && (
            <ReportsSection
              overallStats={overallStats}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Enhanced Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full shadow-lg ${
                isRealTimeActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className="text-lg font-semibold text-gray-700">
                {isRealTimeActive ? 'Real-time monitoring active' : 'Real-time monitoring paused'}
              </span>
            </div>
            
            <div className="hidden md:block w-px h-8 bg-gray-300" />
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-blue-100 rounded">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <span>{overallStats.simulationStatus}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-green-100 rounded">
                  <Brain className="w-4 h-4 text-green-600" />
                </div>
                <span>Accuracy: {overallStats.detectionAccuracy}%</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-purple-100 rounded">
                  <Activity className="w-4 h-4 text-purple-600" />
                </div>
                <span>{overallStats.totalZones} zones active</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Last Update</p>
              <p className="text-lg font-semibold text-gray-700">
                {new Date(overallStats.lastUpdate).toLocaleTimeString()}
              </p>
            </div>
            
            <div className="w-12 h-12 bg-gradient-to-br from-navy-500 to-navy-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Monitor Section Component with Enhanced Styling
const MonitorSection: React.FC<{
  selectedZone: string | null;
  setSelectedZone: (zone: string | null) => void;
  isRealTimeActive: boolean;
  terrainMaps: any[];
  updateTerrainData: (data: any) => void;
  getSectionData: (zoneId: string) => any;
  simulationThresholds: any;
  overallStats: any;
}> = ({ 
  selectedZone, 
  setSelectedZone, 
  isRealTimeActive, 
  terrainMaps, 
  updateTerrainData, 
  getSectionData, 
  simulationThresholds,
  overallStats 
}) => {
  // Use terrainMaps to avoid warning
  void terrainMaps;
  
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Map and Charts */}
      <div className="xl:col-span-2 space-y-8">
        {/* Enhanced Risk Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-navy-50 to-blue-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Activity className="w-5 h-5 text-navy-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Live Risk Map</h2>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-white rounded-full shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Live Data</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-[500px] rounded-xl overflow-hidden bg-gray-50">
              <CustomTopographicalMap 
                onZoneSelect={setSelectedZone}
                onDataUpdate={updateTerrainData}
                simulationThresholds={simulationThresholds}
                isRealTimeActive={isRealTimeActive}
              />
            </div>
          </div>
        </motion.div>

        {/* Enhanced Sensor Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Sensor Trends</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="h-64 rounded-xl overflow-hidden bg-gray-50">
              <SensorCharts 
                selectedZone={selectedZone}
                isRealTimeActive={isRealTimeActive}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Alerts and Details Sidebar */}
      <div className="space-y-8">
        {/* Enhanced Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Active Alerts</h2>
            </div>
          </div>
          <div className="p-6">
            <EnhancedAlertsSystem 
              alerts={[
                {
                  id: 'alert-001',
                  zone_id: 'zone-1',
                  zone_name: 'North Bench Level 1200m',
                  severity: 'critical' as const,
                  status: 'active' as const,
                  message: 'Critical displacement detected',
                  risk_probability: 0.87,
                  timestamp: new Date().toISOString(),
                  predicted_timeline: '6-12 hours',
                  recommended_actions: [
                    'Immediate evacuation',
                    'Establish safety perimeter',
                    'Deploy additional sensors'
                  ],
                  affected_personnel: 8,
                  equipment_at_risk: ['Excavator CAT-320', 'Drill Rig DR-150']
                }
              ]}
              onAlertAction={(alertId, action) => {
                console.log(`Alert ${alertId} - Action: ${action}`);
              }}
            />
          </div>
        </motion.div>

        {/* Enhanced Zone Details */}
        {selectedZone && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Mountain className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Zone: {getSectionData(selectedZone)?.name || selectedZone}
                </h3>
              </div>
            </div>
            <div className="p-6">
              {(() => {
                const sectionData = getSectionData(selectedZone);
                if (sectionData) {
                  return (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Risk Level:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          sectionData.riskLevel === 'critical' ? 'bg-red-100 text-red-700' :
                          sectionData.riskLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {sectionData.riskLevel.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Risk Score:</span>
                        <span className="font-bold text-lg">{sectionData.riskScore.toFixed(1)}/10</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Stability:</span>
                        <span className="font-semibold">{(sectionData.properties.stability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Displacement:</span>
                        <span className="font-semibold">{sectionData.sensorData.displacement.toFixed(2)}mm</span>
                      </div>
                    </div>
                  );
                }
                return <p className="text-gray-500">No data available for this zone</p>;
              })()}
            </div>
          </motion.div>
        )}

        {/* Enhanced Risk Gauge */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Overall Risk Assessment</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-col items-center">
              <RiskGauge value={overallStats.overallRiskScore} size="large" />
              <p className="text-sm text-gray-600 mt-4 text-center">
                Site-wide risk assessment based on AI analysis and sensor data
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Enhanced Analyze Section Component
const AnalyzeSection: React.FC = () => {
  const [analysisTab, setAnalysisTab] = useState<'image' | 'elevation' | 'multi' | 'comprehensive'>('image');

  const analysisTabs = [
    { id: 'image', label: 'Image Analysis', icon: Camera, colorFrom: 'from-blue-500', colorTo: 'to-blue-600', bgColor: 'bg-blue-100' },
    { id: 'elevation', label: 'Elevation Data', icon: Mountain, colorFrom: 'from-green-500', colorTo: 'to-green-600', bgColor: 'bg-green-100' },
    { id: 'multi', label: 'Multi-Image', icon: Camera, colorFrom: 'from-purple-500', colorTo: 'to-purple-600', bgColor: 'bg-purple-100' },
    { id: 'comprehensive', label: 'Comprehensive', icon: Brain, colorFrom: 'from-orange-500', colorTo: 'to-orange-600', bgColor: 'bg-orange-100' }
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Analysis Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {analysisTabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAnalysisTab(tab.id as any)}
              className={`relative flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 overflow-hidden group ${
                analysisTab === tab.id
                  ? `bg-gradient-to-br ${tab.colorFrom} ${tab.colorTo} text-white shadow-lg`
                  : 'text-gray-600 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100'
              }`}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                analysisTab === tab.id 
                  ? 'bg-white/20' 
                  : `${tab.bgColor} group-hover:bg-gray-200`
              }`}>
                <tab.icon className={`w-5 h-5 transition-colors duration-300 ${
                  analysisTab === tab.id ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              <span className={`font-semibold transition-colors duration-300 ${
                analysisTab === tab.id ? 'text-white' : 'text-gray-900'
              }`}>
                {tab.label}
              </span>
              
              {analysisTab === tab.id && (
                <motion.div
                  layoutId="activeAnalysisTab"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-white rounded-full"
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Enhanced Analysis Content */}
      <motion.div
        key={analysisTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      >
        {analysisTab === 'image' && (
          <div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Camera className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">AI Image Analysis</h2>
              </div>
            </div>
            <div className="p-6">
              <RockfallImageAnalysis />
            </div>
          </div>
        )}

        {analysisTab === 'elevation' && (
          <div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Mountain className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Elevation Data Analysis</h2>
              </div>
            </div>
            <div className="p-6">
              <ElevationDataInput />
            </div>
          </div>
        )}

        {analysisTab === 'multi' && (
          <div>
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Camera className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Multi-Image Analysis</h2>
              </div>
            </div>
            <div className="p-6">
              <MultiImageRockfallAnalysis />
            </div>
          </div>
        )}

        {analysisTab === 'comprehensive' && (
          <div>
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Brain className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Comprehensive Risk Analysis</h2>
              </div>
            </div>
            <div className="p-6">
              <ComprehensiveRiskAnalysis />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Control Section Component
const ControlSection: React.FC<{
  isSimulationRunning: boolean;
  startSimulation: () => void;
  stopSimulation: () => void;
  simulationThresholds: any;
  updateSimulationThresholds: (thresholds: any) => void;
  analytics: any;
  backendConfig: any;
  setBackendConfig: (config: any) => void;
  isConnected: boolean;
  backendError: string | null;
  backendLoading: boolean;
  simulateAlert: (alertData: any) => void;
  testAlertSystem: () => void;
  lastResponse: any;
  terrainMaps: any[];
  backendSimulateAlert: (zoneId: string, severity: string) => Promise<boolean>;
  backendTestAlert: () => Promise<boolean>;
}> = ({ 
  isSimulationRunning, 
  startSimulation, 
  stopSimulation,
  simulationThresholds,
  updateSimulationThresholds,
  backendConfig,
  setBackendConfig,
  isConnected,
  backendError,
  backendLoading,
  simulateAlert,
  testAlertSystem,
  lastResponse,
  terrainMaps,
  backendSimulateAlert,
  backendTestAlert
}) => {
  const [controlTab, setControlTab] = useState<'simulation' | 'backend' | 'mobile' | 'data'>('simulation');

  const controlTabs = [
    { id: 'simulation', label: 'Simulation', icon: Zap },
    { id: 'backend', label: 'Backend', icon: ExternalLink },
    { id: 'mobile', label: 'Mobile Devices', icon: Smartphone },
    { id: 'data', label: 'Data Flow', icon: Database }
  ];

  // Silence unused variable warnings
  void simulateAlert;
  void testAlertSystem;

  return (
    <div className="space-y-6">
      {/* Control Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {controlTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setControlTab(tab.id as any)}
              className={`flex items-center space-x-2 p-3 rounded-lg transition-all ${
                controlTab === tab.id
                  ? 'bg-navy-50 text-navy-700 border-2 border-navy-200'
                  : 'text-gray-600 hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Control Content */}
      <div className="card">
        {controlTab === 'simulation' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Simulation Control</h2>
            
            {/* Simulation Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Simulation:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isSimulationRunning 
                        ? 'bg-safe-100 text-safe-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {isSimulationRunning ? 'Running' : 'Stopped'}
                    </span>
                  </div>
                  <button
                    onClick={isSimulationRunning ? stopSimulation : startSimulation}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      isSimulationRunning
                        ? 'bg-danger-600 text-white hover:bg-danger-700'
                        : 'bg-safe-600 text-white hover:bg-safe-700'
                    }`}
                  >
                    {isSimulationRunning ? 'Stop Simulation' : 'Start Simulation'}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thresholds</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Risk Threshold: {(simulationThresholds.riskThreshold * 10).toFixed(1)}/10
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={simulationThresholds.riskThreshold * 10}
                      onChange={(e) => updateSimulationThresholds({ 
                        riskThreshold: parseFloat(e.target.value) / 10 
                      })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stability Threshold: {(simulationThresholds.stabilityThreshold * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="30"
                      max="90"
                      step="1"
                      value={simulationThresholds.stabilityThreshold * 100}
                      onChange={(e) => updateSimulationThresholds({ 
                        stabilityThreshold: parseFloat(e.target.value) / 100 
                      })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {controlTab === 'backend' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Backend Integration</h2>
            <BackendControlPanel
              config={backendConfig}
              onConfigChange={setBackendConfig}
              isConnected={isConnected}
              error={backendError}
              loading={backendLoading}
              onSimulateAlert={async (zoneId: string, severity: string) => {
                return await backendSimulateAlert(zoneId, severity);
              }}
              onTestAlertSystem={async () => {
                return await backendTestAlert();
              }}
              lastResponse={lastResponse}
              availableSections={terrainMaps.flatMap((terrain: any) => 
                terrain.sections.map((section: any) => ({
                  id: section.id,
                  name: section.name,
                  terrainName: terrain.name
                }))
              )}
            />
          </div>
        )}

        {controlTab === 'mobile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Mobile Device Management</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Registration</h3>
                <MobileDeviceRegistration
                  onDeviceRegistered={(deviceId) => {
                    console.log('Device registered:', deviceId);
                  }}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Status Monitor</h3>
                <MobileAlertStatusMonitor refreshInterval={5000} />
              </div>
            </div>
          </div>
        )}

        {controlTab === 'data' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Flow Control</h2>
            <DataFlowControl
              onDataSourceChange={(source) => {
                console.log('Data source changed:', source);
              }}
              onSimulationToggle={(enabled) => {
                if (enabled) {
                  startSimulation();
                } else {
                  stopSimulation();
                }
              }}
              onDataImport={(data) => {
                console.log('Data imported:', data);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Reports Section Component
const ReportsSection: React.FC<{
  overallStats: any;
}> = ({ overallStats }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Reports */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Reports</h2>
          <ExportReport />
        </div>

        {/* Quick Stats */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Statistics</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Detection Accuracy:</span>
              <span className="font-medium">{overallStats.detectionAccuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Zones:</span>
              <span className="font-medium">{overallStats.totalZones}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sections Above Threshold:</span>
              <span className="font-medium">{overallStats.sectionsAboveThreshold}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">System Status:</span>
              <span className="font-medium">{overallStats.simulationStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Report History */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reports</h2>
        <div className="space-y-3">
          {[
            { title: 'Daily Risk Assessment', date: 'Today, 8:00 AM', type: 'PDF' },
            { title: 'Weekly Analysis Report', date: 'Yesterday', type: 'PDF' },
            { title: 'Emergency Response Log', date: '3 days ago', type: 'CSV' },
            { title: 'Monthly Summary', date: '1 week ago', type: 'PDF' }
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">{report.title}</div>
                <div className="text-sm text-gray-500">{report.date} • {report.type}</div>
              </div>
              <button className="text-navy-600 hover:text-navy-700 font-medium">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};