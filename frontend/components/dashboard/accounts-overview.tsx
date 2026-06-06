"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, ArrowRight } from "lucide-react";
import { useAccounts } from "@/hooks/use-accounts";
import { formatCurrency } from "@/lib/format";

export function AccountsOverview() {
  const { data: accounts, isLoading } = useAccounts();

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Contas</h3>
        <Link href="/accounts" className="text-xs text-primary hover:underline flex items-center gap-1">
          Ver todas <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 animate-pulse">
              <div className="w-7 h-7 bg-muted rounded-lg shrink-0" />
              <div className="flex-1 h-3 bg-muted rounded" />
              <div className="w-16 h-3 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : !accounts?.length ? (
        <Link href="/accounts">
          <button className="w-full flex items-center gap-2 p-2 rounded-xl border border-dashed border-border text-muted-foreground text-sm hover:border-primary/50 hover:text-primary transition-colors">
            <Plus className="w-4 h-4" />
            Adicionar conta
          </button>
        </Link>
      ) : (
        <div className="space-y-2">
          {accounts.slice(0, 4).map((acc: any, i: number) => (
            <motion.div
              key={acc.id}
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.06 }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: acc.color ?? "#6366f1" }}
              >
                {acc.name[0]}
              </div>
              <span className="flex-1 text-sm truncate">{acc.name}</span>
              <span className="font-mono text-sm font-medium">{formatCurrency(acc.balance)}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}