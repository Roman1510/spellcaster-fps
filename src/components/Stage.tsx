import { Box } from '@react-three/drei'

export const Stage = () => {
  function Model() {
    return (
      <Box args={[1, 1, 1]}>
        <meshNormalMaterial />
      </Box>
    )
  }
  return (
    <>
      <Model />
    </>
  )
}
