import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Role } from "../types";
import "../styles/auth.css";

const authPhoto =
  "https://images.unsplash.com/photo-1774218318818-c201207699d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGF0JTIwaG9tZSUyMHdpdGglMjBwZXQlMjByYWJiaXQlMjB3YXJtJTIwbmF0dXJhbCUyMGxpZ2h0fGVufDF8fHx8MTc5MTIyODc4Mnww&ixlib=rb-4.1.0&q=85&w=1400";

function Icon({ name }: { name: string }) {
  if (name === "arrow") {
    return (
      <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14m-5-5 5 5-5 5" />
      </svg>
    );
  }
  if (name === "close") {
    return (
      <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    );
  }
  if (name === "check") {
    return (
      <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m5 12 4 4L19 7" />
      </svg>
    );
  }
  if (name === "heart") {
    return (
      <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 8.5c0 5-8 10-8 10s-8-5-8-10a4.5 4.5 0 0 1 8-2.7A4.5 4.5 0 0 1 20 8.5Z" />
      </svg>
    );
  }
  if (name === "shield") {
    return (
      <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Zm-3 9 2 2 4-5" />
      </svg>
    );
  }
  return null;
}

function Logo() {
  return (
    <Link className="logo" to="/" aria-label="VetConnect, inicio" data-testid="brand-logo">
      <span className="logo__mark">
        <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <path d="M9 11.5c5.8 0 10.5 4.7 10.5 10.5v8.5C13.7 30.5 9 25.8 9 20V11.5Z" fill="currentColor" />
          <path d="M31 11.5c-5.8 0-10.5 4.7-10.5 10.5v8.5C26.3 30.5 31 25.8 31 20V11.5Z" fill="currentColor" opacity=".72" />
          <circle cx="20" cy="9" r="4" fill="currentColor" />
        </svg>
      </span>
      <span>VetConnect</span>
    </Link>
  );
}

export function Register() {
  const [role, setRole] = useState<Role>("CLIENT");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { user: currentUser, register } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "VET") navigate("/vet/dashboard", { replace: true });
      else if (currentUser.role === "ADMIN") navigate("/admin/dashboard", { replace: true });
      else navigate("/client/dashboard", { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!firstName.trim()) nextErrors.firstName = "Ingresá tu nombre.";
    if (!lastName.trim()) nextErrors.lastName = "Ingresá tu apellido.";
    if (!email.trim()) {
      nextErrors.email = "Ingresá tu email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "El email ingresado no es válido.";
    }
    if (!password) {
      nextErrors.password = "Ingresá tu contraseña.";
    } else if (password.length < 8) {
      nextErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    }
    if (role === "VET" && !licenseNumber.trim()) {
      nextErrors.licenseNumber = "Ingresá tu número de matrícula profesional.";
    }

    if (!acceptedTerms) {
      nextErrors.terms = "Debés aceptar los términos y condiciones.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setServerError("");
    setErrors({});
    setLoading(true);

    try {
      const user = await register({
        email,
        password,
        firstName,
        lastName,
        phone,
        role,
        licenseNumber: role === "VET" ? licenseNumber : undefined,
      });

      if (user.role === "VET") {
        navigate("/vet/dashboard");
      } else {
        navigate("/client/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message || "Error al crear la cuenta.");
      } else {
        setServerError("Error al crear la cuenta.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isVet = role === "VET";

  return (
    <main className={`auth-shell ${isVet ? "auth-shell--professional" : ""}`}>
      <section className="auth-visual" aria-label="VetConnect, registro oficial">
        <Link className="auth-visual__back" to="/">
          <Icon name="arrow" />
          Volver al sitio
        </Link>
        <div className="auth-visual__copy">
          <p className="eyebrow eyebrow--light">
            {isVet ? "Un espacio para profesionales" : "Conexión + cuidado + cercanía"}
          </p>
          <h1>
            {isVet ? (
              <>
                Tu experiencia.<br />
                Más cerca.<br />
                <span>Más conectada.</span>
              </>
            ) : (
              <>
                Tu mascota.<br />
                Tu veterinario.<br />
                <span>Conectados.</span>
              </>
            )}
          </h1>
          <p>
            {isVet
              ? "Plataforma oficial para organizar guardia telemática y acompañar a cada paciente."
              : "Registrate en minutos y accedé a guardia veterinaria oficial las 24 horas."}
          </p>
        </div>
        <div className="auth-visual__photo">
          <img src={authPhoto} alt="Tutora y mascota" />
        </div>
        <div className="auth-visual__connection">
          <span><Icon name={isVet ? "shield" : "heart"} /></span>
          <div>
            <strong>{isVet ? "Atención profesional homologada" : "Cuidado que se siente cerca"}</strong>
            <small>{isVet ? "SENASA Res. 1442/2021" : "Profesionales matriculados para cada especie"}</small>
          </div>
        </div>
        <span className="auth-visual__orb auth-visual__orb--one" />
        <span className="auth-visual__orb auth-visual__orb--two" />
      </section>

      <section className="auth-panel">
        <div className="auth-panel__mobile-brand"><Logo /></div>
        <div className="auth-panel__content">
          <header className="auth-header">
            <Logo />
            <h2>Registro en VetConnect</h2>
            <p>Completá tus datos para crear tu cuenta oficial.</p>
          </header>

          {/* Selector de Rol */}
          <div className="role-options" role="radiogroup" aria-label="Tipo de cuenta">
            <button
              className={`role-card ${role === "CLIENT" ? "role-card--selected" : ""}`}
              type="button"
              role="radio"
              aria-checked={role === "CLIENT"}
              onClick={() => setRole("CLIENT")}
            >
              <span className="role-card__icon"><Icon name="heart" /></span>
              {role === "CLIENT" && <span className="role-card__check"><Icon name="check" /></span>}
              <strong>Soy tutor</strong>
              <small>Quiero cuidar y gestionar la atención de mi mascota.</small>
            </button>
            <button
              className={`role-card role-card--professional ${role === "VET" ? "role-card--selected" : ""}`}
              type="button"
              role="radio"
              aria-checked={role === "VET"}
              onClick={() => setRole("VET")}
            >
              <span className="role-card__icon"><Icon name="shield" /></span>
              {role === "VET" && <span className="role-card__check"><Icon name="check" /></span>}
              <strong>Soy veterinario</strong>
              <small>Quiero ofrecer atención médica y gestionar consultas.</small>
            </button>
          </div>

          {serverError && (
            <div className="auth-alert auth-alert--error" role="alert">
              <span><Icon name="close" /></span>
              <div>
                <strong>Error en el registro</strong>
                <p>{serverError}</p>
              </div>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <label className={`auth-field ${errors.firstName ? "auth-field--error" : ""}`}>
                <span className="auth-field__label">Nombre</span>
                <span className="auth-field__control">
                  <input
                    name="firstName"
                    type="text"
                    placeholder="Ej. Lucía"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setErrors((prev) => ({ ...prev, firstName: "" }));
                    }}
                    required
                  />
                </span>
                {errors.firstName && <span className="auth-field__message"><Icon name="close" />{errors.firstName}</span>}
              </label>

              <label className={`auth-field ${errors.lastName ? "auth-field--error" : ""}`}>
                <span className="auth-field__label">Apellido</span>
                <span className="auth-field__control">
                  <input
                    name="lastName"
                    type="text"
                    placeholder="Ej. Gómez"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setErrors((prev) => ({ ...prev, lastName: "" }));
                    }}
                    required
                  />
                </span>
                {errors.lastName && <span className="auth-field__message"><Icon name="close" />{errors.lastName}</span>}
              </label>
            </div>

            <label className={`auth-field ${errors.email ? "auth-field--error" : ""}`}>
              <span className="auth-field__label">Email</span>
              <span className="auth-field__control">
                <input
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  required
                />
              </span>
              {errors.email && <span className="auth-field__message"><Icon name="close" />{errors.email}</span>}
            </label>

            <label className="auth-field">
              <span className="auth-field__label">Teléfono (opcional)</span>
              <span className="auth-field__control">
                <input
                  name="phone"
                  type="tel"
                  placeholder="+54 11 1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </span>
            </label>

            {isVet && (
              <label className={`auth-field ${errors.licenseNumber ? "auth-field--error" : ""}`}>
                <span className="auth-field__label">Matrícula Profesional (MP / MN)</span>
                <span className="auth-field__control">
                  <input
                    name="licenseNumber"
                    type="text"
                    placeholder="Ej. MP-8921"
                    value={licenseNumber}
                    onChange={(e) => {
                      setLicenseNumber(e.target.value);
                      setErrors((prev) => ({ ...prev, licenseNumber: "" }));
                    }}
                    required
                  />
                </span>
                {errors.licenseNumber ? (
                  <span className="auth-field__message"><Icon name="close" />{errors.licenseNumber}</span>
                ) : (
                  <span className="auth-field__helper">* Sujeto a verificación SENASA Res. 1442/2021</span>
                )}
              </label>
            )}

            <label className={`auth-field ${errors.password ? "auth-field--error" : ""}`}>
              <span className="auth-field__label">Contraseña</span>
              <span className="auth-field__control">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  autoComplete="new-password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <span className={`eye-icon ${showPassword ? "eye-icon--visible" : ""}`} />
                </button>
              </span>
              {errors.password && <span className="auth-field__message"><Icon name="close" />{errors.password}</span>}
            </label>

            {/* Checkbox de Términos y Condiciones */}
            <div style={{ marginTop: "8px", padding: "12px", background: "var(--sand)", borderRadius: "var(--radius-sm)" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "12px", color: "var(--ink)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  id="register-terms"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (e.target.checked) setErrors((prev) => ({ ...prev, terms: "" }));
                  }}
                  required
                  aria-required="true"
                  style={{ marginTop: "3px", cursor: "pointer" }}
                />
                <span>
                  He leído y acepto los{" "}
                  <Link to="/terms" target="_blank" style={{ fontWeight: 700, textDecoration: "underline" }}>
                    Términos y Condiciones
                  </Link>
                  , la{" "}
                  <Link to="/privacy" target="_blank" style={{ fontWeight: 700, textDecoration: "underline" }}>
                    Política de Privacidad
                  </Link>{" "}
                  y la{" "}
                  <Link to="/refunds" target="_blank" style={{ fontWeight: 700, textDecoration: "underline" }}>
                    Política de Reembolsos
                  </Link>
                  .
                </span>
              </label>
              {errors.terms && (
                <p style={{ margin: "6px 0 0", fontSize: "11px", color: "var(--coral)", fontWeight: 600 }}>
                  {errors.terms}
                </p>
              )}
            </div>

            <button className="auth-submit" type="submit" disabled={loading} style={{ marginTop: "16px" }}>
              {loading ? (
                <>
                  <span className="spinner" /> Creando cuenta...
                </>
              ) : (
                <>
                  Crear Cuenta <Icon name="arrow" />
                </>
              )}
            </button>
          </form>

          <div className="auth-separator"><span>o</span></div>
          <p className="auth-switch">
            ¿Ya tenés una cuenta? <Link to="/login">Ingresar</Link>
          </p>
        </div>
        <p className="auth-panel__legal">
          © {new Date().getFullYear()} VetConnect · <Link to="/privacy">Privacidad</Link> · <Link to="/terms">Términos</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
