import type { Building, Payment, Tenant, Unit, WorkItem } from '@/lib/types'
import type { Stats } from '@/lib/store'

export type AlertLevel = 'critique' | 'importante' | 'mineure'

export type Alert = {
  id: string
  level: AlertLevel
  label: string
}

type InsightInput = {
  stats: Stats
  payments: Payment[]
  work: WorkItem[]
  units: Unit[]
  tenants: Tenant[]
  buildings: Building[]
  currentPeriod: string
  getTenant: (id: string) => Tenant | undefined
  getUnit: (id: string) => Unit | undefined
}

/** Dérive la liste d'alertes à partir de l'état courant du patrimoine. */
export function deriveAlerts(input: InsightInput): Alert[] {
  const { payments, work, units, currentPeriod, getTenant, getUnit } = input
  const alerts: Alert[] = []

  // Critiques : loyers en retard
  payments
    .filter((p) => p.period === currentPeriod && p.status === 'retard')
    .forEach((p) => {
      const tenant = getTenant(p.tenantId)
      const unit = getUnit(p.unitId)
      alerts.push({
        id: `al-retard-${p.id}`,
        level: 'critique',
        label: `Loyer en retard — ${tenant?.name ?? 'Locataire'} (${unit?.label ?? '—'})`,
      })
    })

  // Importantes : loyers en attente
  const attente = payments.filter(
    (p) => p.period === currentPeriod && p.status === 'attente',
  )
  if (attente.length > 0) {
    alerts.push({
      id: 'al-attente',
      level: 'importante',
      label: `${attente.length} loyer(s) en attente d'encaissement ce mois-ci`,
    })
  }

  // Importantes : travaux prioritaires à faire
  work
    .filter((w) => w.priority === 'haute' && w.status !== 'termine')
    .forEach((w) => {
      const unit = getUnit(w.unitId)
      alerts.push({
        id: `al-work-${w.id}`,
        level: 'importante',
        label: `Travaux prioritaires — ${w.title}${unit ? ` (${unit.label})` : ''}`,
      })
    })

  // Mineures : lots vacants
  const vacants = units.filter((u) => u.status === 'vacant')
  if (vacants.length > 0) {
    alerts.push({
      id: 'al-vacants',
      level: 'mineure',
      label: `${vacants.length} lot(s) vacant(s) à relouer`,
    })
  }

  const order: Record<AlertLevel, number> = {
    critique: 0,
    importante: 1,
    mineure: 2,
  }
  return alerts.sort((a, b) => order[a.level] - order[b.level])
}

/** Recommandations concises d'Edith, dérivées des données. */
export function deriveRecommendations(input: InsightInput): string[] {
  const { stats, work, units } = input
  const recos: string[] = []

  if (stats.nbRetard > 0) {
    recos.push(
      `Relancer les ${stats.nbRetard} locataire(s) en retard pour récupérer ${formatShort(stats.impayes)} d'impayés.`,
    )
  }
  const vacants = units.filter((u) => u.status === 'vacant').length
  if (vacants > 0) {
    recos.push(
      `${vacants} lot(s) vacant(s) : une remise en location augmenterait le taux d'occupation (actuellement ${stats.occupancyRate}%).`,
    )
  }
  const workToDo = work.filter((w) => w.status === 'a_faire').length
  if (workToDo > 0) {
    recos.push(
      `Planifier les ${workToDo} travaux à démarrer pour éviter l'accumulation.`,
    )
  }
  if (stats.rentabilite < 40 && stats.revenuMois > 0) {
    recos.push(
      `Marge nette à ${stats.rentabilite}% ce mois : surveiller les dépenses pour préserver la rentabilité.`,
    )
  }
  if (recos.length === 0) {
    recos.push('Tout est sous contrôle : aucun point d\'attention ce mois-ci.')
  }
  return recos
}

function formatShort(n: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n)
}
