# Roadmap del Proyecto Rowlet

## Fase 1: MVP (Mes 1-2)

**Objetivo:** Validar el concepto con funcionalidad básica

### Features
- [ ] Autenticación de usuarios (email/Google)
- [ ] Búsqueda de contenido (películas, series, anime) usando API pública (TMDB, MyAnimeList)
- [ ] Marcar contenido como "Visto", "Viendo", "Por ver"
- [ ] Listas personalizadas básicas
- [ ] Perfil de usuario simple con estadísticas básicas (total visto, géneros favoritos)

### Extras MVP
- [ ] Integración con plataformas de streaming: indicar dónde está disponible cada contenido
- [ ] Tracking de tiempo: calcular automáticamente horas totales basado en duración

---

## Fase 2: Experiencia Mejorada (Mes 3-4)

**Objetivo:** Hacer la app más sticky y útil

### Features
- [ ] Sistema de rating (1-5 estrellas o 1-10)
- [ ] Comentarios/notas personales en cada contenido
- [ ] Seguimiento de progreso en series (episodios vistos)
- [ ] Filtros avanzados (por género, año, plataforma)
- [ ] Descubrimiento básico: "Basado en lo que viste, te puede gustar..."
- [ ] Modo oscuro/claro

### Extras Fase 2
- [ ] Calendario de lanzamientos: notificaciones de nuevos episodios o estrenos
- [ ] Import de otras plataformas: traer datos de MAL, Letterboxd, Trakt

---

## Fase 3: Social & Gamificación (Mes 5-6)

**Objetivo:** Crear comunidad y retención

### Features
- [ ] Perfiles públicos opcionales
- [ ] Seguir a otros usuarios
- [ ] Listas compartidas/colaborativas
- [ ] Badges/logros (ej: "Maratonista", "Cinéfilo de los 80s")
- [ ] Timeline de actividad de amigos
- [ ] Recomendaciones de amigos

### Features Diferenciadores
- [ ] Mood-based recommendations: "Qué ver cuando estás triste/feliz/aburrido"
- [ ] Challenges mensuales: "Ve 10 películas de terror este octubre"
- [ ] Roulette: botón random que elige de tu lista "Por ver"
- [ ] Watch parties virtuales: sincronizar visualización con amigos

---

## Fase 4: El "Wrapped" y Analytics (Mes 7-8)

**Objetivo:** La feature estrella 🌟

### Features
- [ ] Dashboard personal con métricas en tiempo real
- [ ] Wrapped anual personalizado:
  - [ ] Total de horas vistas
  - [ ] Géneros dominantes
  - [ ] Actor/director más visto
  - [ ] Mes con más contenido
  - [ ] Comparativas año a año
- [ ] Gráficos visuales atractivos para compartir
- [ ] Exportar estadísticas como imagen para RRSS
- [ ] Comparativas con amigos (opcional)

---

## Fase 5: Monetización & Premium (Mes 9+)

**Objetivo:** Generar ingresos

### Plan Gratuito
- Límite de listas
- Estadísticas básicas
- Con publicidad

### Plan Premium
- [ ] Listas ilimitadas
- [ ] Estadísticas avanzadas
- [ ] Sin publicidad
- [ ] Acceso anticipado al Wrapped
- [ ] Temas personalizados
- [ ] Backup/export de datos

---

## Stack Tecnológico

### Frontend - React SPA
- **Core:** React 18+ con TypeScript, Vite, React Router v6, TanStack Query, Zustand
- **UI & Styling:** Tailwind CSS, shadcn/ui, Framer Motion, Lucide React
- **Forms:** React Hook Form, Zod

### Backend - Node.js API
- **Core:** Node.js 20+ con TypeScript, Express.js, Supabase
- **Database:** PostgreSQL (Supabase), Prisma ORM
- **Tools:** Zod, JWT, node-cron

### APIs Externas
- TMDB API para películas/series
- Jikan API para anime (MyAnimeList)
