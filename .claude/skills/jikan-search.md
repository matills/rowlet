# Skill: /jikan-search

## Descripción
Busca anime/manga en Jikan API (MyAnimeList) y proporciona código de integración para Owlist.

## Uso

```bash
/jikan-search <type> "<query>" [opciones]
```

### Tipos
- `anime`: Buscar anime
- `manga`: Buscar manga
- `characters`: Buscar personajes
- `people`: Buscar personas (voice actors, autores)

### Opciones
- `--page`: Número de página (default: 1)
- `--sfw`: Solo contenido SFW (default: true)
- `--limit`: Resultados por página (max: 25)
- `--order_by`: Ordenar por (title, score, members, favorites)

### Ejemplos

```bash
/jikan-search anime "One Piece"
/jikan-search manga "Berserk" --order_by=score
/jikan-search anime "Naruto" --page=2
/jikan-search characters "Eren Yeager"
```

## Output

### 1. Resultados de búsqueda

```
📺 Jikan Search Results: "One Piece"

1. One Piece
   MAL ID: 21
   Type: TV
   Episodes: Unknown
   Score: 8.72 ⭐
   Status: Currently Airing
   Aired: Oct 20, 1999 - ?
   Synopsis: Gol D. Roger was known as the "Pirate King,"...
   Image: https://cdn.myanimelist.net/images/anime/6/73245.jpg

2. One Piece Film: Red
   MAL ID: 50608
   Type: Movie
   Episodes: 1
   Score: 7.89 ⭐
   ...

Total results: 147
Current page: 1/6
```

### 2. Código de integración

```typescript
// Código generado para integrar en Owlist

// 1. Definir tipos
interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  type: 'TV' | 'Movie' | 'OVA' | 'Special' | 'ONA';
  episodes: number | null;
  status: 'Finished Airing' | 'Currently Airing' | 'Not yet aired';
  aired: {
    from: string;
    to: string | null;
  };
  score: number | null;
  synopsis: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  genres: Array<{ mal_id: number; name: string }>;
}

// 2. Función de búsqueda
async function searchAnime(query: string, page: number = 1) {
  // Respetar rate limit: 60 requests/min, 3 requests/sec
  await rateLimit();

  const response = await fetch(
    `https://api.jikan.moe/v4/anime?` +
    `q=${encodeURIComponent(query)}&` +
    `page=${page}&` +
    `sfw=true&` +
    `limit=25`
  );

  if (!response.ok) {
    throw new Error('Jikan API error');
  }

  const data = await response.json();
  return data;
}

// 3. Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 334; // ~3 requests/sec

async function rateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }

  lastRequestTime = Date.now();
}

// 4. Transformar para Owlist
function transformToOwlistFormat(jikanAnime: JikanAnime) {
  return {
    externalId: jikanAnime.mal_id.toString(),
    type: 'ANIME' as const,
    title: jikanAnime.title_english || jikanAnime.title,
    titleJapanese: jikanAnime.title_japanese,
    posterUrl: jikanAnime.images.jpg.large_image_url,
    releaseYear: jikanAnime.aired.from
      ? new Date(jikanAnime.aired.from).getFullYear()
      : null,
    rating: jikanAnime.score,
    synopsis: jikanAnime.synopsis,
    episodes: jikanAnime.episodes,
    status: jikanAnime.status,
    animeType: jikanAnime.type,
    genres: jikanAnime.genres.map(g => g.name),
    apiSource: 'jikan',
  };
}

// 5. Ejemplo de uso con caché
import { cache } from 'react';

export const searchAnimeWithCache = cache(async (query: string) => {
  const results = await searchAnime(query);
  return results.data.map(transformToOwlistFormat);
});
```

### 3. Info de rate limits

```
📊 Rate Limit Status
Limit: 60 requests / minute, 3 requests / second
Recommended delay: 334ms between requests
Response time: 456ms
```

## Prompt Interno

Cuando el usuario ejecuta `/jikan-search`, realizo:

1. **Construir URL** con parámetros correctos
2. **Aplicar rate limiting** (importante para Jikan)
3. **Fetch Jikan API v4**
4. **Parsear resultados**
5. **Formatear output** user-friendly
6. **Generar código** de integración con rate limiting incluido
7. **Incluir transformación** a formato Owlist
8. **Advertir sobre rate limits**

## Endpoints Jikan por Tipo

### Anime
```
GET /v4/anime
  ?q={query}
  &page=1
  &limit=25
  &sfw=true
  &order_by=score
  &sort=desc
```

### Manga
```
GET /v4/manga
  ?q={query}
  &page=1
  &limit=25
  &sfw=true
```

### Anime by ID (detalles completos)
```
GET /v4/anime/{id}
GET /v4/anime/{id}/full  // Datos completos
GET /v4/anime/{id}/characters
GET /v4/anime/{id}/staff
GET /v4/anime/{id}/episodes
```

### Top anime
```
GET /v4/top/anime
  ?type=tv
  &filter=airing
  &page=1
```

## Transformaciones por Tipo

### Anime → Owlist Content
```typescript
{
  externalId: String(mal_id),
  type: 'ANIME',
  title: title_english || title,
  titleJapanese: title_japanese,
  titleRomaji: title,
  posterUrl: images.jpg.large_image_url,
  releaseYear: aired.from ? new Date(aired.from).getFullYear() : null,
  rating: score,
  synopsis: synopsis,
  episodes: episodes,
  status: status, // 'Finished Airing' | 'Currently Airing' | 'Not yet aired'
  animeType: type, // 'TV' | 'Movie' | 'OVA' | 'Special' | 'ONA'
  genres: genres.map(g => g.name),
  studios: studios?.map(s => s.name),
  apiSource: 'jikan',
}
```

### Manga → Owlist Content
```typescript
{
  externalId: String(mal_id),
  type: 'MANGA',
  title: title_english || title,
  titleJapanese: title_japanese,
  posterUrl: images.jpg.large_image_url,
  releaseYear: published.from ? new Date(published.from).getFullYear() : null,
  rating: score,
  synopsis: synopsis,
  chapters: chapters,
  volumes: volumes,
  status: status,
  mangaType: type, // 'Manga' | 'Novel' | 'Light Novel' | 'One-shot'
  genres: genres.map(g => g.name),
  authors: authors?.map(a => a.name),
  apiSource: 'jikan',
}
```

## Service Completo

```typescript
// lib/jikan/client.ts

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const REQUEST_DELAY = 334; // ~3 req/sec
let lastRequestTime = 0;

class JikanRateLimiter {
  private queue: Array<() => void> = [];
  private processing = false;

  async waitForSlot(): Promise<void> {
    return new Promise((resolve) => {
      this.queue.push(resolve);
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < REQUEST_DELAY) {
      await new Promise(resolve =>
        setTimeout(resolve, REQUEST_DELAY - timeSinceLastRequest)
      );
    }

    lastRequestTime = Date.now();
    const resolve = this.queue.shift();
    resolve?.();

    this.processing = false;
    if (this.queue.length > 0) {
      this.processQueue();
    }
  }
}

const rateLimiter = new JikanRateLimiter();

export async function searchAnime(
  query: string,
  options?: {
    page?: number;
    limit?: number;
    sfw?: boolean;
    order_by?: 'title' | 'score' | 'members' | 'favorites';
  }
) {
  await rateLimiter.waitForSlot();

  const params = new URLSearchParams({
    q: query,
    page: String(options?.page ?? 1),
    limit: String(options?.limit ?? 25),
    sfw: String(options?.sfw ?? true),
  });

  if (options?.order_by) {
    params.set('order_by', options.order_by);
    params.set('sort', 'desc');
  }

  const response = await fetch(`${JIKAN_BASE_URL}/anime?${params}`, {
    next: { revalidate: 3600 }, // Cache 1 hour
  });

  if (!response.ok) {
    throw new Error(`Jikan API error: ${response.status}`);
  }

  return response.json();
}

export async function getAnimeById(id: number, full: boolean = false) {
  await rateLimiter.waitForSlot();

  const endpoint = full ? `/anime/${id}/full` : `/anime/${id}`;
  const response = await fetch(`${JIKAN_BASE_URL}${endpoint}`, {
    next: { revalidate: 86400 }, // Cache 24 hours
  });

  if (!response.ok) {
    throw new Error(`Jikan API error: ${response.status}`);
  }

  return response.json();
}

export async function getTopAnime(
  type?: 'tv' | 'movie' | 'ova' | 'special',
  filter?: 'airing' | 'upcoming' | 'bypopularity' | 'favorite'
) {
  await rateLimiter.waitForSlot();

  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (filter) params.set('filter', filter);

  const response = await fetch(`${JIKAN_BASE_URL}/top/anime?${params}`, {
    next: { revalidate: 1800 }, // Cache 30 min
  });

  if (!response.ok) {
    throw new Error(`Jikan API error: ${response.status}`);
  }

  return response.json();
}
```

## Hook para Cliente

```typescript
// hooks/useJikanSearch.ts
import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

export function useJikanSearch(type: 'anime' | 'manga' = 'anime') {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 800); // Más delay por rate limit

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/search/jikan?query=${encodeURIComponent(debouncedQuery)}&type=${type}`
        );

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setResults(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [debouncedQuery, type]);

  return { query, setQuery, results, isLoading, error };
}
```

## API Route Example

```typescript
// app/api/search/jikan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchAnime } from '@/lib/jikan/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const type = searchParams.get('type') || 'anime';

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const results = await searchAnime(query, {
      page: Number(searchParams.get('page')) || 1,
      sfw: true,
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Jikan search error:', error);
    return NextResponse.json(
      { error: 'Failed to search anime' },
      { status: 500 }
    );
  }
}
```

## Campos Útiles Específicos de Anime

```typescript
// Información adicional disponible en Jikan

interface JikanAnimeExtended extends JikanAnime {
  // Broadcast info
  broadcast: {
    day: string;
    time: string;
    timezone: string;
  } | null;

  // Producers, licensors, studios
  producers: Array<{ mal_id: number; name: string }>;
  licensors: Array<{ mal_id: number; name: string }>;
  studios: Array<{ mal_id: number; name: string }>;

  // Demographics
  demographics: Array<{ mal_id: number; name: string }>;

  // Themes
  themes: Array<{ mal_id: number; name: string }>;

  // Relations (sequels, prequels, etc.)
  relations: Array<{
    relation: string;
    entry: Array<{ mal_id: number; type: string; name: string }>;
  }>;

  // Streaming platforms
  streaming: Array<{ name: string; url: string }>;
}
```

## Notas Importantes

### Rate Limits
- **60 requests/minute**
- **3 requests/second**
- Implementar delay de ~334ms entre requests
- Usar queue para manejar múltiples requests

### Caching
- Resultados de búsqueda: 1 hora
- Detalles de anime: 24 horas
- Top anime: 30 minutos

### Errores Comunes
- 429: Rate limit excedido → implementar backoff
- 404: Anime no encontrado
- 500: Error del servidor MAL

### Best Practices
- Siempre usar `sfw=true` para contenido apropiado
- Implementar retry logic con exponential backoff
- Cachear agresivamente
- Mostrar loading states (API puede ser lenta)
