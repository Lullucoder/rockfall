import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Calendar, TrendingUp, Activity, AlertTriangle } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    // Fetch analytics data (mock for now)
    const mockAnalytics = {
      riskTrends: [
        { date: '2025-09-03', overall: 6.2, zone1: 7.1, zone2: 8.3, zone3: 4.8 },
        { date: '2025-09-04', overall: 6.5, zone1: 7.3, zone2: 8.7, zone3: 5.1 },
        { date: '2025-09-05', overall: 6.8, zone1: 7.6, zone2: 9.0, zone3: 5.3 },
        { date: '2025-09-06', overall: 7.0, zone1: 7.8, zone2: 9.2, zone3: 5.5 },
        { date: '2025-09-07', overall: 7.2, zone1: 8.0, zone2: 9.1, zone3: 5.7 },
        { date: '2025-09-08', overall: 7.1, zone1: 8.2, zone2: 8.9, zone3: 5.6 },
        { date: '2025-09-09', overall: 7.2, zone1: 8.2, zone2: 9.1, zone3: 5.7 }
      ],
      alertDistribution: [
        { name: 'Critical', value: 12, color: '#ef4444' },
        { name: 'High', value: 28, color: '#f59e0b' },
        { name: 'Medium', value: 45, color: '#eab308' },
        { name: 'Low', value: 15, color: '#22c55e' }
      ],
      sensorPerformance: [
        { sensor: 'DISP-001', uptime: 99.2, readings: 8760 },
        { sensor: 'STRAIN-001', uptime: 98.7, readings: 8654 },
        { sensor: 'PORE-001', uptime: 99.8, readings: 8792 },
        { sensor: 'RAIN-001', uptime: 97.3, readings: 8567 },
        { sensor: 'DISP-002', uptime: 99.5, readings: 8776 }
      ],
      correlationData: [
        { rainfall: 0, displacement: 0.3 },
        { rainfall: 2.3, displacement: 0.8 },
        { rainfall: 5.2, displacement: 1.9 },
        { rainfall: 8.7, displacement: 3.4 },
        { rainfall: 12.3, displacement: 5.8 },
        { rainfall: 15.6, displacement: 7.2 }
      ]
    };
    setAnalyticsData(mockAnalytics);
  }, [timeRange]);

  if (!analyticsData) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-1">
            Deep insights into rockfall patterns and system performance
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prediction Accuracy</p>
              <p className="text-2xl font-bold text-safe-600">99.2%</p>
              <p className="text-xs text-gray-500">↑ 0.3% from last week</p>
            </div>
            <div className="p-3 bg-safe-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-safe-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-warning-600">100</p>
              <p className="text-xs text-gray-500">12% critical alerts</p>
            </div>
            <div className="p-3 bg-warning-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sensor Uptime</p>
              <p className="text-2xl font-bold text-navy-600">98.9%</p>
              <p className="text-xs text-gray-500">5 sensors active</p>
            </div>
            <div className="p-3 bg-navy-100 rounded-lg">
              <Activity className="w-6 h-6 text-navy-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">1.8min</p>
              <p className="text-xs text-gray-500">↓ 0.2min improvement</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Calendar className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Score Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.riskTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => date.slice(-5)} />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="overall" stroke="#6366f1" name="Overall" strokeWidth={2} />
              <Line type="monotone" dataKey="zone1" stroke="#22c55e" name="Zone 1" />
              <Line type="monotone" dataKey="zone2" stroke="#ef4444" name="Zone 2" />
              <Line type="monotone" dataKey="zone3" stroke="#f59e0b" name="Zone 3" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Alert Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.alertDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.alertDistribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sensor Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sensor Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.sensorPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sensor" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="uptime" fill="#22c55e" name="Uptime %" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Rainfall vs Displacement Correlation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rainfall vs Displacement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={analyticsData.correlationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rainfall" name="Rainfall" unit="mm" />
              <YAxis dataKey="displacement" name="Displacement" unit="mm" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Correlation" data={analyticsData.correlationData} fill="#6366f1" />
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Detailed Analysis Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sensor Analysis Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sensor ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uptime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Readings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.sensorPerformance.map((sensor: any) => (
                <tr key={sensor.sensor}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sensor.sensor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sensor.sensor.includes('DISP') ? 'Displacement' : 
                     sensor.sensor.includes('STRAIN') ? 'Strain' :
                     sensor.sensor.includes('PORE') ? 'Pore Pressure' : 'Rainfall'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sensor.uptime}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sensor.readings.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      sensor.uptime > 99 ? 'bg-safe-100 text-safe-800' :
                      sensor.uptime > 95 ? 'bg-warning-100 text-warning-800' :
                      'bg-danger-100 text-danger-800'
                    }`}>
                      {sensor.uptime > 99 ? 'Excellent' : sensor.uptime > 95 ? 'Good' : 'Needs Attention'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
