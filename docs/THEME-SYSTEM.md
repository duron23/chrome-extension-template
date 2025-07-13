# Extension Theme System

This Chrome extension template includes a comprehensive theme system that provides consistent styling across all extension components (popup, options, sidepanel, and offscreen).

## Features

### 🎨 **Unified Design System**
- **CSS Custom Properties**: Theme variables for colors, spacing, shadows, and transitions
- **Dark Mode Support**: Automatic adaptation to system theme preferences
- **Consistent Typography**: Standardized text styles across components
- **Component-Specific Theming**: Optimized layouts for different extension parts

### 🔧 **Theme Configuration**

The theme is defined in `src/index.html` and provides:

#### Color Palette
```css
--primary-color: #1f2937    /* Main brand color */
--secondary-color: #3b82f6  /* Accent/action color */
--accent-color: #10b981     /* Success/highlight color */
--background-primary: #ffffff   /* Main background */
--text-primary: #111827     /* Primary text */
```

#### Component Dimensions
- **Popup**: 320px-400px width, 200px-600px height
- **Options**: 800px max width, centered layout
- **Sidepanel**: 320px width, full height
- **Offscreen**: Hidden by default

### 📱 **Component Usage**

#### 1. Import Theme Utilities
```tsx
import { applyComponentTheme, themeClasses } from "../utils/theme";
```

#### 2. Apply Component Theme
```tsx
useEffect(() => {
  applyComponentTheme('popup'); // or 'options', 'sidepanel', 'offscreen'
}, []);
```

#### 3. Use Theme Classes
```tsx
// Pre-defined component classes
<button className={themeClasses.buttonPrimary}>Primary Button</button>
<input className={themeClasses.inputField} />
<div className={themeClasses.card}>Card Content</div>

// Tailwind classes with theme variables
<div className="bg-background-primary text-text-primary border border-border">
  Content
</div>
```

### 🎭 **Available Theme Classes**

#### Buttons
- `themeClasses.buttonPrimary` - Blue primary action button
- `themeClasses.buttonSecondary` - Secondary outline button

#### Form Elements
- `themeClasses.input` - Basic input styling (CSS class)
- `themeClasses.inputField` - Enhanced input with Tailwind (Tailwind classes)

#### Layout
- `themeClasses.container` - Standard container with padding and border
- `themeClasses.card` - Card component with shadow and border
- `themeClasses.divider` - Horizontal divider line

#### Typography
- `themeClasses.header` - Section headers
- `themeClasses.text` - Body text

#### Badges
- `themeClasses.badge.primary` - Primary badge
- `themeClasses.badge.secondary` - Secondary badge

#### Animations
- `themeClasses.animations.fadeIn` - Fade in animation
- `themeClasses.animations.slideIn` - Slide in animation

### 🌙 **Dark Mode Support**

The theme automatically adapts to system preferences:

```tsx
import { isDarkMode, watchThemeChanges } from "../utils/theme";

// Check current theme
const darkModeActive = isDarkMode();

// Listen for theme changes
useEffect(() => {
  const cleanup = watchThemeChanges((isDark) => {
    console.log('Theme changed to:', isDark ? 'dark' : 'light');
  });
  
  return cleanup;
}, []);
```

### 🎨 **Customizing the Theme**

#### 1. Modify CSS Variables in `src/index.html`
```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
  /* ... other variables */
}
```

#### 2. Extend Tailwind Config in `tailwind.config.js`
```javascript
theme: {
  extend: {
    colors: {
      brand: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
      }
    }
  }
}
```

#### 3. Add Custom Theme Classes in `src/utils/theme.ts`
```typescript
export const customThemeClasses = {
  myButton: 'bg-brand-primary text-white px-4 py-2 rounded',
  myCard: 'bg-background-secondary p-6 shadow-lg',
};
```

### 🔍 **Theme Utilities**

#### Get Current Theme Colors
```tsx
import { getThemeColors } from "../utils/theme";

const colors = getThemeColors();
console.log(colors.primary); // Current primary color value
```

#### Component-Specific Styling
```tsx
import { extensionTheme } from "../utils/theme";

// Access component dimensions
const popupWidth = extensionTheme.popup.minWidth;
const optionsMaxWidth = extensionTheme.options.maxWidth;
```

### 📏 **Responsive Design**

The theme includes responsive breakpoints and utilities:

```tsx
// Mobile-first responsive design
<div className="w-full md:w-1/2 lg:w-1/3">
  Responsive content
</div>

// Theme-aware spacing
<div className="p-4 md:p-6 lg:p-8">
  Responsive padding
</div>
```

### ✨ **Best Practices**

1. **Always use theme variables** instead of hardcoded colors
2. **Apply component themes** in useEffect hooks
3. **Use consistent spacing** from the theme system
4. **Test in both light and dark modes**
5. **Leverage theme classes** for common UI patterns
6. **Keep animations subtle** using theme transition values

### 🔧 **Development Tools**

The theme system includes development helpers:

```tsx
// Debug current theme state
console.log('Current theme:', getThemeColors());
console.log('Dark mode:', isDarkMode());

// Test theme changes
document.documentElement.style.setProperty('--primary-color', '#ff0000');
```

This theme system ensures your Chrome extension has a professional, consistent, and accessible user interface across all components while providing flexibility for customization.
