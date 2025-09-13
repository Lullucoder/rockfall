import { useState, useEffect, useCallback } from 'react';

interface TerrainSection {
  id: string;
  name: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  riskScore: number;
  coordinates: any[];
  center: any;
  properties: {
    rockType: string;
    slopeAngle: number;
    stability: number;
    weatherResistance: number;
    fractureDensity: number;
    waterContent: number;
    lastInspection: string;
    alertThreshold: number;
  };
  sensorData: {
    displacement: number;
    vibration: number;
    temperature: number;
    humidity: number;
    timestamp: string;
  };
}

interface TerrainMap {
  id: string;
  centerPoint: any;
  name: string;
  sections: TerrainSection[];
  createdAt: string;
  metadata: {
    totalArea: number;
    averageRisk: number;
    criticalSections: number;
  };
}

interface SimulationThresholds {
  riskThreshold: number;
  alertThreshold: number;
  stabilityThreshold: number;
  displacementThreshold: number;
  vibrationThreshold: number;
}

interface TerrainAnalytics {
  totalSections: number;
  activeCriticalSections: number;
  averageRiskScore: number;
  sectionsAboveThreshold: number;
  recentAlerts: Array<{
    sectionId: string;
    sectionName: string;
    alertType: string;
    timestamp: string;
    severity: string;
  }>;
  riskTrends: {
    increasing: string[];
    stable: string[];
    decreasing: string[];
  };
}

export const useTerrainDataIntegration = () => {
  const [terrainMaps, setTerrainMaps] = useState<TerrainMap[]>([]);
  const [simulationThresholds, setSimulationThresholds] = useState<SimulationThresholds>({
    riskThreshold: 7.0,
    alertThreshold: 0.8,
    stabilityThreshold: 0.6,
    displacementThreshold: 5.0,
    vibrationThreshold: 3.0
  });
  const [analytics, setAnalytics] = useState<TerrainAnalytics>({
    totalSections: 0,
    activeCriticalSections: 0,
    averageRiskScore: 0,
    sectionsAboveThreshold: 0,
    recentAlerts: [],
    riskTrends: {
      increasing: [],
      stable: [],
      decreasing: []
    }
  });
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);

  // Calculate analytics from terrain data
  const calculateAnalytics = useCallback((maps: TerrainMap[], thresholds: SimulationThresholds): TerrainAnalytics => {
    const allSections = maps.flatMap(map => map.sections);
    
    if (allSections.length === 0) {
      return {
        totalSections: 0,
        activeCriticalSections: 0,
        averageRiskScore: 0,
        sectionsAboveThreshold: 0,
        recentAlerts: [],
        riskTrends: { increasing: [], stable: [], decreasing: [] }
      };
    }

    const criticalSections = allSections.filter(s => s.riskLevel === 'critical').length;
    const averageRisk = allSections.reduce((sum, s) => sum + s.riskScore, 0) / allSections.length;
    const aboveThreshold = allSections.filter(s => 
      s.riskScore > thresholds.riskThreshold ||
      s.properties.stability < thresholds.stabilityThreshold ||
      s.sensorData.displacement > thresholds.displacementThreshold ||
      s.sensorData.vibration > thresholds.vibrationThreshold
    ).length;

    // Generate recent alerts for sections above threshold
    const recentAlerts = allSections
      .filter(s => s.riskScore > thresholds.riskThreshold)
      .slice(0, 5)
      .map(s => ({
        sectionId: s.id,
        sectionName: s.name,
        alertType: s.riskScore > 8 ? 'Critical Risk' : 'High Risk',
        timestamp: s.sensorData.timestamp,
        severity: s.riskLevel
      }));

    // Simple risk trend calculation (could be enhanced with historical data)
    const riskTrends = {
      increasing: allSections.filter(s => s.riskScore > 7).map(s => s.name),
      stable: allSections.filter(s => s.riskScore >= 4 && s.riskScore <= 7).map(s => s.name),
      decreasing: allSections.filter(s => s.riskScore < 4).map(s => s.name)
    };

    return {
      totalSections: allSections.length,
      activeCriticalSections: criticalSections,
      averageRiskScore: averageRisk,
      sectionsAboveThreshold: aboveThreshold,
      recentAlerts,
      riskTrends
    };
  }, []);

  // Update terrain data
  const updateTerrainData = useCallback((newTerrainMaps: TerrainMap[]) => {
    setTerrainMaps(newTerrainMaps);
    const newAnalytics = calculateAnalytics(newTerrainMaps, simulationThresholds);
    setAnalytics(newAnalytics);
  }, [calculateAnalytics, simulationThresholds]);

  // Update simulation thresholds
  const updateSimulationThresholds = useCallback((newThresholds: Partial<SimulationThresholds>) => {
    const updatedThresholds = { ...simulationThresholds, ...newThresholds };
    setSimulationThresholds(updatedThresholds);
    
    // Recalculate analytics with new thresholds
    const newAnalytics = calculateAnalytics(terrainMaps, updatedThresholds);
    setAnalytics(newAnalytics);
  }, [simulationThresholds, terrainMaps, calculateAnalytics]);

  // Simulate real-time data updates
  useEffect(() => {
    if (!isRealTimeActive || terrainMaps.length === 0) return;

    const interval = setInterval(() => {
      const updatedMaps = terrainMaps.map(map => ({
        ...map,
        sections: map.sections.map(section => ({
          ...section,
          sensorData: {
            ...section.sensorData,
            displacement: Math.max(0, section.sensorData.displacement + (Math.random() - 0.5) * 0.5),
            vibration: Math.max(0, section.sensorData.vibration + (Math.random() - 0.5) * 0.2),
            temperature: section.sensorData.temperature + (Math.random() - 0.5) * 2,
            humidity: Math.max(0, Math.min(100, section.sensorData.humidity + (Math.random() - 0.5) * 5)),
            timestamp: new Date().toISOString()
          }
        }))
      }));

      setTerrainMaps(updatedMaps);
      const newAnalytics = calculateAnalytics(updatedMaps, simulationThresholds);
      setAnalytics(newAnalytics);

      // Save to localStorage
      localStorage.setItem('customTerrainMaps', JSON.stringify(updatedMaps));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isRealTimeActive, terrainMaps, simulationThresholds, calculateAnalytics]);

  // Get sections for a specific zone (for compatibility with existing zone selection)
  const getSectionData = useCallback((zoneId: string) => {
    const section = terrainMaps
      .flatMap(map => map.sections)
      .find(s => s.id === zoneId);
    return section;
  }, [terrainMaps]);

  // Get all sections as a flat array (for use in other components)
  const getAllSections = useCallback(() => {
    return terrainMaps.flatMap(map => map.sections);
  }, [terrainMaps]);

  // Get risk assessment for dashboard display
  const getRiskAssessment = useCallback(() => {
    const sections = getAllSections();
    if (sections.length === 0) return null;

    return {
      totalZones: sections.length,
      criticalAlerts: analytics.activeCriticalSections,
      highRiskZones: sections.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length,
      overallRiskScore: analytics.averageRiskScore,
      lastUpdate: new Date().toISOString(),
      sectionsAboveThreshold: analytics.sectionsAboveThreshold
    };
  }, [getAllSections, analytics]);

  return {
    // Data
    terrainMaps,
    simulationThresholds,
    analytics,
    isRealTimeActive,
    
    // Actions
    updateTerrainData,
    updateSimulationThresholds,
    setIsRealTimeActive,
    
    // Utilities
    getSectionData,
    getAllSections,
    getRiskAssessment
  };
};