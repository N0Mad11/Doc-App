import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { supabase } from '../lib/supabase';
import { EMPTY_DOC } from '../lib/constants';
import { canEdit, getRole, type Role } from '../lib/permissions';
import { exportPdf } from '../lib/exportPdf';
import { useAutosave } from '../hooks/useAutosave';
import { useSession } from '../components/AuthProvider';
import Toolbar from '../components/Toolbar';
import ShareDialog from '../components/ShareDialog';

type DocRecord = { id: string; title: string; content: any; owner_id: string };

export default function DocPage() {
  const { id } = useParams();
  const user = useSession().session!.user;
  const [loaded, setLoaded] = useState<{ doc: DocRecord; role: Role } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: doc, error } = await supabase
        .from('documents').select('id,title,content,owner_id').eq('id', id!).maybeSingle();
      if (cancelled) return;
      if (error || !doc) return setError('Document not found, or you do not have access.');
      const { data: shares } = await supabase
        .from('document_shares').select('user_id,role').eq('document_id', doc.id);
      if (cancelled) return;
      setLoaded({ doc, role: getRole(doc, user.id, shares ?? []) });
    })();
    return () => { cancelled = true; };
  }, [id, user.id]);

  if (error) return <p className="center">{error} <Link to="/">Back</Link></p>;
  if (!loaded) return <p className="center">Loading…</p>;
  return <DocEditor key={loaded.doc.id} doc={loaded.doc} role={loaded.role} myEmail={user.email ?? ''} />;
}

function DocEditor({ doc, role, myEmail }: { doc: DocRecord; role: Role; myEmail: string }) {
  const editable = canEdit(role);
  const { status, schedule, flush } = useAutosave(doc.id, editable);
  const [title, setTitle] = useState(doc.title);
  const [shareOpen, setShareOpen] = useState(false);
  const [titleError, setTitleError] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: doc.content?.type ? doc.content : EMPTY_DOC,
    editable,
    onUpdate: ({ editor }) => schedule(editor.getJSON()),
  });

  async function saveTitle() {
    const clean = title.trim().slice(0, 120);
    if (!clean) { setTitle(doc.title); return setTitleError('Title cannot be empty.'); }
    if (clean === doc.title) return;
    const { error } = await supabase.from('documents').update({ title: clean }).eq('id', doc.id);
    if (error) return setTitleError(error.message);
    doc.title = clean;
    setTitle(clean);
    setTitleError('');
  }

  const statusText = { idle: '', saving: 'Saving…', saved: 'All changes saved', error: 'Save failed' }[status];

  return (
    <div className="doc-page">
      <header className="bar">
        <Link to="/">← Documents</Link>
        <input className="title-input" value={title} disabled={role !== 'owner'} maxLength={120}
          onChange={e => setTitle(e.target.value)} onBlur={saveTitle}
          onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          aria-label="Document title" />
        <span className={`status ${status}`}>{statusText}</span>
        {status === 'error' && <button onClick={flush}>Retry</button>}
        <button onClick={() => editor && exportPdf(editor.getHTML(), title)}>Export PDF</button>
        {role === 'owner' && <button className="primary" onClick={() => setShareOpen(true)}>Share</button>}
      </header>
      {titleError && <p className="error">{titleError}</p>}
      {!editable && <p className="banner">View only. You can read and export this document, but not edit it.</p>}
      {editor && editable && <Toolbar editor={editor} />}
      <EditorContent editor={editor} className="editor-wrap" />
      {shareOpen && <ShareDialog docId={doc.id} myEmail={myEmail} onClose={() => setShareOpen(false)} />}
    </div>
  );
}