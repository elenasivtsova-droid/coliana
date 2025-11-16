import { useState } from "react";
import { SCRIPT_URL } from "./config.js";

export function useIntakeForm() {
  const [formData, setFormData] = useState({
    formType: "client", // Identifier for backend routing
    ageGroup: null, // "child", "adult", "prefer-not-to-say"
    supportTypes: [], // array of selected support types
    location: "Los Angeles, CA",
    format: [], // ["in-person", "online"]
    email: "",
    name: "",
    phone: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // "success", "error", null
  const [matches, setMatches] = useState([]);

  const updateAgeGroup = (group) => {
    setFormData((prev) => ({ ...prev, ageGroup: group }));
  };

  const toggleSupportType = (type) => {
    setFormData((prev) => {
      const supportTypes = prev.supportTypes.includes(type)
        ? prev.supportTypes.filter((t) => t !== type)
        : [...prev.supportTypes, type];
      return { ...prev, supportTypes };
    });
  };

  const toggleFormat = (fmt) => {
    setFormData((prev) => {
      const format = prev.format.includes(fmt)
        ? prev.format.filter((f) => f !== fmt)
        : [...prev.format, fmt];
      return { ...prev, format };
    });
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const submitToGoogleSheets = async () => {
    // Use the /exec endpoint - works with CORS from localhost
    // To update: npm run clasp:push && npm run clasp:deploy
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(SCRIPT_URL, {
        redirect: "follow",
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response received:", response);
      console.log("Response status:", response.status);
    let jsonResponse = null;
    try {
        jsonResponse = await response.json();
        console.log("JSON response:", jsonResponse);
    } catch (e) {
        console.warn("Could not parse JSON response:", e);
    }
      // With no-cors, we can't read the response, so assume success if no error thrown
      if (jsonResponse && jsonResponse.result === 'success' && jsonResponse.matches) {
        setMatches(jsonResponse.matches);
      }
      setSubmitStatus("success");
      // Optionally reset form
      setFormData({
        formType: "client",
        ageGroup: null,
        supportTypes: [],
        location: "Los Angeles, CA",
        format: [],
        email: "",
        name: "",
        phone: "",
      });
      // Don't reset matches here, keep them displayed
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
    matches,
    updateAgeGroup,
    toggleSupportType,
    toggleFormat,
    updateField,
    submitToGoogleSheets,
  };
}
