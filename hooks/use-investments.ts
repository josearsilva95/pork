"use client";

import { useState, useEffect } from "react";
import { investmentsApi } from "@/services/api";

export function useInvestments() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    investmentsApi.list()
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.message ?? "Erro ao carregar investimentos"))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, error };
}