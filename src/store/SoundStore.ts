import { create } from 'zustand'

interface SoundStore {
  backgroundMusicRef: HTMLAudioElement | null
  fireballRef: HTMLAudioElement | null
  debrisRef: HTMLAudioElement | null
  isMusicPlaying: boolean

  setBackgroundMusicRef: (ref: HTMLAudioElement) => void
  setFireballRef: (ref: HTMLAudioElement) => void
  setDebrisRef: (ref: HTMLAudioElement) => void

  playBackgroundMusic: () => void
  pauseBackgroundMusic: () => void
  resumeBackgroundMusic: () => void
  restartBackgroundMusic: () => void
  playFireballSound: () => void
  playDebrisSound: () => void
}

export const useSoundStore = create<SoundStore>((set, get) => ({
  backgroundMusicRef: null,
  fireballRef: null,
  debrisRef: null,
  isMusicPlaying: false,

  setBackgroundMusicRef: (ref) => set({ backgroundMusicRef: ref }),
  setFireballRef: (ref) => set({ fireballRef: ref }),
  setDebrisRef: (ref) => set({ debrisRef: ref }),

  playBackgroundMusic: () => {
    const { backgroundMusicRef } = get()
    if (backgroundMusicRef) {
      backgroundMusicRef.play().catch(console.error)
      set({ isMusicPlaying: true })
    }
  },

  pauseBackgroundMusic: () => {
    const { backgroundMusicRef } = get()
    if (backgroundMusicRef && !backgroundMusicRef.paused) {
      backgroundMusicRef.pause()
      set({ isMusicPlaying: false })
    }
  },

  resumeBackgroundMusic: () => {
    const { backgroundMusicRef } = get()
    if (backgroundMusicRef && backgroundMusicRef.paused) {
      backgroundMusicRef.play().catch(console.error)
      set({ isMusicPlaying: true })
    }
  },

  restartBackgroundMusic: () => {
    const { backgroundMusicRef } = get()
    if (backgroundMusicRef) {
      backgroundMusicRef.currentTime = 0
      backgroundMusicRef.play().catch(console.error)
      set({ isMusicPlaying: true })
    }
  },

  playFireballSound: () => {
    const { fireballRef } = get()
    if (fireballRef) {
      fireballRef.currentTime = 0
      fireballRef.volume = 0.2
      fireballRef.play().catch(() => {})
    }
  },

  playDebrisSound: () => {
    const { debrisRef } = get()
    if (debrisRef) {
      debrisRef.currentTime = 0
      debrisRef.volume = 0.25
      debrisRef.play().catch(() => {})
    }
  },
}))
