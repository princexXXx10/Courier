import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import existing CSS files
import '../styles/main.css';
import '../styles/enhancements.css';
import '../styles/tracking.css';
import '../styles/map-and-components.css';
import '../styles/compact-fixes.css';
import '../styles/polish.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
