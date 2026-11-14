import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutosave(docId: string, enabled: boolean) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timer = useRef<number | undefined>(undefined);
  const pending = useRef<unknown>(null);

  const flush = useCallback(async () => {
    if (pending.current === null) return;
    const content = pending.current;
    pending.current = null;
    setStatus('saving');
    const { error } = await supabase
      .from('documents')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', docId);
    if (error) {
      pending.current ??= content; // keep it so a retry can resend
      setStatus('error');
    } else {
      setStatus('saved');
    }
  }, [docId]);

  const schedule = useCallback((content: unknown) => {
    if (!enabled) return;
    pending.current = content;
    setStatus('saving');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(flush, 800);
  }, [enabled, flush]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (pending.current) e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => {
      window.removeEventListener('beforeunload', warn);
      window.clearTimeout(timer.current);
      flush(); // save anything pending when leaving the page
    };
  }, [flush]);

  return { status, schedule, flush };
}