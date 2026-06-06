"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  ArrowLeftRight,
  TrendingUp,
  Users,
  Settings,
  TrendingUpIcon,
  Target,
  PieChart,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/accounts", icon: Wallet, label: "Contas" },
  { href: "/cards", icon: CreditCard, label: "Cartões" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transações" },
  { href: "/investments", icon: TrendingUp, label: "Investimentos" },
  { href: "/household", icon: Users, label: "Conta Casal" },
  { href: "/settings", icon: Settings, label: "Configurações" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-card border-r border-border shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
            <TrendingUpIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">FinanceFlow</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                whileHover={{ x: 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full"
                    layoutId="activeIndicator"
                  />
                )}
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="glass-card p-3 rounded-xl">
          <p className="text-xs text-muted-foreground">Plano Free</p>
          <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-brand-gradient rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "30%" }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">3 / 10 contas usadas</p>
        </div>
      </div>
    </aside>
  );
}