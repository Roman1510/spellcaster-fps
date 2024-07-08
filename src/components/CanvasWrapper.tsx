import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'

import { Color, FogExp2 } from 'three'
import { Scene } from './Scene'
import { Html, useProgress } from '@react-three/drei'

export function CanvasWrapper() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { progress } = useProgress()
  return (
    <div className="canvas-wrapper">
      <Canvas
        shadows
        key="canvas-game"
        dpr={1}
        camera={{ fov: 40 }}
        onCreated={({ scene }) => {
          scene.background = new Color(0x000000)
          scene.fog = new FogExp2(0x000000, 0.02)
        }}
        gl={{
          powerPreference: 'high-performance',
          antialias: false,
          autoClear: true,
        }}
      >
        <Suspense
          fallback={
            <Html>
              <div style={{ color: 'white' }}>Loading...*{progress}*</div>
            </Html>
          }
        >
          <Scene key="scene-game" canvasRef={canvasRef} />
        </Suspense>
      </Canvas>
    </div>
  )
}
