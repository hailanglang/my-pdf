import type { ChatMessage } from '../types/deepseek'
import { streamChatCompletion } from './deepseekApi'

export const streamAssistantReply = async (
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
) => {
  const body = await streamChatCompletion(messages)
  const reader = body.getReader()

  const decoder = new TextDecoder()
  let buffer = ''
  let hasToken = false

  const processEventData = (raw: string) => {
    const dataLine = raw.trim()
    if (!dataLine.startsWith('data:')) return
    const payload = dataLine.slice(5).trim()
    if (!payload || payload === '[DONE]') return

    try {
      const parsed = JSON.parse(payload) as {
        choices?: Array<{
          delta?: { content?: string }
          message?: { content?: string }
        }>
      }
      const token = parsed.choices?.[0]?.delta?.content ?? parsed.choices?.[0]?.message?.content
      if (!token) return
      hasToken = true
      onChunk(token)
    } catch (error) {
      console.warn('Failed to parse SSE payload:', error)
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''

    for (const event of events) {
      const lines = event.split('\n')
      for (const line of lines) {
        processEventData(line)
      }
    }
  }

  if (!hasToken) {
    throw new Error('DeepSeek returned empty stream.')
  }
}
