import React from 'react';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/** Prevents a full blank white screen when a React render throws. */
export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
            background: '#fff',
            color: '#0a0a0a',
          }}
        >
          <div style={{ maxWidth: 420 }}>
            <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>2Click MoM failed to load</h1>
            <p style={{ fontSize: 14, color: '#5b6472', margin: '0 0 12px' }}>
              {this.state.error.message || 'Unknown error'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                background: '#0B4BD5',
                color: '#fff',
                border: 0,
                borderRadius: 8,
                padding: '10px 14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
