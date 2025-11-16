# Firebase Authentication UI Widget

This application uses a streamlined Firebase Authentication UI for secure user login.

## Features

The FirebaseAuthUI component provides:

1. **Google Sign-In (SSO)** - OAuth authentication via Google popup
2. **Phone Verification (Required)** - Two-factor authentication via SMS

## Component Location

- **Component**: `src/components/FirebaseAuthUI.jsx`
- **Usage**: `src/Login.jsx`

## How It Works

### Authentication Flow

1. User visits `/login` page
2. FirebaseAuthUI component renders with Google Sign-In button
3. User clicks "Continue with Google"
4. Google OAuth popup appears for authentication
5. On successful authentication, `handleFirebaseAuthSuccess` is called
6. User data is stored in localStorage and AuthContext
7. User profile is fetched from Apps Script backend
8. PhoneVerification component is displayed (required)
9. User enters phone number and receives SMS code
10. User enters verification code to complete setup
11. Phone number is saved to backend
12. User is redirected to home page

### Component Props

```jsx
<FirebaseAuthUI
  onSuccess={(user) => {}}  // Called when authentication succeeds
  onError={(error) => {}}   // Called when authentication fails
/>
```

### User Object Format

After successful authentication, the user object contains:

```javascript
{
  email: "user@example.com",
  name: "John Doe",
  picture: "https://...",
  given_name: "John",
  family_name: "Doe",
  uid: "firebase-user-id"
}
```

## UI Features

- **Clean Design** - Simple, focused Google SSO button
- **Responsive** - Works on mobile and desktop
- **Error Handling** - User-friendly error messages for common issues
- **Loading States** - Visual feedback during authentication
- **Google Branding** - Official Google logo and colors

## Error Handling

The component provides user-friendly error messages for common Firebase Auth errors:

- Popup closed by user
- Popup blocked by browser
- Unauthorized domain
- Google sign-in not enabled
- Network errors
- Account exists with different credential

## Phone Verification (Required)

After Google Sign-In, all users must verify their phone number:

1. PhoneVerification component is displayed
2. User enters phone number (US format with country code)
3. Click "Send verification code" triggers Firebase reCAPTCHA and SMS
4. User receives 6-digit code via SMS
5. User enters code and clicks "Verify phone number"
6. Phone number is saved to Firebase and backend
7. User is marked as verified and redirected to home page

### Phone Verification Features

- **ReCAPTCHA Protection** - Invisible reCAPTCHA prevents abuse
- **Rate Limiting** - Cooldown periods prevent spam
- **Error Handling** - Clear messages for invalid codes, too many attempts
- **Resend Option** - Users can request a new code
- **Cancel Option** - Sign out and start over if needed

## Styling

The component uses Tailwind CSS for a modern, clean design:

- **FirebaseAuthUI**: Rounded card with border, centered layout
- **PhoneVerification**: Emerald color scheme for verification actions
- **Slate gray** for text and borders throughout
- **Rounded buttons** with hover states
- **Consistent spacing** and typography

## Backend Integration

The authentication system integrates with:

- **Firebase Authentication** - For Google OAuth and phone verification
- **Apps Script Backend** - For user profile storage and group management
  - `fetchUserGroups()` - Retrieves user groups from Google Sheets
  - `fetchUserProfile()` - Retrieves stored user profile data
  - `saveUserProfile()` - Saves phone number to backend storage

## Development Notes

- **Firebase v12** - Uses modular Firebase SDK
- **Google Sign-In** - Popup mode for better UX
- **Phone Verification** - Firebase SMS with reCAPTCHA
- **localStorage** - Used for session persistence
- **No tokens stored** - Firebase handles auth state internally
- **Clean architecture** - Removed Google Identity Services (GSI) library

## Key Implementation Details

### AuthContext.jsx
- Manages user state and authentication flow
- Handles phone verification logic with reCAPTCHA
- Integrates with Apps Script backend for profile data
- Provides auth methods to all components via Context API

### FirebaseAuthUI.jsx
- Simple Google SSO button only
- Error handling for popup issues
- Loading states for better UX

### Login.jsx
- Conditional rendering based on auth state
- Shows PhoneVerification component when needed
- Redirects to home when fully authenticated
