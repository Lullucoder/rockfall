const express = require('express');
const Joi = require('joi');
const { AlertProcessor } = require('../services/AlertProcessor');
const { createRiskAssessment } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const alertProcessor = new AlertProcessor();

// Validation schema for risk monitoring
const riskDataSchema = Joi.object({
  zoneData: Joi.object().pattern(
    Joi.string(), // zone ID
    Joi.object({
      displacement: Joi.number().optional(),
      vibration: Joi.number().optional(),
      tilt: Joi.number().optional(),
      temperature: Joi.number().optional(),
      humidity: Joi.number().optional(),
      pressure: Joi.number().optional(),
      rainfall: Joi.number().optional(),
      windSpeed: Joi.number().optional()
    })
  ).required(),
  riskScores: Joi.object().pattern(
    Joi.string(), // zone ID
    Joi.number().min(0).max(10)
  ).required(),
  predictions: Joi.object().optional(),
  timestamp: Joi.string().isoDate().optional()
});

// POST /api/simulation/monitor-risk - Monitor risk assessment (automatic alerts)
router.post('/monitor-risk', async (req, res) => {
  try {
    const { error, value } = riskDataSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    const { zoneData, riskScores, predictions } = value;
    const maxRiskScore = Math.max(...Object.values(riskScores));

    console.log('🔍 Monitoring risk assessment:', {
      zones: Object.keys(zoneData),
      maxRisk: maxRiskScore,
      timestamp: new Date().toISOString()
    });

    // Process risk data and trigger alerts if necessary
    const alertResults = await alertProcessor.processRiskData(zoneData, riskScores);

    // Save risk assessment to database
    await createRiskAssessment({
      id: uuidv4(),
      zoneData,
      riskScores,
      maxRiskScore,
      alertsTriggered: alertResults.length,
      type: 'automatic'
    });

    res.json({
      success: true,
      processed: alertResults.length,
      alerts: alertResults.map(result => ({
        id: result.id,
        zoneId: result.zoneId,
        zoneName: result.zoneName,
        severity: result.severity,
        riskScore: result.riskScore,
        message: result.message,
        deliveryCount: result.deliveryResults?.length || 0
      })),
      maxRiskScore,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Risk monitoring error:', error);
    res.status(500).json({
      success: false,
      error: 'Risk monitoring failed',
      message: error.message
    });
  }
});

// POST /api/simulation/start - Start simulation monitoring
router.post('/start', async (req, res) => {
  try {
    const { zones = [], frequency = 30000 } = req.body; // Default 30 second frequency

    console.log('🚀 Simulation monitoring started for zones:', zones);

    res.json({
      success: true,
      message: 'Simulation monitoring started',
      zones,
      frequency,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error starting simulation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start simulation',
      message: error.message
    });
  }
});

// POST /api/simulation/stop - Stop simulation monitoring
router.post('/stop', async (req, res) => {
  try {
    console.log('🛑 Simulation monitoring stopped');

    res.json({
      success: true,
      message: 'Simulation monitoring stopped',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error stopping simulation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop simulation',
      message: error.message
    });
  }
});

// GET /api/simulation/status - Get simulation status
router.get('/status', async (req, res) => {
  try {
    // In a real implementation, you'd track simulation state
    res.json({
      success: true,
      status: 'running', // or 'stopped'
      activeZones: ['zone-1', 'zone-2', 'zone-3', 'zone-4', 'zone-5', 'zone-6'],
      frequency: 30000,
      uptime: process.uptime(),
      lastUpdate: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting simulation status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get simulation status',
      message: error.message
    });
  }
});

module.exports = router;