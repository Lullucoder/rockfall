const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔗 Supabase client initialized');

// Device Management
async function registerDevice(deviceData) {
  try {
    console.log('📱 Registering device:', deviceData);
    
    const deviceRecord = {
      device_type: deviceData.deviceType || deviceData.device_type,
      device_token: deviceData.deviceToken || deviceData.device_token,
      fcm_token: deviceData.fcmToken || deviceData.fcm_token,
      device_info: deviceData.deviceInfo || deviceData.device_info || {},
      notification_settings: deviceData.notificationSettings || deviceData.notification_settings || {
        sms: true,
        email: true,
        push: true,
        vibration: true,
        sound: true
      },
      emergency_contacts: deviceData.emergencyContacts || deviceData.emergency_contacts || [],
      is_active: true
    };

    // Merge miner/operator identification details into device_info
    const minerMeta = {
      ...(deviceRecord.device_info || {}),
      minerId: deviceData.minerId || deviceData.miner_id,
      minerName: deviceData.minerName || deviceData.miner_name,
      phoneNumber: deviceData.phoneNumber || deviceData.phone_number,
      email: deviceData.email
    };
    deviceRecord.device_info = minerMeta;

    // Add location if provided
    if (deviceData.location && deviceData.location.lat && deviceData.location.lng) {
      deviceRecord.location = `POINT(${deviceData.location.lng} ${deviceData.location.lat})`;
    }

    // Add zone_id if provided
    if (deviceData.zoneId || deviceData.zone_id) {
      deviceRecord.zone_id = deviceData.zoneId || deviceData.zone_id;
    }

    // Add user_id if provided
    if (deviceData.userId || deviceData.user_id) {
      deviceRecord.user_id = deviceData.userId || deviceData.user_id;
    }

    const { data, error } = await supabase
      .from('devices')
      .insert([deviceRecord])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('✅ Device registered successfully:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error registering device:', error);
    throw error;
  }
}

async function getDevicesByZone(zoneId) {
  try {
    console.log('🔍 Fetching devices for zone:', zoneId);
    
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('zone_id', zoneId)
      .eq('is_active', true);

    if (error) throw error;
    
    console.log(`✅ Found ${data.length} devices in zone ${zoneId}`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching devices by zone:', error);
    throw error;
  }
}

async function getAllActiveDevices() {
  try {
    console.log('🔍 Fetching all active devices');
    
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    
    console.log(`✅ Found ${data.length} active devices`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching all devices:', error);
    throw error;
  }
}

async function updateDeviceLocation(deviceId, location) {
  try {
    console.log('📍 Updating device location:', deviceId, location);
    
    const { data, error } = await supabase
      .from('devices')
      .update({
        location: `POINT(${location.lng} ${location.lat})`,
        last_seen: new Date().toISOString()
      })
      .eq('id', deviceId)
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Device location updated successfully');
    return data;
  } catch (error) {
    console.error('❌ Error updating device location:', error);
    throw error;
  }
}

async function getDeviceById(deviceId) {
  try {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('id', deviceId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error getting device by ID:', error);
    throw error;
  }
}

// Alert Management
async function createAlert(alertData) {
  try {
    console.log('🚨 Creating alert:', alertData);
    
    const alertRecord = {
      alert_type: alertData.alertType || alertData.alert_type || 'rockfall',
      severity: alertData.severity || 'moderate',
      title: alertData.title || 'Rockfall Alert',
      message: alertData.message || 'Alert detected in your area',
      risk_score: alertData.riskScore || alertData.risk_score || 5.0,
      is_active: true,
      metadata: alertData.metadata || {}
    };

    // Add location if provided
    if (alertData.location && alertData.location.lat && alertData.location.lng) {
      alertRecord.location = `POINT(${alertData.location.lng} ${alertData.location.lat})`;
    }

    // Add zone_id if provided
    if (alertData.zoneId || alertData.zone_id) {
      alertRecord.zone_id = alertData.zoneId || alertData.zone_id;
    }

    // Add affected radius
    if (alertData.affectedRadius || alertData.affected_radius) {
      alertRecord.affected_radius = alertData.affectedRadius || alertData.affected_radius;
    }

    const { data, error } = await supabase
      .from('alerts')
      .insert([alertRecord])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('✅ Alert created successfully:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error creating alert:', error);
    throw error;
  }
}

async function getActiveAlerts(zoneId = null) {
  try {
    console.log('🔍 Fetching active alerts', zoneId ? `for zone: ${zoneId}` : '');
    
    let query = supabase
      .from('alerts')
      .select(`
        *,
        zones(name, description, risk_level)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (zoneId) {
      query = query.eq('zone_id', zoneId);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    console.log(`✅ Found ${data.length} active alerts`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching active alerts:', error);
    throw error;
  }
}

async function resolveAlert(alertId, resolvedBy = null) {
  try {
    console.log('✅ Resolving alert:', alertId);
    
    const updateData = {
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      is_active: false
    };

    if (resolvedBy) {
      updateData.resolved_by = resolvedBy;
    }

    const { data, error } = await supabase
      .from('alerts')
      .update(updateData)
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Alert resolved successfully');
    return data;
  } catch (error) {
    console.error('❌ Error resolving alert:', error);
    throw error;
  }
}

// Alert Delivery Tracking
async function logAlertDelivery(deliveryData) {
  try {
    const { data, error } = await supabase
      .from('alert_deliveries')
      .insert([{
        alert_id: deliveryData.alertId,
        device_id: deliveryData.deviceId,
        delivery_method: deliveryData.method,
        status: deliveryData.status || 'pending',
        delivered_at: deliveryData.deliveredAt,
        error_message: deliveryData.error,
        metadata: deliveryData.metadata || {},
        retry_count: deliveryData.retryCount || 0
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error logging alert delivery:', error);
    throw error;
  }
}

async function updateDeliveryStatus(deliveryId, status, metadata = {}) {
  try {
    const updateData = { status, metadata };
    
    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    } else if (status === 'acknowledged') {
      updateData.acknowledged_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('alert_deliveries')
      .update(updateData)
      .eq('id', deliveryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error updating delivery status:', error);
    throw error;
  }
}

async function getAllDeliveryStatuses() {
  try {
    const { data, error } = await supabase
      .from('alert_deliveries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100); // Limit to last 100 deliveries for performance

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Error getting all delivery statuses:', error);
    throw error;
  }
}

async function getDeliveryStatus(alertId) {
  try {
    const { data, error } = await supabase
      .from('alert_deliveries')
      .select('*')
      .eq('alert_id', alertId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Error getting delivery status:', error);
    throw error;
  }
}

// Emergency Events
async function createEmergencyEvent(eventData) {
  try {
    console.log('🆘 Creating emergency event:', eventData);
    
    const eventRecord = {
      event_type: eventData.eventType || eventData.event_type || 'sos',
      message: eventData.message || 'Emergency SOS activated',
      status: 'active',
      metadata: eventData.metadata || {}
    };

    // Add location if provided
    if (eventData.location && eventData.location.lat && eventData.location.lng) {
      eventRecord.location = `POINT(${eventData.location.lng} ${eventData.location.lat})`;
    }

    // Add user_id if provided
    if (eventData.userId || eventData.user_id) {
      eventRecord.user_id = eventData.userId || eventData.user_id;
    }

    // Add device_id if provided
    if (eventData.deviceId || eventData.device_id) {
      eventRecord.device_id = eventData.deviceId || eventData.device_id;
    }

    // Add voice note URL if provided
    if (eventData.voiceNoteUrl || eventData.voice_note_url) {
      eventRecord.voice_note_url = eventData.voiceNoteUrl || eventData.voice_note_url;
    }

    const { data, error } = await supabase
      .from('emergency_events')
      .insert([eventRecord])
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Emergency event created successfully:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error creating emergency event:', error);
    throw error;
  }
}

// Zone Management
async function createZone(zoneData) {
  try {
    console.log('🏔️ Creating zone:', zoneData.name);
    
    const { data, error } = await supabase
      .from('zones')
      .insert([{
        name: zoneData.name,
        description: zoneData.description,
        coordinates: zoneData.coordinates, // GeoJSON polygon
        risk_level: zoneData.riskLevel || zoneData.risk_level || 'low',
        max_capacity: zoneData.maxCapacity || zoneData.max_capacity || 100,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Zone created successfully:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error creating zone:', error);
    throw error;
  }
}

async function getZones() {
  try {
    console.log('🔍 Fetching all zones');
    
    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    
    console.log(`✅ Found ${data.length} zones`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching zones:', error);
    throw error;
  }
}

async function getZoneById(zoneId) {
  try {
    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .eq('id', zoneId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error getting zone by ID:', error);
    throw error;
  }
}

// Sensor Data
async function addSensorData(sensorData) {
  try {
    console.log('📊 Adding sensor data:', sensorData);
    
    const sensorRecord = {
      sensor_type: sensorData.sensorType || sensorData.sensor_type,
      readings: sensorData.readings,
      risk_score: sensorData.riskScore || sensorData.risk_score
    };

    // Add location if provided
    if (sensorData.location && sensorData.location.lat && sensorData.location.lng) {
      sensorRecord.location = `POINT(${sensorData.location.lng} ${sensorData.location.lat})`;
    }

    // Add zone_id if provided
    if (sensorData.zoneId || sensorData.zone_id) {
      sensorRecord.zone_id = sensorData.zoneId || sensorData.zone_id;
    }

    const { data, error } = await supabase
      .from('sensor_data')
      .insert([sensorRecord])
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Sensor data added successfully');
    return data;
  } catch (error) {
    console.error('❌ Error adding sensor data:', error);
    throw error;
  }
}

// Real-time subscriptions
function subscribeToAlerts(callback) {
  console.log('🔔 Setting up real-time alerts subscription');
  
  return supabase
    .channel('alerts_channel')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'alerts' },
      (payload) => {
        console.log('📢 New alert received via real-time:', payload.new);
        callback(payload);
      }
    )
    .subscribe((status) => {
      console.log('📡 Alerts subscription status:', status);
    });
}

function subscribeToEmergencyEvents(callback) {
  console.log('🆘 Setting up real-time emergency events subscription');
  
  return supabase
    .channel('emergency_events_channel')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'emergency_events' },
      (payload) => {
        console.log('🚨 Emergency event received via real-time:', payload.new);
        callback(payload);
      }
    )
    .subscribe((status) => {
      console.log('📡 Emergency events subscription status:', status);
    });
}

// ===== USER MANAGEMENT =====

// Create a new user
async function createUser(userData) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Get user by ID
async function getUserById(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        zones (
          id,
          name,
          description
        )
      `)
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// Get all users
async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        zones (
          id,
          name,
          description
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Get users by zone
async function getUsersByZone(zoneId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        zones (
          id,
          name,
          description
        )
      `)
      .eq('zone_id', zoneId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users by zone:', error);
    throw error;
  }
}

// Update user
async function updateUser(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Delete user
async function deleteUser(userId) {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Test connection
async function testConnection() {
  try {
    console.log('🧪 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('zones')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
}

module.exports = {
  supabase,
  
  // Connection test
  testConnection,
  
  // Device functions
  registerDevice,
  getDevicesByZone,
  getAllActiveDevices,
  updateDeviceLocation,
  getDeviceById,
  
  // Alert functions
  createAlert,
  getActiveAlerts,
  resolveAlert,
  
  // Delivery tracking
  logAlertDelivery,
  updateDeliveryStatus,
  getAllDeliveryStatuses,
  getDeliveryStatus,
  
  // Emergency functions
  createEmergencyEvent,
  
  // Zone functions
  createZone,
  getZones,
  getZoneById,
  
  // User functions
  createUser,
  getUserById,
  getAllUsers,
  getUsersByZone,
  updateUser,
  deleteUser,
  
  // Sensor functions
  addSensorData,
  
  // Real-time functions
  subscribeToAlerts,
  subscribeToEmergencyEvents
};