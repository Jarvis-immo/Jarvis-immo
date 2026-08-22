'use client'

import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { formatEuro, useStore } from '@/lib/store'
import type { ExpenseCategory } from '@/lib/types'

/** Regroupement des catégories en 3 postes de synthèse */
const CATEGORY_TO_POST: Record<ExpenseCategory, 'travaux' | 'charges' | 'divers'> = {
  travaux: 'travaux',
  energie: 'charges',
  entretien: 'charges',
  copropriete: 'charges',
  assurance: 'divers',
  taxe: 'divers',
}

const POSTS: { key: 'travaux' | 'charges' | 'divers'; label: string; color: string }[] = [
  { key: 'travaux', label: 'Travaux', color: 'var(--chart-6)' },
  { key: 'charges', label: 'Charges', color: 'var(--chart-1)' },
  { key: 'divers', label: 'Divers', color: 'var(--chart-3)' },
]

export function ExpensesBreakdownChart() {
  const { expenses } = useStore()

  const data = useMemo(() => {
    const totals: Record<'travaux' | 'charges' | 'divers', number> = {
      travaux: 0,
      charges: 0,
      divers: 0,
    }
    for (const e of expenses) {
      totals[CATEGORY_TO_POST[e.category]] += e.amount
    }
    return POSTS.map((p) => ({
      key: p.key,
      label: p.label,
      value: totals[p.key],
      color: p.color,
    }))
  }, [expenses])

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <section className="rounded-2xl bg-card p-4 shadow-lg shadow-black/20 ring-1 ring-border">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Répartition des dépenses
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Par poste ce mois-ci
          </p>
        </div>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {formatEuro(total)}
        </span>
      </div>

      <ChartContainer
        config={Object.fromEntries(
          data.map((d) => [d.key, { label: d.label, color: d.color }]),
        )}
        className="mt-3 aspect-[4/3] max-h-[240px] w-full"
      >
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
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
            cursor={{ fill: 'var(--secondary)', opacity: 0.4 }}
            content={
              <ChartTooltipContent
                nameKey="label"
                formatter={(value, name) => (
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="text-muted-foreground">{name}</span>
                    <span className="font-medium tabular-nums text-foreground">
                      {formatEuro(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.key} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {data.map((d) => (
          <li key={d.key} className="flex items-center gap-1.5 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
              aria-hidden
            />
            <span className="text-muted-foreground">{d.label}</span>
            <span className="font-medium tabular-nums text-foreground">
              {formatEuro(d.value)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
