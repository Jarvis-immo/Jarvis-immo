'use client'

import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { WorkPriority } from '@/lib/types'

const PRIORITIES: { value: WorkPriority; label: string }[] = [
  { value: 'haute', label: 'Haute' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'basse', label: 'Basse' },
]

export function AddWorkForm() {
  const { addWork, units, getBuilding } = useStore()
  const [title, setTitle] = useState('')
  const [cost, setCost] = useState('')
  const [priority, setPriority] = useState<WorkPriority>('moyenne')
  const [unitId, setUnitId] = useState('')
  const [justAdded, setJustAdded] = useState(false)

  const parsed = Number.parseFloat(cost.replace(',', '.'))
  const valid = title.trim().length > 0 && Number.isFinite(parsed) && parsed >= 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    addWork({ title, cost: parsed, priority, unitId })
    setTitle('')
    setCost('')
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1600)
  }

  return (
    <section className="rounded-2xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border">
      <h2 className="text-sm font-semibold">Ajouter des travaux</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Planifiez une intervention avec son coût estimé.
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2.5">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Intitulé (ex. Réfection toiture)"
          className="w-full rounded-xl bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
        />
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <select
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            className="min-w-0 flex-1 rounded-xl bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-border focus:ring-2 focus:ring-primary"
          >
            <option value="">Lot (optionnel)</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {getBuilding(u.buildingId)?.name} · {u.label}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as WorkPriority)}
            className="rounded-xl bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-border focus:ring-2 focus:ring-primary"
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                Priorité {p.label.toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="Coût estimé €"
            className="min-w-0 flex-1 rounded-xl bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!valid}
            className={cn(
              'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors sm:w-36',
              justAdded
                ? 'bg-success text-success-foreground'
                : 'bg-primary text-primary-foreground hover:bg-primary/90',
              !valid && !justAdded && 'cursor-not-allowed opacity-50',
            )}
          >
            {justAdded ? (
              <>
                <Check className="size-4" />
                Ajoutés
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Ajouter
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  )
}
