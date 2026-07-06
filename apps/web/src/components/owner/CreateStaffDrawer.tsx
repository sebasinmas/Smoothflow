import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import type { SpecialtyDto } from "@smoothflow/shared";
import { toast } from "sonner";
import { FormDialogFooter } from "@/components/secretary/FormDialogFooter";
import { AppDrawer } from "@/components/ui/AppDrawer";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ApiError, api } from "@/lib/api";

interface CreateStaffDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type StaffRole = "secretaria" | "medico" | "dueno";

export function CreateStaffDrawer({ isOpen, onOpenChange }: CreateStaffDrawerProps) {
  const queryClient = useQueryClient();
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("secretaria");
  const [specialtyId, setSpecialtyId] = useState("");
  const [formError, setFormError] = useState("");

  const resetForm = useCallback(() => {
    setGivenName("");
    setFamilyName("");
    setEmail("");
    setPassword("");
    setRole("secretaria");
    setSpecialtyId("");
    setFormError("");
  }, []);

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen, resetForm]);

  const { data: specialties } = useQuery({
    queryKey: ["specialties"],
    queryFn: () => api.get<{ items: SpecialtyDto[] }>("/owner/specialties"),
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: (body: {
      givenName: string;
      familyName: string;
      email: string;
      password: string;
      role: StaffRole;
      specialtyId?: string;
    }) => api.post("/owner/staff", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["practitioners"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      toast.success(
        "Empleado creado correctamente. Los médicos incluyen horario Lun–Vie 09:00–17:00; ajústelo en Configuración.",
      );
      onOpenChange(false);
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : "No se pudo crear el empleado";
      setFormError(message);
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    createMutation.mutate({
      givenName,
      familyName,
      email,
      password,
      role,
      ...(role === "medico" && specialtyId ? { specialtyId } : {}),
    });
  };

  const submitDisabled = role === "medico" && !specialtyId;

  return (
    <AppDrawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Nuevo empleado"
      description="El empleado podrá iniciar sesión con el email y contraseña que defina aquí."
      footer={
        isOpen ? (
          <FormDialogFooter
            onCancel={() => onOpenChange(false)}
            submitLabel="Crear empleado"
            submitType="submit"
            form="create-staff-form"
            loading={createMutation.isPending}
            submitDisabled={submitDisabled}
          />
        ) : undefined
      }
    >
      {isOpen ? (
        <form id="create-staff-form" className="grid gap-4" onSubmit={handleSubmit}>
          <Input
            label="Nombre"
            value={givenName}
            onChange={(e) => setGivenName(e.target.value)}
            placeholder="Ej. María"
            required
          />
          <Input
            label="Apellido"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="Ej. González"
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.cl"
            required
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            minLength={8}
            required
          />
          <Select
            label="Rol"
            value={role}
            onChange={(e) => {
              const nextRole = e.target.value as StaffRole;
              setRole(nextRole);
              if (nextRole !== "medico") setSpecialtyId("");
            }}
            options={[
              { value: "secretaria", label: "Secretaria" },
              { value: "medico", label: "Médico" },
              { value: "dueno", label: "Dueño" },
            ]}
          />
          {role === "medico" && (
            <Select
              label="Especialidad"
              value={specialtyId}
              onChange={(e) => setSpecialtyId(e.target.value)}
              options={[
                { value: "", label: "Seleccione una especialidad" },
                ...(specialties?.items.map((s) => ({ value: s.id, label: s.name })) ?? []),
              ]}
              required
            />
          )}
          {formError && (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          )}
        </form>
      ) : null}
    </AppDrawer>
  );
}
