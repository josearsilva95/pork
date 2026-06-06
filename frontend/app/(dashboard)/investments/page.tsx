"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInvestments } from "@/hooks/use-investments";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  tesouro_direto: "Tesouro Direto",
  cdb: "CDB",
  lci: "LCI",
  lca: "LCA",
  stocks: "Ações",
  fiis: "FIIs",
  etf: "ETFs",
  crypto: "Cripto",
  fund: "Fundos",
  other: "Outros",
};

export default function InvestmentsPage() {
  const { data: investments, isLoading } = useInvestments();

  const totalInvested = investments?.reduce((sum: number, inv: any) => sum + Number(inv.invested_amount), 0) ?? 0;
  const totalCurrent = investments?.reduce((sum: number, inv: any) => sum + Number(inv.current_value ?? inv.invested_amount), 0) ?? 0;
  const totalReturn = totalCurrent - totalInvested;
  const returnRate = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Investimentos</h1>
          <p className="text-muted-foreground text-sm mt-1">Acompanhe seu portfólio</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Novo investimento
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Investido", value: formatCurrency(totalInvested), color: "text-foreground" },
          { label: "Valor Atual", value: formatCurrency(totalCurrent), color: "text-brand-400" },
          {
            label: "Resultado",
            value: formatCurrency(totalReturn),
            sub: formatPercent(returnRate),
            color: totalReturn >= 0 ? "text-emerald-400" : "text-red-400",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={cn("text-2xl font-bold font-mono mt-1", stat.color)}>{stat.value}</p>
            {stat.sub && <p className={cn("text-sm mt-0.5", stat.color)}>{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Portfolio list */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold">Portfólio</h3>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-muted rounded w-40" />
                  <div className="h-2.5 bg-muted rounded w-24" />
                </div>
                <div className="text-right space-y-1">
                  <div className="h-4 bg-muted rounded w-20" />
                  <div className="h-3 bg-muted rounded w-14" />
                </div>
              </div>
            ))}
          </div>
        ) : !investments?.length ? (
          <div className="py-16 text-center text-muted-foreground">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>Nenhum investimento cadastrado</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {investments.map((inv: any, i: number) => {
              const current = Number(inv.current_value ?? inv.invested_amount);
              const invested = Number(inv.invested_amount);
              const gain = current - invested;
              const rate = invested > 0 ? (gain / invested) * 100 : 0;
              const positive = gain >= 0;

              return (
                <motion.div
                  key={inv.id}
                  className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                    {positive ? (
                      <TrendingUp className="w-5 h-5 text-brand-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{inv.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {typeLabels[inv.type] ?? inv.type}
                      {inv.ticker && ` · ${inv.ticker}`}
                      {inv.broker && ` · ${inv.broker}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold">{formatCurrency(current)}</p>
                    <p className={cn("text-xs font-mono", positive ? "text-emerald-400" : "text-red-400")}>
                      {positive ? "+" : ""}{formatCurrency(gain)} ({formatPercent(rate)})
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}