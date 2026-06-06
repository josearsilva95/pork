import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatCurrency(value: number | string, currency = "BRL"): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(num || 0);
}

export function formatDate(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  return format(d, "dd MMM yyyy", { locale: ptBR });
}

export function formatMonth(monthStr: string): string {
  if (!monthStr) return "";
  try {
    const d = parseISO(monthStr + (monthStr.length === 7 ? "-01" : ""));
    return format(d, "MMM/yy", { locale: ptBR });
  } catch {
    return monthStr;
  }
}

export function formatPercent(value: number): string {
  return `${(value >= 0 ? "+" : "")}${value.toFixed(2)}%`;
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `R$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$${(value / 1_000).toFixed(1)}k`;
  return formatCurrency(value);
}