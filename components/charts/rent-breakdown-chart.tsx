'use client'

import { useMemo } from 'react'
import { Cell, Label, Pie, PieChart } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useStore } from '@/lib/store'

export function RentBreakdownChart() {
  const { stats } = useStore()

  const data = useMemo(
    () => [
      { key: 'paye', label: 'Payés', value: stats.nbPaye, color: 'var(--chart-2)' },
      { key: 'retard', label: 'En retard', value: stats.nbRetard, color: 'var(--chart-4)' },
      { key: 'attente', label: 'En attente', value: stats.nbAttente, color: 'var(--chart-3)' },
    ],
    [stats.nbPaye, stats.nbRetard, stats.nbAttente],
  )

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <section className="rounded-2xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border">
      <h2 className="text-sm font-semibold text-foreground">
        Répartition des loyers
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Statut des {total} loyers du mois
      </p>

      <ChartContainer
        config={{
          paye: { label: 'Payés', color: 'var(--chart-2)' },
          retard: { label: 'En retard', color: 'var(--chart-4)' },
          attente: { label: 'En attente', color: 'var(--chart-3)' },
        }}
        className="mx-auto mt-2 aspect-square max-h-[220px]"
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={62}
            outerRadius={92}
            strokeWidth={2}
            stroke="var(--card)"
          >
            {data.map((d) => (
              <Cell key={d.key} fill={d.color} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !('cx' in viewBox)) return null
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-2xl font-semibold"
                    >
                      {total}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 20}
                      className="fill-muted-foreground text-xs"
                    >
                      loyers
                    </tspan>
                  </text>
                )
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {data.map((d) => (
          <li key={d.key} className="flex items-center gap-1.5 text-xs">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: d.color }}
              aria-hidden
            />
            <span className="text-muted-foreground">{d.label}</span>
            <span className="font-medium text-foreground">{d.value}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
