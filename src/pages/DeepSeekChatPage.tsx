import { useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { decidePdfToolCall } from '../services/deepseekApi'
import { streamAssistantReply } from '../services/deepseekStream'
import type { ChatMessage } from '../types/deepseek'
import { generateSimplePdf } from '../utils/pdf'
import './DeepSeekChatPage.css'

function DeepSeekChatPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const streamChatResponse = async (nextMessages: ChatMessage[], assistantIndex: number) => {
    await streamAssistantReply(nextMessages, (chunk) => {
      setMessages((prev) =>
        prev.map((message, index) =>
          index === assistantIndex ? { ...message, content: `${message.content}${chunk}` } : message,
        ),
      )
    })
  }

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = input.trim()
    if (!content || isLoading) return

    const nextMessages = [...messages, { role: 'user' as const, content }]
    const assistantIndex = nextMessages.length
    setMessages([...nextMessages, { role: 'assistant', content: '' }])
    setInput('')
    setIsLoading(true)

    try {
      const toolDecision = await decidePdfToolCall(nextMessages)
      if (toolDecision.shouldGeneratePdf) {
        const draft = toolDecision.draft
        const filename = await generateSimplePdf(draft)
        setMessages((prev) =>
          prev.map((message, index) =>
            index === assistantIndex
              ? {
                  ...message,
                  content: `已通过 Tool call 触发 PDF 生成，文件已生成并开始下载：${filename}\n标题：${draft.title}`,
                }
              : message,
          ),
        )
      } else {
        if (toolDecision.assistantText) {
          setMessages((prev) =>
            prev.map((message, index) =>
              index === assistantIndex ? { ...message, content: toolDecision.assistantText } : message,
            ),
          )
        } else {
          await streamChatResponse(nextMessages, assistantIndex)
        }
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
      <p>Agent flow: Tool call decides whether to chat or generate PDF in browser.</p>
      <p>支持自然语言对话，并可按需求自动生成 PDF 文档。</p>

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
          placeholder="Ask DeepSeek... e.g. 'Generate a project summary PDF' (Enter to send)"
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
