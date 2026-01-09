# DetectX Audio — Waveform & Audio State Architecture

This document provides the exact source files responsible for waveform rendering, audio playback state management, waveform data generation, and timeline/cursor/zoom logic. All analysis panels and live scan components should be implemented against the same time and state reference described here.

---

## 1. Core Source Files

| File | Purpose |
|------|---------|
| `client/src/components/WaveformVisualization.tsx` | Main waveform rendering component |
| `client/src/components/AudioPlayerBar.tsx` | Playback controls (play/pause/stop/seek/volume) |
| `client/src/pages/Home.tsx` | Central state management for audio and verification |
| `client/src/components/TimelineContext.tsx` | Timeline markers visualization |
| `client/src/components/SourceComponents.tsx` | Stem-specific waveform visualization |

---

## 2. Waveform Rendering (`WaveformVisualization.tsx`)

### Props Interface

```typescript
interface WaveformVisualizationProps {
  audioBuffer: AudioBuffer | null;  // Decoded audio data
  currentTime: number;               // Current playback position (seconds)
  duration: number;                  // Total audio duration (seconds)
  markers?: TimelineMarker[];        // Timeline event markers
  onSeek?: (time: number) => void;   // Seek callback
  isPlaying?: boolean;               // Playback state
  isDecoding?: boolean;              // Async decoding indicator
}
```

### Key Features

- **Canvas-based rendering** with device pixel ratio support
- **Amplitude scale control** (1x to 4x zoom)
- **Playhead position** bidirectionally linked to `currentTime`
- **Click-to-seek** functionality
- **Timeline markers** rendered as vertical lines
- **Two-phase rendering**: placeholder → decoded waveform

### Waveform Data Generation

The waveform is generated directly from `AudioBuffer.getChannelData(0)`:

```typescript
const channelData = audioBuffer.getChannelData(0);
const samplesPerPixel = Math.floor(channelData.length / width);

for (let x = 0; x < width; x++) {
  const startSample = x * samplesPerPixel;
  const endSample = Math.min(startSample + samplesPerPixel, channelData.length);
  
  let min = 0, max = 0;
  for (let i = startSample; i < endSample; i++) {
    const sample = channelData[i];
    if (sample < min) min = sample;
    if (sample > max) max = sample;
  }
  
  // Draw vertical line from min to max
  ctx.moveTo(x, centerY - min * amplitude);
  ctx.lineTo(x, centerY - max * amplitude);
}
```

### Playhead Rendering

```typescript
if (duration > 0) {
  const playheadX = (currentTime / duration) * width;
  ctx.strokeStyle = "oklch(0.75 0.15 195)"; // Forensic cyan
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(playheadX, 0);
  ctx.lineTo(playheadX, height);
  ctx.stroke();
}
```

### Click-to-Seek Handler

```typescript
const handleClick = useCallback(
  (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSeek || !audioBuffer || duration <= 0) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = clickRatio * duration;
    
    onSeek(targetTime);
  },
  [onSeek, duration, audioBuffer]
);
```

---

## 3. Audio Playback State Management (`Home.tsx`)

### State Variables

```typescript
// Audio state
const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
const [isDecodingAudio, setIsDecodingAudio] = useState(false);

// Player state
const [isPlaying, setIsPlaying] = useState(false);
const [currentTime, setCurrentTime] = useState(0);
const [duration, setDuration] = useState(0);
const [volume, setVolume] = useState(1);

// Audio refs
const audioContextRef = useRef<AudioContext | null>(null);
const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
const gainNodeRef = useRef<GainNode | null>(null);
const startTimeRef = useRef<number>(0);
const pauseTimeRef = useRef<number>(0);
const animationFrameRef = useRef<number | null>(null);
```

### Time Update Loop

```typescript
const updateTime = () => {
  if (audioContextRef.current && sourceNodeRef.current) {
    const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
    setCurrentTime(Math.min(elapsed, duration));
    
    if (elapsed < duration) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    } else {
      stopPlayback();
    }
  }
};
```

### Seek Handler (Critical for Synchronization)

```typescript
const handleSeek = useCallback(
  (time: number) => {
    // Clamp time to valid range
    const clampedTime = Math.max(0, Math.min(time, duration));
    
    // Update UI state synchronously
    pauseTimeRef.current = clampedTime;
    setCurrentTime(clampedTime);
    
    // If playing, restart from new position
    if (isPlaying && audioBuffer && audioContextRef.current) {
      // Stop current source, create new source at clampedTime
      // ... (see full implementation in Home.tsx lines 513-588)
    }
  },
  [isPlaying, duration, audioBuffer, volume, stopPlayback]
);
```

---

## 4. Timeline Markers (`TimelineContext.tsx`)

### Marker Interface

```typescript
interface TimelineMarker {
  timestamp: number; // milliseconds
  type: string;      // "structural_event", "signal_anomaly", etc.
}
```

### Position Calculation

```typescript
const position = (marker.timestamp / (duration * 1000)) * 100;
// Renders as: style={{ left: `${position}%` }}
```

### Type Labels

```typescript
const TYPE_LABELS: Record<string, string> = {
  structural_event: "Structural Event",
  signal_anomaly: "Signal Anomaly",
  pattern_break: "Pattern Break",
  spectral_shift: "Spectral Shift",
};
```

---

## 5. Amplitude/Zoom Control

### Current Implementation

```typescript
const [amplitudeScale, setAmplitudeScale] = useState(1);

// Applied to waveform rendering:
const amplitude = height * 0.4 * amplitudeScale;

// UI control (1x to 4x):
{[1, 2, 3, 4].map((scale) => (
  <button
    key={scale}
    onClick={() => setAmplitudeScale(scale)}
    className={amplitudeScale === scale ? "active" : ""}
  >
    {scale}x
  </button>
))}
```

---

## 6. Stem Waveforms (`SourceComponents.tsx`)

### Deterministic Waveform Generation

```typescript
function generateStemWaveform(stemId: string, pointCount: number = 100): number[] {
  const seed = stemId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const waveform: number[] = [];
  
  for (let i = 0; i < pointCount; i++) {
    const noise = Math.sin(seed * 0.01 + i * 0.5) * 0.3 +
                  Math.sin(seed * 0.03 + i * 0.8) * 0.2 +
                  Math.sin(seed * 0.02 + i * 1.1) * 0.15;
    const amplitude = 0.3 + Math.abs(noise) * 0.7;
    waveform.push(Math.min(1, Math.max(0.1, amplitude)));
  }
  
  return waveform;
}
```

### SVG Waveform Rendering

```typescript
<svg viewBox="0 0 100 40">
  <path
    d={waveformData.map((amp, i) => {
      const x = (i / (waveformData.length - 1)) * 100;
      const y = 20 - (amp * 20 * 0.85);
      return `${x},${y}`;
    }).join(' L ')}
    fill="none"
    stroke="currentColor"
  />
</svg>
```

---

## 7. Integration Points for Analysis Panels

### Shared State Reference

All analysis panels should consume the following from `Home.tsx`:

| State | Type | Description |
|-------|------|-------------|
| `currentTime` | `number` | Current playback position in seconds |
| `duration` | `number` | Total audio duration in seconds |
| `audioBuffer` | `AudioBuffer \| null` | Decoded audio data |
| `isPlaying` | `boolean` | Playback state |
| `verificationResult.timelineMarkers` | `TimelineMarker[]` | Detected events |

### Time Synchronization Formula

```typescript
// Convert pixel position to time:
const time = (pixelX / containerWidth) * duration;

// Convert time to pixel position:
const pixelX = (time / duration) * containerWidth;

// Convert time to sample index:
const sampleIndex = Math.floor((time / duration) * audioBuffer.length);
```

### Event Coordination

To synchronize with the main waveform:

1. **Subscribe to `currentTime`** for playhead position
2. **Use `duration`** for timeline scaling
3. **Call `onSeek(time)`** to trigger synchronized seeking
4. **Read `audioBuffer.getChannelData(0)`** for raw sample access

---

## 8. File Locations Summary

```
client/src/
├── components/
│   ├── WaveformVisualization.tsx   # Main waveform canvas
│   ├── AudioPlayerBar.tsx          # Playback controls
│   ├── TimelineContext.tsx         # Timeline markers
│   ├── SourceComponents.tsx        # Stem waveforms
│   └── AnalysisSkeleton.tsx        # Loading states
└── pages/
    └── Home.tsx                    # Central state management
```

---

## 9. Performance Considerations

- **Two-phase rendering**: Placeholder shown immediately, detailed waveform async
- **requestAnimationFrame**: Used for all time updates and audio processing
- **Device pixel ratio**: Canvas scaled for retina displays
- **Samples per pixel**: Dynamically calculated based on container width

---

## 10. Critical Constraints

1. **Filename Independence**: Waveform rendering NEVER depends on filename content
2. **Bidirectional Linking**: Waveform playhead and `currentTime` are always synchronized
3. **Click-to-Seek**: Clicking waveform ALWAYS seeks to clicked timestamp, never resets to 0:00
4. **No Blocking**: Main thread is NEVER blocked by waveform processing
