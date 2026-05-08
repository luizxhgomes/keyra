'use client';

import { useId } from 'react';
import { m } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { variants } from '@/lib/motion/tokens';
import { formatCentsBRL } from '@/lib/money';

interface Props {
  monthLabel: string;
  totalMonthCents: number;
  monthDaily: Array<{ day: number; cents: number }>;
  today: number;
}

/**
 * Expense Tracker animado — inspirado em Kodo Img 22 (área roxo) adaptado
 * para paleta KEYRA (cocoa/terracota).
 *
 * Renderiza gráfico de área SVG com gradiente, linha do mês corrente +
 * linha tracejada de "média" (referência visual). Highlight do dia atual
 * via círculo terracota.
 *
 * Sem biblioteca de chart externa — SVG inline + motion path animado.
 */
export function ExpenseTrackerAnimated({
  monthLabel,
  totalMonthCents,
  monthDaily,
  today,
}: Props) {
  const gradId = useId();
  const w = 800;
  const h = 220;
  const max = Math.max(...monthDaily.map((d) => d.cents), 1);
  const days = monthDaily.length;
  const step = w / Math.max(days - 1, 1);

  const points = monthDaily.map((d, i) => ({
    x: i * step,
    y: h - 20 - ((d.cents / max) * (h - 40)),
  }));

  const pathLine = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
  const pathArea = `${pathLine} L ${w} ${h - 20} L 0 ${h - 20} Z`;

  // Média do mês (linha de referência)
  const avg = monthDaily.reduce((acc, d) => acc + d.cents, 0) / Math.max(days, 1);
  const avgY = h - 20 - ((avg / max) * (h - 40));

  // Dia de hoje (highlight)
  const todayPoint = points[today - 1];

  return (
    <Card className="shadow-warm-sm">
      <CardHeader className="pb-3">
        <div className="flex items-baseline justify-between">
          <CardTitle className="font-serif text-xl">
            Despesas em {monthLabel}
          </CardTitle>
          <span className="font-serif text-2xl font-light tabular-nums text-foreground">
            {formatCentsBRL(totalMonthCents)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Linha tracejada = média diária do mês · ponto destacado = hoje (dia{' '}
          {today})
        </p>
      </CardHeader>
      <CardContent>
        <m.svg
          variants={variants.fadeRise}
          initial="hidden"
          animate="visible"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          className="h-56 w-full"
          aria-label={`Despesas diárias de ${monthLabel}`}
        >
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#C26832" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#C26832" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Área */}
          <path d={pathArea} fill={`url(#${gradId})`} />

          {/* Linha de média (tracejada) */}
          <line
            x1={0}
            x2={w}
            y1={avgY}
            y2={avgY}
            stroke="#5A3E26"
            strokeWidth="1"
            strokeDasharray="4 6"
            opacity="0.5"
          />

          {/* Linha de despesas */}
          <path
            d={pathLine}
            fill="none"
            stroke="#C26832"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Highlight de hoje */}
          {todayPoint && (
            <>
              <circle
                cx={todayPoint.x}
                cy={todayPoint.y}
                r="6"
                fill="#FAF6EE"
                stroke="#C26832"
                strokeWidth="2"
              />
              <circle cx={todayPoint.x} cy={todayPoint.y} r="2" fill="#C26832" />
            </>
          )}

          {/* Eixo X — labels esparsos */}
          {[1, Math.ceil(days / 4), Math.ceil(days / 2), Math.ceil((3 * days) / 4), days].map(
            (d) => {
              const x = (d - 1) * step;
              return (
                <text
                  key={`x-${d}`}
                  x={x}
                  y={h - 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#7E5A40"
                >
                  {d}
                </text>
              );
            },
          )}
        </m.svg>
      </CardContent>
    </Card>
  );
}
