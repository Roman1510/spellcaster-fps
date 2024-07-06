import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Box, OrbitControls } from '@react-three/drei'
import { Color, FogExp2 } from 'three'

function Model() {
  return <Box args={[1, 1, 1]} />
}

export default function App() {
  return (
    <div className="canvas-wrapper">
      <Canvas
        key="canvas-game"
        dpr={1}
        camera={{ fov: 30 }}
        onCreated={({ scene }) => {
          scene.background = new Color(0x000000)
          scene.fog = new FogExp2(0x000000, 0.002)
        }}
        gl={{
          powerPreference: 'high-performance',
          antialias: false,
          autoClear: true,
        }}
      >
        <ambientLight />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  )
}
