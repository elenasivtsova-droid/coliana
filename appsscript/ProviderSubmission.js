
// Handle provider application submissions
function handleProviderSubmission(data) {
  try {
    // Open your Google Sheet by ID
    const sheetId = "1vQKeG_fqW8mTyzPI5BdcX85cylsyiTP9TDjDU3jkgx4"; // Same sheet ID, different tab
    let sheet = SpreadsheetApp.openById(sheetId).getSheetByName("Providers");
    // Use shared form options
    var FormOptions = (typeof exports !== 'undefined' && exports.FormOptions) ? exports.FormOptions : FormOptions;
    const allSpecialties = FormOptions.specialties;
    const allAgeGroups = FormOptions.ageGroups;
    const allTreatmentApproaches = FormOptions.treatmentApproaches;
    const allLanguages = FormOptions.languages;
    const allServiceFormats = FormOptions.serviceFormats;
    const allInsuranceOptions = FormOptions.insuranceOptions;
    // Define headers for provider data with separate columns for each option
    const headers = [
      "Timestamp",
      "Name",
      "Email",
      "Phone",
      "Practice Name",
      "Website",
      "Booking Link",
      "License Type",
      "License Number",
      "Years Experience",
      ...allSpecialties,
      ...allAgeGroups,
      ...allTreatmentApproaches,
      ...allLanguages,
      "Location",
      ...allServiceFormats,
      ...allInsuranceOptions,
      "Accepting New Clients",
      "Bio"
    ];
    // Create sheet if it doesn't exist
    if (!sheet) {
      const spreadsheet = SpreadsheetApp.openById(sheetId);
      sheet = spreadsheet.insertSheet("Providers");
    }
    // Add headers if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    }
    // Create arrays of checkmark values for each multi-select field
    const specialtyValues = allSpecialties.map(specialty => 
      (Array.isArray(data.specialties) && data.specialties.includes(specialty)) ? "✓" : ""
    );
    const ageGroupValues = allAgeGroups.map(age => 
      (Array.isArray(data.ageGroups) && data.ageGroups.includes(age)) ? "✓" : ""
    );
    const treatmentApproachValues = allTreatmentApproaches.map(approach => 
      (Array.isArray(data.treatmentApproaches) && data.treatmentApproaches.includes(approach)) ? "✓" : ""
    );
    const languageValues = allLanguages.map(language => 
      (Array.isArray(data.languages) && data.languages.includes(language)) ? "✓" : ""
    );
    const serviceFormatValues = allServiceFormats.map(format => 
      (Array.isArray(data.serviceFormat) && data.serviceFormat.includes(format)) ? "✓" : ""
    );
    const insuranceValues = allInsuranceOptions.map(insurance => 
      (Array.isArray(data.insuranceAccepted) && data.insuranceAccepted.includes(insurance)) ? "✓" : ""
    );
    // Append the provider data
    sheet.appendRow([
      new Date(),
      data.name || "",
      data.email || "",
      data.phone || "",
      data.practiceName || "",
      data.website || "",
      data.bookingLink || "",
      data.licenseType || "",
      data.licenseNumber || "",
      data.yearsExperience || "",
      ...specialtyValues,
      ...ageGroupValues,
      ...treatmentApproachValues,
      ...languageValues,
      data.location || "",
      ...serviceFormatValues,
      ...insuranceValues,
      data.acceptingNewClients || "",
      data.bio || ""
    ]);
    return { result: 'success', type: 'provider' };
  } catch (error) {
    return { result: 'error', message: error.toString() };
  }
}
