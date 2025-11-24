import axios from 'axios'
import { env } from '../config/env.js'
import type { TMDBMovie, TMDBTVShow, TMDBSearchResult, Content, Genre } from '../types/index.js'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: env.TMDB_API_KEY,
    language: 'es-ES',
  },
})

// Genre mappings
const movieGenres: Record<number, string> = {
  28: 'Acción', 12: 'Aventura', 16: 'Animación', 35: 'Comedia',
  80: 'Crimen', 99: 'Documental', 18: 'Drama', 10751: 'Familia',
  14: 'Fantasía', 36: 'Historia', 27: 'Terror', 10402: 'Música',
  9648: 'Misterio', 10749: 'Romance', 878: 'Ciencia ficción',
  10770: 'Película de TV', 53: 'Suspense', 10752: 'Bélica', 37: 'Western',
}

const tvGenres: Record<number, string> = {
  10759: 'Acción y Aventura', 16: 'Animación', 35: 'Comedia', 80: 'Crimen',
  99: 'Documental', 18: 'Drama', 10751: 'Familia', 10762: 'Infantil',
  9648: 'Misterio', 10763: 'Noticias', 10764: 'Reality', 10765: 'Ciencia ficción y Fantasía',
  10766: 'Telenovela', 10767: 'Talk', 10768: 'Guerra y Política', 37: 'Western',
}

function mapGenres(genreIds: number[], type: 'movie' | 'tv'): Genre[] {
  const genreMap = type === 'movie' ? movieGenres : tvGenres
  return genreIds.map(id => ({
    id,
    name: genreMap[id] || 'Desconocido',
  }))
}

export function mapTMDBMovieToContent(movie: TMDBMovie): Content {
  return {
    id: `movie-${movie.id}`,
    externalId: String(movie.id),
    type: 'movie',
    title: movie.title,
    originalTitle: movie.original_title,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    overview: movie.overview,
    releaseDate: movie.release_date,
    genres: mapGenres(movie.genre_ids, 'movie'),
    rating: movie.vote_average,
    voteCount: movie.vote_count,
    runtime: movie.runtime,
  }
}

export function mapTMDBTVShowToContent(show: TMDBTVShow): Content {
  return {
    id: `tv-${show.id}`,
    externalId: String(show.id),
    type: 'tv',
    title: show.name,
    originalTitle: show.original_name,
    posterPath: show.poster_path,
    backdropPath: show.backdrop_path,
    overview: show.overview,
    releaseDate: show.first_air_date,
    genres: mapGenres(show.genre_ids, 'tv'),
    rating: show.vote_average,
    voteCount: show.vote_count,
    episodeCount: show.number_of_episodes,
    seasonCount: show.number_of_seasons,
    status: show.status,
  }
}

export const tmdbService = {
  async searchMovies(query: string, page = 1) {
    const { data } = await tmdbClient.get<TMDBSearchResult>('/search/movie', {
      params: { query, page },
    })
    return {
      data: (data.results as TMDBMovie[]).map(mapTMDBMovieToContent),
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    }
  },

  async searchTV(query: string, page = 1) {
    const { data } = await tmdbClient.get<TMDBSearchResult>('/search/tv', {
      params: { query, page },
    })
    return {
      data: (data.results as TMDBTVShow[]).map(mapTMDBTVShowToContent),
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    }
  },

  async getMovieById(id: string) {
    const { data } = await tmdbClient.get<TMDBMovie>(`/movie/${id}`)
    return mapTMDBMovieToContent(data)
  },

  async getTVById(id: string) {
    const { data } = await tmdbClient.get<TMDBTVShow>(`/tv/${id}`)
    return mapTMDBTVShowToContent(data)
  },

  async getTrendingMovies(page = 1) {
    const { data } = await tmdbClient.get<TMDBSearchResult>('/trending/movie/week', {
      params: { page },
    })
    return {
      data: (data.results as TMDBMovie[]).map(mapTMDBMovieToContent),
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    }
  },

  async getTrendingTV(page = 1) {
    const { data } = await tmdbClient.get<TMDBSearchResult>('/trending/tv/week', {
      params: { page },
    })
    return {
      data: (data.results as TMDBTVShow[]).map(mapTMDBTVShowToContent),
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    }
  },

  async discoverByGenre(genreId: number, type: 'movie' | 'tv', page = 1) {
    const { data } = await tmdbClient.get<TMDBSearchResult>(`/discover/${type}`, {
      params: { with_genres: genreId, page },
    })

    if (type === 'movie') {
      return {
        data: (data.results as TMDBMovie[]).map(mapTMDBMovieToContent),
        page: data.page,
        totalPages: data.total_pages,
        totalResults: data.total_results,
      }
    }

    return {
      data: (data.results as TMDBTVShow[]).map(mapTMDBTVShowToContent),
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    }
  },
}
