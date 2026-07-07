import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { FieldHint } from "@/components/ui/FieldHint";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api";
import { TOOLTIPS } from "@/lib/tooltips";

export default function PatientRegisterPage() {
  const { registerPatient } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    givenName: "",
    familyName: "",
    phone: "",
    identifier: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await registerPatient({
        ...form,
        phone: form.phone || undefined,
        identifier: form.identifier || undefined,
      });
      navigate("/paciente/reservar");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Crear cuenta" subtitle="Regístrese para reservar citas en línea" showWordmark={false}>
      <form onSubmit={handleSubmit} className="stagger-children space-y-4">
        <Input label="Nombre" value={form.givenName} onChange={(e) => setForm({ ...form, givenName: e.target.value })} required />
        <Input label="Apellido" value={form.familyName} onChange={(e) => setForm({ ...form, familyName: e.target.value })} required />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Input label="Contraseña" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
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
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="[&_label]:sr-only"
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
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            className="[&_label]:sr-only"
          />
        </div>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>
          Registrarse
        </Button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link
          to="/paciente/login"
          className="cursor-pointer text-brand underline decoration-brand/30 underline-offset-2 transition-colors hover:decoration-brand focus-visible:underline"
        >
          Ya tengo cuenta
        </Link>
      </p>
    </AuthLayout>
  );
}
