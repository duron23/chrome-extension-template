import React, { useEffect, useState } from "react";
import { applyComponentTheme, watchThemeChanges } from "../utils/theme";

const Options = () => {
  const [isDark, setIsDark] = useState(false);
  const [extensionName, setExtensionName] = useState(
    "Chrome Extension Template"
  );
  const [description, setDescription] = useState(
    "A modern Chrome extension template with comprehensive features"
  );
  const [notifications, setNotifications] = useState(true);

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
    <div className="bg-background-primary min-h-screen">
      <div className="container mx-auto max-w-4xl py-8 px-6">
        <div className="space-y-8">
          <h1 className="text-3xl font-bold text-text-primary mb-8">
            Extension Options
          </h1>

          {/* Theme Information Card */}
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Theme Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Current theme mode:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isDark
                      ? "bg-blue-600 text-white"
                      : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  }`}
                >
                  {isDark ? "Dark" : "Light"}
                </span>
              </div>
              <p className="text-text-muted text-sm">
                The extension automatically adapts to your system theme
                preferences.
              </p>
            </div>
          </div>

          {/* Extension Settings Card */}
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              Extension Settings
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Extension Name
                </label>
                <input
                  type="text"
                  value={extensionName}
                  onChange={(e) => setExtensionName(e.target.value)}
                  className="bg-background-primary text-text-primary border border-border rounded-md px-3 py-2 w-full focus:border-border-focus focus:ring-2 focus:ring-primary/20 focus:outline-hidden transition-all duration-150"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="bg-background-primary text-text-primary border border-border rounded-md px-3 py-2 w-full focus:border-border-focus focus:ring-2 focus:ring-primary/20 focus:outline-hidden transition-all duration-150 resize-none"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded-sm"
                />
                <label
                  htmlFor="notifications"
                  className="text-text-primary text-sm font-medium"
                >
                  Enable notifications
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md font-medium transition-all duration-150">
                  Save Settings
                </button>
                <button className="bg-background-tertiary hover:bg-background-secondary text-text-primary border border-border px-6 py-2 rounded-md font-medium transition-all duration-150">
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Options;
