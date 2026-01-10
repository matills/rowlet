/**
 * Achievement Evaluation Engine
 * Sprint 11 - Motor de Logros
 *
 * This module contains the core logic for evaluating whether a user
 * meets the conditions for unlocking achievements.
 */

import { supabase } from '../config/supabase';
import {
  Achievement,
  AchievementConditionData,
  AchievementConditionType,
  AchievementEvaluationResult,
  WatchedCountCondition,
  WatchedCountTimeframeCondition,
  RatingCountCondition,
  RatingValueCondition,
  GenreDiversityCondition,
  StreakCondition,
  SocialCondition,
  ListCreationCondition,
  CollaborationCondition,
  TimeOfDayCondition,
  CompletionCondition,
  YearFilterCondition,
  LanguageDiversityCondition,
  CountryDiversityCondition,
  PerfectScoreCondition,
  SpeedWatchingCondition,
} from '../types/achievement.types';

/**
 * Base interface for condition evaluators
 */
interface IConditionEvaluator<T extends AchievementConditionData> {
  evaluate(userId: string, condition: T): Promise<AchievementEvaluationResult>;
}

/**
 * Evaluator for WATCHED_COUNT condition
 */
class WatchedCountEvaluator implements IConditionEvaluator<WatchedCountCondition> {
  async evaluate(userId: string, condition: WatchedCountCondition): Promise<AchievementEvaluationResult> {
    const query = supabase
      .from('user_media_list')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Apply media type filter if specified
    if (condition.media_type) {
      const mediaQuery = supabase
        .from('media')
        .select('id')
        .eq('type', condition.media_type);

      const { data: mediaIds } = await mediaQuery;
      if (mediaIds) {
        query.in('media_id', mediaIds.map((m) => m.id));
      }
    }

    // Apply status filter if specified
    if (condition.status) {
      query.eq('status', condition.status);
    } else {
      // Default to completed only
      query.eq('status', 'completed');
    }

    const { count } = await query;
    const currentProgress = count || 0;

    return {
      achievement_id: '',
      achievement_key: '',
      should_unlock: currentProgress >= condition.required_count,
      current_progress: currentProgress,
      required_progress: condition.required_count,
      progress_percentage: Math.round((currentProgress / condition.required_count) * 100),
    };
  }
}

/**
 * Evaluator for WATCHED_COUNT_TIMEFRAME condition
 */
class WatchedCountTimeframeEvaluator implements IConditionEvaluator<WatchedCountTimeframeCondition> {
  async evaluate(
    userId: string,
    condition: WatchedCountTimeframeCondition
  ): Promise<AchievementEvaluationResult> {
    const timeframeStart = new Date();
    timeframeStart.setHours(timeframeStart.getHours() - condition.timeframe_hours);

    const query = supabase
      .from('user_media_list')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', timeframeStart.toISOString());

    if (condition.media_type) {
      const mediaQuery = supabase
        .from('media')
        .select('id')
        .eq('type', condition.media_type);

      const { data: mediaIds } = await mediaQuery;
      if (mediaIds) {
        query.in('media_id', mediaIds.map((m) => m.id));
      }
    }

    const { count } = await query;
    const currentProgress = count || 0;

    return {
      achievement_id: '',
      achievement_key: '',
      should_unlock: currentProgress >= condition.required_count,
      current_progress: currentProgress,
      required_progress: condition.required_count,
      progress_percentage: Math.round((currentProgress / condition.required_count) * 100),
    };
  }
}

/**
 * Evaluator for RATING_COUNT condition
 */
class RatingCountEvaluator implements IConditionEvaluator<RatingCountCondition> {
  async evaluate(userId: string, condition: RatingCountCondition): Promise<AchievementEvaluationResult> {
    const query = supabase
      .from('user_media_list')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('score', 'is', null);

    if (condition.media_type) {
      const mediaQuery = supabase
        .from('media')
        .select('id')
        .eq('type', condition.media_type);

      const { data: mediaIds } = await mediaQuery;
      if (mediaIds) {
        query.in('media_id', mediaIds.map((m) => m.id));
      }
    }

    const { count } = await query;
    const currentProgress = count || 0;

    return {
      achievement_id: '',
      achievement_key: '',
      should_unlock: currentProgress >= condition.required_count,
      current_progress: currentProgress,
      required_progress: condition.required_count,
      progress_percentage: Math.round((currentProgress / condition.required_count) * 100),
    };
  }
}

/**
 * Evaluator for RATING_VALUE condition
 */
class RatingValueEvaluator implements IConditionEvaluator<RatingValueCondition> {
  async evaluate(userId: string, condition: RatingValueCondition): Promise<AchievementEvaluationResult> {
    const query = supabase
      .from('user_media_list')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('score', 'is', null);

    if (condition.min_rating !== undefined) {
      query.gte('score', condition.min_rating);
    }

    if (condition.max_rating !== undefined) {
      query.lte('score', condition.max_rating);
    }

    const { count } = await query;
    const currentProgress = count || 0;

    return {
      achievement_id: '',
      achievement_key: '',
      should_unlock: currentProgress >= condition.required_count,
      current_progress: currentProgress,
      required_progress: condition.required_count,
      progress_percentage: Math.round((currentProgress / condition.required_count) * 100),
    };
  }
}

/**
 * Evaluator for GENRE_DIVERSITY condition
 */
class GenreDiversityEvaluator implements IConditionEvaluator<GenreDiversityCondition> {
  async evaluate(userId: string, condition: GenreDiversityCondition): Promise<AchievementEvaluationResult> {
    // Get all media watched by user
    const { data: userMedia } = await supabase
      .from('user_media_list')
      .select('media_id')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (!userMedia || userMedia.length === 0) {
      return {
        achievement_id: '',
        achievement_key: '',
        should_unlock: false,
        current_progress: 0,
        required_progress: condition.required_genre_count,
        progress_percentage: 0,
      };
    }

    // Get genres for all watched media
    const { data: media } = await supabase
      .from('media')
      .select('genres')
      .in('id', userMedia.map((m) => m.media_id));

    // Collect unique genres
    const uniqueGenres = new Set<string>();
    media?.forEach((m) => {
      m.genres?.forEach((genre: string) => uniqueGenres.add(genre));
    });

    const currentProgress = uniqueGenres.size;

    return {
      achievement_id: '',
      achievement_key: '',
      should_unlock: currentProgress >= condition.required_genre_count,
      current_progress: currentProgress,
      required_progress: condition.required_genre_count,
      progress_percentage: Math.round((currentProgress / condition.required_genre_count) * 100),
    };
  }
}

/**
 * Evaluator for STREAK condition
 * Note: This is a simplified implementation. A production version would need
 * more sophisticated logic to track consecutive periods.
 */
class StreakEvaluator implements IConditionEvaluator<StreakCondition> {
  async evaluate(userId: string, condition: StreakCondition): Promise<AchievementEvaluationResult> {
    // Get all completed media sorted by completion date
    const { data: completions } = await supabase
      .from('user_media_list')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false });

    if (!completions || completions.length === 0) {
      return {
        achievement_id: '',
        achievement_key: '',
        should_unlock: false,
        current_progress: 0,
        required_progress: condition.required_count,
        progress_percentage: 0,
      };
    }

    // Calculate streak based on period
    let currentStreak = 1;
    let previousDate = new Date(completions[0].completed_at);

    for (let i = 1; i < completions.length; i++) {
      const currentDate = new Date(completions[i].completed_at);
      const timeDiff = previousDate.getTime() - currentDate.getTime();

      let periodMs = 0;
      if (condition.period === 'day') {
        periodMs = 24 * 60 * 60 * 1000; // 1 day
      } else if (condition.period === 'week') {
        periodMs = 7 * 24 * 60 * 60 * 1000; // 7 days
      } else if (condition.period === 'month') {
        periodMs = 30 * 24 * 60 * 60 * 1000; // 30 days (approximate)
      }

      // Check if within consecutive periods (allow 2x period for flexibility)
      if (timeDiff <= periodMs * 2) {
        currentStreak++;
      } else {
        break;
      }

      previousDate = currentDate;
    }

    return {
      achievement_id: '',
      achievement_key: '',
      should_unlock: currentStreak >= condition.required_count,
      current_progress: currentStreak,
      required_progress: condition.required_count,
      progress_percentage: Math.round((currentStreak / condition.required_count) * 100),
    };
  }
}

/**
 * Evaluator for SOCIAL condition
 */
class SocialEvaluator implements IConditionEvaluator<SocialCondition> {
  async evaluate(userId: string, condition: SocialCondition): Promise<AchievementEvaluationResult> {
    let count = 0;

    switch (condition.metric) {
      case 'followers': {
        const { count: followersCount } = await supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', userId);
        count = followersCount || 0;
        break;
      }
      case 'following': {
        const { count: followingCount } = await supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', userId);
        count = followingCount || 0;
        break;
      }
      case 'list_shares': {
        const { count: sharesCount } = await supabase
          .from('custom_lists')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_public', true);
        count = sharesCount || 0;
        break;
      }
      case 'collaborations': {
        const { count: collabCount } = await supabase
          .from('list_collaborators')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
        count = collabCount || 0;
        break;
      }
    }

    return {
      achievement_id: '',
      achievement_key: '',
      should_unlock: count >= condition.required_count,
      current_progress: count,
      required_progress: condition.required_count,
      progress_percentage: Math.round((count / condition.required_count) * 100),
    };
  }
}

/**
 * Evaluator for LIST_CREATION condition
 */
class ListCreationEvaluator implements IConditionEvaluator<ListCreationCondition> {
  async evaluate(userId: string, condition: ListCreationCondition): Promise<AchievementEvaluationResult> {
    const { count } = await supabase
      .from('custom_lists')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    const currentProgress = count || 0;

    return {
      achievement_id: '',
      achievement_key: '',
      should_unlock: currentProgress >= condition.required_count,
      current_progress: currentProgress,
      required_progress: condition.required_count,
      progress_percentage: Math.round((currentProgress / condition.required_count) * 100),
    };
  }
}

/**
 * Evaluator for COLLABORATION condition
 */
class CollaborationEvaluator implements IConditionEvaluator<CollaborationCondition> {
  async evaluate(userId: string, condition: CollaborationCondition): Promise<AchievementEvaluationResult> {
    const query = supabase
      .from('list_collaborators')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (condition.role) {
      query.eq('role', condition.role);
    }

    const { count } = await query;
    const currentProgress = count || 0;

    return {
      achievement_id: '',
      achievement_key: '',
      should_unlock: currentProgress >= condition.required_count,
      current_progress: currentProgress,
      required_progress: condition.required_count,
      progress_percentage: Math.round((currentProgress / condition.required_count) * 100),
    };
  }
}

/**
 * Evaluator for TIME_OF_DAY condition
 * Note: This requires tracking completion timestamps with hour precision
 */
class TimeOfDayEvaluator implements IConditionEvaluator<TimeOfDayCondition> {
  async evaluate(userId: string, condition: TimeOfDayCondition): Promise<AchievementEvaluationResult> {
    // Get all completions with timestamps
    const { data: completions } = await supabase
      .from('user_media_list')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .not('completed_at', 'is', null);

    if (!completions || completions.length === 0) {
      return {
        achievement_id: '',
        achievement_key: '',
        should_unlock: false,
        current_progress: 0,
        required_progress: condition.required_count,
        progress_percentage: 0,
      };
    }

    // Count completions within time range
    const validCompletions = completions.filter((c) => {
      const date = new Date(c.completed_at);
      const hour = date.getHours();

      if (condition.start_hour <= condition.end_hour) {
        return hour >= condition.start_hour && hour < condition.end_hour;
      } else {
        // Handles cases like 22:00 to 06:00 (overnight)
        return hour >= condition.start_hour || hour < condition.end_hour;
      }
    });

    const currentProgress = validCompletions.length;

    return {
      achievement_id: '',
      achievement_key: '',
      should_unlock: currentProgress >= condition.required_count,
      current_progress: currentProgress,
      required_progress: condition.required_count,
      progress_percentage: Math.round((currentProgress / condition.required_count) * 100),
    };
  }
}

/**
 * Evaluator for COMPLETION condition
 */
class CompletionEvaluator implements IConditionEvaluator<CompletionCondition> {
  async evaluate(userId: string, condition: CompletionCondition): Promise<AchievementEvaluationResult> {
    // Get completed media of specified type
    const { data: completedMedia } = await supabase
      .from('user_media_list')
      .select('media_id')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (!completedMedia || completedMedia.length === 0) {
      return {
        achievement_id: '',
        achievement_key: '',
        should_unlock: false,
        current_progress: 0,
        required_progress: condition.required_count,
        progress_percentage: 0,
      };
    }

    // Filter by media type and episode count
    const query = supabase
      .from('media')
      .select('id', { count: 'exact', head: true })
      .in('id', completedMedia.map((m) => m.media_id))
      .eq('type', condition.media_type);

    if (condition.min_episodes) {
      query.gte('total_episodes', condition.min_episodes);
    }

    const { count } = await query;
    const currentProgress = count || 0;

    return {
      achievement_id: '',
      achievement_key: '',
      should_unlock: currentProgress >= condition.required_count,
      current_progress: currentProgress,
      required_progress: condition.required_count,
      progress_percentage: Math.round((currentProgress / condition.required_count) * 100),
    };
  }
}

/**
 * Evaluator for YEAR_FILTER condition
 */
class YearFilterEvaluator implements IConditionEvaluator<YearFilterCondition> {
  async evaluate(userId: string, condition: YearFilterCondition): Promise<AchievementEvaluationResult> {
    // Get completed media
    const { data: completedMedia } = await supabase
      .from('user_media_list')
      .select('media_id')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (!completedMedia || completedMedia.length === 0) {
      return {
        achievement_id: '',
        achievement_key: '',
        should_unlock: false,
        current_progress: 0,
        required_progress: condition.required_count,
        progress_percentage: 0,
      };
    }

    // Get media with year filters
    const query = supabase
      .from('media')
      .select('id', { count: 'exact', head: true })
      .in('id', completedMedia.map((m) => m.media_id))
      .not('release_date', 'is', null);

    // Apply year filters by querying release_date
    if (condition.before_year) {
      query.lt('release_date', `${condition.before_year}-01-01`);
    }

    if (condition.after_year) {
      query.gte('release_date', `${condition.after_year}-01-01`);
    }

    const { count } = await query;
    const currentProgress = count || 0;

    return {
      achievement_id: '',
      achievement_key: '',
      should_unlock: currentProgress >= condition.required_count,
      current_progress: currentProgress,
      required_progress: condition.required_count,
      progress_percentage: Math.round((currentProgress / condition.required_count) * 100),
    };
  }
}

/**
 * Evaluator for LANGUAGE_DIVERSITY condition
 * Note: Requires language data in media table
 */
class LanguageDiversityEvaluator implements IConditionEvaluator<LanguageDiversityCondition> {
  async evaluate(userId: string, condition: LanguageDiversityCondition): Promise<AchievementEvaluationResult> {
    // This would require a language field in the media table
    // For now, return a placeholder implementation
    return {
      achievement_id: '',
      achievement_key: '',
      should_unlock: false,
      current_progress: 0,
      required_progress: condition.required_language_count,
      progress_percentage: 0,
    };
  }
}

/**
 * Evaluator for COUNTRY_DIVERSITY condition
 * Note: Requires country data in media table
 */
class CountryDiversityEvaluator implements IConditionEvaluator<CountryDiversityCondition> {
  async evaluate(userId: string, condition: CountryDiversityCondition): Promise<AchievementEvaluationResult> {
    // This would require a country field in the media table
    // For now, return a placeholder implementation
    return {
      achievement_id: '',
      achievement_key: '',
      should_unlock: false,
      current_progress: 0,
      required_progress: condition.required_country_count,
      progress_percentage: 0,
    };
  }
}

/**
 * Evaluator for PERFECT_SCORE condition
 */
class PerfectScoreEvaluator implements IConditionEvaluator<PerfectScoreCondition> {
  async evaluate(userId: string, condition: PerfectScoreCondition): Promise<AchievementEvaluationResult> {
    const { count } = await supabase
      .from('user_media_list')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('score', 10);

    const currentProgress = count || 0;

    return {
      achievement_id: '',
      achievement_key: '',
      should_unlock: currentProgress >= condition.required_count,
      current_progress: currentProgress,
      required_progress: condition.required_count,
      progress_percentage: Math.round((currentProgress / condition.required_count) * 100),
    };
  }
}

/**
 * Evaluator for SPEED_WATCHING condition
 */
class SpeedWatchingEvaluator implements IConditionEvaluator<SpeedWatchingCondition> {
  async evaluate(userId: string, condition: SpeedWatchingCondition): Promise<AchievementEvaluationResult> {
    // Get completed series/anime
    const { data: completedMedia } = await supabase
      .from('user_media_list')
      .select('media_id, started_at, completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .not('started_at', 'is', null)
      .not('completed_at', 'is', null);

    if (!completedMedia || completedMedia.length === 0) {
      return {
        achievement_id: '',
        achievement_key: '',
        should_unlock: false,
        current_progress: 0,
        required_progress: 1,
        progress_percentage: 0,
      };
    }

    // Check each completion for speed watching
    let foundSpeedWatch = false;

    for (const entry of completedMedia) {
      const { data: media } = await supabase
        .from('media')
        .select('total_episodes, type')
        .eq('id', entry.media_id)
        .in('type', ['series', 'anime'])
        .single();

      if (!media || !media.total_episodes) continue;

      if (media.total_episodes >= condition.min_episodes) {
        const startDate = new Date(entry.started_at);
        const endDate = new Date(entry.completed_at);
        const hoursDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

        if (hoursDiff <= condition.max_hours) {
          foundSpeedWatch = true;
          break;
        }
      }
    }

    return {
      achievement_id: '',
      achievement_key: '',
      should_unlock: foundSpeedWatch,
      current_progress: foundSpeedWatch ? 1 : 0,
      required_progress: 1,
      progress_percentage: foundSpeedWatch ? 100 : 0,
    };
  }
}

/**
 * Achievement Engine - Main class for evaluating achievements
 */
export class AchievementEngine {
  private evaluators: Map<AchievementConditionType, IConditionEvaluator<any>>;

  constructor() {
    this.evaluators = new Map();
    this.registerEvaluators();
  }

  /**
   * Register all condition evaluators
   */
  private registerEvaluators(): void {
    this.evaluators.set(AchievementConditionType.WATCHED_COUNT, new WatchedCountEvaluator());
    this.evaluators.set(AchievementConditionType.WATCHED_COUNT_TIMEFRAME, new WatchedCountTimeframeEvaluator());
    this.evaluators.set(AchievementConditionType.RATING_COUNT, new RatingCountEvaluator());
    this.evaluators.set(AchievementConditionType.RATING_VALUE, new RatingValueEvaluator());
    this.evaluators.set(AchievementConditionType.GENRE_DIVERSITY, new GenreDiversityEvaluator());
    this.evaluators.set(AchievementConditionType.STREAK, new StreakEvaluator());
    this.evaluators.set(AchievementConditionType.SOCIAL, new SocialEvaluator());
    this.evaluators.set(AchievementConditionType.LIST_CREATION, new ListCreationEvaluator());
    this.evaluators.set(AchievementConditionType.COLLABORATION, new CollaborationEvaluator());
    this.evaluators.set(AchievementConditionType.TIME_OF_DAY, new TimeOfDayEvaluator());
    this.evaluators.set(AchievementConditionType.COMPLETION, new CompletionEvaluator());
    this.evaluators.set(AchievementConditionType.YEAR_FILTER, new YearFilterEvaluator());
    this.evaluators.set(AchievementConditionType.LANGUAGE_DIVERSITY, new LanguageDiversityEvaluator());
    this.evaluators.set(AchievementConditionType.COUNTRY_DIVERSITY, new CountryDiversityEvaluator());
    this.evaluators.set(AchievementConditionType.PERFECT_SCORE, new PerfectScoreEvaluator());
    this.evaluators.set(AchievementConditionType.SPEED_WATCHING, new SpeedWatchingEvaluator());
  }

  /**
   * Evaluate a single achievement for a user
   */
  async evaluateAchievement(userId: string, achievement: Achievement): Promise<AchievementEvaluationResult> {
    const evaluator = this.evaluators.get(achievement.condition_type);

    if (!evaluator) {
      throw new Error(`No evaluator found for condition type: ${achievement.condition_type}`);
    }

    const result = await evaluator.evaluate(userId, achievement.condition_data);

    // Populate achievement info
    result.achievement_id = achievement.id;
    result.achievement_key = achievement.key;

    return result;
  }

  /**
   * Evaluate all achievements for a user
   */
  async evaluateAllAchievements(userId: string): Promise<AchievementEvaluationResult[]> {
    // Get all active achievements
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to fetch achievements: ${error.message}`);
    }

    if (!achievements || achievements.length === 0) {
      return [];
    }

    // Evaluate each achievement
    const results: AchievementEvaluationResult[] = [];

    for (const achievement of achievements) {
      try {
        const result = await this.evaluateAchievement(userId, achievement as Achievement);
        results.push(result);
      } catch (error: any) {
        console.error(`Error evaluating achievement ${achievement.key}:`, error.message);
      }
    }

    return results;
  }

  /**
   * Evaluate achievements that might be triggered by a specific event
   * This is used by event listeners to only check relevant achievements
   */
  async evaluateByConditionType(
    userId: string,
    conditionTypes: AchievementConditionType[]
  ): Promise<AchievementEvaluationResult[]> {
    // Get achievements matching the condition types
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .in('condition_type', conditionTypes);

    if (error) {
      throw new Error(`Failed to fetch achievements: ${error.message}`);
    }

    if (!achievements || achievements.length === 0) {
      return [];
    }

    // Evaluate each achievement
    const results: AchievementEvaluationResult[] = [];

    for (const achievement of achievements) {
      try {
        const result = await this.evaluateAchievement(userId, achievement as Achievement);
        results.push(result);
      } catch (error: any) {
        console.error(`Error evaluating achievement ${achievement.key}:`, error.message);
      }
    }

    return results;
  }
}

// Export singleton instance
export const achievementEngine = new AchievementEngine();
