export const exportPrompt = (prompt: string, format: 'txt' | 'json' | 'md') => {
  let content: string;
  let mimeType: string;
  let filename: string;

  const sanitizedFilename = `prompt_${new Date().toISOString()}`;

  switch (format) {
    case 'json':
      content = JSON.stringify({ prompt: prompt }, null, 2);
      mimeType = 'application/json';
      filename = `${sanitizedFilename}.json`;
      break;
    case 'md':
      content = `# AI Image Prompt\n\n\`\`\`\n${prompt}\n\`\`\``;
      mimeType = 'text/markdown';
      filename = `${sanitizedFilename}.md`;
      break;
    case 'txt':
    default:
      content = prompt;
      mimeType = 'text/plain';
      filename = `${sanitizedFilename}.txt`;
      break;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
