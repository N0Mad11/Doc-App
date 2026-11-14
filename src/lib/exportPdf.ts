import DOMPurify from 'dompurify';
import html2pdf from 'html2pdf.js';

const STYLE = `
  <style>
    .pdf { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5; color: #111; }
    .pdf h1 { font-size: 22pt; margin: 0 0 8pt; }
    .pdf h2 { font-size: 16pt; margin: 12pt 0 6pt; }
    .pdf p { margin: 0 0 8pt; }
    .pdf ul, .pdf ol { margin: 0 0 8pt 18pt; }
  </style>`;

export function exportPdf(html: string, title: string) {
  const el = document.createElement('div');
  el.innerHTML = `${STYLE}<div class="pdf"><h1>${title.replace(/[<>&]/g, '')}</h1>${DOMPurify.sanitize(html)}</div>`;
  const filename = `${title.replace(/[^\w\- ]+/g, '').trim() || 'document'}.pdf`;
  return html2pdf()
    .set({ margin: 15, filename, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4' } })
    .from(el)
    .save();
}