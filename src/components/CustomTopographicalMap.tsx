import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import L, { LatLng } from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MousePointer, 
  X, 
  Target,
  Trash2,
  Settings
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './CustomTopographicalMap.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface TerrainSection {
  id: string;
  name: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  riskScore: number;
  coordinates: LatLng[];
  center: LatLng;
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
  centerPoint: LatLng;
  name: string;
  sections: TerrainSection[];
  createdAt: string;
  metadata: {
    totalArea: number;
    averageRisk: number;
    criticalSections: number;
  };
}

interface CustomTopographicalMapProps {
  onZoneSelect: (zoneId: string) => void;
  onDataUpdate: (terrainData: TerrainMap[]) => void;
  simulationThresholds: {
    riskThreshold: number;
    alertThreshold: number;
    stabilityThreshold: number;
  };
  isRealTimeActive: boolean;
}

type MapMode = 'explore' | 'generate' | 'edit' | 'analyze';

// Utility functions for realistic terrain generation
const generateRealisticBoundary = (center: LatLng, index: number, radius?: number): LatLng[] => {
  const points: LatLng[] = [];
  const baseRadius = radius || (0.0008 + (index * 0.0003)); // Use provided radius or calculate based on index
  const numPoints = 12 + Math.floor(Math.random() * 8); // Random number of points for organic shape
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    
    // Add randomness for realistic terrain
    const radiusVariation = 0.4 + Math.random() * 0.6; // 40-100% of base radius
    const angleVariation = (Math.random() - 0.5) * 0.4; // Random angle offset
    
    const finalAngle = angle + angleVariation;
    const finalRadius = baseRadius * radiusVariation;
    
    // Add terrain-like irregularities
    const terrainNoise = (Math.sin(angle * 3) + Math.cos(angle * 5)) * (baseRadius * 0.1);
    
    const lat = center.lat + Math.cos(finalAngle) * finalRadius + terrainNoise;
    const lng = center.lng + Math.sin(finalAngle) * finalRadius + terrainNoise;
    
    points.push(new LatLng(lat, lng));
  }
  
  return points;
};

// Helper function to check if two circles overlap
const checkOverlap = (center1: LatLng, radius1: number, center2: LatLng, radius2: number): boolean => {
  const distance = Math.sqrt(
    Math.pow(center1.lat - center2.lat, 2) + Math.pow(center1.lng - center2.lng, 2)
  );
  return distance < (radius1 + radius2);
};

// Helper function to generate non-overlapping section centers
const generateNonOverlappingSectionCenters = (centerPoint: LatLng, sectionCount: number): { center: LatLng; radius: number }[] => {
  const sectionCenters: { center: LatLng; radius: number }[] = [];
  const maxAttempts = 50; // Prevent infinite loops
  
  for (let i = 0; i < sectionCount; i++) {
    let validPosition = false;
    let attempts = 0;
    let sectionCenter: LatLng;
    let sectionRadius: number;
    
    while (!validPosition && attempts < maxAttempts) {
      // Calculate position using polar coordinates to distribute sections more evenly
      if (i === 0) {
        // First section near center
        sectionCenter = new LatLng(
          centerPoint.lat + (Math.random() - 0.5) * 0.0008,
          centerPoint.lng + (Math.random() - 0.5) * 0.0008
        );
        sectionRadius = 0.0008 + Math.random() * 0.0004;
      } else {
        // Subsequent sections in a rough circle around the center
        const angle = (i / sectionCount) * 2 * Math.PI + (Math.random() - 0.5) * 0.8; // Add some randomness
        const distance = 0.0015 + Math.random() * 0.001; // Distance from center
        
        sectionCenter = new LatLng(
          centerPoint.lat + Math.cos(angle) * distance,
          centerPoint.lng + Math.sin(angle) * distance
        );
        sectionRadius = 0.0006 + Math.random() * 0.0005;
      }
      
      // Check if this position overlaps with existing sections
      validPosition = true;
      for (const existingSection of sectionCenters) {
        if (checkOverlap(sectionCenter, sectionRadius, existingSection.center, existingSection.radius)) {
          validPosition = false;
          break;
        }
      }
      
      attempts++;
    }
    
    // If we couldn't find a non-overlapping position, place it further away
    if (!validPosition) {
      const angle = (i / sectionCount) * 2 * Math.PI;
      const distance = 0.002 + (i * 0.0008); // Progressively further from center
      
      sectionCenter = new LatLng(
        centerPoint.lat + Math.cos(angle) * distance,
        centerPoint.lng + Math.sin(angle) * distance
      );
      sectionRadius = 0.0005;
    }
    
    sectionCenters.push({ center: sectionCenter, radius: sectionRadius });
  }
  
  return sectionCenters;
};

const generateTerrainSections = (centerPoint: LatLng): TerrainSection[] => {
  const sections: TerrainSection[] = [];
  const sectionCount = 3 + Math.floor(Math.random() * 4); // 3-6 sections
  
  const rockTypes = ['Limestone', 'Sandstone', 'Granite', 'Shale', 'Basalt', 'Quartzite'];
  const riskLevels: ('critical' | 'high' | 'medium' | 'low')[] = ['critical', 'high', 'medium', 'low'];
  
  // More diverse section naming patterns
  const sectionPrefixes = ['North', 'South', 'East', 'West', 'Central', 'Upper', 'Lower', 'Ridge', 'Valley', 'Bench'];
  const sectionSuffixes = ['Zone', 'Sector', 'Area', 'Block', 'Face', 'Wall', 'Slope', 'Terrace'];
  const descriptors = ['Alpha', 'Beta', 'Gamma', 'Prime', 'Main', 'Secondary', 'Advanced', 'Critical'];
  
  // Generate location-specific base name
  const locationHash = Math.abs(centerPoint.lat * centerPoint.lng * 1000) % 1000;
  const baseLocationId = Math.floor(locationHash);
  
  // Generate non-overlapping section centers
  const sectionCenters = generateNonOverlappingSectionCenters(centerPoint, sectionCount);
  
  for (let i = 0; i < sectionCount; i++) {
    const { center: sectionCenter, radius } = sectionCenters[i];
    
    // Use the radius to determine the boundary size for this specific section
    const boundary = generateRealisticBoundary(sectionCenter, i, radius);
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    
    // Generate diverse section names based on location and index
    const prefix = sectionPrefixes[Math.floor((baseLocationId + i) % sectionPrefixes.length)];
    const suffix = sectionSuffixes[Math.floor((baseLocationId + i * 2) % sectionSuffixes.length)];
    const descriptor = descriptors[Math.floor((baseLocationId + i * 3) % descriptors.length)];
    
    let sectionName;
    if (i === 0) {
      sectionName = `${prefix} ${suffix}`;
    } else if (i % 2 === 0) {
      sectionName = `${prefix} ${descriptor}`;
    } else {
      sectionName = `${descriptor} ${suffix}`;
    }
    
    sections.push({
      id: `section-${Date.now()}-${i}`,
      name: sectionName,
      riskLevel,
      riskScore: Math.random() * 10,
      coordinates: boundary,
      center: sectionCenter,
      properties: {
        rockType: rockTypes[Math.floor(Math.random() * rockTypes.length)],
        slopeAngle: 15 + Math.random() * 75,
        stability: Math.random(),
        weatherResistance: Math.random(),
        fractureDensity: Math.random(),
        waterContent: Math.random(),
        lastInspection: new Date().toISOString(),
        alertThreshold: 0.7 + Math.random() * 0.3
      },
      sensorData: {
        displacement: Math.random() * 10,
        vibration: Math.random() * 5,
        temperature: 15 + Math.random() * 20,
        humidity: 40 + Math.random() * 40,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  return sections;
};

// Component for handling map events
const MapEventHandler: React.FC<{
  mode: MapMode;
  onMapClick: (latlng: LatLng) => void;
}> = ({ mode, onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (mode === 'generate') {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
};

// Component for rendering terrain sections
const TerrainRenderer: React.FC<{
  terrainMaps: TerrainMap[];
  onSectionClick: (sectionId: string) => void;
  simulationThresholds: any;
}> = ({ terrainMaps, onSectionClick, simulationThresholds }) => {
  const map = useMap();

  useEffect(() => {
    const terrainLayer = L.layerGroup().addTo(map);

    terrainMaps.forEach(terrainMap => {
      terrainMap.sections.forEach(section => {
        // Apply simulation thresholds to determine if section is at risk
        const isAboveThreshold = section.riskScore > simulationThresholds.riskThreshold ||
                                section.properties.stability < simulationThresholds.stabilityThreshold;
        
        const color = getRiskColor(section.riskLevel);
        const polygon = L.polygon(
          section.coordinates.map(coord => [coord.lat, coord.lng]),
          {
            fillColor: color,
            fillOpacity: isAboveThreshold ? 0.6 : 0.3,
            color: isAboveThreshold ? '#000' : color,
            weight: isAboveThreshold ? 3 : 2,
            className: `terrain-section ${isAboveThreshold ? 'above-threshold' : ''}`
          }
        ).addTo(terrainLayer);

        // Add section label
        const sectionLabel = L.marker([section.center.lat, section.center.lng], {
          icon: L.divIcon({
            className: 'section-label',
            html: `<div class="bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-semibold shadow-lg border">
                     ${section.name}<br/>
                     <span class="text-${section.riskLevel === 'critical' ? 'red' : 
                                        section.riskLevel === 'high' ? 'orange' :
                                        section.riskLevel === 'medium' ? 'yellow' : 'green'}-600">
                       ${section.riskLevel.toUpperCase()}
                     </span>
                   </div>`,
            iconSize: [80, 40],
            iconAnchor: [40, 20]
          })
        }).addTo(terrainLayer);

        polygon.bindPopup(createSectionPopup(section, simulationThresholds));
        polygon.on('click', () => onSectionClick(section.id));
        sectionLabel.on('click', () => onSectionClick(section.id));
      });
    });

    return () => {
      map.removeLayer(terrainLayer);
    };
  }, [terrainMaps, map, onSectionClick, simulationThresholds]);

  return null;
};

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'critical': return '#ef4444';
    case 'high': return '#f59e0b';
    case 'medium': return '#eab308';
    case 'low': return '#22c55e';
    default: return '#6b7280';
  }
};

const createSectionPopup = (section: TerrainSection, thresholds: any) => {
  const isAboveThreshold = section.riskScore > thresholds.riskThreshold;
  
  return `
    <div class="p-3 min-w-64">
      <h3 class="font-bold text-lg mb-2">${section.name}</h3>
      
      <div class="grid grid-cols-2 gap-2 text-sm mb-3">
        <div><strong>Risk Level:</strong> <span class="text-${section.riskLevel === 'critical' ? 'red' : 'orange'}-600">${section.riskLevel.toUpperCase()}</span></div>
        <div><strong>Risk Score:</strong> ${section.riskScore.toFixed(1)}</div>
        <div><strong>Rock Type:</strong> ${section.properties.rockType}</div>
        <div><strong>Slope:</strong> ${section.properties.slopeAngle.toFixed(1)}°</div>
        <div><strong>Stability:</strong> ${(section.properties.stability * 100).toFixed(1)}%</div>
        <div><strong>Displacement:</strong> ${section.sensorData.displacement.toFixed(2)}mm</div>
      </div>
      
      ${isAboveThreshold ? '<div class="bg-red-100 border border-red-300 text-red-700 px-2 py-1 rounded text-xs mb-2">⚠️ ABOVE THRESHOLD</div>' : ''}
      
      <div class="text-xs text-gray-500 mb-2">
        Last updated: ${new Date(section.sensorData.timestamp).toLocaleString()}
      </div>
      
      <button onclick="window.sectionActions.edit('${section.id}')" 
              class="w-full bg-blue-600 text-white py-1 px-2 rounded text-sm hover:bg-blue-700">
        Edit Section
      </button>
    </div>
  `;
};

export const CustomTopographicalMap: React.FC<CustomTopographicalMapProps> = ({ 
  onZoneSelect, 
  onDataUpdate, 
  simulationThresholds,
  isRealTimeActive 
}) => {
  const [terrainMaps, setTerrainMaps] = useState<TerrainMap[]>([]);
  const [mapMode, setMapMode] = useState<MapMode>('explore');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  const [editingSection, setEditingSection] = useState<TerrainSection | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [pendingTerrainData, setPendingTerrainData] = useState<{
    location: LatLng;
    sections: TerrainSection[];
  } | null>(null);
  const [terrainName, setTerrainName] = useState('');
  const [sectionNames, setSectionNames] = useState<string[]>([]);

  const mapRef = useRef<L.Map | null>(null);

  // Default map center (Delhi, India coordinates)
  const defaultCenter = new LatLng(28.7041, 77.1025);
  const mapCenter = selectedLocation || defaultCenter;

  useEffect(() => {
    // Load saved terrain maps
    const savedMaps = localStorage.getItem('customTerrainMaps');
    if (savedMaps) {
      try {
        const parsed = JSON.parse(savedMaps);
        setTerrainMaps(parsed);
        onDataUpdate(parsed);
      } catch (error) {
        console.error('Error loading saved terrain maps:', error);
      }
    }
  }, [onDataUpdate]);

  useEffect(() => {
    // Set up global actions for popup buttons
    (window as any).sectionActions = {
      edit: (sectionId: string) => {
        const section = terrainMaps
          .flatMap(map => map.sections)
          .find(s => s.id === sectionId);
        if (section) {
          setEditingSection(section);
        }
      }
    };
  }, [terrainMaps]);

  const handleMapClick = async (latlng: LatLng) => {
    if (mapMode !== 'generate') return;

    setIsGenerating(true);
    setSelectedLocation(latlng);

    // Simulate terrain analysis time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const sections = generateTerrainSections(latlng);
    
    // Store the generated data and show naming dialog
    setPendingTerrainData({ location: latlng, sections });
    setTerrainName('');
    setSectionNames(sections.map((_, index) => `Section ${index + 1}`));
    setShowNameDialog(true);
    setIsGenerating(false);
  };

  const handleCreateTerrain = () => {
    if (!pendingTerrainData) return;

    // Update section names in the generated sections
    const sectionsWithNames = pendingTerrainData.sections.map((section, index) => ({
      ...section,
      name: sectionNames[index] || `Section ${index + 1}`
    }));

    const newTerrainMap: TerrainMap = {
      id: `terrain-${Date.now()}`,
      centerPoint: pendingTerrainData.location,
      name: terrainName || `Site ${terrainMaps.length + 1}`,
      sections: sectionsWithNames,
      createdAt: new Date().toISOString(),
      metadata: {
        totalArea: sectionsWithNames.length * 1000,
        averageRisk: sectionsWithNames.reduce((sum, s) => sum + s.riskScore, 0) / sectionsWithNames.length,
        criticalSections: sectionsWithNames.filter(s => s.riskLevel === 'critical').length
      }
    };

    const updatedMaps = [...terrainMaps, newTerrainMap];
    setTerrainMaps(updatedMaps);
    localStorage.setItem('customTerrainMaps', JSON.stringify(updatedMaps));
    onDataUpdate(updatedMaps);

    // Reset state
    setShowNameDialog(false);
    setPendingTerrainData(null);
    setMapMode('explore');
  };

  const handleCancelNaming = () => {
    setShowNameDialog(false);
    setPendingTerrainData(null);
    setMapMode('explore');
  };

  const updateSection = (updatedSection: TerrainSection) => {
    const updatedMaps = terrainMaps.map(map => ({
      ...map,
      sections: map.sections.map(section =>
        section.id === updatedSection.id ? updatedSection : section
      )
    }));

    setTerrainMaps(updatedMaps);
    localStorage.setItem('customTerrainMaps', JSON.stringify(updatedMaps));
    onDataUpdate(updatedMaps);
    setEditingSection(null);
  };

  const deleteTerrainMap = (mapId: string) => {
    const updatedMaps = terrainMaps.filter(map => map.id !== mapId);
    setTerrainMaps(updatedMaps);
    localStorage.setItem('customTerrainMaps', JSON.stringify(updatedMaps));
    onDataUpdate(updatedMaps);
  };

  return (
    <div className="relative h-full w-full min-h-[400px] bg-gray-100 rounded-lg overflow-hidden">
      {/* Mode Controls */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        <div className="bg-white rounded-lg shadow-lg p-2">
          <div className="text-xs font-semibold text-gray-700 mb-2">Map Mode</div>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setMapMode('explore')}
              className={`p-2 rounded text-xs transition-colors ${
                mapMode === 'explore' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <MousePointer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMapMode('generate')}
              className={`p-2 rounded text-xs transition-colors ${
                mapMode === 'generate' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Target className="w-4 h-4" />
            </button>
          </div>
          {mapMode === 'generate' && (
            <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded">
              Click anywhere to generate terrain
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-2">
          <div className="text-xs font-semibold text-gray-700 mb-2">Terrain Sites</div>
          <div className="text-xs text-gray-600">{terrainMaps.length} sites created</div>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="bg-white rounded-lg shadow-lg p-2 hover:bg-gray-50"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Real-time indicator */}
      {isRealTimeActive && (
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">Live Monitoring</span>
          </div>
        </div>
      )}

      {/* Generation Progress */}
      {isGenerating && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001]">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="font-semibold mb-2">Analyzing Terrain</h3>
            <p className="text-sm text-gray-600">Generating topographical sections...</p>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-0 right-0 w-80 h-full bg-white shadow-xl z-[1002] overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Terrain Management</h3>
                <button onClick={() => setShowSettings(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Active Thresholds</h4>
                  <div className="text-sm space-y-1">
                    <div>Risk: {(simulationThresholds.riskThreshold * 10).toFixed(1)}/10</div>
                    <div>Alert: {(simulationThresholds.alertThreshold * 100).toFixed(0)}%</div>
                    <div>Stability: {(simulationThresholds.stabilityThreshold * 100).toFixed(0)}%</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Created Sites</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {terrainMaps.map(map => (
                      <div key={map.id} className="border rounded p-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{map.name}</div>
                            <div className="text-xs text-gray-500">
                              {map.sections.length} sections
                            </div>
                          </div>
                          <button
                            onClick={() => deleteTerrainMap(map.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={16}
        className="h-full w-full"
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        <MapEventHandler mode={mapMode} onMapClick={handleMapClick} />
        
        <TerrainRenderer
          terrainMaps={terrainMaps}
          onSectionClick={onZoneSelect}
          simulationThresholds={simulationThresholds}
        />
      </MapContainer>

      {/* Section Editor Modal */}
      <AnimatePresence>
        {editingSection && (
          <SectionEditor
            section={editingSection}
            onSave={updateSection}
            onCancel={() => setEditingSection(null)}
          />
        )}
      </AnimatePresence>

      {/* Terrain Naming Dialog */}
      <AnimatePresence>
        {showNameDialog && pendingTerrainData && (
          <TerrainNamingDialog
            terrainName={terrainName}
            sectionNames={sectionNames}
            sectionCount={pendingTerrainData.sections.length}
            onTerrainNameChange={setTerrainName}
            onSectionNameChange={(index, name) => {
              const newNames = [...sectionNames];
              newNames[index] = name;
              setSectionNames(newNames);
            }}
            onConfirm={handleCreateTerrain}
            onCancel={handleCancelNaming}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Terrain Naming Dialog Component
const TerrainNamingDialog: React.FC<{
  terrainName: string;
  sectionNames: string[];
  sectionCount: number;
  onTerrainNameChange: (name: string) => void;
  onSectionNameChange: (index: number, name: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ 
  terrainName, 
  sectionNames, 
  sectionCount, 
  onTerrainNameChange, 
  onSectionNameChange, 
  onConfirm, 
  onCancel 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1004]"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Name Your Terrain Site</h3>
          <button onClick={onCancel}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Site Name</label>
            <input
              type="text"
              value={terrainName}
              onChange={(e) => onTerrainNameChange(e.target.value)}
              placeholder={`Site ${new Date().getTime().toString().slice(-3)}`}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be the main name for this terrain location
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Section Names ({sectionCount} sections detected)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Array.from({ length: sectionCount }).map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 w-16">#{index + 1}:</span>
                  <input
                    type="text"
                    value={sectionNames[index] || `Section ${index + 1}`}
                    onChange={(e) => onSectionNameChange(index, e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Section ${index + 1}`}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Give meaningful names to each detected section for easier identification
            </p>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onConfirm}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium"
          >
            Create Terrain
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Section Editor Component
const SectionEditor: React.FC<{
  section: TerrainSection;
  onSave: (section: TerrainSection) => void;
  onCancel: () => void;
}> = ({ section, onSave, onCancel }) => {
  const [editedSection, setEditedSection] = useState(section);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1003]"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Section</h3>
          <button onClick={onCancel}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Section Name</label>
            <input
              type="text"
              value={editedSection.name}
              onChange={(e) => setEditedSection({...editedSection, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Risk Level</label>
            <select
              value={editedSection.riskLevel}
              onChange={(e) => setEditedSection({...editedSection, riskLevel: e.target.value as any})}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Risk Score (0-10)</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={editedSection.riskScore}
              onChange={(e) => setEditedSection({...editedSection, riskScore: parseFloat(e.target.value)})}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-600">{editedSection.riskScore.toFixed(1)}</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rock Type</label>
            <select
              value={editedSection.properties.rockType}
              onChange={(e) => setEditedSection({
                ...editedSection, 
                properties: {...editedSection.properties, rockType: e.target.value}
              })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="Limestone">Limestone</option>
              <option value="Sandstone">Sandstone</option>
              <option value="Granite">Granite</option>
              <option value="Shale">Shale</option>
              <option value="Basalt">Basalt</option>
              <option value="Quartzite">Quartzite</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Slope Angle</label>
            <input
              type="range"
              min="0"
              max="90"
              value={editedSection.properties.slopeAngle}
              onChange={(e) => setEditedSection({
                ...editedSection,
                properties: {...editedSection.properties, slopeAngle: parseFloat(e.target.value)}
              })}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-600">{editedSection.properties.slopeAngle.toFixed(1)}°</div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => onSave(editedSection)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};