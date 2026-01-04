import { supabase } from '../config/supabase';
import { logger } from '../config/logger';
import type {
  CreateCustomListInput,
  UpdateCustomListInput,
  AddListItemInput,
  UpdateListItemInput,
} from '../validators/custom-list.validators';

export class CustomListService {
  /**
   * Get all lists for a user
   */
  async getUserLists(userId: string, page = 1, limit = 20, isPublic?: boolean) {
    const offset = (page - 1) * limit;

    let query = supabase
      .from('custom_lists')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Filter by privacy if specified
    if (isPublic !== undefined) {
      query = query.eq('is_public', isPublic);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      logger.error('Error fetching user lists:', error);
      throw new Error('Failed to fetch lists');
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
   * Get a specific list by ID
   */
  async getListById(listId: string, requestingUserId?: string) {
    const { data: list, error } = await supabase
      .from('custom_lists')
      .select('*')
      .eq('id', listId)
      .single();

    if (error || !list) {
      throw new Error('List not found');
    }

    // Check permissions
    if (!list.is_public && list.user_id !== requestingUserId) {
      throw new Error('This list is private');
    }

    // Get list items with media info
    const { data: items, error: itemsError } = await supabase
      .from('custom_list_items')
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
          score
        )
      `
      )
      .eq('list_id', listId)
      .order('position', { ascending: true });

    if (itemsError) {
      logger.error('Error fetching list items:', itemsError);
      throw new Error('Failed to fetch list items');
    }

    return {
      ...list,
      items: items || [],
      itemCount: items?.length || 0,
    };
  }

  /**
   * Create a new custom list
   */
  async createList(userId: string, input: CreateCustomListInput) {
    const { data, error } = await supabase
      .from('custom_lists')
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description || null,
        cover_image_url: input.coverImageUrl || null,
        is_public: input.isPublic ?? true,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating list:', error);
      throw new Error('Failed to create list');
    }

    return data;
  }

  /**
   * Update a custom list
   */
  async updateList(
    listId: string,
    userId: string,
    input: UpdateCustomListInput
  ) {
    // Verify ownership
    const { data: existing, error: checkError } = await supabase
      .from('custom_lists')
      .select('id, user_id')
      .eq('id', listId)
      .single();

    if (checkError || !existing) {
      throw new Error('List not found');
    }

    if (existing.user_id !== userId) {
      throw new Error('You do not have permission to edit this list');
    }

    // Prepare update data
    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.coverImageUrl !== undefined)
      updateData.cover_image_url = input.coverImageUrl;
    if (input.isPublic !== undefined) updateData.is_public = input.isPublic;

    // Update
    const { data, error } = await supabase
      .from('custom_lists')
      .update(updateData)
      .eq('id', listId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating list:', error);
      throw new Error('Failed to update list');
    }

    return data;
  }

  /**
   * Delete a custom list
   */
  async deleteList(listId: string, userId: string) {
    // Verify ownership
    const { data: existing, error: checkError } = await supabase
      .from('custom_lists')
      .select('id, user_id')
      .eq('id', listId)
      .single();

    if (checkError || !existing) {
      throw new Error('List not found');
    }

    if (existing.user_id !== userId) {
      throw new Error('You do not have permission to delete this list');
    }

    // Delete list (items will be cascade deleted)
    const { error } = await supabase
      .from('custom_lists')
      .delete()
      .eq('id', listId);

    if (error) {
      logger.error('Error deleting list:', error);
      throw new Error('Failed to delete list');
    }

    return { success: true };
  }

  /**
   * Add item to list
   */
  async addItemToList(
    listId: string,
    userId: string,
    input: AddListItemInput
  ) {
    // Verify list ownership
    const { data: list, error: listError } = await supabase
      .from('custom_lists')
      .select('id, user_id')
      .eq('id', listId)
      .single();

    if (listError || !list) {
      throw new Error('List not found');
    }

    if (list.user_id !== userId) {
      throw new Error('You do not have permission to edit this list');
    }

    // Check if media exists
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .select('id')
      .eq('id', input.mediaId)
      .single();

    if (mediaError || !media) {
      throw new Error('Media not found. Please import it first.');
    }

    // Check if item already in list
    const { data: existing } = await supabase
      .from('custom_list_items')
      .select('id')
      .eq('list_id', listId)
      .eq('media_id', input.mediaId)
      .single();

    if (existing) {
      throw new Error('Media already in this list');
    }

    // Get current max position if not specified
    let position = input.position ?? 0;
    if (input.position === undefined) {
      const { data: maxItem } = await supabase
        .from('custom_list_items')
        .select('position')
        .eq('list_id', listId)
        .order('position', { ascending: false })
        .limit(1)
        .single();

      position = maxItem ? maxItem.position + 1 : 0;
    }

    // Add item
    const { data, error } = await supabase
      .from('custom_list_items')
      .insert({
        list_id: listId,
        media_id: input.mediaId,
        position,
        notes: input.notes || null,
      })
      .select(
        `
        *,
        media:media_id (*)
      `
      )
      .single();

    if (error) {
      logger.error('Error adding item to list:', error);
      throw new Error('Failed to add item to list');
    }

    return data;
  }

  /**
   * Update list item (position or notes)
   */
  async updateListItem(
    listId: string,
    mediaId: string,
    userId: string,
    input: UpdateListItemInput
  ) {
    // Verify list ownership
    const { data: list, error: listError } = await supabase
      .from('custom_lists')
      .select('id, user_id')
      .eq('id', listId)
      .single();

    if (listError || !list) {
      throw new Error('List not found');
    }

    if (list.user_id !== userId) {
      throw new Error('You do not have permission to edit this list');
    }

    // Check if item exists in list
    const { data: existing, error: checkError } = await supabase
      .from('custom_list_items')
      .select('id')
      .eq('list_id', listId)
      .eq('media_id', mediaId)
      .single();

    if (checkError || !existing) {
      throw new Error('Item not found in this list');
    }

    // Prepare update data
    const updateData: any = {};
    if (input.position !== undefined) updateData.position = input.position;
    if (input.notes !== undefined) updateData.notes = input.notes;

    // Update
    const { data, error } = await supabase
      .from('custom_list_items')
      .update(updateData)
      .eq('list_id', listId)
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
   * Remove item from list
   */
  async removeItemFromList(listId: string, mediaId: string, userId: string) {
    // Verify list ownership
    const { data: list, error: listError } = await supabase
      .from('custom_lists')
      .select('id, user_id')
      .eq('id', listId)
      .single();

    if (listError || !list) {
      throw new Error('List not found');
    }

    if (list.user_id !== userId) {
      throw new Error('You do not have permission to edit this list');
    }

    // Delete item
    const { error } = await supabase
      .from('custom_list_items')
      .delete()
      .eq('list_id', listId)
      .eq('media_id', mediaId);

    if (error) {
      logger.error('Error removing item from list:', error);
      throw new Error('Failed to remove item from list');
    }

    return { success: true };
  }

  /**
   * Get public lists by username
   */
  async getPublicListsByUsername(username: string, page = 1, limit = 20) {
    // Get user by username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, display_name')
      .eq('username', username)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    // Get public lists
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('custom_lists')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Error fetching public lists:', error);
      throw new Error('Failed to fetch lists');
    }

    return {
      user: {
        username: user.username,
        displayName: user.display_name,
      },
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
   * Reorder all items in a list
   */
  async reorderList(listId: string, userId: string, itemIds: string[]) {
    // Verify list ownership
    const { data: list, error: listError } = await supabase
      .from('custom_lists')
      .select('id, user_id')
      .eq('id', listId)
      .single();

    if (listError || !list) {
      throw new Error('List not found');
    }

    if (list.user_id !== userId) {
      throw new Error('You do not have permission to edit this list');
    }

    // Update positions
    const updates = itemIds.map((mediaId, index) =>
      supabase
        .from('custom_list_items')
        .update({ position: index })
        .eq('list_id', listId)
        .eq('media_id', mediaId)
    );

    const results = await Promise.all(updates);

    // Check for errors
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      logger.error('Error reordering list:', errors);
      throw new Error('Failed to reorder list');
    }

    return { success: true, message: 'List reordered successfully' };
  }
}

export const customListService = new CustomListService();
