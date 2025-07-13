import React, { useEffect } from "react";
import { applyComponentTheme } from "../utils/theme";

const Offscreen: React.FC = () => {
  useEffect(() => {
    // Apply offscreen-specific theming (hides the document)
    applyComponentTheme("offscreen");

    // Log that offscreen document is ready
    console.log("Offscreen document initialized with theme");
  }, []);

  return (
    <div style={{ display: "none" }}>
      {/* Offscreen document content is hidden by default */}
      <div>Offscreen document ready for background processing</div>
    </div>
  );
};

export default Offscreen;
