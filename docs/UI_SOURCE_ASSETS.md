# DetectX Audio - UI Source Assets

## Overview

This document provides pure UI source assets for `detectx.app/verify-audio.html`.

**Included:**
- JSX/TSX layout components
- Waveform and player UI markup
- Styles and CSS variables
- Interaction mappings (event handler signatures)

**Excluded:**
- Audio playback logic
- State management
- Analysis computation
- Verdict logic

All runtime behavior should be reimplemented internally.

---

## Component Hierarchy

```
ForensicLayout (main wrapper)
├── Header
│   ├── Logo
│   ├── Title: "Audio Verification"
│   └── Navigation: Home, Technology, Methodology, Use Cases, Contact, About Us
├── Sidebar
│   ├── VERIFY section
│   │   └── Audio (active)
│   └── ACCOUNT section
│       ├── History
│       ├── Settings
│       └── Plan
└── Main Content
    ├── Top Section (3-column grid)
    │   ├── Left Column
    │   │   ├── AudioUploadPanel
    │   │   └── MetadataPanel
    │   └── Center Column (2-col span)
    │       ├── WaveformVisualization
    │       ├── AudioPlayerBar
    │       └── LiveScanConsole
    ├── VerdictPanel
    ├── Analysis Section (3-column grid)
    │   ├── Left Column
    │   │   ├── TimelineAnalysis
    │   │   ├── TemporalAnalysis
    │   │   └── DetailedAnalysis
    │   └── Right Column (2-col span)
    │       └── SourceComponents
    ├── Geometry Section (3-column grid)
    │   ├── GeometryScanTrace (2-col span)
    │   └── TimelineContext
    └── Export Section (2-column grid)
        ├── ReportPreview
        └── ExportPanel
```

---

## CSS Variables (Theme)

```css
/* client/src/index.css - @layer base */

:root {
  /* Core colors */
  --background: oklch(0.12 0.01 260);
  --foreground: oklch(0.95 0.01 260);
  
  /* Card surfaces */
  --card: oklch(0.14 0.01 260);
  --card-foreground: oklch(0.95 0.01 260);
  
  /* Muted elements */
  --muted: oklch(0.20 0.01 260);
  --muted-foreground: oklch(0.60 0.01 260);
  
  /* Borders */
  --border: oklch(0.25 0.02 260);
  
  /* Primary accent */
  --primary: oklch(0.75 0.15 195);
  --primary-foreground: oklch(0.12 0.01 260);
  
  /* Forensic colors */
  --forensic-cyan: oklch(0.75 0.15 195);
  --forensic-green: oklch(0.70 0.15 145);
  --forensic-amber: oklch(0.75 0.15 85);
  --forensic-red: oklch(0.65 0.20 25);
}

.dark {
  /* Same values for dark mode */
}
```

---

## Shared UI Patterns

### Forensic Panel

```tsx
<div className="forensic-panel">
  <div className="forensic-panel-header">
    <span>PANEL TITLE</span>
  </div>
  <div className="p-4">
    {/* Panel content */}
  </div>
</div>
```

```css
.forensic-panel {
  @apply bg-card border border-border rounded-lg overflow-hidden;
  box-shadow: 
    inset 0 1px 0 oklch(0.25 0.01 260 / 30%),
    0 2px 8px oklch(0 0 0 / 40%);
}

.forensic-panel-header {
  @apply px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-foreground;
  @apply border-b border-border bg-muted/30;
}
```

### Skeleton Placeholder

```tsx
<div className="animate-pulse bg-muted/50 rounded h-4 w-full" />
```

---


## 1. ForensicLayout (Main Wrapper)

### Structure

```tsx
<div className="min-h-screen bg-background">
  {/* Sidebar - fixed left */}
  <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
    {/* Brand area - h-20 (80px) */}
    <div className="h-20 flex items-center px-6 border-b border-sidebar-border">
      <div className="flex items-center gap-4">
        <img src="/detectx-logo.png" alt="DetectX" className="w-10 h-10 object-contain" />
        <span className="text-xl font-semibold text-sidebar-foreground tracking-tight">DetectX</span>
      </div>
    </div>
    
    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto py-4 px-3">
      {/* Verify section */}
      <div>
        <div className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Verify
        </div>
        <div className="space-y-1">
          {/* Audio nav item (active) */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm bg-sidebar-accent text-primary font-medium">
            <AudioLines className="w-4 h-4" />
            <span>Audio</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
          </div>
        </div>
      </div>
      
      {/* Account section */}
      <div className="mt-6">
        <div className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Account
        </div>
        <div className="space-y-1">
          {/* History, Settings, Plan items */}
        </div>
      </div>
    </nav>
    
    {/* User section */}
    <div className="p-3 border-t border-sidebar-border">
      {/* User info or Sign In button */}
    </div>
  </aside>
  
  {/* Main content area */}
  <div className="ml-64">
    {/* Header - h-20 (80px) matches sidebar brand */}
    <header className="h-20 bg-sidebar border-b border-border flex items-center justify-between px-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Audio Verification</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Structural signal inspection</p>
      </div>
      <nav className="flex items-center gap-8">
        {/* Navigation links */}
        <a className="text-base font-medium text-white hover:text-forensic-cyan tracking-wide">Home</a>
        <a className="text-base font-medium text-white hover:text-forensic-cyan tracking-wide">Technology</a>
        <a className="text-base font-medium text-white hover:text-forensic-cyan tracking-wide">Methodology</a>
        <a className="text-base font-medium text-white hover:text-forensic-cyan tracking-wide">Use Cases</a>
        <a className="text-base font-medium text-white hover:text-forensic-cyan tracking-wide">Contact</a>
        <a className="text-base font-medium text-white hover:text-forensic-cyan tracking-wide">About Us</a>
      </nav>
    </header>
    
    {/* Page content */}
    <main className="p-6">
      {children}
    </main>
  </div>
</div>
```

### Interaction Mappings

| Element | Event | Handler Signature |
|---------|-------|-------------------|
| Nav item | click | `onNavigate(href: string)` |
| Sign In button | click | `onSignIn()` |
| Logout button | click | `onLogout()` |

---


## 2. WaveformVisualization

### Structure

```tsx
<div className="forensic-panel">
  {/* Header with amplitude controls */}
  <div className="forensic-panel-header flex items-center justify-between">
    <span>Waveform Analysis</span>
    <div className="flex items-center gap-3">
      {/* Amplitude Scale Control */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground uppercase">Amp</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map((scale) => (
            <button
              key={scale}
              className={`w-5 h-5 text-[10px] font-mono rounded transition-colors ${
                amplitudeScale === scale
                  ? "bg-forensic-cyan/30 text-forensic-cyan border border-forensic-cyan/50"
                  : "bg-muted/30 text-muted-foreground border border-border/30 hover:bg-muted/50"
              }`}
              title={`${scale}x amplitude scale`}
            >
              {scale}x
            </button>
          ))}
        </div>
      </div>
      {/* Decoding indicator (conditional) */}
      <span className="text-[10px] text-forensic-cyan flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-forensic-cyan rounded-full animate-pulse" />
        DECODING
      </span>
    </div>
  </div>
  
  <div className="p-0">
    {/* Waveform container - clickable for seeking */}
    <div className="w-full h-32 bg-card relative cursor-pointer">
      {/* Waveform layer (static) */}
      <canvas className="absolute inset-0 w-full h-full" />
      {/* Playhead layer (animated) */}
      <canvas className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
    
    {/* Timeline labels */}
    <div className="flex justify-between px-2 py-1 text-[10px] font-mono text-muted-foreground bg-muted/30">
      <span>0:00</span>
      <span>--:--</span>
      <span>--:--</span>
      <span>--:--</span>
      <span>--:--</span>
    </div>
  </div>
</div>
```

### Waveform Canvas Drawing (Reference)

```typescript
// Colors
const waveformStroke = "oklch(0.75 0.15 195)"; // forensic-cyan
const waveformFill = "oklch(0.75 0.15 195 / 20%)";
const centerLine = "oklch(0.30 0.01 260)";
const markerColor = "oklch(0.75 0.15 85 / 60%)"; // amber for markers
const playheadColor = "oklch(0.75 0.15 195)";

// Placeholder text (no audio)
const placeholderText = "Awaiting audio file";
const placeholderColor = "oklch(0.40 0.01 260)";
```

### Interaction Mappings

| Element | Event | Handler Signature |
|---------|-------|-------------------|
| Waveform container | click | `onSeek(time: number)` |
| Amplitude button | click | `onAmplitudeChange(scale: 1 \| 2 \| 3 \| 4)` |

---


## 3. AudioPlayerBar

### Structure

```tsx
<div className="forensic-panel">
  <div className="px-4 py-3 flex items-center justify-between gap-4">
    {/* Left side: Playback controls */}
    <div className="flex items-center gap-1">
      {/* Backward 10s */}
      <Button variant="ghost" size="icon" className="h-9 w-9" title="Backward 10s">
        <Rewind className="w-4 h-4" />
      </Button>
      
      {/* Play/Pause toggle */}
      <Button variant="ghost" size="icon" className="h-9 w-9" title="Play">
        <Play className="w-4 h-4" />
      </Button>
      {/* OR when playing: */}
      <Button variant="ghost" size="icon" className="h-9 w-9" title="Pause">
        <Pause className="w-4 h-4" />
      </Button>
      
      {/* Stop */}
      <Button variant="ghost" size="icon" className="h-9 w-9" title="Stop">
        <Square className="w-4 h-4" />
      </Button>
      
      {/* Forward 10s */}
      <Button variant="ghost" size="icon" className="h-9 w-9" title="Forward 10s">
        <FastForward className="w-4 h-4" />
      </Button>
    </div>

    {/* Right side: Time display and volume */}
    <div className="flex items-center gap-6">
      {/* Position */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Position
        </span>
        <span className="text-sm font-mono text-foreground w-12 text-right tabular-nums">
          0:00
        </span>
      </div>

      {/* Remaining */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Remaining
        </span>
        <span className="text-sm font-mono text-foreground w-12 text-right tabular-nums">
          -0:00
        </span>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Volume2 className="w-4 h-4" />
          {/* OR when muted: */}
          <VolumeX className="w-4 h-4" />
        </Button>
        <Slider value={[100]} max={100} step={1} className="w-20" />
        <span className="text-xs font-mono text-muted-foreground w-8 tabular-nums">
          100%
        </span>
      </div>
    </div>
  </div>
</div>
```

### Icons (Lucide)

```tsx
import { FastForward, Pause, Play, Rewind, Square, Volume2, VolumeX } from "lucide-react";
```

### Interaction Mappings

| Element | Event | Handler Signature |
|---------|-------|-------------------|
| Backward button | click | `onSeekBackward()` |
| Play button | click | `onPlay()` |
| Pause button | click | `onPause()` |
| Stop button | click | `onStop()` |
| Forward button | click | `onSeekForward()` |
| Mute button | click | `onMuteToggle()` |
| Volume slider | change | `onVolumeChange(volume: number)` |

---


## 4. MetadataPanel (FILE METADATA)

### Structure

```tsx
<div className="forensic-panel h-full">
  {/* Title: FILE METADATA (exact text) */}
  <div className="forensic-panel-header">FILE METADATA</div>
  <div className="forensic-panel-content">
    {/* Subline: Forensic input record */}
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border/30">
      Forensic input record (pre-analysis, pre-normalization)
    </p>
    
    {/* Metadata rows in FIXED ORDER */}
    {/* Filename */}
    <div className="flex justify-between items-center py-2 border-b border-border/50">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">Filename</span>
      <span className="text-sm text-foreground">example.wav</span>
    </div>
    
    {/* Duration */}
    <div className="flex justify-between items-center py-2 border-b border-border/50">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">Duration</span>
      <span className="text-sm text-foreground font-mono">3:45.123</span>
    </div>
    
    {/* Sample Rate */}
    <div className="flex justify-between items-center py-2 border-b border-border/50">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">Sample Rate</span>
      <span className="text-sm text-foreground font-mono">44.1 kHz</span>
    </div>
    
    {/* Bit Depth (with tooltip) */}
    <div className="flex justify-between items-center py-2 border-b border-border/50">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Bit Depth</span>
        <Info className="w-3 h-3 text-muted-foreground/50 cursor-help" />
      </div>
      <span className="text-sm text-foreground font-mono">16-bit</span>
    </div>
    
    {/* Channels */}
    <div className="flex justify-between items-center py-2 border-b border-border/50">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">Channels</span>
      <span className="text-sm text-foreground">Stereo</span>
    </div>
    
    {/* Codec */}
    <div className="flex justify-between items-center py-2 border-b border-border/50">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">Codec</span>
      <span className="text-sm text-foreground">pcm_s16le</span>
    </div>
    
    {/* File Size */}
    <div className="flex justify-between items-center py-2 border-b border-border/50">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">File Size</span>
      <span className="text-sm text-foreground font-mono">12.5 MB</span>
    </div>
    
    {/* SHA-256 (with copy button and tooltip) */}
    <div className="flex justify-between items-center py-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">SHA-256</span>
        <Info className="w-3 h-3 text-muted-foreground/50 cursor-help" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground font-mono">a1b2c3d4e5f6...</span>
        <button className="p-1 rounded hover:bg-muted/50">
          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  </div>
</div>
```

### Empty State

```tsx
<div className="forensic-panel h-full">
  <div className="forensic-panel-header">FILE METADATA</div>
  <div className="forensic-panel-content flex flex-col justify-center">
    <p className="text-sm text-muted-foreground text-center py-8">
      No file selected
    </p>
  </div>
</div>
```

### Field Display Rules

| Field | Format | Notes |
|-------|--------|-------|
| Filename | as-is | No truncation |
| Duration | `M:SS.mmm` | From ffprobe seconds |
| Sample Rate | `XX.X kHz` | Convert from Hz |
| Bit Depth | `XX-bit` | With tooltip |
| Channels | `Mono`/`Stereo`/`X ch` | Human-readable |
| Codec | as-is | From ffprobe |
| File Size | `XX.XX MB` | Human-readable |
| SHA-256 | `first16chars...` | Truncated, copyable |

### Tooltips

**Bit Depth:**
> "Bit depth is reported from the source file encoding metadata. For lossless formats, this reflects the original PCM depth. For lossy formats, this reflects container declaration only. This value is not used for analysis or normalization."

**SHA-256:**
> "SHA-256 hash is calculated from the original uploaded file and is used solely for file identity verification and audit reproducibility."

### Interaction Mappings

| Element | Event | Handler Signature |
|---------|-------|-------------------|
| Copy button | click | `onCopy(value: string)` |

---


## 5. LiveScanConsole

### Structure

```tsx
<div className="forensic-panel w-full mt-0 h-full flex flex-col">
  {/* Header */}
  <div className="forensic-panel-header flex items-center gap-2">
    <Terminal className="w-4 h-4" />
    <span>Live Scan Console</span>
    
    {/* Status indicator (conditional) */}
    {/* When verifying: */}
    <span className="ml-auto flex items-center gap-1.5">
      <span className="w-2 h-2 bg-forensic-cyan rounded-full animate-pulse" />
      <span className="text-[10px] text-forensic-cyan uppercase tracking-wider">
        Forensic Signal Observation in Progress
      </span>
    </span>
    
    {/* When complete: */}
    <span className="ml-auto flex items-center gap-1.5">
      <span className="w-2 h-2 bg-forensic-green rounded-full" />
      <span className="text-[10px] text-forensic-green">COMPLETE</span>
    </span>
  </div>
  
  {/* Console output */}
  <div className="forensic-panel-content p-0">
    <div className="h-40 overflow-y-auto bg-[oklch(0.12_0.01_260)] font-mono text-xs p-3 space-y-1">
      {/* Idle state */}
      <div className="text-muted-foreground">
        <span className="text-forensic-cyan">$</span> Waiting for VERIFY AUDIO…
      </div>
      
      {/* Log entries */}
      <div className="text-forensic-cyan leading-relaxed">
        <span className="text-muted-foreground/60">[12:34:56]</span>{" "}
        <span className="text-forensic-cyan">$</span>{" "}
        Initializing forensic scan pipeline
      </div>
      
      {/* Constraint log entry */}
      <div className="text-muted-foreground/80 leading-relaxed">
        <span className="text-muted-foreground/60">[12:34:57]</span>{" "}
        <span className="text-muted-foreground/60">⊘</span>{" "}
        No probabilistic inference is performed
      </div>
      
      {/* Philosophy log entry */}
      <div className="text-forensic-cyan/70 leading-relaxed">
        <span className="text-muted-foreground/60">[12:34:58]</span>{" "}
        <span className="text-forensic-cyan">◈</span>{" "}
        Geometry-primary verification engine active
      </div>
      
      {/* Processing cursor (when verifying) */}
      <div className="text-forensic-cyan animate-pulse">
        <span className="text-muted-foreground/60">[12:34:59]</span>{" "}
        <span className="text-forensic-cyan">$</span>{" "}
        Processing...
        <span className="inline-block w-2 h-3 bg-forensic-cyan ml-1 animate-pulse" />
      </div>
    </div>
  </div>
</div>
```

### Log Entry Types & Colors

| Type | Color Class | Prefix |
|------|-------------|--------|
| info | `text-muted-foreground` | `$` |
| process | `text-forensic-cyan` | `$` |
| complete | `text-forensic-green` | `$` |
| warning | `text-forensic-amber` | `$` |
| constraint | `text-muted-foreground/80` | `⊘` |
| philosophy | `text-forensic-cyan/70` | `◈` |

### Log Entry Interface

```typescript
interface ScanLogEntry {
  timestamp: string;  // e.g., "12:34:56"
  message: string;
  type: "info" | "process" | "complete" | "warning" | "constraint" | "philosophy";
}
```

### Authoritative Message Set

**Engine Philosophy:**
- "Real-time structural signal observation"
- "Geometry-primary verification engine active"
- "Human baseline geometry enforced"
- "Deterministic execution under fixed conditions"

**Scan Process:**
- "Initializing forensic scan pipeline"
- "Locking analysis parameters"
- "Establishing normalization coordinate space"
- "Observing residual structure"
- "Monitoring residual persistence"
- "Evaluating cross-stem geometry"
- "Comparing against human geometry envelope"

**Constraints:**
- "No probabilistic inference is performed"
- "No authorship or intent is inferred"
- "No similarity or style comparison is used"

**Completion:**
- "Final geometry evaluation pending"
- "Results will be disclosed after full scan completion"

---


## 6. VerdictPanel

### Structure

```tsx
<div className="forensic-panel">
  <div className="forensic-panel-header">Verification Result</div>
  <div className="forensic-panel-content space-y-6">
    {/* Main verdict box */}
    <div className="p-4 rounded-md border-l-4 bg-forensic-amber/10 border-forensic-amber">
      {/* OR for not_observed: bg-forensic-green/10 border-forensic-green */}
      <p className="text-lg font-medium text-forensic-amber">
        {/* OR for not_observed: text-forensic-green */}
        AI signal evidence was observed.
        {/* OR: AI signal evidence was not observed. */}
      </p>
    </div>

    {/* CR-G Status information */}
    <div className="space-y-3">
      <div className="flex justify-between items-center py-2 border-b border-border/50">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          CR-G Status
        </span>
        <span className="text-sm font-mono text-foreground">
          CR-G_exceeded
        </span>
      </div>

      {/* Primary Exceeded Axis (conditional) */}
      <div className="flex justify-between items-center py-2 border-b border-border/50">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Primary Exceeded Axis
        </span>
        <span className="text-sm font-mono text-foreground">
          spectral_coherence
        </span>
      </div>
    </div>

    {/* Forensic disclaimer */}
    <p className="text-[10px] text-muted-foreground leading-relaxed">
      This result reports structural signal evidence only. The system does not
      estimate probability, attribute authorship, or reference any specific AI
      model names.
    </p>
  </div>
</div>
```

### Processing State

```tsx
<div className="forensic-panel">
  <div className="forensic-panel-header">Verification Result</div>
  <div className="forensic-panel-content">
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm text-muted-foreground">
        Inspecting structural signals...
      </p>
    </div>
  </div>
</div>
```

### Empty State

```tsx
<div className="forensic-panel">
  <div className="forensic-panel-header">Verification Result</div>
  <div className="forensic-panel-content">
    <p className="text-sm text-muted-foreground text-center py-8">
      Upload and verify an audio file to see results
    </p>
  </div>
</div>
```

### Verdict Texts (ONLY ALLOWED)

| Verdict | Text |
|---------|------|
| observed | "AI signal evidence was observed." |
| not_observed | "AI signal evidence was not observed." |

### Color Mapping

| Verdict | Background | Border | Text |
|---------|------------|--------|------|
| observed | `bg-forensic-amber/10` | `border-forensic-amber` | `text-forensic-amber` |
| not_observed | `bg-forensic-green/10` | `border-forensic-green` | `text-forensic-green` |

---


## 7. AudioUploadPanel

### Structure (Empty State)

```tsx
<div className="forensic-panel">
  <div className="forensic-panel-header">File Upload</div>
  <div className="forensic-panel-content">
    {/* Drag & Drop Zone */}
    <div className="border-2 border-dashed rounded-md p-8 text-center border-border hover:border-muted-foreground/50">
      <input type="file" accept=".wav,.mp3,.flac,.ogg,.m4a" className="hidden" id="audio-upload" />
      <label htmlFor="audio-upload" className="cursor-pointer">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Drop audio file here or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supported formats: WAV, MP3, FLAC, OGG, M4A
            </p>
          </div>
        </div>
      </label>
    </div>
  </div>
</div>
```

### Structure (File Selected)

```tsx
<div className="forensic-panel">
  <div className="forensic-panel-header">File Upload</div>
  <div className="forensic-panel-content">
    <div className="space-y-4">
      {/* File info card */}
      <div className="bg-muted/30 rounded-md p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
              <FileAudio className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                example.wav
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>12.5 MB</span>
                <span>•</span>
                <span>3:45</span>
                <span>•</span>
                <span>44.1 kHz</span>
                {/* Decoding indicator (conditional) */}
                <span>•</span>
                <span className="text-forensic-cyan">Decoding...</span>
              </div>
            </div>
          </div>
          <button className="p-1 hover:bg-muted rounded transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Verify button */}
      <Button className="w-full h-12 font-semibold text-sm tracking-wide bg-forensic-cyan hover:bg-forensic-cyan/90 text-background">
        <span className="flex items-center gap-2">
          <AudioLines className="w-4 h-4" />
          VERIFY AUDIO
        </span>
      </Button>
      
      {/* OR when verifying: */}
      <Button className="w-full h-12 font-semibold text-sm tracking-wide bg-forensic-cyan text-background opacity-70" disabled>
        <span className="flex items-center gap-2">
          <AudioLines className="w-4 h-4 animate-pulse" />
          VERIFYING...
        </span>
      </Button>
    </div>
  </div>
</div>
```

### Drag Active State

```tsx
<div className="border-2 border-dashed rounded-md p-8 text-center border-primary bg-primary/5">
  {/* Same content as empty state */}
</div>
```

### Error State

```tsx
<div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
  <p className="text-xs text-destructive">
    Unsupported file format. Please use WAV, MP3, FLAC, OGG, or M4A.
  </p>
</div>
```

### Interaction Mappings

| Element | Event | Handler Signature |
|---------|-------|-------------------|
| File input | change | `onFileSelect(fileInfo: AudioFileInfo)` |
| Drop zone | drop | `onFileSelect(fileInfo: AudioFileInfo)` |
| Clear button | click | `onClear()` |
| Verify button | click | `onVerify()` |

---


## 8. SourceComponents

### Structure

```tsx
<div className="forensic-panel h-full">
  <div className="forensic-panel-header">Source Components</div>
  <div className="forensic-panel-content space-y-3">
    {/* Stem Separation section */}
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        Stem Separation
      </div>
      
      {/* Stem Control Row */}
      <div className="flex items-center gap-2 py-2 px-3 bg-muted/10 rounded border border-border/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]">
        {/* Play/Pause button */}
        <button className="w-7 h-7 rounded-full flex items-center justify-center bg-muted/30 hover:bg-muted/50 border border-border/30">
          <Play className="w-3 h-3 text-foreground ml-0.5" />
          {/* OR when playing: */}
          <Pause className="w-3 h-3 text-foreground" />
        </button>
        
        {/* Stem name */}
        <div className="flex-shrink-0 w-14">
          <span className="text-xs font-medium text-foreground">Vocals</span>
        </div>
        
        {/* Horizontal amplitude waveform */}
        <div className="flex-1 h-8 bg-muted/20 rounded overflow-hidden relative">
          <svg width="100%" height="100%" preserveAspectRatio="none" className="absolute inset-0" viewBox="0 0 100 40">
            {/* Upper waveform path */}
            <path d="M0,20 L..." fill="var(--forensic-cyan)" fillOpacity="0.3" />
            {/* Lower waveform path (mirrored) */}
            <path d="M0,20 L..." fill="var(--forensic-cyan)" fillOpacity="0.3" />
            {/* Center line */}
            <line x1="0" y1="20" x2="100" y2="20" stroke="var(--forensic-cyan)" strokeOpacity="0.3" strokeWidth="0.5" />
          </svg>
        </div>
        
        {/* Volume slider */}
        <div className="flex items-center gap-1.5 w-20">
          <Volume2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <Slider value={[80]} min={0} max={100} step={1} className="flex-1" />
        </div>
        
        {/* Download button */}
        <button className="w-7 h-7 rounded flex items-center justify-center bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-forensic-cyan/50 hover:text-forensic-cyan">
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
      
      {/* Repeat for: Drums (forensic-amber), Bass (forensic-green), Others (forensic-purple) */}
    </div>
    
    {/* Summary grid */}
    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/30">
      <div className="py-2 px-3 bg-muted/10 rounded border border-border/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
          Layer Count
        </div>
        <div className="text-sm font-mono text-foreground">4</div>
      </div>
      <div className="py-2 px-3 bg-muted/10 rounded border border-border/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
          Composition
        </div>
        <div className="text-sm font-mono text-foreground">Multi-layer</div>
      </div>
    </div>
  </div>
</div>
```

### Stem Colors

| Stem | CSS Variable | Background |
|------|--------------|------------|
| Vocals | `--forensic-cyan` | `bg-forensic-cyan` |
| Drums | `--forensic-amber` | `bg-forensic-amber` |
| Bass | `--forensic-green` | `bg-forensic-green` |
| Others | `--forensic-purple` | `bg-forensic-purple` |

### Idle State

```tsx
<div className="pt-3 border-t border-border/30">
  <p className="text-xs text-muted-foreground text-center">
    Awaiting verification data for component analysis
  </p>
</div>
```

### Processing State

```tsx
<div className="flex flex-col items-center justify-center py-8">
  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
  <p className="text-xs text-muted-foreground">Identifying source components...</p>
</div>
```

### Interaction Mappings

| Element | Event | Handler Signature |
|---------|-------|-------------------|
| Play/Pause button | click | `onTogglePlay(stemId: string)` |
| Volume slider | change | `onVolumeChange(stemId: string, volume: number)` |
| Download button | click | `onDownload(stemId: string)` |

---


## 9. CSS Variables & Styles

### Color Palette (OKLCH)

```css
:root {
  /* Core theme */
  --background: oklch(0.12 0.01 260);
  --foreground: oklch(0.92 0.01 260);
  --card: oklch(0.16 0.01 260);
  --card-foreground: oklch(0.92 0.01 260);
  --popover: oklch(0.14 0.01 260);
  --popover-foreground: oklch(0.92 0.01 260);
  --primary: oklch(0.75 0.15 195);
  --primary-foreground: oklch(0.12 0.01 260);
  --secondary: oklch(0.22 0.01 260);
  --secondary-foreground: oklch(0.85 0.01 260);
  --muted: oklch(0.20 0.01 260);
  --muted-foreground: oklch(0.65 0.01 260);
  --accent: oklch(0.25 0.02 260);
  --accent-foreground: oklch(0.92 0.01 260);
  --destructive: oklch(0.60 0.20 25);
  --destructive-foreground: oklch(0.98 0 0);
  --border: oklch(0.28 0.01 260);
  --input: oklch(0.22 0.01 260);
  --ring: oklch(0.75 0.15 195);
  
  /* Forensic specific colors */
  --forensic-cyan: oklch(0.75 0.15 195);
  --forensic-cyan-dim: oklch(0.55 0.10 195);
  --forensic-green: oklch(0.70 0.15 145);
  --forensic-amber: oklch(0.75 0.15 85);
  --forensic-purple: oklch(0.65 0.15 300);
  
  /* Radius */
  --radius: 0.375rem;
}
```

### Forensic Panel Classes

```css
/* Base panel */
.forensic-panel {
  @apply bg-card border border-border rounded-md;
}

/* Panel header */
.forensic-panel-header {
  @apply px-4 py-3 border-b border-border text-sm font-medium text-muted-foreground uppercase tracking-wider;
}

/* Panel content */
.forensic-panel-content {
  @apply p-4;
}
```

### Verdict Classes

```css
.verdict-observed {
  @apply text-forensic-amber;
}

.verdict-not-observed {
  @apply text-forensic-green;
}
```

### Waveform Container

```css
.waveform-container {
  @apply w-full bg-card rounded-md overflow-hidden;
}
```

### Timeline Marker

```css
.timeline-marker {
  @apply absolute w-0.5 bg-forensic-cyan opacity-60;
}
```

### Scrollbar Styling

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: oklch(0.14 0.01 260);
}

::-webkit-scrollbar-thumb {
  background: oklch(0.30 0.01 260);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: oklch(0.40 0.01 260);
}
```

### Font Stack

```css
body {
  font-family: "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
```

---

## 10. Component Dependencies

### Lucide Icons Used

```tsx
import {
  // AudioPlayerBar
  FastForward, Pause, Play, Rewind, Square, Volume2, VolumeX,
  // AudioUploadPanel
  AudioLines, FileAudio, Upload, X,
  // MetadataPanel
  Copy, Check, Info,
  // LiveScanConsole
  Terminal,
  // SourceComponents
  Download,
} from "lucide-react";
```

### shadcn/ui Components Used

```tsx
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
```

### Utility Functions

```tsx
import { cn } from "@/lib/utils";  // clsx + tailwind-merge
```

---

## 11. Page Layout (Home.tsx)

### Main Grid Structure

```tsx
<div className="min-h-screen bg-background">
  {/* Header */}
  <ForensicLayout>
    <div className="container py-6">
      {/* Top row: Upload + Metadata + Console */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-3">
          <AudioUploadPanel />
        </div>
        <div className="col-span-3">
          <MetadataPanel />
        </div>
        <div className="col-span-6">
          <LiveScanConsole />
        </div>
      </div>
      
      {/* Waveform row */}
      <div className="mb-6">
        <WaveformVisualization />
      </div>
      
      {/* Player bar */}
      <div className="mb-6">
        <AudioPlayerBar />
      </div>
      
      {/* Analysis row */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left column: Analysis panels */}
        <div className="col-span-8 space-y-6">
          <TimelineAnalysis />
          <TemporalAnalysis />
          <DetailedAnalysis />
        </div>
        
        {/* Right column: Source + Verdict */}
        <div className="col-span-4 space-y-6">
          <SourceComponents />
          <VerdictPanel />
        </div>
      </div>
    </div>
  </ForensicLayout>
</div>
```

---

