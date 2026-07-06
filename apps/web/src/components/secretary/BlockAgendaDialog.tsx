import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SecretaryModal } from "@/components/secretary/SecretaryModal";
import { ApiError, api } from "@/lib/api";
import { formatPersonName } from "@/lib/utils";

interface BlockAgendaDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialPractitionerId?: string;
}

function combineDateTime(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

export function BlockAgendaDialog({
  isOpen,
  onOpenChange,
  initialPractitionerId,
}: BlockAgendaDialogProps) {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const [practitionerId, setPractitionerId] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState(today);
  const [endTime, setEndTime] = useState("10:00");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setPractitionerId(initialPractitionerId ?? "");
    setStartDate(today);
    setEndDate(today);
    setStartTime("09:00");
    setEndTime("10:00");
    setReason("");
    setError("");
  }, [isOpen, initialPractitionerId, today]);

  const { data: practitioners } = useQuery({
    queryKey: ["practitioners"],
    queryFn: () =>
      api.get<{ items: Array<{ id: string; givenName: string; familyName: string }> }>(
        "/owner/practitioners",
      ),
    enabled: isOpen,
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
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Bloquear agenda"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            loading={blockMutation.isPending}
            disabled={!practitionerId}
            onClick={() => {
              setError("");
              blockMutation.mutate();
            }}
          >
            Confirmar bloqueo
          </Button>
        </>
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
        <Input
          label="Motivo (opcional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </SecretaryModal>
  );
}
