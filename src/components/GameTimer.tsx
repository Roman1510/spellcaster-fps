import { useTimeRemaining } from '../store/TimeStore'
import { useHasStarted, usePause } from '../store/GameStore'

export function GameTimer() {
  const timeRemaining = useTimeRemaining()
  const hasStarted = useHasStarted()
  const pause = usePause()

  if (!hasStarted || pause) return null

  const seconds = Math.ceil(timeRemaining)
  const progress = (timeRemaining / 30) * 100

  let color = '#00ffff'
  if (seconds <= 5) color = '#ff4444'
  else if (seconds <= 10) color = '#ffaa00'

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        width: '80px',
        height: '80px',
        fontFamily: 'monospace',
      }}
    >
      <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="40"
          cy="40"
          r="35"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="4"
        />

        <circle
          cx="40"
          cy="40"
          r="35"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={220}
          strokeDashoffset={220 - (progress / 100) * 220}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>

      {/* Timer text */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: color,
          fontSize: '16px',
          fontWeight: 'bold',
          textShadow: `0 0 8px ${color}`,
        }}
      >
        {seconds}
      </div>

      {seconds <= 0 && (
        <div
          style={{
            position: 'absolute',
            top: '85px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#ff4444',
            fontSize: '10px',
            textAlign: 'center',
            textTransform: 'uppercase',
            textShadow: '0 0 4px #ff4444',
          }}
        >
          TIME UP
        </div>
      )}
    </div>
  )
}
