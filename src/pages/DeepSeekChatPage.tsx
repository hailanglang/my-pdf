import { useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import './DeepSeekChatPage.css'

type ChatRole = 'user' | 'assistant'

type ChatMessage = {
  role: ChatRole
  content: string
}

function DeepSeekChatPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const apiKey = "sk-c3db2583c8f84c89831b3f71aa918fbd"
  const model = 'deepseek-chat'
  const baseUrl = 'https://api.deepseek.com'

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = input.trim()
    if (!content || isLoading) return

    if (!apiKey) {
      alert('Missing VITE_DEEPSEEK_API_KEY in .env file.')
      return
    }

    const nextMessages = [...messages, { role: 'user' as const, content }]
    const assistantIndex = nextMessages.length
    setMessages([...nextMessages, { role: 'assistant', content: '' }])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          stream: true,
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`DeepSeek request failed: ${response.status} ${errorBody}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Streaming is not supported in this browser response.')
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let hasToken = false

      const appendAssistantText = (chunk: string) => {
        if (!chunk) return
        hasToken = true
        setMessages((prev) =>
          prev.map((message, index) =>
            index === assistantIndex
              ? { ...message, content: `${message.content}${chunk}` }
              : message,
          ),
        )
      }

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
          appendAssistantText(token ?? '')
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
    } catch (error) {
      console.error(error)
      setMessages((prev) =>
        prev.map((message, index) =>
          index === assistantIndex
            ? { ...message, content: '[Error] Failed to get response from DeepSeek.' }
            : message,
        ),
      )
      alert('Failed to get response from DeepSeek.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return

    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      const el = event.currentTarget
      const start = el.selectionStart ?? 0
      const end = el.selectionEnd ?? 0
      const value = el.value
      const next = `${value.slice(0, start)}\n${value.slice(end)}`
      setInput(next)
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 1
      })
      return
    }

    if (event.shiftKey) return

    event.preventDefault()
    formRef.current?.requestSubmit()
  }

  return (
    <main className="chat-container">
      <h2>DeepSeek AI Chat</h2>
      <p>Use API key in .env: VITE_DEEPSEEK_API_KEY=your_key</p>

      <section className="chat-messages">
        {messages.length === 0 ? (
          <p className="empty-message">Start a conversation with DeepSeek.</p>
        ) : (
          messages.map((message, index) => (
            <article key={`${message.role}-${index}`} className={`bubble ${message.role}`}>
              <strong>{message.role === 'user' ? 'You' : 'DeepSeek'}</strong>
              <p>{message.content}</p>
            </article>
          ))
        )}
      </section>

      <form ref={formRef} className="chat-form" onSubmit={sendMessage}>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleTextareaKeyDown}
          placeholder="Ask DeepSeek something... (Enter to send, Ctrl+Enter for new line)"
          rows={4}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </main>
  )
}

export default DeepSeekChatPage
