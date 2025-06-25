import { useRef, useEffect } from 'react'
import { useSoundStore } from '../store/SoundStore'

export function useSound() {
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null)
  const fireballRef = useRef<HTMLAudioElement | null>(null)
  const debrisRef = useRef<HTMLAudioElement | null>(null)

  const setBackgroundMusicRef = useSoundStore(
    (state) => state.setBackgroundMusicRef
  )
  const setFireballRef = useSoundStore((state) => state.setFireballRef)
  const setDebrisRef = useSoundStore((state) => state.setDebrisRef)

  const playBackgroundMusic = useSoundStore(
    (state) => state.playBackgroundMusic
  )
  const pauseBackgroundMusic = useSoundStore(
    (state) => state.pauseBackgroundMusic
  )
  const resumeBackgroundMusic = useSoundStore(
    (state) => state.resumeBackgroundMusic
  )
  const restartBackgroundMusic = useSoundStore(
    (state) => state.restartBackgroundMusic
  )
  const playFireballSound = useSoundStore((state) => state.playFireballSound)
  const playDebrisSound = useSoundStore((state) => state.playDebrisSound)

  useEffect(() => {
    if (backgroundMusicRef.current) {
      setBackgroundMusicRef(backgroundMusicRef.current)
    }
    if (fireballRef.current) {
      setFireballRef(fireballRef.current)
    }
    if (debrisRef.current) {
      setDebrisRef(debrisRef.current)
    }
  }, [setBackgroundMusicRef, setFireballRef, setDebrisRef])

  const AudioElements = () => (
    <>
      <audio ref={backgroundMusicRef} preload="auto" loop>
        <source
          src="https://roman1510.github.io/files/dark-synthwave.mp3"
          type="audio/mpeg"
        />
      </audio>

      <audio ref={fireballRef} preload="auto">
        <source
          src="https://roman1510.github.io/files/fireball.mp3"
          type="audio/mpeg"
        />
      </audio>

      <audio ref={debrisRef} preload="auto">
        <source
          src="https://roman1510.github.io/files/blast.mp3"
          type="audio/mpeg"
        />
      </audio>
    </>
  )

  return {
    playBackgroundMusic,
    pauseBackgroundMusic,
    resumeBackgroundMusic,
    restartBackgroundMusic,
    playFireballSound,
    playDebrisSound,
    AudioElements,
  }
}
