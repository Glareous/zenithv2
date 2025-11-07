import { Extension } from '@tiptap/core';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { Mark as ProseMirrorMark } from 'prosemirror-model';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    markdown: {
      setContent: (content: string) => ReturnType;
      getMarkdown: () => string;
    };
  }

  interface Storage {
    markdown: {
      getMarkdown: () => string;
    };
  }
}

declare module '@tiptap/extension-mention' {
  interface MentionOptions<T extends string = string, M = any> {
    renderText?: (
      props: Parameters<NonNullable<MentionOptions<T, M>['renderText']>>[0],
    ) => string;
    renderHTML?: (
      props: Parameters<NonNullable<MentionOptions<T, M>['renderHTML']>>[0],
    ) => HTMLElement | string[] | Record<string, any>;
    suggestion: Omit<SuggestionOptions, 'editor'>;
    deleteTriggerWithBackspace: boolean;
    HTMLAttributes: Record<string, any>;
    parseMarkdown?: {
      match: RegExp;
      parse: (match: RegExpMatchArray) => Record<string, any>;
    };
    toMarkdown?: (
      options: { node: ProseMirrorNode; parent: ProseMirrorNode; index: number; content: string },
    ) => string;
  }
}

declare module 'tiptap-markdown' {
  interface MarkdownOptions {
    html: boolean;
    tightLists: boolean;
    tightListClass: string;
    bulletListMarker: string;
    linkify: boolean;
    breaks: boolean;
    transformPastedText: boolean;
    transformCopiedText: boolean;
  }
  const Markdown: Extension<MarkdownOptions, any>;
  export { Markdown, MarkdownOptions };
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    markdown: {
      toggleStrong: () => ReturnType;
      toggleEmphasis: () => ReturnType;
      toggleCode: () => ReturnType;
    };
  }
}

interface CustomStorage {
  markdown: {
    getMarkdown: () => string;
  };
}

declare module '@tiptap/react' {
  interface EditorContentProps {
    editor: import('@tiptap/core').Editor | null;
  }

  interface UseEditorOutput extends ReturnType<typeof import('@tiptap/react').useEditor> {
    editor: (import('@tiptap/core').Editor & {
      storage: CustomStorage;
    }) | null;
  }
}
