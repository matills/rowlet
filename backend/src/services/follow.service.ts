import { supabaseAdmin } from '../config/supabase';
import { logger } from '../config/logger';
import { activityService } from './activity.service';
import type { FollowUser, FollowCounts, FollowStatus, PaginatedFollows } from '../types/follow.types';

export class FollowService {
  /**
   * Follow a user
   */
  async followUser(followerId: string, targetUsername: string): Promise<void> {
    try {
      const { data: targetUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, username')
        .eq('username', targetUsername)
        .single();

      if (userError || !targetUser) {
        throw new Error('User not found');
      }

      if (followerId === targetUser.id) {
        throw new Error('You cannot follow yourself');
      }

      const { data: existing } = await supabaseAdmin
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', targetUser.id)
        .single();

      if (existing) {
        throw new Error('You are already following this user');
      }

      const { error: insertError } = await supabaseAdmin
        .from('follows')
        .insert({
          follower_id: followerId,
          following_id: targetUser.id,
        });

      if (insertError) {
        logger.error('Error creating follow:', insertError);
        throw new Error('Failed to follow user');
      }

      await activityService.trackUserFollowed(followerId, targetUser.id);
    } catch (error) {
      logger.error('Follow user error:', error);
      throw error;
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, targetUsername: string): Promise<void> {
    try {
      const { data: targetUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, username')
        .eq('username', targetUsername)
        .single();

      if (userError || !targetUser) {
        throw new Error('User not found');
      }

      const { error: deleteError } = await supabaseAdmin
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', targetUser.id);

      if (deleteError) {
        logger.error('Error deleting follow:', deleteError);
        throw new Error('Failed to unfollow user');
      }
    } catch (error) {
      logger.error('Unfollow user error:', error);
      throw error;
    }
  }

  /**
   * Get followers of a user
   */
  async getFollowers(
    username: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedFollows> {
    try {
      const offset = (page - 1) * limit;

      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      const { data, error, count } = await supabaseAdmin
        .from('follows')
        .select(
          `
          created_at,
          follower:follower_id (
            id,
            username,
            display_name,
            avatar_url,
            bio,
            is_private
          )
        `,
          { count: 'exact' }
        )
        .eq('following_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('Error fetching followers:', error);
        throw new Error('Failed to fetch followers');
      }

      const followers: FollowUser[] = (data || []).map((item: any) => ({
        id: item.follower.id,
        username: item.follower.username,
        display_name: item.follower.display_name,
        avatar_url: item.follower.avatar_url,
        bio: item.follower.bio,
        is_private: item.follower.is_private,
        followed_at: item.created_at,
      }));

      return {
        data: followers,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      logger.error('Get followers error:', error);
      throw error;
    }
  }

  /**
   * Get users that a user is following
   */
  async getFollowing(
    username: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedFollows> {
    try {
      const offset = (page - 1) * limit;

      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      const { data, error, count } = await supabaseAdmin
        .from('follows')
        .select(
          `
          created_at,
          following:following_id (
            id,
            username,
            display_name,
            avatar_url,
            bio,
            is_private
          )
        `,
          { count: 'exact' }
        )
        .eq('follower_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('Error fetching following:', error);
        throw new Error('Failed to fetch following');
      }

      const following: FollowUser[] = (data || []).map((item: any) => ({
        id: item.following.id,
        username: item.following.username,
        display_name: item.following.display_name,
        avatar_url: item.following.avatar_url,
        bio: item.following.bio,
        is_private: item.following.is_private,
        followed_at: item.created_at,
      }));

      return {
        data: following,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      logger.error('Get following error:', error);
      throw error;
    }
  }

  /**
   * Check if current user is following target user
   */
  async checkFollowStatus(
    currentUserId: string,
    targetUsername: string
  ): Promise<FollowStatus> {
    try {
      const { data: targetUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', targetUsername)
        .single();

      if (userError || !targetUser) {
        throw new Error('User not found');
      }

      const { data: isFollowing } = await supabaseAdmin
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUser.id)
        .single();

      const { data: isFollowedBy } = await supabaseAdmin
        .from('follows')
        .select('id')
        .eq('follower_id', targetUser.id)
        .eq('following_id', currentUserId)
        .single();

      return {
        isFollowing: !!isFollowing,
        isFollowedBy: !!isFollowedBy,
      };
    } catch (error) {
      logger.error('Check follow status error:', error);
      throw error;
    }
  }

  /**
   * Get follower/following counts for a user
   */
  async getFollowCounts(userId: string): Promise<FollowCounts> {
    try {
      const { count: followersCount, error: followersError } = await supabaseAdmin
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (followersError) {
        logger.error('Error counting followers:', followersError);
        throw new Error('Failed to count followers');
      }

      const { count: followingCount, error: followingError } = await supabaseAdmin
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (followingError) {
        logger.error('Error counting following:', followingError);
        throw new Error('Failed to count following');
      }

      return {
        followers_count: followersCount || 0,
        following_count: followingCount || 0,
      };
    } catch (error) {
      logger.error('Get follow counts error:', error);
      throw error;
    }
  }

  /**
   * Get follower/following counts by username
   */
  async getFollowCountsByUsername(username: string): Promise<FollowCounts> {
    try {
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      return this.getFollowCounts(user.id);
    } catch (error) {
      logger.error('Get follow counts by username error:', error);
      throw error;
    }
  }
}

export const followService = new FollowService();
