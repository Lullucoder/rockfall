const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const localDB = require('../storage/localDB');
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
    const devices = await localDB.getActiveDevices();
    res.json({ 
      success: true, 
      data: devices, 
      count: devices.length 
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
    // Accept both snake_case (frontend current form) and camelCase (schema) keys
    const raw = req.body || {};
    const normalized = {
      minerId: raw.minerId || raw.miner_id,
      minerName: raw.minerName || raw.miner_name,
      deviceType: raw.deviceType || raw.device_type,
      phoneNumber: raw.phoneNumber || raw.phone_number,
      email: raw.email,
      fcmToken: raw.fcmToken || raw.fcm_token,
      zoneAssignment: raw.zoneAssignment || raw.zone_assignment,
      preferences: raw.preferences || raw.notification_settings || raw.notificationPreferences,
      batteryLevel: raw.batteryLevel,
      networkStatus: raw.networkStatus
    };

    const { error, value } = deviceSchema.validate(normalized);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    const device = await localDB.saveDevice({
      miner_id: value.minerId,
      miner_name: value.minerName,
      device_type: value.deviceType,
      phone_number: value.phoneNumber,
      email: value.email,
      fcm_token: value.fcmToken,
      zone_assignment: value.zoneAssignment,
      preferences: value.preferences,
      battery_level: value.batteryLevel,
      network_status: value.networkStatus || 'online'
    });

    console.log(`✅ Device registered: ${device.id}`);

    res.status(201).json({
      success: true,
      deviceId: device.id,
      message: 'Device registered successfully',
      device: device
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

    await localDB.savePushSubscription(deviceId, subscription);
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
      updates.battery_level = req.body.batteryLevel;
    }
    if (req.body.networkStatus !== undefined) {
      updates.network_status = req.body.networkStatus;
    }
    if (req.body.location !== undefined) {
      updates.location = req.body.location;
    }

    updates.last_seen = new Date().toISOString();

    // Update device status using localDB
    if (req.body.location && req.body.location.lat && req.body.location.lng) {
      const result = await localDB.updateDeviceLocation(deviceId, req.body.location);
      
      res.json({
        success: true,
        message: 'Device status updated',
        data: result
      });
    } else {
      const result = await localDB.updateDeviceStatus(deviceId, updates);
      res.json({
        success: true,
        message: 'Device status updated',
        data: result
      });
    }

  } catch (error) {
    console.error('❌ Error updating device status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update device status',
      message: error.message
    });
  }
});

// GET /api/devices/:deviceId - Get device by ID
router.get('/:deviceId', async (req, res) => {
  try {
    const device = await localDB.getDeviceById(req.params.deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }
    res.json({
      success: true,
      data: device
    });
  } catch (error) {
    console.error('❌ Get device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch device',
      error: error.message
    });
  }
});

// GET /api/devices/zone/:zoneId - Get devices by zone
router.get('/zone/:zoneId', async (req, res) => {
  try {
    const devices = await localDB.getDevicesByZone(req.params.zoneId);
    res.json({
      success: true,
      data: devices,
      count: devices.length
    });
  } catch (error) {
    console.error('❌ Get devices by zone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch devices',
      error: error.message
    });
  }
});

// PUT /api/devices/:deviceId/location - Update device location
router.put('/:deviceId/location', async (req, res) => {
  try {
    const { location } = req.body;
    
    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location data. lat and lng are required.'
      });
    }
    
    const device = await localDB.updateDeviceLocation(req.params.deviceId, location);
    res.json({
      success: true,
      message: 'Location updated successfully',
      data: device
    });
  } catch (error) {
    console.error('❌ Location update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
});

// POST /api/devices/:deviceId/heartbeat - Device heartbeat
router.post('/:deviceId/heartbeat', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { batteryLevel, networkStatus, location } = req.body;

    await localDB.updateDeviceStatus(deviceId, {
      battery_level: batteryLevel,
      network_status: networkStatus || 'online',
      location,
      last_seen: new Date().toISOString()
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