"use client";

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Drop-in replacement for `useRouter` that exposes the same `push / replace / back`
 * surface.  The actual animation is handled by `<PageTransition>` which reacts to
 * `usePathname()` changes, so this hook is intentionally thin — it just forwards
 * calls to the Next.js router.  It exists so call-sites have a single import and
 * we can add pre/post-navigation hooks later without touching every file.
 */
export function useTransitionRouter() {
  const router = useRouter();

  const navigate = useCallback(
    (href: string, opts?: { replace?: boolean; scroll?: boolean }) => {
      if (opts?.replace) {
        router.replace(href, { scroll: opts.scroll });
      } else {
        router.push(href, { scroll: opts?.scroll });
      }
    },
    [router],
  );

  const navigateBack = useCallback(() => router.back(), [router]);
  const navigateForward = useCallback(() => router.forward(), [router]);

  return {
    navigate,
    navigateBack,
    navigateForward,
    push: router.push,
    replace: router.replace,
    back: router.back,
    forward: router.forward,
    refresh: router.refresh,
  };
}

export default useTransitionRouter;
