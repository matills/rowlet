import { useQuery } from '@tanstack/react-query';
import { useUserContent } from './useUserContent';

export interface UserStats {
  totalItems: number;
  byStatus: {
    watched: number;
    watching: number;
    want_to_watch: number;
    dropped: number;
    paused: number;
  };
  byType: {
    movie: number;
    series: number;
    anime: number;
  };
  topGenres: Array<{ genre: string; count: number }>;
  averageRating: number | null;
  totalEpisodesWatched: number;
}

export function useStats() {
  const { data: allContent } = useUserContent();

  return useQuery({
    queryKey: ['stats', allContent?.items?.length],
    queryFn: () => {
      if (!allContent?.items) {
        return {
          totalItems: 0,
          byStatus: {
            watched: 0,
            watching: 0,
            want_to_watch: 0,
            dropped: 0,
            paused: 0,
          },
          byType: {
            movie: 0,
            series: 0,
            anime: 0,
          },
          topGenres: [],
          averageRating: null,
          totalEpisodesWatched: 0,
        };
      }

      const items = allContent.items;

      // Calculate stats
      const stats: UserStats = {
        totalItems: items.length,
        byStatus: {
          watched: 0,
          watching: 0,
          want_to_watch: 0,
          dropped: 0,
          paused: 0,
        },
        byType: {
          movie: 0,
          series: 0,
          anime: 0,
        },
        topGenres: [],
        averageRating: null,
        totalEpisodesWatched: 0,
      };

      const genreCount: Record<string, number> = {};
      let totalRating = 0;
      let ratingCount = 0;

      items.forEach((item: any) => {
        // Count by status
        if (item.status in stats.byStatus) {
          stats.byStatus[item.status as keyof typeof stats.byStatus]++;
        }

        // Count by type
        if (item.content.type in stats.byType) {
          stats.byType[item.content.type as keyof typeof stats.byType]++;
        }

        // Count genres
        if (item.content.genres) {
          item.content.genres.forEach((genre: string) => {
            genreCount[genre] = (genreCount[genre] || 0) + 1;
          });
        }

        // Average rating
        if (item.rating) {
          totalRating += item.rating;
          ratingCount++;
        }

        // Total episodes watched
        if (item.episodes_watched) {
          stats.totalEpisodesWatched += item.episodes_watched;
        }
      });

      // Calculate average rating
      if (ratingCount > 0) {
        stats.averageRating = Number((totalRating / ratingCount).toFixed(1));
      }

      // Get top 5 genres
      stats.topGenres = Object.entries(genreCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([genre, count]) => ({ genre, count }));

      return stats;
    },
    enabled: !!allContent?.items,
  });
}
