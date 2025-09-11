import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { AISummaryPanel } from './AISummaryPanel';

interface Alert {
  id: string;
  zone_id: string;
  zone_name: string;
  timestamp: string;
  severity: string;
  status: string;
  type: string;
  message: string;
  recommended_actions: string[];
  risk_probability: number;
  auto_generated: boolean;
  acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
}

export const AlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/alerts.json')
      .then(res => res.json())
      .then(data => {
        setAlerts(data.alerts);
        setLoading(false);
      });
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-danger-500 text-white';
      case 'high': return 'bg-warning-500 text-white';
      case 'medium': return 'bg-yellow-400 text-gray-900';
      case 'low': return 'bg-safe-500 text-white';
      default: return 'bg-gray-300 text-gray-900';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-5 h-5 mr-2" />;
      case 'high': return <AlertTriangle className="w-5 h-5 mr-2" />;
      case 'medium': return <Info className="w-5 h-5 mr-2" />;
      case 'low': return <CheckCircle className="w-5 h-5 mr-2" />;
      default: return <Info className="w-5 h-5 mr-2" />;
    }
  };

  // Simulate alert button
  const simulateAlert = () => {
    const newAlert: Alert = {
      id: `ALERT-SIM-${Date.now()}`,
      zone_id: 'ZONE-002',
      zone_name: 'East Wall Section A',
      timestamp: new Date().toISOString(),
      severity: 'critical',
      status: 'active',
      type: 'simulated',
      message: 'Simulated critical alert: sudden displacement detected!',
      recommended_actions: [
        'Evacuate personnel',
        'Deploy emergency monitoring',
        'Contact response team'
      ],
      risk_probability: 0.99,
      auto_generated: false,
      acknowledged: false,
      acknowledged_by: null,
      acknowledged_at: null
    };
    setAlerts([newAlert, ...alerts]);
  };

  if (loading) {
    return <div className="card text-center">Loading alerts...</div>;
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Alerts</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={simulateAlert}
          className="btn-danger flex items-center text-sm px-3 py-2"
        >
          <Play className="w-4 h-4 mr-1" /> Simulate Alert
        </motion.button>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.length === 0 && <div className="text-gray-500">No alerts</div>}
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`rounded-lg p-4 flex items-start space-x-3 shadow-sm border ${getSeverityColor(alert.severity)}`}
            aria-label={`Alert: ${alert.severity}`}
            tabIndex={0}
          >
            <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{alert.zone_name}</span>
                <span className="text-xs font-medium">{new Date(alert.timestamp).toLocaleString()}</span>
              </div>
              <div className="text-sm mt-1">{alert.message}</div>
              <div className="text-xs mt-2">
                <span className="font-medium">Recommended:</span> {alert.recommended_actions.join(', ')}
              </div>
            </div>
          </div>
        ))}
      </div>
      <AISummaryPanel alerts={alerts} />
    </div>
  );
};
