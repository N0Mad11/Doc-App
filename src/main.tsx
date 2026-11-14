import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './components/AuthProvider';
import ErrorBoundary from './components/ErrorBoundary';
import { configError } from './lib/supabase';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {configError ? (
      <p style={{ padding: 32, color: '#b42318' }}>{configError}</p>
    ) : (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
    )}
  </StrictMode>
);