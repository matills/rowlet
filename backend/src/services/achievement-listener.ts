import { EventEmitter } from 'events';
import { achievementService } from './achievement.service';
import { AchievementConditionType } from '../types/achievement.types';
import logger from '../config/logger';

/**
 * Application event types that can trigger achievement evaluation
 */
export enum AchievementEvent {
  MEDIA_COMPLETED = 'media:completed',
  MEDIA_ADDED = 'media:added',
  MEDIA_RATED = 'media:rated',
  LIST_CREATED = 'list:created',
  LIST_ITEM_ADDED = 'list:item_added',
  USER_FOLLOWED = 'user:followed',
  COLLABORATION_JOINED = 'collaboration:joined',
  MEDIA_STATUS_CHANGED = 'media:status_changed',
}

/**
 * Event payload interfaces
 */
export interface MediaCompletedPayload {
  userId: string;
  mediaId: string;
  mediaType: 'movie' | 'series' | 'anime';
  completedAt: Date;
}

export interface MediaAddedPayload {
  userId: string;
  mediaId: string;
  status: string;
}

export interface MediaRatedPayload {
  userId: string;
  mediaId: string;
  rating: number;
}

export interface ListCreatedPayload {
  userId: string;
  listId: string;
}

export interface ListItemAddedPayload {
  userId: string;
  listId: string;
  mediaId: string;
}

export interface UserFollowedPayload {
  followerId: string;
  followingId: string;
}

export interface CollaborationJoinedPayload {
  userId: string;
  listId: string;
  role: string;
}

export interface MediaStatusChangedPayload {
  userId: string;
  mediaId: string;
  oldStatus: string;
  newStatus: string;
}

/**
 * Main achievement event listener class
 */
class AchievementEventListener {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.registerListeners();
  }

  /**
   * Get the event emitter instance
   */
  getEmitter(): EventEmitter {
    return this.eventEmitter;
  }

  /**
   * Register all event listeners
   */
  private registerListeners(): void {
    // Media completion events
    this.eventEmitter.on(AchievementEvent.MEDIA_COMPLETED, (payload: MediaCompletedPayload) => {
      this.onMediaCompleted(payload);
    });

    // Media added events
    this.eventEmitter.on(AchievementEvent.MEDIA_ADDED, (payload: MediaAddedPayload) => {
      this.onMediaAdded(payload);
    });

    // Media rating events
    this.eventEmitter.on(AchievementEvent.MEDIA_RATED, (payload: MediaRatedPayload) => {
      this.onMediaRated(payload);
    });

    // List creation events
    this.eventEmitter.on(AchievementEvent.LIST_CREATED, (payload: ListCreatedPayload) => {
      this.onListCreated(payload);
    });

    // User follow events
    this.eventEmitter.on(AchievementEvent.USER_FOLLOWED, (payload: UserFollowedPayload) => {
      this.onUserFollowed(payload);
    });

    // Collaboration events
    this.eventEmitter.on(AchievementEvent.COLLABORATION_JOINED, (payload: CollaborationJoinedPayload) => {
      this.onCollaborationJoined(payload);
    });
  }

  /**
   * Handle media completed event
   */
  private async onMediaCompleted(payload: MediaCompletedPayload): Promise<void> {
    try {
      logger.info(`[Achievement] Media completed event for user ${payload.userId}`);

      // Evaluate achievements related to watching and completing content
      const conditionTypes = [
        AchievementConditionType.WATCHED_COUNT,
        AchievementConditionType.WATCHED_COUNT_TIMEFRAME,
        AchievementConditionType.COMPLETION,
        AchievementConditionType.GENRE_DIVERSITY,
        AchievementConditionType.TIME_OF_DAY,
        AchievementConditionType.YEAR_FILTER,
        AchievementConditionType.SPEED_WATCHING,
        AchievementConditionType.STREAK,
      ];

      const results = await achievementService.evaluateAndUnlockAchievements(payload.userId, conditionTypes);

      if (results.length > 0) {
        logger.info(`[Achievement] Unlocked ${results.length} achievements for user ${payload.userId}`);
        results.forEach((result) => {
          logger.info(`  - ${result.achievement.name} (+${result.xp_awarded} XP)`);
        });
      }
    } catch (error: any) {
      logger.error('[Achievement] Error handling media completed event:', error);
    }
  }

  /**
   * Handle media added event
   */
  private async onMediaAdded(payload: MediaAddedPayload): Promise<void> {
    try {
      logger.info(`[Achievement] Media added event for user ${payload.userId}`);

      // Evaluate achievements related to adding content to lists
      const conditionTypes = [
        AchievementConditionType.WATCHED_COUNT,
        AchievementConditionType.GENRE_DIVERSITY,
      ];

      const results = await achievementService.evaluateAndUnlockAchievements(payload.userId, conditionTypes);

      if (results.length > 0) {
        logger.info(`[Achievement] Unlocked ${results.length} achievements for user ${payload.userId}`);
      }
    } catch (error: any) {
      logger.error('[Achievement] Error handling media added event:', error);
    }
  }

  /**
   * Handle media rated event
   */
  private async onMediaRated(payload: MediaRatedPayload): Promise<void> {
    try {
      logger.info(`[Achievement] Media rated event for user ${payload.userId}`);

      // Evaluate achievements related to rating content
      const conditionTypes = [
        AchievementConditionType.RATING_COUNT,
        AchievementConditionType.RATING_VALUE,
        AchievementConditionType.PERFECT_SCORE,
      ];

      const results = await achievementService.evaluateAndUnlockAchievements(payload.userId, conditionTypes);

      if (results.length > 0) {
        logger.info(`[Achievement] Unlocked ${results.length} achievements for user ${payload.userId}`);
      }
    } catch (error: any) {
      logger.error('[Achievement] Error handling media rated event:', error);
    }
  }

  /**
   * Handle list created event
   */
  private async onListCreated(payload: ListCreatedPayload): Promise<void> {
    try {
      logger.info(`[Achievement] List created event for user ${payload.userId}`);

      // Evaluate achievements related to list creation
      const conditionTypes = [AchievementConditionType.LIST_CREATION];

      const results = await achievementService.evaluateAndUnlockAchievements(payload.userId, conditionTypes);

      if (results.length > 0) {
        logger.info(`[Achievement] Unlocked ${results.length} achievements for user ${payload.userId}`);
      }
    } catch (error: any) {
      logger.error('[Achievement] Error handling list created event:', error);
    }
  }

  /**
   * Handle user followed event
   */
  private async onUserFollowed(payload: UserFollowedPayload): Promise<void> {
    try {
      logger.info(`[Achievement] User followed event for users ${payload.followerId} and ${payload.followingId}`);

      // Evaluate social achievements for both follower and following user
      const conditionTypes = [AchievementConditionType.SOCIAL];

      // Evaluate for follower (they are following someone)
      const followerResults = await achievementService.evaluateAndUnlockAchievements(
        payload.followerId,
        conditionTypes
      );

      // Evaluate for the user being followed (they gained a follower)
      const followingResults = await achievementService.evaluateAndUnlockAchievements(
        payload.followingId,
        conditionTypes
      );

      const totalUnlocked = followerResults.length + followingResults.length;
      if (totalUnlocked > 0) {
        logger.info(`[Achievement] Unlocked ${totalUnlocked} achievements from follow event`);
      }
    } catch (error: any) {
      logger.error('[Achievement] Error handling user followed event:', error);
    }
  }

  /**
   * Handle collaboration joined event
   */
  private async onCollaborationJoined(payload: CollaborationJoinedPayload): Promise<void> {
    try {
      logger.info(`[Achievement] Collaboration joined event for user ${payload.userId}`);

      // Evaluate achievements related to collaboration
      const conditionTypes = [AchievementConditionType.COLLABORATION];

      const results = await achievementService.evaluateAndUnlockAchievements(payload.userId, conditionTypes);

      if (results.length > 0) {
        logger.info(`[Achievement] Unlocked ${results.length} achievements for user ${payload.userId}`);
      }
    } catch (error: any) {
      logger.error('[Achievement] Error handling collaboration joined event:', error);
    }
  }

  /**
   * Emit an event to trigger achievement evaluation
   */
  emit(event: AchievementEvent, payload: any): void {
    this.eventEmitter.emit(event, payload);
  }

  /**
   * Helper method to emit media completed event
   */
  emitMediaCompleted(userId: string, mediaId: string, mediaType: 'movie' | 'series' | 'anime'): void {
    this.emit(AchievementEvent.MEDIA_COMPLETED, {
      userId,
      mediaId,
      mediaType,
      completedAt: new Date(),
    } as MediaCompletedPayload);
  }

  /**
   * Helper method to emit media rated event
   */
  emitMediaRated(userId: string, mediaId: string, rating: number): void {
    this.emit(AchievementEvent.MEDIA_RATED, {
      userId,
      mediaId,
      rating,
    } as MediaRatedPayload);
  }

  /**
   * Helper method to emit list created event
   */
  emitListCreated(userId: string, listId: string): void {
    this.emit(AchievementEvent.LIST_CREATED, {
      userId,
      listId,
    } as ListCreatedPayload);
  }

  /**
   * Helper method to emit user followed event
   */
  emitUserFollowed(followerId: string, followingId: string): void {
    this.emit(AchievementEvent.USER_FOLLOWED, {
      followerId,
      followingId,
    } as UserFollowedPayload);
  }

  /**
   * Helper method to emit collaboration joined event
   */
  emitCollaborationJoined(userId: string, listId: string, role: string): void {
    this.emit(AchievementEvent.COLLABORATION_JOINED, {
      userId,
      listId,
      role,
    } as CollaborationJoinedPayload);
  }
}

export const achievementListener = new AchievementEventListener();

export const emitAchievementEvent = (event: AchievementEvent, payload: any) => {
  achievementListener.emit(event, payload);
};

export const emitMediaCompleted = (userId: string, mediaId: string, mediaType: 'movie' | 'series' | 'anime') => {
  achievementListener.emitMediaCompleted(userId, mediaId, mediaType);
};

export const emitMediaRated = (userId: string, mediaId: string, rating: number) => {
  achievementListener.emitMediaRated(userId, mediaId, rating);
};

export const emitListCreated = (userId: string, listId: string) => {
  achievementListener.emitListCreated(userId, listId);
};

export const emitUserFollowed = (followerId: string, followingId: string) => {
  achievementListener.emitUserFollowed(followerId, followingId);
};

export const emitCollaborationJoined = (userId: string, listId: string, role: string) => {
  achievementListener.emitCollaborationJoined(userId, listId, role);
};
