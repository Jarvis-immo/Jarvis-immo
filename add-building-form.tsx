'use client'

import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function AddBuildingForm() {
  const { addBuilding } = useStore()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [apartments, setApartments] = useState('')
  const [garages, setGarages] = useState('')
  const [justAdded, setJustAdded] = useState(false)

  const nbAppts = Number.parseInt(apartments || '0', 10)
  const nbGarages = Number.parseInt(garages || '0', 10)
  const valid =
    name.trim().length > 0 &&
    Number.isFinite(nbAppts) &&
    Number.isFinite(nbGarages) &&
    nbAppts + nbGarages > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    addBuilding({
      name,
      address,
      apartments: nbAppts,
      garages: nbGarages,
    })
    setName('')
    setAddress('')
    setApartments('')
    setGarages('')
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1600)
  }

  return (
    <section className="rounded-2xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border">
      <h2 className="text-sm font-semibold">Ajouter un immeuble</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Créez un immeuble et ses lots vacants, prêts à recevoir des locataires.
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2.5">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de l'immeuble"
          className="w-full rounded-xl bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Adresse (optionnel)"
          className="w-full rounded-xl bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
        />
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={apartments}
            onChange={(e) => setApartments(e.target.value)}
            placeholder="Nb appartements"
            className="min-w-0 flex-1 rounded-xl bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
          />
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={garages}
            onChange={(e) => setGarages(e.target.value)}
            placeholder="Nb garages"
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
                Ajouté
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
