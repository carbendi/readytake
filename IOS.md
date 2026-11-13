# ReadyTake for iPhone

This project bundles the ReadyTake editor inside an iOS app using Capacitor. The interface and PDF reader are included in the app; it does not load the GitHub Pages prototype. This is the first iPhone test build, not a signed IPA or a submission to Apple.

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

AI Assist and automatic speech following are disabled in this first iPhone target. The GitHub Pages version retains its existing features. The camera and renderer still use WebKit, so frame rates, codecs and output performance must be checked on device. Local projects can be lost if the app is removed; save important exports and originals to Files.

## TestFlight and App Store

- Register the bundle ID and create the app in App Store Connect using your Apple Developer team. Select a generic iOS device in Xcode and choose **Product → Archive**, then **Distribute App → App Store Connect**. Start with internal TestFlight before submitting for review.
- Prepare the store listing, iPhone screenshots, support URL, privacy policy URL, App Privacy answers, age rating and review notes. Review declarations against the exact version you upload. Explain how to create a project, record a clip and share an export.
- The repo includes camera and microphone purpose strings and a filesystem privacy manifest. The unsigned project was generated and its web assets synced on Linux. Signing, compiling with Xcode, the physical device test and Apple review are still pending.

## Apple Developer review — 13 November 2026

| Apple example or recommendation | ReadyTake build 2 | Next release work |
| --- | --- | --- |
| [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars) and [Communicate your brand identity on iOS](https://developer.apple.com/videos/play/wwdc2026/251/) | Five labelled bottom destinations preserve scroll position. Camera is a separate capture task. Brand colour stays in the content; navigation uses a solid, legible surface. | Verify VoiceOver order and accessibility text sizes, portrait and landscape on the actual phone. The current controls are web controls, not Apple's native Liquid Glass. |
| [AVCam](https://developer.apple.com/documentation/avfoundation/avcam-building-a-camera-app) and [export progress](https://developer.apple.com/documentation/avfoundation/avassetexportsession/states(updateinterval:)) | Explicit capture permissions, visible recording state, camera release when leaving or backgrounding, and export with progress and cancellation. | Use AVCam's session lifecycle as a reference for native capture. Move original files to disk and implement native export with AVFoundation; validate B-roll, caption, logo, LUT, and audio mix parity before switching. |
| [App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/) and [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) | The packaged editor restricts outgoing requests. PDF reading is local, and sharing is initiated by the user through the iPhone share sheet. Help includes a media usage breakdown and privacy information. | Publish a public privacy policy and support URL and link the policy in the app. Confirm App Privacy answers against the submitted binary and its dependencies. Test the device's low storage behavior. |
| [What's new in iOS 27](https://developer.apple.com/wwdc26/guides/ios/) | This build keeps the existing minimum iOS target and does not depend on Apple Intelligence. | Try Vision OCR for scanned call sheets and Foundation Models for structured briefs and scripts on supported hardware. Evaluate image inputs on sampled frames separately from analysing entire videos. Confirm explicit permission before any third-party AI sharing. |

For device QA, leave the camera while permission is pending; background while recording; cancel an export during preparation; and confirm that the same edit can render again. Test without network access after installation, including a text PDF and Files sharing. Current exports still render in real time through WebKit. The app uses WebKit storage, not a native project library.
