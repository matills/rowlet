/**
 * User Statistics Types
 * Types for Sprint 6: User Basic Statistics
 */

export interface UserStats {
  // Basic counts by status
  watching: number;
  completed: number;
  plan_to_watch: number;
  on_hold: number;
  dropped: number;
  total: number;
}

export interface UserStatsGeneral extends UserStats {
  // Content by type
  totalByType: {
    movie: number;
    series: number;
    anime: number;
  };

  // Completed content by type
  completedByType: {
    movie: number;
    series: number;
    anime: number;
  };

  // Time invested (in minutes)
  totalTimeInvested: number;
  totalTimeInvestedFormatted: string; // e.g., "1200h 30m"

  // Average rating
  averageRating: number | null;
  totalRatings: number;

  // Streak information
  currentStreak: number; // days
  longestStreak: number; // days

  // Most active period
  mostActiveMonth: {
    month: string; // e.g., "2024-01"
    count: number;
  } | null;

  mostActiveYear: {
    year: string; // e.g., "2024"
    count: number;
  } | null;
}

export interface GenreStats {
  genre: string;
  count: number;
  percentage: number;
  totalTime: number; // in minutes
}

export interface UserStatsGenres {
  topGenres: GenreStats[];
  totalGenres: number;
}

export interface TimelineDataPoint {
  date: string; // ISO date
  count: number;
  type?: 'movie' | 'series' | 'anime';
}

export interface MonthlyActivity {
  month: string; // e.g., "2024-01"
  count: number;
  byType: {
    movie: number;
    series: number;
    anime: number;
  };
}

export interface UserStatsTimeline {
  // Activity by month
  monthlyActivity: MonthlyActivity[];

  // Activity by year
  yearlyActivity: {
    year: string;
    count: number;
  }[];

  // Current and longest streaks
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;

  // Most active periods
  mostActiveMonth: MonthlyActivity | null;
  mostActiveYear: {
    year: string;
    count: number;
  } | null;
}
