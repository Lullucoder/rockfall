const express = require('express');
const Joi = require('joi');
const { AlertProcessor } = require('../services/AlertProcessor');
const { getAlerts, getDeliveryStatus } = require('../database/db');

const router = express.Router();
const alertProcessor = new AlertProcessor();

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
    const alerts = await getAlerts(parseInt(limit));
    
    // Filter by severity and status if provided
    let filteredAlerts = alerts;
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

    const result = await alertProcessor.triggerTestAlert(value);

    res.json({
      success: true,
      alert: result.alert,
      deliveryResults: result.deliveryResults,
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

    const result = await alertProcessor.triggerEmergencySimulation(value);

    res.json({
      success: true,
      alert: result.alert,
      deliveryResults: result.deliveryResults,
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
    const deliveryStatuses = await getDeliveryStatus(alertId);

    res.json({
      success: true,
      alertId,
      deliveryStatuses: deliveryStatuses.map(status => ({
        id: status.id,
        alertId: status.alert_id,
        deviceId: status.device_id,
        channel: status.channel,
        status: status.status,
        deliveryAttempts: status.delivery_attempts,
        errorMessage: status.error_message,
        sentAt: status.sent_at,
        deliveredAt: status.delivered_at,
        readAt: status.read_at,
        createdAt: status.created_at
      })),
      total: deliveryStatuses.length
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

module.exports = router;