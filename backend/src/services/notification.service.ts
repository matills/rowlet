import { supabase } from '../config/supabase';
import logger from '../config/logger';
import {
  Notification,
  NotificationPreferences,
  CreateNotificationDTO,
  UpdateNotificationPreferencesDTO,
  GetNotificationsQuery,
  NotificationType,
} from '../types/notification.types';

export class NotificationService {
  async createNotification(dto: CreateNotificationDTO): Promise<Notification> {
    const preferences = await this.getPreferences(dto.user_id);

    const preferenceKey = dto.type as keyof NotificationPreferences;
    if (preferences && preferences[preferenceKey] === false) {
      logger.info(`User ${dto.user_id} has disabled notifications of type ${dto.type}`);
      throw new Error('User has disabled this notification type');
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: dto.user_id,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating notification:', error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    return data as Notification;
  }

  async getNotifications(userId: string, query: GetNotificationsQuery = {}): Promise<{
    notifications: Notification[];
    total: number;
  }> {
    const { limit = 20, offset = 0, is_read, type } = query;

    let dbQuery = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (is_read !== undefined) {
      dbQuery = dbQuery.eq('is_read', is_read);
    }

    if (type) {
      dbQuery = dbQuery.eq('type', type);
    }

    const { data, error, count } = await dbQuery;

    if (error) {
      logger.error('Error fetching notifications:', error);
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    return {
      notifications: (data || []) as Notification[],
      total: count || 0,
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_unread_notification_count', {
      p_user_id: userId,
    });

    if (error) {
      logger.error('Error getting unread count:', error);
      throw new Error(`Failed to get unread count: ${error.message}`);
    }

    return data as number;
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      logger.error('Error marking notification as read:', error);
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      logger.error('Error marking all notifications as read:', error);
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      logger.error('Error deleting notification:', error);
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  }

  async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('Error fetching notification preferences:', error);
      throw new Error(`Failed to fetch notification preferences: ${error.message}`);
    }

    return data as NotificationPreferences;
  }

  async updatePreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDTO
  ): Promise<NotificationPreferences> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...dto,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('Error updating notification preferences:', error);
      throw new Error(`Failed to update notification preferences: ${error.message}`);
    }

    return data as NotificationPreferences;
  }

  async notifyAchievementUnlock(
    userId: string,
    achievementData: {
      achievement_id: string;
      achievement_key: string;
      achievement_name: string;
      rarity: string;
      xp_awarded: number;
    }
  ): Promise<void> {
    await this.createNotification({
      user_id: userId,
      type: NotificationType.ACHIEVEMENT_UNLOCKED,
      title: 'Achievement Unlocked!',
      message: `You've unlocked the "${achievementData.achievement_name}" achievement!`,
      data: { achievement_unlocked: achievementData },
    });
  }

  async notifyLevelUp(
    userId: string,
    levelData: {
      old_level: number;
      new_level: number;
      total_xp: number;
    }
  ): Promise<void> {
    await this.createNotification({
      user_id: userId,
      type: NotificationType.LEVEL_UP,
      title: 'Level Up!',
      message: `Congratulations! You've reached level ${levelData.new_level}!`,
      data: { level_up: levelData },
    });
  }

  async notifyNewFollower(userId: string, followerId: string, followerUsername: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      type: NotificationType.NEW_FOLLOWER,
      title: 'New Follower',
      message: `${followerUsername} started following you!`,
      data: {
        new_follower: {
          follower_id: followerId,
          follower_username: followerUsername,
        },
      },
    });
  }

  async notifyListInvitation(
    userId: string,
    listId: string,
    listName: string,
    inviterId: string,
    inviterUsername: string,
    role: string
  ): Promise<void> {
    await this.createNotification({
      user_id: userId,
      type: NotificationType.LIST_INVITATION,
      title: 'List Invitation',
      message: `${inviterUsername} invited you to collaborate on "${listName}"`,
      data: {
        list_invitation: {
          list_id: listId,
          list_name: listName,
          inviter_id: inviterId,
          inviter_username: inviterUsername,
          role,
        },
      },
    });
  }
}

export const notificationService = new NotificationService();
