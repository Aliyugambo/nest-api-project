// chat.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

import { UsersService } from '../users/users.service';
import { logger } from '../helpers/logger';

// WebSocket API Documentation (for Swagger UI):
//
// WebSocket URL: ws://localhost:3000
//
// Events:
// - register: { token }
// - privateMessage: { to, message }
// - groupMessage: { group, message }
// - joinGroup: { group }
// - leaveGroup: { group }
// - fetchPrivateHistory: { recipient }
// - fetchGroupHistory: { group }
//
// See REST API docs for authentication and user management.
//
// You can use browser clients or Socket.IO tools to interact with these events.

@WebSocketGateway({ cors: true })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly usersService: UsersService) {}
  private users: Map<string, Set<string>> = new Map(); // userId -> Set<socket.id>
  private groups: Map<string, Set<string>> = new Map(); // groupName -> Set<socket.id>

  private server: Server;

  afterInit(server: Server) {
    this.server = server;
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    logger.info(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    logger.info(`Client disconnected: ${client.id}`);
    for (const [userId, socketSet] of this.users.entries()) {
      if (socketSet.has(client.id)) {
        socketSet.delete(client.id);
        logger.info(`Removed socket ${client.id} from user ${userId}`);
        if (socketSet.size === 0) {
          this.users.delete(userId);
          logger.info(`No more sockets for user ${userId}, entry deleted.`);
        }
        break;
      }
    }
  }

  @SubscribeMessage('register')
  async handleRegister(
    @MessageBody() data: { token: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const decoded: any = jwt.verify(data.token, process.env.JWT_SECRET);
      client.data.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
      if (!this.users.has(decoded.sub)) {
        this.users.set(decoded.sub, new Set());
      }
      this.users.get(decoded.sub).add(client.id);
      logger.info(`User registered: ${decoded.sub} with socket ${client.id}`);
      // Debug: print all user->socket mappings
      for (const [uid, sockets] of this.users.entries()) {
        logger.info(`User ${uid} sockets: ${Array.from(sockets)}`);
      }
      client.emit('registered', { userId: decoded.sub });
    } catch (err) {
      logger.error('JWT validation failed:', err.message);
      client.emit('error', { message: 'Invalid token' });
      client.disconnect();
    }
  }

  @SubscribeMessage('fetchPrivateHistory')
  async handleFetchPrivateHistory(
    @MessageBody() data: { recipient: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { recipient } = data;
    const messages = await this.usersService.getPrivateMessageHistory(
      client.data.user.id,
      recipient,
    );
    client.emit('privateHistory', messages);
  }

  @SubscribeMessage('fetchGroupHistory')
  async handleFetchGroupHistory(
    @MessageBody() data: { group: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { group } = data;
    const messages = await this.usersService.getGroupMessageHistory(group);
    client.emit('groupHistory', messages);
  }

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    @MessageBody() data: { to: string; from: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { to, message } = data;
    await this.usersService.savePrivateMessage(
      client.data.user.id,
      to,
      message,
    );
    const receiverSockets = this.users.get(to);
    logger.info(
      'Sending private message from',
      client.data.user.id,
      'to',
      to,
      'receiverSockets:',
      receiverSockets ? Array.from(receiverSockets) : 'none',
      'senderSocket:',
      client.id,
    );
    if (receiverSockets && receiverSockets.size > 0) {
      for (const socketId of receiverSockets) {
        this.server.to(socketId).emit('privateMessage', {
          from: client.data.user.id,
          message,
        });
      }
    } else {
      logger.warn(`No active sockets for user ${to}`);
    }
  }

  @SubscribeMessage('joinGroup')
  handleJoinGroup(
    @MessageBody() data: { group: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.group);
    if (!this.groups.has(data.group)) this.groups.set(data.group, new Set());
    this.groups.get(data.group).add(client.id);
    client.emit('joinedGroup', { group: data.group });
  }

  @SubscribeMessage('leaveGroup')
  handleLeaveGroup(
    @MessageBody() data: { group: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.group);
    this.groups.get(data.group)?.delete(client.id);
    client.emit('leftGroup', { group: data.group });
  }

  @SubscribeMessage('groupMessage')
  async handleGroupMessage(
    @MessageBody() data: { group: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { group, message } = data;
    await this.usersService.saveGroupMessage(
      group,
      client.data.user.id,
      message,
    );
    this.server
      .to(group)
      .emit('groupMessage', { sender: client.data.user.id, message });
  }
}
