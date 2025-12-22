import { useEffect, useRef, useState } from 'react'

type Options = {
  src: string
  volume?: number
  loop?: boolean
}

export function useBackgroundMusic({ src, volume = 0.25, loop = true }: Options) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    const audio = new Audio(src)
    audio.loop = loop
    audio.volume = volume
    audio.preload = 'auto'
    audioRef.current = audio

    let disposed = false

    const tryPlay = async () => {
      try {
        // Some browsers block unless user has interacted.
        await audio.play()
        if (disposed) return
        setIsPlaying(true)
        setIsBlocked(false)
      } catch {
        if (disposed) return
        setIsPlaying(false)
        setIsBlocked(true)
      }
    }

    // Attempt autoplay on mount (with a small delay to not compete with initial render)
    const timeoutId = setTimeout(() => {
      void tryPlay()
    }, 500)

    // If blocked, start on first interaction
    const onFirstInteraction = async () => {
      if (!audioRef.current) return
      try {
        await audioRef.current.play()
        if (disposed) return
        setIsPlaying(true)
        setIsBlocked(false)
      } catch {
        // Still blocked (rare) — keep blocked state
        if (disposed) return
        setIsPlaying(false)
        setIsBlocked(true)
      } finally {
        window.removeEventListener('pointerdown', onFirstInteraction)
        window.removeEventListener('keydown', onFirstInteraction)
        window.removeEventListener('touchstart', onFirstInteraction)
      }
    }

    window.addEventListener('pointerdown', onFirstInteraction, { passive: true })
    window.addEventListener('keydown', onFirstInteraction)
    window.addEventListener('touchstart', onFirstInteraction, { passive: true })

    return () => {
      disposed = true
      clearTimeout(timeoutId)
      window.removeEventListener('pointerdown', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
      window.removeEventListener('touchstart', onFirstInteraction)

      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [src, loop, volume])

  const pause = () => {
    const a = audioRef.current
    if (!a) return
    a.pause()
    setIsPlaying(false)
  }

  const play = async () => {
    const a = audioRef.current
    if (!a) return
    try {
      await a.play()
      setIsPlaying(true)
      setIsBlocked(false)
    } catch {
      setIsPlaying(false)
      setIsBlocked(true)
    }
  }

  const setVolume = (v: number) => {
    const a = audioRef.current
    if (!a) return
    a.volume = Math.max(0, Math.min(1, v))
  }

  return { isPlaying, isBlocked, play, pause, setVolume }
}

