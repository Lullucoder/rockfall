# Rockfall Dashboard Backend

## Overview

This Node.js/Express backend provides real-time alert processing and notification capabilities for the Rockfall Dashboard. It automatically monitors risk assessments and sends alerts via SMS, email, and push notifications when risk thresholds are exceeded.

## Features

- **Automatic Risk Monitoring**: Processes risk data and triggers alerts when thresholds are exceeded
- **Manual Alert Testing**: Endpoints for testing alert system functionality
- **Multi-Channel Notifications**: SMS (Twilio), Email (SendGrid), Push Notifications (Firebase)
- **Device Management**: Register and manage mobile devices for miners
- **Real-time WebSocket**: Live data streaming to frontend
- **Rate Limiting**: API protection and abuse prevention
- **SQLite Database**: Persistent storage for alerts, devices, and risk assessments

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

 Edit `.env` with your actual configuration:

```env
# API Security
API_KEY=your-secure-api-key

	# Web Push (VAPID)
	VAPID_PUBLIC_KEY=YOUR_GENERATED_PUBLIC_KEY
	VAPID_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_GENERATED_PRIVATE_KEY\n-----END PRIVATE KEY-----"
	VAPID_SUBJECT=mailto:youremail@example.com

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@your-project.iam.gserviceaccount.com

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid Configuration
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=alerts@yourcompany.com
```

### 2.1 Generate VAPID Keys for Web Push
1. Navigate to the backend folder:
	```bash
	cd backend
	```
2. Run:
	```bash
	npx web-push generate-vapid-keys
	```
3. Copy the `Public Key` and `Private Key` into your `.env` as shown above.
4. Restart the backend service:
	```bash
	node server.js
	```
5. Verify by fetching the public key endpoint:
	```bash
	curl http://localhost:3001/api/devices/push-public-key
	```

### 2.2 SMS (Twilio) Setup
1. Sign up or log in at https://www.twilio.com/ and obtain:
	- `TWILIO_ACCOUNT_SID`
	- `TWILIO_AUTH_TOKEN`
	- `TWILIO_PHONE_NUMBER` (sending number)
2. Populate these in your `.env`:
	```env
	TWILIO_ACCOUNT_SID=your-twilio-account-sid
	TWILIO_AUTH_TOKEN=your-twilio-auth-token
	TWILIO_PHONE_NUMBER=+1234567890
	```
3. Restart backend and test via:
	```bash
	curl -X POST http://localhost:3001/api/alerts/test \
	  -H "Content-Type: application/json" -H "x-api-key: your-secure-api-key" \
	  -d '{"type":"sms_test","message":"Test SMS alert"}'
	```

### 2.3 Email (SendGrid) Setup
1. Sign up or log in at https://sendgrid.com/ and obtain an API key.
2. Populate in `.env`:
	```env
	SENDGRID_API_KEY=your-sendgrid-api-key
	SENDGRID_FROM_EMAIL=alerts@yourcompany.com
	SENDGRID_FROM_NAME="Rockfall Alert System"
	```
3. Restart and test via:
	```bash
	curl -X POST http://localhost:3001/api/alerts/test \
	  -H "Content-Type: application/json" -H "x-api-key: your-secure-api-key" \
	  -d '{"type":"email_test","message":"Test Email alert"}'
	```

## 3. Testing Alert Delivery
1. With backend integration enabled in the dashboard, use the **Simulate Alert** button.
2. Check backend logs for `Web Push sent`, `SMS sent`, `Email sent` messages.
3. Observe browser notifications or receive SMS/email within seconds.
4. Adjust your miner device preferences (quiet hours, minimum severity) and retry tests.

---
## Security Notes
- **Revoke exposed Gemini API key**: Your frontend `.env.local` contained a Google AI key. Please delete it in the Google AI Studio console and generate a new one. Do not commit keys to source control.
- **Protect VAPID & service keys**: Never commit your private VAPID key, Twilio tokens, or SendGrid key. Store them only in `.env` and secure vaults.

### 3. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Device Management

- `POST /api/devices/register` - Register a new mobile device
- `GET /api/devices` - List all registered devices
- `PUT /api/devices/:id` - Update device settings
- `DELETE /api/devices/:id` - Remove device

### Alert Management

- `POST /api/alerts/manual` - Send manual alert
- `POST /api/alerts/test` - Test alert system
- `GET /api/alerts/history` - Get alert history
- `GET /api/alerts/stats` - Get alert statistics

### Simulation Integration

- `POST /api/simulation/monitor-risk` - Monitor risk assessment (automatic alerts)
- `POST /api/simulation/start` - Start simulation monitoring
- `POST /api/simulation/stop` - Stop simulation monitoring
- `GET /api/simulation/status` - Get simulation status

## Risk Thresholds

The system automatically triggers alerts based on these thresholds:

- **High Risk**: 7.5+ (Yellow alert - SMS + Email)
- **Critical Risk**: 8.5+ (Orange alert - SMS + Email + Push)
- **Emergency**: 9.0+ (Red alert - All channels + escalation)

## Frontend Integration

### Enable Backend Integration

1. Open the Rockfall Dashboard
2. Navigate to the "Backend" tab
3. Configure the backend URL: `http://localhost:3001`
4. Enter your API key
5. Enable backend integration

### Automatic Alerts

When backend integration is enabled:
- Risk assessments are automatically sent to the backend
- Alerts are triggered when thresholds are exceeded
- Real-time notifications are sent to registered devices

### Manual Testing

Use the frontend controls to:
- "Simulate Alert": Test specific zone alerts
- "Test Alert System": Verify all notification channels

## Database Schema

The SQLite database includes these tables:

- `devices`: Mobile device registrations
- `alerts`: Alert history and status
- `alert_deliveries`: Notification delivery tracking
- `risk_assessments`: Risk assessment history

## Development

### Mock Mode

For development without real API keys, the system includes mock implementations that log alerts to the console without actually sending notifications.

### WebSocket Events

- `risk-update`: Real-time risk assessment updates
- `alert-triggered`: When alerts are triggered
- `device-registered`: When devices are registered

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Configure real API keys for Twilio, SendGrid, and Firebase
3. Use a production database (PostgreSQL recommended)
4. Enable HTTPS and proper authentication
5. Configure proper CORS settings for your domain

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check if backend is running on correct port
2. **API Key Invalid**: Verify the API key in both frontend and backend
3. **Notifications Not Sent**: Check API credentials for Twilio/SendGrid/Firebase
4. **Database Errors**: Ensure write permissions for SQLite file

### Logs

Check console output for detailed error messages and debugging information.

## Security Notes

- Store API keys securely and never commit them to version control
- Use strong API keys in production
- Enable rate limiting to prevent abuse
- Consider using JWT tokens for enhanced security
- Regularly rotate API keys and credentials