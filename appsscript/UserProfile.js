// Simple user profile utility for storing phone numbers.
function handleSaveUserProfile(data) {
  try {
    // sheet ID (shared with other scripts) - this should match ClientSubmission.js sheetId
    const sheetId = "1vQKeG_fqW8mTyzPI5BdcX85cylsyiTP9TDjDU3jkgx4";
    const spreadsheet = SpreadsheetApp.openById(sheetId);

    // Ensure 'Users' sheet exists
    let usersSheet = spreadsheet.getSheetByName('Users');
    if (!usersSheet) {
      usersSheet = spreadsheet.insertSheet('Users');
      usersSheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone']);
    }

    const email = (data.email || '').toString().trim().toLowerCase();
    const phone = (data.phone || '').toString().trim();
    const name = (data.name || '').toString().trim();

    if (!email) {
      return { result: 'error', message: 'Email required' };
    }

    const rows = usersSheet.getDataRange().getValues();
    // Find header indices
    const header = rows[0].map(h => (h || '').toString());
    const idxEmail = header.indexOf('Email');
    const idxPhone = header.indexOf('Phone');
    const idxName = header.indexOf('Name');

    // Look for existing user
    let found = false;
    for (let r = 1; r < rows.length; r++) {
      const rowEmail = (rows[r][idxEmail] || '').toString().trim().toLowerCase();
      if (rowEmail === email) {
        // update phone and name
        if (idxPhone !== -1) usersSheet.getRange(r + 1, idxPhone + 1).setValue(phone);
        if (idxName !== -1) usersSheet.getRange(r + 1, idxName + 1).setValue(name);
        found = true;
        break;
      }
    }

    if (!found) {
      usersSheet.appendRow([new Date(), name || '', email, phone || '']);
    }

    return { result: 'success' };
  } catch (error) {
    return { result: 'error', message: error.toString() };
  }
}

// GET variant: accept query param action=getUserProfile&email=email
function getUserProfileByEmail(email) {
  try {
    const sheetId = "1vQKeG_fqW8mTyzPI5BdcX85cylsyiTP9TDjDU3jkgx4";
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const usersSheet = spreadsheet.getSheetByName('Users');
    if (!usersSheet) return { result: 'success', user: null };

    const rows = usersSheet.getDataRange().getValues();
    if (rows.length < 2) return { result: 'success', user: null };

    const header = rows[0].map(h => (h || '').toString());
    const idxEmail = header.indexOf('Email');
    const idxPhone = header.indexOf('Phone');
    const idxName = header.indexOf('Name');

    const normalized = (email || '').toString().trim().toLowerCase();
    for (let r = 1; r < rows.length; r++) {
      const rowEmail = (rows[r][idxEmail] || '').toString().trim().toLowerCase();
      if (rowEmail === normalized) {
        const user = {
          name: rows[r][idxName] || '',
          email: rows[r][idxEmail] || '',
          phone: rows[r][idxPhone] || ''
        };
        return { result: 'success', user };
      }
    }

    return { result: 'success', user: null };
  } catch (error) {
    return { result: 'error', message: error.toString() };
  }
}
