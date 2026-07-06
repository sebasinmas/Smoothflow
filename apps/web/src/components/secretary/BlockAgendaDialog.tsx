import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FormDialogFooter } from "@/components/secretary/FormDialogFooter";
import { SecretaryModal } from "@/components/secretary/SecretaryModal";
import { Input } from "@/components/ui/Input";
import { FieldHint } from "@/components/ui/FieldHint";
import { Select } from "@/components/ui/Select";
import { ApiError, api } from "@/lib/api";
import { formatPersonName } from "@/lib/utils";
import { TOOLTIPS } from "@/lib/tooltips";

interface BlockAgendaDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialPractitionerId?: string;
}

function combineDateTime(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

function BlockAgendaDialogActive({
  initialPractitionerId,
  onOpenChange,
}: {
  initialPractitionerId?: string;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const [practitionerId, setPractitionerId] = useState(initialPractitionerId ?? "");
  const [startDate, setStartDate] = useState(today);
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState(today);
  const [endTime, setEndTime] = useState("10:00");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const { data: practitioners } = useQuery({
    queryKey: ["practitioners"],
    queryFn: () =>
      api.get<{ items: Array<{ id: string; givenName: string; familyName: string }> }>(
        "/owner/practitioners",
      ),
  });

  const blockMutation = useMutation({
    mutationFn: async () => {
      if (!practitionerId) throw new Error("Seleccione un médico");
      return api.post("/appointments/blocks", {
        practitionerId,
        startAt: combineDateTime(startDate, startTime),
        endAt: combineDateTime(endDate, endTime),
        reason: reason || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      onOpenChange(false);
    },
    onError: (err) => {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo bloquear la agenda. Revise el rango seleccionado.",
      );
    },
  });

  const practitionerOptions = [
    { value: "", label: "Seleccionar médico…" },
    ...(practitioners?.items.map((p) => ({
      value: p.id,
      label: formatPersonName(p.givenName, p.familyName),
    })) ?? []),
  ];

  return (
    <SecretaryModal
      isOpen
      onOpenChange={onOpenChange}
      title="Bloquear agenda"
      footer={
        <FormDialogFooter
          onCancel={() => onOpenChange(false)}
          submitLabel="Confirmar bloqueo"
          submitVariant="danger"
          loading={blockMutation.isPending}
          submitDisabled={!practitionerId}
          onSubmit={() => {
            setError("");
            blockMutation.mutate();
          }}
        />
      }
    >
      <div className="grid gap-4">
        <Select
          label="Médico"
          value={practitionerId}
          onChange={(e) => setPractitionerId(e.target.value)}
          options={practitionerOptions}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Fecha inicio"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Hora inicio"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label="Fecha fin"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Input
            label="Hora fin"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <label htmlFor="block-reason" className="text-sm font-medium text-text">
              Motivo (opcional)
            </label>
            <FieldHint content={TOOLTIPS.secretary.blockReason} />
          </div>
          <Input
            id="block-reason"
            label="Motivo (opcional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="[&_label]:sr-only"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </SecretaryModal>
  );
}

export function BlockAgendaDialog({
  isOpen,
  onOpenChange,
  initialPractitionerId,
}: BlockAgendaDialogProps) {
  if (!isOpen) return null;

  return (
    <BlockAgendaDialogActive
      key={initialPractitionerId ?? "default"}
      initialPractitionerId={initialPractitionerId}
      onOpenChange={onOpenChange}
    />
  );
}
