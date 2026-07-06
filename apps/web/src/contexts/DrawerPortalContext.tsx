import {
  createContext,
  use,
  useCallback,
  useState,
  type ReactNode,
} from "react";

interface DrawerPortalContextValue {
  portalEl: HTMLDivElement | null;
  registerPortal: (el: HTMLDivElement | null) => void;
}

const DrawerPortalContext = createContext<DrawerPortalContextValue | null>(null);

export function DrawerPortalProvider({ children }: { children: ReactNode }) {
  const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null);

  const registerPortal = useCallback((el: HTMLDivElement | null) => {
    setPortalEl(el);
  }, []);

  return (
    <DrawerPortalContext.Provider value={{ portalEl, registerPortal }}>
      {children}
    </DrawerPortalContext.Provider>
  );
}

export function useDrawerPortal(): HTMLDivElement | null {
  const ctx = use(DrawerPortalContext);
  return ctx?.portalEl ?? null;
}

export function DrawerPortalOutlet() {
  const ctx = use(DrawerPortalContext);
  if (!ctx) return null;

  return (
    <div
      ref={ctx.registerPortal}
      className="pointer-events-none absolute inset-0 z-modal [&>*]:pointer-events-auto"
      aria-hidden="true"
    />
  );
}
