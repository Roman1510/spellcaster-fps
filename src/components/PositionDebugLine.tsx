import { useControls } from 'leva'
import { Text } from '@react-three/drei'

export const PositionDebugLine = ({ name = 'Debug Line' }) => {
  const { x, z, height, showCoords } = useControls(name, {
    x: { value: 0, min: -1000, max: 1000, step: 2 },
    z: { value: 0, min: -1000, max: 1000, step: 2 },
    height: { value: 100, min: 1, max: 200, step: 5 },
    showCoords: true,
  })

  return (
    <group position={[x, 0, z]}>
      {/* Vertical yellow line */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.2, 0.2, height]} />
        <meshBasicMaterial color="yellow" />
      </mesh>

      {/* Base marker (small sphere) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2]} />
        <meshBasicMaterial color="red" />
      </mesh>

      {/* Top marker (small sphere) */}
      <mesh position={[0, height, 0]}>
        <sphereGeometry args={[0.15]} />
        <meshBasicMaterial color="lime" />
      </mesh>

      {/* Optional coordinate display */}
      {showCoords && (
        <Text
          position={[0, height + 1, 0]}
          fontSize={0.8}
          color="white"
          anchorX="center"
          anchorY="bottom"
          scale={10}
        >
          [{x.toFixed(1)}, {0}, {z.toFixed(1)}]
        </Text>
      )}
    </group>
  )
}

// Multiple debug lines component - useful for comparing positions
export const MultipleDebugLines = () => {
  return (
    <>
      <PositionDebugLine name="Line 1" />
      <PositionDebugLine name="Line 2" />
      <PositionDebugLine name="Line 3" />
    </>
  )
}
