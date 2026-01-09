/**
 * Time Loop - React State Separation for Animation Frames
 * 
 * CRITICAL REQUIREMENTS:
 * - No React setState on every animation frame
 * - Use ref-based callbacks for time updates
 * - Minimal overhead per frame
 * - Clean cancellation on unmount
 */

import { AudioRuntime } from "./audioRuntime";

/**
 * Start a time loop that calls onFrame with current time
 * Uses requestAnimationFrame for smooth updates
 * 
 * IMPORTANT: onFrame should update refs, NOT React state
 * React state should only be updated on user interactions or playback stop
 * 
 * @param runtime - AudioRuntime instance for time tracking
 * @param duration - Total audio duration in seconds
 * @param onFrame - Callback with current time (use refs, not setState)
 * @returns Cleanup function to stop the loop
 */
export function startTimeLoop(
  runtime: AudioRuntime,
  duration: number,
  onFrame: (currentTime: number) => void
): () => void {
  let rafId: number;
  let isRunning = true;

  const tick = () => {
    if (!isRunning) return;
    
    // Get current time from runtime (ref-based, no React state)
    const t = Math.min(runtime.getCurrentTime(), duration);
    
    // Call frame callback (should update refs, not setState)
    onFrame(t);
    
    // Continue loop if still playing
    if (runtime.isPlaying) {
      rafId = requestAnimationFrame(tick);
    }
  };

  // Start the loop
  rafId = requestAnimationFrame(tick);

  // Return cleanup function
  return () => {
    isRunning = false;
    cancelAnimationFrame(rafId);
  };
}

/**
 * Create a throttled time loop for less frequent updates
 * Useful for updating React state at lower frequency (e.g., every 100ms)
 * 
 * @param runtime - AudioRuntime instance
 * @param duration - Total audio duration in seconds
 * @param onFrame - Callback with current time
 * @param intervalMs - Minimum interval between callbacks (default 100ms)
 * @returns Cleanup function
 */
export function startThrottledTimeLoop(
  runtime: AudioRuntime,
  duration: number,
  onFrame: (currentTime: number) => void,
  intervalMs: number = 100
): () => void {
  let rafId: number;
  let isRunning = true;
  let lastCallTime = 0;

  const tick = (timestamp: number) => {
    if (!isRunning) return;
    
    // Only call onFrame if enough time has passed
    if (timestamp - lastCallTime >= intervalMs) {
      const t = Math.min(runtime.getCurrentTime(), duration);
      onFrame(t);
      lastCallTime = timestamp;
    }
    
    // Continue loop if still playing
    if (runtime.isPlaying) {
      rafId = requestAnimationFrame(tick);
    }
  };

  // Start the loop
  rafId = requestAnimationFrame(tick);

  // Return cleanup function
  return () => {
    isRunning = false;
    cancelAnimationFrame(rafId);
  };
}

/**
 * Dual-loop system for optimal performance:
 * - Fast loop (every frame): Updates playhead canvas via ref
 * - Slow loop (throttled): Updates React state for UI display
 * 
 * @param runtime - AudioRuntime instance
 * @param duration - Total audio duration in seconds
 * @param onFastFrame - Fast callback for playhead (ref-based)
 * @param onSlowFrame - Slow callback for React state
 * @param slowIntervalMs - Interval for slow updates (default 100ms)
 * @returns Cleanup function
 */
export function startDualTimeLoop(
  runtime: AudioRuntime,
  duration: number,
  onFastFrame: (currentTime: number) => void,
  onSlowFrame: (currentTime: number) => void,
  slowIntervalMs: number = 100
): () => void {
  let rafId: number;
  let isRunning = true;
  let lastSlowCallTime = 0;

  const tick = (timestamp: number) => {
    if (!isRunning) return;
    
    const t = Math.min(runtime.getCurrentTime(), duration);
    
    // Fast update (every frame) - for playhead canvas
    onFastFrame(t);
    
    // Slow update (throttled) - for React state
    if (timestamp - lastSlowCallTime >= slowIntervalMs) {
      onSlowFrame(t);
      lastSlowCallTime = timestamp;
    }
    
    // Continue loop if still playing
    if (runtime.isPlaying) {
      rafId = requestAnimationFrame(tick);
    }
  };

  // Start the loop
  rafId = requestAnimationFrame(tick);

  // Return cleanup function
  return () => {
    isRunning = false;
    cancelAnimationFrame(rafId);
  };
}
