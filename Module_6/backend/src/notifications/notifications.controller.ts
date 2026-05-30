import { Controller, Get, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /notifications/:userId
   * Returns all notifications for a user, newest first.
   */
  @Get(':userId')
  getNotifications(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationsService.getNotifications(userId);
  }

  /**
   * PATCH /notifications/:userId/read-all
   * Marks all notifications as read for a user.
   */
  @Patch(':userId/read-all')
  markAllRead(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationsService.markAllRead(userId);
  }

  /**
   * PATCH /notifications/:id/read
   * Marks a single notification as read.
   */
  @Patch(':id/read')
  markOneRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markOneRead(id);
  }

  @Patch('room/:roomId/user/:userId/read-all')
  markRoomRead(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
  return this.notificationsService.markRoomNotifsRead(roomId, userId);
  }

}
