/**
 * RichTextEditor - Rich Text Editor Component
 * 
 * A rich text editor built on Tiptap with the following features:
 * - Text formatting: bold, italic, underline, strikethrough
 * - Paragraph formatting: headings (H1-H3), paragraphs
 * - Text alignment: left, center, right
 * - Lists: bullet lists, numbered lists
 * - Media insertion: links, images
 * - Editing operations: undo, redo
 * 
 * @component
 * @example
 * <RichTextEditor
 *   value="<p>Initial content</p>"
 *   onChange={(html) => console.log(html)}
 *   height={400}
 *   placeholder="Enter content..."
 *   disabled={false}
 * />
 */

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { useEffect } from 'react'

const RichTextEditor = ({
  value = '',
  onChange,
  height = 300,
  placeholder = 'Enter content...',
  disabled = false
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline'
        }
      }),
      Image.configure({
        inline: true,
        allowBase64: true
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          return placeholder
        },
        emptyEditorClass: 'is-editor-empty'
      })
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML())
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-3'
      }
    }
  })

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) {
    return null
  }

  const MenuBar = () => {
    if (!editor) {
      return null
    }

    const addImage = () => {
      const url = window.prompt('Enter image URL:')
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    }

    const addLink = () => {
      const url = window.prompt('Enter link URL:')
      if (url) {
        editor.chain().focus().setLink({ href: url }).run()
      }
    }

    return (
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        padding: '8px',
        backgroundColor: '#f5f5f5',
        border: '1px solid #e0e0e0',
        borderBottom: 'none',
        borderRadius: '4px 4px 0 0',
        alignItems: 'center'
      }}>
        {/* Format Select */}
        <select
          value={editor.isActive('heading', { level: 1 }) ? 'h1' :
                 editor.isActive('heading', { level: 2 }) ? 'h2' :
                 editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'}
          onChange={(e) => {
            const value = e.target.value
            if (value === 'p') {
              editor.chain().focus().setParagraph().run()
            } else if (value === 'h1') {
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            } else if (value === 'h2') {
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            } else if (value === 'h3') {
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          }}
          disabled={disabled}
          style={{
            padding: '4px 8px',
            fontSize: '13px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            backgroundColor: disabled ? '#f0f0f0' : '#fff'
          }}
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        {/* Separator */}
        <div style={{ width: '1px', height: '20px', backgroundColor: '#ccc', margin: '0 4px' }} />

        {/* Text Formatting */}
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleBold().run()
          }}
          disabled={disabled}
          style={{
            padding: '4px 8px',
            fontSize: '13px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            backgroundColor: editor.isActive('bold') ? '#007bff' : '#fff',
            color: editor.isActive('bold') ? '#fff' : '#000',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          title="Bold"
        >
          <b>B</b>
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleItalic().run()
          }}
          disabled={disabled}
          style={{
            padding: '4px 8px',
            fontSize: '13px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            backgroundColor: editor.isActive('italic') ? '#007bff' : '#fff',
            color: editor.isActive('italic') ? '#fff' : '#000',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          title="Italic"
        >
          <i>I</i>
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleUnderline().run()
          }}
          disabled={disabled}
          style={{
            padding: '4px 8px',
            fontSize: '13px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            backgroundColor: editor.isActive('underline') ? '#007bff' : '#fff',
            color: editor.isActive('underline') ? '#fff' : '#000',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          title="Underline"
        >
          <u>U</u>
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleStrike().run()
          }}
          disabled={disabled}
          style={{
            padding: '4px 8px',
            fontSize: '13px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            backgroundColor: editor.isActive('strike') ? '#007bff' : '#fff',
            color: editor.isActive('strike') ? '#fff' : '#000',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          title="Strikethrough"
        >
          <s>S</s>
        </button>

        {/* Separator */}
        <div style={{ width: '1px', height: '20px', backgroundColor: '#ccc', margin: '0 4px' }} />

        {/* Alignment */}
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign('left').run()
          }}
          disabled={disabled}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            backgroundColor: editor.isActive({ textAlign: 'left' }) ? '#007bff' : '#fff',
            color: editor.isActive({ textAlign: 'left' }) ? '#fff' : '#000',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          title="Align Left"
        >
          Left
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign('center').run()
          }}
          disabled={disabled}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            backgroundColor: editor.isActive({ textAlign: 'center' }) ? '#007bff' : '#fff',
            color: editor.isActive({ textAlign: 'center' }) ? '#fff' : '#000',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          title="Align Center"
        >
          Center
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign('right').run()
          }}
          disabled={disabled}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            backgroundColor: editor.isActive({ textAlign: 'right' }) ? '#007bff' : '#fff',
            color: editor.isActive({ textAlign: 'right' }) ? '#fff' : '#000',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          title="Align Right"
        >
          Right
        </button>

        {/* Separator */}
        <div style={{ width: '1px', height: '20px', backgroundColor: '#ccc', margin: '0 4px' }} />

        {/* Lists */}
                <button
                  onMouseDown={(e) => {
                    e.preventDefault()
                    editor.chain().focus().toggleBulletList().run()
                  }}
                  disabled={disabled}
                  style={{
                    padding: '4px 8px',
                    fontSize: '13px',
                    border: '1px solid #ccc',
                    borderRadius: '3px',
                    backgroundColor: editor.isActive('bulletList') ? '#007bff' : '#fff',
                    color: editor.isActive('bulletList') ? '#fff' : '#000',
                    cursor: disabled ? 'not-allowed' : 'pointer'
                  }}
                  title="Bullet List"
                >
                  •
                </button>        <button
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleOrderedList().run()
          }}
          disabled={disabled}
          style={{
            padding: '4px 8px',
            fontSize: '13px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            backgroundColor: editor.isActive('orderedList') ? '#007bff' : '#fff',
            color: editor.isActive('orderedList') ? '#fff' : '#000',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          title="Numbered List"
        >
          1.
        </button>

        {/* Separator */}
        <div style={{ width: '1px', height: '20px', backgroundColor: '#ccc', margin: '0 4px' }} />

        {/* Link & Image */}
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            addLink()
          }}
          disabled={disabled}
          style={{
            padding: '4px 8px',
            fontSize: '13px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            backgroundColor: '#fff',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          title="Add Link"
        >
          🔗
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            addImage()
          }}
          disabled={disabled}
          style={{
            padding: '4px 8px',
            fontSize: '13px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            backgroundColor: '#fff',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          title="Add Image"
        >
          🖼️
        </button>

        {/* Separator */}
        <div style={{ width: '1px', height: '20px', backgroundColor: '#ccc', margin: '0 4px' }} />

        {/* Undo/Redo */}
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().undo().run()
          }}
          disabled={disabled || !editor.can().undo()}
          style={{
            padding: '4px 8px',
            fontSize: '13px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            backgroundColor: '#fff',
            cursor: (disabled || !editor.can().undo()) ? 'not-allowed' : 'pointer',
            opacity: (disabled || !editor.can().undo()) ? 0.5 : 1
          }}
          title="Undo"
        >
          ↩️
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().redo().run()
          }}
          disabled={disabled || !editor.can().redo()}
          style={{
            padding: '4px 8px',
            fontSize: '13px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            backgroundColor: '#fff',
            cursor: (disabled || !editor.can().redo()) ? 'not-allowed' : 'pointer',
            opacity: (disabled || !editor.can().redo()) ? 0.5 : 1
          }}
          title="Redo"
        >
          ↪️
        </button>

        {/* Separator */}
        <div style={{ width: '1px', height: '20px', backgroundColor: '#ccc', margin: '0 4px' }} />

        {/* Clear Formatting */}
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().unsetAllMarks().run()
          }}
          disabled={disabled}
          style={{
            padding: '4px 8px',
            fontSize: '13px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            backgroundColor: '#fff',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          title="Clear Formatting"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div style={{ height: height, border: '1px solid #ccc', borderRadius: '4px' }}>
      <style>
        {`
          .ProseMirror {
            outline: none;
            padding: 12px;
            min-height: 200px;
            font-family: "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif;
            font-size: 14px;
            line-height: 1.5;
          }
          .ProseMirror.is-editor-empty::before {
            content: attr(data-placeholder);
            float: left;
            color: #999;
            pointer-events: none;
            height: 0;
          }
          .ProseMirror img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
          }
          .ProseMirror a {
            color: #007bff;
            text-decoration: underline;
          }
          .ProseMirror strong {
            font-weight: 600;
          }
          .ProseMirror ul {
            padding-left: 1.5rem;
            list-style-type: none;
          }
          .ProseMirror ul.bullet-disc {
            list-style-type: disc;
          }
          .ProseMirror ul.bullet-circle {
            list-style-type: circle;
          }
          .ProseMirror ul.bullet-square {
            list-style-type: square;
          }
          .ProseMirror li {
            margin: 0.25rem 0;
          }
        `}
      </style>
      <MenuBar />
      <EditorContent editor={editor} />
    </div>
  )
}

export default RichTextEditor