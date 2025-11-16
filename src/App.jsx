import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useIntakeForm } from "./useIntakeForm";
import { useAuth } from "./AuthContext";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { RetellWebClient } from 'retell-client-js-sdk';
import logoSvg from "./logo.svg?url";
import { SCRIPT_URL } from "./config.js";
import CalEmbed from "./CalEmbed.jsx";
import WebsiteEmbed from "./WebsiteEmbed.jsx";
export default function ColianaApp() {
  const navigate = useNavigate();
  const {
    formData,
    isSubmitting,
    submitStatus,
    matches,
    updateAgeGroup,
    toggleSupportType,
    toggleFormat,
    updateField,
    submitToGoogleSheets,
  } = useIntakeForm();
  const { user, handleSignOut, initialized, phoneVerified, phoneVerificationId, sendPhoneVerificationCode, verifyPhoneCode, resetPhoneVerification, saveUserProfile, verificationCooldownUntil } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneError, setPhoneError] = useState('');
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [retellWebClient, setRetellWebClient] = useState(null);
  const [calOpen, setCalOpen] = useState(false);
  const [calUrl, setCalUrl] = useState("");
  const [siteOpen, setSiteOpen] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");

  // Redirect to login if user is authenticated but hasn't verified phone (2FA requirement)
  useEffect(() => {
    if (user && !phoneVerified) {
      navigate('/login');
    }
  }, [user, phoneVerified, navigate]);

  useEffect(() => {
    // Update cooldown display every second
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
  useEffect(() => {
    if (initialized && !user) {
      window.google.accounts.id.renderButton(
        document.getElementById('signInDiv'),
        { theme: 'outline', size: 'small' }
      );
    } else if (user) {
      const div = document.getElementById('signInDiv');
      if (div) div.innerHTML = '';
    }
  }, [initialized, user]);

  useEffect(() => {
    if (user) {
      if (!formData.name) {
        updateField("name", user.name || user.given_name || "");
      }
      if (!formData.email) {
        updateField("email", user.email || "");
      }
      // If Google token contains a phone number, prefill it so the user can verify easily
      if (!formData.phone && (user.phone || user.phone_number)) {
        updateField("phone", user.phone || user.phone_number);
      }
    }
  }, [user, formData.name, formData.email, formData.phone, updateField]);

  // When the user logs in and they have a valid phone, prompt verification
  useEffect(() => {
    if (user && !phoneVerified && formData.phone) {
      try {
        const phoneNumber = parsePhoneNumberFromString(formData.phone, 'US');
        if (phoneNumber && phoneNumber.isValid()) {
          setPhoneError('');
          setShowPhoneVerification(true);
        }
      } catch (e) {
        // ignore parse errors
      }
    }
  }, [user, formData.phone, phoneVerified]);

  // If user logs in and we don't have a phone for them, prompt them to add one
  useEffect(() => {
    if (user && !phoneVerified && !formData.phone) {
      // open the form (if your app uses steps, navigate to the contact step)
      setCurrentStep(1);
      // flip the UI so the verify CTA appears so user knows to add phone
      setShowPhoneVerification(true);
    }
  }, [user, phoneVerified, formData.phone]);

  useEffect(() => {
    const client = new RetellWebClient();
    setRetellWebClient(client);

    client.on("call_started", () => {
      console.log("Call started");
      setIsCallActive(true);
    });

    client.on("call_ended", () => {
      console.log("Call ended");
      setIsCallActive(false);
    });

    client.on("error", (error) => {
      console.error("Call error:", error);
      setIsCallActive(false);
    });

    return () => {
      if (isCallActive) {
        client.stopCall();
      }
    };
  }, []);

  const handlePhoneChange = (value) => {
  updateField("phone", value);
  setShowPhoneVerification(false);
  // Reset the auth phone verification state when phone number changes
  resetPhoneVerification();
    if (value.trim()) {
      try {
        const phoneNumber = parsePhoneNumberFromString(value, 'US');
        if (phoneNumber && phoneNumber.isValid()) {
          setPhoneError('');
          setShowPhoneVerification(true);
        } else {
          setPhoneError('Please enter a valid US phone number');
        }
      } catch {
        setPhoneError('Please enter a valid US phone number');
      }
    } else {
      setPhoneError('');
    }
  };

  const handleSendVerificationCode = async () => {
    if (isSendingCode) return;
    const now = Date.now();
    if (verificationCooldownUntil && now < verificationCooldownUntil) {
      const secs = Math.ceil((verificationCooldownUntil - now) / 1000);
      setVerificationError(`Too many attempts — try again in ${secs} second${secs === 1 ? '' : 's'}.`);
      return;
    }
    setIsSendingCode(true);
    const result = await sendPhoneVerificationCode(formData.phone);
    setIsSendingCode(false);
    if (!result.success) {
      setVerificationError(result.error);
    }
  };

  const handleVerifyCode = async () => {
    const result = await verifyPhoneCode(verificationCode);
    if (result.success) {
      // AuthContext marks the phone verified; hide UI
      setShowPhoneVerification(false);
      setVerificationError('');
      // Persist phone to the backend so it's available on subsequent logins
      try {
        await saveUserProfile({ phone: formData.phone });
      } catch (e) {
        console.warn('Could not save user profile after verification', e);
      }
    } else {
      setVerificationError(result.error);
    }
  };

  const startVoiceCall = async () => {
    if (!retellWebClient) return;

    try {
    const response = await fetch(SCRIPT_URL, {
    //   mode: "cors",
      redirect: "follow",
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({retell_llm_dynamic_variables:{customer_name: user.given_name,email: user.email}, formType: 'create-web-call' }),
    });

    console.log("Response received:", response);
      console.log("Response status:", response.status);
      let data = null;
      data = await response.json();
      console.log("JSON data:", data);
    try {
      
    } catch (e) {
        console.warn("Could not parse JSON response:", e);
    }

    //   const data = await response.json();
      console.log('Web call created:', data);
      if (data.access_token) {
        await retellWebClient.startCall({
          accessToken: data.access_token,
        });
        setCurrentStep(1); // Proceed to form after starting call
      } else {
        console.error('Failed to get access token:', data.error);
      }
    } catch (error) {
      console.error('Error starting voice call:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-5xl px-4 py-0 flex items-center justify-between gap-4">
          <div className="flex items-center gap-0">
            <Link to="/">
              <img src={logoSvg} alt="Coliana logo" className="h-16 w-16" />
            </Link>
            {/* <img src="Logo Files/svg/Black logo - no background.svg" alt="Coliana logo" className="h-16 w-16" /> */}
            <div className="flex flex-col leading-tight"></div>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/providers" className="text-slate-600 hover:text-slate-900">For providers</Link>
            {!user && (
              <Link to="/login" className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
                Sign in
              </Link>
            )}
            <div id="signInDiv"></div>
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-700">{user?.name || user?.given_name || user?.email || 'User'}</span>
                <button onClick={handleSignOut} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
                  Sign out
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 flex flex-col gap-8">
        <section className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start">
          <div className="space-y-6 order-2 md:order-1">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Now matching ND-aware care in California
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Find ND-aware care in California, without the overwhelm.
              </h1>
              <p className="text-sm md:text-base text-slate-600 max-w-xl">
               Coliana is the first ecosystem designed for neurodivergent minds.
              </p>
              <p className="text-sm md:text-base text-slate-600 max-w-xl">
                We blend conventional care (therapy, OT, assessments) with sensory-aware coaching and holistic supports so every neurodivergent person has an entire team.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button onClick={startVoiceCall} disabled={isCallActive} className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50">
                  {isCallActive ? "Call in progress..." : "Start matching"}
                </button>
                {isCallActive && (
                  <button onClick={() => retellWebClient?.stopCall()} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                    End call
                  </button>
                )}
                <Link to="/providers" className="text-xs text-slate-600 underline-offset-4 hover:underline">
                  I'm a provider
                </Link>
              </div>
              <div className="flex flex-col gap-2 pt-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>For speech therapists, OTs, behavioral coaches, and more.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Human + AI concierge to help you find the right fit.</span>
                </div>
                <div className="flex items-center gap-2">

                </div>
                 <div className="flex items-center gap-2">
                    
                </div>
              </div>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col gap-4 items-start">
              <h2 className="text-xl font-semibold tracking-tight">Why Families Trust Coliana</h2>
              <div className="space-y-3 w-full">
                <div className="flex items-start gap-3">
                  <span className="text-emerald-600 text-lg font-bold mt-0.5">✓</span>
                  <div>
                    <h3 className="font-medium text-slate-900">ND-experienced specialists only</h3>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-emerald-600 text-lg font-bold mt-0.5">✓</span>
                  <div>
                    <h3 className="font-medium text-slate-900">Personalized matching, not random lists</h3>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-emerald-600 text-lg font-bold mt-0.5">✓</span>
                  <div>
                    <h3 className="font-medium text-slate-900">No spam — providers contact you only if invited</h3>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-emerald-600 text-lg font-bold mt-0.5">✓</span>
                  <div>
                    <h3 className="font-medium text-slate-900">AI + human review for accuracy</h3>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-emerald-600 text-lg font-bold mt-0.5">✓</span>
                  <div>
                    <h3 className="font-medium text-slate-900">Support for both conventional & alternative care</h3>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col gap-3 items-start">
              <h2 className="text-xl font-semibold tracking-tight">What happens next</h2>
              <ul className="space-y-2 text-sm text-slate-600 w-full">
                {[
                  "A concierge verifies availability",
                  "Providers who are the best fit will message you",
                  "You'll receive 2-3 curated options — no overwhelm",
                ].map((step) => (
                  <li key={step} className="flex items-start gap-2">
                    <span className="mt-1 text-emerald-600">✓</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 md:p-5 flex flex-col gap-6 order-1 md:order-2">
            {/* <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Care intake</span>
            </div> */}

            {/* Section 1: Age Group */}
            <div className="space-y-3">
              <h2 className="text-sm font-medium">Who are we helping today?</h2>
              {/* <p className="text-xs text-slate-500">This helps us match you with the right providers.</p> */}
              <div className="space-y-2">
                {[
                  { label: "A child or teen", value: "child" },
                  { label: "An adult (18+)", value: "adult" },
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => updateAgeGroup(value)}
                    className={`w-full rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                      formData.ageGroup === value
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 hover:border-emerald-500 hover:bg-emerald-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Support Types */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h2 className="text-sm font-medium">What kind of support are you looking for?</h2>
              <p className="text-xs text-slate-500">Choose all that might apply.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  "Speech and language",
                  "Occupational therapy",
                  "Behavioral / coaching",
                  "Mental health / therapy",
                  "Education support / tutoring",
                  "Assessments / diagnosis",
                  "Neurodivergent coaching",
                  "Social skills groups",
                  "Executive functioning support",
                  "Sensory integration therapy",
                  "Cognitive behavioral therapy (CBT)",
                  "Nutritionist / dietician",
                  "Holistic & complementary support",
                  "Play therapy",
                  "Eating disorder support",
                  "Music therapy",
                  "Manual therapy",
                  "VR / immersive therapy",
                  "Not sure yet / I need guidance",
                ].map((label) => (
                  <button
                    key={label}
                    onClick={() => toggleSupportType(label)}
                    className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                      formData.supportTypes.includes(label)
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 hover:border-emerald-500 hover:bg-emerald-50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-block h-3 w-3 rounded border ${
                        formData.supportTypes.includes(label)
                          ? "border-emerald-600 bg-emerald-600"
                          : "border-slate-300 bg-white"
                      }`}
                    />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Contact Info */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h2 className="text-sm font-medium">How should we contact you?</h2>
              <p className="text-xs text-slate-500">We'll only reach out with your curated matches.</p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                {phoneError && <p className="text-xs text-red-600">{phoneError}</p>}
                {showPhoneVerification && !formData.phone && (
                  <p className="text-xs text-slate-500">Please add a phone number so we can verify your account. It will be associated with your profile for next time.</p>
                )}
                {showPhoneVerification && !phoneVerified && (
                  <div className="space-y-2">
                    <button
                      onClick={handleSendVerificationCode}
                      disabled={isSendingCode || (verificationCooldownUntil && Date.now() < verificationCooldownUntil)}
                      className="text-xs text-emerald-600 underline-offset-4 hover:underline"
                    >
                      {isSendingCode ? 'Sending…' : (cooldownLeft > 0 ? `Try again in ${cooldownLeft}s` : 'Verify this phone number')}
                    </button>
                    {verificationError && <p className="text-xs text-red-600">{verificationError}</p>}
                    {phoneVerificationId && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Enter verification code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          onClick={handleVerifyCode}
                          className="text-xs text-emerald-600 underline-offset-4 hover:underline"
                        >
                          Verify code
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {phoneVerified && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-600">✓ Phone verified</span>
                  </div>
                )}
              </div>
            </div>

            {submitStatus === "success" && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                ✓ Thank you! Your intake has been submitted. We'll be in touch soon.
              </div>
            )}
            {submitStatus === "error" && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
                ⚠ There was an error submitting your form. Please try again.
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
              {/* <button className="text-xs text-slate-500 underline-offset-4 hover:underline">
                Save and finish later
              </button> */}
              <button
                onClick={submitToGoogleSheets}
                disabled={isSubmitting || !formData.email || !formData.name || !formData.ageGroup || formData.supportTypes.length === 0 || phoneError}
                className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </section>

  {/* reCAPTCHA removed: phone verification now uses a server-side or test-mode flow */}



        {submitStatus === "success" && (
          <section className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm p-5 md:p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-medium">Your ND-aware matches in California</h2>
                <p className="text-xs text-slate-500">
                  Based on what you shared, here are providers who may be a good fit. A concierge is reviewing these matches as well.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                <span className="rounded-full bg-slate-100 px-2 py-0.5">Location: Los Angeles area</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5">Format: In-person or online</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5">Trusted by 320+ California families this year</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 md:p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-800">Care Snapshot</span>
                <button className="text-[11px] text-slate-500 underline-offset-4 hover:underline">
                  Update details
                </button>
              </div>
              <div className="grid gap-x-4 gap-y-1 text-[11px] text-slate-600 sm:grid-cols-2">
                <div>
                  <span className="font-medium text-slate-700">Age group: </span>
                  {formData.ageGroup === "child" ? "A child or teen" : formData.ageGroup === "adult" ? "An adult (18+)" : "Prefer not to say"}
                </div>
                <div>
                  <span className="font-medium text-slate-700">Support: </span>
                  {formData.supportTypes.slice(0, 2).join(", ")}{formData.supportTypes.length > 2 ? "..." : ""}
                </div>
                <div>
                  <span className="font-medium text-slate-700">Location: </span>
                  Los Angeles, CA
                </div>
                <div>
                  <span className="font-medium text-slate-700">Format: </span>
                  In-person or online
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div className="flex -space-x-2">
                  <div className="h-6 w-6 rounded-full bg-amber-400 border border-white flex items-center justify-center text-[10px] font-bold text-slate-900">AR</div>
                  <div className="h-6 w-6 rounded-full bg-blue-400 border border-white flex items-center justify-center text-[10px] font-bold text-white">LC</div>
                  <div className="h-6 w-6 rounded-full bg-purple-400 border border-white flex items-center justify-center text-[10px] font-bold text-white">MJ</div>
                </div>
                <span className="text-[11px] text-slate-500">Concierge-reviewed within 24h</span>
              </div>
            </div>

            <div className="space-y-3">
              {matches.map((match, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 md:p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">
                        {match.providerName || match.practiceName}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                        Match
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {match.bio}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {match.location} {match.matchedFormats && match.matchedFormats.length > 0 ? ` • ${match.matchedFormats.join(', ')}` : ''}
                    </p>
                    {match.matchedSupportTypes && match.matchedSupportTypes.length > 0 && (
                      <p className="text-[11px] text-slate-500">
                        Specializes in: {match.matchedSupportTypes.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 pt-2 md:pt-0 md:items-end">
                    <div className="flex gap-2 w-full md:w-auto">
                      {match.websiteLink ? (
                        <button
                          onClick={() => {
                            setSiteUrl(match.websiteLink);
                            setSiteOpen(true);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-1.5 border border-slate-200 text-slate-700 rounded-full text-[11px] font-medium hover:bg-slate-100"
                        >
                          Website
                        </button>
                      ) : null}
                      {match.bookingLink ? (
                        <button
                          onClick={() => {
                            setCalUrl(match.bookingLink);
                            setCalOpen(true);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700"
                        >
                          Book
                        </button>
                      ) : null}
                 
                      <button className="w-full md:w-auto rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">
                        Concierge
                      </button>
                    </div>
                    {/* <button className="w-full md:w-auto text-[11px] text-slate-600 underline-offset-4 hover:underline">
                      View profile
                    </button> */}
                  </div>
                </div>
              ))}
            </div>

            <p className="pt-1 text-[11px] text-slate-500">
              We'll also email these matches to you. If you don't see them in your inbox within 24 hours, check your spam folder or contact us at support@coliana.ai.
            </p>
          </section>
        )}
      </main>
  <CalEmbed calUrl={calUrl} open={calOpen} onClose={() => setCalOpen(false)} />
  <WebsiteEmbed url={siteUrl} open={siteOpen} onClose={() => setSiteOpen(false)} />
    </div>
  );
}
