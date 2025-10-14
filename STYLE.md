# Theme Configuration Guide

This document explains how to customize the color theme for the application based on the working implementation in `app/video-generation/page.tsx` and `app/video-generation/[job_id]/page.tsx`.

## Quick Start

All theme colors are defined in `app/globals.css`. To change the color scheme, simply modify the CSS custom properties in the theme sections.

## Theme Structure

### Light Theme Colors

```css
[data-theme='light'] {
  /* Primary Brand Colors - Change these to customize your brand */
  --brand-primary: #6366f1; /* Main brand color (indigo) */
  --brand-secondary: #8b5cf6; /* Secondary brand color (violet) */
  --brand-accent: #06b6d4; /* Accent color (cyan) */

  /* Background Colors */
  --bg-primary: #ffffff; /* Main background */
  --bg-secondary: #f8fafc; /* Secondary background */
  --bg-elevated: #ffffff; /* Cards, modals */

  /* Text Colors */
  --text-primary: #1e293b; /* Main text */
  --text-secondary: #64748b; /* Secondary text */
  --text-muted: #94a3b8; /* Muted text */

  /* Status Colors */
  --status-success: #10b981; /* Success green */
  --status-warning: #f59e0b; /* Warning amber */
  --status-error: #ef4444; /* Error red */
  --status-info: #3b82f6; /* Info blue */
}
```

### Dark Theme Colors (Professional Dark Theme)

```css
[data-theme='dark'] {
  /* Primary Brand Colors - Consistent with light theme */
  --brand-primary: #6366f1; /* Indigo - same as light */
  --brand-secondary: #8b5cf6; /* Violet - same as light */
  --brand-accent: #06b6d4; /* Cyan - same as light */

  /* Background Colors - Much darker for professional look */
  --bg-primary: #0a0a0a; /* Very dark background */
  --bg-secondary: #1a1a1a; /* Slightly lighter dark */
  --bg-elevated: #2a2a2a; /* Cards, modals - darker */

  /* Text Colors - High contrast for readability */
  --text-primary: #ffffff; /* Pure white for main text */
  --text-secondary: #e5e5e5; /* Light gray for secondary text */
  --text-muted: #a3a3a3; /* Medium gray for muted text */

  /* Status Colors - Adjusted for dark theme */
  --status-success: #22c55e; /* Green */
  --status-warning: #f59e0b; /* Amber */
  --status-error: #ef4444; /* Red */
  --status-info: #3b82f6; /* Blue */
}
```

## Design Principles

### Dark Theme Philosophy

The dark theme uses a **professional, high-contrast approach**:

- **Very dark backgrounds** (#0a0a0a) for reduced eye strain
- **Pure white text** (#ffffff) for maximum readability
- **Consistent brand colors** between light and dark themes
- **No water-floating animations** - only subtle gradient effects
- **No glow effects** - clean, professional appearance

### Button Design

- **Primary buttons**: Use gradient backgrounds with white text for optimal contrast
- **Secondary buttons**: Use elevated backgrounds with theme-aware text
- **Hover effects**: Subtle transform and shadow effects, no excessive animations

### Typography

- **Primary text**: Always high contrast (dark on light, white on dark)
- **Secondary text**: Slightly muted but still readable
- **Muted text**: Used sparingly for less important information

## Standard Theme Implementation

### Standard Theme Utility

**IMPORTANT**: Always use the standard theme utility instead of custom getThemeClasses functions.

```typescript
import { getStandardThemeClasses } from '@/lib/theme-utils';

// In your component:
const themeClasses = getStandardThemeClasses(theme);
```

This utility returns a standardized object with all theme classes:
- `background`: Standard gradient background
- `text`: Primary text color
- `secondaryText`: Secondary text color
- `mutedText`: Muted text color
- `card`: Card styling with proper borders
- `cardHover`: Card hover effects
- `button`: Primary button styling
- `outlineButton`: Secondary button styling
- `accent`: Brand accent color
- `error`, `success`, `warning`, `info`: Status colors
- `input`, `select`: Form element styling

### Legacy getThemeClasses Pattern (Deprecated)

⚠️ **DO NOT USE** - This pattern is deprecated. Use `getStandardThemeClasses` instead.

The old pattern created inconsistent gradients and styling across pages.

### Standard Container Layout

**IMPORTANT**: Use this standard container pattern for all pages:

```typescript
<AppLayout title={t("page.title")}>
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
    {/* Page content here */}
  </div>
</AppLayout>
```

**DO NOT USE** the old Bootstrap-style pattern:
```typescript
// ❌ Deprecated - Do not use
<div className="container px-3 px-md-4 px-lg-3">
  <div className="flex flex-wrap -mx-4">
    <div className="hidden xl:block xl:w-1/12 px-4" />
    <div className="w-full xl:w-10/12 lg:w-full px-4">
      <div className="px-3 md:px-0 py-8">
        {/* Content */}
      </div>
    </div>
  </div>
</div>
```

### Form Elements Styling

- **Select components**: Use `themeClasses.select` for triggers and `themeClasses.card` for content
- **Input fields**: Use `themeClasses.input` for proper text and background colors
- **Textareas**: Use `themeClasses.input` for consistency
- **Dropdown items**: Add hover states with `hover:bg-gray-100 dark:hover:bg-gray-800`

## Available Utility Classes

### Background Classes

- `.theme-bg-primary` - Main background color
- `.theme-bg-secondary` - Secondary background color
- `.theme-bg-elevated` - Elevated surfaces (cards, modals) with blur effect

### Text Classes

- `.theme-text-primary` - Main text color
- `.theme-text-secondary` - Secondary text color
- `.theme-text-muted` - Muted text color

### Brand Color Classes

- `.theme-brand-primary` - Primary brand color
- `.theme-brand-secondary` - Secondary brand color
- `.theme-brand-accent` - Accent brand color

### Status Color Classes

- `.theme-status-success` - Success color
- `.theme-status-warning` - Warning color
- `.theme-status-error` - Error color
- `.theme-status-info` - Info color

### Button Classes

- `.theme-button-primary` - Primary button styling with gradient
- `.theme-button-secondary` - Secondary button styling

### Gradient Classes

- `.theme-gradient-hero` - Hero section gradient
- `.theme-surface-elevated` - Elevated surface with backdrop blur

## How to Change Colors

### Step 1: Choose Your Color Palette

Decide on your primary brand colors. You can use tools like:

- [Coolors.co](https://coolors.co/) for color palette generation
- [Adobe Color](https://color.adobe.com/) for color harmony
- [Material Design Color Tool](https://material.io/resources/color/) for accessibility

### Step 2: Update the CSS Variables

Edit `app/globals.css` and modify the color values in both light and dark theme sections:

```css
[data-theme='light'] {
  --brand-primary: #your-new-color;
  --brand-secondary: #your-secondary-color;
  --brand-accent: #your-accent-color;
}

[data-theme='dark'] {
  /* Keep the same colors as light theme for consistency */
  --brand-primary: #your-new-color;
  --brand-secondary: #your-secondary-color;
  --brand-accent: #your-accent-color;
}
```

### Step 3: Test Your Changes

1. Save your changes to `app/globals.css`
2. The development server will automatically reload
3. Test both light and dark themes using the theme toggle
4. Check all pages for consistency
5. Verify accessibility with contrast checking tools

## Common Color Schemes

### Blue Theme

```css
--brand-primary: #3b82f6; /* Blue */
--brand-secondary: #1d4ed8; /* Darker blue */
--brand-accent: #06b6d4; /* Cyan */
```

### Green Theme

```css
--brand-primary: #10b981; /* Emerald */
--brand-secondary: #059669; /* Darker emerald */
--brand-accent: #06b6d4; /* Cyan */
```

### Purple Theme

```css
--brand-primary: #8b5cf6; /* Violet */
--brand-secondary: #7c3aed; /* Darker violet */
--brand-accent: #06b6d4; /* Cyan */
```

## Need Help?

If you encounter issues with theme implementation:

1. Check the working examples in `app/video-generation/page.tsx` and `app/video-generation/[job_id]/page.tsx`
2. Ensure you're using the `getThemeClasses()` pattern consistently
3. Verify that all form elements use the appropriate theme classes
4. Test in both light and dark modes
