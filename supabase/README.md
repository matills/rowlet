# Supabase Database Setup

Este directorio contiene el schema de la base de datos de Owlist para Supabase.

## Setup Inicial

### 1. Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea un nuevo proyecto
2. Espera a que el proyecto esté listo (tarda ~2 minutos)
3. Guarda las credenciales en tu `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon/Public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key (NUNCA expongas esto en el cliente)

### 2. Ejecutar el Schema

Hay dos formas de ejecutar el schema:

#### Opción A: Supabase Dashboard (Recomendado para desarrollo)

1. Abre tu proyecto en Supabase Dashboard
2. Ve a SQL Editor
3. Copia y pega el contenido de `schema.sql`
4. Click en "Run" para ejecutar

#### Opción B: Supabase CLI (Recomendado para producción)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login a Supabase
supabase login

# Link tu proyecto local con el proyecto en Supabase
supabase link --project-ref YOUR_PROJECT_REF

# Ejecutar el schema
supabase db push
```

### 3. Generar TypeScript Types

Una vez que el schema esté creado, genera los tipos TypeScript:

```bash
# Usando Supabase CLI
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

O desde el dashboard:
1. Settings → API
2. Copia los types generados
3. Pégalos en `types/supabase.ts`

## Estructura del Schema

### Tablas Principales

- **profiles**: Perfiles de usuario (extiende auth.users)
- **content**: Películas, series y anime
- **lists**: Listas de contenido (predefinidas y personalizadas)
- **list_items**: Items dentro de las listas
- **list_collaborators**: Colaboradores en listas compartidas
- **reviews**: Reseñas de contenido
- **review_likes**: Likes en reviews
- **achievements**: Logros desbloqueables
- **user_achievements**: Logros de usuarios
- **follows**: Sistema de seguimiento entre usuarios

### Características del Schema

✅ **Row Level Security (RLS)**: Todas las tablas tienen policies configuradas
✅ **Triggers**: Auto-actualización de timestamps y contadores
✅ **Indexes**: Optimizados para queries comunes
✅ **Functions**: Creación automática de listas predefinidas
✅ **Constraints**: Validaciones a nivel de base de datos

### Listas Predefinidas

Cuando un usuario se registra, automáticamente se crean 5 listas:
1. **Watching** - Actualmente viendo
2. **Completed** - Terminado
3. **Plan to Watch** - Quiero ver
4. **On Hold** - Pausado
5. **Dropped** - Abandonado

## Migraciones Futuras

Para cambios en el schema, crea archivos de migración numerados:

```
supabase/
  ├── schema.sql          # Schema inicial
  ├── migrations/
  │   ├── 001_add_notifications.sql
  │   ├── 002_add_comments.sql
  │   └── ...
```

## Testing

Para testear el schema localmente:

```bash
# Iniciar Supabase local
supabase start

# Ejecutar schema
supabase db reset

# Ver la DB en Studio
supabase studio
```

## Políticas de Seguridad (RLS)

### Perfiles
- ✅ Todos pueden ver perfiles públicos
- ✅ Solo puedes editar tu propio perfil

### Listas
- ✅ Listas públicas visibles para todos
- ✅ Listas privadas solo para el dueño y colaboradores
- ✅ Solo el dueño puede modificar permisos

### Reviews
- ✅ Todos pueden leer reviews
- ✅ Solo puedes crear/editar/eliminar tus propias reviews

### Logros
- ✅ Todos pueden ver todos los logros
- ✅ Solo puedes actualizar tus propios logros

## Próximos Pasos

Después de configurar el schema:

1. ✅ Generar TypeScript types
2. ✅ Crear seed data (achievements iniciales)
3. ✅ Testear RLS policies
4. ✅ Configurar Storage buckets (para avatares, etc.)

## Notas Importantes

⚠️ **Nunca** expongas `SUPABASE_SERVICE_ROLE_KEY` en el cliente
⚠️ Las RLS policies son tu primera línea de defensa - siempre valídalas
⚠️ Usa `service_role` solo en el backend para operaciones admin
