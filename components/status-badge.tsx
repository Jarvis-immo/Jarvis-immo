import { cn } from '@/lib/utils'
import type {
  PaymentStatus,
  UnitStatus,
  WorkPriority,
  WorkStatus,
} from '@/lib/types'

function Pill({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none',
        className,
      )}
    >
      {children}
    </span>
  )
}

function Dot({ className }: { className?: string }) {
  return <span className={cn('size-1.5 rounded-full', className)} />
}

export function UnitBadge({ status }: { status: UnitStatus }) {
  const map = {
    loue: { label: 'Loué', cls: 'bg-success/15 text-success', dot: 'bg-success' },
    vacant: { label: 'Vacant', cls: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
    travaux: { label: 'Travaux', cls: 'bg-warning/15 text-warning', dot: 'bg-warning' },
  }[status]
  return (
    <Pill className={map.cls}>
      <Dot className={map.dot} />
      {map.label}
    </Pill>
  )
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const map = {
    paye: { label: 'Payé', cls: 'bg-success/15 text-success', dot: 'bg-success' },
    retard: { label: 'En retard', cls: 'bg-destructive/15 text-destructive', dot: 'bg-destructive' },
    attente: { label: 'En attente', cls: 'bg-warning/15 text-warning', dot: 'bg-warning' },
  }[status]
  return (
    <Pill className={map.cls}>
      <Dot className={map.dot} />
      {map.label}
    </Pill>
  )
}

export function PriorityBadge({ priority }: { priority: WorkPriority }) {
  const map = {
    haute: { label: 'Haute', cls: 'bg-destructive/15 text-destructive' },
    moyenne: { label: 'Moyenne', cls: 'bg-warning/15 text-warning' },
    basse: { label: 'Basse', cls: 'bg-primary/15 text-primary' },
  }[priority]
  return <Pill className={map.cls}>{map.label}</Pill>
}

export function WorkStatusBadge({ status }: { status: WorkStatus }) {
  const map = {
    a_faire: { label: 'À faire', cls: 'bg-muted text-muted-foreground' },
    en_cours: { label: 'En cours', cls: 'bg-primary/15 text-primary' },
    termine: { label: 'Terminé', cls: 'bg-success/15 text-success' },
  }[status]
  return <Pill className={map.cls}>{map.label}</Pill>
}
