import { CanvasWrapper } from './components/CanvasWrapper'
import { GameProvider } from './context/GameProvider'

export default function App() {
  return (
    <>
      <GameProvider>
        <CanvasWrapper />
      </GameProvider>
    </>
  )
}
