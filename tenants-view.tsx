'use client'

import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  DoorOpen,
  Search,
  Shield,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PaymentBadge } from '@/components/status-badge'
import { AddTenantForm } from '@/components/add-tenant-form'
import { formatEuro, useStore } from '@/lib/store'
import { CURRENT_PERIOD_LABEL } from '@/lib/seed'
import type { GuaranteeType } from '@/lib/types'

const guaranteeLabel: Record<GuaranteeType, string> = {
  depot: 'Dépôt de garantie',
  caf: 'Garantie CAF',
  visale: 'Garantie Visale',
}

export function TenantsView() {
  const {
    tenants,
    getUnit,
    getBuilding,
    getCurrentPayment,
    collectPayment,
    removeTenant,
  } = useStore()
  const [openId, setOpenId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const sorted = useMemo(
    () => [...tenants].sort((a, b) => a.name.localeCompare(b.name, 'fr')),
    [tenants],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sorted
    return sorted.filter((t) => t.name.toLowerCase().includes(q))
  }, [sorted, query])

  if (openId) {
    const tenant = tenants.find((t) => t.id === openId)!
    const unit = getUnit(tenant.unitId)
    const building = unit ? getBuilding(unit.buildingId) : undefined
    const payment = getCurrentPayment(tenant.id)
    const paid = payment?.status === 'paye'

    return (
      <div className="space-y-4">
        <button
          onClick={() => {
            setOpenId(null)
            setConfirmDelete(false)
          }}
          className="flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          <ArrowLeft className="size-4" />
          Retour aux locataires
        </button>

        <div className="rounded-3xl bg-card p-5 shadow-lg shadow-black/20 ring-1 ring-border">
          <div className="flex items-center gap-3">
            <span
              className="grid size-14 shrink-0 place-items-center rounded-full text-lg font-semibold text-background"
              style={{ backgroundColor: tenant.avatarColor }}
              aria-hidden
            >
              {tenant.name.split(' ').map((w) => w[0]).join('')}
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{tenant.name}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="size-3" />
                {building?.name} · {unit?.label}
              </p>
              {payment && (
                <div className="mt-1.5">
                  <PaymentBadge status={payment.status} />
                </div>
              )}
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3">
            <Field label="Loyer mensuel" value={formatEuro(tenant.rent)} />
            <Field
              label={guaranteeLabel[tenant.guarantee]}
              value={
                tenant.guarantee === 'visale'
                  ? 'Prise en charge'
                  : formatEuro(tenant.deposit)
              }
              icon={<Shield className="size-3.5" />}
            />
            <Field
              label="Locataire depuis"
              value={tenant.since}
              icon={<CalendarDays className="size-3.5" />}
            />
            <Field
              label="Lot"
              value={unit?.label ?? '—'}
              icon={<DoorOpen className="size-3.5" />}
            />
          </dl>

          {payment && (
            <div className="mt-4 rounded-2xl bg-secondary/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Loyer {CURRENT_PERIOD_LABEL}
                  </p>
                  <p className="text-lg font-semibold">
                    {formatEuro(payment.amount)}
                  </p>
                  {paid && payment.paidDate && (
                    <p className="text-xs text-success">
                      Encaissé le{' '}
                      {new Date(payment.paidDate).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
                {paid ? (
                  <span className="just-paid flex items-center gap-1 rounded-full bg-success/15 px-3 py-1.5 text-sm font-medium text-success">
                    <Check className="size-4" />
                    Encaissé
                  </span>
                ) : (
                  <Button
                    onClick={() => collectPayment(payment.id)}
                    className="rounded-full bg-success font-medium text-success-foreground hover:bg-success/90"
                  >
                    Encaisser
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 border-t border-border pt-4">
            {confirmDelete ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Supprimer {tenant.name} ? Le lot {unit?.label} redeviendra
                  vacant.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-full"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => {
                      removeTenant(tenant.id)
                      setOpenId(null)
                      setConfirmDelete(false)
                    }}
                    className="rounded-full bg-destructive font-medium text-destructive-foreground hover:bg-destructive/90"
                  >
                    <Trash2 className="mr-1.5 size-4" />
                    Confirmer
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-destructive hover:underline"
              >
                <Trash2 className="size-4" />
                Supprimer ce locataire
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-2xl bg-card px-3.5 py-2.5 ring-1 ring-border">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un locataire…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <AddTenantForm onAdded={() => setQuery('')} />

      <p className="text-xs text-muted-foreground">
        {filtered.length} locataire{filtered.length > 1 ? 's' : ''}
      </p>

      <ul className="space-y-2.5">
        {filtered.map((t) => {
          const unit = getUnit(t.unitId)
          const building = unit ? getBuilding(unit.buildingId) : undefined
          const payment = getCurrentPayment(t.id)
          return (
            <li key={t.id}>
              <button
                onClick={() => setOpenId(t.id)}
                className="flex w-full items-center gap-3 rounded-2xl bg-card p-3.5 text-left shadow-lg shadow-black/20 ring-1 ring-border transition-colors hover:bg-accent/40"
              >
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold text-background"
                  style={{ backgroundColor: t.avatarColor }}
                  aria-hidden
                >
                  {t.name.split(' ').map((w) => w[0]).join('')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {building?.name} · {unit?.label}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {payment && <PaymentBadge status={payment.status} />}
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Field({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-xl bg-secondary/50 px-3 py-2.5">
      <dt className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 font-semibold">{value}</dd>
    </div>
  )
}
