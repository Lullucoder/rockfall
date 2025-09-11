import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface SensorReading {
  timestamp: string;
  value: number;
  unit: string;
}

interface Sensor {
  sensor_id: string;
  zone_id: string;
  sensor_type: string;
  readings: SensorReading[];
}

interface SensorChartsProps {
  selectedZone: string | null;
  isRealTimeActive: boolean;
}

export const SensorCharts: React.FC<SensorChartsProps> = ({ selectedZone }) => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/sensor_timeseries.json')
      .then(res => res.json())
      .then(data => {
        setSensors(data.sensors);
        setLoading(false);
      });
  }, []);

  // Filter sensors for selected zone or show all if none selected
  const filteredSensors = selectedZone
    ? sensors.filter(s => s.zone_id === selectedZone)
    : sensors;

  // Prepare chart data
  const displacement = filteredSensors.find(s => s.sensor_type === 'displacement');
  const rainfall = sensors.find(s => s.sensor_type === 'rainfall');

  if (loading) {
    return <div className="text-center">Loading sensor data...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Displacement vs Time */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold mb-2">Displacement vs Time</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={displacement?.readings || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tickFormatter={t => t.slice(5, 10)} />
            <YAxis unit={displacement?.readings[0]?.unit || ''} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#6366f1" name="Displacement" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Rainfall vs Risk (Bar) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold mb-2">Rainfall vs Risk</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={rainfall?.readings || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tickFormatter={t => t.slice(5, 10)} />
            <YAxis unit={rainfall?.readings[0]?.unit || ''} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#f59e0b" name="Rainfall" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
