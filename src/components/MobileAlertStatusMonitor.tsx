import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  MessageSquare,
  Mail,
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  RefreshCw,
  TrendingUp,
  Users,
  Zap,
  Loader2
} from 'lucide-react';
import { apiService, type AlertDeliveryStatus, type Device } from '../services/apiService';

interface AlertStatusMonitorProps {
  refreshInterval?: number;
}

export const MobileAlertStatusMonitor: React.FC<AlertStatusMonitorProps> = ({
  refreshInterval = 30000
}) => {
  const [deliveryStatuses, setDeliveryStatuses] = useState<AlertDeliveryStatus[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<AlertDeliveryStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Set up refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Load devices and delivery statuses in parallel
      const [devicesResponse, statusResponse] = await Promise.all([
        apiService.getDevices(),
        apiService.getAllDeliveryStatuses()
      ]);

      if (devicesResponse.success && devicesResponse.data) {
        setDevices(devicesResponse.data);
      }

      if (statusResponse.success && statusResponse.data) {
        setDeliveryStatuses(statusResponse.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'read':
        return <Eye className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'push':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'email':
        return <Mail className="h-4 w-4 text-purple-500" />;
      default:
        return <Smartphone className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'read':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuccessRate = () => {
    if (deliveryStatuses.length === 0) return 0;
    const successful = deliveryStatuses.filter(s => 
      s.status === 'delivered' || s.status === 'read'
    ).length;
    return Math.round((successful / deliveryStatuses.length) * 100);
  };

  const getAverageDeliveryTime = () => {
    const deliveredStatuses = deliveryStatuses.filter(s => 
      s.status === 'delivered' || s.status === 'read'
    );
    if (deliveredStatuses.length === 0) return 0;
    
    // Calculate average based on created_at vs delivered_at
    let totalTime = 0;
    let count = 0;
    
    deliveredStatuses.forEach(status => {
      if (status.delivered_at && status.created_at) {
        const deliveredTime = new Date(status.delivered_at).getTime();
        const createdTime = new Date(status.created_at).getTime();
        totalTime += (deliveredTime - createdTime) / 1000; // Convert to seconds
        count++;
      }
    });
    
    return count > 0 ? Math.round(totalTime / count) : 0;
  };

  const getActiveDevices = () => {
    return devices.filter(d => d.is_active).length;
  };

  const getRecentAlerts = () => {
    const recentTime = Date.now() - 3600000; // Last hour
    return deliveryStatuses.filter(s => 
      new Date(s.created_at).getTime() > recentTime
    ).length;
  };

  const filteredStatuses = deliveryStatuses.slice(0, 50); // Show last 50 for performance

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading alert delivery status...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Alert Delivery Monitor</h2>
            <p className="text-gray-600">Real-time tracking of mobile alert delivery status</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => loadData(true)}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">{getSuccessRate()}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Delivery Time</p>
              <p className="text-2xl font-bold text-blue-600">{getAverageDeliveryTime()}s</p>
            </div>
            <Zap className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Devices</p>
              <p className="text-2xl font-bold text-purple-600">{getActiveDevices()}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recent Alerts</p>
              <p className="text-2xl font-bold text-orange-600">{getRecentAlerts()}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Channel Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {(['push', 'sms', 'email'] as const).map((channel) => {
          const channelStatuses = deliveryStatuses.filter(s => s.channel === channel);
          const successCount = channelStatuses.filter(s => 
            s.status === 'delivered' || s.status === 'read'
          ).length;
          const successRate = channelStatuses.length > 0 
            ? Math.round((successCount / channelStatuses.length) * 100) 
            : 0;

          return (
            <div key={channel} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                {getChannelIcon(channel)}
                <h3 className="font-semibold text-gray-900 capitalize">{channel} Notifications</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-sm font-medium text-gray-900">{successRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      successRate >= 90 ? 'bg-green-500' :
                      successRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${successRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Total: {channelStatuses.length}</span>
                  <span>Success: {successCount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delivery Status Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Delivery Status</h3>
            {isRefreshing && (
              <div className="flex items-center space-x-2 text-blue-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Updating...</span>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alert ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStatuses.map((status, index) => {
                const device = devices.find(d => d.id === status.device_id);
                
                return (
                  <motion.tr
                    key={status.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{status.alert_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{device?.miner_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{device?.miner_id || status.device_id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {getChannelIcon(status.channel)}
                        <span className="text-sm text-gray-900 capitalize">{status.channel}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status.status)}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                          {status.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-900">
                          {new Date(status.created_at).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(status.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${status.delivery_attempts > 1 ? 'text-orange-600 font-medium' : 'text-gray-900'}`}>
                        {status.delivery_attempts}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedStatus(status)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Details
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filteredStatuses.length === 0 && (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No delivery statuses available</p>
              <p className="text-sm text-gray-400">Alert delivery statuses will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Detail Modal */}
      <AnimatePresence>
        {selectedStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedStatus(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg max-w-lg w-full mx-4"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Delivery Details</h3>
                  <button
                    onClick={() => setSelectedStatus(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Alert ID</label>
                      <p className="text-sm text-gray-900">{selectedStatus.alert_id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Channel</label>
                      <div className="flex items-center space-x-2">
                        {getChannelIcon(selectedStatus.channel)}
                        <span className="text-sm text-gray-900 capitalize">{selectedStatus.channel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedStatus.status)}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStatus.status)}`}>
                          {selectedStatus.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Attempts</label>
                      <p className="text-sm text-gray-900">{selectedStatus.delivery_attempts}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created At</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedStatus.created_at).toLocaleString()}
                    </p>
                  </div>

                  {selectedStatus.delivered_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Delivered At</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedStatus.delivered_at).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {selectedStatus.read_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Read At</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedStatus.read_at).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {selectedStatus.error_message && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Error Message</label>
                      <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {selectedStatus.error_message}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => setSelectedStatus(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                  {selectedStatus.status === 'failed' && (
                    <button
                      onClick={() => {
                        // In real implementation, trigger retry
                        console.log('Retrying delivery for:', selectedStatus.id);
                        setSelectedStatus(null);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Retry Delivery
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};