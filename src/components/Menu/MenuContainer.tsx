import { ReactNode } from 'react'
import { MenuCorners } from './MenuCorners'

interface MenuContainerProps {
  children: ReactNode
}

export function MenuContainer({ children }: MenuContainerProps) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(0, 100, 0, 0.1) 50%, rgba(0, 255, 0, 0.1) 100%)`,
        border: '2px solid #00ff00',
        borderRadius: '10px',
        padding: '40px',
        minWidth: '300px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: `0 0 20px rgba(0, 255, 0, 0.5), inset 0 0 20px rgba(0, 255, 0, 0.1)`,
        animation: 'glow 2s ease-in-out infinite alternate',
      }}
    >
      <MenuCorners />
      {children}
    </div>
  )
}
