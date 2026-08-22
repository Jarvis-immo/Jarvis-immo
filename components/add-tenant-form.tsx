'use client'

import { useMemo, useState } from 'react'
import { Check, Plus, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import type { GuaranteeType } from '@/lib/types'

const guaranteeOptions: { value: GuaranteeType; label: string }[] = [
  { value: 'depot', label: 'Dépôt de garantie' },
  { value: 'caf', label: 'Garantie CAF' },
  { value: 'visale', label: 'Garantie Visale' },
]

export function AddTenantForm({ onAdded }: { onAdded?: (id: string) => void }) {
  const { units, getBuilding, addTenant } = useStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [rent, setRent] = useState('')
  const [unitId, setUnitId] = useState('')
  const [guarantee, setGuarantee] = useState<GuaranteeType>('depot')
  const [deposit, setDeposit] = useState('')
  const [justAdded, setJustAdded] = useState(false)

  const vacantUnits = useMemo(
    () =>
      units
        .filter((u) => u.status === 'vacant')
        .sort((a, b) => a.label.localeCompare(b.label, 'fr')),
    [units],
  )

  const canSubmit =
    name.trim().length > 0 && Number(rent) > 0 && unitId.length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    addTenant({
      name,
      rent: Number(rent),
      unitId,
      deposit: guarantee === 'visale' ? 0 : Number(deposit) || Number(rent),
      guarantee,
    })
    setName('')
    setRent('')
    setUnitId('')
    setGuarantee('depot')
    setDeposit('')
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1600)
    onAdded?.(name)
  }

  if (vacantUnits.length === 0 && !open) {
    return null
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-card"
      >
        <UserPlus className="size-4" />
        Ajouter un locataire
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border"
    >
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <UserPlus className="size-4 text-primary" />
          Nouveau locataire
        </h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Annuler
        </button>
      </div>

      {vacantUnits.length === 0 ? (
        <p className="rounded-xl bg-secondary/50 px-3 py-2.5 text-xs text-muted-foreground">
          Aucun lot vacant disponible. Libérez un lot pour ajouter un locataire.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nom du locataire">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Marie Dupont"
                className="input-base"
              />
            </Field>
            <Field label="Loyer mensuel (€)">
              <input
                value={rent}
                onChange={(e) => setRent(e.target.value.replace(/[^0-9]/g, ''))}
                inputMode="numeric"
                placeholder="Ex. 1200"
                className="input-base"
              />
            </Field>
            <Field label="Lot attribué">
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="input-base"
              >
                <option value="">Choisir un lot vacant…</option>
                {vacantUnits.map((u) => {
                  const b = getBuilding(u.buildingId)
                  return (
                    <option key={u.id} value={u.id}>
                      {b?.name} · {u.label}
                    </option>
                  )
                })}
              </select>
            </Field>
            <Field label="Garantie">
              <select
                value={guarantee}
                onChange={(e) =>
                  setGuarantee(e.target.value as GuaranteeType)
                }
                className="input-base"
              >
                {guaranteeOptions.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </Field>
            {guarantee !== 'visale' && (
              <Field label="Montant garantie (€)">
                <input
                  value={deposit}
                  onChange={(e) =>
                    setDeposit(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  inputMode="numeric"
                  placeholder="Par défaut = 1 mois"
                  className="input-base"
                />
              </Field>
            )}
          </div>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl font-medium disabled:opacity-50 sm:w-auto"
          >
            {justAdded ? (
              <span className="flex items-center gap-1.5">
                <Check className="size-4" />
                Ajouté
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Plus className="size-4" />
                Ajouter le locataire
              </span>
            )}
          </Button>
        </>
      )}
    </form>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
