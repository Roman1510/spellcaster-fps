import { useEffect, useState } from 'react'

import { useMenuNavigation } from '../hooks/useMenuNavigation'
import { useSound } from '../hooks/useSound' // Updated import
import { MenuOverlay } from './Menu/MenuOverlay'
import { MenuContainer } from './Menu/MenuContainer'
import { MenuTitle } from './Menu/MenuTitle'
import { MenuOptions } from './Menu/MenuOptions'
import { MenuInstructions } from './Menu/MenuInstructions'
import { MenuStatusIndicator } from './Menu/MenuStatusIndicator'
import { MenuStyles } from './Menu/MenuStyles'
import { MenuGoals } from './Menu/MenuGoals'
import { EnergyUI } from './EnergyUI'
// Use individual hooks instead of the compound hook
import {
  usePause,
  useHasStarted,
  useSetPause,
  useSetHasStarted,
} from '../store/GameStore'

interface GameUIProps {
  onStart: () => void
  onContinue: () => void
  onRestart: () => void
  gameTitle?: string
}

export function GameUI({
  onStart,
  onContinue,
  onRestart,
  gameTitle,
}: GameUIProps) {
  const pause = usePause()
  const hasStarted = useHasStarted()
  const setPause = useSetPause()
  const setHasStarted = useSetHasStarted()

  const [selectedOption, setSelectedOption] = useState(0)

  const { playBackgroundMusic, stopBackgroundMusic } = useSound()

  const handleStart = () => {
    setHasStarted(true)
    setPause(false)
    playBackgroundMusic()
    onStart()
  }

  const handleContinue = () => {
    setPause(false)
    playBackgroundMusic()
    onContinue()
  }

  const handleRestart = () => {
    setHasStarted(true)
    setPause(false)
    playBackgroundMusic()
    onRestart()
  }

  useEffect(() => {
    if (pause && hasStarted) {
      stopBackgroundMusic()
    }
  }, [pause, hasStarted, stopBackgroundMusic])

  const getMenuOptions = () => {
    if (!hasStarted) {
      return [{ label: 'START', action: handleStart }]
    }
    return [
      { label: 'CONTINUE', action: handleContinue },
      { label: 'RESTART', action: handleRestart },
    ]
  }

  const menuOptions = getMenuOptions()

  useMenuNavigation({
    isActive: pause,
    selectedOption,
    setSelectedOption,
    menuOptions,
    onHover: () => {},
  })

  useEffect(() => {
    setSelectedOption(0)
  }, [hasStarted])

  if (!pause) return <EnergyUI />

  return (
    <>
      <MenuOverlay>
        <MenuContainer>
          <MenuTitle hasStarted={hasStarted} title={gameTitle} />
          <MenuOptions
            options={menuOptions}
            selectedOption={selectedOption}
            onSelect={setSelectedOption}
          />

          <MenuInstructions hasStarted={hasStarted} />
          <MenuGoals />
          <MenuStatusIndicator show={!hasStarted} />
        </MenuContainer>
      </MenuOverlay>
      <MenuStyles />
    </>
  )
}
