import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { query } from '../db/database';
import { encrypt, decrypt } from '../common/encryption.util';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // ============================================
  // CONNECTION
  // ============================================
  handleConnection(client: Socket) {
    console.log('\n✅ User connected:', client.id);
    console.log('\nROOMS:', Array.from(client.rooms));
  }

  handleDisconnect(client: Socket) {
    console.log('\n❌ User disconnected:', client.id);
  }

  // ============================================
  // JOIN PRIVATE ROOM
  // Each user joins a room named by their userId so we can target
  // them directly without broadcasting.
  // ============================================
  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = String(userId).trim();
    client.join(roomId);

    console.log(`\n✅ User ${roomId} joined private room`);
  }

  // ============================================
  // JOIN GROUP ROOM
  // ============================================
  @SubscribeMessage('joinGroup')
  handleJoinGroup(
    @MessageBody() data: { roomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = String(data.roomId).trim();
    client.join(roomId);

    console.log(`\n✅ User ${data.userId} joined group ${roomId}`);
  }

  // ============================================
  // PRIVATE MESSAGE
  // ============================================
  
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (!data?.senderId || !data?.receiverId || !data?.content) {
        console.log('\n❌ Invalid message:', data);
        return;
      }

      const message = {
        messageId: data.messageId || `msg_${Date.now()}`,
        senderId: String(data.senderId),
        receiverId: String(data.receiverId),
        content: data.content,      // plaintext – sent over wire
        type: data.type || 'text',
        replyToMsgId: data.replyToMsgId || null,
        timestamp: new Date(),
        status: 'sent',
      };

      console.log('📨 Sending message:', message);

      // ============================================
      // CHECK RECEIVER ONLINE
      // ============================================
      const sockets = await this.server.in(message.receiverId).fetchSockets();
      const isOnline = sockets.length > 0;

      if (isOnline) {
        // SEND TO RECEIVER
        this.server.to(message.receiverId).emit('receiveMessage', message);
        message.status = 'delivered';
        console.log('📤 Delivered to receiver:', message.receiverId);
      } else {
        console.log('⚠ Receiver offline');
      }

      // ============================================
      // STATUS: DELIVERED (ONLY TO SENDER)
      // ============================================
      client.emit('statusUpdate', {
        messageId: message.messageId,
        status: message.status, // 'sent' or 'delivered'
      });

       // Persist encrypted copy to DB
      await this.savePrivateMessageToDB(message);
    } catch (err) {
      console.error('\nsendMessage error:', err);
    }
  }

  // ============================================
  // GROUP MESSAGE
  // ============================================
  @SubscribeMessage('sendGroupMessage')
  async handleGroupMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (!data?.roomId || !data?.senderId || !data?.content) {
        console.log('❌ Invalid group message:', data);
        return;
      }

      const groupMessage = {
        messageId: data.messageId || `gmsg_${Date.now()}`,
        roomId: String(data.roomId),
        senderId: String(data.senderId),
        content: data.content,
        type: data.type || 'text',
        replyToMsgId: data.replyToMsgId || null,
        timestamp: new Date(),
        status: 'delivered',
      };

      console.log('📨 Group message:', groupMessage);

      // Send to everyone except the sender
      client.to(groupMessage.roomId).emit('receiveGroupMessage', groupMessage);

      // ACK sender
      client.emit('statusUpdate', {
        messageId: groupMessage.messageId,
        status: 'delivered',
      });

      await this.saveGroupMessageToDB(groupMessage);
    } catch (err) {
      console.error('\n❌ sendGroupMessage error:', err);
    }
  }

  // ============================================
  // READ RECIEPT
  // ============================================
  @SubscribeMessage('messageRead')
  async handleRead(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket,
  ) {
    if (!data?.messageId || !data?.senderId) return;
    console.log('\n👁 Read receipt for:', data.messageId);

    // ONLY SEND TO ORIGINAL SENDER
    this.server.to(String(data.senderId)).emit('statusUpdate', {
      messageId: data.messageId,
      status: 'read',
    });

    // Update DB status to 'read'
    await this.updateMessageStatus(data.messageId, 'read');
  }

  // ============================================
  // RECEIVER ACK (optional fallback)
  // ============================================
  @SubscribeMessage('messageReceived')
  handleMessageReceived(@MessageBody() data: any) {
    if (!data?.messageId || !data?.senderId) return;

    this.server.to(String(data.senderId)).emit('statusUpdate', {
      messageId: data.messageId,
      status: 'seen',
    });
  }

  // ============================================================
  // TYPING INDICATOR
  // ============================================================

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { roomId: string; userId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.roomId).emit('typingStatus', {
      userId: data.userId,
      isTyping: data.isTyping,
    });
  }


// ============================================================
  // DB HELPERS
  // ============================================================
  private normalizeMessageType(type: string): string {
  const validTypes = ['text', 'media', 'meeting_link', 'system', 'file', 'pdf', 'image', 'video', 'doc', 'docx', 'txt', 'xlsx', 'ppt', 'pptx'];
  if (validTypes.includes(type)) return type;
  return 'text';
}

  private async savePrivateMessageToDB(msg: any): Promise<void> {
    try {
      const roomId = await this.findOrCreateDirectRoom(
        Number(msg.senderId),
        Number(msg.receiverId),
      );

      // Encrypt before storing
      const encryptedContent = encrypt(msg.content);

      await query(
        `INSERT INTO chat_messages
           (uuid, room_id, sender_id, reply_to_msg_id, message_type, content, status, sent_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())`,
        [
          roomId,
          Number(msg.senderId),
          msg.replyToMsgId || null,
          this.normalizeMessageType(msg.type),
          encryptedContent,
          msg.status,
        ],
      );
      console.log('💾 Private message saved (encrypted)');

      await query(
      `INSERT INTO notifications
         (uuid, recipient_id, notification_type, related_room_id, title, content, is_read, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, FALSE, NOW())`,
      [
        Number(msg.receiverId),
        msg.type === 'text' ? 'new_message' : 'file_shared',
        roomId,
        `New message from User ${msg.senderId}`,
        msg.type === 'text'
          ? String(msg.content).substring(0, 100)
          : '📎 Sent a file',
      ],
    );
    console.log('🔔 Notification saved for receiver');
    } catch (err) {
      console.error('[DB] savePrivateMessageToDB error:', err);
    }
  }

  private async saveGroupMessageToDB(msg: any): Promise<void> {
    try {
      // For group messages, roomId is already the chat_rooms.id
      const encryptedContent = encrypt(msg.content);

      await query(
        `INSERT INTO chat_messages
           (uuid, room_id, sender_id, reply_to_msg_id, message_type, content, status, sent_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())`,
        [
          Number(msg.roomId),
          Number(msg.senderId),
          msg.replyToMsgId || null,
          this.normalizeMessageType(msg.type),
          encryptedContent,
          msg.status,
        ],
      );
      console.log('💾 Group message saved (encrypted)');

      // Get all room members except sender to notify them
const { rows: members } = await query(
  `SELECT user_id FROM chat_room_members 
   WHERE room_id = $1 AND user_id != $2 AND is_active = TRUE`,
  [msg.roomId, Number(msg.senderId)],
);

// Insert a notification for each member
for (const member of members) {
  await query(
    `INSERT INTO notifications
       (uuid, recipient_id, notification_type, related_room_id, title, content, is_read, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, FALSE, NOW())`,
    [
      member.user_id,
      msg.type === 'text' ? 'group_update' : 'file_shared',
      msg.roomId,
      `Group message`,
      msg.type === 'text' ? msg.content.substring(0, 100) : '📎 File shared in group',
    ],
  );
}
    } catch (err) {
      console.error('[DB] saveGroupMessageToDB error:', err);
    }
  }

  private async updateMessageStatus(
    messageId: string,
    status: string,
  ): Promise<void> {
    try {
      // messageId from frontend is the uuid field
      await query(
        `UPDATE chat_messages SET status = $1 WHERE uuid::text = $2`,
        [status, messageId],
      );
    } catch (err) {
      console.error('[DB] updateMessageStatus error:', err);
    }
  }

  /**
   * Finds an existing direct room for two users or creates one.
   * Returns the room's integer id.
   */
  private async findOrCreateDirectRoom(
    userA: number,
    userB: number,
  ): Promise<number> {
    // Look for an existing direct room both users share
    const existing = await query(
      `SELECT cr.id
         FROM chat_rooms cr
         JOIN chat_room_members m1 ON m1.room_id = cr.id AND m1.user_id = $1
         JOIN chat_room_members m2 ON m2.room_id = cr.id AND m2.user_id = $2
        WHERE cr.room_type = 'direct'
          AND cr.is_active = TRUE
        LIMIT 1`,
      [userA, userB],
    );

    if (existing.rows.length > 0) {
      return existing.rows[0].id;
    }

    // Create a new direct room
    const newRoom = await query(
      `INSERT INTO chat_rooms (uuid, room_type, created_by)
       VALUES (gen_random_uuid(), 'direct', $1)
       RETURNING id`,
      [userA],
    );
    const roomId = newRoom.rows[0].id;

    // Add both members
    await query(
      `INSERT INTO chat_room_members (uuid, room_id, user_id, member_role)
       VALUES (gen_random_uuid(), $1, $2, 'member'),
              (gen_random_uuid(), $1, $3, 'member')`,
      [roomId, userA, userB],
    );

    console.log(`💾 Created new direct room ${roomId} for users ${userA} & ${userB}`);
    return roomId;
  }
}
