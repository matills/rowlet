# Supabase Database Setup

Este directorio contiene las migraciones de base de datos para Owlist.

## Setup Inicial

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Espera a que se inicialice (toma ~2 minutos)

### 2. Ejecutar Migraciones

Tienes dos opciones:

#### Opción A: SQL Editor (Recomendado para desarrollo)

1. Ve a tu proyecto en Supabase
2. Click en **SQL Editor** en el menú lateral
3. Click en **New Query**
4. Copia y pega el contenido de `migrations/00001_initial_schema.sql`
5. Click en **Run** o presiona `Ctrl+Enter`

#### Opción B: Supabase CLI (Recomendado para producción)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Inicializar proyecto (desde la raíz del repo)
supabase init

# Link a tu proyecto remoto
supabase link --project-ref <tu-project-ref>

# Aplicar migraciones
supabase db push
```

### 3. Verificar

Después de ejecutar las migraciones, verifica que las tablas se crearon:

1. Ve a **Table Editor** en Supabase
2. Deberías ver:
   - `users`
   - `media`
   - `seasons`
   - `episodes`
   - `user_media_list`
   - `custom_lists`
   - `custom_list_items`

### 4. Configurar Variables de Entorno

1. En Supabase, ve a **Settings** > **API**
2. Copia las siguientes credenciales al archivo `backend/.env`:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

## Esquema de Base de Datos

### Tablas Principales

#### `users`
- Extiende `auth.users` con campos adicionales
- Username único, bio, avatar, banner
- Configuración de privacidad

#### `media`
- Contenido de películas, series y anime
- Información de TMDB y AniList
- ENUMS: `media_type`, `media_source`, `anime_subtype`

#### `seasons` y `episodes`
- Para series y anime con episodios
- Relacionadas con `media`

#### `user_media_list`
- Tracking de usuario (watching, completed, etc.)
- Progreso de episodios, rating, notas
- ENUM: `user_media_status`

#### `custom_lists`
- Listas personalizadas del usuario
- Públicas o privadas

#### `custom_list_items`
- Items dentro de listas personalizadas

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado:

- ✅ Los usuarios solo pueden editar sus propios datos
- ✅ Los perfiles públicos son visibles para todos
- ✅ Las listas públicas son visibles para todos
- ✅ El contenido (media) es público para lectura

### ENUMS

```sql
media_type: 'movie' | 'series' | 'anime'
anime_subtype: 'tv' | 'movie' | 'ova' | 'ona' | 'special' | 'music'
media_source: 'tmdb' | 'anilist'
user_media_status: 'watching' | 'completed' | 'plan_to_watch' | 'on_hold' | 'dropped'
```

### Triggers

- `update_updated_at_column`: Actualiza automáticamente el campo `updated_at`
- `on_auth_user_created`: Crea automáticamente un perfil en `public.users` cuando un usuario se registra

## Próximos Pasos

Después de configurar la base de datos:

1. ✅ Completa las variables de entorno en `backend/.env`
2. ✅ Obtén tu TMDB API key
3. ✅ Ejecuta el backend: `cd backend && npm run dev`
4. ✅ Prueba los endpoints de autenticación

## Migraciones Futuras

Para agregar nuevas migraciones:

1. Crea un nuevo archivo: `00002_nombre_descriptivo.sql`
2. Sigue el mismo formato
3. Documenta los cambios en este README
