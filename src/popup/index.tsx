import { createRoot } from "react-dom/client";
import Popup from "./popup";
import "../style/tailwind.css";
import "../style/main.css";

function init() {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Can not find #root container");
  }

  const root = createRoot(container);
  root.render(<Popup />);
}

init();
