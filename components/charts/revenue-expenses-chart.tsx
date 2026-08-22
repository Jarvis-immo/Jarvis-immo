'use client'

import { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { formatEuro, useStore } from '@/lib/store'
import { MONTHLY_HISTORY } from '@/lib/seed'

export function RevenueExpensesChart() {
  const { stats } = useStore()

  const data = useMemo(
    () => [
      ...MONTHLY_HISTORY,
      { month: 'Août', revenus: stats.revenuMois, depenses: stats.depensesMois },
    ],
    [stats.revenuMois, stats.depensesMois],
  )

  return (
    <section className="rounded-2xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Revenus vs dépenses
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            6 derniers mois
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Résultat du mois</p>
          <p className="text-sm font-semibold text-success">
            {formatEuro(stats.resultatMois)}
          </p>
        </div>
      </div>

      <ChartContainer
        config={{
          revenus: { label: 'Revenus', color: 'var(--chart-1)' },
          depenses: { label: 'Dépenses', color: 'var(--chart-4)' },
        }}
        className="mt-3 h-[240px] w-full"
      >
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="fillRevenus" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-revenus)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--color-revenus)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="fillDepenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-depenses)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--color-depenses)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
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
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            className="text-xs"
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      {name === 'revenus' ? 'Revenus' : 'Dépenses'}
                    </span>
                    <span className="font-medium tabular-nums text-foreground">
                      {formatEuro(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Area
            dataKey="revenus"
            type="monotone"
            stroke="var(--color-revenus)"
            strokeWidth={2}
            fill="url(#fillRevenus)"
          />
          <Area
            dataKey="depenses"
            type="monotone"
            stroke="var(--color-depenses)"
            strokeWidth={2}
            fill="url(#fillDepenses)"
          />
        </AreaChart>
      </ChartContainer>

      <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {[
          { label: 'Revenus', color: 'var(--chart-1)' },
          { label: 'Dépenses', color: 'var(--chart-4)' },
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
