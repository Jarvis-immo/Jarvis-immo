'use client'

import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { formatEuro, useStore } from '@/lib/store'
import { MONTHLY_HISTORY } from '@/lib/seed'

export function RentTrendChart() {
  const { stats } = useStore()

  const data = useMemo(
    () => [
      ...MONTHLY_HISTORY.map((m) => ({ month: m.month, revenus: m.revenus })),
      { month: 'Août', revenus: stats.revenuMois },
    ],
    [stats.revenuMois],
  )

  return (
    <section className="rounded-2xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border">
      <h2 className="text-sm font-semibold text-foreground">
        Loyers encaissés
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Évolution sur 6 mois
      </p>

      <ChartContainer
        config={{ revenus: { label: 'Encaissé', color: 'var(--chart-1)' } }}
        className="mt-3 aspect-[16/9] max-h-[200px] w-full"
      >
        <LineChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-xs"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
            className="text-xs"
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                nameKey="revenus"
                labelKey="month"
                formatter={(value) => (
                  <span className="font-medium tabular-nums text-foreground">
                    {formatEuro(Number(value))}
                  </span>
                )}
              />
            }
          />
          <Line
            dataKey="revenus"
            type="monotone"
            stroke="var(--color-revenus)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: 'var(--color-revenus)' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ChartContainer>
    </section>
  )
}
