import { KeyboardControls, PointerLockControls } from '@react-three/drei'
import { Stage } from './Stage'
import { RefObject } from 'react'
import { keyboardControls } from '../const/keyboardControls'
import { useGame } from '../hooks/useGame'

interface ISceneProps {
  canvasRef: RefObject<HTMLCanvasElement | null>
}

export function Scene({ canvasRef }: ISceneProps) {
  const { setPause, pause } = useGame()
  return (
    <>
      <>
        <KeyboardControls map={keyboardControls}>
          <Stage key="main-stage" />
        </KeyboardControls>
      </>

      {!pause && (
        <PointerLockControls
          domElement={canvasRef.current!}
          onLock={() => {}}
          onUnlock={() => {
            setPause(true)
          }}
        />
      )}
    </>
  )
}
