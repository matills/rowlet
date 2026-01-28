---
name: owlist-achievements
description: >
  Owlist gamification system with unlockable achievements. Covers achievement engine,
  criteria evaluation, progress tracking, and UI integration.
  Trigger: When working on the achievements/gamification system.
license: MIT
metadata:
  author: owlist
  version: "1.0"
  scope: [root, frontend, backend, supabase]
  auto_invoke:
    - "Implementing achievement logic"
    - "Creating new achievements"
    - "Achievement UI components"
    - "Progress tracking"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

## Achievement System Overview

The achievement system is a core differentiator for Owlist. It gamifies content tracking with retro-styled medals that users can unlock and showcase.

### Key Principles

1. **Non-blocking:** Achievement evaluation happens asynchronously
2. **Retroactive:** New achievements can be unlocked for past activity
3. **Progressive:** Support partial progress (e.g., "5/10 movies watched")
4. **Discoverable:** Some achievements are hidden until unlocked

## Achievement Categories

| Category | Examples | Trigger Events |
|----------|----------|----------------|
| **Quantity** | First movie, 10 movies, 100 total | Content added |
| **Genre** | 10 horror, 25 romance, Genre master | Content added |
| **Streak** | 7 days, 30 days, 100 days | Daily activity |
| **Social** | First review, 10 followers, Popular review | Social actions |
| **Lists** | First list, 5 collaborators | List actions |
| **Special** | Maratonista, Noctámbulo | Time-based triggers |

## Achievement Tiers

| Tier | Color | Difficulty |
|------|-------|------------|
| Bronze | `#CD7F32` | Easy (most users unlock) |
| Silver | `#C0C0C0` | Medium (dedicated users) |
| Gold | `#FFD700` | Hard (committed users) |
| Platinum | `#E5E4E2` | Expert (rare, special) |

## Criteria Types

```typescript
type AchievementCriteria =
  | QuantityCriteria
  | GenreCriteria
  | StreakCriteria
  | SocialCriteria
  | TimeCriteria
  | CompoundCriteria;

interface QuantityCriteria {
  type: 'quantity';
  contentType?: 'movie' | 'series' | 'anime' | 'all';
  status?: 'watched' | 'watching' | 'any';
  count: number;
}

interface GenreCriteria {
  type: 'genre';
  genre: string;
  count: number;
}

interface StreakCriteria {
  type: 'streak';
  days: number;
}

interface SocialCriteria {
  type: 'social';
  metric: 'followers' | 'reviews' | 'review_likes' | 'lists';
  count: number;
}

interface TimeCriteria {
  type: 'time';
  condition: 'hour_range';
  startHour: number;
  endHour: number;
}

interface CompoundCriteria {
  type: 'compound';
  operator: 'AND' | 'OR';
  conditions: AchievementCriteria[];
}
```

## Sample Achievements

```typescript
const achievements = [
  // Quantity - Bronze
  { slug: 'first_watch', name: 'Primer Visto', tier: 'bronze',
    criteria: { type: 'quantity', status: 'watched', count: 1 } },
  { slug: 'movie_fan_10', name: 'Cinéfilo Amateur', tier: 'bronze',
    criteria: { type: 'quantity', contentType: 'movie', count: 10 } },
  
  // Quantity - Silver
  { slug: 'movie_fan_50', name: 'Cinéfilo', tier: 'silver',
    criteria: { type: 'quantity', contentType: 'movie', count: 50 } },
  
  // Quantity - Gold
  { slug: 'total_500', name: 'Leyenda', tier: 'gold',
    criteria: { type: 'quantity', count: 500 } },
  
  // Streak
  { slug: 'streak_7', name: 'Semana Completa', tier: 'bronze',
    criteria: { type: 'streak', days: 7 } },
  { slug: 'streak_30', name: 'Mes Dedicado', tier: 'silver',
    criteria: { type: 'streak', days: 30 } },
  
  // Social
  { slug: 'first_review', name: 'Crítico', tier: 'bronze',
    criteria: { type: 'social', metric: 'reviews', count: 1 } },
  
  // Special (hidden)
  { slug: 'night_owl', name: 'Noctámbulo', tier: 'gold', isHidden: true,
    criteria: { type: 'time', condition: 'hour_range', startHour: 3, endHour: 5 } },
];
```

## Backend Evaluation

```typescript
// services/achievement.service.ts
export async function evaluateAchievements(event: AchievementEvent): Promise<string[]> {
  const { userId } = event;
  const stats = await getUserStats(userId);
  
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .not('id', 'in', `(SELECT achievement_id FROM user_achievements WHERE user_id = '${userId}')`);

  const unlocked: string[] = [];

  for (const achievement of achievements || []) {
    if (evaluateCriteria(achievement.criteria, stats, event)) {
      await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_id: achievement.id,
      });
      unlocked.push(achievement.slug);
    }
  }

  return unlocked;
}

function evaluateCriteria(criteria: AchievementCriteria, stats: any, event: any): boolean {
  switch (criteria.type) {
    case 'quantity':
      const count = criteria.contentType 
        ? stats[`${criteria.contentType}Watched`] 
        : stats.totalWatched;
      return count >= criteria.count;
    case 'streak':
      return stats.currentStreak >= criteria.days;
    case 'time':
      const hour = new Date().getHours();
      return hour >= criteria.startHour && hour <= criteria.endHour;
    case 'compound':
      const results = criteria.conditions.map(c => evaluateCriteria(c, stats, event));
      return criteria.operator === 'AND' ? results.every(r => r) : results.some(r => r);
    default:
      return false;
  }
}
```

## Frontend Components

### AchievementBadge

```typescript
export function AchievementBadge({ achievement, isUnlocked, size = 'md' }) {
  return (
    <div className={clsx(
      'achievement-badge',
      `achievement-badge--${size}`,
      !isUnlocked && 'achievement-badge--locked'
    )}>
      <img src={achievement.iconUrl} alt={achievement.name} />
      {!isUnlocked && <div className="achievement-badge__overlay" />}
    </div>
  );
}
```

### AchievementToast

```typescript
export function AchievementToast({ achievement, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="achievement-toast">
      <AchievementBadge achievement={achievement} isUnlocked size="lg" />
      <div>
        <span>¡Logro desbloqueado!</span>
        <h4>{achievement.name}</h4>
        <p>{achievement.description}</p>
      </div>
    </div>
  );
}
```

## CSS Styles

```css
.achievement-badge {
  border: 3px solid var(--tier-color);
  border-radius: 50%;
  background: var(--color-cream);
  box-shadow: var(--shadow-sm);
}

.achievement-badge--locked {
  filter: grayscale(100%);
  opacity: 0.5;
}

@keyframes achievement-unlock {
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  50% { transform: scale(1.3) rotate(15deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.achievement-badge--unlocking {
  animation: achievement-unlock 0.8s var(--ease-bounce) forwards;
}
```

## Real-time Notifications

```typescript
// hooks/use-achievement-notifications.ts
export function useAchievementNotifications() {
  const userId = useAuthStore(s => s.user?.id);
  
  useEffect(() => {
    if (!userId) return;
    
    const sub = supabase
      .channel(`achievements:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_achievements',
        filter: `user_id=eq.${userId}`,
      }, async (payload) => {
        const { data: achievement } = await supabase
          .from('achievements')
          .select('*')
          .eq('id', payload.new.achievement_id)
          .single();
        
        if (achievement) showToast(achievement);
      })
      .subscribe();
    
    return () => sub.unsubscribe();
  }, [userId]);
}
```

## Testing

```typescript
describe('Achievement Evaluation', () => {
  it('evaluates quantity criteria', () => {
    const stats = { totalWatched: 15, moviesWatched: 10 };
    expect(evaluateCriteria({ type: 'quantity', count: 10 }, stats)).toBe(true);
    expect(evaluateCriteria({ type: 'quantity', count: 20 }, stats)).toBe(false);
  });
  
  it('evaluates streak criteria', () => {
    const stats = { currentStreak: 7 };
    expect(evaluateCriteria({ type: 'streak', days: 7 }, stats)).toBe(true);
    expect(evaluateCriteria({ type: 'streak', days: 30 }, stats)).toBe(false);
  });
});
```