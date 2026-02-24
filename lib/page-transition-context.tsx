"use client";

import React, { createContext, useContext, useCallback, useState, useMemo } from 'react';

export interface PageTransitionContextType {
  /** true while an animation is in progress */
  isTransitioning: boolean;
  setIsTransitioning: (v: boolean) => void;
  /** user can disable transitions globally (e.g. from settings) */
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}

const PageTransitionContext = createContext<PageTransitionContextType | undefined>(undefined);

export function PageTransitionProvider({
  children,
  defaultEnabled = true,
}: {
  children: React.ReactNode;
  defaultEnabled?: boolean;
}) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [enabled, setEnabled]                 = useState(defaultEnabled);

  const value = useMemo<PageTransitionContextType>(() => ({
    isTransitioning,
    setIsTransitioning,
    enabled,
    setEnabled,
  }), [isTransitioning, enabled]);

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const ctx = useContext(PageTransitionContext);
  if (!ctx) throw new Error('usePageTransition must be used within PageTransitionProvider');
  return ctx;
}

export default PageTransitionProvider;
