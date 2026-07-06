import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api";
import { ROLE_HOME } from "@/lib/utils";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "paciente") {
        setError("Use el portal de pacientes para este acceso");
        return;
      }
      navigate(ROLE_HOME[user.role]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-border bg-white p-10 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-brand">Smooth Flow</h1>
            <p className="mt-2 text-text-muted">Inicia sesión para comenzar</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingrese su email"
              required
            />
            <Input
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" loading={loading}>
              Acceder al portal
            </Button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-text-muted">
          Entorno seguro para clínicas · © 2026 Smooth Flow
        </p>
        <p className="mt-2 text-center text-sm">
          <a href="/paciente/login" className="text-brand underline">
            Portal de pacientes
          </a>
        </p>
      </div>
    </div>
  );
}
