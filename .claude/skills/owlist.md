---
name: owlist
description: >
  Owlist project overview and navigation. Use when you need to understand the project structure,
  find where code lives, or get oriented with the codebase. Trigger: General Owlist questions,
  "where is X", "how does the project work", onboarding.
license: MIT
metadata:
  author: owlist
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "General project questions"
    - "Finding where code lives"
    - "Project architecture questions"
    - "Onboarding to the codebase"
allowed-tools: Read, Glob, Grep, Bash
---

## Project Overview

Owlist is a media tracking application for movies, series, and anime with a distinctive 1930s cartoon visual identity (Cuphead-style).

### Key Differentiators

1. **Gamified achievements system** - Unlock retro-styled medals
2. **Collaborative lists** - Real-time shared watchlists
3. **Unified tracking** - Movies, series, and anime in one place
4. **Retro aesthetic** - 1930s cartoon/rubber hose style

## Tech Stack

```
Frontend:  React 18 + TypeScript + Vite
Backend:   Node.js + Express + TypeScript
Database:  Supabase (PostgreSQL + Auth + Storage)
State:     Zustand (client) + TanStack Query (server)
APIs:      TMDB (movies/series) + AniList (anime)
Testing:   Vitest + Playwright
```

## Project Structure

```
owlist/
├── frontend/           # React SPA
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── features/   # Feature modules
│   │   ├── hooks/      # Custom hooks
│   │   ├── lib/        # Utilities
│   │   ├── store/      # Zustand stores
│   │   └── types/      # TypeScript types
│   └── tests/
├── backend/            # Express API
│   └── src/
│       ├── routes/
│       ├── services/
│       └── integrations/
├── supabase/           # Database
│   ├── migrations/
│   └── functions/
└── skills/             # AI agent skills
```

## Feature Modules

| Feature | Location | Description |
|---------|----------|-------------|
| Tracking | `frontend/src/features/tracking/` | Add/update watched content |
| Lists | `frontend/src/features/lists/` | Personal and collaborative lists |
| Social | `frontend/src/features/social/` | Follows, reviews, activity feed |
| Achievements | `frontend/src/features/achievements/` | Gamification system |
| Profile | `frontend/src/features/profile/` | User profiles |

## Related Skills

Load these skills for specific tasks:

| Task | Skill |
|------|-------|
| React components | `owlist-ui` |
| Visual design | `owlist-design-system` |
| API endpoints | `owlist-api` |
| Database work | `owlist-supabase` |
| TMDB/AniList | `owlist-api-integration` |
| Achievements | `owlist-achievements` |
| Lists feature | `owlist-lists` |
| Testing | `owlist-test` |

## Quick Commands

```bash
# Development
pnpm dev              # Start all services
pnpm dev:frontend     # Frontend only (port 5173)
pnpm dev:backend      # Backend only (port 3001)

# Supabase
supabase start        # Start local Supabase
supabase db reset     # Reset database
supabase migration new <name>  # Create migration

# Quality
pnpm healthcheck      # Run all checks
pnpm test             # Run tests
```

## Navigation Guide

### "Where do I find...?"

| Looking for... | Location |
|----------------|----------|
| UI components | `frontend/src/components/` |
| Feature logic | `frontend/src/features/{feature}/` |
| API routes | `backend/src/routes/` |
| Database schema | `supabase/migrations/` |
| Design tokens | `frontend/src/styles/tokens.css` |
| API clients | `backend/src/integrations/` |
| Zustand stores | `frontend/src/store/` |
| Shared types | `frontend/src/types/` or `backend/src/types/` |

### File Naming Conventions

```
ComponentName.tsx       # React component
ComponentName.test.tsx  # Component test
use-hook-name.ts        # Custom hook
service-name.ts         # Backend service
feature.store.ts        # Zustand store
feature.types.ts        # Feature-specific types
```

## Common Patterns

### Adding a New Feature

1. Create feature folder: `frontend/src/features/{feature}/`
2. Add components, hooks, types within feature
3. Create Zustand store if needed: `{feature}.store.ts`
4. Add API routes: `backend/src/routes/{feature}.ts`
5. Add database migration if needed
6. Write tests

### Working with External APIs

- TMDB client: `backend/src/integrations/tmdb/`
- AniList client: `backend/src/integrations/anilist/`
- Both normalize data to `Content` type before returning

### State Management Decision

- **Server state** → TanStack Query (fetching, caching)
- **UI state** → Component state or Zustand
- **Form state** → React Hook Form
- **Global app state** → Zustand

## Resources

- [ROADMAP.md](../ROADMAP.md) - Development phases and timeline
- [AGENTS.md](../AGENTS.md) - Full repo guidelines
- [Supabase Dashboard](http://localhost:54323) - Local Supabase UI