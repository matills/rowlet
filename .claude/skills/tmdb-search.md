# Skill: /tmdb-search

## Descripción
Busca contenido en TMDB API y proporciona código de integración para Owlist.

## Uso

```bash
/tmdb-search <type> "<query>" [opciones]
```

### Tipos
- `movies`: Buscar películas
- `series` o `tv`: Buscar series
- `multi`: Buscar en ambos
- `person`: Buscar actores/directores

### Opciones
- `--year`: Filtrar por año
- `--page`: Número de página (default: 1)
- `--language`: Idioma (default: es-ES)

### Ejemplos

```bash
/tmdb-search movies "Inception"
/tmdb-search series "Breaking Bad" --year=2008
/tmdb-search multi "Naruto"
/tmdb-search person "Christopher Nolan"
```

## Output

### 1. Resultados de búsqueda

```
🎬 TMDB Search Results: "Inception"

1. Inception (2010)
   ID: 27205
   Rating: 8.8 ⭐
   Overview: Dom Cobb es un ladrón con una extraña habilidad...
   Poster: https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg

2. Inception: The Cobol Job (2010)
   ID: 64688
   Rating: 7.2 ⭐
   ...

Total results: 12
Current page: 1/1
```

### 2. Código de integración

```typescript
// Código generado para integrar en Owlist

// 1. Definir el tipo
interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

// 2. Función de búsqueda
async function searchMovies(query: string, page: number = 1) {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?` +
    `api_key=${process.env.TMDB_API_KEY}&` +
    `query=${encodeURIComponent(query)}&` +
    `language=es-ES&` +
    `page=${page}`
  );

  if (!response.ok) {
    throw new Error('TMDB API error');
  }

  const data = await response.json();
  return data;
}

// 3. Transformar para Owlist
function transformToOwlistFormat(tmdbMovie: TMDBMovie) {
  return {
    externalId: tmdbMovie.id.toString(),
    type: 'MOVIE' as const,
    title: tmdbMovie.title,
    posterUrl: tmdbMovie.poster_path
      ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
      : null,
    backdropUrl: tmdbMovie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${tmdbMovie.backdrop_path}`
      : null,
    releaseYear: new Date(tmdbMovie.release_date).getFullYear(),
    rating: tmdbMovie.vote_average,
    overview: tmdbMovie.overview,
    apiSource: 'tmdb',
  };
}

// 4. Ejemplo de uso
const results = await searchMovies('Inception');
const owlistMovies = results.results.map(transformToOwlistFormat);
```

### 3. Info de rate limits

```
📊 Rate Limit Status
Limit: 40 requests / 10 seconds
Used this session: 1
Response time: 234ms
```

## Prompt Interno

Cuando el usuario ejecuta `/tmdb-search`, realizo:

1. **Verificar API key**: Check si existe `TMDB_API_KEY` en env
2. **Construir URL** con parámetros correctos
3. **Fetch TMDB API**
4. **Parsear resultados**
5. **Formatear output** user-friendly
6. **Generar código** de integración adaptado al tipo
7. **Incluir transformación** a formato Owlist
8. **Mostrar rate limit** info

## Endpoints TMDB por Tipo

### Movies
```
GET /search/movie
  ?api_key={key}
  &query={query}
  &language=es-ES
  &page=1
  &year={year}
```

### Series
```
GET /search/tv
  ?api_key={key}
  &query={query}
  &language=es-ES
  &page=1
  &first_air_date_year={year}
```

### Multi (movies + series)
```
GET /search/multi
  ?api_key={key}
  &query={query}
  &language=es-ES
  &page=1
```

### Person
```
GET /search/person
  ?api_key={key}
  &query={query}
  &language=es-ES
  &page=1
```

## Transformaciones por Tipo

### Movie → Owlist Content
```typescript
{
  externalId: String(id),
  type: 'MOVIE',
  title: title,
  posterUrl: poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : null,
  releaseYear: new Date(release_date).getFullYear(),
  genres: genre_ids, // Necesitarás mapear a nombres después
  apiSource: 'tmdb',
}
```

### TV → Owlist Content
```typescript
{
  externalId: String(id),
  type: 'SERIES',
  title: name,
  posterUrl: poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : null,
  releaseYear: new Date(first_air_date).getFullYear(),
  genres: genre_ids,
  apiSource: 'tmdb',
}
```

## Helpers Generados

### Service completo
```typescript
// lib/tmdb/search.ts
import { cache } from 'react';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

export const searchContent = cache(async (
  query: string,
  type: 'movie' | 'tv' | 'multi' = 'multi',
  options?: {
    page?: number;
    year?: number;
  }
) => {
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY!,
    query,
    language: 'es-ES',
    page: String(options?.page ?? 1),
  });

  if (options?.year) {
    if (type === 'movie') {
      params.set('year', String(options.year));
    } else if (type === 'tv') {
      params.set('first_air_date_year', String(options.year));
    }
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/search/${type}?${params}`,
    {
      next: { revalidate: 3600 }, // Cache 1 hour
    }
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }

  return response.json();
});
```

### Hook para cliente
```typescript
// hooks/useTMDBSearch.ts
import { useState, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export function useTMDBSearch(type: 'movie' | 'tv' | 'multi') {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  const search = useCallback(async () => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search/tmdb?query=${encodeURIComponent(debouncedQuery)}&type=${type}`
      );
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, type]);

  useEffect(() => {
    search();
  }, [search]);

  return { query, setQuery, results, isLoading };
}
```

## Mapeo de Géneros

```typescript
// lib/tmdb/genres.ts
export const MOVIE_GENRES: Record<number, string> = {
  28: 'Acción',
  12: 'Aventura',
  16: 'Animación',
  35: 'Comedia',
  80: 'Crimen',
  99: 'Documental',
  18: 'Drama',
  10751: 'Familia',
  14: 'Fantasía',
  36: 'Historia',
  27: 'Terror',
  10402: 'Música',
  9648: 'Misterio',
  10749: 'Romance',
  878: 'Ciencia ficción',
  10770: 'Película de TV',
  53: 'Suspenso',
  10752: 'Bélica',
  37: 'Western',
};

export const TV_GENRES: Record<number, string> = {
  10759: 'Acción & Aventura',
  16: 'Animación',
  35: 'Comedia',
  80: 'Crimen',
  99: 'Documental',
  18: 'Drama',
  10751: 'Familia',
  10762: 'Kids',
  9648: 'Misterio',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
  37: 'Western',
};
```

## Caché Strategy

```typescript
// Caché en Next.js con revalidación
export const searchMovies = cache(async (query: string) => {
  // ...fetch logic
}, {
  next: {
    revalidate: 3600, // 1 hour
    tags: ['tmdb-search'],
  }
});
```

## Notas

- Rate limit: 40 requests / 10 segundos
- Todas las imágenes usan: `https://image.tmdb.org/t/p/{size}/{path}`
- Sizes disponibles: w92, w154, w185, w342, w500, w780, original
- Cache agresivo recomendado (1 hora+)
- Incluir fallbacks para posters nulos
