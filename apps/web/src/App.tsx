import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { RequireAuth, GuestOnly } from "@/components/auth/RouteGuards";
import LoginPage from "@/pages/LoginPage";
import SecretaryPanelPage from "@/pages/secretary/PanelPage";
import SecretaryCalendarPage from "@/pages/secretary/CalendarPage";
import SecretaryPatientsPage from "@/pages/secretary/PatientsPage";
import SecretaryRequestsPage from "@/pages/secretary/RequestsPage";
import DoctorCalendarPage from "@/pages/doctor/CalendarPage";
import DoctorHistoryPage from "@/pages/doctor/HistoryPage";
import OwnerStaffPage from "@/pages/owner/StaffPage";
import OwnerConfigPage from "@/pages/owner/ConfigPage";
import OwnerSchedulesPage from "@/pages/owner/SchedulesPage";
import OwnerReportsPage from "@/pages/owner/ReportsPage";
import PatientLoginPage from "@/pages/patient/LoginPage";
import PatientRegisterPage from "@/pages/patient/RegisterPage";
import PatientBookingPage from "@/pages/patient/BookingPage";
import PatientAppointmentsPage from "@/pages/patient/AppointmentsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-center"
            offset={16}
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast: "card rounded-lg shadow-card ring-1 ring-border/50",
                title: "text-sm font-semibold",
                description: "text-sm text-text-muted",
              },
            }}
          />
          <Routes>
            <Route element={<GuestOnly />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/paciente/login" element={<PatientLoginPage />} />
              <Route path="/paciente/registro" element={<PatientRegisterPage />} />
            </Route>

            <Route element={<RequireAuth roles={["secretaria"]} />}>
              <Route
                element={
                  <RealtimeProvider>
                    <Outlet />
                  </RealtimeProvider>
                }
              >
                <Route path="/secretaria" element={<Navigate to="/secretaria/calendario" replace />} />
                <Route path="/secretaria/panel" element={<SecretaryPanelPage />} />
                <Route path="/secretaria/calendario" element={<SecretaryCalendarPage />} />
                <Route path="/secretaria/pacientes" element={<SecretaryPatientsPage />} />
                <Route path="/secretaria/solicitudes" element={<SecretaryRequestsPage />} />
              </Route>
            </Route>

            <Route element={<RequireAuth roles={["medico"]} />}>
              <Route
                path="/doctor"
                element={
                  <RealtimeProvider>
                    <Navigate to="/doctor/calendario" replace />
                  </RealtimeProvider>
                }
              />
              <Route
                path="/doctor/calendario"
                element={
                  <RealtimeProvider>
                    <DoctorCalendarPage />
                  </RealtimeProvider>
                }
              />
              <Route
                path="/doctor/historial"
                element={
                  <RealtimeProvider>
                    <DoctorHistoryPage />
                  </RealtimeProvider>
                }
              />
            </Route>

            <Route element={<RequireAuth roles={["dueno"]} />}>
              <Route path="/owner" element={<Navigate to="/owner/staff" replace />} />
              <Route path="/owner/staff" element={<OwnerStaffPage />} />
              <Route path="/owner/horarios" element={<OwnerSchedulesPage />} />
              <Route path="/owner/configuracion" element={<OwnerConfigPage />} />
              <Route path="/owner/reportes" element={<OwnerReportsPage />} />
            </Route>

            <Route element={<RequireAuth roles={["paciente"]} />}>
              <Route path="/paciente/reservar" element={<PatientBookingPage />} />
              <Route path="/paciente/mis-citas" element={<PatientAppointmentsPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
