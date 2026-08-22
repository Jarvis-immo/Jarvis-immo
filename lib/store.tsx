'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  Building,
  Doc,
  Expense,
  Intervention,
  ManualRevenue,
  Payment,
  Task,
  Tenant,
  Unit,
  WorkItem,
} from './types'
import {
  CURRENT_PERIOD,
  INITIAL_TREASURY,
  PREV_MONTH_EXPENSES,
  SIM_TODAY,
  generateSeed,
} from './seed'

export type Stats = {
  revenuMois: number
  /** Revenus manuels du mois (hors loyers) */
  revenuAutresMois: number
  attenduMois: number
  impayes: number
  nbPaye: number
  nbRetard: number
  nbAttente: number
  occupied: number
  totalUnits: number
  occupancyRate: number
  treasury: number
  nbImmeubles: number
  nbAppartements: number
  nbGarages: number
  depensesMois: number
  resultatMois: number
  depensesDeltaPct: number
  /** Marge nette d'exploitation du mois : résultat / revenus (%) */
  rentabilite: number
}

export type NewTenantInput = {
  name: string
  rent: number
  unitId: string
  deposit: number
  guarantee: Tenant['guarantee']
}

export type NewExpenseInput = {
  label: string
  amount: number
  category: Expense['category']
}

export type NewWorkInput = {
  title: string
  cost: number
  priority: WorkItem['priority']
  unitId: string
}

export type NewBuildingInput = {
  name: string
  address: string
  apartments: number
  garages: number
}

type StoreValue = {
  buildings: Building[]
  units: Unit[]
  tenants: Tenant[]
  payments: Payment[]
  work: WorkItem[]
  expenses: Expense[]
  tasks: Task[]
  documents: Doc[]
  interventions: Intervention[]
  manualRevenues: ManualRevenue[]
  treasury: number
  stats: Stats
  collectPayment: (paymentId: string) => void
  toggleWorkStatus: (workId: string) => void
  toggleTask: (taskId: string) => void
  addRevenue: (amount: number, label: string) => void
  addTenant: (input: NewTenantInput) => void
  removeTenant: (tenantId: string) => void
  addExpense: (input: NewExpenseInput) => void
  removeExpense: (expenseId: string) => void
  addWork: (input: NewWorkInput) => void
  removeWork: (workId: string) => void
  addBuilding: (input: NewBuildingInput) => void
  // Sélecteurs
  getUnit: (unitId: string) => Unit | undefined
  getTenant: (tenantId: string) => Tenant | undefined
  getBuilding: (buildingId: string) => Building | undefined
  getTenantByUnit: (unitId: string) => Tenant | undefined
  getCurrentPayment: (tenantId: string) => Payment | undefined
}

const StoreContext = createContext<StoreValue | null>(null)

const seed = generateSeed()

const AVATAR_COLORS = [
  'oklch(0.62 0.19 258)',
  'oklch(0.7 0.16 155)',
  'oklch(0.78 0.15 75)',
  'oklch(0.63 0.21 22)',
  'oklch(0.65 0.19 300)',
  'oklch(0.72 0.13 200)',
]

/** Mois courant sous forme 'Mois AAAA' à partir de SIM_TODAY */
function currentMonthLabel() {
  const [y, m] = SIM_TODAY.split('-').map(Number)
  const label = new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, 1)))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [buildings, setBuildings] = useState<Building[]>(seed.buildings)
  const [units, setUnits] = useState<Unit[]>(seed.units)
  const [tenants, setTenants] = useState<Tenant[]>(seed.tenants)
  const [payments, setPayments] = useState<Payment[]>(seed.payments)
  const [work, setWork] = useState<WorkItem[]>(seed.work)
  const [expenses, setExpenses] = useState<Expense[]>(seed.expenses)
  const [tasks, setTasks] = useState<Task[]>(seed.tasks)
  const [documents] = useState<Doc[]>(seed.documents)
  const [interventions] = useState<Intervention[]>(seed.interventions)
  const [manualRevenues, setManualRevenues] = useState<ManualRevenue[]>([])
  const [treasury, setTreasury] = useState<number>(INITIAL_TREASURY)

  const stats = useMemo<Stats>(() => {
    const monthPayments = payments.filter((p) => p.period === CURRENT_PERIOD)
    const revenuLoyers = monthPayments
      .filter((p) => p.status === 'paye')
      .reduce((s, p) => s + p.amount, 0)
    const revenuAutresMois = manualRevenues
      .filter((r) => r.date.startsWith(CURRENT_PERIOD))
      .reduce((s, r) => s + r.amount, 0)
    const revenuMois = revenuLoyers + revenuAutresMois
    const attenduMois = monthPayments.reduce((s, p) => s + p.amount, 0)
    const impayes = monthPayments
      .filter((p) => p.status !== 'paye')
      .reduce((s, p) => s + p.amount, 0)
    const nbPaye = monthPayments.filter((p) => p.status === 'paye').length
    const nbRetard = monthPayments.filter((p) => p.status === 'retard').length
    const nbAttente = monthPayments.filter((p) => p.status === 'attente').length

    const occupied = units.filter((u) => u.status === 'loue').length
    const totalUnits = units.length

    const depensesMois = expenses
      .filter((e) => e.date.startsWith(CURRENT_PERIOD))
      .reduce((s, e) => s + e.amount, 0)

    return {
      revenuMois,
      revenuAutresMois,
      attenduMois,
      impayes,
      nbPaye,
      nbRetard,
      nbAttente,
      occupied,
      totalUnits,
      occupancyRate: totalUnits ? Math.round((occupied / totalUnits) * 100) : 0,
      treasury,
      nbImmeubles: buildings.length,
      nbAppartements: units.filter((u) => u.kind === 'appartement').length,
      nbGarages: units.filter((u) => u.kind === 'garage').length,
      depensesMois,
      resultatMois: revenuMois - depensesMois,
      rentabilite: revenuMois
        ? Math.round(((revenuMois - depensesMois) / revenuMois) * 100)
        : 0,
      depensesDeltaPct: PREV_MONTH_EXPENSES
        ? Math.round(
            ((depensesMois - PREV_MONTH_EXPENSES) / PREV_MONTH_EXPENSES) * 100 *
              10,
          ) / 10
        : 0,
    }
  }, [payments, units, buildings, treasury, expenses, manualRevenues])

  const value = useMemo<StoreValue>(() => {
    const unitMap = new Map(units.map((u) => [u.id, u]))
    const tenantMap = new Map(tenants.map((t) => [t.id, t]))
    const buildingMap = new Map(buildings.map((b) => [b.id, b]))
    const tenantByUnit = new Map(tenants.map((t) => [t.unitId, t]))

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
      manualRevenues,
      treasury,
      stats,
      collectPayment: (paymentId) =>
        setPayments((prev) => {
          const target = prev.find((p) => p.id === paymentId)
          if (!target || target.status === 'paye') return prev
          setTreasury((t) => t + target.amount)
          const today = new Date().toISOString().slice(0, 10)
          return prev.map((p) =>
            p.id === paymentId
              ? { ...p, status: 'paye', paidDate: today }
              : p,
          )
        }),
      toggleWorkStatus: (workId) =>
        setWork((prev) =>
          prev.map((w) => {
            if (w.id !== workId) return w
            const next =
              w.status === 'a_faire'
                ? 'en_cours'
                : w.status === 'en_cours'
                  ? 'termine'
                  : 'a_faire'
            return { ...w, status: next }
          }),
        ),
      toggleTask: (taskId) =>
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
        ),
      addRevenue: (amount, label) => {
        if (!Number.isFinite(amount) || amount <= 0) return
        const entry: ManualRevenue = {
          id: `mr-${Date.now()}`,
          label: label.trim() || 'Revenu divers',
          amount: Math.round(amount),
          date: SIM_TODAY,
        }
        setManualRevenues((prev) => [entry, ...prev])
        setTreasury((t) => t + entry.amount)
      },
      addTenant: ({ name, rent, unitId, deposit, guarantee }) => {
        const cleanName = name.trim()
        const unit = unitMap.get(unitId)
        if (!cleanName || !unit || rent <= 0) return
        const id = `t-${Date.now()}`
        const tenant: Tenant = {
          id,
          name: cleanName,
          unitId,
          rent: Math.round(rent),
          deposit: guarantee === 'visale' ? 0 : Math.round(deposit),
          since: currentMonthLabel(),
          guarantee,
          avatarColor: AVATAR_COLORS[tenants.length % AVATAR_COLORS.length],
        }
        const payment: Payment = {
          id: `p-${id}`,
          tenantId: id,
          unitId,
          period: CURRENT_PERIOD,
          amount: Math.round(rent),
          dueDate: `${CURRENT_PERIOD}-05`,
          paidDate: null,
          status: 'attente',
        }
        setTenants((prev) => [...prev, tenant])
        setUnits((prev) =>
          prev.map((u) =>
            u.id === unitId ? { ...u, status: 'loue', tenantId: id } : u,
          ),
        )
        setPayments((prev) => [...prev, payment])
      },
      removeTenant: (tenantId) => {
        const tenant = tenantMap.get(tenantId)
        if (!tenant) return
        setUnits((prev) =>
          prev.map((u) =>
            u.id === tenant.unitId
              ? { ...u, status: 'vacant', tenantId: null }
              : u,
          ),
        )
        setPayments((prev) => prev.filter((p) => p.tenantId !== tenantId))
        setTenants((prev) => prev.filter((t) => t.id !== tenantId))
      },
      addExpense: ({ label, amount, category }) => {
        const cleanLabel = label.trim()
        if (!cleanLabel || !Number.isFinite(amount) || amount <= 0) return
        const entry: Expense = {
          id: `ex-${Date.now()}`,
          label: cleanLabel,
          category,
          amount: Math.round(amount),
          date: SIM_TODAY,
          buildingId: null,
          manual: true,
        }
        setExpenses((prev) => [entry, ...prev])
        setTreasury((t) => t - entry.amount)
      },
      removeExpense: (expenseId) => {
        const target = expenses.find((e) => e.id === expenseId)
        if (!target || !target.manual) return
        setExpenses((prev) => prev.filter((e) => e.id !== expenseId))
        setTreasury((t) => t + target.amount)
      },
      addWork: ({ title, cost, priority, unitId }) => {
        const cleanTitle = title.trim()
        if (!cleanTitle || !Number.isFinite(cost) || cost < 0) return
        const entry: WorkItem = {
          id: `w-${Date.now()}`,
          title: cleanTitle,
          unitId,
          priority,
          cost: Math.round(cost),
          status: 'a_faire',
        }
        setWork((prev) => [entry, ...prev])
      },
      removeWork: (workId) =>
        setWork((prev) => prev.filter((w) => w.id !== workId)),
      addBuilding: ({ name, address, apartments, garages }) => {
        const cleanName = name.trim()
        const nbAppts = Math.max(0, Math.floor(apartments))
        const nbGarages = Math.max(0, Math.floor(garages))
        if (!cleanName || nbAppts + nbGarages === 0) return
        const buildingId = `b-${Date.now()}`
        const newUnits: Unit[] = []
        for (let i = 0; i < nbAppts; i++) {
          newUnits.push({
            id: `${buildingId}-a${i + 1}`,
            buildingId,
            kind: 'appartement',
            label: `Appartement ${i + 1}`,
            floor: Math.floor(i / 4) + 1,
            status: 'vacant',
            rent: 750,
            tenantId: null,
          })
        }
        for (let i = 0; i < nbGarages; i++) {
          newUnits.push({
            id: `${buildingId}-g${i + 1}`,
            buildingId,
            kind: 'garage',
            label: `Garage ${i + 1}`,
            floor: 0,
            status: 'vacant',
            rent: 90,
            tenantId: null,
          })
        }
        setBuildings((prev) => [
          ...prev,
          {
            id: buildingId,
            name: cleanName,
            address: address.trim() || 'Adresse à renseigner',
            type: 'immeuble',
          },
        ])
        setUnits((prev) => [...prev, ...newUnits])
      },
      getUnit: (unitId) => unitMap.get(unitId),
      getTenant: (tenantId) => tenantMap.get(tenantId),
      getBuilding: (buildingId) => buildingMap.get(buildingId),
      getTenantByUnit: (unitId) => tenantByUnit.get(unitId),
      getCurrentPayment: (tenantId) =>
        payments.find(
          (p) => p.tenantId === tenantId && p.period === CURRENT_PERIOD,
        ),
    }
  }, [
    buildings,
    units,
    tenants,
    payments,
    work,
    expenses,
    tasks,
    documents,
    interventions,
    manualRevenues,
    treasury,
    stats,
  ])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore doit être utilisé dans StoreProvider')
  return ctx
}

export function formatEuro(n: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n)
}

/** '2026-08-09' -> '9 août' */
export function formatDateShort(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
}

function toUtcDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

/**
 * Libellé relatif par rapport à « aujourd'hui » de la simulation :
 * Aujourd'hui, Demain, un jour de la semaine (< 7 j), sinon la date courte.
 */
export function formatRelativeDay(iso: string) {
  const today = toUtcDate(SIM_TODAY)
  const target = toUtcDate(iso)
  const diff = Math.round(
    (target.getTime() - today.getTime()) / 86_400_000,
  )
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Demain'
  if (diff === -1) return 'Hier'
  if (diff > 1 && diff < 7) {
    const label = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      timeZone: 'UTC',
    }).format(target)
    return label.charAt(0).toUpperCase() + label.slice(1)
  }
  return formatDateShort(iso)
}
