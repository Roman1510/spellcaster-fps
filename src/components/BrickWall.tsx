import { RigidBody } from '@react-three/rapier'
import { Box } from '@react-three/drei'

export const BrickWall = () => {
  const boxSize = 1
  const numRows = 10
  const numColumns = 10

  const boxes = []

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numColumns; col++) {
      const posX = col * boxSize - (numColumns * boxSize) / 2 + boxSize / 2
      const posY = row * boxSize + boxSize / 2
      const posZ = -20

      boxes.push(
        <RigidBody
          key={`${row}-${col}`}
          position={[posX, posY, posZ]}
          mass={20}
          colliders="cuboid"
          friction={0.5}
        >
          <Box args={[boxSize, boxSize, boxSize]} castShadow receiveShadow>
            <meshPhysicalMaterial color="cyan" />
          </Box>
        </RigidBody>
      )
    }
  }

  return <>{boxes}</>
}
