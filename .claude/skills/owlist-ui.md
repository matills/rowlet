---
name: owlist-ui
description: >
  Owlist UI-specific patterns for React components with TypeScript. For generic patterns, see
  external skills: vercel-react-best-practices, typescript-advanced-types.
  Trigger: When creating or modifying React components, hooks, or UI logic in the frontend.
license: MIT
metadata:
  author: owlist
  version: "1.0"
  scope: [root, frontend]
  auto_invoke:
    - "Creating/modifying React components"
    - "Working on frontend UI"
    - "Creating custom hooks"
    - "Component styling questions"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

## Related Skills

- `owlist-design-system` - Visual design, colors, typography
- `typescript-advanced-types` - Complex TypeScript patterns
- `tanstack-query` - Data fetching patterns
- `zustand-5` - State management

## Tech Stack (Versions)

```
React 18.3 | TypeScript 5.4 | Vite 5.4
TanStack Query 5.x | Zustand 5.x | React Hook Form 7.x
Vitest 2.x | Playwright 1.x
```

## DECISION TREES

### Component Placement

```
Used by 1 feature?     → features/{feature}/components/
Used by 2+ features?   → components/shared/
Design system primitive? → components/ui/
Page-level component?  → features/{feature}/pages/
```

### Code Location

```
Server data fetching   → hooks/use-{resource}.ts (TanStack Query)
Client state           → store/{feature}.store.ts (Zustand)
Form logic             → features/{feature}/components/ (React Hook Form)
Types (shared 2+)      → types/{domain}.ts
Types (local 1)        → features/{feature}/types.ts
Utils (shared 2+)      → lib/
Utils (local 1)        → features/{feature}/utils/
```

### Styling Decision

```
Design token exists?    → Use CSS variable from tokens.css
Tailwind class exists?  → Use className
Dynamic value?          → style prop
Conditional styles?     → clsx() or cn() utility
```

## Project Structure

```
frontend/src/
├── components/
│   ├── ui/              # Design system (Button, Card, Input, etc.)
│   ├── shared/          # Shared components (Header, Footer, etc.)
│   └── {domain}/        # Domain-specific (ContentCard, ReviewItem)
├── features/
│   ├── tracking/
│   │   ├── components/  # TrackingButton, StatusSelect
│   │   ├── hooks/       # useTracking, useTrackingStatus
│   │   ├── pages/       # CatalogPage, ContentDetailPage
│   │   └── types.ts
│   ├── lists/
│   ├── social/
│   ├── achievements/
│   └── profile/
├── hooks/               # Shared hooks
├── lib/                 # Utilities
├── store/               # Zustand stores
├── types/               # Shared types
└── styles/              # Global CSS, design tokens
```

## Component Patterns

### Basic Component Structure

```typescript
// components/ui/Button.tsx
import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        isLoading && 'btn--loading',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner size={size} /> : children}
    </button>
  );
}
```

### Feature Component with Data Fetching

```typescript
// features/tracking/components/ContentCard.tsx
import { useContent } from '../hooks/use-content';
import { Card, CardImage, CardBody } from '@/components/ui/Card';
import { TrackingButton } from './TrackingButton';
import type { ContentId } from '@/types/content';

interface ContentCardProps {
  contentId: ContentId;
}

export function ContentCard({ contentId }: ContentCardProps) {
  const { data: content, isLoading, error } = useContent(contentId);

  if (isLoading) return <ContentCardSkeleton />;
  if (error) return <ContentCardError error={error} />;
  if (!content) return null;

  return (
    <Card>
      <CardImage src={content.posterUrl} alt={content.title} />
      <CardBody>
        <h3>{content.title}</h3>
        <p>{content.year}</p>
        <TrackingButton contentId={contentId} />
      </CardBody>
    </Card>
  );
}
```

## Hook Patterns

### TanStack Query Hook

```typescript
// features/tracking/hooks/use-content.ts
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '@/lib/api';
import type { Content, ContentId } from '@/types/content';

export const contentKeys = {
  all: ['content'] as const,
  detail: (id: ContentId) => [...contentKeys.all, id] as const,
  search: (query: string) => [...contentKeys.all, 'search', query] as const,
};

export function useContent(id: ContentId) {
  return useQuery({
    queryKey: contentKeys.detail(id),
    queryFn: () => contentApi.getById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useContentSearch(query: string) {
  return useQuery({
    queryKey: contentKeys.search(query),
    queryFn: () => contentApi.search(query),
    enabled: query.length >= 2,
  });
}
```

### Mutation Hook

```typescript
// features/tracking/hooks/use-update-tracking.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trackingApi } from '@/lib/api';
import { contentKeys } from './use-content';
import type { TrackingStatus, ContentId } from '@/types';

interface UpdateTrackingParams {
  contentId: ContentId;
  status: TrackingStatus;
}

export function useUpdateTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contentId, status }: UpdateTrackingParams) =>
      trackingApi.updateStatus(contentId, status),
    onSuccess: (_, { contentId }) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.detail(contentId) });
      queryClient.invalidateQueries({ queryKey: ['user', 'catalog'] });
    },
  });
}
```

## Zustand Store Pattern

```typescript
// store/ui.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'sepia';
  contentView: 'grid' | 'list';
}

interface UIActions {
  toggleSidebar: () => void;
  setTheme: (theme: UIState['theme']) => void;
  setContentView: (view: UIState['contentView']) => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      // State
      sidebarOpen: true,
      theme: 'sepia',
      contentView: 'grid',

      // Actions
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      setContentView: (contentView) => set({ contentView }),
    }),
    {
      name: 'owlist-ui',
      partialize: (state) => ({
        theme: state.theme,
        contentView: state.contentView,
      }),
    }
  )
);

// Selectors (for optimized re-renders)
export const useTheme = () => useUIStore((s) => s.theme);
export const useContentView = () => useUIStore((s) => s.contentView);
```

## Form Pattern

```typescript
// features/lists/components/CreateListForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Textarea } from '@/components/ui';
import { useCreateList } from '../hooks/use-create-list';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

export function CreateListForm({ onSuccess }: { onSuccess: () => void }) {
  const createList = useCreateList();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isPublic: false },
  });

  const onSubmit = async (data: FormData) => {
    await createList.mutateAsync(data);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="List name"
        {...register('name')}
        error={errors.name?.message}
      />
      <Textarea
        label="Description (optional)"
        {...register('description')}
        error={errors.description?.message}
      />
      <Button type="submit" isLoading={isSubmitting}>
        Create List
      </Button>
    </form>
  );
}
```

## Type Patterns

```typescript
// types/content.ts

// Use branded types for IDs
export type ContentId = string & { readonly __brand: 'ContentId' };
export type UserId = string & { readonly __brand: 'UserId' };

// Content types
export type ContentType = 'movie' | 'series' | 'anime';

export type TrackingStatus = 
  | 'watched'
  | 'watching'
  | 'want_to_watch'
  | 'dropped'
  | 'paused';

// Main content interface
export interface Content {
  id: ContentId;
  type: ContentType;
  externalId: string; // TMDB or AniList ID
  title: string;
  originalTitle?: string;
  year: number;
  posterUrl: string;
  backdropUrl?: string;
  overview: string;
  genres: string[];
  rating?: number;
  
  // Series/Anime specific
  episodeCount?: number;
  seasonCount?: number;
  status?: 'ongoing' | 'ended' | 'upcoming';
}

// User's tracking of content
export interface UserContent {
  userId: UserId;
  contentId: ContentId;
  status: TrackingStatus;
  rating?: number; // 1-10
  review?: string;
  episodesWatched?: number;
  watchedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Commands

```bash
# Development
cd frontend && pnpm dev

# Code Quality
cd frontend && pnpm typecheck
cd frontend && pnpm lint:fix
cd frontend && pnpm format
cd frontend && pnpm healthcheck    # All checks

# Testing
cd frontend && pnpm test           # Vitest
cd frontend && pnpm test:watch     # Watch mode
cd frontend && pnpm test:e2e       # Playwright

# Build
cd frontend && pnpm build
cd frontend && pnpm preview        # Preview build
```

## QA Checklist Before Commit

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes (no warnings)
- [ ] Relevant tests pass
- [ ] All UI states handled (loading, error, empty)
- [ ] Responsive design verified
- [ ] Keyboard navigation works
- [ ] No console errors/warnings

## Critical Rules

1. **No `any` types** - Use `unknown` and narrow, or define proper types
2. **No inline styles** - Use design tokens or Tailwind classes
3. **Always handle loading/error states** - Use skeletons and error boundaries
4. **Colocate related code** - Keep feature code together
5. **Export from index** - Each feature has `index.ts` for public API
6. **Use absolute imports** - `@/` prefix configured in tsconfig