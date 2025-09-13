import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Database, 
  Zap, 
  Activity, 
  Upload,
  AlertCircle,
  CheckCircle,
  Timer,
  Gauge
} from 'lucide-react';

interface DataSource {
  id: string;
  name: string;
  type: 'real' | 'simulated' | 'imported';
  status: 'active' | 'inactive' | 'error';
  lastUpdate: Date;
  dataRate: number; // Updates per minute
}

interface DataFlowControlProps {
  onDataSourceChange: (source: DataSource) => void;
  onSimulationToggle: (enabled: boolean) => void;
  onDataImport?: (data: any) => void;
}

export const DataFlowControl: React.FC<DataFlowControlProps> = ({
  onDataSourceChange,
  onSimulationToggle
}) => {
  const [activeSource, setActiveSource] = useState<string>('simulated');
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1); // 1x speed
  const [isSimulationRunning, setIsSimulationRunning] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dataQuality, setDataQuality] = useState<'low' | 'medium' | 'high'>('medium');

  const dataSources: DataSource[] = [
    {
      id: 'real',
      name: 'Real Sensor Network',
      type: 'real',
      status: 'inactive',
      lastUpdate: new Date(Date.now() - 300000), // 5 minutes ago
      dataRate: 2
    },
    {
      id: 'simulated',
      name: 'Intelligent Simulation',
      type: 'simulated',
      status: 'active',
      lastUpdate: new Date(),
      dataRate: 10
    },
    {
      id: 'imported',
      name: 'Imported Dataset',
      type: 'imported',
      status: 'inactive',
      lastUpdate: new Date(Date.now() - 3600000), // 1 hour ago
      dataRate: 0
    }
  ];

  const [sources, setSources] = useState(dataSources);

  useEffect(() => {
    const activeSourceData = sources.find(s => s.id === activeSource);
    if (activeSourceData) {
      onDataSourceChange(activeSourceData);
    }
  }, [activeSource, sources, onDataSourceChange]);

  useEffect(() => {
    onSimulationToggle(isSimulationRunning && activeSource === 'simulated');
  }, [isSimulationRunning, activeSource, onSimulationToggle]);

  const handleSourceChange = (sourceId: string) => {
    setActiveSource(sourceId);
    setSources(prev => prev.map(s => ({
      ...s,
      status: s.id === sourceId ? 'active' : 'inactive',
      lastUpdate: s.id === sourceId ? new Date() : s.lastUpdate
    })));
  };

  const handleSimulationSpeedChange = (speed: number) => {
    setSimulationSpeed(speed);
    // This would trigger faster/slower data generation
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-safe-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-danger-500" />;
      default:
        return <Timer className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'border-safe-200 bg-safe-50';
      case 'error':
        return 'border-danger-200 bg-danger-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-600 to-navy-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Data Flow Control</h3>
              <p className="text-navy-200 text-sm">Manage data sources and simulation</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Data Sources */}
      <div className="p-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Active Data Source
          </h4>
          
          <div className="grid gap-3">
            {sources.map((source) => (
              <motion.div
                key={source.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleSourceChange(source.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  activeSource === source.id
                    ? 'border-navy-300 bg-navy-50 shadow-md'
                    : getStatusColor(source.status)
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(source.status)}
                    <div>
                      <p className="font-medium text-gray-900">{source.name}</p>
                      <p className="text-sm text-gray-500">
                        Last update: {source.lastUpdate.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {source.dataRate}/min
                    </p>
                    <p className="text-xs text-gray-500">Data rate</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Simulation Controls */}
        <AnimatePresence>
          {activeSource === 'simulated' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <h4 className="font-medium text-gray-900 flex items-center mb-4">
                <Zap className="w-4 h-4 mr-2" />
                Simulation Controls
              </h4>
              
              <div className="space-y-4">
                {/* Play/Pause Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Simulation Status</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsSimulationRunning(!isSimulationRunning)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isSimulationRunning
                        ? 'bg-safe-600 text-white hover:bg-safe-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {isSimulationRunning ? 'Running' : 'Paused'}
                  </motion.button>
                </div>

                {/* Speed Control */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Speed Multiplier</span>
                    <span className="text-sm text-gray-500">{simulationSpeed}x</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Gauge className="w-4 h-4 text-gray-400" />
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={simulationSpeed}
                      onChange={(e) => handleSimulationSpeedChange(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0.1x</span>
                    <span>1x</span>
                    <span>5x</span>
                  </div>
                </div>

                {/* Data Quality */}
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-2">Data Quality</span>
                  <div className="flex space-x-2">
                    {(['low', 'medium', 'high'] as const).map((quality) => (
                      <motion.button
                        key={quality}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDataQuality(quality)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          dataQuality === quality
                            ? 'bg-navy-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {quality.charAt(0).toUpperCase() + quality.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Import */}
        <AnimatePresence>
          {activeSource === 'imported' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <h4 className="font-medium text-gray-900 flex items-center mb-4">
                <Upload className="w-4 h-4 mr-2" />
                Data Import
              </h4>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Drop files here or click to browse</p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports CSV, JSON, and Excel formats
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Settings */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <h4 className="font-medium text-gray-900 flex items-center mb-4">
                <Settings className="w-4 h-4 mr-2" />
                Advanced Settings
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buffer Size
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent">
                    <option value="100">100 readings</option>
                    <option value="500">500 readings</option>
                    <option value="1000">1000 readings</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Noise Level
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent">
                    <option value="minimal">Minimal</option>
                    <option value="realistic">Realistic</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};