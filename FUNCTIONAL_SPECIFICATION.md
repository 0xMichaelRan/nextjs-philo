# Movie Philosopher - Functional Specification

## Project Overview

**Application Name:** Movie Philosopher (电影哲学家)  
**Purpose:** AI-powered movie analysis video generator that creates personalized, narrated video essays analyzing films from various philosophical and critical perspectives.  
**Main User Flow:** Movie Selection → Analysis Template Selection → AI Content Generation → Voice Selection → Video Generation → Completed Videos  

### Core Features
- AI-driven movie analysis content generation
- Multi-language support (Chinese, English, Traditional Chinese) with real-time language switching
- Light/dark theme support with user preference persistence
- Custom voice recording and selection (VIP feature)
- Professional analysis template system
- Video generation with synchronized subtitles
- Two-tier membership system (Free and VIP)
- Real-time job queue monitoring

---

## Page Inventory & Navigation

### 1. Home Page (`/`)
**Purpose:** Landing page showcasing the application's simplified 5-step workflow for creating movie analysis videos

**Content:** 
- Hero video background with gradient overlay
- Interactive workflow presentation:
  1. Select a movie
  2. Choose analysis template
  3. Generate AI analysis content
  4. Select narration voice
  5. Generate and download video
- Scroll-based navigation (wheel, touch, keyboard)
- Progress indicators for each step
- "Start Creating" call-to-action button
- Links to blog and external resources

**User Actions:**
- Navigate through workflow steps using scroll/swipe/keyboard
- Click "Start Creating" to begin at movie selection
- Access login via social media buttons
- Switch language and theme from header

**Navigation:** Leads to `/movie-selection`, external blog link

---

### 2. Authentication Page (`/auth`)
**Purpose:** User login via Google or Facebook OAuth

**Content:**
- "Sign in with Google" button
- "Sign in with Facebook" button
- Welcome message and app benefits
- Terms of service and privacy policy links

**User Actions:**
- Click Google button to authenticate via Google OAuth
- Click Facebook button to authenticate via Facebook OAuth
- View terms and privacy policy

**Business Logic:**
- OAuth redirect flow for Google and Facebook
- Automatic account creation on first login
- Redirect to intended page after authentication
- Session token management

**Navigation:** Redirects back to previous page or `/movie-selection` after login

---

### 3. Movie Selection Page (`/movie-selection`)
**Purpose:** Browse and search for movies to analyze

**Content:**
- Search bar with intelligent suggestions
- Popular movies grid with posters and ratings
- Recent search history
- Recommended movie keywords
- Responsive grid layout for different screen sizes

**User Actions:**
- Search movies by title in any language
- Browse curated popular movies
- View recent searches
- Click movie cards to view details

**Business Logic:**
- Search history stored locally (max 5 items)
- Display movie posters, titles, ratings
- Empty state shows suggested searches

**Navigation:** Clicking a movie leads to `/movie/{movieId}`

---

### 4. Movie Detail Page (`/movie/{id}`)
**Purpose:** View movie information and begin analysis creation

**Content:**
- Movie poster and backdrop
- Title (in selected language), year, genres
- Director and cast information
- Plot synopsis
- Rating information
- "Create Analysis" button

**User Actions:**
- Review movie details
- Click "Create Analysis" to start workflow

**Business Logic:**
- Display localized movie information based on selected language
- Authentication required to proceed with analysis creation

**Navigation:** Leads to `/analysis-template/{movieId}`

---

### 5. Analysis Template Selection Page (`/analysis-template/{movieId}`)
**Purpose:** Choose an analysis style and perspective for the video

**Content:**
- Movie information header
- Template cards showing different analysis approaches:
  - Philosophical analysis
  - Historical context analysis  
  - Character study
  - Cinematography analysis
  - Thematic analysis
- Each template shows:
  - Template name and description
  - Sample content preview
  - Estimated video length
  - Complexity indicator

**User Actions:**
- Browse available analysis templates
- Read template descriptions and previews
- Select preferred template
- Proceed to AI generation

**Business Logic:**
- Templates vary by analysis depth and approach
- Some advanced templates restricted to VIP users
- Template selection determines AI generation parameters

**Navigation:** Proceeds to `/generate-analysis/{movieId}/{templateId}`

---

### 6. AI Analysis Generation Page (`/generate-analysis/{movieId}/{templateId}`)
**Purpose:** Generate AI analysis content for the selected movie and template

**Content:**
- Movie and template information summary
- Generation progress indicator
- AI processing status messages:
  - "Analyzing movie content..."
  - "Generating analysis framework..."
  - "Writing detailed analysis..."
  - "Finalizing content..."
- Generated analysis text display (after completion)
- Word count and estimated narration time
- "Regenerate" and "Proceed to Voice Selection" buttons

**User Actions:**
- Wait for AI content generation (30-90 seconds)
- Review generated analysis text
- Regenerate if unsatisfied with content
- Proceed to voice selection when satisfied

**Business Logic:**
- AI generates unique analysis based on movie and template
- Free users: limited regenerations
- VIP users: unlimited regenerations
- Analysis text stored for video generation

**Navigation:** Leads to `/voice-selection/{analysisJobId}`

---

### 7. Voice Selection Page (`/voice-selection/{analysisJobId}`)
**Purpose:** Choose a voice for narrating the analysis content

**Content:**
- Analysis summary (movie, template, content length)
- System voices section:
  - Professional male/female voices
  - Voice samples with playback controls
  - Language and accent indicators
- Custom voices section (VIP only):
  - User-recorded voices
  - Voice management options
  - "Record New Voice" button
- Selected voice indicator
- "Generate Video" button

**User Actions:**
- Listen to voice samples
- Select preferred voice
- Record new custom voice (VIP only)
- Manage existing custom voices (VIP only)
- Proceed to video generation

**Business Logic:**
- Free users: system voices only
- VIP users: system voices + custom voices
- Custom voice recording limited to VIP members
- Voice selection triggers video generation job

**Navigation:** Generates video job and redirects to `/job-queue`

---

### 8. Custom Voice Recording Page (`/custom-voice-record`)
**Purpose:** Record personal voice for video narration (VIP feature)

**Content:**
- Sample text to read for voice training
- Recording interface with timer
- Play/pause/stop controls
- Recording preview playback
- Voice name input field
- Save and cancel buttons

**User Actions:**
- Read sample text aloud while recording
- Monitor recording timer (20-second limit)
- Preview recorded audio
- Re-record if unsatisfied
- Name and save voice

**Business Logic:**
- VIP membership required
- 20-second maximum recording length
- Audio quality validation
- Voice name uniqueness check

**Navigation:** Returns to `/voice-selection` or `/my-voices` after saving

---

### 9. Job Queue Page (`/job-queue`)
**Purpose:** Monitor video generation progress

**Content:**
- Active jobs list with:
  - Movie title and thumbnail
  - Analysis template type
  - Voice selection
  - Status indicator (queued/processing/completed/failed)
  - Progress percentage
  - Estimated time remaining
- Completed jobs section
- Filter options (all/processing/completed/failed)

**User Actions:**
- Monitor real-time job progress
- View queue position
- Filter jobs by status
- Click completed jobs to view video
- Cancel pending jobs

**Business Logic:**
- Real-time status updates
- Jobs progress through: queued → processing → completed
- Failed jobs show error information
- VIP users get priority processing

**Navigation:** Clicking completed job leads to `/video/{videoId}`

---

### 10. My Videos Page (`/my-videos`)
**Purpose:** View and manage all generated videos

**Content:**
- Videos organized by time (Today, Yesterday, This Week, etc.)
- Video cards showing:
  - Movie thumbnail
  - Movie title
  - Analysis type
  - Video duration
  - Creation date
  - Download button
- Search and filter options
- Pagination for large collections

**User Actions:**
- Browse videos by time period
- Search videos by movie name
- Play videos inline
- Download videos
- Delete videos

**Business Logic:**
- Time-grouped organization for easy browsing
- Videos persist indefinitely
- Subtitles downloadable separately
- 12 videos per page with pagination

**Navigation:** Clicking video opens `/video/{videoId}`

---

### 11. Profile Page (`/profile`)
**Purpose:** Manage account settings and view user information

**Content:**
- User information:
  - Name and email (from Google/Facebook)
  - Profile picture
  - Account creation date
- Membership status (Free or VIP)
  - VIP expiration date (if applicable)
  - "Upgrade to VIP" button (for free users)
- Usage statistics:
  - Total videos generated
  - Total custom voices (VIP only)
- Preferences:
  - Language selection
  - Theme selection (light/dark)
- Account actions:
  - Logout button

**User Actions:**
- View account information
- Check membership status
- Review usage statistics
- Change language preference
- Toggle theme preference
- Upgrade to VIP
- Logout

**Business Logic:**
- Display OAuth account information
- Show VIP status and benefits
- Track usage across user session
- Preference changes apply immediately

**Navigation:** "Upgrade to VIP" leads to `/vip-upgrade`

---

### 12. VIP Upgrade Page (`/vip-upgrade`)
**Purpose:** Purchase VIP membership

**Content:**
- Feature comparison table:
  - Free vs VIP features side-by-side
- VIP benefits highlighted:
  - Unlimited video generations
  - Custom voice recording
  - Advanced analysis templates
  - Priority processing
- Pricing options:
  - Monthly subscription
  - Annual subscription (with discount)
- Payment method selection
- "Subscribe Now" button
- Terms and cancellation policy

**User Actions:**
- Compare free vs VIP features
- Select subscription duration
- Choose payment method
- Complete purchase

**Business Logic:**
- Annual plan shows savings percentage
- Immediate VIP activation upon payment
- Clear pricing with no hidden fees

**Navigation:** After payment, returns to `/profile` with VIP activated

---

### 13. My Voices Page (`/my-voices`)
**Purpose:** Manage custom voice library (VIP feature)

**Content:**
- Custom voices grid showing:
  - Voice name
  - Voice sample waveform
  - Creation date
  - Playback control
  - Delete button
- "Record New Voice" button
- VIP-only feature indicator for free users

**User Actions:**
- Play voice samples
- Delete existing voices
- Navigate to voice recording page

**Business Logic:**
- VIP feature - free users see upgrade prompt
- No limit on number of custom voices for VIP
- Voice deletion requires confirmation

**Navigation:** "Record New Voice" leads to `/custom-voice-record`

---

### 14. Video Detail Page (`/video/{videoId}`)
**Purpose:** Play and interact with generated video

**Content:**
- Video player with:
  - Play/pause controls
  - Timeline scrubber
  - Volume control
  - Fullscreen option
  - Subtitle toggle
- Video information:
  - Movie title
  - Analysis type
  - Generation date
  - Duration
- Action buttons:
  - Download video
  - Download subtitles
  - Share (future feature)
  - Regenerate with different settings

**User Actions:**
- Watch generated video
- Control playback
- Toggle subtitles on/off
- Download video file
- Download subtitle file
- Create new version with different template/voice

**Business Logic:**
- Video streams from CDN
- Subtitles synchronized with audio
- Download generates downloadable file link

**Navigation:** "Regenerate" returns to movie detail page with same movie

---

## Component Inventory

### Layout Components

**AppLayout (`components/app-layout.tsx`)**
- **Purpose:** Main application wrapper with header/footer
- **Props:** `children: React.ReactNode`
- **Functionality:** Theme-aware layout container
- **Usage:** Wraps all authenticated pages

**Header (`components/layout/Header.tsx`)**
- **Purpose:** Top navigation bar
- **Functionality:** User menu, theme toggle, language switcher, notifications
- **Features:** VIP status display, usage statistics, logout functionality

**GlobalFooter (`components/global-footer.tsx`)**
- **Purpose:** Application footer with links
- **Functionality:** Static footer content and external links

**MobileBottomBar (`components/mobile-bottom-bar.tsx`)**
- **Purpose:** Fixed bottom bar for mobile navigation
- **Props:** `children: React.ReactNode`
- **Usage:** Mobile-specific navigation actions

### Navigation Components

**BottomNavigation (`components/bottom-navigation.tsx`)**
- **Purpose:** Desktop bottom navigation for multi-step flows
- **Props:** `onBack`, `onNext`, `nextLabel`, `nextDisabled`
- **Functionality:** Step navigation with customizable actions

**MovieHeader (`components/movie-header.tsx`)**
- **Purpose:** Movie-specific header information
- **Functionality:** Display movie details in context

### Media Components

**VideoPlayer (`components/video-player.tsx`)**
- **Purpose:** Custom video playback with subtitles
- **Features:** Subtitle display, playback controls, full-screen support
- **Props:** Video URL, subtitle data, playback options

**VoiceAudioPlayer (`components/voice-audio-player.tsx`)**
- **Purpose:** Voice sample playback controls
- **Functionality:** Play/pause voice samples with waveform display

**SubtitleDisplay (`components/subtitle-display.tsx`)**
- **Purpose:** Real-time subtitle rendering during video playback
- **Features:** Synchronized subtitle display with timing

**CurrentSentenceDisplay (`components/current-sentence-display.tsx`)**
- **Purpose:** Highlight current sentence in analysis text
- **Functionality:** Text synchronization with audio/video playback

### Interactive Components

**VipUpgradeModal (`components/vip-upgrade-modal.tsx`)**
- **Purpose:** VIP subscription promotion modal
- **Functionality:** Plan selection and purchase initiation
- **Triggers:** Feature restrictions, usage limits

**UpgradeVipCard (`components/upgrade-vip-card.tsx`)**
- **Purpose:** VIP upgrade promotional card
- **Features:** Plan comparison, pricing display

**VipBadge (`components/vip-badge.tsx`)**
- **Purpose:** Display membership status
- **Variants:** Free user badge, VIP badge with expiration date

**CustomerSupportCard (`components/customer-support-card.tsx`)**
- **Purpose:** Help and support access
- **Functionality:** Contact information and support links

**NotificationBell (`components/notification-bell.tsx`)**
- **Purpose:** Notification indicator and access
- **Features:** Unread count, dropdown list, real-time updates

### Utility Components

**FlowCleanupWrapper (`components/flow-cleanup-wrapper.tsx`)**
- **Purpose:** Automatic flow state cleanup on route changes
- **Functionality:** Prevents state leakage between sessions

**UI Components (`components/ui/`)**
- Complete shadcn/ui component library including:
  - Form controls (Button, Input, Select, Checkbox, etc.)
  - Layout components (Card, Dialog, Sheet, etc.)
  - Feedback components (Toast, Alert, Progress, etc.)
  - Navigation components (Tabs, Breadcrumb, Pagination)
  - Display components (Avatar, Badge, Calendar, etc.)

---

## Business Logic & Workflows

### Authentication Flow

**OAuth Login Process:**
1. User clicks "Sign in with Google" or "Sign in with Facebook"
2. Redirects to OAuth provider (Google/Facebook)
3. User authorizes application access
4. OAuth provider returns user information
5. System creates account automatically if first login
6. Session established and user redirected to intended page

**Session Management:**
- OAuth tokens stored securely
- User information cached for quick access
- Automatic session refresh
- Logout clears all session data

---

### Movie Analysis Creation Workflow

**Workflow Overview:**
Movie Selection → Template Selection → AI Content Generation → Voice Selection → Video Generation → Completed Video

**Step 1: Movie Selection**
- Browse popular movies or search by title
- Movies displayed with poster, title, rating
- Recent searches stored locally
- Click movie to view details

**Step 2: Template Selection**
- View available analysis templates
- Each template has unique perspective (philosophical, character-based, etc.)
- Advanced templates require VIP membership
- Select template to proceed

**Step 3: AI Content Generation**
- AI generates unique analysis text (30-90 seconds)
- Display progress indicator with status messages
- Show generated content with word count
- Allow regeneration (limited for free users, unlimited for VIP)
- Proceed when satisfied with content

**Step 4: Voice Selection**
- Choose from system voices (all users)
- Or use custom voices (VIP only)
- Play voice samples before selection
- Confirm voice to trigger video generation

**Step 5: Video Generation**
- Job enters processing queue
- Real-time status updates
- VIP users get priority processing
- Notification when complete

**Step 6: Watch and Download**
- Play generated video with subtitles
- Download video file
- Download subtitle file separately
- Option to regenerate with different settings

---

### VIP Membership System

**Two-Tier System:**

**Free Users:**
- Limited video generations per month
- System voices only
- Basic analysis templates
- Standard video quality
- Standard queue processing

**VIP Users:**
- Unlimited video generations
- System voices + custom voice recording
- All analysis templates (basic + advanced)
- HD video quality
- Priority queue processing
- Unlimited AI content regenerations

**VIP Subscription:**
- Monthly or annual plans
- Annual plan includes discount
- Immediate activation after payment
- Automatic renewal unless cancelled
- Benefits active until expiration

---

### Custom Voice Recording (VIP Feature)

**Recording Process:**
1. Access custom voice recording page
2. Read provided sample text
3. Record audio (maximum 20 seconds)
4. Preview recording
5. Re-record if unsatisfied
6. Name and save voice
7. Voice available immediately for use

**Voice Management:**
- Unlimited custom voices for VIP users
- Play samples anytime
- Delete voices when no longer needed
- Use across all video generations

---

### Video Generation Queue

**Job Status Flow:**
1. **Queued** - Waiting for processing
2. **Processing** - AI generating analysis and rendering video
3. **Completed** - Video ready for viewing/download
4. **Failed** - Error occurred (with explanation)

**Queue Management:**
- Jobs processed in order (FIFO)
- VIP jobs get priority
- Estimated time shown for each job
- Cancel option for queued jobs
- Real-time status updates

---

### Multi-Language Support

**Supported Languages:**
- Chinese (Simplified)
- English
- Traditional Chinese

**Language Switching:**
- User can change language anytime from header
- Preference saved and persists across sessions
- All UI text updates immediately
- Movie data displays in selected language when available

---

### Theme Support

**Available Themes:**
- Light mode
- Dark mode

**Theme Switching:**
- Toggle from header or profile page
- Preference saved and persists
- Smooth transition between themes
- All pages support both themes

---

This functional specification provides a complete blueprint for designing the Movie Philosopher application. The specification focuses on functionality, user workflows, and business logic rather than visual design or technical implementation details, enabling design teams to create appropriate UI/UX while maintaining the application's core capabilities and user experience.
