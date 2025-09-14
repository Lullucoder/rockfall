const express = require('express');
const router = express.Router();
const { 
  createAlert, 
  getActiveAlerts, 
  resolveAlert,
  logAlertDelivery,
  updateDeliveryStatus
} = require('../database/supabase');

// Create a new alert
router.post('/', async (req, res) => {
  try {
    console.log('🚨 Alert creation request:', req.body);
    
    const alert = await createAlert(req.body);
    
    // TODO: Process the alert (this will trigger notifications)
    // const AlertProcessor = require('../services/AlertProcessor');
    // await AlertProcessor.processAlert(alert);
    
    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: alert
    });
  } catch (error) {
    console.error('❌ Alert creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create alert',
      error: error.message
    });
  }
});

// Get active alerts
router.get('/active', async (req, res) => {
  try {
    const { zoneId } = req.query;
    const alerts = await getActiveAlerts(zoneId);
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('❌ Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
});

// Get all alerts (active and resolved)
router.get('/', async (req, res) => {
  try {
    const { zoneId } = req.query;
    // For now, just get active alerts - can be extended to get all alerts
    const alerts = await getActiveAlerts(zoneId);
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('❌ Get all alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
});

// Resolve an alert
router.put('/:alertId/resolve', async (req, res) => {
  try {
    const { resolvedBy } = req.body;
    const alert = await resolveAlert(req.params.alertId, resolvedBy);
    
    res.json({
      success: true,
      message: 'Alert resolved successfully',
      data: alert
    });
  } catch (error) {
    console.error('❌ Alert resolution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve alert',
      error: error.message
    });
  }
});

// Log alert delivery
router.post('/delivery', async (req, res) => {
  try {
    const delivery = await logAlertDelivery(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Alert delivery logged successfully',
      data: delivery
    });
  } catch (error) {
    console.error('❌ Alert delivery logging error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log alert delivery',
      error: error.message
    });
  }
});

// Update delivery status
router.put('/delivery/:deliveryId', async (req, res) => {
  try {
    const { status, metadata } = req.body;
    const delivery = await updateDeliveryStatus(req.params.deliveryId, status, metadata);
    
    res.json({
      success: true,
      message: 'Delivery status updated successfully',
      data: delivery
    });
  } catch (error) {
    console.error('❌ Delivery status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery status',
      error: error.message
    });
  }
});

module.exports = router;