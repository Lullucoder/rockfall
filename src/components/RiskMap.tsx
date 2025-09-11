import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import L, { type LatLngBoundsExpression } from 'leaflet';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

interface RiskMapProps {
  onZoneSelect: (zoneId: string) => void;
  isRealTimeActive: boolean;
}

export const RiskMap: React.FC<RiskMapProps> = ({ onZoneSelect, isRealTimeActive }) => {
  const [zonesData, setZonesData] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

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
  }, []);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#eab308';
      case 'low':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

  const getZoneStyle = (feature: any) => {
    const riskLevel = feature.properties.risk_level;
    return {
      fillColor: getRiskColor(riskLevel),
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

  // Center map on Delhi area (approximate coordinates for demo)
  const center: [number, number] = [28.7041, 77.1025];
  const bounds: LatLngBoundsExpression = [
    [28.7020, 77.1000],
    [28.7080, 77.1100]
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="loading-pulse w-8 h-8 bg-navy-600 rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            showHeatmap
              ? 'bg-navy-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
        </motion.button>
        
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-danger-500 rounded mr-2"></div>
            Critical
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-warning-500 rounded mr-2"></div>
            High
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 rounded mr-2"></div>
            Medium
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-safe-500 rounded mr-2"></div>
            Low
          </div>
        </div>
      </div>

      {/* Real-time indicator */}
      {isRealTimeActive && (
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-safe-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-gray-700">Live</span>
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={15}
        bounds={bounds}
        className="h-full w-full rounded-lg"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {zonesData.map((zone, index) => (
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
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alerts:</span>
                    <span className="font-medium">{zone.properties.alert_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium capitalize">{zone.properties.status}</span>
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
      </MapContainer>
    </div>
  );
};
