// Enhanced notification service for real-world mobile alerts
import type { Alert } from '../components/AlertManagementSystem';

export interface MobileDevice {
  id: string;
  minerId: string;
  minerName: string;
  deviceType: 'android' | 'ios' | 'web';
  fcmToken?: string; // Firebase Cloud Messaging token
  phoneNumber: string;
  email: string;
  isActive: boolean;
  location?: {
    zone: string;
    coordinates?: { lat: number; lng: number };
  };
  preferences: {
    enablePushNotifications: boolean;
    enableSMS: boolean;
    enableEmail: boolean;
    enableVibration: boolean;
    quietHours?: { start: string; end: string };
    minimumSeverity: 'low' | 'medium' | 'high' | 'critical';
  };
  lastSeen: Date;
  batteryLevel?: number;
  networkStatus: 'online' | 'offline' | 'low-signal';
}

export interface NotificationTemplate {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: Array<'push' | 'sms' | 'email' | 'vibration'>;
  templates: {
    push: {
      title: string;
      body: string;
      icon?: string;
      sound?: string;
      vibrationPattern?: number[];
    };
    sms: {
      message: string;
    };
    email: {
      subject: string;
      htmlBody: string;
      textBody: string;
    };
  };
}

export interface NotificationDeliveryStatus {
  id: string;
  alertId: string;
  deviceId: string;
  channel: 'push' | 'sms' | 'email';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  timestamp: Date;
  errorMessage?: string;
  deliveryAttempts: number;
  readAt?: Date;
}

class RealWorldNotificationService {
  private devices: Map<string, MobileDevice> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private deliveryStatus: Map<string, NotificationDeliveryStatus[]> = new Map();
  private apiKeys: {
    twilio?: { accountSid: string; authToken: string; fromNumber: string };
    sendgrid?: { apiKey: string; fromEmail: string };
    firebase?: { serverKey: string; projectId: string };
  } = {};

  constructor() {
    this.initializeDefaultTemplates();
    this.loadApiKeys();
  }

  private initializeDefaultTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
        id: 'critical-rockfall-warning',
        name: 'Critical Rockfall Warning',
        severity: 'critical',
        channels: ['push', 'sms', 'email', 'vibration'],
        templates: {
          push: {
            title: '🚨 CRITICAL ALERT: Immediate Evacuation Required',
            body: 'Rockfall risk detected in {zoneName}. Evacuate immediately!',
            icon: '/icons/emergency.png',
            sound: 'emergency.mp3',
            vibrationPattern: [200, 100, 200, 100, 200, 100, 200]
          },
          sms: {
            message: '🚨 EMERGENCY: Rockfall risk in {zoneName}. EVACUATE IMMEDIATELY! Risk Score: {riskScore}. Time: {timestamp}'
          },
          email: {
            subject: 'CRITICAL ALERT: Immediate Evacuation Required - {zoneName}',
            htmlBody: `
              <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px;">
                <h1>🚨 CRITICAL ROCKFALL ALERT</h1>
                <h2>Zone: {zoneName}</h2>
                <p><strong>Risk Score:</strong> {riskScore}/100</p>
                <p><strong>Confidence:</strong> {confidence}%</p>
                <p><strong>Time to Event:</strong> {timeToEvent}</p>
                <p><strong>Action Required:</strong> IMMEDIATE EVACUATION</p>
                <p><strong>Alert Time:</strong> {timestamp}</p>
                <h3>Contributing Factors:</h3>
                <ul>{factors}</ul>
                <p style="font-size: 18px; font-weight: bold;">
                  Follow emergency evacuation procedures immediately!
                </p>
              </div>
            `,
            textBody: 'CRITICAL ROCKFALL ALERT - Zone: {zoneName}, Risk: {riskScore}/100, Action: IMMEDIATE EVACUATION'
          }
        }
      },
      {
        id: 'high-risk-warning',
        name: 'High Risk Warning',
        severity: 'high',
        channels: ['push', 'sms'],
        templates: {
          push: {
            title: '⚠️ HIGH RISK: {zoneName}',
            body: 'Elevated rockfall risk detected. Restrict access to essential personnel.',
            icon: '/icons/warning.png',
            sound: 'warning.mp3',
            vibrationPattern: [300, 200, 300]
          },
          sms: {
            message: '⚠️ HIGH RISK in {zoneName}. Risk Score: {riskScore}. Restrict access to essential personnel only.'
          },
          email: {
            subject: 'High Risk Alert - {zoneName}',
            htmlBody: `
              <div style="background: #f59e0b; color: white; padding: 15px; border-radius: 8px;">
                <h2>⚠️ High Risk Alert</h2>
                <p>Zone: {zoneName}</p>
                <p>Risk Score: {riskScore}/100</p>
                <p>Recommended Action: Restrict access to essential personnel</p>
              </div>
            `,
            textBody: 'High Risk Alert - {zoneName}: Risk Score {riskScore}/100'
          }
        }
      },
      {
        id: 'medium-risk-notification',
        name: 'Medium Risk Notification',
        severity: 'medium',
        channels: ['push'],
        templates: {
          push: {
            title: '📊 Monitoring Alert: {zoneName}',
            body: 'Increased monitoring recommended. Risk Score: {riskScore}',
            icon: '/icons/monitoring.png',
            vibrationPattern: [200, 100, 200]
          },
          sms: {
            message: '📊 Monitoring Alert: {zoneName} - Risk Score: {riskScore}. Increase monitoring frequency.'
          },
          email: {
            subject: 'Monitoring Alert - {zoneName}',
            htmlBody: `
              <div style="background: #3b82f6; color: white; padding: 15px; border-radius: 8px;">
                <h3>📊 Monitoring Alert</h3>
                <p>Zone: {zoneName}</p>
                <p>Risk Score: {riskScore}/100</p>
                <p>Recommended Action: Increase monitoring frequency</p>
              </div>
            `,
            textBody: 'Monitoring Alert - {zoneName}: Risk Score {riskScore}/100'
          }
        }
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private loadApiKeys(): void {
    // In production, load these from environment variables or secure config
    this.apiKeys = {
      twilio: {
        accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || 'your_twilio_account_sid',
        authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || 'your_twilio_auth_token',
        fromNumber: import.meta.env.VITE_TWILIO_FROM_NUMBER || '+1234567890'
      },
      sendgrid: {
        apiKey: import.meta.env.VITE_SENDGRID_API_KEY || 'your_sendgrid_api_key',
        fromEmail: import.meta.env.VITE_FROM_EMAIL || 'alerts@miningcompany.com'
      },
      firebase: {
        serverKey: import.meta.env.VITE_FIREBASE_SERVER_KEY || 'your_firebase_server_key',
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your_project_id'
      }
    };
  }

  // Register a new mobile device
  registerDevice(device: Omit<MobileDevice, 'id' | 'lastSeen' | 'networkStatus'>): string {
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newDevice: MobileDevice = {
      ...device,
      id: deviceId,
      lastSeen: new Date(),
      networkStatus: 'online'
    };
    
    this.devices.set(deviceId, newDevice);
    console.log(`Device registered: ${deviceId} for miner ${device.minerName}`);
    return deviceId;
  }

  // Update device status (battery, location, network)
  updateDeviceStatus(deviceId: string, updates: Partial<Pick<MobileDevice, 'batteryLevel' | 'location' | 'networkStatus' | 'lastSeen'>>): void {
    const device = this.devices.get(deviceId);
    if (device) {
      Object.assign(device, updates);
      this.devices.set(deviceId, device);
    }
  }

  // Send alert to all relevant devices
  async sendAlert(alert: Alert, zoneId: string): Promise<NotificationDeliveryStatus[]> {
    const relevantDevices = this.getRelevantDevices(alert, zoneId);
    const template = this.getTemplateForSeverity(alert.severity);
    const deliveryStatuses: NotificationDeliveryStatus[] = [];

    for (const device of relevantDevices) {
      if (!this.shouldSendToDevice(device, alert)) continue;

      // Send via each enabled channel
      if (device.preferences.enablePushNotifications && template.channels.includes('push')) {
        const status = await this.sendPushNotification(device, alert, template);
        deliveryStatuses.push(status);
      }

      if (device.preferences.enableSMS && template.channels.includes('sms')) {
        const status = await this.sendSMS(device, alert, template);
        deliveryStatuses.push(status);
      }

      if (device.preferences.enableEmail && template.channels.includes('email')) {
        const status = await this.sendEmail(device, alert, template);
        deliveryStatuses.push(status);
      }

      // Trigger vibration for critical alerts (handled by mobile app)
      if (device.preferences.enableVibration && alert.severity === 'critical') {
        await this.triggerVibration(device, template);
      }
    }

    // Store delivery statuses
    this.deliveryStatus.set(alert.id, deliveryStatuses);
    return deliveryStatuses;
  }

  private getRelevantDevices(alert: Alert, zoneId: string): MobileDevice[] {
    return Array.from(this.devices.values()).filter(device => {
      // Include devices in the same zone or nearby zones
      if (device.location?.zone === zoneId) return true;
      
      // Include supervisors and emergency contacts for critical alerts
      if (alert.severity === 'critical') return true;
      
      // Include devices within notification radius for high severity
      if (alert.severity === 'high' && device.location?.zone) {
        return this.isInNotificationRadius(device.location.zone, zoneId);
      }
      
      return false;
    });
  }

  private isInNotificationRadius(deviceZone: string, alertZone: string): boolean {
    // Simple zone proximity logic - in production, use actual coordinates
    const adjacentZones: Record<string, string[]> = {
      'zone-1': ['zone-2', 'zone-3'],
      'zone-2': ['zone-1', 'zone-4'],
      'zone-3': ['zone-1', 'zone-5'],
      'zone-4': ['zone-2', 'zone-6'],
      'zone-5': ['zone-3', 'zone-6'],
      'zone-6': ['zone-4', 'zone-5']
    };
    
    return adjacentZones[alertZone]?.includes(deviceZone) || false;
  }

  private shouldSendToDevice(device: MobileDevice, alert: Alert): boolean {
    // Check if device is active
    if (!device.isActive) return false;
    
    // Check minimum severity preference
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    if (severityLevels[alert.severity] < severityLevels[device.preferences.minimumSeverity]) {
      return false;
    }
    
    // Check quiet hours
    if (device.preferences.quietHours && alert.severity !== 'critical') {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const start = parseInt(device.preferences.quietHours.start.replace(':', ''));
      const end = parseInt(device.preferences.quietHours.end.replace(':', ''));
      
      if (start <= end) {
        if (currentTime >= start && currentTime <= end) return false;
      } else {
        if (currentTime >= start || currentTime <= end) return false;
      }
    }
    
    return true;
  }

  private getTemplateForSeverity(severity: string): NotificationTemplate {
    const templateMap: Record<string, string> = {
      critical: 'critical-rockfall-warning',
      high: 'high-risk-warning',
      medium: 'medium-risk-notification',
      low: 'medium-risk-notification'
    };
    
    return this.templates.get(templateMap[severity]) || this.templates.get('medium-risk-notification')!;
  }

  // Push Notification via Firebase Cloud Messaging
  private async sendPushNotification(device: MobileDevice, alert: Alert, template: NotificationTemplate): Promise<NotificationDeliveryStatus> {
    const status: NotificationDeliveryStatus = {
      id: `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      alertId: alert.id,
      deviceId: device.id,
      channel: 'push',
      status: 'pending',
      timestamp: new Date(),
      deliveryAttempts: 1
    };

    try {
      if (!device.fcmToken) {
        throw new Error('No FCM token available for device');
      }

      const message = this.formatMessage(template.templates.push.body, alert);
      const title = this.formatMessage(template.templates.push.title, alert);

      // In production, use Firebase Admin SDK
      const fcmPayload = {
        to: device.fcmToken,
        notification: {
          title,
          body: message,
          icon: template.templates.push.icon,
          sound: template.templates.push.sound,
          click_action: `https://your-app.com/alerts/${alert.id}`
        },
        data: {
          alertId: alert.id,
          severity: alert.severity,
          zoneId: alert.zoneId,
          vibrationPattern: JSON.stringify(template.templates.push.vibrationPattern)
        }
      };

      // Simulate FCM call - replace with actual Firebase Admin SDK call
      console.log('Sending FCM notification:', fcmPayload);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      // Simulate success/failure
      if (Math.random() > 0.1) { // 90% success rate
        status.status = 'sent';
        console.log(`Push notification sent to ${device.minerName} (${device.id})`);
      } else {
        throw new Error('FCM delivery failed');
      }

    } catch (error) {
      status.status = 'failed';
      status.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Push notification failed for ${device.minerName}:`, error);
    }

    return status;
  }

  // SMS via Twilio
  private async sendSMS(device: MobileDevice, alert: Alert, template: NotificationTemplate): Promise<NotificationDeliveryStatus> {
    const status: NotificationDeliveryStatus = {
      id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      alertId: alert.id,
      deviceId: device.id,
      channel: 'sms',
      status: 'pending',
      timestamp: new Date(),
      deliveryAttempts: 1
    };

    try {
      const message = this.formatMessage(template.templates.sms.message, alert);

      // In production, use Twilio SDK
      const smsPayload = {
        from: this.apiKeys.twilio?.fromNumber,
        to: device.phoneNumber,
        body: message
      };

      console.log('Sending SMS:', smsPayload);
      
      // Simulate Twilio call
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      if (Math.random() > 0.05) { // 95% success rate
        status.status = 'sent';
        console.log(`SMS sent to ${device.minerName} (${device.phoneNumber})`);
      } else {
        throw new Error('SMS delivery failed');
      }

    } catch (error) {
      status.status = 'failed';
      status.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`SMS failed for ${device.minerName}:`, error);
    }

    return status;
  }

  // Email via SendGrid
  private async sendEmail(device: MobileDevice, alert: Alert, template: NotificationTemplate): Promise<NotificationDeliveryStatus> {
    const status: NotificationDeliveryStatus = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      alertId: alert.id,
      deviceId: device.id,
      channel: 'email',
      status: 'pending',
      timestamp: new Date(),
      deliveryAttempts: 1
    };

    try {
      const subject = this.formatMessage(template.templates.email.subject, alert);
      const htmlBody = this.formatMessage(template.templates.email.htmlBody, alert);
      const textBody = this.formatMessage(template.templates.email.textBody, alert);

      // In production, use SendGrid SDK
      const emailPayload = {
        from: this.apiKeys.sendgrid?.fromEmail,
        to: device.email,
        subject,
        html: htmlBody,
        text: textBody
      };

      console.log('Sending Email:', emailPayload);
      
      // Simulate SendGrid call
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      if (Math.random() > 0.02) { // 98% success rate
        status.status = 'sent';
        console.log(`Email sent to ${device.minerName} (${device.email})`);
      } else {
        throw new Error('Email delivery failed');
      }

    } catch (error) {
      status.status = 'failed';
      status.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Email failed for ${device.minerName}:`, error);
    }

    return status;
  }

  // Trigger vibration on mobile device
  private async triggerVibration(device: MobileDevice, template: NotificationTemplate): Promise<void> {
    try {
      if (device.fcmToken && template.templates.push.vibrationPattern) {
        // Send silent push notification with vibration data
        const vibrationPayload = {
          to: device.fcmToken,
          data: {
            type: 'vibration',
            pattern: JSON.stringify(template.templates.push.vibrationPattern),
            severity: template.severity
          }
        };

        console.log(`Triggering vibration for ${device.minerName}:`, vibrationPayload);
      }
    } catch (error) {
      console.error(`Vibration trigger failed for ${device.minerName}:`, error);
    }
  }

  private formatMessage(template: string, alert: Alert): string {
    return template
      .replace(/{zoneName}/g, alert.zoneName)
      .replace(/{riskScore}/g, '85') // Would use actual risk score
      .replace(/{confidence}/g, '92') // Would use actual confidence
      .replace(/{timeToEvent}/g, '15 minutes') // Would use actual time
      .replace(/{timestamp}/g, new Date().toLocaleString())
      .replace(/{factors}/g, '<li>High displacement detected</li><li>Elevated pore pressure</li>'); // Would use actual factors
  }

  // Get delivery status for an alert
  getDeliveryStatus(alertId: string): NotificationDeliveryStatus[] {
    return this.deliveryStatus.get(alertId) || [];
  }

  // Get all registered devices
  getRegisteredDevices(): MobileDevice[] {
    return Array.from(this.devices.values());
  }

  // Update device preferences
  updateDevicePreferences(deviceId: string, preferences: Partial<MobileDevice['preferences']>): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.preferences = { ...device.preferences, ...preferences };
      this.devices.set(deviceId, device);
    }
  }
}

// Singleton instance
export const notificationService = new RealWorldNotificationService();

// React hook for using the notification service
export const useNotificationService = () => {
  return {
    registerDevice: (device: Omit<MobileDevice, 'id' | 'lastSeen' | 'networkStatus'>) => 
      notificationService.registerDevice(device),
    sendAlert: (alert: Alert, zoneId: string) => 
      notificationService.sendAlert(alert, zoneId),
    getDeliveryStatus: (alertId: string) => 
      notificationService.getDeliveryStatus(alertId),
    getRegisteredDevices: () => 
      notificationService.getRegisteredDevices(),
    updateDevicePreferences: (deviceId: string, preferences: Partial<MobileDevice['preferences']>) =>
      notificationService.updateDevicePreferences(deviceId, preferences),
    updateDeviceStatus: (deviceId: string, updates: Partial<Pick<MobileDevice, 'batteryLevel' | 'location' | 'networkStatus' | 'lastSeen'>>) =>
      notificationService.updateDeviceStatus(deviceId, updates)
  };
};