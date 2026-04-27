import type { ChatMessage, DeepSeekChatCompletionResponse } from '../types/deepseek'
import OpenAI from 'openai'

const baseURL = 'https://api.deepseek.com'
const apiKey = "sk-b0bb5286fa8e4950b07ddfd8d959f686"
const model = 'deepseek-v4-pro'
const temperature = 0.7
const thinking = { type: 'enabled' as const }
const reasoningEffort = 'high' as const

const ensureApiKey = () => {
  if (!apiKey) {
    throw new Error('Missing DeepSeek API key.')
  }
  return apiKey
}

const client = new OpenAI({
  baseURL,
  apiKey: ensureApiKey(),
  dangerouslyAllowBrowser: true,
})

export const chatCompletion = async (
  messages: ChatMessage[],
  options?: { jsonObject?: boolean },
) => {
  const payload: Record<string, unknown> = {
    model,
    messages,
    temperature,
    stream: false,
    thinking,
    reasoning_effort: reasoningEffort,
  }
  if (options?.jsonObject) {
    payload.response_format = { type: 'json_object' }
  }

  return (await client.chat.completions.create(payload as never)) as DeepSeekChatCompletionResponse
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
  return client.chat.completions.create({
    model,
    messages,
    temperature,
    stream: true,
    thinking,
    reasoning_effort: reasoningEffort,
  } as never)
}
