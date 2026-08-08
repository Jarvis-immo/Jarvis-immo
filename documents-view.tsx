'use client'

import { useState } from 'react'
import { FileText, Download } from 'lucide-react'
import { formatDateShort, useStore } from '@/lib/store'
import type { DocKind } from '@/lib/types'
import { cn } from '@/lib/utils'

const KIND_LABELS: Record<DocKind, string> = {
  facture: 'Facture',
  devis: 'Devis',
  bail: 'Bail',
  quittance: 'Quittance',
  assurance: 'Assurance',
}

const KIND_TONES: Record<DocKind, string> = {
  facture: 'bg-primary/15 text-primary',
  devis: 'bg-warning/15 text-warning',
  bail: 'bg-success/15 text-success',
  quittance: 'bg-accent/40 text-foreground',
  assurance: 'bg-destructive/15 text-destructive',
}

const FILTERS: { key: DocKind | 'tous'; label: string }[] = [
  { key: 'tous', label: 'Tous' },
  { key: 'facture', label: 'Factures' },
  { key: 'devis', label: 'Devis' },
  { key: 'bail', label: 'Baux' },
  { key: 'quittance', label: 'Quittances' },
  { key: 'assurance', label: 'Assurances' },
]

export function DocumentsView() {
  const { documents } = useStore()
  const [filter, setFilter] = useState<DocKind | 'tous'>('tous')

  const filtered = [...documents]
    .filter((d) => filter === 'tous' || d.kind === filter)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              filter === f.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground ring-1 ring-border hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="space-y-2.5">
        {filtered.map((d) => (
          <li
            key={d.id}
            className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <FileText className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{d.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDateShort(d.date)} · {Math.round(d.sizeKb)} Ko
              </p>
            </div>
            <span
              className={cn(
                'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
                KIND_TONES[d.kind],
              )}
            >
              {KIND_LABELS[d.kind]}
            </span>
            <button
              type="button"
              aria-label={`Télécharger ${d.name}`}
              className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground transition-colors hover:text-foreground"
            >
              <Download className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
