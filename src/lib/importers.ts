import { marked } from 'marked';

export const ACCEPTED_EXTENSIONS = ['.txt', '.md', '.docx', '.pdf'];
export const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function textToHtml(text: string) {
  return text
    .split(/\n{2,}/)
    .filter(p => p.trim())
    .map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

export async function fileToHtml(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !ACCEPTED_EXTENSIONS.includes(`.${ext}`)) {
    throw new Error(`Unsupported file type. Please upload ${ACCEPTED_EXTENSIONS.join(', ')}.`);
  }
  if (file.size > MAX_BYTES) throw new Error('File is larger than 5 MB.');
  if (file.size === 0) throw new Error('File is empty.');

  switch (ext) {
    case 'txt':
      return textToHtml(await file.text());
    case 'md':
      return await marked.parse(await file.text());
    case 'docx': {
      const mammoth = await import('mammoth');
      const { value } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
      return value;
    }
    default: {
      // pdf, loaded lazily so tests and the main bundle stay light
      const { pdfToHtml } = await import('./pdfImport');
      return pdfToHtml(await file.arrayBuffer());
    }
  }
}