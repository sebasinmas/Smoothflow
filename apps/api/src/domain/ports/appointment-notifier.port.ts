export type AppointmentNotificationAction = "reserva" | "reagendamiento" | "cancelación";

export interface AppointmentNotifier {
  sendConfirmation(
    to: string,
    action: AppointmentNotificationAction,
    startAtIso: string,
  ): Promise<void>;
}
