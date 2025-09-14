// API service for backend integration
const API_BASE_URL = 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface Device {
  id?: string;
  miner_name: string;
  miner_id: string;
  phone_number: string;
  email: string;
  zone_assignment: string;
  device_type: 'android' | 'ios' | 'web';
  is_active: boolean;
  preferences?: {
    enablePushNotifications?: boolean;
    enableSMS?: boolean;
    enableEmail?: boolean;
    enableVibration?: boolean;
    minimumSeverity?: 'low' | 'medium' | 'high' | 'critical';
    quietHours?: { start: string; end: string };
  };
}

interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  preferences?: {
    enableSMS: boolean;
    enableEmail: boolean;
    enablePush: boolean;
    alertFrequency: string;
  };
}

interface AlertDeliveryStatus {
  id: string;
  alert_id: string;
  device_id: string;
  channel: 'push' | 'sms' | 'email';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  delivery_attempts: number;
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'demo-api-key',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          message: data.message
        };
      }

      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // Device management
  async registerDevice(device: Omit<Device, 'id'>): Promise<ApiResponse<Device>> {
    return this.request<Device>('/devices', {
      method: 'POST',
      body: JSON.stringify(device)
    });
  }

  async getDevices(): Promise<ApiResponse<Device[]>> {
    const resp = await this.request<Device[]>('/devices');
    if (resp.success) {
      const dataAny: any = resp.data as any;
      // Some backend shapes might return a single object or wrap in {devices:[]}
      let list: any = Array.isArray(dataAny) ? dataAny : (dataAny?.devices || dataAny?.data || dataAny);
      if (!Array.isArray(list)) {
        list = list ? [list] : [];
      }
      return { success: true, data: list };
    }
    return resp;
  }

  async updateDevice(id: string, updates: Partial<Device>): Promise<ApiResponse<Device>> {
    return this.request<Device>(`/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteDevice(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/devices/${id}`, {
      method: 'DELETE'
    });
  }

  // User management
  async registerUser(user: Omit<User, 'id'>): Promise<ApiResponse<User>> {
    return this.request<User>('/users/register', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/users');
  }

  // Alert delivery status
  async getAlertDeliveryStatus(alertId: string): Promise<ApiResponse<{ alertId: string; deliveryStatuses: AlertDeliveryStatus[]; total: number }>> {
    return this.request(`/alerts/${alertId}/delivery-status`);
  }

  async getAllDeliveryStatuses(): Promise<ApiResponse<AlertDeliveryStatus[]>> {
    return this.request<AlertDeliveryStatus[]>('/alerts/delivery-status/all');
  }

  // Test endpoints
  async testAlert(deviceId?: string): Promise<ApiResponse<{ deliveries: any[] }>> {
    const endpoint = deviceId ? `/alerts/test?deviceId=${deviceId}` : '/alerts/test';
    return this.request(endpoint, { method: 'POST' });
  }

  async testEmergencyAlert(): Promise<ApiResponse<{ deliveries: any[] }>> {
    return this.request('/alerts/simulate-emergency', { method: 'POST' });
  }
}

export const apiService = new ApiService();
export type { Device, User, AlertDeliveryStatus, ApiResponse };