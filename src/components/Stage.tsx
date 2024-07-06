import { Physics } from '@react-three/rapier'
import { Ground } from './Ground'
import { Player } from './Player'

export const Stage = () => {
  return (
    <>
      <>
        <directionalLight position={[10, 5, 5]} />
      </>
      <Physics gravity={[0, -10, 0]}>
        <Player />
        <Ground />
      </Physics>
    </>
  )
}
