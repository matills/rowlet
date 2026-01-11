import logger from '../config/logger';
import { Achievement, LevelUpResult } from '../types/achievement.types';
import { notificationService } from './notification.service';

export interface AchievementNotificationPayload {
  userId: string;
  achievement: Achievement;
  xpAwarded: number;
  levelUpInfo?: LevelUpResult;
}

export interface LevelUpNotificationPayload {
  userId: string;
  oldLevel: number;
  newLevel: number;
  totalXP: number;
}

class AchievementNotificationService {
  async notifyAchievementUnlock(payload: AchievementNotificationPayload): Promise<void> {
    try {
      logger.info(
        `[Notification] Achievement unlocked for user ${payload.userId}: ${payload.achievement.name} (+${payload.xpAwarded} XP)`
      );

      await notificationService.notifyAchievementUnlock(payload.userId, {
        achievement_id: payload.achievement.id,
        achievement_key: payload.achievement.key,
        achievement_name: payload.achievement.name,
        rarity: payload.achievement.rarity,
        xp_awarded: payload.xpAwarded,
      });

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

  async notifyLevelUp(payload: LevelUpNotificationPayload): Promise<void> {
    try {
      logger.info(
        `[Notification] Level up for user ${payload.userId}: Level ${payload.oldLevel} → ${payload.newLevel}`
      );

      await notificationService.notifyLevelUp(payload.userId, {
        old_level: payload.oldLevel,
        new_level: payload.newLevel,
        total_xp: payload.totalXP,
      });
    } catch (error: any) {
      logger.error('[Notification] Error sending level up notification:', error);
    }
  }

  async notifyMultipleAchievements(userId: string, achievements: Achievement[], totalXP: number): Promise<void> {
    try {
      logger.info(
        `[Notification] Multiple achievements unlocked for user ${userId}: ${achievements.length} achievements (+${totalXP} XP)`
      );
    } catch (error: any) {
      logger.error('[Notification] Error sending multiple achievements notification:', error);
    }
  }

  async getUnreadAchievementNotifications(userId: string): Promise<any[]> {
    return [];
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    logger.info(`[Notification] Marking notification ${notificationId} as read for user ${userId}`);
  }
}

export const achievementNotificationService = new AchievementNotificationService();

export const notifyAchievementUnlock = async (payload: AchievementNotificationPayload): Promise<void> => {
  await achievementNotificationService.notifyAchievementUnlock(payload);
};

export const notifyLevelUp = async (payload: LevelUpNotificationPayload): Promise<void> => {
  await achievementNotificationService.notifyLevelUp(payload);
};
