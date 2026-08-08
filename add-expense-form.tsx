'use client'

import { useState } from 'react'
import { Plus, Check, Trash2 } from 'lucide-react'
import { formatEuro, useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { ExpenseCategory } from '@/lib/types'

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'energie', label: 'Énergie' },
  { value: 'entretien', label: 'Entretien' },
  { value: 'assurance', label: 'Assurance' },
  { value: 'taxe', label: 'Taxe' },
  { value: 'copropriete', label: 'Copropriété' },
  { value: 'travaux', label: 'Travaux' },
]

export function AddExpenseForm() {
  const { addExpense, removeExpense, expenses } = useStore()
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('entretien')
  const [justAdded, setJustAdded] = useState(false)

  const parsed = Number.parseFloat(amount.replace(',', '.'))
  const valid = label.trim().length > 0 && Number.isFinite(parsed) && parsed > 0

  const manualExpenses = expenses.filter((e) => e.manual)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    addExpense({ label, amount: parsed, category })
    setLabel('')
    setAmount('')
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1600)
  }

  return (
    <section className="rounded-2xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border">
      <h2 className="text-sm font-semibold">Ajouter une charge</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Eau, EDF, assurance, taxe… déduite du résultat du mois.
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2.5">
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Type (ex. Facture EDF)"
            className="min-w-0 flex-1 rounded-xl bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="rounded-xl bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-border focus:ring-2 focus:ring-primary"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
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
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Montant €"
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
                Ajoutée
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

      {manualExpenses.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {manualExpenses.slice(0, 5).map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-sm"
            >
              <span className="truncate text-foreground">{e.label}</span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="font-semibold text-destructive">
                  -{formatEuro(e.amount)}
                </span>
                <button
                  onClick={() => removeExpense(e.id)}
                  aria-label={`Supprimer ${e.label}`}
                  className="grid size-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
