import { supabase } from '../config/supabase';
import { logger } from '../config/logger';
import type {
  AddToListInput,
  UpdateListItemInput,
  UpdateProgressInput,
  UserMediaStatus,
} from '../validators/user-list.validators';

export class UserListService {
  /**
   * Get user's full media list
   */
  async getUserList(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('user_media_list')
      .select(
        `
        *,
        media:media_id (
          id,
          title,
          original_title,
          type,
          subtype,
          poster_path,
          backdrop_path,
          release_date,
          genres,
          score,
          total_episodes,
          status
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Error fetching user list:', error);
      throw new Error('Failed to fetch user list');
    }

    return {
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Get user's media list filtered by status
   */
  async getUserListByStatus(
    userId: string,
    status: UserMediaStatus,
    page = 1,
    limit = 20
  ) {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('user_media_list')
      .select(
        `
        *,
        media:media_id (
          id,
          title,
          original_title,
          type,
          subtype,
          poster_path,
          backdrop_path,
          release_date,
          genres,
          score,
          total_episodes,
          status
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .eq('status', status)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Error fetching user list by status:', error);
      throw new Error('Failed to fetch user list');
    }

    return {
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Add media to user's list
   */
  async addToList(userId: string, input: AddToListInput) {
    // Check if media exists
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .select('id')
      .eq('id', input.mediaId)
      .single();

    if (mediaError || !media) {
      throw new Error('Media not found. Please import it first.');
    }

    // Check if already in list
    const { data: existing } = await supabase
      .from('user_media_list')
      .select('id')
      .eq('user_id', userId)
      .eq('media_id', input.mediaId)
      .single();

    if (existing) {
      throw new Error('Media already in your list. Use update instead.');
    }

    // Add to list
    const { data, error } = await supabase
      .from('user_media_list')
      .insert({
        user_id: userId,
        media_id: input.mediaId,
        status: input.status,
        score: input.score || null,
        notes: input.notes || null,
        episodes_watched: input.episodesWatched || 0,
        started_at: ['watching', 'completed'].includes(input.status)
          ? new Date().toISOString()
          : null,
        completed_at:
          input.status === 'completed' ? new Date().toISOString() : null,
      })
      .select(
        `
        *,
        media:media_id (*)
      `
      )
      .single();

    if (error) {
      logger.error('Error adding to list:', error);
      throw new Error('Failed to add to list');
    }

    return data;
  }

  /**
   * Update media in user's list
   */
  async updateListItem(
    userId: string,
    mediaId: string,
    input: UpdateListItemInput
  ) {
    // Check if item exists in user's list
    const { data: existing, error: checkError } = await supabase
      .from('user_media_list')
      .select('id, status')
      .eq('user_id', userId)
      .eq('media_id', mediaId)
      .single();

    if (checkError || !existing) {
      throw new Error('Media not found in your list');
    }

    // Prepare update data
    const updateData: any = {};

    if (input.status !== undefined) {
      updateData.status = input.status;

      // Update started_at if changing to watching or completed
      if (
        ['watching', 'completed'].includes(input.status) &&
        !['watching', 'completed'].includes(existing.status)
      ) {
        updateData.started_at = new Date().toISOString();
      }

      // Update completed_at if changing to completed
      if (input.status === 'completed' && existing.status !== 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      // Clear completed_at if changing from completed to another status
      if (input.status !== 'completed' && existing.status === 'completed') {
        updateData.completed_at = null;
      }
    }

    if (input.score !== undefined) updateData.score = input.score;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.episodesWatched !== undefined)
      updateData.episodes_watched = input.episodesWatched;
    if (input.rewatchCount !== undefined)
      updateData.rewatch_count = input.rewatchCount;

    // Update
    const { data, error } = await supabase
      .from('user_media_list')
      .update(updateData)
      .eq('user_id', userId)
      .eq('media_id', mediaId)
      .select(
        `
        *,
        media:media_id (*)
      `
      )
      .single();

    if (error) {
      logger.error('Error updating list item:', error);
      throw new Error('Failed to update list item');
    }

    return data;
  }

  /**
   * Update viewing progress
   */
  async updateProgress(
    userId: string,
    mediaId: string,
    input: UpdateProgressInput
  ) {
    const { data, error } = await supabase
      .from('user_media_list')
      .update({ episodes_watched: input.episodesWatched })
      .eq('user_id', userId)
      .eq('media_id', mediaId)
      .select(
        `
        *,
        media:media_id (*)
      `
      )
      .single();

    if (error) {
      logger.error('Error updating progress:', error);
      throw new Error('Failed to update progress');
    }

    if (!data) {
      throw new Error('Media not found in your list');
    }

    return data;
  }

  /**
   * Remove media from user's list
   */
  async removeFromList(userId: string, mediaId: string) {
    const { error } = await supabase
      .from('user_media_list')
      .delete()
      .eq('user_id', userId)
      .eq('media_id', mediaId);

    if (error) {
      logger.error('Error removing from list:', error);
      throw new Error('Failed to remove from list');
    }

    return { success: true };
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, display_name, is_private')
      .eq('username', username)
      .single();

    if (error || !data) {
      throw new Error('User not found');
    }

    if (data.is_private) {
      throw new Error('This profile is private');
    }

    return data;
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    // Get all list items
    const { data: listItems, error } = await supabase
      .from('user_media_list')
      .select('status, score, episodes_watched, rewatch_count')
      .eq('user_id', userId);

    if (error) {
      logger.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch stats');
    }

    // Calculate stats
    const stats = {
      total: listItems?.length || 0,
      watching: listItems?.filter((item) => item.status === 'watching').length || 0,
      completed: listItems?.filter((item) => item.status === 'completed').length || 0,
      planToWatch: listItems?.filter((item) => item.status === 'plan_to_watch').length || 0,
      onHold: listItems?.filter((item) => item.status === 'on_hold').length || 0,
      dropped: listItems?.filter((item) => item.status === 'dropped').length || 0,
      totalEpisodesWatched: listItems?.reduce(
        (sum, item) => sum + (item.episodes_watched || 0),
        0
      ) || 0,
      totalRewatches: listItems?.reduce(
        (sum, item) => sum + (item.rewatch_count || 0),
        0
      ) || 0,
      averageScore:
        listItems
          ?.filter((item) => item.score !== null)
          .reduce((sum, item, _, arr) => {
            return sum + (item.score || 0) / arr.length;
          }, 0) || 0,
    };

    return stats;
  }
}

export const userListService = new UserListService();
