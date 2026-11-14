import * as pdfjs from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { escapeHtml } from './importers';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export async function pdfToHtml(buffer: ArrayBuffer): Promise<string> {
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map(it => ('str' in it ? it.str : '')).join(' ').replace(/\s+/g, ' ').trim();
    if (text) pages.push(`<p>${escapeHtml(text)}</p>`);
  }
  if (pages.length === 0) throw new Error('No selectable text found. Scanned PDFs are not supported.');
  return pages.join('');
}