import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthErrorBanner } from "@/components/auth/AuthErrorBanner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLoginErrorFeedback } from "@/hooks/useLoginErrorFeedback";
import { ApiError } from "@/lib/api";

export default function PatientLoginPage() {
  const { patientLogin } = useAuth();
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
      await patientLogin(email, password);
      navigate("/patient/booking");
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
    <AuthLayout title="Portal de pacientes" subtitle="Gestione sus citas médicas 24/7" showWordmark={false}>
      <form onSubmit={handleSubmit} className="stagger-children space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="Ingrese su email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          errorPulse={inputPulse}
          required
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="Ingrese su contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          errorPulse={inputPulse}
          required
        />
        <AuthErrorBanner message={message} visible={showMessage} />
        <Button type="submit" className="w-full" loading={loading}>
          Ingresar
        </Button>
      </form>
      <p className="mt-4 text-center text-sm">
        ¿No tiene cuenta?{" "}
        <Link
          to="/patient/register"
          className="cursor-pointer text-brand underline decoration-brand/30 underline-offset-2 transition-colors hover:decoration-brand focus-visible:underline"
        >
          Registrarse
        </Link>
      </p>
    </AuthLayout>
  );
}
