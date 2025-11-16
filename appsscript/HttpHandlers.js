
// HTTP Handlers
function doGet(e) {
  // Check if requesting Swagger UI
  if (e.parameter && e.parameter.swagger === 'true') {
    const swaggerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Coliana API Documentation</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css" />
        <style>
            html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
            *, *:before, *:after { box-sizing: inherit; }
            body { margin: 0; background: #fafafa; }
        </style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
        <script>
            window.onload = function() {
                const url = new URL(window.location.href);
                url.searchParams.set('format', 'openapi');
                url.searchParams.delete('swagger');
                const specUrl = url.toString();
                console.log('Loading OpenAPI spec from:', specUrl);
                
                // fetch(specUrl, { redirect: 'manual' })
                //     .then(response => {
                //         if (response.status === 302) {
                //             const redirectUrl = response.headers.get('location');
                //             console.log('Redirecting to:', redirectUrl);
                //             return fetch(redirectUrl);
                //         }
                //         return response;
                //     })
                //     .then(response => response.json())
                //     .then(spec => {
                        const ui = SwaggerUIBundle({
                            spec: {"openapi":"3.0.0","info":{"title":"Coliana API","version":"1.0.0","description":"API for Coliana client intake and provider matching"},"paths":{"/":{"get":{"summary":"Get the main application UI","responses":{"200":{"description":"HTML page"}}},"post":{"summary":"Submit client or provider form","requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"formType":{"type":"string"},"name":{"type":"string"},"email":{"type":"string"},"phone":{"type":"string"},"ageGroup":{"type":"string"},"location":{"type":"string"},"format":{"type":"array","items":{"type":"string"}},"supportTypes":{"type":"array","items":{"type":"string"}}},"required":["formType","name","email"]}}}},"responses":{"200":{"description":"Submission successful","content":{"application/json":{"schema":{"type":"object","properties":{"result":{"type":"string"},"message":{"type":"string"}}}}}},"400":{"description":"Bad request"}}}}}},
                            dom_id: '#swagger-ui',
                            deepLinking: true,
                            presets: [
                                SwaggerUIBundle.presets.apis,
                                SwaggerUIBundle.presets.standalone
                            ]
                        });
            //         })
            //         .catch(error => console.error('Error loading spec:', error));
            };
        </script>
    </body>
    </html>
            `;
    return HtmlService.createHtmlOutput(swaggerHtml)
      .setTitle('Coliana API Documentation')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // Check if requesting OpenAPI spec
  if (e.parameter && e.parameter.format === 'openapi') {
    const openApiSpec = {
      openapi: "3.0.0",
      info: {
        title: "Coliana API",
        version: "1.0.0",
        description: "API for Coliana client intake and provider matching"
      },
      paths: {
        "/": {
          get: {
            summary: "Get the main application UI",
            responses: {
              200: {
                description: "HTML page"
              }
            }
          },
          post: {
            summary: "Submit client or provider form",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      formType: { type: "string" },
                      name: { type: "string" },
                      email: { type: "string" },
                      phone: { type: "string" },
                      ageGroup: { type: "string" },
                      location: { type: "string" },
                      format: { type: "array", items: { type: "string" } },
                      supportTypes: { type: "array", items: { type: "string" } }
                    },
                    required: ["formType", "name", "email"]
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Submission successful",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        result: { type: "string" },
                        message: { type: "string" }
                      }
                    }
                  }
                }
              },
              400: {
                description: "Bad request"
              }
            }
          }
        }
      }
    };
    
    // return HtmlService.createHtmlOutput(JSON.stringify(openApiSpec))
    //   .setMimeType(ContentService.MimeType.JSON)
    //   .addHeader('Access-Control-Allow-Origin', '*');
    return ContentService.createTextOutput(JSON.stringify(openApiSpec))
    //   .setMimeType(ContentService.MimeType.JSON);
    // return ContentService.createTextOutput(JSON.stringify(openApiSpec))
    //   .setMimeType(ContentService.MimeType.JSON);
  }

  // Support getting a small user profile by email (returns stored phone if available)
  if (e.parameter && e.parameter.action === 'getUserProfile' && e.parameter.email) {
    try {
      const result = getUserProfileByEmail(e.parameter.email);
      return ContentService.createTextOutput(JSON.stringify(result));
    } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }));
    }
  }

  return HtmlService.createHtmlOutputFromFile('DevIndex')
    .setTitle('Coliana - Development Mode')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    let data;
    // Use mock data if e is undefined or missing postData
    if (!e || !e.postData || !e.postData.contents) {
      data = {
        formType: "client",
        name: "Test User",
        email: "test@example.com",
        phone: "555-0123",
        ageGroup: "Adult (18-64)",
        location: "Test City",
        format: ["In-person", "Virtual"],
        supportTypes: ["Speech and language", "Occupational therapy"]
      };
    } else {
      data = JSON.parse(e.postData.contents);
    }
    var handlerResult;
    // Handle Retell web call creation
    switch (data.formType) {
      case 'create-web-call': 
        const apiKey = ScriptProperties.getProperty('RETELL_API_KEY');
        const agentId = data.agent_id || 'agent_0c7794edc7b4aab987152a6985';

        // Build payload with optional fields from data
        const payload = {
          agent_id: agentId,
          ...(data.agent_version && { agent_version: data.agent_version }),
          ...(data.agent_override && { agent_override: data.agent_override }),
          ...(data.metadata && { metadata: data.metadata }),
          ...(data.retell_llm_dynamic_variables && { retell_llm_dynamic_variables: data.retell_llm_dynamic_variables })
        };

        const url = 'https://api.retellai.com/v2/create-web-call';
        const options = {
          method: 'post',
          headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
          },
          payload: JSON.stringify(payload)
        };
        try {
          const response = UrlFetchApp.fetch(url, options);
          const result = JSON.parse(response.getContentText());
          handlerResult = result;
        } catch (error) {
          handlerResult = { error: error.toString() };
        }
        break;
  case "provider":
        handlerResult = handleProviderSubmission(data);
        break;
  case "save-user":
    handlerResult = handleSaveUserProfile(data);
    break;
    case "client":
    default:
        handlerResult = handleClientSubmission(data);
        break;
    
 
      
    }
    // Wrap the plain JS result into a ContentService response for HTTP requests
    return ContentService.createTextOutput(
      JSON.stringify(handlerResult)
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return { result: 'error', message: error.toString() };
  }
}
