import {
  Environment,
  KeyboardControls,
  PointerLockControls,
} from '@react-three/drei'
import { Stage } from './Stage'
import { MutableRefObject, useRef } from 'react'
import { keyboardControls } from '../const/keyboardControls'

interface ISceneProps {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>
}

export function Scene({ canvasRef }: ISceneProps) {
  console.log('canvasrerf', canvasRef)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pointerLockControlsRef = useRef<any>(null)

  return (
    <>
      <>
        <Environment
          background={false}
          preset="night"
          environmentIntensity={0.5}
        />

        <KeyboardControls map={keyboardControls}>
          <Stage key="main-stage" />
        </KeyboardControls>
      </>
      <PointerLockControls
        ref={pointerLockControlsRef}
        domElement={canvasRef.current!}
        onLock={() => {}}
        onUnlock={() => {}}
      />
    </>
  )
}
