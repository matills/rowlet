# Owlist Backend API

Backend API para Owlist - Plataforma de tracking de películas, series y anime con características sociales y sistema de logros.

## Stack Tecnológico

- **Runtime**: Node.js v20+ con TypeScript
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT)
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime
- **External APIs**: TMDB (películas/series), AniList (anime)
- **Logging**: Winston
- **Testing**: Jest

## Arquitectura

Este backend se enfoca en **lógica de negocio compleja** mientras Supabase maneja:
- ✅ Autenticación de usuarios
- ✅ Base de datos con Row Level Security (RLS)
- ✅ Storage de archivos (avatares, banners, etc.)
- ✅ Notificaciones en tiempo real

### El backend maneja:
- 🎯 Sistema de logros y gamificación
- 🤖 Recomendaciones inteligentes
- 🔌 Integración con APIs externas (TMDB, AniList)
- 📊 Estadísticas avanzadas y analytics
- 🎬 Lógica de negocio compleja

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuraciones (Supabase, logger, etc.)
│   ├── controllers/     # Controladores de rutas
│   ├── middlewares/     # Middlewares (auth, error handling, etc.)
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Utilidades y helpers
│   ├── types/           # Types de TypeScript
│   ├── validators/      # Validaciones con Zod
│   └── index.ts         # Entry point
├── tests/               # Tests unitarios e integración
├── .env.example         # Variables de entorno ejemplo
└── package.json
```

## Setup del Proyecto

### 1. Requisitos Previos

- Node.js >= 20.0.0
- npm >= 10.0.0
- Cuenta en [Supabase](https://supabase.com)

### 2. Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de environment
cp .env.example .env
```

### 3. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto
2. En el dashboard de tu proyecto, ve a **Settings** > **API**
3. Copia las siguientes credenciales a tu archivo `.env`:
   - `SUPABASE_URL`: Project URL
   - `SUPABASE_ANON_KEY`: anon public key
   - `SUPABASE_SERVICE_ROLE_KEY`: service_role secret key (¡no compartir!)

### 4. Configurar APIs Externas

#### TMDB API (Películas y Series)
1. Crea una cuenta en [themoviedb.org](https://www.themoviedb.org/)
2. Ve a Settings > API y genera una API Key
3. Agrega `TMDB_API_KEY` a tu `.env`

#### AniList API (Anime)
- No requiere API key, usa GraphQL público

### 5. Variables de Entorno

Completa tu archivo `.env`:

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# CORS
CORS_ORIGIN=http://localhost:5173

# External APIs
TMDB_API_KEY=tu-tmdb-api-key
TMDB_API_URL=https://api.themoviedb.org/3
ANILIST_API_URL=https://graphql.anilist.co

# Logging
LOG_LEVEL=debug
```

## Comandos Disponibles

```bash
# Desarrollo (con hot reload)
npm run dev

# Build para producción
npm run build

# Ejecutar en producción
npm start

# Testing
npm test
npm run test:watch

# Linting y formato
npm run lint
npm run format
```

## Ejecutar el Servidor

```bash
# Modo desarrollo
npm run dev

# El servidor estará disponible en:
# http://localhost:3000
```

## Endpoints Principales

### Health Check
```
GET /health
```

### API Base
```
GET /api/v1
```

## Próximos Pasos (Sprint 2)

- [ ] Implementar endpoints de autenticación (login/register con Supabase)
- [ ] Crear middleware de autorización
- [ ] Definir esquema de base de datos en Supabase
- [ ] Implementar gestión de perfiles de usuario

## Roadmap Completo

Ver `docs/roadmap.md` para el plan completo de desarrollo del proyecto.

## Contribuir

Este es un proyecto en desarrollo activo. Para contribuir:
1. Crea un branch desde `main`
2. Realiza tus cambios
3. Asegúrate de que pasen los tests
4. Crea un Pull Request

## Licencia

MIT
