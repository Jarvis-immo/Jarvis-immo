'use client'

import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { RentRow } from '@/components/rent-row'
import { PaymentBadge } from '@/components/status-badge'
import { RevenueExpensesChart } from '@/components/charts/revenue-expenses-chart'
import { ExpensesBreakdownChart } from '@/components/charts/expenses-breakdown-chart'
import { AddRevenueForm } from '@/components/add-revenue-form'
import { AddExpenseForm } from '@/components/add-expense-form'
import { formatEuro, useStore } from '@/lib/store'
import { CURRENT_PERIOD, CURRENT_PERIOD_LABEL } from '@/lib/seed'
import { cn } from '@/lib/utils'
import type { PaymentStatus } from '@/lib/types'

const filters: { key: PaymentStatus | 'tous'; label: string }[] = [
  { key: 'tous', label: 'Tous' },
  { key: 'retard', label: 'En retard' },
  { key: 'attente', label: 'En attente' },
  { key: 'paye', label: 'Payés' },
]

export function FinancesView() {
  const {
    payments,
    stats,
    getTenant,
    getUnit,
    getBuilding,
    collectPayment,
  } = useStore()
  const [filter, setFilter] = useState<PaymentStatus | 'tous'>('tous')

  const monthPayments = useMemo(
    () => payments.filter((p) => p.period === CURRENT_PERIOD),
    [payments],
  )

  const list = useMemo(
    () =>
      monthPayments
        .filter((p) => filter === 'tous' || p.status === filter)
        .sort((a, b) => {
          const order = { retard: 0, attente: 1, paye: 2 }
          return order[a.status] - order[b.status]
        }),
    [monthPayments, filter],
  )

  const history = useMemo(
    () =>
      monthPayments
        .filter((p) => p.status === 'paye' && p.paidDate)
        .sort((a, b) => (b.paidDate! > a.paidDate! ? 1 : -1))
        .slice(0, 8),
    [monthPayments],
  )

  return (
    <div className="space-y-5">
      {/* Synthèse */}
      <section className="grid grid-cols-3 gap-3">
        <SummaryCard label="Trésorerie" value={formatEuro(stats.treasury)} tone="foreground" />
        <SummaryCard label="Encaissé" value={formatEuro(stats.revenuMois)} tone="success" />
        <SummaryCard label="Impayés" value={formatEuro(stats.impayes)} tone="destructive" />
      </section>

      {/* Ajouter un revenu / une charge */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <AddRevenueForm />
        <AddExpenseForm />
      </div>

      {/* Graphiques */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <RevenueExpensesChart />
        <ExpensesBreakdownChart />
      </section>

      {/* Filtres */}
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

      {/* Liste des loyers du mois */}
      <section>
        <h2 className="mb-2 text-sm font-semibold">
          Loyers · {CURRENT_PERIOD_LABEL}
        </h2>
        {list.length === 0 ? (
          <p className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-lg shadow-black/20 ring-1 ring-border">
            Aucun loyer dans cette catégorie.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {list.map((p) => {
              const tenant = getTenant(p.tenantId)
              const unit = getUnit(p.unitId)
              const building = unit ? getBuilding(unit.buildingId) : undefined
              if (!tenant || !unit) return null
              return (
                <RentRow
                  key={p.id}
                  name={tenant.name}
                  subtitle={`${unit.label} · ${building?.name ?? ''}`}
                  amount={p.amount}
                  status={p.status}
                  avatarColor={tenant.avatarColor}
                  onCollect={() => collectPayment(p.id)}
                />
              )
            })}
          </ul>
        )}
      </section>

      {/* Historique des encaissements */}
      <section>
        <h2 className="mb-2 text-sm font-semibold">Historique des encaissements</h2>
        {history.length === 0 ? (
          <p className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-lg shadow-black/20 ring-1 ring-border">
            Aucun encaissement enregistré ce mois-ci.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-2xl bg-card shadow-lg shadow-black/20 ring-1 ring-border">
            {history.map((p, i) => {
              const tenant = getTenant(p.tenantId)
              const unit = getUnit(p.unitId)
              if (!tenant || !unit) return null
              return (
                <li
                  key={p.id}
                  className={cn(
                    'flex items-center gap-3 p-3.5',
                    i > 0 && 'border-t border-border',
                  )}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                    <Check className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{tenant.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {unit.label} ·{' '}
                      {new Date(p.paidDate!).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-success">
                    +{formatEuro(p.amount)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'foreground' | 'success' | 'destructive'
}) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 text-lg font-semibold leading-none',
          tone === 'success' && 'text-success',
          tone === 'destructive' && 'text-destructive',
        )}
      >
        {value}
      </p>
    </div>
  )
}
