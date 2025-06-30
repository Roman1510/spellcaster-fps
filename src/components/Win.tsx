import { useHasWon, useIsGameOver } from '../store/TimeStore'

const GameOverOverlay = () => {
  const hasWon = useHasWon()
  const isGameOver = useIsGameOver()

  if (!isGameOver) {
    return null
  }

  const title = hasWon ? 'WIN!' : 'GAME OVER'
  const message = hasWon
    ? 'All towers destroyed! Press F to start again.'
    : 'You failed to destroy all towers. Press F to try again.'

  const titleColor = hasWon ? '#00ffff' : '#ff0044'
  const titleShadow = hasWon ? '#00ffff' : '#ff0044'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: 'monospace',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <div
        style={{
          padding: '24px',
          borderRadius: '8px',
          background: 'rgba(0, 0, 0, 0.9)',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <h1
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: titleColor,
            textShadow: `0 0 8px ${titleShadow}`,
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: '#fff',
            textShadow: '0 0 4px rgba(255, 255, 255, 0.5)',
          }}
        >
          {message.replace('F', '')}
          <span
            style={{
              fontWeight: 'bold',
              color: '#00ff00',
              textShadow: '0 0 4px #00ff00',
              margin: '0 4px',
            }}
          >
            F
          </span>
          {message.includes('try again') ? 'to try again.' : 'to start again.'}
        </p>
      </div>
    </div>
  )
}

export default GameOverOverlay
