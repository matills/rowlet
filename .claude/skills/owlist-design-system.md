---
name: owlist-design-system
description: >
  Owlist visual design system based on 1930s cartoon aesthetic (Cuphead-style).
  Covers colors, typography, spacing, components, and animation patterns.
  Trigger: When working on visual design, styling, UI aesthetics, or design tokens.
license: MIT
metadata:
  author: owlist
  version: "1.0"
  scope: [root, frontend]
  auto_invoke:
    - "Working with design tokens/styles"
    - "Creating visual designs"
    - "Styling components"
    - "Animation patterns"
    - "Brand consistency questions"
allowed-tools: Read, Edit, Write, Glob, Grep
---

## Design Philosophy

Owlist's visual identity is inspired by **1930s cartoons** (Fleischer, early Disney, Cuphead):

- **Rubber hose** animation style
- **Sepia and cream** color palette
- **Thick outlines** and bold shapes
- **Paper/aged textures**
- **Vintage poster** aesthetics
- **Playful but functional** UI

## Color Palette

### Primary Colors

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Cream | `#F5F0E1` | `--color-cream` | Backgrounds, cards |
| Cream Dark | `#E8E4D9` | `--color-cream-dark` | Borders, dividers |
| Red | `#C74634` | `--color-red` | Primary actions, accents |
| Red Dark | `#A63828` | `--color-red-dark` | Hover states |
| Brown | `#2D2A26` | `--color-brown` | Text, headers |
| Brown Light | `#4A453E` | `--color-brown-light` | Secondary text |
| Gold | `#D4A84B` | `--color-gold` | Highlights, achievements |
| Gold Dark | `#B8923F` | `--color-gold-dark` | Hover states |

### Semantic Colors

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Success | `#5B8A4D` | `--color-success` | Success states |
| Warning | `#D4A84B` | `--color-warning` | Warning states |
| Error | `#C74634` | `--color-error` | Error states |
| Info | `#4A7B8C` | `--color-info` | Info states |

### Achievement Tiers

| Tier | Hex | CSS Variable |
|------|-----|--------------|
| Bronze | `#CD7F32` | `--color-bronze` |
| Silver | `#C0C0C0` | `--color-silver` |
| Gold | `#FFD700` | `--color-gold-tier` |
| Platinum | `#E5E4E2` | `--color-platinum` |

## Typography

### Font Families

```css
:root {
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Work Sans', 'Segoe UI', sans-serif;
  --font-mono: 'Fira Code', monospace;
}
```

### Type Scale

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| `display-xl` | 48px | 1.1 | 700 | Hero headings |
| `display-lg` | 36px | 1.2 | 700 | Page titles |
| `display-md` | 28px | 1.2 | 600 | Section headers |
| `heading-lg` | 24px | 1.3 | 600 | Card titles |
| `heading-md` | 20px | 1.4 | 600 | Subsections |
| `heading-sm` | 16px | 1.4 | 600 | Small headers |
| `body-lg` | 18px | 1.6 | 400 | Large body text |
| `body-md` | 16px | 1.6 | 400 | Default body |
| `body-sm` | 14px | 1.5 | 400 | Small text |
| `caption` | 12px | 1.4 | 400 | Captions, labels |

### Typography CSS

```css
.text-display-xl {
  font-family: var(--font-display);
  font-size: 48px;
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.text-body-md {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  font-weight: 400;
}
```

## Spacing Scale

Based on 4px grid:

| Token | Value | CSS Variable |
|-------|-------|--------------|
| `space-1` | 4px | `--space-1` |
| `space-2` | 8px | `--space-2` |
| `space-3` | 12px | `--space-3` |
| `space-4` | 16px | `--space-4` |
| `space-5` | 20px | `--space-5` |
| `space-6` | 24px | `--space-6` |
| `space-8` | 32px | `--space-8` |
| `space-10` | 40px | `--space-10` |
| `space-12` | 48px | `--space-12` |
| `space-16` | 64px | `--space-16` |

## Border & Shadows

### Border Styles

```css
:root {
  /* Border widths - thicker than modern UI */
  --border-thin: 1px;
  --border-medium: 2px;
  --border-thick: 3px;
  --border-heavy: 4px;

  /* Border radius - slightly rounded, not too modern */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Default border */
  --border-default: var(--border-medium) solid var(--color-brown);
}
```

### Shadow Styles

```css
:root {
  /* Vintage-style shadows - offset, no blur */
  --shadow-sm: 2px 2px 0 var(--color-brown);
  --shadow-md: 4px 4px 0 var(--color-brown);
  --shadow-lg: 6px 6px 0 var(--color-brown);
  
  /* Soft shadows for depth */
  --shadow-soft: 0 2px 8px rgba(45, 42, 38, 0.15);
  
  /* Inset for pressed states */
  --shadow-inset: inset 2px 2px 0 rgba(45, 42, 38, 0.2);
}
```

## Component Patterns

### Button

```css
.btn {
  font-family: var(--font-body);
  font-weight: 600;
  border: var(--border-thick) solid var(--color-brown);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
}

.btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-lg);
}

.btn:active {
  transform: translate(2px, 2px);
  box-shadow: none;
}

.btn--primary {
  background: var(--color-red);
  color: white;
}

.btn--secondary {
  background: var(--color-cream);
  color: var(--color-brown);
}
```

### Card

```css
.card {
  background: var(--color-cream);
  border: var(--border-thick) solid var(--color-brown);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.card--interactive {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card--interactive:hover {
  transform: translate(-4px, -4px);
  box-shadow: var(--shadow-lg);
}
```

### Input

```css
.input {
  font-family: var(--font-body);
  font-size: 16px;
  padding: var(--space-3) var(--space-4);
  background: white;
  border: var(--border-medium) solid var(--color-brown);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-inset);
}

.input:focus {
  outline: none;
  border-color: var(--color-red);
  box-shadow: var(--shadow-inset), 0 0 0 3px rgba(199, 70, 52, 0.2);
}
```

## Animation Patterns

### Rubber Hose Style

Animations should feel bouncy and playful:

```css
:root {
  /* Timing functions */
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Durations */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
}
```

### Achievement Unlock Animation

```css
@keyframes achievement-unlock {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
  70% {
    transform: scale(0.9) rotate(-5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.achievement-badge--unlocking {
  animation: achievement-unlock 0.6s var(--ease-bounce) forwards;
}
```

### Hover Bounce

```css
@keyframes hover-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.icon--animated:hover {
  animation: hover-bounce 0.4s var(--ease-bounce);
}
```

### Skeleton Loading

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

.skeleton {
  background: var(--color-cream-dark);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
```

## Textures & Effects

### Paper Texture

```css
.texture-paper {
  background-image: 
    url('/textures/paper-grain.png'),
    linear-gradient(var(--color-cream), var(--color-cream));
  background-blend-mode: multiply;
}
```

### Film Grain (Optional)

```css
.texture-film-grain::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/textures/film-grain.png');
  opacity: 0.05;
  pointer-events: none;
}
```

### Sepia Image Filter

```css
.image-vintage {
  filter: sepia(20%) contrast(1.1) brightness(0.95);
}
```

## Icons

Use a custom icon set or adapt existing ones:

- **Style:** Thick strokes (2-3px), rounded caps
- **Size:** 24x24 base, scale with `em`
- **Color:** Inherit from parent

```typescript
// components/ui/Icon.tsx
interface IconProps {
  name: IconName;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: '16px',
  md: '24px',
  lg: '32px',
};

export function Icon({ name, size = 'md', className }: IconProps) {
  return (
    <svg 
      className={clsx('icon', className)}
      width={sizes[size]}
      height={sizes[size]}
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      <use href={`/icons.svg#${name}`} />
    </svg>
  );
}
```

## Design Tokens CSS File

```css
/* styles/tokens.css */

:root {
  /* Colors */
  --color-cream: #F5F0E1;
  --color-cream-dark: #E8E4D9;
  --color-red: #C74634;
  --color-red-dark: #A63828;
  --color-brown: #2D2A26;
  --color-brown-light: #4A453E;
  --color-gold: #D4A84B;
  --color-gold-dark: #B8923F;
  
  /* Semantic */
  --color-success: #5B8A4D;
  --color-warning: #D4A84B;
  --color-error: #C74634;
  --color-info: #4A7B8C;
  
  /* Achievement tiers */
  --color-bronze: #CD7F32;
  --color-silver: #C0C0C0;
  --color-gold-tier: #FFD700;
  --color-platinum: #E5E4E2;
  
  /* Typography */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Work Sans', 'Segoe UI', sans-serif;
  --font-mono: 'Fira Code', monospace;
  
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  
  /* Borders */
  --border-thin: 1px;
  --border-medium: 2px;
  --border-thick: 3px;
  --border-heavy: 4px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 2px 2px 0 var(--color-brown);
  --shadow-md: 4px 4px 0 var(--color-brown);
  --shadow-lg: 6px 6px 0 var(--color-brown);
  --shadow-soft: 0 2px 8px rgba(45, 42, 38, 0.15);
  --shadow-inset: inset 2px 2px 0 rgba(45, 42, 38, 0.2);
  
  /* Animation */
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
}
```

## Design Checklist

When creating UI elements, ensure:

- [ ] Uses design tokens (no hardcoded colors/sizes)
- [ ] Has thick borders (2-3px minimum)
- [ ] Includes appropriate shadow
- [ ] Typography uses correct scale
- [ ] Spacing follows 4px grid
- [ ] Interactive elements have hover/active states
- [ ] Animations feel bouncy and playful
- [ ] Maintains vintage/retro aesthetic
- [ ] Works on cream background