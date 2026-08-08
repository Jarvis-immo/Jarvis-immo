import type {
  Building,
  Doc,
  Expense,
  GuaranteeType,
  Intervention,
  Payment,
  PaymentStatus,
  Task,
  Tenant,
  Unit,
  UnitStatus,
  WorkItem,
} from './types'

/** Mois courant de la simulation */
export const CURRENT_PERIOD = '2026-08'
export const CURRENT_PERIOD_LABEL = 'Août 2026'
/** Jour de référence « aujourd'hui » de la simulation (YYYY-MM-DD) */
export const SIM_TODAY = '2026-08-08'
/** Trésorerie de départ (solde cumulé simulé) */
export const INITIAL_TREASURY = 41_800
/** Total des dépenses du mois précédent (pour comparaison) */
export const PREV_MONTH_EXPENSES = 14_020

/**
 * Historique mensuel (revenus encaissés vs dépenses) des mois précédents.
 * Le mois courant est calculé dynamiquement à partir de l'état.
 */
export const MONTHLY_HISTORY: { month: string; revenus: number; depenses: number }[] = [
  { month: 'Mars', revenus: 28_900, depenses: 13_200 },
  { month: 'Avr.', revenus: 30_100, depenses: 15_600 },
  { month: 'Mai', revenus: 29_400, depenses: 12_800 },
  { month: 'Juin', revenus: 31_200, depenses: 16_100 },
  { month: 'Juil.', revenus: 30_600, depenses: 14_020 },
]

// Générateur pseudo-aléatoire déterministe (mulberry32)
function makeRng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const AVATAR_COLORS = [
  'oklch(0.62 0.19 258)',
  'oklch(0.7 0.16 155)',
  'oklch(0.78 0.15 75)',
  'oklch(0.63 0.21 22)',
  'oklch(0.7 0.14 300)',
  'oklch(0.72 0.13 200)',
  'oklch(0.68 0.17 130)',
  'oklch(0.66 0.18 350)',
]

const FIRST_NAMES = [
  'Camille', 'Yanis', 'Sophie', 'Thomas', 'Inès', 'Karim', 'Léa', 'Hugo',
  'Manon', 'Lucas', 'Emma', 'Nathan', 'Chloé', 'Adam', 'Sarah', 'Gabriel',
  'Julie', 'Mehdi', 'Laura', 'Antoine', 'Nadia', 'Paul', 'Fatou', 'Théo',
  'Clara', 'Sofiane', 'Élise', 'Maxime', 'Amina', 'Romain', 'Jade', 'Victor',
  'Lina', 'Samuel', 'Nina', 'Rayan', 'Alice', 'Ethan', 'Zoé', 'Noah',
]

const LAST_NAMES = [
  'Rousseau', 'Benali', 'Marchand', 'Lefèvre', 'Fontaine', 'Haddad', 'Girard',
  'Moreau', 'Lambert', 'Dubois', 'Mercier', 'Bonnet', 'Faure', 'Roche',
  'Perrin', 'Nguyen', 'Barbier', 'Renaud', 'Traoré', 'Colin', 'Leroy',
  'Garnier', 'Chevalier', 'Da Silva', 'Klein', 'Robin', 'Masson', 'Diallo',
  'Guerin', 'Blanc', 'Meyer', 'Lopez', 'Roy', 'Fabre', 'Berger', 'Alves',
]

const SINCE_LABELS = [
  'Janv. 2021', 'Mars 2021', 'Sept. 2021', 'Déc. 2021', 'Févr. 2022',
  'Mai 2022', 'Août 2022', 'Nov. 2022', 'Janv. 2023', 'Avr. 2023',
  'Juil. 2023', 'Oct. 2023', 'Janv. 2024', 'Mai 2024', 'Sept. 2024',
  'Déc. 2024', 'Mars 2025', 'Juin 2025', 'Oct. 2025', 'Janv. 2026',
]

const GUARANTEES: GuaranteeType[] = ['depot', 'caf', 'visale']

export type SeedData = {
  buildings: Building[]
  units: Unit[]
  tenants: Tenant[]
  payments: Payment[]
  work: WorkItem[]
  expenses: Expense[]
  tasks: Task[]
  documents: Doc[]
  interventions: Intervention[]
}

type BuildingSpec = {
  id: string
  name: string
  address: string
  apartments: number
  garages: number
}

const BUILDINGS: BuildingSpec[] = [
  {
    id: 'b1',
    name: 'Le Haussmann',
    address: '18 boulevard Voltaire, Paris 11e',
    apartments: 20,
    garages: 20,
  },
  {
    id: 'b2',
    name: 'Résidence Bellevue',
    address: '42 cours Gambetta, Lyon 3e',
    apartments: 6,
    garages: 16,
  },
]

export function generateSeed(): SeedData {
  const rng = makeRng(20260808)
  const buildings: Building[] = []
  const units: Unit[] = []
  const tenants: Tenant[] = []
  const payments: Payment[] = []
  const work: WorkItem[] = []

  let tenantCount = 0
  let paidThisMonth = 0

  for (const spec of BUILDINGS) {
    buildings.push({
      id: spec.id,
      name: spec.name,
      address: spec.address,
      type: 'immeuble',
    })

    // Appartements
    for (let i = 0; i < spec.apartments; i++) {
      const floor = Math.floor(i / 4) + 1
      const posInFloor = (i % 4) + 1
      const unitId = `${spec.id}-a${i + 1}`
      const rooms = 1 + Math.floor(rng() * 4) // T1..T4
      const baseRent = 560 + rooms * 190 + floor * 25
      const rent = Math.round(baseRent / 10) * 10

      const roll = rng()
      let status: UnitStatus = 'loue'
      if (roll > 0.9) status = 'travaux'
      else if (roll > 0.82) status = 'vacant'

      let tenantId: string | null = null
      if (status === 'loue') {
        tenantId = `t${++tenantCount}`
        const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)]
        const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)]
        const guarantee = GUARANTEES[Math.floor(rng() * GUARANTEES.length)]
        const depositMonths = guarantee === 'visale' ? 0 : rng() > 0.5 ? 2 : 1
        tenants.push({
          id: tenantId,
          name: `${first} ${last}`,
          unitId,
          rent,
          deposit: rent * depositMonths,
          since: SINCE_LABELS[Math.floor(rng() * SINCE_LABELS.length)],
          guarantee,
          avatarColor: AVATAR_COLORS[tenantCount % AVATAR_COLORS.length],
        })

        const { payment, paid } = makePayment(rng, tenantId, unitId, rent)
        payments.push(payment)
        if (paid) paidThisMonth += payment.amount
      }

      units.push({
        id: unitId,
        buildingId: spec.id,
        kind: 'appartement',
        label: `Appt ${floor}${String.fromCharCode(64 + posInFloor)}`,
        floor,
        status,
        rent,
        tenantId,
      })
    }

    // Garages
    for (let i = 0; i < spec.garages; i++) {
      const unitId = `${spec.id}-g${i + 1}`
      const rent = 70 + Math.floor(rng() * 8) * 10 // 70..140
      const roll = rng()
      const status: UnitStatus = roll > 0.78 ? 'vacant' : 'loue'

      let tenantId: string | null = null
      if (status === 'loue') {
        tenantId = `t${++tenantCount}`
        const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)]
        const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)]
        tenants.push({
          id: tenantId,
          name: `${first} ${last}`,
          unitId,
          rent,
          deposit: rent,
          since: SINCE_LABELS[Math.floor(rng() * SINCE_LABELS.length)],
          guarantee: 'depot',
          avatarColor: AVATAR_COLORS[tenantCount % AVATAR_COLORS.length],
        })

        const { payment, paid } = makePayment(rng, tenantId, unitId, rent)
        payments.push(payment)
        if (paid) paidThisMonth += payment.amount
      }

      units.push({
        id: unitId,
        buildingId: spec.id,
        kind: 'garage',
        label: `Garage ${i + 1}`,
        floor: -1,
        status,
        rent,
        tenantId,
      })
    }
  }

  // Travaux liés à des lots existants
  const workSpecs: Array<Omit<WorkItem, 'id' | 'unitId'> & { pick: number }> = [
    { title: 'Réfection salle de bain', priority: 'haute', cost: 4200, status: 'en_cours', pick: 0.9 },
    { title: 'Fuite robinet cuisine', priority: 'moyenne', cost: 180, status: 'a_faire', pick: 0.82 },
    { title: 'Peinture séjour complet', priority: 'basse', cost: 650, status: 'a_faire', pick: 0.3 },
    { title: 'Remplacement chaudière', priority: 'haute', cost: 3100, status: 'en_cours', pick: 0.5 },
    { title: 'Ponçage parquet', priority: 'basse', cost: 480, status: 'termine', pick: 0.15 },
    { title: 'Porte de garage motorisée', priority: 'moyenne', cost: 1250, status: 'a_faire', pick: 0.6 },
  ]
  const travauxUnits = units.filter((u) => u.status === 'travaux')
  workSpecs.forEach((w, idx) => {
    const target =
      travauxUnits[idx % Math.max(travauxUnits.length, 1)] ??
      units[Math.floor(w.pick * units.length)]
    work.push({
      id: `w${idx + 1}`,
      title: w.title,
      unitId: target.id,
      priority: w.priority,
      cost: w.cost,
      status: w.status,
    })
  })

  // Dépenses du mois courant
  const expenses: Expense[] = [
    { id: 'e1', label: 'Facture EDF parties communes', category: 'energie', amount: 1240, date: `${CURRENT_PERIOD}-04`, buildingId: 'b1' },
    { id: 'e2', label: 'Contrat entretien ascenseur', category: 'entretien', amount: 680, date: `${CURRENT_PERIOD}-06`, buildingId: 'b1' },
    { id: 'e3', label: 'Assurance PNO annuelle', category: 'assurance', amount: 2100, date: `${CURRENT_PERIOD}-02`, buildingId: null },
    { id: 'e4', label: 'Devis plomberie Appt 4', category: 'travaux', amount: 4200, date: `${CURRENT_PERIOD}-08`, buildingId: 'b1' },
    { id: 'e5', label: 'Charges de copropriété', category: 'copropriete', amount: 1560, date: `${CURRENT_PERIOD}-05`, buildingId: 'b2' },
    { id: 'e6', label: 'Nettoyage parties communes', category: 'entretien', amount: 420, date: `${CURRENT_PERIOD}-07`, buildingId: 'b2' },
    { id: 'e7', label: 'Taxe foncière (mensualisée)', category: 'taxe', amount: 2640, date: `${CURRENT_PERIOD}-03`, buildingId: null },
  ]

  // Tâches (planning du jour + à venir)
  const tasks: Task[] = [
    { id: 'tk1', label: 'Enduit appartement 4', done: false, due: SIM_TODAY, time: '08:00' },
    { id: 'tk2', label: 'Relancer le locataire de l’Appt 3B', done: false, due: SIM_TODAY, time: '11:00' },
    { id: 'tk3', label: 'Visite appartement 16', done: false, due: SIM_TODAY, time: '14:00' },
    { id: 'tk4', label: 'Signer le devis plomberie Appt 4', done: false, due: `${CURRENT_PERIOD}-11` },
    { id: 'tk5', label: 'Envoyer les quittances du mois', done: true, due: `${CURRENT_PERIOD}-05` },
    { id: 'tk6', label: 'Renouveler l’assurance PNO', done: true, due: `${CURRENT_PERIOD}-02` },
  ]

  // Documents récents
  const documents: Doc[] = [
    { id: 'd1', name: 'Facture EDF - Août 2026', kind: 'facture', date: `${CURRENT_PERIOD}-04`, sizeKb: 210 },
    { id: 'd2', name: 'Devis plomberie Appt 4', kind: 'devis', date: `${CURRENT_PERIOD}-08`, sizeKb: 340 },
    { id: 'd3', name: 'Bail - Appt 2A Le Haussmann', kind: 'bail', date: `${CURRENT_PERIOD}-01`, sizeKb: 512 },
    { id: 'd4', name: 'Quittances Août 2026', kind: 'quittance', date: `${CURRENT_PERIOD}-05`, sizeKb: 96 },
    { id: 'd5', name: 'Attestation assurance PNO', kind: 'assurance', date: `${CURRENT_PERIOD}-02`, sizeKb: 148 },
    { id: 'd6', name: 'Devis climatisation Résidence Bellevue', kind: 'devis', date: `${CURRENT_PERIOD}-07`, sizeKb: 280 },
  ]

  // Interventions planifiées
  const b1a4 = units.find((u) => u.id === 'b1-a4')?.id ?? null
  const b1a16 = units.find((u) => u.id === 'b1-a16')?.id ?? null
  const interventions: Intervention[] = [
    { id: 'iv1', title: 'Réfection salle de bain', unitId: b1a4, date: `${CURRENT_PERIOD}-09`, kind: 'plomberie' },
    { id: 'iv2', title: 'Pose climatisation', unitId: b1a16, date: `${CURRENT_PERIOD}-13`, kind: 'chauffage' },
    { id: 'iv3', title: 'Contrôle électrique annuel', unitId: null, date: `${CURRENT_PERIOD}-18`, kind: 'electricite' },
    { id: 'iv4', title: 'Visite état des lieux Appt 3B', unitId: units.find((u) => u.id === 'b1-a11')?.id ?? null, date: `${CURRENT_PERIOD}-22`, kind: 'visite' },
    { id: 'iv5', title: 'Nettoyage parties communes', unitId: null, date: `${CURRENT_PERIOD}-26`, kind: 'nettoyage' },
  ]

  void paidThisMonth

  return {
    buildings,
    units,
    tenants,
    payments,
    work,
    expenses,
    tasks,
    documents,
    interventions,
  }
}

function makePayment(
  rng: () => number,
  tenantId: string,
  unitId: string,
  amount: number,
): { payment: Payment; paid: boolean } {
  const dueDay = [1, 3, 5, 5, 10][Math.floor(rng() * 5)]
  const roll = rng()
  let status: PaymentStatus = 'paye'
  if (roll > 0.88) status = 'retard'
  else if (roll > 0.72) status = 'attente'

  const paid = status === 'paye'
  const paidDay = String(Math.min(dueDay + Math.floor(rng() * 3), 28)).padStart(2, '0')

  return {
    payment: {
      id: `pay-${unitId}`,
      tenantId,
      unitId,
      period: CURRENT_PERIOD,
      amount,
      dueDate: `${CURRENT_PERIOD}-${String(dueDay).padStart(2, '0')}`,
      paidDate: paid ? `${CURRENT_PERIOD}-${paidDay}` : null,
      status,
    },
    paid,
  }
}
