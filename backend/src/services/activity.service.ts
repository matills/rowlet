import { supabaseAdmin } from '../config/supabase';
import { logger } from '../config/logger';
import type {
  ActivityType,
  ActivityWithDetails,
  CreateActivityInput,
  PaginatedActivities,
} from '../types/activity.types';

export class ActivityService {
  async createActivity(userId: string, input: CreateActivityInput): Promise<void> {
    try {
      const { error } = await supabaseAdmin.from('activities').insert({
        user_id: userId,
        activity_type: input.activity_type,
        media_id: input.media_id || null,
        list_id: input.list_id || null,
        target_user_id: input.target_user_id || null,
        metadata: input.metadata || null,
      });

      if (error) {
        logger.error('Error creating activity:', error);
        throw new Error('Failed to create activity');
      }
    } catch (error) {
      logger.error('Create activity error:', error);
    }
  }

  async getFeed(
    userId: string,
    page = 1,
    limit = 20,
    activityType?: ActivityType
  ): Promise<PaginatedActivities> {
    try {
      const offset = (page - 1) * limit;

      let query = supabaseAdmin
        .from('feed_activities')
        .select('*', { count: 'exact' })
        .in('user_id', supabaseAdmin.rpc('get_following_ids', { user_id: userId }))
        .order('created_at', { ascending: false });

      if (activityType) {
        query = query.eq('activity_type', activityType);
      }

      const { data, error, count } = await query.range(offset, offset + limit - 1);

      if (error) {
        logger.error('Error fetching feed:', error);
        throw new Error('Failed to fetch feed');
      }

      return {
        data: (data || []) as ActivityWithDetails[],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      logger.error('Get feed error:', error);
      throw error;
    }
  }

  async getMyActivity(
    userId: string,
    page = 1,
    limit = 20,
    activityType?: ActivityType
  ): Promise<PaginatedActivities> {
    try {
      const offset = (page - 1) * limit;

      let query = supabaseAdmin
        .from('feed_activities')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (activityType) {
        query = query.eq('activity_type', activityType);
      }

      const { data, error, count } = await query.range(offset, offset + limit - 1);

      if (error) {
        logger.error('Error fetching my activity:', error);
        throw new Error('Failed to fetch activity');
      }

      return {
        data: (data || []) as ActivityWithDetails[],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      logger.error('Get my activity error:', error);
      throw error;
    }
  }

  async getUserActivity(
    username: string,
    requestingUserId: string | undefined,
    page = 1,
    limit = 20,
    activityType?: ActivityType
  ): Promise<PaginatedActivities> {
    try {
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, is_private')
        .eq('username', username)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      if (user.is_private && user.id !== requestingUserId) {
        const isFollowing = requestingUserId
          ? await this.checkIfFollowing(requestingUserId, user.id)
          : false;

        if (!isFollowing) {
          throw new Error('This profile is private');
        }
      }

      const offset = (page - 1) * limit;

      let query = supabaseAdmin
        .from('feed_activities')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (activityType) {
        query = query.eq('activity_type', activityType);
      }

      const { data, error, count } = await query.range(offset, offset + limit - 1);

      if (error) {
        logger.error('Error fetching user activity:', error);
        throw new Error('Failed to fetch activity');
      }

      return {
        data: (data || []) as ActivityWithDetails[],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      logger.error('Get user activity error:', error);
      throw error;
    }
  }

  async deleteActivity(activityId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('activities')
        .delete()
        .eq('id', activityId)
        .eq('user_id', userId);

      if (error) {
        logger.error('Error deleting activity:', error);
        throw new Error('Failed to delete activity');
      }
    } catch (error) {
      logger.error('Delete activity error:', error);
      throw error;
    }
  }

  private async checkIfFollowing(
    followerId: string,
    followingId: string
  ): Promise<boolean> {
    try {
      const { data } = await supabaseAdmin
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }

  async trackMediaWatched(userId: string, mediaId: string, metadata?: Record<string, any>) {
    await this.createActivity(userId, {
      activity_type: 'WATCHED_MEDIA',
      media_id: mediaId,
      metadata,
    });
  }

  async trackMediaRated(userId: string, mediaId: string, rating: number) {
    await this.createActivity(userId, {
      activity_type: 'RATED_MEDIA',
      media_id: mediaId,
      metadata: { rating },
    });
  }

  async trackMediaCompleted(userId: string, mediaId: string) {
    await this.createActivity(userId, {
      activity_type: 'COMPLETED_MEDIA',
      media_id: mediaId,
    });
  }

  async trackMediaStarted(userId: string, mediaId: string) {
    await this.createActivity(userId, {
      activity_type: 'STARTED_WATCHING',
      media_id: mediaId,
    });
  }

  async trackAddedToList(userId: string, mediaId: string, listId: string) {
    await this.createActivity(userId, {
      activity_type: 'ADDED_TO_LIST',
      media_id: mediaId,
      list_id: listId,
    });
  }

  async trackRemovedFromList(userId: string, mediaId: string, listId: string) {
    await this.createActivity(userId, {
      activity_type: 'REMOVED_FROM_LIST',
      media_id: mediaId,
      list_id: listId,
    });
  }

  async trackListCreated(userId: string, listId: string) {
    await this.createActivity(userId, {
      activity_type: 'CREATED_LIST',
      list_id: listId,
    });
  }

  async trackListUpdated(userId: string, listId: string) {
    await this.createActivity(userId, {
      activity_type: 'UPDATED_LIST',
      list_id: listId,
    });
  }

  async trackUserFollowed(userId: string, targetUserId: string) {
    await this.createActivity(userId, {
      activity_type: 'FOLLOWED_USER',
      target_user_id: targetUserId,
    });
  }

  async trackUserUnfollowed(userId: string, targetUserId: string) {
    await this.createActivity(userId, {
      activity_type: 'UNFOLLOWED_USER',
      target_user_id: targetUserId,
    });
  }

  async trackJoinedCollaborativeList(userId: string, listId: string) {
    await this.createActivity(userId, {
      activity_type: 'JOINED_COLLABORATIVE_LIST',
      list_id: listId,
    });
  }

  async trackAddedToFavorites(userId: string, mediaId: string) {
    await this.createActivity(userId, {
      activity_type: 'ADDED_TO_FAVORITES',
      media_id: mediaId,
    });
  }
}

export const activityService = new ActivityService();
