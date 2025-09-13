# Mobile Alert Setup Guide

This document provides setup instructions for implementing real-world mobile notifications for miners in the rockfall monitoring system.

## 1. Push Notifications (Firebase Cloud Messaging)

### Setup Steps:
1. **Create Firebase Project**
   ```bash
   # Go to https://console.firebase.google.com/
   # Create new project
   # Enable Cloud Messaging
   ```

2. **Install Firebase SDK**
   ```bash
   npm install firebase firebase-admin
   ```

3. **Environment Variables**
   ```env
   FIREBASE_SERVER_KEY=your_firebase_server_key
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_WEB_API_KEY=your_web_api_key
   ```

4. **Mobile App Integration**
   - Android: Add `google-services.json` to your mobile app
   - iOS: Add `GoogleService-Info.plist` to your mobile app
   - Web: Configure Firebase SDK with web config

### Production Implementation:
- Replace the mock FCM calls in `RealWorldNotificationService.ts` with actual Firebase Admin SDK calls
- Implement token registration in your mobile app
- Handle push notification reception and vibration

## 2. SMS Notifications (Twilio)

### Setup Steps:
1. **Create Twilio Account**
   - Sign up at https://www.twilio.com/
   - Purchase phone number
   - Get Account SID and Auth Token

2. **Install Twilio SDK**
   ```bash
   npm install twilio
   ```

3. **Environment Variables**
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_FROM_NUMBER=+1234567890
   ```

### Production Implementation:
```typescript
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

await client.messages.create({
  body: message,
  from: process.env.TWILIO_FROM_NUMBER,
  to: device.phoneNumber
});
```

## 3. Email Notifications (SendGrid)

### Setup Steps:
1. **Create SendGrid Account**
   - Sign up at https://sendgrid.com/
   - Create API key
   - Verify sender email

2. **Install SendGrid SDK**
   ```bash
   npm install @sendgrid/mail
   ```

3. **Environment Variables**
   ```env
   SENDGRID_API_KEY=your_api_key
   FROM_EMAIL=alerts@yourcompany.com
   ```

### Production Implementation:
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: device.email,
  from: process.env.FROM_EMAIL,
  subject: subject,
  html: htmlBody,
  text: textBody
});
```

## 4. Mobile App Development

### Option A: Progressive Web App (PWA)
```javascript
// service-worker.js
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    
    // Show notification
    self.registration.showNotification(data.notification.title, {
      body: data.notification.body,
      icon: data.notification.icon,
      badge: '/icons/badge.png',
      vibrate: data.data.vibrationPattern ? JSON.parse(data.data.vibrationPattern) : [200, 100, 200],
      data: data.data
    });
  }
});
```

### Option B: React Native App
```typescript
import messaging from '@react-native-firebase/messaging';
import {Vibration} from 'react-native';

// Request permission
const authStatus = await messaging().requestPermission();

// Get FCM token
const fcmToken = await messaging().getToken();

// Handle foreground messages
messaging().onMessage(async remoteMessage => {
  if (remoteMessage.data?.vibrationPattern) {
    const pattern = JSON.parse(remoteMessage.data.vibrationPattern);
    Vibration.vibrate(pattern);
  }
});
```

## 5. Backend API Endpoints

Create these endpoints in your backend:

```typescript
// POST /api/devices/register
app.post('/api/devices/register', async (req, res) => {
  const device = await notificationService.registerDevice(req.body);
  res.json({ deviceId: device.id });
});

// POST /api/alerts/send
app.post('/api/alerts/send', async (req, res) => {
  const { alert, zoneId } = req.body;
  const statuses = await notificationService.sendAlert(alert, zoneId);
  res.json({ deliveryStatuses: statuses });
});

// GET /api/devices/:deviceId/status
app.get('/api/devices/:deviceId/status', async (req, res) => {
  const status = await notificationService.getDeliveryStatus(req.params.deviceId);
  res.json(status);
});
```

## 6. Device Registration Process

### For Field Deployment:
1. **Install Mobile App on Miner Devices**
   - Download from app store or deploy PWA
   - Grant notification permissions
   - Allow location access

2. **Register Each Device**
   - Use the Mobile Device Registration component
   - Enter miner details and preferences
   - Test notification delivery

3. **Configure Alert Zones**
   - Map device locations to mining zones
   - Set proximity rules for alert delivery
   - Configure emergency contacts

## 7. Security Considerations

1. **API Security**
   ```typescript
   // Use API key authentication
   app.use('/api', authenticateApiKey);
   
   // Rate limiting
   app.use('/api/alerts', rateLimit({
     windowMs: 60 * 1000, // 1 minute
     max: 100 // limit each IP to 100 requests per windowMs
   }));
   ```

2. **Data Encryption**
   - Encrypt sensitive data in transit (HTTPS)
   - Store API keys securely (environment variables)
   - Use secure token storage in mobile apps

3. **Access Control**
   - Implement role-based access (supervisors, miners, safety officers)
   - Audit trail for alert deliveries
   - Emergency override capabilities

## 8. Testing & Monitoring

### Testing Checklist:
- [ ] Push notification delivery
- [ ] SMS message delivery
- [ ] Email alert delivery
- [ ] Vibration patterns
- [ ] Offline device handling
- [ ] Network failure recovery
- [ ] Battery optimization

### Monitoring Dashboard:
- Delivery success rates by channel
- Average delivery times
- Device battery levels
- Network connectivity status
- Failed delivery alerts

## 9. Deployment

### Environment Setup:
```bash
# Production environment variables
export NODE_ENV=production
export FIREBASE_SERVER_KEY=prod_key
export TWILIO_ACCOUNT_SID=prod_sid
export SENDGRID_API_KEY=prod_key

# Start application
npm run build
npm start
```

### Docker Deployment:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 10. Emergency Procedures

### Critical Alert Protocol:
1. **Immediate Actions**
   - Send alerts to all channels simultaneously
   - Trigger emergency evacuation procedures
   - Notify emergency services if needed

2. **Escalation Process**
   - Retry failed deliveries every 30 seconds
   - Send backup alerts to supervisors
   - Activate emergency communication systems

3. **Recovery Procedures**
   - Monitor acknowledgment receipts
   - Track personnel evacuation status
   - Coordinate with emergency response teams

## Implementation Status

✅ **Completed Components:**
- Real-world notification service architecture
- Mobile device registration system
- Alert delivery status monitoring
- Multi-channel notification templates
- Dashboard integration

🔄 **Next Steps for Production:**
1. Replace mock implementations with actual service calls
2. Deploy backend API endpoints
3. Develop/deploy mobile applications
4. Configure production environment variables
5. Conduct field testing with actual devices
6. Train mining personnel on system usage

## Support & Maintenance

### Regular Tasks:
- Monitor delivery success rates
- Update device registrations
- Review alert templates
- Test emergency procedures
- Update mobile app versions
- Backup notification logs

### Emergency Contacts:
- System Administrator: [admin@company.com]
- Safety Officer: [safety@company.com]
- Technical Support: [support@company.com]

This system provides a comprehensive foundation for real-world mobile notifications that can save lives by ensuring miners receive critical rockfall alerts instantly on their mobile devices.