const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let db;

async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    // Ensure data directory exists
    const dataDir = path.dirname(process.env.DB_PATH || './data/rockfall.db');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Connect to database
    db = new sqlite3.Database(process.env.DB_PATH || './data/rockfall.db', (err) => {
      if (err) {
        console.error('❌ Database connection error:', err);
        reject(err);
        return;
      }
      console.log('✅ Connected to SQLite database');
    });

    // Create tables
    db.serialize(() => {
      // Devices table
      db.run(`
        CREATE TABLE IF NOT EXISTS devices (
          id TEXT PRIMARY KEY,
          miner_id TEXT NOT NULL,
          miner_name TEXT NOT NULL,
          device_type TEXT NOT NULL,
          phone_number TEXT NOT NULL,
          email TEXT NOT NULL,
          fcm_token TEXT,
          push_subscription TEXT, -- JSON string for web push
          zone_assignment TEXT,
          is_active BOOLEAN DEFAULT 1,
          preferences TEXT, -- JSON string
          battery_level INTEGER,
          network_status TEXT DEFAULT 'unknown',
          last_seen DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Add push_subscription column if it does not exist (migration safeguard)
      db.get("PRAGMA table_info(devices)", (err) => {
        if (!err) {
          db.all("PRAGMA table_info(devices)", (e2, rows) => {
            if (!e2) {
              const hasColumn = rows.some(r => r.name === 'push_subscription');
              if (!hasColumn) {
                db.run('ALTER TABLE devices ADD COLUMN push_subscription TEXT', () => {
                  console.log('🛠️ Added push_subscription column to devices table');
                });
              }
            }
          });
        }
      });

      // Alerts table
      db.run(`
        CREATE TABLE IF NOT EXISTS alerts (
          id TEXT PRIMARY KEY,
          zone_id TEXT,
          zone_name TEXT NOT NULL,
          severity TEXT NOT NULL,
          status TEXT DEFAULT 'active',
          message TEXT NOT NULL,
          risk_score REAL,
          risk_probability REAL,
          predicted_timeline TEXT,
          recommended_actions TEXT, -- JSON string
          affected_personnel INTEGER DEFAULT 0,
          equipment_at_risk TEXT, -- JSON string
          alert_type TEXT DEFAULT 'automatic',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          resolved_at DATETIME
        )
      `);

      // Alert deliveries table
      db.run(`
        CREATE TABLE IF NOT EXISTS alert_deliveries (
          id TEXT PRIMARY KEY,
          alert_id TEXT NOT NULL,
          device_id TEXT NOT NULL,
          channel TEXT NOT NULL, -- push, sms, email
          status TEXT DEFAULT 'pending', -- pending, sent, delivered, failed, read
          delivery_attempts INTEGER DEFAULT 1,
          error_message TEXT,
          sent_at DATETIME,
          delivered_at DATETIME,
          read_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (alert_id) REFERENCES alerts (id),
          FOREIGN KEY (device_id) REFERENCES devices (id)
        )
      `);

      // Risk assessments table
      db.run(`
        CREATE TABLE IF NOT EXISTS risk_assessments (
          id TEXT PRIMARY KEY,
          zone_data TEXT NOT NULL, -- JSON string
          risk_scores TEXT NOT NULL, -- JSON string
          max_risk_score REAL,
          alerts_triggered INTEGER DEFAULT 0,
          assessment_type TEXT DEFAULT 'automatic', -- automatic, manual
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // System logs table
      db.run(`
        CREATE TABLE IF NOT EXISTS system_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          level TEXT NOT NULL, -- info, warning, error, critical
          category TEXT NOT NULL, -- alert, device, system, notification
          message TEXT NOT NULL,
          metadata TEXT, -- JSON string
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Database tables created/verified');
      resolve();
    });
  });
}

// Database helper functions
const dbHelpers = {
  // Device operations
  async createDevice(device) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO devices (
          id, miner_id, miner_name, device_type, phone_number, email, 
          fcm_token, push_subscription, zone_assignment, preferences, battery_level, network_status, last_seen
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(sql, [
        device.id,
        device.minerId,
        device.minerName,
        device.deviceType,
        device.phoneNumber,
        device.email,
        device.fcmToken,
        device.pushSubscription ? JSON.stringify(device.pushSubscription) : null,
        device.location?.zone,
        JSON.stringify(device.preferences),
        device.batteryLevel,
        device.networkStatus || 'online',
        new Date().toISOString()
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  },

  async getDevices() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM devices WHERE is_active = 1', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const devices = rows.map(row => ({
            ...row,
            preferences: JSON.parse(row.preferences || '{}'),
            pushSubscription: row.push_subscription ? JSON.parse(row.push_subscription) : null,
            location: row.zone_assignment ? { zone: row.zone_assignment } : undefined
          }));
          resolve(devices);
        }
      });
    });
  },

  async savePushSubscription(deviceId, subscription) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE devices SET push_subscription = ?, updated_at = ? WHERE id = ?';
      db.run(sql, [JSON.stringify(subscription), new Date().toISOString(), deviceId], function(err) {
        if (err) reject(err); else resolve(this.changes);
      });
    });
  },

  async updateDeviceStatus(deviceId, updates) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];
      
      if (updates.batteryLevel !== undefined) {
        fields.push('battery_level = ?');
        values.push(updates.batteryLevel);
      }
      if (updates.networkStatus !== undefined) {
        fields.push('network_status = ?');
        values.push(updates.networkStatus);
      }
      if (updates.lastSeen !== undefined) {
        fields.push('last_seen = ?');
        values.push(updates.lastSeen);
      }
      
      fields.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(deviceId);

      const sql = `UPDATE devices SET ${fields.join(', ')} WHERE id = ?`;
      
      db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  },

  // Alert operations
  async createAlert(alert) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO alerts (
          id, zone_id, zone_name, severity, message, risk_score, 
          risk_probability, predicted_timeline, recommended_actions, 
          affected_personnel, equipment_at_risk, alert_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(sql, [
        alert.id,
        alert.zoneId,
        alert.zoneName,
        alert.severity,
        alert.message,
        alert.riskScore,
        alert.riskProbability,
        alert.timeToEvent,
        JSON.stringify(alert.recommendedActions || []),
        alert.affectedPersonnel || 0,
        JSON.stringify(alert.equipmentAtRisk || []),
        alert.type || 'automatic'
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  },

  async getAlerts(limit = 50) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM alerts ORDER BY created_at DESC LIMIT ?', 
        [limit], 
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const alerts = rows.map(row => ({
              ...row,
              recommendedActions: JSON.parse(row.recommended_actions || '[]'),
              equipmentAtRisk: JSON.parse(row.equipment_at_risk || '[]')
            }));
            resolve(alerts);
          }
        }
      );
    });
  },

  // Alert delivery operations
  async createAlertDelivery(delivery) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO alert_deliveries (
          id, alert_id, device_id, channel, status, delivery_attempts, sent_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(sql, [
        delivery.id,
        delivery.alertId,
        delivery.deviceId,
        delivery.channel,
        delivery.status,
        delivery.deliveryAttempts,
        delivery.timestamp
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  },

  async updateDeliveryStatus(deliveryId, status, errorMessage = null) {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      let sql = 'UPDATE alert_deliveries SET status = ?, updated_at = ?';
      let params = [status, now];
      
      if (status === 'sent') {
        sql += ', sent_at = ?';
        params.push(now);
      } else if (status === 'delivered') {
        sql += ', delivered_at = ?';
        params.push(now);
      } else if (status === 'read') {
        sql += ', read_at = ?';
        params.push(now);
      }
      
      if (errorMessage) {
        sql += ', error_message = ?';
        params.push(errorMessage);
      }
      
      sql += ' WHERE id = ?';
      params.push(deliveryId);
      
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  },

  async getDeliveryStatus(alertId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM alert_deliveries WHERE alert_id = ? ORDER BY created_at DESC', 
        [alertId], 
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  },

  // Risk assessment operations
  async createRiskAssessment(assessment) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO risk_assessments (
          id, zone_data, risk_scores, max_risk_score, alerts_triggered, assessment_type
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(sql, [
        assessment.id,
        JSON.stringify(assessment.zoneData),
        JSON.stringify(assessment.riskScores),
        assessment.maxRiskScore,
        assessment.alertsTriggered,
        assessment.type || 'automatic'
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  },

  // System logging
  async log(level, category, message, metadata = null) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO system_logs (level, category, message, metadata)
        VALUES (?, ?, ?, ?)
      `;
      
      db.run(sql, [level, category, message, JSON.stringify(metadata)], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }
};

module.exports = {
  initializeDatabase,
  db: () => db,
  ...dbHelpers
};