import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { FormDialogFooter } from "@/components/secretary/FormDialogFooter";
import { SecretaryDrawer } from "@/components/secretary/SecretaryDrawer";
import { Input } from "@/components/ui/Input";
import { ApiError, api } from "@/lib/api";

interface CreatePatientDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreatePatientDrawerActive({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");

  const createMutation = useMutation({
    mutationFn: (body: { givenName: string; familyName: string; email?: string; phone?: string }) =>
      api.post("/patients", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Paciente registrado correctamente");
      onOpenChange(false);
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : "No se pudo guardar el paciente");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    createMutation.mutate({
      givenName,
      familyName,
      email: email || undefined,
      phone: phone || undefined,
    });
  };

  return (
    <SecretaryDrawer
      isOpen
      onOpenChange={onOpenChange}
      title="Nuevo paciente"
      description="El paciente podrá crear su cuenta en el portal cuando lo desee."
      footer={
        <FormDialogFooter
          onCancel={() => onOpenChange(false)}
          submitLabel="Guardar paciente"
          submitType="submit"
          form="create-patient-form"
          loading={createMutation.isPending}
        />
      }
    >
      <form id="create-patient-form" className="grid gap-4" onSubmit={handleSubmit}>
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
        />
        <Input
          label="Teléfono"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+56 9 1234 5678"
        />
        {formError && (
          <p className="text-sm text-red-600" role="alert">
            {formError}
          </p>
        )}
      </form>
    </SecretaryDrawer>
  );
}

export function CreatePatientDrawer({ isOpen, onOpenChange }: CreatePatientDrawerProps) {
  if (!isOpen) return null;

  return <CreatePatientDrawerActive key="open" onOpenChange={onOpenChange} />;
}
