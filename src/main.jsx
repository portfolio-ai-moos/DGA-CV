import React from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import './styles.css';

function App() {
  return (
    <>
      <iframe title="Online CV van Moos Poelmans" src="/api/proxy" />
      <Analytics />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
