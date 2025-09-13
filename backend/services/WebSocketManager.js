const WebSocket = require('ws');

class WebSocketManager {
  constructor() {
    this.wss = null;
    this.clients = new Set();
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ server });
    
    this.wss.on('connection', (ws, req) => {
      console.log('🔌 WebSocket client connected from:', req.socket.remoteAddress);
      this.clients.add(ws);

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to Rockfall Alert System',
        timestamp: new Date().toISOString()
      }));

      // Handle messages from client
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('📨 WebSocket message received:', data.type);
          
          // Handle different message types
          switch (data.type) {
            case 'subscribe':
              this.handleSubscription(ws, data);
              break;
            case 'ping':
              ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
              break;
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        console.log('🔌 WebSocket client disconnected');
        this.clients.delete(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    console.log('🌐 WebSocket server initialized');
  }

  handleSubscription(ws, data) {
    // Store subscription preferences on the WebSocket instance
    ws.subscriptions = ws.subscriptions || {};
    ws.subscriptions[data.topic] = true;
    
    console.log('📡 Client subscribed to:', data.topic);
    
    ws.send(JSON.stringify({
      type: 'subscription-confirmed',
      topic: data.topic,
      timestamp: new Date().toISOString()
    }));
  }

  broadcast(type, data) {
    const message = JSON.stringify({
      type,
      data,
      timestamp: new Date().toISOString()
    });

    let activeClients = 0;
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        activeClients++;
      } else {
        // Remove dead connections
        this.clients.delete(client);
      }
    });

    console.log(`📡 Broadcasted ${type} to ${activeClients} clients`);
    return activeClients;
  }

  sendToSubscribers(topic, type, data) {
    const message = JSON.stringify({
      type,
      topic,
      data,
      timestamp: new Date().toISOString()
    });

    let sentCount = 0;
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && 
          client.subscriptions && 
          client.subscriptions[topic]) {
        client.send(message);
        sentCount++;
      }
    });

    console.log(`📡 Sent ${type} to ${sentCount} subscribers of ${topic}`);
    return sentCount;
  }

  getStats() {
    const activeClients = Array.from(this.clients).filter(
      client => client.readyState === WebSocket.OPEN
    ).length;

    return {
      totalClients: this.clients.size,
      activeClients,
      topics: this.getActiveTopics()
    };
  }

  getActiveTopics() {
    const topics = new Set();
    this.clients.forEach(client => {
      if (client.subscriptions) {
        Object.keys(client.subscriptions).forEach(topic => topics.add(topic));
      }
    });
    return Array.from(topics);
  }

  close() {
    if (this.wss) {
      this.wss.close();
      console.log('🌐 WebSocket server closed');
    }
  }
}

module.exports = { WebSocketManager };