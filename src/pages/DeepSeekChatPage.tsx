import { useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { jsPDF } from 'jspdf'
import './DeepSeekChatPage.css'

type ChatRole = 'user' | 'assistant'

type ChatMessage = {
  role: ChatRole
  content: string
}

type IntentResult = {
  intent: 'generate_pdf' | 'chat'
  reason?: string
}

type PdfDraft = {
  title: string
  filename: string
  paragraphs: string[]
}

function DeepSeekChatPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const apiKey = "sk-c3db2583c8f84c89831b3f71aa918fbd"
  const model = (import.meta.env.VITE_DEEPSEEK_MODEL as string | undefined) ?? 'deepseek-chat'
  const baseUrl =
    (import.meta.env.VITE_DEEPSEEK_BASE_URL as string | undefined) ?? 'https://api.deepseek.com'

  const callDeepSeekJson = async <T,>(systemPrompt: string, userPrompt: string): Promise<T> => {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`DeepSeek request failed: ${response.status} ${errorBody}`)
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) {
      throw new Error('DeepSeek returned empty JSON response.')
    }

    return JSON.parse(content) as T
  }

  const detectIntent = (userText: string) =>
    callDeepSeekJson<IntentResult>(
      [
        'You are an intent classifier.',
        "Output strict JSON with schema: {\"intent\":\"generate_pdf\"|\"chat\",\"reason\":\"...\"}.",
        'Choose generate_pdf only when user explicitly asks to create/export/generate/download a PDF file.',
      ].join(' '),
      userText,
    )

  const draftPdfContent = (userText: string) =>
    callDeepSeekJson<PdfDraft>(
      [
        'You write structured PDF draft data.',
        'Output strict JSON: {"title":"...","filename":"...","paragraphs":["..."]}.',
        'paragraphs must be 3-8 concise strings.',
      ].join(' '),
      userText,
    )

  const generatePdfFile = async (draft: PdfDraft) => {
    const doc = new jsPDF()
    const safeFilename = (draft.filename || 'deepseek-generated').endsWith('.pdf')
      ? draft.filename
      : `${draft.filename || 'deepseek-generated'}.pdf`

    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-99999px'
    container.style.top = '0'
    container.style.width = '720px'
    container.style.padding = '24px'
    container.style.boxSizing = 'border-box'
    container.style.background = '#ffffff'
    container.style.color = '#111827'
    container.style.fontFamily =
      '"Microsoft YaHei","PingFang SC","Hiragino Sans GB","Noto Sans CJK SC",sans-serif'
    container.style.fontSize = '14px'
    container.style.lineHeight = '1.75'

    const titleEl = document.createElement('h1')
    titleEl.textContent = draft.title || 'Generated PDF'
    titleEl.style.fontSize = '28px'
    titleEl.style.margin = '0 0 16px'
    titleEl.style.lineHeight = '1.3'
    container.appendChild(titleEl)

    for (const paragraph of draft.paragraphs) {
      const p = document.createElement('p')
      p.textContent = paragraph
      p.style.margin = '0 0 14px'
      container.appendChild(p)
    }

    document.body.appendChild(container)

    await new Promise<void>((resolve, reject) => {
      let settled = false
      const timer = window.setTimeout(() => {
        if (settled) return
        settled = true
        reject(new Error('PDF render timeout.'))
      }, 20000)

      doc.html(container, {
        x: 12,
        y: 12,
        margin: [12, 12, 12, 12],
        autoPaging: 'text',
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
        callback: () => {
          if (settled) return
          settled = true
          window.clearTimeout(timer)
          resolve()
        },
      })
    }).finally(() => {
      document.body.removeChild(container)
    })

    doc.save(safeFilename)
    return safeFilename
  }

  const streamChatResponse = async (nextMessages: ChatMessage[], assistantIndex: number) => {
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
          index === assistantIndex ? { ...message, content: `${message.content}${chunk}` } : message,
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
  }

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
      const intent = await detectIntent(content)
      if (intent.intent === 'generate_pdf') {
        const draft = await draftPdfContent(content)
        const filename = await generatePdfFile(draft)
        setMessages((prev) =>
          prev.map((message, index) =>
            index === assistantIndex
              ? {
                  ...message,
                  content: `已识别为 PDF 任务，文件已生成并开始下载：${filename}\n标题：${draft.title}`,
                }
              : message,
          ),
        )
      } else {
        await streamChatResponse(nextMessages, assistantIndex)
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
      <p>Agent flow: detect intent, then either chat or generate PDF in browser.</p>

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
