import React, { useState } from 'react';
import { Bell, BellRing, BellOff, Loader2, ShieldCheck } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

interface Props {
  backendUrl: string;
  apiKey?: string;
  deviceId?: string; // Optional link to registered miner device
}

export const PushNotificationSetup: React.FC<Props> = ({ backendUrl, apiKey, deviceId }) => {
  const { supported, permission, subscribed, loading, error, subscribe, unsubscribe } = usePushNotifications(backendUrl, apiKey, deviceId);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${subscribed ? 'bg-green-100' : 'bg-blue-100'}`}> 
          {subscribed ? <BellRing className="h-5 w-5 text-green-600" /> : <Bell className="h-5 w-5 text-blue-600" />}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Push Notifications</h3>
          <p className="text-sm text-gray-600">Enable real-time rockfall alerts with vibration patterns.</p>
        </div>
        {subscribed && (
          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 font-medium">Active</span>
        )}
      </div>

      {!supported && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          Your browser does not support Service Workers / Push API.
        </div>
      )}

      {supported && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 text-sm">
              <div><strong>Permission:</strong> {permission}</div>
              <div><strong>Status:</strong> {subscribed ? 'Subscribed' : 'Not subscribed'}</div>
            </div>
            {!subscribed ? (
              <button
                onClick={() => subscribe()}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
                Enable
              </button>
            ) : (
              <button
                onClick={() => unsubscribe()}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellOff className="h-4 w-4" />}
                Disable
              </button>
            )}
          </div>

          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">{error}</div>
          )}

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-blue-600 hover:underline"
          >
            {showDetails ? 'Hide details' : 'Show technical details'}
          </button>

          {showDetails && (
            <div className="p-3 bg-gray-50 rounded text-xs space-y-2">
              <div className="flex items-center gap-2"><ShieldCheck className="h-3 w-3 text-gray-500" /> Uses VAPID secure push</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Subscriptions are unique per browser/device</li>
                <li>Vibration patterns depend on severity</li>
                <li>You can revoke permission in browser settings</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
