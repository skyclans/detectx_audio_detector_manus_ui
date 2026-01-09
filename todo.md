# DetectX Audio - Project TODO

## Core Layout & Navigation
- [x] Fixed left sidebar navigation (Verify: Audio/Image/Text/Anime, Account: History/Settings/Plan)
- [x] Main header area (Left: Audio Verification title/subtitle, Right: navigation links)
- [x] Dark forensic theme with professional institutional design

## Audio Upload & Metadata
- [x] Audio file upload panel with drag & drop
- [x] Support WAV/MP3/FLAC/OGG/M4A formats
- [x] Display file name, size, duration, sample rate
- [x] VERIFY AUDIO button
- [x] File metadata display panel (filename, duration, sample rate, bit depth, channels, codec, hash)

## Waveform Analysis & Player
- [x] Forensic waveform visualization (100% width, cyan color, SVG/Canvas)
- [x] Timeline labels at bottom
- [x] Audio player control bar (play/pause/stop/backward/forward)
- [x] Position/remaining time/volume controls in single horizontal line

## Verification Results
- [x] Verdict panel with only two allowed statements
- [x] CR-G status and exceeded axis information
- [x] No icons, confidence scores, or percentages
- [x] Geometry & timeline context markers (evidence-only)

## Export & Reporting
- [x] PDF export
- [x] JSON export
- [x] CSV export
- [x] Markdown export
- [x] Deterministic evidence-based reports

## Backend & Database
- [x] Audio verification records table
- [x] Verification history storage
- [x] File upload to S3 storage
- [x] Audio analysis API endpoints

## Testing
- [x] Unit tests for verification logic
- [x] API endpoint tests

## Additional Pages
- [x] History page - verification records list
- [x] Settings page - account configuration
- [x] Plan page - subscription management
- [x] Coming Soon pages for Image/Text/Anime


## Logo & Branding Update
- [x] Replace sidebar logo with official DetectX logo
- [x] Remove placeholder icons and alternative logo symbols
- [x] Ensure brand name appears exactly as "DetectX"

## Evidence-Only Language Compliance
- [x] Remove all probabilities, confidence scores, severity labels, percentages
- [x] Remove all AI model names from UI
- [x] Ensure CR-G status strictly controls final verdict text
- [x] Make all sections descriptive and structural only

## Audio Control Responsiveness
- [x] Implement immediate visual feedback for Play/Pause/Stop buttons (0ms delay)
- [x] Decouple UI state changes from audio processing
- [x] Volume control updates UI state immediately
- [x] Ensure controls feel precise and deterministic


## Workspace Access & Sections Update
- [x] Remove login requirement for initial workspace access
- [x] Authentication only required for history, export, account features
- [x] Add Timeline Analysis section
- [x] Add Temporal Analysis section
- [x] Add Detailed Analysis section
- [x] Add Source Components section
- [x] Add Geometry Scan Trace section
- [x] Add Report Preview section
- [x] Ensure all result panels remain idle until backend data received
- [x] No demo, mock, or placeholder AI judgments
- [x] Increase DetectX logo size to brand scale


## Specification Implementation (Mandatory)

### Waveform Interaction Fixes
- [x] Clicking waveform seeks to corresponding timestamp
- [x] Waveform click must NOT reset playback to 0:00
- [x] Waveform bidirectionally linked to audio currentTime

### Playback Control Fixes
- [x] Pause preserves current playback position
- [x] Play after pause resumes from paused position
- [x] Playback resets only on explicit stop or file reload

### Initial Load State (UX)
- [x] Display neutral placeholder waveform before file upload
- [x] Show skeleton placeholders for all analysis panels
- [x] Clearly indicate "Awaiting verification data"
- [x] No verdicts, events, or analysis results on initial load

### Report Preview Panel
- [x] Display current verdict text if available
- [x] Show CR-G status and structural findings summary
- [x] Clearly labeled as preview
- [x] No probabilities, confidence scores, or AI attribution

### Export Format Fixes
- [x] CSV/XLS headers horizontal (column-based)
- [x] One analysis = one row of metadata values
- [x] CSV encoded as UTF-8 with BOM
- [x] XLS/XLSX preserve full Unicode support
- [x] Non-Latin script filenames must not break


## Specification Fixes (pasted_content_3.txt)

### A) Waveform Seek + Playback Position (Critical Bug)
- [x] Fix: clicking waveform while playing resets to 0:00
- [x] Waveform click must ALWAYS seek to clicked timestamp
- [x] Seeking must NEVER reset to 0:00 unless Stop or new file
- [x] While playing: seek immediately and continue playback
- [x] While paused: seek immediately and remain paused
- [x] Pause must preserve currentTime

### B) Report Preview Position (UX)
- [x] Move Report Preview directly ABOVE Export & Reporting section
- [x] Keep both sections visible with Preview first, then Export

### C) Volume Responsiveness (Performance)
- [x] Volume UI must update instantly on input (0ms delay)
- [x] Use requestAnimationFrame or throttle <= 16ms for audio.volume
- [x] Do not debounce at large intervals

### D) Live Scan Console ("Hacker Terminal") Restore
- [x] Restore Live Scan Console / hacker-style terminal window
- [x] Place directly ABOVE Geometry & Timeline Context section
- [x] Show after user clicks VERIFY AUDIO
- [x] Console log must be append-only and auto-scroll
- [x] While idle: show "Waiting for VERIFY AUDIO…"
- [x] Must NOT claim verdict unless from backend

### E) Filename Internationalization Bug
- [x] Support full Unicode filenames (Japanese, special chars)
- [x] Waveform rendering must not depend on filename parsing
- [x] Use generated safe internal ID for UI binding
- [x] Never use filename as HTML id, CSS selector, or DOM query key

### F) Design Constraints (Locked)
- [x] Preserve existing colors, card styles, buttons, typography
- [x] Keep DetectX evidence-only rules
