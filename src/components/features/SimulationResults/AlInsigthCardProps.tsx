import 'react-loading-skeleton/dist/skeleton.css'

import { LoaderCircle, Send } from 'lucide-react'
import type { FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'

import { useInsight } from '@/hooks/useInsigth'

import { Content } from '../Insights/Content'
import { Error } from '../Insights/Error'

interface AIInsightCardProps {
  simulationId: string
}

export function AIInsightsCard({ simulationId }: AIInsightCardProps) {
  const {
    insight,
    isLoading,
    error,
    fetchInsight,
    conversation,
    askQuestion,
    isAsking,
    questionError,
  } = useInsight(simulationId)
  const [question, setQuestion] = useState('')
  const conversationEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation, isAsking])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (await askQuestion(question)) {
      setQuestion('')
    }
  }

  return (
    <div className="bg-card order-2 rounded-2xl p-6 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.2)] lg:order-1 lg:col-span-2">
      <div className="mb-3 flex items-center gap-1.5">
        <span>✨</span>
        <span className="text-primary text-xs font-semibold tracking-widest uppercase">
          Insight Financeiro Personalizado
        </span>
      </div>

      {isLoading && (
        <div className="flex">
          <Skeleton
            count={10.5}
            baseColor="var(--color-skeleton-base)"
            highlightColor="var(--color-skeleton-highlight)"
            className="mb-3 flex rounded-lg"
            containerClassName="flex-1"
            inline
          />
        </div>
      )}
      {!isLoading && error && (
        <Error
          simulationId={simulationId}
          message={error}
          onRetry={() => {
            fetchInsight(simulationId)
          }}
        />
      )}
      {!isLoading && insight && !error && <Content insight={insight} />}

      {insight && !error && (
        <section className="border-border mt-6 border-t pt-5">
          <div className="mb-4">
            <h2 className="text-foreground text-base font-semibold">
              Converse com seu educador financeiro
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Tire dúvidas sobre esta simulação e seu planejamento.
            </p>
          </div>

          {conversation.length > 0 && (
            <div className="mb-4 max-h-80 space-y-3 overflow-y-auto pr-1">
              {conversation.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <p
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-secondary-button text-foreground rounded-bl-sm'
                    }`}
                  >
                    {message.content}
                  </p>
                </div>
              ))}
              {isAsking && (
                <div className="flex justify-start">
                  <div className="bg-secondary-button text-muted-foreground flex items-center gap-2 rounded-2xl rounded-bl-sm px-4 py-3 text-sm">
                    <LoaderCircle className="animate-spin" size={16} />
                    Educador está pensando...
                  </div>
                </div>
              )}
              <div ref={conversationEndRef} />
            </div>
          )}

          {questionError && (
            <p className="mb-3 text-sm text-red-500" role="alert">
              {questionError}
            </p>
          )}

          <form className="flex items-end gap-2" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="financial-question">
              Faça uma pergunta sobre sua simulação
            </label>
            <textarea
              id="financial-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Faça uma pergunta sobre sua simulação..."
              rows={2}
              disabled={isAsking}
              className="bg-input text-foreground placeholder:text-muted-foreground focus:border-primary border-border min-h-12 flex-1 resize-none rounded-xl border px-3 py-2.5 text-sm transition-colors outline-none focus:ring-1 focus:ring-(--primary) disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isAsking || !question.trim()}
              aria-label="Enviar pergunta"
              title="Enviar pergunta"
              className="bg-primary text-primary-foreground flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAsking ? (
                <LoaderCircle className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
        </section>
      )}
    </div>
  )
}
