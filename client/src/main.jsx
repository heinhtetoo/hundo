import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'oklch(10% 0.022 265)',
          color: 'oklch(96% 0.005 265)',
          border: '1px solid oklch(18% 0.022 265)',
          borderRadius: '12px',
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontSize: '14px',
        },
        success: {
          iconTheme: {
            primary: 'oklch(76% 0.19 55)',
            secondary: 'oklch(10% 0.02 55)',
          },
        },
        error: {
          iconTheme: {
            primary: 'oklch(58% 0.18 18)',
            secondary: 'oklch(96% 0.005 265)',
          },
        },
      }}
    />
  </React.StrictMode>,
);
