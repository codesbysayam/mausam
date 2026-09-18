import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './i18n/LanguageContext';
import { LocationProvider } from './context/LocationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

console.log('[MAUSAM] main.tsx initializing...');

// Global runtime error monitor for diagnostics
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    if (
      e.message &&
      (e.message.includes('ResizeObserver loop completed with undelivered notifications') ||
        e.message.includes('ResizeObserver loop limit exceeded'))
    ) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return;
    }
    console.error('[MAUSAM Global Error]:', e.message, 'at', e.filename, ':', e.lineno, e.error);
  });

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason;
    const isAbort =
      reason?.name === 'AbortError' ||
      reason?.message?.includes?.('aborted') ||
      reason?.message?.includes?.('The user aborted a request') ||
      reason === 'AbortError';

    const isAudioPermission =
      reason?.name === 'NotAllowedError' ||
      reason?.message?.includes?.('user didn\'t interact with the document first');

    if (isAbort || isAudioPermission) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return;
    }

    // Call preventDefault to mark the rejection as handled
    e.preventDefault();
    console.warn('[MAUSAM Unhandled Promise Rejection Prevented]:', reason);
  });
}

const rootElement = document.getElementById('root');
console.log('[MAUSAM] Document readyState:', typeof document !== 'undefined' ? document.readyState : 'n/a');
console.log('[MAUSAM] Target #root element found:', Boolean(rootElement), rootElement);

if (!rootElement) {
  console.error('[MAUSAM FATAL]: #root element not found in DOM!');
} else {
  try {
    const root = createRoot(rootElement);
    console.log('[MAUSAM] React root created successfully, invoking render()...');
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <LanguageProvider>
            <LocationProvider>
              <App />
            </LocationProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </StrictMode>,
    );
    console.log('[MAUSAM] root.render() dispatched without synchronous exception');
  } catch (err) {
    console.error('[MAUSAM FATAL]: Exception during createRoot / render initialization:', err);
  }
}

