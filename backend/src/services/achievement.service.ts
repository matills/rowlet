/**
 * Achievement Service
 * Sprint 11 - Motor de Logros
 *
 * Main service for managing achievements, user achievements, and XP/leveling
 */

import { supabase } from '../config/supabase';
import { achievementEngine } from './achievement-engine';
import { notifyAchievementUnlock } from './achievement-notification';
import {
  Achievement,
  UserAchievement,
  UserAchievementDetails,
  UserXP,
  AchievementUnlockResult,
  AchievementEvaluationResult,
  GetAchievementsQuery,
  GetUserAchievementsQuery,
  UserAchievementProgress,
  LevelUpResult,
  AchievementConditionType,
} from '../types/achievement.types';
import logger from '../config/logger';

export class AchievementService {
  /**
   * Get all achievements with optional filtering
   */
  async getAchievements(query: GetAchievementsQuery = {}): Promise<Achievement[]> {
    const { rarity, is_hidden, is_active = true, limit = 100, offset = 0 } = query;

    let dbQuery = supabase
      .from('achievements')
      .select('*')
      .eq('is_active', is_active)
      .order('display_order', { ascending: true })
      .range(offset, offset + limit - 1);

    if (rarity) {
      dbQuery = dbQuery.eq('rarity', rarity);
    }

    if (is_hidden !== undefined) {
      dbQuery = dbQuery.eq('is_hidden', is_hidden);
    }

    const { data, error } = await dbQuery;

    if (error) {
      logger.error('Error fetching achievements:', error);
      throw new Error(`Failed to fetch achievements: ${error.message}`);
    }

    return (data || []) as Achievement[];
  }

  /**
   * Get a single achievement by ID
   */
  async getAchievementById(achievementId: string): Promise<Achievement | null> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      logger.error('Error fetching achievement:', error);
      throw new Error(`Failed to fetch achievement: ${error.message}`);
    }

    return data as Achievement;
  }

  /**
   * Get a single achievement by key
   */
  async getAchievementByKey(key: string): Promise<Achievement | null> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      logger.error('Error fetching achievement:', error);
      throw new Error(`Failed to fetch achievement: ${error.message}`);
    }

    return data as Achievement;
  }

  /**
   * Get user's achievements with details
   */
  async getUserAchievements(
    userId: string,
    query: GetUserAchievementsQuery = {}
  ): Promise<UserAchievementDetails[]> {
    const { unlocked_only, in_progress_only, rarity, limit = 100, offset = 0 } = query;

    let dbQuery = supabase
      .from('user_achievement_details')
      .select('*')
      .eq('user_id', userId)
      .range(offset, offset + limit - 1);

    if (unlocked_only) {
      dbQuery = dbQuery.eq('is_unlocked', true);
    }

    if (in_progress_only) {
      dbQuery = dbQuery.eq('is_unlocked', false).gt('current_progress', 0);
    }

    if (rarity) {
      dbQuery = dbQuery.eq('rarity', rarity);
    }

    const { data, error } = await dbQuery;

    if (error) {
      logger.error('Error fetching user achievements:', error);
      throw new Error(`Failed to fetch user achievements: ${error.message}`);
    }

    return (data || []) as UserAchievementDetails[];
  }

  /**
   * Get user's achievement progress summary
   */
  async getUserAchievementProgress(userId: string): Promise<UserAchievementProgress> {
    // Get all achievements
    const achievements = await this.getAchievements({ is_active: true });
    const totalAchievements = achievements.length;

    // Get user's achievements
    const { data: userAchievements, error: uaError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    if (uaError) {
      throw new Error(`Failed to fetch user achievements: ${uaError.message}`);
    }

    const unlockedCount = (userAchievements || []).filter((ua) => ua.is_unlocked).length;
    const completionPercentage = totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0;

    // Get user XP
    const userXp = await this.getUserXP(userId);

    // Get achievements in progress (has progress but not unlocked)
    const inProgressDetails = await this.getUserAchievements(userId, {
      in_progress_only: true,
      limit: 10,
    });

    // Get recent unlocks (last 10)
    const recentUnlocks = await this.getUserAchievements(userId, {
      unlocked_only: true,
      limit: 10,
    });

    // Calculate XP for next level
    const xpForNextLevel = await this.calculateXPForNextLevel(userXp.level);

    return {
      total_achievements: totalAchievements,
      unlocked_count: unlockedCount,
      completion_percentage: completionPercentage,
      total_xp: userXp.total_xp,
      level: userXp.level,
      xp_for_next_level: xpForNextLevel,
      achievements_in_progress: inProgressDetails,
      recent_unlocks: recentUnlocks,
    };
  }

  /**
   * Get or create user's XP record
   */
  async getUserXP(userId: string): Promise<UserXP> {
    const { data, error } = await supabase
      .from('user_xp')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Create new XP record
        return await this.createUserXP(userId);
      }
      throw new Error(`Failed to fetch user XP: ${error.message}`);
    }

    return data as UserXP;
  }

  /**
   * Create user XP record
   */
  private async createUserXP(userId: string): Promise<UserXP> {
    const { data, error } = await supabase
      .from('user_xp')
      .insert({
        user_id: userId,
        total_xp: 0,
        level: 1,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user XP: ${error.message}`);
    }

    return data as UserXP;
  }

  /**
   * Add XP to user and handle level ups
   */
  async addUserXP(userId: string, xpAmount: number): Promise<LevelUpResult> {
    const { data, error } = await supabase.rpc('add_user_xp', {
      p_user_id: userId,
      p_xp_amount: xpAmount,
    });

    if (error) {
      logger.error('Error adding user XP:', error);
      throw new Error(`Failed to add user XP: ${error.message}`);
    }

    const result = data[0] as LevelUpResult;

    if (result.leveled_up) {
      logger.info(`User ${userId} leveled up to level ${result.new_level}!`);
      // Here you could trigger a notification or event
    }

    return result;
  }

  /**
   * Calculate XP required for next level
   */
  private async calculateXPForNextLevel(currentLevel: number): Promise<number> {
    const { data, error } = await supabase.rpc('xp_for_next_level', {
      current_level: currentLevel,
    });

    if (error) {
      throw new Error(`Failed to calculate XP for next level: ${error.message}`);
    }

    return data as number;
  }

  /**
   * Initialize user achievements
   * Creates user_achievement records for all achievements with 0 progress
   */
  async initializeUserAchievements(userId: string): Promise<void> {
    // Get all active achievements
    const achievements = await this.getAchievements({ is_active: true });

    // Get existing user achievements
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const existingIds = new Set((existing || []).map((ua) => ua.achievement_id));

    // Create records for achievements that don't exist yet
    const toCreate = achievements
      .filter((a) => !existingIds.has(a.id))
      .map((a) => ({
        user_id: userId,
        achievement_id: a.id,
        current_progress: 0,
        required_progress: this.getRequiredProgress(a),
        is_unlocked: false,
      }));

    if (toCreate.length > 0) {
      const { error } = await supabase.from('user_achievements').insert(toCreate);

      if (error) {
        logger.error('Error initializing user achievements:', error);
        throw new Error(`Failed to initialize user achievements: ${error.message}`);
      }
    }
  }

  /**
   * Extract required progress from achievement condition
   */
  private getRequiredProgress(achievement: Achievement): number {
    const condition = achievement.condition_data;

    if ('required_count' in condition) {
      return condition.required_count;
    }
    if ('required_genre_count' in condition) {
      return condition.required_genre_count;
    }
    if ('required_language_count' in condition) {
      return condition.required_language_count;
    }
    if ('required_country_count' in condition) {
      return condition.required_country_count;
    }

    return 1; // Default for binary achievements (speed_watching, etc.)
  }

  /**
   * Unlock an achievement for a user
   */
  async unlockAchievement(userId: string, achievementId: string): Promise<AchievementUnlockResult> {
    const achievement = await this.getAchievementById(achievementId);

    if (!achievement) {
      throw new Error('Achievement not found');
    }

    // Check if already unlocked
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();

    if (existing && existing.is_unlocked) {
      return {
        achievement,
        unlocked: false,
        already_unlocked: true,
        xp_awarded: 0,
      };
    }

    // Unlock the achievement
    const { error } = await supabase
      .from('user_achievements')
      .update({
        is_unlocked: true,
        unlocked_at: new Date().toISOString(),
        current_progress: this.getRequiredProgress(achievement),
      })
      .eq('user_id', userId)
      .eq('achievement_id', achievementId);

    if (error) {
      logger.error('Error unlocking achievement:', error);
      throw new Error(`Failed to unlock achievement: ${error.message}`);
    }

    // Award XP
    const levelUpInfo = await this.addUserXP(userId, achievement.xp_reward);

    logger.info(`User ${userId} unlocked achievement: ${achievement.key} (+${achievement.xp_reward} XP)`);

    // Send notification
    await notifyAchievementUnlock({
      userId,
      achievement,
      xpAwarded: achievement.xp_reward,
      levelUpInfo,
    });

    return {
      achievement,
      unlocked: true,
      already_unlocked: false,
      xp_awarded: achievement.xp_reward,
      level_up_info: levelUpInfo,
    };
  }

  /**
   * Update progress for an achievement
   */
  async updateAchievementProgress(
    userId: string,
    achievementId: string,
    progress: number
  ): Promise<UserAchievement> {
    const { data, error } = await supabase
      .from('user_achievements')
      .update({
        current_progress: progress,
      })
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating achievement progress:', error);
      throw new Error(`Failed to update achievement progress: ${error.message}`);
    }

    return data as UserAchievement;
  }

  /**
   * Evaluate and unlock achievements for a user
   * This is the main function to check and unlock achievements
   */
  async evaluateAndUnlockAchievements(
    userId: string,
    conditionTypes?: AchievementConditionType[]
  ): Promise<AchievementUnlockResult[]> {
    // Initialize user achievements if needed
    await this.initializeUserAchievements(userId);

    // Evaluate achievements
    const evaluations = conditionTypes
      ? await achievementEngine.evaluateByConditionType(userId, conditionTypes)
      : await achievementEngine.evaluateAllAchievements(userId);

    const results: AchievementUnlockResult[] = [];

    for (const evaluation of evaluations) {
      // Update progress
      await this.updateAchievementProgress(userId, evaluation.achievement_id, evaluation.current_progress);

      // Unlock if should unlock
      if (evaluation.should_unlock) {
        const result = await this.unlockAchievement(userId, evaluation.achievement_id);
        if (result.unlocked) {
          results.push(result);
        }
      }
    }

    return results;
  }

  /**
   * Get public achievements for a user (for viewing other users' profiles)
   */
  async getPublicUserAchievements(username: string): Promise<UserAchievementDetails[]> {
    // Get user by username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, is_private')
      .eq('username', username)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    // Check if profile is private
    if (user.is_private) {
      throw new Error('User profile is private');
    }

    // Get unlocked achievements only
    return await this.getUserAchievements(user.id, { unlocked_only: true });
  }

  /**
   * Get achievement statistics (how many users have unlocked)
   */
  async getAchievementStats(): Promise<any[]> {
    const { data, error } = await supabase.from('achievement_stats').select('*');

    if (error) {
      logger.error('Error fetching achievement stats:', error);
      throw new Error(`Failed to fetch achievement stats: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get leaderboard for achievements (users with most achievements unlocked)
   */
  async getAchievementLeaderboard(limit: number = 10): Promise<any[]> {
    const { data, error } = await supabase
      .rpc('get_achievement_leaderboard', { p_limit: limit });

    if (error) {
      logger.error('Error fetching achievement leaderboard:', error);
      // Return empty array if the function doesn't exist yet
      return [];
    }

    return data || [];
  }
}

// Export singleton instance
export const achievementService = new AchievementService();
