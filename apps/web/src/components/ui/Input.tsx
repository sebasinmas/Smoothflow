import {
  useState,
  type InputHTMLAttributes,
  type ComponentType,
  type Ref,
} from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  IdCard,
  type LucideProps,
} from "lucide-react";

type LucideIcon = ComponentType<LucideProps>;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
  label: string;
  error?: string;
  errorPulse?: boolean;
  icon?: LucideIcon | null;
}

function getDefaultIcon(type?: string, label?: string): LucideIcon | undefined {
  if (type === "email") return Mail;
  if (type === "password") return Lock;
  if (type === "tel") return Phone;

  const normalized = label?.toLowerCase() ?? "";
  if (normalized.includes("email")) return Mail;
  if (normalized.includes("contraseña")) return Lock;
  if (normalized.includes("teléfono") || normalized.includes("telefono")) return Phone;
  if (normalized.includes("rut")) return IdCard;
  if (normalized.includes("nombre") || normalized.includes("apellido")) return User;

  return undefined;
}

export function Input({
  ref,
  label,
  error,
  errorPulse,
  id,
  className = "",
  type,
  icon,
  ...props
}: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const isPassword = type === "password";
  const [visible, setVisible] = useState(false);

  const StartIcon = icon === null ? undefined : (icon ?? getDefaultIcon(type, label));
  const hasStartIcon = !!StartIcon;
  const hasToggle = isPassword;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-text">
        {label}
      </label>
      <div className="relative">
        {StartIcon && (
          <StartIcon
            className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
        )}
        <input
          ref={ref}
          id={inputId}
          type={isPassword && visible ? "text" : type}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`h-12 w-full rounded border border-border bg-white text-sm text-text transition-colors duration-200 placeholder:text-text-muted hover:border-brand/40 focus-visible:border-brand ${
            errorPulse ? "login-input-error" : ""
          } ${hasStartIcon ? "pl-10" : "px-3"} ${hasToggle ? "pr-10" : hasStartIcon ? "pr-3" : ""} ${className}`}
          {...props}
        />
        {hasToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text"
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            tabIndex={-1}
          >
            {!visible ? (
              <EyeOff className="size-[18px]" aria-hidden="true" />
            ) : (
              <Eye className="size-[18px]" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
