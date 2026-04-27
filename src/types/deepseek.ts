export type ChatRole = 'system' | 'user' | 'assistant'

export type ChatMessage = {
  role: ChatRole
  content: string
}

export type PdfDraft = {
  title: string
  filename: string
  paragraphs: string[]
}

export type DeepSeekChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}
