import { useCallback, useEffect, useRef, useState } from 'react'

import { buildAIPrompt, buildQuestionPrompt } from '@/data/aiPrompts'
import type { ConversationMessage, SimulationRecord } from '@/data/simulation'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { askAI, getInsight, type InsightData } from '@/service/aiService'

export const useInsight = (id: string) => {
  const isRequestPending = useRef(false)
  const { getFormData, updateSimulation } = useSimulationStorage()
  const simulation = getFormData(id)

  const [insight, setInsight] = useState<InsightData | null>(() => {
    const simulation = getFormData(id)

    if (simulation?.insight) {
      return simulation.insight
    }

    return null
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversation, setConversation] = useState<ConversationMessage[]>(
    () => simulation?.conversation ?? [],
  )
  const [isAsking, setIsAsking] = useState(false)
  const [questionError, setQuestionError] = useState<string | null>(null)

  // Necessário o uso do useCallback pois temos que colocar essa função
  // Como array de dependências do useEffect
  const fetchInsight = useCallback(
    async (simulationId: string) => {
      const simulation = getFormData(simulationId)

      if (!simulation) {
        setError('Simulação não encontrada.')
        return
      }

      isRequestPending.current = true
      setIsLoading(true)
      setError(null)

      try {
        const prompt = buildAIPrompt(simulation)
        const data = await getInsight(prompt)
        setInsight(data)

        updateSimulation(simulationId, {
          ...simulation,
          insight: data,
        } as SimulationRecord)
      } catch {
        setError('Erro ao gerar o diagnóstico. Tente novamente.')
      } finally {
        isRequestPending.current = false
        setIsLoading(false)
      }
    },
    [getFormData, updateSimulation],
  )

  useEffect(() => {
    // Evita loop infinito de requisições para a API do Gemini
    if (insight || isLoading || error || isRequestPending.current) {
      return
    }

    fetchInsight(id)
  }, [id, insight, isLoading, error, fetchInsight])

  const askQuestion = useCallback(
    async (question: string) => {
      const currentSimulation = getFormData(id)
      const trimmedQuestion = question.trim()

      if (!currentSimulation || !trimmedQuestion || isAsking) {
        return false
      }

      setIsAsking(true)
      setQuestionError(null)
      const userMessage: ConversationMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmedQuestion,
      }
      const nextConversation = [...conversation, userMessage]
      setConversation(nextConversation)

      try {
        const answer = await askAI(
          buildQuestionPrompt(currentSimulation, trimmedQuestion),
        )
        const assistantMessage: ConversationMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: answer,
        }
        const savedConversation = [...nextConversation, assistantMessage]
        setConversation(savedConversation)
        updateSimulation(id, {
          ...currentSimulation,
          conversation: savedConversation,
        } as SimulationRecord)
        return true
      } catch {
        setConversation(conversation)
        setQuestionError(
          'Não foi possível obter uma resposta. Tente novamente.',
        )
        return false
      } finally {
        setIsAsking(false)
      }
    },
    [conversation, getFormData, id, isAsking, updateSimulation],
  )

  return {
    insight,
    isLoading,
    error,
    fetchInsight,
    conversation,
    askQuestion,
    isAsking,
    questionError,
  }
}
