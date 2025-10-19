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

## 🎨 Design System

### Core Color Palette

#### Light Theme
- **Background:** White (#FFFFFF) with soft gradients (violet-50 to fuchsia-50)
- **Surface:** White with subtle shadows
- **Text Primary:** Gray-900 (#111827)
- **Text Secondary:** Gray-600 (#4B5563)
- **Text Muted:** Gray-500 (#6B7280)
- **Borders:** Gray-200 (#E5E7EB)

#### Dark Theme
- **Background:** Deep gradient (slate-950 → gray-950 → zinc-950)
- **Surface:** Slate-900/90 with glow effects
- **Text Primary:** White (#FFFFFF)
- **Text Secondary:** Gray-300 (#D1D5DB)
- **Text Muted:** Gray-400 (#9CA3AF)
- **Borders:** White/15

### Persona Color Systems

Each persona has a unique color identity used throughout the application:

**1. The Philosopher** 🧑‍🏫
- Primary Gradient: Purple-500 → Pink-500
- Accent: Purple-600
- Character: Wise, contemplative, deep
- Use Case: Philosophical themes, existential analysis

**2. The Film Critic** 🎬
- Primary Gradient: Blue-500 → Cyan-500
- Accent: Blue-600
- Character: Professional, analytical, precise
- Use Case: Technical analysis, cinematography

**3. The Sports Fan** ⚽
- Primary Gradient: Orange-500 → Red-500
- Accent: Orange-600
- Character: Energetic, passionate, enthusiastic
- Use Case: Action sequences, drama, intensity

**4. The Engineer** 🤖
- Primary Gradient: Green-500 → Teal-500
- Accent: Green-600
- Character: Logical, technical, detail-oriented
- Use Case: Plot logic, technical accuracy, sci-fi

**5. The Comedian** 😂
- Primary Gradient: Yellow-500 → Amber-500
- Accent: Yellow-600
- Character: Humorous, satirical, lighthearted
- Use Case: Comedy analysis, satire, humor discovery

**6. The Historian** 📚
- Primary Gradient: Brown-600 → Orange-600
- Accent: Brown-700
- Character: Contextual, educational, classical
- Use Case: Historical context, period pieces

### Typography

```
Hero Title:     7xl (72px) - Bold - Gradient text
Page Title:     4xl (36px) - Bold
Persona Name:   2xl (24px) - Semibold - Persona color
Section Title:  xl (20px) - Semibold
Body Text:      base (16px) - Regular
Small Text:     sm (14px) - Regular  
Micro Text:     xs (12px) - Regular
```

### Spacing Scale
```
xs: 4px      md: 16px     2xl: 48px
sm: 8px      lg: 24px     3xl: 64px
base: 12px   xl: 32px     4xl: 80px
```

### Border Radius
```
sm: 8px   (inputs, tags)
md: 12px  (buttons, small cards)
lg: 16px  (cards, modals)
xl: 24px  (hero sections)
full: 9999px (avatars, pills)
```

### Shadows & Effects
```
Small:  0 2px 4px rgba(0,0,0,0.06)
Medium: 0 4px 6px rgba(0,0,0,0.1)
Large:  0 10px 15px rgba(0,0,0,0.1)
Glow:   0 0 20px [persona-color]/30
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

**Design Specifications:**
- **Video Background:** Cinematic clips from iconic movies (The Godfather, The Dark Knight, Pulp Fiction, etc.)
- **Header:** Glassmorphism (backdrop-blur-md), fixed position, white/10 background
- **Hero Title:** 7xl, bold, gradient (violet-400 → fuchsia-400 → pink-400), animated
- **Subtitle:** xl, white/90, max-w-3xl, line-height relaxed
- **CTA Button:** 2xl text, gradient bg (violet-600 → fuchsia-600), px-16 py-6, rounded-full, glow on hover
- **Persona Circles:** 120px diameter, gradient borders (animated), persona colors, hover grows to 135px
- **Step Cards:** 300x320px, gradient borders, icon-first layout, hover lifts 8px

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

**Design Specifications:**
- **Card:** 480px width, white (light) / slate-900 (dark), rounded-2xl, shadow-2xl
- **Logo:** 3xl, gradient text, centered
- **Title:** 2xl, bold, mb-2
- **Subtitle:** Base, muted text, mb-8
- **Google Button:** White bg, gray-700 text, Google logo (24px), shadow-md, hover shadow-lg
- **Facebook Button:** Facebook blue (#1877F2), white text, Facebook logo
- **Guest Button:** Outline variant, gray border, hover bg-gray-50
- **All Buttons:** Full width, py-3.5, rounded-xl, flex items-center justify-center, gap-3
- **Divider:** Gray-300 (light) / gray-700 (dark), with "OR" centered
- **Terms Text:** xs, text-center, gray-500, links underline on hover

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

**Design Specifications:**
- **Page Title:** 4xl, bold, centered, mb-8
- **Search Bar:** max-w-2xl, centered, pl-12 pr-12, py-4, rounded-2xl, shadow-lg
- **Search Icon:** 24px, left-3, gray-400
- **Clear Button:** Appears when typing, absolute right-3, hover scale-110
- **Dropdown:** Absolute, full width of search bar, mt-2, rounded-xl, shadow-2xl, z-50
- **Recent Searches:** Pills, rounded-full, hover scale-105, gray-100 (light) / gray-800 (dark)
- **Movie Grid:** 2 cols (mobile), 3 (tablet), 4 (desktop), gap-6
- **Movie Card:** Rounded-xl, overflow-hidden, hover scale-105, shadow-md hover:shadow-xl
- **Poster:** Aspect 2/3, object-cover, group-hover brightness-110
- **Rating Badge:** Absolute top-3 right-3, yellow-400 bg, white text, rounded-full, px-2 py-1
- **Movie Title:** Semibold, text-base, line-clamp-1, px-4 pt-3
- **Year:** xs, muted, px-4 pb-3

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

**Design Specifications:**
- **Backdrop:** Full width, height 500px, object-cover, gradient overlay (black/80 → transparent)
- **Back Button:** Absolute top-4 left-4, ghost variant, white text
- **Poster:** 200x300px, rounded-xl, shadow-2xl, absolute bottom--100px left-8
- **Title:** 4xl, bold, white, mb-2
- **Meta Info:** Base, white/90, flex, gap-4, mb-4
- **Stars:** Yellow-400, 24px each
- **Genres:** Badges, rounded-full, bg-white/20, white text, px-3 py-1
- **Description:** lg, white/80, line-height-relaxed, max-w-3xl, mb-8
- **CTA Button:** xl, gradient (violet-600 → fuchsia-600), px-12 py-4, rounded-xl, glow

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
