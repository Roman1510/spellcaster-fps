import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Color, FogExp2 } from 'three'
import { Scene } from './Scene'
import { Perf } from 'r3f-perf'
import { Preload } from '@react-three/drei'
import { GameUI } from './GameUI'
import { LoadingScreen } from './LoadingScreen'
import { LoadingProvider } from '../context/LoadingProvider'
import { useLoading } from '../hooks/useLoading'
import { ScanlineEffect } from './ScanLineEffect'

function CanvasContent() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { isLoading } = useLoading()

  const canvasStyle: React.CSSProperties = {
    imageRendering: 'pixelated',
    width: '100%',
    height: '100%',
  }

  const handleStart = () => {
    canvasRef.current?.requestPointerLock()
  }

  const handleContinue = () => {
    canvasRef.current?.requestPointerLock()
  }

  const handleRestart = () => {
    canvasRef.current?.requestPointerLock()
  }

  return (
    <div
      className="canvas-wrapper"
      style={{ overflow: 'hidden', position: 'relative' }}
    >
      <div style={canvasStyle}>
        <Canvas
          ref={canvasRef}
          shadows
          key="canvas-game"
          dpr={0.4}
          camera={{ fov: 38 }}
          onCreated={({ scene }) => {
            scene.background = new Color('#000000')
            scene.fog = new FogExp2('#000000', 0.003)
          }}
          gl={{
            powerPreference: 'high-performance',
            antialias: false,
            autoClear: true,
          }}
        >
          <Suspense fallback={<LoadingScreen />}>
            <Scene key="scene-game" canvasRef={canvasRef} />
          </Suspense>
          <Preload all />
          <Perf position="top-left" />
        </Canvas>
      </div>

      <ScanlineEffect />

      {isLoading && <LoadingScreen />}

      <GameUI
        onStart={handleStart}
        onContinue={handleContinue}
        onRestart={handleRestart}
      />
    </div>
  )
}

export function CanvasWrapper() {
  return (
    <LoadingProvider>
      <CanvasContent />
    </LoadingProvider>
  )
}
