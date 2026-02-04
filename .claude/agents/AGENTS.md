# Repository Guidelines - Owlist

## How to Use This Guide

- Start here for cross-project norms. Owlist has frontend and backend components.
- Each component has its own guidelines in respective directories (`frontend/AGENTS.md`, `backend/AGENTS.md`).
- Component docs override this file when guidance conflicts.

## Available Skills

Use these skills for detailed patterns on-demand:

### Generic Skills (External - Install via npx)

| Skill | Install Command | Description |
|-------|-----------------|-------------|
| `vercel-react-best-practices` | `npx skills add vercel-labs/agent-skills` | React patterns, Server Components, hooks |
| `supabase-postgres-best-practices` | `npx skills add supabase/agent-skills` | Postgres optimization, RLS, schema design |
| `tanstack-query` | `npx skills add jezweb/claude-skills` | Data fetching, caching, mutations |
| `frontend-design` | `npx skills add anthropics/skills` | UI/UX design patterns |
| `typescript-advanced-types` | `npx skills add wshobson/agents` | TypeScript patterns |
| `zustand-5` | Built-in | State management patterns |
| `test-driven-development` | `npx skills add obra/superpowers` | TDD workflow |

### Owlist-Specific Skills (Local)

| Skill | Description | Location |
|-------|-------------|----------|
| `owlist` | Project overview, component navigation | [SKILL.md](skills/owlist/SKILL.md) |
| `owlist-ui` | React + TypeScript conventions | [SKILL.md](skills/owlist-ui/SKILL.md) |
| `owlist-api` | Node.js + Supabase patterns | [SKILL.md](skills/owlist-api/SKILL.md) |
| `owlist-design-system` | Retro 30s cartoon aesthetic | [SKILL.md](skills/owlist-design-system/SKILL.md) |
| `owlist-supabase` | Database schema, RLS, Auth | [SKILL.md](skills/owlist-supabase/SKILL.md) |
| `owlist-api-integration` | TMDB + AniList integration | [SKILL.md](skills/owlist-api-integration/SKILL.md) |
| `owlist-achievements` | Achievement system patterns | [SKILL.md](skills/owlist-achievements/SKILL.md) |
| `owlist-lists` | Collaborative lists implementation | [SKILL.md](skills/owlist-lists/SKILL.md) |
| `owlist-test` | Testing patterns (Vitest, Playwright) | [SKILL.md](skills/owlist-test/SKILL.md) |
| `owlist-commit` | Commit conventions | [SKILL.md](skills/owlist-commit/SKILL.md) |

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Creating React components | `owlist-ui` |
| Working with design tokens/styles | `owlist-design-system` |
| Creating API endpoints | `owlist-api` |
| Working with Supabase (schema, RLS, queries) | `owlist-supabase` |
| Integrating TMDB or AniList APIs | `owlist-api-integration` |
| Implementing achievement logic | `owlist-achievements` |
| Working on collaborative lists | `owlist-lists` |
| Writing tests | `owlist-test` |
| Committing changes | `owlist-commit` |
| Data fetching with TanStack Query | `tanstack-query` |
| State management with Zustand | `zustand-5` |
| TypeScript types/interfaces | `typescript-advanced-types` |
| General project questions | `owlist` |

---

## Project Overview

Owlist is a media tracking application (movies, series, anime) with a distinctive 1930s cartoon visual identity.

| Component | Location | Tech Stack |
|-----------|----------|------------|
| Frontend | `frontend/` | React 18, TypeScript, Vite, TanStack Query, Zustand |
| Backend | `backend/` | Node.js, Express, TypeScript |
| Database | Supabase | PostgreSQL, Row Level Security, Auth, Storage |
| External APIs | - | TMDB, AniList (GraphQL) |

### Project Structure

```
owlist/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # Design system primitives
│   │   │   ├── shared/     # Shared across features
│   │   │   └── {feature}/  # Feature-specific components
│   │   ├── features/       # Feature modules
│   │   │   ├── tracking/   # Content tracking
│   │   │   ├── lists/      # User lists
│   │   │   ├── social/     # Follows, reviews, feed
│   │   │   ├── achievements/ # Gamification
│   │   │   └── profile/    # User profiles
│   │   ├── hooks/          # Shared custom hooks
│   │   ├── lib/            # Utilities, API clients
│   │   ├── store/          # Zustand stores
│   │   ├── types/          # Shared TypeScript types
│   │   └── styles/         # Global CSS, design tokens
│   ├── tests/              # Vitest + Playwright
│   └── AGENTS.md
├── backend/
│   ├── src/
│   │   ├── routes/         # Express routes
│   │   ├── services/       # Business logic
│   │   ├── integrations/   # TMDB, AniList clients
│   │   ├── middleware/     # Auth, validation
│   │   └── types/          # Shared types
│   ├── tests/
│   └── AGENTS.md
├── supabase/
│   ├── migrations/         # SQL migrations
│   ├── functions/          # Edge functions
│   └── seed.sql            # Seed data
├── skills/                 # AI agent skills
│   ├── owlist/
│   ├── owlist-ui/
│   ├── owlist-api/
│   └── ...
├── AGENTS.md               # This file
├── ROADMAP.md              # Development roadmap
└── README.md
```

---

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 8+
- Supabase CLI
- Docker (for local Supabase)

### Quick Start

```bash
# Clone and install
git clone https://github.com/matills/rowlet.git
cd rowlet
pnpm install

# Start Supabase locally
supabase start

# Start development
pnpm dev          # Runs both frontend and backend
pnpm dev:frontend # Frontend only
pnpm dev:backend  # Backend only
```

### Environment Variables

```bash
# frontend/.env.local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3000

# backend/.env
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_KEY=your-service-key
TMDB_API_KEY=your-tmdb-key
ANILIST_CLIENT_ID=your-anilist-id
```

---

## Code Quality

### Frontend

```bash
cd frontend
pnpm typecheck      # TypeScript check
pnpm lint           # ESLint
pnpm lint:fix       # ESLint with auto-fix
pnpm format         # Prettier
pnpm test           # Vitest unit tests
pnpm test:e2e       # Playwright E2E tests
pnpm healthcheck    # All checks
```

### Backend

```bash
cd backend
pnpm typecheck
pnpm lint
pnpm lint:fix
pnpm test
pnpm healthcheck
```

---

## Commit & Pull Request Guidelines

Follow conventional-commit style: `<type>[scope]: <description>`

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code refactoring |
| `perf` | Performance improvement |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

### Scopes

| Scope | Description |
|-------|-------------|
| `ui` | Frontend UI components |
| `api` | Backend API |
| `db` | Database/Supabase |
| `auth` | Authentication |
| `tracking` | Content tracking feature |
| `lists` | Lists feature |
| `social` | Social features (follows, reviews) |
| `achievements` | Achievement system |
| `design` | Design system |

### Examples

```bash
feat(tracking): add anime episode progress tracking
fix(lists): resolve duplicate items on collaborative edit
docs(api): add API documentation for search endpoint
refactor(ui): extract card component to shared
test(achievements): add unit tests for streak calculation
```

### Before Creating a PR

1. Run `pnpm healthcheck` in affected packages
2. Ensure all tests pass
3. Update documentation if needed
4. Add screenshots for UI changes
5. Link related issues

---

## Design Guidelines

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Cream | `#F5F0E1` | Background, cards |
| Red | `#C74634` | Accents, CTAs |
| Dark Brown | `#2D2A26` | Text, headers |
| Gold | `#D4A84B` | Highlights, achievements |
| Light Gray | `#E8E4D9` | Borders, dividers |

### Typography

- **Headings:** Serif decorative (e.g., Playfair Display)
- **Body:** Sans-serif vintage (e.g., Work Sans, Lato)

### Visual Style

- Thick borders (2-3px)
- Paper/aged textures
- Rubber hose animation style for micro-interactions
- Sepia tones for images
- Vintage poster aesthetic for cards

---

## Key Decisions

### Why Supabase?
- Built-in Auth with OAuth providers
- Row Level Security for multi-tenant data
- Realtime subscriptions (future use for collaborative lists)
- Edge Functions for serverless compute
- Storage for user uploads

### Why TanStack Query?
- Excellent caching and invalidation
- Optimistic updates for better UX
- Built-in loading/error states
- Works well with Supabase client

### Why Zustand over Redux?
- Simpler API, less boilerplate
- TypeScript-first
- Persist middleware for local storage
- Smaller bundle size

### Why Vite over CRA/Next.js?
- Faster development server
- Simple SPA requirements (no SSR needed initially)
- Better DX with HMR
- Easy migration to SSR later if needed

---

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [TMDB API Docs](https://developer.themoviedb.org/docs)
- [AniList API Docs](https://anilist.gitbook.io/anilist-apiv2-docs)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://docs.pmnd.rs/zustand)

---