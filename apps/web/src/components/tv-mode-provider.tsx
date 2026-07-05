"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { detectTvMode } from "@/lib/tv";

const TvModeContext = createContext(false);

/**
 * Detects Fire TV / ?tv=1 once on mount, persists it for the session, and
 * applies the `tv-mode` class to <html> so global CSS (overscan padding,
 * font bump, amber focus ring, cursor hiding) kicks in on every route.
 */
export function TvModeProvider({ children }: { children: React.ReactNode }) {
  const [tvMode, setTvMode] = useState(false);

  useEffect(() => {
    const isTv = detectTvMode();
    setTvMode(isTv);
    document.documentElement.classList.toggle("tv-mode", isTv);
  }, []);

  return (
    <TvModeContext.Provider value={tvMode}>{children}</TvModeContext.Provider>
  );
}

export function useTvMode() {
  return useContext(TvModeContext);
}
