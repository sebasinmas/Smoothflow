import { useCallback, useRef, useState } from "react";

const PULSE_MS = 550;

export function useLoginErrorFeedback() {
  const [inputPulse, setInputPulse] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearError = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setInputPulse(false);
    setShowMessage(false);
    setMessage("");
  }, []);

  const triggerError = useCallback((text = "Credenciales inválidas") => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setShowMessage(false);
    setMessage(text);
    setInputPulse(false);

    requestAnimationFrame(() => {
      setInputPulse(true);
      timerRef.current = setTimeout(() => {
        setInputPulse(false);
        setShowMessage(true);
      }, PULSE_MS);
    });
  }, []);

  return { inputPulse, showMessage, message, triggerError, clearError };
}
