import { Injectable } from '@nestjs/common';
import { query } from '../db/database';

@Injectable()
export class NotificationsService {
  async getNotifications(userId: number) {
    const { rows } = await query(
      `SELECT
         n.id,
         n.uuid,
         n.notification_type  AS type,
         n.title,
         n.content            AS body,
         n.is_read            AS read,
         n.related_room_id,
         n.related_message_id,
         n.action_url,
         n.created_at,
         n.expires_at,
         -- Time ago string computed in SQL
         CASE
           WHEN n.created_at > NOW() - INTERVAL '1 minute'  THEN 'Just now'
           WHEN n.created_at > NOW() - INTERVAL '1 hour'
             THEN EXTRACT(MINUTE FROM NOW() - n.created_at)::text || ' min ago'
           WHEN n.created_at > NOW() - INTERVAL '24 hours'
             THEN EXTRACT(HOUR FROM NOW() - n.created_at)::text || ' hours ago'
           ELSE TO_CHAR(n.created_at, 'Mon DD')
         END AS time_ago
       FROM notifications n
       WHERE n.recipient_id = $1
         AND (n.expires_at IS NULL OR n.expires_at > NOW())
       ORDER BY n.created_at DESC
       LIMIT 100`,
      [userId],
    );

    // Map notification_type to icon and colors for the frontend
    return rows.map((n) => ({
      ...n,
      icon: this.getIcon(n.type),
      color: this.getColor(n.type),
      bg: this.getBg(n.type),
      time: n.time_ago,
    }));
  }

  async markAllRead(userId: number) {
    await query(
      `UPDATE notifications
          SET is_read = TRUE, read_at = NOW()
        WHERE recipient_id = $1 AND is_read = FALSE`,
      [userId],
    );
    return { success: true };
  }

  async markOneRead(id: number) {
    await query(
      `UPDATE notifications
          SET is_read = TRUE, read_at = NOW()
        WHERE id = $1`,
      [id],
    );
    return { success: true };
  }

  async markRoomNotifsRead(roomId: number, userId: number) {
  await query(
    `UPDATE notifications
        SET is_read = TRUE, read_at = NOW()
      WHERE recipient_id = $1
        AND related_room_id = $2
        AND is_read = FALSE`,
    [userId, roomId],
  );
  return { success: true };
}

  private getIcon(type: string): string {
    const map: Record<string, string> = {
      new_message: 'chat',
      group_update: 'group',
      meeting: 'video_call',
      file_shared: 'upload_file',
      system: 'info',
    };
    return map[type] || 'notifications';
  }

  private getColor(type: string): string {
    const map: Record<string, string> = {
      new_message: '#405f91',
      group_update: '#264778',
      meeting: '#2ca397',
      file_shared: '#515f74',
      system: '#405f91',
    };
    return map[type] || '#405f91';
  }

  private getBg(type: string): string {
    const map: Record<string, string> = {
      new_message: '#d6e3ff',
      group_update: '#e7eeff',
      meeting: '#e7fffe',
      file_shared: '#dee8ff',
      system: '#d6e3ff',
    };
    return map[type] || '#d6e3ff';
  }
}
