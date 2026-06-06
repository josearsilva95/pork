"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Filter, Search, ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTransactions } from "@/hooks/use-transactions";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { transactionsApi } from "@/services/api";

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useTransactions({
    page,
    page_size: 20,
    search: search || undefined,
    type: typeFilter,
  });

  async function handleDelete(id: string) {
    try {
      await transactionsApi.delete(id);
      toast.success("Transação removida");
      refetch();
    } catch {
      toast.error("Erro ao remover transação");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transações</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.total ?? 0} transações encontradas
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nova transação
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {["income", "expense", "transfer", "investment"].map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(typeFilter === type ? undefined : type)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm border transition-colors",
              typeFilter === type
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-accent"
            )}
          >
            {{ income: "Receitas", expense: "Despesas", transfer: "Transferências", investment: "Investimentos" }[type]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-muted rounded w-48" />
                  <div className="h-2.5 bg-muted rounded w-32" />
                </div>
                <div className="h-4 bg-muted rounded w-20" />
              </div>
            ))}
          </div>
        ) : !data?.items?.length ? (
          <div className="py-16 text-center text-muted-foreground">
            <p>Nenhuma transação encontrada</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.items.map((tx: any, i: number) => (
              <motion.div
                key={tx.id}
                className="flex items-center gap-4 p-4 hover:bg-accent/50 group transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
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
                  <p className="font-medium truncate">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.category?.name ?? "Sem categoria"} · {formatDate(tx.date)}
                    {!tx.is_paid && <span className="ml-2 text-amber-400">Pendente</span>}
                  </p>
                </div>
                <span className={cn(
                  "font-mono font-semibold shrink-0",
                  tx.type === "income" ? "text-emerald-400" : "text-red-400"
                )}>
                  {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                </span>
                <button
                  onClick={() => handleDelete(tx.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Página {page} de {data.pages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}>
                Próximo
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}