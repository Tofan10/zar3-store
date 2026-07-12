'use client'
import { useState, useRef, useEffect } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string }

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Hey! 👋 Ask me anything about our products — what\'s in stock, prices, or what fits your build.\n\nأهلاً! اسألني عن أي منتج، السعر، أو المتوفر عندنا دلوقتي.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const nextMessages: Msg[] = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: nextMessages.slice(-8).map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'assistant', content: data.reply || data.error || 'Something went wrong, try again.' }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: "Couldn't reach the assistant — check your connection and try again." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes chatPop { from { opacity: 0; transform: translateY(16px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes typingDot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }
        .chat-fab { animation: floatY 3s ease-in-out infinite; }
        .chat-panel { animation: chatPop 0.25s cubic-bezier(0.16,1,0.3,1); }
        .typing-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--muted); animation: typingDot 1.2s ease-in-out infinite; }
      `}</style>

      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="chat-fab"
          aria-label="Chat with AI assistant"
          style={{
            position: 'fixed', bottom: 20, left: 20, zIndex: 200,
            width: 58, height: 58, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
            boxShadow: '0 10px 30px -8px rgba(14,165,233,0.6)',
            fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          💬
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="chat-panel" style={{
          position: 'fixed', bottom: 20, left: 20, zIndex: 200,
          width: 340, maxWidth: 'calc(100vw - 32px)', height: 480, maxHeight: 'calc(100vh - 100px)',
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 24px 60px -12px rgba(0,0,0,0.6)',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0369a1, #0ea5e9)', padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🤖</span>
              <div>
                <div style={{ color: '#fff', fontSize: 13.5, fontWeight: 700 }}>ZAR3 Assistant</div>
                <div style={{ color: '#e0f2fe', fontSize: 10.5 }}>Ask about stock, prices & specs</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
              width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', fontSize: 14,
            }}>✕</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="scrollbar-hide" style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: m.role === 'user' ? 'var(--brand)' : 'var(--brand-50)',
                color: m.role === 'user' ? '#fff' : 'var(--text)',
                borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                padding: '9px 12px', fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div style={{
                alignSelf: 'flex-start', background: 'var(--brand-50)', borderRadius: '12px 12px 12px 2px',
                padding: '11px 14px', display: 'flex', gap: 4,
              }}>
                <span className="typing-dot" style={{ animationDelay: '0s' }} />
                <span className="typing-dot" style={{ animationDelay: '0.15s' }} />
                <span className="typing-dot" style={{ animationDelay: '0.3s' }} />
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--border)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send() }}
              placeholder="Ask about a product..."
              style={{
                flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10,
                padding: '9px 12px', fontSize: 13, color: 'var(--text)', outline: 'none',
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="btn-sky"
              style={{
                border: 'none', borderRadius: 10, padding: '0 16px', fontSize: 13, fontWeight: 600,
                color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}
