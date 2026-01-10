/**
 * Achievement System Type Definitions
 * Sprint 11 - Motor de Logros
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum AchievementRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export enum AchievementConditionType {
  WATCHED_COUNT = 'watched_count',
  WATCHED_COUNT_TIMEFRAME = 'watched_count_timeframe',
  RATING_COUNT = 'rating_count',
  RATING_VALUE = 'rating_value',
  GENRE_DIVERSITY = 'genre_diversity',
  STREAK = 'streak',
  SOCIAL = 'social',
  LIST_CREATION = 'list_creation',
  COLLABORATION = 'collaboration',
  TIME_OF_DAY = 'time_of_day',
  COMPLETION = 'completion',
  YEAR_FILTER = 'year_filter',
  LANGUAGE_DIVERSITY = 'language_diversity',
  COUNTRY_DIVERSITY = 'country_diversity',
  PERFECT_SCORE = 'perfect_score',
  SPEED_WATCHING = 'speed_watching',
  MANUAL = 'manual',
}

// ============================================================================
// CONDITION DATA INTERFACES
// ============================================================================

/**
 * Base condition interface
 */
export interface BaseCondition {
  type: AchievementConditionType;
}

/**
 * Condition: User has watched X amount of content
 */
export interface WatchedCountCondition extends BaseCondition {
  type: AchievementConditionType.WATCHED_COUNT;
  required_count: number;
  media_type?: 'movie' | 'series' | 'anime'; // Optional filter
  status?: 'completed' | 'watching'; // Optional status filter
}

/**
 * Condition: User has watched X content in Y timeframe
 */
export interface WatchedCountTimeframeCondition extends BaseCondition {
  type: AchievementConditionType.WATCHED_COUNT_TIMEFRAME;
  required_count: number;
  timeframe_hours: number; // e.g., 48 for weekend, 168 for week
  media_type?: 'movie' | 'series' | 'anime';
}

/**
 * Condition: User has given X ratings
 */
export interface RatingCountCondition extends BaseCondition {
  type: AchievementConditionType.RATING_COUNT;
  required_count: number;
  media_type?: 'movie' | 'series' | 'anime';
}

/**
 * Condition: User has given ratings with specific values
 */
export interface RatingValueCondition extends BaseCondition {
  type: AchievementConditionType.RATING_VALUE;
  required_count: number;
  min_rating?: number; // e.g., 9 for "easy to please"
  max_rating?: number; // e.g., 3 for "harsh critic"
}

/**
 * Condition: User has watched content from X different genres
 */
export interface GenreDiversityCondition extends BaseCondition {
  type: AchievementConditionType.GENRE_DIVERSITY;
  required_genre_count: number;
}

/**
 * Condition: User has maintained a streak
 */
export interface StreakCondition extends BaseCondition {
  type: AchievementConditionType.STREAK;
  required_count: number;
  period: 'day' | 'week' | 'month';
}

/**
 * Condition: Social metrics (followers, following, etc.)
 */
export interface SocialCondition extends BaseCondition {
  type: AchievementConditionType.SOCIAL;
  metric: 'followers' | 'following' | 'list_shares' | 'collaborations';
  required_count: number;
}

/**
 * Condition: User has created X lists
 */
export interface ListCreationCondition extends BaseCondition {
  type: AchievementConditionType.LIST_CREATION;
  required_count: number;
}

/**
 * Condition: User has participated in X collaborative lists
 */
export interface CollaborationCondition extends BaseCondition {
  type: AchievementConditionType.COLLABORATION;
  required_count: number;
  role?: 'admin' | 'editor' | 'viewer'; // Optional role filter
}

/**
 * Condition: User has watched content at specific times
 */
export interface TimeOfDayCondition extends BaseCondition {
  type: AchievementConditionType.TIME_OF_DAY;
  required_count: number;
  start_hour: number; // 0-23
  end_hour: number; // 0-23
}

/**
 * Condition: User has completed X series/anime
 */
export interface CompletionCondition extends BaseCondition {
  type: AchievementConditionType.COMPLETION;
  required_count: number;
  media_type: 'series' | 'anime';
  min_episodes?: number; // Optional minimum episode count
}

/**
 * Condition: User has watched content from specific years
 */
export interface YearFilterCondition extends BaseCondition {
  type: AchievementConditionType.YEAR_FILTER;
  required_count: number;
  before_year?: number; // e.g., 2000 for "classics"
  after_year?: number; // e.g., 2024 for "modern viewer"
}

/**
 * Condition: User has watched content in X languages
 */
export interface LanguageDiversityCondition extends BaseCondition {
  type: AchievementConditionType.LANGUAGE_DIVERSITY;
  required_language_count: number;
}

/**
 * Condition: User has watched content from X countries
 */
export interface CountryDiversityCondition extends BaseCondition {
  type: AchievementConditionType.COUNTRY_DIVERSITY;
  required_country_count: number;
}

/**
 * Condition: User has given X perfect scores (10/10)
 */
export interface PerfectScoreCondition extends BaseCondition {
  type: AchievementConditionType.PERFECT_SCORE;
  required_count: number;
}

/**
 * Condition: User has watched a series quickly
 */
export interface SpeedWatchingCondition extends BaseCondition {
  type: AchievementConditionType.SPEED_WATCHING;
  min_episodes: number; // Minimum episode count of the series
  max_hours: number; // Maximum time to complete
}

/**
 * Condition: Manually unlocked (for special events)
 */
export interface ManualCondition extends BaseCondition {
  type: AchievementConditionType.MANUAL;
}

/**
 * Union type of all possible condition data
 */
export type AchievementConditionData =
  | WatchedCountCondition
  | WatchedCountTimeframeCondition
  | RatingCountCondition
  | RatingValueCondition
  | GenreDiversityCondition
  | StreakCondition
  | SocialCondition
  | ListCreationCondition
  | CollaborationCondition
  | TimeOfDayCondition
  | CompletionCondition
  | YearFilterCondition
  | LanguageDiversityCondition
  | CountryDiversityCondition
  | PerfectScoreCondition
  | SpeedWatchingCondition
  | ManualCondition;

// ============================================================================
// MAIN INTERFACES
// ============================================================================

/**
 * Achievement definition from database
 */
export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon_url?: string;
  rarity: AchievementRarity;
  xp_reward: number;
  condition_type: AchievementConditionType;
  condition_data: AchievementConditionData;
  display_order: number;
  is_hidden: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * User's achievement progress/unlock status
 */
export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  current_progress: number;
  required_progress: number;
  unlocked_at?: string;
  is_unlocked: boolean;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * User XP and level information
 */
export interface UserXP {
  user_id: string;
  total_xp: number;
  level: number;
  created_at: string;
  updated_at: string;
}

/**
 * Combined user achievement with achievement details
 */
export interface UserAchievementDetails extends UserAchievement {
  achievement: Achievement;
  progress_percentage: number;
}

/**
 * Achievement statistics
 */
export interface AchievementStats {
  achievement_id: string;
  key: string;
  name: string;
  rarity: AchievementRarity;
  unlock_count: number;
  total_users: number;
  unlock_percentage: number;
}

/**
 * User progress summary
 */
export interface UserAchievementProgress {
  total_achievements: number;
  unlocked_count: number;
  completion_percentage: number;
  total_xp: number;
  level: number;
  xp_for_next_level: number;
  achievements_in_progress: UserAchievementDetails[];
  recent_unlocks: UserAchievementDetails[];
}

/**
 * Level up result
 */
export interface LevelUpResult {
  new_total_xp: number;
  new_level: number;
  leveled_up: boolean;
}

/**
 * Achievement unlock result
 */
export interface AchievementUnlockResult {
  achievement: Achievement;
  unlocked: boolean;
  already_unlocked: boolean;
  xp_awarded: number;
  level_up_info?: LevelUpResult;
}

/**
 * Achievement evaluation result
 */
export interface AchievementEvaluationResult {
  achievement_id: string;
  achievement_key: string;
  should_unlock: boolean;
  current_progress: number;
  required_progress: number;
  progress_percentage: number;
}

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

/**
 * DTO for creating a new achievement
 */
export interface CreateAchievementDTO {
  key: string;
  name: string;
  description: string;
  icon_url?: string;
  rarity: AchievementRarity;
  xp_reward: number;
  condition_type: AchievementConditionType;
  condition_data: AchievementConditionData;
  display_order?: number;
  is_hidden?: boolean;
  is_active?: boolean;
}

/**
 * DTO for updating an achievement
 */
export interface UpdateAchievementDTO {
  name?: string;
  description?: string;
  icon_url?: string;
  rarity?: AchievementRarity;
  xp_reward?: number;
  display_order?: number;
  is_hidden?: boolean;
  is_active?: boolean;
}

/**
 * Query params for getting achievements
 */
export interface GetAchievementsQuery {
  rarity?: AchievementRarity;
  is_hidden?: boolean;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Query params for getting user achievements
 */
export interface GetUserAchievementsQuery {
  unlocked_only?: boolean;
  in_progress_only?: boolean;
  rarity?: AchievementRarity;
  limit?: number;
  offset?: number;
}
