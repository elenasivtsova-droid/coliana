import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { auth } from './firebase';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { SCRIPT_URL } from './config';

const AuthContext = createContext();
const RECAPTCHA_CONTAINER_ID = 'recaptcha-container';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('coliana_user');
    const storedToken = localStorage.getItem('coliana_token');
    if (storedUser && storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;
        if (decoded.exp > currentTime) {
          return JSON.parse(storedUser);
        } else {
          localStorage.removeItem('coliana_user');
          localStorage.removeItem('coliana_token');
        }
      } catch (error) {
        localStorage.removeItem('coliana_user');
        localStorage.removeItem('coliana_token');
      }
    }
    return null;
  });
  const [userGroups, setUserGroups] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [phoneVerificationId, setPhoneVerificationId] = useState(null);
  const [confirmationResultObj, setConfirmationResultObj] = useState(null);
  const [phoneVerified, setPhoneVerified] = useState(() => {
    // Load phone verification status from localStorage
    const stored = localStorage.getItem('coliana_phone_verified');
    return stored === 'true';
  });
  const [verificationCooldownUntil, setVerificationCooldownUntil] = useState(null);

  const ensureRecaptchaContainer = () => {
    if (typeof document === 'undefined') return null;
    let container = document.getElementById(RECAPTCHA_CONTAINER_ID);
    if (!container) {
      container = document.createElement('div');
      container.id = RECAPTCHA_CONTAINER_ID;
      container.style.display = 'none';
      document.body.appendChild(container);
    }
    return container;
  };

  const buildRecaptchaVerifier = (clientAuth) => {
    if (typeof window === 'undefined') return null;
    ensureRecaptchaContainer();
    if (window.recaptchaVerifier && typeof window.recaptchaVerifier.clear === 'function') {
      try {
        window.recaptchaVerifier.clear();
      } catch (recaptchaError) {
        console.debug('Failed to clear existing reCAPTCHA verifier', recaptchaError);
      }
      window.recaptchaVerifier = null;
    }
    try {
      const verifier = new RecaptchaVerifier(clientAuth, RECAPTCHA_CONTAINER_ID, { size: 'invisible' });
      window.recaptchaVerifier = verifier;
      return verifier;
    } catch (recaptchaError) {
      console.error('Unable to initialize reCAPTCHA verifier:', recaptchaError);
      return null;
    }
  };

  const clearRecaptchaVerifier = () => {
    if (typeof window === 'undefined') return;
    const existing = window.recaptchaVerifier;
    if (existing && typeof existing.clear === 'function') {
      try {
        existing.clear();
      } catch (recaptchaError) {
        console.debug('Failed to clear reCAPTCHA verifier', recaptchaError);
      }
    }
    window.recaptchaVerifier = null;
  };

  const handleCredentialResponse = (response) => {
    const decoded = jwtDecode(response.credential);
    console.log('Decoded JWT:', decoded);
    setUser(decoded);
    // Store in localStorage
    localStorage.setItem('coliana_user', JSON.stringify(decoded));
    localStorage.setItem('coliana_token', response.credential);
    // Reset phone verification on new sign-in (will be set to true if found in profile)
    setPhoneVerified(false);
    localStorage.removeItem('coliana_phone_verified');
    // Fetch user groups from Apps Script
    fetchUserGroups();
    // Also fetch stored profile (e.g., phone) for this user
    // This will set phoneVerified to true if a phone exists in the profile
    if (decoded && decoded.email) {
      fetchUserProfile(decoded.email);
    }
  };

  const fetchUserGroups = async () => {
    try {
      // Replace with your deployed Apps Script web app URL
      const response = await fetch(SCRIPT_URL);
      const data = await response.json();
      setUserGroups(data.groups || []);
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  };

  const fetchUserProfile = async (email) => {
    try {
      const url = `${SCRIPT_URL}?action=getUserProfile&email=${encodeURIComponent(email)}`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (data && data.result === 'success' && data.user) {
        const profile = data.user;
        setUser((prev) => {
          const merged = { ...(prev || {}), ...profile };
          localStorage.setItem('coliana_user', JSON.stringify(merged));
          return merged;
        });

        // If user has a verified phone number in their profile, mark as verified
        if (profile.phone && profile.phone.trim()) {
          setPhoneVerified(true);
          localStorage.setItem('coliana_phone_verified', 'true');
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const saveUserProfile = async ({ phone, name } = {}) => {
    try {
      if (!user || !user.email) return { success: false, error: 'No user logged in' };
      const body = {
        formType: 'save-user',
        email: user.email,
        phone: phone || '',
        name: name || user.name || ''
      };
      const resp = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await resp.json();
      if (data.result === 'success') {
        // Update local user object
        const updated = { ...(user || {}), phone: phone || user.phone };
        setUser(updated);
        localStorage.setItem('coliana_user', JSON.stringify(updated));
        return { success: true };
      }
      return { success: false, error: data.message || 'Error saving user' };
    } catch (error) {
      console.error('Error saving user profile:', error);
      return { success: false, error: error.message };
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setUserGroups([]);
    setPhoneVerificationId(null);
    setPhoneVerified(false);
    // Clear localStorage
    localStorage.removeItem('coliana_user');
    localStorage.removeItem('coliana_token');
    localStorage.removeItem('coliana_phone_verified');
    // If using Google's sign-out
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const sendPhoneVerificationCode = async (phoneNumber) => {
    const now = Date.now();
    if (verificationCooldownUntil && now < verificationCooldownUntil) {
      const secs = Math.ceil((verificationCooldownUntil - now) / 1000);
      return { success: false, error: `Too many attempts - try again in ${secs} second${secs === 1 ? '' : 's'}.` };
    }
    try {
      // Format phone number for Firebase (must include country code)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;
      console.log('[PhoneVerify] sendPhoneVerificationCode invoked', {
        rawPhone: phoneNumber,
        formattedPhone,
        cooldown: verificationCooldownUntil,
        timestamp: now,
      });

      // Ensure we have an auth instance (fallback to getAuth()); sometimes
      // imports can be undefined due to module order or SSR - guard for that.
      const clientAuth = auth || getAuth();

      if (!clientAuth) {
        console.error('Firebase auth is not initialized. Cannot create reCAPTCHA.');
        return { success: false, error: 'Firebase auth not initialized' };
      }

      // set a short client-side lock to avoid accidental double clicks while the request runs
      setVerificationCooldownUntil(Date.now() + 5 * 1000);

      // In dev/test mode we short-circuit Firebase and return a simple
      // fake confirmation result so front-end verification flows can be
      // exercised without causing sms sends or hitting Firebase rate limits.
      if (clientAuth && clientAuth.appVerificationDisabledForTesting) {
        console.log('[PhoneVerify] appVerificationDisabledForTesting=true, returning fake confirmation');
        const fakeConfirmation = {
          verificationId: `dev-${Date.now()}`,
          confirm: async (code) => {
            // Use a stable code for dev testing so callers can reliably
            // exercise success and failure paths. Default is '000000'.
            if ((code || '').trim() === '000000') {
              return { user: { phoneNumber: formattedPhone } };
            }
            throw new Error('Invalid verification code for dev mode - use 000000');
          },
        };
        setPhoneVerificationId(fakeConfirmation.verificationId);
        setConfirmationResultObj(fakeConfirmation);
        setVerificationCooldownUntil(null);
        return { success: true };
      }

      let appVerifier = typeof window !== 'undefined' ? window.recaptchaVerifier : null;
      if (!appVerifier) {
        appVerifier = buildRecaptchaVerifier(clientAuth);
        console.log('[PhoneVerify] Built new RecaptchaVerifier instance', { hasVerifier: !!appVerifier });
      } else {
        console.log('[PhoneVerify] Reusing existing RecaptchaVerifier instance');
      }
      if (appVerifier && typeof appVerifier.getResponse === 'function') {
        console.log('[PhoneVerify] reCAPTCHA response before render', appVerifier.getResponse());
      }
      if (!appVerifier) {
        setVerificationCooldownUntil(null);
        return { success: false, error: 'Unable to initialize reCAPTCHA verifier' };
      }

      console.log('[PhoneVerify] Rendering reCAPTCHA challenge');
      await appVerifier.render();

      const confirmationResult = await signInWithPhoneNumber(clientAuth, formattedPhone, appVerifier);
      console.log('[PhoneVerify] signInWithPhoneNumber resolved', {
        verificationId: confirmationResult?.verificationId,
      });
      setPhoneVerificationId(confirmationResult?.verificationId);
      setConfirmationResultObj(confirmationResult);
      clearRecaptchaVerifier();
      // clear the temporary lock once we have a result
      setVerificationCooldownUntil(null);
      return { success: true };
    } catch (error) {
      // Firebase phone will return TOO_MANY_ATTEMPTS_TRY_LATER when a number is
      // being requested too many times in quick succession. Convert this to
      // a developer-friendly string we can show in the UI.
      console.error('Error sending verification code:', error);
      clearRecaptchaVerifier();
      const isTooMany = error?.code === 'auth/too-many-requests' || (error?.message && error.message.includes('TOO_MANY_ATTEMPTS_TRY_LATER'));
      if (isTooMany) {
        // set a longer cooldown when Firebase rate-limits us
        setVerificationCooldownUntil(Date.now() + 5 * 60 * 1000); // 5 minutes
      }
      const errorMessage = isTooMany
        ? 'Too many attempts - please wait a few minutes before trying again.'
        : error.message;
      return { success: false, error: errorMessage };
    }
  };

  const verifyPhoneCode = async (code) => {
    try {
      if (!phoneVerificationId && !confirmationResultObj) {
        throw new Error('No verification ID available');
      }
      // Use the confirmationResult to confirm the code and sign-in
      if (!confirmationResultObj) {
        throw new Error('Confirmation result not available for this session');
      }

      const userCredential = await confirmationResultObj.confirm(code);

      // Confirm succeeded — mark verified and update local user phone if present
      setPhoneVerified(true);
      localStorage.setItem('coliana_phone_verified', 'true');

      const phoneNumber = userCredential?.user?.phoneNumber;
      if (phoneNumber) {
        setUser((prev) => {
          const updated = { ...(prev || {}), phone: phoneNumber };
          localStorage.setItem('coliana_user', JSON.stringify(updated));
          return updated;
        });

        // Save phone to backend
        await saveUserProfile({ phone: phoneNumber });
      }

      // No reCAPTCHA cleanup required when verification is disabled.
      return { success: true };
    } catch (error) {
      console.error('Error verifying code:', error);
      return { success: false, error: error.message };
    }
  };

  const resetPhoneVerification = () => {
    setPhoneVerificationId(null);
    setPhoneVerified(false);
  };

  const signInWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create a user object similar to Google Sign-In
      const userData = {
        email: firebaseUser.email,
        name: firebaseUser.displayName || '',
        uid: firebaseUser.uid,
      };

      setUser(userData);
      localStorage.setItem('coliana_user', JSON.stringify(userData));

      // Fetch user groups and profile
      fetchUserGroups();
      if (userData.email) {
        fetchUserProfile(userData.email);
      }

      return { success: true };
    } catch (error) {
      console.error('Error signing in with email:', error);
      let errorMessage = 'Failed to sign in';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled';
      }

      return { success: false, error: errorMessage };
    }
  };

  const signUpWithEmail = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update the user's display name
      if (name) {
        await updateProfile(firebaseUser, { displayName: name });
      }

      // Create a user object similar to Google Sign-In
      const userData = {
        email: firebaseUser.email,
        name: name || '',
        uid: firebaseUser.uid,
      };

      setUser(userData);
      localStorage.setItem('coliana_user', JSON.stringify(userData));

      // Save user profile to backend
      await saveUserProfile({ name });

      // Fetch user groups
      fetchUserGroups();

      return { success: true };
    } catch (error) {
      console.error('Error signing up with email:', error);
      let errorMessage = 'Failed to create account';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }

      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    // Initialize Google Sign-In
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: '243886041554-8ro8ce5l3om8plhvcmqe39kc4uds117u.apps.googleusercontent.com',
        callback: handleCredentialResponse
      });
      setInitialized(true);
    }

    // Initialize Firebase (if needed)
    // Firebase is initialized in firebase.js
  }, []);

  // When a user is already present (from localStorage) or changes, refresh server-side profile & groups
  useEffect(() => {
    if (user && user.email) {
      fetchUserGroups();
      fetchUserProfile(user.email);
    }
  }, [user && user.email]);

  const value = {
    user,
    userGroups,
    handleSignOut,
    initialized,
    phoneVerificationId,
    phoneVerified,
    verificationCooldownUntil,
    sendPhoneVerificationCode,
    verifyPhoneCode,
    resetPhoneVerification,
    fetchUserProfile,
    saveUserProfile,
    signInWithEmail,
    signUpWithEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

