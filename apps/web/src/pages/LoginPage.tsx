import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthErrorBanner } from "@/components/auth/AuthErrorBanner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { AppTooltip } from "@/components/ui/Tooltip";
import { Input } from "@/components/ui/Input";
import { useLoginErrorFeedback } from "@/hooks/useLoginErrorFeedback";
import { ApiError } from "@/lib/api";
import { ROLE_HOME } from "@/lib/utils";
import { TOOLTIPS } from "@/lib/tooltips";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { inputPulse, showMessage, message, triggerError, clearError } = useLoginErrorFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "paciente") {
        triggerError("Use el portal de pacientes para este acceso");
        return;
      }
      navigate(ROLE_HOME[user.role]);
    } catch (err) {
      triggerError(
        err instanceof ApiError && err.code === "INVALID_CREDENTIALS"
          ? "Credenciales inválidas"
          : err instanceof ApiError
            ? err.message
            : "Credenciales inválidas",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="Inicia sesión para comenzar">
      <form onSubmit={handleSubmit} className="stagger-children space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ingrese su email"
          errorPulse={inputPulse}
          required
        />
        <Input
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          placeholder="Ingrese su contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          errorPulse={inputPulse}
          required
        />
        <AuthErrorBanner message={message} visible={showMessage} />
        <Button type="submit" className="w-full" loading={loading}>
          Acceder al portal
        </Button>
      </form>
      <p className="mt-4 text-center text-sm">
        <AppTooltip content={TOOLTIPS.layout.patientPortalLink}>
          <a
            href="/paciente/login"
            className="cursor-pointer text-brand underline decoration-brand/30 underline-offset-2 transition-colors hover:decoration-brand focus-visible:underline"
          >
            Portal de pacientes
          </a>
        </AppTooltip>
      </p>
    </AuthLayout>
  );
}
