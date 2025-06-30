import { useEffect, useState } from 'react'

import { useMenuNavigation } from '../hooks/useMenuNavigation'
import { useSound } from '../hooks/useSound'
import { MenuOverlay } from './Menu/MenuOverlay'
import { MenuContainer } from './Menu/MenuContainer'
import { MenuTitle } from './Menu/MenuTitle'
import { MenuOptions } from './Menu/MenuOptions'
import { MenuInstructions } from './Menu/MenuInstructions'
import { MenuStatusIndicator } from './Menu/MenuStatusIndicator'
import { MenuStyles } from './Menu/MenuStyles'
import { MenuGoals } from './Menu/MenuGoals'
import { EnergyUI } from './EnergyUI'
import { GameTimer } from './GameTimer'
import {
  usePause,
  useHasStarted,
  useSetPause,
  useSetHasStarted,
} from '../store/GameStore'
import { useStartTimer, useStopTimer, useResetTimer } from '../store/TimeStore'
import Win from './Win'
// import TowerStatusUI from './TowerStatus'

interface GameUIProps {
  onStart: () => void
  onContinue: () => void
  onRestart: () => void
  gameTitle?: string
}

export function GameUI({
  onStart,
  onContinue,

  gameTitle,
}: GameUIProps) {
  const pause = usePause()
  const hasStarted = useHasStarted()
  const setPause = useSetPause()
  const setHasStarted = useSetHasStarted()

  const startTimer = useStartTimer()
  const stopTimer = useStopTimer()
  const resetTimer = useResetTimer()

  const [selectedOption, setSelectedOption] = useState(0)

  const { playBackgroundMusic, pauseBackgroundMusic } = useSound()

  useEffect(() => {
    if (hasStarted && !pause) {
      startTimer()
    } else {
      stopTimer()
    }
  }, [hasStarted, pause, startTimer, stopTimer])

  const handleStart = () => {
    resetTimer()
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

  useEffect(() => {
    if (pause && hasStarted) {
      pauseBackgroundMusic()
    }
  }, [pause, hasStarted, pauseBackgroundMusic])

  const getMenuOptions = () => {
    if (!hasStarted) {
      return [{ label: 'START', action: handleStart }]
    }
    return [{ label: 'CONTINUE', action: handleContinue }]
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

  if (!pause) {
    return (
      <>
        {/* <TowerStatusUI /> */}
        <Win />
        <EnergyUI />
        <GameTimer />
      </>
    )
  }

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
