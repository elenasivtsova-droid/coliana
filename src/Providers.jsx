import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import logoSvg from "./logo.svg?url";
import CalEmbed from "./CalEmbed.jsx";
import { useState, useEffect } from "react";

// Provider Landing + Onboarding Entry Page for Coliana.ai
// Tailwind + React, production-ready structure

export default function ProviderLanding() {
  const navigate = useNavigate();
  const { user, handleSignOut, phoneVerified } = useAuth();
  const [calOpen, setCalOpen] = useState(false);
  const [calUrl, setCalUrl] = useState("");

  // Redirect to login if user is authenticated but hasn't verified phone (2FA requirement)
  useEffect(() => {
    if (user && !phoneVerified) {
      navigate('/login');
    }
  }, [user, phoneVerified, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Nav */}
      <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-5xl px-4 py-0 flex items-center justify-between gap-4">
          <div className="flex items-center gap-0">
            {/* <img src="Logo Files/svg/Black logo - no background.svg" alt="Coliana logo" className="h-16 w-16" /> */}

            <Link to="/">
              <img src={logoSvg} alt="Coliana logo" className="h-16 w-16" />
            </Link>
            <div className="flex flex-col leading-tight">
              {/* <span className="font-semibold tracking-tight">Coliana.ai</span> */}
              {/* <span className="text-xs text-slate-500">ND-aware care providers</span> */}
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-slate-600 hover:text-slate-900">Find care</Link>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-700">{user?.name || user?.given_name || user?.email || 'User'}</span>
                <button onClick={handleSignOut} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
                  Sign out
                </button>
              </div>
            ) : (
              <Link to="/login" className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
                Provider sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 flex flex-col gap-14">
        {/* Hero Section */}
        <section className="grid gap-6 md:grid-cols-2 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800">
              <span className="inline-block h-2 w-2 rounded-full bg-indigo-600" />
              Now onboarding providers in California
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Your neurodivergent ecosystem—find the right support, instantly.
            </h1>
            <p className="text-sm md:text-base text-slate-600 max-w-xl">
              Join Coliana.ai’s curated network of neurodiversity-aware providers. We bring you aligned clients, simplify
              communication, and support your practice growth.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/provider-application" className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
                Start provider application
              </Link>
              {!user && (
                <button className="text-xs text-slate-600 underline-offset-4 hover:underline">
                  Already a provider? Sign in
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2 pt-3 text-xs text-slate-500 max-w-xs">
              <span>🧠 For SLPs, OTs, therapists, coaches, and ND-friendly clinics.</span>
              <span>💬 Human + AI concierge helps pre-qualify leads.</span>
              <span>🔒 Client details shared only with your approval.</span>
            </div>
          </div>

          {/* Right column visual */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Your provider profile</span>
              <span>Preview</span>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 flex flex-col gap-3">
              <div className="flex flex-col">
                <span className="font-medium text-slate-900 text-sm">Dr. Jane Matthews, SLP</span>
                <span className="text-[11px] text-slate-500">Speech therapist • Los Angeles, CA</span>
              </div>
              <p className="text-[11px] text-slate-600">
                ND-aware care specializing in AAC, gestalt language processing, sensory-friendly communication, and
                parent coaching.
              </p>
              <div className="flex gap-2 flex-wrap pt-1">
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                  ND-aware
                </span>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                  Trauma-informed
                </span>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                  Accepting new clients
                </span>
              </div>
              {/* Booking button — sample link for preview; will show if a provider has a bookingLink */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setCalUrl("https://cal.com/elena-sivtsova-ygjxvb");
                    setCalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700"
                >
                  Book
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Aligned clients, not cold leads",
              desc: "Families complete an ND-aware intake that helps match you with clients who fit your expertise.",
            },
            {
              title: "You stay in control",
              desc: "You choose which inquiries to accept. We never auto-book or share info without your approval.",
            },
            {
              title: "Grow with less admin",
              desc: "Our concierge filters inquiries, gathers context, and saves you time.",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col gap-2">
              <h3 className="text-sm font-medium text-slate-900">{card.title}</h3>
              <p className="text-xs text-slate-600">{card.desc}</p>
            </div>
          ))}
        </section>

        {/* How It Works */}
        <section className="space-y-5">
          <h2 className="text-xl font-semibold tracking-tight">How Coliana works for providers</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Apply and set up your profile",
                desc: "Share your specialties, approaches, and availability. Designed for ND-affirming practices.",
              },
              {
                step: "2",
                title: "Receive matched leads",
                desc: "We connect you with families whose needs align with your training and boundaries.",
              },
              {
                step: "3",
                title: "Choose and connect",
                desc: "You decide which clients to accept. We help facilitate the intro and next steps.",
              },
            ].map((card) => (
              <div key={card.step} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
                  {card.step}
                </span>
                <h3 className="text-sm font-medium text-slate-900">{card.title}</h3>
                <p className="text-xs text-slate-600">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="rounded-2xl bg-indigo-600 text-white p-8 flex flex-col gap-4 items-start shadow-md">
          <h2 className="text-2xl font-semibold tracking-tight max-w-xl">
            Ready to join California’s growing network of ND-aware providers?
          </h2>
          <p className="text-sm max-w-lg text-indigo-100">
            It only takes a few minutes to apply. No commitments, no upfront fees.
          </p>
          <Link to="/provider-application" className="rounded-full bg-white text-indigo-700 font-medium px-6 py-2.5 text-sm shadow hover:bg-slate-100">
            Start provider application
          </Link>
        </section>
      </main>
      <CalEmbed calUrl={calUrl} open={calOpen} onClose={() => setCalOpen(false)} />
    </div>
  );
}
