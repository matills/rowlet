import { supabaseAdmin } from '../config/supabase';
import { logger } from '../config/logger';
import type {
  UserStatsGeneral,
  UserStatsGenres,
  UserStatsTimeline,
  GenreStats,
  MonthlyActivity,
} from '../types/stats.types';

export class UserStatsService {
  /**
   * Get comprehensive user statistics
   * General statistics including counts by type, time invested, ratings, streaks
   */
  async getUserStatsGeneral(userId: string): Promise<UserStatsGeneral> {
    try {
      // Fetch all user media list entries with related media data
      const { data: userMediaList, error } = await supabaseAdmin
        .from('user_media_list')
        .select(`
          *,
          media:media_id (
            id,
            title,
            type,
            total_episodes,
            episode_duration,
            genres
          )
        `)
        .eq('user_id', userId);

      if (error) {
        logger.error('Error fetching user media list:', error);
        throw error;
      }

      const mediaList = userMediaList || [];

      // Count by status
      const statusCounts = mediaList.reduce((acc: any, item: any) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});

      // Count by type
      const totalByType = {
        movie: 0,
        series: 0,
        anime: 0,
      };

      const completedByType = {
        movie: 0,
        series: 0,
        anime: 0,
      };

      let totalTimeInvested = 0;
      const ratings: number[] = [];

      // Process each media item
      mediaList.forEach((item: any) => {
        const media = item.media;
        if (!media) return;

        const mediaType = media.type as 'movie' | 'series' | 'anime';
        totalByType[mediaType]++;

        if (item.status === 'completed') {
          completedByType[mediaType]++;
        }

        // Calculate time invested
        if (item.status === 'completed' || item.status === 'watching') {
          if (mediaType === 'movie') {
            // For movies, use episode_duration (runtime)
            totalTimeInvested += media.episode_duration || 0;
          } else {
            // For series/anime, use episodes_watched * episode_duration
            const episodesWatched = item.episodes_watched || 0;
            const episodeDuration = media.episode_duration || 0;
            totalTimeInvested += episodesWatched * episodeDuration;
          }
        }

        // Collect ratings
        if (item.score !== null && item.score !== undefined) {
          ratings.push(item.score);
        }
      });

      // Calculate average rating
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : null;

      // Format time invested
      const hours = Math.floor(totalTimeInvested / 60);
      const minutes = totalTimeInvested % 60;
      const totalTimeInvestedFormatted = `${hours}h ${minutes}m`;

      // Calculate streaks
      const { currentStreak, longestStreak } = this.calculateStreaks(mediaList);

      // Find most active month and year
      const completedItems = mediaList.filter((item: any) => item.completed_at);
      const { mostActiveMonth, mostActiveYear } = this.calculateMostActive(completedItems);

      return {
        watching: statusCounts.watching || 0,
        completed: statusCounts.completed || 0,
        plan_to_watch: statusCounts.plan_to_watch || 0,
        on_hold: statusCounts.on_hold || 0,
        dropped: statusCounts.dropped || 0,
        total: mediaList.length,
        totalByType,
        completedByType,
        totalTimeInvested,
        totalTimeInvestedFormatted,
        averageRating: averageRating !== null ? Math.round(averageRating * 10) / 10 : null,
        totalRatings: ratings.length,
        currentStreak,
        longestStreak,
        mostActiveMonth,
        mostActiveYear,
      };
    } catch (error) {
      logger.error('Get user stats general error:', error);
      throw error;
    }
  }

  /**
   * Get user statistics by genre
   * Genre distribution
   */
  async getUserStatsGenres(userId: string): Promise<UserStatsGenres> {
    try {
      // Fetch completed media with genres
      const { data: userMediaList, error } = await supabaseAdmin
        .from('user_media_list')
        .select(`
          *,
          media:media_id (
            id,
            title,
            genres,
            episode_duration,
            total_episodes
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (error) {
        logger.error('Error fetching user media for genres:', error);
        throw error;
      }

      const mediaList = userMediaList || [];

      // Count genres
      const genreMap = new Map<string, { count: number; totalTime: number }>();
      let totalMedia = 0;

      mediaList.forEach((item: any) => {
        const media = item.media;
        if (!media || !media.genres) return;

        totalMedia++;
        const genres = media.genres as string[];

        genres.forEach((genre: string) => {
          const current = genreMap.get(genre) || { count: 0, totalTime: 0 };
          current.count++;

          // Add time
          const episodeDuration = media.episode_duration || 0;
          const episodesWatched = item.episodes_watched || media.total_episodes || 1;
          current.totalTime += episodeDuration * episodesWatched;

          genreMap.set(genre, current);
        });
      });

      // Convert to array and calculate percentages
      const topGenres: GenreStats[] = Array.from(genreMap.entries())
        .map(([genre, data]) => ({
          genre,
          count: data.count,
          percentage: totalMedia > 0 ? Math.round((data.count / totalMedia) * 100) : 0,
          totalTime: data.totalTime,
        }))
        .sort((a, b) => b.count - a.count);

      return {
        topGenres,
        totalGenres: genreMap.size,
      };
    } catch (error) {
      logger.error('Get user stats genres error:', error);
      throw error;
    }
  }

  /**
   * Get user statistics timeline
   * Activity over time and streaks
   */
  async getUserStatsTimeline(userId: string): Promise<UserStatsTimeline> {
    try {
      // Fetch all completed media with dates
      const { data: userMediaList, error } = await supabaseAdmin
        .from('user_media_list')
        .select(`
          *,
          media:media_id (
            id,
            title,
            type
          )
        `)
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: true });

      if (error) {
        logger.error('Error fetching user media for timeline:', error);
        throw error;
      }

      const mediaList = userMediaList || [];

      // Group by month
      const monthlyMap = new Map<string, { count: number; byType: { movie: number; series: number; anime: number } }>();
      const yearlyMap = new Map<string, number>();

      mediaList.forEach((item: any) => {
        if (!item.completed_at) return;

        const date = new Date(item.completed_at);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const year = String(date.getFullYear());
        const mediaType = item.media?.type || 'movie';

        // Monthly activity
        const monthData = monthlyMap.get(month) || { count: 0, byType: { movie: 0, series: 0, anime: 0 } };
        monthData.count++;
        monthData.byType[mediaType as 'movie' | 'series' | 'anime']++;
        monthlyMap.set(month, monthData);

        // Yearly activity
        yearlyMap.set(year, (yearlyMap.get(year) || 0) + 1);
      });

      // Convert to arrays
      const monthlyActivity: MonthlyActivity[] = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({
          month,
          count: data.count,
          byType: data.byType,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      const yearlyActivity = Array.from(yearlyMap.entries())
        .map(([year, count]) => ({ year, count }))
        .sort((a, b) => a.year.localeCompare(b.year));

      // Calculate streaks
      const { currentStreak, longestStreak } = this.calculateStreaks(mediaList);

      // Find most active periods
      const mostActiveMonth = monthlyActivity.length > 0
        ? monthlyActivity.reduce((max, current) => current.count > max.count ? current : max)
        : null;

      const mostActiveYear = yearlyActivity.length > 0
        ? yearlyActivity.reduce((max, current) => current.count > max.count ? current : max)
        : null;

      const lastActivityDate = mediaList.length > 0
        ? mediaList[mediaList.length - 1].completed_at
        : null;

      return {
        monthlyActivity,
        yearlyActivity,
        currentStreak,
        longestStreak,
        lastActivityDate,
        mostActiveMonth,
        mostActiveYear,
      };
    } catch (error) {
      logger.error('Get user stats timeline error:', error);
      throw error;
    }
  }

  /**
   * Helper: Calculate current and longest viewing streaks
   */
  private calculateStreaks(mediaList: any[]): { currentStreak: number; longestStreak: number } {
    if (mediaList.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Get all completion dates sorted
    const dates = mediaList
      .filter((item: any) => item.completed_at)
      .map((item: any) => new Date(item.completed_at).toISOString().split('T')[0])
      .sort();

    if (dates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Remove duplicates
    const uniqueDates = [...new Set(dates)];

    let currentStreak = 1;
    let longestStreak = 1;
    let tempStreak = 1;

    const today = new Date().toISOString().split('T')[0];
    const lastDate = uniqueDates[uniqueDates.length - 1];

    // Calculate longest streak
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak (only if last activity was recent)
    const daysSinceLastActivity = Math.floor((new Date(today).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastActivity <= 1) {
      // Active today or yesterday
      currentStreak = 1;
      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const prevDate = new Date(uniqueDates[i]);
        const currDate = new Date(uniqueDates[i + 1]);
        const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else {
      currentStreak = 0;
    }

    return { currentStreak, longestStreak };
  }

  /**
   * Helper: Calculate most active month and year
   */
  private calculateMostActive(completedItems: any[]): {
    mostActiveMonth: { month: string; count: number } | null;
    mostActiveYear: { year: string; count: number } | null;
  } {
    if (completedItems.length === 0) {
      return { mostActiveMonth: null, mostActiveYear: null };
    }

    const monthMap = new Map<string, number>();
    const yearMap = new Map<string, number>();

    completedItems.forEach((item: any) => {
      const date = new Date(item.completed_at);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const year = String(date.getFullYear());

      monthMap.set(month, (monthMap.get(month) || 0) + 1);
      yearMap.set(year, (yearMap.get(year) || 0) + 1);
    });

    const mostActiveMonth = monthMap.size > 0
      ? Array.from(monthMap.entries()).reduce((max, current) => current[1] > max[1] ? current : max)
      : null;

    const mostActiveYear = yearMap.size > 0
      ? Array.from(yearMap.entries()).reduce((max, current) => current[1] > max[1] ? current : max)
      : null;

    return {
      mostActiveMonth: mostActiveMonth ? { month: mostActiveMonth[0], count: mostActiveMonth[1] } : null,
      mostActiveYear: mostActiveYear ? { year: mostActiveYear[0], count: mostActiveYear[1] } : null,
    };
  }
}

export const userStatsService = new UserStatsService();
