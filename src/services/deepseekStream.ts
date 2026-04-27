import type { ChatMessage } from '../types/deepseek'
import { streamChatCompletion } from './deepseekApi'

export const streamAssistantReply = async (
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
) => {
  const stream = await streamChatCompletion(messages)
  let hasToken = false
  for await (const chunk of stream as AsyncIterable<{
    choices?: Array<{
      delta?: { content?: string | null }
      message?: { content?: string | null }
    }>
  }>) {
    const token = chunk.choices?.[0]?.delta?.content ?? chunk.choices?.[0]?.message?.content
    if (!token) continue
    hasToken = true
    onChunk(token)
  }

  if (!hasToken) {
    throw new Error('DeepSeek returned empty stream.')
  }
}
