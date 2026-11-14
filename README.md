# Docs Lite

A lightweight collaborative document editor inspired by Google Docs. Users can create and edit rich-text documents, import files (including PDF), export to PDF, and share documents with other users as viewers or editors.

**Live demo:** https://YOUR-APP.vercel.app

**Demo accounts** (password for both: `demo123`)

Existing Demo accounts:
| janedoe@demo.com |
| john.doe@demo.com |

Tip: open one account in a normal window and the other in an incognito window to test sharing.

## Features

- **Documents:** create, rename, edit, delete, reopen after refresh
- **Rich text:** bold, italic, underline, headings (H1/H2), bulleted and numbered lists
- **Autosave:** debounced saves with a Saving / Saved / Error indicator and retry
- **File import:** `.txt`, `.md`, `.docx`, `.pdf` (max 5 MB) become a new editable document
- **PDF export:** download any document you can open as a PDF
- **Sharing:** owner shares by email with a Viewer or Editor role; dashboard separates "My documents" from "Shared with me" with owner and role badges; viewers get a read-only editor
- **Access control:** enforced in the database with Postgres Row Level Security, not only in the UI

## Tech stack

React + TypeScript + Vite, TipTap (ProseMirror) editor, Supabase (Postgres, Auth, RLS), deployed on Vercel. Tests with Vitest.

## Local setup

**Prerequisites:** Node 18+ and a free Supabase project.

1. Clone and install:
   ```bash
   git clone YOUR_REPO_URL
   cd docs-app
   npm install
   ```
2. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from Supabase → Project Settings → API.
3. Create the database: open the Supabase SQL editor and run `supabase/schema.sql` (tables, trigger, RLS policies).
4. Auth settings: in Authentication → Providers → Email, turn off "Confirm email". Create the demo users above with **Auto Confirm User** ticked.
5. Run:
   ```bash
   npm run dev
   ```
   Open http://localhost:5173

## Tests

```bash
npm test
```

Covers the sharing permission logic and the file import validation and conversion.

## Supported file types and limits

| Type | Behavior |
|---|---|
| .txt | Paragraphs preserved |
| .md | Converted to formatted content |
| .docx | Text and basic formatting; complex styling is lost |
| .pdf | Text only, no layout, images, or OCR (scanned PDFs are rejected) |

Maximum file size: 5 MB. Imported HTML is sanitized with DOMPurify.

## Known limitations

- No real-time co-editing; concurrent edits are last-write-wins
- No comments or version history
- Sharing requires the other person to have signed up already
- Only the owner can rename or delete a document

See `ARCHITECTURE.md` for the reasoning behind these tradeoffs.

## Project structure

```
src/
  components/  Toolbar, ShareDialog, ImportButton, auth wrappers
  hooks/       useAutosave
  lib/         supabase client, permissions, importers, PDF import/export
  pages/       Login, Dashboard, DocPage
supabase/      schema.sql
```
