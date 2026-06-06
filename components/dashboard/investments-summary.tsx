"use client";

import Link from "next/link";
import { TrendingUp, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface InvestmentsSummaryProps {
  totalInvested: number;
  isLoading?: boolean;
}

export function InvestmentsSummary({ totalInvested, isLoading }: InvestmentsSummaryProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Investimentos</h3>
        <Link href="/investments" className="text-xs text-primary hover:underline flex items-center gap-1">
          Ver mais <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total investido</p>
          {isLoading ? (
            <div className="h-5 w-24 bg-muted rounded animate-pulse mt-0.5" />
          ) : (
            <p className="font-mono font-bold">{formatCurrency(totalInvested)}</p>
          )}
        </div>
      </div>
    </div>
  );
}