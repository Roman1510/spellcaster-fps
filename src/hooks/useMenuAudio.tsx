import { useRef } from 'react'

export function useMenuAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playSelectSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }

  const playHoverSound = () => {
    // Optional: Add hover sound effect
  }

  const AudioElement = () => (
    <audio ref={audioRef} preload="auto">
      <source src="/sounds/select.mp3" type="audio/mpeg" />
      <source src="/sounds/select.ogg" type="audio/ogg" />
    </audio>
  )

  return {
    playSelectSound,
    playHoverSound,
    AudioElement,
  }
}
