import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { UserDto } from "@smoothflow/shared";
import { AppShell } from "@/components/layout/AppShell";
import { StaffCard } from "@/components/ui/StaffCard";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/api";
import { formatPersonName } from "@/lib/utils";

const navItems = [
  { to: "/owner/staff", label: "Personal" },
  { to: "/owner/reportes", label: "Reportes" },
];

const bottomNavItems = [{ to: "/owner/configuracion", label: "Configuración" }];

export default function OwnerStaffPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<UserDto | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Password123!");
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [role, setRole] = useState<"secretaria" | "medico" | "dueno">("secretaria");

  const { data } = useQuery({
    queryKey: ["staff"],
    queryFn: () => api.get<{ items: UserDto[] }>("/owner/staff"),
  });

  const createMutation = useMutation({
    mutationFn: (body: unknown) => api.post("/owner/staff", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setShowForm(false);
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: (id: string) => api.post(`/owner/staff/${id}/unlink`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setUnlinkTarget(null);
    },
  });

  return (
    <AppShell
      role="dueno"
      navItems={navItems}
      bottomNavItems={bottomNavItems}
      title="Directorio de empleados"
      headerExtra={
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Añadir empleado"}
        </Button>
      }
    >
      <p className="mb-6 text-text-muted">Gestiona el personal de la clínica y su actividad.</p>

      {showForm && (
        <form
          className="mb-8 grid max-w-lg gap-4 rounded-xl border border-border bg-white p-6 shadow-card"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({ email, password, givenName, familyName, role });
          }}
        >
          <Input label="Nombre" value={givenName} onChange={(e) => setGivenName(e.target.value)} required />
          <Input label="Apellido" value={familyName} onChange={(e) => setFamilyName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Select
            label="Rol"
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            options={[
              { value: "secretaria", label: "Secretaria" },
              { value: "medico", label: "Médico" },
              { value: "dueno", label: "Dueño" },
            ]}
          />
          <Button type="submit" loading={createMutation.isPending}>
            Crear empleado
          </Button>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.items.map((staff) => (
          <StaffCard
            key={staff.id}
            staff={staff}
            onUnlink={
              staff.role !== "dueno"
                ? () => setUnlinkTarget(staff)
                : undefined
            }
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={unlinkTarget !== null}
        onOpenChange={(open) => !open && setUnlinkTarget(null)}
        title="Desvincular empleado"
        description={
          unlinkTarget ? (
            <>
              ¿Está seguro que desea desvincular a{" "}
              <strong>{formatPersonName(unlinkTarget.givenName, unlinkTarget.familyName)}</strong>?
              Perderá acceso inmediato al sistema y sus sesiones activas serán cerradas.
            </>
          ) : null
        }
        confirmLabel="Desvincular"
        cancelLabel="Cancelar"
        loading={unlinkMutation.isPending}
        onConfirm={() => {
          if (unlinkTarget) unlinkMutation.mutate(unlinkTarget.id);
        }}
      />
    </AppShell>
  );
}
