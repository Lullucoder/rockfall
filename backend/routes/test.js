const express = require('express');
const Joi = require('joi');
const { RealTimeNotificationService } = require('../services/NotificationService');
const { testConnection } = require('../database/supabase');

const router = express.Router();

// Test Supabase connection
router.get('/supabase', async (req, res) => {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      res.json({
        success: true,
        message: '✅ Supabase connection successful!',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: '❌ Supabase connection failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Supabase connection test failed',
      error: error.message
    });
  }
});

// Initialize notification service
const notificationService = new RealTimeNotificationService();

// Test SMS notification
router.post('/sms', async (req, res) => {
  try {
    const schema = Joi.object({
      phoneNumber: Joi.string().required(),
      message: Joi.string().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    // Create a mock device for testing
    const mockDevice = {
      id: 'test-device',
      miner_name: 'Test User',
      phone_number: value.phoneNumber,
      preferences: { enableSMS: true }
    };

    // Create a mock alert for testing
    const mockAlert = {
      id: 'test-alert',
      severity: 'medium',
      zoneName: 'Test Zone',
      message: value.message,
      riskScore: 6.5
    };

    // Initialize service if not already done
    if (!notificationService.isInitialized) {
      await notificationService.initialize();
    }

    const result = await notificationService.sendSMS(mockDevice, mockAlert);

    res.json({
      success: true,
      message: 'SMS test completed',
      result: result
    });

  } catch (error) {
    console.error('❌ SMS test failed:', error);
    res.status(500).json({
      success: false,
      error: 'SMS test failed',
      message: error.message
    });
  }
});

// Test email notification
router.post('/email', async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      subject: Joi.string().required(),
      message: Joi.string().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    // Create a mock device for testing
    const mockDevice = {
      id: 'test-device',
      miner_name: 'Test User',
      email: value.email,
      preferences: { enableEmail: true }
    };

    // Create a mock alert for testing
    const mockAlert = {
      id: 'test-alert',
      severity: 'high',
      zoneName: 'Test Zone',
      message: value.message,
      riskScore: 7.5
    };

    // Initialize service if not already done
    if (!notificationService.isInitialized) {
      await notificationService.initialize();
    }

    const result = await notificationService.sendEmail(mockDevice, mockAlert);

    res.json({
      success: true,
      message: 'Email test completed',
      result: result
    });

  } catch (error) {
    console.error('❌ Email test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Email test failed',
      message: error.message
    });
  }
});

// Test push notification
router.post('/push', async (req, res) => {
  try {
    const schema = Joi.object({
      deviceId: Joi.string().required(),
      title: Joi.string().required(),
      body: Joi.string().required(),
      fcmToken: Joi.string().optional(),
      pushSubscription: Joi.object().optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    // Create a mock device for testing
    const mockDevice = {
      id: value.deviceId,
      miner_name: 'Test User',
      fcm_token: value.fcmToken,
      push_subscription: value.pushSubscription ? JSON.stringify(value.pushSubscription) : null,
      preferences: { enablePushNotifications: true }
    };

    // Create a mock alert for testing
    const mockAlert = {
      id: 'test-alert',
      severity: 'critical',
      zoneName: 'Test Zone',
      message: value.body,
      riskScore: 9.0
    };

    // Initialize service if not already done
    if (!notificationService.isInitialized) {
      await notificationService.initialize();
    }

    const result = await notificationService.sendPushNotification(mockDevice, mockAlert);

    res.json({
      success: true,
      message: 'Push notification test completed',
      result: result
    });

  } catch (error) {
    console.error('❌ Push notification test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Push notification test failed',
      message: error.message
    });
  }
});

// Test all notification channels
router.post('/all', async (req, res) => {
  try {
    const schema = Joi.object({
      phoneNumber: Joi.string().required(),
      email: Joi.string().email().required(),
      deviceId: Joi.string().required(),
      fcmToken: Joi.string().optional(),
      pushSubscription: Joi.object().optional(),
      message: Joi.string().default('Test notification from Rockfall Alert System')
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    // Create a mock device for testing
    const mockDevice = {
      id: value.deviceId,
      miner_name: 'Test User',
      phone_number: value.phoneNumber,
      email: value.email,
      fcm_token: value.fcmToken,
      push_subscription: value.pushSubscription ? JSON.stringify(value.pushSubscription) : null,
      preferences: { 
        enableSMS: true,
        enableEmail: true,
        enablePushNotifications: true
      }
    };

    // Create a mock alert for testing
    const mockAlert = {
      id: 'test-alert-all',
      severity: 'high',
      zoneName: 'Test Zone',
      message: value.message,
      riskScore: 8.0
    };

    // Initialize service if not already done
    if (!notificationService.isInitialized) {
      await notificationService.initialize();
    }

    // Send all notification types
    const results = [];

    try {
      const smsResult = await notificationService.sendSMS(mockDevice, mockAlert);
      results.push({ type: 'SMS', result: smsResult });
    } catch (smsError) {
      results.push({ type: 'SMS', error: smsError.message });
    }

    try {
      const emailResult = await notificationService.sendEmail(mockDevice, mockAlert);
      results.push({ type: 'Email', result: emailResult });
    } catch (emailError) {
      results.push({ type: 'Email', error: emailError.message });
    }

    try {
      const pushResult = await notificationService.sendPushNotification(mockDevice, mockAlert);
      results.push({ type: 'Push', result: pushResult });
    } catch (pushError) {
      results.push({ type: 'Push', error: pushError.message });
    }

    res.json({
      success: true,
      message: 'All notification tests completed',
      results: results
    });

  } catch (error) {
    console.error('❌ All notifications test failed:', error);
    res.status(500).json({
      success: false,
      error: 'All notifications test failed',
      message: error.message
    });
  }
});

// Get notification service status
router.get('/status', async (req, res) => {
  try {
    // Initialize service if not already done
    if (!notificationService.isInitialized) {
      await notificationService.initialize();
    }

    const status = {
      isInitialized: notificationService.isInitialized,
      services: {
        twilio: {
          configured: !!process.env.TWILIO_ACCOUNT_SID && !!process.env.TWILIO_AUTH_TOKEN,
          client: !!notificationService.twilioClient
        },
        sendgrid: {
          configured: !!process.env.SENDGRID_API_KEY
        },
        firebase: {
          configured: !!process.env.FIREBASE_PROJECT_ID && !!process.env.FIREBASE_PRIVATE_KEY,
          app: !!notificationService.firebaseApp
        },
        webpush: {
          configured: !!process.env.VAPID_PUBLIC_KEY && !!process.env.VAPID_PRIVATE_KEY
        }
      }
    };

    res.json({
      success: true,
      status: status
    });

  } catch (error) {
    console.error('❌ Status check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Status check failed',
      message: error.message
    });
  }
});

// Test comprehensive alert system - sends alerts to all registered users
router.post('/alert-system', async (req, res) => {
  try {
    const { getAllUsers } = require('../database/supabase');
    
    const schema = Joi.object({
      alertType: Joi.string().valid('test', 'rockfall', 'equipment', 'weather', 'emergency').default('test'),
      severity: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
      zoneName: Joi.string().default('Test Zone'),
      customMessage: Joi.string().optional(),
      sendSMS: Joi.boolean().default(true),
      sendEmail: Joi.boolean().default(true),
      sendPush: Joi.boolean().default(false) // Requires proper Firebase setup
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    // Get all active users
    const users = await getAllUsers();
    const activeUsers = users.filter(user => user.status === 'active');

    if (activeUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active users found. Please register users first.'
      });
    }

    // Create alert message based on type and severity
    const alertMessages = {
      test: {
        low: 'This is a test alert from the Rockfall Detection System. All systems are operational.',
        medium: '⚠️ Test Alert: This is a medium priority test of the emergency notification system.',
        high: '🚨 High Priority Test: Testing emergency alert system. This is NOT a real emergency.',
        critical: '🆘 CRITICAL TEST ALERT: Maximum priority test. This is a DRILL - NOT A REAL EMERGENCY.'
      },
      rockfall: {
        low: 'Low-risk rockfall activity detected in your area. Monitor conditions.',
        medium: '⚠️ ROCKFALL ALERT: Moderate risk detected. Exercise caution in mining operations.',
        high: '🚨 HIGH ROCKFALL RISK: Significant activity detected. Consider evacuation procedures.',
        critical: '🆘 CRITICAL ROCKFALL WARNING: Immediate evacuation required. Seek shelter immediately!'
      },
      equipment: {
        low: 'Equipment maintenance reminder in your zone.',
        medium: '⚠️ Equipment malfunction detected. Check safety systems.',
        high: '🚨 Critical equipment failure. Stop operations immediately.',
        critical: '🆘 EQUIPMENT EMERGENCY: Immediate shutdown required for safety.'
      },
      weather: {
        low: 'Weather advisory: Monitor conditions.',
        medium: '⚠️ Weather warning: Conditions may affect operations.',
        high: '🚨 Severe weather alert: Suspend outdoor activities.',
        critical: '🆘 EXTREME WEATHER: Take immediate shelter!'
      },
      emergency: {
        low: 'Emergency services notification.',
        medium: '⚠️ Emergency alert: Follow safety protocols.',
        high: '🚨 Emergency situation: Evacuate area immediately.',
        critical: '🆘 LIFE-THREATENING EMERGENCY: EVACUATE NOW!'
      }
    };

    const alertMessage = value.customMessage || 
                        alertMessages[value.alertType][value.severity];

    // Create mock alert object
    const mockAlert = {
      id: `test-alert-${Date.now()}`,
      alertType: value.alertType,
      severity: value.severity,
      zoneName: value.zoneName,
      message: alertMessage,
      riskScore: {
        low: 3.0,
        medium: 6.5,
        high: 8.5,
        critical: 9.8
      }[value.severity],
      timestamp: new Date().toISOString(),
      isTest: true
    };

    // Initialize notification service
    if (!notificationService.isInitialized) {
      await notificationService.initialize();
    }

    const results = {
      totalUsers: activeUsers.length,
      smsResults: [],
      emailResults: [],
      pushResults: [],
      summary: {
        smsSuccess: 0,
        smsFailures: 0,
        emailSuccess: 0,
        emailFailures: 0,
        pushSuccess: 0,
        pushFailures: 0
      }
    };

    console.log(`🧪 Testing alert system with ${activeUsers.length} users...`);

    // Send notifications to each user
    for (const user of activeUsers) {
      const userPrefs = user.notification_preferences || {};
      
      // Send SMS if enabled
      if (value.sendSMS && userPrefs.sms !== false && user.phone) {
        try {
          const mockDevice = {
            id: user.id,
            miner_name: user.name,
            phone_number: user.phone,
            preferences: { enableSMS: true }
          };
          
          const smsResult = await notificationService.sendSMS(mockDevice, mockAlert);
          results.smsResults.push({
            userId: user.id,
            name: user.name,
            phone: user.phone,
            success: true,
            result: smsResult
          });
          results.summary.smsSuccess++;
        } catch (error) {
          results.smsResults.push({
            userId: user.id,
            name: user.name,
            phone: user.phone,
            success: false,
            error: error.message
          });
          results.summary.smsFailures++;
        }
      }

      // Send Email if enabled
      if (value.sendEmail && userPrefs.email !== false && user.email) {
        try {
          const mockDevice = {
            id: user.id,
            miner_name: user.name,
            email: user.email,
            preferences: { enableEmail: true }
          };
          
          const emailResult = await notificationService.sendEmail(mockDevice, mockAlert);
          results.emailResults.push({
            userId: user.id,
            name: user.name,
            email: user.email,
            success: true,
            result: emailResult
          });
          results.summary.emailSuccess++;
        } catch (error) {
          results.emailResults.push({
            userId: user.id,
            name: user.name,
            email: user.email,
            success: false,
            error: error.message
          });
          results.summary.emailFailures++;
        }
      }

      // Send Push notification if enabled and properly configured
      if (value.sendPush && userPrefs.push !== false) {
        try {
          const pushResult = await notificationService.sendPushNotification(
            user.id, 
            `${value.severity.toUpperCase()} Alert`, 
            alertMessage
          );
          results.pushResults.push({
            userId: user.id,
            name: user.name,
            success: true,
            result: pushResult
          });
          results.summary.pushSuccess++;
        } catch (error) {
          results.pushResults.push({
            userId: user.id,
            name: user.name,
            success: false,
            error: error.message
          });
          results.summary.pushFailures++;
        }
      }
    }

    console.log(`✅ Alert system test completed: ${results.summary.smsSuccess + results.summary.emailSuccess + results.summary.pushSuccess} successful, ${results.summary.smsFailures + results.summary.emailFailures + results.summary.pushFailures} failed`);

    res.json({
      success: true,
      message: 'Alert system test completed',
      alert: mockAlert,
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Alert system test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Alert system test failed',
      message: error.message
    });
  }
});

module.exports = router;