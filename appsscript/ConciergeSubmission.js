function handleConciergeSubmission(data) {
  try {
    const sheetId = "1vQKeG_fqW8mTyzPI5BdcX85cylsyiTP9TDjDU3jkgx4";
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    let sheet = spreadsheet.getSheetByName("Concierge");
    if (!sheet) {
      sheet = spreadsheet.insertSheet("Concierge");
      sheet.appendRow([
        "Timestamp",
        "Client Name",
        "Client Email",
        "Client Phone",
        "Age Group",
        "Support Types",
        "Preferred Format",
        "Location",
        "Provider Name",
        "Provider Email",
        "Provider Phone",
        "Practice Name",
        "Provider Location",
        "Accepting New Clients",
        "Booking Link",
        "Website",
        "Matched Support Types",
        "Matched Formats"
      ]);
    }

    const client = data && data.client ? data.client : {};
    const provider = data && data.provider ? data.provider : {};

    sheet.appendRow([
      new Date(),
      client.name || "",
      client.email || "",
      client.phone || "",
      client.ageGroup || "",
      Array.isArray(client.supportTypes) ? client.supportTypes.join(", ") : client.supportTypes || "",
      Array.isArray(client.format) ? client.format.join(", ") : client.format || "",
      client.location || "",
      provider.providerName || "",
      provider.providerEmail || "",
      provider.providerPhone || "",
      provider.practiceName || "",
      provider.location || "",
      provider.acceptingNewClients || "",
      provider.bookingLink || "",
      provider.websiteLink || "",
      Array.isArray(provider.matchedSupportTypes) ? provider.matchedSupportTypes.join(", ") : provider.matchedSupportTypes || "",
      Array.isArray(provider.matchedFormats) ? provider.matchedFormats.join(", ") : provider.matchedFormats || ""
    ]);

    return { result: "success", type: "concierge" };
  } catch (error) {
    return { result: "error", message: error.toString() };
  }
}
