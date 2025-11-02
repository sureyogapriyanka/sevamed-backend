const WebSocket = require('ws');
const Message = require('../models/Message');

class WebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server, path: '/ws' }); // Specify the path
        this.clients = new Map(); // Map to store connected clients with their user info

        this.initialize();
    }

    initialize() {
        this.wss.on('connection', (ws, req) => {
            console.log('New WebSocket connection established');

            // Handle incoming messages
            ws.on('message', async (message) => {
                try {
                    const data = JSON.parse(message);

                    switch (data.type) {
                        case 'auth':
                            // Store user info with the WebSocket connection
                            this.clients.set(ws, {
                                userId: data.userId,
                                role: data.role,
                                connectedAt: new Date()
                            });
                            console.log(`User ${data.userId} authenticated as ${data.role}`);
                            break;

                        case 'chat_message':
                            // Save message to database
                            try {
                                const messageDoc = new Message({
                                    senderId: data.senderId,
                                    receiverId: data.receiverId,
                                    content: data.content,
                                    messageType: data.messageType || 'direct'
                                });
                                await messageDoc.save();
                                console.log('Message saved to database');
                            } catch (saveError) {
                                console.error('Error saving message to database:', saveError);
                            }

                            // Broadcast chat message to recipient
                            this.broadcastToUser(data.receiverId, {
                                type: 'new_message',
                                message: data
                            });
                            break;

                        case 'admin_broadcast':
                            // Save broadcast message to database
                            try {
                                const messageDoc = new Message({
                                    senderId: data.senderId,
                                    receiverId: null, // Broadcast message
                                    content: data.content,
                                    messageType: 'broadcast'
                                });
                                await messageDoc.save();
                                console.log('Broadcast message saved to database');
                            } catch (saveError) {
                                console.error('Error saving broadcast message to database:', saveError);
                            }

                            // Broadcast admin message to specified recipients
                            if (data.recipients && Array.isArray(data.recipients)) {
                                data.recipients.forEach(recipient => {
                                    this.broadcastToRole(recipient, {
                                        type: 'admin_broadcast',
                                        ...data
                                    });
                                });
                            }
                            break;

                        default:
                            console.log('Unknown message type:', data.type);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            });

            // Handle connection close
            ws.on('close', () => {
                console.log('WebSocket connection closed');
                this.clients.delete(ws);
            });

            // Handle errors
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });
        });
    }

    // Broadcast message to a specific user
    broadcastToUser(userId, message) {
        this.clients.forEach((userInfo, ws) => {
            if (userInfo.userId === userId && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
            }
        });
    }

    // Broadcast message to users with a specific role
    broadcastToRole(role, message) {
        this.clients.forEach((userInfo, ws) => {
            if ((userInfo.role === role || role === 'all') && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
            }
        });
    }

    // Broadcast to all connected clients
    broadcast(message) {
        this.wss.clients.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
            }
        });
    }

    // Get connected clients count
    getConnectedClientsCount() {
        return this.clients.size;
    }
}

module.exports = WebSocketServer;