import { Stage } from './Stage'
import { MutableRefObject } from 'react'

interface ISceneProps {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>
}

export function Scene({ canvasRef }: ISceneProps) {
  console.log('canvasrerf', canvasRef)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const pointerLockControlsRef = useRef<any>(null)

  return (
    <>
      <>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <Stage />
      </>
      {/* <PointerLockControls
        ref={pointerLockControlsRef}
        domElement={canvasRef.current!}
        onLock={() => {}}
        onUnlock={() => {}}
      /> */}
    </>
  )
}
