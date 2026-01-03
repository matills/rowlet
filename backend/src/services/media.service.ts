import { supabaseAdmin } from '../config/supabase';
import { logger } from '../config/logger';
import type {
  MediaSearchInput,
  CreateMediaInput,
  UpdateMediaInput,
  MediaType,
  MediaSource,
} from '../validators/media.validators';
import { tmdbService, type TMDBMovie, type TMDBSeries } from './external/tmdb.service';
import { anilistService, type AniListAnime } from './external/anilist.service';

export class MediaService {
  /**
   * Search media in database with filters and pagination
   */
  async searchMedia(params: MediaSearchInput) {
    try {
      const { search, type, genre, year, page, limit } = params;
      const offset = (page - 1) * limit;

      let query = supabaseAdmin
        .from('media')
        .select('*', { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,original_title.ilike.%${search}%`);
      }

      if (type) {
        query = query.eq('type', type);
      }

      if (genre) {
        query = query.contains('genres', [genre]);
      }

      if (year) {
        query = query.gte('release_date', `${year}-01-01`)
          .lte('release_date', `${year}-12-31`);
      }

      // Apply pagination
      query = query
        .range(offset, offset + limit - 1)
        .order('popularity', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        logger.error('Search media error:', error);
        throw error;
      }

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      logger.error('Search media service error:', error);
      throw error;
    }
  }

  /**
   * Get media by ID with seasons and episodes
   */
  async getMediaById(mediaId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('media')
        .select('*')
        .eq('id', mediaId)
        .single();

      if (error) {
        logger.error('Get media by ID error:', error);
        throw error;
      }

      // If it's a series or anime, fetch seasons
      if (data.type === 'series' || data.type === 'anime') {
        const { data: seasons, error: seasonsError } = await supabaseAdmin
          .from('seasons')
          .select('*')
          .eq('media_id', mediaId)
          .order('season_number', { ascending: true });

        if (seasonsError) {
          logger.warn('Get seasons error:', seasonsError);
        }

        return {
          ...data,
          seasons: seasons || [],
        };
      }

      return data;
    } catch (error) {
      logger.error('Get media service error:', error);
      throw error;
    }
  }

  /**
   * Create new media
   */
  async createMedia(mediaData: CreateMediaInput) {
    try {
      const { data, error } = await supabaseAdmin
        .from('media')
        .insert(mediaData)
        .select()
        .single();

      if (error) {
        logger.error('Create media error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Create media service error:', error);
      throw error;
    }
  }

  /**
   * Update media
   */
  async updateMedia(mediaId: string, mediaData: UpdateMediaInput) {
    try {
      const updateData = {
        ...mediaData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseAdmin
        .from('media')
        .update(updateData)
        .eq('id', mediaId)
        .select()
        .single();

      if (error) {
        logger.error('Update media error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Update media service error:', error);
      throw error;
    }
  }

  /**
   * Delete media
   */
  async deleteMedia(mediaId: string) {
    try {
      const { error } = await supabaseAdmin
        .from('media')
        .delete()
        .eq('id', mediaId);

      if (error) {
        logger.error('Delete media error:', error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      logger.error('Delete media service error:', error);
      throw error;
    }
  }

  /**
   * Get seasons for a series/anime
   */
  async getSeasons(mediaId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('seasons')
        .select('*')
        .eq('media_id', mediaId)
        .order('season_number', { ascending: true });

      if (error) {
        logger.error('Get seasons error:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Get seasons service error:', error);
      throw error;
    }
  }

  /**
   * Get episodes for a season
   */
  async getEpisodes(seasonId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('episodes')
        .select('*')
        .eq('season_id', seasonId)
        .order('episode_number', { ascending: true });

      if (error) {
        logger.error('Get episodes error:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Get episodes service error:', error);
      throw error;
    }
  }

  /**
   * Search external APIs
   */
  async searchExternal(query: string, type: MediaType, page: number = 1) {
    try {
      if (type === 'anime') {
        const result = await anilistService.searchAnime(query, page);
        return {
          source: 'anilist' as MediaSource,
          results: result.Page.media.map((anime) => this.transformAniListToMedia(anime)),
          pagination: {
            page: result.Page.pageInfo.currentPage,
            totalPages: result.Page.pageInfo.lastPage,
            total: result.Page.pageInfo.total,
          },
        };
      } else if (type === 'movie') {
        const result = await tmdbService.searchMovies(query, page);
        return {
          source: 'tmdb' as MediaSource,
          results: result.results.map((movie) => this.transformTMDBMovieToMedia(movie)),
          pagination: {
            page: result.page,
            totalPages: result.total_pages,
            total: result.total_results,
          },
        };
      } else if (type === 'series') {
        const result = await tmdbService.searchSeries(query, page);
        return {
          source: 'tmdb' as MediaSource,
          results: result.results.map((series) => this.transformTMDBSeriesToMedia(series)),
          pagination: {
            page: result.page,
            totalPages: result.total_pages,
            total: result.total_results,
          },
        };
      }

      throw new Error('Invalid media type');
    } catch (error) {
      logger.error('Search external service error:', error);
      throw error;
    }
  }

  /**
   * Import media from external API
   */
  async importMedia(externalId: string, source: MediaSource, type: MediaType) {
    try {
      // Check if already exists
      const { data: existing } = await supabaseAdmin
        .from('media')
        .select('id')
        .eq('source', source)
        .eq('external_id', externalId)
        .single();

      if (existing) {
        throw new Error('Media already imported');
      }

      let mediaData: CreateMediaInput;

      if (source === 'tmdb') {
        if (type === 'movie') {
          const movie = await tmdbService.getMovieDetails(parseInt(externalId));
          mediaData = this.transformTMDBMovieToCreateInput(movie);
        } else if (type === 'series') {
          const series = await tmdbService.getSeriesDetails(parseInt(externalId));
          mediaData = this.transformTMDBSeriesToCreateInput(series);

          // Import seasons and episodes
          const createdMedia = await this.createMedia(mediaData);
          if (series.number_of_seasons) {
            await this.importTMDBSeasons(createdMedia.id, parseInt(externalId), series.number_of_seasons);
          }
          return createdMedia;
        } else {
          throw new Error('Invalid type for TMDB');
        }
      } else if (source === 'anilist') {
        const anime = await anilistService.getAnimeDetails(parseInt(externalId));
        mediaData = this.transformAniListToCreateInput(anime);
      } else {
        throw new Error('Invalid source');
      }

      return await this.createMedia(mediaData);
    } catch (error) {
      logger.error('Import media service error:', error);
      throw error;
    }
  }

  /**
   * Import TMDB seasons and episodes
   */
  private async importTMDBSeasons(mediaId: string, seriesId: number, numberOfSeasons: number) {
    try {
      for (let seasonNum = 1; seasonNum <= numberOfSeasons; seasonNum++) {
        const seasonData = await tmdbService.getSeasonDetails(seriesId, seasonNum);

        const { data: season, error } = await supabaseAdmin
          .from('seasons')
          .insert({
            media_id: mediaId,
            season_number: seasonData.season_number,
            name: seasonData.name,
            overview: seasonData.overview,
            poster_path: seasonData.poster_path,
            air_date: seasonData.air_date || null,
            episode_count: seasonData.episode_count,
            external_id: seasonData.id.toString(),
            tmdb_data: seasonData,
          })
          .select()
          .single();

        if (error) {
          logger.error(`Error importing season ${seasonNum}:`, error);
          continue;
        }

        // Import episodes
        if (seasonData.episodes) {
          const episodesData = seasonData.episodes.map((ep) => ({
            season_id: season.id,
            episode_number: ep.episode_number,
            name: ep.name,
            overview: ep.overview,
            still_path: ep.still_path,
            air_date: ep.air_date || null,
            runtime: ep.runtime,
            external_id: ep.id.toString(),
            tmdb_data: ep,
          }));

          const { error: episodesError } = await supabaseAdmin
            .from('episodes')
            .insert(episodesData);

          if (episodesError) {
            logger.error(`Error importing episodes for season ${seasonNum}:`, episodesError);
          }
        }
      }
    } catch (error) {
      logger.error('Import TMDB seasons error:', error);
      throw error;
    }
  }

  // Transform functions
  private transformTMDBMovieToMedia(movie: TMDBMovie) {
    return {
      externalId: movie.id.toString(),
      title: movie.title,
      originalTitle: movie.original_title,
      overview: movie.overview,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      releaseDate: movie.release_date,
      score: movie.vote_average,
      popularity: movie.popularity,
    };
  }

  private transformTMDBSeriesToMedia(series: TMDBSeries) {
    return {
      externalId: series.id.toString(),
      title: series.name,
      originalTitle: series.original_name,
      overview: series.overview,
      posterPath: series.poster_path,
      backdropPath: series.backdrop_path,
      releaseDate: series.first_air_date,
      score: series.vote_average,
      popularity: series.popularity,
    };
  }

  private transformAniListToMedia(anime: AniListAnime) {
    const releaseDate = anime.startDate.year && anime.startDate.month && anime.startDate.day
      ? `${anime.startDate.year}-${String(anime.startDate.month).padStart(2, '0')}-${String(anime.startDate.day).padStart(2, '0')}`
      : null;

    return {
      externalId: anime.id.toString(),
      title: anime.title.english || anime.title.romaji,
      originalTitle: anime.title.native,
      overview: anime.description?.replace(/<[^>]*>/g, ''), // Remove HTML tags
      posterPath: anime.coverImage.large,
      backdropPath: anime.bannerImage,
      releaseDate,
      score: anime.averageScore ? anime.averageScore / 10 : null,
      popularity: anime.popularity,
      episodes: anime.episodes,
    };
  }

  private transformTMDBMovieToCreateInput(movie: TMDBMovie): CreateMediaInput {
    return {
      title: movie.title,
      original_title: movie.original_title,
      overview: movie.overview,
      type: 'movie',
      source: 'tmdb',
      external_id: movie.id.toString(),
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date || null,
      genres: movie.genres?.map((g) => g.name) || [],
      score: movie.vote_average,
      popularity: movie.popularity,
      total_episodes: 1,
      episode_duration: movie.runtime,
      tmdb_data: movie,
    };
  }

  private transformTMDBSeriesToCreateInput(series: TMDBSeries): CreateMediaInput {
    return {
      title: series.name,
      original_title: series.original_name,
      overview: series.overview,
      type: 'series',
      source: 'tmdb',
      external_id: series.id.toString(),
      poster_path: series.poster_path,
      backdrop_path: series.backdrop_path,
      release_date: series.first_air_date || null,
      end_date: series.last_air_date || null,
      genres: series.genres?.map((g) => g.name) || [],
      score: series.vote_average,
      popularity: series.popularity,
      total_episodes: series.number_of_episodes,
      episode_duration: series.episode_run_time?.[0],
      status: series.status,
      tmdb_data: series,
    };
  }

  private transformAniListToCreateInput(anime: AniListAnime): CreateMediaInput {
    const formatMap: Record<string, any> = {
      TV: 'tv',
      MOVIE: 'movie',
      OVA: 'ova',
      ONA: 'ona',
      SPECIAL: 'special',
      MUSIC: 'music',
    };

    const releaseDate = anime.startDate.year && anime.startDate.month && anime.startDate.day
      ? `${anime.startDate.year}-${String(anime.startDate.month).padStart(2, '0')}-${String(anime.startDate.day).padStart(2, '0')}`
      : null;

    const endDate = anime.endDate.year && anime.endDate.month && anime.endDate.day
      ? `${anime.endDate.year}-${String(anime.endDate.month).padStart(2, '0')}-${String(anime.endDate.day).padStart(2, '0')}`
      : null;

    return {
      title: anime.title.english || anime.title.romaji,
      original_title: anime.title.native,
      overview: anime.description?.replace(/<[^>]*>/g, '') || '', // Remove HTML tags
      type: 'anime',
      subtype: formatMap[anime.format] || 'tv',
      source: 'anilist',
      external_id: anime.id.toString(),
      poster_path: anime.coverImage.large,
      backdrop_path: anime.bannerImage,
      release_date: releaseDate,
      end_date: endDate,
      genres: anime.genres,
      studios: anime.studios.nodes.map((s) => s.name),
      score: anime.averageScore ? anime.averageScore / 10 : null,
      popularity: anime.popularity,
      total_episodes: anime.episodes,
      episode_duration: anime.duration,
      status: anime.status,
      anilist_data: anime,
    };
  }

  /**
   * Get trending content
   */
  async getTrending(type: MediaType, timeWindow: 'day' | 'week', page: number = 1) {
    try {
      if (type === 'anime') {
        const result = await anilistService.getTrendingAnime(page);
        return {
          source: 'anilist' as MediaSource,
          results: result.Page.media.map((anime) => this.transformAniListToMedia(anime)),
          pagination: {
            page: result.Page.pageInfo.currentPage,
            totalPages: result.Page.pageInfo.lastPage,
            total: result.Page.pageInfo.total,
          },
        };
      } else {
        const tmdbType = type === 'movie' ? 'movie' : 'tv';
        const result = await tmdbService.getTrending(tmdbType, timeWindow, page);

        const transformFn = type === 'movie'
          ? this.transformTMDBMovieToMedia.bind(this)
          : this.transformTMDBSeriesToMedia.bind(this);

        return {
          source: 'tmdb' as MediaSource,
          results: result.results.map(transformFn),
          pagination: {
            page: result.page,
            totalPages: result.total_pages,
            total: result.total_results,
          },
        };
      }
    } catch (error) {
      logger.error('Get trending service error:', error);
      throw error;
    }
  }

  /**
   * Get popular content
   */
  async getPopular(type: MediaType, page: number = 1) {
    try {
      if (type === 'anime') {
        const result = await anilistService.getPopularAnime(page);
        return {
          source: 'anilist' as MediaSource,
          results: result.Page.media.map((anime) => this.transformAniListToMedia(anime)),
          pagination: {
            page: result.Page.pageInfo.currentPage,
            totalPages: result.Page.pageInfo.lastPage,
            total: result.Page.pageInfo.total,
          },
        };
      } else if (type === 'movie') {
        const result = await tmdbService.getPopularMovies(page);
        return {
          source: 'tmdb' as MediaSource,
          results: result.results.map((movie) => this.transformTMDBMovieToMedia(movie)),
          pagination: {
            page: result.page,
            totalPages: result.total_pages,
            total: result.total_results,
          },
        };
      } else if (type === 'series') {
        const result = await tmdbService.getPopularSeries(page);
        return {
          source: 'tmdb' as MediaSource,
          results: result.results.map((series) => this.transformTMDBSeriesToMedia(series)),
          pagination: {
            page: result.page,
            totalPages: result.total_pages,
            total: result.total_results,
          },
        };
      }

      throw new Error('Invalid media type');
    } catch (error) {
      logger.error('Get popular service error:', error);
      throw error;
    }
  }
}

export const mediaService = new MediaService();
