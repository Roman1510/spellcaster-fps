interface MenuStatusIndicatorProps {
  show: boolean
  text?: string
}

export function MenuStatusIndicator({
  show,
  text = 'SYSTEMS READY',
}: MenuStatusIndicatorProps) {
  if (!show) return null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '10px',
        opacity: 0.5,
        animation: 'blink 1s infinite',
      }}
    >
      {text}
    </div>
  )
}
