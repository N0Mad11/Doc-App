import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const DEMOS = ['janedoe@demo.com', 'john.doe@demo.com'];

export default function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function authenticate(e: string, p: string) {
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(e)) return setError('Enter a valid email address.');
    if (p.length < 6) return setError('Password must be at least 6 characters.');
    setBusy(true);
    const { error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email: e, password: p })
        : await supabase.auth.signUp({ email: e, password: p });
    setBusy(false);
    if (error) return setError(error.message);
    nav('/');
  }

  function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    authenticate(email.trim().toLowerCase(), password);
  }

  return (
    <main className="login">
      <h1>Docs Lite</h1>
      <form onSubmit={onSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="error">{error}</p>}
        <button disabled={busy}>{mode === 'signin' ? 'Sign in' : 'Create account'}</button>
      </form>
      <button className="link" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
        {mode === 'signin' ? 'No account? Sign up' : 'Have an account? Sign in'}
      </button>
      <hr />
      <p>Demo accounts:</p>
      {DEMOS.map(d => (
        <button key={d} disabled={busy} onClick={() => { setMode('signin'); authenticate(d, 'demo123'); }}>
          Continue as {d}
        </button>
      ))}
    </main>
  );
}