import { createRoot } from "react-dom/client";
import Offscreen from "./offscreen";
import "../style/main.css";

function init() {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Can not find container");
  }
  
  const root = createRoot(container);
  root.render(<Offscreen />);
}

init();
