import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase';
import {
  RecaptchaVerifier,
  PhoneAuthProvider,
  linkWithCredential
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
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        localStorage.removeItem('coliana_user');
      }
    }
    return null;
  });
  const [userGroups, setUserGroups] = useState([]);
  const [phoneVerificationId, setPhoneVerificationId] = useState(null);
  const [phoneVerified, setPhoneVerified] = useState(() => {
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

  const buildRecaptchaVerifier = () => {
    if (typeof window === 'undefined') return null;
    ensureRecaptchaContainer();

    // Clear existing verifier if present
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (error) {
        console.debug('Failed to clear existing reCAPTCHA verifier', error);
      }
      window.recaptchaVerifier = null;
    }

    try {
      const verifier = new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, { size: 'invisible' });
      window.recaptchaVerifier = verifier;
      return verifier;
    } catch (error) {
      console.error('Unable to initialize reCAPTCHA verifier:', error);
      return null;
    }
  };

  const clearRecaptchaVerifier = () => {
    if (typeof window === 'undefined') return;
    const existing = window.recaptchaVerifier;
    if (existing && typeof existing.clear === 'function') {
      try {
        existing.clear();
      } catch (error) {
        console.debug('Failed to clear reCAPTCHA verifier', error);
      }
    }
    window.recaptchaVerifier = null;
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
    if (!email) return;

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
    if (!user || !user.email) {
      return { success: false, error: 'No user logged in' };
    }

    try {
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

  const handleFirebaseAuthSuccess = async (firebaseUser) => {
    const userObject = {
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email,
      picture: firebaseUser.photoURL,
      given_name: firebaseUser.displayName?.split(' ')[0] || '',
      family_name: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
      uid: firebaseUser.uid,
      phone: firebaseUser.phoneNumber || ''
    };

    setUser(userObject);
    localStorage.setItem('coliana_user', JSON.stringify(userObject));

    if (firebaseUser.phoneNumber) {
      setPhoneVerified(true);
      localStorage.setItem('coliana_phone_verified', 'true');
    } else {
      setPhoneVerified(false);
      localStorage.removeItem('coliana_phone_verified');
    }

    // Fetch user groups and profile
    fetchUserGroups();
    fetchUserProfile(userObject.email);
  };

  const handleSignOut = async () => {
    try {
      // Sign out from Firebase
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }

    // Clear all state
    setUser(null);
    setUserGroups([]);
    setPhoneVerificationId(null);
    setPhoneVerified(false);

    // Clear localStorage
    localStorage.removeItem('coliana_user');
    localStorage.removeItem('coliana_phone_verified');

    // Clear any existing reCAPTCHA
    clearRecaptchaVerifier();
  };

  const sendPhoneVerificationCode = async (phoneNumber) => {
    const now = Date.now();

    // Check cooldown
    if (verificationCooldownUntil && now < verificationCooldownUntil) {
      const secs = Math.ceil((verificationCooldownUntil - now) / 1000);
      return { success: false, error: `Too many attempts - try again in ${secs} second${secs === 1 ? '' : 's'}.` };
    }

    try {
      // Format phone number (must include country code)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;

      if (!auth) {
        return { success: false, error: 'Firebase auth not initialized' };
      }

      // Set short cooldown to prevent double-clicks
      setVerificationCooldownUntil(Date.now() + 5 * 1000);

      // Get or create reCAPTCHA verifier
      let appVerifier = window.recaptchaVerifier;
      if (!appVerifier) {
        appVerifier = buildRecaptchaVerifier();
      }

      if (!appVerifier) {
        setVerificationCooldownUntil(null);
        return { success: false, error: 'Unable to initialize reCAPTCHA verifier' };
      }

      // Render reCAPTCHA if needed
      await appVerifier.render();

      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(formattedPhone, appVerifier);

      setPhoneVerificationId(verificationId);
      clearRecaptchaVerifier();
      setVerificationCooldownUntil(null);

      return { success: true };
    } catch (error) {
      console.error('Error sending verification code:', error);
      clearRecaptchaVerifier();

      const isTooMany = error?.code === 'auth/too-many-requests' || error?.message?.includes('TOO_MANY_ATTEMPTS_TRY_LATER');

      if (isTooMany) {
        setVerificationCooldownUntil(Date.now() + 5 * 60 * 1000); // 5 minutes
      } else {
        setVerificationCooldownUntil(null);
      }

      const errorMessage = isTooMany
        ? 'Too many attempts - please wait a few minutes before trying again.'
        : error.message || 'Failed to send verification code';

      return { success: false, error: errorMessage };
    }
  };

  const verifyPhoneCode = async (code) => {
    try {
      if (!phoneVerificationId) {
        return { success: false, error: 'No verification session available' };
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'Please sign in before verifying your phone number' };
      }

      const credential = PhoneAuthProvider.credential(phoneVerificationId, code);
      const userCredential = await linkWithCredential(currentUser, credential);

      // Mark as verified
      setPhoneVerified(true);
      localStorage.setItem('coliana_phone_verified', 'true');
      setPhoneVerificationId(null);

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

      return { success: true };
    } catch (error) {
      console.error('Error verifying code:', error);
      let errorMessage = 'Failed to verify code';
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid verification code. Please try again.';
      } else if (error.code === 'auth/credential-already-in-use') {
        errorMessage = 'This phone number is already linked to another account.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  };

  const resetPhoneVerification = () => {
    setPhoneVerificationId(null);
    setPhoneVerified(false);
  };

  const value = {
    user,
    userGroups,
    handleSignOut,
    handleFirebaseAuthSuccess,
    phoneVerificationId,
    phoneVerified,
    verificationCooldownUntil,
    sendPhoneVerificationCode,
    verifyPhoneCode,
    resetPhoneVerification,
    fetchUserProfile,
    saveUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

