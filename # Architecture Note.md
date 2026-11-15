# Architecture Note

## Goal
Ship a coherent, deployable slice in 4 hours: depth in editing, sharing logic, import, and persistence rather than breadth.

## Stack and why
- **React + Vite + TS:** fast to build and deploy as a static SPA.
- **TipTap:** a mature ProseMirror wrapper, so rich text works reliably without custom code.
- **Supabase:** Postgres, auth, and a free tier reviewers can use without paying.
- **Vercel:** zero-config static hosting.

## Data model
- `profiles(id, email)`: mirrors auth users, used to look up people by email when sharing
- `documents(id, owner_id, title, content jsonb, updated_at)`
- `document_shares(document_id, user_id, role viewer|editor)`

## Access control
Sharing is enforced in the database with Row Level Security, not only in the UI. Security-definer helper functions (`is_owner`, `has_share`) avoid recursive policies. Owners can do everything; editors can update; viewers can only read. The UI mirrors this (read-only editor, hidden controls), but the database is the source of truth.

## Storage format
Documents are stored as TipTap/ProseMirror JSON. It preserves structure, avoids storing raw HTML, and can be re-rendered to HTML for export.

## File import
Parsing runs client-side: txt (paragraph split), md (marked), docx (mammoth), pdf (pdf.js text extraction). All output is sanitized with DOMPurify, converted to editor JSON, and saved as a new document. Limits: 5 MB and 4 listed types, shown in the UI.

## Autosave
Edits are debounced (800 ms). The UI shows Saving / Saved / Error with retry, and pending changes are flushed on navigation.

## Prioritization
**Built:** auth, document CRUD, rich text, autosave, import, PDF export, sharing with roles, unit tests, deployment.
**Cut deliberately:** real-time collaboration, comments, version history, rich export formats, large-file/OCR handling.

## Tradeoffs and known gaps
- Last-write-wins for concurrent editors; next step is Yjs plus Supabase Realtime.
- Editors can update any column of a document they can edit; a column-level trigger would restrict them to content only.
- Import and export run in the browser, so very large files are slow; a server-side worker would fix that.
- Tests cover permissions and import logic; no end-to-end tests yet.