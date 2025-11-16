// Handle Retell web call creation
function handleCreateWebCall(data) {
  const apiKey = ScriptProperties.getProperty('RETELL_API_KEY');
  if (!apiKey) {
    return { error: 'Missing RETELL_API_KEY script property' };
  }

  const agentId = data.agent_id || 'agent_0c7794edc7b4aab987152a6985';
  const payload = {
    agent_id: agentId
  };

  if (data.agent_version) {
    payload.agent_version = data.agent_version;
  }
  if (data.agent_override) {
    payload.agent_override = data.agent_override;
  }
  if (data.metadata) {
    payload.metadata = data.metadata;
  }
  if (data.retell_llm_dynamic_variables) {
    payload.retell_llm_dynamic_variables = data.retell_llm_dynamic_variables;
  }

  const url = 'https://api.retellai.com/v2/create-web-call';
  const options = {
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload)
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    return JSON.parse(response.getContentText());
  } catch (error) {
    return { error: error.toString() };
  }
}

