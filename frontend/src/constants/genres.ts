import type { Genre } from '@/types'

export const MOVIE_GENRES: Genre[] = [
  { id: 28, name: 'Acción' },
  { id: 12, name: 'Aventura' },
  { id: 16, name: 'Animación' },
  { id: 35, name: 'Comedia' },
  { id: 80, name: 'Crimen' },
  { id: 99, name: 'Documental' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Familia' },
  { id: 14, name: 'Fantasía' },
  { id: 36, name: 'Historia' },
  { id: 27, name: 'Terror' },
  { id: 10402, name: 'Música' },
  { id: 9648, name: 'Misterio' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Ciencia ficción' },
  { id: 10770, name: 'Película de TV' },
  { id: 53, name: 'Suspense' },
  { id: 10752, name: 'Bélica' },
  { id: 37, name: 'Western' },
]

export const TV_GENRES: Genre[] = [
  { id: 10759, name: 'Acción y Aventura' },
  { id: 16, name: 'Animación' },
  { id: 35, name: 'Comedia' },
  { id: 80, name: 'Crimen' },
  { id: 99, name: 'Documental' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Familia' },
  { id: 10762, name: 'Infantil' },
  { id: 9648, name: 'Misterio' },
  { id: 10763, name: 'Noticias' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Ciencia ficción y Fantasía' },
  { id: 10766, name: 'Telenovela' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'Guerra y Política' },
  { id: 37, name: 'Western' },
]

export const ANIME_GENRES: Genre[] = [
  { id: 1, name: 'Acción' },
  { id: 2, name: 'Aventura' },
  { id: 4, name: 'Comedia' },
  { id: 8, name: 'Drama' },
  { id: 10, name: 'Fantasía' },
  { id: 14, name: 'Terror' },
  { id: 22, name: 'Romance' },
  { id: 24, name: 'Ciencia ficción' },
  { id: 36, name: 'Slice of Life' },
  { id: 37, name: 'Sobrenatural' },
  { id: 7, name: 'Misterio' },
  { id: 18, name: 'Mecha' },
  { id: 27, name: 'Shounen' },
  { id: 25, name: 'Shoujo' },
  { id: 41, name: 'Suspenso' },
]

export function getGenresForType(type?: 'movie' | 'tv' | 'anime'): Genre[] {
  switch (type) {
    case 'movie':
      return MOVIE_GENRES
    case 'tv':
      return TV_GENRES
    case 'anime':
      return ANIME_GENRES
    default:
      // For 'all', return a combined unique list
      // Use both ID and name to avoid conflicts between TMDB and Jikan genres
      const uniqueGenres = new Map<string, Genre>()
      const seenIds = new Map<number, string>() // Track which names are using each ID

      ;[...MOVIE_GENRES, ...TV_GENRES, ...ANIME_GENRES].forEach((genre) => {
        // Check if this name already exists
        if (!uniqueGenres.has(genre.name)) {
          // Check if this ID is already used by a different name
          const existingName = seenIds.get(genre.id)
          if (existingName && existingName !== genre.name) {
            // ID conflict detected - skip this genre to avoid confusion
            console.warn(`Genre ID conflict: ${genre.name} (${genre.id}) conflicts with ${existingName}`)
            return
          }

          uniqueGenres.set(genre.name, genre)
          seenIds.set(genre.id, genre.name)
        }
      })

      return Array.from(uniqueGenres.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      )
  }
}
