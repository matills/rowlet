# Owlist - Trackea tu diversión

Una aplicación web de tracking de entretenimiento (películas, series y anime) con una identidad visual distintiva inspirada en los cartoons de los años 30.

## Features Principales

- **Tracking unificado** de películas, series y anime
- **Sistema de logros gamificado** con medallas estilo retro
- **Listas colaborativas** en tiempo real
- **Perfiles públicos** con sistema de seguimiento
- **Reviews** con spoiler tags, likes y replies

## Tech Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| Base de datos | Supabase (PostgreSQL + Auth + Storage) |
| State | Zustand (client) + TanStack Query (server) |
| APIs | TMDB (películas/series) + AniList (anime) |

## Estructura del Proyecto

```
owlist/
├── frontend/     # React SPA
├── backend/      # Express API
├── storybook/    # Documentación de componentes
├── supabase/     # Migraciones y configuración
└── docs/         # Documentación
```

## Quick Start

### Prerrequisitos

- Node.js 20+
- pnpm 8+
- Supabase CLI (para desarrollo local)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/matills/rowlet.git
cd rowlet

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Iniciar desarrollo
pnpm dev
```

### Scripts disponibles

```bash
pnpm dev              # Inicia frontend y backend
pnpm dev:frontend     # Solo frontend (puerto 5173)
pnpm dev:backend      # Solo backend (puerto 3000)
pnpm storybook        # Inicia Storybook
pnpm healthcheck      # Lint + TypeCheck
```

## Design System

El diseño está inspirado en la estética de cartoons de los años 30 (Cuphead, Fleischer Studios):

- **Colores:** Cream (#F5F0E1), Red (#C74634), Brown (#2D2A26), Gold (#D4A84B)
- **Tipografía:** Playfair Display (títulos), Work Sans (cuerpo)
- **Estilo:** Bordes gruesos, sombras offset, animaciones bouncy

Ver [Storybook](http://localhost:6006) para documentación de componentes.

## Documentación

- [Roadmap](docs/roadmap.md) - Fases de desarrollo
- [AGENTS.md](.claude/agents/AGENTS.md) - Guías para agentes AI

## 📄 Licencia

MIT © 2025 Owlist

---

<div align="center">

**OWLIST © 1930**

*Hecho con mucho café y tinta vieja*

</div>
