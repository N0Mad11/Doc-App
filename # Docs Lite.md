# Docs Lite

A lightweight collaborative document editor inspired by Google Docs. Users can create and edit rich-text documents, import files (including PDF), export to PDF, and share documents with other users as viewers or editors.

**Live demo:** https://doc-app-demo.vercel.app/login

**Demo accounts** (password for both: `demo123`)

Existing Demo accounts:
| janedoe@demo.com |
| john.doe@demo.com |

## Features
- Create, rename, delete, and reopen documents (autosaved)
- Rich text: bold, italic, underline, headings (H1/H2), bulleted and numbered lists
- Import: .txt, .md, .docx, .pdf (text only), max 5 MB. Each import becomes a new editable document
- Export to PDF
- Sharing by email with Viewer or Editor roles; "My documents" vs "Shared with me" with role badges; viewers get a read-only editor
- Auth (email/password) and persistence via Supabase

## Tech stack
React + Vite + TypeScript, TipTap editor, Supabase (Postgres, Auth, Row Level Security), Vercel, Vitest.

## Local setup
1. `git clone [REPO URL] && cd [FOLDER]`
2. `npm install`
3. `cp .env.example .env` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Supabase → Project Settings → API)
4. In the Supabase SQL editor, run `supabase/schema.sql`
5. In Supabase → Authentication, create the two demo users above (auto-confirm), and disable "Confirm email"
6. `npm run dev` then open http://localhost:5173
7. `npm test` runs the unit tests

## Known limitations
- PDF import extracts text only (no layout, images, or OCR; scanned PDFs are rejected)
- .docx import keeps basic structure (headings, lists, bold/italic) but drops other styling
- No real-time co-editing: concurrent edits are last-write-wins
- Only the owner can rename, share, or delete a document