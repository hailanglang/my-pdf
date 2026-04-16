export type ChatRole = 'system' | 'user' | 'assistant'

export type ChatMessage = {
  role: ChatRole
  content: string
}

export type IntentResult = {
  intent: 'generate_pdf' | 'chat'
  reason?: string
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
