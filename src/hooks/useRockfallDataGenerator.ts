import { useState, useEffect, useCallback } from 'react';

export interface SensorReading {
  timestamp: number;
  displacement: number;      // mm
  strain: number;           // microstrains
  porePressure: number;     // kPa
  temperature: number;      // °C
  vibration: number;        // Hz
  rainfall: number;         // mm/hr
  windSpeed: number;        // m/s
  soilMoisture: number;     // %
  tiltAngle: number;        // degrees
}

export interface ZoneData {
  zoneId: string;
  zoneName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastReading: SensorReading;
  trend: 'improving' | 'stable' | 'worsening' | 'critical';
  confidence: number; // 0-100%
}

interface SimulationParams {
  speed: number;
  quality: 'low' | 'medium' | 'high';
  noiseLevel: 'minimal' | 'realistic' | 'high';
  scenarioType: 'normal' | 'warning' | 'emergency';
}

class RockfallDataGenerator {
  private baseValues: Record<string, SensorReading>;
  private timeOffset: number;
  private trends: Record<string, Record<keyof SensorReading, number>>;

  constructor() {
    this.timeOffset = 0;
    this.baseValues = {
      'zone-1': this.generateBaseReading(),
      'zone-2': this.generateBaseReading(),
      'zone-3': this.generateBaseReading(),
      'zone-4': this.generateBaseReading(),
      'zone-5': this.generateBaseReading(),
      'zone-6': this.generateBaseReading(),
    };
    this.trends = this.initializeTrends();
  }

  private generateBaseReading(): SensorReading {
    return {
      timestamp: Date.now(),
      displacement: this.randomInRange(0, 5), // Normal displacement 0-5mm
      strain: this.randomInRange(50, 200), // Normal strain 50-200 microstrains
      porePressure: this.randomInRange(100, 300), // Normal pore pressure 100-300 kPa
      temperature: this.randomInRange(15, 25), // Normal temperature 15-25°C
      vibration: this.randomInRange(0.1, 2.0), // Normal vibration 0.1-2.0 Hz
      rainfall: this.randomInRange(0, 10), // Normal rainfall 0-10 mm/hr
      windSpeed: this.randomInRange(0, 15), // Normal wind 0-15 m/s
      soilMoisture: this.randomInRange(20, 40), // Normal soil moisture 20-40%
      tiltAngle: this.randomInRange(-2, 2), // Normal tilt -2 to 2 degrees
    };
  }

  private initializeTrends(): Record<string, Record<keyof SensorReading, number>> {
    const trends: Record<string, Record<keyof SensorReading, number>> = {};
    
    Object.keys(this.baseValues).forEach(zoneId => {
      trends[zoneId] = {
        timestamp: 0,
        displacement: this.randomInRange(-0.1, 0.1),
        strain: this.randomInRange(-2, 2),
        porePressure: this.randomInRange(-5, 5),
        temperature: this.randomInRange(-0.5, 0.5),
        vibration: this.randomInRange(-0.05, 0.05),
        rainfall: this.randomInRange(-1, 1),
        windSpeed: this.randomInRange(-1, 1),
        soilMoisture: this.randomInRange(-1, 1),
        tiltAngle: this.randomInRange(-0.1, 0.1),
      };
    });

    return trends;
  }

  private randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private addNoise(value: number, noiseLevel: string): number {
    const noiseFactors = {
      minimal: 0.02,
      realistic: 0.05,
      high: 0.1
    };
    
    const noiseFactor = noiseFactors[noiseLevel as keyof typeof noiseFactors] || 0.05;
    const noise = (Math.random() - 0.5) * 2 * noiseFactor * value;
    return value + noise;
  }

  private simulateRockfallEvent(reading: SensorReading, severity: number): SensorReading {
    // Simulate precursor patterns that indicate potential rockfall
    const eventFactor = Math.sin(this.timeOffset / 1000) * severity;
    
    return {
      ...reading,
      displacement: Math.max(0, reading.displacement + eventFactor * 20), // Increased displacement
      strain: Math.max(0, reading.strain + eventFactor * 500), // High strain
      porePressure: Math.max(0, reading.porePressure + eventFactor * 200), // Pressure buildup
      vibration: Math.max(0, reading.vibration + eventFactor * 10), // Increased vibration
      tiltAngle: reading.tiltAngle + eventFactor * 5, // Slope instability
    };
  }

  private applyWeatherEffects(reading: SensorReading): SensorReading {
    // Simulate weather-related effects on slope stability
    const weatherSeverity = Math.max(0, reading.rainfall / 50 + reading.windSpeed / 30);
    
    if (weatherSeverity > 0.3) {
      return {
        ...reading,
        porePressure: reading.porePressure * (1 + weatherSeverity * 0.5),
        soilMoisture: Math.min(100, reading.soilMoisture * (1 + weatherSeverity)),
        displacement: reading.displacement * (1 + weatherSeverity * 0.3),
      };
    }

    return reading;
  }

  generateReading(
    zoneId: string, 
    params: SimulationParams,
    forceEvent: boolean = false
  ): SensorReading {
    this.timeOffset += 1000 * params.speed; // Advance time based on speed

    let reading = { ...this.baseValues[zoneId] };
    reading.timestamp = Date.now();

    // Apply trends for realistic drift
    const trend = this.trends[zoneId];
    Object.keys(trend).forEach(key => {
      if (key !== 'timestamp') {
        const trendKey = key as keyof SensorReading;
        (reading[trendKey] as number) += trend[trendKey] * params.speed;
      }
    });

    // Apply scenario-specific modifications
    switch (params.scenarioType) {
      case 'warning':
        reading = this.simulateRockfallEvent(reading, 0.3);
        break;
      case 'emergency':
        reading = this.simulateRockfallEvent(reading, 0.8);
        break;
    }

    // Force an event if requested
    if (forceEvent) {
      reading = this.simulateRockfallEvent(reading, 1.0);
    }

    // Apply weather effects
    reading = this.applyWeatherEffects(reading);

    // Add noise based on quality setting
    const invertedQualityNoise = {
      high: 'minimal',
      medium: 'realistic',
      low: 'high'
    } as const;
    
    const noiseLevel = invertedQualityNoise[params.quality];
    
    Object.keys(reading).forEach(key => {
      if (key !== 'timestamp') {
        const readingKey = key as keyof SensorReading;
        (reading[readingKey] as number) = this.addNoise(
          reading[readingKey] as number, 
          noiseLevel
        );
      }
    });

    // Update base values for continuity
    this.baseValues[zoneId] = { ...reading };

    // Clamp values to realistic ranges
    reading.displacement = Math.max(0, Math.min(100, reading.displacement));
    reading.strain = Math.max(0, Math.min(2000, reading.strain));
    reading.porePressure = Math.max(0, Math.min(1000, reading.porePressure));
    reading.temperature = Math.max(-20, Math.min(50, reading.temperature));
    reading.vibration = Math.max(0, Math.min(50, reading.vibration));
    reading.rainfall = Math.max(0, Math.min(200, reading.rainfall));
    reading.windSpeed = Math.max(0, Math.min(100, reading.windSpeed));
    reading.soilMoisture = Math.max(0, Math.min(100, reading.soilMoisture));
    reading.tiltAngle = Math.max(-45, Math.min(45, reading.tiltAngle));

    return reading;
  }

  calculateRiskLevel(reading: SensorReading): 'low' | 'medium' | 'high' | 'critical' {
    // Advanced risk calculation based on multiple factors
    let riskScore = 0;

    // Displacement risk (0-30 points)
    if (reading.displacement > 50) riskScore += 30;
    else if (reading.displacement > 20) riskScore += 20;
    else if (reading.displacement > 10) riskScore += 10;

    // Strain risk (0-25 points)
    if (reading.strain > 1000) riskScore += 25;
    else if (reading.strain > 500) riskScore += 15;
    else if (reading.strain > 300) riskScore += 8;

    // Pore pressure risk (0-20 points)
    if (reading.porePressure > 600) riskScore += 20;
    else if (reading.porePressure > 400) riskScore += 12;
    else if (reading.porePressure > 300) riskScore += 6;

    // Vibration risk (0-15 points)
    if (reading.vibration > 20) riskScore += 15;
    else if (reading.vibration > 10) riskScore += 10;
    else if (reading.vibration > 5) riskScore += 5;

    // Environmental factors (0-10 points)
    if (reading.rainfall > 50 && reading.soilMoisture > 80) riskScore += 10;
    else if (reading.rainfall > 25 || reading.soilMoisture > 60) riskScore += 5;

    // Tilt angle risk (0-10 points)
    if (Math.abs(reading.tiltAngle) > 15) riskScore += 10;
    else if (Math.abs(reading.tiltAngle) > 8) riskScore += 6;
    else if (Math.abs(reading.tiltAngle) > 4) riskScore += 3;

    // Determine risk level
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 50) return 'high';
    if (riskScore >= 25) return 'medium';
    return 'low';
  }

  generateZoneData(zoneId: string, params: SimulationParams): ZoneData {
    const reading = this.generateReading(zoneId, params);
    const riskLevel = this.calculateRiskLevel(reading);
    
    // Calculate trend based on recent history
    const trend = this.calculateTrend(zoneId, reading);
    
    // Calculate confidence based on data quality and sensor status
    const confidence = this.calculateConfidence(params.quality, reading);

    const zoneNames = {
      'zone-1': 'North Face Alpha',
      'zone-2': 'South Wall Beta',
      'zone-3': 'East Slope Gamma',
      'zone-4': 'West Ridge Delta',
      'zone-5': 'Central Pit Epsilon',
      'zone-6': 'Access Road Zeta'
    };

    return {
      zoneId,
      zoneName: zoneNames[zoneId as keyof typeof zoneNames] || `Zone ${zoneId}`,
      riskLevel,
      lastReading: reading,
      trend,
      confidence
    };
  }

  private calculateTrend(
    zoneId: string, 
    _currentReading: SensorReading
  ): 'improving' | 'stable' | 'worsening' | 'critical' {
    const trend = this.trends[zoneId];
    
    // Calculate overall trend score
    const trendScore = 
      trend.displacement * 0.3 +
      trend.strain * 0.25 +
      trend.porePressure * 0.2 +
      trend.vibration * 0.15 +
      Math.abs(trend.tiltAngle) * 0.1;

    if (trendScore > 5) return 'critical';
    if (trendScore > 2) return 'worsening';
    if (trendScore > -1) return 'stable';
    return 'improving';
  }

  private calculateConfidence(quality: string, reading: SensorReading): number {
    const baseConfidence = {
      high: 95,
      medium: 85,
      low: 70
    };

    let confidence = baseConfidence[quality as keyof typeof baseConfidence];

    // Reduce confidence for extreme values (sensor might be malfunctioning)
    if (reading.displacement > 80 || reading.strain > 1500) {
      confidence -= 20;
    }

    // Environmental factors can affect sensor accuracy
    if (reading.temperature < -10 || reading.temperature > 40) {
      confidence -= 10;
    }

    return Math.max(30, Math.min(100, confidence));
  }

  triggerEmergencyScenario(): void {
    // Modify trends to simulate cascading failure
    Object.keys(this.trends).forEach(zoneId => {
      this.trends[zoneId].displacement += this.randomInRange(1, 3);
      this.trends[zoneId].strain += this.randomInRange(10, 30);
      this.trends[zoneId].vibration += this.randomInRange(0.5, 2);
    });
  }

  resetSimulation(): void {
    this.timeOffset = 0;
    this.baseValues = {
      'zone-1': this.generateBaseReading(),
      'zone-2': this.generateBaseReading(),
      'zone-3': this.generateBaseReading(),
      'zone-4': this.generateBaseReading(),
      'zone-5': this.generateBaseReading(),
      'zone-6': this.generateBaseReading(),
    };
    this.trends = this.initializeTrends();
  }
}

// Hook for using the data generator
export const useRockfallDataGenerator = () => {
  const [generator] = useState(() => new RockfallDataGenerator());
  const [isRunning, setIsRunning] = useState(false);
  const [currentData, setCurrentData] = useState<Record<string, ZoneData>>({});
  const [simulationParams, setSimulationParams] = useState<SimulationParams>({
    speed: 1,
    quality: 'medium',
    noiseLevel: 'realistic',
    scenarioType: 'normal'
  });

  const generateData = useCallback(() => {
    if (!isRunning) return;

    const newData: Record<string, ZoneData> = {};
    const zones = ['zone-1', 'zone-2', 'zone-3', 'zone-4', 'zone-5', 'zone-6'];
    
    zones.forEach(zoneId => {
      newData[zoneId] = generator.generateZoneData(zoneId, simulationParams);
    });

    setCurrentData(newData);
  }, [generator, isRunning, simulationParams]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(generateData, 1000 / simulationParams.speed);
    return () => clearInterval(interval);
  }, [generateData, simulationParams.speed, isRunning]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    generator.resetSimulation();
    setCurrentData({});
  }, [generator]);

  const triggerEmergency = useCallback(() => {
    generator.triggerEmergencyScenario();
  }, [generator]);

  const updateParams = useCallback((newParams: Partial<SimulationParams>) => {
    setSimulationParams(prev => ({ ...prev, ...newParams }));
  }, []);

  return {
    currentData,
    isRunning,
    start,
    stop,
    reset,
    triggerEmergency,
    updateParams,
    simulationParams
  };
};