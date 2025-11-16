// Shared form options for provider and client submissions
var FormOptions = {
  specialties: [
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
  ],
  ageGroups: [
    "Children (0-12)",
    "Teens (13-17)",
    "Adults (18+)"
  ],
  treatmentApproaches: [
    "ND-affirming",
    "Trauma-informed",
    "Play-based",
    "Strengths-based",
    "Family-centered",
    "Evidence-based",
    "Sensory integration"
  ],
  languages: [
    "English",
    "Spanish",
    "Mandarin",
    "Cantonese",
    "Vietnamese",
    "Tagalog",
    "Korean",
    "Other"
  ],
  serviceFormats: [
    "In-person",
    "Online",
    "Hybrid"
  ],
  insuranceOptions: [
    "Private Pay",
    "Blue Cross Blue Shield",
    "Aetna",
    "UnitedHealthcare",
    "Cigna",
    "Kaiser Permanente",
    "Medi-Cal",
    "Medicare",
    "Other"
  ],
  supportTypes: [
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
    "Not sure yet / I need guidance"
  ]
};

// Export for Apps Script
var exports = exports || {};
exports.FormOptions = FormOptions;