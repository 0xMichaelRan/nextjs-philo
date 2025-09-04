---
type: "manual"
---

# Augment Guidelines - Frontend (Next.js)

**Rule Type**: Always
**Description**: Core development guidelines for the Philo frontend application

## Project Overview
This is the frontend of an AI-powered movie analysis video generation platform built with Next.js, TypeScript, and Tailwind CSS.

## Development Setup
```bash
cd nextjs-philo && npm run dev
```
Frontend runs on port 3000 with hot reload enabled.

## Architecture & Patterns

### Tech Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API + Zustand (preferred for complex state)

### Key Contexts
- `LanguageContext` - Bilingual support (zh/en) with translations
- `ThemeContext` - Light/dark mode switching
- `AuthContext` - User authentication and VIP status with auto-refresh

### File Structure
```
app/
├── (pages)/           # App router pages
├── components/        # Reusable components
├── contexts/          # React contexts
├── lib/              # Utilities
├── hooks/            # Custom hooks
└── globals.css       # Global styles
```

### Component Patterns
1. **Theme-aware components**: Use `useTheme()` hook and conditional classes
2. **Bilingual support**: Use `useLanguage()` hook and `t()` function
3. **shadcn/ui**: Prefer shadcn components over custom UI elements
4. **Responsive design**: Mobile-first approach with Tailwind

### Key Features to Maintain
- **Multi-language**: All text must support Chinese and English
- **Theme switching**: Components must work in light/dark modes
- **VIP features**: Proper VIP/SVIP gating for premium features
- **Unified Voice System**: System voices (default) + custom voices (VIP feature)
- **Real-time updates**: Server-Sent Events (SSE) for instant job status and notifications
- **Video playback**: Completed videos served from backend with proper authentication
- **Phone number authentication**: Primary auth method with verification codes
- **Password reset**: Phone-based password reset with verification
- **Token auto-refresh**: Automatic token refresh to prevent logout

### Development Guidelines
1. Always test both language modes (zh/en)
2. Verify theme switching works correctly
3. Ensure VIP features are properly gated
4. Use TypeScript strictly - no `any` types
5. Follow existing naming conventions for translations keys
6. Test responsive design on mobile devices
7. Prefer Zustand + localStorage over React Context for complex state
8. Only clear flowState when selecting new movie (not on every navigation)
9. Redirect to auth page on 401 errors then return to previous page
10. Use SSE for real-time updates instead of HTTP polling
11. Filter completed jobs from job-pending page (show in video-generation instead)
12. Use resolution selection with VIP restrictions (480p free, 720p/1080p VIP)

### API Integration
- **Backend API**: `localhost:8009` (main API)
- Use proper error handling for API calls
- Implement loading states for async operations
- Handle authentication tokens properly
- Use `apiConfig.makeAuthenticatedRequest()` for authenticated calls
- Implement automatic token refresh on 401 errors

### Voice System API Usage
- **System Voices**: Use `apiConfig.voices.system(language)` for default voices
- **Custom Voices**: Use `apiConfig.voices.custom(language, userId)` for user voices
- **Voice Selection**: Use `voice_code` consistently for voice identification
- **Audio Paths**: Construct paths as `/static/new_voices/{voice_file}` for system voices
- **Custom Audio Paths**: Use `/static/new_voices/uid{user_id}/{voice_file}` for custom voices
- **Legacy Support**: Old API methods show deprecation warnings but still work

### Common Patterns
```typescript
// Theme usage
const { theme } = useTheme()
const themeClasses = theme === 'light' ? 'bg-white text-black' : 'bg-gray-900 text-white'

// Language usage  
const { language, t } = useLanguage()
const text = language === 'zh' ? '中文文本' : 'English text'
// Or use translation keys
const text = t('nav.home')

// VIP checking
const { user } = useAuth()
const isVip = user?.is_vip

// SSE real-time updates
const { onJobUpdate, onNotificationUpdate } = useRealtimeNotifications()

useEffect(() => {
  const unsubscribe = onJobUpdate((data) => {
    // Handle job status updates
    console.log('Job update:', data)
  })
  return unsubscribe
}, [onJobUpdate])

// Auto-refresh authentication
const { refreshToken } = useAuth()
useEffect(() => {
  // Auto-refresh every 4 hours (token expires in 8 hours)
  const interval = setInterval(refreshToken, 4 * 60 * 60 * 1000)
  return () => clearInterval(interval)
}, [refreshToken])
```

### Movie Title Handling
- Use `getMovieTitle()` utility from `lib/movie-utils.ts`
- Supports fallback logic: movie_title_json → title → original_title
- Language-aware title selection (zh/en)
- Consistent across all components

### Video Handling
- Use `VideoPlayer` component for consistent playback
- Support both streaming and download URLs
- Implement proper error handling and loading states
- Add poster images and controls

### Time-based Grouping
- Group videos by "Today", "Yesterday", "X days ago"
- Use `getTimeBasedGroups()` utility
- Consistent date formatting across languages

### Authentication Flow
```typescript
// Login with auto-refresh setup
const login = async (phone: string, password: string) => {
  const success = await authLogin(phone, password)
  if (success) {
    startAutoRefresh() // Start 4-hour refresh cycle
  }
  return success
}

// Handle 401 errors with refresh attempt
const handleApiError = async (response: Response) => {
  if (response.status === 401) {
    const refreshSuccess = await refreshToken()
    if (!refreshSuccess) {
      logout() // Only logout if refresh fails
    }
  }
}
```

### Error Handling
- Show user-friendly error messages in both languages
- Log errors for debugging
- Implement retry mechanisms for network failures
- Handle authentication errors gracefully

### Performance Optimization
- Use React.memo for expensive components
- Implement proper loading states
- Optimize images with Next.js Image component
- Use Suspense for code splitting
- Cache API responses appropriately

### Accessibility
- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers
- Maintain proper color contrast ratios

### Testing Considerations
- Test both language modes
- Verify theme switching
- Test VIP feature gating
- Mock API calls properly
- Test responsive design
- Verify authentication flows
