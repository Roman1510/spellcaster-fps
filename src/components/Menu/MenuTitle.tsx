interface MenuTitleProps {
  hasStarted: boolean
  title?: string
}

export function MenuTitle({
  hasStarted,
  title = 'PROJECT C.A.S.T.L.E.',
}: MenuTitleProps) {
  return (
    <h1
      style={{
        fontSize: '32px',
        margin: '0 0 30px 0',
        fontWeight: 'bold',
        textShadow: '0 0 10px #00ff00',
        letterSpacing: '3px',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    >
      {hasStarted ? 'GAME PAUSED' : title}
    </h1>
  )
}
