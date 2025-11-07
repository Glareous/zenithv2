import { forwardRef, useCallback, useImperativeHandle, useMemo } from 'react'

import Mention from '@tiptap/extension-mention'
import { type Editor, EditorContent, useEditor } from '@tiptap/react'
import { ReactRenderer } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import tippy, { Instance as TippyInstance } from 'tippy.js'

import {
  filterItemsByQuery,
  getAllSuggestionItems,
} from '@/utils/suggestionHelpers'
import { TRIGGER_CHARACTERS } from '@/utils/triggerMappings'

import ReactMentionNode from './ReactNodeExtension'
import {
  SuggestionDropdown,
  type SuggestionDropdownRef,
} from './SuggestionDropdown'

export interface EnabledTriggers {
  variables?: boolean
  actions?: boolean
  results?: boolean
}

export interface RichTextEditorProps {
  content: string
  onUpdate: (content: string) => void
  availableActions: any[]
  placeholder?: string
  className?: string
  enabledTriggers?: EnabledTriggers
  replaceResultChar?: boolean
}

export interface RichTextEditorRef {
  editor: Editor | null
  removeMentionsById: (id: string) => void
  updateMentionById: (id: string, newLabel: string) => void
  removeAllMentionsByActionId: (actionId: string) => void
}

export const RichTextEditor = forwardRef<
  RichTextEditorRef,
  RichTextEditorProps
>(
  (
    {
      content,
      onUpdate,
      availableActions = [],
      placeholder = 'Type your instructions here...',
      className = '',
      enabledTriggers = { variables: true, actions: true, results: true },
      replaceResultChar = false,
    },
    ref
  ) => {
    const allowedPrefixes = [' ', '', ':', '"', "'"]

    const createSuggestionRender = useCallback(() => {
      let component: ReactRenderer<SuggestionDropdownRef>
      let popup: TippyInstance[]

      return {
        onStart: (props: any) => {
          component = new ReactRenderer(SuggestionDropdown, {
            props,
            editor: props.editor,
          })

          if (!props.clientRect) {
            return
          }

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect as () => DOMRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          })
        },

        onUpdate: (props: any) => {
          component.updateProps(props)

          if (!props.clientRect) {
            return
          }

          popup[0]?.setProps({
            getReferenceClientRect: props.clientRect as () => DOMRect,
          })
        },

        onKeyDown: (props: any) => {
          if (props.event.key === 'Escape') {
            popup[0]?.hide()
            return true
          }

          if (component.ref?.onKeyDown?.(props.event)) {
            return true
          }

          return false
        },

        onExit: () => {
          popup?.[0]?.destroy()
          component?.destroy()
        },
      }
    }, [])

    const suggestions = useMemo(() => {
      const suggestionArray = []

      if (enabledTriggers.variables) {
        suggestionArray.push({
          char: TRIGGER_CHARACTERS.variable,
          allowSpaces: false,
          startOfLine: false,
          allowedPrefixes,
          items: ({ query }: { query: string }) => {
            const allItems = getAllSuggestionItems(
              availableActions,
              'variable',
              replaceResultChar
            )
            return filterItemsByQuery(allItems, query)
          },
          render: createSuggestionRender,
          command: ({
            editor,
            range,
            props,
          }: {
            editor: Editor
            range: any
            props: any
          }) => {
            const nodeAfter = editor.view.state.selection.$to.nodeAfter
            const overrideSpace = nodeAfter?.text?.startsWith(' ')

            if (overrideSpace) {
              range.to += 1
            }

            editor
              .chain()
              .focus()
              .insertContentAt(range, [
                {
                  type: 'reactMention',
                  attrs: {
                    id: props.id,
                    label: props.label,
                    actionId: props.actionId,
                    actionType: props.actionType,
                    actionName: props.actionName,
                    class: 'mention mention--variable',
                    replaceResultChar,
                  },
                },
                {
                  type: 'text',
                  text: ' ',
                },
              ])
              .run()

            window.getSelection()?.collapseToEnd()
          },
        })
      }

      if (enabledTriggers.actions) {
        suggestionArray.push({
          char: TRIGGER_CHARACTERS.action,
          allowSpaces: false,
          startOfLine: false,
          allowedPrefixes,
          items: ({ query }: { query: string }) => {
            const allItems = getAllSuggestionItems(
              availableActions,
              'action',
              replaceResultChar
            )
            return filterItemsByQuery(allItems, query)
          },
          render: createSuggestionRender,
          command: ({ editor, range, props }: any) => {
            const nodeAfter = editor.view.state.selection.$to.nodeAfter
            const overrideSpace = nodeAfter?.text?.startsWith(' ')

            if (overrideSpace) {
              range.to += 1
            }

            editor
              .chain()
              .focus()
              .insertContentAt(range, [
                {
                  type: 'reactMention',
                  attrs: {
                    id: props.id,
                    actionId: props.actionId,
                    label: props.label,
                    class: 'mention mention--action',
                    replaceResultChar,
                  },
                },
                {
                  type: 'text',
                  text: ' ',
                },
              ])
              .run()

            window.getSelection()?.collapseToEnd()
          },
        })
      }

      if (enabledTriggers.results) {
        suggestionArray.push({
          char: TRIGGER_CHARACTERS.result,
          allowSpaces: false,
          startOfLine: false,
          allowedPrefixes,
          items: ({ query }: { query: string }) => {
            const allItems = getAllSuggestionItems(
              availableActions,
              'result',
              replaceResultChar
            )
            return filterItemsByQuery(allItems, query)
          },
          render: createSuggestionRender,
          command: ({ editor, range, props }: any) => {
            const nodeAfter = editor.view.state.selection.$to.nodeAfter
            const overrideSpace = nodeAfter?.text?.startsWith(' ')

            if (overrideSpace) {
              range.to += 1
            }

            editor
              .chain()
              .focus()
              .insertContentAt(range, [
                {
                  type: 'reactMention',
                  attrs: {
                    id: props.id,
                    label: props.label,
                    actionId: props.actionId,
                    actionName: props.actionName,
                    class: 'mention mention--result',
                    replaceResultChar,
                  },
                },
                {
                  type: 'text',
                  text: ' ',
                },
              ])
              .run()

            window.getSelection()?.collapseToEnd()
          },
        })
      }

      return suggestionArray
    }, [
      enabledTriggers?.actions,
      enabledTriggers?.results,
      enabledTriggers?.variables,
      availableActions,
      createSuggestionRender,
    ])
    const parsedContent = (() => {
      if (!content) return {}
      try {
        return JSON.parse(content)
      } catch (error) {
        return content
      }
    })()
    const editor = useEditor(
      {
        immediatelyRender: false,
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
          Mention.configure({
            deleteTriggerWithBackspace: true,
            HTMLAttributes: {
              class: 'mention',
            },
            renderText({ node }) {
              return node.attrs.label ?? node.attrs.id
            },
            suggestions,
          }),
        ],
        content: parsedContent,
        editorProps: {
          attributes: {
            class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-3 ${className}`,
            'data-placeholder': placeholder,
          },
        },
        onUpdate: ({ editor }) => {
          if (editor) {
            const jsonContent = JSON.stringify(editor.getJSON())
            onUpdate(jsonContent)
          }
        },
      },
      [JSON.stringify(availableActions)]
    )

    useImperativeHandle(ref, () => ({
      editor,
      removeMentionsById: (id: string) => {
        if (!editor) return

        const { tr } = editor.state
        const mentionsToRemove: { pos: number; nodeSize: number }[] = []
        editor.state.doc.descendants((node, pos) => {
          if (node.type.name === 'reactMention' && node.attrs.id === id) {
            mentionsToRemove.push({ pos, nodeSize: node.nodeSize })
          }
        })

        mentionsToRemove.reverse().forEach(({ pos, nodeSize }) => {
          tr.delete(pos, pos + nodeSize)
        })

        if (tr.docChanged) {
          editor.view.dispatch(tr)
        }
      },
      updateMentionById: (id: string, newLabel: string) => {
        if (!editor) return

        const { tr } = editor.state
        let hasUpdates = false

        editor.state.doc.descendants((node, pos) => {
          if (node.type.name === 'reactMention' && node.attrs.id === id) {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              label: newLabel,
            })
            hasUpdates = true
          }
        })

        if (hasUpdates) {
          editor.view.dispatch(tr)
        }
      },
      removeAllMentionsByActionId: (actionId: string) => {
        if (!editor) return

        const { tr } = editor.state
        const mentionsToRemove: { pos: number; nodeSize: number }[] = []

        editor.state.doc.descendants((node, pos) => {
          if (
            node.type.name === 'reactMention' &&
            node.attrs.actionId === actionId
          ) {
            mentionsToRemove.push({ pos, nodeSize: node.nodeSize })
          }
        })

        mentionsToRemove.reverse().forEach(({ pos, nodeSize }) => {
          tr.delete(pos, pos + nodeSize)
        })

        if (tr.docChanged) {
          editor.view.dispatch(tr)
        }
      },
    }))

    if (!editor) {
      return null
    }

    return (
      <div className="rich-text-editor w-full">
        <EditorContent
          placeholder={placeholder}
          editor={editor}
          className="min-h-[120px] border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white transition-all duration-200"
        />
      </div>
    )
  }
)

RichTextEditor.displayName = 'RichTextEditor'

export default RichTextEditor
