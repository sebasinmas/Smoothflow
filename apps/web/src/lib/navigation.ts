import type { ComponentType } from "react";
import {
  BarChart3,
  Calendar,
  CalendarCheck,
  CalendarPlus,
  History,
  LayoutDashboard,
  Settings,
  UserCog,
  Users,
  type LucideProps,
} from "lucide-react";
import type { NavItem } from "@/components/layout/SideNav";

type LucideIcon = ComponentType<LucideProps>;

const NAV_ICONS: Record<string, LucideIcon> = {
  "/secretaria/panel": LayoutDashboard,
  "/secretaria/calendario": Calendar,
  "/secretaria/pacientes": Users,
  "/doctor/calendario": Calendar,
  "/doctor/historial": History,
  "/owner/staff": UserCog,
  "/owner/configuracion": Settings,
  "/owner/reportes": BarChart3,
  "/paciente/reservar": CalendarPlus,
  "/paciente/mis-citas": CalendarCheck,
};

export function getNavIcon(path: string): LucideIcon {
  return NAV_ICONS[path] ?? LayoutDashboard;
}

export const SECRETARIA_NAV: NavItem[] = [
  { to: "/secretaria/panel", label: "Panel de control" },
  { to: "/secretaria/calendario", label: "Calendario" },
  { to: "/secretaria/pacientes", label: "Pacientes" },
];

export const DOCTOR_NAV: NavItem[] = [
  { to: "/doctor/calendario", label: "Agenda del día" },
  { to: "/doctor/historial", label: "Historial" },
];

export const OWNER_NAV: NavItem[] = [
  { to: "/owner/staff", label: "Personal" },
  { to: "/owner/reportes", label: "Reportes" },
];

export const OWNER_BOTTOM_NAV: NavItem[] = [
  { to: "/owner/configuracion", label: "Configuración" },
];

export const PACIENTE_NAV: NavItem[] = [
  { to: "/paciente/reservar", label: "Reservar" },
  { to: "/paciente/mis-citas", label: "Mis citas" },
];
