/**
 * Theme utilities for Chrome Extension components
 * Provides consistent styling and theme management across all extension parts
 */

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderColor: string;
  borderFocus: string;
}

/**
 * Get current theme colors from CSS custom properties
 */
export const getThemeColors = (): ThemeColors => {
  const computedStyle = getComputedStyle(document.documentElement);

  return {
    primary: computedStyle.getPropertyValue("--primary-color").trim(),
    primaryLight: computedStyle.getPropertyValue("--primary-light").trim(),
    primaryDark: computedStyle.getPropertyValue("--primary-dark").trim(),
    secondary: computedStyle.getPropertyValue("--secondary-color").trim(),
    secondaryLight: computedStyle.getPropertyValue("--secondary-light").trim(),
    secondaryDark: computedStyle.getPropertyValue("--secondary-dark").trim(),
    accent: computedStyle.getPropertyValue("--accent-color").trim(),
    accentLight: computedStyle.getPropertyValue("--accent-light").trim(),
    accentDark: computedStyle.getPropertyValue("--accent-dark").trim(),
    backgroundPrimary: computedStyle
      .getPropertyValue("--background-primary")
      .trim(),
    backgroundSecondary: computedStyle
      .getPropertyValue("--background-secondary")
      .trim(),
    backgroundTertiary: computedStyle
      .getPropertyValue("--background-tertiary")
      .trim(),
    textPrimary: computedStyle.getPropertyValue("--text-primary").trim(),
    textSecondary: computedStyle.getPropertyValue("--text-secondary").trim(),
    textMuted: computedStyle.getPropertyValue("--text-muted").trim(),
    borderColor: computedStyle.getPropertyValue("--border-color").trim(),
    borderFocus: computedStyle.getPropertyValue("--border-focus").trim(),
  };
};

/**
 * Check if dark mode is currently active
 */
export const isDarkMode = (): boolean => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

/**
 * Listen for theme changes
 */
export const watchThemeChanges = (
  callback: (isDark: boolean) => void
): (() => void) => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handler = (event: MediaQueryListEvent) => {
    callback(event.matches);
  };

  mediaQuery.addEventListener("change", handler);

  // Return cleanup function
  return () => {
    mediaQuery.removeEventListener("change", handler);
  };
};

/**
 * Common CSS classes for consistent styling
 */
export const themeClasses = {
  // Buttons
  button: {
    primary: "theme-button",
    secondary: "theme-button secondary",
  },

  // Inputs
  input: "theme-input",

  // Cards and containers
  card: "theme-card",

  // Typography
  header: "theme-header",
  text: "theme-text",

  // Layout
  divider: "theme-divider",

  // Badges
  badge: {
    primary: "theme-badge",
    secondary: "theme-badge secondary",
  },

  // Animations
  animations: {
    fadeIn: "fade-in",
    slideIn: "slide-in",
  },

  // Tailwind utility combinations
  container:
    "bg-background-primary text-text-primary border border-border rounded-theme-lg p-4 shadow-theme-sm",
  buttonPrimary:
    "bg-secondary text-white hover:bg-secondary-dark px-4 py-2 rounded-theme-md font-medium transition-fast shadow-theme-sm hover:shadow-theme-md",
  buttonSecondary:
    "bg-background-secondary text-text-primary hover:bg-background-tertiary border border-border px-4 py-2 rounded-theme-md font-medium transition-fast",
  inputField:
    "bg-background-primary text-text-primary border border-border rounded-theme-md px-3 py-2 focus:border-border-focus focus:ring-2 focus:ring-secondary/20 transition-fast",
} as const;

/**
 * Extension-specific theme constants
 */
export const extensionTheme = {
  // Common dimensions for extension UI
  popup: {
    minWidth: "300px",
    maxWidth: "450px",
    minHeight: "auto",
    maxHeight: "500px",
  },

  options: {
    maxWidth: "800px",
    padding: "1rem",
  },

  sidepanel: {
    width: "320px",
    minHeight: "100vh",
  },

  // Common spacing
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },

  // Component sizing
  components: {
    buttonHeight: "2.5rem",
    inputHeight: "2.5rem",
    iconSize: "1.25rem",
  },
} as const;

/**
 * Apply theme to a specific component
 */
export const applyComponentTheme = (
  componentType: "popup" | "options" | "sidepanel" | "offscreen"
) => {
  const body = document.body;

  // Remove any existing component theme classes
  body.classList.remove(
    "popup-theme",
    "options-theme",
    "sidepanel-theme",
    "offscreen-theme"
  );

  // Add the specific component theme
  body.classList.add(`${componentType}-theme`);

  // Reset any previous inline styles
  body.style.width = "";
  body.style.height = "";
  body.style.minWidth = "";
  body.style.maxWidth = "";
  body.style.minHeight = "";
  body.style.maxHeight = "";
  body.style.padding = "";
  body.style.margin = "";

  // Apply component-specific styles
  switch (componentType) {
    case "popup":
      body.style.width = "fit-content";
      body.style.height = "fit-content";
      body.style.minWidth = extensionTheme.popup.minWidth;
      body.style.maxWidth = extensionTheme.popup.maxWidth;
      break;

    case "options":
      body.style.maxWidth = extensionTheme.options.maxWidth;
      body.style.margin = "0 auto";
      body.style.height = "auto";
      body.style.minHeight = "fit-content";
      body.style.padding = extensionTheme.options.padding;
      break;

    case "sidepanel":
      body.style.width = extensionTheme.sidepanel.width;
      body.style.height = "100vh";
      body.style.overflow = "hidden";
      break;

    case "offscreen":
      // Offscreen documents are hidden, minimal styling needed
      body.style.display = "none";
      break;
  }
};
