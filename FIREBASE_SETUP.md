# Firebase Authentication Setup Guide

## Issue: Firebase Auth Popup Not Loading

If you're seeing errors when clicking "Sign in with Google" or the popup fails to load, you need to add your domains to Firebase's authorized domains list.

## Required Configuration Steps

### 1. Add Authorized Domains in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **coliana-b6009**
3. Navigate to **Authentication** > **Settings** > **Authorized domains**
4. Add the following domains:

   **For Local Development:**
   ```
   localhost
   ```

   **For GitHub Pages (Production):**
   ```
   elenasivtsova-droid.github.io
   ```

   **Already Authorized (by default):**
   ```
   coliana-b6009.firebaseapp.com
   coliana-b6009.web.app
   ```

### 2. Enable Google Sign-In Provider

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Google** provider
3. Enable it if not already enabled
4. Add your support email
5. Save

### 3. Enable Email/Password Sign-In Provider

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Email/Password** provider
3. Enable it
4. Save

## Current Firebase Project Configuration

```javascript
Project ID: coliana-b6009
Auth Domain: coliana-b6009.firebaseapp.com
API Key: AIzaSyCdqBZa2MQPt3FwO-fTzB16wgPmo1Jem9w
```

## Testing Authentication

### Test Locally

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open browser to `http://localhost:4321/login`

3. Try signing in with:
   - Google account
   - Email/password (if you create an account first)

### Test on Production

1. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

2. Visit `https://elenasivtsova-droid.github.io/coliana/login`

3. Test authentication

## Common Errors and Solutions

### Error: "auth/unauthorized-domain"
**Cause:** The domain you're accessing the app from is not in Firebase's authorized domains list.

**Solution:** Add the domain to authorized domains in Firebase Console (see step 1 above).

### Error: "auth/popup-closed-by-user"
**Cause:** User closed the Google sign-in popup before completing authentication.

**Solution:** This is expected behavior. User just needs to try again.

### Error: "auth/popup-blocked"
**Cause:** Browser blocked the popup window.

**Solution:**
- Allow popups for your domain in browser settings
- Or use redirect mode instead (requires code changes)

### Error: "auth/network-request-failed"
**Cause:** Network connectivity issue or Firebase services unreachable.

**Solution:** Check internet connection and Firebase status.

## Alternative: Using Redirect Instead of Popup

If popup mode continues to cause issues, you can modify the code to use redirect mode:

In `src/components/FirebaseAuthUI.jsx`, change:

```javascript
// From:
const result = await signInWithPopup(auth, provider);

// To:
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';
await signInWithRedirect(auth, provider);
```

Then handle the redirect result in a useEffect hook.

## Verifying Setup

After configuring authorized domains, verify by:

1. Opening browser console (F12)
2. Going to `/login` page
3. Clicking "Sign in with Google"
4. Check console for errors

If you see no errors and the Google sign-in popup appears, configuration is correct!

## Phone Authentication (2FA)

Phone authentication requires additional setup:

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Phone** provider
3. Firebase automatically handles SMS sending
4. For testing, you can add test phone numbers in the Phone provider settings

## Security Considerations

- **API Key**: The Firebase API key in the code is safe to expose in client-side code
- **Authorized Domains**: Always keep this list minimal and up-to-date
- **CORS**: Firebase handles CORS automatically for authorized domains

## Getting Help

If you continue to experience issues:

1. Check the browser console for detailed error messages
2. Verify all authorized domains are added correctly
3. Ensure Google Sign-In provider is enabled
4. Check Firebase project quotas (free tier has limits)
5. Review Firebase Authentication logs in the Console

## Quick Checklist

- [ ] Added `localhost` to authorized domains
- [ ] Added `elenasivtsova-droid.github.io` to authorized domains
- [ ] Enabled Google Sign-In provider
- [ ] Enabled Email/Password provider
- [ ] Enabled Phone provider (for 2FA)
- [ ] Set support email for Google provider
- [ ] Tested locally at `localhost:4321/login`
- [ ] Tested on production GitHub Pages

Once all items are checked, Firebase authentication should work correctly!
