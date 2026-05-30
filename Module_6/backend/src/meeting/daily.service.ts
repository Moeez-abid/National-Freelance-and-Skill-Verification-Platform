import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DailyService {

  private get apiKey(): string {
    const key = process.env.DAILY_API_KEY;
    if (!key) throw new Error('DAILY_API_KEY is not set in .env');
    return key;
  }

  private get domain(): string {
    return process.env.DAILY_DOMAIN || '';
  }

  async createMeeting(title: string) {
    try {
      const response = await axios.post(
        'https://api.daily.co/v1/rooms',
        {
          name: `meeting-${Date.now()}`,
          properties: {
            enable_chat: true,
            enable_screenshare: true,
            start_video_off: false,
            start_audio_off: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const { id, url } = response.data;

      // Persist the meeting link to the database
      // NOTE: room_id must be a valid chat_rooms.id in production.
      // Here we use a placeholder; wire up proper room resolution as needed.
      await this.saveMeetingLinkToDB({ id, url, title });

      return { id, url };
    } catch (error) {
      console.error('[Meeting] Failed to create meeting:', error);
      throw new Error('Failed to create meeting');
    }
  }

  private async saveMeetingLinkToDB(meeting: {
    id: string;
    url: string;
    title: string;
  }) {
    // Dynamic import to avoid circular deps
    const { query } = await import('../db/database.js');
    try {
      await query(
  `INSERT INTO chat_meeting_links
     (uuid, created_by, room_id, platform, meeting_url, meeting_id, title, scheduled_at, duration_minutes, created_at)
   VALUES (gen_random_uuid(), 1, 1, 'jitsi', $1, $2, $3, $4, $5, NOW())
   ON CONFLICT DO NOTHING`,
  [meeting.url, meeting.id, meeting.title],
);
    } catch (err) {
      // Non-fatal – the meeting was created; only logging failed
      console.error('[DB] Failed to save meeting link:', err);
    }
  }
}