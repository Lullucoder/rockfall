const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class LocalDB {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.devicesFile = path.join(this.dataDir, 'devices.json');
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.alertsFile = path.join(this.dataDir, 'alerts.json');
    
    this.initializeStorage();
  }

  initializeStorage() {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Initialize files with empty arrays if they don't exist
    [this.devicesFile, this.usersFile, this.alertsFile].forEach(file => {
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify([], null, 2));
      }
    });
  }

  readFile(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      return [];
    }
  }

  writeFile(filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${filePath}:`, error);
      return false;
    }
  }

  // Device operations
  saveDevice(deviceData) {
    const devices = this.readFile(this.devicesFile);
    const newDevice = {
      id: uuidv4(),
      ...deviceData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    };
    
    devices.push(newDevice);
    
    if (this.writeFile(this.devicesFile, devices)) {
      console.log(`✅ Device saved locally: ${newDevice.id}`);
      return newDevice;
    }
    throw new Error('Failed to save device');
  }

  getDevices() {
    const devices = this.readFile(this.devicesFile);
    console.log(`📱 Retrieved ${devices.length} devices from local storage`);
    return devices;
  }

  getActiveDevices() {
    const devices = this.getDevices();
    return devices.filter(device => device.is_active);
  }

  getDeviceById(deviceId) {
    const devices = this.readFile(this.devicesFile);
    return devices.find(device => device.id === deviceId);
  }

  updateDevice(deviceId, updates) {
    const devices = this.readFile(this.devicesFile);
    const deviceIndex = devices.findIndex(device => device.id === deviceId);
    
    if (deviceIndex === -1) {
      throw new Error('Device not found');
    }
    
    devices[deviceIndex] = {
      ...devices[deviceIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    if (this.writeFile(this.devicesFile, devices)) {
      return devices[deviceIndex];
    }
    throw new Error('Failed to update device');
  }

  deleteDevice(deviceId) {
    const devices = this.readFile(this.devicesFile);
    const filteredDevices = devices.filter(device => device.id !== deviceId);
    
    if (devices.length === filteredDevices.length) {
      throw new Error('Device not found');
    }
    
    return this.writeFile(this.devicesFile, filteredDevices);
  }

  getDevicesByZone(zoneId) {
    const devices = this.getActiveDevices();
    return devices.filter(device => device.zone_assignment === zoneId);
  }

  updateDeviceLocation(deviceId, location) {
    return this.updateDevice(deviceId, { 
      location: location,
      last_seen: new Date().toISOString()
    });
  }

  updateDeviceStatus(deviceId, statusUpdates) {
    return this.updateDevice(deviceId, {
      ...statusUpdates,
      last_seen: new Date().toISOString()
    });
  }

  savePushSubscription(deviceId, subscription) {
    return this.updateDevice(deviceId, { 
      push_subscription: subscription,
      last_seen: new Date().toISOString()
    });
  }

  // User operations
  saveUser(userData) {
    const users = this.readFile(this.usersFile);
    const newUser = {
      id: uuidv4(),
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active'
    };
    
    users.push(newUser);
    
    if (this.writeFile(this.usersFile, users)) {
      console.log(`✅ User saved locally: ${newUser.id}`);
      return newUser;
    }
    throw new Error('Failed to save user');
  }

  getUsers() {
    const users = this.readFile(this.usersFile);
    console.log(`👥 Retrieved ${users.length} users from local storage`);
    return users;
  }

  // Alert operations
  saveAlert(alertData) {
    const alerts = this.readFile(this.alertsFile);
    const newAlert = {
      id: uuidv4(),
      ...alertData,
      created_at: new Date().toISOString(),
      status: 'active'
    };
    
    alerts.push(newAlert);
    
    if (this.writeFile(this.alertsFile, alerts)) {
      console.log(`🚨 Alert saved locally: ${newAlert.id}`);
      return newAlert;
    }
    throw new Error('Failed to save alert');
  }

  getAlerts() {
    return this.readFile(this.alertsFile);
  }

  // Get all contact info for alert delivery
  getAllContacts() {
    const devices = this.getActiveDevices();
    const users = this.getUsers();
    
    const contacts = [];
    
    // Add device contacts
    devices.forEach(device => {
      if (device.phone_number || device.email) {
        contacts.push({
          id: device.id,
          type: 'device',
          name: device.miner_name || 'Unknown',
          phone: device.phone_number,
          email: device.email,
          preferences: device.preferences || {}
        });
      }
    });
    
    // Add user contacts
    users.forEach(user => {
      if (user.phone || user.email) {
        contacts.push({
          id: user.id,
          type: 'user',
          name: user.name,
          phone: user.phone,
          email: user.email,
          preferences: user.preferences || {}
        });
      }
    });
    
    console.log(`📇 Retrieved ${contacts.length} contacts for alerts`);
    return contacts;
  }
}

module.exports = new LocalDB();