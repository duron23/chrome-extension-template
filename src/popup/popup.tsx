import React, { useEffect } from "react";
import { applyComponentTheme, themeClasses } from "../utils/theme";

const PopUp = () => {
  useEffect(() => {
    // Apply popup-specific theming
    applyComponentTheme("popup");
  }, []);

  return (
    <div className={themeClasses.container}>
      <div className="space-y-4">
        <h1 className={themeClasses.header}>Extension Popup</h1>

        <p className={themeClasses.text}>
          Welcome to your Chrome extension! This popup demonstrates the common
          theme system.
        </p>

        <hr className={themeClasses.divider} />

        <div className="space-y-3">
          <button className={themeClasses.buttonPrimary}>Primary Action</button>

          <button className={themeClasses.buttonSecondary}>
            Secondary Action
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary">
            Sample Input
          </label>
          <input
            type="text"
            placeholder="Enter something..."
            className={themeClasses.inputField}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className={themeClasses.badge.primary}>Active</span>
          <span className={themeClasses.badge.secondary}>Extension</span>
        </div>
      </div>
    </div>
  );
};

export default PopUp;
