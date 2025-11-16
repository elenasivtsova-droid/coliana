# Firebase Phone Authentication Setup

## Current Error: `auth/invalid-app-credential`

This error occurs when reCAPTCHA verification fails. Follow these steps to fix it:

## Step 1: Add Authorized Domains in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **rich-agency-478220-d8**
3. Navigate to: **Authentication → Settings → Authorized domains**
4. Click **"Add domain"** and add:
   - `localhost` (for local development)
   - `elenasivtsova-droid.github.io` (for production)

## Step 2: Verify reCAPTCHA Settings

### Option A: Use Test Phone Numbers (For Development)

1. In Firebase Console, go to **Authentication → Sign-in method → Phone**
2. Scroll down to **"Phone numbers for testing"**
3. Add a test phone number:
   - Phone number: `+1 555-555-5555` (or your preferred test number)
   - Verification code: `123456`
4. Use this test number during development to bypass SMS sending

### Option B: Enable reCAPTCHA v3 (Recommended for Production)

Firebase Phone Auth uses invisible reCAPTCHA, but you need to ensure it's properly configured:

1. Go to [Google Cloud Console - reCAPTCHA](https://console.cloud.google.com/security/recaptcha)
2. Select your project: **rich-agency-478220-d8**
3. Verify you have a reCAPTCHA key registered
4. Add your domains to the reCAPTCHA allowed domains:
   - `localhost`
   - `elenasivtsova-droid.github.io`

## Step 3: Local Development Workaround

For local development, you can temporarily use Firebase's testing mode:

**IMPORTANT:** This is only for development and should NOT be used in production!

Uncomment the following code in `src/firebase.js`:

```javascript
// Developer toggle: set to true in local development only
auth.appVerificationDisabledForTesting = true;
```

Then use the test code `000000` for verification.

## Step 4: Check App Check (Advanced)

If you've enabled App Check in Firebase, you need to:

1. Go to Firebase Console → App Check
2. Register your app
3. Configure reCAPTCHA Enterprise or reCAPTCHA v3

## Current Configuration

Your Firebase config is in `src/firebase.js`:
- Project ID: `rich-agency-478220-d8`
- Auth Domain: `rich-agency-478220-d8.firebaseapp.com`

## Testing Steps

After making changes:

1. Clear browser cache and cookies
2. Restart your dev server: `npm run dev`
3. Try phone verification again
4. Check browser console for any reCAPTCHA errors

## Common Issues

### Issue: "reCAPTCHA has already been rendered in this element"
**Solution:** Refresh the page completely (Ctrl+Shift+R / Cmd+Shift+R)

### Issue: "Too many requests"
**Solution:** Wait 5-10 minutes before trying again, or use test phone numbers

### Issue: reCAPTCHA not loading
**Solution:** Check your internet connection and ensure reCAPTCHA is not blocked by ad blockers

## Need More Help?

Check the official Firebase documentation:
- [Phone Authentication Web](https://firebase.google.com/docs/auth/web/phone-auth)
- [reCAPTCHA Configuration](https://firebase.google.com/docs/auth/web/phone-auth#configure-recaptcha)
