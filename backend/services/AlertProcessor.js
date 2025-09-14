const { v4: uuidv4 } = require('uuid');
const { createAlert, updateAlert, log } = require('../database/db');
const { createAlert: createSupabaseAlert, getUsersByZone, getAllUsers } = require('../database/supabase');
const { RealTimeNotificationService } = require('./NotificationService');

class AlertProcessor {
  constructor() {
    this.notificationService = new RealTimeNotificationService();
    this.isInitialized = false;
    this.processedAlerts = new Map(); // Cache to prevent duplicate processing
    
    // Risk thresholds from environment or defaults
    this.thresholds = {
      medium: parseFloat(process.env.DEFAULT_RISK_THRESHOLD) || 6.0,
      high: parseFloat(process.env.CRITICAL_RISK_THRESHOLD) || 7.5,
      critical: parseFloat(process.env.EMERGENCY_RISK_THRESHOLD) || 8.5
    };
  }

  async initialize() {
    try {
      console.log('🔧 Initializing Alert Processor...');
      
      // Initialize notification service
      await this.notificationService.initialize();
      
      this.isInitialized = true;
      console.log('✅ Alert Processor initialized');
      
      await log('info', 'alert', 'Alert processor initialized', {
        thresholds: this.thresholds
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize Alert Processor:', error);
      throw error;
    }
  }

  async processRiskAssessment(zoneData, riskScores) {
    try {
      console.log('📊 Processing risk assessment...');
      
      if (!this.isInitialized) {
        await this.initialize();
      }

      const alerts = [];
      const maxRiskScore = Math.max(...Object.values(riskScores));
      
      // Process each zone's risk
      for (const [zoneId, riskScore] of Object.entries(riskScores)) {
        const zone = zoneData.find(z => z.id === zoneId);
        if (!zone) continue;

        const severity = this.calculateSeverity(riskScore);
        
        // Only create alerts for significant risks
        if (severity === 'low') continue;

        const alert = await this.createAlert({
          zoneId: zoneId,
          zoneName: zone.name || `Zone ${zoneId}`,
          severity: severity,
          riskScore: riskScore,
          riskProbability: this.calculateProbability(riskScore),
          message: this.generateAlertMessage(zone, riskScore, severity),
          predictedTimeline: this.estimateTimeline(riskScore),
          recommendedActions: this.getRecommendedActions(severity, riskScore),
          affectedPersonnel: zone.personnelCount || 0,
          equipmentAtRisk: zone.equipment || [],
          alertType: 'automatic'
        });

        alerts.push(alert);

        // Send notifications immediately for high priority alerts
        if (severity === 'critical' || severity === 'high') {
          await this.sendAlertNotifications(alert);
        }
      }

      // Log the risk assessment
      await log('info', 'alert', 'Risk assessment processed', {
        maxRiskScore,
        alertsGenerated: alerts.length,
        severities: alerts.map(a => a.severity)
      });

      return {
        maxRiskScore,
        alertsTriggered: alerts.length,
        alerts: alerts
      };

    } catch (error) {
      console.error('❌ Error processing risk assessment:', error);
      await log('error', 'alert', 'Risk assessment processing failed', {
        error: error.message
      });
      throw error;
    }
  }

  async createAlert(alertData) {
    try {
      const alertId = uuidv4();
      const alert = {
        id: alertId,
        zoneId: alertData.zoneId,
        zoneName: alertData.zoneName,
        severity: alertData.severity,
        status: 'active',
        message: alertData.message,
        riskScore: alertData.riskScore,
        riskProbability: alertData.riskProbability,
        predictedTimeline: alertData.predictedTimeline,
        recommendedActions: JSON.stringify(alertData.recommendedActions),
        affectedPersonnel: alertData.affectedPersonnel,
        equipmentAtRisk: JSON.stringify(alertData.equipmentAtRisk),
        alertType: alertData.alertType || 'automatic',
        timestamp: new Date().toISOString()
      };

      // Check for duplicate alerts in the last 5 minutes
      const cacheKey = `${alertData.zoneId}-${alertData.severity}`;
      const lastAlert = this.processedAlerts.get(cacheKey);
      
      if (lastAlert && (Date.now() - lastAlert.timestamp) < 300000) { // 5 minutes
        console.log(`⏭️ Skipping duplicate alert for ${alertData.zoneName} (${alertData.severity})`);
        return lastAlert.alert;
      }

      // Store alert in database
      await createAlert(alert);
      
      // Cache the alert
      this.processedAlerts.set(cacheKey, {
        alert: alert,
        timestamp: Date.now()
      });

      console.log(`🚨 Alert created: ${alertId} (${alert.severity}) for ${alert.zoneName}`);

      await log('info', 'alert', 'Alert created', {
        alertId,
        severity: alert.severity,
        zoneId: alert.zoneId,
        riskScore: alert.riskScore
      });

      return alert;

    } catch (error) {
      console.error('❌ Error creating alert:', error);
      throw error;
    }
  }

  async sendAlertNotifications(alert, specificDeviceIds = []) {
    try {
      console.log(`📤 Sending notifications for alert ${alert.id}`);

      let deliveryResults = [];

      if (alert.severity === 'critical') {
        // Send emergency broadcast for critical alerts
        deliveryResults = await this.notificationService.sendEmergencyAlert(alert);
      } else {
        // Send targeted alerts based on zone and severity
        deliveryResults = await this.notificationService.sendAlert(alert, specificDeviceIds);
      }

      // Update alert with delivery information
      await updateAlert(alert.id, {
        notificationsSent: deliveryResults.length,
        lastNotificationAt: new Date().toISOString()
      });

      console.log(`✅ Sent ${deliveryResults.length} notifications for alert ${alert.id}`);

      return deliveryResults;

    } catch (error) {
      console.error(`❌ Failed to send notifications for alert ${alert.id}:`, error);
      await log('error', 'notification', 'Alert notification sending failed', {
        alertId: alert.id,
        error: error.message
      });
      throw error;
    }
  }

  calculateSeverity(riskScore) {
    if (riskScore >= this.thresholds.critical) return 'critical';
    if (riskScore >= this.thresholds.high) return 'high';
    if (riskScore >= this.thresholds.medium) return 'medium';
    return 'low';
  }

  calculateProbability(riskScore) {
    // Convert risk score (0-10) to probability (0-1)
    return Math.min(0.95, Math.max(0.05, riskScore / 10));
  }

  generateAlertMessage(zone, riskScore, severity) {
    const messages = {
      critical: `CRITICAL ROCKFALL RISK detected in ${zone.name}. Risk Score: ${riskScore.toFixed(1)}/10. IMMEDIATE EVACUATION REQUIRED.`,
      high: `High rockfall risk detected in ${zone.name}. Risk Score: ${riskScore.toFixed(1)}/10. Restrict access to essential personnel only.`,
      medium: `Elevated rockfall risk in ${zone.name}. Risk Score: ${riskScore.toFixed(1)}/10. Increase monitoring frequency.`
    };

    return messages[severity] || messages.medium;
  }

  estimateTimeline(riskScore) {
    if (riskScore >= 9.0) return 'Immediate (0-15 minutes)';
    if (riskScore >= 8.0) return 'Very Short (15-60 minutes)';
    if (riskScore >= 7.0) return 'Short Term (1-6 hours)';
    if (riskScore >= 6.0) return 'Medium Term (6-24 hours)';
    return 'Long Term (24+ hours)';
  }

  getRecommendedActions(severity, riskScore) {
    const actions = {
      critical: [
        'EVACUATE ALL PERSONNEL IMMEDIATELY',
        'Activate emergency response protocol',
        'Contact emergency services',
        'Establish safety perimeter (minimum 500m)',
        'Deploy emergency response team',
        'Notify mine management immediately'
      ],
      high: [
        'Restrict access to essential personnel only',
        'Increase monitoring frequency to every 5 minutes',
        'Deploy additional sensors if available',
        'Prepare evacuation routes',
        'Alert emergency response team',
        'Review and update safety protocols'
      ],
      medium: [
        'Increase monitoring frequency to every 15 minutes',
        'Review safety procedures with personnel',
        'Check equipment and escape routes',
        'Consider reducing personnel in area',
        'Monitor weather conditions',
        'Prepare contingency plans'
      ]
    };

    return actions[severity] || actions.medium;
  }

  async processManualAlert(alertData) {
    try {
      console.log('👤 Processing manual alert...');

      const alert = await this.createAlert({
        ...alertData,
        alertType: 'manual'
      });

      // Always send notifications for manual alerts
      await this.sendAlertNotifications(alert, alertData.targetDeviceIds);

      console.log(`✅ Manual alert processed: ${alert.id}`);

      return alert;

    } catch (error) {
      console.error('❌ Error processing manual alert:', error);
      throw error;
    }
  }

  async resolveAlert(alertId, resolutionData) {
    try {
      console.log(`✅ Resolving alert ${alertId}...`);

      await updateAlert(alertId, {
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
        resolutionNotes: resolutionData.notes,
        resolvedBy: resolutionData.resolvedBy
      });

      // Send resolution notification if needed
      if (resolutionData.notifyResolution) {
        const resolutionAlert = {
          id: alertId,
          severity: 'info',
          zoneName: resolutionData.zoneName,
          message: `Alert resolved: ${resolutionData.notes}`,
          alertType: 'resolution'
        };

        await this.notificationService.sendAlert(resolutionAlert, resolutionData.targetDeviceIds);
      }

      await log('info', 'alert', 'Alert resolved', {
        alertId,
        resolvedBy: resolutionData.resolvedBy
      });

      console.log(`✅ Alert ${alertId} resolved`);

    } catch (error) {
      console.error(`❌ Error resolving alert ${alertId}:`, error);
      throw error;
    }
  }

  // Clean up old processed alerts cache (run periodically)
  cleanupCache() {
    const now = Date.now();
    for (const [key, data] of this.processedAlerts.entries()) {
      if (now - data.timestamp > 3600000) { // 1 hour
        this.processedAlerts.delete(key);
      }
    }
  }

  // Enhanced method to send alerts to registered users based on zone
  async sendAlertToRegisteredUsers(alert) {
    try {
      console.log(`📤 Sending alert ${alert.id} to registered users...`);
      
      let users = [];
      
      // Get users for specific zone if zoneId provided
      if (alert.zoneId) {
        try {
          users = await getUsersByZone(alert.zoneId);
          console.log(`👥 Found ${users.length} users in zone ${alert.zoneName}`);
        } catch (error) {
          console.log(`⚠️ No users found for zone ${alert.zoneId}, sending to all users`);
          users = await getAllUsers();
        }
      } else {
        // Send to all users if no specific zone
        users = await getAllUsers();
      }
      
      // Filter only active users
      const activeUsers = users.filter(user => user.status === 'active');
      
      if (activeUsers.length === 0) {
        console.log('⚠️ No active users found for alert delivery');
        return {
          success: false,
          message: 'No active users found',
          usersNotified: 0
        };
      }

      const notificationResults = {
        totalUsers: activeUsers.length,
        successCount: 0,
        failureCount: 0,
        details: []
      };

      console.log(`📡 Sending notifications to ${activeUsers.length} active users...`);

      // Send notifications to each user based on their preferences
      for (const user of activeUsers) {
        const userPrefs = user.notification_preferences || {};
        const userResult = {
          userId: user.id,
          name: user.name,
          sms: { attempted: false, success: false },
          email: { attempted: false, success: false },
          push: { attempted: false, success: false }
        };

        // Send SMS if enabled and phone number available
        if (userPrefs.sms !== false && user.phone) {
          userResult.sms.attempted = true;
          try {
            const mockDevice = {
              id: user.id,
              miner_name: user.name,
              phone_number: user.phone,
              preferences: { enableSMS: true }
            };
            
            await this.notificationService.sendSMS(mockDevice, alert);
            userResult.sms.success = true;
            console.log(`✅ SMS sent to ${user.name} (${user.phone})`);
          } catch (error) {
            console.error(`❌ SMS failed for ${user.name}:`, error.message);
            userResult.sms.error = error.message;
          }
        }

        // Send Email if enabled and email available
        if (userPrefs.email !== false && user.email) {
          userResult.email.attempted = true;
          try {
            const mockDevice = {
              id: user.id,
              miner_name: user.name,
              email: user.email,
              preferences: { enableEmail: true }
            };
            
            await this.notificationService.sendEmail(mockDevice, alert);
            userResult.email.success = true;
            console.log(`✅ Email sent to ${user.name} (${user.email})`);
          } catch (error) {
            console.error(`❌ Email failed for ${user.name}:`, error.message);
            userResult.email.error = error.message;
          }
        }

        // Send Push notification if enabled
        if (userPrefs.push !== false) {
          userResult.push.attempted = true;
          try {
            await this.notificationService.sendPushNotification(
              user.id, 
              `${alert.severity.toUpperCase()} Alert - ${alert.zoneName}`, 
              alert.message
            );
            userResult.push.success = true;
            console.log(`✅ Push notification sent to ${user.name}`);
          } catch (error) {
            console.error(`❌ Push notification failed for ${user.name}:`, error.message);
            userResult.push.error = error.message;
          }
        }

        // Count overall success for this user
        const hasSuccess = userResult.sms.success || userResult.email.success || userResult.push.success;
        if (hasSuccess) {
          notificationResults.successCount++;
        } else {
          notificationResults.failureCount++;
        }

        notificationResults.details.push(userResult);
      }

      console.log(`📊 Alert delivery complete: ${notificationResults.successCount} successful, ${notificationResults.failureCount} failed`);

      // Store notification results with alert
      try {
        await createSupabaseAlert({
          ...alert,
          notification_results: notificationResults,
          users_notified: notificationResults.successCount
        });
      } catch (error) {
        console.error('⚠️ Failed to store alert in Supabase:', error.message);
      }

      return {
        success: notificationResults.successCount > 0,
        message: `Notifications sent to ${notificationResults.successCount} of ${notificationResults.totalUsers} users`,
        usersNotified: notificationResults.successCount,
        totalUsers: notificationResults.totalUsers,
        details: notificationResults
      };

    } catch (error) {
      console.error('❌ Error sending alert to registered users:', error);
      throw error;
    }
  }

  // Enhanced processRiskData method with automatic alert triggering
  async processRiskData(zoneData, riskScores) {
    try {
      console.log('🔍 Processing risk data for automatic alert triggering...');
      
      if (!this.isInitialized) {
        await this.initialize();
      }

      const alertResults = [];
      
      // Process each zone's risk score
      for (const [zoneId, riskScore] of Object.entries(riskScores)) {
        const zone = zoneData.find(z => z.id === zoneId) || { 
          id: zoneId, 
          name: `Zone ${zoneId}`, 
          location: 'Unknown' 
        };

        const severity = this.calculateSeverity(riskScore);
        
        // Only trigger alerts for medium and above risks
        if (severity === 'low') {
          console.log(`📋 Zone ${zone.name}: Risk ${riskScore} - below alert threshold`);
          continue;
        }

        // Create alert object
        const alert = {
          id: uuidv4(),
          zoneId: zoneId,
          zoneName: zone.name,
          severity: severity,
          riskScore: riskScore,
          riskProbability: this.calculateProbability(riskScore),
          message: this.generateAlertMessage(zone, riskScore, severity),
          predictedTimeline: this.estimateTimeline(riskScore),
          recommendedActions: this.getRecommendedActions(severity, riskScore),
          alertType: 'automatic',
          alertId: uuidv4(),
          timestamp: new Date().toISOString(),
          isTest: false
        };

        console.log(`⚠️ ${severity.toUpperCase()} alert triggered for ${zone.name} (Risk: ${riskScore})`);

        // Send notifications to registered users
        const notificationResult = await this.sendAlertToRegisteredUsers(alert);
        
        alertResults.push({
          ...alert,
          notificationResult
        });
      }

      console.log(`✅ Risk processing complete: ${alertResults.length} alerts triggered`);
      
      return alertResults;

    } catch (error) {
      console.error('❌ Error processing risk data:', error);
      throw error;
    }
  }

  async getAlertStatistics() {
    try {
      // This would typically query the database for alert statistics
      // For now, return basic info
      return {
        cacheSize: this.processedAlerts.size,
        thresholds: this.thresholds,
        isInitialized: this.isInitialized,
        notificationServiceReady: this.notificationService.isInitialized
      };
    } catch (error) {
      console.error('❌ Error getting alert statistics:', error);
      throw error;
    }
  }
}

module.exports = { AlertProcessor };
