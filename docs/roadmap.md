# OWLIST - Roadmap de Desarrollo

> *Trackea tu diversión*  
> Versión 1.0 | Enero 2025  
> *Hecho con mucho café y tinta vieja*

---

## 1. Resumen Ejecutivo

Owlist es una aplicación web de tracking de entretenimiento (películas, series y anime) con una identidad visual distintiva inspirada en los cartoons de los años 30, similar al estilo de Cuphead. La plataforma se diferencia de competidores como Letterboxd, Trakt y MyAnimeList a través de dos características principales: un **sistema de logros gamificado** y **listas colaborativas**.

### Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React + TypeScript |
| Backend | Node.js + TypeScript |
| Base de datos | Supabase (PostgreSQL + Auth + Storage) |
| APIs externas | TMDB (películas/series) + AniList (anime) |

### Características Core del MVP

1. Tracking unificado de películas, series y anime con filtros por tipo
2. Sistema de listas personalizadas y colaborativas
3. Reviews con ratings, spoiler tags, likes y replies
4. Perfiles públicos con sistema de seguimiento
5. Sistema de logros visible en perfil

---

## 2. Timeline General

El desarrollo se estructura en 6 fases principales, diseñadas para que un desarrollador solo pueda avanzar de forma incremental.

| Fase | Nombre | Duración | Semanas |
|:----:|--------|----------|:-------:|
| 0 | Fundamentos | 3 semanas | 1-3 |
| 1 | Core de Tracking | 5 semanas | 4-8 |
| 2 | Sistema Social | 5 semanas | 9-13 |
| 3 | Listas Colaborativas | 5 semanas | 14-18 |
| 4 | Sistema de Logros | 4 semanas | 19-22 |
| 5 | Pulido y Lanzamiento | 4 semanas | 23-26 |

**Total estimado: ~6 meses**

> **Nota:** Las estimaciones asumen dedicación part-time (~20-25 horas semanales). Full-time podría reducir los tiempos significativamente.

---

## 3. Fase 0: Fundamentos (Semanas 1-3)

Establecer la base técnica y visual del proyecto antes de desarrollar funcionalidades.

### 3.1 Setup del Proyecto

- [ ] Inicializar repositorio con estructura monorepo (si se desea separar front/back)
- [ ] Configurar React con TypeScript, Vite, y ESLint/Prettier
- [ ] Setup de Node.js/Express con TypeScript
- [ ] Crear proyecto en Supabase y configurar conexión
- [ ] Configurar variables de entorno y estructura de carpetas
- [ ] Setup de CI/CD básico (GitHub Actions para lint/tests)

### 3.2 Sistema de Diseño Retro

Desarrollar el design system basado en la estética cartoon de los 30s:

| Elemento | Valor |
|----------|-------|
| **Color primario (crema)** | `#F5F0E1` |
| **Color acento (rojo)** | `#C74634` |
| **Color oscuro (marrón)** | `#2D2A26` |
| **Color secundario (dorado)** | `#D4A84B` |

**Componentes a desarrollar:**
- Tipografías: Serif decorativa para títulos, sans-serif vintage para cuerpo
- Botones con bordes gruesos y sombras
- Cards con estética de póster vintage
- Inputs estilizados
- Iconografía personalizada al estilo
- Animaciones sutiles estilo rubber hose

### 3.3 Modelo de Datos Base

Diseñar e implementar el schema en Supabase:

| Tabla | Descripción |
|-------|-------------|
| `users` | Datos de usuario y preferencias |
| `content` | Cache de contenido de APIs externas |
| `user_content` | Relación usuario-contenido con estado de tracking |
| `lists` | Listas personalizadas |
| `list_items` | Items dentro de listas |
| `list_collaborators` | Colaboradores de listas |
| `reviews` | Reviews de usuarios |
| `review_likes` | Likes en reviews |
| `review_comments` | Comentarios en reviews |
| `follows` | Relaciones de seguimiento |
| `achievements` | Definición de logros |
| `user_achievements` | Logros desbloqueados por usuario |

### ✅ Entregables de la Fase 0

- [ ] Repositorio configurado y funcionando
- [ ] Storybook con componentes base del design system
- [ ] Base de datos con schema inicial migrado
- [ ] Landing page estática con la estética definida

---

## 4. Fase 1: Core de Tracking (Semanas 4-8)

Implementar la funcionalidad principal de la aplicación.

### 4.1 Integración de APIs

#### TMDB (Películas y Series)
- [ ] Configurar cliente API con rate limiting
- [ ] Implementar búsqueda unificada de películas y series
- [ ] Obtener detalles completos: sinopsis, cast, géneros, imágenes
- [ ] Cachear resultados frecuentes en Supabase

#### AniList (Anime)
- [ ] Configurar cliente GraphQL
- [ ] Mapear campos de AniList al modelo unificado de Owlist
- [ ] Manejar diferencias (episodios, temporadas, formatos de anime)

### 4.2 Sistema de Autenticación

- [ ] Implementar OAuth con Supabase (Google, Discord, GitHub)
- [ ] Flujo de registro con creación automática de perfil
- [ ] Manejo de sesiones y refresh tokens
- [ ] Protección de rutas y middleware de autenticación

### 4.3 Tracking de Contenido

| Estado | Descripción |
|--------|-------------|
| `watched` | Visto |
| `watching` | Viendo |
| `want_to_watch` | Quiero ver |
| `dropped` | Abandonado |
| `paused` | Pausado |

**Funcionalidades:**
- [ ] Interfaz para agregar contenido con selección de estado
- [ ] Tracking de progreso para series/anime (episodios vistos)
- [ ] Fecha de visualización opcional
- [ ] Filtros por tipo (película/serie/anime), estado, y género

### 4.4 Vistas Principales

- [ ] **Búsqueda:** Input con resultados unificados de TMDB + AniList
- [ ] **Detalle de contenido:** Página con info completa y acciones de tracking
- [ ] **Mi catálogo:** Grid/lista con todo el contenido del usuario, filtrable
- [ ] **Estadísticas básicas:** Total visto, tiempo invertido, géneros favoritos

### ✅ Entregables de la Fase 1

- [ ] Sistema de auth funcional con OAuth
- [ ] Búsqueda unificada funcionando
- [ ] CRUD completo de tracking
- [ ] Catálogo personal con filtros

---

## 5. Fase 2: Sistema Social (Semanas 9-13)

Convertir Owlist de una herramienta personal a una plataforma social.

### 5.1 Perfiles Públicos

- [ ] Página de perfil con avatar, bio, y estadísticas
- [ ] URL personalizada (`/u/username`)
- [ ] Showcase de contenido favorito
- [ ] Configuración de privacidad (perfil público/privado)
- [ ] Visualización de logros obtenidos

### 5.2 Sistema de Seguimiento

- [ ] Seguir/dejar de seguir usuarios
- [ ] Lista de seguidores y seguidos
- [ ] Feed de actividad de usuarios seguidos
- [ ] Sugerencias de usuarios a seguir (basado en gustos similares)

### 5.3 Reviews y Comentarios

| Feature | Descripción |
|---------|-------------|
| **Reviews** | Texto largo con rating (1-10 o estrellas) |
| **Spoiler tags** | Marcar review/sección como spoiler con blur |
| **Likes** | Dar like a reviews de otros usuarios |
| **Replies** | Comentar en reviews (un nivel de anidación) |

- [ ] Feed de reviews populares/recientes en la página de contenido

### 5.4 Feed de Actividad

- [ ] Mostrar actividad reciente: contenido agregado, reviews, likes
- [ ] Filtrar por tipo de actividad
- [ ] Paginación infinita con scroll

### ✅ Entregables de la Fase 2

- [ ] Perfiles públicos completos
- [ ] Sistema de follow funcionando
- [ ] Reviews con todas las interacciones
- [ ] Feed de actividad social

---

## 6. Fase 3: Listas Colaborativas (Semanas 14-18)

Implementar el diferenciador principal: listas que múltiples usuarios pueden editar.

### 6.1 Sistema de Listas Base

- [ ] **Listas predefinidas:** Visto, Viendo, Quiero ver (no editables, automáticas)
- [ ] **Listas personalizadas:** Crear con nombre, descripción, cover
- [ ] Ordenar contenido dentro de listas (drag & drop)
- [ ] Listas públicas vs privadas
- [ ] Agregar notas a items de lista

### 6.2 Colaboración

- [ ] Invitar usuarios a colaborar mediante link o username
- [ ] **Roles:** Owner (control total), Editor (agregar/quitar), Viewer (solo ver)
- [ ] Historial de cambios (quién agregó qué)
- [ ] Notificación cuando alguien modifica la lista

### 6.3 Sincronización (Simplificada)

Implementación inicial con polling, optimizable a tiempo real después:

- [ ] Refresh automático cada 30 segundos cuando la lista está abierta
- [ ] Indicador visual de cambios pendientes
- [ ] Manejo de conflictos básico (último en guardar gana con aviso)

> **Futuro:** Migrar a Supabase Realtime para actualizaciones instantáneas

### 6.4 Descubrimiento de Listas

- [ ] Explorar listas públicas populares
- [ ] Buscar listas por nombre o contenido
- [ ] Guardar/seguir listas de otros usuarios
- [ ] Clonar lista pública a tu cuenta

### ✅ Entregables de la Fase 3

- [ ] CRUD completo de listas personalizadas
- [ ] Sistema de invitación y roles
- [ ] Sincronización básica funcionando
- [ ] Página de exploración de listas

---

## 7. Fase 4: Sistema de Logros (Semanas 19-22)

Implementar el sistema de gamificación con logros desbloqueables.

### 7.1 Engine de Logros

- [ ] Sistema de eventos que disparan evaluación de logros
- [ ] Evaluación asíncrona (no bloquear UX)
- [ ] Almacenar progreso parcial para logros de múltiples pasos
- [ ] Notificación toast al desbloquear logro

### 7.2 Categorías de Logros

| Categoría | Ejemplos |
|-----------|----------|
| **Cantidad** | Primer visto, 10 películas, 100 animes, 500 contenidos total |
| **Géneros** | Explorador de terror (10 de terror), Romántico empedernido (25 romance) |
| **Rachas** | 7 días seguidos, Mes completo, Racha de 100 días |
| **Social** | Primera review, 10 seguidores, Review popular (50+ likes) |
| **Listas** | Primera lista, Lista colaborativa con 5+ miembros |
| **Especiales** | Maratonista (5 películas en un día), Noctámbulo (actividad 3-5am) |

### 7.3 Diseño Visual de Logros

- [ ] Medallas con estética retro (sepia, bordes gruesos)
- [ ] Niveles de rareza con colores: Bronce, Plata, Oro, Platino
- [ ] Animación de desbloqueo estilo cartoon
- [ ] Logros ocultos que se revelan al desbloquear

### 7.4 Integración con Perfil

- [ ] Sección de logros en perfil público
- [ ] Seleccionar logros destacados (showcase de 3-5)
- [ ] Contador de logros totales y por categoría
- [ ] Página dedicada con todos los logros y progreso

### ✅ Entregables de la Fase 4

- [ ] Engine de logros funcionando
- [ ] Set inicial de 30-50 logros implementados
- [ ] UI de logros con animaciones
- [ ] Integración completa con perfil

---

## 8. Fase 5: Pulido y Lanzamiento (Semanas 23-26)

Preparar la aplicación para uso público.

### 8.1 Optimización de Performance

- [ ] Audit con Lighthouse y optimización de métricas
- [ ] Lazy loading de imágenes y componentes
- [ ] Implementar caché agresivo donde sea posible
- [ ] Optimizar queries de Supabase (índices, paginación)
- [ ] Code splitting y bundle optimization

### 8.2 Testing

- [ ] Tests unitarios para lógica crítica (logros, tracking)
- [ ] Tests de integración para flujos principales
- [ ] Testing manual de edge cases
- [ ] Testing de responsive en múltiples dispositivos

### 8.3 SEO y Accesibilidad

- [ ] Meta tags dinámicos para perfiles y contenido
- [ ] Open Graph para compartir en redes sociales
- [ ] Auditoría de accesibilidad (contraste, navegación por teclado)
- [ ] Sitemap y robots.txt

### 8.4 Infraestructura de Producción

- [ ] Deploy en Vercel/Netlify (frontend) + Railway/Render (backend)
- [ ] Configurar dominio `owlist.com` (o similar)
- [ ] SSL y headers de seguridad
- [ ] Monitoreo básico (Sentry para errores)
- [ ] Backups automáticos de Supabase

### 8.5 Documentación

- [ ] README completo del proyecto
- [ ] Guía de contribución si se abre el código
- [ ] FAQ y ayuda para usuarios
- [ ] Términos de servicio y política de privacidad

### ✅ Entregables de la Fase 5

- [ ] Aplicación optimizada y testeada
- [ ] Infraestructura de producción configurada
- [ ] Documentación completa
- [ ] **MVP listo para lanzamiento público** 🚀

---

## 9. Roadmap Post-MVP

Features para considerar después del lanzamiento inicial, priorizados por impacto y complejidad.

### Alta Prioridad

| Feature | Descripción |
|---------|-------------|
| **Notificaciones** | Estrenos de contenido seguido, actividad social, nuevos episodios |
| **Tiempo real en listas** | Migrar de polling a Supabase Realtime |
| **PWA** | Convertir a Progressive Web App para instalación en móvil |

### Media Prioridad

| Feature | Descripción |
|---------|-------------|
| **Importación de datos** | Importar historial desde Letterboxd, Trakt, MAL |
| **Recomendaciones** | Motor de recomendaciones basado en historial |
| **Estadísticas avanzadas** | Gráficos de actividad, comparativas año vs año |
| **Temas/skins** | Variantes del tema retro (noir, technicolor, etc) |

### Baja Prioridad

| Feature | Descripción |
|---------|-------------|
| **App nativa** | React Native o Flutter si hay demanda |
| **API pública** | Para integraciones de terceros |
| **Monetización** | Plan premium con features adicionales |
| **Logros especiales** | Logros de madrugada, maratones extremas, etc. |

---

## 10. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|:-------:|------------|
| Cambios en APIs externas (TMDB/AniList) | Alto | Capa de abstracción, cacheo agresivo, monitoreo de cambios |
| Scope creep | Alto | MVP definido, features post-lanzamiento claramente separados |
| Complejidad de listas colaborativas | Medio | Empezar con polling simple, iterar hacia tiempo real |
| Burnout (desarrollador solo) | Alto | Fases cortas con entregables claros, celebrar hitos |
| Problemas de performance con muchos usuarios | Medio | Optimización temprana de queries, índices en Supabase |

---

<div align="center">

**OWLIST © 1930**

*Documento generado con mucho café y tinta vieja*

</div>