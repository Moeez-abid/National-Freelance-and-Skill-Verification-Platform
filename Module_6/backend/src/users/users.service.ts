import { Injectable } from '@nestjs/common';
import { query } from '../db/database';

@Injectable()
export class UsersService {
  /**
   * Returns all users with their profile info.
   * Used for the contacts/new message list.
   */
  async getAllUsers() {
    const { rows } = await query(
      `SELECT
         u.id,
         u.uuid,
         u.first_name,
         u.last_name,
         u.display_name,
         u.email,
         p.headline      AS role,
         p.profile_image_url,
         p.availability_status,
         u.account_status
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.deleted_at IS NULL
         AND u.account_status = 'active'
       ORDER BY u.first_name ASC`,
    );
    return rows;
  }

  /**
   * Returns a single user by id with full profile.
   */
  async getUserById(id: number) {
    const { rows } = await query(
      `SELECT
         u.id,
         u.uuid,
         u.first_name,
         u.last_name,
         u.display_name,
         u.email,
         p.headline          AS role,
         p.bio,
         p.location,
         p.profile_image_url,
         p.availability_status,
         p.hourly_rate,
         p.trust_score,
         p.average_rating,
         p.total_reviews
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = $1
         AND u.deleted_at IS NULL`,
      [id],
    );
    return rows[0] || null;
  }

  /**
   * Returns all users except the requesting user.
   * Used to show who you can start a chat with.
   */
  async getContacts(currentUserId: number) {
    const { rows } = await query(
      `SELECT
         u.id,
         u.uuid,
         u.display_name,
         u.email,
         p.headline          AS role,
         p.profile_image_url,
         p.availability_status
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id != $1
         AND u.deleted_at IS NULL
         AND u.account_status = 'active'
       ORDER BY u.first_name ASC`,
      [currentUserId],
    );
    return rows;
  }
}
