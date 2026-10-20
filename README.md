# ReadyTake — Working browser prototype v0.1

A static, dependency-free camera app prepared for GitHub Pages. This is working source code, distinct from the earlier simulated UI prototype. No build step, account, API key, AI service or upload server is required.

## Put it on GitHub Pages

1. Extract `ReadyTake-Working-Prototype.zip` on your computer.
2. In GitHub, create a **new repository**, for example `readytake`. Choose the visibility appropriate for your account; GitHub Pages availability for private repositories depends on your plan. The code contains no credentials or recordings.
3. Use **Add file → Upload files**. Upload the extracted files and folders. `index.html` must be directly in the repository root, not inside another folder. Upload the files themselves, not the ZIP.
4. Commit the upload to `main`.
5. Open **Settings → Pages → Build and deployment**.
6. Set **Source: Deploy from a branch**, **Branch: main**, **Folder: / (root)**, then **Save**.
7. Wait for GitHub’s deployment to complete. Open the published HTTPS address shown on the Pages settings screen. Normally it is `https://YOUR-USERNAME.github.io/readytake/`.

Do not open the GitHub source-code page as the app. Do not embed it in Wix or another iframe for this test. Use the published HTTPS page directly.

On iPhone, open the published link in Safari, allow camera/microphone when asked, and optionally use **Share → Add to Home Screen**. The app is not an offline PWA: open it with a network connection so its files can load.

## First five-minute test

1. Camera → select front or back camera → **Enable camera & mic**.
2. Record five seconds, then stop. The original is saved in this browser.
3. Open **Clips & edit**, play the take and download its original.
4. Adjust its in/out points. Optionally import a second clip and move it earlier/later.
5. Open **Export**, enter a short caption, keep 720 pixels selected, then **Render sequence**.
6. Keep the app visible until it completes. Tap **Download finished video**. The output is MP4 or WebM according to the browser encoder. It is not renamed to pretend it is another format.
7. Once the basic test works, try a logo, LUT or imported voiceover/music.

## What works

- Live camera and microphone capture using `getUserMedia` and `MediaRecorder`.
- Front/back preference, resolution/frame-rate requests, microphone selection, plus hardware zoom/exposure compensation/torch when the camera exposes them.
- Clean original recordings, saved as blobs in IndexedDB, without prompter/guides/LUTs/graphics baked in.
- Client kits, reusable setup and downloadable/importable kit backups with LUT/font/logo assets.
- Creative 3D `.cube` LUT import (2–65 points), input domains, GPU trilinear interpolation and strength control. Values outside 0–1 are clipped in this browser prototype. No automatic HDR/log colour management.
- Manual-speed teleprompter, adjustable type size, thirds grid and approximate social-safe guides.
- Experimental browser speech dictation and script-following where `SpeechRecognition` is exposed. The browser vendor may process speech online. This is **not** Apple Foundation Models or guaranteed on-device speech recognition.
- Video import, clip selection, trim in/out, reordering and original downloads.
- B-roll import or camera recording, positioned at a time in the full sequence and muted over the original dialogue.
- Imported voiceover and looping background music, with voiceover start offset.
- Speech-level-driven audio ducking while rendering: voiceover lowers main voice, and either voice lowers music. Independent switches, adjustable reductions, smooth gain recovery. Threshold is a basic RMS heuristic; noisy audio may cause false triggers. Refine by listening to the rendered result.
- Manual captions or timed SRT import, custom font, caption colour/size, PNG logo placement/size, all composited during export.
- A real-time rendered sequence download using canvas capture, Web Audio mixing and the browser’s supported encoder.
- A selected-originals ZIP and JSON edit manifest. Individual source downloads stay available if a ZIP is too large.

## What is not in this build

- Native Apple AI, external AI connections, brief interpretation, AI script generation, automatic subtitles or AI take selection.
- Dropbox authentication/uploads/review links, Frame.io or client approval services.
- FCPXML/Premiere XML export. The edit manifest is JSON and is labelled as such.
- Native shutter angle/ISO/white-balance controls on browsers that do not expose them.
- Guaranteed 4K capture, 25/50 fps, MP4 output, HDR/10-bit rendering, background recording or background rendering.
- Frame-accurate offline export. This version records real-time browser playback; transitions/seeks can have small timing differences. The canvas render targets 30 fps; it does not inherit a requested 25/50 fps recording setting.
- Rendered sequence playback with overlays inside the editor: the clip player previews raw trimmed footage; B-roll, LUTs, captions, logo and mixed audio appear in the rendered output.

## Storage and privacy

Media and assets stay on the current device/browser origin. GitHub hosts source files only and does not receive the recordings. There are no analytics, third-party scripts, remote fonts or AI calls in the application source.

IndexedDB is not a permanent archive. Browser storage may be cleared or evicted, private browsing can restrict it, and changing the Pages URL gives a separate workspace. Download important originals and kit backups. Exporting large files uses memory; the originals ZIP is capped at 450 MB and individual clip downloads are provided.

During recording, switching away or locking the phone may stop capture. This app attempts to stop/save a take when the page becomes hidden. Rendering cancels when the tab is hidden. Keep it visible and download a successful five-second test before a longer recording.

## Tips

- Start at 1080p capture and 720-pixel output. Increase only after a short test works.
- If camera permission is denied, allow it in the browser’s website settings, then enable again.
- For an external mic, connect it before enabling camera. Select it and enable the camera again to apply the change.
- Changing camera/resolution/frame-rate/microphone settings applies when you enable the camera again.
- Front camera preview is mirrored; originals and exports are unmirrored.
- If export is unsupported or unstable, download the clean originals and edit them in Resolve/Premiere/Final Cut.
- Use creative Rec.709 LUTs for normal browser camera footage. A log-to-Rec.709 LUT on normal footage is likely to look wrong.
- Voice dictation/follow-speech requires browser support, permission and possibly internet access. Paste a script and use manual scroll if unavailable.

## Local development

No dependencies are needed. On Windows, from the extracted folder:

```powershell
py -m http.server 8080
```

Then open `http://localhost:8080` on that computer. On macOS/Linux use `python3 -m http.server 8080`. A phone opening your computer’s plain-HTTP LAN address will not usually have camera access; use the HTTPS GitHub Pages link on the phone.

With Node 20+ installed, run `npm test` for the logic and mocked capture/storage integration tests. No npm install is needed.

## Validation

12 automated tests passed for LUT parsing/axis mapping, SRT timing, trimming/order, audio priority and recovery, output dimensions, MIME selection, speech matching, escaped text, ZIP integrity, DOM references and a mocked camera-record-save lifecycle. All application JavaScript passed syntax checks. Camera hardware, browser playback/encoding and visual rendering have not been verified on a real iPhone or through a browser in this environment. Start with the five-second test above.

## Source map

- `index.html`, `styles.css`: responsive UI.
- `app.js`: interactions, capture, kits, clips and prompter.
- `core.js`: parsing, timing, audio-priority decisions and pure helpers.
- `renderer.js`: GPU LUT preview and canvas graphics.
- `exporter.js`: real-time sequence rendering and audio mixing.
- `storage.js`: IndexedDB media/assets/settings.
- `zip.js`: dependency-free ZIP downloads.
- `tests/`: automated tests.

Created for Hurcan’s ReadyTake project. This package does not assign or change ownership rights.
