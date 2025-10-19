# Movie Persona-AI - Complete UI Storyboard (Redesigned)
## AI Persona-Driven Movie Review Video Generation Platform

---

## 📋 Document Overview

**Application Name:** Movie Persona-AI  
**Purpose:** Create unique movie review videos using AI personas with distinct personalities  
**Design Philosophy:** Character-first, intuitive, accessible to all  
**Target Audience:** UI/UX Designers creating from scratch

### Key Features
- ✨ **6 Unique AI Personas** - Each with distinct review style and personality
- 🎬 **Popular Movie Database** - Thousands of films to analyze
- 🤖 **AI-Powered Generation** - Custom trained personas for authentic reviews
- 🔐 **Social Login Only** - Google/Facebook OAuth (no complex registration)
- 🎨 **No Tiers** - Equal access for all users, no VIP restrictions
- 🎥 **Video Generation** - Narrated review videos with subtitles

---

## 🎨 Design System - Cyberpunk/Tech Aesthetic

### Core Color Palette

#### Dark Theme (Primary) - Cyberpunk Tech
- **Background Base:** Rich Black (#0A0E1A) with subtle noise texture
- **Background Gradient:** From #0A0E1A via #1a1f3a to #0f1628
- **Surface Primary:** Deep Navy (#141B2D) with 95% opacity
- **Surface Elevated:** Dark Blue (#1E293B) with neon accents
- **Surface Glass:** Rgba(30, 41, 59, 0.7) with backdrop-blur-xl
- **Text Primary:** Pure White (#FFFFFF) with text-shadow glow
- **Text Secondary:** Cyan-200 (#A5F3FC) - tech accent
- **Text Muted:** Slate-400 (#94A3B8)
- **Borders:** Neon Cyan/30 with glow (#22D3EE/30)
- **Grid Lines:** Cyan-500/10 forming tech grid pattern
- **Accent Glow:** Cyan-500 (#06B6D4) with box-shadow blur

#### Light Theme (Optional) - Clean Tech
- **Background Base:** Cool White (#F8FAFC) with subtle grid
- **Background Gradient:** From #F8FAFC via #E2E8F0 to #F1F5F9
- **Surface Primary:** White (#FFFFFF) with crisp shadows
- **Surface Elevated:** Slate-50 (#F8FAFC) with subtle borders
- **Surface Glass:** Rgba(248, 250, 252, 0.85) with backdrop-blur
- **Text Primary:** Deep Navy (#0F172A)
- **Text Secondary:** Slate-700 (#334155)
- **Text Muted:** Slate-500 (#64748B)
- **Borders:** Cyan-400/20 (#22D3EE/20)
- **Accent Highlights:** Cyan-600 (#0891B2) crisp lines

### Persona Color Systems - Neon/Cyberpunk Palette

Each persona has a vibrant neon color identity with cyberpunk aesthetics:

**1. The Philosopher** 🧑‍🏫
- **Primary Gradient:** Electric Purple (#A855F7) → Hot Pink (#EC4899)
- **Neon Glow:** #A855F7 with 0 0 20px blur, 0 0 40px spread
- **Accent:** Deep Purple (#7C3AED)
- **Secondary:** Fuchsia-400 (#E879F9)
- **Character:** Wise, contemplative, deep consciousness
- **Tech Element:** Holographic effect, particle trails
- **Use Case:** Philosophical themes, existential analysis

**2. The Film Critic** 🎬
- **Primary Gradient:** Electric Blue (#3B82F6) → Cyber Cyan (#06B6D4)
- **Neon Glow:** #06B6D4 with 0 0 20px blur, neon shimmer
- **Accent:** Sky-600 (#0284C7)
- **Secondary:** Blue-300 (#93C5FD)
- **Character:** Professional, analytical, precise
- **Tech Element:** Scan lines, digital matrix effect
- **Use Case:** Technical analysis, cinematography

**3. The Sports Fan** ⚽
- **Primary Gradient:** Neon Orange (#FB923C) → Hot Red (#EF4444)
- **Neon Glow:** #FB923C with 0 0 25px blur, fire effect
- **Accent:** Orange-600 (#EA580C)
- **Secondary:** Red-400 (#F87171)
- **Character:** Energetic, passionate, high-intensity
- **Tech Element:** Energy pulses, motion blur trails
- **Use Case:** Action sequences, drama, intensity

**4. The Engineer** 🤖
- **Primary Gradient:** Matrix Green (#10B981) → Electric Teal (#14B8A6)
- **Neon Glow:** #10B981 with 0 0 20px blur, code shimmer
- **Accent:** Emerald-600 (#059669)
- **Secondary:** Teal-300 (#5EEAD4)
- **Character:** Logical, technical, systematic
- **Tech Element:** Circuit board patterns, binary code overlay
- **Use Case:** Plot logic, technical accuracy, sci-fi

**5. The Comedian** 😂
- **Primary Gradient:** Neon Yellow (#FACC15) → Electric Amber (#F59E0B)
- **Neon Glow:** #FACC15 with 0 0 25px blur, sparkle effect
- **Accent:** Yellow-600 (#CA8A04)
- **Secondary:** Amber-300 (#FCD34D)
- **Character:** Humorous, witty, vibrant energy
- **Tech Element:** Glitch effects, comic burst animations
- **Use Case:** Comedy analysis, satire, humor discovery

**6. The Historian** 📚
- **Primary Gradient:** Warm Copper (#D97706) → Vintage Gold (#F59E0B)
- **Neon Glow:** #D97706 with 0 0 15px blur, vintage tech glow
- **Accent:** Amber-700 (#B45309)
- **Secondary:** Orange-400 (#FB923C)
- **Character:** Contextual, educational, timeless
- **Tech Element:** Sepia tone overlays, retro-futuristic elements
- **Use Case:** Historical context, period pieces

### Typography - Tech/Cyber Font System

**Font Family:**
- **Primary:** 'Space Grotesk' - Modern geometric tech font
- **Secondary:** 'Inter' - Clean readability
- **Monospace:** 'JetBrains Mono' - Code elements
- **Display:** 'Orbitron' - Futuristic headers (optional accent)

**Font Hierarchy:**
```
Hero Title:     7xl (72px) - Bold - Animated gradient + glow + scan lines
Page Title:     4xl (36px) - Bold - Neon glow effect
Persona Name:   2xl (24px) - Bold - UPPERCASE - Neon persona color + glow
Section Title:  xl (20px) - Semibold - Cyan accent glow
Body Text:      base (16px) - Regular - High contrast
Small Text:     sm (14px) - Regular - Slightly glowing  
Micro Text:     xs (12px) - Mono - Tech metadata
Code/Labels:    xs (12px) - Mono - Cyan-400 color
```

**Text Effects:**
- **Neon Glow:** text-shadow: 0 0 10px currentColor, 0 0 20px currentColor
- **Cyber Scan:** Animated scan line overlay (keyframe animation)
- **Glitch Effect:** Random horizontal offset on hover (persona names)
- **Typewriter:** Animated text reveal for hero sections

### Spacing Scale - Tech Grid System
```
xs: 4px      md: 16px     2xl: 48px    (8px grid)
sm: 8px      lg: 24px     3xl: 64px    (multiples of 8)
base: 12px   xl: 32px     4xl: 80px    (aligned to grid)
```

### Border Radius - Cyber Aesthetic
```
sharp: 0px       (hard tech edges, occasional use)
sm: 4px          (subtle, tech UI elements)
md: 8px          (buttons, inputs - less rounded)
lg: 12px         (cards - angular feel)
xl: 16px         (hero sections, modals)
tech-cut: clip-path with angular cuts (signature style)
full: 9999px     (avatars only)
```

### Shadows & Neon Effects - Cyberpunk Glow
```
Small Glow:    0 0 10px rgba(6,182,212,0.3), 0 2px 4px rgba(0,0,0,0.2)
Medium Glow:   0 0 20px rgba(6,182,212,0.4), 0 4px 8px rgba(0,0,0,0.3)
Large Glow:    0 0 30px rgba(6,182,212,0.5), 0 8px 16px rgba(0,0,0,0.4)
Neon Border:   inset 0 0 0 1px [persona-color], 0 0 20px [persona-color]/50
Persona Glow:  0 0 25px [persona-color]/60, 0 0 50px [persona-color]/30
Inner Glow:    inset 0 0 20px rgba(6,182,212,0.2)
Tech Shadow:   0 4px 20px rgba(0,0,0,0.5), 0 0 1px rgba(6,182,212,0.5)
```

### Special Tech Effects
```
Grid Overlay:      Repeating linear gradient - 1px cyan lines every 20px
Scan Lines:        Horizontal lines, 2px height, animated top to bottom
Hologram Flicker:  Opacity pulse 0.95-1, 3s infinite
Glitch:            Random transform: translateX(±2px), 50ms duration
Noise Texture:     SVG noise filter, opacity 0.03
Particle Field:    Floating dots, persona color, slow motion
```

---

## 📱 Complete Page Specifications

---

### 1. Home / Landing Page

**URL:** `/`  
**Layout:** Full-screen vertical scrolling with cinematic video  
**Auth Required:** No

```
┌─────────────────────────────────────────────────────────────────┐
│ [🎬 Movie Persona-AI]                   [Blog] [Sign In]       │ ← Fixed Header
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│             [Cinematic Movie Montage - Looping Video]            │
│                  [Gradient Overlay: violet → pink]               │
│                                                                   │
│                   ════════════════════════                       │
│                   Movie Reviews, Reimagined                      │
│                   ════════════════════════                       │
│                                                                   │
│         AI Personas analyze your favorite films                  │
│         Choose your critic. Get unique perspectives.             │
│                                                                   │
│            ┌──────────────────────────────────┐                 │
│            │  Start Creating →                 │                 │
│            └──────────────────────────────────┘                 │
│                                                                   │
│                     [Scroll down ⌄]                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│          Meet Your AI Film Critics                               │
│          ─────────────────────                                  │
│                                                                   │
│    ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│    │            │  │            │  │            │              │
│    │   [🧑‍🏫]    │  │    [🎬]    │  │    [⚽]    │              │
│    │  120x120   │  │  120x120   │  │  120x120   │              │
│    │            │  │            │  │            │              │
│    │Philosopher │  │Film Critic │  │Sports Fan  │              │
│    │            │  │            │  │            │              │
│    │Deep        │  │Professional│  │Passionate  │              │
│    │thinker     │  │analyst     │  │enthusiast  │              │
│    └────────────┘  └────────────┘  └────────────┘              │
│                                                                   │
│    ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│    │   [🤖]     │  │    [😂]    │  │    [📚]    │              │
│    │Engineer    │  │ Comedian   │  │ Historian  │              │
│    └────────────┘  └────────────┘  └────────────┘              │
│                                                                   │
│                     [Scroll down ⌄]                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              How It Works                                        │
│              ────────────                                       │
│                                                                   │
│  ╔═══════════════╗    ╔═══════════════╗    ╔═══════════════╗  │
│  ║    1️⃣          ║    ║    2️⃣          ║    ║    3️⃣          ║  │
│  ║  Pick Your    ║ →  ║  Choose AI    ║ →  ║  Generate     ║  │
│  ║  Movie        ║    ║  Persona      ║    ║  Review       ║  │
│  ║               ║    ║               ║    ║               ║  │
│  ║ Search from   ║    ║ Philosopher,  ║    ║ AI creates    ║  │
│  ║ thousands     ║    ║ Critic, Fan   ║    ║ unique video  ║  │
│  ║ of films      ║    ║ & more        ║    ║ analysis      ║  │
│  ╚═══════════════╝    ╚═══════════════╝    ╚═══════════════╝  │
│                                                                   │
│            ┌──────────────────────────────────┐                 │
│            │  Get Started - It's Free! →      │                 │
│            └──────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

**Design Specifications - Cyberpunk:**
- **Video Background:** Cinematic clips with cyan/blue color grading overlay, scan line effect
- **Background Tech Grid:** Subtle cyan grid lines (1px, opacity 10%), 20px spacing
- **Header:** Ultra-glassmorphism (backdrop-blur-xl), neon cyan bottom border (1px), floating appearance
- **Hero Title:** 7xl, bold, animated gradient (cyan-400 → purple-500 → pink-500), neon glow, typewriter animation on load
- **Subtitle:** xl, cyan-200, max-w-3xl, subtle glow, tech font (Space Grotesk)
- **CTA Button:** 2xl text, neon gradient border, black/80 bg, cyan glow on hover, angular clip-path corners
- **Persona Circles:** 120px diameter, neon borders (2px, persona color), rotating gradient animation, intense glow on hover to 135px
- **Step Cards:** 300x320px, glass morphism bg, neon gradient top border, scan line animation, tech corner cuts, hover: lift 8px + intense glow
- **Particle Field:** Floating cyan dots in background, slow parallax motion
- **Noise Texture:** Subtle film grain overlay (opacity 3%)

---

### 2. Authentication Page

**URL:** `/auth?redirect=[next-page]`  
**Layout:** Centered card, simplified  
**Auth Required:** No

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                   [Gradient Background - Animated]                │
│                                                                   │
│                  ┌─────────────────────────────┐                 │
│                  │                             │                 │
│                  │    🎬 Movie Persona-AI      │                 │
│                  │                             │                 │
│                  │    Welcome Back!            │                 │
│                  │    Sign in to create        │                 │
│                  │    amazing movie reviews    │                 │
│                  │                             │                 │
│                  │  ┌───────────────────────┐ │                 │
│                  │  │                       │ │                 │
│                  │  │ [G] Sign in with     │ │                 │
│                  │  │     Google            │ │                 │
│                  │  │                       │ │                 │
│                  │  └───────────────────────┘ │                 │
│                  │                             │                 │
│                  │  ┌───────────────────────┐ │                 │
│                  │  │ [f] Sign in with     │ │                 │
│                  │  │     Facebook          │ │                 │
│                  │  └───────────────────────┘ │                 │
│                  │                             │                 │
│                  │  ───────── OR ─────────    │                 │
│                  │                             │                 │
│                  │  ┌───────────────────────┐ │                 │
│                  │  │ Continue as Guest →   │ │                 │
│                  │  └───────────────────────┘ │                 │
│                  │                             │                 │
│                  │  By signing in, you agree  │                 │
│                  │  to our Terms & Privacy    │                 │
│                  │                             │                 │
│                  └─────────────────────────────┘                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Design Specifications - Cyberpunk Auth:**
- **Card:** 480px width, glass morphism (#141B2D/95), angular clip-path corners, neon cyan border (1px), intense glow
- **Background:** Animated grid pattern, floating particles, dark gradient (#0A0E1A → #1a1f3a)
- **Logo:** 3xl, animated neon gradient text (cyan → purple), pulsing glow effect, centered
- **Title:** 2xl, bold, cyan-200, subtle scan line animation, mb-2
- **Subtitle:** Base, cyan-300/80, tech font, mb-8
- **Google Button:** Black/90 bg, white text, Google logo (24px), neon white border, cyan glow on hover, angular corners
- **Facebook Button:** Black/90 bg, cyan-400 text, Facebook logo, neon cyan border, glow on hover
- **Guest Button:** Transparent bg, neon cyan border (1px), cyan text, glow on hover, angular clip-path
- **All Buttons:** Full width, py-3.5, rounded-lg, flex items-center justify-center, gap-3, tech font, transition with glow
- **Divider:** Neon cyan line (1px, opacity 30%), with "OR" in tech monospace font, cyan-400
- **Terms Text:** xs, text-center, slate-400, mono font, links: cyan-400 with underline glow on hover
- **Scan Line Effect:** Animated horizontal line moving from top to bottom, cyan-400/20, 3s duration

**OAuth Flow:**
1. Click "Sign in with Google" → Redirect to Google OAuth
2. User authorizes → Return to app with token
3. Create account if first time, otherwise login
4. Redirect to `redirect` param or `/movie-selection`

---

### 3. Movie Selection Page

**URL:** `/movie-selection`  
**Layout:** Search + Grid  
**Auth Required:** No (optional)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Header with Logo, Theme Toggle, Profile]                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│                     Which Movie?                                 │
│                                                                   │
│            ┌───────────────────────────────────────┐            │
│            │ 🔍 Search movies...              [×] │            │
│            └───────────────────────────────────────┘            │
│                                                                   │
│     [Search Suggestions Dropdown - When focused]                 │
│                                                                   │
│  ╔══════════════════════════════════════════════════════╗       │
│  ║ 🕐 Recent Searches                                    ║       │
│  ║ ┌─────────┐ ┌──────────┐ ┌────────┐                ║       │
│  ║ │Inception│ │The Matrix│ │Memento │                ║       │
│  ║ └─────────┘ └──────────┘ └────────┘                ║       │
│  ║                                                       ║       │
│  ║ 📈 Trending Now                                      ║       │
│  ║ ┌──────────────┐ ┌──────────────┐                  ║       │
│  ║ │⦿ Oppenheimer │ │⦿ Barbie      │                  ║       │
│  ║ └──────────────┘ └──────────────┘                  ║       │
│  ╚══════════════════════════════════════════════════════╝       │
│                                                                   │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │[Poster]    │ │[Poster]    │ │[Poster]    │ │[Poster]    │  │
│  │  200x300   │ │  200x300   │ │  200x300   │ │  200x300   │  │
│  │    [8.9]   │ │    [7.5]   │ │    [9.2]   │ │    [8.1]   │  │
│  │            │ │            │ │            │ │            │  │
│  │The Dark    │ │Inception   │ │The Godfather│ │Pulp Fiction│  │
│  │Knight      │ │            │ │            │ │            │  │
│  │2008        │ │2010        │ │1972        │ │1994        │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│                                                                   │
│  [More movie cards in responsive grid...]                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Design Specifications - Cyber Movie Selection:**
- **Page Title:** 4xl, bold, centered, neon cyan glow, mb-8, uppercase tech font
- **Search Bar:** max-w-2xl, centered, glass morphism bg, neon cyan border (1px), pl-12 pr-12, py-4, rounded-lg, intense glow on focus, tech corner cuts
- **Search Icon:** 24px, left-3, cyan-400, pulsing animation
- **Clear Button:** Appears when typing, absolute right-3, cyan-400, hover: scale-110 + glow
- **Dropdown:** Absolute, glass morphism (#141B2D/98), neon cyan border, full width, mt-2, rounded-lg, shadow with cyan glow, z-50, scan line animation
- **Recent Searches:** Pills, angular shape (clip-path), neon cyan border, cyan-300 text, hover: scale-105 + intense glow
- **Movie Grid:** 2 cols (mobile), 3 (tablet), 4 (desktop), gap-6, tech grid overlay
- **Movie Card:** Rounded-lg, glass morphism, neon cyan border (1px, opacity 30%), overflow-hidden, hover: scale-105 + border glow + lift shadow
- **Poster:** Aspect 2/3, object-cover, cyan tint overlay on hover, scan line effect
- **Rating Badge:** Absolute top-3 right-3, black/90 bg, neon yellow text + glow, angular corners, px-2 py-1
- **Movie Title:** Semibold, text-base, cyan-100, line-clamp-1, px-4 pt-3, tech font
- **Year:** xs, cyan-400, mono font, px-4 pb-3

---

### 4. Movie Detail Page

**URL:** `/movie/[id]`  
**Layout:** Hero with backdrop  
**Auth Required:** No

```
┌─────────────────────────────────────────────────────────────────┐
│ [← Back to Movies]                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│           [Full-width Backdrop Image with Gradient]              │
│                                                                   │
│    ┌─────────┐                                                   │
│    │         │  The Dark Knight (2008)                          │
│    │ Poster  │  ★★★★★ 9.0  |  Action, Crime, Drama             │
│    │ 200x300 │                                                   │
│    │         │  Director: Christopher Nolan                      │
│    └─────────┘  Cast: Christian Bale, Heath Ledger              │
│                                                                   │
│    When the menace known as the Joker wreaks havoc and          │
│    chaos on the people of Gotham, Batman must accept one        │
│    of the greatest psychological and physical tests...           │
│                                                                   │
│    ┌─────────────────────────────────────┐                      │
│    │  Choose Your AI Persona →            │                      │
│    └─────────────────────────────────────┘                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Design Specifications - Cyber Movie Detail:**
- **Backdrop:** Full width, height 500px, object-cover, cyan color grade overlay, gradient (black/90 → transparent), scan lines, noise texture
- **Tech Grid:** Overlay grid pattern (cyan-500/5), creates depth
- **Back Button:** Absolute top-4 left-4, glass morphism, neon cyan border, cyan text, hover glow
- **Poster:** 200x300px, rounded-lg, neon cyan border (2px), intense glow shadow, absolute bottom--100px left-8, hologram flicker effect
- **Title:** 4xl, bold, cyan-100 with neon glow, mb-2, text-shadow cyan
- **Meta Info:** Base, cyan-200, flex, gap-4, mb-4, mono font for metadata
- **Stars:** Neon yellow-400 with glow, 24px each, pulsing animation
- **Genres:** Badges, angular (clip-path), glass morphism bg, neon cyan border, cyan-200 text, px-3 py-1, individual glow
- **Description:** lg, cyan-100/90, line-height-relaxed, max-w-3xl, mb-8, subtle glow
- **CTA Button:** xl, neon gradient border (cyan → purple), black/80 bg, white text, px-12 py-4, rounded-lg, angular corners, intense glow on hover, scan line animation

---

### 5. Persona Picker Page ⭐ (NEW)

**URL:** `/movie/[id]/persona-picker`  
**Layout:** Character showcase grid  
**Auth Required:** Yes

```
┌─────────────────────────────────────────────────────────────────┐
│ [← Back]                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [Small Poster]  The Dark Knight (2008)                         │
│    80x120       Who should review this film?                     │
│                                                                   │
│           Pick Your AI Persona                                   │
│           ────────────────                                      │
│                                                                   │
│  ┌────────────────────┐  ┌────────────────────┐                │
│  │  [Gradient Border] │  │  [Gradient Border] │                │
│  │                    │  │                    │                │
│  │     [🧑‍🏫]          │  │      [🎬]          │                │
│  │    150x150         │  │     150x150        │                │
│  │    ╔═══════╗       │  │    ╔═══════╗      │                │
│  │    ║ Pulse ║       │  │    ║ Pulse ║      │                │
│  │    ╚═══════╝       │  │    ╚═══════╝      │                │
│  │                    │  │                    │                │
│  │  THE PHILOSOPHER   │  │  THE FILM CRITIC   │                │
│  │                    │  │                    │                │
│  │ "Explores          │  │ "Professional      │                │
│  │  existential       │  │  analysis of       │                │
│  │  themes and        │  │  cinematography    │                │
│  │  morality"         │  │  & storytelling"   │                │
│  │                    │  │                    │                │
│  │ ━━━━━━━━━━━━━━    │  │ ━━━━━━━━━━━━━━    │                │
│  │                    │  │                    │                │
│  │  [Choose ✨]       │  │  [Choose ✨]       │                │
│  │                    │  │                    │                │
│  └────────────────────┘  └────────────────────┘                │
│                                                                   │
│  ┌────────────────────┐  ┌────────────────────┐                │
│  │    [⚽] Sports      │  │    [🤖] Engineer   │                │
│  │  "Passionate..."   │  │  "Analyzes..."     │                │
│  │  [Choose ✨]       │  │  [Choose ✨]       │                │
│  └────────────────────┘  └────────────────────┘                │
│                                                                   │
│  ┌────────────────────┐  ┌────────────────────┐                │
│  │    [😂] Comedian   │  │    [📚] Historian  │                │
│  │  "Finds humor..."  │  │  "Contextualizes..." │              │
│  │  [Choose ✨]       │  │  [Choose ✨]       │                │
│  └────────────────────┘  └────────────────────┘                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Design Specifications:**

**Movie Header:**
- Small poster thumbnail (80x120px), rounded-lg, shadow-md
- Movie title + year, xl semibold, next to poster
- Subtitle question, base, muted text

**Persona Grid:**
- Grid: 2 cols (mobile), 3 cols (tablet/desktop), gap-8
- Card size: 320px width, auto height, rounded-2xl

**Persona Card:**
- Border: 2px animated gradient (persona colors), rotating animation
- Background: White (light) / slate-800 (dark)
- Padding: p-6
- Hover effect: translateY(-8px), shadow-2xl, glow with persona color

**Avatar:**
- Size: 150x150px circle
- Background: Gradient matching persona
- Image/Emoji: 80px centered
- Animation: Pulse scale (1 → 1.05 → 1, 3s infinite ease-in-out)
- Glow ring: persona color, opacity-30, 4px

**Persona Name:**
- Text: xl, bold, uppercase, letter-spacing-wider
- Color: Persona gradient as text fill
- Alignment: Center
- Margin: mt-6 mb-3

**Description:**
- Text: sm, 3 lines
- Color: Gray-600 (light) / gray-300 (dark)
- Alignment: Center
- Max-width: 280px
- Margin: mb-4

**Divider:**
- Height: 2px
- Background: Linear gradient (persona colors)
- Opacity: 50%
- Width: Full
- Margin: my-4

**Button:**
- Width: Full
- Padding: py-3
- Text: Base, semibold, white
- Background: Persona gradient
- Border radius: xl
- Icon: Sparkle emoji/icon, ml-2
- Hover: Brightness-110, scale-105, shadow-lg with persona color

**Persona Details:**

1. **The Philosopher** (Purple → Pink)
   - Quote: "Explores existential themes and morality"
   - Style: Deep, thoughtful, references philosophy
   - Best for: Drama, psychological thrillers

2. **The Film Critic** (Blue → Cyan)
   - Quote: "Professional analysis of cinematography & storytelling"
   - Style: Technical, precise, references film theory
   - Best for: Art films, classics, technical masterpieces

3. **The Sports Fan** (Orange → Red)
   - Quote: "Passionate enthusiasm for action & drama"
   - Style: Energetic, excited, focuses on intensity
   - Best for: Action, sports films, intense drama

4. **The Engineer** (Green → Teal)
   - Quote: "Analyzes plot logic & technical accuracy"
   - Style: Logical, detail-oriented, fact-checks
   - Best for: Sci-fi, thrillers, technical films

5. **The Comedian** (Yellow → Amber)
   - Quote: "Finds humor & satire in every scene"
   - Style: Witty, playful, highlights absurdity
   - Best for: Comedies, satire, dark humor

6. **The Historian** (Brown → Orange)
   - Quote: "Contextualizes within historical periods"
   - Style: Educational, contextual, references history
   - Best for: Period pieces, biopics, historical dramas

---

### 6. Train Your Persona Page ⭐ (NEW)

**URL:** `/movie/[id]/persona/[personaId]/train`  
**Layout:** Interactive form with persona avatar  
**Auth Required:** Yes

```
┌─────────────────────────────────────────────────────────────────┐
│ [← Back]                                     [👤 Philosopher]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│           ┌────────────────────────────┐                        │
│           │     [Persona Avatar]       │                        │
│           │      Animated, Large       │                        │
│           │         150x150            │                        │
│           └────────────────────────────┘                        │
│                                                                   │
│            Train Your Philosopher                                │
│            ────────────────                                     │
│        Customize how they'll review your film                    │
│                                                                   │
│  ╔═══════════════════════════════════════════════════════╗     │
│  ║                                                        ║     │
│  ║  🎯 Focus Areas                                        ║     │
│  ║  ─────────────                                        ║     │
│  ║                                                        ║     │
│  ║  What should they focus on?                           ║     │
│  ║                                                        ║     │
│  ║  [Themes] [Characters] [Symbolism] [Ethics]          ║     │
│  ║  [Cinematography] [Narrative] [Philosophy]            ║     │
│  ║                                                        ║     │
│  ║  ────────────────────────────────                    ║     │
│  ║                                                        ║     │
│  ║  🎨 Review Style                                       ║     │
│  ║  ─────────────                                        ║     │
│  ║                                                        ║     │
│  ║  ○ Deep & Contemplative      [Recommended]           ║     │
│  ║  ○ Balanced Analysis                                  ║     │
│  ║  ○ Light & Accessible                                 ║     │
│  ║                                                        ║     │
│  ║  ────────────────────────────────                    ║     │
│  ║                                                        ║     │
│  ║  📏 Length Preference                                  ║     │
│  ║  ─────────────────                                   ║     │
│  ║                                                        ║     │
│  ║  [━━━━━━●━━━━━━━━]  ~7 minutes                     ║     │
│  ║   3 min         15 min                                ║     │
│  ║                                                        ║     │
│  ║  ────────────────────────────────                    ║     │
│  ║                                                        ║     │
│  ║  💬 Tone & Delivery                                    ║     │
│  ║  ──────────────────                                  ║     │
│  ║                                                        ║     │
│  ║  Academic Level:  [━━━━●━━━]                        ║     │
│  ║                   Moderate                            ║     │
│  ║                                                        ║     │
│  ║  Pacing:          [━━━━━━●━]                        ║     │
│  ║                   Relaxed                             ║     │
│  ║                                                        ║     │
│  ║  ────────────────────────────────                    ║     │
│  ║                                                        ║     │
│  ║  ✨ Special Instructions (Optional)                   ║     │
│  ║  ──────────────────────────────                     ║     │
│  ║                                                        ║     │
│  ║  ┌────────────────────────────────────────────┐     ║     │
│  ║  │ e.g., "Compare to Dostoyevsky's themes"   │     ║     │
│  ║  │                                             │     ║     │
│  ║  │                                             │     ║     │
│  ║  └────────────────────────────────────────────┘     ║     │
│  ║                                                        ║     │
│  ╚═══════════════════════════════════════════════════════╝     │
│                                                                   │
│            ┌───────────────────────────────┐                    │
│            │  Generate Review ✨ →          │                    │
│            └───────────────────────────────┘                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Design Specifications:**

**Header:**
- Selected persona avatar in top-right corner (60px), always visible
- Shows which persona is being trained
- Back button returns to persona picker

**Persona Avatar (Large):**
- Size: 150x150px
- Centered at top
- Animated: Gentle bobbing (translateY ±4px, 2s infinite)
- Gradient background matching persona
- Glow effect with persona color

**Title:**
- 3xl, bold, centered
- Gradient text fill (persona colors)
- mb-2

**Subtitle:**
- Base, muted, centered
- mb-12

**Form Sections:**

**1. Focus Areas**
- Multi-select pill buttons
- Rounded-full, px-4 py-2
- Default: gray-100 (light) / gray-800 (dark)
- Selected: persona gradient background, white text, scale-105
- Flex wrap, gap-3
- Click to toggle selection

**2. Review Style**
- Radio buttons, large clickable cards
- Each option in its own card with padding
- Selected: Bordered with persona color, glow effect
- "Recommended" badge for default option
- Description text for each option

**3. Length Preference**
- Range slider
- Track: gray-200 (light) / gray-700 (dark)
- Filled track: persona gradient
- Thumb: 24px circle, white, shadow-lg, persona gradient border
- Labels below: min/max values
- Current value displayed above, lg text

**4. Tone & Delivery**
- Two sliders:
  - Academic Level (Simple ← → Complex)
  - Pacing (Fast ← → Relaxed)
- Same styling as length slider
- Current value label below each

**5. Special Instructions**
- Textarea, optional
- Placeholder: Helpful examples
- Min height: 120px
- Rounded-xl, border, p-4
- Character count: 500 max (shown in bottom-right)

**Generate Button:**
- Large, xl text
- Persona gradient background
- px-12 py-4, rounded-xl
- Sparkle icon + arrow
- Hover: scale-105, glow effect
- Disabled while processing (with spinner)

**Responsive:**
- Single column layout always
- Max width: 900px, centered
- Mobile: Reduce spacing, make sliders vertical on very small screens

---

### 7. Script Review Page

**URL:** `/movie/[id]/persona/[personaId]/review`  
**Layout:** Content preview with audio  
**Auth Required:** Yes

```
┌─────────────────────────────────────────────────────────────────┐
│ [← Back]                              [👤 Philosopher Avatar]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│           Your Philosopher's Review                              │
│           ──────────────────────                                │
│         The Dark Knight • Generated 2 mins ago                   │
│                                                                   │
│  ╔═══════════════════════════════════════════════════════╗     │
│  ║                                                        ║     │
│  ║  [▶ Listen]  00:00 ━━━━━━━━━━●━━━━━ 07:23           ║     │
│  ║                                                        ║     │
│  ║  ─────────────────────────────────────               ║     │
│  ║                                                        ║     │
│  ║  Christopher Nolan's The Dark Knight transcends       ║     │
│  ║  the superhero genre by delving into profound         ║     │
│  ║  philosophical questions about morality and           ║     │
│  ║  the nature of chaos.                                 ║     │
│  ║                                                        ║     │
│  ║  Through the juxtaposition of Batman and the          ║     │
│  ║  Joker, Nolan presents a Nietzschean exploration      ║     │
│  ║  of order versus anarchy, forcing audiences to        ║     │
│  ║  confront uncomfortable truths about justice...       ║     │
│  ║                                                        ║     │
│  ║  [Highlighted sentence during playback]               ║     │
│  ║                                                        ║     │
│  ║  The film's philosophical depth extends beyond        ║     │
│  ║  surface-level action, questioning whether...         ║     │
│  ║                                                        ║     │
│  ║  [More paragraphs - scrollable]                       ║     │
│  ║                                                        ║     │
│  ╚═══════════════════════════════════════════════════════╝     │
│                                                                   │
│  📊 Review Stats:                                                │
│  • Length: 7 min 23 sec                                         │
│  • Word Count: 1,247 words                                      │
│  • Focus: Philosophy, Ethics, Character Analysis                │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 🔄 Regenerate│  │ ✏️ Edit      │  │ ✨ Continue │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Design Specifications:**

**Header:**
- Persona avatar (60px) in top-right
- Back button
- Title: 3xl, gradient text (persona colors)
- Meta info: sm, muted

**Audio Player:**
- Rounded-lg, persona gradient border (2px)
- Background: White (light) / slate-800 (dark)
- Padding: p-6

**Playback Controls:**
- Play/Pause button: 48px, persona gradient
- Timeline: Full width, persona gradient for progress
- Time labels: Current / Total
- Volume control: Popup on hover

**Script Display:**
- Prose format, max-w-3xl
- Line height: relaxed (1.75)
- Text: base (16px)
- Paragraph spacing: mb-4
- Max height: 500px, scrollable
- During playback: Current sentence highlighted with persona-colored background (opacity-20)

**Stats Section:**
- Small cards, flex layout
- Icons + text
- Gray background, rounded-lg
- Gap-4

**Action Buttons:**
- Three buttons: equal width, flex
- Regenerate: Outline variant, persona color border
- Edit: Ghost variant
- Continue: Persona gradient background, white text
- Icons for each action
- Hover effects: scale-105

---

### 8. Voice Selection Page

**URL:** `/movie/[id]/persona/[personaId]/voice`  
**Layout:** Voice options grid  
**Auth Required:** Yes

```
┌─────────────────────────────────────────────────────────────────┐
│ [← Back]                              [👤 Philosopher Avatar]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│           Choose Your Narration Voice                            │
│           ─────────────────────────                             │
│        Preview voices for your Philosopher's review              │
│                                                                   │
│  Professional Voices                                             │
│  ───────────────────                                            │
│                                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │                     │  │                     │              │
│  │  [🎙️]  Marcus       │  │  [🎙️]  Sophia      │              │
│  │                     │  │                     │              │
│  │  Male • Deep        │  │  Female • Warm      │              │
│  │  Professional       │  │  Professional       │              │
│  │                     │  │                     │              │
│  │  [▶ Preview]        │  │  [▶ Preview]        │              │
│  │  [ ] Select         │  │  [✓] Selected       │              │
│  │                     │  │                     │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │  [🎙️]  James        │  │  [🎙️]  Emma        │              │
│  │  Male • Energetic   │  │  Female • Clear     │              │
│  │  [▶ Preview]        │  │  [▶ Preview]        │              │
│  │  [ ] Select         │  │  [ ] Select         │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                   │
│            ┌───────────────────────────────┐                    │
│            │  Generate Video ✨ →           │                    │
│            └───────────────────────────────┘                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Design Specifications:**

**Voice Cards:**
- Grid: 2 cols (mobile), 4 (desktop), gap-6
- Card: 240px width, rounded-xl, border
- Selected: Persona gradient border (2px), glow
- Hover: scale-102, shadow-md

**Voice Icon:**
- Microphone emoji/icon, 48px
- Centered at top
- Persona color if selected, gray if not

**Voice Name:**
- lg, semibold
- Centered

**Voice Characteristics:**
- sm, muted
- Two lines: Gender • Quality
- Center-aligned

**Preview Button:**
- Small, outline variant
- Full width
- mb-2
- Plays 10-second sample
- Shows waveform animation while playing

**Select Radio:**
- Checkbox style, large (24px)
- Centered
- Persona color when selected

**Generate Button:**
- Same styling as previous pages
- Disabled if no voice selected

---

### 9. Video Generation Queue

**URL:** `/video-queue` or `/job-pending`  
**Layout:** Status list  
**Auth Required:** Yes

```
┌─────────────────────────────────────────────────────────────────┐
│ [Header]                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│           Video Generation Queue                                 │
│                                                                   │
│  Active (1)                                                      │
│  ─────────                                                       │
│                                                                   │
│  ╔═══════════════════════════════════════════════════════╗     │
│  ║                                                        ║     │
│  ║  [Poster]  The Dark Knight                           ║     │
│  ║  80x120    • Philosopher Review                       ║     │
│  ║            • Voice: Sophia                            ║     │
│  ║            • Duration: ~7 min                         ║     │
│  ║                                                        ║     │
│  ║  🔄 Generating video...                              ║     │
│  ║                                                        ║     │
│  ║  ████████████████░░░░  75%                          ║     │
│  ║                                                        ║     │
│  ║  Est. 2 minutes remaining                            ║     │
│  ║                                                        ║     │
│  ║                                          [Cancel]     ║     │
│  ╚═══════════════════════════════════════════════════════╝     │
│                                                                   │
│  Completed (12)                                                  │
│  ──────────                                                     │
│                                                                   │
│  ╔═══════════════════════════════════════════════════════╗     │
│  ║  [Poster]  Inception • Film Critic              [View]║     │
│  ║            Generated 2 hours ago                      ║     │
│  ║  ✅ Ready to watch                                   ║     │
│  ╚═══════════════════════════════════════════════════════╝     │
│                                                                   │
│  [More completed videos...]                                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Design Specifications:**

**Active Job Card:**
- Gradient border (persona color), rounded-xl
- Padding: p-6
- Flex layout: poster left, details right

**Progress Bar:**
- Full width
- Height: 8px, rounded-full
- Background: gray-200 (light) / gray-700 (dark)
- Fill: Persona gradient
- Percentage label above

**Status Icons:**
- Processing: Spinning loader (persona color)
- Queued: Clock icon
- Completed: Checkmark (green)
- Failed: X icon (red)

**Completed Card:**
- Simplified layout
- Gray border, not gradient
- Quick actions: View, Download, Delete

---

### 10. My Videos Library

**URL:** `/my-videos` or `/video-generation`  
**Layout:** Time-grouped grid  
**Auth Required:** Yes

```
┌─────────────────────────────────────────────────────────────────┐
│ [Header]                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│           My Video Reviews                                       │
│           [Grid View] [List View]  [Filter ▼]                   │
│                                                                   │
│  Today                                                           │
│  ─────                                                           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │              │  │              │  │              │          │
│  │ [Thumbnail]  │  │ [Thumbnail]  │  │ [Thumbnail]  │          │
│  │   16:9       │  │   16:9       │  │   16:9       │          │
│  │              │  │              │  │              │          │
│  │  [▶ 07:23]   │  │  [▶ 05:12]   │  │  [▶ 08:45]   │          │
│  │              │  │              │  │              │          │
│  │ [👤] The Dark│  │ [👤] Inception│  │ [👤] Matrix  │          │
│  │    Knight    │  │              │  │              │          │
│  │ Philosopher  │  │  Film Critic │  │  Sports Fan  │          │
│  │ 2 hrs ago    │  │  5 hrs ago   │  │  7 hrs ago   │          │
│  │              │  │              │  │              │          │
│  │ [⬇] [🗑️]     │  │ [⬇] [🗑️]     │  │ [⬇] [🗑️]     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  Yesterday                                                       │
│  ─────────                                                       │
│  [More video cards...]                                           │
│                                                                   │
│  ────────────────────────                                       │
│  [1] 2 3 ... 10                                                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Design Specifications:**

**Video Card:**
- Aspect ratio: 16:9
- Rounded-xl, overflow-hidden
- Hover: scale-105, shadow-xl

**Thumbnail:**
- Generated from video first frame
- Gradient overlay on hover
- Play icon appears centered (48px, white with shadow)

**Duration Badge:**
- Absolute bottom-2 right-2
- bg-black/80, white text
- Rounded-md, px-2 py-1
- Text: sm, semibold

**Persona Avatar:**
- Small (32px), absolute top-2 left-2
- Gradient border matching persona
- Always visible

**Card Info:**
- Padding: p-4
- Movie title: md, semibold, line-clamp-1
- Persona type: xs, persona color
- Timestamp: xs, muted

**Action Buttons:**
- Download: Arrow down icon, ghost button
- Delete: Trash icon, ghost button, red on hover
- Flex layout, gap-2

---

### 11. Video Player Page

**URL:** `/video/[videoId]`  
**Layout:** Full-width player  
**Auth Required:** Yes

```
┌─────────────────────────────────────────────────────────────────┐
│ [← Back to Library]                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ╔═══════════════════════════════════════════════════════╗     │
│  ║                                                        ║     │
│  ║                                                        ║     │
│  ║                    [▶ Video Player]                   ║     │
│  ║                      Aspect 16:9                      ║     │
│  ║                                                        ║     │
│  ║  Subtitle: Christopher Nolan's The Dark Knight       ║     │
│  ║           transcends the superhero genre...           ║     │
│  ║                                                        ║     │
│  ║  ━━━━━━━━━━━━━━●━━━━━━━━━  03:25 / 07:23           ║     │
│  ║  [⏯️] [⏮️] [⏭️] [🔊] [CC] [⚙️] [⛶]                    ║     │
│  ║                                                        ║     │
│  ╚═══════════════════════════════════════════════════════╝     │
│                                                                   │
│  The Dark Knight - Philosopher's Review                         │
│  Generated Jan 15, 2024 • 07:23                                 │
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐                        │
│  │ ⬇ Download     │  │ 📄 Subtitles   │                        │
│  │   Video        │  │   (SRT)        │                        │
│  └────────────────┘  └────────────────┘                        │
│                                                                   │
│  About This Review:                                              │
│  🎬 Movie: The Dark Knight (2008)                               │
│  🧑‍🏫 Persona: The Philosopher                                    │
│  🎙️ Voice: Sophia (Female, Professional)                        │
│  📏 Length: 7 minutes 23 seconds                                │
│  🎯 Focus: Philosophy, Ethics, Character Analysis                │
│                                                                   │
│  ┌─────────────────────────────────────┐                        │
│  │  Create Another Review →             │                        │
│  └─────────────────────────────────────┘                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Design Specifications:**

**Player:**
- Max width: 1400px (video container)
- Aspect ratio: 16:9, enforced
- Black background
- Custom controls (no default browser controls)

**Subtitle Overlay:**
- Bottom-centered, mb-16 (above controls)
- bg-black/80, white text
- Rounded-lg, px-6 py-3
- Max width: 80% of player width
- Text: lg, line-height relaxed
- Fade in/out with timing
- Two lines max, text-center

**Custom Controls:**
- Always visible (not auto-hide for accessibility)
- Gradient background (black → transparent)
- Icon buttons: 32px, white, opacity-80 hover:opacity-100

**Control Layout:**
- Timeline: Full width above controls, 4px height
- Track: gray-700
- Progress: Persona gradient
- Buffered: gray-600
- Thumb: 16px circle, white, shadow-lg

**Buttons (left to right):**
- Play/Pause (48px)
- Previous/Next 10s
- Volume (with popup slider)
- Current time / Duration
- Spacer (flex-1)
- Closed captions toggle
- Settings (speed, quality)
- Fullscreen

**Info Section:**
- Clean layout, icon + text rows
- Persona avatar small (40px) next to persona name
- All metadata listed clearly

**Action Cards:**
- Download video: Generates MP4
- Download subtitles: Generates SRT file
- Both: Outline buttons, icon + text

---

### 12. Profile Page (Simplified)

**URL:** `/profile`  
**Layout:** Single column, clean  
**Auth Required:** Yes

```
┌─────────────────────────────────────────────────────────────────┐
│ [Header]                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│           My Profile                                             │
│                                                                   │
│  ╔═══════════════════════════════════════════════════════╗     │
│  ║                                                        ║     │
│  ║     ┌────────┐                                        ║     │
│  ║     │        │  John Doe                              ║     │
│  ║     │[Avatar]│  john@gmail.com                        ║     │
│  ║     │ 96x96  │                                        ║     │
│  ║     │  [📷]  │  Joined: January 2024                  ║     │
│  ║     └────────┘  24 videos created                     ║     │
│  ║                                                        ║     │
│  ║                                          [Edit]        ║     │
│  ╚═══════════════════════════════════════════════════════╝     │
│                                                                   │
│  ╔═══════════════════════════════════════════════════════╗     │
│  ║  ⚙️ Preferences                                        ║     │
│  ║  ─────────────                                        ║     │
│  ║                                                        ║     │
│  ║  Language:  [🌐] English ▼                            ║     │
│  ║  Theme:     [🌙] Dark Mode    [Toggle]                ║     │
│  ║                                                        ║     │
│  ╚═══════════════════════════════════════════════════════╝     │
│                                                                   │
│  ╔═══════════════════════════════════════════════════════╗     │
│  ║  🔔 Notifications                                      ║     │
│  ║  ────────────────                                    ║     │
│  ║                                                        ║     │
│  ║  Video Generation Complete    [ON]                    ║     │
│  ║  Get notified when videos are ready                   ║     │
│  ║                                                        ║     │
│  ║  Platform Updates             [OFF]                   ║     │
│  ║  New features and improvements                        ║     │
│  ║                                                        ║     │
│  ╚═══════════════════════════════════════════════════════╝     │
│                                                                   │
│  ╔═══════════════════════════════════════════════════════╗     │
│  ║  🚪 Sign Out                                           ║     │
│  ╚═══════════════════════════════════════════════════════╝     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Design Specifications:**

**Profile Card:**
- White (light) / slate-900 (dark)
- Rounded-2xl, p-8
- Shadow-lg

**Avatar:**
- 96x96px, rounded-full
- Gradient background if no image
- Camera button overlay: 32px, bottom-right, persona gradient

**Info:**
- Name: 2xl, bold
- Email: base, muted
- Stats: sm, muted, mt-2

**Preference Cards:**
- Each section in own card
- Same styling as profile card
- Toggle switches: Persona gradient when ON

**Sign Out:**
- Red accent on hover
- Confirmation dialog before sign out

**No VIP Section:**
- Removed all subscription/billing UI
- Removed payment history
- Removed upgrade prompts
- Equal access for all users

---

## 🎯 Common UI Patterns

### Global Header

```
┌─────────────────────────────────────────────────────────────────┐
│ [🎬 Logo]  [Home] [Movies] [My Videos]    [🌙] [🔔] [Profile▼] │
└─────────────────────────────────────────────────────────────────┘
```

- Fixed top, backdrop-blur-md
- Logo: 120x36px, clickable to home
- Navigation: Hidden on mobile (<lg), in hamburger menu
- Right icons: Theme toggle, Notifications (badge if unread), Profile dropdown
- Height: 64px

### Footer

```
┌─────────────────────────────────────────────────────────────────┐
│                    Movie Persona-AI                              │
│                 Create unique movie reviews                      │
│                                                                   │
│          [About] [Blog] [Terms] [Privacy] [Support]              │
│                                                                   │
│              © 2024 Movie Persona-AI                             │
└─────────────────────────────────────────────────────────────────┘
```

- Dark background (both themes)
- Centered content, max-w-7xl
- py-12, px-6
- Links: hover underline

### Loading States

**Spinner:**
- Persona gradient colored
- 48px diameter
- Animated spin
- "Generating..." text below

**Skeleton:**
- Animated pulse
- Gray-200 (light) / gray-800 (dark)
- Matches content shape

### Toast Notifications

```
┌────────────────────────────┐
│  ✅ Success!                │
│  Video generated            │
└────────────────────────────┘
```

- Bottom-right (desktop), top-center (mobile)
- Rounded-xl, shadow-2xl
- Auto-dismiss after 5s
- Icon + message

### Empty States

```
┌─────────────────────────────────────────┐
│                                           │
│         [Large Icon - 64px]              │
│                                           │
│         No videos yet                    │
│                                           │
│    Start creating movie reviews          │
│    with AI personas                      │
│                                           │
│    ┌───────────────────┐                 │
│    │  Browse Movies →  │                 │
│    └───────────────────┘                 │
│                                           │
└─────────────────────────────────────────┘
```

---

## 📐 Responsive Breakpoints

```
Mobile:  < 640px   (sm)
Tablet:  640-1024px (sm-lg)
Desktop: > 1024px   (lg+)
```

### Adaptations

**Mobile:**
- Single column layouts
- Persona grid: 2 columns
- Header navigation in hamburger
- Bottom tab bar for main navigation
- Full-width buttons
- Larger touch targets (min 44px)

**Tablet:**
- 2-3 column grids
- Partial navigation visible
- Hybrid layouts

**Desktop:**
- Full multi-column grids
- All navigation visible
- Hover effects enabled
- Larger padding/spacing

---

## ✅ Design Checklist

Before finalizing designs:

- [ ] All 6 personas have unique, consistent colors throughout
- [ ] Persona avatars animated and distinctive
- [ ] Social login only (no email/password forms)
- [ ] No VIP/subscription UI anywhere
- [ ] Light and dark themes for all screens
- [ ] Mobile, tablet, desktop layouts
- [ ] All interactive states (hover, focus, active, disabled)
- [ ] Loading states for all async operations
- [ ] Empty states for all lists
- [ ] Error states with helpful messages
- [ ] Success feedback (toasts, confirmations)
- [ ] Accessibility: contrast, focus indicators, keyboard nav
- [ ] Consistent spacing using design system
- [ ] All icons from single icon set
- [ ] All images have fallbacks
- [ ] Smooth animations (300ms default)

---

## 🎯 Implementation Notes for Developers

### Persona System
- Each persona should be a data object with: id, name, avatar, colors (gradient array), description
- Store selected persona in flow state throughout creation process
- Use persona colors dynamically for all UI elements (borders, buttons, text)

### Social Auth Only
- Implement Google OAuth (OAuth 2.0)
- Implement Facebook Login
- Guest mode: Limited features, prompt to sign in to save
- No email/password authentication at all

### Video Generation
- Queue system for video jobs
- Real-time progress updates (WebSocket or polling)
- Video stored on CDN, served via signed URLs
- Subtitles generated as SRT files

### No VIP Restrictions
- All features available to all users
- No paywalls, upgrade prompts, or tier badges
- Usage limits (if any) same for everyone

---

**End of UI Storyboard**

This redesigned specification focuses on a persona-driven, character-first approach where AI personalities guide the movie review creation process. The simplified authentication (social only) and removal of VIP tiers creates a more accessible, egalitarian platform focused on creative content generation.
