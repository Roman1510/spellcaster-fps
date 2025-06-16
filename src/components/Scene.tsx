import {
  Environment,
  KeyboardControls,
  PointerLockControls,
} from '@react-three/drei'
import { Stage } from './Stage'
import { RefObject } from 'react'
import { keyboardControls } from '../const/keyboardControls'
// import { Perf } from 'r3f-perf'
// import { useControls } from 'leva'

interface ISceneProps {
  canvasRef: RefObject<HTMLCanvasElement | null>
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
  // const { showPerf } = useControls('Performance', {
  //   showPerf: { value: false, label: 'Show Performance Stats' },
  // })
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
      {/* {showPerf && <Perf position="top-left" />} */}
      <PointerLockControls
        domElement={canvasRef.current!}
        onLock={() => {}}
        onUnlock={() => {}}
      />
    </>
  )
}
