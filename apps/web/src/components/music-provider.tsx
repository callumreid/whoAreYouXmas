'use client'

import { useBackgroundMusic } from '@/lib/useBackgroundMusic'

export function MusicProvider() {
  const { isBlocked, isPlaying, play, pause } = useBackgroundMusic({
    src: '/audio/sleighbells.mp3',
    volume: 0.18,
    loop: true
  })

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={isPlaying ? pause : play}
        className="rounded-xl px-3 py-2 shadow bg-white/90 backdrop-blur"
      >
        {isPlaying ? '🔊 Music on' : '🔇 Music off'}
        {isBlocked ? ' (tap to start)' : ''}
      </button>
    </div>
  )
}

