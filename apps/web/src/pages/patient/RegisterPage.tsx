import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthErrorBanner } from "@/components/auth/AuthErrorBanner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { FieldHint } from "@/components/ui/FieldHint";
import { Input } from "@/components/ui/Input";
import { useLoginErrorFeedback } from "@/hooks/useLoginErrorFeedback";
import { ApiError } from "@/lib/api";
import { TOOLTIPS } from "@/lib/tooltips";

const MIN_PASSWORD_LENGTH = 8;

export default function PatientRegisterPage() {
  const { registerPatient } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    givenName: "",
    familyName: "",
    phone: "",
    identifier: "",
  });
  const [loading, setLoading] = useState(false);
  const { inputPulse, showMessage, message, triggerError, clearError } = useLoginErrorFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (form.password.length < MIN_PASSWORD_LENGTH) {
      triggerError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
      return;
    }
    if (form.password !== form.confirmPassword) {
      triggerError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      await registerPatient({
        email: form.email,
        password: form.password,
        givenName: form.givenName,
        familyName: form.familyName,
        phone: form.phone || undefined,
        identifier: form.identifier || undefined,
      });
      navigate("/patient/booking");
    } catch (err) {
      triggerError(err instanceof ApiError ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Crear cuenta" subtitle="Regístrese para reservar citas en línea" showWordmark={false}>
      <form onSubmit={handleSubmit} className="stagger-children space-y-4" noValidate>
        <Input
          label="Nombre"
          placeholder="Ingrese su nombre"
          value={form.givenName}
          onChange={(e) => setForm({ ...form, givenName: e.target.value })}
          errorPulse={inputPulse}
          required
        />
        <Input
          label="Apellido"
          placeholder="Ingrese su apellido"
          value={form.familyName}
          onChange={(e) => setForm({ ...form, familyName: e.target.value })}
          errorPulse={inputPulse}
          required
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="Ingrese su email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          errorPulse={inputPulse}
          required
        />
        <Input
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          errorPulse={inputPulse}
          required
        />
        <Input
          label="Repetir contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="Repita su contraseña"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          errorPulse={inputPulse}
          required
        />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-text">
              Teléfono (opcional)
            </label>
            <FieldHint content={TOOLTIPS.patient.phoneOptional} />
          </div>
          <Input
            id="phone"
            label="Teléfono (opcional)"
            hideLabel
            type="tel"
            placeholder="+56 9 1234 5678"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            errorPulse={inputPulse}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <label htmlFor="identifier" className="text-sm font-medium text-text">
              RUT (opcional)
            </label>
            <FieldHint content={TOOLTIPS.patient.rutOptional} />
          </div>
          <Input
            id="identifier"
            label="RUT (opcional)"
            hideLabel
            placeholder="12.345.678-9"
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            errorPulse={inputPulse}
          />
        </div>
        <AuthErrorBanner message={message} visible={showMessage} />
        <Button type="submit" className="w-full" loading={loading}>
          Registrarse
        </Button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link
          to="/patient/login"
          className="cursor-pointer text-brand underline decoration-brand/30 underline-offset-2 transition-colors hover:decoration-brand focus-visible:underline"
        >
          Ya tengo cuenta
        </Link>
      </p>
    </AuthLayout>
  );
}
