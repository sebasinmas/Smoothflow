import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "smoothflow.sidebar-collapsed";
const MOBILE_QUERY = "(max-width: 767px)";

function subscribeToMobileQuery(onChange: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

interface SidebarContextValue {
  collapsed: boolean;
  mobileOpen: boolean;
  isMobile: boolean;
  toggle: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true",
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useSyncExternalStore(subscribeToMobileQuery, getMobileSnapshot, () => false);

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  const toggle = useCallback(() => {
    if (isMobile) {
      setMobileOpen((open) => !open);
      return;
    }
    setCollapsed((value) => {
      const next = !value;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, [isMobile]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const value = useMemo(
    () => ({ collapsed, mobileOpen, isMobile, toggle, closeMobile }),
    [collapsed, mobileOpen, isMobile, toggle, closeMobile],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = use(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
