import {
  Environment,
  KeyboardControls,
  PointerLockControls,
} from '@react-three/drei'
import { Stage } from './Stage'
import { MutableRefObject } from 'react'
import { keyboardControls } from '../const/keyboardControls'

interface ISceneProps {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>
}

export const FPSControls = () => {
  return (
    <PointerLockControls
      makeDefault
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
    />
  )
}

export function Scene({ canvasRef }: ISceneProps) {
  return (
    <>
      <>
        <Environment
          background={false}
          preset="forest"
          environmentIntensity={0.5}
        />

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
