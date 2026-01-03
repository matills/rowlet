import { mediaService } from '../services/media.service';
import { tmdbService } from '../services/external/tmdb.service';
import { anilistService } from '../services/external/anilist.service';
import { logger } from '../config/logger';

/**
 * Seed database with initial popular content
 */
async function seedDatabase() {
  logger.info('🌱 Starting database seeding...');

  try {
    // Import popular movies from TMDB
    logger.info('📽️  Importing popular movies...');
    const popularMovies = await tmdbService.getPopularMovies(1);

    let movieCount = 0;
    for (const movie of popularMovies.results.slice(0, 10)) {
      try {
        await mediaService.importMedia(
          movie.id.toString(),
          'tmdb',
          'movie'
        );
        movieCount++;
        logger.info(`  ✓ Imported movie: ${movie.title}`);
      } catch (error: any) {
        if (error.message === 'Media already imported') {
          logger.debug(`  ⚠ Movie already exists: ${movie.title}`);
        } else {
          logger.error(`  ✗ Failed to import movie ${movie.title}:`, error.message);
        }
      }
    }
    logger.info(`✓ Imported ${movieCount} movies`);

    // Import popular series from TMDB
    logger.info('📺 Importing popular series...');
    const popularSeries = await tmdbService.getPopularSeries(1);

    let seriesCount = 0;
    for (const series of popularSeries.results.slice(0, 10)) {
      try {
        await mediaService.importMedia(
          series.id.toString(),
          'tmdb',
          'series'
        );
        seriesCount++;
        logger.info(`  ✓ Imported series: ${series.name}`);
      } catch (error: any) {
        if (error.message === 'Media already imported') {
          logger.debug(`  ⚠ Series already exists: ${series.name}`);
        } else {
          logger.error(`  ✗ Failed to import series ${series.name}:`, error.message);
        }
      }
    }
    logger.info(`✓ Imported ${seriesCount} series`);

    // Import popular anime from AniList
    logger.info('🎌 Importing popular anime...');
    const popularAnime = await anilistService.getPopularAnime(1, 10);

    let animeCount = 0;
    for (const anime of popularAnime.Page.media) {
      try {
        await mediaService.importMedia(
          anime.id.toString(),
          'anilist',
          'anime'
        );
        animeCount++;
        const title = anime.title.english || anime.title.romaji;
        logger.info(`  ✓ Imported anime: ${title}`);
      } catch (error: any) {
        const title = anime.title.english || anime.title.romaji;
        if (error.message === 'Media already imported') {
          logger.debug(`  ⚠ Anime already exists: ${title}`);
        } else {
          logger.error(`  ✗ Failed to import anime ${title}:`, error.message);
        }
      }
    }
    logger.info(`✓ Imported ${animeCount} anime`);

    logger.info('');
    logger.info('✅ Database seeding completed successfully!');
    logger.info(`📊 Summary: ${movieCount} movies, ${seriesCount} series, ${animeCount} anime`);

    process.exit(0);
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
