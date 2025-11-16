Front-End Spec — Coliana.ai Client Intake & Concierge Matching (MVP)
1. Purpose & Goals

Design and implement the end-to-end flow where:

A caregiver (or adult client) answers 5 core intake questions + a few context questions.

The system (AI + human concierge) generates a Care Snapshot and matches providers.

User sees recommended providers, can request contact / booking, and optionally pay for Premium Concierge later (future).

MVP Success Criteria

User can complete intake in <5 minutes.

At least one provider lead is successfully created per completed intake.

Flow works smoothly on mobile web (primary) and desktop.

2. Primary Users & Scenarios
2.1 Users

Caregiver / Parent

Often overwhelmed, time-poor, may be new to ND concepts.

Adult ND Client

Self-advocating individual seeking more aligned care.

Concierge Agent (internal tool later)

Not in this spec — only touchpoints where they affect visible UX (status, messages).

2.2 Core User Journeys (MVP)

Caregiver comes from ad / landing → completes intake → sees “we’re on it” confirmation.

Caregiver returns via email link → views matched providers page.

User clicks on a recommended provider → opens provider profile (separate spec), submits contact/booking request.

3. Platforms & Constraints

Web app (responsive):

Primary: Mobile web (iOS Safari, Chrome Android).

Secondary: Desktop (Chrome, Safari, Edge).

No native app in MVP.

Accessibility target: WCAG 2.1 AA-ish:

Keyboard navigable, good contrast, clear focus states, large tap targets.

4. Information Architecture
4.1 Pages / Views

Landing → Intake Entry Page

Intake Flow (multi-step)

Intake Confirmation / “We’re Matching” Page

Matched Providers List Page

Error / Fallback States

5. Detailed Screen Specs
5.1 Landing → Intake Entry Page

URL: /care-intake (or /start)

Goal: Quickly explain value and get user into intake with minimal cognitive load.

Core Elements

Header:

Logo (Coliana) top-left

Right side: “For providers” link, subtle

Hero Block:

Title: “Find ND-aware care in California.”

Subtitle: “Answer a few questions and we’ll match you with providers who understand neurodivergent needs.”

CTA (Primary button): “Start matching”

Secondary text link: “I’m a provider”

Trust Indicators (below fold / just under CTA):

“For speech therapists, OTs, behavioral coaches, and more.”

“Human + AI concierge to help you find the right fit.”

Interactions

Click “Start matching” → go to Intake Step 1.

5.2 Intake Flow (Multi-Step Wizard)

URL Pattern: /care-intake/step/:n
Layout: Centered card, progress indicator at top, back/next buttons at bottom.

5.2.1 Shared Patterns Across Steps

Progress bar: e.g., “Step 1 of 5” + visual bar.

Form validation:

Inline errors under fields.

Required fields marked with “*”.

Buttons:

Primary: “Next”

Secondary (left-aligned): “Back” (except on Step 1).

Copy tone: Clear, warm, low-jargon.

Step 1: Who is this for?

Content

Title: “Who are we helping today?”

Radio options:

“A child or teen”

“An adult (18+)”


Short helper text: “This helps us match you with the right providers.”

Logic

Required choice.

Store client_age_group for matching.

Step 2: What kind of support are you looking for?

Content

Title: “What kind of support are you looking for?”

Multi-select checkbox list (chips or cards):

“Speech and language”

“Occupational therapy”

“Behavioral / coaching”

“Mental health / therapy”

“Education support / tutoring”

“Assessments / diagnosis”

“Not sure yet / I need guidance”

Helper text: “Choose all that might apply.”

Logic

At least 1 selection required.

Store support_types[].

Step 3: Location & format

Content

Title: “Where and how would you like to receive care?”

Fields:

Zip code (text, numeric, 5 digits; “We’re starting in California.”)

Preferred format (checkbox multi-select):

“In-person”

“Online / telehealth”

“Either is fine”

Validation

Zip code required, must be 5 digits.

At least 1 format selected.

Step 4: ND context & preferences

Content

Title: “Tell us a bit about ND needs and preferences”

Fields:

Dropdown: “Has the person been formally diagnosed?”

“Yes”

“No”

“Unsure / in process”

“Prefer not to say”

Optional textarea: “Anything else that would help us find a good fit?”

Placeholder: “Sensory needs, communication preferences, past experiences with care…”

Behavior

Textarea optional, up to e.g. 800 characters.

This feeds into the Care Snapshot Summary behind the scenes.

Step 5: Contact details & consent

Content

Title: “Where should we send your matches?”

Fields:

Name (First, Last or single “Your name” field)

Email (required)

Phone (optional, but encouraged)

Preferred contact method (radio):

“Email”

“Text message”

“Either is fine”

Legal / consent checkboxes:

Required: “I agree to the [Terms of Service] and [Privacy Policy].”

Optional: “I’d like to receive updates about ND-supportive resources.”

Submit Button

Label: “Get my matches”

On Submit

Show small inline loading indicator on button.

If success → go to Intake Confirmation / Matching screen.

If error → error message at top: “Something went wrong saving your answers. Please try again.”

5.3 Intake Confirmation / “We’re Matching” Page

URL: /care-intake/thanks

Goal: Reassure, set expectations, and explain next steps.

Content

Hero icon (e.g., checkmark with sparkles).

Title: “We’ve received your details.”

Paragraph:
“Our AI + human concierge is reviewing your answers to find ND-aware providers in California. You’ll receive your matches at [user email] within the next 24 hours.”

Bullet list:

“We look for providers aligned with your ND needs and preferences.”

“We only share your details with providers you approve.”

CTA:

Primary: “Go to my matches” (if matches already available / quick match)

Otherwise: “Back to home” or “Learn more about Coliana.ai”

Microcopy for future upgrade:

Light inline note (not implemented yet): “Want faster matching and more support? Premium Concierge is coming soon.”

States

State A (Immediate matches ready): Show button “View my matches” → /matches/:id.

State B (Delayed matching – MVP): No matches yet; user will get email later. No “View matches” button.

5.4 Matched Providers List Page

URL: /matches/:matchId

Entry Points:

Email link: “View your Coliana matches.”

Possibly from confirmation, if immediate matching.

Layout

Header: logo + simple nav (“For providers”).

Hero:

Title: “Your ND-aware matches in California”

Subtitle: “Based on what you shared, here are providers who may be a good fit.”

Chip or text: “Location: [city/region] • Format: [in-person / online]”

Core Components

Care Snapshot Card (read-only summary)

“Care Snapshot”

Key items:

“Age group: Child / Adult”

“Support types: Speech, OT, etc.”

“Location preference”

“Format: In-person / Online”

Edit link: “Update details” → takes user back into intake flow (future). For MVP, either disabled or goes to “Contact support to update.”

Provider List

Provider card structure (repeated):

Provider name

Profession & tags: “Speech Therapist • ND-aware • Trauma-informed”

Location & formats: “Los Angeles, CA • In-person & online”

Short description (1–2 lines)

Badges: “High match”, “New”, “Popular in your area”

Actions:

Primary button: “Request contact”

Secondary text link: “View profile”

Empty / Partial States

If no strong matches:

Message: “We’re still working on finding the best fit.”

Copy: “A concierge will review your request and email you with options. If you don’t hear from us in 24 hours, please reach out at [support email].”

Interactions

Click “Request contact”

Opens modal:

Title: “Request an intro to [Provider Name]”

Shows email + name prefilled.

Optional note: “Anything you want this provider to know?”

Button: “Send request”

On success:

Toast: “We’ve sent your request. The provider or our concierge will follow up.”

Click “View profile”

Navigate to provider profile page (covered by separate spec).

5.5 Error & Edge States

Network error during intake submit

Banner: “We couldn’t save your answers. Check your connection and try again.”

Session timeout

Preserve progress via local storage where possible.

On reload: “Welcome back — we restored your answers so you can continue.”