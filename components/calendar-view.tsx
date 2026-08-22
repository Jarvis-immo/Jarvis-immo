'use client'

import {
  Droplet,
  Zap,
  Flame,
  ClipboardCheck,
  Sparkles,
} from 'lucide-react'
import { formatDateShort, useStore } from '@/lib/store'
import { CURRENT_PERIOD, CURRENT_PERIOD_LABEL } from '@/lib/seed'
import type { InterventionKind } from '@/lib/types'
import { cn } from '@/lib/utils'

const KIND_META: Record<
  InterventionKind,
  { label: string; icon: typeof Droplet; tone: string }
> = {
  plomberie: { label: 'Plomberie', icon: Droplet, tone: 'bg-primary/15 text-primary' },
  electricite: { label: 'Électricité', icon: Zap, tone: 'bg-warning/15 text-warning' },
  chauffage: { label: 'Chauffage', icon: Flame, tone: 'bg-destructive/15 text-destructive' },
  visite: { label: 'Visite', icon: ClipboardCheck, tone: 'bg-success/15 text-success' },
  nettoyage: { label: 'Nettoyage', icon: Sparkles, tone: 'bg-accent/40 text-foreground' },
}

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export function CalendarView() {
  const { interventions, getUnit } = useStore()

  const [year, month] = CURRENT_PERIOD.split('-').map(Number)
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1))
  // getUTCDay: 0 = dimanche -> on veut lundi = 0
  const startOffset = (firstOfMonth.getUTCDay() + 6) % 7
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()

  const byDay = new Map<number, typeof interventions>()
  for (const iv of interventions) {
    if (!iv.date.startsWith(CURRENT_PERIOD)) continue
    const day = Number(iv.date.split('-')[2])
    const list = byDay.get(day) ?? []
    list.push(iv)
    byDay.set(day, list)
  }

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const upcoming = [...interventions]
    .filter((iv) => iv.date.startsWith(CURRENT_PERIOD))
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-5">
      {/* Grille mensuelle */}
      <section className="rounded-3xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border sm:p-5">
        <h2 className="mb-4 text-sm font-semibold capitalize">
          {CURRENT_PERIOD_LABEL}
        </h2>
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((d, i) => (
            <span
              key={i}
              className="pb-2 text-xs font-medium text-muted-foreground"
            >
              {d}
            </span>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <span key={`empty-${i}`} />
            const events = byDay.get(day)
            const has = !!events?.length
            return (
              <div
                key={day}
                className={cn(
                  'flex aspect-square flex-col items-center justify-center rounded-xl text-sm',
                  has
                    ? 'bg-primary/15 font-semibold text-primary'
                    : 'text-muted-foreground',
                )}
              >
                {day}
                {has && (
                  <span className="mt-0.5 flex gap-0.5">
                    {events!.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        className="size-1 rounded-full bg-primary"
                      />
                    ))}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Liste des interventions */}
      <section>
        <h2 className="mb-2 text-sm font-semibold">Interventions planifiées</h2>
        <ul className="space-y-2.5">
          {upcoming.map((iv) => {
            const meta = KIND_META[iv.kind]
            const Icon = meta.icon
            const unit = iv.unitId ? getUnit(iv.unitId) : undefined
            return (
              <li
                key={iv.id}
                className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border"
              >
                <span
                  className={cn(
                    'grid size-10 shrink-0 place-items-center rounded-xl',
                    meta.tone,
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{iv.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {meta.label}
                    {unit ? ` · ${unit.label}` : ''}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                  {formatDateShort(iv.date)}
                </span>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
