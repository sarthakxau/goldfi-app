---
description: Frontend design standards for Liquid Gold Luxury premium dark theme
---

# Liquid Gold Luxury - Design System

A refined, premium aesthetic that evokes the weight and warmth of physical gold while feeling thoroughly modern and digital. The intersection of Swiss banking elegance, Indian gold jewelry tradition, and contemporary fintech minimalism.

## Typography

| Usage | Font | Class |
|-------|------|-------|
| **Brand/Headings** | DM Serif Display | `font-serif` |
| **Body Text** | DM Sans | `font-sans` (default) |

```tsx
// Headings automatically use serif via globals.css
<h1 className="text-2xl font-serif text-cream">My Gold</h1>
<p className="text-cream-muted/60">Body text</p>
```

## Color Palette

### Surface Colors (Warm Blacks)
| Purpose | Class | Value |
|---------|-------|-------|
| Background | `bg-surface` | `#1A1612` |
| Cards | `bg-surface-card` | `#221E19` |
| Elevated | `bg-surface-elevated` | `#2A2520` |

### Gold Palette
| Shade | Class | Value |
|-------|-------|-------|
| Light | `text-gold-300` | `#FFD054` |
| Primary | `text-gold-400` / `bg-gold-500` | `#D4A012` |
| Dark | `text-gold-600` | `#B8860B` |

### Cream Accents
| Usage | Class |
|-------|-------|
| Primary Text | `text-cream` |
| Muted Text | `text-cream-muted/60` |
| Very Muted | `text-cream-muted/40` |

## Component Patterns

### Cards
```tsx
<div className="card p-4">Standard card</div>
<div className="card-elevated p-6">Elevated (modals, forms)</div>
<div className="card-gold p-6">Gold accent border</div>
```

### Gold Shimmer Button (Primary CTA)
```tsx
<button className="gold-shimmer text-surface font-bold py-4 px-6 rounded-full">
  Get Started
</button>
```

### Success Button
```tsx
<button className="bg-success text-surface font-bold py-4 rounded-2xl hover:bg-success-dark">
  Buy Gold
</button>
```

### Gold Coin Icon
```tsx
<div className="gold-coin">
  <span className="text-lg font-bold">₹</span>
</div>
```

### Status Badges
```tsx
<span className="badge badge-success">• Success</span>
<span className="badge badge-gold">• Premium</span>
```

## Luxury Effects

### Gold Radial Background
```tsx
<div className="gold-radial-bg">
  {/* Subtle gold glow at top of page */}
</div>
```

### Gold Glow Shadow
```tsx
<div className="shadow-gold-glow hover:shadow-gold-glow-strong">
  Glowing element
</div>
```

### Chart Glow Animation
```tsx
<div className="chart-glow">
  <AreaChart ... />
</div>
```

### Animated Gold Shine
```tsx
<button className="gold-shimmer">
  {/* Animated shine sweeps across */}
</button>
```

## Text Hierarchy

```tsx
// Primary heading
<h1 className="font-serif text-cream">Title</h1>

// Secondary heading
<h2 className="font-serif text-cream-muted/60">Subtitle</h2>

// Body text
<p className="text-cream-muted/60">Description</p>

// Muted/labels
<span className="text-cream-muted/40 text-xs">Label</span>

// Gold accent
<span className="text-gold-400">₹1,49,020</span>

// Gold gradient text
<span className="text-gold-gradient">tola</span>
```

## File Locations

- **Design tokens**: `tailwind.config.ts`
- **Global styles**: `src/app/globals.css`
- **Components**: `src/components/`
