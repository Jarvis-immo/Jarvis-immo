'use client'

import {
  ArrowUpRight,
  Banknote,
  Building2,
  CalendarDays,
  Car,
  ClipboardList,
  DoorOpen,
  FileText,
  ListChecks,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Wallet,
  Wrench,
} from 'lucide-react'
import { RentRow } from '@/components/rent-row'
import { RentBreakdownChart } from '@/components/charts/rent-breakdown-chart'
import { OccupancyChart } from '@/components/charts/occupancy-chart'
import { RentTrendChart } from '@/components/charts/rent-trend-chart'
import {
  formatDateShort,
  formatEuro,
  formatRelativeDay,
  useStore,
} from '@/lib/store'
import { CURRENT_PERIOD_LABEL } from '@/lib/seed'
import { cn } from '@/lib/utils'

type Props = {
  onSeePatrimoine: () => void
  onSeeFinances: () => void
  onSeeWork: () => void
  onSeeDocuments: () => void
  onSeeCalendar: () => void
}

export function DashboardView({
  onSeePatrimoine,
  onSeeFinances,
  onSeeWork,
  onSeeDocuments,
  onSeeCalendar,
}: Props) {
  const {
    stats,
    payments,
    work,
    tasks,
    documents,
    interventions,
    getTenant,
    getUnit,
    getBuilding,
    collectPayment,
    toggleTask,
  } = useStore()

  const pct = stats.attenduMois
    ? Math.round((stats.revenuMois / stats.attenduMois) * 100)
    : 0

  const aEncaisser = payments
    .filter((p) => p.status === 'retard' || p.status === 'attente')
    .sort(
      (a, b) =>
        (a.status === 'retard' ? 0 : 1) - (b.status === 'retard' ? 0 : 1),
    )

  const enCours = work.filter((w) => w.status === 'en_cours')
  const prochainesInterventions = [...interventions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3)
  const documentsRecents = [...documents]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
  const tachesActives = [...tasks]
    .sort((a, b) => {
      if (a.done !== b.done) return Number(a.done) - Number(b.done)
      return (a.time ?? '99:99').localeCompare(b.time ?? '99:99')
    })
    .slice(0, 4)

  const kpis = [
    { label: 'Immeubles', value: String(stats.nbImmeubles), icon: Building2, onClick: onSeePatrimoine },
    { label: 'Appartements', value: String(stats.nbAppartements), icon: DoorOpen, onClick: onSeePatrimoine },
    { label: 'Garages', value: String(stats.nbGarages), icon: Car, onClick: onSeePatrimoine },
    { label: 'Trésorerie', value: formatEuro(stats.treasury), icon: Wallet, onClick: onSeeFinances },
  ]

  return (
    <div className="space-y-5">
      {/* Cartes KPI patrimoine */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon
          return (
            <button
              key={k.label}
              onClick={k.onClick}
              className="flex flex-col gap-3 rounded-2xl bg-card p-4 text-left shadow-lg shadow-black/20 ring-1 ring-border transition-colors hover:bg-accent/40"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="truncate text-xl font-semibold tracking-tight leading-none">
                  {k.value}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">{k.label}</p>
              </div>
            </button>
          )
        })}
      </section>

      {/* Encaissements du mois */}
      <section className="rounded-3xl bg-card p-5 shadow-lg shadow-black/20 ring-1 ring-border">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Revenus encaissés · {CURRENT_PERIOD_LABEL}
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-balance">
              {formatEuro(stats.revenuMois)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              sur {formatEuro(stats.attenduMois)} attendus
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
            <TrendingUp className="size-3.5" />
            {pct}%
          </span>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-success transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <Stat label="Payés" value={stats.nbPaye} tone="success" />
          <Stat label="En retard" value={stats.nbRetard} tone="destructive" />
          <Stat label="En attente" value={stats.nbAttente} tone="warning" />
        </div>
      </section>

      {/* Impayés + taux d'occupation */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          onClick={onSeeFinances}
          className="flex items-center justify-between rounded-2xl bg-card p-4 text-left shadow-lg shadow-black/20 ring-1 ring-border transition-colors hover:bg-accent/40"
        >
          <div>
            <p className="text-sm text-muted-foreground">Impayés du mois</p>
            <p className="mt-1 text-2xl font-semibold text-destructive">
              {formatEuro(stats.impayes)}
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.nbRetard + stats.nbAttente} loyer(s) à recouvrer
            </p>
          </div>
          <span className="grid size-10 place-items-center rounded-xl bg-destructive/15 text-destructive">
            <TriangleAlert className="size-5" />
          </span>
        </button>

        <div className="rounded-2xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border">
          <p className="text-sm text-muted-foreground">Taux d’occupation</p>
          <p className="mt-1 text-2xl font-semibold">{stats.occupancyRate}%</p>
          <p className="text-xs text-muted-foreground">
            {stats.occupied} lots occupés sur {stats.totalUnits}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${stats.occupancyRate}%` }}
            />
          </div>
        </div>
      </section>

      {/* À encaisser */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">À encaisser</h2>
          <button
            onClick={onSeeFinances}
            className="flex items-center gap-0.5 text-xs font-medium text-primary"
          >
            Tout voir
            <ArrowUpRight className="size-3.5" />
          </button>
        </div>

        {aEncaisser.length === 0 ? (
          <p className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground ring-1 ring-border">
            Tous les loyers du mois sont encaissés.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {aEncaisser.slice(0, 5).map((p) => {
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

      {/* Graphiques */}
      <RentTrendChart />
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <RentBreakdownChart />
        <OccupancyChart />
      </section>

      {/* Grille de synthèse */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {/* Situation locative */}
        <Box icon={ClipboardList} title="Situation locative">
          <StatusLine tone="success" label="Loyers reçus" value={stats.nbPaye} />
          <StatusLine tone="warning" label="En attente" value={stats.nbAttente} />
          <StatusLine
            tone="destructive"
            label="Impayés"
            value={stats.nbRetard}
          />
        </Box>

        {/* Travaux en cours */}
        <Box
          icon={Wrench}
          title="Travaux en cours"
          action={{ label: 'Gérer', onClick: onSeeWork }}
        >
          {enCours.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun travaux en cours.</p>
          ) : (
            enCours.slice(0, 3).map((w) => {
              const unit = getUnit(w.unitId)
              return (
                <div
                  key={w.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="truncate text-foreground">{w.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {unit?.label ?? '—'}
                  </span>
                </div>
              )
            })
          )}
        </Box>

        {/* Dépenses */}
        <button
          onClick={onSeeFinances}
          className="flex flex-col rounded-2xl bg-card p-4 text-left shadow-lg shadow-black/20 ring-1 ring-border transition-colors hover:bg-accent/40"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-destructive/15 text-destructive">
              <Banknote className="size-4" />
            </span>
            <h3 className="text-sm font-semibold">Dépenses du mois</h3>
          </div>
          <p className="text-2xl font-semibold text-destructive">
            {formatEuro(stats.depensesMois)}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium',
                stats.depensesDeltaPct <= 0
                  ? 'bg-success/15 text-success'
                  : 'bg-destructive/15 text-destructive',
              )}
            >
              {stats.depensesDeltaPct <= 0 ? (
                <TrendingDown className="size-3" />
              ) : (
                <TrendingUp className="size-3" />
              )}
              {stats.depensesDeltaPct > 0 ? '+' : ''}
              {stats.depensesDeltaPct}%
            </span>
            <span className="text-[11px] text-muted-foreground">
              vs mois dernier
            </span>
          </div>
          <p
            className={cn(
              'mt-1.5 text-xs',
              stats.resultatMois >= 0 ? 'text-success' : 'text-destructive',
            )}
          >
            Résultat net : {formatEuro(stats.resultatMois)}
          </p>
        </button>

        {/* Tâches du jour */}
        <Box icon={ListChecks} title="Tâches du jour">
          {tachesActives.map((t) => (
            <label
              key={t.id}
              className="flex cursor-pointer items-center gap-2.5 text-sm"
            >
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggleTask(t.id)}
                className="size-4 shrink-0 rounded border-border bg-secondary text-primary accent-[var(--primary)]"
              />
              {t.time && (
                <span
                  className={cn(
                    'shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium tabular-nums',
                    t.done ? 'text-muted-foreground' : 'text-primary',
                  )}
                >
                  {t.time}
                </span>
              )}
              <span
                className={cn(
                  'truncate',
                  t.done && 'text-muted-foreground line-through',
                )}
              >
                {t.label}
              </span>
            </label>
          ))}
        </Box>

        {/* Documents récents */}
        <Box
          icon={FileText}
          title="Documents récents"
          action={{ label: 'Tout voir', onClick: onSeeDocuments }}
        >
          {documentsRecents.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span className="truncate text-foreground">{d.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDateShort(d.date)}
              </span>
            </div>
          ))}
        </Box>

        {/* Interventions à venir */}
        <Box
          icon={CalendarDays}
          title="Interventions à venir"
          action={{ label: 'Calendrier', onClick: onSeeCalendar }}
        >
          {prochainesInterventions.map((iv) => {
            const unit = iv.unitId ? getUnit(iv.unitId) : undefined
            return (
              <div
                key={iv.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="truncate text-foreground">
                  {iv.title}
                  {unit ? ` · ${unit.label}` : ''}
                </span>
                <span className="shrink-0 text-xs font-medium text-primary">
                  {formatRelativeDay(iv.date)}
                </span>
              </div>
            )
          })}
        </Box>
      </section>
    </div>
  )
}

function Box({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: typeof Wrench
  title: string
  action?: { label: string; onClick: () => void }
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col rounded-2xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary">
            <Icon className="size-4" />
          </span>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="flex items-center gap-0.5 text-xs font-medium text-primary"
          >
            {action.label}
            <ArrowUpRight className="size-3" />
          </button>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function StatusLine({
  tone,
  label,
  value,
}: {
  tone: 'success' | 'warning' | 'destructive'
  label: string
  value: number
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <span
          className={cn(
            'size-2 rounded-full',
            tone === 'success' && 'bg-success',
            tone === 'warning' && 'bg-warning',
            tone === 'destructive' && 'bg-destructive',
          )}
        />
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'success' | 'destructive' | 'warning'
}) {
  return (
    <div className="rounded-2xl bg-secondary/50 p-3">
      <p
        className={cn(
          'text-lg font-semibold',
          tone === 'success' && 'text-success',
          tone === 'destructive' && 'text-destructive',
          tone === 'warning' && 'text-warning',
        )}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
