import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SimpleRiskMapProps {
  onZoneSelect: (zoneId: string) => void;
  isRealTimeActive: boolean;
}

export const SimpleRiskMap: React.FC<SimpleRiskMapProps> = ({ onZoneSelect, isRealTimeActive }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => setIsLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  const center: [number, number] = [28.7041, 77.1025];

  return (
    <div className="relative h-full w-full min-h-[300px] bg-gray-200 rounded-lg overflow-hidden">
      {/* Simple indicator */}
      {isRealTimeActive && (
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-gray-700">Live Data</span>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-2">
        <div className="text-xs font-semibold text-gray-700 mb-2">Test Map</div>
        <div className="text-xs text-gray-500">Click circles to test</div>
      </div>

      <MapContainer
        center={center}
        zoom={15}
        className="h-full w-full"
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Test circles */}
        <Circle
          center={[28.7041, 77.1025]}
          radius={100}
          fillColor="#ef4444"
          fillOpacity={0.3}
          color="#ef4444"
          weight={2}
          eventHandlers={{
            click: () => onZoneSelect('test-zone-1')
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-gray-900">Test Zone 1 - Critical</h3>
              <p className="text-sm text-gray-600">Click to select this zone</p>
              <button
                onClick={() => onZoneSelect('test-zone-1')}
                className="mt-2 w-full bg-red-600 text-white py-1 px-2 rounded text-xs"
              >
                Select Zone
              </button>
            </div>
          </Popup>
        </Circle>

        <Circle
          center={[28.7050, 77.1035]}
          radius={80}
          fillColor="#f59e0b"
          fillOpacity={0.3}
          color="#f59e0b"
          weight={2}
          eventHandlers={{
            click: () => onZoneSelect('test-zone-2')
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-gray-900">Test Zone 2 - High</h3>
              <p className="text-sm text-gray-600">Click to select this zone</p>
              <button
                onClick={() => onZoneSelect('test-zone-2')}
                className="mt-2 w-full bg-orange-600 text-white py-1 px-2 rounded text-xs"
              >
                Select Zone
              </button>
            </div>
          </Popup>
        </Circle>

        <Circle
          center={[28.7030, 77.1015]}
          radius={60}
          fillColor="#22c55e"
          fillOpacity={0.3}
          color="#22c55e"
          weight={2}
          eventHandlers={{
            click: () => onZoneSelect('test-zone-3')
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-gray-900">Test Zone 3 - Low</h3>
              <p className="text-sm text-gray-600">Click to select this zone</p>
              <button
                onClick={() => onZoneSelect('test-zone-3')}
                className="mt-2 w-full bg-green-600 text-white py-1 px-2 rounded text-xs"
              >
                Select Zone
              </button>
            </div>
          </Popup>
        </Circle>
      </MapContainer>
    </div>
  );
};