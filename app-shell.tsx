'use client'

import { useState } from 'react'
import {
  Building2,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Landmark,
  Users,
  Wrench,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StoreProvider } from '@/lib/store'
import { DashboardView } from '@/components/dashboard-view'
import { PatrimoineView } from '@/components/patrimoine-view'
import { TenantsView } from '@/components/tenants-view'
import { FinancesView } from '@/components/finances-view'
import { WorkView } from '@/components/work-view'
import { DocumentsView } from '@/components/documents-view'
import { CalendarView } from '@/components/calendar-view'
import { LiveClock } from '@/components/live-clock'

type Tab =
  | 'dashboard'
  | 'patrimoine'
  | 'tenants'
  | 'finances'
  | 'work'
  | 'documents'
  | 'calendar'

const nav: { key: Tab; label: string; short: string; icon: typeof Home }[] = [
  { key: 'dashboard', label: 'Tableau', short: 'Tableau', icon: LayoutDashboard },
  { key: 'patrimoine', label: 'Patrimoine', short: 'Biens', icon: Building2 },
  { key: 'tenants', label: 'Locataires', short: 'Locataires', icon: Users },
  { key: 'finances', label: 'Finances', short: 'Finances', icon: Landmark },
  { key: 'work', label: 'Travaux', short: 'Travaux', icon: Wrench },
  { key: 'documents', label: 'Documents', short: 'Docs', icon: FileText },
  { key: 'calendar', label: 'Calendrier', short: 'Agenda', icon: CalendarDays },
]

const titles: Record<Tab, string> = {
  dashboard: 'Tableau de bord',
  patrimoine: 'Patrimoine',
  tenants: 'Locataires',
  finances: 'Finances',
  work: 'Travaux',
  documents: 'Documents',
  calendar: 'Calendrier',
}

const subtitles: Record<Tab, string> = {
  dashboard: 'Vue d’ensemble de votre parc locatif',
  patrimoine: 'Vos immeubles, appartements et garages',
  tenants: 'Fiches et coordonnées de vos locataires',
  finances: 'Encaissements, impayés et trésorerie',
  work: 'Interventions et travaux en cours',
  documents: 'Factures, devis, baux et quittances',
  calendar: 'Interventions et rendez-vous planifiés',
}

export function AppShell() {
  const [tab, setTab] = useState<Tab>('dashboard')

  return (
    <StoreProvider>
      <div className="mx-auto flex min-h-dvh max-w-6xl md:gap-6 md:p-6">
        {/* Navigation latérale (desktop) */}
        <aside className="sticky top-6 hidden h-[calc(100dvh-3rem)] w-60 shrink-0 flex-col rounded-3xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border md:flex">
          <div className="flex items-center gap-2.5 px-2 py-3">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
              <Home className="size-5" />
            </span>
            <div className="leading-tight">
              <span className="block font-semibold">Jarvis Immo</span>
              <span className="block text-xs text-muted-foreground">
                Gestion locative
              </span>
            </div>
          </div>
          <nav className="mt-4 flex flex-col gap-1">
            {nav.map((item) => {
              const Icon = item.icon
              const active = tab === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                      aria-hidden
                    />
                  )}
                  <Icon className="size-5" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="mt-auto flex items-center gap-2.5 rounded-2xl bg-secondary/60 p-3">
            <span
              className="grid size-9 place-items-center rounded-full text-sm font-semibold text-background"
              style={{ backgroundColor: 'oklch(0.62 0.19 258)' }}
              aria-hidden
            >
              GR
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium">Gregory</p>
              <p className="truncate text-xs text-muted-foreground">
                Propriétaire
              </p>
            </div>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 pb-24 md:pb-0">
          <header className="sticky top-0 z-10 bg-background/80 px-5 pb-3 pt-6 backdrop-blur-md md:static md:bg-transparent md:px-0 md:pt-0 md:backdrop-blur-none">
            {tab === 'dashboard' ? (
              <>
                <h1 className="text-2xl font-semibold tracking-tight text-balance">
                  Bonjour Gregory
                </h1>
                <LiveClock />
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">Bonjour Gregory</p>
                <h1 className="text-2xl font-semibold tracking-tight text-balance">
                  {titles[tab]}
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {subtitles[tab]}
                </p>
              </>
            )}
          </header>

          <div key={tab} className="page-enter mt-4 px-5 md:px-0">
            {tab === 'dashboard' && (
              <DashboardView
                onSeePatrimoine={() => setTab('patrimoine')}
                onSeeFinances={() => setTab('finances')}
                onSeeWork={() => setTab('work')}
                onSeeDocuments={() => setTab('documents')}
                onSeeCalendar={() => setTab('calendar')}
              />
            )}
            {tab === 'patrimoine' && <PatrimoineView />}
            {tab === 'tenants' && <TenantsView />}
            {tab === 'finances' && <FinancesView />}
            {tab === 'work' && <WorkView />}
            {tab === 'documents' && <DocumentsView />}
            {tab === 'calendar' && <CalendarView />}
          </div>
        </main>
      </div>

      {/* Barre de navigation inférieure (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-0.5 overflow-x-auto px-2 py-2">
          {nav.map((item) => {
            const Icon = item.icon
            const active = tab === item.key
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-w-14 flex-1 shrink-0 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition-colors',
                  active
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'size-5 transition-transform',
                    active && 'scale-110',
                  )}
                />
                {item.short}
              </button>
            )
          })}
        </div>
      </nav>
    </StoreProvider>
  )
}
