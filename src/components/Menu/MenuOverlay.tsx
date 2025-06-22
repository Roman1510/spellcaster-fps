import { ReactNode } from 'react'

interface MenuOverlayProps {
  children: ReactNode
}

export function MenuOverlay({ children }: MenuOverlayProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Orbitron", "Courier New", monospace',
        color: '#00ff00',
        animation: 'fadeIn 0.3s ease-out',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      {children}
    </div>
  )
}
