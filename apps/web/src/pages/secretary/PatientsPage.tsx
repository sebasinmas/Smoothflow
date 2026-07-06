import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { PatientDto } from "@smoothflow/shared";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { formatDateTime, formatPersonName } from "@/lib/utils";

const navItems = [
  { to: "/secretaria/panel", label: "Panel de control" },
  { to: "/secretaria/calendario", label: "Calendario" },
  { to: "/secretaria/pacientes", label: "Pacientes" },
];

export default function SecretaryPatientsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api.get<{ items: PatientDto[] }>("/patients"),
  });

  const createMutation = useMutation({
    mutationFn: (body: { givenName: string; familyName: string; email?: string; phone?: string }) =>
      api.post("/patients", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setShowForm(false);
      setGivenName("");
      setFamilyName("");
      setEmail("");
      setPhone("");
    },
  });

  return (
    <AppShell role="secretaria" navItems={navItems} title="Gestión de pacientes" showNotifications>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-text-muted">Administre pacientes y cree citas en su representación.</p>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Nuevo paciente"}
        </Button>
      </div>

      {showForm && (
        <form
          className="mb-8 grid max-w-xl gap-4 rounded-lg border border-border bg-white p-6"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({ givenName, familyName, email: email || undefined, phone: phone || undefined });
          }}
        >
          <Input label="Nombre" value={givenName} onChange={(e) => setGivenName(e.target.value)} required />
          <Input label="Apellido" value={familyName} onChange={(e) => setFamilyName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button type="submit" loading={createMutation.isPending}>
            Guardar paciente
          </Button>
        </form>
      )}

      {isLoading ? (
        <p>Cargando pacientes…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                <th className="px-4 py-3 font-semibold" scope="col">
                  Paciente
                </th>
                <th className="px-4 py-3 font-semibold" scope="col">
                  Email
                </th>
                <th className="px-4 py-3 font-semibold" scope="col">
                  Teléfono
                </th>
                <th className="px-4 py-3 font-semibold" scope="col">
                  Registrado
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{formatPersonName(p.givenName, p.familyName)}</td>
                  <td className="px-4 py-3">{p.email ?? "—"}</td>
                  <td className="px-4 py-3">{p.phone ?? "—"}</td>
                  <td className="px-4 py-3">{formatDateTime(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
