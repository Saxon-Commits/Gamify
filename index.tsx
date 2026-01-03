// Polyfill for global which is needed by some older libraries like react-quill
if (typeof global === 'undefined') {
  (window as any).global = window;
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '@xyflow/react/dist/style.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
