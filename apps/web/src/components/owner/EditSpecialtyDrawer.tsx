import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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

export function EditSpecialtyDrawer({
  specialty,
  isOpen,
  onOpenChange,
}: EditSpecialtyDrawerProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (isOpen && specialty) {
      setName(specialty.name);
      setDescription(specialty.description ?? "");
      setFormError("");
    }
  }, [isOpen, specialty]);

  const updateMutation = useMutation({
    mutationFn: (body: { name: string; description: string | null }) =>
      api.patch(`/owner/specialties/${specialty!.id}`, body),
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
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Editar especialidad"
      description="Modifique el nombre o la descripción de la especialidad."
      footer={
        isOpen && specialty ? (
          <FormDialogFooter
            onCancel={() => onOpenChange(false)}
            submitLabel="Guardar cambios"
            submitType="submit"
            form="edit-specialty-form"
            loading={updateMutation.isPending}
            submitDisabled={!name.trim()}
          />
        ) : undefined
      }
    >
      {isOpen && specialty ? (
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
            <label
              htmlFor="specialty-description"
              className="mb-1.5 block text-sm font-medium text-text"
            >
              Descripción (opcional)
            </label>
            <textarea
              id="specialty-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción de la especialidad"
              maxLength={300}
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm text-text placeholder:text-text-muted transition-colors duration-200 hover:border-brand/30 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20"
            />
          </div>
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
