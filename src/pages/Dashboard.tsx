import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { EMPTY_DOC } from '../lib/constants';
import { useSession } from '../components/AuthProvider';
import ImportButton from '../components/ImportButton';

type Share = { user_id: string; role: 'viewer' | 'editor' };
type DocRow = {
  id: string; title: string; updated_at: string; owner_id: string;
  owner: { email: string } | null;
  document_shares: Share[];
};

export default function Dashboard() {
  const user = useSession().session!.user;
  const navigate = useNavigate();
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('id,title,updated_at,owner_id,owner:profiles!documents_owner_id_fkey(email),document_shares(user_id,role)')
      .order('updated_at', { ascending: false });
    if (error) setError(error.message);
    else setDocs(data as unknown as DocRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createDoc() {
    const { data, error } = await supabase
      .from('documents')
      .insert({ owner_id: user.id, title: 'Untitled', content: EMPTY_DOC })
      .select('id')
      .single();
    if (error) return setError(error.message);
    navigate(`/doc/${data.id}`);
  }

  async function rename(id: string, title: string) {
    const clean = title.trim().slice(0, 120);
    if (!clean) return setError('Title cannot be empty.');
    const { error } = await supabase.from('documents').update({ title: clean }).eq('id', id);
    if (error) return setError(error.message);
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this document? This cannot be undone.')) return;
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) return setError(error.message);
    load();
  }

  const mine = docs.filter(d => d.owner_id === user.id);
  const shared = docs.filter(d => d.owner_id !== user.id);

  return (
    <main className="container">
      <header className="bar">
        <h1>Docs Lite</h1>
        <span>{user.email}</span>
        <button onClick={() => supabase.auth.signOut()}>Sign out</button>
      </header>

      <div className="actions">
        <button className="primary" onClick={createDoc}>+ New document</button>
        <ImportButton userId={user.id} onError={setError} />
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {loading && <p>Loading…</p>}

      <h2>My documents</h2>
      {!loading && mine.length === 0 && <p className="muted">No documents yet. Create or import one.</p>}
      <ul className="list">
        {mine.map(d => (
          <DocCard key={d.id} doc={d} isOwner onRename={rename} onDelete={remove}
            meta={`Owned by you · ${d.document_shares.length} collaborator(s)`} />
        ))}
      </ul>

      <h2>Shared with me</h2>
      {!loading && shared.length === 0 && <p className="muted">Nothing shared with you yet.</p>}
      <ul className="list">
        {shared.map(d => {
          const role = d.document_shares.find(s => s.user_id === user.id)?.role ?? 'viewer';
          return (
            <DocCard key={d.id} doc={d} isOwner={false} onRename={rename} onDelete={remove}
              meta={`Shared by ${d.owner?.email ?? 'unknown'}`} badge={role} />
          );
        })}
      </ul>
    </main>
  );
}

function DocCard(props: {
  doc: DocRow; isOwner: boolean; meta: string; badge?: string;
  onRename: (id: string, title: string) => void; onDelete: (id: string) => void;
}) {
  const { doc, isOwner, meta, badge, onRename, onDelete } = props;
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(doc.title);

  function commit() {
    setEditing(false);
    if (title.trim() !== doc.title) onRename(doc.id, title);
  }

  return (
    <li className="card">
      <div>
        {editing ? (
          <input autoFocus value={title} maxLength={120}
            onChange={e => setTitle(e.target.value)} onBlur={commit}
            onKeyDown={e => e.key === 'Enter' && commit()} />
        ) : (
          <Link to={`/doc/${doc.id}`} className="title">{doc.title}</Link>
        )}
        {badge && <span className={`badge ${badge}`}>{badge}</span>}
        <div className="muted">{meta} · Edited {new Date(doc.updated_at).toLocaleString()}</div>
      </div>
      {isOwner && (
        <div>
          <button onClick={() => setEditing(true)}>Rename</button>
          <button onClick={() => onDelete(doc.id)}>Delete</button>
        </div>
      )}
    </li>
  );
}