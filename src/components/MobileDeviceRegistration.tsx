import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import type { MobileDevice } from '../services/RealWorldNotificationService';
import { useNotificationService } from '../services/RealWorldNotificationService';

interface MobileDeviceRegistrationProps {
  onDeviceRegistered?: (deviceId: string) => void;
}

export const MobileDeviceRegistration: React.FC<MobileDeviceRegistrationProps> = ({
  onDeviceRegistered
}) => {
  const { registerDevice, getRegisteredDevices, updateDevicePreferences } = useNotificationService();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registeredDevices, setRegisteredDevices] = useState<MobileDevice[]>(getRegisteredDevices());
  const [selectedDevice, setSelectedDevice] = useState<MobileDevice | null>(null);
  
  const [formData, setFormData] = useState({
    minerId: '',
    minerName: '',
    deviceType: 'android' as 'android' | 'ios' | 'web',
    phoneNumber: '',
    email: '',
    zone: '',
    fcmToken: '',
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.minerId.trim()) newErrors.minerId = 'Miner ID is required';
    if (!formData.minerName.trim()) newErrors.minerName = 'Miner name is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.zone.trim()) newErrors.zone = 'Zone assignment is required';

    // Phone number validation
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterDevice = () => {
    if (!validateForm()) return;

    try {
      const deviceData: Omit<MobileDevice, 'id' | 'lastSeen' | 'networkStatus'> = {
        minerId: formData.minerId,
        minerName: formData.minerName,
        deviceType: formData.deviceType,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        fcmToken: formData.fcmToken || undefined,
        isActive: true,
        location: { zone: formData.zone },
        preferences: {
          ...formData.preferences,
          quietHours: formData.preferences.quietHours?.start ? formData.preferences.quietHours : undefined
        },
        batteryLevel: 85,
      };

      const deviceId = registerDevice(deviceData);
      setRegisteredDevices(getRegisteredDevices());
      setShowRegistrationForm(false);
      setFormData({
        minerId: '',
        minerName: '',
        deviceType: 'android',
        phoneNumber: '',
        email: '',
        zone: '',
        fcmToken: '',
        preferences: {
          enablePushNotifications: true,
          enableSMS: true,
          enableEmail: false,
          enableVibration: true,
          quietHours: { start: '22:00', end: '06:00' },
          minimumSeverity: 'medium'
        }
      });

      onDeviceRegistered?.(deviceId);
    } catch (error) {
      console.error('Failed to register device:', error);
    }
  };

  const handleUpdatePreferences = (device: MobileDevice, newPreferences: Partial<MobileDevice['preferences']>) => {
    updateDevicePreferences(device.id, newPreferences);
    setRegisteredDevices(getRegisteredDevices());
    setSelectedDevice(null);
  };

  const getDeviceStatusColor = (device: MobileDevice) => {
    if (!device.isActive) return 'text-gray-400';
    if (device.networkStatus === 'offline') return 'text-red-500';
    if (device.networkStatus === 'low-signal') return 'text-yellow-500';
    return 'text-green-500';
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-gray-400';
    if (level > 50) return 'text-green-500';
    if (level > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const zones = [
    'Zone 1 - North Pit',
    'Zone 2 - East Quarry',
    'Zone 3 - South Mining',
    'Zone 4 - West Processing',
    'Zone 5 - Central Access',
    'Zone 6 - Equipment Bay'
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Smartphone className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mobile Device Management</h2>
            <p className="text-gray-600">Register and manage miner mobile devices for real-time alerts</p>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900">{registeredDevices.length}</p>
            </div>
            <Smartphone className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Online</p>
              <p className="text-2xl font-bold text-green-600">
                {registeredDevices.filter(d => d.networkStatus === 'online').length}
              </p>
            </div>
            <Wifi className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-orange-600">
                {registeredDevices.filter(d => d.preferences.enablePushNotifications).length}
              </p>
            </div>
            <Bell className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Battery</p>
              <p className="text-2xl font-bold text-red-600">
                {registeredDevices.filter(d => d.batteryLevel && d.batteryLevel < 20).length}
              </p>
            </div>
            <Battery className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Device List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Registered Devices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Miner</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Battery</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alerts</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {registeredDevices.map((device) => (
                <tr key={device.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{device.minerName}</p>
                      <p className="text-sm text-gray-500">ID: {device.minerId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Smartphone className={`h-4 w-4 ${getDeviceStatusColor(device)}`} />
                      <span className="text-sm text-gray-900 capitalize">{device.deviceType}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{device.location?.zone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      device.networkStatus === 'online' ? 'bg-green-100 text-green-800' :
                      device.networkStatus === 'low-signal' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {device.networkStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <Battery className={`h-4 w-4 ${getBatteryColor(device.batteryLevel)}`} />
                      <span className="text-sm text-gray-900">{device.batteryLevel || '--'}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-1">
                      {device.preferences.enablePushNotifications && (
                        <div title="Push Notifications">
                          <Bell className="h-4 w-4 text-blue-500" />
                        </div>
                      )}
                      {device.preferences.enableSMS && (
                        <div title="SMS">
                          <MessageSquare className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                      {device.preferences.enableEmail && (
                        <div title="Email">
                          <Mail className="h-4 w-4 text-purple-500" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedDevice(device)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Configure
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {registeredDevices.length === 0 && (
            <div className="text-center py-8">
              <Smartphone className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No devices registered yet</p>
              <p className="text-sm text-gray-400">Register the first device to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {showRegistrationForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowRegistrationForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Register Mobile Device</h3>
                  <button
                    onClick={() => setShowRegistrationForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Miner ID *
                      </label>
                      <input
                        type="text"
                        value={formData.minerId}
                        onChange={(e) => setFormData({ ...formData, minerId: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.minerId ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="M001"
                      />
                      {errors.minerId && <p className="text-red-500 text-xs mt-1">{errors.minerId}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Miner Name *
                      </label>
                      <input
                        type="text"
                        value={formData.minerName}
                        onChange={(e) => setFormData({ ...formData, minerName: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.minerName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="RockSafe"
                      />
                      {errors.minerName && <p className="text-red-500 text-xs mt-1">{errors.minerName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Device Type
                      </label>
                      <select
                        value={formData.deviceType}
                        onChange={(e) => setFormData({ ...formData, deviceType: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="android">Android</option>
                        <option value="ios">iOS</option>
                        <option value="web">Web App</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zone Assignment *
                      </label>
                      <select
                        value={formData.zone}
                        onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.zone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Zone</option>
                        {zones.map((zone) => (
                          <option key={zone} value={zone}>{zone}</option>
                        ))}
                      </select>
                      {errors.zone && <p className="text-red-500 text-xs mt-1">{errors.zone}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                      {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="RockSafe.doe@company.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      FCM Token (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.fcmToken}
                      onChange={(e) => setFormData({ ...formData, fcmToken: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Firebase Cloud Messaging token"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to generate automatically</p>
                  </div>

                  {/* Notification Preferences */}
                  <div className="border-t pt-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Notification Preferences</h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.preferences.enablePushNotifications}
                          onChange={(e) => setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, enablePushNotifications: e.target.checked }
                          })}
                          className="rounded border-gray-300"
                        />
                        <Bell className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-700">Push Notifications</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.preferences.enableSMS}
                          onChange={(e) => setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, enableSMS: e.target.checked }
                          })}
                          className="rounded border-gray-300"
                        />
                        <MessageSquare className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">SMS Messages</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.preferences.enableEmail}
                          onChange={(e) => setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, enableEmail: e.target.checked }
                          })}
                          className="rounded border-gray-300"
                        />
                        <Mail className="h-4 w-4 text-purple-500" />
                        <span className="text-sm text-gray-700">Email Alerts</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.preferences.enableVibration}
                          onChange={(e) => setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, enableVibration: e.target.checked }
                          })}
                          className="rounded border-gray-300"
                        />
                        <Shield className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-gray-700">Vibration</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Severity
                        </label>
                        <select
                          value={formData.preferences.minimumSeverity}
                          onChange={(e) => setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, minimumSeverity: e.target.value as any }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical Only</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quiet Hours Start
                        </label>
                        <input
                          type="time"
                          value={formData.preferences.quietHours?.start}
                          onChange={(e) => setFormData({
                            ...formData,
                            preferences: {
                              ...formData.preferences,
                              quietHours: { ...formData.preferences.quietHours!, start: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quiet Hours End
                        </label>
                        <input
                          type="time"
                          value={formData.preferences.quietHours?.end}
                          onChange={(e) => setFormData({
                            ...formData,
                            preferences: {
                              ...formData.preferences,
                              quietHours: { ...formData.preferences.quietHours!, end: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => setShowRegistrationForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRegisterDevice}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Check className="h-4 w-4" />
                    <span>Register Device</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Device Configuration Modal */}
      <AnimatePresence>
        {selectedDevice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedDevice(null)}
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
                  <h3 className="text-xl font-semibold text-gray-900">
                    Configure {selectedDevice.minerName}
                  </h3>
                  <button
                    onClick={() => setSelectedDevice(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedDevice.preferences.enablePushNotifications}
                        onChange={(e) => handleUpdatePreferences(selectedDevice, {
                          enablePushNotifications: e.target.checked
                        })}
                        className="rounded border-gray-300"
                      />
                      <Bell className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-700">Push Notifications</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedDevice.preferences.enableSMS}
                        onChange={(e) => handleUpdatePreferences(selectedDevice, {
                          enableSMS: e.target.checked
                        })}
                        className="rounded border-gray-300"
                      />
                      <MessageSquare className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">SMS Messages</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedDevice.preferences.enableEmail}
                        onChange={(e) => handleUpdatePreferences(selectedDevice, {
                          enableEmail: e.target.checked
                        })}
                        className="rounded border-gray-300"
                      />
                      <Mail className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-gray-700">Email Alerts</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedDevice.preferences.enableVibration}
                        onChange={(e) => handleUpdatePreferences(selectedDevice, {
                          enableVibration: e.target.checked
                        })}
                        className="rounded border-gray-300"
                      />
                      <Shield className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-700">Vibration</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Severity
                    </label>
                    <select
                      value={selectedDevice.preferences.minimumSeverity}
                      onChange={(e) => handleUpdatePreferences(selectedDevice, {
                        minimumSeverity: e.target.value as any
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical Only</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => setSelectedDevice(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};