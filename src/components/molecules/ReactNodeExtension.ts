import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import ReactNodeComponent from './TiptapChip'

export const ReactMentionNode = Node.create({
  name: 'reactMention',

  group: 'inline',

  inline: true,

  selectable: true,

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {}
          }
          return {
            'data-id': attributes.id,
          }
        },
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes) => {
          if (!attributes.label) {
            return {}
          }
          return {
            'data-label': attributes.label,
          }
        },
      },
      class: {
        default: 'mention',
        parseHTML: (element) => element.getAttribute('class') || 'mention',
        renderHTML: (attributes) => {
          return {
            class: attributes.class,
          }
        },
      },
      replaceResultChar: {
        default: false,
        parseHTML: (element) =>
          element.getAttribute('data-replace-result-char') === 'true',
        renderHTML: (attributes) => {
          if (attributes.replaceResultChar) {
            return {
              'data-replace-result-char': 'true',
            }
          }
          return {}
        },
      },
      actionId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-action-id'),
        renderHTML: (attributes) => {
          if (!attributes.actionId) return {}
          return { 'data-action-id': attributes.actionId }
        },
      },
      actionType: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-action-type'),
        renderHTML: (attributes) => {
          if (!attributes.actionType) return {}
          return { 'data-action-type': attributes.actionType }
        },
      },
      actionName: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-action-name'),
        renderHTML: (attributes) => {
          if (!attributes.actionName) return {}
          return { 'data-action-name': attributes.actionName }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'chip-component',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['chip-component', HTMLAttributes]
  },

  addNodeView() {
    // @ts-expect-error - ReactNodeViewRenderer type mismatch with ReactNodeComponent
    return ReactNodeViewRenderer(ReactNodeComponent)
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () =>
        this.editor.commands.command(({ tr, state }) => {
          let isMention = false
          const { selection } = state
          const { empty, anchor } = selection

          if (!empty) {
            return false
          }

          state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
            if (node.type.name === this.name) {
              isMention = true
              tr.insertText('', pos, pos + node.nodeSize)
              return false
            }
          })

          return isMention
        }),
    }
  },
})

export default ReactMentionNode
