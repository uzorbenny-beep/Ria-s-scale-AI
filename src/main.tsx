import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Silence expected Vite HMR websocket reconnection rejections which are normal in the sandboxed sandpack preview
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const errorMsg = event.reason?.message || String(event.reason);
    if (errorMsg.includes("WebSocket") || errorMsg.includes("websocket")) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
