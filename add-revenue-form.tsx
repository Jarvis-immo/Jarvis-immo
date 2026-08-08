'use client'

import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { formatEuro, useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function AddRevenueForm() {
  const { addRevenue, manualRevenues } = useStore()
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [justAdded, setJustAdded] = useState(false)

  const parsed = Number.parseFloat(amount.replace(',', '.'))
  const valid = Number.isFinite(parsed) && parsed > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    addRevenue(parsed, label)
    setLabel('')
    setAmount('')
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1600)
  }

  return (
    <section className="rounded-2xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border">
      <h2 className="text-sm font-semibold">Ajouter un revenu</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Caution, régularisation de charges, revenu divers…
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-3 flex flex-col gap-2.5 sm:flex-row"
      >
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Libellé (ex. Caution Appt 2A)"
          className="min-w-0 flex-1 rounded-xl bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
        />
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Montant €"
          className="w-full rounded-xl bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-primary sm:w-36"
        />
        <button
          type="submit"
          disabled={!valid}
          className={cn(
            'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
            justAdded
              ? 'bg-success text-success-foreground'
              : 'bg-primary text-primary-foreground hover:bg-primary/90',
            !valid && !justAdded && 'cursor-not-allowed opacity-50',
          )}
        >
          {justAdded ? (
            <>
              <Check className="size-4" />
              Ajouté
            </>
          ) : (
            <>
              <Plus className="size-4" />
              Ajouter
            </>
          )}
        </button>
      </form>

      {manualRevenues.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {manualRevenues.slice(0, 4).map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-sm"
            >
              <span className="truncate text-foreground">{r.label}</span>
              <span className="shrink-0 font-semibold text-success">
                +{formatEuro(r.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
