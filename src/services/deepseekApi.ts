import type { ChatMessage, DeepSeekChatCompletionResponse, PdfDraft } from '../types/deepseek'
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
    stream: false,
    thinking,
    reasoning_effort: reasoningEffort,
  } as never)
}

export const decidePdfToolCall = async (messages: ChatMessage[]) => {
  const response = await client.chat.completions.create({
    model,
    messages,
    temperature,
    stream: false,
    thinking,
    reasoning_effort: reasoningEffort,
    tools: [
      {
        type: 'function',
        function: {
          name: 'generate_pdf',
          description: '当用户需要时，生成一个可下载的 pdf 文件。',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'PDF title' },
              filename: { type: 'string', description: 'Target PDF filename' },
              paragraphs: {
                type: 'array',
                items: { type: 'string' },
                description: '3-8 concise paragraphs as PDF content',
              },
            },
            required: ['title', 'filename', 'paragraphs'],
            additionalProperties: false,
          },
        },
      },
    ],
    tool_choice: 'auto',
  } as never)

  const message = response.choices?.[0]?.message as
    | {
        content?: string | null
        tool_calls?: Array<{
          type?: string
          function?: { name?: string; arguments?: string }
        }>
      }
    | undefined
  const call = message?.tool_calls?.find(
    (item) => item.type === 'function' && item.function?.name === 'generate_pdf',
  )
  if (!call?.function?.arguments) {
    return {
      shouldGeneratePdf: false as const,
      assistantText: message?.content?.trim() ?? '',
    }
  }

  const draft = JSON.parse(call.function.arguments) as PdfDraft
  return {
    shouldGeneratePdf: true as const,
    draft,
    assistantText: message?.content?.trim() ?? '',
  }
}
