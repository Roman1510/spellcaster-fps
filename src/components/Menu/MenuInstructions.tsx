interface MenuInstructionsProps {
  hasStarted: boolean
}

export function MenuInstructions({ hasStarted }: MenuInstructionsProps) {
  return (
    <div
      style={{
        fontSize: '12px',
        opacity: 0.7,
        marginTop: '20px',
        lineHeight: '1.4',
      }}
    >
      {hasStarted ? (
        <>
          ARROW KEYS / WASD: Navigate
          <br />
          ENTER / SPACE: Select
          <br />
          ESC: Pause Game
        </>
      ) : (
        <>
          ARROW KEYS / WASD: Navigate
          <br />
          ENTER / SPACE: Select
        </>
      )}
    </div>
  )
}
