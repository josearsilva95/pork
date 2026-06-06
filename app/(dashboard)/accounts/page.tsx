"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Wallet, CreditCard, PiggyBank, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/hooks/use-accounts";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, any> = {
  checking: Wallet,
  savings:  PiggyBank,
  wallet:   Wallet,
  cash:     Banknote,
  other:    CreditCard,
};

const typeLabels: Record<string, string> = {
  checking: "Conta Corrente",
  savings:  "Poupança",
  wallet:   "Carteira Digital",
  cash:     "Dinheiro",
  other:    "Outro",
};

export default function AccountsPage() {
  const { data: accounts, isLoading, refetch } = useAccounts();

  const totalBalance = accounts?.reduce((sum, a: any) => sum + Number(a.balance), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Saldo total: <span className="font-mono font-semibold text-foreground">{formatCurrency(totalBalance)}</span>
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nova conta
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 h-36 animate-pulse" />
          ))}
        </div>
      ) : !accounts?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Wallet className="w-14 h-14 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium">Nenhuma conta cadastrada</p>
          <p className="text-muted-foreground text-sm mt-1">Adicione sua primeira conta financeira</p>
          <Button className="mt-6 gap-2">
            <Plus className="w-4 h-4" /> Adicionar conta
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc: any, i: number) => {
            const Icon = typeIcons[acc.type] ?? Wallet;
            return (
              <motion.div
                key={acc.id}
                className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors group cursor-pointer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ background: acc.color ?? "#6366f1" }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {typeLabels[acc.type] ?? acc.type}
                  </span>
                </div>
                <p className="font-medium">{acc.name}</p>
                {acc.bank && <p className="text-xs text-muted-foreground">{acc.bank}</p>}
                <p className="text-2xl font-bold font-mono mt-3">{formatCurrency(acc.balance)}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}