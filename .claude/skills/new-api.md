# Skill: /new-api

## Descripción
Genera un nuevo API route de Next.js con validación, tipos, error handling y documentación.

## Uso

```bash
/new-api <route-path> [opciones]
```

### Opciones
- `--methods`: HTTP methods (GET,POST,PUT,DELETE)
- `--auth`: Requiere autenticación (default: true)
- `--validate`: Incluir validación Zod
- `--rate-limit`: Incluir rate limiting

### Ejemplos

```bash
/new-api lists/create --methods=POST --auth --validate
/new-api movies/[id] --methods=GET,PUT,DELETE
/new-api search --methods=GET --auth=false
```

## Output

### Archivo: `app/api/{route-path}/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema de validación (si --validate)
const requestSchema = z.object({
  // campos según contexto
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Auth check (si --auth)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting (si --rate-limit)
    const ip = request.ip ?? 'anonymous';
    if (!rateLimit(ip, 10)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Validación
    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    // Lógica de negocio
    // ... (placeholder que el usuario completará)

    return NextResponse.json(
      { data: result },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Repetir para cada método en --methods
```

### Archivo de tipos: `types/api/{route}.ts`

```typescript
import { z } from 'zod';
import { requestSchema } from '@/app/api/{route}/route';

export type {Route}Request = z.infer<typeof requestSchema>;

export interface {Route}Response {
  data?: any;
  error?: string;
}
```

## Prompt Interno

Cuando el usuario ejecuta `/new-api`, realizo:

1. **Parsear ruta y opciones**
2. **Inferir propósito** del endpoint del nombre (create, update, delete, search, etc.)
3. **Generar schema Zod** apropiado según el propósito
4. **Crear route handler** con:
   - Auth si requerido
   - Rate limiting si solicitado
   - Validación con Zod
   - Error handling estándar
   - Logging estructurado
5. **Generar tipos TypeScript**
6. **Crear documentación inline**
7. **Sugerir queries Supabase** según el propósito

## Plantillas por Tipo

### CREATE (POST)
```typescript
const { data, error } = await supabase
  .from('{table}')
  .insert(validatedData)
  .select()
  .single();
```

### READ (GET)
```typescript
const { data, error } = await supabase
  .from('{table}')
  .select('*')
  .eq('user_id', user.id);
```

### UPDATE (PUT/PATCH)
```typescript
const { data, error } = await supabase
  .from('{table}')
  .update(validatedData)
  .eq('id', id)
  .select()
  .single();
```

### DELETE (DELETE)
```typescript
const { error } = await supabase
  .from('{table}')
  .delete()
  .eq('id', id);
```

## Schemas Zod Comunes

### Para listas
```typescript
const createListSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
});
```

### Para reviews
```typescript
const createReviewSchema = z.object({
  contentId: z.string().uuid(),
  rating: z.number().min(1).max(10),
  text: z.string().max(1000).optional(),
  hasSpoilers: z.boolean().default(false),
});
```

### Para paginación
```typescript
const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});
```

## Convenciones Aplicadas

- **Error handling**: Try-catch con tipos específicos
- **Status codes**: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Internal Server Error)
- **Response format**: `{ data, error }` consistente
- **Logging**: console.error para errores
- **Validación**: Zod con mensajes claros
- **Auth**: Supabase auth por defecto

## Notas

- Sugiere qué tabla de Supabase usar
- Incluye comentarios TODO para lógica específica
- Provee ejemplos de cURL para testing
