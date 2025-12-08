import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import SmoothScrolling from './components/SmoothScrolling.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SmoothScrolling>
      <App />
    </SmoothScrolling>
  </React.StrictMode>,
);