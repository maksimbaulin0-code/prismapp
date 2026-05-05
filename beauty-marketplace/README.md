# BeautyFind - Telegram Mini App (TMA)

A modern, minimalist beauty/craft services marketplace designed for Telegram Mini Apps.

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React + Custom SVGs
- **Utilities**: clsx, tailwind-merge, class-variance-authority

## Design System

### Color Palette (Total Black Minimalism)
- **Background**: `#000000`
- **Card Backgrounds**: `#0A0A0A`
- **Borders**: `#1A1A1A`
- **Accents**: `#FFFFFF`
- **Skeleton Loaders**: Gradient from `#111111` to `#181818`

### Typography
- Font: Inter (Google Fonts)
- High contrast between headings and body text
- Strict sans-serif hierarchy

### UI Style
- Glassmorphism with low opacity
- Sharp corners (4-8px radius)
- Subtle glow effects for active states
- No heavy shadows

## Features

### Home Screen (Discovery)
- Horizontal scrollable category bar with icons
- Vertical feed of featured specialists
- Instant search filtering (debounced)
- Skeleton loaders during data fetch

### Specialist Profile
- Pinned header with "Book Now" button
- Interactive portfolio grid with tap-to-expand
- Service list with prices and duration
- Smooth layout transitions using `layoutId`

### User/Pro Toggle
- Seamless switch between client and pro views
- Pro dashboard for managing bookings

### Pro Onboarding (Multi-step Form)
- Step 1: Basic Information (Name, Bio)
- Step 2: Category Selection (multi-select)
- Step 3: Service-Price Builder (dynamic rows)
- Step 4: Portfolio Upload Zone (drag-and-drop simulation)
- Animated progress bar

### Animations (Framer Motion)
- **Micro-interactions**: Scale-in on card clicks, magnetic buttons
- **List Loading**: Staggered fade-in for specialist cards
- **Page Transitions**: Horizontal slide-and-fade between screens
- **Layout Transitions**: Fluid `layoutId` animations

### Performance
- Lightweight SVG icons
- Mobile-first responsive design
- Bottom sticky navigation bar
- Optimized skeleton loaders matching dark theme

## Project Structure

```
beauty-marketplace/
├── src/
│   ├── components/
│   │   ├── SpecialistCard.tsx      # Card with hover effects & skeleton
│   │   ├── CategoryScroll.tsx      # Horizontal category selector
│   │   ├── SearchBar.tsx           # Debounced search input
│   │   ├── BottomNav.tsx           # Sticky bottom navigation
│   │   ├── SpecialistProfile.tsx   # Detailed specialist view
│   │   └── ProOnboardingForm.tsx   # Multi-step pro registration
│   ├── pages/
│   │   └── Home.tsx                # Main discovery screen
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── lib/
│   │   └── utils.ts                # cn() utility function
│   ├── hooks/                      # Custom React hooks
│   ├── App.tsx                     # Root component
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles & Tailwind
├── tailwind.config.js              # Theme configuration
├── postcss.config.js               # PostCSS setup
├── tsconfig.json                   # TypeScript config
├── vite.config.ts                  # Vite bundler config
└── package.json                    # Dependencies
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd beauty-marketplace
npm install
npm run dev
```

### Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Component Highlights

### SpecialistCard
```tsx
<motion.div
  layoutId={`card-${name}`}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  // ... animations and styling
/>
```

### CategoryScroll
- Horizontal scroll with hidden scrollbar
- Active state with glow effect
- Staggered entrance animations

### ProOnboardingForm
- 4-step wizard with progress indicator
- Dynamic service price builder
- Animated step transitions

## Telegram Mini App Integration

To integrate with Telegram:

1. Include Telegram Web App SDK:
```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

2. Initialize in your app:
```typescript
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();
```

3. Use Telegram theme params for adaptive colors

## License

MIT
