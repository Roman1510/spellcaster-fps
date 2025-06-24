import React from 'react'
import { useCanFire, useEnergy, useMaxEnergy } from '../store/GameStore'

interface EnergyUIProps {
  className?: string
}

export const EnergyUI = ({ className = '' }: EnergyUIProps) => {
  const energy = useEnergy()
  const maxEnergy = useMaxEnergy()
  const canFire = useCanFire()

  const energyPercentage = (energy / maxEnergy) * 100
  const isLowEnergy = energyPercentage < 30
  const isCriticalEnergy = energyPercentage < 15

  const baseStyles: React.CSSProperties = {
    fontFamily: "'Courier New', monospace",
    color: '#00ff00',
    textShadow: '0 0 10px #00ff00',
    userSelect: 'none',
    pointerEvents: 'none',
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 1000,
  }

  const labelStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '8px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    animation: canFire ? 'none' : 'pulse 1s infinite',
  }

  const containerStyles: React.CSSProperties = {
    width: '200px',
    height: '24px',
    background: 'rgba(0, 0, 0, 0.8)',
    border: '2px solid #00ff00',
    borderRadius: '0',
    boxShadow:
      '0 0 20px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
    position: 'relative',
    overflow: 'hidden',
  }

  const getBarStyles = (): React.CSSProperties => {
    let background =
      'linear-gradient(90deg, #ff4444 0%, #ffaa00 30%, #00ff00 60%, #00ff00 100%)'
    let boxShadow = '0 0 15px rgba(0, 255, 0, 0.6)'
    let animation = 'none'

    if (isCriticalEnergy) {
      background = '#ff4444'
      boxShadow = '0 0 20px rgba(255, 68, 68, 0.8)'
      animation = 'critical-flash 0.3s infinite'
    } else if (isLowEnergy) {
      background = 'linear-gradient(90deg, #ff4444 0%, #ff6666 100%)'
      boxShadow = '0 0 15px rgba(255, 68, 68, 0.6)'
      animation = 'flash 0.5s infinite'
    }

    return {
      height: '100%',
      background,
      width: `${energyPercentage}%`,
      transition: 'width 0.2s ease-out',
      boxShadow,
      position: 'relative',
      animation,
    }
  }

  const textStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#ffffff',
    textShadow:
      '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
    zIndex: 2,
  }

  const overlayStyles: React.CSSProperties = {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background:
      'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)',
    pointerEvents: 'none',
  }

  const statusStyles: React.CSSProperties = {
    marginTop: '8px',
    fontSize: '12px',
    textAlign: 'center',
    letterSpacing: '1px',
  }

  const getStatusTextStyles = (): React.CSSProperties => {
    if (canFire) {
      return {
        color: '#00ff00',
        textShadow: '0 0 8px #00ff00',
      }
    } else if (energy < maxEnergy) {
      return {
        color: '#ffaa00',
        textShadow: '0 0 8px #ffaa00',
        animation: 'pulse 1s infinite',
      }
    } else {
      return {
        color: '#ff4444',
        textShadow: '0 0 8px #ff4444',
        animation: 'critical-flash 0.5s infinite',
      }
    }
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes critical-flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div className={`energy-ui ${className}`} style={baseStyles}>
        <div style={labelStyles}>ENERGY CORE</div>

        <div style={containerStyles}>
          <div style={getBarStyles()} />
          <div style={textStyles}>
            {Math.round(energy)}/{maxEnergy}
          </div>
          <div style={overlayStyles} />
        </div>

        <div style={statusStyles}>
          {canFire ? (
            <span style={getStatusTextStyles()}>READY</span>
          ) : energy < maxEnergy ? (
            <span style={getStatusTextStyles()}>RECHARGING...</span>
          ) : (
            <span style={getStatusTextStyles()}>DEPLETED</span>
          )}
        </div>
      </div>
    </>
  )
}
