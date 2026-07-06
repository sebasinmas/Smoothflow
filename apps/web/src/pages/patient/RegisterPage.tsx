import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api";

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
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-8">
      <div className="w-full max-w-md rounded-lg border border-border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-brand">Crear cuenta</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Nombre" value={form.givenName} onChange={(e) => setForm({ ...form, givenName: e.target.value })} required />
          <Input label="Apellido" value={form.familyName} onChange={(e) => setForm({ ...form, familyName: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Contraseña" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Input label="Teléfono (opcional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="RUT (opcional)" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} />
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            Registrarse
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link to="/paciente/login" className="cursor-pointer text-brand underline">
            Ya tengo cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
