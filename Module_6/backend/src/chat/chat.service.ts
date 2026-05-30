import { Injectable } from '@nestjs/common';
import { query } from '../db/database';
import { decrypt } from '../common/encryption.util';

@Injectable()
export class ChatService {
  async getUserRooms(userId: number) {
    const { rows } = await query(
      `SELECT
         cr.id             AS room_id,
         cr.uuid           AS room_uuid,
         cr.room_type,
         cr.room_name,
         cr.created_at,
         crm.member_role,
         ou.id             AS other_user_id,
         ou.display_name   AS other_user_name,
         op.headline       AS other_user_role,
         op.profile_image_url AS other_user_avatar,
         op.availability_status AS other_user_status,
         lm.content        AS last_message_encrypted,
         lm.sent_at        AS last_message_at,
         lm.sender_id      AS last_sender_id,
         lm.message_type   AS last_message_type,
         (SELECT COUNT(*) FROM chat_messages um
          WHERE um.room_id = cr.id AND um.sender_id != $1
            AND um.sent_at > COALESCE(crm.last_read_at, '1970-01-01')
            AND um.is_deleted = FALSE) AS unread_count,
         (SELECT COUNT(*) FROM chat_room_members gm
          WHERE gm.room_id = cr.id AND gm.is_active = TRUE) AS member_count,
         (SELECT json_agg(json_build_object('id', mu.id, 'name', mu.display_name, 'role', gm2.member_role))
          FROM chat_room_members gm2 JOIN users mu ON mu.id = gm2.user_id
          WHERE gm2.room_id = cr.id AND gm2.is_active = TRUE) AS members
       FROM chat_rooms cr
       JOIN chat_room_members crm ON crm.room_id = cr.id AND crm.user_id = $1
       LEFT JOIN chat_room_members ocrm ON ocrm.room_id = cr.id AND ocrm.user_id != $1 AND cr.room_type = 'direct'
       LEFT JOIN users ou ON ou.id = ocrm.user_id
       LEFT JOIN profiles op ON op.user_id = ou.id
       LEFT JOIN LATERAL (
         SELECT content, sent_at, sender_id, message_type FROM chat_messages
         WHERE room_id = cr.id AND is_deleted = FALSE ORDER BY sent_at DESC LIMIT 1
       ) lm ON TRUE
       WHERE cr.is_active = TRUE AND crm.is_active = TRUE AND cr.deleted_at IS NULL
       ORDER BY lm.sent_at DESC NULLS LAST`,
      [userId],
    );
    return rows.map((row) => ({
      room_id: row.room_id,
      room_uuid: row.room_uuid,
      room_type: row.room_type,
      room_name: row.room_type === 'direct' ? row.other_user_name : row.room_name,
      member_role: row.member_role,
      other_user_id: row.other_user_id,
      other_user_role: row.other_user_role,
      other_user_avatar: row.other_user_avatar,
      online: row.other_user_status === 'available',
      member_count: Number(row.member_count),
      members: row.members || [],
      last_message: row.last_message_encrypted ? this.safeDecrypt(row.last_message_encrypted) : null,
      last_message_type: row.last_message_type,
      last_message_at: row.last_message_at,
      unread_count: Number(row.unread_count),
    }));
  }

  async getMessages(roomId: number, limit = 50, offset = 0) {
    const { rows } = await query(
      `SELECT cm.id, cm.uuid, cm.sender_id, u.display_name AS sender_name,
         cm.reply_to_msg_id, parent.content AS reply_to_content_encrypted,
         pu.display_name AS reply_to_sender_name, cm.message_type, cm.content,
         cm.status, cm.is_edited, cm.edited_at, cm.is_deleted, cm.sent_at,
         mf.storage_url AS file_url, mf.file_name, mf.file_type, mf.file_size_bytes,
         ml.meeting_url, ml.platform AS meeting_platform, ml.scheduled_at AS meeting_scheduled_at
       FROM chat_messages cm
       JOIN users u ON u.id = cm.sender_id
       LEFT JOIN chat_messages parent ON parent.id = cm.reply_to_msg_id
       LEFT JOIN users pu ON pu.id = parent.sender_id
       LEFT JOIN chat_media_files mf ON mf.id = cm.media_id
       LEFT JOIN chat_meeting_links ml ON ml.id = cm.meeting_link_id
       WHERE cm.room_id = $1 AND cm.is_deleted = FALSE
       ORDER BY cm.sent_at ASC LIMIT $2 OFFSET $3`,
      [roomId, limit, offset],
    );
    return rows.map((row) => ({
      ...row,
      content: row.content ? this.safeDecrypt(row.content) : null,
      reply_to_content: row.reply_to_content_encrypted ? this.safeDecrypt(row.reply_to_content_encrypted) : null,
    }));
  }

  async markRoomRead(roomId: number, userId: number) {
    await query(`UPDATE chat_room_members SET last_read_at = NOW() WHERE room_id = $1 AND user_id = $2`, [roomId, userId]);
    await query(`UPDATE chat_messages SET status = 'read' WHERE room_id = $1 AND sender_id != $2 AND status != 'read'`, [roomId, userId]);
    return { success: true };
  }

  async getSharedFiles(roomId: number) {
    const { rows } = await query(
      `SELECT mf.id, mf.uuid, mf.file_name AS name, mf.file_type AS type,
         mf.file_size_bytes, mf.storage_url AS url, mf.thumbnail_url,
         u.display_name AS sender, mf.uploaded_at,
         CASE
           WHEN mf.uploaded_at > NOW() - INTERVAL '1 hour' THEN EXTRACT(MINUTE FROM NOW()-mf.uploaded_at)::text || 'm ago'
           WHEN mf.uploaded_at > NOW() - INTERVAL '24 hours' THEN EXTRACT(HOUR FROM NOW()-mf.uploaded_at)::text || 'h ago'
           WHEN mf.uploaded_at > NOW() - INTERVAL '7 days' THEN EXTRACT(DAY FROM NOW()-mf.uploaded_at)::text || 'd ago'
           ELSE TO_CHAR(mf.uploaded_at, 'Mon DD')
         END AS time_ago
       FROM chat_media_files mf JOIN users u ON u.id = mf.uploader_id
       WHERE mf.room_id = $1 AND mf.is_deleted = FALSE ORDER BY mf.uploaded_at DESC`,
      [roomId],
    );
    const icons: Record<string,string> = { image:'image', video:'video_file', pdf:'picture_as_pdf', doc:'description', other:'attach_file' };
    const colors: Record<string,string> = { image:'#405f91', video:'#264778', pdf:'#ba1a1a', doc:'#264778', other:'#515f74' };
    const bgs: Record<string,string> = { image:'#d6e3ff', video:'#e7eeff', pdf:'#ffdad6', doc:'#e7eeff', other:'#dee8ff' };
    return rows.map((f) => ({
      ...f,
      size: this.formatBytes(f.file_size_bytes),
      icon: icons[f.type] || 'attach_file',
      color: colors[f.type] || '#515f74',
      bg: bgs[f.type] || '#dee8ff',
      time: f.time_ago,
    }));
  }

  async getChatStats(userId: number) {
    const { rows } = await query(
      `SELECT
         (SELECT COUNT(DISTINCT room_id) FROM chat_room_members WHERE user_id=$1 AND is_active=TRUE) AS active_chats,
         (SELECT COUNT(*) FROM chat_messages cm JOIN chat_room_members crm ON crm.room_id=cm.room_id AND crm.user_id=$1
          WHERE cm.sender_id!=$1 AND cm.sent_at > COALESCE(crm.last_read_at,'1970-01-01') AND cm.is_deleted=FALSE) AS unread_messages,
         (SELECT COUNT(*) FROM chat_media_files mf JOIN chat_room_members crm ON crm.room_id=mf.room_id AND crm.user_id=$1 WHERE mf.is_deleted=FALSE) AS files_shared,
         (SELECT COUNT(*) FROM chat_meeting_links ml JOIN chat_room_members crm ON crm.room_id=ml.room_id AND crm.user_id=$1 WHERE ml.is_expired=FALSE) AS meetings`,
      [userId],
    );
    return rows[0];
  }

  async getMeetings(userId: number) {
    const { rows } = await query(
      `SELECT ml.id, ml.uuid, ml.platform, ml.meeting_url, ml.meeting_id, ml.passcode,
         ml.scheduled_at, ml.duration_minutes, ml.is_expired, ml.created_at,
         cr.room_name, u.display_name AS created_by_name,
         CASE
           WHEN ml.is_expired=TRUE THEN 'completed'
           WHEN ml.scheduled_at IS NULL THEN 'upcoming'
           WHEN ml.scheduled_at > NOW() + INTERVAL '24 hours' THEN 'scheduled'
           WHEN ml.scheduled_at > NOW() THEN 'upcoming'
           ELSE 'completed'
         END AS status,
         (SELECT json_agg(SUBSTRING(mu.first_name,1,1)||SUBSTRING(mu.last_name,1,1))
          FROM chat_room_members gm JOIN users mu ON mu.id=gm.user_id
          WHERE gm.room_id=ml.room_id AND gm.is_active=TRUE LIMIT 4) AS participants
       FROM chat_meeting_links ml
       JOIN chat_rooms cr ON cr.id=ml.room_id
       JOIN users u ON u.id=ml.created_by
       JOIN chat_room_members crm ON crm.room_id=ml.room_id AND crm.user_id=$1
       ORDER BY ml.scheduled_at DESC NULLS LAST`,
      [userId],
    );
    return rows.map((m) => ({
      ...m,
      title: m.title || m.room_name || `${m.platform} Meeting`,
      date: m.scheduled_at ? this.formatMeetingDate(new Date(m.scheduled_at)) : 'Instant',
      time: m.scheduled_at ? new Date(m.scheduled_at).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}) : '',
      link: m.meeting_url,
      participants: m.participants || [],
    }));
  }

  async createRoom(name: string, memberIds: number[], createdBy: number) {
  // Create the room
  const { rows } = await query(
    `INSERT INTO chat_rooms (uuid, room_type, room_name, created_by, is_active)
     VALUES (gen_random_uuid(), 'group', $1, $2, TRUE)
     RETURNING id, uuid, room_name`,
    [name, createdBy],
  );
  const room = rows[0];

  // Add creator + all selected members
  const allMembers = [...new Set([createdBy, ...memberIds])];
  for (const userId of allMembers) {
    await query(
      `INSERT INTO chat_room_members (uuid, room_id, user_id, member_role)
       VALUES (gen_random_uuid(), $1, $2, $3)
       ON CONFLICT (room_id, user_id) DO NOTHING`,
      [room.id, userId, userId === createdBy ? 'admin' : 'member'],
    );
  }

  return {
    room_id: room.id,
    room_uuid: room.uuid,
    room_name: room.room_name,
    room_type: 'group',
    member_count: allMembers.length,
    members: allMembers,
    unread_count: 0,
    last_message: null,
    last_message_at: null,
  };
}

  private safeDecrypt(c: string): string {
    try { return decrypt(c); } catch { return c; }
  }

  private formatBytes(b: number): string {
    if (!b) return '0 B';
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${(b/1024).toFixed(0)} KB`;
    return `${(b/1048576).toFixed(1)} MB`;
  }

  private formatMeetingDate(d: Date): string {
    const now = new Date();
    const tom = new Date(now); tom.setDate(tom.getDate()+1);
    if (d.toDateString()===now.toDateString()) return 'Today';
    if (d.toDateString()===tom.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  }
}
