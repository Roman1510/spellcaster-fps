import { Html, useProgress } from '@react-three/drei'

export function Loader() {
  const { progress } = useProgress()

  if (progress === 100) {
    return null
  }

  return (
    <Html
      center
      style={{
        backgroundColor: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '40px',
        borderRadius: '15px',
        fontSize: '20px',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ marginBottom: '15px' }}>
        Loading... {progress.toFixed(0)}%
      </div>
      <div
        style={{
          width: '250px',
          height: '6px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#00ff88',
            borderRadius: '3px',
            transition: 'width 0.3s ease',
            boxShadow: '0 0 10px rgba(0,255,136,0.5)',
          }}
        />
      </div>
    </Html>
  )
}
