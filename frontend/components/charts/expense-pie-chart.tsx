"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/format";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6"];

interface ExpensePieChartProps {
  data: Array<{ category_id: string; total: number; name?: string }>;
  isLoading?: boolean;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-sm">
      <p className="font-medium">{d.name}</p>
      <p className="font-mono text-primary">{formatCurrency(d.value)}</p>
    </div>
  );
}

export function ExpensePieChart({ data, isLoading }: ExpensePieChartProps) {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 h-72 animate-pulse">
        <div className="h-4 bg-muted rounded w-32 mb-4" />
        <div className="w-36 h-36 bg-muted rounded-full mx-auto mt-8" />
      </div>
    );
  }

  const hasData = data.length > 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 h-full">
      <h3 className="font-semibold mb-4">Despesas por Categoria</h3>
      {!hasData ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Sem dados este mês
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="total"
              nameKey="name"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}