"use client";

import { motion } from "framer-motion";
import { Plus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCards } from "@/hooks/use-cards";
import { formatCurrency } from "@/lib/format";

const brandColors: Record<string, string> = {
  visa:       "from-blue-600 to-blue-800",
  mastercard: "from-red-600 to-orange-600",
  elo:        "from-yellow-500 to-yellow-700",
  amex:       "from-slate-600 to-slate-800",
  hipercard:  "from-red-700 to-red-900",
  other:      "from-brand-600 to-violet-700",
};

export default function CardsPage() {
  const { data: cards, isLoading } = useCards();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cartões</h1>
          <p className="text-muted-foreground text-sm mt-1">{cards?.length ?? 0} cartões cadastrados</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Novo cartão
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !cards?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CreditCard className="w-14 h-14 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium">Nenhum cartão cadastrado</p>
          <Button className="mt-6 gap-2"><Plus className="w-4 h-4" />Adicionar cartão</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card: any, i: number) => {
            const gradient = brandColors[card.brand ?? "other"];
            const usagePercent = card.limit_amount > 0 ? (card.used_amount / card.limit_amount) * 100 : 0;
            return (
              <motion.div
                key={card.id}
                className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white relative overflow-hidden cursor-pointer`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3 }}
              >
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />
                <div className="relative">
                  <div className="flex justify-between items-start mb-6">
                    <p className="font-semibold text-lg">{card.name}</p>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full uppercase">{card.brand ?? "card"}</span>
                  </div>
                  <p className="font-mono text-sm tracking-widest opacity-80">
                    •••• •••• •••• {card.last_four ?? "0000"}
                  </p>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs opacity-80">
                      <span>Limite usado</span>
                      <span>{formatCurrency(card.used_amount)} / {formatCurrency(card.limit_amount)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-white/70"
                        style={{ width: `${Math.min(100, usagePercent)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}