"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, User, Shield, Bell } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      full_name: user?.full_name ?? "",
      phone: "",
      currency: user?.currency ?? "BRL",
      timezone: user?.timezone ?? "America/Sao_Paulo",
    },
  });

  async function onSubmit(data: any) {
    setSaving(true);
    try {
      await api.patch("/users/me", data);
      toast.success("Configurações salvas!");
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  }

  const sections = [
    { id: "profile", icon: User, label: "Perfil" },
    { id: "security", icon: Shield, label: "Segurança" },
    { id: "notifications", icon: Bell, label: "Notificações" },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie sua conta e preferências</p>
      </div>

      {/* Profile */}
      <motion.div
        className="bg-card border border-border rounded-2xl p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Perfil</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome completo</Label>
              <Input placeholder="Seu nome" {...register("full_name")} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input placeholder="+55 (11) 99999-9999" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label>Moeda</Label>
              <select
                {...register("currency")}
                className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="BRL">BRL — Real Brasileiro</option>
                <option value="USD">USD — Dólar Americano</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={user?.email ?? ""} disabled className="opacity-60" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar alterações
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Security */}
      <motion.div
        className="bg-card border border-border rounded-2xl p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Segurança</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium text-sm">Senha</p>
              <p className="text-xs text-muted-foreground">Altere sua senha de acesso</p>
            </div>
            <Button variant="outline" size="sm">Alterar senha</Button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-sm">Autenticação 2FA</p>
              <p className="text-xs text-muted-foreground">Adicione uma camada extra de segurança</p>
            </div>
            <Button variant="outline" size="sm">Configurar</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}