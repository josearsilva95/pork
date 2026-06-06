"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, TrendingUp, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/services/api";

const schema = z.object({ email: z.string().email("E-mail inválido") });
type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: Form) {
    await authApi.forgotPassword(data.email);
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-mesh p-8">
      <motion.div
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-brand-400" />
            </div>
          </div>
          {sent ? (
            <>
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="text-2xl font-bold">E-mail enviado!</h2>
              <p className="text-muted-foreground text-sm">
                Verifique sua caixa de entrada para redefinir sua senha.
              </p>
              <Link href="/login">
                <Button variant="outline" className="mt-4 gap-2">
                  <ArrowLeft className="w-4 h-4" /> Voltar ao login
                </Button>
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold">Esqueceu a senha?</h2>
              <p className="text-muted-foreground text-sm">Enviaremos um link para redefinir sua senha.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left mt-6">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" {...register("email")} />
                  {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : "Enviar link"}
                </Button>
              </form>
              <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mt-4">
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}