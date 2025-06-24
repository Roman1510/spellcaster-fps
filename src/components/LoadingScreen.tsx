import { useLoading } from '../hooks/useLoading'

export function LoadingScreen() {
  const { loadingProgress, loadingMessage } = useLoading()

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(5px)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Orbitron", "Courier New", monospace',
        color: '#00ff00',
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(0, 100, 0, 0.1) 50%, rgba(0, 255, 0, 0.1) 100%)`,
          border: '2px solid #00ff00',
          borderRadius: '10px',
          padding: '40px',
          minWidth: '400px',
          textAlign: 'center',
          position: 'relative',
          boxShadow: `0 0 20px rgba(0, 255, 0, 0.5), inset 0 0 20px rgba(0, 255, 0, 0.1)`,
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            margin: '0 0 30px 0',
            fontWeight: 'bold',
            textShadow: '0 0 10px #00ff00',
            letterSpacing: '3px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        >
          PROJECT C.A.S.T.L.E.
        </h1>

        <div
          style={{
            fontSize: '14px',
            marginBottom: '20px',
            opacity: 0.8,
            minHeight: '20px',
          }}
        >
          {loadingMessage}
        </div>

        <div
          style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
            border: '1px solid #00ff00',
            borderRadius: '2px',
            marginBottom: '20px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${loadingProgress}%`,
              height: '100%',
              backgroundColor: '#00ff00',
              transition: 'width 0.3s ease',
              boxShadow: '0 0 10px rgba(0, 255, 0, 0.8)',
            }}
          />
        </div>

        <div
          style={{
            fontSize: '12px',
            opacity: 0.6,
            letterSpacing: '1px',
          }}
        >
          {Math.round(loadingProgress)}% COMPLETE
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '15px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            opacity: 0.5,
            animation: 'blink 1s infinite',
          }}
        >
          LOADING...
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 0.5; }
          51%, 100% { opacity: 0.1; }
        }
      `}</style>
    </div>
  )
}
