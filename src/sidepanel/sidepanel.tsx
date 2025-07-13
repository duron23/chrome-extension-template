import React, { useEffect, useState } from "react";
import { applyComponentTheme, themeClasses } from "../utils/theme";

const SidePanel = () => {
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Apply sidepanel-specific theming
    applyComponentTheme("sidepanel");
  }, []);

  return (
    <div
      className="bg-background-primary flex flex-col"
      style={{ height: "100vh" }}
    >
      {/* Header */}
      <div className="border-b border-border p-4">
        <h1 className="text-lg font-semibold text-text-primary">
          Extension Panel
        </h1>
        <p className="text-sm text-text-secondary">
          Persistent side panel interface
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <nav className="flex">
          {[
            { id: "overview", label: "Overview" },
            { id: "tools", label: "Tools" },
            { id: "settings", label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-secondary text-secondary"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className={`${themeClasses.animations.fadeIn} space-y-4`}>
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className={themeClasses.card}>
                <h3 className={themeClasses.header}>Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">42</div>
                    <div className="text-xs text-text-muted">Actions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">12</div>
                    <div className="text-xs text-text-muted">Tools</div>
                  </div>
                </div>
              </div>

              <div className={themeClasses.card}>
                <h3 className={themeClasses.header}>Recent Activity</h3>
                <div className="space-y-2">
                  {["Page analyzed", "Settings updated", "Tool activated"].map(
                    (activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-text-secondary">
                          {activity}
                        </span>
                        <span className={themeClasses.badge.secondary}>
                          {index + 1}m
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "tools" && (
            <div className="space-y-3">
              <h3 className={themeClasses.header}>Available Tools</h3>
              {[
                "Page Inspector",
                "Color Picker",
                "Screenshot Tool",
                "Text Extractor",
              ].map((tool, index) => (
                <button
                  key={index}
                  className={`w-full ${themeClasses.buttonSecondary} text-left`}
                >
                  {tool}
                </button>
              ))}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4">
              <h3 className={themeClasses.header}>Panel Settings</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    Auto-refresh
                  </span>
                  <input type="checkbox" className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    Notifications
                  </span>
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                </div>

                <hr className={themeClasses.divider} />

                <button className={themeClasses.buttonPrimary}>
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
