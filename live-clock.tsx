'use client'

import { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const timeFmt = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
})

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function LiveClock() {
  // null au premier rendu (serveur + hydratation) pour éviter tout décalage
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
      <CalendarDays className="size-4" />
      {now ? (
        <span>
          {cap(dateFmt.format(now))} · {timeFmt.format(now)}
        </span>
      ) : (
        <span className="inline-block h-4 w-48 animate-pulse rounded bg-secondary" />
      )}
    </p>
  )
}
