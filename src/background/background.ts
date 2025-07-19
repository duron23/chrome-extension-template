import { hello } from "./hello";
import jszip from "jszip";

hello();

console.log("Background Service Worker Initialized for Chrome Extension");

// Example usage of jszip
const zip = new jszip();
zip.file("Hello.txt", "Hello World\n");
zip
  .generateAsync({ type: "blob" })
  .then((content) => {
    console.log("Zip file created successfully", content);
  })
  .catch((error) => {
    console.error("Error creating zip file", error);
  });
