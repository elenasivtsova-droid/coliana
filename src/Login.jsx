import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import FirebaseAuthUI from './components/FirebaseAuthUI';
import logoSvg from './logo.svg?url';

export default function Login() {
  const { user, phoneVerified, handleFirebaseAuthSuccess } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in and phone verified
  useEffect(() => {
    if (user && phoneVerified) {
      navigate('/');
    } else if (user && !phoneVerified) {
      // User signed in but needs phone verification - stay on login page
      // The PhoneVerification component will be shown
    }
  }, [user, phoneVerified, navigate]);

  // If user is signed in but hasn't verified phone, show phone verification
  if (user && !phoneVerified) {
    return <PhoneVerification />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-0 flex items-center justify-between gap-4">
          <div className="flex items-center gap-0">
            <Link to="/">
              <img src={logoSvg} alt="Coliana logo" className="h-16 w-16" />
            </Link>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-slate-600 hover:text-slate-900">Home</Link>
            <Link to="/providers" className="text-slate-600 hover:text-slate-900">For providers</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <FirebaseAuthUI
            onSuccess={handleFirebaseAuthSuccess}
            onError={(error) => console.error('Auth error:', error)}
          />

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mt-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Phone verification required</p>
                <p>After signing in with Google, you'll verify your phone number to complete setup.</p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            By continuing, you agree to Coliana's Terms of Service and Privacy Policy
          </p>
        </div>
      </main>
    </div>
  );
}

// Phone Verification Component for 2FA
function PhoneVerification() {
  const { user, handleSignOut, phoneVerificationId, sendPhoneVerificationCode, verifyPhoneCode, verificationCooldownUntil } = useAuth();
  const [phone, setPhone] = React.useState(user?.phone || '');
  const [verificationCode, setVerificationCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSendingCode, setIsSendingCode] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [cooldownLeft, setCooldownLeft] = React.useState(0);

  React.useEffect(() => {
    let timer = null;
    if (verificationCooldownUntil) {
      const update = () => {
        const secsLeft = Math.max(0, Math.ceil((verificationCooldownUntil - Date.now()) / 1000));
        setCooldownLeft(secsLeft);
        if (secsLeft <= 0) {
          clearInterval(timer);
        }
      };
      update();
      timer = setInterval(update, 1000);
    } else {
      setCooldownLeft(0);
    }
    return () => clearInterval(timer);
  }, [verificationCooldownUntil]);

  const handleSendCode = async () => {
    if (!phone) {
      setError('Please enter your phone number');
      return;
    }

    setError('');
    setIsSendingCode(true);
    const result = await sendPhoneVerificationCode(phone);
    setIsSendingCode(false);

    if (!result.success) {
      setError(result.error);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setError('');
    setIsVerifying(true);
    const result = await verifyPhoneCode(verificationCode);
    setIsVerifying(false);

    if (!result.success) {
      setError(result.error);
    }
    // If successful, the user will be redirected by the useEffect in Login component
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-0 flex items-center justify-between gap-4">
          <div className="flex items-center gap-0">
            <Link to="/">
              <img src={logoSvg} alt="Coliana logo" className="h-16 w-16" />
            </Link>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Verify your phone number
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                Welcome, {user?.name || user?.given_name || user?.email}!
              </p>
              <p className="text-sm text-slate-600 mt-1">
                To complete your sign-in, please verify your phone number.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  disabled={!!phoneVerificationId}
                />
              </div>

              {!phoneVerificationId && (
                <button
                  onClick={handleSendCode}
                  disabled={isSendingCode || cooldownLeft > 0}
                  className="w-full rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingCode ? 'Sending...' : cooldownLeft > 0 ? `Wait ${cooldownLeft}s` : 'Send verification code'}
                </button>
              )}

              {phoneVerificationId && (
                <div className="space-y-4">
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                    Verification code sent! Check your phone for a text message.
                  </div>

                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-1">
                      Verification code
                    </label>
                    <input
                      id="code"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="000000"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      maxLength={6}
                    />
                  </div>

                  <button
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="w-full rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify phone number'}
                  </button>

                  <button
                    onClick={handleSendCode}
                    disabled={isSendingCode || cooldownLeft > 0}
                    className="w-full text-xs text-slate-600 underline-offset-4 hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {cooldownLeft > 0 ? `Resend code in ${cooldownLeft}s` : 'Resend verification code'}
                  </button>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
                  {error}
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-500 text-center">
                This helps us keep your account secure and ensures you can recover access if needed.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

