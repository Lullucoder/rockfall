import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Mail, 
  Users, 
  Settings, 
  Plus,
  Trash2,
  Edit,
  Phone,
  AlertTriangle,
  Check,
  X,
  Volume2,
  VolumeX
} from 'lucide-react';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'engineer' | 'supervisor' | 'manager' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  parameter: string;
  threshold: number;
  operator: '>' | '<' | '=' | '>=';
  severity: 'low' | 'medium' | 'high' | 'critical';
  emailEnabled: boolean;
  smsEnabled: boolean;
  soundEnabled: boolean;
  contacts: string[]; // Contact IDs
  cooldownMinutes: number;
  isActive: boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  zoneId: string;
  zoneName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  emailSent: boolean;
  smsSent: boolean;
}

interface AlertManagementSystemProps {
  onAlertTriggered: (alert: Alert) => void;
  currentZoneData?: Record<string, any>;
}

export const AlertManagementSystem: React.FC<AlertManagementSystemProps> = ({
  onAlertTriggered,
  currentZoneData
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules' | 'contacts' | 'settings'>('alerts');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize with default data
  useEffect(() => {
    const defaultContacts: Contact[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@mining.com',
        phone: '+1234567890',
        role: 'engineer',
        priority: 'high',
        isActive: true
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@mining.com',
        phone: '+1234567891',
        role: 'supervisor',
        priority: 'critical',
        isActive: true
      },
      {
        id: '3',
        name: 'Emergency Response',
        email: 'emergency@mining.com',
        phone: '+1234567999',
        role: 'emergency',
        priority: 'critical',
        isActive: true
      }
    ];

    const defaultRules: AlertRule[] = [
      {
        id: '1',
        name: 'High Displacement Warning',
        parameter: 'displacement',
        threshold: 15,
        operator: '>',
        severity: 'high',
        emailEnabled: true,
        smsEnabled: true,
        soundEnabled: true,
        contacts: ['1', '2'],
        cooldownMinutes: 30,
        isActive: true
      },
      {
        id: '2',
        name: 'Critical Strain Alert',
        parameter: 'strain',
        threshold: 800,
        operator: '>',
        severity: 'critical',
        emailEnabled: true,
        smsEnabled: true,
        soundEnabled: true,
        contacts: ['1', '2', '3'],
        cooldownMinutes: 15,
        isActive: true
      },
      {
        id: '3',
        name: 'High Pore Pressure',
        parameter: 'porePressure',
        threshold: 500,
        operator: '>',
        severity: 'medium',
        emailEnabled: true,
        smsEnabled: false,
        soundEnabled: false,
        contacts: ['1'],
        cooldownMinutes: 60,
        isActive: true
      }
    ];

    setContacts(defaultContacts);
    setAlertRules(defaultRules);
  }, []);

  // Monitor zone data for alert conditions
  useEffect(() => {
    if (!currentZoneData) return;

    Object.entries(currentZoneData).forEach(([zoneId, zoneData]) => {
      alertRules.forEach(rule => {
        if (!rule.isActive) return;

        const reading = zoneData.lastReading;
        const paramValue = reading[rule.parameter];
        
        if (paramValue === undefined) return;

        let conditionMet = false;
        switch (rule.operator) {
          case '>':
            conditionMet = paramValue > rule.threshold;
            break;
          case '<':
            conditionMet = paramValue < rule.threshold;
            break;
          case '>=':
            conditionMet = paramValue >= rule.threshold;
            break;
          case '=':
            conditionMet = Math.abs(paramValue - rule.threshold) < 0.01;
            break;
        }

        if (conditionMet) {
          // Check if we should trigger (considering cooldown)
          const existingAlert = activeAlerts.find(
            alert => alert.ruleId === rule.id && 
                    alert.zoneId === zoneId && 
                    !alert.resolved &&
                    (Date.now() - alert.timestamp.getTime()) < (rule.cooldownMinutes * 60 * 1000)
          );

          if (!existingAlert) {
            triggerAlert(rule, zoneId, zoneData.zoneName, paramValue);
          }
        }
      });
    });
  }, [currentZoneData, alertRules, activeAlerts]);

  const triggerAlert = (rule: AlertRule, zoneId: string, zoneName: string, value: number) => {
    const alert: Alert = {
      id: Date.now().toString(),
      ruleId: rule.id,
      ruleName: rule.name,
      zoneId,
      zoneName,
      severity: rule.severity,
      message: `${rule.name}: ${rule.parameter} value ${value.toFixed(2)} ${rule.operator} ${rule.threshold}`,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
      emailSent: false,
      smsSent: false
    };

    setActiveAlerts(prev => [alert, ...prev]);
    onAlertTriggered(alert);

    // Send notifications
    if (rule.emailEnabled) {
      sendEmailAlert(alert, rule);
    }
    if (rule.smsEnabled) {
      sendSMSAlert(alert, rule);
    }
    if (rule.soundEnabled && soundEnabled) {
      playAlertSound(rule.severity);
    }
  };

  const sendEmailAlert = async (alert: Alert, rule: AlertRule) => {
    // Simulate email sending
    console.log('Sending email alert:', {
      alert,
      recipients: rule.contacts.map(id => contacts.find(c => c.id === id)?.email).filter(Boolean)
    });
    
    // In a real implementation, this would call an email service
    setTimeout(() => {
      setActiveAlerts(prev => 
        prev.map(a => a.id === alert.id ? { ...a, emailSent: true } : a)
      );
    }, 1000);
  };

  const sendSMSAlert = async (alert: Alert, rule: AlertRule) => {
    // Simulate SMS sending
    console.log('Sending SMS alert:', {
      alert,
      recipients: rule.contacts.map(id => contacts.find(c => c.id === id)?.phone).filter(Boolean)
    });
    
    // In a real implementation, this would call an SMS service
    setTimeout(() => {
      setActiveAlerts(prev => 
        prev.map(a => a.id === alert.id ? { ...a, smsSent: true } : a)
      );
    }, 1500);
  };

  const playAlertSound = (severity: string) => {
    // Create audio context for sound alerts
    if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
      const audioContext = new (AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different severities
      const frequencies = {
        low: 400,
        medium: 600,
        high: 800,
        critical: 1000
      };

      oscillator.frequency.setValueAtTime(
        frequencies[severity as keyof typeof frequencies], 
        audioContext.currentTime
      );
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setActiveAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? {
              ...alert,
              acknowledged: true,
              acknowledgedBy: 'Current User',
              acknowledgedAt: new Date()
            }
          : alert
      )
    );
  };

  const resolveAlert = (alertId: string) => {
    setActiveAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? {
              ...alert,
              resolved: true,
              resolvedAt: new Date()
            }
          : alert
      )
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-danger-600 bg-danger-50 border-danger-200';
      case 'high':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const ContactForm = ({ onSave, onCancel, editContact }: { 
    onSave: (contact: Omit<Contact, 'id'>) => void; 
    onCancel: () => void;
    editContact?: Contact;
  }) => {
    const [formData, setFormData] = useState({
      name: editContact?.name || '',
      email: editContact?.email || '',
      phone: editContact?.phone || '',
      role: editContact?.role || 'engineer' as const,
      priority: editContact?.priority || 'medium' as const,
      isActive: editContact?.isActive ?? true
    });

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">
            {editContact ? 'Edit Contact' : 'Add New Contact'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                >
                  <option value="engineer">Engineer</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="manager">Manager</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSave(formData)}
              className="flex-1 bg-navy-600 text-white py-2 px-4 rounded-lg hover:bg-navy-700"
            >
              Save
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-danger-600 to-danger-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Alert Management</h3>
              <p className="text-danger-200 text-sm">Configure notifications and thresholds</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-white" />
              ) : (
                <VolumeX className="w-5 h-5 text-white" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-6">
          {[
            { id: 'alerts', label: 'Active Alerts', icon: AlertTriangle },
            { id: 'rules', label: 'Alert Rules', icon: Settings },
            { id: 'contacts', label: 'Contacts', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === id
                  ? 'border-danger-500 text-danger-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {id === 'alerts' && activeAlerts.filter(a => !a.acknowledged).length > 0 && (
                <span className="bg-danger-500 text-white text-xs rounded-full px-2 py-0.5">
                  {activeAlerts.filter(a => !a.acknowledged).length}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {activeAlerts.length === 0 ? (
              <div className="text-center py-12">
                <Check className="w-12 h-12 text-safe-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h4>
                <p className="text-gray-500">All systems are operating normally</p>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} ${
                    alert.acknowledged ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">{alert.ruleName}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Zone: {alert.zoneName}</span>
                        <span>Time: {alert.timestamp.toLocaleTimeString()}</span>
                        {alert.emailSent && <span className="text-safe-600">✓ Email sent</span>}
                        {alert.smsSent && <span className="text-safe-600">✓ SMS sent</span>}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {!alert.acknowledged && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="p-1 bg-safe-600 text-white rounded hover:bg-safe-700"
                        >
                          <Check className="w-4 h-4" />
                        </motion.button>
                      )}
                      {!alert.resolved && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => resolveAlert(alert.id)}
                          className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'contacts' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-medium">Emergency Contacts</h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddingContact(true)}
                className="flex items-center space-x-2 bg-navy-600 text-white px-4 py-2 rounded-lg hover:bg-navy-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Contact</span>
              </motion.button>
            </div>
            
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h5 className="font-medium">{contact.name}</h5>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          contact.isActive ? 'bg-safe-100 text-safe-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {contact.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {contact.role}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{contact.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{contact.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-danger-100 text-danger-600 rounded hover:bg-danger-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {isAddingContact && (
          <ContactForm
            onSave={(contactData) => {
              const newContact: Contact = {
                ...contactData,
                id: Date.now().toString()
              };
              setContacts(prev => [...prev, newContact]);
              setIsAddingContact(false);
            }}
            onCancel={() => setIsAddingContact(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};