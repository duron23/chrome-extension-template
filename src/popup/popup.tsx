import React, { useEffect } from "react";
import { applyComponentTheme, themeClasses } from "../utils/theme";

const PopUp = () => {
  useEffect(() => {
    // Apply popup-specific theming
    applyComponentTheme("popup");
  }, []);

  return (
    <div className="bg-background-primary text-text-primary p-6 min-w-[350px] max-w-[450px]">
      <div className="space-y-6">
        <h1 className="text-text-primary text-2xl font-bold">
          Extension Popup
        </h1>

        <p className="text-text-secondary text-sm leading-relaxed">
          Welcome to your Chrome extension! This popup demonstrates the common
          theme system.
        </p>

        <div className="border-t border-border"></div>

        <div className="space-y-3">
          <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-medium transition-all duration-150 w-full">
            Primary Action
          </button>

          <button className="bg-background-secondary hover:bg-background-tertiary text-text-primary border border-border px-4 py-2 rounded-md font-medium transition-all duration-150 w-full">
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
            className="bg-background-primary text-text-primary border border-border rounded-md px-3 py-2 w-full focus:border-border-focus focus:ring-2 focus:ring-primary/20 focus:outline-hidden transition-all duration-150"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-accent text-white px-2 py-1 rounded-sm text-xs font-medium">
            Active
          </span>
          <span className="bg-background-tertiary text-text-primary px-2 py-1 rounded-sm text-xs font-medium border border-border">
            Extension
          </span>
        </div>

        <div className="bg-background-secondary border border-border rounded-lg p-4 space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">
            Quick Stats
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">Actions</span>
              <span className="text-primary font-mono font-bold">42</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">Tools</span>
              <span className="text-primary font-mono font-bold">12</span>
            </div>
          </div>
        </div>

        <div className="bg-background-secondary border border-border rounded-lg p-4 space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">
            Recent Activity
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Page analyzed</span>
              <span className="text-text-muted">1m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Settings updated</span>
              <span className="text-text-muted">2m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Tool activated</span>
              <span className="text-text-muted">3m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopUp;
