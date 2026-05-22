import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './modulos/App';
import { ErrorBoundary } from './modulos/ErrorBoundary';
import { TestRunnerAba } from './modulos/TestRunnerAba';
import './design-system/tokens.css';
import './styles.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Elemento root nao encontrado.');
}

const modoAba = (window as any).__QA_MODO__ === 'aba';

createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      {modoAba ? <TestRunnerAba /> : <App />}
    </ErrorBoundary>
  </React.StrictMode>,
);
