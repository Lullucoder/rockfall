import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Shield, Play, Pause, Brain, ExternalLink, Camera, FileText, Database, Zap, Smartphone, Activity } from 'lucide-react';
import { CustomTopographicalMap } from '../components/CustomTopographicalMap';
import { useTerrainDataIntegration } from '../hooks/useTerrainDataIntegration';
import { AlertsPanel } from '../components/AlertsPanel';
import { SensorCharts } from '../components/SensorCharts';
import { RiskGauge } from '../components/RiskGauge';
import { ExportReport } from '../components/ExportReport';
import { ImageSummaryUploader } from '../components/ImageSummaryUploader';
import { MultiImageRockfallAnalysis } from '../components/MultiImageRockfallAnalysis';
import { EnhancedAlertsSystem } from '../components/EnhancedAlertsSystem';
import { DataFlowControl } from '../components/DataFlowControl';
import { AlertManagementSystem } from '../components/AlertManagementSystem';
import { DataImportAnalysis } from '../components/DataImportAnalysis';
import { MobileDeviceRegistration } from '../components/MobileDeviceRegistration';
import { MobileAlertStatusMonitor } from '../components/MobileAlertStatusMonitor';
import { BackendControlPanel } from '../components/BackendControlPanel';
import { PushNotificationSetup } from '../components/PushNotificationSetup';
import { useRockfallDataGenerator } from '../hooks/useRockfallDataGenerator';
import { useEnhancedRockfallDetector } from '../hooks/useEnhancedRockfallDetector';
import { useBackendIntegration } from '../hooks/useBackendIntegration';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'alerts' | 'reports' | 'simulation' | 'import' | 'mobile-devices' | 'mobile-status' | 'backend'>('overview');

  // Initialize terrain data integration
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

  // Initialize data generator and detector
  const {
    currentData: simulationData,
    isRunning: isSimulationRunning,
    start: startSimulation,
    stop: stopSimulation
  } = useRockfallDataGenerator();

  const {
    predictions,
    predict: runPrediction,
    isEnabled: isDetectionEnabled
  } = useEnhancedRockfallDetector();

  // Backend integration
  const {
    backendConfig,
    setBackendConfig,
    sendRiskAssessment,
    simulateAlert,
    testAlertSystem,
    isConnected,
    lastResponse,
    error: backendError,
    loading: backendLoading
  } = useBackendIntegration();

  // Use simulation data when available, otherwise use mock data
  const currentZoneData = simulationData && Object.keys(simulationData).length > 0 ? simulationData : null;

  useEffect(() => {
    if (currentZoneData && isDetectionEnabled) {
      runPrediction(currentZoneData);
    }
  }, [currentZoneData, runPrediction, isDetectionEnabled]);

  // Send risk assessment to backend when predictions are updated
  useEffect(() => {
    if (predictions && currentZoneData && backendConfig.enabled) {
      const riskScores = Object.fromEntries(
        Object.entries(predictions).map(([zone, pred]) => [zone, pred.riskScore])
      );
      
      // Send to backend for automatic alert processing
      sendRiskAssessment(currentZoneData, riskScores);
    }
  }, [predictions, currentZoneData, backendConfig.enabled, sendRiskAssessment]);

  // Sync terrain real-time status with overall real-time status
  useEffect(() => {
    setTerrainRealTime(isRealTimeActive);
  }, [isRealTimeActive, setTerrainRealTime]);

  // Enhanced statistics that incorporate terrain data
  const terrainRiskAssessment = getRiskAssessment();
  const overallStats = {
    totalZones: terrainRiskAssessment?.totalZones || analytics.totalSections || 0,
    criticalAlerts: terrainRiskAssessment?.criticalAlerts || analytics.activeCriticalSections || 0,
    highRiskZones: terrainRiskAssessment?.highRiskZones || analytics.sectionsAboveThreshold || 0,
    overallRiskScore: terrainRiskAssessment?.overallRiskScore || analytics.averageRiskScore || 0,
    lastUpdate: terrainRiskAssessment?.lastUpdate || new Date().toISOString(),
    simulationStatus: isSimulationRunning ? 'Running' : 'Stopped',
    detectionAccuracy: 95, // Enhanced with terrain analysis
    sectionsAboveThreshold: analytics.sectionsAboveThreshold
  };

  const handleDataSourceChange = (source: any) => {
    console.log('Data source changed:', source);
    if (source.type === 'simulated') {
      if (isRealTimeActive) {
        startSimulation();
      }
    } else {
      stopSimulation();
    }
  };

  const handleSimulationToggle = (enabled: boolean) => {
    if (enabled) {
      startSimulation();
    } else {
      stopSimulation();
    }
  };

  const handleDataImport = (data: any) => {
    console.log('Data imported:', data);
    // Handle imported data integration
  };

  const handleAlertTriggered = (alert: any) => {
    console.log('Alert triggered:', alert);
    // Handle alert processing
  };

  const handleAnalysisComplete = (analysis: any) => {
    console.log('Analysis complete:', analysis);
    // Handle analysis results
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
              <p className="text-2xl font-bold text-navy-600">{overallStats.overallRiskScore.toFixed(3)}</p>
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
            { key: 'simulation', label: 'Simulation', icon: Zap },
            { key: 'analysis', label: 'Analysis', icon: Camera },
            { key: 'alerts', label: 'Alerts', icon: AlertTriangle },
            { key: 'mobile-devices', label: 'Mobile Devices', icon: Smartphone },
            { key: 'mobile-status', label: 'Alert Status', icon: Activity },
            { key: 'backend', label: 'Backend', icon: ExternalLink },
            { key: 'import', label: 'Data Import', icon: Database },
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
            <div className="h-80 sm:h-96 lg:h-[500px]">
              <CustomTopographicalMap 
                onZoneSelect={(zoneId) => {
                  setSelectedZone(zoneId);
                  const sectionData = getSectionData(zoneId);
                  if (sectionData) {
                    console.log('Selected section:', sectionData);
                  }
                }}
                onDataUpdate={updateTerrainData}
                simulationThresholds={simulationThresholds}
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
            <AlertsPanel 
              availableSections={terrainMaps.flatMap(terrain => 
                terrain.sections.map(section => ({
                  id: section.id,
                  name: section.name,
                  terrainName: terrain.name
                }))
              )}
            />
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
                <span className="hidden sm:inline">Section Details: </span>
                <span className="sm:hidden">Section: </span>
                {getSectionData(selectedZone)?.name || selectedZone}
              </h3>
              {(() => {
                const sectionData = getSectionData(selectedZone);
                if (sectionData) {
                  const isAboveThreshold = sectionData.riskScore > simulationThresholds.riskThreshold ||
                                         sectionData.properties.stability < simulationThresholds.stabilityThreshold;
                  
                  return (
                    <div className="space-y-3">
                      {isAboveThreshold && (
                        <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-sm">
                          ⚠️ SECTION ABOVE THRESHOLD
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm sm:text-base">Risk Level:</span>
                        <span className={`font-medium text-sm sm:text-base ${
                          sectionData.riskLevel === 'critical' ? 'text-red-600' :
                          sectionData.riskLevel === 'high' ? 'text-orange-600' :
                          sectionData.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {sectionData.riskLevel.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm sm:text-base">Risk Score:</span>
                        <span className="font-medium text-sm sm:text-base">{sectionData.riskScore.toFixed(1)}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm sm:text-base">Rock Type:</span>
                        <span className="font-medium text-sm sm:text-base">{sectionData.properties.rockType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm sm:text-base">Slope Angle:</span>
                        <span className="font-medium text-sm sm:text-base">{sectionData.properties.slopeAngle.toFixed(1)}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm sm:text-base">Stability:</span>
                        <span className="font-medium text-sm sm:text-base">{(sectionData.properties.stability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm sm:text-base">Displacement:</span>
                        <span className="font-medium text-sm sm:text-base">{sectionData.sensorData.displacement.toFixed(2)}mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm sm:text-base">Last Update:</span>
                        <span className="font-medium text-sm sm:text-base">
                          {new Date(sectionData.sensorData.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                } else {
                  return (
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
                  );
                }
              })()}
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
              alerts={(() => {
                // Generate dynamic alerts from terrain data when available
                if (terrainMaps.length > 0) {
                  const criticalSections = terrainMaps.flatMap(terrain => 
                    terrain.sections.filter(section => 
                      section.riskLevel === 'critical' || 
                      section.riskScore > simulationThresholds.riskThreshold ||
                      section.properties.stability < simulationThresholds.stabilityThreshold
                    ).map(section => ({
                      id: `alert-${section.id}`,
                      zone_id: section.id,
                      zone_name: `${terrain.name} - ${section.name}`,
                      severity: (section.riskLevel === 'critical' ? 'critical' : 'high') as 'critical' | 'high',
                      status: 'active' as const,
                      message: `${section.riskLevel === 'critical' ? 'Critical' : 'High'} risk detected in ${section.name}: displacement ${section.sensorData.displacement.toFixed(2)}mm, stability ${(section.properties.stability * 100).toFixed(1)}%`,
                      risk_probability: section.riskScore / 10,
                      timestamp: section.sensorData.timestamp,
                      predicted_timeline: section.riskLevel === 'critical' ? '6-12 hours' : '24-48 hours',
                      recommended_actions: section.riskLevel === 'critical' ? [
                        `Immediate evacuation of personnel from ${section.name}`,
                        'Establish 150m safety perimeter',
                        'Deploy additional monitoring sensors',
                        'Contact emergency response team'
                      ] : [
                        'Increase monitoring frequency',
                        'Review slope stability calculations',
                        'Install additional sensors if needed'
                      ],
                      affected_personnel: Math.floor(Math.random() * 10) + 1,
                      equipment_at_risk: [`Equipment in ${section.name}`, 'Mobile Platform', 'Survey Equipment']
                    }))
                  );
                  
                  if (criticalSections.length > 0) {
                    return criticalSections.slice(0, 5); // Limit to 5 most critical
                  }
                }
                
                // Fallback to sample alerts if no terrain data
                return [
                  {
                    id: 'alert-001',
                    zone_id: 'zone-1',
                    zone_name: 'North Bench Level 1200m',
                    severity: 'critical' as const,
                    status: 'active' as const,
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
                    severity: 'high' as const,
                    status: 'acknowledged' as const,
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
                ];
              })()}
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

      {/* Simulation Tab */}
      {activeTab === 'simulation' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <DataFlowControl
            onDataSourceChange={handleDataSourceChange}
            onSimulationToggle={handleSimulationToggle}
            onDataImport={handleDataImport}
          />

          {/* Terrain Threshold Controls */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Terrain Analysis Thresholds</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Threshold ({(simulationThresholds.riskThreshold * 10).toFixed(1)}/10)
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
                  Alert Threshold ({(simulationThresholds.alertThreshold * 100).toFixed(0)}%)
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="1"
                  value={simulationThresholds.alertThreshold * 100}
                  onChange={(e) => updateSimulationThresholds({ 
                    alertThreshold: parseFloat(e.target.value) / 100 
                  })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stability Threshold ({(simulationThresholds.stabilityThreshold * 100).toFixed(0)}%)
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Displacement Limit ({simulationThresholds.displacementThreshold.toFixed(1)}mm)
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={simulationThresholds.displacementThreshold}
                  onChange={(e) => updateSimulationThresholds({ 
                    displacementThreshold: parseFloat(e.target.value) 
                  })}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Sections above threshold:</strong> {analytics.sectionsAboveThreshold || 0} sections are currently exceeding one or more thresholds.
                Adjust thresholds to see real-time changes in the terrain map.
              </p>
            </div>
          </div>
          
          {/* Simulation Status Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulation Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    overallStats.simulationStatus === 'Running' 
                      ? 'bg-safe-100 text-safe-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {overallStats.simulationStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Detection Accuracy:</span>
                  <span className="font-medium">{overallStats.detectionAccuracy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Zones:</span>
                  <span className="font-medium">{overallStats.totalZones}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Predictions</h3>
              {predictions && Object.keys(predictions).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(predictions).slice(0, 3).map(([zoneId, prediction]) => (
                    <div key={zoneId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{zoneId.replace('-', ' ').toUpperCase()}</p>
                        <p className="text-xs text-gray-500">Confidence: {prediction.confidence}%</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        prediction.riskLevel === 'critical' ? 'bg-danger-100 text-danger-700' :
                        prediction.riskLevel === 'high' ? 'bg-warning-100 text-warning-700' :
                        prediction.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-safe-100 text-safe-700'
                      }`}>
                        {prediction.riskLevel.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No predictions available</p>
              )}
            </div>
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
          <AlertManagementSystem
            onAlertTriggered={handleAlertTriggered}
            currentZoneData={currentZoneData || undefined}
          />
        </motion.div>
      )}

      {/* Data Import Tab */}
      {activeTab === 'import' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <DataImportAnalysis
            onDataImported={handleDataImport}
            onAnalysisComplete={handleAnalysisComplete}
          />
        </motion.div>
      )}

      {/* Mobile Device Management Tab */}
      {activeTab === 'mobile-devices' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <MobileDeviceRegistration
            onDeviceRegistered={(deviceId) => {
              console.log('Device registered:', deviceId);
              // You can add additional logic here
            }}
          />
        </motion.div>
      )}

      {/* Mobile Alert Status Tab */}
      {activeTab === 'mobile-status' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <MobileAlertStatusMonitor refreshInterval={5000} />
        </motion.div>
      )}

      {/* Backend Integration Tab */}
      {activeTab === 'backend' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <BackendControlPanel
            config={backendConfig}
            onConfigChange={setBackendConfig}
            isConnected={isConnected}
            error={backendError}
            loading={backendLoading}
            onSimulateAlert={simulateAlert}
            onTestAlertSystem={testAlertSystem}
            lastResponse={lastResponse}
            availableSections={terrainMaps.flatMap(terrain => 
              terrain.sections.map(section => ({
                id: section.id,
                name: section.name,
                terrainName: terrain.name
              }))
            )}
          />
          {backendConfig.enabled && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Browser Push Registration</h4>
              <p className="text-xs text-gray-500 mb-3">Enable this browser tab to receive vibration + push alerts without SMS cost.</p>
              {/* For now deviceId not linked; later can map to a registered miner device */}
              <PushNotificationSetup
                backendUrl={backendConfig.baseUrl}
                apiKey={backendConfig.apiKey}
              />
            </div>
          )}
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
