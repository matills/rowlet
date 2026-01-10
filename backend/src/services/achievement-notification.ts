/**
 * Achievement Notification Service
 * Sprint 11 - Motor de Logros
 *
 * Handles notifications for achievement unlocks and level ups.
 * This is a basic implementation that will be enhanced in Sprint 14
 * when the full notification system is implemented.
 */

import logger from '../config/logger';
import { Achievement, LevelUpResult } from '../types/achievement.types';

/**
 * Achievement notification payload
 */
export interface AchievementNotificationPayload {
  userId: string;
  achievement: Achievement;
  xpAwarded: number;
  levelUpInfo?: LevelUpResult;
}

/**
 * Level up notification payload
 */
export interface LevelUpNotificationPayload {
  userId: string;
  oldLevel: number;
  newLevel: number;
  totalXP: number;
}

/**
 * Achievement notification service
 */
class AchievementNotificationService {
  /**
   * Notify user about achievement unlock
   * In future sprints, this will integrate with the notification system
   * and potentially send real-time notifications via WebSockets/SSE
   */
  async notifyAchievementUnlock(payload: AchievementNotificationPayload): Promise<void> {
    try {
      logger.info(
        `[Notification] Achievement unlocked for user ${payload.userId}: ${payload.achievement.name} (+${payload.xpAwarded} XP)`
      );

      // TODO: Sprint 14 - Integrate with notification system
      // - Create notification record in database
      // - Send real-time notification via WebSocket/SSE
      // - Send email notification (optional, based on user preferences)
      // - Send push notification (optional, for mobile apps)

      // For now, we just log it
      // In the future, this would create a notification record like:
      /*
      await supabase.from('notifications').insert({
        user_id: payload.userId,
        type: 'ACHIEVEMENT_UNLOCKED',
        title: 'Achievement Unlocked!',
        message: `You've unlocked the "${payload.achievement.name}" achievement!`,
        data: {
          achievement_id: payload.achievement.id,
          achievement_key: payload.achievement.key,
          xp_awarded: payload.xpAwarded,
          rarity: payload.achievement.rarity,
        },
      });
      */

      // Check if user also leveled up
      if (payload.levelUpInfo?.leveled_up) {
        await this.notifyLevelUp({
          userId: payload.userId,
          oldLevel: payload.levelUpInfo.new_level - 1,
          newLevel: payload.levelUpInfo.new_level,
          totalXP: payload.levelUpInfo.new_total_xp,
        });
      }
    } catch (error: any) {
      logger.error('[Notification] Error sending achievement notification:', error);
    }
  }

  /**
   * Notify user about level up
   */
  async notifyLevelUp(payload: LevelUpNotificationPayload): Promise<void> {
    try {
      logger.info(
        `[Notification] Level up for user ${payload.userId}: Level ${payload.oldLevel} → ${payload.newLevel}`
      );

      // TODO: Sprint 14 - Integrate with notification system
      // Similar to achievement notifications, this would create a notification record

      /*
      await supabase.from('notifications').insert({
        user_id: payload.userId,
        type: 'LEVEL_UP',
        title: 'Level Up!',
        message: `Congratulations! You've reached level ${payload.newLevel}!`,
        data: {
          old_level: payload.oldLevel,
          new_level: payload.newLevel,
          total_xp: payload.totalXP,
        },
      });
      */
    } catch (error: any) {
      logger.error('[Notification] Error sending level up notification:', error);
    }
  }

  /**
   * Notify user about multiple achievements unlocked at once
   * Useful for batch evaluations
   */
  async notifyMultipleAchievements(userId: string, achievements: Achievement[], totalXP: number): Promise<void> {
    try {
      logger.info(
        `[Notification] Multiple achievements unlocked for user ${userId}: ${achievements.length} achievements (+${totalXP} XP)`
      );

      // TODO: Sprint 14 - Create a grouped notification
      // Instead of sending N notifications, send one notification saying
      // "You've unlocked X achievements! (+Y XP)"
    } catch (error: any) {
      logger.error('[Notification] Error sending multiple achievements notification:', error);
    }
  }

  /**
   * Get unread achievement notifications for a user
   * This will be used when the notification system is implemented
   */
  async getUnreadAchievementNotifications(userId: string): Promise<any[]> {
    // TODO: Sprint 14 - Query notification table
    // For now, return empty array
    return [];
  }

  /**
   * Mark achievement notification as read
   */
  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    // TODO: Sprint 14 - Update notification record
    logger.info(`[Notification] Marking notification ${notificationId} as read for user ${userId}`);
  }
}

// Export singleton instance
export const achievementNotificationService = new AchievementNotificationService();

/**
 * Helper function to easily send achievement unlock notification
 */
export const notifyAchievementUnlock = async (payload: AchievementNotificationPayload): Promise<void> => {
  await achievementNotificationService.notifyAchievementUnlock(payload);
};

/**
 * Helper function to easily send level up notification
 */
export const notifyLevelUp = async (payload: LevelUpNotificationPayload): Promise<void> => {
  await achievementNotificationService.notifyLevelUp(payload);
};
