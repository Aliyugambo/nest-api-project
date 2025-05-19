// import {
//   WebSocketGateway,
//   WebSocketServer,
//   SubscribeMessage,
//   MessageBody,
//   ConnectedSocket,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { JwtStrategy } from '../auth/jwt.strategy';
// import { UsersService } from './users.service';

// @WebSocketGateway({
//   namespace: 'users',
//   cors: {
//     origin: '*', // Allow all origins for testing; restrict in production
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// })
// export class UsersGateway {
//   constructor(
//     private readonly usersService: UsersService,
//     private readonly jwtStrategy: JwtStrategy, // Inject JwtStrategy
//   ) {}

//   @WebSocketServer()
//   server: Server;

//   async handleConnection(client: Socket) {
//     console.log('Client attempting to connect:', client.id);
//     try {
//       const token = JwtStrategy.extractJwtFromSocket(client);
//       console.log('Extracted token:', token);
//       if (!token) {
//         console.error('Token not found for client:', client.id);
//         throw new Error('Token not found');
//       }

//       const payload = await this.jwtStrategy.validate(token);
//       console.log('Token payload:', payload);
//       client.data.user = payload;
//       console.log('Client authenticated successfully:', payload);
//     } catch (error) {
//       console.error('Connection error for client:', client.id, error.message);
//       client.disconnect();
//     }
//   }

//   handleDisconnect(client: Socket) {
//     console.log(`Client disconnected: ${client.id}`);
//     // Add any cleanup logic here if needed
//   }

//   @SubscribeMessage('fetchPrivateHistory')
//   async handleFetchPrivateHistory(
//     @MessageBody() data: { recipient: string },
//     @ConnectedSocket() client: Socket,
//   ) {
//     const { recipient } = data;
//     const messages = await this.usersService.getPrivateMessageHistory(
//       client.data.user.id,
//       recipient,
//     );
//     client.emit('privateHistory', messages);
//   }

//   @SubscribeMessage('fetchGroupHistory')
//   async handleFetchGroupHistory(
//     @MessageBody() data: { group: string },
//     @ConnectedSocket() client: Socket,
//   ) {
//     const { group } = data;
//     const messages = await this.usersService.getGroupMessageHistory(group);
//     client.emit('groupHistory', messages);
//   }

//   @SubscribeMessage('message')
//   async handleMessage(
//     @MessageBody() data: { sender: string; recipient: string; message: string },
//     @ConnectedSocket() client: Socket,
//   ) {
//     const { recipient, message } = data;
//     await this.usersService.savePrivateMessage(
//       client.data.user.id,
//       recipient,
//       message,
//     );
//     this.server
//       .to(recipient)
//       .emit('message', { sender: client.data.user.id, message });
//   }

//   @SubscribeMessage('joinGroup')
//   handleJoinGroup(
//     @MessageBody() group: string,
//     @ConnectedSocket() client: Socket,
//   ) {
//     client.join(group);
//     this.server
//       .to(group)
//       .emit('notification', `${client.id} joined the group.`);
//   }

//   @SubscribeMessage('leaveGroup')
//   handleLeaveGroup(
//     @MessageBody() group: string,
//     @ConnectedSocket() client: Socket,
//   ) {
//     client.leave(group);
//     this.server.to(group).emit('notification', `${client.id} left the group.`);
//   }

//   @SubscribeMessage('groupMessage')
//   async handleGroupMessage(
//     @MessageBody() data: { group: string; message: string },
//     @ConnectedSocket() client: Socket,
//   ) {
//     const { group, message } = data;
//     await this.usersService.saveGroupMessage(
//       group,
//       client.data.user.id,
//       message,
//     );
//     this.server
//       .to(group)
//       .emit('groupMessage', { sender: client.data.user.id, message });
//   }
// }
