import React from "react";
import { createRoot } from "react-dom/client";
import "../style/tailwind.css";
import "../style/main.css";

import Options from "./options";

function init() {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Can not find #root container");
  }

  const root = createRoot(container);
  root.render(<Options />);
}

init();
