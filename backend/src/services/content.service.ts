import { supabaseAdmin as supabase } from '../lib/supabase.js';
import { getSearchService } from './search.service.js';
import type { Content, UserContent, UserContentStatus } from '../types/database.js';
import type { UnifiedContent } from './search.service.js';

export interface CreateUserContentInput {
  userId: string;
  externalId: string;
  source: 'tmdb' | 'anilist';
  type: 'movie' | 'series' | 'anime';
  status: UserContentStatus;
  rating?: number;
  episodesWatched?: number;
  watchedAt?: string;
  notes?: string;
}

export interface UpdateUserContentInput {
  status?: UserContentStatus;
  rating?: number;
  episodesWatched?: number;
  watchedAt?: string;
  notes?: string;
}

export class ContentService {
  /**
   * Get or create content in database cache
   */
  async getOrCreateContent(unifiedContent: UnifiedContent): Promise<Content> {
    const { externalId, source } = unifiedContent;

    // Check if content already exists
    const { data: existingContent, error: fetchError } = await supabase
      .from('content')
      .select('*')
      .eq('external_id', externalId)
      .eq('source', source)
      .single();

    if (existingContent && !fetchError) {
      return existingContent;
    }

    // Create new content
    const contentData = {
      external_id: unifiedContent.externalId,
      source: unifiedContent.source,
      type: unifiedContent.type,
      title: unifiedContent.title,
      original_title: unifiedContent.originalTitle,
      year: unifiedContent.year,
      poster_url: unifiedContent.posterUrl,
      backdrop_url: unifiedContent.backdropUrl,
      overview: unifiedContent.overview,
      genres: unifiedContent.genres,
      rating: unifiedContent.rating,
      episode_count: unifiedContent.episodeCount,
      season_count: unifiedContent.seasonCount,
      status: unifiedContent.status,
      raw_data: unifiedContent.rawData,
    };

    const { data: newContent, error: createError } = await supabase
      .from('content')
      .insert(contentData)
      .select()
      .single();

    if (createError) {
      console.error('Error creating content:', createError);
      throw new Error('Failed to create content');
    }

    return newContent;
  }

  /**
   * Add content to user's tracking list
   */
  async addUserContent(input: CreateUserContentInput): Promise<UserContent> {
    const { userId, externalId, source, type, status, rating, episodesWatched, watchedAt, notes } = input;

    // Get content details from external API
    const searchService = getSearchService();
    const unifiedContent = await searchService.getContentDetails(source, externalId, type);

    // Get or create content in database
    const content = await this.getOrCreateContent(unifiedContent);

    // Create or update user content
    const userContentData = {
      user_id: userId,
      content_id: content.id,
      status,
      rating: rating || null,
      episodes_watched: episodesWatched || 0,
      watched_at: watchedAt || null,
      notes: notes || null,
    };

    const { data: userContent, error } = await supabase
      .from('user_content')
      .upsert(userContentData, {
        onConflict: 'user_id,content_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user content:', error);
      throw new Error('Failed to add content to user library');
    }

    return userContent;
  }

  /**
   * Update user content
   */
  async updateUserContent(userContentId: string, userId: string, input: UpdateUserContentInput): Promise<UserContent> {
    const { status, rating, episodesWatched, watchedAt, notes } = input;

    const updateData: Partial<UserContent> = {};
    if (status !== undefined) updateData.status = status;
    if (rating !== undefined) updateData.rating = rating;
    if (episodesWatched !== undefined) updateData.episodes_watched = episodesWatched;
    if (watchedAt !== undefined) updateData.watched_at = watchedAt;
    if (notes !== undefined) updateData.notes = notes;

    const { data: userContent, error } = await supabase
      .from('user_content')
      .update(updateData)
      .eq('id', userContentId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user content:', error);
      throw new Error('Failed to update user content');
    }

    return userContent;
  }

  /**
   * Get user's content catalog
   */
  async getUserContent(userId: string, status?: UserContentStatus): Promise<(UserContent & { content: Content })[]> {
    let query = supabase
      .from('user_content')
      .select(`
        *,
        content (*)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user content:', error);
      throw new Error('Failed to fetch user content');
    }

    return data as (UserContent & { content: Content })[];
  }

  /**
   * Delete user content
   */
  async deleteUserContent(userContentId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_content')
      .delete()
      .eq('id', userContentId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting user content:', error);
      throw new Error('Failed to delete user content');
    }
  }
}

// Singleton instance
let contentService: ContentService | null = null;

export function getContentService(): ContentService {
  if (!contentService) {
    contentService = new ContentService();
  }
  return contentService;
}
