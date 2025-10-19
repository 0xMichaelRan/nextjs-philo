# Movie Persona-AI - UI Storyboard Document
## Redesigned UI Specification for AI Persona-Driven Movie Review Generation

---

## 📋 Document Overview

**Purpose:** Visual design reference for persona-driven AI movie review platform  
**Target Audience:** UI/UX Designers  
**Application:** Movie Persona-AI - AI persona-powered movie review video generator  
**Design Philosophy:** Character-first, intuitive, playful yet professional

**Key Design Changes:**
- ✨ **Persona-Driven Flow:** AI characters guide the review creation process
- 🎭 **Character Avatars:** Visual representation of AI personas throughout
- 🔐 **Social Login Only:** Google/Facebook OAuth (no phone/email signup)
- 🎨 **Unified Experience:** No VIP tiers - equal access for all users
- 🎬 **Movie-First:** Focus on popular movie reviews with unique AI perspectives

---

## 🎨 Design System Foundation

### Color Palette

#### Light Theme
- **Primary Background:** White (#FFFFFF) to light gradients (violet-50, fuchsia-50, pink-50)
- **Card Background:** White with subtle shadow, gradient borders for personas
- **Primary Text:** Gray-900 (#111827)
- **Secondary Text:** Gray-600 (#4B5563)
- **Muted Text:** Gray-500 (#6B7280)
- **Borders:** Gray-200 (#E5E7EB)
- **Persona Accent:** Each persona has unique gradient (philosopher: purple-pink, critic: blue-cyan, fan: orange-red)

#### Dark Theme
- **Primary Background:** Deep gradient from slate-950 via gray-950 to zinc-950
- **Card Background:** Slate-900 with 10% opacity overlay, glow effects
- **Primary Text:** White (#FFFFFF)
- **Secondary Text:** Gray-300 (#D1D5DB)
- **Muted Text:** Gray-400 (#9CA3AF)
- **Borders:** White with 15% opacity
- **Persona Glow:** Subtle glow matching persona color theme

#### Persona Color Themes
- **Philosopher:** Purple-500 to Pink-500 gradient, wisdom/deep thought
- **Film Critic:** Blue-500 to Cyan-500 gradient, professional/analytical
- **Sports Fan:** Orange-500 to Red-500 gradient, energetic/passionate
- **Stereotype Engineer:** Green-500 to Teal-500 gradient, logical/technical
- **Comedian:** Yellow-500 to Amber-500 gradient, fun/lighthearted
- **Historian:** Brown-500 to Orange-600 gradient, classic/contextual

### Typography

#### Font Hierarchy
- **Hero Title:** 5xl-7xl (48-80px), bold, animated gradient text
- **Page Title:** 3xl-4xl (30-36px), bold
- **Persona Name:** 2xl (24px), semibold, persona color
- **Section Title:** xl (20px), semibold
- **Body Text:** base (16px), regular
- **Small Text:** sm (14px), regular
- **Micro Text:** xs (12px), regular, metadata

### Spacing & Layout
- **Base Unit:** 4px
- **Container Max Width:** 1400px for persona galleries, 1024px for forms
- **Card Spacing:** 24px gaps for persona cards
- **Section Padding:** 48px vertical, 24px horizontal (mobile: 32px/16px)

### Border Radius
- **Persona Avatars:** Full circle (rounded-full)
- **Cards:** 16px (rounded-2xl)
- **Buttons:** 12px (rounded-xl)
- **Inputs:** 8px (rounded-lg)

### Special Effects
- **Persona Card Hover:** Scale-105, glow effect with persona color
- **Avatar Animations:** Subtle pulse/breathing effect when idle
- **Gradient Borders:** Animated gradient borders for selected personas
- **Transitions:** 300ms ease-in-out for all interactions

---

## 📱 Screen-by-Screen UI Specifications

---

### 1. Home Page (Landing)

**Layout Type:** Full-screen vertical scrolling sections with movie montage  
**Background:** Cinematic video montage of iconic movie scenes  
**Navigation:** Scroll, touch, keyboard arrows

#### Visual Components

**Header (Fixed Top)**
```
┌─────────────────────────────────────────────────┐
│ [🎬 Movie Persona-AI]         [Blog] [Sign In] │
└─────────────────────────────────────────────────┘
```

- **Logo:** Film reel icon + text, white for dark overlay (120x36px)
- **Sign In Button:** Gradient border, white text, hover glow effect
- **Height:** 72px
- **Background:** Glassmorphism effect (blur-md, bg-white/10)

**Hero Section**
```
┌─────────────────────────────────────────────────┐
│                                                   │
│          [Iconic Movie Montage Video]            │
│                                                   │
│         ═══════════════════════════              │
│         Movie Reviews, Reimagined                │
│         ═══════════════════════════              │
│                                                   │
│    AI Personas analyze your favorite films       │
│    Choose your critic. Get unique perspectives.  │
│                                                   │
│    ┌─────────────────────────────────┐          │
│    │  Start Creating →                │          │
│    └─────────────────────────────────┘          │
│                                                   │
│              [Scroll ⌄]                          │
└─────────────────────────────────────────────────┘
```

- **Title:** 6xl-8xl, bold, gradient from violet-400 via fuchsia-400 to pink-400
- **Subtitle:** xl, white/90, max-w-2xl centered
- **CTA Button:** xl, gradient (violet-600 to fuchsia-600), px-16 py-5, rounded-full, glow on hover
- **Video:** Cinematic clips of famous movies, slow-motion, color-graded

**Persona Preview Section**
```
┌─────────────────────────────────────────────────┐
│         Meet Your AI Film Critics                │
│         ─────────────────────                   │
│                                                   │
│  ┌────────┐  ┌────────┐  ┌────────┐            │
│  │ [👨‍🏫]  │  │ [👔]   │  │ [⚽]   │            │
│  │Philosph│  │ Critic │  │ Sports │            │
│  │  er    │  │        │  │  Fan   │            │
│  └────────┘  └────────┘  └────────┘            │
│                                                   │
│  Deep       Professional   Passionate            │
│  thinker    analyst       enthusiast             │
│                                                   │
│              [Scroll ⌄]                          │
└─────────────────────────────────────────────────┘
```

- **Persona Avatars:** 120x120px circles, gradient borders, animated pulse
- **Names:** lg, semibold, persona color
- **Descriptions:** sm, muted text, centered
- **Layout:** Horizontal scroll on mobile, grid on desktop

**How It Works Section**
```
┌─────────────────────────────────────────────────┐
│         How It Works                             │
│         ────────────                            │
│                                                   │
│  1️⃣              2️⃣              3️⃣              │
│  Pick Your      Choose AI       Generate         │
│  Movie          Persona         Review           │
│                                                   │
│  Search from    Philosopher,    AI creates       │
│  thousands      Critic, Fan     unique video     │
│  of films       & more          analysis         │
│                                                   │
│  ─ ─ ─ ─ → ─ ─ ─ ─ → ─ ─ ─ ─                 │
└─────────────────────────────────────────────────┘
```

---

### 2. Authentication Page

**Layout Type:** Centered card with social login  
**Card Width:** 480px (max-w-md)  
**Background:** Gradient from violet-100 via fuchsia-100 to pink-100 (light) / Deep gradient (dark)

#### Visual Components

**Card Structure**
```
┌─────────────────────────────────────────────────┐
│                                                   │
│          🎬 Movie Persona-AI                     │
│                                                   │
│        Welcome Back!                             │
│        Sign in to create amazing movie           │
│        reviews with AI personas                  │
│                                                   │
│  ┌─────────────────────────────────────────┐   │
│  │                                          │   │
│  │  ┌──────────────────────────────────┐   │   │
│  │  │ [G] Continue with Google          │   │   │
│  │  └──────────────────────────────────┘   │   │
│  │                                          │   │
│  │  ┌──────────────────────────────────┐   │   │
│  │  │ [f] Continue with Facebook        │   │   │
│  │  └──────────────────────────────────┘   │   │
│  │                                          │   │
│  │  ───────────── OR ──────────────        │   │
│  │                                          │   │
│  │  ┌──────────────────────────────────┐   │   │
│  │  │ Continue as Guest →               │   │   │
│  │  └──────────────────────────────────┘   │   │
│  │                                          │   │
│  │  By signing in, you agree to our         │   │
│  │  Terms of Service and Privacy Policy     │   │
│  │                                          │   │
│  └─────────────────────────────────────────┘   │
│                                                   │
└─────────────────────────────────────────────────┘
```

**Component Details:**
- **Logo:** Large, centered, animated gradient
- **Title:** 2xl, bold, welcome message
- **Subtitle:** Base text, gray-600 (light) / gray-300 (dark)
- **Google Button:** Full width, white background, Google logo left, gray-700 text, shadow-md
- **Facebook Button:** Full width, Facebook blue (#1877F2), white text, Facebook logo left
- **Guest Button:** Full width, outline variant, gray border, arrow icon
- **Button Spacing:** 16px gap between buttons
- **Button Height:** 48px (py-3)
- **Button Icons:** 20x20px, left-aligned with 12px margin
- **Terms Text:** xs, center-aligned, muted, links in accent color

**No Phone/Email Login:**
- Removed all phone number inputs
- Removed email/password forms
- Removed registration tabs
- Simplified to social OAuth only

---

### 3. Movie Selection Page

**Layout Type:** Grid layout with search  
**Container:** Max-w-7xl, centered  
**Background:** Standard theme background

#### Visual Components

**Hero Section**
```
┌─────────────────────────────────────────────────┐
│           Select Your Movie                       │
│                                                   │
│    ┌───────────────────────────────────────┐    │
│    │ 🔍  Search for movies...           ✕  │    │
│    └───────────────────────────────────────┘    │
│                                                   │
└─────────────────────────────────────────────────┘
```

- **Title:** 3xl-4xl, bold, centered
- **Search Bar:** max-w-md, centered, search icon left, clear button right
- **Input:** Rounded, themed background, border, pl-10 pr-10

**Search Suggestions Dropdown**
```
┌───────────────────────────────────────┐
│  🕐 Recent Searches                   │
│  ┌─────┐ ┌─────┐ ┌─────┐             │
│  │Movie│ │Title│ │Film │             │
│  └─────┘ └─────┘ └─────┘             │
│                                        │
│  📈 Recommended Keywords               │
│  ┌────────────────┐ ┌──────────────┐ │
│  │ ⦿ The Dark     │ │ ⦿ Interstellar│ │
│  │   Knight       │ │              │ │
│  └────────────────┘ └──────────────┘ │
└───────────────────────────────────────┘
```

- **Dropdown:** Absolute positioned, full width, rounded-lg, shadow-lg, z-50
- **Section Headers:** Small icons, medium font, spacing mb-3
- **Recent Pills:** Rounded-full, small padding, hover effect
- **Keyword Buttons:** Grid 2 columns, rounded-lg, gradient accent dot, left-aligned

**Movie Grid**
```
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│[Poster]│ │[Poster]│ │[Poster]│ │[Poster]│
│  [8.5] │ │  [7.9] │ │  [9.1] │ │  [8.2] │
│        │ │        │ │        │ │        │
│ Movie  │ │ Movie  │ │ Movie  │ │ Movie  │
│ Title  │ │ Title  │ │ Title  │ │ Title  │
│ EN     │ │ EN     │ │ EN     │ │ EN     │
│ 2023   │ │ 2022   │ │ 2021   │ │ 2024   │
└────────┘ └────────┘ └────────┘ └────────┘
```

- **Grid:** 2 columns (mobile), 3 (tablet), 4 (desktop), gap-6
- **Card:** Themed background, hover scale-105, rounded-lg, overflow-hidden
- **Poster:** 200x300px, h-64 md:h-72, object-cover, group-hover scale-105
- **Rating Badge:** Top-3 right-3, bold, white text, warning background
- **Title:** Semibold, line-clamp-1, themed text
- **Secondary Title:** xs, secondary text, line-clamp-1
- **Year:** xs, muted text

**Empty State**
```
┌─────────────────────────────────────────────────┐
│                                                   │
│         No movies found                           │
│                                                   │
│    Try searching for:                            │
│    ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│    │The Matrix│ │Inception │ │Godfather │      │
│    └──────────┘ └──────────┘ └──────────┘      │
│                                                   │
└─────────────────────────────────────────────────┘
```

---

### 4. Movie Detail Page

**Layout Type:** Hero image with overlay content  
**Background:** Backdrop image with gradient overlay

#### Visual Components

**Hero Section**
```
┌─────────────────────────────────────────────────┐
│ [← Back]                                         │
│                                                   │
│  ┌──────────┐                                    │
│  │          │  The Dark Knight (2008)            │
│  │ [Poster] │  ★★★★★ 9.0                        │
│  │          │                                     │
│  │          │  Action, Crime, Drama               │
│  └──────────┘  Director: Christopher Nolan       │
│                                                   │
│  Cast: Christian Bale, Heath Ledger              │
│                                                   │
│  When the menace known as the Joker wreaks       │
│  havoc and chaos on the people of Gotham...      │
│                                                   │
│  ┌─────────────────────────────────────┐        │
│  │  Create Analysis →                   │        │
│  └─────────────────────────────────────┘        │
│                                                   │
└─────────────────────────────────────────────────┘
```

- **Backdrop:** Full width, gradient overlay from black/80 to transparent
- **Poster:** 300x450px, rounded-lg, shadow-xl, positioned left
- **Title:** 3xl, bold, white text
- **Rating:** Large stars, text display
- **Genres:** Badges, purple/blue tones, rounded-full
- **Info Text:** lg, white/gray-200
- **Synopsis:** Base text, line-clamp or full
- **CTA Button:** lg, gradient premium, full width on mobile, auto on desktop

---

### 5. Persona Picker Page

**Layout Type:** Character showcase grid  
**Max Width:** 1400px (max-w-7xl)  
**Background:** Gradient themed, animated particles

#### Visual Components

**Movie Context Header**
```
┌─────────────────────────────────────────────────┐
│  [← Back]                                        │
│                                                   │
│  [Poster]  The Dark Knight (2008)               │
│  80x120    Who should review this film?          │
│            Pick your AI persona                  │
└─────────────────────────────────────────────────┘
```

- **Movie Poster:** Small thumbnail (80x120px), rounded-lg, shadow
- **Title:** xl, semibold, themed text
- **Subtitle:** Base text, muted, motivating copy

**Persona Grid**
```
┌─────────────────────────────────────────────────┐
│                                                   │
│  ┌───────────────┐  ┌───────────────┐           │
│  │               │  │               │           │
│  │   [👨‍🏫]       │  │   [👔]        │           │
│  │  150x150px    │  │  150x150px    │           │
│  │               │  │               │           │
│  │ THE           │  │ THE           │           │
│  │ PHILOSOPHER   │  │ FILM CRITIC   │           │
│  │               │  │               │           │
│  │ "Explores     │  │ "Professional │           │
│  │  existential  │  │  analysis of  │           │
│  │  themes and   │  │  cinematograp │           │
│  │  morality"    │  │  hy & story"  │           │
│  │               │  │               │           │
│  │ ━━━━━━━━━━━━  │  │ ━━━━━━━━━━━━  │           │
│  │ [Choose ✨]   │  │ [Choose ✨]   │           │
│  └───────────────┘  └───────────────┘           │
│                                                   │
│  ┌───────────────┐  ┌───────────────┐           │
│  │   [⚽]        │  │   [🤖]        │           │
│  │  THE          │  │  THE          │           │
│  │  SPORTS FAN   │  │  ENGINEER     │           │
│  │               │  │               │           │
│  │ "Passionate   │  │ "Analyzes     │           │
│  │  enthusiasm   │  │  plot logic & │           │
│  │  for action & │  │  technical    │           │
│  │  drama"       │  │  accuracy"    │           │
│  │               │  │               │           │
│  │ [Choose ✨]   │  │ [Choose ✨]   │           │
│  └───────────────┘  └───────────────┘           │
│                                                   │
│  ┌───────────────┐  ┌───────────────┐           │
│  │   [😂]        │  │   [📚]        │           │
│  │  THE          │  │  THE          │           │
│  │  COMEDIAN     │  │  HISTORIAN    │           │
│  │               │  │               │           │
│  │ "Finds humor  │  │ "Contextualiz │           │
│  │  & satire in  │  │  es within    │           │
│  │  every scene" │  │  history"     │           │
│  │               │  │               │           │
│  │ [Choose ✨]   │  │ [Choose ✨]   │           │
│  └───────────────┘  └───────────────┘           │
└─────────────────────────────────────────────────┘
```

**Card Design Specifications:**
- **Grid:** 2 columns (mobile), 3 (tablet), 3 (desktop), gap-8
- **Card Size:** 320x420px, rounded-2xl, overflow-hidden
- **Background:** White (light) / Slate-800 (dark), gradient border (2px)
- **Border Gradient:** Animated, matches persona color theme
- **Avatar:** 150x150px circle, centered, gradient background matching persona
- **Avatar Animation:** Gentle pulse (scale 1→1.05→1, 3s infinite)
- **Hover Effect:** Lift (translateY -8px), glow (box-shadow with persona color), scale-102
- **Persona Name:** xl, bold, uppercase, letter-spacing-wide, persona color
- **Description:** sm, gray-600 (light) / gray-300 (dark), 3 lines, center-aligned
- **Divider:** Gradient line, persona color, opacity-50
- **Button:** Full width, gradient (persona colors), white text, sparkle icon, rounded-xl
- **Button Hover:** Brighten, scale-105, glow effect

**Persona Color Mappings:**
- **Philosopher:** Purple-500 → Pink-500, mystical aura
- **Film Critic:** Blue-500 → Cyan-500, professional gleam
- **Sports Fan:** Orange-500 → Red-500, energetic burst
- **Engineer:** Green-500 → Teal-500, tech glow
- **Comedian:** Yellow-500 → Amber-500, cheerful radiance
- **Historian:** Brown-600 → Orange-600, vintage warmth

---

### 6. Prompt Configuration Page

**Layout Type:** Form with textarea  
**Max Width:** 3xl

#### Visual Components

**Main Form**
```
┌─────────────────────────────────────────────────┐
│  Custom Analysis Prompt                          │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │ Analyze this film from a psychological  │    │
│  │ perspective, focusing on character      │    │
│  │ development and trauma themes...        │    │
│  │                                          │    │
│  │                                          │    │
│  │                                          │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  Character count: 145 / 1000                     │
│                                                   │
│  ⚙️ Advanced Settings                            │
│  ┌─────────────────────────────────────────┐    │
│  │ Analysis Depth: ●────────────○          │    │
│  │ Tone: Professional ▼                     │    │
│  │ Focus Areas: [Themes] [Characters]       │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  [← Back]                   [Generate →]         │
└─────────────────────────────────────────────────┘
```

- **Textarea:** Min-h-48, rounded-lg, themed background, border, p-4
- **Character Count:** xs, right-aligned, muted text
- **Settings Card:** Collapsible, rounded-lg, p-4
- **Slider:** Full width, purple accent
- **Select Dropdown:** Rounded, border, themed
- **Tag Pills:** Multiple select, removable, rounded-full
- **Navigation:** Fixed bottom on mobile, inline on desktop

---

### 7. Script Review Page

**Layout Type:** Content preview with editor  
**Max Width:** 4xl

#### Visual Components

**Preview Section**
```
┌─────────────────────────────────────────────────┐
│  Generated Analysis Script                       │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │ [Play ▶] 00:00 / 05:23                  │    │
│  │                                          │    │
│  │ Christopher Nolan's The Dark Knight     │    │
│  │ transcends the superhero genre by       │    │
│  │ exploring profound philosophical        │    │
│  │ questions about morality...             │    │
│  │                                          │    │
│  │ ──────────────────────────────         │    │
│  │                                          │    │
│  │ The Joker, masterfully portrayed by     │    │
│  │ Heath Ledger, serves as a force of      │    │
│  │ chaos that challenges...                │    │
│  │                                          │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  ✏️ Edit Script   🔄 Regenerate   💾 Save        │
│                                                   │
│  [← Back]               [Continue to Voice →]    │
└─────────────────────────────────────────────────┘
```

- **Audio Player:** Rounded-lg, themed background, play button, timeline
- **Script Display:** Prose format, scrollable, paragraph spacing
- **Current Sentence:** Highlighted background, smooth transition
- **Action Buttons:** Icon + text, ghost variant, spaced
- **Edit Mode:** Textarea replaces display, same styling
- **Bottom Navigation:** Sticky on scroll

---

### 8. Voice Selection Page

**Layout Type:** Audio player grid  
**Max Width:** 4xl

#### Visual Components

**Voice Grid**
```
┌─────────────────────────────────────────────────┐
│  Select Narration Voice                          │
│                                                   │
│  System Voices (Free)                            │
│  ┌────────────────┐ ┌────────────────┐          │
│  │ 🎙️ Male Voice │ │ 🎙️ Female     │          │
│  │ Professional   │ │ Voice Pro      │          │
│  │                │ │                │          │
│  │ [▶ Preview]    │ │ [▶ Preview]    │          │
│  │ [ ] Select     │ │ [✓] Select     │          │
│  └────────────────┘ └────────────────┘          │
│                                                   │
│  Custom Voices (VIP Only) 👑                     │
│  ┌────────────────┐ ┌────────────────┐          │
│  │ 🎤 My Voice 1  │ │ 🎤 My Voice 2  │          │
│  │ Created Jan 15 │ │ Created Jan 20 │          │
│  │                │ │                │          │
│  │ [▶ Preview]    │ │ [▶ Preview]    │          │
│  │ [ ] Select  🗑️ │ │ [ ] Select  🗑️ │          │
│  └────────────────┘ └────────────────┘          │
│                                                   │
│  ┌─────────────────────────────────────┐        │
│  │  + Record New Voice                  │        │
│  └─────────────────────────────────────┘        │
│                                                   │
│  [← Back]               [Generate Video →]       │
└─────────────────────────────────────────────────┘
```

- **Section Headers:** lg, semibold, with icons, spacing
- **Voice Cards:** Themed background, rounded-xl, p-4, border
- **Card Icon:** 2xl, themed color
- **Voice Name:** md, semibold
- **Metadata:** xs, muted text
- **Preview Button:** Small, outline, full width, with play icon
- **Select Radio:** Checkboxes/radios, themed accent
- **Delete Button:** Ghost, destructive hover, small icon
- **VIP Badge:** Crown icon, yellow color, next to section title
- **Record Button:** Dashed border, full width, center-aligned, plus icon
- **Navigation:** Fixed bottom

**VIP Upgrade Prompt (for free users)**
```
┌─────────────────────────────────────────────────┐
│  🔒 Custom Voices (VIP Feature)                  │
│                                                   │
│  Unlock the ability to record and use your       │
│  own voice for narration.                        │
│                                                   │
│  ┌─────────────────────────────────────┐        │
│  │  Upgrade to VIP →                    │        │
│  └─────────────────────────────────────┘        │
└─────────────────────────────────────────────────┘
```

---

### 9. Custom Voice Recording Page (VIP)

**Layout Type:** Centered recording interface  
**Max Width:** lg

#### Visual Components

**Recording Interface**
```
┌─────────────────────────────────────────────────┐
│  [← Back]                                        │
│                                                   │
│           Record Your Voice                       │
│                                                   │
│  Read the following text aloud:                  │
│  ┌─────────────────────────────────────────┐    │
│  │ "Welcome to Movie Persona-AI. This is  │    │
│  │  a sample recording to capture your     │    │
│  │  unique voice for narration."           │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│         ⚫                                        │
│      Recording                                    │
│      00:15 / 00:20                               │
│                                                   │
│  ████████████░░░░░░░░                            │
│                                                   │
│  ⏺️ [Record]  ⏸️ [Pause]  ⏹️ [Stop]             │
│                                                   │
│  Preview Recording                               │
│  ▶ [Play Preview]                                │
│                                                   │
│  Voice Name                                      │
│  ┌─────────────────────────────────────────┐    │
│  │ My Professional Voice                    │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  [Cancel]                        [Save Voice]    │
└─────────────────────────────────────────────────┘
```

- **Instructions Card:** Themed background, rounded-lg, p-4, centered text
- **Recording Circle:** Large circle, pulsing animation when recording, red/green states
- **Timer:** xl text, semibold, centered, red when recording
- **Waveform:** Progress bar style, purple accent, animated
- **Control Buttons:** Large, icon + text, spaced evenly
- **Preview:** Separate section, play button
- **Name Input:** Full width, themed, rounded
- **Action Buttons:** Cancel (ghost), Save (primary), bottom aligned

---

### 10. Job Pending / Queue Page

**Layout Type:** List with status cards  
**Max Width:** 4xl

#### Visual Components

**Status Cards**
```
┌─────────────────────────────────────────────────┐
│  Video Generation Queue                          │
│                                                   │
│  Active Jobs (2)                                 │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │ [Poster] The Dark Knight                │    │
│  │          Philosophical Analysis          │    │
│  │          Voice: Professional Male        │    │
│  │                                          │    │
│  │  🔄 Processing...                       │    │
│  │  ████████████░░░░░░░░  65%             │    │
│  │  Est. 2 minutes remaining               │    │
│  │                                          │    │
│  │                              [Cancel]    │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │ [Poster] Inception                       │    │
│  │          Character Study                 │    │
│  │          Voice: Female Voice Pro         │    │
│  │                                          │    │
│  │  ⏳ Queued (Position #3)                │    │
│  │  ░░░░░░░░░░░░░░░░░░░░░░  0%            │    │
│  │  Waiting for available slot             │    │
│  │                                          │    │
│  │                              [Cancel]    │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  Completed Jobs (15)                             │
│  [Filter: All ▼] [Search...]                     │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │ [Poster] The Matrix                      │    │
│  │          Thematic Analysis               │    │
│  │          Generated 2 hours ago           │    │
│  │                                          │    │
│  │  ✅ Completed                           │    │
│  │                                          │    │
│  │  [▶ View] [⬇ Download] [🗑️ Delete]      │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
└─────────────────────────────────────────────────┘
```

- **Section Headers:** xl, semibold, count badge
- **Job Cards:** Themed background, rounded-xl, p-6, border, spacing mb-4
- **Poster Thumbnail:** 80x120px, rounded-lg, left-aligned
- **Job Info:** Stacked layout, movie title (lg, semibold), template (sm), voice (xs, muted)
- **Status Badge:** Icon + text, colored by state (blue=processing, gray=queued, green=complete)
- **Progress Bar:** Full width, themed accent, rounded-full, height-2
- **Percentage:** md text, right-aligned
- **Time Estimate:** xs, muted text
- **Action Buttons:** Small, spaced, themed
- **Filter/Search:** Inline, small size, themed

**Status Colors:**
- **Queued:** Gray-400, clock icon
- **Processing:** Blue-500, spinning loader icon
- **Completed:** Green-500, checkmark icon
- **Failed:** Red-500, error icon

---

### 11. Video Generation/My Videos Page

**Layout Type:** Time-grouped card grid  
**Max Width:** 7xl

#### Visual Components

**Video Grid**
```
┌─────────────────────────────────────────────────┐
│  My Videos                   [Grid/List] [Filter]│
│                                                   │
│  Today                                           │
│  ┌────────────┐ ┌────────────┐                  │
│  │[Thumbnail] │ │[Thumbnail] │                  │
│  │ [▶ 05:23] │ │ [▶ 08:15] │                  │
│  │            │ │            │                  │
│  │ The Dark   │ │ Inception  │                  │
│  │ Knight     │ │            │                  │
│  │ Philosoph. │ │ Character  │                  │
│  │ 2 hrs ago  │ │ 5 hrs ago  │                  │
│  │            │ │            │                  │
│  │ [⬇] [🗑️]  │ │ [⬇] [🗑️]  │                  │
│  └────────────┘ └────────────┘                  │
│                                                   │
│  Yesterday                                       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │[Thumbnail] │ │[Thumbnail] │ │[Thumbnail] │  │
│  │ [▶ 06:45] │ │ [▶ 07:30] │ │ [▶ 09:12] │  │
│  └────────────┘ └────────────┘ └────────────┘  │
│                                                   │
│  This Week                                       │
│  [More videos...]                                │
│                                                   │
│  ─────────────────────────                      │
│  [1] 2 3 4 ... 10                                │
└─────────────────────────────────────────────────┘
```

- **Page Header:** 3xl title, view toggle, filter dropdown
- **Time Headers:** xl, semibold, mt-8 mb-4
- **Grid:** 2 columns (mobile), 3 (tablet), 4 (desktop), gap-6
- **Video Cards:** Themed background, rounded-xl, overflow-hidden, hover shadow-lg
- **Thumbnail:** 16:9 aspect, object-cover, with gradient overlay on hover
- **Duration Badge:** Absolute bottom-2 right-2, black/70 background, white text, rounded
- **Play Icon:** Absolute center, large, white with shadow, opacity change on hover
- **Card Content:** p-4, stacked layout
- **Movie Title:** md, semibold, line-clamp-1
- **Template Type:** xs, secondary text, line-clamp-1
- **Timestamp:** xs, muted text
- **Action Icons:** Small buttons, ghost variant, icon only
- **Pagination:** Centered, number buttons, arrows, themed

**List View Alternative**
```
│  ┌────┬──────────────────────────────────────┐
│  │[TH]│ The Dark Knight                      │
│  │    │ Philosophical Analysis • 05:23       │
│  │    │ Created 2 hours ago                  │
│  └────┴──────────────────────────────────────┘
```

---

### 12. Video Detail/Player Page

**Layout Type:** Full-width player with controls  
**Max Width:** 6xl

#### Visual Components

**Video Player**
```
┌─────────────────────────────────────────────────┐
│                                                   │
│                                                   │
│            ▶                                     │
│        [Video Player]                            │
│                                                   │
│  Subtitle: Christopher Nolan's The Dark Knight   │
│           transcends the superhero genre...      │
│                                                   │
│  ━━━━━━━━━━━━━●━━━━━━━━━━━━━━━  03:25 / 05:23 │
│  ⏯️  ⏮️  ⏭️  🔊 ──────●  CC  ⛶  ⏸️               │
│                                                   │
└─────────────────────────────────────────────────┘
```

**Video Info Section**
```
┌─────────────────────────────────────────────────┐
│  The Dark Knight - Philosophical Analysis        │
│  Generated on Jan 15, 2024 • Duration: 05:23    │
│                                                   │
│  ┌──────────────┐ ┌──────────────┐              │
│  │ ⬇ Download   │ │ 📄 Subtitles │              │
│  │ Video        │ │              │              │
│  └──────────────┘ └──────────────┘              │
│                                                   │
│  🎬 Movie: The Dark Knight (2008)                │
│  📝 Template: Philosophical Analysis              │
│  🎙️ Voice: Professional Male                    │
│                                                   │
│  ┌─────────────────────────────────────┐        │
│  │  Create Another Version →            │        │
│  └─────────────────────────────────────┘        │
└─────────────────────────────────────────────────┘
```

- **Player:** Aspect 16:9, black background, custom controls
- **Subtitle Overlay:** Bottom-centered, large text, black/80 background, white text, rounded
- **Timeline:** Full width, purple accent, draggable thumb
- **Controls:** Icon buttons, spaced, white icons
- **Volume Slider:** Popup on hover
- **CC Button:** Toggle subtitles on/off
- **Fullscreen:** Right-most control
- **Info Title:** 2xl, semibold
- **Metadata:** sm, muted text, bullet separated
- **Action Cards:** Grid 2 columns, themed background, rounded-lg, p-4, icon + text, center-aligned
- **Details List:** Icon + text rows, sm size, spacing
- **CTA Button:** Outline variant, full width

---

### 13. Profile Page

**Layout Type:** Tabbed interface  
**Max Width:** 4xl  
**Background:** Gradient hero (dark) / Blue gradient (light)

#### Visual Components

**Tab Navigation**
```
┌─────────────────────────────────────────────────┐
│  ╔═══════╦═══════════╦═══════╦══════════════╗  │
│  ║ Basics║Preferences║Billing║Notifications ║  │
│  ╚═══════╩═══════════╩═══════╩══════════════╝  │
└─────────────────────────────────────────────────┘
```

- **Tabs:** Grid 4 columns, equal width, themed background, rounded

**Basics Tab**
```
┌─────────────────────────────────────────────────┐
│  👤 Basic Information              [Edit]        │
│  ┌─────────────────────────────────────────┐    │
│  │                                          │    │
│  │   ┌────────┐                             │    │
│  │   │[Avatar]│ John Doe           [👑 VIP]│    │
│  │   │  [📷]  │ Joined: Jan 2024           │    │
│  │   └────────┘ 15 videos created          │    │
│  │              30 days remaining           │    │
│  │                                          │    │
│  │  Username: johndoe                       │    │
│  │  Email: john@example.com                 │    │
│  │  Phone: +86 139 1234 5678                │    │
│  │                                          │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  (If not VIP)                                    │
│  ┌─────────────────────────────────────────┐    │
│  │ 👑 Upgrade to VIP                        │    │
│  │                                          │    │
│  │ • Unlimited video generations            │    │
│  │ • Custom voice recording                 │    │
│  │ • Advanced templates                     │    │
│  │ • Priority processing                    │    │
│  │                                          │    │
│  │ ┌────────────────────────────────────┐  │    │
│  │ │  Start Free Trial →                 │  │    │
│  │ └────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

- **Card Header:** Flex justify-between, icon + title, edit button
- **Avatar:** 96x96px (w-24 h-24), rounded-full, gradient background for placeholder
- **Camera Button:** Absolute positioned, small, rounded-full, purple-600
- **User Info:** Stacked layout next to avatar
- **VIP Badge:** Custom component, crown icon, gradient colors
- **Stats:** xs text, muted color
- **Info Fields:** Grid layout, label + value pairs
- **Upgrade Card:** Themed surface, rounded-xl, p-6, gradient border top

**Preferences Tab**
```
┌─────────────────────────────────────────────────┐
│  ⚙️ Preferences                       [Edit]     │
│  ┌─────────────────────────────────────────┐    │
│  │                                          │    │
│  │  Default Language                        │    │
│  │  ○ 中文 (Chinese)                        │    │
│  │  ● English                               │    │
│  │                                          │    │
│  │  Theme Mode                              │    │
│  │  ○ Light Mode                            │    │
│  │  ● Dark Mode                             │    │
│  │                                          │    │
│  │  [Save] [Cancel]                         │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

- **Radio Groups:** Vertical stack, spaced, themed accent
- **Labels:** Semibold, mb-3
- **Edit Mode:** Show save/cancel buttons
- **View Mode:** Display current values as text

**Billing Tab**
```
┌─────────────────────────────────────────────────┐
│  👑 Current Subscription                         │
│  ┌─────────────────────────────────────────┐    │
│  │  VIP Member                   [Active]   │    │
│  │  Valid until: Dec 31, 2024              │    │
│  │  30 days remaining                       │    │
│  │                                          │    │
│  │  ─────────────────────────              │    │
│  │                                          │    │
│  │  Next Payment: Dec 31, 2024             │    │
│  │  Payment Method: Alipay                  │    │
│  │  Auto Renewal: [ON/OFF]                  │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  💳 Payment History                   [▼ Expand] │
│  ┌─────────────────────────────────────────┐    │
│  │  VIP Monthly Subscription     [Completed]│    │
│  │  Jan 15, 2024 • 10:30 AM                │    │
│  │  Order ID: ORD-20240115-1234             │    │
│  │                                   ¥29.90 │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

- **Status Badge:** Green (active), yellow (pending), red (expired)
- **Info Grid:** Key-value pairs, spaced
- **Toggle Switch:** Custom themed switch component
- **Payment Cards:** List layout, rounded-lg, themed background
- **Collapsible Section:** Chevron icon, animated expand/collapse

**Notifications Tab**
```
┌─────────────────────────────────────────────────┐
│  🔔 Notifications                                │
│  ┌─────────────────────────────────────────┐    │
│  │                                          │    │
│  │  Video Generation Notifications          │    │
│  │  Receive updates about video progress    │    │
│  │                                    [ON]  │    │
│  │                                          │    │
│  │  ─────────────────────────              │    │
│  │                                          │    │
│  │  Newsletter                              │    │
│  │  Weekly tips and feature updates         │    │
│  │                                    [OFF] │    │
│  │                                          │    │
│  │  ─────────────────────────              │    │
│  │                                          │    │
│  │  Promotional Emails                      │    │
│  │  Special offers and discounts            │    │
│  │                                    [OFF] │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

- **Settings Rows:** Flex justify-between, border-bottom spacing
- **Title:** md, semibold
- **Description:** sm, secondary text, mt-1
- **Toggle:** Right-aligned switch

---

### 15. My Voices Page (VIP)

**Layout Type:** Voice card grid  
**Max Width:** 4xl

#### Visual Components

**Voice Grid**
```
┌─────────────────────────────────────────────────┐
│  My Custom Voices (3/∞)                          │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │  + Record New Voice                      │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  ┌────────────────┐ ┌────────────────┐          │
│  │ 🎤             │ │ 🎤             │          │
│  │ Professional   │ │ Casual Voice   │          │
│  │ Voice          │ │                │          │
│  │                │ │                │          │
│  │ ▁▂▃▅▇▅▃▂▁     │ │ ▁▃▄▆▇▆▄▃▁     │          │
│  │                │ │                │          │
│  │ Created:       │ │ Created:       │          │
│  │ Jan 15, 2024   │ │ Jan 20, 2024   │          │
│  │                │ │                │          │
│  │ [▶ Play]       │ │ [▶ Play]       │          │
│  │ [🗑️ Delete]    │ │ [🗑️ Delete]    │          │
│  └────────────────┘ └────────────────┘          │
└─────────────────────────────────────────────────┘
```

- **Page Header:** xl, semibold, count display
- **Record Button:** Dashed border, full width, mb-6, purple text, large plus icon
- **Grid:** 2 columns (tablet+), 1 (mobile), gap-6
- **Voice Cards:** Themed background, rounded-xl, p-6, border
- **Icon:** 3xl, themed color, mb-3
- **Voice Name:** lg, semibold, mb-2
- **Waveform:** Visual representation, purple accent, mb-4
- **Metadata:** xs, muted text, mb-4
- **Action Buttons:** Small, full width, spaced, themed
- **Delete Confirmation:** Modal dialog

---

## 🎯 Common UI Patterns

### Header Component (Global)

```
┌─────────────────────────────────────────────────┐
│ [Logo]  [Home][Movies][My Videos][Voices][VIP]  │
│                           [🌙/☀️][🔔][Profile▼]│
└─────────────────────────────────────────────────┘
```

- **Fixed Position:** top-0, z-50
- **Background:** Transparent to blurred (scroll-based)
- **Logo:** Left-aligned, 116x36px
- **Navigation:** Centered, hidden on mobile (<xl), xl+:flex
- **Right Actions:** Flex space-x-4
  - **Theme Toggle:** Custom switch, 40x24px, animated
  - **Notification Bell:** Icon with badge count, red dot for unread
  - **Profile Dropdown:** Avatar (32px), chevron icon, hover dropdown

**Profile Dropdown Menu**
```
┌─────────────────────────────┐
│  Language Setting           │
│  ┌───┬───┬───┐              │
│  │汉│En│繁│              │
│  └───┴───┴───┘              │
│  ─────────────              │
│  [Mobile Nav Items]         │
│  ─────────────              │
│  👤 Profile                 │
│  🚪 Logout                  │
└─────────────────────────────┘
```

- **Dropdown:** Absolute right-0, mt-2, w-56, rounded-lg, shadow-lg
- **Language Toggle:** iPhone-style segmented control, sliding background
- **Mobile Nav:** Only visible on <xl screens, icon + text links
- **Menu Items:** Full width, hover background, icon + text

### Footer Component (Global)

```
┌─────────────────────────────────────────────────┐
│                                                   │
│  Movie Persona-AI                               │
│  AI-powered movie analysis video generator       │
│                                                   │
│  [About] [Terms] [Privacy] [Support]             │
│  [GitHub] [Twitter] [Discord]                    │
│                                                   │
│  © 2024 Movie Persona-AI. All rights reserved.  │
│                                                   │
└─────────────────────────────────────────────────┘
```

- **Background:** Themed, dark in both modes
- **Padding:** py-12, px-6
- **Layout:** Centered, max-w-7xl
- **Logo Section:** mb-8
- **Links:** Grid or flex, gap-4, muted text, hover accent
- **Social Icons:** Circular, ghost buttons
- **Copyright:** xs text, muted, mt-8, centered

### Modal/Dialog Pattern

```
┌─────────────────────────────────────────────────┐
│                                                   │
│  ┌─────────────────────────────────────┐        │
│  │ [✕]                                  │        │
│  │                                      │        │
│  │  Modal Title                         │        │
│  │  ────────────                       │        │
│  │                                      │        │
│  │  Modal content goes here...          │        │
│  │                                      │        │
│  │                                      │        │
│  │  [Cancel]          [Confirm]         │        │
│  │                                      │        │
│  └─────────────────────────────────────┘        │
│                                                   │
└─────────────────────────────────────────────────┘
```

- **Overlay:** Fixed full screen, black/50 background, blur
- **Dialog:** Centered, max-w-lg, themed background, rounded-2xl, shadow-2xl
- **Close Button:** Absolute top-4 right-4, ghost variant
- **Title:** 2xl, semibold, mb-6
- **Content:** Scrollable if needed, max-h-[70vh]
- **Actions:** Flex justify-end, gap-2, pt-6, border-top

### Toast Notification

```
┌─────────────────────────────────┐
│  ✅ Success!                     │
│  Your video has been generated   │
└─────────────────────────────────┘
```

- **Position:** Fixed bottom-4 right-4 (or top-4 for mobile)
- **Style:** Rounded-lg, shadow-xl, themed background
- **Icon:** Status colored (green/red/blue/yellow)
- **Animation:** Slide in from right, fade out after 5s
- **Max Width:** 384px
