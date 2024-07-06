import { Physics } from '@react-three/rapier'
import { Ground } from './Ground'

export const Stage = () => {
  return (
    <>
      <Physics gravity={[0, -9.81, 0]}>
        <Ground />
      </Physics>
    </>
  )
}
