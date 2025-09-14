import { PointerLockControls } from '@react-three/drei'
import { Stage } from './Stage'
import { RefObject, Suspense } from 'react'
// import { keyboardControls } from '../const/keyboardControls'
import { useSceneLoading } from '../hooks/useSceneLoading'
import { usePause, useSetPause } from '../store/GameStore'

interface ISceneProps {
  canvasRef: RefObject<HTMLCanvasElement | null>
}

export function Scene({ canvasRef }: ISceneProps) {
  const setPause = useSetPause()
  const pause = usePause()
  useSceneLoading()

  return (
    <>
      <>
        <Suspense fallback={null}>
          <Stage key="main-stage" />
        </Suspense>
      </>

      {!pause && (
        <PointerLockControls
          domElement={canvasRef.current!}
          onLock={() => { }}
          onUnlock={() => {
            setPause(true)
          }}
        />
      )}
    </>
  )
}
