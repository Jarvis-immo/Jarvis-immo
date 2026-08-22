'use client'

import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useStore } from '@/lib/store'

export function OccupancyChart() {
  const { buildings, units } = useStore()

  const data = useMemo(
    () =>
      buildings.map((b) => {
        const us = units.filter((u) => u.buildingId === b.id)
        return {
          name: b.name,
          loue: us.filter((u) => u.status === 'loue').length,
          vacant: us.filter((u) => u.status === 'vacant').length,
          travaux: us.filter((u) => u.status === 'travaux').length,
        }
      }),
    [buildings, units],
  )

  return (
    <section className="rounded-2xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border">
      <h2 className="text-sm font-semibold text-foreground">
        Occupation du parc
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Lots par immeuble et par statut
      </p>

      <ChartContainer
        config={{
          loue: { label: 'Loué', color: 'var(--chart-2)' },
          vacant: { label: 'Vacant', color: 'var(--chart-3)' },
          travaux: { label: 'Travaux', color: 'var(--chart-4)' },
        }}
        className="mt-3 h-[220px] w-full"
      >
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-xs"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            className="text-xs"
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="loue" stackId="a" fill="var(--color-loue)" radius={[0, 0, 4, 4]} />
          <Bar dataKey="vacant" stackId="a" fill="var(--color-vacant)" />
          <Bar dataKey="travaux" stackId="a" fill="var(--color-travaux)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>

      <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {[
          { label: 'Loué', color: 'var(--chart-2)' },
          { label: 'Vacant', color: 'var(--chart-3)' },
          { label: 'Travaux', color: 'var(--chart-4)' },
        ].map((d) => (
          <li key={d.label} className="flex items-center gap-1.5 text-xs">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: d.color }}
              aria-hidden
            />
            <span className="text-muted-foreground">{d.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
