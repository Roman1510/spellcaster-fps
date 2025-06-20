import { KeyboardControls, PointerLockControls } from '@react-three/drei'
import { Stage } from './Stage'
import { RefObject } from 'react'
import { keyboardControls } from '../const/keyboardControls'

interface ISceneProps {
  canvasRef: RefObject<HTMLCanvasElement | null>
}

export function Scene({ canvasRef }: ISceneProps) {
  return (
    <>
      <>
        <KeyboardControls map={keyboardControls}>
          <Stage key="main-stage" />
        </KeyboardControls>
      </>

      <PointerLockControls
        domElement={canvasRef.current!}
        onLock={() => {}}
        onUnlock={() => {}}
      />
    </>
  )
}
