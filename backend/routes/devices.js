const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { createDevice, getDevices, updateDeviceStatus, savePushSubscription } = require('../database/db');
const webpush = require('web-push');

const router = express.Router();

// Validation schemas
const deviceSchema = Joi.object({
  minerId: Joi.string().required(),
  minerName: Joi.string().required(),
  deviceType: Joi.string().valid('android', 'ios', 'web').required(),
  phoneNumber: Joi.string().required(),
  email: Joi.string().email().required(),
  fcmToken: Joi.string().optional(),
  zoneAssignment: Joi.string().required(),
  preferences: Joi.object({
    enablePushNotifications: Joi.boolean().default(true),
    enableSMS: Joi.boolean().default(true),
    enableEmail: Joi.boolean().default(false),
    enableVibration: Joi.boolean().default(true),
    quietHours: Joi.object({
      start: Joi.string().optional(),
      end: Joi.string().optional()
    }).optional(),
    minimumSeverity: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium')
  }).required(),
  batteryLevel: Joi.number().min(0).max(100).optional(),
  networkStatus: Joi.string().valid('online', 'offline', 'low-signal').default('online')
});

// GET /api/devices - Get all registered devices
router.get('/', async (req, res) => {
  try {
    const devices = await getDevices();
    res.json({
      success: true,
      devices: devices.map(device => ({
        id: device.id,
        minerId: device.miner_id,
        minerName: device.miner_name,
        deviceType: device.device_type,
        phoneNumber: device.phone_number,
        email: device.email,
        fcmToken: device.fcm_token,
        zoneAssignment: device.zone_assignment,
        isActive: Boolean(device.is_active),
        preferences: typeof device.preferences === 'string' 
          ? JSON.parse(device.preferences) 
          : device.preferences,
        batteryLevel: device.battery_level,
        networkStatus: device.network_status,
        lastSeen: device.last_seen,
        createdAt: device.created_at
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching devices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch devices',
      message: error.message
    });
  }
});

// POST /api/devices - Register a new device
router.post('/', async (req, res) => {
  try {
    const { error, value } = deviceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    const deviceId = uuidv4();
    const device = {
      id: deviceId,
      minerId: value.minerId,
      minerName: value.minerName,
      deviceType: value.deviceType,
      phoneNumber: value.phoneNumber,
      email: value.email,
      fcmToken: value.fcmToken,
      location: { zone: value.zoneAssignment },
      preferences: value.preferences,
      batteryLevel: value.batteryLevel || 85,
      networkStatus: value.networkStatus || 'online'
    };

    await createDevice(device);

    console.log(`✅ Device registered: ${deviceId} for ${value.minerName}`);

    res.status(201).json({
      success: true,
      deviceId,
      message: 'Device registered successfully',
      device: {
        id: deviceId,
        minerId: value.minerId,
        minerName: value.minerName,
        deviceType: value.deviceType,
        zoneAssignment: value.zoneAssignment
      }
    });

  } catch (error) {
    console.error('❌ Error registering device:', error);
    res.status(500).json({
      success: false,
      error: 'Device registration failed',
      message: error.message
    });
  }
});

// GET /api/devices/push-public-key - Return VAPID public key for frontend
router.get('/push-public-key', (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    return res.status(500).json({ success: false, error: 'VAPID public key not configured' });
  }
  res.json({ success: true, publicKey: key });
});

// POST /api/devices/:deviceId/subscribe - Save web push subscription
router.post('/:deviceId/subscribe', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const subscription = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ success: false, error: 'Invalid subscription payload' });
    }

    await savePushSubscription(deviceId, subscription);
    console.log('🔔 Saved push subscription for device', deviceId);

    res.json({ success: true, message: 'Subscription saved' });
  } catch (error) {
    console.error('❌ Error saving subscription:', error);
    res.status(500).json({ success: false, error: 'Failed to save subscription' });
  }
});

// PUT /api/devices/:deviceId/status - Update device status
router.put('/:deviceId/status', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const updates = {};

    if (req.body.batteryLevel !== undefined) {
      updates.batteryLevel = req.body.batteryLevel;
    }
    if (req.body.networkStatus !== undefined) {
      updates.networkStatus = req.body.networkStatus;
    }
    if (req.body.location !== undefined) {
      updates.location = req.body.location;
    }

    updates.lastSeen = new Date().toISOString();

    const result = await updateDeviceStatus(deviceId, updates);

    if (result === 0) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }

    res.json({
      success: true,
      message: 'Device status updated',
      updates
    });

  } catch (error) {
    console.error('❌ Error updating device status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update device status',
      message: error.message
    });
  }
});

// POST /api/devices/:deviceId/heartbeat - Device heartbeat
router.post('/:deviceId/heartbeat', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { batteryLevel, networkStatus, location } = req.body;

    await updateDeviceStatus(deviceId, {
      batteryLevel,
      networkStatus: networkStatus || 'online',
      location,
      lastSeen: new Date().toISOString()
    });

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Heartbeat received'
    });

  } catch (error) {
    console.error('❌ Error processing heartbeat:', error);
    res.status(500).json({
      success: false,
      error: 'Heartbeat processing failed',
      message: error.message
    });
  }
});

module.exports = router;