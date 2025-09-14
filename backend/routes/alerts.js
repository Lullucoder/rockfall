const express = require('express');
const Joi = require('joi');
const localDB = require('../storage/localDB');
const alertDeliveryService = require('../services/AlertDeliveryService');

const router = express.Router();

// Validation schemas
const testAlertSchema = Joi.object({
  alertType: Joi.string().default('test'),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  zoneName: Joi.string().default('Test Zone'),
  message: Joi.string().default('This is a test alert from the system'),
  deviceIds: Joi.array().items(Joi.string()).default([])
});

const emergencySimSchema = Joi.object({
  zoneName: Joi.string().default('Simulation Zone'),
  scenario: Joi.string().default('rockfall')
});

// GET /api/alerts - Get alert history
router.get('/', async (req, res) => {
  try {
    const { limit = 50, severity, status } = req.query;
    const alerts = localDB.getAlerts();
    
    // Sort by creation date (newest first) and apply limit
    let filteredAlerts = alerts
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, parseInt(limit));
    
    // Filter by severity and status if provided
    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }
    if (status) {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
    }

    res.json({
      success: true,
      alerts: filteredAlerts.map(alert => ({
        id: alert.id,
        zoneId: alert.zone_id,
        zoneName: alert.zone_name,
        severity: alert.severity,
        status: alert.status,
        message: alert.message,
        riskScore: alert.risk_score,
        riskProbability: alert.risk_probability,
        predictedTimeline: alert.predicted_timeline,
        recommendedActions: typeof alert.recommended_actions === 'string'
          ? JSON.parse(alert.recommended_actions)
          : alert.recommended_actions,
        affectedPersonnel: alert.affected_personnel,
        equipmentAtRisk: typeof alert.equipment_at_risk === 'string'
          ? JSON.parse(alert.equipment_at_risk)
          : alert.equipment_at_risk,
        alertType: alert.alert_type,
        createdAt: alert.created_at,
        updatedAt: alert.updated_at,
        resolvedAt: alert.resolved_at
      })),
      total: filteredAlerts.length
    });

  } catch (error) {
    console.error('❌ Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts',
      message: error.message
    });
  }
});

// POST /api/alerts/test - Send test alert
router.post('/test', async (req, res) => {
  try {
    const { error, value } = testAlertSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    console.log('🧪 Manual test alert requested:', value);

    // Create alert record
    const alert = await localDB.saveAlert({
      alert_type: value.alertType,
      severity: value.severity,
      zone_name: value.zoneName,
      message: value.message,
      status: 'active',
      risk_score: 75, // Default for test alerts
      risk_probability: 'medium'
    });

    // Send test alert to all registered contacts using the custom message
    const deliveryResults = await alertDeliveryService.sendTestAlert();

    console.log(`✅ Test alert sent to ${deliveryResults ? 'contacts' : 'no contacts'}`);

    res.json({
      success: true,
      alert: alert,
      deliveryResults: deliveryResults,
      message: 'Test alert sent successfully'
    });

  } catch (error) {
    console.error('❌ Test alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Test alert failed',
      message: error.message
    });
  }
});

// POST /api/alerts/simulate-emergency - Simulate emergency alert
router.post('/simulate-emergency', async (req, res) => {
  try {
    const { error, value } = emergencySimSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    console.log('🚨 Emergency simulation requested:', value);

    // Create emergency alert record
    const alert = await localDB.saveAlert({
      alert_type: 'emergency_simulation',
      severity: 'critical',
      zone_name: value.zoneName,
      message: `EMERGENCY SIMULATION: ${value.scenario} detected in ${value.zoneName}. This is a drill.`,
      status: 'active',
      risk_score: 95,
      risk_probability: 'high'
    });

    // Send emergency alert to all contacts
    const deliveryResults = await alertDeliveryService.sendAlertToAllContacts(
      `🚨 EMERGENCY SIMULATION: ${value.scenario} detected in ${value.zoneName}. This is a drill.`,
      'critical'
    );

    console.log(`✅ Emergency simulation sent to ${deliveryResults.length} contacts`);

    res.json({
      success: true,
      alert: alert,
      deliveryResults: deliveryResults,
      message: 'Emergency simulation executed successfully'
    });

  } catch (error) {
    console.error('❌ Emergency simulation error:', error);
    res.status(500).json({
      success: false,
      error: 'Emergency simulation failed',
      message: error.message
    });
  }
});

// GET /api/alerts/:alertId/delivery-status - Get delivery status for an alert
router.get('/:alertId/delivery-status', async (req, res) => {
  try {
    const { alertId } = req.params;
    
    // For now, return a simplified status since we're using direct delivery
    const alert = localDB.getAlerts().find(alert => alert.id === alertId);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    // Since we're sending alerts directly, we'll create a mock delivery status
    const contacts = localDB.getAllContacts();
    const mockDeliveryStatuses = contacts.map(contact => ({
      id: `${alertId}-${contact.id}`,
      alertId: alertId,
      deviceId: contact.id,
      channel: contact.phone ? 'sms' : 'email',
      status: 'sent', // Assume sent for now
      deliveryAttempts: 1,
      errorMessage: null,
      sentAt: alert.created_at,
      deliveredAt: alert.created_at,
      readAt: null,
      createdAt: alert.created_at
    }));

    res.json({
      success: true,
      alertId,
      deliveryStatuses: mockDeliveryStatuses,
      total: mockDeliveryStatuses.length
    });

  } catch (error) {
    console.error('❌ Error fetching delivery status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch delivery status',
      message: error.message
    });
  }
});

// GET /api/alerts/delivery-status/all - Get all delivery statuses
router.get('/delivery-status/all', async (req, res) => {
  try {
    // Get all alerts and create mock delivery statuses
    const alerts = localDB.getAlerts();
    const contacts = localDB.getAllContacts();
    
    const allDeliveryStatuses = [];
    
    alerts.forEach(alert => {
      contacts.forEach(contact => {
        allDeliveryStatuses.push({
          id: `${alert.id}-${contact.id}`,
          alert_id: alert.id,
          device_id: contact.id,
          channel: contact.phone ? 'sms' : 'email',
          status: 'sent',
          delivery_attempts: 1,
          error_message: null,
          sent_at: alert.created_at,
          delivered_at: alert.created_at,
          read_at: null,
          created_at: alert.created_at
        });
      });
    });

    res.json({
      success: true,
      data: allDeliveryStatuses,
      total: allDeliveryStatuses.length
    });

  } catch (error) {
    console.error('❌ Failed to get all delivery statuses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get delivery statuses',
      message: error.message
    });
  }
});

// POST /api/alerts/risk-check - Check risk score and send alerts if high
router.post('/risk-check', async (req, res) => {
  try {
    const { riskScore, zoneName = 'Unknown Zone', details = {} } = req.body;
    
    if (riskScore === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Risk score is required'
      });
    }

    console.log(`📊 Risk score check: ${riskScore} for ${zoneName}`);

    const result = await alertDeliveryService.checkRiskScoreAndAlert(
      riskScore,
      zoneName,
      details
    );

    res.json({
      success: true,
      riskScore: riskScore,
      alertSent: result.alertSent,
      alert: result.alert,
      deliveryResults: result.deliveryResults,
      message: result.alertSent 
        ? `Risk alert sent for score ${riskScore}` 
        : `Risk score ${riskScore} below alert threshold`
    });

  } catch (error) {
    console.error('❌ Risk check error:', error);
    res.status(500).json({
      success: false,
      error: 'Risk check failed',
      message: error.message
    });
  }
});

module.exports = router;