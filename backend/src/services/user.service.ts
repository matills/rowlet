import { supabaseAdmin } from '../config/supabase';
import { logger } from '../config/logger';
import type {
  UpdateProfileInput,
  ChangePasswordInput,
} from '../validators/auth.validators';

export class UserService {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('Error fetching user profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Get user profile error:', error);
      throw error;
    }
  }

  /**
   * Get user profile by username
   */
  async getUserByUsername(username: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        logger.error('Error fetching user by username:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Get user by username error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileInput) {
    try {
      const updateData: any = {};

      if (data.username !== undefined) updateData.username = data.username;
      if (data.displayName !== undefined)
        updateData.display_name = data.displayName;
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;
      if (data.bannerUrl !== undefined) updateData.banner_url = data.bannerUrl;
      if (data.isPrivate !== undefined) updateData.is_private = data.isPrivate;

      updateData.updated_at = new Date().toISOString();

      const { data: updatedProfile, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Error updating user profile:', error);
        throw error;
      }

      return updatedProfile;
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, data: ChangePasswordInput) {
    try {
      // Supabase doesn't provide a direct way to verify current password
      // So we update directly
      const { data: result, error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          password: data.newPassword,
        }
      );

      if (error) {
        logger.error('Error changing password:', error);
        throw error;
      }

      return result;
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string) {
    try {
      // Delete from auth.users (cascade will delete from public.users)
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (error) {
        logger.error('Error deleting user:', error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      logger.error('Delete account error:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    try {
      // Count media by status
      const { data: stats, error } = await supabaseAdmin
        .from('user_media_list')
        .select('status')
        .eq('user_id', userId);

      if (error) {
        logger.error('Error fetching user stats:', error);
        throw error;
      }

      // Group by status
      const statusCounts = stats?.reduce((acc: any, item: any) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});

      return {
        watching: statusCounts?.watching || 0,
        completed: statusCounts?.completed || 0,
        plan_to_watch: statusCounts?.plan_to_watch || 0,
        on_hold: statusCounts?.on_hold || 0,
        dropped: statusCounts?.dropped || 0,
        total: stats?.length || 0,
      };
    } catch (error) {
      logger.error('Get user stats error:', error);
      throw error;
    }
  }

  /**
   * Search users by username or display name
   * Sprint 7: User search functionality
   */
  async searchUsers(query: string, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      // Search by username or display_name (case-insensitive)
      // Only return public profiles or show basic info for private profiles
      const { data, error, count } = await supabaseAdmin
        .from('users')
        .select(
          'id, username, display_name, bio, avatar_url, is_private, created_at',
          { count: 'exact' }
        )
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .order('username', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('Error searching users:', error);
        throw error;
      }

      // Filter out sensitive info for private profiles
      const results = data?.map((user) => {
        if (user.is_private) {
          return {
            id: user.id,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            is_private: user.is_private,
          };
        }
        return user;
      });

      return {
        data: results || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      logger.error('Search users error:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
