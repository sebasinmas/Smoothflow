import { AlertCircle } from "lucide-react";

interface AuthErrorBannerProps {
  message: string;
  visible: boolean;
}

export function AuthErrorBanner({ message, visible }: AuthErrorBannerProps) {
  if (!visible) return null;

  return (
    <div
      role="alert"
      className="auth-error-banner flex items-center gap-2.5 rounded-lg border border-red-200/80 bg-red-50/90 px-3.5 py-2.5"
    >
      <AlertCircle className="size-4 shrink-0 text-red-600" aria-hidden="true" />
      <p className="text-sm font-medium tracking-tight text-red-700">{message}</p>
    </div>
  );
}
