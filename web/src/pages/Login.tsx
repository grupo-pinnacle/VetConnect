import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { user: currentUser, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "VET") navigate("/vet/dashboard", { replace: true });
      else if (currentUser.role === "ADMIN") navigate("/admin/dashboard", { replace: true });
      else navigate("/client/dashboard", { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string } = {};

    if (!email) {
      nextErrors.email = "Ingresá tu email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "El email ingresado no es válido.";
    }

    if (!password) {
      nextErrors.password = "Ingresá tu contraseña.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setServerError("");
    setErrors({});
    setLoading(true);

    try {
      const user = await login({ email, password });
      if (user.role === "VET") {
        navigate("/vet/dashboard");
      } else if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/client/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message || "Email o contraseña incorrectos.");
      } else {
        setServerError("Error al iniciar sesión.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-visual" aria-label="VetConnect, conexión y cuidado veterinario">
        <Link className="auth-visual__back" to="/">
          <Icon name="arrow" />
          Volver al sitio
        </Link>
        <div className="auth-visual__copy">
          <p className="eyebrow eyebrow--light">Conexión + cuidado + cercanía</p>
          <h1>
            Tu mascota.<br />
            Tu veterinario.<br />
            <span>Conectados.</span>
          </h1>
          <p>Una nueva forma de acceder al cuidado veterinario con profesionales matriculados, estés donde estés.</p>
        </div>
        <div className="auth-visual__photo">
          <img src={authPhoto} alt="Tutora sosteniendo con cuidado a su mascota" />
        </div>
        <div className="auth-visual__connection">
          <span><Icon name="heart" /></span>
          <div>
            <strong>Cuidado que se siente cerca</strong>
            <small>Profesionales verificados para cada especie</small>
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
            <h2>Bienvenido de nuevo</h2>
            <p>Accedé a tu cuenta para continuar con VetConnect.</p>
          </header>

          {serverError && (
            <div className="auth-alert auth-alert--error" role="alert">
              <span><Icon name="close" /></span>
              <div>
                <strong>No pudimos iniciar sesión</strong>
                <p>{serverError}</p>
              </div>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className={`auth-field ${errors.email ? "auth-field--error" : ""}`}>
              <span className="auth-field__label">Email</span>
              <span className="auth-field__control">
                <input
                  name="email"
                  type="email"
                  placeholder="ejemplo@vetconnect.com"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  aria-invalid={Boolean(errors.email)}
                  required
                />
              </span>
              {errors.email && <span className="auth-field__message"><Icon name="close" />{errors.email}</span>}
            </label>

            <label className={`auth-field ${errors.password ? "auth-field--error" : ""}`}>
              <span className="auth-field__label">Contraseña</span>
              <span className="auth-field__control">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  aria-invalid={Boolean(errors.password)}
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

            <div className="auth-form__aside">
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>Recuperación protegida con token seguro</span>
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" /> Procesando...
                </>
              ) : (
                <>
                  Iniciar Sesión <Icon name="arrow" />
                </>
              )}
            </button>
          </form>

          <div className="auth-separator"><span>o</span></div>
          <p className="auth-switch">
            ¿Todavía no tenés una cuenta? <Link to="/register">Crear una cuenta</Link>
          </p>
        </div>
        <p className="auth-panel__legal">
          © {new Date().getFullYear()} VetConnect · <Link to="/privacy">Privacidad</Link> · <Link to="/terms">Términos</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
