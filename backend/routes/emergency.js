const express = require('express');
const router = express.Router();
const { createEmergencyEvent } = require('../database/supabase');

// Create an emergency SOS event
router.post('/sos', async (req, res) => {
  try {
    console.log('🆘 Emergency SOS request:', req.body);
    
    const emergency = await createEmergencyEvent({
      eventType: 'sos',
      userId: req.body.userId,
      deviceId: req.body.deviceId,
      location: req.body.location,
      message: req.body.message || 'Emergency SOS activated',
      voiceNoteUrl: req.body.voiceNoteUrl,
      metadata: req.body.metadata || {}
    });
    
    // TODO: Trigger emergency notifications
    console.log('🚨 Emergency event created, triggering notifications...');
    
    res.status(201).json({
      success: true,
      message: 'Emergency SOS event created successfully',
      emergencyId: emergency.id,
      data: emergency
    });
  } catch (error) {
    console.error('❌ Emergency SOS creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create emergency SOS event',
      error: error.message
    });
  }
});

// Create a panic alert
router.post('/panic', async (req, res) => {
  try {
    console.log('😱 Panic alert request:', req.body);
    
    const emergency = await createEmergencyEvent({
      eventType: 'panic',
      userId: req.body.userId,
      deviceId: req.body.deviceId,
      location: req.body.location,
      message: req.body.message || 'Panic alert activated',
      metadata: req.body.metadata || {}
    });
    
    res.status(201).json({
      success: true,
      message: 'Panic alert created successfully',
      emergencyId: emergency.id,
      data: emergency
    });
  } catch (error) {
    console.error('❌ Panic alert creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create panic alert',
      error: error.message
    });
  }
});

// Create a medical emergency
router.post('/medical', async (req, res) => {
  try {
    console.log('🏥 Medical emergency request:', req.body);
    
    const emergency = await createEmergencyEvent({
      eventType: 'medical',
      userId: req.body.userId,
      deviceId: req.body.deviceId,
      location: req.body.location,
      message: req.body.message || 'Medical emergency reported',
      metadata: req.body.metadata || {}
    });
    
    res.status(201).json({
      success: true,
      message: 'Medical emergency created successfully',
      emergencyId: emergency.id,
      data: emergency
    });
  } catch (error) {
    console.error('❌ Medical emergency creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create medical emergency',
      error: error.message
    });
  }
});

module.exports = router;