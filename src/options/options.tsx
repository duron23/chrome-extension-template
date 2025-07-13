import React, { useEffect, useState } from "react";
import {
  applyComponentTheme,
  themeClasses,
  watchThemeChanges,
} from "../utils/theme";

const Options = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Apply options-specific theming
    applyComponentTheme("options");

    // Watch for theme changes
    const cleanup = watchThemeChanges((isDarkMode) => {
      setIsDark(isDarkMode);
    });

    return cleanup;
  }, []);

  return (
    <div className="bg-background-primary">
      <div className="container mx-auto py-4">
        <div
          className={`${themeClasses.container} ${themeClasses.animations.fadeIn}`}
        >
          <h1 className="text-3xl font-bold text-text-primary mb-6">
            Extension Options
          </h1>

          <div className="grid gap-6">
            {/* Theme Info Section */}
            <div className={themeClasses.card}>
              <h2 className={themeClasses.header}>Theme Information</h2>
              <p className={themeClasses.text}>
                Current theme mode:{" "}
                <span className={themeClasses.badge.primary}>
                  {isDark ? "Dark" : "Light"}
                </span>
              </p>
              <p className={themeClasses.text}>
                The extension automatically adapts to your system theme
                preferences.
              </p>
            </div>

            {/* Settings Section */}
            <div className={themeClasses.card}>
              <h2 className={themeClasses.header}>Extension Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Extension Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Chrome Extension Template"
                    className={themeClasses.inputField}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="A modern Chrome extension template with comprehensive tooling"
                    className={`${themeClasses.inputField} resize-none`}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="notifications"
                    className="w-4 h-4 text-secondary bg-background-primary border-border rounded focus:ring-secondary"
                  />
                  <label
                    htmlFor="notifications"
                    className="text-sm text-text-secondary"
                  >
                    Enable notifications
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className={themeClasses.buttonPrimary}>
                Save Settings
              </button>
              <button className={themeClasses.buttonSecondary}>
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Options;
