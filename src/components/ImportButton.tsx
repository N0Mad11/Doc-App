import { useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { generateJSON } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import { supabase } from '../lib/supabase';
import { ACCEPTED_EXTENSIONS, fileToHtml } from '../lib/importers';

export default function ImportButton({ userId, onError }: { userId: string; onError: (m: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again later
    if (!file) return;
    setBusy(true);
    onError('');
    try {
      const html = DOMPurify.sanitize(await fileToHtml(file));
      const content = generateJSON(html, [StarterKit]);
      const title = file.name.replace(/\.[^.]+$/, '').slice(0, 120) || 'Imported document';
      const { data, error } = await supabase
        .from('documents').insert({ owner_id: userId, title, content }).select('id').single();
      if (error) throw error;
      navigate(`/doc/${data.id}`);
    } catch (err) {
      onError((err as { message?: string }).message ?? 'Import failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input ref={input} type="file" hidden accept={ACCEPTED_EXTENSIONS.join(',')} onChange={onPick} />
      <button disabled={busy} onClick={() => input.current?.click()}>
        {busy ? 'Importing…' : 'Import file'}
      </button>
      <small className="muted">Supports .txt, .md, .docx, .pdf (text only), up to 5 MB</small>
    </>
  );
}