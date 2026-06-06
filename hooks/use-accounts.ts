"use client";

import { useState, useEffect } from "react";
import { accountsApi } from "@/services/api";

export function useAccounts() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    accountsApi.list()
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.message ?? "Erro ao carregar contas"))
      .finally(() => setIsLoading(false));
  }, []);

  const refetch = () => {
    setIsLoading(true);
    accountsApi.list()
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.message ?? "Erro"))
      .finally(() => setIsLoading(false));
  };

  return { data, isLoading, error, refetch };
}