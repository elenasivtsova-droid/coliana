
// Entrypoint functions
function submitClientForm(formData) {
  try {
    const result = handleClientSubmission(formData);
    // Return the handler result (includes matches) to the client for display
    return result;
  } catch (error) {
    return { result: 'error', message: error.toString() };
  }
}

function submitProviderForm(formData) {
  try {
    const result = handleProviderSubmission(formData);
    return result;
  } catch (error) {
    return { result: 'error', message: error.toString() };
  }
}

function testConnection() {
  return { 
    success: true, 
    message: 'Connection successful!',
    timestamp: new Date().toISOString()
  };
}
