-- Rockfall Alert System Database Schema for Supabase
-- Execute this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'operator', 'user')),
  organization TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Mining zones table
CREATE TABLE IF NOT EXISTS zones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  coordinates GEOMETRY(POLYGON, 4326) NOT NULL,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  max_capacity INTEGER DEFAULT 100,
  current_occupancy INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL CHECK (device_type IN ('android', 'ios', 'web')),
  device_token TEXT,
  fcm_token TEXT,
  device_info JSONB DEFAULT '{}',
  location GEOMETRY(POINT, 4326),
  zone_id UUID REFERENCES zones(id),
  is_active BOOLEAN DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notification_settings JSONB DEFAULT '{
    "sms": true,
    "email": true,
    "push": true,
    "vibration": true,
    "sound": true
  }',
  emergency_contacts JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensor data table
CREATE TABLE IF NOT EXISTS sensor_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  zone_id UUID REFERENCES zones(id) ON DELETE CASCADE,
  sensor_type TEXT NOT NULL,
  location GEOMETRY(POINT, 4326),
  readings JSONB NOT NULL,
  risk_score DECIMAL(3,1),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  zone_id UUID REFERENCES zones(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('rockfall', 'landslide', 'seismic', 'weather', 'emergency')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'critical', 'emergency')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  location GEOMETRY(POINT, 4326),
  affected_radius DECIMAL(10,2) DEFAULT 1000,
  risk_score DECIMAL(3,1),
  is_active BOOLEAN DEFAULT true,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert deliveries table
CREATE TABLE IF NOT EXISTS alert_deliveries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('sms', 'email', 'push', 'web_push')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'acknowledged')),
  delivered_at TIMESTAMP WITH TIME ZONE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency events table
CREATE TABLE IF NOT EXISTS emergency_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  event_type TEXT DEFAULT 'sos' CHECK (event_type IN ('sos', 'panic', 'medical', 'evacuation')),
  location GEOMETRY(POINT, 4326),
  message TEXT,
  voice_note_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_alarm')),
  responder_id UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_zone_id ON devices(zone_id);
CREATE INDEX IF NOT EXISTS idx_devices_active ON devices(is_active);
CREATE INDEX IF NOT EXISTS idx_sensor_data_zone_timestamp ON sensor_data(zone_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_zone_active ON alerts(zone_id, is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alert_deliveries_alert_device ON alert_deliveries(alert_id, device_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_user ON emergency_events(user_id);

-- Spatial indexes
CREATE INDEX IF NOT EXISTS idx_zones_coordinates ON zones USING GIST(coordinates);
CREATE INDEX IF NOT EXISTS idx_devices_location ON devices USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_sensor_data_location ON sensor_data USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_alerts_location ON alerts USING GIST(location);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view zones" ON zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage zones" ON zones FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view own devices" ON devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own devices" ON devices FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view alerts in their zones" ON alerts FOR SELECT USING (
  EXISTS (SELECT 1 FROM devices WHERE user_id = auth.uid() AND zone_id = alerts.zone_id)
);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample zones for testing
INSERT INTO zones (name, description, coordinates, risk_level, max_capacity) VALUES
(
  'Zone Alpha',
  'Main mining area with high activity',
  ST_GeomFromText('POLYGON((77.2 28.6, 77.3 28.6, 77.3 28.7, 77.2 28.7, 77.2 28.6))', 4326),
  'moderate',
  50
),
(
  'Zone Beta',
  'Secondary mining area',
  ST_GeomFromText('POLYGON((77.4 28.6, 77.5 28.6, 77.5 28.7, 77.4 28.7, 77.4 28.6))', 4326),
  'low',
  30
),
(
  'Zone Gamma',
  'High-risk mining zone',
  ST_GeomFromText('POLYGON((77.6 28.6, 77.7 28.6, 77.7 28.7, 77.6 28.7, 77.6 28.6))', 4326),
  'high',
  20
);

-- Create a test alert
INSERT INTO alerts (alert_type, severity, title, message, zone_id, risk_score, metadata) 
SELECT 
  'rockfall',
  'moderate',
  'Test Alert',
  'This is a test alert for the system',
  id,
  6.5,
  '{"test": true}'
FROM zones 
WHERE name = 'Zone Alpha' 
LIMIT 1;

-- Display success message
SELECT 'Database schema created successfully! ✅' as status;