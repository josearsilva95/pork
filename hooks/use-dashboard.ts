"use client";

import { useState, useEffect } from "react";
import { dashboardApi } from "@/services/api";

export function useDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi.getSummary()
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.message ?? "Erro ao carregar dashboard"))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, error };
}