/**
 * Waveform Playhead Renderer - Performance-optimized playhead-only updates
 * 
 * CRITICAL REQUIREMENTS:
 * - Separate canvas layer for playhead (no waveform re-rendering)
 * - Minimal canvas operations per frame
 * - No React state updates on animation frames
 */

/**
 * Draw playhead line on a separate canvas layer
 * This function is called on every animation frame during playback
 * 
 * @param ctx - Canvas 2D rendering context (playhead layer only)
 * @param width - Canvas width in CSS pixels
 * @param height - Canvas height in CSS pixels
 * @param currentTime - Current playback position in seconds
 * @param duration - Total audio duration in seconds
 * @param dpr - Device pixel ratio for retina displays
 */
export function drawPlayhead(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  currentTime: number,
  duration: number,
  dpr: number = 1
) {
  if (duration <= 0) return;

  // Calculate playhead position
  const x = (currentTime / duration) * width;

  // Clear only the playhead canvas (not the waveform)
  ctx.clearRect(0, 0, width * dpr, height * dpr);

  // Save context state
  ctx.save();
  
  // Scale for device pixel ratio
  ctx.scale(dpr, dpr);

  // Draw playhead line
  ctx.strokeStyle = "oklch(0.75 0.15 195)"; // Forensic cyan
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
  ctx.stroke();

  // Draw playhead handle (circle at top)
  ctx.fillStyle = "oklch(0.75 0.15 195)";
  ctx.beginPath();
  ctx.arc(x, 8, 4, 0, Math.PI * 2);
  ctx.fill();

  // Restore context state
  ctx.restore();
}

/**
 * Initialize playhead canvas with proper sizing
 * 
 * @param canvas - HTMLCanvasElement for playhead layer
 * @param width - Container width in CSS pixels
 * @param height - Container height in CSS pixels
 * @returns Device pixel ratio used
 */
export function initPlayheadCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): number {
  const dpr = window.devicePixelRatio || 1;
  
  // Set canvas size with DPR for sharp rendering
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  
  // Set CSS size to match container
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  
  return dpr;
}

/**
 * Clear playhead canvas completely
 * 
 * @param ctx - Canvas 2D rendering context
 * @param width - Canvas width in CSS pixels
 * @param height - Canvas height in CSS pixels
 * @param dpr - Device pixel ratio
 */
export function clearPlayhead(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number = 1
) {
  ctx.clearRect(0, 0, width * dpr, height * dpr);
}
