import { useState, useCallback } from 'react';

interface BackendConfig {
  baseUrl: string;
  apiKey: string;
  enabled: boolean;
}

interface AlertResponse {
  success: boolean;
  processed: number;
  alerts: Array<{
    id: string;
    zoneId: string;
    zoneName: string;
    severity: 'HIGH' | 'CRITICAL' | 'EMERGENCY';
    riskScore: number;
    message: string;
    deliveryCount: number;
  }>;
  maxRiskScore: number;
  timestamp: string;
}

interface SimulationHookReturn {
  backendConfig: BackendConfig;
  setBackendConfig: (config: BackendConfig) => void;
  sendRiskAssessment: (zoneData: any, riskScores: any) => Promise<AlertResponse | null>;
  simulateAlert: (zoneId: string, severity: string) => Promise<boolean>;
  testAlertSystem: () => Promise<boolean>;
  isConnected: boolean;
  lastResponse: AlertResponse | null;
  error: string | null;
  loading: boolean;
}

export const useBackendIntegration = (): SimulationHookReturn => {
  const [backendConfig, setBackendConfig] = useState<BackendConfig>({
    baseUrl: 'http://localhost:3001',
    apiKey: 'demo-api-key',
    enabled: false
  });

  const [isConnected, setIsConnected] = useState(false);
  const [lastResponse, setLastResponse] = useState<AlertResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const makeRequest = useCallback(async (endpoint: string, data?: any) => {
    if (!backendConfig.enabled) {
      console.log('🔄 Backend integration disabled, using simulation mode');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${backendConfig.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': backendConfig.apiKey
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setIsConnected(true);
      return result;

    } catch (err) {
      console.error('❌ Backend request failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsConnected(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [backendConfig]);

  const sendRiskAssessment = useCallback(async (zoneData: any, riskScores: any): Promise<AlertResponse | null> => {
    console.log('📊 Sending risk assessment to backend:', {
      zones: Object.keys(zoneData || {}),
      maxRisk: Math.max(...Object.values(riskScores || {}).map(v => Number(v) || 0)),
      enabled: backendConfig.enabled
    });

    const response = await makeRequest('/api/simulation/monitor-risk', {
      zoneData,
      riskScores,
      timestamp: new Date().toISOString()
    });

    if (response) {
      setLastResponse(response);
      console.log('✅ Backend response:', {
        processed: response.processed,
        maxRisk: response.maxRiskScore,
        alerts: response.alerts?.length || 0
      });
    }

    return response;
  }, [makeRequest]);

  const simulateAlert = useCallback(async (zoneId: string, severity: string): Promise<boolean> => {
    console.log('🚨 Simulating manual alert:', { zoneId, severity });

    const response = await makeRequest('/api/alerts/manual', {
      zoneId,
      severity,
      message: `Manual alert simulation for ${zoneId} - ${severity} level`,
      type: 'manual_simulation'
    });

    return response?.success || false;
  }, [makeRequest]);

  const testAlertSystem = useCallback(async (): Promise<boolean> => {
    console.log('🧪 Testing alert system...');

    const response = await makeRequest('/api/alerts/test', {
      type: 'system_test',
      message: 'Alert system test - all notification channels',
      testAllChannels: true
    });

    return response?.success || false;
  }, [makeRequest]);

  return {
    backendConfig,
    setBackendConfig,
    sendRiskAssessment,
    simulateAlert,
    testAlertSystem,
    isConnected,
    lastResponse,
    error,
    loading
  };
};