'use client'

import { Wrench, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PriorityBadge, WorkStatusBadge } from '@/components/status-badge'
import { AddWorkForm } from '@/components/add-work-form'
import { formatEuro, useStore } from '@/lib/store'

const priorityOrder = { haute: 0, moyenne: 1, basse: 2 }

export function WorkView() {
  const { work, getUnit, getBuilding, toggleWorkStatus, removeWork } =
    useStore()

  const openCost = work
    .filter((w) => w.status !== 'termine')
    .reduce((s, w) => s + w.cost, 0)

  const sorted = [...work].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
  )

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border">
        <p className="text-sm text-muted-foreground">Coût des travaux en cours</p>
        <p className="mt-1 text-2xl font-semibold">{formatEuro(openCost)}</p>
      </section>

      <AddWorkForm />

      <ul className="space-y-3">
        {sorted.map((w) => {
          const unit = getUnit(w.unitId)
          const building = unit ? getBuilding(unit.buildingId) : undefined
          const done = w.status === 'termine'
          return (
            <li
              key={w.id}
              className="rounded-2xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border"
            >
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary">
                  <Wrench className="size-5 text-warning" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-tight">{w.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {building?.name}
                    {unit ? ` · ${unit.label}` : ''}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={w.priority} />
                    <WorkStatusBadge status={w.status} />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <p className="font-semibold">{formatEuro(w.cost)}</p>
                  <button
                    onClick={() => removeWork(w.id)}
                    aria-label={`Supprimer ${w.title}`}
                    className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => toggleWorkStatus(w.id)}
                className="mt-3 w-full rounded-full"
              >
                {done ? 'Rouvrir' : w.status === 'a_faire' ? 'Démarrer' : 'Marquer terminé'}
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
