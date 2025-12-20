"use client";

import { useEffect, useRef, useState } from "react";

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Attempt to play on mount (will likely be blocked by browser until interaction)
    const playAudio = async () => {
      if (audioRef.current) {
        try {
          audioRef.current.volume = 0.2; // Keep it subtle
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (err) {
          console.log("Autoplay blocked. Waiting for interaction.");
        }
      }
    };

    if (hasInteracted) {
      playAudio();
    }
  }, [hasInteracted]);

  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      <audio
        ref={audioRef}
        src="https://cdn.pixabay.com/audio/2022/03/10/audio_4a468400c6.mp3"
        loop
      />
      <button
        onClick={() => {
          if (audioRef.current) {
            if (isPlaying) {
              audioRef.current.pause();
            } else {
              audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
          }
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#1a1a1a] bg-[#f4c542] shadow-[2px_2px_0px_#1a1a1a] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
        title={isPlaying ? "Mute Bells" : "Play Bells"}
      >
        {isPlaying ? "🔔" : "🔕"}
      </button>
    </div>
  );
}

