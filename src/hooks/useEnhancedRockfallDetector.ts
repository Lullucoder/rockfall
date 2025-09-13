import { useState, useCallback } from 'react';
import type { SensorReading, ZoneData } from './useRockfallDataGenerator';

interface DetectionModel {
  id: string;
  name: string;
  type: 'statistical' | 'ml' | 'hybrid';
  accuracy: number;
  lastTrained: Date;
  isActive: boolean;
  thresholds: Record<string, number>;
  weights: Record<string, number>;
}

interface PredictionResult {
  zoneId: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  timeToEvent: number | null; // hours until predicted event, null if no event
  factors: Array<{
    parameter: string;
    contribution: number; // -100 to +100
    trend: 'improving' | 'stable' | 'worsening';
    significance: 'low' | 'medium' | 'high';
  }>;
  patterns: string[];
  recommendations: string[];
}

interface HistoricalPattern {
  pattern: string;
  frequency: number;
  severity: number;
  precursors: string[];
  duration: number; // hours
}

class EnhancedRockfallDetector {
  private models: DetectionModel[];
  private historicalData: Map<string, SensorReading[]>;
  private patterns: HistoricalPattern[];
  private learningRate: number;
  private windowSize: number; // Number of readings to consider

  constructor() {
    this.learningRate = 0.01;
    this.windowSize = 100;
    this.historicalData = new Map();
    this.models = this.initializeModels();
    this.patterns = this.initializePatterns();
  }

  private initializeModels(): DetectionModel[] {
    return [
      {
        id: 'statistical-threshold',
        name: 'Statistical Threshold Analysis',
        type: 'statistical',
        accuracy: 85,
        lastTrained: new Date(),
        isActive: true,
        thresholds: {
          displacement: 15.0,
          strain: 800,
          porePressure: 500,
          vibration: 10,
          tiltAngle: 5
        },
        weights: {
          displacement: 0.25,
          strain: 0.20,
          porePressure: 0.20,
          vibration: 0.15,
          tiltAngle: 0.20
        }
      },
      {
        id: 'pattern-recognition',
        name: 'Pattern Recognition Engine',
        type: 'ml',
        accuracy: 92,
        lastTrained: new Date(),
        isActive: true,
        thresholds: {
          patternMatch: 0.8,
          anomalyScore: 0.6,
          trendStrength: 0.7
        },
        weights: {
          historical: 0.4,
          realtime: 0.6
        }
      },
      {
        id: 'hybrid-predictor',
        name: 'Hybrid ML Predictor',
        type: 'hybrid',
        accuracy: 94,
        lastTrained: new Date(),
        isActive: true,
        thresholds: {
          ensembleScore: 0.75,
          confidenceThreshold: 0.8
        },
        weights: {
          statistical: 0.3,
          pattern: 0.4,
          environmental: 0.3
        }
      }
    ];
  }

  private initializePatterns(): HistoricalPattern[] {
    return [
      {
        pattern: 'Gradual_Displacement_Increase',
        frequency: 0.3,
        severity: 0.7,
        precursors: ['increased_strain', 'pore_pressure_buildup'],
        duration: 48
      },
      {
        pattern: 'Rainfall_Induced_Instability',
        frequency: 0.25,
        severity: 0.8,
        precursors: ['high_rainfall', 'soil_saturation', 'increased_pore_pressure'],
        duration: 24
      },
      {
        pattern: 'Vibration_Triggered_Event',
        frequency: 0.15,
        severity: 0.9,
        precursors: ['equipment_vibration', 'blasting_activity', 'structural_resonance'],
        duration: 6
      },
      {
        pattern: 'Temperature_Cycle_Fatigue',
        frequency: 0.2,
        severity: 0.6,
        precursors: ['freeze_thaw_cycles', 'thermal_expansion', 'joint_degradation'],
        duration: 72
      },
      {
        pattern: 'Progressive_Failure',
        frequency: 0.1,
        severity: 1.0,
        precursors: ['multiple_parameter_escalation', 'accelerating_displacement', 'structural_damage'],
        duration: 12
      }
    ];
  }

  addReading(zoneId: string, reading: SensorReading): void {
    if (!this.historicalData.has(zoneId)) {
      this.historicalData.set(zoneId, []);
    }

    const history = this.historicalData.get(zoneId)!;
    history.push(reading);

    // Maintain sliding window
    if (history.length > this.windowSize) {
      history.shift();
    }

    this.historicalData.set(zoneId, history);
  }

  predict(zoneId: string, currentReading: SensorReading): PredictionResult {
    const history = this.historicalData.get(zoneId) || [];
    
    // Ensure we have enough historical data
    if (history.length < 10) {
      return this.createBasicPrediction(zoneId, currentReading);
    }

    // Run all active models
    const modelResults = this.models
      .filter(model => model.isActive)
      .map(model => this.runModel(model, zoneId, currentReading, history));

    // Ensemble prediction
    const ensembleResult = this.combineModelResults(modelResults, zoneId, currentReading);
    
    // Update models based on feedback (simplified online learning)
    this.updateModels(zoneId, currentReading, ensembleResult);

    return ensembleResult;
  }

  private runModel(
    model: DetectionModel, 
    _zoneId: string, 
    currentReading: SensorReading, 
    history: SensorReading[]
  ): Partial<PredictionResult> {
    switch (model.type) {
      case 'statistical':
        return this.runStatisticalModel(model, currentReading, history);
      case 'ml':
        return this.runMLModel(model, currentReading, history);
      case 'hybrid':
        return this.runHybridModel(model, currentReading, history);
      default:
        return { riskScore: 0, confidence: 0 };
    }
  }

  private runStatisticalModel(
    model: DetectionModel, 
    currentReading: SensorReading, 
    history: SensorReading[]
  ): Partial<PredictionResult> {
    let riskScore = 0;
    const factors: PredictionResult['factors'] = [];

    // Threshold-based analysis
    Object.entries(model.thresholds).forEach(([param, threshold]) => {
      const currentValue = currentReading[param as keyof SensorReading] as number;
      if (currentValue !== undefined) {
        const exceedance = Math.max(0, (currentValue - threshold) / threshold);
        const contribution = exceedance * (model.weights[param] || 0) * 100;
        
        riskScore += contribution;
        
        if (contribution > 5) { // Only include significant factors
          factors.push({
            parameter: param,
            contribution,
            trend: this.calculateTrend(param, history),
            significance: contribution > 20 ? 'high' : contribution > 10 ? 'medium' : 'low'
          });
        }
      }
    });

    // Statistical analysis of trends
    const trendAnalysis = this.analyzeTrends(history);
    riskScore += trendAnalysis.riskContribution;

    return {
      riskScore: Math.min(100, riskScore),
      confidence: this.calculateStatisticalConfidence(history),
      factors
    };
  }

  private runMLModel(
    _model: DetectionModel, 
    currentReading: SensorReading, 
    history: SensorReading[]
  ): Partial<PredictionResult> {
    // Pattern matching against known failure patterns
    const patternScores = this.patterns.map(pattern => {
      const matchScore = this.calculatePatternMatch(pattern, history, currentReading);
      return {
        pattern,
        score: matchScore,
        timeToEvent: matchScore > 0.7 ? pattern.duration : null
      };
    });

    const bestMatch = patternScores.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    // Anomaly detection
    const anomalyScore = this.detectAnomalies(history, currentReading);
    
    // Feature extraction and risk calculation
    const features = this.extractFeatures(history, currentReading);
    const mlRiskScore = this.calculateMLRisk(features, bestMatch.score, anomalyScore);

    const patterns: string[] = [];
    if (bestMatch.score > 0.6) {
      patterns.push(bestMatch.pattern.pattern);
    }
    if (anomalyScore > 0.7) {
      patterns.push('Anomalous behavior detected');
    }

    return {
      riskScore: mlRiskScore,
      confidence: this.calculateMLConfidence(bestMatch.score, anomalyScore),
      timeToEvent: bestMatch.timeToEvent,
      patterns
    };
  }

  private runHybridModel(
    model: DetectionModel, 
    currentReading: SensorReading, 
    history: SensorReading[]
  ): Partial<PredictionResult> {
    // Combine statistical and ML approaches
    const statisticalResult = this.runStatisticalModel(this.models[0], currentReading, history);
    const mlResult = this.runMLModel(this.models[1], currentReading, history);

    // Environmental factor analysis
    const environmentalRisk = this.assessEnvironmentalFactors(currentReading, history);

    // Weighted combination
    const hybridRiskScore = 
      (statisticalResult.riskScore || 0) * model.weights.statistical +
      (mlResult.riskScore || 0) * model.weights.pattern +
      environmentalRisk * model.weights.environmental;

    const hybridConfidence = Math.max(
      statisticalResult.confidence || 0,
      mlResult.confidence || 0
    );

    return {
      riskScore: hybridRiskScore,
      confidence: hybridConfidence,
      timeToEvent: mlResult.timeToEvent,
      patterns: mlResult.patterns || [],
      factors: statisticalResult.factors || []
    };
  }

  private combineModelResults(
    modelResults: Partial<PredictionResult>[], 
    zoneId: string, 
    _currentReading: SensorReading
  ): PredictionResult {
    const weightedRiskScore = modelResults.reduce((sum, result, index) => {
      const weight = this.models[index].accuracy / 100;
      return sum + (result.riskScore || 0) * weight;
    }, 0) / modelResults.length;

    const maxConfidence = Math.max(...modelResults.map(r => r.confidence || 0));
    
    const allFactors = modelResults.flatMap(r => r.factors || []);
    const allPatterns = modelResults.flatMap(r => r.patterns || []);
    const timeToEvent = modelResults.find(r => r.timeToEvent !== null)?.timeToEvent || null;

    const riskLevel = this.determineRiskLevel(weightedRiskScore);
    const recommendations = this.generateRecommendations(riskLevel, allFactors, allPatterns);

    return {
      zoneId,
      riskScore: Math.round(weightedRiskScore),
      riskLevel,
      confidence: Math.round(maxConfidence),
      timeToEvent,
      factors: this.consolidateFactors(allFactors),
      patterns: [...new Set(allPatterns)], // Remove duplicates
      recommendations
    };
  }

  private calculateTrend(parameter: string, history: SensorReading[]): 'improving' | 'stable' | 'worsening' {
    if (history.length < 5) return 'stable';

    const recent = history.slice(-5);
    const older = history.slice(-10, -5);

    const recentAvg = recent.reduce((sum, r) => sum + (r[parameter as keyof SensorReading] as number || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, r) => sum + (r[parameter as keyof SensorReading] as number || 0), 0) / older.length;

    const change = (recentAvg - olderAvg) / olderAvg;

    if (change > 0.1) return 'worsening';
    if (change < -0.1) return 'improving';
    return 'stable';
  }

  private analyzeTrends(history: SensorReading[]): { riskContribution: number } {
    if (history.length < 10) return { riskContribution: 0 };

    const parameters = ['displacement', 'strain', 'porePressure', 'vibration', 'tiltAngle'];
    let riskContribution = 0;

    parameters.forEach(param => {
      const trend = this.calculateTrend(param, history);
      if (trend === 'worsening') {
        riskContribution += 10; // Add risk for worsening trends
      }
    });

    return { riskContribution };
  }

  private calculatePatternMatch(
    pattern: HistoricalPattern, 
    _history: SensorReading[], 
    currentReading: SensorReading
  ): number {
    // Simplified pattern matching - in reality, this would be much more sophisticated
    let matchScore = 0;

    // Check for precursor conditions
    pattern.precursors.forEach(precursor => {
      switch (precursor) {
        case 'increased_strain':
          if (currentReading.strain > 500) matchScore += 0.2;
          break;
        case 'pore_pressure_buildup':
          if (currentReading.porePressure > 400) matchScore += 0.2;
          break;
        case 'high_rainfall':
          if (currentReading.rainfall > 25) matchScore += 0.3;
          break;
        case 'soil_saturation':
          if (currentReading.soilMoisture > 80) matchScore += 0.2;
          break;
        case 'equipment_vibration':
          if (currentReading.vibration > 5) matchScore += 0.3;
          break;
        case 'freeze_thaw_cycles':
          if (Math.abs(currentReading.temperature) < 5) matchScore += 0.1;
          break;
        case 'multiple_parameter_escalation':
          let escalatedCount = 0;
          if (currentReading.displacement > 10) escalatedCount++;
          if (currentReading.strain > 600) escalatedCount++;
          if (currentReading.porePressure > 450) escalatedCount++;
          if (escalatedCount >= 2) matchScore += 0.4;
          break;
      }
    });

    return Math.min(1.0, matchScore);
  }

  private detectAnomalies(history: SensorReading[], currentReading: SensorReading): number {
    if (history.length < 20) return 0;

    const parameters = ['displacement', 'strain', 'porePressure', 'vibration', 'tiltAngle'];
    let anomalyScore = 0;

    parameters.forEach(param => {
      const values = history.map(r => r[param as keyof SensorReading] as number).filter(v => v !== undefined);
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      const currentValue = currentReading[param as keyof SensorReading] as number;
      if (currentValue !== undefined) {
        const zScore = Math.abs((currentValue - mean) / stdDev);
        if (zScore > 3) anomalyScore += 0.2; // Highly anomalous
        else if (zScore > 2) anomalyScore += 0.1; // Moderately anomalous
      }
    });

    return Math.min(1.0, anomalyScore);
  }

  private extractFeatures(history: SensorReading[], currentReading: SensorReading): Record<string, number> {
    const features: Record<string, number> = {};

    // Rate of change features
    if (history.length >= 2) {
      const previous = history[history.length - 1];
      features.displacementRate = currentReading.displacement - previous.displacement;
      features.strainRate = currentReading.strain - previous.strain;
      features.pressureRate = currentReading.porePressure - previous.porePressure;
    }

    // Statistical features
    if (history.length >= 10) {
      const recent = history.slice(-10);
      features.displacementMean = recent.reduce((sum, r) => sum + r.displacement, 0) / recent.length;
      features.displacementStd = Math.sqrt(
        recent.reduce((sum, r) => sum + Math.pow(r.displacement - features.displacementMean, 2), 0) / recent.length
      );
    }

    // Environmental correlation features
    features.rainPressureCorr = currentReading.rainfall * currentReading.porePressure / 1000;
    features.tempMoistureCorr = currentReading.temperature * currentReading.soilMoisture / 100;

    return features;
  }

  private calculateMLRisk(
    features: Record<string, number>, 
    patternScore: number, 
    anomalyScore: number
  ): number {
    // Simplified ML risk calculation
    let risk = 0;

    // Feature-based risk
    risk += Math.min(50, (features.displacementRate || 0) * 10);
    risk += Math.min(30, (features.strainRate || 0) * 0.05);
    risk += Math.min(20, (features.pressureRate || 0) * 0.1);

    // Pattern and anomaly contributions
    risk += patternScore * 30;
    risk += anomalyScore * 40;

    return Math.min(100, risk);
  }

  private assessEnvironmentalFactors(currentReading: SensorReading, history: SensorReading[]): number {
    let environmentalRisk = 0;

    // Rainfall intensity
    if (currentReading.rainfall > 50) environmentalRisk += 30;
    else if (currentReading.rainfall > 25) environmentalRisk += 15;

    // Cumulative rainfall
    if (history.length >= 24) { // Last 24 readings
      const cumulativeRain = history.slice(-24).reduce((sum, r) => sum + r.rainfall, 0);
      if (cumulativeRain > 100) environmentalRisk += 20;
    }

    // Temperature extremes
    if (Math.abs(currentReading.temperature) > 35 || currentReading.temperature < -10) {
      environmentalRisk += 10;
    }

    // Soil saturation
    if (currentReading.soilMoisture > 90) environmentalRisk += 15;

    // Wind effects on structures
    if (currentReading.windSpeed > 50) environmentalRisk += 10;

    return Math.min(100, environmentalRisk);
  }

  private determineRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 30) return 'medium';
    return 'low';
  }

  private calculateStatisticalConfidence(history: SensorReading[]): number {
    const baseConfidence = Math.min(90, 50 + history.length * 2); // More data = higher confidence
    return baseConfidence;
  }

  private calculateMLConfidence(patternScore: number, anomalyScore: number): number {
    // High pattern match or high anomaly = high confidence
    return Math.max(patternScore, anomalyScore) * 100;
  }

  private consolidateFactors(factors: PredictionResult['factors']): PredictionResult['factors'] {
    const consolidated = new Map<string, PredictionResult['factors'][0]>();

    factors.forEach(factor => {
      const existing = consolidated.get(factor.parameter);
      if (!existing || Math.abs(factor.contribution) > Math.abs(existing.contribution)) {
        consolidated.set(factor.parameter, factor);
      }
    });

    return Array.from(consolidated.values())
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
      .slice(0, 5); // Top 5 factors
  }

  private generateRecommendations(
    riskLevel: string, 
    factors: PredictionResult['factors'], 
    patterns: string[]
  ): string[] {
    const recommendations: string[] = [];

    switch (riskLevel) {
      case 'critical':
        recommendations.push('IMMEDIATE ACTION REQUIRED: Evacuate personnel from zone');
        recommendations.push('Implement emergency response procedures');
        recommendations.push('Continuous monitoring with 5-minute intervals');
        break;
      case 'high':
        recommendations.push('Increase monitoring frequency to hourly');
        recommendations.push('Restrict access to essential personnel only');
        recommendations.push('Prepare evacuation procedures');
        break;
      case 'medium':
        recommendations.push('Monitor closely with 4-hour intervals');
        recommendations.push('Review and update safety protocols');
        break;
      case 'low':
        recommendations.push('Maintain standard monitoring schedule');
        recommendations.push('Continue routine safety checks');
        break;
    }

    // Factor-specific recommendations
    factors.forEach(factor => {
      if (factor.significance === 'high') {
        switch (factor.parameter) {
          case 'displacement':
            recommendations.push(`Address displacement concerns: Install additional anchoring systems`);
            break;
          case 'strain':
            recommendations.push(`High strain detected: Inspect structural integrity`);
            break;
          case 'porePressure':
            recommendations.push(`Elevated pore pressure: Implement drainage measures`);
            break;
          case 'vibration':
            recommendations.push(`Excessive vibration: Review blasting schedules and equipment operation`);
            break;
        }
      }
    });

    // Pattern-specific recommendations
    patterns.forEach(pattern => {
      if (pattern.includes('Rainfall')) {
        recommendations.push('Implement rain-related mitigation measures');
      }
      if (pattern.includes('Progressive')) {
        recommendations.push('Urgent structural intervention required');
      }
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }

  private createBasicPrediction(zoneId: string, currentReading: SensorReading): PredictionResult {
    // Basic threshold-based prediction for insufficient data
    let riskScore = 0;
    const factors: PredictionResult['factors'] = [];

    if (currentReading.displacement > 15) {
      riskScore += 30;
      factors.push({
        parameter: 'displacement',
        contribution: 30,
        trend: 'stable',
        significance: 'medium'
      });
    }

    if (currentReading.strain > 800) {
      riskScore += 25;
      factors.push({
        parameter: 'strain',
        contribution: 25,
        trend: 'stable',
        significance: 'medium'
      });
    }

    return {
      zoneId,
      riskScore,
      riskLevel: this.determineRiskLevel(riskScore),
      confidence: 50, // Low confidence with insufficient data
      timeToEvent: null,
      factors,
      patterns: ['Insufficient historical data for pattern analysis'],
      recommendations: ['Collect more data for improved predictions', 'Use threshold-based monitoring']
    };
  }

  private updateModels(_zoneId: string, _reading: SensorReading, prediction: PredictionResult): void {
    // Simplified online learning - in reality, this would be much more sophisticated
    // This is where you would implement feedback loops and model updates
    
    // Example: Adjust thresholds based on prediction accuracy (pseudo-implementation)
    this.models.forEach(model => {
      if (model.type === 'statistical') {
        // Gradual threshold adjustment based on recent performance
        Object.keys(model.thresholds).forEach(param => {
          const adjustment = this.learningRate * (prediction.riskScore - 50) / 100;
          model.thresholds[param] *= (1 + adjustment * 0.01);
        });
      }
    });
  }

  getModelStats(): DetectionModel[] {
    return [...this.models];
  }

  getHistoricalPatterns(): HistoricalPattern[] {
    return [...this.patterns];
  }

  calibrateModel(modelId: string, trainingData: Array<{ reading: SensorReading; outcome: boolean }>): void {
    const model = this.models.find(m => m.id === modelId);
    if (!model) return;

    // Simplified calibration - in reality, this would involve proper ML training
    model.lastTrained = new Date();
    
    // Calculate accuracy based on training data
    let correct = 0;
    trainingData.forEach(({ reading, outcome }) => {
      const prediction = this.predict('calibration', reading);
      const predicted = prediction.riskLevel === 'high' || prediction.riskLevel === 'critical';
      if (predicted === outcome) correct++;
    });

    model.accuracy = (correct / trainingData.length) * 100;
  }
}

// Hook for using the enhanced detector
export const useEnhancedRockfallDetector = () => {
  const [detector] = useState(() => new EnhancedRockfallDetector());
  const [predictions, setPredictions] = useState<Record<string, PredictionResult>>({});
  const [isEnabled, setIsEnabled] = useState(true);

  const predict = useCallback((zoneData: Record<string, ZoneData>) => {
    if (!isEnabled) return;

    const newPredictions: Record<string, PredictionResult> = {};

    Object.entries(zoneData).forEach(([zoneId, data]) => {
      detector.addReading(zoneId, data.lastReading);
      newPredictions[zoneId] = detector.predict(zoneId, data.lastReading);
    });

    setPredictions(newPredictions);
  }, [detector, isEnabled]);

  const getModelStats = useCallback(() => {
    return detector.getModelStats();
  }, [detector]);

  const getPatterns = useCallback(() => {
    return detector.getHistoricalPatterns();
  }, [detector]);

  const calibrateModel = useCallback((modelId: string, trainingData: any[]) => {
    detector.calibrateModel(modelId, trainingData);
  }, [detector]);

  return {
    predictions,
    predict,
    isEnabled,
    setIsEnabled,
    getModelStats,
    getPatterns,
    calibrateModel
  };
};