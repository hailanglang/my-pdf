import type { ChatMessage, DeepSeekChatCompletionResponse } from '../types/deepseek'

const baseURL =
  (import.meta.env.VITE_DEEPSEEK_BASE_URL as string | undefined) ?? 'https://api.deepseek.com'
const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined
const model = (import.meta.env.VITE_DEEPSEEK_MODEL as string | undefined) ?? 'deepseek-chat'

const ensureApiKey = () => {
  if (!apiKey) {
    throw new Error('Missing VITE_DEEPSEEK_API_KEY in .env file.')
  }
  return apiKey
}

export const chatCompletion = async (
  messages: ChatMessage[],
  options?: { jsonObject?: boolean },
) => {
  const key = ensureApiKey()
  const payload: Record<string, unknown> = { model, messages }
  if (options?.jsonObject) {
    payload.response_format = { type: 'json_object' }
  }

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`DeepSeek request failed: ${response.status} ${errorText}`)
  }

  return (await response.json()) as DeepSeekChatCompletionResponse
}

export const chatCompletionJson = async <T,>(systemPrompt: string, userPrompt: string): Promise<T> => {
  const data = await chatCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { jsonObject: true },
  )

  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new Error('DeepSeek returned empty response.')
  }

  return JSON.parse(content) as T
}

export const streamChatCompletion = async (messages: ChatMessage[]) => {
  const key = ensureApiKey()
  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model, messages, stream: true }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`DeepSeek request failed: ${response.status} ${errorText}`)
  }

  if (!response.body) {
    throw new Error('Streaming is not supported: empty response body.')
  }

  return response.body
}
