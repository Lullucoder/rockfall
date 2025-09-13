const admin = require('firebase-admin');
const twilio = require('twilio');
const sgMail = require('@sendgrid/mail');
const { v4: uuidv4 } = require('uuid');
const { getDevices, createAlertDelivery, updateDeliveryStatus, log } = require('../database/db');
const webpush = require('web-push');

class RealTimeNotificationService {
  constructor() {
    this.isInitialized = false;
    this.twilioClient = null;
    this.firebaseApp = null;
    
    // Notification templates
    this.templates = this.initializeTemplates();
  }

  async initialize() {
    try {
      console.log('🔧 Initializing notification services...');

      // Initialize Firebase Admin SDK
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        try {
          const rawKey = process.env.FIREBASE_PRIVATE_KEY
            .replace(/"/g, '')
            .replace(/\\n/g, '\n');
          const firebaseConfig = {
            type: 'service_account',
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: rawKey,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
            token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token'
          };
          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig),
            projectId: process.env.FIREBASE_PROJECT_ID
          });
          console.log('✅ Firebase initialized');
        } catch (fbErr) {
          console.log('⚠️ Firebase private key invalid or placeholder - continuing without Firebase push');
        }
      } else {
        console.log('⚠️ Firebase not configured - push notifications will be simulated');
      }

      // Initialize Twilio
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        const sid = process.env.TWILIO_ACCOUNT_SID;
        if (/^AC[0-9a-fA-F]{32}$/.test(sid)) {
          try {
            this.twilioClient = twilio(
              process.env.TWILIO_ACCOUNT_SID,
              process.env.TWILIO_AUTH_TOKEN
            );
            console.log('✅ Twilio initialized');
          } catch (twErr) {
            console.log('⚠️ Twilio credentials invalid - SMS will be simulated');
          }
        } else {
          console.log('⚠️ Twilio SID placeholder detected - SMS simulated');
        }
      } else {
        console.log('⚠️ Twilio not configured - SMS will be simulated');
      }

      // Initialize SendGrid
      if (process.env.SENDGRID_API_KEY) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        console.log('✅ SendGrid initialized');
      } else {
        console.log('⚠️ SendGrid not configured - emails will be simulated');
      }

      this.isInitialized = true;
      console.log('🎯 Notification service ready');

      // Initialize Web Push (VAPID)
      if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        try {
          webpush.setVapidDetails(
            process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
          );
          console.log('✅ Web Push (VAPID) initialized');
        } catch (err) {
          console.error('❌ Failed to initialize VAPID keys:', err.message);
        }
      } else {
        console.log('⚠️ VAPID keys not configured - web push disabled');
      }

    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
      throw error;
    }
  }

  initializeTemplates() {
    return {
      critical: {
        push: {
          title: '🚨 CRITICAL ALERT: Immediate Action Required',
          body: 'Rockfall risk detected in {zoneName}. EVACUATE IMMEDIATELY!',
          sound: 'emergency.mp3',
          vibrationPattern: [200, 100, 200, 100, 200, 100, 200]
        },
        sms: {
          message: '🚨 EMERGENCY: Rockfall risk in {zoneName}. EVACUATE IMMEDIATELY! Risk: {riskScore}/10. Time: {timestamp}'
        },
        email: {
          subject: 'CRITICAL ALERT: Immediate Evacuation Required - {zoneName}',
          htmlTemplate: this.getCriticalEmailTemplate(),
          textTemplate: 'CRITICAL ROCKFALL ALERT - {zoneName}: Risk {riskScore}/10. IMMEDIATE EVACUATION REQUIRED.'
        }
      },
      high: {
        push: {
          title: '⚠️ HIGH RISK: {zoneName}',
          body: 'Elevated rockfall risk detected. Restrict access to essential personnel.',
          sound: 'warning.mp3',
          vibrationPattern: [300, 200, 300]
        },
        sms: {
          message: '⚠️ HIGH RISK in {zoneName}. Risk: {riskScore}/10. Restrict access to essential personnel only.'
        },
        email: {
          subject: 'High Risk Alert - {zoneName}',
          htmlTemplate: this.getHighRiskEmailTemplate(),
          textTemplate: 'High Risk Alert - {zoneName}: Risk {riskScore}/10. Restrict access.'
        }
      },
      medium: {
        push: {
          title: '📊 Monitoring Alert: {zoneName}',
          body: 'Increased monitoring recommended. Risk Score: {riskScore}/10',
          vibrationPattern: [200, 100, 200]
        },
        sms: {
          message: '📊 Monitoring Alert: {zoneName} - Risk: {riskScore}/10. Increase monitoring frequency.'
        },
        email: {
          subject: 'Monitoring Alert - {zoneName}',
          htmlTemplate: this.getMediumRiskEmailTemplate(),
          textTemplate: 'Monitoring Alert - {zoneName}: Risk {riskScore}/10. Increase monitoring.'
        }
      }
    };
  }

  async sendAlert(alert, specificDeviceIds = []) {
    try {
      console.log(`📤 Sending alert ${alert.id} (${alert.severity}) for ${alert.zoneName}`);

      // Get target devices
      const devices = await this.getTargetDevices(alert, specificDeviceIds);
      console.log(`🎯 Targeting ${devices.length} devices`);

      if (devices.length === 0) {
        console.log('⚠️ No target devices found for alert');
        return [];
      }

      const deliveryResults = [];

      // Send to each device
      for (const device of devices) {
        if (!this.shouldSendToDevice(device, alert)) {
          console.log(`⏭️ Skipping device ${device.id} (${device.miner_name}) - preferences/conditions not met`);
          continue;
        }

        console.log(`📱 Sending to ${device.miner_name} (${device.id})`);

        // Send via enabled channels
        if (device.preferences?.enablePushNotifications !== false) {
          const result = await this.sendPushNotification(device, alert);
          deliveryResults.push(result);
        }

        if (device.preferences?.enableSMS !== false) {
          const result = await this.sendSMS(device, alert);
          deliveryResults.push(result);
        }

        if (device.preferences?.enableEmail === true) {
          const result = await this.sendEmail(device, alert);
          deliveryResults.push(result);
        }
      }

      await log('info', 'notification', `Alert sent to ${devices.length} devices`, {
        alertId: alert.id,
        severity: alert.severity,
        deliveryCount: deliveryResults.length
      });

      return deliveryResults;

    } catch (error) {
      console.error('❌ Failed to send alert:', error);
      await log('error', 'notification', 'Alert sending failed', {
        alertId: alert.id,
        error: error.message
      });
      throw error;
    }
  }

  async sendEmergencyAlert(alert) {
    try {
      console.log(`🚨 Sending EMERGENCY alert ${alert.id}`);

      // Get ALL active devices for emergency broadcasts
      const allDevices = await getDevices();
      const deliveryResults = [];

      for (const device of allDevices) {
        // Emergency alerts bypass most preferences except device being active
        if (!device.is_active) continue;

        console.log(`🚨 Emergency alert to ${device.miner_name}`);

        // Send via all available channels for emergency
        const pushResult = await this.sendPushNotification(device, alert);
        const smsResult = await this.sendSMS(device, alert);
        
        deliveryResults.push(pushResult, smsResult);

        // Also send email for critical emergencies
        if (device.email) {
          const emailResult = await this.sendEmail(device, alert);
          deliveryResults.push(emailResult);
        }
      }

      await log('critical', 'notification', 'Emergency alert broadcast sent', {
        alertId: alert.id,
        deviceCount: allDevices.length,
        deliveryCount: deliveryResults.length
      });

      return deliveryResults;

    } catch (error) {
      console.error('❌ Failed to send emergency alert:', error);
      await log('error', 'notification', 'Emergency alert failed', {
        alertId: alert.id,
        error: error.message
      });
      throw error;
    }
  }

  async getTargetDevices(alert, specificDeviceIds = []) {
    const allDevices = await getDevices();
    
    if (specificDeviceIds.length > 0) {
      return allDevices.filter(device => specificDeviceIds.includes(device.id));
    }

    // Filter by zone and alert severity
    return allDevices.filter(device => {
      // Always include critical alerts
      if (alert.severity === 'critical') return true;
      
      // Check zone assignment
      if (device.zone_assignment === alert.zoneId) return true;
      
      // Include adjacent zones for high severity
      if (alert.severity === 'high' && this.isAdjacentZone(device.zone_assignment, alert.zoneId)) {
        return true;
      }
      
      return false;
    });
  }

  isAdjacentZone(deviceZone, alertZone) {
    // Simple adjacency logic - in production use actual coordinate-based proximity
    const adjacencyMap = {
      'zone-1': ['zone-2', 'zone-3'],
      'zone-2': ['zone-1', 'zone-4'],
      'zone-3': ['zone-1', 'zone-5'],
      'zone-4': ['zone-2', 'zone-6'],
      'zone-5': ['zone-3', 'zone-6'],
      'zone-6': ['zone-4', 'zone-5']
    };
    
    return adjacencyMap[alertZone]?.includes(deviceZone) || false;
  }

  shouldSendToDevice(device, alert) {
    // Check if device is active
    if (!device.is_active) return false;

    // Parse preferences
    const prefs = typeof device.preferences === 'string' 
      ? JSON.parse(device.preferences || '{}') 
      : device.preferences || {};

    // Check minimum severity preference
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const alertLevel = severityLevels[alert.severity] || 2;
    const minLevel = severityLevels[prefs.minimumSeverity] || 2;
    
    if (alertLevel < minLevel && alert.severity !== 'critical') {
      return false;
    }

    // Check quiet hours (except for critical alerts)
    if (alert.severity !== 'critical' && prefs.quietHours) {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const start = parseInt(prefs.quietHours.start?.replace(':', '') || '0');
      const end = parseInt(prefs.quietHours.end?.replace(':', '') || '2400');
      
      if (start <= end) {
        if (currentTime >= start && currentTime <= end) return false;
      } else {
        if (currentTime >= start || currentTime <= end) return false;
      }
    }

    return true;
  }

  async sendPushNotification(device, alert) {
    const deliveryId = uuidv4();
    const template = this.templates[alert.severity]?.push || this.templates.medium.push;
    
    // Create delivery record
    const delivery = {
      id: deliveryId,
      alertId: alert.id,
      deviceId: device.id,
      channel: 'push',
      status: 'pending',
      deliveryAttempts: 1,
      timestamp: new Date().toISOString()
    };
    
    await createAlertDelivery(delivery);

    try {
      if (device.pushSubscription && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        // Web Push (Browser) using VAPID
        const payload = JSON.stringify({
          title: this.formatMessage(template.title, alert),
            body: this.formatMessage(template.body, alert),
            severity: alert.severity,
            alertId: alert.id,
            zoneId: alert.zoneId || '',
            vibrationPattern: template.vibrationPattern || [200,100,200],
            timestamp: new Date().toISOString()
        });

        try {
          await webpush.sendNotification(device.pushSubscription, payload);
          await updateDeliveryStatus(deliveryId, 'sent');
          console.log(`✅ Web Push sent (VAPID) to ${device.miner_name}`);
        } catch (err) {
          console.error('❌ Web push send failed:', err.statusCode, err.body || err.message);
          throw err;
        }

      } else if (this.firebaseApp && device.fcm_token) {
        // Real Firebase push notification
        const message = {
          token: device.fcm_token,
          notification: {
            title: this.formatMessage(template.title, alert),
            body: this.formatMessage(template.body, alert)
          },
          data: {
            alertId: alert.id,
            severity: alert.severity,
            zoneId: alert.zoneId || '',
            vibrationPattern: JSON.stringify(template.vibrationPattern || [200, 100, 200])
          },
          android: {
            priority: 'high',
            notification: {
              sound: template.sound || 'default',
              channelId: 'rockfall_alerts'
            }
          },
          apns: {
            payload: {
              aps: {
                sound: template.sound || 'default',
                badge: 1
              }
            }
          }
        };

        const response = await admin.messaging().send(message);
        await updateDeliveryStatus(deliveryId, 'sent');
        
        console.log(`✅ Push notification sent to ${device.miner_name}: ${response}`);

      } else {
        // Simulate push notification
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        if (Math.random() > 0.05) { // 95% success rate
          await updateDeliveryStatus(deliveryId, 'sent');
          console.log(`✅ Push notification simulated for ${device.miner_name}`);
        } else {
          throw new Error('Simulated FCM delivery failure');
        }
      }

      return delivery;

    } catch (error) {
      await updateDeliveryStatus(deliveryId, 'failed', error.message);
      console.error(`❌ Push notification failed for ${device.miner_name}:`, error.message);
      return { ...delivery, status: 'failed', errorMessage: error.message };
    }
  }

  async sendSMS(device, alert) {
    const deliveryId = uuidv4();
    const template = this.templates[alert.severity]?.sms || this.templates.medium.sms;
    
    const delivery = {
      id: deliveryId,
      alertId: alert.id,
      deviceId: device.id,
      channel: 'sms',
      status: 'pending',
      deliveryAttempts: 1,
      timestamp: new Date().toISOString()
    };
    
    await createAlertDelivery(delivery);

    try {
      const message = this.formatMessage(template.message, alert);

      if (this.twilioClient) {
        // Real Twilio SMS
        const result = await this.twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_FROM_NUMBER,
          to: device.phone_number
        });

        await updateDeliveryStatus(deliveryId, 'sent');
        console.log(`✅ SMS sent to ${device.miner_name}: ${result.sid}`);

      } else {
        // Simulate SMS
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        if (Math.random() > 0.02) { // 98% success rate
          await updateDeliveryStatus(deliveryId, 'sent');
          console.log(`✅ SMS simulated for ${device.miner_name} (${device.phone_number})`);
        } else {
          throw new Error('Simulated SMS delivery failure');
        }
      }

      return delivery;

    } catch (error) {
      await updateDeliveryStatus(deliveryId, 'failed', error.message);
      console.error(`❌ SMS failed for ${device.miner_name}:`, error.message);
      return { ...delivery, status: 'failed', errorMessage: error.message };
    }
  }

  async sendEmail(device, alert) {
    const deliveryId = uuidv4();
    const template = this.templates[alert.severity]?.email || this.templates.medium.email;
    
    const delivery = {
      id: deliveryId,
      alertId: alert.id,
      deviceId: device.id,
      channel: 'email',
      status: 'pending',
      deliveryAttempts: 1,
      timestamp: new Date().toISOString()
    };
    
    await createAlertDelivery(delivery);

    try {
      const subject = this.formatMessage(template.subject, alert);
      const htmlBody = this.formatMessage(template.htmlTemplate, alert);
      const textBody = this.formatMessage(template.textTemplate, alert);

      if (process.env.SENDGRID_API_KEY) {
        // Real SendGrid email
        const msg = {
          to: device.email,
          from: {
            email: process.env.FROM_EMAIL,
            name: process.env.FROM_NAME || 'Rockfall Alert System'
          },
          subject,
          text: textBody,
          html: htmlBody
        };

        await sgMail.send(msg);
        await updateDeliveryStatus(deliveryId, 'sent');
        console.log(`✅ Email sent to ${device.miner_name} (${device.email})`);

      } else {
        // Simulate email
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
        
        if (Math.random() > 0.01) { // 99% success rate
          await updateDeliveryStatus(deliveryId, 'sent');
          console.log(`✅ Email simulated for ${device.miner_name} (${device.email})`);
        } else {
          throw new Error('Simulated email delivery failure');
        }
      }

      return delivery;

    } catch (error) {
      await updateDeliveryStatus(deliveryId, 'failed', error.message);
      console.error(`❌ Email failed for ${device.miner_name}:`, error.message);
      return { ...delivery, status: 'failed', errorMessage: error.message };
    }
  }

  formatMessage(template, alert) {
    return template
      .replace(/{zoneName}/g, alert.zoneName || 'Unknown Zone')
      .replace(/{riskScore}/g, Math.round((alert.riskScore || 0) * 10) / 10)
      .replace(/{timestamp}/g, new Date(alert.timestamp).toLocaleString())
      .replace(/{timeToEvent}/g, alert.timeToEvent || 'Unknown')
      .replace(/{recommendedActions}/g, (alert.recommendedActions || []).map(action => `• ${action}`).join('\n'));
  }

  getCriticalEmailTemplate() {
    return `
      <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px; font-family: Arial, sans-serif;">
        <h1 style="margin: 0 0 16px 0;">🚨 CRITICAL ROCKFALL ALERT</h1>
        <h2 style="margin: 0 0 16px 0; color: #fef2f2;">Zone: {zoneName}</h2>
        <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 4px; margin: 16px 0;">
          <p><strong>Risk Score:</strong> {riskScore}/10</p>
          <p><strong>Time to Event:</strong> {timeToEvent}</p>
          <p><strong>Alert Time:</strong> {timestamp}</p>
        </div>
        <h3 style="color: #fef2f2;">IMMEDIATE ACTION REQUIRED:</h3>
        <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 4px;">
          {recommendedActions}
        </div>
        <p style="font-size: 18px; font-weight: bold; margin-top: 20px; text-align: center;">
          Follow emergency evacuation procedures immediately!
        </p>
      </div>
    `;
  }

  getHighRiskEmailTemplate() {
    return `
      <div style="background: #f59e0b; color: white; padding: 20px; border-radius: 8px; font-family: Arial, sans-serif;">
        <h2 style="margin: 0 0 16px 0;">⚠️ High Risk Alert</h2>
        <p><strong>Zone:</strong> {zoneName}</p>
        <p><strong>Risk Score:</strong> {riskScore}/10</p>
        <p><strong>Time:</strong> {timestamp}</p>
        <div style="margin-top: 16px;">
          <strong>Recommended Actions:</strong>
          <div style="margin-top: 8px;">{recommendedActions}</div>
        </div>
      </div>
    `;
  }

  getMediumRiskEmailTemplate() {
    return `
      <div style="background: #3b82f6; color: white; padding: 20px; border-radius: 8px; font-family: Arial, sans-serif;">
        <h3 style="margin: 0 0 16px 0;">📊 Monitoring Alert</h3>
        <p><strong>Zone:</strong> {zoneName}</p>
        <p><strong>Risk Score:</strong> {riskScore}/10</p>
        <p><strong>Time:</strong> {timestamp}</p>
        <div style="margin-top: 16px;">
          <strong>Recommended Actions:</strong>
          <div style="margin-top: 8px;">{recommendedActions}</div>
        </div>
      </div>
    `;
  }
}

module.exports = { RealTimeNotificationService };