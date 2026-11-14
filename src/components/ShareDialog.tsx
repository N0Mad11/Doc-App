import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type ShareRow = { user_id: string; role: 'viewer' | 'editor'; profile: { email: string } | null };

export default function ShareDialog({ docId, myEmail, onClose }: { docId: string; myEmail: string; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [shares, setShares] = useState<ShareRow[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('document_shares')
      .select('user_id,role,profile:profiles(email)')
      .eq('document_id', docId);
    if (error) setError(error.message);
    else setShares(data as unknown as ShareRow[]);
  }, [docId]);

  useEffect(() => { load(); }, [load]);

  async function add() {
    setError('');
    const clean = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(clean)) return setError('Enter a valid email address.');
    if (clean === myEmail.toLowerCase()) return setError('You already own this document.');

    const { data: profile } = await supabase.from('profiles').select('id').eq('email', clean).maybeSingle();
    if (!profile) return setError('No user with that email. They need to sign up first.');

    const { error } = await supabase
      .from('document_shares')
      .upsert({ document_id: docId, user_id: profile.id, role }, { onConflict: 'document_id,user_id' });
    if (error) return setError(error.message);
    setEmail('');
    load();
  }

  async function changeRole(userId: string, newRole: 'viewer' | 'editor') {
    const { error } = await supabase.from('document_shares')
      .update({ role: newRole }).eq('document_id', docId).eq('user_id', userId);
    if (error) setError(error.message); else load();
  }

  async function remove(userId: string) {
    const { error } = await supabase.from('document_shares')
      .delete().eq('document_id', docId).eq('user_id', userId);
    if (error) setError(error.message); else load();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="dialog" role="dialog" aria-label="Share document" onClick={e => e.stopPropagation()}>
        <h2>Share document</h2>
        <div className="row">
          <input type="email" placeholder="Email of an existing user" value={email}
            onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
          <select value={role} onChange={e => setRole(e.target.value as 'viewer' | 'editor')}>
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <button className="primary" onClick={add}>Share</button>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <h3>People with access</h3>
        {shares.length === 0 && <p className="muted">Only you.</p>}
        <ul>
          {shares.map(s => (
            <li key={s.user_id} className="row">
              <span>{s.profile?.email}</span>
              <select value={s.role} onChange={e => changeRole(s.user_id, e.target.value as 'viewer' | 'editor')}>
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
              <button onClick={() => remove(s.user_id)}>Remove</button>
            </li>
          ))}
        </ul>
        <button onClick={onClose}>Done</button>
      </div>
    </div>
  );
}