import { MenuOption } from './MenuOption'

interface MenuOptionsProps {
  options: Array<{ label: string; action: () => void }>
  selectedOption: number
  onSelect: (index: number) => void
}

export function MenuOptions({
  options,
  selectedOption,
  onSelect,
}: MenuOptionsProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      {options.map((option, index) => (
        <MenuOption
          key={option.label}
          label={option.label}
          isSelected={selectedOption === index}
          onClick={option.action}
          onHover={() => {
            onSelect(index)
          }}
        />
      ))}
    </div>
  )
}
