import { RigidBody } from '@react-three/rapier'
import { Box } from '@react-three/drei'

export const BrickWall = () => {
  const boxSize = 1
  const numRows = 12
  const numColumns = 14

  // Smiley face pattern (1 = yellow, 2 = black eyes/mouth, 0 = cyan background)
  const smileyPattern = [
    // Row 11 (top)
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 0], // Eyes
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 0], // Mouth ends
    [0, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 0], // Mouth curve
    [0, 0, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 0, 0], // Mouth bottom
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 0 (bottom)
  ]

  const boxes = []

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numColumns; col++) {
      const posX = col * boxSize - (numColumns * boxSize) / 2 + boxSize / 2
      const posY = row * boxSize + boxSize / 2
      const posZ = -20

      // Determine color based on smiley pattern
      let color = 'cyan' // Default background
      const patternValue = smileyPattern[numRows - 1 - row]?.[col] || 0

      if (patternValue === 1) color = '#FFD700' // Gold yellow for face
      else if (patternValue === 2) color = '#000000' // Black for eyes and mouth

      boxes.push(
        <RigidBody
          key={`${row}-${col}`}
          position={[posX, posY, posZ]}
          mass={3} // Heavier for stability
          gravityScale={0.8} // Good gravity response
          colliders="cuboid"
          friction={0.7} // High friction to stay put
          restitution={0.3} // Some bounce for satisfying impact
          linearDamping={0.2} // Slight damping
          angularDamping={0.3} // Prevents excessive spinning
        >
          <Box args={[boxSize, boxSize, boxSize]} castShadow receiveShadow>
            <meshPhysicalMaterial
              color={color}
              roughness={0.8} // More realistic surface
              metalness={0.1} // Slight metallic look
              clearcoat={0.1} // Subtle shine
            />
          </Box>
        </RigidBody>
      )
    }
  }

  return <>{boxes}</>
}
