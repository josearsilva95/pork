"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const colorMap = {
  brand:   { bg: "bg-brand-500/10",   text: "text-brand-400",   border: "border-brand-500/20"   },
  success: { bg: "bg-emerald-500/10",  text: "text-emerald-400", border: "border-emerald-500/20" },
  danger:  { bg: "bg-red-500/10",      text: "text-red-400",     border: "border-red-500/20"     },
  violet:  { bg: "bg-violet-500/10",   text: "text-violet-400",  border: "border-violet-500/20"  },
  warning: { bg: "bg-amber-500/10",    text: "text-amber-400",   border: "border-amber-500/20"   },
};

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: keyof typeof colorMap;
  change?: number | null;
  positive?: boolean;
  isLoading?: boolean;
}

export function StatsCard({ title, value, icon: Icon, color, isLoading }: StatsCardProps) {
  const colors = colorMap[color] ?? colorMap.brand;

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 animate-pulse">
        <div className="h-4 bg-muted rounded w-24 mb-4" />
        <div className="h-8 bg-muted rounded w-32" />
      </div>
    );
  }

  return (
    <motion.div
      className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors group relative overflow-hidden"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Background glow */}
      <div className={cn("absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity", colors.bg)} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <motion.p
            className="text-2xl font-bold mt-1 font-mono tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {value}
          </motion.p>
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors.bg)}>
          <Icon className={cn("w-5 h-5", colors.text)} />
        </div>
      </div>
    </motion.div>
  );
}