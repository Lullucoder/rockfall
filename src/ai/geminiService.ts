import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('VITE_GEMINI_API_KEY not set. AI summary features disabled.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Types kept broad; refine once data schema is stable
export async function summarizeSensorData(_sensorSeries: any[], riskCalcs: any[]) {
  if (!genAI) return 'Gemini API key missing.';
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const latest = (riskCalcs || []).slice(-5).map((r: any) => ({
    zone: r.zone_id ?? r.zone,
    probability: r.probability ?? r.risk_probability ?? 0,
    confidence: r.prediction_confidence ?? r.confidence ?? 0,
    risk_factors: r.risk_factors || {}
  }));

  const snapshotLines = latest.map(l => {
    const topFactors = Object.entries(l.risk_factors)
      .sort((a: any, b: any) => (b[1] as number) - (a[1] as number))
      .slice(0, 3)
      .map(f => `${f[0]}:${Math.round((f[1] as number) * 100)}%`) // assume factors normalized 0-1
      .join(', ');
    return `Zone ${l.zone} prob=${(l.probability * 100).toFixed(1)}% conf=${(l.confidence * 100).toFixed(0)}% top=${topFactors}`;
  }).join('\n');

  const prompt = `You generate concise operational geotechnical summaries for an open-pit rockfall risk dashboard.

Latest risk snapshots:
${snapshotLines}

Provide:
1. Overall risk posture (1 short paragraph)
2. Zones requiring immediate attention (bullet list)
3. Recommended short-term mitigation actions (bullet list)
Limit 160 words.`;

  const res = await model.generateContent(prompt);
  return res.response.text();
}

export async function summarizeAlerts(alerts: any[]) {
  if (!genAI) return 'Gemini API key missing.';
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const critical = alerts.filter(a => a.severity === 'critical').length;
  const active = alerts.filter(a => a.status === 'active').length;

  const list = alerts.slice(0, 8).map(a => `ID:${a.id} zone:${a.zone_name || a.zone_id} sev:${a.severity} status:${a.status} prob:${Math.round((a.risk_probability || a.probability || 0) * 100)}% msg:${a.message}`);

  const prompt = `You summarize rockfall monitoring alerts for mine operations management.

Alert sample:
${list.join('\n')}

Metrics: critical=${critical}, active=${active}, total=${alerts.length}.

Generate:
1. Executive summary (2 sentences)
2. Priority zones (bullet list)
3. Immediate actions (bullet list)
Max 140 words.`;

  const res = await model.generateContent(prompt);
  return res.response.text();
}

export async function summarizeImage(file: File) {
  if (!genAI) return 'Gemini API key missing.';
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const bytes = await file.arrayBuffer();
    const uint8Array = new Uint8Array(bytes);
    const base64 = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
    
    const prompt = 'You analyze a mine slope / bench image for visible instability indicators (rock fractures, overhangs, water seepage, fresh debris). Provide a concise geotechnical-style note (<90 words). Avoid speculation beyond visible cues.';

    const res = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType: file.type || 'image/jpeg'
        }
      },
      prompt
    ]);
    return res.response.text();
  } catch (error) {
    console.error('Error in summarizeImage:', error);
    throw new Error(`Image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function analyzeMultipleImages(files: File[], analysisType: 'detailed' | 'quick' = 'detailed') {
  if (!genAI) return 'Gemini API key missing.';
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Process all images
    const imagePromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const uint8Array = new Uint8Array(bytes);
      const base64 = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
      
      return {
        inlineData: {
          data: base64,
          mimeType: file.type || 'image/jpeg'
        }
      };
    });
    
    const imageData = await Promise.all(imagePromises);
    
    const detailedPrompt = `You are an expert mining geologist analyzing multiple open-pit mine slope images for comprehensive rockfall risk assessment.

ANALYZE ALL ${files.length} IMAGES FOR:

STRUCTURAL FEATURES:
- Rock fractures, joints, and discontinuities across all images
- Bedding planes and foliation orientation patterns
- Existing rockfall scars or failure surfaces
- Overhangs and undercuts in different areas

WEATHERING & EROSION:
- Rock mass weathering degree variations
- Erosion patterns and drainage channels
- Surface spalling or deterioration zones
- Clay alteration areas

WATER INFLUENCE:
- Seepage areas and water staining patterns
- Ice formation potential in different exposures
- Vegetation indicating water presence
- Overall drainage effectiveness

STABILITY INDICATORS:
- Loose rock blocks or debris accumulation
- Recent rockfall evidence across the slope
- Crack propagation patterns
- Block size distribution variations

COMPARATIVE ANALYSIS:
- Identify the highest risk zones
- Compare stability between different areas
- Assess progression of deterioration
- Evaluate overall slope condition

Provide a comprehensive assessment with:
1. OVERALL RISK LEVEL: (Low/Medium/High/Critical)
2. ZONE-SPECIFIC RISKS: Rank areas by risk level
3. PRIMARY HAZARDS: Top 5 identified risks across all images
4. FAILURE MECHANISMS: Most likely failure modes
5. PRIORITIZED RECOMMENDATIONS: Immediate, short-term, and long-term actions
6. MONITORING STRATEGY: Suggested surveillance points and frequency
7. OPERATIONAL IMPACT: Equipment/personnel safety recommendations

Technical but accessible language. Limit to 350 words.`;

    const quickPrompt = `Analyze these ${files.length} mine slope images for immediate rockfall hazards. Provide:
1. Overall risk assessment across all images
2. Highest priority zones requiring attention
3. Most critical visible instability signs
4. Immediate safety actions needed
5. Recommended monitoring priorities
Keep under 150 words, focus on actionable insights.`;

    const contentParts = [
      ...imageData,
      analysisType === 'detailed' ? detailedPrompt : quickPrompt
    ];

    const res = await model.generateContent(contentParts);
    return res.response.text();
  } catch (error) {
    console.error('Error in analyzeMultipleImages:', error);
    throw new Error(`Multi-image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function analyzeRockfallRisk(file: File, analysisType: 'detailed' | 'quick' = 'detailed') {
  if (!genAI) return 'Gemini API key missing.';
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const bytes = await file.arrayBuffer();
    const uint8Array = new Uint8Array(bytes);
    const base64 = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
    
    const detailedPrompt = `You are an expert mining geologist analyzing an open-pit mine slope for rockfall risk assessment. 

Analyze this image for the following geological hazard indicators:

STRUCTURAL FEATURES:
- Rock fractures, joints, and discontinuities
- Bedding planes and foliation orientation
- Existing rockfall scars or failure surfaces
- Overhangs and undercuts

WEATHERING & EROSION:
- Rock mass weathering degree
- Erosion patterns and channels
- Surface spalling or deterioration
- Clay alteration zones

WATER INFLUENCE:
- Seepage areas and water stains
- Ice formation potential
- Vegetation indicating water presence
- Drainage patterns

STABILITY INDICATORS:
- Loose rock blocks or debris
- Recent rockfall evidence
- Crack propagation signs
- Block size distribution

ENVIRONMENTAL FACTORS:
- Slope angle and geometry
- Access roads or equipment exposure
- Catch bench effectiveness
- Overall slope stability

Provide a structured assessment with:
1. RISK LEVEL: (Low/Medium/High/Critical)
2. PRIMARY HAZARDS: Top 3 identified risks
3. FAILURE MECHANISMS: Most likely failure modes
4. RECOMMENDATIONS: Immediate actions needed
5. MONITORING: Suggested surveillance points

Keep technical but accessible. Limit to 200 words.`;

  const quickPrompt = `Analyze this mine slope image for immediate rockfall hazards. Identify:
1. Visible instability signs
2. Risk level (Low/Medium/High/Critical) 
3. Urgent actions needed
Keep under 100 words, focus on actionable insights.`;

  const res = await model.generateContent([
    {
      inlineData: {
        data: base64,
        mimeType: file.type || 'image/jpeg'
      }
    },
    analysisType === 'detailed' ? detailedPrompt : quickPrompt
  ]);
  return res.response.text();
  } catch (error) {
    console.error('Error in analyzeRockfallRisk:', error);
    throw new Error(`Rockfall analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function analyzeElevationData(elevationData: any, _metadata?: any) {
  if (!genAI) return 'Gemini API key missing.';
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  // Process elevation data for analysis
  const stats = calculateElevationStats(elevationData);
  const slopeAnalysis = calculateSlopeMetrics(elevationData);
  
  const prompt = `You are analyzing Digital Elevation Model (DEM) data for an open-pit mine slope stability assessment.

ELEVATION STATISTICS:
- Min elevation: ${stats.min}m, Max: ${stats.max}m
- Mean slope: ${slopeAnalysis.meanSlope}°
- Steepest areas: ${slopeAnalysis.maxSlope}°
- Slope variance: ${slopeAnalysis.variance}
- Bench height: ${stats.benchHeight}m

GEOLOGICAL ASSESSMENT NEEDED:
Analyze the topographic data for:
1. Slope stability risks based on angle distribution
2. Potential failure planes from elevation patterns  
3. Areas requiring immediate attention
4. Recommended monitoring locations
5. Optimal bench design suggestions

Consider that slopes >60° in open-pit mining typically require enhanced monitoring, and slopes >75° present high rockfall risk.

Provide:
- STABILITY RATING: (Stable/Moderate/Unstable/Critical)
- HIGH-RISK ZONES: Specific elevation ranges or slope angles
- RECOMMENDATIONS: Engineering controls needed
- MONITORING PLAN: Key measurement points

Technical but concise response under 180 words.`;

  const res = await model.generateContent(prompt);
  return res.response.text();
}

export async function comprehensiveRiskAnalysis(data: {
  sensorData?: any[];
  environmentalData?: any;
  elevationData?: any;
  imageAnalysis?: string;
  weatherData?: any;
}) {
  if (!genAI) return 'Gemini API key missing.';
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  
  const prompt = `COMPREHENSIVE ROCKFALL RISK ASSESSMENT

You are conducting an integrated risk analysis for an open-pit mine combining multiple data sources:

SENSOR DATA: ${data.sensorData ? `${data.sensorData.length} sensors reporting displacement, strain, pore pressure` : 'Not available'}

ENVIRONMENTAL CONDITIONS:
${data.environmentalData ? `Temperature: ${data.environmentalData.temperature}°C, Rainfall: ${data.environmentalData.rainfall}mm, Wind: ${data.environmentalData.windSpeed}km/h` : 'Standard conditions assumed'}

TOPOGRAPHIC ANALYSIS: ${data.elevationData ? 'DEM data processed' : 'Not available'}

VISUAL INSPECTION: ${data.imageAnalysis || 'Not performed'}

WEATHER IMPACT: ${data.weatherData ? `Recent precipitation: ${data.weatherData.recentRain}mm, Freeze-thaw cycles: ${data.weatherData.freezeThaw}` : 'Normal conditions'}

Integrate all available data to provide:

1. OVERALL RISK RATING: (Low/Moderate/High/Critical)
2. FAILURE PROBABILITY: Percentage estimate with confidence level
3. CRITICAL FACTORS: Top 3 contributing risks
4. FAILURE TIMELINE: Likely timeframe if deterioration continues
5. MITIGATION PRIORITIES: Immediate, short-term, long-term actions
6. MONITORING ENHANCEMENT: Additional sensors/inspections needed
7. OPERATIONAL IMPACT: Equipment/personnel safety recommendations

This assessment will guide mine operations and safety protocols. Be specific and actionable.
Limit to 250 words maximum.`;

  const res = await model.generateContent(prompt);
  return res.response.text();
}

// Helper functions for elevation data processing
function calculateElevationStats(_data: any) {
  // Mock implementation - replace with actual elevation processing
  return {
    min: 1200,
    max: 1450,
    mean: 1325,
    benchHeight: 15
  };
}

function calculateSlopeMetrics(_data: any) {
  // Mock implementation - replace with actual slope calculation
  return {
    meanSlope: 45,
    maxSlope: 78,
    variance: 12.5
  };
}
