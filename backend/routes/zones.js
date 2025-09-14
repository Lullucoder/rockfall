const express = require('express');
const router = express.Router();
const { createZone, getZones, getZoneById } = require('../database/supabase');

// Create a new zone
router.post('/', async (req, res) => {
  try {
    console.log('🏔️ Zone creation request:', req.body);
    
    const zone = await createZone(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Zone created successfully',
      data: zone
    });
  } catch (error) {
    console.error('❌ Zone creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create zone',
      error: error.message
    });
  }
});

// Get all zones
router.get('/', async (req, res) => {
  try {
    const zones = await getZones();
    
    res.json({
      success: true,
      data: zones,
      count: zones.length
    });
  } catch (error) {
    console.error('❌ Get zones error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch zones',
      error: error.message
    });
  }
});

// Get zone by ID
router.get('/:zoneId', async (req, res) => {
  try {
    const zone = await getZoneById(req.params.zoneId);
    
    res.json({
      success: true,
      data: zone
    });
  } catch (error) {
    console.error('❌ Get zone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch zone',
      error: error.message
    });
  }
});

module.exports = router;