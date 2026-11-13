# ReadyTake for iPhone

This project bundles the ReadyTake editor inside an iOS app using Capacitor. The interface and PDF reader are included in the app; it does not load the GitHub Pages prototype. Build 3 is source for a developer build. It is not a signed IPA or a submission to Apple.

## Build and run

1. Download or clone the `ios-app` branch on a Mac with Xcode 26 or later and Node.js 22 or later. Open Xcode once and install its iOS components.
2. Run `npm ci`, then `npm run ios:sync` from the repository root. Run the sync command again after changing any shared editor files.
3. Run `npm run ios:open`. In Xcode, select the **App** target, open **Signing & Capabilities**, and choose your Apple Developer team. The default bundle ID is `com.carbendi.readytake`; if you need another one, update both the Xcode target and `capacitor.config.json` before registering the app.
4. Connect your iPhone, select it as the run destination, and press Run. This target supports iOS 17 and later; use a physical phone to test capture and export.

## First device test

- Start in Brand Kit. Import a text PDF and a call sheet, reopen the app, and check the extracted text and saved sections. **Share original PDF** opens the system share sheet.
- On Camera, allow camera and microphone access. Test both lenses and record a short A-roll and B-roll clip. Check the status bar, landscape rotation, teleprompter and guides.
- Preview the timeline, record a voiceover, then render a short export with dialogue, B-roll, captions and a logo. Use **Share finished video** to save to Files or send via AirDrop. Confirm that the saved file plays and its audio is in sync. Repeat with a realistic project size.
- Close and relaunch ReadyTake. Verify that clips and edits persist. Safari and the iPhone app have separate storage. Use a brand-kit backup and import original media to move assets across; existing timelines do not transfer.

Build 3 brings AI Assist and the speech-following prompter to iPhone. The GitHub Pages version retains its existing features. The camera, timeline compositor and finished-video renderer still use WebKit, so capture controls, codecs and render performance need on-device testing. Local projects can be lost if the app is removed; save important exports and originals to Files.

- In **Clips → AI Settings**, select **Apple AI** and check availability on a supported iPhone with iOS 26 or later. Use it to review briefs, choose deliverables and generate scripts; it can also propose a cut from analysis already in the project. For large briefs and edit plans, choose an external model if the on-device model reaches its context limit.
- To test an external provider, use your own Gemini, OpenAI or Anthropic API key. The native request layer calls the provider directly, and keys are kept in memory for the session. The app confirms what it will send before each AI task. Gemini receives only 360p video proxies for footage analysis; Apple, OpenAI and Claude can use the resulting text analysis.
- Test **Follow speech** in Camera and **Dictate product notes** in AI Assist. Both use native on-device recognition where available. Check that following speech and recording with audio work together on your phone. Switch to manual scroll if recognition is unavailable or stops.
- Import a scanned call sheet of 10 MB or less. If it has no selectable text, the app tries on-device OCR on the first ten pages. Check the result against the original.
- In **Export → Share editable timeline & media**, export the ZIP, unzip it on your editing computer and import the matching XML. The package carries cuts, B-roll, and available audio sources; it does not recreate LUTs, logos, captions, loops, or ducking. Final Cut XML is structurally checked against Apple's FCPXML 1.10 DTD. Actual imports and relinking in Final Cut, Resolve, and Premiere still need testing.
- Use **Share finished video → Save to Files → Dropbox** when the Dropbox File Provider is available, then copy a link in Dropbox. **Audio → Music prompts** gives you prompts to copy into Suno or another service and import the resulting track. Automatic Dropbox uploads/link creation, Frame.io delivery, and in-app music generation are not implemented.

## TestFlight and App Store

- Register the bundle ID and create the app in App Store Connect using your Apple Developer team. Select a generic iOS device in Xcode and choose **Product → Archive**, then **Distribute App → App Store Connect**. Start with internal TestFlight before submitting for review.
- Prepare the store listing, iPhone screenshots, support URL, privacy policy URL, App Privacy answers, age rating and review notes. Review declarations against the exact version you upload. Explain how to create a project, record a clip and share an export.
- The repo includes camera, microphone and speech recognition purpose strings and a filesystem privacy manifest. The unsigned project was generated and its web assets synced on Linux. Signing, compiling with Xcode, the physical device test and Apple review are still pending.

## Apple Developer review — 13 November 2026

| Apple example or recommendation | ReadyTake build 3 | Next release work |
| --- | --- | --- |
| [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars) and [Communicate your brand identity on iOS](https://developer.apple.com/videos/play/wwdc2026/251/) | Five labelled bottom destinations preserve scroll position. Camera is a separate capture task. Brand colour stays in the content; navigation uses a solid, legible surface. | Verify VoiceOver order and accessibility text sizes, portrait and landscape on the actual phone. The current controls are web controls, not Apple's native Liquid Glass. |
| [AVCam](https://developer.apple.com/documentation/avfoundation/avcam-building-a-camera-app) and [export progress](https://developer.apple.com/documentation/avfoundation/avassetexportsession/states(updateinterval:)) | Explicit capture permissions, visible recording state, camera release when leaving or backgrounding, and export with progress and cancellation. | Use AVCam's session lifecycle as a reference for native capture. Move original files to disk and implement native export with AVFoundation; validate B-roll, caption, logo, LUT, and audio mix parity before switching. |
| [App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/) and [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) | The packaged editor restricts outgoing WebKit requests. Optional external AI uses a fixed provider allowlist and asks before sending project data. PDF reading is local, and sharing is initiated through the iPhone share sheet. Help includes a media usage breakdown and privacy information. | Publish a public privacy policy and support URL and link the policy in the app. Confirm App Privacy answers against the submitted binary and its dependencies. Test the device's low storage behavior. |
| [What's new in iOS 27](https://developer.apple.com/wwdc26/guides/ios/) | Vision OCR and optional Apple Intelligence text tasks run on eligible devices. The minimum iOS target is unchanged. | Evaluate image inputs on sampled frames separately from analysing entire videos. Confirm explicit permission before any third-party AI sharing. |

For device QA, leave the camera while permission is pending; background while recording; cancel an export during preparation; and confirm that the same edit can render again. Test without network access after installation, including a text PDF and Files sharing. Current exports still render in real time through WebKit. The app uses WebKit storage, not a native project library.
