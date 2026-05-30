import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, Loader } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const SUGERENCIAS = [
  '¿Cuánto vendí hoy?',
  '¿Cómo va la semana?',
  '¿Qué productos están por acabarse?',
  '¿Cuántas citas tengo hoy?',
]

interface Message { role: 'user' | 'assistant'; text: string }

export default function AIAssistant() {
  const [open, setOpen]         = useState(false)
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const ask = async (question: string) => {
    if (!question.trim() || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: question }])
    setLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { question },
      })
      if (error) throw error
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'No pude conectarme ahora. Intenta de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Botón flotante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full text-white flex items-center justify-center shadow-xl active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #e97752, #C4614A)', boxShadow: '0 4px 20px rgba(196,97,74,0.5)' }}
        >
          <Sparkles size={22} />
        </button>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col max-w-lg mx-auto" style={{ background: 'rgba(13,10,8,0.6)', backdropFilter: 'blur(4px)' }}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white flex flex-col"
            style={{ borderRadius: '24px 24px 0 0', maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #e97752, #C4614A)' }}
                >
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm leading-tight">Asistente Carmen</p>
                  <p className="text-xs text-gray-400">Pregúntame lo que necesites</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[120px]">
              {messages.length === 0 && !loading && (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm mb-4">¿En qué puedo ayudarte hoy?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SUGERENCIAS.map(s => (
                      <button
                        key={s}
                        onClick={() => ask(s)}
                        className="text-left text-xs px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-700 font-medium active:scale-95 transition-all leading-snug"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                    style={m.role === 'user' ? { background: 'linear-gradient(135deg, #e97752, #C4614A)' } : {}}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                    <Loader size={14} className="text-gray-400 animate-spin" />
                    <span className="text-xs text-gray-400">Consultando datos...</span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-6 pt-3 border-t border-gray-100 flex-shrink-0">
              <div className="flex gap-2 items-center bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-2 focus-within:border-carmen-400 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && ask(input)}
                  placeholder="Escribe tu pregunta..."
                  className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
                  disabled={loading}
                />
                <button
                  onClick={() => ask(input)}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white disabled:opacity-40 active:scale-95 transition-all flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #e97752, #C4614A)' }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
