"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function RecentTransactions() {
  const { data, isLoading } = useTransactions({ page: 1, page_size: 8 });

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold">Transações Recentes</h3>
        <Link href="/transactions" className="text-xs text-primary hover:underline flex items-center gap-1">
          Ver todas <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-muted rounded-xl shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-muted rounded w-32" />
                <div className="h-2.5 bg-muted rounded w-20" />
              </div>
              <div className="h-4 bg-muted rounded w-16" />
            </div>
          ))}
        </div>
      ) : !data?.items?.length ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Nenhuma transação encontrada
        </div>
      ) : (
        <div className="space-y-2">
          {data.items.map((tx: any, i: number) => (
            <motion.div
              key={tx.id}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent transition-colors cursor-pointer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                tx.type === "income" ? "bg-emerald-500/10" : "bg-red-500/10"
              )}>
                {tx.type === "income"
                  ? <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                  : <ArrowDownRight className="w-5 h-5 text-red-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{tx.description}</p>
                <p className="text-xs text-muted-foreground">
                  {tx.category?.name ?? "Sem categoria"} · {formatDate(tx.date)}
                </p>
              </div>
              <span className={cn("font-mono font-semibold text-sm shrink-0", tx.type === "income" ? "text-emerald-400" : "text-red-400")}>
                {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}