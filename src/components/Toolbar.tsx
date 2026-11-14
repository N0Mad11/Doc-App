import { useEditorState, type Editor } from '@tiptap/react';

export default function Toolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      underline: editor.isActive('underline'),
      h1: editor.isActive('heading', { level: 1 }),
      h2: editor.isActive('heading', { level: 2 }),
      bullet: editor.isActive('bulletList'),
      ordered: editor.isActive('orderedList'),
    }),
  });

  const Btn = (p: { label: string; title: string; active?: boolean; onClick: () => void }) => (
    <button type="button" title={p.title} aria-pressed={p.active}
      className={p.active ? 'tb active' : 'tb'} onMouseDown={e => e.preventDefault()} onClick={p.onClick}>
      {p.label}
    </button>
  );
  const chain = () => editor.chain().focus();

  return (
    <div className="toolbar" role="toolbar" aria-label="Formatting">
      <Btn label="B" title="Bold" active={s.bold} onClick={() => chain().toggleBold().run()} />
      <Btn label="I" title="Italic" active={s.italic} onClick={() => chain().toggleItalic().run()} />
      <Btn label="U" title="Underline" active={s.underline} onClick={() => chain().toggleUnderline().run()} />
      <span className="sep" />
      <Btn label="H1" title="Heading 1" active={s.h1} onClick={() => chain().toggleHeading({ level: 1 }).run()} />
      <Btn label="H2" title="Heading 2" active={s.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()} />
      <Btn label="¶" title="Normal text" onClick={() => chain().setParagraph().run()} />
      <span className="sep" />
      <Btn label="• List" title="Bulleted list" active={s.bullet} onClick={() => chain().toggleBulletList().run()} />
      <Btn label="1. List" title="Numbered list" active={s.ordered} onClick={() => chain().toggleOrderedList().run()} />
    </div>
  );
}