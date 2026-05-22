import React, { Component } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary apanhou um erro:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-shell" style={{ background: 'var(--qa-bg)' }}>
          <div
            className="scrollable-body"
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--qa-space-5)',
              textAlign: 'center'
            }}
          >
            <div
              className="panel error-state"
              role="alert"
              style={{
                width: 'min(100%, 420px)',
                justifyItems: 'center',
                padding: 'var(--qa-space-5)'
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 700,
                  background: 'var(--qa-error)',
                  color: 'var(--qa-bg)'
                }}
              >
                !
              </div>
              <h2 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--qa-foreground)' }}>Ocorreu um erro no painel</h2>
              <p style={{ fontSize: '11px', margin: 0, maxWidth: '320px' }}>
                A interface do QAssistant encontrou uma falha de renderização inesperada.
              </p>
              <pre className="mono-block scroll-region compact" style={{ width: '100%', maxHeight: '180px', textAlign: 'left', fontSize: '10px' }}>
                {this.state.error?.message || 'Erro desconhecido'}
              </pre>
              <button
                type="button"
                style={{ fontSize: '11px', minHeight: '32px', padding: '0 16px' }}
                onClick={() => {
                  window.location.reload();
                }}
              >
                Recarregar interface
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
