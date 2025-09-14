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
          message: '🚨 CRITICAL ALERT - {zoneName}\n\nIMMEDIATE EVACUATION REQUIRED!\n\nRisk Score: {riskScore}/10\nProbability: {riskProbability}%\nTime: {timestamp}\n\nThis is NOT a drill. Follow emergency protocols immediately.\n\nAlert ID: {alertId}'
        },
        email: {
          subject: '🚨 CRITICAL ROCKFALL ALERT - Immediate Evacuation Required - {zoneName}',
          htmlTemplate: this.getCriticalEmailTemplate(),
          textTemplate: 'CRITICAL ROCKFALL ALERT - {zoneName}: Risk {riskScore}/10, Probability {riskProbability}%. IMMEDIATE EVACUATION REQUIRED. Follow emergency protocols. Alert ID: {alertId}'
        }
      },
      high: {
        push: {
          title: '⚠️ HIGH RISK ALERT: {zoneName}',
          body: 'Elevated rockfall risk detected. Restrict access to essential personnel.',
          sound: 'warning.mp3',
          vibrationPattern: [300, 200, 300]
        },
        sms: {
          message: '⚠️ HIGH RISK ALERT - {zoneName}\n\nElevated rockfall risk detected.\n\nRisk Score: {riskScore}/10\nProbability: {riskProbability}%\nTime: {timestamp}\n\nAction Required:\n• Restrict access to essential personnel only\n• Implement safety protocols\n• Monitor conditions closely\n\nAlert ID: {alertId}'
        },
        email: {
          subject: '⚠️ HIGH RISK ALERT - Enhanced Safety Protocols Required - {zoneName}',
          htmlTemplate: this.getHighRiskEmailTemplate(),
          textTemplate: 'HIGH RISK ALERT - {zoneName}: Risk {riskScore}/10, Probability {riskProbability}%. Restrict access to essential personnel. Enhanced safety protocols required. Alert ID: {alertId}'
        }
      },
      medium: {
        push: {
          title: '📊 MONITORING ALERT: {zoneName}',
          body: 'Increased monitoring recommended. Risk Score: {riskScore}/10',
          vibrationPattern: [200, 100, 200]
        },
        sms: {
          message: '📊 MONITORING ALERT - {zoneName}\n\nIncreased monitoring recommended.\n\nRisk Score: {riskScore}/10\nProbability: {riskProbability}%\nTime: {timestamp}\n\nRecommended Actions:\n• Increase monitoring frequency\n• Review safety procedures\n• Stay alert for changes\n\nAlert ID: {alertId}'
        },
        email: {
          subject: '📊 MONITORING ALERT - Enhanced Surveillance Required - {zoneName}',
          htmlTemplate: this.getMediumRiskEmailTemplate(),
          textTemplate: 'MONITORING ALERT - {zoneName}: Risk {riskScore}/10, Probability {riskProbability}%. Increase monitoring frequency and review safety procedures. Alert ID: {alertId}'
        }
      },
      low: {
        push: {
          title: '📋 ADVISORY: {zoneName}',
          body: 'Low-level activity detected. Continue normal operations with awareness.',
          vibrationPattern: [100, 50, 100]
        },
        sms: {
          message: '📋 ADVISORY - {zoneName}\n\nLow-level rockfall activity detected.\n\nRisk Score: {riskScore}/10\nProbability: {riskProbability}%\nTime: {timestamp}\n\nContinue normal operations with increased awareness.\n\nAlert ID: {alertId}'
        },
        email: {
          subject: '📋 ADVISORY NOTICE - Low-Level Activity Detected - {zoneName}',
          htmlTemplate: this.getLowRiskEmailTemplate(),
          textTemplate: 'ADVISORY - {zoneName}: Risk {riskScore}/10, Probability {riskProbability}%. Low-level activity detected. Continue normal operations with awareness. Alert ID: {alertId}'
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
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Critical Rockfall Alert</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">🚨</div>
            <h1 style="margin: 0; font-size: 28px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
              CRITICAL ROCKFALL ALERT
            </h1>
            <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 5px; margin-top: 15px; border: 2px solid rgba(255,255,255,0.3);">
              <h2 style="margin: 0; font-size: 22px; color: #fef2f2;">Zone: {zoneName}</h2>
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px 20px;">
            <!-- Emergency Notice -->
            <div style="background: #fef2f2; border: 3px solid #dc2626; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
              <h3 style="margin: 0 0 10px 0; color: #dc2626; font-size: 20px;">⚡ IMMEDIATE EVACUATION REQUIRED ⚡</h3>
              <p style="margin: 0; color: #991b1b; font-size: 16px; font-weight: 600;">This is not a drill. Follow emergency protocols immediately.</p>
            </div>
            
            <!-- Risk Details -->
            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 18px; border-bottom: 2px solid #dc2626; padding-bottom: 8px;">📊 Risk Assessment</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #dc2626;">
                  <strong style="color: #374151;">Risk Score:</strong>
                  <div style="font-size: 24px; font-weight: bold; color: #dc2626; margin-top: 5px;">{riskScore}/10</div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
                  <strong style="color: #374151;">Probability:</strong>
                  <div style="font-size: 18px; font-weight: bold; color: #f59e0b; margin-top: 5px;">{riskProbability}%</div>
                </div>
              </div>
              <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 4px solid #10b981;">
                <strong style="color: #374151;">Alert Time:</strong>
                <div style="font-size: 16px; color: #374151; margin-top: 5px;">{timestamp}</div>
              </div>
            </div>
            
            <!-- Recommended Actions -->
            <div style="background: #fefce8; border-left: 5px solid #f59e0b; padding: 20px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px 0; color: #92400e;">🔧 IMMEDIATE ACTIONS REQUIRED:</h3>
              <div style="color: #451a03; line-height: 1.6;">
                {recommendedActions}
              </div>
            </div>
            
            <!-- Emergency Contacts -->
            <div style="background: #eff6ff; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px 0; color: #1e40af;">📞 Emergency Contacts</h3>
              <div style="color: #1e3a8a;">
                <p style="margin: 5px 0;"><strong>Emergency Services:</strong> 911</p>
                <p style="margin: 5px 0;"><strong>Mine Safety:</strong> {emergencyContact}</p>
                <p style="margin: 5px 0;"><strong>Site Supervisor:</strong> {supervisorContact}</p>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #374151; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px;">Rockfall Detection & Alert System</p>
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
              Alert ID: {alertId} | Generated: {timestamp}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getHighRiskEmailTemplate() {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>High Risk Alert</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 25px 20px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 10px;">⚠️</div>
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">HIGH RISK ALERT</h1>
            <h2 style="margin: 10px 0 0 0; font-size: 20px; color: #fef3c7;">Zone: {zoneName}</h2>
          </div>
          
          <!-- Content -->
          <div style="padding: 25px 20px;">
            <!-- Warning Notice -->
            <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
              <h3 style="margin: 0; color: #92400e;">⚡ ELEVATED RISK DETECTED ⚡</h3>
              <p style="margin: 5px 0 0 0; color: #78350f;">Restrict access to essential personnel only</p>
            </div>
            
            <!-- Risk Details -->
            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #374151; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">📊 Risk Details</h3>
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
                <p style="margin: 5px 0;"><strong>Risk Score:</strong> <span style="color: #f59e0b; font-size: 18px; font-weight: bold;">{riskScore}/10</span></p>
                <p style="margin: 5px 0;"><strong>Probability:</strong> {riskProbability}%</p>
                <p style="margin: 5px 0;"><strong>Alert Time:</strong> {timestamp}</p>
              </div>
            </div>
            
            <!-- Recommended Actions -->
            <div style="background: #fefce8; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #92400e;">🔧 Recommended Actions:</h3>
              <div style="color: #451a03; line-height: 1.6;">
                {recommendedActions}
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #374151; color: white; padding: 15px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
              Rockfall Detection System | Alert ID: {alertId}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getMediumRiskEmailTemplate() {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Monitoring Alert</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 25px 20px; text-align: center;">
            <div style="font-size: 36px; margin-bottom: 10px;">📊</div>
            <h1 style="margin: 0; font-size: 22px; font-weight: bold;">MONITORING ALERT</h1>
            <h2 style="margin: 10px 0 0 0; font-size: 18px; color: #dbeafe;">Zone: {zoneName}</h2>
          </div>
          
          <!-- Content -->
          <div style="padding: 25px 20px;">
            <!-- Info Notice -->
            <div style="background: #dbeafe; border: 2px solid #3b82f6; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
              <h3 style="margin: 0; color: #1e40af;">📈 Increased Monitoring Recommended</h3>
              <p style="margin: 5px 0 0 0; color: #1e3a8a;">Enhanced surveillance protocols should be implemented</p>
            </div>
            
            <!-- Risk Details -->
            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #374151; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">📊 Assessment Details</h3>
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
                <p style="margin: 5px 0;"><strong>Risk Score:</strong> <span style="color: #3b82f6; font-size: 18px; font-weight: bold;">{riskScore}/10</span></p>
                <p style="margin: 5px 0;"><strong>Probability:</strong> {riskProbability}%</p>
                <p style="margin: 5px 0;"><strong>Alert Time:</strong> {timestamp}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #059669;">Monitoring</span></p>
              </div>
            </div>
            
            <!-- Recommended Actions -->
            <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #1e40af;">🔍 Monitoring Actions:</h3>
              <div style="color: #1e3a8a; line-height: 1.6;">
                {recommendedActions}
              </div>
            </div>
            
            <!-- Additional Info -->
            <div style="background: #f9fafb; border-radius: 6px; padding: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #374151;">💡 Next Steps:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                <li>Continue regular monitoring protocols</li>
                <li>Report any unusual activity immediately</li>
                <li>Review safety procedures with team</li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #374151; color: white; padding: 15px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
              Rockfall Detection System | Alert ID: {alertId}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getLowRiskEmailTemplate() {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Advisory Notice</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #059669, #047857); color: white; padding: 25px 20px; text-align: center;">
            <div style="font-size: 36px; margin-bottom: 10px;">📋</div>
            <h1 style="margin: 0; font-size: 22px; font-weight: bold;">ADVISORY NOTICE</h1>
            <h2 style="margin: 10px 0 0 0; font-size: 18px; color: #d1fae5;">Zone: {zoneName}</h2>
          </div>
          
          <!-- Content -->
          <div style="padding: 25px 20px;">
            <!-- Info Notice -->
            <div style="background: #d1fae5; border: 2px solid #059669; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
              <h3 style="margin: 0; color: #047857;">📈 Low-Level Activity Detected</h3>
              <p style="margin: 5px 0 0 0; color: #065f46;">Continue normal operations with increased awareness</p>
            </div>
            
            <!-- Risk Details -->
            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #374151; border-bottom: 2px solid #059669; padding-bottom: 8px;">📊 Activity Summary</h3>
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #059669;">
                <p style="margin: 5px 0;"><strong>Risk Score:</strong> <span style="color: #059669; font-size: 18px; font-weight: bold;">{riskScore}/10</span></p>
                <p style="margin: 5px 0;"><strong>Probability:</strong> {riskProbability}%</p>
                <p style="margin: 5px 0;"><strong>Alert Time:</strong> {timestamp}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #059669;">Normal Operations</span></p>
              </div>
            </div>
            
            <!-- Recommended Actions -->
            <div style="background: #ecfdf5; border-left: 4px solid #059669; padding: 20px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #047857;">✅ Advisory Actions:</h3>
              <div style="color: #065f46; line-height: 1.6;">
                {recommendedActions}
              </div>
            </div>
            
            <!-- Additional Info -->
            <div style="background: #f9fafb; border-radius: 6px; padding: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #374151;">💡 Routine Procedures:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                <li>Maintain standard monitoring protocols</li>
                <li>Continue normal mining operations</li>
                <li>Stay alert for any changes in conditions</li>
                <li>Report unusual observations</li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #374151; color: white; padding: 15px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
              Rockfall Detection System | Alert ID: {alertId}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = { RealTimeNotificationService };