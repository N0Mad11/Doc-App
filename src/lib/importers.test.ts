import { describe, expect, it } from 'vitest';
import { MAX_BYTES, fileToHtml, textToHtml } from './importers';

describe('textToHtml', () => {
  it('escapes HTML and splits paragraphs', () => {
    expect(textToHtml('<b>hi</b>\n\nsecond')).toBe('<p>&lt;b&gt;hi&lt;/b&gt;</p><p>second</p>');
  });
});

describe('fileToHtml', () => {
  it('rejects unsupported types', async () => {
    await expect(fileToHtml(new File(['x'], 'a.exe'))).rejects.toThrow(/Unsupported/);
  });
  it('rejects oversized files', async () => {
    const big = new File([new Uint8Array(MAX_BYTES + 1)], 'big.txt');
    await expect(fileToHtml(big)).rejects.toThrow(/5 MB/);
  });
  it('converts txt', async () => {
    expect(await fileToHtml(new File(['hello'], 'a.txt'))).toBe('<p>hello</p>');
  });
});