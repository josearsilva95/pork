"use client";

import { motion } from "framer-motion";
import { useDashboard } from "@/hooks/use-dashboard";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ExpensePieChart } from "@/components/charts/expense-pie-chart";
import { EvolutionChart } from "@/components/charts/evolution-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { AccountsOverview } from "@/components/dashboard/accounts-overview";
import { InvestmentsSummary } from "@/components/dashboard/investments-summary";
import { formatCurrency } from "@/lib/format";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const stagger = {
  container: { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
};

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  const stats = [
    {
      title: "Saldo Total",
      value: formatCurrency(data?.total_balance ?? 0),
      icon: Wallet,
      color: "brand",
      change: null,
    },
    {
      title: "Receitas do Mês",
      value: formatCurrency(data?.total_income_month ?? 0),
      icon: TrendingUp,
      color: "success",
      change: null,
      positive: true,
    },
    {
      title: "Despesas do Mês",
      value: formatCurrency(data?.total_expense_month ?? 0),
      icon: TrendingDown,
      color: "danger",
      change: null,
      positive: false,
    },
    {
      title: "Patrimônio Líquido",
      value: formatCurrency(data?.net_worth ?? 0),
      icon: BarChart3,
      color: "violet",
      change: null,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        variants={stagger.container}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={stagger.item}>
            <StatsCard {...stat} isLoading={isLoading} />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        variants={stagger.container}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={stagger.item} className="lg:col-span-2">
          <EvolutionChart data={data?.monthly_evolution ?? []} isLoading={isLoading} />
        </motion.div>
        <motion.div variants={stagger.item}>
          <ExpensePieChart data={data?.expense_by_category ?? []} isLoading={isLoading} />
        </motion.div>
      </motion.div>

      {/* Bottom row */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        variants={stagger.container}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={stagger.item} className="lg:col-span-2">
          <RecentTransactions />
        </motion.div>
        <motion.div variants={stagger.item} className="space-y-4">
          <AccountsOverview />
          <InvestmentsSummary totalInvested={data?.total_invested ?? 0} isLoading={isLoading} />
        </motion.div>
      </motion.div>
    </div>
  );
}