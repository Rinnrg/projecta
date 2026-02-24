"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  runPageTransition,
  type PageTransitionOptions
} from '@/lib/page-transition';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps `children` and plays an iOS-style slide transition whenever the
 * Next.js pathname changes.
 *
 * How it works:
 * 1. On mount, `pathname` is recorded and `children` render into `.pt-page`.
 * 2. When `pathname` changes, the *current* `.pt-page` DOM is cloned into a
 *    disposable ghost layer (`.pt-ghost`).
 * 3. `runPageTransition` (from tema) animates the ghost out and the real page
 *    in simultaneously via the Web Animations API on the GPU.
 * 4. When the animation finishes the ghost is removed — nothing else re-renders.
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const pathname           = usePathname();
  const containerRef       = useRef<HTMLDivElement>(null);
  const pageRef            = useRef<HTMLDivElement>(null);
  const prevPathnameRef    = useRef(pathname);
  const historyStackRef    = useRef<string[]>([pathname]);
  const isAnimatingRef     = useRef(false);

  /** Decide forward / back based on a simple history stack */
  const resolveDirection = useCallback(
    (next: string): 'forward' | 'back' => {
      const stack = historyStackRef.current;
      const idx   = stack.lastIndexOf(next);

      // If the path already exists earlier in the stack → we're going back
      if (idx !== -1 && idx < stack.length - 1) {
        // Pop everything after that index
        historyStackRef.current = stack.slice(0, idx + 1);
        return 'back';
      }

      // Parent-route shortcut:  /a/b/c → /a/b  is always "back"
      const prev = stack[stack.length - 1];
      if (prev && prev.startsWith(next) && next.length < prev.length) {
        // Pop to that parent
        const parentIdx = stack.findIndex((p) => p === next);
        if (parentIdx !== -1) {
          historyStackRef.current = stack.slice(0, parentIdx + 1);
        } else {
          historyStackRef.current = [...stack, next];
        }
        return 'back';
      }

      // Otherwise it's a forward push
      historyStackRef.current = [...stack, next];
      return 'forward';
    },
    [],
  );

  useEffect(() => {
    // Skip on first render or if path didn't actually change
    if (pathname === prevPathnameRef.current) return;

    const container = containerRef.current;
    const page      = pageRef.current;
    if (!container || !page) {
      prevPathnameRef.current = pathname;
      return;
    }

    // Prevent overlapping transitions
    if (isAnimatingRef.current) {
      // If we're still animating, just record the new path – no second animation
      prevPathnameRef.current = pathname;
      return;
    }

    const direction = resolveDirection(pathname);
    prevPathnameRef.current = pathname;
    isAnimatingRef.current  = true;

    // ── clone the OLD page into a disposable ghost ──
    const ghost = page.cloneNode(true) as HTMLDivElement;
    ghost.setAttribute('aria-hidden', 'true');
    ghost.classList.remove('pt-page');
    ghost.classList.add('pt-ghost');
    container.appendChild(ghost);

    // ── hide the real page briefly so the first frame is clean ──
    page.style.opacity = '0';

    // Wait one frame for the new React children to paint into `page`
    requestAnimationFrame(() => {
      page.style.opacity = '';          // un-hide

      const opts: PageTransitionOptions = {
        enteringEl: page,
        leavingEl:  ghost,
        direction,
      };

      runPageTransition(opts)
        .catch(() => {
          // Swallow – the ghost will just be removed
        })
        .finally(() => {
          ghost.remove();
          isAnimatingRef.current = false;
        });
    });
  }, [pathname, resolveDirection]);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches && containerRef.current) {
      containerRef.current.dataset.reducedMotion = 'true';
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`pt-container ${className}`}
    >
      <div ref={pageRef} className="pt-page">
        {children}
      </div>
    </div>
  );
}

export default PageTransition;
