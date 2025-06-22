export function MenuCorners() {
  const cornerStyle = {
    position: 'absolute' as const,
    width: '20px',
    height: '20px',
    border: '2px solid #00ff00',
  }

  return (
    <>
      <div
        style={{
          ...cornerStyle,
          top: '-2px',
          left: '-2px',
          borderRight: 'none',
          borderBottom: 'none',
        }}
      />
      <div
        style={{
          ...cornerStyle,
          top: '-2px',
          right: '-2px',
          borderLeft: 'none',
          borderBottom: 'none',
        }}
      />
      <div
        style={{
          ...cornerStyle,
          bottom: '-2px',
          left: '-2px',
          borderRight: 'none',
          borderTop: 'none',
        }}
      />
      <div
        style={{
          ...cornerStyle,
          bottom: '-2px',
          right: '-2px',
          borderLeft: 'none',
          borderTop: 'none',
        }}
      />
    </>
  )
}
