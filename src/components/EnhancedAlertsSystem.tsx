import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, CheckCircle, Clock, MapPin, Phone, Mail, Users, AlertCircle, Zap } from 'lucide-react';

interface Alert {
  id: string;
  zone_id: string;
  zone_name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  message: string;
  risk_probability: number;
  timestamp: string;
  predicted_timeline: string;
  recommended_actions: string[];
  affected_personnel: number;
  equipment_at_risk: string[];
}

interface EnhancedAlertsSystemProps {
  alerts: Alert[];
  onAlertAction?: (alertId: string, action: 'acknowledge' | 'resolve' | 'escalate') => void;
}

export const EnhancedAlertsSystem: React.FC<EnhancedAlertsSystemProps> = ({ 
  alerts, 
  onAlertAction 
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'critical'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity' | 'probability'>('timestamp');
  const [alertStats, setAlertStats] = useState({
    critical: 0,
    high: 0,
    active: 0,
    total: 0
  });

  useEffect(() => {
    const stats = alerts.reduce((acc, alert) => {
      acc.total++;
      if (alert.severity === 'critical') acc.critical++;
      if (alert.severity === 'high') acc.high++;
      if (alert.status === 'active') acc.active++;
      return acc;
    }, { critical: 0, high: 0, active: 0, total: 0 });
    
    setAlertStats(stats);
  }, [alerts]);

  const filteredAlerts = alerts
    .filter(alert => {
      if (filter === 'active') return alert.status === 'active';
      if (filter === 'critical') return alert.severity === 'critical';
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        case 'probability':
          return b.risk_probability - a.risk_probability;
        case 'timestamp':
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Bell className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const sendEmergencyNotification = (alertItem: Alert) => {
    // Simulate emergency notification system
    const message = `CRITICAL ROCKFALL ALERT: Zone ${alertItem.zone_name} - Risk: ${(alertItem.risk_probability * 100).toFixed(1)}% - ${alertItem.message}`;
    
    // In a real system, this would integrate with SMS/Email services
    if (navigator.share) {
      navigator.share({
        title: 'Critical Rockfall Alert',
        text: message,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(message);
      window.alert('Alert details copied to clipboard for sharing');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Enhanced Alert System</h2>
            <p className="text-sm text-gray-600">Real-time rockfall risk monitoring and response</p>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{alertStats.critical}</div>
            <div className="text-xs text-gray-500">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{alertStats.high}</div>
            <div className="text-xs text-gray-500">High</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{alertStats.active}</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="all">All Alerts ({alerts.length})</option>
            <option value="active">Active Only ({alertStats.active})</option>
            <option value="critical">Critical Only ({alertStats.critical})</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="timestamp">Sort by Time</option>
            <option value="severity">Sort by Severity</option>
            <option value="probability">Sort by Risk %</option>
          </select>
        </div>

        <div className="flex space-x-2">
          <button className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
            <Bell className="w-4 h-4" />
            <span>Test Alert System</span>
          </button>
          <button className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">
            <CheckCircle className="w-4 h-4" />
            <span>Resolve All Low</span>
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No alerts match the current filter</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 transition-all ${
                alert.severity === 'critical' ? 'border-red-300 bg-red-50' :
                alert.severity === 'high' ? 'border-orange-300 bg-orange-50' :
                'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Alert Header */}
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                      {getSeverityIcon(alert.severity)}
                      <span>{alert.severity.toUpperCase()}</span>
                    </div>
                    
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                      {alert.status.toUpperCase()}
                    </div>
                    
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{alert.zone_name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Alert Message */}
                  <p className="text-gray-900 mb-3">{alert.message}</p>

                  {/* Risk Details */}
                  <div className="grid md:grid-cols-3 gap-4 mb-3">
                    <div className="bg-white p-3 rounded border">
                      <div className="text-xs text-gray-500 mb-1">Risk Probability</div>
                      <div className="text-lg font-semibold text-red-600">
                        {(alert.risk_probability * 100).toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded border">
                      <div className="text-xs text-gray-500 mb-1">Predicted Timeline</div>
                      <div className="text-sm font-medium text-gray-900">
                        {alert.predicted_timeline}
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded border">
                      <div className="text-xs text-gray-500 mb-1">Personnel at Risk</div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-orange-600" />
                        <span className="font-medium">{alert.affected_personnel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  {alert.recommended_actions.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Recommended Actions:</div>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {alert.recommended_actions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Equipment at Risk */}
                  {alert.equipment_at_risk.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Equipment at Risk:</div>
                      <div className="flex flex-wrap gap-1">
                        {alert.equipment_at_risk.map((equipment, index) => (
                          <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                            {equipment}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  {alert.status === 'active' && (
                    <>
                      <button
                        onClick={() => onAlertAction?.(alert.id, 'acknowledge')}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => onAlertAction?.(alert.id, 'resolve')}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                      >
                        Resolve
                      </button>
                    </>
                  )}
                  
                  {alert.severity === 'critical' && (
                    <button
                      onClick={() => sendEmergencyNotification(alert)}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Alert Team</span>
                    </button>
                  )}

                  <div className="flex space-x-1">
                    <button
                      onClick={() => window.open(`tel:+1234567890`)}
                      className="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      title="Call emergency"
                    >
                      <Phone className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => window.open(`mailto:safety@mine.com?subject=Alert ${alert.id}`)}
                      className="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      title="Send email"
                    >
                      <Mail className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Emergency Protocols */}
      {alertStats.critical > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Emergency Protocol Active</h3>
          </div>
          <p className="text-sm text-red-800 mb-3">
            {alertStats.critical} critical alert{alertStats.critical > 1 ? 's' : ''} detected. 
            Emergency response procedures should be initiated immediately.
          </p>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
              Initiate Emergency Evacuation
            </button>
            <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm">
              Contact Site Manager
            </button>
            <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm">
              View Emergency Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
