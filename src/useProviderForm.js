import { useState } from "react";
import { SCRIPT_URL } from "./config.js";

export function useProviderForm() {
  const [formData, setFormData] = useState({
    formType: "provider", // Identifier for backend routing
    name: "",
    email: "",
    phone: "",
    practiceName: "",
    licenseType: "", // e.g., "SLP", "OT", "LMFT", "BCBA", etc.
    licenseNumber: "",
    yearsExperience: "",
    specialties: [], // array of selected specialties
    ageGroups: [], // ["children", "teens", "adults"]
    treatmentApproaches: [], // e.g., ["ND-affirming", "trauma-informed", "play-based"]
    languages: [], // ["English", "Spanish", etc.]
    location: "Los Angeles, CA",
    serviceFormat: [], // ["in-person", "online", "hybrid"]
    insuranceAccepted: [], // ["Private pay", "Blue Cross", "Aetna", etc.]
    acceptingNewClients: null, // true/false
    website: "",
    bookingLink: "",
    bio: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // "success", "error", null

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field, value) => {
    setFormData((prev) => {
      const array = prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value];
      return { ...prev, [field]: array };
    });
  };

  const submitToGoogleSheets = async () => {
    // Use the same Google Apps Script URL as client form
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(formData),
      });

      console.log("Response received:", response);
      console.log("Response status:", response.status);
      
      const responseData = await response.json();
      console.log("Response JSON:", responseData);
      
      setSubmitStatus("success");
      
      // Optionally reset form
      setFormData({
        formType: "provider",
        name: "",
        email: "",
        phone: "",
        practiceName: "",
        licenseType: "",
        licenseNumber: "",
        yearsExperience: "",
        specialties: [],
        ageGroups: [],
        treatmentApproaches: [],
        languages: [],
        location: "Los Angeles, CA",
        serviceFormat: [],
        insuranceAccepted: [],
        acceptingNewClients: null,
        website: "",
        bookingLink: "",
        bio: "",
      });
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    submitStatus,
    updateField,
    toggleArrayField,
    submitToGoogleSheets,
  };
}
