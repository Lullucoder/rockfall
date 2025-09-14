# Backend Setup and Testing Guide

## 🚀 Quick Setup Steps

### 1. Environment Configuration

1. **Copy the environment file**:
```bash
cd backend
cp .env.example .env
```

2. **Edit the `.env` file** with your API keys from the `API_KEYS_SETUP.md` guide

### 2. Install Dependencies (if needed)

```bash
cd backend
npm install
```

### 3. Start the Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

---

## 🧪 Testing Your Implementation

### 1. Check Service Status

First, verify all notification services are properly configured:

```bash
curl -X GET http://localhost:3001/api/test/status
```

Expected response:
```json
{
  "success": true,
  "status": {
    "isInitialized": true,
    "services": {
      "twilio": {
        "configured": true,
        "client": true
      },
      "sendgrid": {
        "configured": true
      },
      "firebase": {
        "configured": true,
        "app": true
      },
      "webpush": {
        "configured": true
      }
    }
  }
}
```

### 2. Test Device Registration

Register a test device:

```bash
curl -X POST http://localhost:3001/api/devices \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secure-api-key-here" \
  -d '{
    "minerId": "MINER001",
    "minerName": "John Doe",
    "deviceType": "android",
    "phoneNumber": "+1234567890",
    "email": "john.doe@example.com",
    "zoneAssignment": "zone-1",
    "preferences": {
      "enablePushNotifications": true,
      "enableSMS": true,
      "enableEmail": true,
      "minimumSeverity": "medium"
    }
  }'
```

### 3. Test SMS Notifications

```bash
curl -X POST http://localhost:3001/api/test/sms \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "message": "Test SMS from Rockfall System"
  }'
```

### 4. Test Email Notifications

```bash
curl -X POST http://localhost:3001/api/test/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "subject": "Test Alert",
    "message": "Test email from Rockfall System"
  }'
```

### 5. Test Push Notifications

```bash
curl -X POST http://localhost:3001/api/test/push \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device",
    "title": "Test Alert",
    "body": "Test push notification",
    "fcmToken": "your-fcm-token-here"
  }'
```

### 6. Test All Notification Channels

```bash
curl -X POST http://localhost:3001/api/test/all \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "email": "test@example.com",
    "deviceId": "test-device",
    "message": "Complete test of all notification systems"
  }'
```

---

## 🎯 API Endpoints Reference

### Device Management
- `GET /api/devices` - List all registered devices
- `POST /api/devices` - Register a new device
- `PUT /api/devices/:id/status` - Update device status
- `POST /api/devices/:id/heartbeat` - Device heartbeat
- `POST /api/devices/:id/subscribe` - Save web push subscription

### Alerts
- `GET /api/alerts` - List alerts
- `POST /api/alerts` - Create manual alert
- `PUT /api/alerts/:id/resolve` - Resolve alert

### Simulation
- `POST /api/simulation/risk-assessment` - Run risk assessment
- `POST /api/simulation/manual-alert` - Send manual alert

### Testing
- `GET /api/test/status` - Check service status
- `POST /api/test/sms` - Test SMS
- `POST /api/test/email` - Test email
- `POST /api/test/push` - Test push notification
- `POST /api/test/all` - Test all channels

---

## 📱 Mobile App Integration

### Device Registration Flow

1. **Register Device**:
```javascript
const deviceData = {
  minerId: "MINER001",
  minerName: "John Doe",
  deviceType: "android", // or "ios", "web"
  phoneNumber: "+1234567890",
  email: "john.doe@example.com",
  fcmToken: "firebase-token-here", // From Firebase SDK
  zoneAssignment: "zone-1",
  preferences: {
    enablePushNotifications: true,
    enableSMS: true,
    enableEmail: false,
    minimumSeverity: "medium"
  }
};

const response = await fetch('/api/devices', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key'
  },
  body: JSON.stringify(deviceData)
});
```

2. **Send Heartbeat** (every 5 minutes):
```javascript
const heartbeat = {
  batteryLevel: 85,
  networkStatus: "online",
  location: { zone: "zone-1" }
};

await fetch(`/api/devices/${deviceId}/heartbeat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(heartbeat)
});
```

### Web Push Setup

1. **Get VAPID Public Key**:
```javascript
const response = await fetch('/api/devices/push-public-key');
const { publicKey } = await response.json();
```

2. **Subscribe for Push**:
```javascript
const registration = await navigator.serviceWorker.register('/sw.js');
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: publicKey
});

await fetch(`/api/devices/${deviceId}/subscribe`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(subscription)
});
```

---

## 🔧 Configuration Examples

### .env Configuration
```env
# Server
PORT=3001
API_KEY=your-secure-api-key-here

# Twilio SMS
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+1234567890

# SendGrid Email
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=alerts@yourcompany.com
FROM_NAME=Rockfall Alert System

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Web Push
VAPID_PUBLIC_KEY=BKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_SUBJECT=mailto:admin@yourcompany.com
```

---

## 🚨 Emergency Alert Testing

Test the complete emergency alert flow:

```bash
# Create a critical alert that triggers emergency broadcast
curl -X POST http://localhost:3001/api/simulation/manual-alert \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "zoneId": "zone-1",
    "zoneName": "Test Zone Alpha",
    "severity": "critical",
    "message": "EMERGENCY TEST: Immediate evacuation required",
    "riskScore": 9.5,
    "broadcastToAll": true
  }'
```

---

## 📊 Monitoring and Logs

### Database Tables

- `devices` - Registered miner devices
- `alerts` - Generated alerts
- `alert_deliveries` - Notification delivery tracking
- `system_logs` - System activity logs

### Check Alert Deliveries

```bash
curl -X GET http://localhost:3001/api/alerts/deliveries/:alertId \
  -H "x-api-key: your-api-key"
```

### System Health Check

```bash
curl -X GET http://localhost:3001/health
```

---

## 🔍 Troubleshooting

### Common Issues

1. **SMS not sending**: Check Twilio credentials and account balance
2. **Email not sending**: Verify SendGrid API key and sender authentication
3. **Push notifications failing**: Check Firebase service account key format
4. **Database errors**: Ensure SQLite file has write permissions

### Debug Mode

Set `NODE_ENV=development` in `.env` for detailed logging.

### Log Files

Check console output for:
- ✅ Success messages
- ⚠️ Warning messages (simulated services)
- ❌ Error messages

---

## 🎉 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use real API keys (not test/simulation)
3. Set up proper CORS origins
4. Configure rate limiting
5. Set up SSL/TLS certificates
6. Monitor alert delivery rates

---

## 📞 Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify API key format and permissions
3. Test each service individually using test endpoints
4. Check service status pages for outages
5. Refer to `API_KEYS_SETUP.md` for detailed setup instructions

**Successfully tested?** All systems are ready for production! 🎊