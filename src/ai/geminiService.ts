import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('VITE_GEMINI_API_KEY not set. AI summary features disabled.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Quota management state
let nextAllowedTime = 0; // epoch ms when we can try again after a hard quota 429
let recent429Count = 0;

interface RetryOptions {
  primaryModel: string;
  fallbackModel?: string;
  content: any;
  maxRetries?: number;
  temperature?: number;
}

async function generateWithRetry({ primaryModel, fallbackModel, content, maxRetries = 2 }: RetryOptions) {
  if (!genAI) throw new Error('Gemini API key missing.');
  const now = Date.now();
  if (now < nextAllowedTime) {
    const waitSec = Math.ceil((nextAllowedTime - now) / 1000);
    throw new Error(`Quota cooldown active. Try again in ~${waitSec}s.`);
  }

  let modelName = primaryModel;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const res = await model.generateContent(content);
      // Success: decay 429 counter
      if (recent429Count > 0) recent429Count--;
      return res.response.text();
    } catch (err: any) {
      const msg = err?.message || '';
      if (/429/.test(msg)) {
        recent429Count++;
        // Parse retry delay if present (e.g., retryDelay":"59s")
        const retryMatch = msg.match(/retryDelay"\s*:\s*"(\d+)s"/i);
        const retrySec = retryMatch ? parseInt(retryMatch[1], 10) : 60;
        nextAllowedTime = Date.now() + retrySec * 1000;
        // Try fallback model once if provided and not already switched
        if (fallbackModel && modelName !== fallbackModel) {
          modelName = fallbackModel;
          continue; // retry immediately with fallback
        }
        if (attempt < maxRetries) {
          // Exponential backoff minimal since quota gives explicit wait
            await new Promise(r => setTimeout(r, Math.min(2000 * (attempt + 1), retrySec * 1000)));
          continue;
        }
        throw new Error(formatQuotaMessage(retrySec));
      }
      // Non-quota error: rethrow normalized
      throw new Error(normalizeGeminiError(err));
    }
  }
  throw new Error('Generation failed after retries.');
}

// Types kept broad; refine once data schema is stable
export async function summarizeSensorData(_sensorSeries: any[], riskCalcs: any[]) {
  if (!genAI) return 'Gemini API key missing.';

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

  return generateWithRetry({
    primaryModel: 'gemini-1.5-flash',
    fallbackModel: 'gemini-1.5-flash-latest',
    content: prompt
  });
}

export async function summarizeAlerts(alerts: any[]) {
  if (!genAI) return 'Gemini API key missing.';

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

  return generateWithRetry({
    primaryModel: 'gemini-1.5-flash',
    fallbackModel: 'gemini-1.5-flash-latest',
    content: prompt
  });
}

export async function summarizeImage(file: File, options?: { force?: boolean }) {
  if (!genAI) return 'Gemini API key missing.';
  const force = options?.force === true;
  try {
    if (file.size > 8 * 1024 * 1024) {
      throw new Error('Image too large (>8MB). Please upload a smaller file.');
    }
    const cacheKey = await hashString(`${file.name}|${file.size}|${file.lastModified}`);

    // In-memory layer first
    if (!force) {
      const memCached = imageSummaryCache.get(cacheKey);
      if (memCached && Date.now() - memCached.timestamp < ONE_HOUR) {
        return memCached.text;
      }
    }

    // Persistent layer
    if (!force) {
      const persisted = loadPersistentCache('imageSummary', cacheKey, ONE_HOUR);
      if (persisted) {
        // hydrate memory cache for faster next access
        imageSummaryCache.set(cacheKey, { text: persisted.value, timestamp: persisted.timestamp });
        return persisted.value;
      }
    }

    const processed = await maybeDownscaleImage(file, 1600, 1600, 0.85);
    const base64 = await fileToBase64(processed);
    const prompt = 'You analyze a mine slope / bench image for visible instability indicators (rock fractures, overhangs, water seepage, fresh debris). Provide a concise geotechnical-style note (<90 words). Avoid speculation beyond visible cues.';
    const text = await generateWithRetry({
      primaryModel: 'gemini-1.5-flash',
      fallbackModel: 'gemini-1.5-flash-latest',
      content: [
        { inlineData: { data: base64, mimeType: processed.type || file.type || 'image/jpeg' } },
        prompt
      ]
    });
    const entry = { text, timestamp: Date.now() };
    imageSummaryCache.set(cacheKey, entry);
    savePersistentCache('imageSummary', cacheKey, text, entry.timestamp);
    return text;
  } catch (error) {
    console.error('Error in summarizeImage:', error);
    throw new Error(`Image analysis failed: ${normalizeGeminiError(error)}`);
  }
}

export async function analyzeMultipleImages(files: File[], analysisType: 'detailed' | 'quick' = 'detailed') {
  if (!genAI) return 'Gemini API key missing.';
  try {
    const imageData = await Promise.all(files.map(async (file) => {
      if (file.size > 8 * 1024 * 1024) {
        throw new Error(`Image ${file.name} exceeds 8MB limit`);
      }
      const processed = await maybeDownscaleImage(file, 1600, 1600, 0.85);
      const base64 = await fileToBase64(processed);
      return { inlineData: { data: base64, mimeType: processed.type || file.type || 'image/jpeg' } };
    }));

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

    return generateWithRetry({
      primaryModel: 'gemini-1.5-pro',
      fallbackModel: 'gemini-1.5-flash',
      content: contentParts
    });
  } catch (error) {
    console.error('Error in analyzeMultipleImages:', error);
    throw new Error(`Multi-image analysis failed: ${normalizeGeminiError(error)}`);
  }
}

export async function analyzeRockfallRisk(file: File, analysisType: 'detailed' | 'quick' = 'detailed', options?: { force?: boolean }) {
  if (!genAI) return 'Gemini API key missing.';
  const force = options?.force === true;
  try {
    if (file.size > 8 * 1024 * 1024) {
      throw new Error('Image too large (>8MB). Please upload a smaller file.');
    }

    const cacheKey = await hashString(`risk|${analysisType}|${file.name}|${file.size}|${file.lastModified}`);

    if (!force) {
      const memCached = imageSummaryCache.get(cacheKey);
      if (memCached && Date.now() - memCached.timestamp < ONE_HOUR) {
        return memCached.text;
      }
    }

    if (!force) {
      const persisted = loadPersistentCache('riskAnalysis', cacheKey, ONE_HOUR);
      if (persisted) {
        imageSummaryCache.set(cacheKey, { text: persisted.value, timestamp: persisted.timestamp });
        return persisted.value;
      }
    }

    const processed = await maybeDownscaleImage(file, 1800, 1800, 0.85);
    const base64 = await fileToBase64(processed);
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

    const text = await generateWithRetry({
      primaryModel: 'gemini-1.5-pro',
      fallbackModel: 'gemini-1.5-flash',
      content: [
        { inlineData: { data: base64, mimeType: processed.type || file.type || 'image/jpeg' } },
        analysisType === 'detailed' ? detailedPrompt : quickPrompt
      ]
    });
    const entry = { text, timestamp: Date.now() };
    imageSummaryCache.set(cacheKey, entry);
    savePersistentCache('riskAnalysis', cacheKey, text, entry.timestamp);
    return text;
  } catch (error) {
    console.error('Error in analyzeRockfallRisk:', error);
    throw new Error(`Rockfall analysis failed: ${normalizeGeminiError(error)}`);
  }
}

export async function analyzeElevationData(elevationData: any, _metadata?: any) {
  if (!genAI) return 'Gemini API key missing.';
  
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

  return generateWithRetry({
    primaryModel: 'gemini-1.5-flash',
    fallbackModel: 'gemini-1.5-flash-latest',
    content: prompt
  });
}

export async function comprehensiveRiskAnalysis(data: {
  sensorData?: any[];
  environmentalData?: any;
  elevationData?: any;
  imageAnalysis?: string;
  weatherData?: any;
}) {
  if (!genAI) return 'Gemini API key missing.';
  
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

  return generateWithRetry({
    primaryModel: 'gemini-1.5-pro',
    fallbackModel: 'gemini-1.5-flash',
    content: prompt
  });
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

// --- Internal helpers ---
// Convert a File to base64 without blowing the call stack on large buffers
async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  // Process in reasonable chunks to avoid maximum call stack size exceeded
  let binary = '';
  const chunkSize = 0x8000; // 32KB chunks
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function normalizeGeminiError(error: unknown): string {
  if (error instanceof Error) {
    if (/call stack/i.test(error.message)) return 'Internal encoding error (stack overflow). Try a smaller image or different format.';
    return error.message;
  }
  return 'Unknown error';
}

function formatQuotaMessage(retrySec: number): string {
  const mins = Math.ceil(retrySec / 60);
  return `Quota exceeded. Please wait ~${retrySec < 60 ? retrySec + 's' : mins + 'm'} and try again. Consider upgrading plan or reducing frequency.`;
}

// --- Image Downscale & Cache Helpers ---
interface ImageSummaryCacheEntry { text: string; timestamp: number }
const imageSummaryCache = new Map<string, ImageSummaryCacheEntry>();
const ONE_HOUR = 1000 * 60 * 60;

// --- Persistent cache (localStorage) ---
interface PersistedEntry { value: string; timestamp: number }

function getBucketKey(bucket: string) {
  return `geminiCache:${bucket}`;
}

function loadBucket(bucket: string): Record<string, PersistedEntry> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(getBucketKey(bucket));
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, PersistedEntry>;
  } catch {
    return {};
  }
}

function saveBucket(bucket: string, data: Record<string, PersistedEntry>) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(getBucketKey(bucket), JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

function loadPersistentCache(bucket: string, key: string, ttl: number): (PersistedEntry & { expired: boolean }) | null {
  const bucketData = loadBucket(bucket);
  const entry = bucketData[key];
  if (!entry) return null;
  const expired = Date.now() - entry.timestamp > ttl;
  if (expired) return null;
  return { ...entry, expired: false };
}

function savePersistentCache(bucket: string, key: string, value: string, timestamp: number) {
  const bucketData = loadBucket(bucket);
  bucketData[key] = { value, timestamp };
  saveBucket(bucket, bucketData);
}

async function maybeDownscaleImage(file: File, maxWidth: number, maxHeight: number, quality = 0.9): Promise<File> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        if (width <= maxWidth && height <= maxHeight) {
          resolve(file);
          return;
        }
        const scale = Math.min(maxWidth / width, maxHeight / height);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return; }
          const downscaled = new File([blob], file.name.replace(/(\.[a-zA-Z]+)?$/, '_scaled$1'), { type: blob.type });
          resolve(downscaled);
        }, 'image/jpeg', quality);
      };
      img.onerror = () => resolve(file);
      const url = URL.createObjectURL(file);
      img.src = url;
    } catch {
      resolve(file);
    }
  });
}

async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}
