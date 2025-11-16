import { useProviderForm } from "./useProviderForm";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import logoSvg from "./logo.svg?url";
import { useEffect } from "react";

export default function ProviderApplication() {
  const navigate = useNavigate();
  const { user, handleSignOut, phoneVerified } = useAuth();
  const {
    formData,
    isSubmitting,
    submitStatus,
    updateField,
    toggleArrayField,
    submitToGoogleSheets,
  } = useProviderForm();

  // Redirect to login if user is authenticated but hasn't verified phone (2FA requirement)
  useEffect(() => {
    if (user && !phoneVerified) {
      navigate('/login');
    }
  }, [user, phoneVerified, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    submitToGoogleSheets();
  };

  // Options for multi-select fields
  const specialtyOptions = [
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
    "VR / immersive therapy"
  ];

  const ageGroupOptions = ["Children (0-12)", "Teens (13-17)", "Adults (18+)"];

  const treatmentApproachOptions = [
    "ND-affirming",
    "Trauma-informed",
    "Play-based",
    "Strengths-based",
    "Family-centered",
    "Evidence-based",
    "Sensory integration",
  ];

  const languageOptions = [
    "English",
    "Spanish",
    "Mandarin",
    "Cantonese",
    "Vietnamese",
    "Tagalog",
    "Korean",
    "Other",
  ];

  const serviceFormatOptions = ["In-person", "Online", "Hybrid"];

  const insuranceOptions = [
    "Private Pay",
    "Blue Cross Blue Shield",
    "Aetna",
    "UnitedHealthcare",
    "Cigna",
    "Kaiser Permanente",
    "Medi-Cal",
    "Medicare",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Nav */}
      <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-5xl px-4 py-0 flex items-center justify-between gap-4">
          <div className="flex items-center gap-0">
            <Link to="/">
              <img src={logoSvg} alt="Coliana logo" className="h-16 w-16" />
            </Link>
            {/* <img src="Logo Files/svg/Black logo - no background.svg" alt="Coliana logo" className="h-16 w-16" /> */}
            <div className="flex flex-col leading-tight">
              {/* <span className="font-semibold tracking-tight">Coliana.ai</span> */}
              {/* <span className="text-xs text-slate-500">ND-aware care providers</span> */}
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/providers" className="text-slate-600 hover:text-slate-900">Back to Providers</Link>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-700">{user?.name || user?.given_name || user?.email || 'User'}</span>
                <button onClick={handleSignOut} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
                  Sign out
                </button>
              </div>
            ) : (
              <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
                Provider sign in
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 flex flex-col gap-14">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Join the Coliana Provider Network
          </h1>
          <p className="text-lg text-slate-600">
            Connect with families seeking ND-aware, affirming care in California
          </p>
        </div>

        {/* Success Message */}
        {submitStatus === "success" && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg
                className="h-6 w-6 text-green-600 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-900">
                  Application submitted successfully!
                </h3>
                <p className="mt-2 text-green-700">
                  Thank you for joining our network. We'll review your application and
                  reach out within 2-3 business days.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitStatus === "error" && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg
                className="h-6 w-6 text-red-600 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-900">
                  Something went wrong
                </h3>
                <p className="mt-2 text-red-700">
                  We couldn't submit your application. Please check your connection and
                  try again.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl p-8 space-y-8"
        >
          {/* Basic Information Section */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-3 border-b border-slate-200">
              Basic Information
            </h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Dr. Jane Smith"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="jane@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="practiceName" className="block text-sm font-medium text-slate-700 mb-2">
                  Practice Name
                </label>
                <input
                  type="text"
                  id="practiceName"
                  value={formData.practiceName}
                  onChange={(e) => updateField("practiceName", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Sunshine Therapy Center"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  value={formData.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="https://yourpractice.com"
                />
              </div>

              <div>
                <label htmlFor="bookingLink" className="block text-sm font-medium text-slate-700 mb-2">
                  Booking link (optional — cal.com or similar)
                </label>
                <input
                  type="url"
                  id="bookingLink"
                  value={formData.bookingLink}
                  onChange={(e) => updateField("bookingLink", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="https://cal.com/yourname/30"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Add your public scheduling link (cal.com or similar). This will be shown on your profile so families can book time with you.
                </p>
              </div>
            </div>
          </section>

          {/* Professional Credentials Section */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-3 border-b border-slate-200">
              Professional Credentials
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="licenseType" className="block text-sm font-medium text-slate-700 mb-2">
                    License Type *
                  </label>
                  <input
                    type="text"
                    id="licenseType"
                    required
                    value={formData.licenseType}
                    onChange={(e) => updateField("licenseType", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="SLP, OT, LMFT, BCBA, etc."
                  />
                </div>

                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-slate-700 mb-2">
                    License Number *
                  </label>
                  <input
                    type="text"
                    id="licenseNumber"
                    required
                    value={formData.licenseNumber}
                    onChange={(e) => updateField("licenseNumber", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="CA12345"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="yearsExperience" className="block text-sm font-medium text-slate-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  id="yearsExperience"
                  required
                  min="0"
                  value={formData.yearsExperience}
                  onChange={(e) => updateField("yearsExperience", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="5"
                />
              </div>
            </div>
          </section>

          {/* Services & Specialties Section */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-3 border-b border-slate-200">
              Services & Specialties
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Specialties *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {specialtyOptions.map((specialty) => (
                    <label
                      key={specialty}
                      className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-indigo-50 transition"
                    >
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(specialty)}
                        onChange={() => toggleArrayField("specialties", specialty)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                      />
                      <span className="ml-3 text-slate-700">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Age Groups Served *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {ageGroupOptions.map((age) => (
                    <label
                      key={age}
                      className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-indigo-50 transition"
                    >
                      <input
                        type="checkbox"
                        checked={formData.ageGroups.includes(age)}
                        onChange={() => toggleArrayField("ageGroups", age)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                      />
                      <span className="ml-3 text-slate-700">{age}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Treatment Approaches
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {treatmentApproachOptions.map((approach) => (
                    <label
                      key={approach}
                      className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-indigo-50 transition"
                    >
                      <input
                        type="checkbox"
                        checked={formData.treatmentApproaches.includes(approach)}
                        onChange={() => toggleArrayField("treatmentApproaches", approach)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                      />
                      <span className="ml-3 text-slate-700">{approach}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Languages Offered
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {languageOptions.map((language) => (
                    <label
                      key={language}
                      className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-indigo-50 transition"
                    >
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(language)}
                        onChange={() => toggleArrayField("languages", language)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                      />
                      <span className="ml-3 text-slate-700 text-sm">{language}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Practice Details Section */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-3 border-b border-slate-200">
              Practice Details
            </h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  required
                  value={formData.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Los Angeles, CA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Service Format *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {serviceFormatOptions.map((format) => (
                    <label
                      key={format}
                      className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-indigo-50 transition"
                    >
                      <input
                        type="checkbox"
                        checked={formData.serviceFormat.includes(format)}
                        onChange={() => toggleArrayField("serviceFormat", format)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                      />
                      <span className="ml-3 text-slate-700">{format}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Insurance Accepted
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {insuranceOptions.map((insurance) => (
                    <label
                      key={insurance}
                      className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-indigo-50 transition"
                    >
                      <input
                        type="checkbox"
                        checked={formData.insuranceAccepted.includes(insurance)}
                        onChange={() => toggleArrayField("insuranceAccepted", insurance)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                      />
                      <span className="ml-3 text-slate-700">{insurance}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Accepting New Clients? *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center p-4 border-2 border-slate-300 rounded-lg cursor-pointer hover:bg-indigo-50 transition flex-1">
                    <input
                      type="radio"
                      name="acceptingNewClients"
                      checked={formData.acceptingNewClients === true}
                      onChange={() => updateField("acceptingNewClients", true)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      required
                    />
                    <span className="ml-3 text-slate-700 font-medium">Yes</span>
                  </label>
                  <label className="flex items-center p-4 border-2 border-slate-300 rounded-lg cursor-pointer hover:bg-indigo-50 transition flex-1">
                    <input
                      type="radio"
                      name="acceptingNewClients"
                      checked={formData.acceptingNewClients === false}
                      onChange={() => updateField("acceptingNewClients", false)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      required
                    />
                    <span className="ml-3 text-slate-700 font-medium">No</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Bio Section */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-3 border-b border-slate-200">
              About You
            </h2>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-2">
                Professional Bio
              </label>
              <p className="text-sm text-slate-500 mb-3">
                Tell families about your approach, experience, and what makes your practice
                unique. This will be shown on your profile.
              </p>
              <textarea
                id="bio"
                rows={6}
                value={formData.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="I'm a neurodivergent-affirming speech therapist with 10+ years of experience working with autistic children and their families. My approach centers communication joy and respects each child's unique way of being..."
              />
            </div>
          </section>

          {/* Submit Button */}
          <div className="pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Application"
              )}
            </button>
            <p className="mt-4 text-center text-sm text-slate-500">
              By submitting, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
