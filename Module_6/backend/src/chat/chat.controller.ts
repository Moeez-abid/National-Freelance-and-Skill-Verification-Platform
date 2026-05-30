import { Controller, Get, Post, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

/**
 * HTTP endpoints for chat data.
 * WebSocket events are handled in ChatGateway.
 */
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * GET /chat/rooms/:userId
   * Returns all rooms for a user with unread counts and last message preview.
   */
  @Get('rooms/:userId')
  getUserRooms(@Param('userId', ParseIntPipe) userId: number) {
    return this.chatService.getUserRooms(userId);
  }

  /**
   * GET /chat/messages/:roomId
   * Returns decrypted message history for a room.
   */
  @Get('messages/:roomId')
  getMessages(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.chatService.getMessages(
      roomId,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  /**
   * POST /chat/read
   * Marks all messages in a room as read for a user.
   * Body: { roomId: number, userId: number }
   */
  @Post('read')
  markRead(@Body() body: { roomId: number; userId: number }) {
    return this.chatService.markRoomRead(body.roomId, body.userId);
  }

  @Get('files/:roomId')
  getSharedFiles(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.chatService.getSharedFiles(roomId);
  }

  @Get('stats/:userId')
  getStats(@Param('userId', ParseIntPipe) userId: number) {
    return this.chatService.getChatStats(userId);
  }

  @Get('meetings/:userId')
  getMeetings(@Param('userId', ParseIntPipe) userId: number) {
    return this.chatService.getMeetings(userId);
  }

  @Post('rooms')
createRoom(@Body() body: { name: string; memberIds: number[]; createdBy: number }) {
  return this.chatService.createRoom(body.name, body.memberIds, body.createdBy);
}
}
