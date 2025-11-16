
// Handle client intake submissions
function handleClientSubmission(data) {
  try {
    // Open your Google Sheet by ID
    const sheetId = "1vQKeG_fqW8mTyzPI5BdcX85cylsyiTP9TDjDU3jkgx4"; // Replace with your sheet ID from the URL
    let sheet = SpreadsheetApp.openById(sheetId).getSheetByName("Clients");
    // Use shared form options
    var FormOptions = (typeof exports !== 'undefined' && exports.FormOptions) ? exports.FormOptions : FormOptions;
    const allSupportTypes = FormOptions.supportTypes;
    // Create sheet if it doesn't exist
    if (!sheet) {
      const spreadsheet = SpreadsheetApp.openById(sheetId);
      sheet = spreadsheet.insertSheet("Clients");
      // Add headers for client data
      const headers = [
        "Timestamp",
        "Name",
        "Email",
        "Phone",
        "Age Group",
        "Location",
        "Format",
        ...allSupportTypes  // Add each support type as a column
      ];
      sheet.appendRow(headers);
    }
    // Add headers if empty (shouldn't be needed now, but kept for safety)
    if (sheet.getLastRow() === 0) {
      const headers = [
        "Timestamp",
        "Name",
        "Email",
        "Phone",
        "Age Group",
        "Location",
        "Format",
        ...allSupportTypes  // Add each support type as a column
      ];
      sheet.appendRow(headers);
    }
    // Create an array of checkmark values for each support type and append the client row
    const supportTypeValues = allSupportTypes.map(type =>
      (Array.isArray(data.supportTypes) && data.supportTypes.includes(type)) ? "✓" : ""
    );
    sheet.appendRow([
      new Date(),
      data.name || "",
      data.email || "",
      data.phone || "",
      data.ageGroup || "",
      data.location || "",
      Array.isArray(data.format) ? data.format.join(", ") : (data.format || ""),
      ...supportTypeValues
    ]);
    // Now find matches from the Providers sheet and record them in a Matches sheet
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const providersSheet = spreadsheet.getSheetByName('Providers');
    const matches = [];
    if (providersSheet) {
      const values = providersSheet.getDataRange().getValues();
      if (values.length > 0) {
        const headers = values[0].map(h => String(h || '').trim());
        // Map useful header indices
        const idxName = headers.indexOf('Name');
        const idxEmail = headers.indexOf('Email');
        const idxPhone = headers.indexOf('Phone');
        const idxPractice = headers.indexOf('Practice Name');
        const idxLocation = headers.indexOf('Location');
        const idxAccepting = headers.indexOf('Accepting New Clients');
        const idxBio = headers.indexOf('Bio');
        const idxBookingLink = headers.indexOf('Booking Link');
        const idxWebsiteLink = headers.indexOf('Website');
        
        // Determine indices of specialty and service format columns by matching known lists
        const specialtyIndices = allSupportTypes.map(type => ({ type, col: headers.indexOf(type) })).filter(x => x.col !== -1);
        const serviceFormats = ["In-person", "Online", "Hybrid"];
        const formatIndices = serviceFormats.map(f => ({ f, col: headers.indexOf(f) })).filter(x => x.col !== -1);
        // Normalize client values
        const clientSupport = Array.isArray(data.supportTypes) ? data.supportTypes : [];
        const clientFormats = Array.isArray(data.format) ? data.format : [];
        const clientLocation = (data.location || '').toString().toLowerCase();
        // Iterate providers (rows start at 1)
        for (let r = 1; r < values.length; r++) {
          const row = values[r];
          // Collect matched specialties
          const matchedSupport = [];
          specialtyIndices.forEach(si => {
            const cell = String(row[si.col] || '').trim();
            if (cell === '✓' && clientSupport.includes(si.type)) {
              matchedSupport.push(si.type);
            }
          });
          if (matchedSupport.length === 0) {
            // No specialty match, skip
            continue;
          }
          // Check formats
          const matchedFormats = [];
          formatIndices.forEach(fi => {
            const cell = String(row[fi.col] || '').trim();
            if (cell === '✓' && clientFormats.includes(fi.f)) {
              matchedFormats.push(fi.f);
            }
          });
          // Check location similarity (simple substring check)
          const provLocation = String(row[idxLocation] || '').toLowerCase();
          const locationMatch = !clientLocation || !provLocation || provLocation.indexOf(clientLocation) !== -1 || clientLocation.indexOf(provLocation) !== -1;
          // If we have specialty matches and location (or no location provided), it's a candidate
          if (!locationMatch) {
            continue;
          }
          const provider = {
            providerName: String(row[idxName] || ''),
            providerEmail: String(row[idxEmail] || ''),
            providerPhone: String(row[idxPhone] || ''),
            practiceName: String(row[idxPractice] || ''),
            location: String(row[idxLocation] || ''),
            acceptingNewClients: String(row[idxAccepting] || ''),
            bio: String(row[idxBio] || ''),
            bookingLink: String(row[idxBookingLink] || ''),
            websiteLink: String(row[idxWebsiteLink] || ''),
            matchedSupportTypes: matchedSupport,
            matchedFormats: matchedFormats
          };
          matches.push(provider);
        }
      }
    }
    // Create Matches sheet if it doesn't exist and append rows for each match
    let matchesSheet = spreadsheet.getSheetByName('Matches');
    if (!matchesSheet) {
      matchesSheet = spreadsheet.insertSheet('Matches');
      const matchHeaders = [
        'Timestamp',
        'Client Name',
        'Client Email',
        'Client Phone',
        'Provider Name',
        'Provider Email',
        'Practice Name',
        'Provider Phone',
        'Matched Support Types',
        'Matched Formats',
        'Provider Location',
        'Accepting New Clients',
        'Bio'
      ];
      matchesSheet.appendRow(matchHeaders);
    }
    // Append match rows
    matches.forEach(m => {
      matchesSheet.appendRow([
        new Date(),
        data.name || '',
        data.email || '',
        data.phone || '',
        m.providerName || '',
        m.providerEmail || '',
        m.practiceName || '',
        m.providerPhone || '',
        (m.matchedSupportTypes || []).join(', '),
        (m.matchedFormats || []).join(', '),
        m.location || '',
        m.acceptingNewClients || '',
        m.bio || ''
      ]);
    });
    return { result: 'success', type: 'client', matches: matches };
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
