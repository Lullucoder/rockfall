const express = require('express');
const router = express.Router();
const { 
  createUser, 
  getUserById, 
  updateUser, 
  getAllUsers,
  getUsersByZone,
  deleteUser 
} = require('../database/supabase');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      role = 'worker',
      zone_id,
      notification_preferences,
      preferences, // alias from frontend
      emergency_contact_name,
      emergency_contact_phone
    } = req.body;

    // Normalize notification preferences accepting multiple input shapes
    let normalizedPrefs = notification_preferences || preferences || {};
    // If using enableSMS / enableEmail / enablePush convert them
    if (Object.keys(normalizedPrefs).some(k => k.startsWith('enable'))) {
      normalizedPrefs = {
        sms: normalizedPrefs.enableSMS !== undefined ? normalizedPrefs.enableSMS : true,
        email: normalizedPrefs.enableEmail !== undefined ? normalizedPrefs.enableEmail : true,
        push: normalizedPrefs.enablePush !== undefined ? normalizedPrefs.enablePush : true
      };
    } else {
      // Ensure defaults
      normalizedPrefs = {
        sms: normalizedPrefs.sms !== undefined ? normalizedPrefs.sms : true,
        email: normalizedPrefs.email !== undefined ? normalizedPrefs.email : true,
        push: normalizedPrefs.push !== undefined ? normalizedPrefs.push : true
      };
    }

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and phone are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate phone format (international format)
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone format. Use international format (+1234567890)'
      });
    }

    // Create user object
    const userData = {
      name,
      email: email.toLowerCase(),
      phone: phone.replace(/\s/g, ''), // Remove spaces
      role,
      zone_id,
  notification_preferences: normalizedPrefs,
      emergency_contact_name,
      emergency_contact_phone: emergency_contact_phone?.replace(/\s/g, ''),
      status: 'active',
      last_location: null
    };

    console.log(`📝 Registering new user: ${name} (${email})`);
    
    const user = await createUser(userData);
    
    console.log(`✅ User registered successfully: ${user.id}`);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        zone_id: user.zone_id,
        notification_preferences: user.notification_preferences,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('❌ User registration error:', error);
    
    // Handle duplicate email/phone
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message
    });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const { zone_id, role, status } = req.query;
    
    let users;
    if (zone_id) {
      users = await getUsersByZone(zone_id);
    } else {
      users = await getAllUsers();
    }
    
    // Filter by role if specified
    if (role) {
      users = users.filter(user => user.role === role);
    }
    
    // Filter by status if specified
    if (status) {
      users = users.filter(user => user.status === status);
    }
    
    res.json({
      success: true,
      data: users,
      count: users.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await getUserById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updates.id;
    delete updates.created_at;
    delete updates.updated_at;
    
    const user = await updateUser(id, updates);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log(`✅ User updated: ${user.id} - ${user.name}`);
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
    
  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// Update user notification preferences
router.patch('/:id/notifications', async (req, res) => {
  try {
    const { id } = req.params;
    const { notification_preferences } = req.body;
    
    if (!notification_preferences) {
      return res.status(400).json({
        success: false,
        message: 'notification_preferences is required'
      });
    }
    
    const user = await updateUser(id, { notification_preferences });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log(`🔔 Notification preferences updated for user: ${user.id}`);
    
    res.json({
      success: true,
      message: 'Notification preferences updated',
      data: {
        id: user.id,
        notification_preferences: user.notification_preferences
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message
    });
  }
});

// Delete user (soft delete by setting status to 'inactive')
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;
    
    if (permanent === 'true') {
      // Permanent deletion
      await deleteUser(id);
      console.log(`🗑️ User permanently deleted: ${id}`);
      
      res.json({
        success: true,
        message: 'User permanently deleted'
      });
    } else {
      // Soft delete
      const user = await updateUser(id, { status: 'inactive' });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      console.log(`📴 User deactivated: ${user.id} - ${user.name}`);
      
      res.json({
        success: true,
        message: 'User deactivated successfully',
        data: user
      });
    }
    
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

module.exports = router;