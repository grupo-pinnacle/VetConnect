import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api, { setAccessToken } from "../../services/api";
import { Alert, Button, Icon } from "../../shared";

type PasswordModalStatus =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "success"; message: string };

export interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

/**
 * Authenticated password change dialog used across Tutor and Veterinarian Settings.
 */
export function ChangePasswordModal({ open, onClose, onSuccess }: ChangePasswordModalProps) {
  const titleId = useId();
  const descId = useId();
  const currentId = useId();
  const newId = useId();
  const confirmId = useId();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [status, setStatus] = useState<PasswordModalStatus>({ kind: "idle" });

  const currentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setStatus({ kind: "idle" });

    const focusTimer = window.setTimeout(() => {
      currentInputRef.current?.focus();
    }, 10);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const isSubmitting = status.kind === "submitting";
  const isSuccess = status.kind === "success";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!currentPassword) {
      setStatus({ kind: "error", message: "Ingresá tu contraseña actual." });
      return;
    }
    if (newPassword.length < 8) {
      setStatus({ kind: "error", message: "La nueva contraseña debe tener al menos 8 caracteres." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ kind: "error", message: "Las contraseñas no coinciden." });
      return;
    }

    setStatus({ kind: "submitting" });
    try {
      const response = await api.patch("/api/users/password", {
        currentPassword,
        newPassword,
      });
      const nextToken = response.data?.data?.accessToken as string | undefined;
      if (nextToken) {
        setAccessToken(nextToken);
      }
      const successMessage = "Tu contraseña se actualizó correctamente.";
      setStatus({ kind: "success", message: successMessage });
      onSuccess?.(successMessage);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: { message?: string } } } };
      const message =
        errObj.response?.data?.error?.message || "No pudimos actualizar tu contraseña. Verificá los datos.";
      setStatus({ kind: "error", message });
    }
  };

  return (
    <div className="modal-layer" role="presentation">
      <button type="button" className="modal-scrim" onClick={onClose} aria-label="Cerrar modal" />
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <button
          type="button"
          className="button button--icon modal__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <Icon name="close" size={18} />
        </button>

        <span className="modal__icon">
          <Icon name="shield" size={22} />
        </span>

        <h2 id={titleId}>Cambiar contraseña</h2>
        <p id={descId}>
          {isSuccess
            ? "Tu sesión actual sigue activa con tu nueva clave."
            : "Ingresá tu contraseña actual y elegí una nueva clave de al menos 8 caracteres."}
        </p>

        {isSuccess ? (
          <div style={{ display: "grid", gap: "16px", marginTop: "18px", textAlign: "left" }}>
            <Alert tone="success" title="Contraseña actualizada">
              {status.message}
            </Alert>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="primary" onClick={onClose}>
                Listo
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "grid", gap: "14px", marginTop: "18px", textAlign: "left" }}
            noValidate
          >
            {status.kind === "error" && (
              <Alert tone="error" title="No se pudo actualizar">
                {status.message}
              </Alert>
            )}

            <label className="field" htmlFor={currentId}>
              <span>Contraseña actual</span>
              <div style={{ position: "relative" }}>
                <input
                  ref={currentInputRef}
                  id={currentId}
                  type={showCurrent ? "text" : "password"}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Tu contraseña actual"
                  style={{ paddingRight: "42px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((prev) => !prev)}
                  aria-label={showCurrent ? "Ocultar contraseña actual" : "Mostrar contraseña actual"}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: 0,
                    background: "transparent",
                    padding: "6px",
                    cursor: "pointer",
                    color: "var(--ink-soft)",
                    display: "inline-flex",
                  }}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <label className="field" htmlFor={newId}>
              <span>Nueva contraseña</span>
              <div style={{ position: "relative" }}>
                <input
                  id={newId}
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  style={{ paddingRight: "42px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew((prev) => !prev)}
                  aria-label={showNew ? "Ocultar nueva contraseña" : "Mostrar nueva contraseña"}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: 0,
                    background: "transparent",
                    padding: "6px",
                    cursor: "pointer",
                    color: "var(--ink-soft)",
                    display: "inline-flex",
                  }}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <label className="field" htmlFor={confirmId}>
              <span>Confirmar nueva contraseña</span>
              <input
                id={confirmId}
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetí tu nueva contraseña"
                required
              />
            </label>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                marginTop: "6px",
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/forgot-password"
                style={{ fontSize: "12px", fontWeight: 700, color: "var(--teal-deep)", textDecoration: "underline" }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
              <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
                <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar contraseña"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
