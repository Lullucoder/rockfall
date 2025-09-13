import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, 
  Settings, 
  Sliders, 
  Palette,
  RotateCcw,
  Check,
  X,
  Info
} from 'lucide-react';

interface ContourEditorProps {
  zone: {
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
  };
  onSave: (updatedZone: any) => void;
  onCancel: () => void;
}

const riskConfigs = {
  critical: { color: '#ef4444', label: 'Critical Zone', maxRadius: 150 },
  high: { color: '#f59e0b', label: 'High Risk', maxRadius: 200 },
  medium: { color: '#eab308', label: 'Medium Risk', maxRadius: 250 },
  low: { color: '#22c55e', label: 'Low Risk', maxRadius: 300 }
};

export const ZoneContourEditor: React.FC<ContourEditorProps> = ({ 
  zone, 
  onSave, 
  onCancel 
}) => {
  const [editedZone, setEditedZone] = useState(zone);
  const [activeTab, setActiveTab] = useState<'properties' | 'contours' | 'advanced'>('properties');

  const updateZoneName = (name: string) => {
    setEditedZone({ ...editedZone, name });
  };

  const updateContourRadius = (contourId: string, radius: number) => {
    const updatedContours = editedZone.contours.map(contour =>
      contour.id === contourId ? { ...contour, radius } : contour
    );
    setEditedZone({ ...editedZone, contours: updatedContours });
  };

  const updateContourRiskScore = (contourId: string, riskScore: number) => {
    const updatedContours = editedZone.contours.map(contour =>
      contour.id === contourId ? { ...contour, riskScore } : contour
    );
    setEditedZone({ ...editedZone, contours: updatedContours });
  };

  const resetToDefaults = () => {
    const defaultContours = [
      { id: 'critical', radius: 30, riskLevel: 'critical' as const, riskScore: 9.2, color: riskConfigs.critical.color },
      { id: 'high', radius: 60, riskLevel: 'high' as const, riskScore: 7.5, color: riskConfigs.high.color },
      { id: 'medium', radius: 90, riskLevel: 'medium' as const, riskScore: 5.8, color: riskConfigs.medium.color },
      { id: 'low', radius: 120, riskLevel: 'low' as const, riskScore: 3.2, color: riskConfigs.low.color }
    ];
    setEditedZone({ ...editedZone, contours: defaultContours });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Edit3 className="w-6 h-6 text-navy-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Edit Zone</h3>
              <p className="text-sm text-gray-600">Customize zone properties and contours</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { key: 'properties', label: 'Properties', icon: Settings },
              { key: 'contours', label: 'Contours', icon: Sliders },
              { key: 'advanced', label: 'Advanced', icon: Palette }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === key
                    ? 'border-navy-500 text-navy-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'properties' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone Name
                </label>
                <input
                  type="text"
                  value={editedZone.name}
                  onChange={(e) => updateZoneName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-600">
                    <strong>Latitude:</strong> {editedZone.center.lat.toFixed(6)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Longitude:</strong> {editedZone.center.lng.toFixed(6)}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Zone Information</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      This zone contains {editedZone.contours.length} risk contours representing different threat levels.
                      Each contour can be individually customized in the Contours tab.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contours' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">Risk Contours</h4>
                <button
                  onClick={resetToDefaults}
                  className="flex items-center space-x-1 text-sm text-navy-600 hover:text-navy-700"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset to Defaults</span>
                </button>
              </div>

              <div className="space-y-4">
                {editedZone.contours.map((contour) => (
                  <div key={contour.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: contour.color }}
                        ></div>
                        <span className="font-medium text-gray-900 capitalize">
                          {riskConfigs[contour.riskLevel].label}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {contour.radius}m radius
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Radius (meters)
                        </label>
                        <input
                          type="range"
                          min="10"
                          max={riskConfigs[contour.riskLevel].maxRadius}
                          value={contour.radius}
                          onChange={(e) => updateContourRadius(contour.id, parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>10m</span>
                          <span>{contour.radius}m</span>
                          <span>{riskConfigs[contour.riskLevel].maxRadius}m</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Risk Score
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.1"
                          value={contour.riskScore}
                          onChange={(e) => updateContourRiskScore(contour.id, parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0.0</span>
                          <span>{contour.riskScore.toFixed(1)}</span>
                          <span>10.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Visual Settings</h4>
                <div className="space-y-3">
                  <label className="flex items-center text-sm">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    Show contour labels
                  </label>
                  <label className="flex items-center text-sm">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    Enable hover effects
                  </label>
                  <label className="flex items-center text-sm">
                    <input type="checkbox" className="mr-2" />
                    Show center marker
                  </label>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Data Integration</h4>
                <div className="space-y-3">
                  <label className="flex items-center text-sm">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    Real-time sensor data
                  </label>
                  <label className="flex items-center text-sm">
                    <input type="checkbox" className="mr-2" />
                    Weather integration
                  </label>
                  <label className="flex items-center text-sm">
                    <input type="checkbox" className="mr-2" />
                    Historical analysis
                  </label>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-md">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-900">Advanced Features</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      These settings affect how the zone integrates with the monitoring system and 
                      how data is processed for risk assessment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editedZone)}
            className="px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700 transition-colors flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};