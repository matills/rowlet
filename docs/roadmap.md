🗺️ ROADMAP COMPLETO - OWLIST
📊 VISIÓN GENERAL
Proyecto: Owlist - Social Media Tracker
Objetivo: Plataforma para tracking de películas, series y anime con características sociales y sistema de logros
Duración estimada: 6-12 meses (dependiendo de dedicación)

🎯 FASE 1: FUNDAMENTOS Y CORE (Semanas 1-6)
Sprint 1: Setup y Arquitectura (Semana 1-2)

 Definir stack tecnológico final
 Setup del proyecto backend (estructura de carpetas)
 Configuración de base de datos
 Setup de Entity Framework / ORM
 Configuración de Git y versionado
 Docker setup (opcional pero recomendado)
 Documentación básica del proyecto
 Variables de entorno y configuración

Entregable: Proyecto backend corriendo con conexión a BD

Sprint 2: Autenticación y Usuarios (Semana 3-4)
Backend:

 Modelo de datos User
 Registro de usuarios (POST /api/auth/register)
 Login con JWT (POST /api/auth/login)
 Refresh token mechanism
 Middleware de autenticación
 Endpoint de perfil (GET/PUT /api/users/me)
 Cambio de contraseña
 Validaciones y manejo de errores

Endpoints principales:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/users/me
PUT    /api/users/me
PUT    /api/users/me/password
DELETE /api/users/me
Entregable: Sistema de autenticación funcional con JWT

Sprint 3: Catálogo Base de Contenido (Semana 5-6)
Backend:

 Modelos de datos: Media (Movie/Series/Anime)
 Modelo Series con Temporadas y Episodios
 CRUD básico de contenido
 Búsqueda y filtros (por título, género, año, tipo)
 Paginación de resultados
 Integración con API externa (TMDB para movies/series)
 Integración con AniList API (para anime)
 Caché de datos externos
 Seeding de datos iniciales

Endpoints principales:
GET    /api/media?search=&type=&genre=&page=&limit=
GET    /api/media/:id
POST   /api/media (admin)
PUT    /api/media/:id (admin)
DELETE /api/media/:id (admin)

GET    /api/media/:id/seasons (para series)
GET    /api/media/:id/seasons/:seasonNumber/episodes

# Búsqueda externa
GET    /api/external/search?query=&type=
GET    /api/external/:externalId/import
Entregable: Catálogo de contenido funcional con búsqueda y APIs externas

🎬 FASE 2: SISTEMA DE TRACKING Y LISTAS (Semanas 7-12)
Sprint 4: Listas Predefinidas del Usuario (Semana 7-8)
Backend:

 Modelo UserMediaList (relación user-media)
 Crear listas predefinidas al registrar usuario
 Agregar contenido a lista
 Cambiar estado de contenido (watching, completed, etc.)
 Actualizar progreso (episodios vistos)
 Rating personal del contenido
 Fechas de inicio/fin
 Notas personales
 Contador de re-watches

Listas predefinidas:

Watching (Viendo)
Completed (Completado)
Plan to Watch (Para Ver)
On Hold (En Pausa)
Dropped (Abandonado)
Favorites (Favoritos)

Endpoints principales:
GET    /api/users/me/lists
GET    /api/users/me/lists/:listType/items
POST   /api/users/me/lists/:listType/items
PUT    /api/users/me/lists/:listType/items/:mediaId
DELETE /api/users/me/lists/:listType/items/:mediaId

# Ejemplo específico
POST   /api/users/me/watching
PUT    /api/users/me/watching/:mediaId/progress
POST   /api/users/me/watching/:mediaId/complete
Entregable: Sistema de tracking básico funcional

Sprint 5: Listas Personalizadas (Semana 9-10)
Backend:

 Modelo CustomList
 CRUD de listas personalizadas
 Agregar/quitar items a listas custom
 Ordenar items dentro de lista
 Descripción y metadata de lista
 Cover image de lista
 Configuración de privacidad (pública/privada)

Endpoints principales:
GET    /api/lists (listas del usuario autenticado)
POST   /api/lists
GET    /api/lists/:id
PUT    /api/lists/:id
DELETE /api/lists/:id

POST   /api/lists/:id/items
DELETE /api/lists/:id/items/:mediaId
PUT    /api/lists/:id/items/:mediaId/order
Entregable: Sistema de listas personalizadas completo

Sprint 6: Estadísticas Básicas del Usuario (Semana 11-12)
Backend:

 Endpoint de estadísticas generales
 Total de contenido visto (por tipo)
 Tiempo total invertido
 Géneros más vistos
 Rating promedio dado
 Racha actual de días viendo
 Mes/año con más actividad

Endpoints:
GET    /api/users/me/stats
GET    /api/users/me/stats/genres
GET    /api/users/me/stats/timeline
Entregable: Dashboard de estadísticas personales

👥 FASE 3: CARACTERÍSTICAS SOCIALES (Semanas 13-18)
Sprint 7: Perfiles Públicos (Semana 13-14)
Backend:

 Configuración de privacidad del perfil
 Endpoint de perfil público
 Vista pública de listas (solo públicas)
 Estadísticas públicas del usuario
 Búsqueda de usuarios
 Customización de perfil (bio, avatar, banner)

Endpoints:
GET    /api/users/:username
GET    /api/users/:username/lists
GET    /api/users/:username/stats
GET    /api/users/search?q=

PUT    /api/users/me/profile
PUT    /api/users/me/privacy
Entregable: Perfiles públicos visualizables

Sprint 8: Sistema de Seguimiento (Semana 15-16)
Backend:

 Modelo Follow (follower/following)
 Seguir/dejar de seguir usuarios
 Lista de seguidores
 Lista de siguiendo
 Verificar si sigue a usuario
 Contador de seguidores/siguiendo

Endpoints:
POST   /api/users/:username/follow
DELETE /api/users/:username/unfollow
GET    /api/users/:username/followers
GET    /api/users/:username/following
GET    /api/users/:username/is-following
Entregable: Sistema de follow funcional

Sprint 9: Listas Compartidas y Colaborativas (Semana 17-18)
Backend:

 Modelo ListCollaborator
 Roles en listas (admin, editor, viewer)
 Invitar usuarios a lista
 Aceptar/rechazar invitación
 Permisos según rol
 Link público de lista compartida
 Generar código de invitación

Endpoints:
POST   /api/lists/:id/collaborators
DELETE /api/lists/:id/collaborators/:userId
PUT    /api/lists/:id/collaborators/:userId/role

GET    /api/lists/invitations
POST   /api/lists/invitations/:id/accept
DELETE /api/lists/invitations/:id/reject

GET    /api/lists/shared/:shareCode (público)
Entregable: Listas colaborativas funcionales

Sprint 10: Feed de Actividad (Semana 19-20)
Backend:

 Modelo Activity
 Registrar actividades (watched, rated, added to list, etc.)
 Feed personalizado del usuario
 Feed de usuarios seguidos
 Filtros de feed (por tipo de actividad)
 Paginación de feed

Tipos de actividad:

WATCHED_MEDIA
RATED_MEDIA
ADDED_TO_LIST
COMPLETED_MEDIA
CREATED_LIST
ACHIEVEMENT_UNLOCKED
STARTED_WATCHING
REVIEWED_MEDIA

Endpoints:
GET    /api/feed (actividad de quienes sigues)
GET    /api/users/me/activity (tu actividad)
GET    /api/users/:username/activity (actividad pública)
Entregable: Sistema de feed social

🏆 FASE 4: SISTEMA DE LOGROS (Semanas 21-26)
Sprint 11: Motor de Logros (Semana 21-22)
Backend:

 Modelo Achievement
 Modelo UserAchievement
 Sistema de definición de logros (JSON/código)
 Motor de evaluación de condiciones
 Listeners de eventos
 Sistema de puntos/XP (opcional)
 Niveles de usuario basados en XP
 Notificación de logro desbloqueado

Arquitectura sugerida:
csharp// Ejemplo conceptual
interface IAchievementCondition
{
    Task<bool> EvaluateAsync(User user);
    Task<int> GetProgressAsync(User user);
}

class WatchedCountCondition : IAchievementCondition
{
    int RequiredCount { get; set; }
    MediaType? MediaType { get; set; }
}

class TimeframeCondition : IAchievementCondition
{
    TimeSpan Timeframe { get; set; }
    int RequiredCount { get; set; }
}
```

#### Endpoints:
```
GET    /api/achievements
GET    /api/achievements/:id
GET    /api/users/me/achievements
GET    /api/users/me/achievements/progress
GET    /api/users/:username/achievements (públicos)
```

**Entregable:** Motor de logros funcional

---

### **Sprint 12: Logros Básicos** (Semana 23-24)

#### Implementar primeros logros:

**Por Cantidad:**
- [ ] "First Steps" - Ver tu primer contenido
- [ ] "Getting Started" - Ver 10 contenidos
- [ ] "Dedicated" - Ver 50 contenidos
- [ ] "Enthusiast" - Ver 100 contenidos
- [ ] "Completionist" - Ver 500 contenidos
- [ ] "Movie Buff" - Ver 50 películas
- [ ] "Binge Watcher" - Ver 25 series completas
- [ ] "Otaku" - Ver 50 animes

**Por Constancia:**
- [ ] "Weekend Warrior" - Ver 5+ contenidos en un fin de semana
- [ ] "Marathoner" - Ver 8+ contenidos en un fin de semana
- [ ] "Weekly Streak" - Ver algo cada semana por 4 semanas
- [ ] "Monthly Streak" - Ver algo cada mes por 6 meses

**Por Rating:**
- [ ] "Critic" - Dar rating a 10 contenidos
- [ ] "Expert Critic" - Dar rating a 100 contenidos
- [ ] "Harsh Critic" - Dar 10 ratings de 3 o menos
- [ ] "Easy to Please" - Dar 10 ratings de 9 o más

**Entregable:** 15-20 logros implementados y funcionales

---

### **Sprint 13: Logros Avanzados** (Semana 25-26)

**Por Diversidad:**
- [ ] "Genre Explorer" - Ver contenido de 10 géneros diferentes
- [ ] "Polyglot" - Ver contenido en 5 idiomas diferentes
- [ ] "Classic Fan" - Ver 10 películas de antes del año 2000
- [ ] "Modern Viewer" - Ver 50 contenidos del año actual
- [ ] "International" - Ver contenido de 20 países diferentes

**Sociales:**
- [ ] "Popular" - Tener 10 seguidores
- [ ] "Influencer" - Tener 100 seguidores
- [ ] "Social Butterfly" - Seguir a 50 usuarios
- [ ] "List Master" - Crear 10 listas personalizadas
- [ ] "Collaborator" - Participar en 5 listas colaborativas
- [ ] "Community Helper" - Tus listas tienen 100+ items agregados por otros

**Especiales/Raros:**
- [ ] "Night Owl" - Ver 50 contenidos entre 12am-6am
- [ ] "Early Bird" - Ver 50 contenidos entre 6am-9am
- [ ] "Perfect Score" - Dar 100 ratings de 10/10
- [ ] "Speed Watcher" - Completar una serie de 20+ eps en 48 horas
- [ ] "Completionist Pro" - 100% de logros desbloqueados

**Sistema de rareza:**
- Common (40% de usuarios lo tienen)
- Rare (15% de usuarios)
- Epic (5% de usuarios)
- Legendary (1% de usuarios)

**Entregable:** 40+ logros totales implementados

---

## 🔔 FASE 5: ENGAGEMENT Y RETENCIÓN (Semanas 27-32)

### **Sprint 14: Sistema de Notificaciones** (Semana 27-28)

#### Backend:
- [ ] Modelo Notification
- [ ] Tipos de notificaciones
- [ ] Marcar como leída/no leída
- [ ] Preferencias de notificaciones
- [ ] Notificaciones en tiempo real (SignalR/WebSockets)
- [ ] Envío de emails (opcional)

#### Tipos de notificaciones:
- Nuevo seguidor
- Logro desbloqueado
- Invitación a lista colaborativa
- Usuario seguido agregó algo a favoritos
- Recordatorio de episodio nuevo
- Alguien comentó tu review

#### Endpoints:
```
GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all
DELETE /api/notifications/:id
GET    /api/notifications/unread-count

PUT    /api/users/me/notification-preferences
```

**Entregable:** Sistema de notificaciones completo

---

### **Sprint 15: Reviews y Comentarios** (Semana 29-30)

#### Backend:
- [ ] Modelo Review
- [ ] Modelo Comment
- [ ] CRUD de reviews
- [ ] Sistema de likes en reviews
- [ ] Comentarios en reviews
- [ ] Comentarios en contenido
- [ ] Spoiler tags
- [ ] Moderación básica (reportar)

#### Endpoints:
```
# Reviews
POST   /api/media/:id/reviews
GET    /api/media/:id/reviews
PUT    /api/reviews/:id
DELETE /api/reviews/:id
POST   /api/reviews/:id/like
DELETE /api/reviews/:id/unlike

# Comments
POST   /api/reviews/:id/comments
GET    /api/reviews/:id/comments
PUT    /api/comments/:id
DELETE /api/comments/:id
```

**Entregable:** Sistema de reviews y comentarios

---

### **Sprint 16: Recomendaciones Básicas** (Semana 31-32)

#### Backend:
- [ ] Algoritmo de recomendación basado en historial
- [ ] Recomendaciones basadas en géneros favoritos
- [ ] "Users like you also watched"
- [ ] Trending (lo más visto últimos 7 días)
- [ ] Popular del mes/año
- [ ] Recomendaciones de usuarios seguidos

#### Endpoints:
```
GET    /api/recommendations/for-you
GET    /api/recommendations/trending
GET    /api/recommendations/popular
GET    /api/recommendations/from-following
GET    /api/media/:id/similar
```

**Entregable:** Sistema de recomendaciones básico

---

## 📈 FASE 6: ANALYTICS Y FEATURES AVANZADAS (Semanas 33-40)

### **Sprint 17: Estadísticas Avanzadas** (Semana 33-34)

#### Backend:
- [ ] Dashboard detallado con gráficos
- [ ] Evolución temporal (contenido por mes/año)
- [ ] Distribución por géneros (gráfico)
- [ ] Distribución por rating dado
- [ ] Tiempo total estimado viendo
- [ ] Promedio de rating por género
- [ ] Comparativa con media de la plataforma
- [ ] Estadísticas de listas

#### Endpoints:
```
GET    /api/users/me/stats/detailed
GET    /api/users/me/stats/timeline
GET    /api/users/me/stats/genres-distribution
GET    /api/users/me/stats/ratings-distribution
GET    /api/users/me/stats/comparison
```

**Entregable:** Sistema de analytics completo

---

### **Sprint 18: Tags y Categorización Avanzada** (Semana 35-36)

#### Backend:
- [ ] Sistema de tags personalizados
- [ ] Agregar tags a contenido
- [ ] Filtrar por tags
- [ ] Tags sugeridos/populares
- [ ] Tags comunitarios (opcional)

#### Endpoints:
```
GET    /api/tags
POST   /api/media/:id/tags
DELETE /api/media/:id/tags/:tagId
GET    /api/media?tags=tag1,tag2
GET    /api/users/me/tags
```

**Entregable:** Sistema de tags

---

### **Sprint 19: Watchlist con Prioridades** (Semana 37-38)

#### Backend:
- [ ] Sistema de prioridades en "Plan to Watch"
- [ ] Ordenar por prioridad
- [ ] Notas de por qué quieres verlo
- [ ] Recordatorios de fecha de estreno
- [ ] Sugerencias de qué ver ahora (basado en prioridad + tiempo disponible)

**Entregable:** Watchlist mejorada

---

### **Sprint 20: Export/Import de Datos** (Semana 39-40)

#### Backend:
- [ ] Exportar listas a CSV/JSON
- [ ] Importar desde MyAnimeList
- [ ] Importar desde Letterboxd
- [ ] Importar desde IMDB lists
- [ ] Backup completo de usuario

#### Endpoints:
```
GET    /api/users/me/export?format=json
POST   /api/users/me/import
GET    /api/users/me/backup
```

**Entregable:** Sistema de import/export

---

## 🚀 FASE 7: OPTIMIZACIÓN Y PRODUCCIÓN (Semanas 41-48)

### **Sprint 21: Performance y Optimización** (Semana 41-43)

- [ ] Implementar caché (Redis)
- [ ] Optimización de queries
- [ ] Índices en base de datos
- [ ] Lazy loading donde corresponda
- [ ] Compresión de responses
- [ ] Rate limiting
- [ ] CDN para imágenes

---

### **Sprint 22: Testing** (Semana 44-45)

- [ ] Unit tests (servicios principales)
- [ ] Integration tests (endpoints críticos)
- [ ] Test de carga
- [ ] Test de seguridad básico

---

### **Sprint 23: Documentación** (Semana 46-47)

- [ ] Swagger/OpenAPI completo
- [ ] README del proyecto
- [ ] Guía de instalación
- [ ] Guía de contribución
- [ ] Documentación de API
- [ ] Ejemplos de uso

---

### **Sprint 24: Deploy y DevOps** (Semana 48)

- [ ] Setup de servidor (AWS/Azure/DigitalOcean)
- [ ] CI/CD pipeline
- [ ] Monitoring (logging, metrics)
- [ ] Backups automáticos
- [ ] SSL/HTTPS
- [ ] Domain setup

---

## 📊 RESUMEN DE FASES

| Fase | Duración | Objetivo Principal |
|------|----------|-------------------|
| **Fase 1** | 6 semanas | Core: Auth + Catálogo |
| **Fase 2** | 6 semanas | Tracking y Listas |
| **Fase 3** | 8 semanas | Social Features |
| **Fase 4** | 6 semanas | Sistema de Logros |
| **Fase 5** | 6 semanas | Engagement |
| **Fase 6** | 8 semanas | Features Avanzadas |
| **Fase 7** | 8 semanas | Producción |
| **TOTAL** | **48 semanas** | **~12 meses** |

---

## 🎯 HITOS PRINCIPALES (Milestones)

### ✅ MVP (Mes 3)
- Autenticación
- Catálogo con API externa
- Listas predefinidas
- Tracking básico

### ✅ Beta Privada (Mes 6)
- Todo lo anterior +
- Listas personalizadas
- Perfiles públicos
- Sistema de follow
- 20 logros básicos

### ✅ Beta Pública (Mes 9)
- Todo lo anterior +
- Listas colaborativas
- Feed de actividad
- 50+ logros
- Reviews y comentarios
- Recomendaciones

### ✅ V1.0 Producción (Mes 12)
- Todo lo anterior +
- Notificaciones
- Analytics avanzados
- Import/Export
- Performance optimizado
- Testing completo

---

## 🔧 STACK TECNOLÓGICO DEFINITIVO

### Backend:
```
- Node.js v20+ con TypeScript
- Express.js (framework web)
- Axios (HTTP client para APIs externas)
- Zod (validaciones)
- Winston (logging)
- Jest (testing)
- Swagger/OpenAPI (documentación)
```

### Supabase (Backend as a Service):
```
- PostgreSQL (base de datos con Row Level Security)
- Supabase Auth (autenticación JWT, OAuth providers)
- Supabase Storage (avatares, banners, covers de listas)
- Supabase Realtime (notificaciones y actualizaciones en tiempo real)
- Supabase Edge Functions (funciones serverless, opcional)
```

### Frontend:
```
- React con TypeScript
- Vite (build tool)
- TanStack Query / React Query (data fetching y caché)
- Zustand o Jotai (state management)
- React Router (routing)
- Tailwind CSS (styling)
- Supabase Client (conexión directa a Supabase)
- Shadcn UI o Mantine (component library, opcional)
```

### APIs Externas:
```
- TMDB API (películas y series)
- AniList GraphQL API (anime)
```

### DevOps:
```
- Docker + Docker Compose (desarrollo local, opcional)
- GitHub Actions (CI/CD)
- Vercel o Netlify (frontend hosting)
- Railway, Render o Fly.io (backend hosting)
- Supabase Cloud (database y servicios BaaS)