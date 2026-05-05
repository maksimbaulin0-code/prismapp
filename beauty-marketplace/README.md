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

### Setup Complete ✅

The app is fully integrated with Telegram Web App SDK:

1. **SDK Included**: The Telegram Web App script is loaded in `index.html`
2. **Initialization**: `main.tsx` initializes the TMA with proper setup (expand, theme colors)
3. **Custom Hook**: `useTelegram()` hook provides easy access to all TMA features

### Features Implemented

#### 1. User Data Access
```typescript
const { user } = useTelegram();
// Access: user.firstName, user.username, user.id, etc.
```

#### 2. Main Button (for booking)
```typescript
const { showMainButton, hideMainButton } = useTelegram();

showMainButton('Book Now', () => {
  // Handle booking
});
```

#### 3. Back Button
```typescript
const { showBackButton, hideBackButton } = useTelegram();

showBackButton(() => {
  // Navigate back
});
```

#### 4. Native Alerts/Confirms
```typescript
const { showAlert, showConfirm } = useTelegram();

showAlert('Message');
const confirmed = await showConfirm('Are you sure?');
```

#### 5. Theme Integration
```typescript
const { colorScheme, themeParams } = useTelegram();
// Automatically adapts to user's Telegram theme
```

### Deployment to Telegram

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Host the build** on any HTTPS server (Vercel, Netlify, GitHub Pages, or your own server)

3. **Create a bot** via [@BotFather](https://t.me/BotFather):
   - `/newbot` - create a new bot
   - `/newapp` - create a new Mini App
   - Provide the HTTPS URL to your hosted build

4. **Get your Mini App link**:
   - Direct link: `https://t.me/your_bot/app_name`
   - Or add to menu via BotFather

### Development Testing

#### Option 1: Simple Dev Server
```bash
npm run dev
```
Then open http://localhost:5173 in your browser.

#### Option 2: With Ngrok (for Telegram testing)
```bash
# Install ngrok if you haven't
npx ngrok config add-authtoken YOUR_TOKEN

# Start both Vite and ngrok together
npm run start:local
```

This will:
1. Start the Vite dev server on port 5173
2. Create an ngrok tunnel to expose it publicly
3. Display the ngrok URL for use in BotFather

#### Option 3: Manual Ngrok
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start ngrok
npx ngrok http 5173
```

### Local Setup with SQLite Backend

For a complete local setup with backend:

```bash
# Start the backend server
npm run server

# Start the frontend
npm run dev

# Create ngrok tunnel (in another terminal)
npx ngrok http 5173
```

Copy the ngrok URL and use it in your Telegram Bot configuration.

### Key Files for TMA

| File | Purpose |
|------|---------|
| `index.html` | Loads Telegram Web App SDK |
| `src/main.tsx` | Initializes TMA on app start |
| `src/hooks/useTelegram.ts` | Custom hook for all TMA features |
| `src/pages/Home.tsx` | Uses TMA buttons and user data |

### Best Practices

1. **Always check if running inside Telegram**: `if (tg) { ... }`
2. **Use native buttons** for primary actions (booking, confirmation)
3. **Respect user's theme** - the app uses dark mode by default but can adapt
4. **Expand viewport** - done automatically on init for full-screen experience
5. **Handle back navigation** - use Telegram's BackButton for consistent UX

## License

MIT
