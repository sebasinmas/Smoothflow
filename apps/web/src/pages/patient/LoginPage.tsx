import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthErrorBanner } from "@/components/auth/AuthErrorBanner";
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
      navigate("/paciente/reservar");
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
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-brand">Portal de pacientes</h1>
        <p className="mt-2 text-sm text-text-muted">Gestione sus citas médicas 24/7</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            errorPulse={inputPulse}
            required
          />
          <Input
            label="Contraseña"
            type="password"
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
          <Link to="/paciente/registro" className="text-brand underline">
            Registrarse
          </Link>
        </p>
      </div>
    </div>
  );
}
