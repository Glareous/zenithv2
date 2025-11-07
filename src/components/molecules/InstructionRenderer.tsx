'use client'

import React from 'react'

import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'

import ReactMentionNode from './ReactNodeExtension'

interface InstructionRendererProps {
  content: string
  className?: string
}

export const InstructionRenderer: React.FC<InstructionRendererProps> = ({
  content,
  className = '',
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        horizontalRule: false,
        blockquote: false,
        codeBlock: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      ReactMentionNode,
    ],
    content: (() => {
      if (!content) return ''
      try {
        return JSON.parse(content)
      } catch (error) {
        return content
      }
    })(),
  })

  React.useEffect(() => {
    if (editor && content) {
      try {
        const parsedContent = JSON.parse(content)
        editor.commands.setContent(parsedContent, { emitUpdate: false })
      } catch (error) {
        editor.commands.setContent(content, { emitUpdate: false })
      }
    }
  }, [editor, content])

  if (!editor) {
    return null
  }

  return (
    <div className={`rich-text-renderer ${className}`}>
      <EditorContent
        editor={editor}
        className={`prose prose-sm max-w-none break-words overflow-hidden [&_.ProseMirror]:outline-none [&_.ProseMirror]:p-0 [&_.ProseMirror]:m-0 ${
          className.includes('line-clamp')
            ? '[&_.ProseMirror]:line-clamp-2 [&_.ProseMirror]:overflow-hidden'
            : ''
        }`}
      />
    </div>
  )
}

export default InstructionRenderer
