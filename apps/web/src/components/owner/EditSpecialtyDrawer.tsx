import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { SpecialtyDto } from "@smoothflow/shared";
import { toast } from "sonner";
import { FormDialogFooter } from "@/components/secretary/FormDialogFooter";
import { AppDrawer } from "@/components/ui/AppDrawer";
import { Input } from "@/components/ui/Input";
import { ApiError, api } from "@/lib/api";

interface EditSpecialtyDrawerProps {
  specialty: SpecialtyDto | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditSpecialtyDrawerActive({
  specialty,
  onOpenChange,
}: {
  specialty: SpecialtyDto;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(specialty.name);
  const [description, setDescription] = useState(specialty.description ?? "");
  const [formError, setFormError] = useState("");

  const updateMutation = useMutation({
    mutationFn: (body: { name: string; description: string | null }) =>
      api.patch(`/owner/specialties/${specialty.id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      toast.success("Especialidad actualizada");
      onOpenChange(false);
    },
    onError: (err) => {
      const message =
        err instanceof ApiError ? err.message : "No se pudo actualizar la especialidad";
      setFormError(message);
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    updateMutation.mutate({
      name: name.trim(),
      description: description.trim() || null,
    });
  };

  return (
    <AppDrawer
      isOpen
      onOpenChange={onOpenChange}
      title="Editar especialidad"
      description="Modifique el nombre o la descripción de la especialidad."
      footer={
        <FormDialogFooter
          onCancel={() => onOpenChange(false)}
          submitLabel="Guardar cambios"
          submitType="submit"
          form="edit-specialty-form"
          loading={updateMutation.isPending}
          submitDisabled={!name.trim()}
        />
      }
    >
      <form id="edit-specialty-form" className="grid gap-4" onSubmit={handleSubmit}>
        <Input
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Medicina general"
          required
          maxLength={100}
        />
        <div>
          <label htmlFor="specialty-description" className="mb-1.5 block text-sm font-medium text-text">
            Descripción (opcional)
          </label>
          <textarea
            id="specialty-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descripción de la especialidad"
            maxLength={300}
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        {formError && (
          <p className="text-sm text-red-600" role="alert">
            {formError}
          </p>
        )}
      </form>
    </AppDrawer>
  );
}

export function EditSpecialtyDrawer({
  specialty,
  isOpen,
  onOpenChange,
}: EditSpecialtyDrawerProps) {
  if (!isOpen || !specialty) return null;

  return (
    <EditSpecialtyDrawerActive
      key={specialty.id}
      specialty={specialty}
      onOpenChange={onOpenChange}
    />
  );
}
