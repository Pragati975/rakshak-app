# Rakshak: Play Store setup, in order

Work through the parts in order. Each part says what to run or click and how to check it worked.
`PROJECT` means the folder that contains `package.json`, `src` and `android`.

---

## Part 1: Install the new packages (2 min)

In the VS Code terminal, inside `PROJECT`:

```
npm i firebase @capacitor/device @capacitor/geolocation @capacitor/local-notifications @capacitor/push-notifications @capacitor-community/background-geolocation @capacitor-firebase/crashlytics
npm i -D @capacitor/assets
```

## Part 2: Copy the files (2 min)

From the kit:

| Kit file or folder | Goes to |
|---|---|
| `src/*.js`, `src/*.jsx` (10 files) | `PROJECT/src/` (replace the old ones) |
| `.env.production`, `.env.demo` | `PROJECT/` |
| `assets/` | `PROJECT/assets/` |
| `firestore.rules`, `firebase.json`, `.firebaserc` | `PROJECT/` |
| `functions/` | `PROJECT/functions/` |
| `rename-package.cjs` | `PROJECT/` |
| `privacy-policy.html` | host it online (Part 9) |

Then run `npm run build`. It must finish without errors.

## Part 3: Secure the database (5 min). Do this first.

Before you publish the rules, check that your two test accounts have profiles:
Firebase console, Firestore Database, collection `users`. Each login must have a document with `role` (`commander` or `field`) and, for field units, `unitId` (a number 1 to 5). Your `commander@rakshak.app` and `alpha@rakshak.app` already do. Any login without a document will be locked out.

Publish the rules, either way:

- **Console:** Firestore Database, **Rules** tab, delete everything, paste the contents of `firestore.rules`, click **Publish**.
- **Command line:** `npm i -g firebase-tools`, `firebase login`, then `firebase deploy --only firestore:rules`.

Check it worked: log in on both phones and repeat the SOS, ping and mission tests. If something shows "permission denied" in the console, tell me which action.

## Part 4: Real app id, name and icon (10 min)

1. Run (from `PROJECT`):
   ```
   node rename-package.cjs com.example.rakshak com.pragati.rakshak "Rakshak"
   ```
   If your current id is different, use that as the first value. It moves the Java folder and fixes `build.gradle`, the manifest values, `strings.xml` and `capacitor.config.json`.
2. Generate the icon and splash screens from `assets/`:
   ```
   npx capacitor-assets generate --android
   ```
3. Add one line to `PROJECT/capacitor.config.json` so background location keeps running past 5 minutes:
   ```json
   "android": { "useLegacyBridge": true }
   ```
   (put it next to `appId` and `appName`, with a comma after the previous line)
4. Run `npm run build && npx cap sync`.
5. In Android Studio: **File, Sync Project with Gradle Files**, then **Build, Clean Project**.
6. **Uninstall the old Rakshak from your phones.** The new id installs as a separate app.

Version: `versionName` and `versionCode` are in `android/app/build.gradle`. Every upload to Google needs a higher `versionCode` than the last one (1, then 2, then 3).

## Part 5: Register the new app in Firebase (5 min)

Firebase only knows `com.example.rakshak`. Push and crash reports need the new id.

1. Firebase console, gear icon, **Project settings**, **Your apps**, **Add app**, Android.
2. Package name: `com.pragati.rakshak`. App nickname: `Rakshak`. Click **Register app**.
3. Download `google-services.json` and put it in `PROJECT/android/app/` (next to `build.gradle`).
4. Skip the other steps Firebase shows.

## Part 6: Crash reports (Crashlytics) (5 min)

Two small edits in Android Studio.

1. Open `android/build.gradle`. In `buildscript, dependencies`, under the `google-services` line, add:
   ```
   classpath 'com.google.firebase:firebase-crashlytics-gradle:2.9.9'
   ```
2. Open `android/app/build.gradle`. Near the bottom, inside the `try { ... }` block, under `apply plugin: 'com.google.gms.google-services'`, add:
   ```
   apply plugin: 'com.google.firebase.crashlytics'
   ```
3. Firebase console, **Crashlytics**, click **Enable** if asked.
4. Sync Gradle and run the app. Reports appear in the console within a few minutes after the first crash or error.

## Part 7: Push notifications when the app is closed (15 min)

This needs the **Blaze** plan (pay as you go). A project this size stays inside the free monthly quota. Add a budget alert so you are told if anything ever costs money: Google Cloud console, Billing, Budgets & alerts, create a budget of 1 USD.

1. Firebase console, bottom left, **Upgrade**, choose **Blaze**, add a card.
2. Open `functions/index.js` and check `REGION`. It must match your Firestore location (Firestore Database page, shown at the top). Change it if yours is different.
3. In the terminal:
   ```
   cd functions
   npm install
   cd ..
   firebase deploy --only functions
   ```
4. Open `.env.production` and set `VITE_ENABLE_PUSH=true`.
5. `npm run build && npx cap sync`, then Run.
6. Test: log in as commander on phone 1, **swipe the app away completely**. On phone 2 (Alpha), hold SOS. Phone 1 should show a notification within a few seconds.

Without Part 7 the app still works. Notifications then appear only while the app is running (the free local notifications).

## Part 8: Check everything on two phones

- Commander: sign in, Settings, Team accounts, create an account for a real email. That person receives an email to set a password.
- Field phone: sign in, tap **Allow** on the location screen, then **Allow** on Android's location prompt. A "Rakshak is sharing your position" notification appears.
- Lock the field phone for 3 minutes. On the commander phone, Last update stays fresh.
- Forgot password: type an email on the sign-in screen, tap Forgot password, check the inbox.
- Settings, Delete my account, on a throwaway account.
- Sign out on a phone, then check it stops getting notifications.
- Release build has no "Continue in demo mode" button.

To make an existing person a commander, edit their document in Firestore, collection `users`: set `role` to `commander`.

## Part 9: Privacy policy page (5 min)

Google requires a public privacy policy link.

1. Open `privacy-policy.html` and replace `REPLACE-WITH-YOUR-EMAIL@example.com` with an email you check.
2. Put it on GitHub Pages: create a public repo called `rakshak`, upload the file, Settings, Pages, Source: main branch. The address will be `https://<your-github-name>.github.io/rakshak/privacy-policy.html`.
3. Put that address in `VITE_PRIVACY_URL` in `.env.production`, and rebuild.

## Part 10: Signed release build (15 min)

1. Create your signing key (once). Back it up in two places. If you lose it you cannot update the app.
   ```
   keytool -genkey -v -keystore rakshak-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias rakshak
   ```
2. Android Studio: **Build, Generate Signed App Bundle / APK**, choose **Android App Bundle**, pick the keystore, release, finish.
3. The file is `android/app/release/app-release.aab`. That is what you upload.

## Part 11: Play Console (the paperwork)

1. Create a developer account at play.google.com/console (one-time 25 USD fee, identity check).
2. **Create app**: name Rakshak, free, app (not game).
3. Store listing: short description (80 characters), full description, 512x512 icon (use `assets/icon-only.png` resized), a 1024x500 feature graphic, at least 2 phone screenshots.
   Describe it as a **team safety and coordination app for events, volunteers and field teams**.
4. **App access**: the app needs a login. Create a commander and a field account for reviewers and enter the emails and passwords there.
5. **Data safety** form. Answer like this:

   | Data | Collected | Shared | Why |
   |---|---|---|---|
   | Email address | Yes | No | Account management |
   | Precise location (also in background) | Yes | No | App functionality |
   | Messages (in-app) | Yes | No | App functionality |
   | Device or other ids (push token) | Yes | No | App functionality |
   | Crash logs, diagnostics | Yes | No | Analytics, app stability |

   Data is encrypted in transit: yes. Users can request deletion: yes (in the app, and by email).
   Firebase acts as your processor, so it is not "sharing".
6. **Privacy policy**: paste your GitHub Pages link.
7. **Foreground service** and **location** declarations: choose the type "location" and explain: "Field team members share their position with their commander while on duty. A persistent notification is shown." Google may ask for a short screen recording that shows the in-app disclosure ("Share your location?") and then the permission prompt. Your app already shows both.
8. Content rating questionnaire (no violence or adult content), target audience 18+, ads: none.
9. Upload `app-release.aab` to **Internal testing** first, add yourself and a few friends, and install from the Play link.
10. New personal developer accounts must usually run a **closed test** with a minimum number of testers (it was 12 testers for 14 days at last check, read the current number in Play Console under "Production access") before **Production** is unlocked. Start collecting testers' Gmail addresses now.

Review risk: apps that track location and have an SOS feature get extra attention. Keep the description honest, show the location disclosure in your screen recording, and do not call it military or surveillance software.
