import { KeyboardControls, PointerLockControls } from '@react-three/drei'
import { Stage } from './Stage'
import { RefObject, Suspense } from 'react'
import { keyboardControls } from '../const/keyboardControls'
import { useGame } from '../hooks/useGame'
import { useSceneLoading } from '../hooks/useSceneLoading'

interface ISceneProps {
  canvasRef: RefObject<HTMLCanvasElement | null>
}

export function Scene({ canvasRef }: ISceneProps) {
  const { setPause, pause } = useGame()

  useSceneLoading()

  return (
    <>
      <>
        <Suspense fallback={null}>
          <KeyboardControls map={keyboardControls}>
            <Stage key="main-stage" />
          </KeyboardControls>
        </Suspense>
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
