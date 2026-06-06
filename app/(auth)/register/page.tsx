"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, TrendingUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const passwordRequirements = [
  { label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
  { label: "Letra maiúscula", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Letra minúscula", test: (p: string) => /[a-z]/.test(p) },
  { label: "Número", test: (p: string) => /\d/.test(p) },
  { label: "Caractere especial", test: (p: string) => /[!@#$%^&*]/.test(p) },
];

const schema = z.object({
  full_name: z.string().min(2, "Nome muito curto").max(100),
  email: z.string().email("E-mail inválido"),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Precisa de letra maiúscula")
    .regex(/[a-z]/, "Precisa de letra minúscula")
    .regex(/\d/, "Precisa de número")
    .regex(/[!@#$%^&*]/, "Precisa de caractere especial"),
});

type RegisterForm = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(schema) });

  async function onSubmit(data: RegisterForm) {
    try {
      await registerUser(data.email, data.password, data.full_name);
      router.push("/dashboard");
    } catch (err: any) {
      setError("root", { message: err?.message || "Erro ao criar conta" });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-mesh p-8">
      <motion.div
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold">Criar conta</h2>
          <p className="text-muted-foreground">Comece a controlar suas finanças hoje</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {errors.root && (
            <motion.div
              className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.root.message}
            </motion.div>
          )}

          <div className="space-y-2">
            <Label htmlFor="full_name">Nome completo</Label>
            <Input
              id="full_name"
              placeholder="Seu Nome"
              {...register("full_name")}
              className={cn(errors.full_name && "border-destructive")}
            />
            {errors.full_name && <p className="text-destructive text-xs">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register("email")}
              className={cn(errors.email && "border-destructive")}
            />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Crie uma senha segura"
                {...register("password", {
                  onChange: (e) => setPassword(e.target.value),
                })}
                className={cn("pr-10", errors.password && "border-destructive")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password && (
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {passwordRequirements.map((req) => (
                  <div key={req.label} className={cn("flex items-center gap-1.5 text-xs", req.test(password) ? "text-emerald-400" : "text-muted-foreground")}>
                    <Check className={cn("w-3 h-3", req.test(password) ? "opacity-100" : "opacity-30")} />
                    {req.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando conta...</>
            ) : (
              "Criar conta"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Fazer login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}