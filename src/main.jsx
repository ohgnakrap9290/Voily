import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import appIcon from "../voily.png";

document.getElementById("app-icon").href = appIcon;
document.getElementById("apple-touch-icon").href = appIcon;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
