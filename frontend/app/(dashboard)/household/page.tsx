"use client";

import { motion } from "framer-motion";
import { Users, Plus, Crown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function HouseholdPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Conta Casal</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie finanças compartilhadas</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Criar household
        </Button>
      </div>

      {/* Empty state */}
      <motion.div
        className="flex flex-col items-center justify-center py-20 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-20 h-20 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6">
          <Users className="w-10 h-10 text-brand-400" />
        </div>
        <h2 className="text-xl font-semibold">Você ainda não tem um household</h2>
        <p className="text-muted-foreground text-sm mt-2 max-w-sm">
          Crie um household para compartilhar finanças, metas e patrimônio com seu parceiro ou família.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 max-w-2xl w-full text-left">
          {[
            { icon: "💰", title: "Contas compartilhadas", desc: "Veja e gerencie contas em conjunto" },
            { icon: "🎯", title: "Metas em casal", desc: "Defina e acompanhe metas juntos" },
            { icon: "📊", title: "Visão unificada", desc: "Dashboard com patrimônio consolidado" },
          ].map((feature) => (
            <div key={feature.title} className="bg-card border border-border rounded-2xl p-4">
              <div className="text-2xl mb-2">{feature.icon}</div>
              <p className="font-medium text-sm">{feature.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>

        <Button className="mt-8 gap-2" size="lg">
          <Plus className="w-4 h-4" /> Criar household agora
        </Button>
      </motion.div>
    </div>
  );
}