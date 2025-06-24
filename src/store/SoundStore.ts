import { create } from 'zustand'

interface SoundStore {
  backgroundMusicRef: HTMLAudioElement | null
  fireballRef: HTMLAudioElement | null
  debrisRef: HTMLAudioElement | null

  setBackgroundMusicRef: (ref: HTMLAudioElement | null) => void
  setFireballRef: (ref: HTMLAudioElement | null) => void
  setDebrisRef: (ref: HTMLAudioElement | null) => void

  playBackgroundMusic: () => void
  stopBackgroundMusic: () => void
  playFireballSound: () => void
  playDebrisSound: () => void
}

export const useSoundStore = create<SoundStore>((set, get) => ({
  backgroundMusicRef: null,
  fireballRef: null,
  debrisRef: null,

  setBackgroundMusicRef: (ref) => set({ backgroundMusicRef: ref }),
  setFireballRef: (ref) => set({ fireballRef: ref }),
  setDebrisRef: (ref) => set({ debrisRef: ref }),

  playBackgroundMusic: () => {
    const { backgroundMusicRef } = get()
    if (backgroundMusicRef) {
      backgroundMusicRef.currentTime = 0
      backgroundMusicRef.loop = true
      backgroundMusicRef.volume = 0.4
      backgroundMusicRef.play().catch(() => {})
    }
  },

  stopBackgroundMusic: () => {
    const { backgroundMusicRef } = get()
    if (backgroundMusicRef) {
      backgroundMusicRef.pause()
      backgroundMusicRef.currentTime = 0
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
      debrisRef.volume = 0.5
      debrisRef.play().catch(() => {})
    }
  },
}))

export const usePlayBackgroundMusic = () =>
  useSoundStore((state) => state.playBackgroundMusic)
export const useStopBackgroundMusic = () =>
  useSoundStore((state) => state.stopBackgroundMusic)
export const usePlayFireballSound = () =>
  useSoundStore((state) => state.playFireballSound)
export const usePlayDebrisSound = () =>
  useSoundStore((state) => state.playDebrisSound)
