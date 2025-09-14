# API Keys Setup Guide

This guide will help you obtain all the necessary API keys and configure the notification services for the Rockfall Alert System.

## 🔑 Required API Keys & Setup

### 1. Twilio SMS Service

**Website**: https://www.twilio.com/

**Steps to get API keys**:
1. Go to https://www.twilio.com/ and sign up for a free account
2. Verify your phone number and email
3. Go to the Twilio Console: https://console.twilio.com/
4. Find your **Account SID** and **Auth Token** on the dashboard
5. Buy a phone number:
   - Go to Phone Numbers > Manage > Buy a number
   - Choose a number with SMS capabilities
   - Note down the number (format: +1234567890)

**Environment Variables**:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+1234567890
```

**Pricing**: Free trial includes $15 credit. SMS costs ~$0.0075 per message.

---

### 2. SendGrid Email Service

**Website**: https://sendgrid.com/

**Steps to get API keys**:
1. Go to https://sendgrid.com/ and sign up for a free account
2. Complete email verification
3. Go to Settings > API Keys: https://app.sendgrid.com/settings/api_keys
4. Click "Create API Key"
5. Choose "Restricted Access" and enable:
   - Mail Send: Full Access
   - Template Engine: Read Access (if using templates)
6. Copy the generated API key (starts with "SG.")
7. Verify a sender email address:
   - Go to Settings > Sender Authentication
   - Add and verify an email address you'll send from

**Environment Variables**:
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=alerts@yourcompany.com
FROM_NAME=Rockfall Alert System
```

**Pricing**: Free tier includes 100 emails/day. Paid plans start at $19.95/month.

---

### 3. Firebase Cloud Messaging (Push Notifications)

**Website**: https://console.firebase.google.com/

**Steps to get API keys**:
1. Go to https://console.firebase.google.com/
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "rockfall-alerts")
4. Enable Google Analytics (optional)
5. Once created, go to Project Settings (gear icon)
6. Go to "Service accounts" tab
7. Click "Generate new private key" 
8. Download the JSON file
9. Copy the following values from the JSON:

**Environment Variables**:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=private_key_id_from_json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nprivate_key_from_json\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=client_id_from_json
```

**Additional Setup**:
- Enable Cloud Messaging API in Google Cloud Console
- For web apps, you'll also need Web API Key from Project Settings > General

**Pricing**: Free tier includes unlimited notifications.

---

### 4. Web Push VAPID Keys

**No signup required** - Generate using Node.js

**Steps to generate**:
1. Install web-push globally:
```bash
npm install -g web-push
```

2. Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

3. Copy the output:

**Environment Variables**:
```env
VAPID_PUBLIC_KEY=BKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_SUBJECT=mailto:admin@yourcompany.com
```

---

### 5. Alternative SMS Providers (Optional)

#### AWS SNS
**Website**: https://aws.amazon.com/sns/

**Steps**:
1. Create AWS account at https://aws.amazon.com/
2. Go to IAM Console: https://console.aws.amazon.com/iam/
3. Create new user with SNS permissions
4. Generate access keys

**Environment Variables**:
```env
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
```

#### Nexmo/Vonage
**Website**: https://www.vonage.com/

**Steps**:
1. Sign up at https://www.vonage.com/
2. Go to Dashboard and find API credentials

**Environment Variables**:
```env
NEXMO_API_KEY=xxxxxxxx
NEXMO_API_SECRET=xxxxxxxxxxxxxxxx
NEXMO_FROM_NUMBER=12345
```

---

## 🛠️ Quick Setup Instructions

1. **Copy the environment file**:
```bash
cd backend
cp .env.example .env
```

2. **Edit the .env file** with your actual API keys from above

3. **Install dependencies** (if not already done):
```bash
npm install twilio @sendgrid/mail firebase-admin web-push
```

4. **Test the setup**:
```bash
npm run dev
```

5. **Test notifications** using the provided test endpoints

---

## 🧪 Testing Your Setup

Once you have your API keys configured, you can test each service:

### Test SMS (Twilio):
```bash
curl -X POST http://localhost:3001/api/test/sms \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890", "message": "Test SMS from Rockfall System"}'
```

### Test Email (SendGrid):
```bash
curl -X POST http://localhost:3001/api/test/email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "subject": "Test Alert", "message": "Test email from Rockfall System"}'
```

### Test Push Notification:
```bash
curl -X POST http://localhost:3001/api/test/push \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "test-device", "title": "Test Alert", "body": "Test push notification"}'
```

---

## 💰 Cost Estimates

- **Twilio SMS**: ~$0.0075 per SMS (free $15 credit)
- **SendGrid Email**: Free up to 100 emails/day
- **Firebase Push**: Free unlimited notifications
- **Web Push**: Free (no external service)

**Monthly estimate for 1000 miners, 10 alerts/month**:
- SMS: ~$75/month (10,000 messages)
- Email: Free (under 100/day limit) or $19.95/month
- Push: Free
- **Total**: ~$75-95/month

---

## 🔒 Security Notes

1. **Never commit .env files** to version control
2. **Use environment-specific files** (.env.production, .env.development)
3. **Rotate API keys regularly**
4. **Use restricted permissions** when possible
5. **Monitor usage** to detect unauthorized access

---

## 🆘 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify API key format and permissions
3. Test each service individually
4. Check service status pages for outages
5. Contact support for each service if needed

---

**Need help?** Create an issue in the repository with:
- Error messages
- Service that's failing
- Steps you've tried
- Environment (development/production)