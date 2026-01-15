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


## Specification Fixes (pasted_content_4.txt)

### 1) Live Scan Console Position & Width
- [x] Move Live Scan Console directly BELOW waveform visualization
- [x] Console must have EXACTLY same width as waveform container
- [x] Treat waveform + console as single continuous analysis block

### 2) Waveform Failure with Special Characters (Critical Bug)
- [x] Fix waveform not rendering for filenames like "__01 Ballad Pour Adeline.wav"
- [x] Waveform rendering must NEVER depend on filename content
- [x] Filenames must NOT be used as DOM IDs, CSS selectors, JS keys, Canvas/SVG identifiers
- [x] Generate safe internal session ID (UUID) for all waveform/audio bindings
- [x] Treat filename strictly as display-only Unicode text
### 3) Japanese & Global Language Support (I18N)
- [x] Japanese filenames must correctly trigger waveform rendering
- [x] Support all languages: Japanese, Korean, Chinese, Arabic, Cyrillic, accented Latin
- [x] Full Unicode support across entire UI
- [x] Use internal IDs for logic, Unicode only for display

### 4) Volume Control Responsiveness (Final Fix)
- [x] Volume UI must update immediately on pointer down/move (0ms)
- [x] Update volume UI state synchronously on every interaction event
- [x] Apply audio.volume updates using requestAnimationFrame
- [x] Do NOT debounce volume updates
- [x] Volume control must feel as responsive as hardware audio knob

### Design Constraints (Locked)
- [x] Preserve existing UI design, colors, typography, button styles
- [x] No animations implying processing or intelligence
- [x] Maintain DetectX forensic rules (no probabilities, confidence, severity, AI attribution)


## Performance Override (CRITICAL - pasted_content_5.txt)

### 1) File Upload → Waveform Rendering
- [x] Immediately render lightweight placeholder waveform (0ms perceived delay)
- [x] Perform waveform decoding asynchronously (non-blocking)
- [x] Replace placeholder waveform once rendering complete
- [x] Do NOT block main UI thread
- [x] Use two-phase rendering: instant placeholder → async detailed waveform

### 2) Play/Pause/Stop/Volume Controls
- [x] UI state must update immediately (0ms) on interaction
- [x] Decouple UI state from audio processing completely
- [x] Audio actions dispatched asynchronously
- [x] Volume control updates UI on every pointer movement
- [x] Use requestAnimationFrame for audio volume updates
- [x] Do NOT debounce or throttle UI interaction

### 3) VERIFY AUDIO Button Responsiveness
- [x] Button provides immediate visual feedback on click
- [x] UI transitions instantly into "verification started" state
- [x] Show Live Scan Console activity instantly
- [x] Do NOT wait for backend response to update UI state

### 4) Forbidden UI Patterns
- [x] NO blocking async operations on main thread
- [x] NO UI updates waiting for promises to resolve
- [x] NO heavy waveform processing before UI feedback
- [x] NO audio decoding on click handlers
- [x] NO artificial delays or animations implying processing


## Layout Override (pasted_content_6.txt)

### 1) Source Components Position & Width
- [x] Place Source Components DIRECTLY BELOW Live Scan Console
- [x] Source Components must have EXACTLY same width as Live Scan Console
- [x] Treat Live Scan Console + Source Components as vertically stacked same-width block
- [x] Do NOT place Source Components in side column or grid

### 2) Geometry Window Height Reallocation
- [x] Expand Geometry Scan Trace section vertically to occupy freed space
- [x] Increase height of Geometry Scan Trace visualization
- [x] Geometry Scan Trace must feel visually dominant and central

### 3) Source Components Stem Controls (UI-Only)
- [x] Add playback controls for each stem: Vocals, Drums, Bass, Others
- [x] Provide placeholder waveform bars and play/pause buttons per stem
- [x] UI-only layout - NO real stem separation or Demucs processing
- [x] Controls are for layout and future backend integration only

### 4) Overall Design Tone
- [x] Use same dark forensic color balance
- [x] Preserve neumorphic / concave (inset) surface feeling
- [x] Match depth, shadow softness, and contrast levels

### 5) Header Height & Navigation Visibility
- [x] Set header height to EXACTLY match sidebar brand area height
- [x] Header must visually align with sidebar top section
- [x] Increase navigation font size for improved readability
- [x] Improve contrast for high visibility
- [x] Navigation must feel clear, deliberate, and professional


## UI Override (pasted_content_7.txt)

### 1) Source Components Height Alignment
- [x] Align bottom edge of Source Components to EXACTLY match Detailed Analysis bottom edge
- [x] No uneven bottom spacing
- [x] Layout must feel visually balanced and intentional

### 2) Sidebar Verify Cleanup
- [x] Remove Image, Text, and Anime from Verify menu
- [x] Leave ONLY Audio in Verify section
- [x] This workspace is audio-only

### 3) History — Calendar-Based Search
- [x] Add date picker / calendar UI to History
- [x] Allow users to filter verification history by date range
- [x] Calendar must control history list dynamically

### 4) History — Delete All Function
- [x] Add "Delete All" function to Recent Verifications
- [x] Provide confirmation step before deletion
- [x] After deletion, history list must reset to empty state

### 5) History — Multi-Format Download Per File
- [x] Add PDF, JSON, CSV, Markdown export options per history item
- [x] Each file entry must expose download options directly
- [x] Do NOT hide exports behind global menu

### 6) Waveform ↔ Source Components Decoupling
- [x] Main waveform playback must NOT animate or affect Source Components
- [x] Source Components must remain visually stable unless explicitly interacted with
- [x] No synchronized motion, pulsing, or amplitude animation

### 7) Source Components Waveform Style
- [x] Replace bar-style visualizations with waveform-style visuals
- [x] Use same waveform language as main waveform (scaled down)
- [x] Preserve existing color palette

### 8) Waveform Amplitude Scale Control
- [x] Add amplitude scale buttons (1x, 2x, 3x, 4x) in waveform header
- [x] Clicking buttons scales waveform amplitude visually
- [x] Audio volume does NOT change
- [x] This is forensic visualization control only

### 9) SHA-256 Copy to Clipboard
- [x] Add "Copy to clipboard" control next to SHA-256 hash
- [x] On click, copy full hash string
- [x] Provide brief visual feedback (icon change or tooltip)


## Final Specification v1.0 (pasted_content_8.txt)

### 1) Export Report — Download All
- [x] Add clearly visible "Download All" button
- [x] Download all report files (PDF, JSON, CSV, Markdown) as single ZIP archive
- [x] Include stem-related files when applicable
- [x] No additional confirmation dialog required

### 2) Detailed Analysis & Source Components Alignment
- [x] Move Detailed Analysis section upward for prominence
- [x] Bottom edge of Detailed Analysis must align with Source Components
- [x] Both sections must end on same vertical baseline

### 3) Source Components — Stem Controls & Download
- [x] Add Play/Pause control for each stem (Vocals, Drums, Bass, Others)
- [x] Add Volume control for each stem
- [x] Add Download button for each stem
- [x] UI-only preparation (no real stem separation)

### 4) Settings — Version Display
- [x] Replace static "1.0.0" with actual deployed build version
- [x] Version string must reflect current build

### 5) Live Scan Console & File Metadata Height Sync
- [x] Align bottom edge of Live Scan Console with File Metadata panel
- [x] Both panels must appear synchronized in height

### 6) Sidebar Plan — Final Pricing & Positioning
- [x] FREE: $0/forever, 10 verifications/month, basic CR-G analysis, standard exports, community support
- [x] PRO ($19/month): 200 verifications/month, full CR-G suite, all exports, batch processing, API access, email support
- [x] ENTERPRISE (Custom): Unlimited verifications, custom CR-G tuning, API + webhooks, SLA, dedicated support, on-premise
### Design Constraints (Locked)
- [x] Preserve existing color palette, neumorphic depth, button styles
- [x] Maintain institutional forensic tone
- [x] No probabilities, confidence scores, severity labels, AI model references


## Final Master Specification v1.0 (pasted_content_9.txt)

### 1) Export Report — Download Label Fix
- [x] Change "Download All (ZIP)" to "Download All & Stems (ZIP)"

### 2) Source Components — Control Cleanup
- [x] Remove Solo button from each stem
- [x] Remove Mute (M) button from each stem
- [x] Keep volume control
- [x] Keep Download button next to volume control

### 3) Analysis Section Spacing Normalization
- [x] Ensure vertical spacing between Timeline Analysis and Temporal Analysis equals spacing between Detailed Analysis and Temporal Analysis
- [x] Apply consistent spacing rhythm to all analysis sections

### 4) Detailed Analysis & Source Components Bottom Alignment
- [x] Align bottom edge of Detailed Analysis with bottom edge of Source Components exactly
- [x] No visual mismatch or drift allowed

### 5) Header Navigation Text Visibility (Critical)
- [x] Change header menu text to bright white
- [x] Ensure strong contrast against header background
- [x] Remove muted, dimmed, or low-opacity styling

### 6) Plan Badge Alignment & Consistency
- [x] Horizontally align all plan badges (Current Plan, Upgrade to Professional, Contact Sales)
- [x] Ensure same vertical position for all badges
- [x] Use consistent sizing and visual weight

### 7) Pricing Plans — Final Configuration
- [x] FREE: $0/forever, 5 verifications/month, Basic CR-G, PDF & JSON export, Standard queue, Community support, NO API/batch/priority
- [x] PROFESSIONAL: $29/month, 50 verifications/month, Full CR-G, All export formats, UI-based batch, Priority support, NO API/automation/webhooks
- [x] ENTERPRISE: Custom pricing, Unlimited verifications, Full API, Webhooks, Unlimited batch, SLA 99.9%, On-premise option, Custom integrations


## FILE METADATA Forensic Input Record Implementation

### 1) Server-side ffprobe Metadata Extraction
- [x] Install ffprobe/ffmpeg in server environment
- [x] Create tRPC procedure for audio metadata extraction
- [x] Extract: filename, duration, sample_rate, bit_depth, channels, codec, file_size
- [x] Use container-level inspection only (no decoding/normalization)

### 2) SHA-256 Hash Calculation
- [x] Calculate SHA-256 from original uploaded file
- [x] Compute before any analysis or normalization
- [x] Use for file identity verification and audit reproducibility only

### 3) FILE METADATA UI Component Update
- [x] Title: "FILE METADATA"
- [x] Subline: "Forensic input record (pre-analysis, pre-normalization)"
- [x] Display fields in fixed order: Filename, Duration, Sample Rate, Bit Depth, Channels, Codec, File Size, SHA-256
- [x] Show "—" for unavailable values (no estimation/inference)
- [x] Add Bit Depth tooltip with exact specified text

### 4) Integration with Home.tsx
- [x] Call metadata extraction API on file upload
- [x] Display metadata before verification starts
- [x] Ensure metadata reflects pre-analysis state only


## Live Scan Console Final Text Set Implementation

### 1) Header (Fixed)
- [x] Update header to "Forensic Signal Observation in Progress"

### 2) Core Status / Engine Philosophy Messages
- [x] "Real-time structural signal observation"
- [x] "Geometry-primary verification engine active"
- [x] "Human baseline geometry enforced"
- [x] "Deterministic execution under fixed conditions"

### 3) Scan Process (Observation Log)
- [x] "Initializing forensic scan pipeline"
- [x] "Locking analysis parameters"
- [x] "Establishing normalization coordinate space"
- [x] "Observing residual structure"
- [x] "Monitoring residual persistence"
- [x] "Evaluating cross-stem geometry"
- [x] "Comparing against human geometry envelope"

### 4) Constraints & Ethics (Non-Negotiable)
- [x] "No probabilistic inference is performed"
- [x] "No authorship or intent is inferred"
- [x] "No similarity or style comparison is used"
- [x] "This system does not classify or predict"
- [x] "Absence of evidence is a valid outcome"

### 5) Pre-Verdict State (Completion Gate)
- [x] "Final geometry evaluation pending"
- [x] "Results will be disclosed after full scan completion"

### 6) Implementation Rules
- [x] All text is informational only
- [x] No intermediate verdicts implied
- [x] No probability, likelihood, or confidence language


## Audio Verification Page (verify-audio) Forensic Specifications

### 1) FILE METADATA Panel
- [x] Verify panel is labeled "FILE METADATA"
- [x] Verify subline: "Forensic input record (pre-analysis, pre-normalization)"
- [x] Ensure no estimation or normalization in displayed values

### 2) Live Scan Console
- [x] Verify deterministic non-probabilistic status messages
- [x] Ensure no probability, likelihood, or confidence language
- [x] Verify geometry-only detection authority messaging

### 3) Verdict Section
- [x] Restrict to fixed evidence-only statements
- [x] No authorship inference language
- [x] No similarity language
- [x] Only two allowed verdicts: "observed" or "not_observed"

### 4) Geometry-only Analysis Sections
- [x] Verify all analysis sections use geometry-based terminology
- [x] No probabilistic inference in any analysis output
- [x] Ensure human-safe boundaries are enforced

### 5) Scope Verification
- [x] Changes scoped exclusively to Audio verification flow
- [x] Homepage and other product pages unaffected


## Optimized Audio Playback Implementation (Performance-Critical)

### 1) AudioRuntime Class
- [x] Create client/src/lib/audioRuntime.ts
- [x] Implement play(), pause(), seek(), stop() methods
- [x] Implement setVolume() with gain.setTargetAtTime for smooth transitions
- [x] Implement getCurrentTime() for ref-based time tracking

### 2) Playhead-only Rendering
- [x] Create client/src/lib/waveformPlayhead.ts
- [x] Implement drawPlayhead() function for playhead-only canvas updates
- [x] Separate playhead canvas from waveform canvas

### 3) Time Loop (React State Separation)
- [x] Create client/src/lib/timeLoop.ts
- [x] Implement startTimeLoop() with ref-based callbacks
- [x] Avoid React setState on every animation frame

### 4) WaveformVisualization Update
- [x] Add separate playhead canvas layer
- [x] Use ref-based time updates instead of prop-based
- [x] Waveform canvas only re-renders on audioBuffer change

### 5) Home.tsx Refactoring
- [x] Replace inline audio logic with AudioRuntime class
- [x] Use ref-based time tracking instead of useState for currentTime during playback
- [x] Only update React state on user interactions or playback stop


## DetectX Audio Runtime Interface Integration (Stateless UI)

### 1) Runtime Interface Types
- [ ] Create shared/detectx-runtime.ts with DetectXAudioState interface
- [ ] Create shared/detectx-runtime.ts with DetectXAudioActions interface
- [ ] Export all types for UI consumption

### 2) WaveformVisualization Stateless Refactor
- [ ] Remove internal RAF loop
- [ ] Remove internal time calculation
- [ ] Accept audioBuffer, currentTime, duration, isDecoding from props
- [ ] Accept onSeek callback only

### 3) AudioPlayerBar Stateless Refactor
- [ ] Remove internal audio context creation
- [ ] Remove internal volume state management
- [ ] Accept isPlaying, currentTime, duration, volume from props
- [ ] Accept play, pause, stop, seek, seekForward, seekBackward, setVolume callbacks

### 4) MetadataPanel Stateless Verification
- [ ] Verify displays injected metadata only
- [ ] No calculation or estimation allowed

### 5) LiveScanConsole Stateless Refactor
- [ ] Remove internal log generation
- [ ] Remove timing logic
- [ ] Accept scanLogs array from props only

### 6) VerdictPanel Stateless Refactor
- [ ] Remove verdict derivation logic
- [ ] Display provided verdict text verbatim
- [ ] Accept verdict object from props only

### 7) Full Layout Component Integration
- [ ] Create VerifyAudioPage layout component
- [ ] Wire all stateless components to DetectXAudioState/Actions interfaces


## Verification Result Execution Contract (LOCKED)

### Absolute Constraints
- [x] Do NOT infer, derive, reinterpret, normalize, or reason about any data
- [x] Do NOT reimplement, refactor, simplify, or modify any DetectX-provided code
- [x] Do NOT add helper logic, mapping logic, fallback logic, or convenience abstractions
- [x] Use ONLY the code, types, and data structures explicitly provided by DetectX

### Type Definition (DetectX-provided, DO NOT MODIFY)
- [x] Apply DetectXVerdictText type: "AI signal evidence was observed." | "AI signal evidence was not observed."
- [x] Apply DetectXVerificationResult interface with verdict, authority, exceeded_axes

### Runtime Rules
- [x] Render verdict text verbatim (no derivation)
- [x] Display exceeded_axes as contextual information only
- [x] Null result → "no result yet" state
- [x] Processing → "inspecting structural signals" state
- [x] LiveScanConsole and Verification Result must remain fully decoupled

### Execution Testing
- [x] Test with Observed sample data
- [x] Test with Not Observed sample data


## Verification Result State Injection Fix

- [x] Add dedicated state variable for DetectXVerificationResult
- [x] Assign resolved verification result object to state (not entire API response)
- [x] Pass state directly into VerdictPanel as result prop
- [x] Ensure isProcessing is set to false once result is available
- [x] Console log verificationResult before rendering to confirm non-null


## Anonymous Stateless Verification Flow

### Authentication Bypass
- [x] Change verification procedures from protectedProcedure to publicProcedure
- [x] Remove login requirement before verification
- [x] Disable auth gate in UI

### Storage Bypass
- [x] Do NOT store uploaded files in Manus storage
- [x] Treat uploaded files as transient
- [x] Forward files directly to DetectX server (or process in-memory)

### Session/History Removal
- [x] No upload history
- [x] No file retention
- [x] No session-based access control

### Authority
- [x] DetectX server is sole authority for processing and results
- [x] Manus acts only as UI layer and request forwarder


## DetectX Audio Analysis UI Copy (FINAL / LOCKED)

### 1) Timeline Analysis
- [ ] Header: "Timeline Analysis"
- [ ] Subheader: "Detected structural events along the audio timeline"
- [ ] Row Labels: Time, Event Type, Axis, Note
- [ ] Event Types: Structural Event, Signal Anomaly, Pattern Break, Spectral Shift
- [ ] Tooltip: "Timeline markers indicate points of interest detected by the verification engine. They do not represent conclusions or judgments."
- [ ] Empty State: "No timeline events detected" / "No structural events were reported for this audio."

### 2) Detailed Analysis
- [ ] Header: "Detailed Analysis"
- [ ] Subheader: "Axis-level geometry metrics reported by the verification engine"
- [ ] Axis Cards: G1-A (Residual Trajectory Curvature), G1-B (Residual Persistence Length), G2-A (Cross-Stem Coupling), G2-B (Residual Symmetry), G3-A (Band Geometry)
- [ ] G1-A note: "Observational axis (does not influence verdict)"
- [ ] Status Labels: "Status: Exceeded" / "Status: Within bounds"
- [ ] Empty Axis State: "No data available for this axis"

### 3) Temporal Analysis
- [ ] Header: "Temporal Analysis"
- [ ] Subheader: "Time-structured geometry series (if provided by the server)"
- [ ] Empty State: "No temporal series available" / "This analysis requires time-series data which was not provided for this scan."
- [ ] Tooltip: "Temporal analysis is displayed only when time-series geometry data is explicitly provided by the server."

### 4) Source Components
- [ ] Header: "Source Components"
- [ ] Subheader: "Analytical stem components derived during verification"
- [ ] Column Labels: Component, Level, Download
- [ ] Component States: Available / Not available
- [ ] Volume Tooltip: "Adjusts playback level for inspection only. Does not affect analysis or verdict."
- [ ] Download Tooltip: "Downloads the analytical stem component provided by the server."
- [ ] Empty State: "No source components available" / "Stem components were not provided for this verification."

### 5) Geometry Scan Trace
- [ ] Header: "Geometry Scan Trace"
- [ ] Subheader: "Execution trace of geometry checks performed by the verification engine"
- [ ] Row Labels: Axis, Exceeded, Metrics
- [ ] Exceeded Display: Yes / No
- [ ] Expand Label: "View metrics" / "Hide metrics"
- [ ] Fixed Disclaimer: "This trace is display-only. No analysis or interpretation is performed in the UI."
- [ ] Empty State: "No geometry trace available" / "No geometry trace data was returned for this scan."

### 6) Global Empty/Waiting States
- [ ] Before Verification: "Awaiting verification" / "Upload an audio file and start verification to view results."
- [ ] During Verification: "Inspecting structural signals…" / "Verification is in progress."

### 7) Global UX Notes
- [ ] All timestamps use MM:SS.mmm
- [ ] All numeric values are monospaced
- [ ] No percentages, confidence scores, or severity indicators
- [ ] No narrative conclusions or summaries
- [ ] Clicking timeline items must seek audio playback


## DetectX Homepage Landing Page Design
- [x] Create Homepage component with forensic, technical tone
- [x] Hero Section: title, supporting lines, CTA, subtext (exact copy)
- [x] Core Section: DetectX Audio description and key principles
- [x] How It Works: 4-step process with deterministic note
- [x] Clear Verdict Semantics: two possible outcomes only
- [x] Mid-Page Action: secondary entry point to Verify Audio
- [x] Protecting Human Creativity section
- [x] Who Uses DetectX Audio: professional contexts list
- [x] Other Detection Modalities: muted/secondary section
- [x] Newsletter Signup: email input near footer
- [x] Footer Principle: "DetectX does not determine authorship" statement
- [x] Header navigation: Technology, Research, Updates, Blog, About, Contact, Verify Audio
- [x] Calm, restrained, text-first design (no illustrations, no hype)


## Homepage Redesign with Images (Jan 11)
- [x] Copy section images to public/images folder
- [x] Implement dark/light mode CSS variables
- [x] Add theme toggle button in header
- [x] Hero Section: text left, image right (herosection.png)
- [x] Core Section: image left, text right (coresection.png)
- [x] How It Works Section: text left, image right (howitworkssection.png)
- [x] Clear Verdict Semantics: image left, text right (ClearVerdictSemanticssection.png)
- [x] Protecting Human Creativity: text left, image right (ProtectingHumanCreativitysection.png)
- [x] Who Uses DetectX Audio: image left, text right (WhoUsesDetectXAudiosection.png)
- [x] Light mode: clean, neutral, low-contrast design
- [x] Calm, technical, forensic tone (not SaaS/marketing)


## Full Website Design (Jan 11)
### Global Changes
- [x] Set Light Mode as default (reverse current dark mode default)
- [x] Ensure DetectX logo navigates to Home
- [x] Apply Light/Dark mode consistently across all pages

### Technology Page
- [x] What DetectX Builds section
- [x] DetectX Audio — Engine Overview section
- [x] Core Technical Principles section
- [x] Verdict Model section
- [x] System Boundaries section
- [x] Deployment Contexts section

### Research Page
- [x] Research Philosophy section
- [x] Why Probability-Based Detection Fails section
- [x] Human-Normalized Baselines section
- [x] Geometry Over Similarity section
- [x] Determinism as a Forensic Requirement section
- [x] Failure Cases and Corrections section
- [x] What DetectX Refuses to Do section
- [x] Ongoing Research Areas section
- [x] Closing Statement section

### Updates Page
- [x] DAY 35: Human Baseline Minimal Strategy Locked entry
- [x] Date: 2026-01-12
- [x] Full update body content

### About Page
- [x] What DetectX Is section
- [x] Why DetectX Exists section
- [x] What DetectX Does — and Does Not Do section
- [x] Human Safety as a Design Constraint section
- [x] How DetectX Is Used section
- [x] Independence and Neutrality section
- [x] Closing Statement section

### Contact Page
- [x] Contact form with email delivery (support@detectx.app)
- [x] Inquiry Type dropdown (Artist/Creator, Producer/Studio, etc.)
- [x] Name, Organization (optional), Email, Subject, Message fields
- [x] Submission confirmation message
- [x] Clear disclaimer: not consumer support, no authorship certification

### Verify Audio Page
- [x] Apply Light/Dark mode support
- [x] Maintain visual consistency with rest of site


## Contact Form Fix & Email Integration (Jan 11)
- [x] Fix Google autocomplete compatibility issue in Contact form
- [x] Install Resend SDK for email delivery
- [x] Create email sending helper function
- [x] Request RESEND_API_KEY from user
- [x] Update contact router to send email to support@detectx.app
- [x] Test email delivery (API key validated)


## VerdictOrientationSlider & Metadata Integration (Jan 14)
- [x] Create VerdictOrientationSlider component
- [x] Update Home.tsx with orientation state and slider
- [x] Update Server Router with orientation parameter
- [x] Update MetadataPanel to use server metadata
- [x] Test orientation parameter flow


## Live Console & Verification Result Layout Improvement (Jan 14)
- [x] Reduce Live Console height to 200px max with internal scroll
- [x] Move Verification Result below Live Console
- [x] Add auto-scroll to bottom when new logs are added
- [x] Display all metadata fields (orientation, cnn_score, geometry_exceeded)


## RunPod API Integration (Jan 14)
- [x] Pull RunPod API integration from GitHub
- [x] Install form-data dependency
- [x] Restart server to apply changes
- [ ] Test RunPod API connection


## Authentication & Beta Mode (Jan 15)
- [x] Add login button to homepage header (right side)
- [x] Implement Google login UI
- [x] Implement Apple login UI
- [x] Pro mode beta pricing: $0 with strikethrough and (beta) label
- [ ] Stripe integration placeholder (EIN pending, US account not ready)
- [x] verify-audio page mobile optimization


## GitHub Sync (Jan 15 - Commit 6582ea2)
- [x] Pull latest commit 6582ea2 from GitHub
- [x] Apply server/routers.ts changes (form-data → Node.js FormData/Blob)
- [x] Fix RunPod API 400 Bad Request error
- [x] Test API connection
