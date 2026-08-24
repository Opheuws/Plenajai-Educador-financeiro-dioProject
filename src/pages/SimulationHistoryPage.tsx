import { Eye, Goal, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { SimulationRecord } from '@/data/simulation'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { calcMonthlySavings } from '@/utils/simulation'

function formatDate(date?: string) {
  if (!date) return 'Data não informada'

  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

function formatCurrency(value: number) {
  return `R$ ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function SimulationHistoryItem({
  simulation,
  onDelete,
  onOpen,
}: {
  simulation: SimulationRecord
  onDelete: (id: string) => void
  onOpen: (id: string) => void
}) {
  return (
    <article className="bg-card border-border grid gap-5 rounded-2xl border p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:grid-cols-[minmax(180px,1.5fr)_repeat(3,minmax(110px,1fr))_auto] sm:items-center sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="bg-muted-primary text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
          <Goal size={20} />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold">{simulation.goalName}</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            {formatDate(simulation.createdAt)}
          </p>
        </div>
      </div>

      <div>
        <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
          Custo da meta
        </p>
        <p className="mt-1 text-xs font-bold">
          {formatCurrency(
            Number(simulation.goalAmount.replace('.', '').replace(',', '.')) ||
              0,
          )}
        </p>
      </div>
      <div>
        <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
          Prazo
        </p>
        <p className="mt-1 text-xs font-bold">
          {simulation.goalDeadline} meses
        </p>
      </div>
      <div>
        <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
          Economia mensal
        </p>
        <p className="mt-1 text-xs font-bold">
          {formatCurrency(calcMonthlySavings(simulation))}
        </p>
      </div>

      <div className="border-border flex items-center justify-end gap-2 border-t pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
        <button
          type="button"
          aria-label={`Excluir simulação ${simulation.goalName}`}
          title="Excluir simulação"
          className="rounded-lg p-2 text-red-500 transition-opacity hover:opacity-70"
          onClick={() => onDelete(simulation.id)}
        >
          <Trash2 size={17} />
        </button>
        <button
          type="button"
          className="border-border text-foreground hover:bg-secondary-button flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors"
          onClick={() => onOpen(simulation.id)}
        >
          <Eye size={14} />
          Ver detalhes
        </button>
      </div>
    </article>
  )
}

export function SimulationHistoryPage() {
  const navigate = useNavigate()
  const { getAllFormData, deleteSimulation } = useSimulationStorage()
  const [simulations, setSimulations] = useState(() =>
    getAllFormData().reverse(),
  )

  const handleDelete = (id: string) => {
    const simulation = simulations.find((item) => item.id === id)
    if (
      !simulation ||
      !window.confirm(`Excluir a simulação "${simulation.goalName}"?`)
    )
      return

    deleteSimulation(id)
    setSimulations((current) => current.filter((item) => item.id !== id))
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-65px)] max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Histórico de simulações
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Acompanhe o histórico dos seus planos financeiros.
          </p>
        </div>
        <button
          type="button"
          className="bg-primary text-primary-foreground flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-opacity hover:opacity-80"
          onClick={() => void navigate('/')}
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nova simulação</span>
        </button>
      </div>

      <section className="space-y-3">
        {simulations.length > 0 ? (
          simulations.map((simulation) => (
            <SimulationHistoryItem
              key={simulation.id}
              simulation={simulation}
              onDelete={handleDelete}
              onOpen={(id) => void navigate(`/resultado/${id}`)}
            />
          ))
        ) : (
          <div className="border-border bg-card rounded-2xl border border-dashed px-6 py-16 text-center">
            <Goal className="text-muted-foreground mx-auto mb-3" size={28} />
            <h2 className="font-semibold">Nenhuma simulação salva</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Crie sua primeira simulação para acompanhar seu plano por aqui.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
