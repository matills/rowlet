# 🤖 Owlist - Sistema de Agentes y Skills

## Descripción General

Este directorio contiene agentes especializados y skills personalizadas para asistir en el desarrollo de Owlist. Los agentes están organizados por tipo de tarea y optimizados para el stack tecnológico del proyecto.

---

## 🎯 Agentes Especializados

### 1. **Frontend Agent** (`frontend-agent.md`)
**Especialidad:** Componentes React, UI/UX, estética Cuphead, animaciones

**Capacidades:**
- Crear componentes React con TypeScript
- Implementar diseño retro cartoon (Cuphead)
- Configurar animaciones con Framer Motion
- Setup de TailwindCSS con tokens personalizados
- Responsive design y accesibilidad

**Cuándo usar:**
- Necesitas crear un nuevo componente UI
- Implementar features de frontend
- Trabajar en la estética visual
- Optimizar performance de renders

---

### 2. **Backend Agent** (`backend-agent.md`)
**Especialidad:** API Routes, Server Actions, lógica de negocio, Supabase

**Capacidades:**
- Crear API Routes de Next.js
- Implementar Server Actions
- Integración con Supabase (Auth, Database, Storage)
- Lógica de negocio y validaciones
- Manejo de errores y seguridad

**Cuándo usar:**
- Crear endpoints de API
- Implementar autenticación
- Lógica de servidor compleja
- Integraciones con servicios externos

---

### 3. **Database Agent** (`database-agent.md`)
**Especialidad:** Supabase, diseño de schemas, queries SQL, RLS policies

**Capacidades:**
- Diseñar schemas de base de datos
- Crear y modificar tablas en Supabase
- Escribir queries SQL optimizadas
- Configurar Row Level Security (RLS)
- Crear funciones y triggers de PostgreSQL
- Migraciones y seed data

**Cuándo usar:**
- Diseñar nuevas tablas o relaciones
- Optimizar queries
- Configurar permisos y seguridad
- Debugging de problemas de DB

---

### 4. **API Integration Agent** (`api-integration-agent.md`)
**Especialidad:** TMDB API, Jikan API, integraciones externas, caching

**Capacidades:**
- Crear wrappers para TMDB y Jikan APIs
- Implementar caché de respuestas
- Manejo de rate limits
- Transformación de datos
- Error handling de APIs externas

**Cuándo usar:**
- Integrar nuevos endpoints de TMDB/Jikan
- Optimizar llamadas a APIs externas
- Debugging de problemas con APIs
- Implementar nuevas integraciones

---

### 5. **Testing Agent** (`testing-agent.md`)
**Especialidad:** Tests unitarios, integración, E2E, debugging

**Capacidades:**
- Escribir tests con Jest/Vitest
- Tests de componentes con React Testing Library
- Tests E2E con Playwright
- Debugging y profiling
- Code coverage analysis

**Cuándo usar:**
- Escribir tests para nuevas features
- Debugging de bugs complejos
- Validar lógica crítica
- Setup de testing infrastructure

---

### 6. **DevOps Agent** (`devops-agent.md`)
**Especialidad:** Deploy, CI/CD, monitoring, performance

**Capacidades:**
- Setup de Vercel deployment
- Configurar Supabase environments
- CI/CD con GitHub Actions
- Monitoring y analytics
- Performance optimization

**Cuándo usar:**
- Configurar deploys
- Setup de environments (dev/staging/prod)
- Optimización de performance
- Configurar monitoring

---

## ⚡ Skills Personalizadas

### Scaffolding Skills

#### `/new-component`
Crea un nuevo componente React con TypeScript y estilo Cuphead.

**Uso:**
```bash
/new-component Button
/new-component MovieCard --with-animation
/new-component ListItem --with-test
```

**Genera:**
- Componente TypeScript
- Archivo de estilos/TailwindCSS
- Storybook story (opcional)
- Test básico (opcional)

---

#### `/new-feature`
Crea una feature completa con frontend + backend + DB.

**Uso:**
```bash
/new-feature reviews
/new-feature user-profile --with-api
/new-feature achievements --full-stack
```

**Genera:**
- Componentes React necesarios
- API Routes
- Schema de Supabase (SQL)
- Types TypeScript
- Tests básicos

---

#### `/new-api`
Crea un nuevo endpoint de API con validación y tipos.

**Uso:**
```bash
/new-api lists/create
/new-api reviews/[id]/update
/new-api users/achievements
```

**Genera:**
- API Route con TypeScript
- Schema de validación (Zod)
- Types para request/response
- Error handling
- Documentación inline

---

### API Integration Skills

#### `/tmdb-search`
Helper para buscar contenido en TMDB API.

**Uso:**
```bash
/tmdb-search movies "Inception"
/tmdb-search series "Breaking Bad"
/tmdb-search multi "Naruto"
```

**Retorna:**
- Resultados formateados
- Datos transformados para Owlist
- Código de ejemplo para integrar

---

#### `/jikan-search`
Helper para buscar anime en Jikan API.

**Uso:**
```bash
/jikan-search anime "One Piece"
/jikan-search manga "Berserk"
```

**Retorna:**
- Resultados de MyAnimeList
- Datos transformados
- Código de integración

---

#### `/api-test`
Prueba endpoints de APIs externas con rate limit tracking.

**Uso:**
```bash
/api-test tmdb /movie/550
/api-test jikan /anime/1
```

**Retorna:**
- Respuesta completa
- Headers importantes
- Rate limit status
- Response time

---

### Database Skills

#### `/supabase-table`
Crea una nueva tabla en Supabase con RLS.

**Uso:**
```bash
/supabase-table achievements
/supabase-table list_collaborators --with-rls
```

**Genera:**
- SQL para crear tabla
- RLS policies básicas
- Types TypeScript
- Queries de ejemplo

---

#### `/supabase-query`
Genera queries optimizadas de Supabase.

**Uso:**
```bash
/supabase-query "get user lists with items count"
/supabase-query "get reviews for movie with user data"
```

**Genera:**
- Query TypeScript con Supabase client
- Tipos para resultado
- Error handling
- Optimizaciones (select específico, joins)

---

#### `/db-migrate`
Crea una migración de base de datos.

**Uso:**
```bash
/db-migrate "add achievements table"
/db-migrate "add collaborators to lists"
```

**Genera:**
- SQL migration file
- Rollback script
- Documentación de cambios

---

### Analysis & Debugging Skills

#### `/analyze-component`
Analiza un componente React en busca de mejoras.

**Uso:**
```bash
/analyze-component components/MovieCard.tsx
```

**Retorna:**
- Performance issues
- Best practices violations
- Sugerencias de refactoring
- Accessibility issues

---

#### `/analyze-api`
Analiza un endpoint de API.

**Uso:**
```bash
/analyze-api app/api/lists/route.ts
```

**Retorna:**
- Security issues
- Performance bottlenecks
- Error handling gaps
- Type safety issues

---

#### `/debug-query`
Debug de queries lentas de Supabase.

**Uso:**
```bash
/debug-query "query que tarda mucho"
```

**Retorna:**
- EXPLAIN ANALYZE del query
- Sugerencias de índices
- Query optimizado
- Estimación de mejora

---

### Documentation Skills

#### `/document-api`
Genera documentación para un endpoint.

**Uso:**
```bash
/document-api app/api/reviews/route.ts
```

**Genera:**
- OpenAPI/Swagger spec
- Markdown documentation
- Ejemplos de uso
- Types exportados

---

#### `/document-component`
Genera documentación para un componente.

**Uso:**
```bash
/document-component components/ListCard.tsx
```

**Genera:**
- JSDoc comments
- Props documentation
- Usage examples
- Storybook story

---

## 🚀 Workflows Comunes

### Crear una nueva feature completa

```bash
# 1. Diseñar schema de DB
> Hey Database Agent, necesito una tabla para [feature]

# 2. Crear tabla y RLS
> /supabase-table [table-name] --with-rls

# 3. Crear API endpoints
> /new-api [feature]/create
> /new-api [feature]/[id]/update

# 4. Crear componentes
> /new-component [FeatureName]Card
> /new-component [FeatureName]Form

# 5. Testing
> Hey Testing Agent, crea tests para [feature]
```

### Integrar API externa

```bash
# 1. Probar endpoint
> /api-test tmdb /movie/popular

# 2. Crear wrapper
> Hey API Integration Agent, crea wrapper para endpoint X de TMDB

# 3. Implementar caché
> Agrega caché a la integración de TMDB
```

### Optimizar performance

```bash
# 1. Analizar componente
> /analyze-component components/MovieList.tsx

# 2. Optimizar queries
> /debug-query "select * from lists..."

# 3. Validar mejoras
> Hey Testing Agent, crea performance test para MovieList
```

---

## 📚 Recursos Adicionales

### Documentación de referencia
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TMDB API](https://developer.themoviedb.org/docs)
- [Jikan API](https://docs.api.jikan.moe/)
- [Framer Motion](https://www.framer.com/motion/)

### Convenciones del proyecto
- Ver `docs/CONVENTIONS.md` para estándares de código
- Ver `docs/ROADMAP.md` para plan de desarrollo
- Ver `.claude/prompts/` para prompts personalizados

---

## 🔧 Configuración de Agentes

Para usar los agentes de manera óptima:

1. **Contexto específico:** Menciona qué fase del roadmap estás trabajando
2. **Referencias:** Incluye archivos relevantes en tu pregunta
3. **Prioridades:** Indica si priorizas velocidad, calidad o aprendizaje
4. **Stack:** Los agentes asumen Next.js 14 + Supabase + TypeScript

**Ejemplo de uso óptimo:**
```
Hey Frontend Agent, estoy en Fase 1 del roadmap. Necesito crear
el componente MovieCard con estética Cuphead. Debe mostrar:
poster, título, año, rating. Debe ser responsive y tener
hover animation vintage. Incluye TypeScript types y TailwindCSS.
```

---

**Última actualización:** Enero 2026
