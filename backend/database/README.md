# Database Setup

Este proyecto usa Supabase como base de datos. Sigue estos pasos para configurar la base de datos:

## 1. Crear un proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta si no tienes una
3. Crea un nuevo proyecto

## 2. Aplicar el esquema SQL

1. En el dashboard de Supabase, ve a la sección "SQL Editor"
2. Copia el contenido del archivo `schema.sql`
3. Pégalo en el editor SQL
4. Ejecuta el script

Esto creará todas las tablas necesarias:
- `users` - Usuarios de la aplicación
- `content` - Contenido (películas, series, anime)
- `user_content` - Relación entre usuarios y contenido (lista personal)
- `user_lists` - Listas personalizadas de usuarios
- `list_items` - Items en las listas personalizadas

## 3. Configurar variables de entorno

Copia las credenciales de tu proyecto de Supabase y agrégalas al archivo `.env`:

```env
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_KEY=tu_supabase_service_key
```

Puedes encontrar estas credenciales en:
- Settings → API → Project URL (SUPABASE_URL)
- Settings → API → Project API keys → anon/public (SUPABASE_ANON_KEY)
- Settings → API → Project API keys → service_role (SUPABASE_SERVICE_KEY)

## 4. Habilitar Row Level Security (RLS)

Para mayor seguridad, puedes habilitar RLS en las tablas. Aquí hay algunas políticas de ejemplo:

```sql
-- Permitir que los usuarios lean su propia información
CREATE POLICY "Users can read their own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Permitir que los usuarios actualicen su propia información
CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Permitir que los usuarios lean su propio contenido
CREATE POLICY "Users can read their own content"
ON user_content FOR SELECT
USING (auth.uid() = user_id);

-- etc...
```

**Nota:** Actualmente el backend usa el service_role key que bypasea RLS, por lo que no es necesario configurar políticas RLS. Sin embargo, si decides usar auth de Supabase en el futuro, necesitarás configurar estas políticas.
