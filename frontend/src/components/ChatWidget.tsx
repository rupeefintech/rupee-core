import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { apiClient } from '../utils/api'

// ── Types ─────────────────────────────────────────────────────────────────────

interface IFSCData {
  ifsc: string; micr: string; bank: string; bankSlug: string | null
  branch: string; address: string; city: string; state: string
  pincode: string; phone: string
  neft: boolean; rtgs: boolean; imps: boolean; upi: boolean
  url: string
}

interface CreditCardData {
  name: string; slug: string; bank: string; bankSlug: string | null
  rating: number | null; annualFee: number; rewardType: string | null
  topBenefit: string | null; url: string
}

interface BranchItem {
  ifsc: string; bank: string; branch: string; city: string; state: string; url: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  text: string
  type?: string
  data?: IFSCData | CreditCardData[] | BranchItem[]
}

interface ApiResponse {
  reply: string
  type?: string
  data?: unknown
}

// ── Markdown renderer ─────────────────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Table row
    if (line.startsWith('|') && line.endsWith('|')) {
      if (/^\|[-| ]+\|$/.test(line)) continue
      const cells = line.split('|').slice(1, -1).map(c => c.trim())
      nodes.push(
        <div key={i} className="flex gap-2 text-xs py-0.5">
          {cells.map((cell, ci) => (
            <span key={ci} className={ci === 0 ? 'text-gray-500 w-32 shrink-0' : 'font-semibold text-gray-800'}>
              {renderInline(cell)}
            </span>
          ))}
        </div>
      )
      continue
    }

    if (line === '') { nodes.push(<div key={i} className="h-1.5" />); continue }

    // Bullet point
    if (line.startsWith('- ')) {
      nodes.push(
        <div key={i} className="flex gap-1.5 items-start text-sm leading-relaxed">
          <span className="text-brand-400 mt-1.5 text-xs">•</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      )
      continue
    }

    // Heading (##)
    if (line.startsWith('## ')) {
      nodes.push(<p key={i} className="font-bold text-sm text-gray-900">{renderInline(line.slice(3))}</p>)
      continue
    }

    nodes.push(<p key={i} className="text-sm leading-relaxed">{renderInline(line)}</p>)
  }

  return nodes
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="font-mono text-xs bg-brand-50 text-brand-700 px-1 py-0.5 rounded">{part.slice(1, -1)}</code>
    return part
  })
}

// ── Sub-components ────────────────────────────────────────────────────────────

function IFSCCard({ data }: { data: IFSCData }) {
  const modes = [
    { label: 'NEFT', on: data.neft },
    { label: 'RTGS', on: data.rtgs },
    { label: 'IMPS', on: data.imps },
    { label: 'UPI',  on: data.upi  },
  ]
  return (
    <div className="mt-2 rounded-xl border border-brand-100 bg-white overflow-hidden text-xs shadow-sm">
      <div className="bg-gradient-to-r from-brand-600 to-violet-500 px-3 py-2">
        <p className="font-mono text-base font-bold text-white tracking-widest">{data.ifsc}</p>
        {data.micr !== '—' && <p className="text-violet-200 text-[10px] mt-0.5">MICR: {data.micr}</p>}
      </div>
      <div className="px-3 py-2 space-y-1">
        <p className="font-semibold text-gray-900">{data.bank}</p>
        <p className="text-gray-500">{data.branch}</p>
        {data.address !== '—' && <p className="text-gray-400 line-clamp-2 text-[11px]">{data.address}</p>}
        <p className="text-gray-500">{[data.city, data.state].filter(v => v !== '—').join(', ')}{data.pincode !== '—' ? ` – ${data.pincode}` : ''}</p>
        <div className="flex gap-1 flex-wrap pt-1">
          {modes.map(m => (
            <span key={m.label} className={`px-1.5 py-0.5 rounded-full font-medium text-[10px] ${m.on ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-300 border border-gray-100'}`}>
              {m.label}
            </span>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-100 px-3 py-2">
        <Link to={data.url} className="text-brand-600 font-semibold text-[11px] hover:text-brand-800 transition-colors">
          View full details →
        </Link>
      </div>
    </div>
  )
}

function CreditCardsGrid({ data }: { data: CreditCardData[] }) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-1.5">
      {data.map(card => (
        <Link key={card.slug} to={card.url} className="group rounded-lg border border-gray-100 bg-white p-2.5 hover:border-brand-200 hover:shadow-sm transition-all">
          <p className="font-semibold text-gray-900 text-[11px] leading-tight line-clamp-2 group-hover:text-brand-700">{card.name}</p>
          <p className="text-gray-400 text-[10px] mt-0.5">{card.bank}</p>
          {card.topBenefit && <p className="text-brand-600 text-[10px] mt-1 line-clamp-2 leading-tight">{card.topBenefit}</p>}
          <div className="flex items-center justify-between mt-1.5">
            {card.rating ? (
              <span className="text-amber-500 text-[10px]">{'★'.repeat(Math.round(card.rating))}{'☆'.repeat(5 - Math.round(card.rating))}</span>
            ) : <span />}
            <span className="text-[10px] text-gray-400">{card.annualFee === 0 ? 'Free' : `₹${card.annualFee}/yr`}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

function BranchList({ data }: { data: BranchItem[] }) {
  return (
    <div className="mt-2 space-y-1">
      {data.map(b => (
        <Link key={b.ifsc} to={b.url} className="group flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2 hover:border-brand-200 hover:bg-brand-50/30 transition-all">
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-semibold text-brand-700">{b.ifsc}</p>
            <p className="text-gray-600 text-[11px] truncate">{b.bank} — {b.branch}</p>
            <p className="text-gray-400 text-[10px]">{b.city}, {b.state}</p>
          </div>
          <span className="text-brand-400 text-xs ml-2 group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      ))}
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-brand-400"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

// ── Main Widget ───────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'HDFC0000001',
  'PIN code 500090',
  'Best credit cards',
  'SIP ₹5000 5yr 12%',
]

export default function ChatWidget() {
  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState<ChatMessage[]>([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [pulsed, setPulsed]       = useState(false)
  const bottomRef                 = useRef<HTMLDivElement>(null)
  const inputRef                  = useRef<HTMLInputElement>(null)

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  const handleOpen = () => {
    setOpen(true)
    setPulsed(true)
  }

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: ChatMessage = {
      id:   crypto.randomUUID(),
      role: 'user',
      text: trimmed,
    }

    setMessages(prev => [...prev.slice(-19), userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await apiClient.post<ApiResponse>('/chat', { message: trimmed })
      const { reply, type, data } = res.data

      const botMsg: ChatMessage = {
        id:   crypto.randomUUID(),
        role: 'bot',
        text: reply,
        type,
        data: data as ChatMessage['data'],
      }
      setMessages(prev => [...prev.slice(-19), botMsg])
    } catch {
      setMessages(prev => [...prev, {
        id:   crypto.randomUUID(),
        role: 'bot',
        text: 'Sorry, something went wrong. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }, [loading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-5 right-5 z-50">
        <AnimatePresence>
          {!open && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={handleOpen}
              className="relative w-14 h-14 rounded-full bg-brand-600 shadow-lg shadow-brand-600/30 hover:bg-brand-700 transition-colors flex items-center justify-center"
              aria-label="Open chat"
            >
              {/* Pulse ring — shown until first click */}
              {!pulsed && (
                <span className="absolute inset-0 rounded-full bg-brand-400 animate-ping opacity-40 pointer-events-none" />
              )}
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed bottom-5 right-5 z-50 w-80 sm:w-96 flex flex-col rounded-2xl bg-white shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden"
            style={{ maxHeight: '520px' }}
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-brand-600 to-violet-600 shrink-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-none">Rupeepedia AI</p>
                <p className="text-violet-200 text-[11px] mt-0.5">Banking assistant</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Close chat"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0 bg-gray-50/50">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-6">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Ask me anything</p>
                  <p className="text-xs text-gray-400 mt-1">IFSC codes, PIN codes, credit cards, SIP</p>
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                    <div className={`rounded-2xl px-3 py-2.5 ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-sm'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                    }`}>
                      <div className={msg.role === 'user' ? 'text-sm' : ''}>
                        {msg.role === 'user'
                          ? <p className="text-sm">{msg.text}</p>
                          : renderMarkdown(msg.text)
                        }
                      </div>
                    </div>

                    {/* Rich data cards */}
                    {msg.type === 'ifsc' && msg.data && (
                      <IFSCCard data={msg.data as IFSCData} />
                    )}
                    {msg.type === 'credit_cards' && msg.data && (
                      <CreditCardsGrid data={msg.data as CreditCardData[]} />
                    )}
                    {msg.type === 'branch_list' && msg.data && (
                      <BranchList data={msg.data as BranchItem[]} />
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm">
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Suggestion Chips — shown when no messages */}
            {messages.length === 0 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-brand-200 text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-100 bg-white shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about IFSC, PIN code, cards, SIP…"
                disabled={loading}
                className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 placeholder-gray-400 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
                aria-label="Send"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
