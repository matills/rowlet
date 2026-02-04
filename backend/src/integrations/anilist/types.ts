// AniList GraphQL Types

export interface AniListMedia {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string;
  };
  description: string | null;
  coverImage: {
    large: string;
    extraLarge: string;
  };
  bannerImage: string | null;
  startDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  genres: string[];
  averageScore: number | null;
  episodes: number | null;
  status: 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
  format: 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC';
}

export interface AniListSearchResponse {
  data: {
    Page: {
      media: AniListMedia[];
      pageInfo: {
        total: number;
        currentPage: number;
        lastPage: number;
        hasNextPage: boolean;
        perPage: number;
      };
    };
  };
}

// Unified content type for Owlist
export interface OwlistAnimeContent {
  externalId: string;
  source: 'anilist';
  type: 'anime';
  title: string;
  originalTitle: string;
  year: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string;
  genres: string[];
  rating: number | null;
  episodeCount: number | null;
  seasonCount: null;
  status: string | null;
  rawData: AniListMedia;
}
