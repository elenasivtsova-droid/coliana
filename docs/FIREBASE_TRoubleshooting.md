Firebase auth/invalid-app-credential — Troubleshooting

This repository uses Firebase Authentication on the client to allow Google Sign-In and phone verification. Older versions of this app used client-side reCAPTCHA for phone verification; that code has been removed from the client in favor of either server-side verification or the Firebase test-mode option.

1. Phone provider / reCAPTCHA issues (client-side)
   - Phone is not enabled in Firebase Console -> Authentication -> Sign-in method.
   - Your running domain is not authorized in Firebase Console -> Authentication -> Authorized domains.
   - If you're testing locally, consider adding `localhost` and the dev port to authorized domains.
   - You can add test phone numbers in the `Phone` provider settings (under Sign-in method) for local dev — that avoids reCAPTCHA.
   - If you still use client-side reCAPTCHA in a fork of this repo, re-using the verifier can cause stale credentials; clear it before creating another.
   - Ensure the `RecaptchaVerifier` constructor uses the correct argument order for the modular SDK: `new RecaptchaVerifier(auth, 'recaptcha-container', parameters)`.
       Passing the container first (as `new RecaptchaVerifier('recaptcha-container', options, auth)`) will break the verifier and commonly cause `INVALID_APP_CREDENTIAL`.
    - If you're running tests or want to bypass reCAPTCHA for local development, you can set:
      ```js
      // WARNING: only use in a test/dev environment
      // You can set this via .env for dev but never enable in prod.
      // Vite env var: VITE_APP_VERIFICATION_DISABLED=true
      auth.appVerificationDisabledForTesting = true;
      ```
       This is a supported test flag in Firebase that disables app verification for phone sign-in; however, it must be set on a valid `auth` instance and should never be used in production.

2. Admin SDK/service account issues (server-side)
   - If you are calling server-side Admin SDKs (not in this repo by default), make sure you initialize Firebase Admin with a valid service account JSON or with Google Application Default Credentials.
   - This repo does not use `firebase-admin` by default — the error shows up by default on the client-side phone flow.

3. App initialization / wrong config
   - Ensure your `firebaseConfig` is correct. Missing/placeholder values (e.g., `your-project.appspot.com`, `123456789`) will cause other authentication issues.
   - If you store config in environment variables, make sure `VITE_` prefix is used for client values (e.g. `VITE_FIREBASE_API_KEY`).

Implementation tips for this repo
- `src/firebase.js`: this file currently includes some placeholder values (appId / messagingSenderId / storageBucket). Replace placeholders with actual project settings from Firebase Console.
- `src/AuthContext.jsx`: client-side reCAPTCHA was removed from this repository. Instead, the code uses the `auth.appVerificationDisabledForTesting` flag for local development or requires a server-side verification flow for production phone-sends.
- Testing phone sign-in: use the built-in test phone numbers from Firebase to bypass the reCAPTCHA flow while developing.
   - In this repo we also support bypassing server-side SMS sends by setting
      `auth.appVerificationDisabledForTesting` (dev flag in `src/firebase.js`).
      When that flag is enabled the client will return a fake confirmation
      result for the phone flow and accept the code `000000` for local testing.
      This avoids Firebase rate limits during development — but do not enable
      this in production.

If you need further help, gather the following:
- Screenshots of the exact Firebase error object from the browser console (expand the object — you'll get code and stack trace).
- The domain you're running the app from (localhost, deployed domain, GitHub Pages, etc.).
- Whether phone provider is enabled and any test numbers configured.
