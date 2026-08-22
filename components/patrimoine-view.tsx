'use client'

import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Building2,
  Car,
  ChevronRight,
  DoorOpen,
  MapPin,
} from 'lucide-react'
import { UnitBadge } from '@/components/status-badge'
import { AddBuildingForm } from '@/components/add-building-form'
import { formatEuro, useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { UnitStatus } from '@/lib/types'

const filters: { key: UnitStatus | 'tous'; label: string }[] = [
  { key: 'tous', label: 'Tous' },
  { key: 'loue', label: 'Loués' },
  { key: 'vacant', label: 'Vacants' },
  { key: 'travaux', label: 'Travaux' },
]

export function PatrimoineView() {
  const { buildings, units, getTenantByUnit } = useStore()
  const [openId, setOpenId] = useState<string | null>(null)
  const [filter, setFilter] = useState<UnitStatus | 'tous'>('tous')

  const summaries = useMemo(
    () =>
      buildings.map((b) => {
        const bUnits = units.filter((u) => u.buildingId === b.id)
        const appartements = bUnits.filter((u) => u.kind === 'appartement')
        const garages = bUnits.filter((u) => u.kind === 'garage')
        const loue = bUnits.filter((u) => u.status === 'loue').length
        const revenu = bUnits
          .filter((u) => u.status === 'loue')
          .reduce((s, u) => s + u.rent, 0)
        return {
          building: b,
          nbAppartements: appartements.length,
          nbGarages: garages.length,
          loue,
          total: bUnits.length,
          revenu,
        }
      }),
    [buildings, units],
  )

  if (openId) {
    const summary = summaries.find((s) => s.building.id === openId)!
    const bUnits = units
      .filter((u) => u.buildingId === openId)
      .filter((u) => filter === 'tous' || u.status === filter)
      .sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === 'appartement' ? -1 : 1
        return a.label.localeCompare(b.label, 'fr', { numeric: true })
      })

    return (
      <div className="space-y-4">
        <button
          onClick={() => {
            setOpenId(null)
            setFilter('tous')
          }}
          className="flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          <ArrowLeft className="size-4" />
          Retour au patrimoine
        </button>

        <div className="rounded-3xl bg-card p-5 shadow-lg shadow-black/20 ring-1 ring-border">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary/15 text-primary">
              <Building2 className="size-5" />
            </span>
            <div>
              <p className="font-semibold">{summary.building.name}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                {summary.building.address}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <MiniStat label="Appartements" value={summary.nbAppartements} />
            <MiniStat label="Garages" value={summary.nbGarages} />
            <MiniStat label="Revenu / mois" value={formatEuro(summary.revenu)} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition-colors',
                filter === f.key
                  ? 'bg-primary text-primary-foreground ring-primary'
                  : 'bg-card text-muted-foreground ring-border hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <ul className="grid gap-2.5 sm:grid-cols-2">
          {bUnits.map((u) => {
            const tenant = getTenantByUnit(u.id)
            return (
              <li
                key={u.id}
                className="rounded-2xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary">
                      {u.kind === 'appartement' ? (
                        <DoorOpen className="size-4" />
                      ) : (
                        <Car className="size-4" />
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-medium leading-tight">
                        {u.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tenant ? tenant.name : 'Non loué'}
                      </p>
                    </div>
                  </div>
                  <UnitBadge status={u.status} />
                </div>
                <div className="mt-3 border-t border-border pt-2 text-sm">
                  <span className="font-semibold">{formatEuro(u.rent)}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {' '}
                    /mois
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <AddBuildingForm />

      {summaries.map((s) => (
        <button
          key={s.building.id}
          onClick={() => setOpenId(s.building.id)}
          className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-lg shadow-black/20 ring-1 ring-border transition-colors hover:bg-accent/40"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Building2 className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{s.building.name}</p>
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              {s.building.address}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span>{s.nbAppartements} appts</span>
              <span>{s.nbGarages} garages</span>
              <span className="text-success">{s.loue}/{s.total} loués</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{formatEuro(s.revenu)}</p>
            <p className="text-[11px] text-muted-foreground">/mois</p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </button>
      ))}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-secondary/50 p-3">
      <p className="text-base font-semibold leading-none">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
