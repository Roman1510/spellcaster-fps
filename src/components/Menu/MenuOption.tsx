interface MenuOptionProps {
  label: string
  isSelected: boolean
  onClick: () => void
  onHover: () => void
}

export function MenuOption({
  label,
  isSelected,
  onClick,
  onHover,
}: MenuOptionProps) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      style={{
        padding: '15px 30px',
        margin: '10px 0',
        fontSize: '18px',
        letterSpacing: '2px',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00ff00' : '2px solid transparent',
        backgroundColor: isSelected ? 'rgba(0, 255, 0, 0.1)' : 'transparent',
        borderRadius: '5px',
        transition: 'all 0.2s ease',
        textShadow: isSelected ? '0 0 8px #00ff00' : 'none',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isSelected ? '0 0 15px rgba(0, 255, 0, 0.3)' : 'none',
      }}
    >
      {isSelected && '> '}
      {label}
      {isSelected && ' <'}
    </div>
  )
}
