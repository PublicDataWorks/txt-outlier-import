export const markdownTemplateHeader = `
:warning: *Failed Request Notification* :warning:

The server received a request that failed due to the following reason:
- Request host: *<%= failureHost %>*
- *<%= failureDetails %>*
- Rule: *<%= failedRule %>*

Here are the details of the failed request:
`;

export const markdownTemplateBody = `
\`\`\`
<%= failedRequestDetails %>
\`\`\`
`;
