import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Shield, 
  UserPlus, 
  Bell, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Battery, 
  Wifi,
  X,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { apiService, type Device } from '../services/apiService';

interface MobileDeviceRegistrationProps {
  onDeviceRegistered?: (deviceId: string) => void;
}

export const MobileDeviceRegistration: React.FC<MobileDeviceRegistrationProps> = ({
  onDeviceRegistered
}) => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registeredDevices, setRegisteredDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    miner_id: '',
    miner_name: '',
    device_type: 'android' as 'android' | 'ios' | 'web',
    phone_number: '',
    email: '',
    zone_assignment: '',
    is_active: true,
    preferences: {
      enablePushNotifications: true,
      enableSMS: true,
      enableEmail: false,
      enableVibration: true,
      quietHours: { start: '22:00', end: '06:00' },
      minimumSeverity: 'medium' as 'low' | 'medium' | 'high' | 'critical'
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load devices on component mount
  useEffect(() => {
    loadDevices();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadDevices = async () => {
    try {
      const response = await apiService.getDevices();
      if (response.success && response.data) {
        setRegisteredDevices(response.data);
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to load devices' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load devices' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.miner_id.trim()) newErrors.miner_id = 'Miner ID is required';
    if (!formData.miner_name.trim()) newErrors.miner_name = 'Miner name is required';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.zone_assignment.trim()) newErrors.zone_assignment = 'Zone assignment is required';

    // Phone number validation
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (formData.phone_number && !phoneRegex.test(formData.phone_number)) {
      newErrors.phone_number = 'Invalid phone number format';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterDevice = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await apiService.registerDevice(formData);
      
      if (response.success && response.data) {
        setMessage({ type: 'success', text: 'Device registered successfully!' });
        setShowRegistrationForm(false);
        
        // Reset form
        setFormData({
          miner_id: '',
          miner_name: '',
          device_type: 'android',
          phone_number: '',
          email: '',
          zone_assignment: '',
          is_active: true,
          preferences: {
            enablePushNotifications: true,
            enableSMS: true,
            enableEmail: false,
            enableVibration: true,
            quietHours: { start: '22:00', end: '06:00' },
            minimumSeverity: 'medium'
          }
        });
        
        // Reload devices
        await loadDevices();
        
        // Notify parent component
        if (onDeviceRegistered && response.data.id) {
          onDeviceRegistered(response.data.id);
        }
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to register device' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to register device' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async (device: Device) => {
    if (!device.id) return;
    
    setLoading(true);
    try {
      const response = await apiService.testAlert(device.id);
      if (response.success) {
        setMessage({ type: 'success', text: `Test notification sent to ${device.miner_name}` });
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to send test notification' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send test notification' });
    } finally {
      setLoading(false);
    }
  };

  const getDeviceStatusColor = (device: Device) => {
    if (!device.is_active) return 'bg-gray-100 text-gray-800';
    return 'bg-green-100 text-green-800';
  };

  const getDeviceTypeIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'android':
      case 'ios':
        return <Smartphone className="h-4 w-4" />;
      case 'web':
        return <Wifi className="h-4 w-4" />;
      default:
        return <Smartphone className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6">
      {/* Message Display */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-4 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <Check className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span>{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="ml-auto text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Smartphone className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mobile Device Registration</h2>
            <p className="text-gray-600">Register miner devices for rockfall alerts</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowRegistrationForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" />
          <span>Register Device</span>
        </motion.button>
      </div>

      {/* Registered Devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {(Array.isArray(registeredDevices) ? registeredDevices : []).map((device) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getDeviceTypeIcon(device.device_type)}
                <div>
                  <h3 className="font-semibold text-gray-900">{device.miner_name}</h3>
                  <p className="text-sm text-gray-500">{device.miner_id}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDeviceStatusColor(device)}`}>
                {device.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MessageSquare className="h-4 w-4" />
                <span>{device.phone_number}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{device.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{device.zone_assignment}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-3">
              {device.preferences?.enablePushNotifications && (
                <Bell className="h-4 w-4 text-blue-500" title="Push Notifications" />
              )}
              {device.preferences?.enableSMS && (
                <MessageSquare className="h-4 w-4 text-green-500" title="SMS" />
              )}
              {device.preferences?.enableEmail && (
                <Mail className="h-4 w-4 text-purple-500" title="Email" />
              )}
            </div>

            <button
              onClick={() => handleTestNotification(device)}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              <span>Test Alert</span>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Registration Form Modal */}
      <AnimatePresence>
        {showRegistrationForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRegistrationForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Register New Device</h3>
                  <button
                    onClick={() => setShowRegistrationForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleRegisterDevice(); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Miner ID
                      </label>
                      <input
                        type="text"
                        value={formData.miner_id}
                        onChange={(e) => setFormData({ ...formData, miner_id: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.miner_id ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="M001"
                      />
                      {errors.miner_id && <p className="text-sm text-red-600 mt-1">{errors.miner_id}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Miner Name
                      </label>
                      <input
                        type="text"
                        value={formData.miner_name}
                        onChange={(e) => setFormData({ ...formData, miner_name: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.miner_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="John Doe"
                      />
                      {errors.miner_name && <p className="text-sm text-red-600 mt-1">{errors.miner_name}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.phone_number ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="+1234567890"
                      />
                      {errors.phone_number && <p className="text-sm text-red-600 mt-1">{errors.phone_number}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Device Type
                      </label>
                      <select
                        value={formData.device_type}
                        onChange={(e) => setFormData({ ...formData, device_type: e.target.value as 'android' | 'ios' | 'web' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="android">Android</option>
                        <option value="ios">iOS</option>
                        <option value="web">Web Browser</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zone Assignment
                      </label>
                      <input
                        type="text"
                        value={formData.zone_assignment}
                        onChange={(e) => setFormData({ ...formData, zone_assignment: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.zone_assignment ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Zone-A1"
                      />
                      {errors.zone_assignment && <p className="text-sm text-red-600 mt-1">{errors.zone_assignment}</p>}
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Notification Preferences
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.preferences.enablePushNotifications}
                          onChange={(e) => setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, enablePushNotifications: e.target.checked }
                          })}
                          className="rounded"
                        />
                        <span className="text-sm">Push Notifications</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.preferences.enableSMS}
                          onChange={(e) => setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, enableSMS: e.target.checked }
                          })}
                          className="rounded"
                        />
                        <span className="text-sm">SMS Alerts</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.preferences.enableEmail}
                          onChange={(e) => setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, enableEmail: e.target.checked }
                          })}
                          className="rounded"
                        />
                        <span className="text-sm">Email Alerts</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.preferences.enableVibration}
                          onChange={(e) => setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, enableVibration: e.target.checked }
                          })}
                          className="rounded"
                        />
                        <span className="text-sm">Vibration</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Severity Level
                    </label>
                    <select
                      value={formData.preferences.minimumSeverity}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, minimumSeverity: e.target.value as 'low' | 'medium' | 'high' | 'critical' }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowRegistrationForm(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                      <span>Register Device</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};