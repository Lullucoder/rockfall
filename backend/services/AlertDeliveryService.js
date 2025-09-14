const twilio = require('twilio');
const sgMail = require('@sendgrid/mail');

class AlertDeliveryService {
  constructor() {
    this.initializeServices();
  }

  initializeServices() {
    // Initialize Twilio
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      this.twilioFromNumber = process.env.TWILIO_PHONE_NUMBER;
      console.log('✅ Twilio SMS service initialized');
    } else {
      console.log('⚠️ Twilio credentials missing - SMS disabled');
    }

    // Initialize SendGrid
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.sendGridFromEmail = process.env.SENDGRID_FROM_EMAIL || 'alerts@rockfall.system';
      this.sendGridFromName = process.env.SENDGRID_FROM_NAME || 'Rockfall Alert System';
      console.log('✅ SendGrid email service initialized');
    } else {
      console.log('⚠️ SendGrid API key missing - Email disabled');
    }
  }

  async sendSMS(phoneNumber, message) {
    if (!this.twilioClient) {
      throw new Error('SMS service not available - Twilio not configured');
    }

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.twilioFromNumber,
        to: phoneNumber
      });

      console.log(`📱 SMS sent successfully to ${phoneNumber}, SID: ${result.sid}`);
      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        to: phoneNumber
      };
    } catch (error) {
      console.error(`❌ SMS failed to ${phoneNumber}:`, error.message);
      return {
        success: false,
        error: error.message,
        to: phoneNumber
      };
    }
  }

  async sendEmail(emailAddress, subject, message) {
    if (!sgMail) {
      throw new Error('Email service not available - SendGrid not configured');
    }

    try {
      const msg = {
        to: emailAddress,
        from: {
          email: this.sendGridFromEmail,
          name: this.sendGridFromName
        },
        subject: subject,
        text: message,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">🚨 ROCKFALL ALERT</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <p style="font-size: 16px; line-height: 1.5; color: #333;">
                ${message.replace(/\n/g, '<br>')}
              </p>
              <div style="margin-top: 20px; padding: 15px; background: #fff; border-left: 4px solid #dc2626;">
                <strong>⚠️ This is an automated safety alert. Please respond according to your emergency procedures.</strong>
              </div>
            </div>
            <div style="padding: 10px; text-align: center; font-size: 12px; color: #666;">
              Rockfall Alert System - ${new Date().toLocaleString()}
            </div>
          </div>
        `
      };

      const result = await sgMail.send(msg);
      console.log(`📧 Email sent successfully to ${emailAddress}`);
      return {
        success: true,
        messageId: result[0].headers['x-message-id'],
        to: emailAddress
      };
    } catch (error) {
      console.error(`❌ Email failed to ${emailAddress}:`, error.message);
      return {
        success: false,
        error: error.message,
        to: emailAddress
      };
    }
  }

  async sendAlertToContact(contact, alertData) {
    const { name, phone, email, preferences } = contact;
    const { title, message, severity, location } = alertData;
    
    const alertMessage = `
🚨 ROCKFALL ALERT - ${severity.toUpperCase()}

${title}

${message}

Location: ${location || 'Not specified'}
Time: ${new Date().toLocaleString()}

Please follow emergency procedures immediately.
    `.trim();

    const results = {
      contact: { name, phone, email },
      sms: null,
      email: null
    };

    // Send SMS if phone number exists and SMS is enabled
    if (phone && preferences.enableSMS !== false) {
      results.sms = await this.sendSMS(phone, alertMessage);
    }

    // Send Email if email exists and email is enabled
    if (email && preferences.enableEmail !== false) {
      results.email = await this.sendEmail(
        email, 
        `🚨 ROCKFALL ALERT - ${severity.toUpperCase()} - ${title}`,
        alertMessage
      );
    }

    return results;
  }

  async sendAlertToAllContacts(contacts, alertData) {
    console.log(`🔔 Sending alert to ${contacts.length} contacts...`);
    
    const deliveryResults = [];
    
    for (const contact of contacts) {
      try {
        const result = await this.sendAlertToContact(contact, alertData);
        deliveryResults.push(result);
      } catch (error) {
        console.error(`❌ Failed to send alert to ${contact.name}:`, error);
        deliveryResults.push({
          contact,
          sms: { success: false, error: error.message },
          email: { success: false, error: error.message }
        });
      }
    }

    const summary = {
      total: contacts.length,
      sms_sent: deliveryResults.filter(r => r.sms?.success).length,
      email_sent: deliveryResults.filter(r => r.email?.success).length,
      sms_failed: deliveryResults.filter(r => r.sms && !r.sms.success).length,
      email_failed: deliveryResults.filter(r => r.email && !r.email.success).length
    };

    console.log(`📊 Alert delivery summary:`, summary);
    
    return {
      summary,
      results: deliveryResults
    };
  }

  // Test alert functionality
  async sendTestAlert(specificContact = null) {
    const testAlertData = {
      title: 'System Test Alert',
      message: 'This is a test of the Rockfall Alert System. All systems are functioning normally.',
      severity: 'medium',
      location: 'Test Zone',
      type: 'test'
    };

    if (specificContact) {
      return await this.sendAlertToContact(specificContact, testAlertData);
    } else {
      const localDB = require('../storage/localDB');
      const contacts = localDB.getAllContacts();
      return await this.sendAlertToAllContacts(contacts, testAlertData);
    }
  }

  // Risk-based alert triggering
  async checkRiskScoreAndAlert(riskScore, location, zoneData = {}) {
    const highRiskThreshold = parseFloat(process.env.RISK_THRESHOLD_HIGH) || 7.5;
    const criticalRiskThreshold = parseFloat(process.env.RISK_THRESHOLD_CRITICAL) || 8.5;
    const emergencyRiskThreshold = parseFloat(process.env.RISK_THRESHOLD_EMERGENCY) || 9.0;

    if (riskScore < highRiskThreshold) {
      return null; // No alert needed
    }

    let severity, title, message;
    
    if (riskScore >= emergencyRiskThreshold) {
      severity = 'critical';
      title = 'EMERGENCY: Immediate Evacuation Required';
      message = `CRITICAL ROCKFALL RISK DETECTED (Score: ${riskScore.toFixed(1)})

EVACUATE THE AREA IMMEDIATELY!

All personnel must leave the zone and report to the designated safe area. Do not return until given the all-clear signal.`;
    } else if (riskScore >= criticalRiskThreshold) {
      severity = 'high';
      title = 'HIGH RISK: Rockfall Warning';
      message = `HIGH ROCKFALL RISK DETECTED (Score: ${riskScore.toFixed(1)})

Immediate caution required. Consider evacuation procedures and monitor conditions closely.`;
    } else {
      severity = 'medium';
      title = 'Elevated Rockfall Risk';
      message = `ELEVATED ROCKFALL RISK DETECTED (Score: ${riskScore.toFixed(1)})

Please exercise increased caution and monitor conditions in the area.`;
    }

    const alertData = {
      title,
      message,
      severity,
      location,
      riskScore,
      zoneData,
      type: 'risk_alert'
    };

    // Save alert to local storage
    const localDB = require('../storage/localDB');
    const savedAlert = localDB.saveAlert(alertData);

    // Send to all contacts
    const contacts = localDB.getAllContacts();
    const deliveryResults = await this.sendAlertToAllContacts(contacts, alertData);

    return {
      alert: savedAlert,
      delivery: deliveryResults
    };
  }
}

module.exports = new AlertDeliveryService();