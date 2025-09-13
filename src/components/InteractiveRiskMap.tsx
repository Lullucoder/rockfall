import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, useMapEvents, useMap } from 'react-leaflet';
import L, { LatLng } from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MousePointer, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Navigation
} from 'lucide-react';
import { ZoneContourEditor } from './ZoneContourEditor';
import 'leaflet/dist/leaflet.css';
import './InteractiveRiskMap.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Extended Zone interface for custom zones
interface CustomZone {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  contours: Array<{
    id: string;
    radius: number;
    riskLevel: 'critical' | 'high' | 'medium' | 'low';
    riskScore: number;
    color: string;
  }>;
  metadata: {
    createdAt: string;
    updatedAt: string;
    rockType?: string;
    slopeAngle?: number;
    notes?: string;
  };
}

interface Zone {
  type: string;
  id: string;
  properties: {
    zone_id: string;
    name: string;
    risk_level: string;
    risk_score: number;
    slope_angle: number;
    rock_type: string;
    last_inspection: string;
    stability_index: number;
    displacement_rate: number;
    pore_pressure: number;
    rainfall_7d: number;
    alert_count: number;
    status: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface LocationPreset {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  zoom: number;
  description: string;
}

interface RiskMapProps {
  onZoneSelect: (zoneId: string) => void;
  isRealTimeActive: boolean;
}

type DrawingMode = 'select' | 'draw' | 'edit' | 'none';

// Location presets for common mining/rockfall monitoring areas
const locationPresets: LocationPreset[] = [
  { id: 'mine-site-1', name: 'Main Quarry Site', coordinates: { lat: 28.7041, lng: 77.1025 }, zoom: 16, description: 'Primary mining operations area' },
  { id: 'mine-site-2', name: 'North Pit Section', coordinates: { lat: 28.7080, lng: 77.1050 }, zoom: 17, description: 'Northern excavation zone' },
  { id: 'mine-site-3', name: 'East Wall Monitoring', coordinates: { lat: 28.7020, lng: 77.1080 }, zoom: 18, description: 'High-risk slope monitoring' },
  { id: 'mountain-region', name: 'Mountain Highway', coordinates: { lat: 28.7100, lng: 77.0950 }, zoom: 15, description: 'Highway corridor monitoring' },
  { id: 'custom', name: 'Custom Location', coordinates: { lat: 0, lng: 0 }, zoom: 10, description: 'Click on map to set custom location' }
];

// Risk level configurations for contours
const riskConfigs = {
  critical: { color: '#ef4444', minRadius: 20, maxRadius: 80, label: 'Critical Zone' },
  high: { color: '#f59e0b', minRadius: 40, maxRadius: 120, label: 'High Risk' },
  medium: { color: '#eab308', minRadius: 60, maxRadius: 160, label: 'Medium Risk' },
  low: { color: '#22c55e', minRadius: 80, maxRadius: 200, label: 'Low Risk' }
};

// Component for handling map events
const MapEventHandler: React.FC<{
  drawingMode: DrawingMode;
  onMapClick: (latlng: LatLng) => void;
  onLocationSelected?: (coordinates: { lat: number; lng: number }) => void;
}> = ({ drawingMode, onMapClick, onLocationSelected }) => {
  useMapEvents({
    click: (e) => {
      if (drawingMode === 'draw') {
        onMapClick(e.latlng);
      } else if (onLocationSelected) {
        onLocationSelected({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });
  return null;
};

// Component for rendering topographical contours
const TopographicalContours: React.FC<{
  zones: CustomZone[];
  onZoneClick: (zoneId: string) => void;
  onZoneEdit: (zoneId: string) => void;
}> = ({ zones, onZoneClick, onZoneEdit }) => {
  const map = useMap();

  useEffect(() => {
    // Set up global zone actions for popup buttons
    (window as any).zoneActions = {
      view: onZoneClick,
      edit: onZoneEdit
    };
    
    // Clear existing contours
    const contoursLayer = L.layerGroup().addTo(map);

    zones.forEach(zone => {
      // Create center marker
      const centerMarker = L.marker([zone.center.lat, zone.center.lng], {
        icon: L.divIcon({
          className: 'custom-zone-center',
          html: `<div class="w-4 h-4 bg-navy-600 rounded-full border-2 border-white shadow-lg"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).addTo(contoursLayer);

      centerMarker.bindPopup(`
        <div class="p-3">
          <h3 class="font-semibold text-gray-900">${zone.name}</h3>
          <div class="flex space-x-2 mt-2">
            <button 
              onclick="window.zoneActions.view('${zone.id}')"
              class="px-2 py-1 bg-navy-600 text-white text-xs rounded hover:bg-navy-700"
            >
              View Details
            </button>
            <button 
              onclick="window.zoneActions.edit('${zone.id}')"
              class="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
            >
              Edit Zone
            </button>
          </div>
        </div>
      `);

      centerMarker.on('click', () => onZoneClick(zone.id));

      // Create contour circles (sorted by radius descending for proper layering)
      zone.contours
        .sort((a, b) => b.radius - a.radius)
        .forEach((contour, index) => {
          const circle = L.circle([zone.center.lat, zone.center.lng], {
            radius: contour.radius,
            fillColor: contour.color,
            fillOpacity: 0.1 + (index * 0.05), // Increasing opacity for inner circles
            color: contour.color,
            weight: 2,
            opacity: 0.8,
            dashArray: index === 0 ? undefined : '5, 5' // Solid for outermost, dashed for inner
          }).addTo(contoursLayer);

          circle.bindTooltip(`
            ${riskConfigs[contour.riskLevel].label}<br/>
            Risk Score: ${contour.riskScore}<br/>
            Radius: ${contour.radius}m
          `, {
            permanent: false,
            direction: 'top'
          });

          circle.on('click', () => onZoneClick(zone.id));
        });
    });

    return () => {
      map.removeLayer(contoursLayer);
    };
  }, [zones, map, onZoneClick, onZoneEdit]);

  return null;
};

export const InteractiveRiskMap: React.FC<RiskMapProps> = ({ onZoneSelect, isRealTimeActive }) => {
  const [zonesData, setZonesData] = useState<Zone[]>([]);
  const [customZones, setCustomZones] = useState<CustomZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('select');
  const [selectedLocation, setSelectedLocation] = useState<LocationPreset>(locationPresets[0]);
  const [customLocation, setCustomLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);
  const [isZoneCreatorOpen, setIsZoneCreatorOpen] = useState(false);
  const [isZoneEditorOpen, setIsZoneEditorOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<CustomZone | null>(null);
  const [newZoneName, setNewZoneName] = useState('');
  const [selectedZoneCenter, setSelectedZoneCenter] = useState<LatLng | null>(null);
  const [showOriginalZones, setShowOriginalZones] = useState(true);
  const [showCustomZones, setShowCustomZones] = useState(true);

  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Load zones data
    fetch('/data/mock_zones.geojson')
      .then(response => response.json())
      .then(data => {
        setZonesData(data.features);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading zones data:', error);
        setLoading(false);
      });

    // Load saved custom zones from localStorage
    const savedZones = localStorage.getItem('customRiskZones');
    if (savedZones) {
      try {
        setCustomZones(JSON.parse(savedZones));
      } catch (error) {
        console.error('Error loading saved zones:', error);
      }
    }
  }, []);

  const handleLocationChange = (preset: LocationPreset) => {
    setSelectedLocation(preset);
    if (preset.id !== 'custom') {
      setCustomLocation(null);
    }
    setIsLocationSelectorOpen(false);
  };

  const handleCustomLocationSelect = (coordinates: { lat: number; lng: number }) => {
    if (selectedLocation.id === 'custom') {
      setCustomLocation(coordinates);
      setSelectedLocation({
        ...selectedLocation,
        coordinates,
        name: `Custom (${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)})`
      });
    }
  };

  const getCurrentCenter = (): [number, number] => {
    if (selectedLocation.id === 'custom' && customLocation) {
      return [customLocation.lat, customLocation.lng];
    }
    return [selectedLocation.coordinates.lat, selectedLocation.coordinates.lng];
  };

  const handleMapClick = (latlng: LatLng) => {
    if (drawingMode === 'draw') {
      setSelectedZoneCenter(latlng);
      setIsZoneCreatorOpen(true);
    }
  };

  const createNewZone = () => {
    if (!selectedZoneCenter || !newZoneName.trim()) return;

    const newZone: CustomZone = {
      id: `custom-zone-${Date.now()}`,
      name: newZoneName.trim(),
      center: { lat: selectedZoneCenter.lat, lng: selectedZoneCenter.lng },
      contours: [
        {
          id: 'critical',
          radius: 30,
          riskLevel: 'critical',
          riskScore: 9.2,
          color: riskConfigs.critical.color
        },
        {
          id: 'high',
          radius: 60,
          riskLevel: 'high',
          riskScore: 7.5,
          color: riskConfigs.high.color
        },
        {
          id: 'medium',
          radius: 90,
          riskLevel: 'medium',
          riskScore: 5.8,
          color: riskConfigs.medium.color
        },
        {
          id: 'low',
          radius: 120,
          riskLevel: 'low',
          riskScore: 3.2,
          color: riskConfigs.low.color
        }
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    const updatedZones = [...customZones, newZone];
    setCustomZones(updatedZones);
    localStorage.setItem('customRiskZones', JSON.stringify(updatedZones));
    
    setIsZoneCreatorOpen(false);
    setNewZoneName('');
    setSelectedZoneCenter(null);
    setDrawingMode('select');
  };

  const deleteCustomZone = (zoneId: string) => {
    const updatedZones = customZones.filter(zone => zone.id !== zoneId);
    setCustomZones(updatedZones);
    localStorage.setItem('customRiskZones', JSON.stringify(updatedZones));
  };

  const handleZoneEdit = (zoneId: string) => {
    const zoneToEdit = customZones.find(zone => zone.id === zoneId);
    if (zoneToEdit) {
      setEditingZone(zoneToEdit);
      setIsZoneEditorOpen(true);
    }
  };

  const handleZoneSave = (updatedZone: CustomZone) => {
    const updatedZones = customZones.map(zone =>
      zone.id === updatedZone.id 
        ? { ...updatedZone, metadata: { ...updatedZone.metadata, updatedAt: new Date().toISOString() } }
        : zone
    );
    setCustomZones(updatedZones);
    localStorage.setItem('customRiskZones', JSON.stringify(updatedZones));
    setIsZoneEditorOpen(false);
    setEditingZone(null);
  };

  const handleZoneEditCancel = () => {
    setIsZoneEditorOpen(false);
    setEditingZone(null);
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

  const getZoneStyle = (feature: any) => {
    return {
      fillColor: getRiskColor(feature.properties.risk_level),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    layer.on({
      mouseover: (e: any) => {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          color: '#333',
          dashArray: '',
          fillOpacity: 0.8
        });
      },
      mouseout: (e: any) => {
        const layer = e.target;
        layer.setStyle(getZoneStyle(feature));
      },
      click: () => {
        onZoneSelect(feature.properties.zone_id);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="loading-pulse w-8 h-8 bg-navy-600 rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full min-h-[300px] bg-gray-100 rounded-lg overflow-hidden">
      {/* Enhanced Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        {/* Drawing Tools */}
        <div className="map-control-button bg-white rounded-lg shadow-lg p-2">
          <div className="text-xs font-semibold text-gray-700 mb-2">Drawing Tools</div>
          <div className="grid grid-cols-2 gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDrawingMode('select')}
              className={`p-2 rounded-md text-xs font-medium transition-colors ${
                drawingMode === 'select'
                  ? 'bg-navy-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Select Tool"
            >
              <MousePointer className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDrawingMode('draw')}
              className={`p-2 rounded-md text-xs font-medium transition-colors ${
                drawingMode === 'draw'
                  ? 'bg-navy-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Draw Zone"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
          
          {drawingMode === 'draw' && (
            <div className="mt-2 text-xs text-gray-600 p-2 bg-blue-50 rounded">
              Click on map to place new zone
            </div>
          )}
        </div>

        {/* Layer Controls */}
        <div className="map-control-button bg-white rounded-lg shadow-lg p-2">
          <div className="text-xs font-semibold text-gray-700 mb-2">Layers</div>
          <div className="space-y-1">
            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={showOriginalZones}
                onChange={(e) => setShowOriginalZones(e.target.checked)}
                className="mr-2"
              />
              Original Zones
            </label>
            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={showCustomZones}
                onChange={(e) => setShowCustomZones(e.target.checked)}
                className="mr-2"
              />
              Custom Zones
            </label>
          </div>
        </div>

        {/* Risk Legend */}
        <div className="map-control-button bg-white rounded-lg shadow-lg p-2">
          <div className="text-xs font-semibold text-gray-700 mb-2">Risk Levels</div>
          <div className="space-y-1">
            {Object.entries(riskConfigs).map(([level, config]) => (
              <div key={level} className="flex items-center text-xs">
                <div 
                  className="w-3 h-3 rounded mr-2 risk-indicator" 
                  style={{ backgroundColor: config.color }}
                ></div>
                {config.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location Selector */}
      <div className="absolute top-4 left-4 z-[1000]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsLocationSelectorOpen(!isLocationSelectorOpen)}
          className="map-control-button bg-white rounded-lg shadow-lg p-3 flex items-center space-x-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Navigation className="w-4 h-4" />
          <span>{selectedLocation.name}</span>
        </motion.button>

        <AnimatePresence>
          {isLocationSelectorOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-64"
            >
              <div className="text-sm font-semibold text-gray-700 mb-2">Select Location</div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {locationPresets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handleLocationChange(preset)}
                    className={`w-full text-left p-2 rounded-md text-sm hover:bg-gray-100 transition-colors ${
                      selectedLocation.id === preset.id ? 'bg-navy-50 text-navy-700' : 'text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-gray-500">{preset.description}</div>
                    {preset.id !== 'custom' && (
                      <div className="text-xs text-gray-400">
                        {preset.coordinates.lat.toFixed(4)}, {preset.coordinates.lng.toFixed(4)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom Zones Management */}
      {customZones.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <div className="text-sm font-semibold text-gray-700 mb-2">Custom Zones</div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {customZones.map(zone => (
              <div key={zone.id} className="flex items-center justify-between text-xs">
                <span className="truncate flex-1">{zone.name}</span>
                <button
                  onClick={() => deleteCustomZone(zone.id)}
                  className="ml-2 text-red-600 hover:text-red-700"
                  title="Delete Zone"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time indicator */}
      {isRealTimeActive && (
        <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-safe-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-gray-700">Live Data</span>
          </div>
        </div>
      )}

      {/* Zone Creator Modal */}
      <AnimatePresence>
        {isZoneCreatorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create New Zone</h3>
                <button
                  onClick={() => setIsZoneCreatorOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zone Name
                  </label>
                  <input
                    type="text"
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    placeholder="Enter zone name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                </div>
                
                {selectedZoneCenter && (
                  <div className="text-sm text-gray-600">
                    <strong>Location:</strong> {selectedZoneCenter.lat.toFixed(6)}, {selectedZoneCenter.lng.toFixed(6)}
                  </div>
                )}
                
                <div className="text-sm text-gray-600">
                  This will create a topographical risk zone with multiple contour levels (Critical, High, Medium, Low).
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={createNewZone}
                  disabled={!newZoneName.trim()}
                  className="flex-1 bg-navy-600 text-white py-2 px-4 rounded-md hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Create Zone</span>
                </button>
                <button
                  onClick={() => setIsZoneCreatorOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MapContainer
        center={getCurrentCenter()}
        zoom={selectedLocation.zoom}
        className="h-full w-full rounded-lg"
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
        ref={mapRef}
        key={`map-${selectedLocation.id}-${selectedLocation.coordinates.lat}-${selectedLocation.coordinates.lng}`}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapEventHandler 
          drawingMode={drawingMode}
          onMapClick={handleMapClick}
          onLocationSelected={selectedLocation.id === 'custom' ? handleCustomLocationSelect : undefined}
        />
        
        {/* Original zones */}
        {showOriginalZones && zonesData.map((zone, index) => (
          <GeoJSON
            key={`zone-${zone.id}-${index}`}
            data={zone as any}
            style={getZoneStyle}
            onEachFeature={onEachFeature}
          >
            <Popup>
              <div className="p-2 min-w-64">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {zone.properties.name}
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk Level:</span>
                    <span className={`font-medium capitalize ${
                      zone.properties.risk_level === 'critical' ? 'text-danger-600' :
                      zone.properties.risk_level === 'high' ? 'text-warning-600' :
                      zone.properties.risk_level === 'medium' ? 'text-yellow-600' :
                      'text-safe-600'
                    }`}>
                      {zone.properties.risk_level}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk Score:</span>
                    <span className="font-medium">{zone.properties.risk_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Displacement:</span>
                    <span className="font-medium">{zone.properties.displacement_rate} mm/day</span>
                  </div>
                </div>
                <button
                  onClick={() => onZoneSelect(zone.properties.zone_id)}
                  className="mt-3 w-full bg-navy-600 text-white py-2 px-4 rounded-md hover:bg-navy-700 transition-colors text-sm"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </GeoJSON>
        ))}
        
        {/* Custom topographical zones */}
        {showCustomZones && (
          <TopographicalContours 
            zones={customZones}
            onZoneClick={(zoneId) => onZoneSelect(zoneId)}
            onZoneEdit={handleZoneEdit}
          />
        )}
      </MapContainer>

      {/* Zone Editor Modal */}
      <AnimatePresence>
        {isZoneEditorOpen && editingZone && (
          <ZoneContourEditor
            zone={editingZone}
            onSave={handleZoneSave}
            onCancel={handleZoneEditCancel}
          />
        )}
      </AnimatePresence>
    </div>
  );
};