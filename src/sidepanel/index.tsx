import React from "react";
import { createRoot } from "react-dom/client";
import "../style/main.css";
import SidePanel from "./sidepanel";

function init() {
  const container = document.createElement("div");
  if (!container) {
    throw new Error("Can not find container");
  }
  document.body.appendChild(container);
  console.log(container);
  const root = createRoot(container);

  root.render(<SidePanel />);
}

init();