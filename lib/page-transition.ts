/**
 * Simple page transition implementation
 * Replaces the missing ../../tema/src/page-transition
 */

export interface PageTransitionOptions {
  enteringEl: HTMLElement;
  leavingEl: HTMLElement;
  direction: 'forward' | 'back';
}

/**
 * Runs an iOS-style page transition animation using Web Animations API
 */
export function runPageTransition(options: PageTransitionOptions): Promise<void> {
  const { enteringEl, leavingEl, direction } = options;
  
  // Animation duration and easing
  const duration = 300;
  const easing = 'cubic-bezier(0.32, 0.72, 0, 1)';
  
  // Determine animation direction
  const isForward = direction === 'forward';
  
  // Starting and ending positions
  const enterFrom = isForward ? '100%' : '-33%';
  const enterTo = '0%';
  const leaveFrom = '0%';
  const leaveTo = isForward ? '-33%' : '100%';
  
  // Set initial positions
  enteringEl.style.transform = `translateX(${enterFrom})`;
  leavingEl.style.transform = `translateX(${leaveFrom})`;
  
  // Create animations
  const enterAnimation = enteringEl.animate([
    { 
      transform: `translateX(${enterFrom})`,
      opacity: '0.8'
    },
    { 
      transform: `translateX(${enterTo})`,
      opacity: '1'
    }
  ], {
    duration,
    easing,
    fill: 'forwards'
  });
  
  const leaveAnimation = leavingEl.animate([
    { 
      transform: `translateX(${leaveFrom})`,
      opacity: '1'
    },
    { 
      transform: `translateX(${leaveTo})`,
      opacity: '0.8'
    }
  ], {
    duration,
    easing,
    fill: 'forwards'
  });
  
  // Return promise that resolves when both animations complete
  return Promise.all([
    enterAnimation.finished,
    leaveAnimation.finished
  ]).then(() => {
    // Clean up
    enteringEl.style.transform = '';
    enteringEl.style.opacity = '';
  });
}
