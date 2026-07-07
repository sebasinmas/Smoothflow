import type { ComponentType } from "react";
import {
  BarChart3,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  History,
  LayoutDashboard,
  Settings,
  UserCog,
  Users,
  ClipboardList,
  type LucideProps,
} from "lucide-react";
import type { NavItem } from "@/components/layout/SideNav";

type LucideIcon = ComponentType<LucideProps>;

const NAV_ICONS: Record<string, LucideIcon> = {
  "/secretary/dashboard": LayoutDashboard,
  "/secretary/calendar": Calendar,
  "/secretary/patients": Users,
  "/secretary/requests": ClipboardList,
  "/doctor/calendar": Calendar,
  "/doctor/history": History,
  "/owner/staff": UserCog,
  "/owner/schedules": CalendarClock,
  "/owner/settings": Settings,
  "/owner/reports": BarChart3,
  "/patient/booking": CalendarPlus,
  "/patient/appointments": CalendarCheck,
};

export function getNavIcon(path: string): LucideIcon {
  return NAV_ICONS[path] ?? LayoutDashboard;
}

export const SECRETARIA_NAV: NavItem[] = [
  { to: "/secretary/dashboard", label: "Panel de control" },
  { to: "/secretary/calendar", label: "Calendario" },
  { to: "/secretary/patients", label: "Pacientes" },
  { to: "/secretary/requests", label: "Solicitudes" },
];

export const DOCTOR_NAV: NavItem[] = [
  { to: "/doctor/calendar", label: "Agenda del día" },
  { to: "/doctor/history", label: "Historial" },
];

export const OWNER_NAV: NavItem[] = [
  { to: "/owner/staff", label: "Personal" },
  { to: "/owner/schedules", label: "Horarios" },
  { to: "/owner/reports", label: "Reportes" },
];

export const OWNER_BOTTOM_NAV: NavItem[] = [
  { to: "/owner/settings", label: "Configuración" },
];

export const PACIENTE_NAV: NavItem[] = [
  { to: "/patient/booking", label: "Reservar" },
  { to: "/patient/appointments", label: "Mis citas" },
];
