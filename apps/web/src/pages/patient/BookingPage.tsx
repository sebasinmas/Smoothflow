import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { AvailabilitySlotDto, PractitionerDto, SpecialtyDto } from "@smoothflow/shared";
import { AppointmentSlot } from "@/components/ui/AppointmentSlot";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

type Step = "specialty" | "doctor" | "slot" | "confirm";

export default function PatientBookingPage() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("specialty");
  const [specialtyId, setSpecialtyId] = useState("");
  const [practitionerId, setPractitionerId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlotDto | null>(null);

  const { data: specialties } = useQuery({
    queryKey: ["specialties-public"],
    queryFn: () => api.get<{ items: SpecialtyDto[] }>("/specialties"),
  });

  const { data: practitioners } = useQuery({
    queryKey: ["practitioners", specialtyId],
    enabled: !!specialtyId,
    queryFn: () =>
      api.get<{ items: PractitionerDto[] }>(
        `/owner/practitioners${specialtyId ? `?specialtyId=${specialtyId}` : ""}`,
      ),
  });

  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 14);

  const { data: availability } = useQuery({
    queryKey: ["availability", practitionerId],
    enabled: !!practitionerId && step === "slot",
    queryFn: () =>
      api.get<{ slots: AvailabilitySlotDto[] }>(
        `/availability?from=${from.toISOString()}&to=${to.toISOString()}&practitionerId=${practitionerId}`,
      ),
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSlot) throw new Error("Seleccione un horario");
      return api.post("/appointments", {
        practitionerId: selectedSlot.practitionerId,
        startAt: selectedSlot.startAt,
        endAt: selectedSlot.endAt,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
      setStep("confirm");
    },
  });

  const availableSlots = availability?.slots.filter((s) => s.status === "disponible") ?? [];

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <h1 className="text-xl font-bold text-brand">Smooth Flow — Pacientes</h1>
          <nav className="flex gap-4 text-sm">
            <Link to="/paciente/reservar" className="text-brand font-medium">
              Reservar
            </Link>
            <Link to="/paciente/mis-citas" className="text-text-muted hover:text-brand">
              Mis citas
            </Link>
            <button type="button" onClick={() => window.location.href = "/paciente/login"} className="text-text-muted hover:text-brand">
              Salir
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <ol className="mb-8 flex gap-2 text-sm" aria-label="Pasos de reserva">
          {(["specialty", "doctor", "slot", "confirm"] as Step[]).map((s, i) => (
            <li
              key={s}
              className={`rounded px-3 py-1 ${step === s ? "bg-brand text-white" : "bg-surface-muted text-text-muted"}`}
              aria-current={step === s ? "step" : undefined}
            >
              {i + 1}. {s === "specialty" ? "Especialidad" : s === "doctor" ? "Médico" : s === "slot" ? "Horario" : "Listo"}
            </li>
          ))}
        </ol>

        {step === "specialty" && (
          <section>
            <h2 className="mb-4 text-lg font-semibold">Seleccione especialidad</h2>
            <Select
              label="Especialidad"
              value={specialtyId}
              onChange={(e) => setSpecialtyId(e.target.value)}
              options={[
                { value: "", label: "Seleccionar…" },
                ...(specialties?.items.map((s) => ({ value: s.id, label: s.name })) ?? []),
              ]}
            />
            <Button className="mt-4" disabled={!specialtyId} onClick={() => setStep("doctor")}>
              Continuar
            </Button>
          </section>
        )}

        {step === "doctor" && (
          <section>
            <h2 className="mb-4 text-lg font-semibold">Seleccione médico</h2>
            <div className="grid gap-3">
              {practitioners?.items
                .filter((p) => !specialtyId || p.specialtyId === specialtyId)
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPractitionerId(p.id);
                      setStep("slot");
                    }}
                    className="rounded-lg border border-border bg-white p-4 text-left hover:border-brand"
                  >
                    <span className="font-semibold">{p.givenName} {p.familyName}</span>
                    <span className="block text-sm text-text-muted">{p.specialtyName}</span>
                  </button>
                ))}
            </div>
          </section>
        )}

        {step === "slot" && (
          <section>
            <h2 className="mb-4 text-lg font-semibold">Seleccione horario disponible</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {availableSlots.map((slot) => (
                <AppointmentSlot
                  key={`${slot.startAt}-${slot.practitionerId}`}
                  status="disponible"
                  label={slot.practitionerName}
                  time={formatDateTime(slot.startAt)}
                  selected={selectedSlot?.startAt === slot.startAt}
                  onClick={() => setSelectedSlot(slot)}
                />
              ))}
              {availableSlots.length === 0 && (
                <p className="text-text-muted">No hay horarios disponibles en las próximas 2 semanas.</p>
              )}
            </div>
            {selectedSlot && (
              <Button className="mt-4" loading={bookMutation.isPending} onClick={() => bookMutation.mutate()}>
                Confirmar reserva
              </Button>
            )}
          </section>
        )}

        {step === "confirm" && (
          <section className="rounded-lg border border-success bg-green-50 p-6 text-center" role="status">
            <h2 className="text-lg font-semibold text-success">¡Cita confirmada!</h2>
            <p className="mt-2 text-sm">Recibirá un correo de confirmación.</p>
            <Button className="mt-4" onClick={() => { setStep("specialty"); setSelectedSlot(null); }}>
              Reservar otra cita
            </Button>
          </section>
        )}
      </main>
    </div>
  );
}
