import { useTowers } from '../store/TowerStore'

export const DemolitionUI = () => {
  const towers = useTowers()

  if (towers.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        fontFamily: 'monospace',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        minWidth: '200px',
      }}
    >
      <div
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '12px',
          color: '#00ffff',
          textShadow: '0 0 8px #00ffff',
          textTransform: 'uppercase',
        }}
      >
        Tower Status
      </div>

      {towers.map((tower) => {
        const color = tower.isDestroyed
          ? '#ff4444'
          : tower.demolitionPercentage >= 15
          ? '#ffaa00'
          : '#00ff00'

        return (
          <div
            key={tower.id}
            style={{
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: tower.isDestroyed ? '#666' : '#fff',
              opacity: tower.isDestroyed ? 0.6 : 1,
            }}
          >
            <span>Tower {tower.id + 1}</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '80px',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${tower.demolitionPercentage * 5}%`,
                    background: color,
                    transition: 'width 0.3s ease',
                    boxShadow: `0 0 8px ${color}`,
                  }}
                />
              </div>

              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: color,
                  textShadow: `0 0 4px ${color}`,
                  minWidth: '35px',
                  textAlign: 'right',
                }}
              >
                {tower.isDestroyed
                  ? 'XXX'
                  : `${Math.min(100, tower.demolitionPercentage * 5)}%`}
              </span>
            </div>
          </div>
        )
      })}

      <div
        style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          fontSize: '11px',
          color: '#888',
          textAlign: 'center',
        }}
      >
        Active: {towers.filter((t) => !t.isDestroyed).length}/{towers.length}
      </div>
    </div>
  )
}

export default DemolitionUI
