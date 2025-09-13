import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  Wifi, 
  WifiOff, 
  Settings, 
  TestTube, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

interface BackendConfig {
  baseUrl: string;
  apiKey: string;
  enabled: boolean;
}

interface BackendControlPanelProps {
  config: BackendConfig;
  onConfigChange: (config: BackendConfig) => void;
  isConnected: boolean;
  error: string | null;
  loading: boolean;
  onSimulateAlert: (zoneId: string, severity: string) => Promise<boolean>;
  onTestAlertSystem: () => Promise<boolean>;
  lastResponse: any;
  availableSections?: Array<{
    id: string;
    name: string;
    terrainName: string;
  }>;
}

export const BackendControlPanel: React.FC<BackendControlPanelProps> = ({
  config,
  onConfigChange,
  isConnected,
  error,
  loading,
  onSimulateAlert,
  onTestAlertSystem,
  lastResponse,
  availableSections = []
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [localConfig, setLocalConfig] = useState(config);
  const [testing, setTesting] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('HIGH');

  const handleSaveConfig = () => {
    onConfigChange(localConfig);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const response = await fetch(`${localConfig.baseUrl}/api/simulation/status`, {
        headers: {
          'X-API-Key': localConfig.apiKey
        }
      });
      
      if (response.ok) {
        console.log('✅ Backend connection test successful');
      } else {
        console.error('❌ Backend connection test failed');
      }
    } catch (err) {
      console.error('❌ Connection test error:', err);
    } finally {
      setTesting(false);
    }
  };

  const handleSimulateAlert = async () => {
    setSimulating(true);
    try {
      // Use selected section or fallback to default
      const sectionId = selectedSection || availableSections[0]?.id || 'zone-1';
      const sectionName = availableSections.find(s => s.id === sectionId)?.name || 'Default Zone';
      
      const success = await onSimulateAlert(sectionId, selectedSeverity);
      console.log(`🚨 Manual alert simulation for "${sectionName}":`, success ? 'Success' : 'Failed');
    } finally {
      setSimulating(false);
    }
  };

  const handleTestAlertSystem = async () => {
    setTesting(true);
    try {
      const success = await onTestAlertSystem();
      console.log('🧪 Alert system test:', success ? 'Success' : 'Failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Server className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Backend Integration</h3>
          <p className="text-sm text-gray-600">Configure real-time alert system</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
          {config.enabled ? (
            isConnected ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm font-medium">Disconnected</span>
              </div>
            )
          ) : (
            <div className="flex items-center gap-1 text-gray-500">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Disabled</span>
            </div>
          )}
        </div>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Backend URL
          </label>
          <input
            type="text"
            value={localConfig.baseUrl}
            onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="http://localhost:3001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={localConfig.apiKey}
              onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter API key"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Enable Backend Integration</h4>
          <p className="text-sm text-gray-600">Automatically send alerts when risk thresholds are exceeded</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={localConfig.enabled}
            onChange={(e) => setLocalConfig({ ...localConfig, enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Action Buttons */}
      {/* Alert Simulation Controls */}
      {config.enabled && availableSections.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Alert Simulation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Select Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a section...</option>
                {availableSections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.terrainName} - {section.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Alert Severity
              </label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSaveConfig}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Save Configuration
        </button>

        <button
          onClick={handleTestConnection}
          disabled={testing || !localConfig.baseUrl}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
          Test Connection
        </button>

        {config.enabled && (
          <>
            <button
              onClick={handleSimulateAlert}
              disabled={simulating || !isConnected}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {simulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
              Simulate Alert
            </button>

            <button
              onClick={handleTestAlertSystem}
              disabled={testing || !isConnected}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
              Test Alert System
            </button>
          </>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {lastResponse && config.enabled && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-800">Last Backend Response</span>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <div>Processed: {lastResponse.processed} alerts</div>
            <div>Max Risk Score: {lastResponse.maxRiskScore?.toFixed(1) || 'N/A'}</div>
            <div>Timestamp: {new Date(lastResponse.timestamp).toLocaleTimeString()}</div>
            {lastResponse.alerts && lastResponse.alerts.length > 0 && (
              <div className="mt-2">
                <strong>Triggered Alerts:</strong>
                <ul className="list-disc list-inside ml-2">
                  {lastResponse.alerts.map((alert: any, index: number) => (
                    <li key={index}>
                      {alert.zoneName} - {alert.severity} (Risk: {alert.riskScore?.toFixed(1)})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li><strong>Automatic Alerts:</strong> When simulation risk scores exceed thresholds (High: 7.5, Critical: 8.5, Emergency: 9.0)</li>
          <li><strong>Manual Testing:</strong> Use "Simulate Alert" to test specific zone alerts</li>
          <li><strong>System Testing:</strong> Use "Test Alert System" to verify all notification channels</li>
          <li><strong>Real-time Monitoring:</strong> Backend processes risk data and sends alerts via SMS, email, and push notifications</li>
        </ul>
      </div>
    </motion.div>
  );
};