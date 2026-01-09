/**
 * AudioRuntime - Performance-optimized audio playback engine
 * 
 * CRITICAL REQUIREMENTS:
 * - No React state updates on every animation frame
 * - Gain-based volume control with smooth transitions
 * - Ref-based time tracking for playhead updates
 * - Minimal main thread blocking
 */
export class AudioRuntime {
  private ctx: AudioContext;
  private source: AudioBufferSourceNode | null = null;
  private gain: GainNode;
  private startTime = 0;
  private offset = 0;
  private _isPlaying = false;
  private _buffer: AudioBuffer | null = null;
  private onEndedCallback: (() => void) | null = null;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.gain = ctx.createGain();
    this.gain.connect(ctx.destination);
  }

  /**
   * Start playback from current offset position
   */
  play(buffer: AudioBuffer) {
    this.stop();
    this._buffer = buffer;

    // Resume context if suspended (browser autoplay policy)
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.gain);

    this.startTime = this.ctx.currentTime;
    src.start(0, this.offset);
    this.source = src;
    this._isPlaying = true;

    // Handle natural end of playback
    src.onended = () => {
      if (this._isPlaying && this.source === src) {
        this._isPlaying = false;
        this.offset = 0;
        this.source = null;
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      }
    };
  }

  /**
   * Pause playback and preserve position
   */
  pause() {
    if (!this.source || !this._isPlaying) return;
    
    // Calculate current position before stopping
    this.offset = this.getCurrentTime();
    this.stop();
  }

  /**
   * Seek to specific time and continue playback if was playing
   */
  seek(time: number, buffer?: AudioBuffer) {
    const wasPlaying = this._isPlaying;
    const targetBuffer = buffer || this._buffer;
    
    if (!targetBuffer) return;
    
    // Clamp time to valid range
    this.offset = Math.max(0, Math.min(time, targetBuffer.duration));
    
    if (wasPlaying) {
      this.play(targetBuffer);
    }
  }

  /**
   * Stop playback and reset position
   */
  stop() {
    this._isPlaying = false;
    if (this.source) {
      try {
        this.source.stop();
        this.source.disconnect();
      } catch {
        // Ignore errors if already stopped
      }
      this.source = null;
    }
  }

  /**
   * Reset to beginning
   */
  reset() {
    this.stop();
    this.offset = 0;
  }

  /**
   * Set volume with smooth transition (no clicks/pops)
   * Uses exponential ramp for natural-sounding volume changes
   */
  setVolume(v: number) {
    // Clamp volume to valid range
    const volume = Math.max(0, Math.min(1, v));
    // Use setTargetAtTime for smooth transitions (0.01s time constant)
    this.gain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.01);
  }

  /**
   * Get current playback time (ref-based, no React state)
   */
  getCurrentTime(): number {
    if (this.source && this._isPlaying) {
      const elapsed = this.ctx.currentTime - this.startTime;
      const duration = this._buffer?.duration || Infinity;
      return Math.min(this.offset + elapsed, duration);
    }
    return this.offset;
  }

  /**
   * Check if currently playing
   */
  get isPlaying(): boolean {
    return this._isPlaying;
  }

  /**
   * Get the current audio buffer
   */
  get buffer(): AudioBuffer | null {
    return this._buffer;
  }

  /**
   * Set callback for when playback ends naturally
   */
  setOnEnded(callback: () => void) {
    this.onEndedCallback = callback;
  }

  /**
   * Get the AudioContext (for external use)
   */
  getContext(): AudioContext {
    return this.ctx;
  }

  /**
   * Dispose and cleanup
   */
  dispose() {
    this.stop();
    this.gain.disconnect();
  }
}
