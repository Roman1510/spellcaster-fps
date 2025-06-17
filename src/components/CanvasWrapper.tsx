import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'

import { Color, FogExp2 } from 'three'
import { Scene } from './Scene'
import { useControls } from 'leva'
import { Perf } from 'r3f-perf'
import { Preload } from '@react-three/drei'

export function CanvasWrapper() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const canvasStyle: React.CSSProperties = {
    imageRendering: 'pixelated',
    width: '100%',
    height: '100%',
  }
  const { showPerf } = useControls('Performance', {
    showPerf: { value: false, label: 'Show Performance Stats' },
  })
  return (
    <div
      className="canvas-wrapper"
      style={{ overflow: 'hidden', position: 'relative' }}
    >
      <div style={canvasStyle}>
        <Canvas
          shadows
          key="canvas-game"
          dpr={0.4}
          camera={{ fov: 38 }}
          onCreated={({ scene }) => {
            scene.background = new Color('#000000')
            scene.fog = new FogExp2('#000000', 0.02)
          }}
          gl={{
            powerPreference: 'high-performance',
            antialias: false,
            autoClear: true,
          }}
        >
          <Suspense fallback={null}>
            <Scene key="scene-game" canvasRef={canvasRef} />
            <Preload all />
          </Suspense>
          {showPerf && <Perf position="top-left" />}
        </Canvas>
      </div>
      {
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent ${3}px,
                rgba(0,0,0,0.1) ${4}px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent ${3}px,
                rgba(0,0,0,0.1) ${4}px
              )
            `,
            pointerEvents: 'none',
            mixBlendMode: 'multiply',
          }}
        />
      }
      {/* {vignetteIntensity > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at ${fishEyeCenterX * 100}% ${fishEyeCenterY * 100}%, 
              transparent 20%, 
              rgba(0,0,0,${vignetteIntensity * 0.8}) 80%)`,
            pointerEvents: 'none'
          }}
        />
      )} */}
    </div>
  )
}
