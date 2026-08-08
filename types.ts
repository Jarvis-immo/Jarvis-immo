export type BuildingType = 'immeuble'

export type Building = {
  id: string
  name: string
  address: string
  type: BuildingType
}

export type UnitKind = 'appartement' | 'garage'
export type UnitStatus = 'loue' | 'vacant' | 'travaux'

export type Unit = {
  id: string
  buildingId: string
  kind: UnitKind
  label: string
  floor: number
  status: UnitStatus
  rent: number
  tenantId: string | null
}

export type GuaranteeType = 'depot' | 'caf' | 'visale'

export type Tenant = {
  id: string
  name: string
  unitId: string
  rent: number
  deposit: number
  since: string
  guarantee: GuaranteeType
  avatarColor: string
}

export type PaymentStatus = 'paye' | 'retard' | 'attente'

export type Payment = {
  id: string
  tenantId: string
  unitId: string
  /** Période au format YYYY-MM */
  period: string
  amount: number
  /** Jour d'échéance du mois */
  dueDate: string
  /** Date d'encaissement (ISO) ou null si non payé */
  paidDate: string | null
  status: PaymentStatus
}

/** Revenu saisi manuellement (hors loyers) : caution, régul de charges, etc. */
export type ManualRevenue = {
  id: string
  label: string
  amount: number
  /** Date au format YYYY-MM-DD */
  date: string
}

export type WorkPriority = 'basse' | 'moyenne' | 'haute'
export type WorkStatus = 'a_faire' | 'en_cours' | 'termine'

export type WorkItem = {
  id: string
  title: string
  unitId: string
  priority: WorkPriority
  cost: number
  status: WorkStatus
}

export type ExpenseCategory =
  | 'energie'
  | 'entretien'
  | 'assurance'
  | 'taxe'
  | 'copropriete'
  | 'travaux'

export type Expense = {
  id: string
  label: string
  category: ExpenseCategory
  amount: number
  /** Date au format YYYY-MM-DD */
  date: string
  buildingId: string | null
  /** true si saisie manuellement par l'utilisateur (supprimable) */
  manual?: boolean
}

export type Task = {
  id: string
  label: string
  done: boolean
  /** Date au format YYYY-MM-DD ou null */
  due: string | null
  /** Horaire au format HH:mm (optionnel) */
  time?: string
}

export type DocKind = 'facture' | 'devis' | 'bail' | 'quittance' | 'assurance'

export type Doc = {
  id: string
  name: string
  kind: DocKind
  /** Date au format YYYY-MM-DD */
  date: string
  sizeKb: number
}

export type InterventionKind =
  | 'plomberie'
  | 'electricite'
  | 'chauffage'
  | 'visite'
  | 'nettoyage'

export type Intervention = {
  id: string
  title: string
  unitId: string | null
  /** Date au format YYYY-MM-DD */
  date: string
  kind: InterventionKind
}
