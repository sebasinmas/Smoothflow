import type {
  AppointmentNotifier,
  AppointmentNotificationAction,
} from "../../domain/ports/appointment-notifier.port.js";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailService {
  send(message: EmailMessage): Promise<void>;
}

export class ConsoleEmailService implements EmailService {
  async send(message: EmailMessage): Promise<void> {
    console.log("[email]", { to: message.to, subject: message.subject, text: message.text });
  }
}

export const emailService: EmailService = new ConsoleEmailService();

export async function sendAppointmentConfirmation(
  to: string,
  action: AppointmentNotificationAction,
  startAt: string,
): Promise<void> {
  await emailService.send({
    to,
    subject: `Smooth Flow — Confirmación de ${action}`,
    text: `Su cita ha sido registrada con ${action} para el ${new Date(startAt).toLocaleString("es-CL")}.`,
    html: `<p>Su cita ha sido registrada con <strong>${action}</strong> para el <strong>${new Date(startAt).toLocaleString("es-CL")}</strong>.</p>`,
  });
}

export const appointmentNotifier: AppointmentNotifier = {
  sendConfirmation: sendAppointmentConfirmation,
};
