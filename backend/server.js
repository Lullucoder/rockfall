const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
require('dotenv').config();

// Import our modules
const { initializeDatabase } = require('./database/db');
const alertRoutes = require('./routes/alerts');
const deviceRoutes = require('./routes/devices');
const simulationRoutes = require('./routes/simulation');
const testRoutes = require('./routes/test');
const emergencyRoutes = require('./routes/emergency');
const zonesRoutes = require('./routes/zones');
const { AlertProcessor } = require('./services/AlertProcessor');
const { RealTimeNotificationService } = require('./services/NotificationService');
const { WebSocketManager } = require('./services/WebSocketManager');

const app = express();
const server = http.createServer(app);

// Initialize services
const alertProcessor = new AlertProcessor();
const notificationService = new RealTimeNotificationService();
const wsManager = new WebSocketManager(server);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API key authentication middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Valid API key required' 
    });
  }
  
  next();
};

// Apply API key auth to protected routes
app.use('/api/alerts', authenticateApiKey);
app.use('/api/devices', authenticateApiKey);
app.use('/api/users', authenticateApiKey);
app.use('/api/simulation', authenticateApiKey);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV 
  });
});

// Routes
app.use('/api/alerts', alertRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/users', require('./routes/users')); // User registration and management
app.use('/api/simulation', simulationRoutes);
app.use('/api/test', testRoutes); // Test routes for validating notification services
app.use('/api/emergency', emergencyRoutes); // Emergency SOS routes
app.use('/api/zones', zonesRoutes); // Zone management routes

// Real-time alert monitoring endpoint
app.post('/api/monitor/risk-assessment', authenticateApiKey, async (req, res) => {
  try {
    const { zoneData, riskScores } = req.body;
    
    console.log('🔍 Monitoring risk assessment:', {
      zones: Object.keys(zoneData || {}),
      maxRisk: Math.max(...Object.values(riskScores || {}))
    });

    // Process risk data and trigger alerts if necessary
    const alertResults = await alertProcessor.processRiskData(zoneData, riskScores);
    
    // Broadcast to connected clients
    wsManager.broadcast('risk-update', {
      zoneData,
      riskScores,
      alertResults,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      processed: alertResults.length,
      alerts: alertResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Risk assessment error:', error);
    res.status(500).json({
      error: 'Risk assessment failed',
      message: error.message
    });
  }
});

// Manual alert testing endpoint
app.post('/api/alerts/test', authenticateApiKey, async (req, res) => {
  try {
    const { 
      alertType = 'test',
      severity = 'medium',
      zoneName = 'Test Zone',
      message = 'This is a test alert from the system',
      deviceIds = []
    } = req.body;

    console.log('🧪 Manual alert test requested:', { alertType, severity, zoneName });

    const testAlert = {
      id: `test-${Date.now()}`,
      zoneName,
      severity,
      message,
      timestamp: new Date().toISOString(),
      type: 'manual-test',
      riskScore: severity === 'critical' ? 95 : severity === 'high' ? 80 : 60
    };

    // Send test alert
    const deliveryResults = await notificationService.sendAlert(testAlert, deviceIds);

    // Broadcast test result
    wsManager.broadcast('test-alert', {
      alert: testAlert,
      deliveryResults,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      alert: testAlert,
      deliveryResults,
      message: 'Test alert sent successfully'
    });

  } catch (error) {
    console.error('❌ Test alert error:', error);
    res.status(500).json({
      error: 'Test alert failed',
      message: error.message
    });
  }
});

// Simulate emergency alert endpoint
app.post('/api/alerts/simulate-emergency', authenticateApiKey, async (req, res) => {
  try {
    const { zoneName = 'Simulation Zone', scenario = 'rockfall' } = req.body;

    console.log('🚨 Emergency simulation requested:', { zoneName, scenario });

    const emergencyAlert = {
      id: `emergency-${Date.now()}`,
      zoneName,
      severity: 'critical',
      message: `EMERGENCY SIMULATION: ${scenario} detected in ${zoneName}. This is a drill - follow emergency procedures.`,
      timestamp: new Date().toISOString(),
      type: 'emergency-simulation',
      riskScore: 98,
      timeToEvent: '5-10 minutes',
      recommendedActions: [
        'IMMEDIATE EVACUATION of all personnel',
        'Establish safety perimeter',
        'Contact emergency services',
        'Deploy emergency response team'
      ]
    };

    // Send to all registered devices (emergency broadcasts to everyone)
    const deliveryResults = await notificationService.sendEmergencyAlert(emergencyAlert);

    // Broadcast emergency simulation
    wsManager.broadcast('emergency-simulation', {
      alert: emergencyAlert,
      deliveryResults,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      alert: emergencyAlert,
      deliveryResults,
      message: 'Emergency simulation executed successfully'
    });

  } catch (error) {
    console.error('❌ Emergency simulation error:', error);
    res.status(500).json({
      error: 'Emergency simulation failed',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting Rockfall Backend Server...');
    
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized');

    // Initialize notification service
    await notificationService.initialize();
    console.log('✅ Notification service initialized');

    // Test Supabase connection
    console.log('🔗 Testing Supabase connection...');
    const { testConnection } = require('./database/supabase');
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Supabase connection successful!');
      
      // Setup real-time subscriptions
      console.log('🔔 Setting up Supabase real-time subscriptions...');
      const { subscribeToAlerts, subscribeToEmergencyEvents } = require('./database/supabase');
      
      // Subscribe to new alerts
      subscribeToAlerts(async (payload) => {
        console.log('📢 New alert received via real-time:', payload.new);
        // TODO: Process the alert through AlertProcessor
      });

      // Subscribe to emergency events
      subscribeToEmergencyEvents(async (payload) => {
        console.log('🚨 Emergency event received via real-time:', payload.new);
        // TODO: Handle emergency event
      });
      
      console.log('✅ Real-time subscriptions setup complete');
    } else {
      console.error('❌ Supabase connection failed - check your configuration');
    }

    // Start server
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔌 WebSocket server ready`);
      console.log(`🔐 API authentication required (x-api-key header)`);
      console.log(`🎯 Environment: ${process.env.NODE_ENV}`);
    });

    // Handle graceful shutdown
    const allowSigintExit = process.env.ALLOW_SIGINT_EXIT !== 'false';
    process.on('SIGINT', () => {
      if (!allowSigintExit) {
        console.log('\n⚠️ SIGINT received but ALLOW_SIGINT_EXIT=false so keeping server alive');
        return; 
      }
      console.log('\n🛑 Shutting down server...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('unhandledRejection', (reason) => {
      console.error('🚨 Unhandled Rejection:', reason);
    });
    process.on('uncaughtException', (err) => {
      console.error('🚨 Uncaught Exception:', err);
    });

    // Debug schema endpoint
    app.get('/debug/schema', async (req, res) => {
      try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = require('./database/supabase').supabase || createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
        const tables = ['users','devices'];
        const results = {};
        for (const t of tables) {
          const { data, error } = await supabase.rpc('introspect_table_columns', { tbl: t }).catch(()=>({ error: 'function_missing'}));
          if (error === 'function_missing') {
            // fallback query via REST not possible here. Provide guidance.
            results[t] = { error: 'introspection function missing' };
          } else if (error) {
            results[t] = { error: error.message };
          } else {
            results[t] = data;
          }
        }
        res.json({ success: true, hint: 'If results empty, run SQL: SELECT column_name,data_type FROM information_schema.columns WHERE table_name=...;', results });
      } catch (e) {
        res.status(500).json({ success:false, error: e.message });
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;