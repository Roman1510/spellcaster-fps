import { RigidBody } from '@react-three/rapier'
import { Box } from '@react-three/drei'

const Pyramid = () => {
  return (
    <>
      <RigidBody position={[0, 5, -5]} mass={5} colliders="cuboid">
        <Box args={[0.5, 0.5, 0.5]}>
          <meshStandardMaterial color="orange" />
        </Box>
      </RigidBody>
    </>
  )
}

export default Pyramid
