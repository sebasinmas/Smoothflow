import type { ComponentType } from "react";
import {
  BarChart3,
  Calendar,
  History,
  LayoutDashboard,
  Settings,
  UserCog,
  Users,
  type LucideProps,
} from "lucide-react";

type LucideIcon = ComponentType<LucideProps>;

export const NAV_ICONS: Record<string, LucideIcon> = {
  "/secretaria/panel": LayoutDashboard,
  "/secretaria/calendario": Calendar,
  "/secretaria/pacientes": Users,
  "/doctor/calendario": Calendar,
  "/doctor/historial": History,
  "/owner/staff": UserCog,
  "/owner/configuracion": Settings,
  "/owner/reportes": BarChart3,
};

export function getNavIcon(path: string): LucideIcon {
  return NAV_ICONS[path] ?? LayoutDashboard;
}
