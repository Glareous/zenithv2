import { z } from 'zod'

const extractTextFromNodes = (nodes: any[]): string => {
  return nodes
    .map((node) => {
      if (node.type === 'text') return node.text || ''
      if (node.type === 'reactMention')
        return `${node.attrs?.label || node.attrs?.id || ''}`
      if (node.content) return extractTextFromNodes(node.content)
      return ''
    })
    .join('')
}

export const validateJsonContent = (content: string): boolean => {
  if (!content || content.trim() === '' || content === '{}') {
    return true // Allow empty content or empty object
  }

  try {
    // First, try to parse as Tiptap JSON content
    let textToValidate = content
    try {
      const parsedContent = JSON.parse(content)
      if (parsedContent.type && parsedContent.content) {
        // This is Tiptap JSON, extract the text
        textToValidate = extractTextFromNodes(parsedContent.content)
      }
    } catch {
      // If it's not valid JSON, treat it as plain text
      textToValidate = content
    }
    // Skip validation if the extracted text is empty or just whitespace
    if (!textToValidate || textToValidate.trim() === '') {
      return true
    }

    // Try to parse the extracted text as JSON
    JSON.parse(textToValidate)
    return true
  } catch {
    return false
  }
}

export const createJsonValidation = () => {
  return z.string().refine((content) => validateJsonContent(content), {
    message: 'Request body must contain valid JSON format',
  })
}
