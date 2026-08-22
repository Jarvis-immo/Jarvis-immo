'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PaymentBadge } from '@/components/status-badge'
import { formatEuro } from '@/lib/store'
import type { PaymentStatus } from '@/lib/types'

export function RentRow({
  name,
  subtitle,
  amount,
  status,
  avatarColor,
  onCollect,
}: {
  name: string
  subtitle: string
  amount: number
  status: PaymentStatus
  avatarColor: string
  onCollect: () => void
}) {
  const [busy, setBusy] = useState(false)
  const paid = status === 'paye'

  const handleClick = () => {
    if (busy || paid) return // anti double-clic
    setBusy(true)
    onCollect()
  }

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')

  return (
    <li className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-lg shadow-black/20 ring-1 ring-border">
      <span
        className="grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold text-background"
        style={{ backgroundColor: avatarColor }}
        aria-hidden
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold">{formatEuro(amount)}</span>
          <PaymentBadge status={status} />
        </div>
      </div>
      {paid ? (
        <span className="just-paid flex items-center gap-1 rounded-full bg-success/15 px-3 py-1.5 text-xs font-medium text-success">
          <Check className="size-3.5" />
          Encaissé
        </span>
      ) : (
        <Button
          size="sm"
          onClick={handleClick}
          disabled={busy}
          className="rounded-full bg-success font-medium text-success-foreground shadow-md shadow-success/20 hover:bg-success/90 disabled:opacity-70"
        >
          {busy ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              …
            </>
          ) : (
            'Encaisser'
          )}
        </Button>
      )}
    </li>
  )
}
