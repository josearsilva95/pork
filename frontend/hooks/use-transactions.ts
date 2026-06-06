"use client";

import { useState, useEffect } from "react";
import { transactionsApi } from "@/services/api";

export function useTransactions(params?: Record<string, any>) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    transactionsApi.list(params)
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.message ?? "Erro ao carregar transações"))
      .finally(() => setIsLoading(false));
  }, [JSON.stringify(params)]);

  const refetch = () => {
    setIsLoading(true);
    transactionsApi.list(params)
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.message ?? "Erro"))
      .finally(() => setIsLoading(false));
  };

  return { data, isLoading, error, refetch };
}