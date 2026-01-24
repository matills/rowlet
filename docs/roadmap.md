# 🎬 Owlist - Product Roadmap

## 📋 Resumen del Proyecto

**Owlist** es una aplicación web de tracking de películas, series y anime con estética retro cartoon de los años 30 (inspirada en Cuphead).

### Características Principales
- Tracking de contenido (películas, series, anime)
- Listas predefinidas y personalizadas colaborativas
- Sistema de logros gamificado
- Reviews y comentarios con interacción social
- Perfiles públicos y sistema de seguimiento
- Estética visual única tipo Cuphead

### Stack Tecnológico Recomendado

**Frontend:**
- React/Next.js 14+ (App Router)
- TypeScript
- TailwindCSS + Custom CSS para animaciones retro
- Framer Motion (animaciones estilo cartoon)
- React Query (gestión de estado servidor)
- Zustand (estado local)

**Backend:**
- Next.js API Routes / Node.js + Express
- PostgreSQL (base de datos relacional)
- Prisma ORM
- NextAuth.js (autenticación)
- WebSockets/Pusher (colaboración en tiempo real)

**APIs Externas:**
- TMDB API (películas y series)
- Jikan API (anime/manga)

**Hosting/Infraestructura:**
- Vercel (frontend + API)
- Supabase/Railway (base de datos PostgreSQL)
- Cloudinary/AWS S3 (imágenes de usuarios)

---

## 🗺️ Roadmap por Fases

### **FASE 0: Preparación y Setup** (Semana 1-2)

#### Objetivos
- Configuración del entorno de desarrollo
- Diseño de arquitectura y base de datos
- Investigación de APIs

#### Tareas

**Setup Técnico:**
- [ ] Crear repositorio y estructura de proyecto Next.js
- [ ] Configurar TypeScript, ESLint, Prettier
- [ ] Setup de TailwindCSS y configuración de tema retro
- [ ] Crear sistema de design tokens (colores sepia, vintage)
- [ ] Obtener API keys de TMDB y Jikan

**Diseño de Base de Datos:**
- [ ] Diseñar schema inicial (usuarios, contenido, listas, reviews)
- [ ] Setup de Prisma + PostgreSQL
- [ ] Crear migraciones iniciales
- [ ] Documentar modelo de datos

**Wireframes/Mockups:**
- [ ] Diseñar componentes UI principales con estética Cuphead
- [ ] Crear palette de colores vintage (sepias, cremas, negros)
- [ ] Definir tipografías retro
- [ ] Diseñar iconografía cartoon

**Deliverables:**
- Proyecto configurado y funcionando
- Schema de base de datos definido
- Guía de estilo visual documentada

---

### **FASE 1: MVP Core - Tracking Básico** (Semana 3-6)

#### Objetivos
- Sistema de autenticación funcional
- Búsqueda y visualización de contenido
- Listas predefinidas básicas

#### Tareas

**Autenticación:**
- [ ] Implementar NextAuth.js
- [ ] Login/registro con email/password
- [ ] OAuth con Google
- [ ] Páginas de perfil básicas

**Integración de APIs:**
- [ ] Crear servicios para TMDB API
- [ ] Crear servicios para Jikan API
- [ ] Implementar caché de resultados
- [ ] Manejo de rate limits

**Búsqueda de Contenido:**
- [ ] Página de búsqueda unificada (movies/series/anime)
- [ ] Filtros por tipo, género, año
- [ ] Cards de resultados con estética retro
- [ ] Página de detalle de contenido

**Listas Predefinidas:**
- [ ] Modelo de datos para listas de usuario
- [ ] Sistema CRUD para agregar contenido a listas
- [ ] Listas: "Viendo", "Visto", "Quiero Ver", "Pausado", "Dejado"
- [ ] UI para gestionar listas
- [ ] Contador de contenido por lista

**UI/UX Retro:**
- [ ] Componentes base estilo Cuphead (botones, cards, inputs)
- [ ] Animaciones de transición vintage
- [ ] Loading states con animaciones cartoon
- [ ] Responsive design

**Deliverables:**
- Usuarios pueden registrarse y autenticarse
- Búsqueda funcional de películas, series y anime
- Agregar contenido a listas predefinidas
- UI con identidad visual retro

---

### **FASE 2: Listas Personalizadas y Colaboración** (Semana 7-10)

#### Objetivos
- Crear y gestionar listas personalizadas
- Sistema de permisos (vista/edición)
- Colaboración en tiempo real

#### Tareas

**Listas Personalizadas:**
- [ ] CRUD de listas personalizadas
- [ ] Nombrar, describir y personalizar listas
- [ ] Agregar/quitar contenido de listas custom
- [ ] Ordenar y organizar elementos

**Sistema de Permisos:**
- [ ] Modelo de permisos (owner, editor, viewer)
- [ ] Invitar usuarios por email/username
- [ ] Gestión de colaboradores
- [ ] Visibilidad: privada, pública, compartida

**Colaboración en Tiempo Real:**
- [ ] Implementar WebSockets o Pusher
- [ ] Actualización en vivo cuando alguien edita lista
- [ ] Indicadores de "quién está viendo"
- [ ] Notificaciones de cambios

**UI de Colaboración:**
- [ ] Modal de compartir lista
- [ ] Gestión de permisos de colaboradores
- [ ] Vista de actividad reciente en listas
- [ ] Avatares de colaboradores activos

**Deliverables:**
- Crear listas personalizadas con nombre y descripción
- Invitar colaboradores con permisos diferenciados
- Edición colaborativa en tiempo real

---

### **FASE 3: Sistema de Logros** (Semana 11-13)

#### Objetivos
- Gamificación del tracking
- Logros desbloqueables
- Progreso visible

#### Tareas

**Motor de Logros:**
- [ ] Diseñar sistema de logros (badges/achievements)
- [ ] Definir 20-30 logros iniciales
- [ ] Sistema de triggers automáticos
- [ ] Almacenamiento de progreso

**Categorías de Logros:**
- [ ] **Cantidad:** Ver 10, 50, 100, 500 películas/series/anime
- [ ] **Géneros:** Ver 20 películas de acción, terror, comedia, etc.
- [ ] **Rachas:** Ver contenido 7, 30, 100 días seguidos
- [ ] **Temáticos:** Maratón (5+ películas en un día), "Década completa" (ver todo de los 80s), etc.

**UI de Logros:**
- [ ] Página de logros del usuario
- [ ] Diseño de badges estilo vintage cartoon
- [ ] Animación de desbloqueo
- [ ] Barra de progreso para logros parciales
- [ ] Notificaciones de logro desbloqueado

**Gamificación Adicional:**
- [ ] Sistema de niveles o "Rank"
- [ ] Estadísticas personales (género favorito, actor más visto, etc.)
- [ ] Gráficos de actividad

**Deliverables:**
- 20-30 logros funcionales
- Sistema automático de detección
- UI atractiva para mostrar progreso

---

### **FASE 4: Reviews y Sistema Social** (Semana 14-17)

#### Objetivos
- Permitir reviews/comentarios
- Perfiles públicos
- Sistema de seguimiento entre usuarios

#### Tareas

**Sistema de Reviews:**
- [ ] Modelo de review (rating + texto + spoiler flag)
- [ ] CRUD de reviews por contenido
- [ ] Sistema de rating (1-5 estrellas o 1-10)
- [ ] Marcar reviews con spoilers (blur inicial)
- [ ] Editar/eliminar propias reviews

**Interacción Social en Reviews:**
- [ ] Likes/reacciones a reviews
- [ ] Comentarios a reviews (opcional)
- [ ] Ordenar por útil/reciente/mejor valorado
- [ ] Reportar contenido inapropiado

**Perfiles Públicos:**
- [ ] Página de perfil público de usuario
- [ ] Mostrar listas públicas
- [ ] Estadísticas del usuario
- [ ] Logros desbloqueados
- [ ] Reviews publicadas

**Sistema de Seguimiento:**
- [ ] Seguir/dejar de seguir usuarios
- [ ] Feed de actividad de usuarios seguidos
- [ ] Notificaciones de actividad
- [ ] Descubrir usuarios (recomendaciones)

**Deliverables:**
- Escribir y leer reviews con ratings
- Perfiles públicos navegables
- Seguir usuarios y ver su actividad

---

### **FASE 5: Mejoras de UX y Optimización** (Semana 18-20)

#### Objetivos
- Pulir experiencia de usuario
- Optimización de performance
- Accesibilidad

#### Tareas

**Performance:**
- [ ] Optimización de imágenes (lazy loading, WebP)
- [ ] Code splitting y lazy loading de componentes
- [ ] Optimización de queries a DB (N+1, indexes)
- [ ] Caché estratégica de APIs externas
- [ ] Análisis con Lighthouse

**UX Enhancements:**
- [ ] Onboarding para nuevos usuarios
- [ ] Tooltips y ayudas contextuales
- [ ] Animaciones fluidas y pulidas
- [ ] Estados vacíos atractivos
- [ ] Shortcuts de teclado

**Responsive y Accesibilidad:**
- [ ] Testing exhaustivo en mobile/tablet
- [ ] Navegación por teclado
- [ ] ARIA labels
- [ ] Contraste de colores (WCAG AA)
- [ ] Screen reader testing

**Notificaciones:**
- [ ] Sistema de notificaciones in-app
- [ ] Email notifications (opcional)
- [ ] Preferencias de notificaciones

**Deliverables:**
- App rápida y fluida
- Experiencia mobile excelente
- Cumplimiento de estándares de accesibilidad

---

### **FASE 6: Features Avanzadas (Post-MVP)** (Semana 21+)

#### Ideas Futuras
- [ ] Importar listas desde otras plataformas (Letterboxd, MyAnimeList)
- [ ] Recomendaciones personalizadas con ML
- [ ] Integración con servicios de streaming (saber dónde ver)
- [ ] Modo oscuro
- [ ] Exportar listas (PDF, CSV)
- [ ] Widgets embebibles para blogs
- [ ] App móvil nativa (React Native)
- [ ] Integración con redes sociales (compartir en Twitter/X)
- [ ] Calendario de estrenos
- [ ] Watchparties virtuales
- [ ] Sistema de desafíos entre usuarios

---

## 📊 Modelo de Datos Inicial

### Entidades Principales

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  name          String?
  image         String?
  bio           String?
  createdAt     DateTime  @default(now())

  lists         List[]
  reviews       Review[]
  achievements  UserAchievement[]
  following     Follow[]  @relation("Following")
  followers     Follow[]  @relation("Followers")
  listCollabs   ListCollaborator[]
}

model Content {
  id            String    @id @default(cuid())
  externalId    String    // ID de TMDB o Jikan
  type          ContentType // MOVIE, SERIES, ANIME
  title         String
  posterUrl     String?
  releaseYear   Int?
  genres        String[]
  apiSource     String    // "tmdb" o "jikan"

  listItems     ListItem[]
  reviews       Review[]
}

enum ContentType {
  MOVIE
  SERIES
  ANIME
}

model List {
  id            String    @id @default(cuid())
  name          String
  description   String?
  isCustom      Boolean   @default(false)
  isPublic      Boolean   @default(false)
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  createdAt     DateTime  @default(now())

  items         ListItem[]
  collaborators ListCollaborator[]
}

model ListItem {
  id          String    @id @default(cuid())
  listId      String
  list        List      @relation(fields: [listId], references: [id])
  contentId   String
  content     Content   @relation(fields: [contentId], references: [id])
  addedAt     DateTime  @default(now())
  order       Int?

  @@unique([listId, contentId])
}

model ListCollaborator {
  id          String    @id @default(cuid())
  listId      String
  list        List      @relation(fields: [listId], references: [id])
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  permission  Permission // VIEW, EDIT

  @@unique([listId, userId])
}

enum Permission {
  VIEW
  EDIT
}

model Review {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  contentId   String
  content     Content   @relation(fields: [contentId], references: [id])
  rating      Float     // 1-10 o 1-5
  text        String?
  hasSpoilers Boolean   @default(false)
  likes       Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([userId, contentId])
}

model Achievement {
  id          String    @id @default(cuid())
  code        String    @unique
  name        String
  description String
  icon        String
  category    AchievementCategory
  threshold   Int?      // Para logros numéricos
}

enum AchievementCategory {
  QUANTITY
  GENRE
  STREAK
  THEMATIC
}

model UserAchievement {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  achievementId   String
  achievement     Achievement @relation(fields: [achievementId], references: [id])
  unlockedAt      DateTime  @default(now())
  progress        Int?      // Para logros con progreso

  @@unique([userId, achievementId])
}

model Follow {
  id          String    @id @default(cuid())
  followerId  String
  follower    User      @relation("Following", fields: [followerId], references: [id])
  followingId String
  following   User      @relation("Followers", fields: [followingId], references: [id])
  createdAt   DateTime  @default(now())

  @@unique([followerId, followingId])
}
```

---

## 🎨 Guía de Estética Cuphead

### Paleta de Colores
- **Primarios:** Sepia (#E8D5B7), Crema (#F5E6D3), Negro carbón (#1A1A1A)
- **Acentos:** Rojo vintage (#C1272D), Amarillo mostaza (#E9B44C)
- **Backgrounds:** Papel envejecido (#FAF0E6), gradientes sepia

### Tipografía
- **Headings:** Fuentes estilo años 30 (Benguiat, Poller One, Luckiest Guy)
- **Body:** Fuentes legibles pero con carácter vintage

### Elementos Visuales
- Bordes gruesos tipo cartoon
- Animaciones con "bounce" exagerado
- Efectos de viñeta y grano de película
- Sombras paralelas estilo cel-shading
- Transiciones con "frame-by-frame" feeling

---

## 📈 Métricas de Éxito

### MVP (Fase 1-2)
- 50+ usuarios registrados
- 500+ items agregados a listas
- 10+ listas colaborativas creadas

### Post-MVP (Fase 3-4)
- 200+ usuarios activos mensuales
- 100+ reviews publicadas
- 50+ logros desbloqueados

### Long-term
- 1000+ usuarios registrados
- Retención del 40%+ (usuarios volviendo semanalmente)
- Engagement: 10+ interacciones por usuario/semana

---

## 🚀 Consideraciones Técnicas Importantes

### APIs Externas

**TMDB API:**
- Rate limit: 40 requests/10 segundos
- Requiere caché agresivo
- Endpoints: `/search/multi`, `/movie/{id}`, `/tv/{id}`

**Jikan API:**
- Rate limit: 60 requests/minuto
- Datos más completos para anime
- Endpoints: `/anime`, `/anime/{id}`

### Colaboración en Tiempo Real
- Usar Pusher (5000 mensajes/día gratis) o Socket.io
- Implementar debouncing para evitar spam de updates
- Considerar Operational Transformation o CRDTs para edición simultánea

### Seguridad
- Validación de permisos en todas las mutaciones
- Rate limiting en APIs propias
- Sanitización de contenido de reviews
- CSRF protection con NextAuth

### SEO
- Server-side rendering para perfiles públicos
- Meta tags dinámicos por contenido
- Sitemap automático
- Structured data (Schema.org)

---

## 📝 Notas Finales

Este roadmap está diseñado para un desarrollador fullstack trabajando solo durante 3-6 meses. Las fases son flexibles y pueden ajustarse según:

- Feedback de usuarios beta
- Complejidad técnica encontrada
- Prioridades de negocio
- Recursos disponibles

**Recomendación:** Lanzar al final de Fase 2 como MVP privado beta, iterar con feedback real, y luego completar Fases 3-4 antes del lanzamiento público.

---

**Última actualización:** Enero 2026
**Versión:** 1.0
