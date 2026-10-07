import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { Icon, Logo } from "./Landing";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

type AuthRoute =
  | "/login"
  | "/register"
  | "/register/tutor"
  | "/register/veterinarian"
  | "/forgot-password";

type FieldErrors = Record<string, string>;

const authPhoto =
  "https://images.unsplash.com/photo-1774218318818-c201207699d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGF0JTIwaG9tZSUyMHdpdGglMjBwZXQlMjByYWJiaXQlMjB3YXJtJTIwbmF0dXJhbCUyMGxpZ2h0fGVufDF8fHx8MTc5MTIyODc4Mnww&ixlib=rb-4.1.0&q=85&w=1400";

function normalizeRoute(pathname: string): AuthRoute {
  if (pathname === "/register/tutor") return "/register/tutor";
  if (pathname === "/register/veterinarian") return "/register/veterinarian";
  if (pathname === "/register") return "/register";
  if (pathname === "/forgot-password") return "/forgot-password";
  return "/login";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function AuthLink({
  to,
  navigate,
  children,
  className = "",
}: {
  to: AuthRoute;
  navigate: (route: AuthRoute) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      className={className}
      href={to}
      onClick={(event) => {
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

function AuthShell({
  children,
  professional = false,
}: {
  children: ReactNode;
  professional?: boolean;
}) {
  return (
    <main className={`auth-shell ${professional ? "auth-shell--professional" : ""}`}>
      <section className="auth-visual" aria-label="VetConnect, conexión y cuidado veterinario">
        <a className="auth-visual__back" href="/">
          <Icon name="arrow" />
          Volver al sitio
        </a>
        <div className="auth-visual__copy">
          <p className="eyebrow eyebrow--light">
            {professional ? "Un espacio para profesionales" : "Conexión + cuidado + cercanía"}
          </p>
          <h1>
            {professional ? (
              <>
                Tu experiencia.
                <br />
                Más cerca.
                <br />
                <span>Más conectada.</span>
              </>
            ) : (
              <>
                Tu mascota.
                <br />
                Tu veterinario.
                <br />
                <span>Conectados.</span>
              </>
            )}
          </h1>
          <p>
            {professional
              ? "Una plataforma para organizar tu atención online y acompañar mejor a cada paciente."
              : "Una nueva forma de acceder al cuidado veterinario, estés donde estés."}
          </p>
        </div>
        <div className="auth-visual__photo">
          <img src={authPhoto} alt="Tutora sosteniendo con cuidado a su conejo" />
        </div>
        <div className="auth-visual__connection">
          <span><Icon name={professional ? "calendar" : "heart"} /></span>
          <div>
            <strong>{professional ? "Agenda conectada" : "Cuidado que se siente cerca"}</strong>
            <small>{professional ? "Pacientes, consultas y seguimiento" : "Profesionales para cada especie"}</small>
          </div>
        </div>
        <span className="auth-visual__orb auth-visual__orb--one" />
        <span className="auth-visual__orb auth-visual__orb--two" />
      </section>
      <section className="auth-panel">
        <div className="auth-panel__mobile-brand"><Logo /></div>
        <div className="auth-panel__content">{children}</div>
        <p className="auth-panel__legal">© 2025 VetConnect · Privacidad · Términos</p>
      </section>
    </main>
  );
}

function AuthHeader({
  title,
  copy,
}: {
  title: string;
  copy: string;
}) {
  return (
    <header className="auth-header">
      <Logo />
      <h2>{title}</h2>
      <p>{copy}</p>
    </header>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  value,
  error,
  helper,
  disabled = false,
  autoComplete,
  onChange,
  children,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  error?: string;
  helper?: string;
  disabled?: boolean;
  autoComplete?: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  children?: ReactNode;
}) {
  return (
    <label className={`auth-field ${error ? "auth-field--error" : ""} ${disabled ? "auth-field--disabled" : ""}`}>
      <span className="auth-field__label">{label}</span>
      <span className="auth-field__control">
        {children ? (
          <select name={name} value={value} disabled={disabled} onChange={onChange}>
            {children}
          </select>
        ) : (
          <input
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            autoComplete={autoComplete}
            onChange={onChange}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${name}-error` : undefined}
          />
        )}
        {error && <Icon name="close" />}
      </span>
      {error ? (
        <span className="auth-field__message" id={`${name}-error`}><Icon name="close" />{error}</span>
      ) : helper ? (
        <span className="auth-field__helper">{helper}</span>
      ) : null}
    </label>
  );
}

function PasswordField({
  label,
  name,
  value,
  error,
  onChange,
  autoComplete = "new-password",
}: {
  label: string;
  name: string;
  value: string;
  error?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className={`auth-field ${error ? "auth-field--error" : ""}`}>
      <span className="auth-field__label">{label}</span>
      <span className="auth-field__control">
        <input
          name={name}
          type={visible ? "text" : "password"}
          placeholder="••••••••"
          value={value}
          autoComplete={autoComplete}
          onChange={onChange}
          aria-invalid={Boolean(error)}
        />
        <button
          className="password-toggle"
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          <span className={`eye-icon ${visible ? "eye-icon--visible" : ""}`} />
        </button>
      </span>
      {error && <span className="auth-field__message"><Icon name="close" />{error}</span>}
    </label>
  );
}

function SubmitButton({
  children,
  loading = false,
  disabled = false,
}: {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button className="auth-submit" type="submit" disabled={disabled || loading}>
      {loading ? <><span className="spinner" />Procesando...</> : <>{children}<Icon name="arrow" /></>}
    </button>
  );
}

function Alert({
  variant,
  title,
  children,
}: {
  variant: "error" | "success" | "info";
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className={`auth-alert auth-alert--${variant}`} role={variant === "error" ? "alert" : "status"}>
      <span><Icon name={variant === "error" ? "close" : variant === "success" ? "check" : "message"} /></span>
      <div><strong>{title}</strong>{children && <p>{children}</p>}</div>
    </div>
  );
}

function SuccessState({
  title,
  copy,
  action,
  onContinue,
}: {
  title: string;
  copy: string;
  action: string;
  onContinue: () => void;
}) {
  return (
    <div className="auth-success">
      <div className="auth-success__mark"><Icon name="check" /><span /><span /></div>
      <p className="eyebrow">Todo listo</p>
      <h2>{title}</h2>
      <p>{copy}</p>
      <button className="auth-submit" type="button" onClick={onContinue}>{action}<Icon name="arrow" /></button>
      <div className="auth-success__note"><Icon name="shield" />Tu información queda protegida dentro de VetConnect.</div>
    </div>
  );
}

function Login({ navigate }: { navigate: (route: AuthRoute) => void }) {
  const { login } = useAuth();
  const [data, setData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const destination = data.email.toLowerCase().startsWith("vet")
    ? "/vet/dashboard"
    : "/client/dashboard";

  const update = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setData((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: "" }));
    setServerError("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next: FieldErrors = {};
    if (!isValidEmail(data.email)) next.email = "El email ingresado no es válido.";
    if (!data.password) next.password = "Ingresá tu contraseña.";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setLoading(true);
    setServerError("");
    try {
      await login({ email: data.email, password: data.password });
      setSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || "El email o la contraseña no coinciden. Revisá los datos e intentá nuevamente.";
      setServerError(msg);
      setErrors({ password: "Credenciales inválidas." });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SuccessState
        title="Inicio de sesión correcto"
        copy="Ya estás dentro de VetConnect. Estamos preparando tu espacio personal."
        action="Continuar"
        onContinue={() => {
          window.location.href = destination;
        }}
      />
    );
  }

  return (
    <>
      <AuthHeader title="Bienvenido de nuevo" copy="Accedé a tu cuenta para continuar con VetConnect." />
      {serverError && <Alert variant="error" title="No pudimos iniciar sesión">{serverError}</Alert>}
      <form className="auth-form" onSubmit={submit} noValidate>
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          value={data.email}
          error={errors.email}
          autoComplete="email"
          onChange={update}
        />
        <PasswordField
          label="Contraseña"
          name="password"
          value={data.password}
          error={errors.password}
          autoComplete="current-password"
          onChange={update}
        />
        <div className="auth-form__aside">
          <AuthLink to="/forgot-password" navigate={navigate}>¿Olvidaste tu contraseña?</AuthLink>
        </div>
        <SubmitButton loading={loading}>{loading ? "Ingresando..." : "Ingresar"}</SubmitButton>
      </form>
      <div className="auth-separator"><span>o</span></div>
      <p className="auth-switch">¿Todavía no tenés una cuenta? <AuthLink to="/register" navigate={navigate}>Crear una cuenta</AuthLink></p>
      <p className="auth-demo-note">Usá un email que comience con <strong>vet</strong> para ingresar al portal profesional, o <strong>error@vetconnect.com</strong> para visualizar un error.</p>
    </>
  );
}

function RoleSelection({ navigate }: { navigate: (route: AuthRoute) => void }) {
  const [selected, setSelected] = useState<"tutor" | "veterinarian" | null>(null);
  return (
    <>
      <AuthHeader title="¿Cómo querés usar VetConnect?" copy="Elegí el espacio que mejor representa lo que necesitás hoy." />
      <div className="role-options" role="radiogroup" aria-label="Tipo de cuenta">
        <button
          className={`role-card ${selected === "tutor" ? "role-card--selected" : ""}`}
          type="button"
          role="radio"
          aria-checked={selected === "tutor"}
          onClick={() => setSelected("tutor")}
        >
          <span className="role-card__icon"><Icon name="heart" /></span>
          <span className="role-card__check"><Icon name="check" /></span>
          <strong>Soy tutor</strong>
          <small>Quiero cuidar y gestionar la atención de mi mascota.</small>
        </button>
        <button
          className={`role-card role-card--professional ${selected === "veterinarian" ? "role-card--selected" : ""}`}
          type="button"
          role="radio"
          aria-checked={selected === "veterinarian"}
          onClick={() => setSelected("veterinarian")}
        >
          <span className="role-card__icon"><Icon name="shield" /></span>
          <span className="role-card__check"><Icon name="check" /></span>
          <strong>Soy veterinario</strong>
          <small>Quiero ofrecer atención y gestionar mis consultas.</small>
        </button>
      </div>
      <button
        className="auth-submit"
        type="button"
        disabled={!selected}
        onClick={() => navigate(selected === "veterinarian" ? "/register/veterinarian" : "/register/tutor")}
      >
        Continuar <Icon name="arrow" />
      </button>
      <p className="auth-switch">¿Ya tenés una cuenta? <AuthLink to="/login" navigate={navigate}>Ingresar</AuthLink></p>
    </>
  );
}

type PersonalData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

const emptyPersonal: PersonalData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

function PasswordStrength({ password }: { password: string }) {
  const score = passwordScore(password);
  const labels = ["Muy débil", "Muy débil", "Débil", "Buena", "Fuerte"];
  return (
    <div className={`password-strength password-strength--${score}`}>
      <div>{[1, 2, 3, 4].map((item) => <span className={score >= item ? "active" : ""} key={item} />)}</div>
      <small>Seguridad: <strong>{labels[score]}</strong></small>
    </div>
  );
}

function PersonalFields({
  data,
  errors,
  update,
}: {
  data: PersonalData;
  errors: FieldErrors;
  update: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}) {
  return (
    <>
      <div className="auth-form__row">
        <Field label="Nombre" name="firstName" placeholder="Tu nombre" value={data.firstName} error={errors.firstName} autoComplete="given-name" onChange={update} />
        <Field label="Apellido" name="lastName" placeholder="Tu apellido" value={data.lastName} error={errors.lastName} autoComplete="family-name" onChange={update} />
      </div>
      <Field label="Email" name="email" type="email" placeholder="tu@email.com" value={data.email} error={errors.email} autoComplete="email" onChange={update} />
      <PasswordField label="Contraseña" name="password" value={data.password} error={errors.password} onChange={update} />
      {data.password && <PasswordStrength password={data.password} />}
      <PasswordField label="Confirmar contraseña" name="confirmPassword" value={data.confirmPassword} error={errors.confirmPassword} onChange={update} />
    </>
  );
}

function validatePersonal(data: PersonalData) {
  const next: FieldErrors = {};
  if (!data.firstName.trim()) next.firstName = "Este campo es obligatorio.";
  if (!data.lastName.trim()) next.lastName = "Este campo es obligatorio.";
  if (!isValidEmail(data.email)) next.email = "Ingresá un email válido.";
  if (data.email.toLowerCase() === "hola@vetconnect.com") next.email = "Ya existe una cuenta asociada a este email.";
  if (passwordScore(data.password) < 2) next.password = "Usá al menos 8 caracteres, mayúsculas y números.";
  if (data.password !== data.confirmPassword) next.confirmPassword = "Las contraseñas no coinciden.";
  return next;
}

function Terms({
  checked,
  error,
  onChange,
}: {
  checked: boolean;
  error?: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div>
      <label className={`auth-checkbox ${error ? "auth-checkbox--error" : ""}`}>
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        <span><Icon name="check" /></span>
        <small>Acepto los <a href="#">términos y condiciones</a> y la <a href="#">política de privacidad</a>.</small>
      </label>
      {error && <span className="auth-field__message"><Icon name="close" />{error}</span>}
    </div>
  );
}

function TutorRegister({ navigate }: { navigate: (route: AuthRoute) => void }) {
  const { register } = useAuth();
  const [data, setData] = useState<PersonalData>(emptyPersonal);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const update = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setData((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: "" }));
    setServerError("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next = validatePersonal(data);
    if (!data.terms) next.terms = "Debés aceptar los términos para continuar.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    setServerError("");
    try {
      await register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "CLIENT",
      });
      setSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || "Error al registrar la cuenta. Revisá los datos ingresados.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SuccessState
        title="Tu cuenta está lista."
        copy="Ahora podés organizar la información de tu mascota y conectar con profesionales veterinarios."
        action="Continuar"
        onContinue={() => navigate("/login")}
      />
    );
  }

  return (
    <>
      <AuthHeader title="Creá tu cuenta" copy="Empezá a conectar con profesionales y mantené organizada la información de tu mascota." />
      {serverError && <Alert variant="error" title="No pudimos registrarte">{serverError}</Alert>}
      <form className="auth-form" onSubmit={submit} noValidate>
        <PersonalFields data={data} errors={errors} update={update} />
        <Terms checked={data.terms} error={errors.terms} onChange={(terms) => { setData((current) => ({ ...current, terms })); setErrors((current) => ({ ...current, terms: "" })); }} />
        <SubmitButton loading={loading}>Crear cuenta</SubmitButton>
      </form>
      <p className="auth-switch">¿Ya tenés una cuenta? <AuthLink to="/login" navigate={navigate}>Ingresar</AuthLink></p>
    </>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="auth-stepper" aria-label={`Paso ${step} de 3`}>
      {["Datos personales", "Información profesional", "Confirmación"].map((label, index) => {
        const number = index + 1;
        const state = number < step ? "completed" : number === step ? "current" : "upcoming";
        return (
          <div className={`auth-stepper__item auth-stepper__item--${state}`} key={label}>
            <span>{number < step ? <Icon name="check" /> : `0${number}`}</span>
            <small>{label}</small>
          </div>
        );
      })}
    </div>
  );
}

function VetRegister({ navigate }: { navigate: (route: AuthRoute) => void }) {
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    ...emptyPersonal,
    licenseNumber: "",
    province: "",
    specialty: "",
    experienceYears: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const update = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setData((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: "" }));
    setServerError("");
  };

  const next = async (event: FormEvent) => {
    event.preventDefault();
    if (step === 1) {
      const personal = validatePersonal(data);
      setErrors(personal);
      if (Object.keys(personal).length) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      const professional: FieldErrors = {};
      if (!data.licenseNumber.trim()) professional.licenseNumber = "Ingresá tu matrícula profesional.";
      if (!data.province) professional.province = "Seleccioná una jurisdicción.";
      if (!data.specialty) professional.specialty = "Seleccioná una especialidad.";
      if (!data.experienceYears) professional.experienceYears = "Ingresá tus años de experiencia.";
      setErrors(professional);
      if (Object.keys(professional).length) return;
      setStep(3);
      return;
    }
    if (!data.terms) {
      setErrors({ terms: "Debés aceptar los términos para continuar." });
      return;
    }
    setLoading(true);
    setServerError("");
    try {
      await register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "VET",
        licenseNumber: data.licenseNumber,
        specialty: data.specialty,
      });
      setSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || "Error al registrar el perfil profesional.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SuccessState
        title="Tu perfil fue creado."
        copy="Completá tu información profesional para comenzar a formar parte de VetConnect."
        action="Continuar con mi perfil"
        onContinue={() => navigate("/login")}
      />
    );
  }

  return (
    <>
      <AuthHeader title="Unite como profesional" copy="Conectá tu experiencia veterinaria con tutores que necesitan orientación y seguimiento." />
      {serverError && <Alert variant="error" title="No pudimos registrarte">{serverError}</Alert>}
      <Stepper step={step} />
      <form className="auth-form" onSubmit={next} noValidate>
        {step === 1 && <PersonalFields data={data} errors={errors} update={update} />}
        {step === 2 && (
          <>
            <Alert variant="info" title="Información profesional">Estos datos permiten preparar tu perfil. No implican una verificación automática.</Alert>
            <Field label="Matrícula profesional" name="licenseNumber" placeholder="Ej. MP 12345" value={data.licenseNumber} error={errors.licenseNumber} onChange={update} />
            <Field label="Provincia / jurisdicción" name="province" value={data.province} error={errors.province} onChange={update}>
              <option value="">Seleccionar jurisdicción</option>
              <option>Buenos Aires</option><option>CABA</option><option>Córdoba</option><option>Santa Fe</option><option>Mendoza</option><option>Otra</option>
            </Field>
            <div className="auth-form__row">
              <Field label="Especialidad" name="specialty" value={data.specialty} error={errors.specialty} onChange={update}>
                <option value="">Seleccionar</option>
                <option>Clínica general</option><option>Animales exóticos</option><option>Dermatología</option><option>Cardiología</option><option>Odontología</option>
              </Field>
              <Field label="Años de experiencia" name="experienceYears" type="number" placeholder="Ej. 5" value={data.experienceYears} error={errors.experienceYears} onChange={update} />
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div className="auth-review">
              <div className="auth-review__head"><span><Icon name="shield" /></span><div><strong>Revisá tu información</strong><small>Podrás completar tu perfil más adelante.</small></div></div>
              <dl>
                <div><dt>Profesional</dt><dd>{data.firstName} {data.lastName}</dd></div>
                <div><dt>Email</dt><dd>{data.email}</dd></div>
                <div><dt>Matrícula</dt><dd>{data.licenseNumber}</dd></div>
                <div><dt>Especialidad</dt><dd>{data.specialty}</dd></div>
              </dl>
            </div>
            <Terms checked={data.terms} error={errors.terms} onChange={(terms) => { setData((current) => ({ ...current, terms })); setErrors({}); }} />
          </>
        )}
        <div className="auth-form__buttons">
          {step > 1 && <button className="auth-back-button" type="button" onClick={() => { setStep((current) => current - 1); setErrors({}); }}>Volver</button>}
          <SubmitButton loading={loading}>{step === 3 ? "Crear perfil profesional" : "Continuar"}</SubmitButton>
        </div>
      </form>
      <p className="auth-switch">¿Ya tenés una cuenta? <AuthLink to="/login" navigate={navigate}>Ingresar</AuthLink></p>
    </>
  );
}

function ForgotPassword({ navigate }: { navigate: (route: AuthRoute) => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError("Ingresá un email válido.");
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 900);
  };

  if (sent) {
    return (
      <SuccessState
        title="Revisá tu correo"
        copy="Si existe una cuenta asociada a este email, recibirás instrucciones para recuperar el acceso."
        action="Volver al inicio de sesión"
        onContinue={() => navigate("/login")}
      />
    );
  }

  return (
    <>
      <AuthHeader title="Recuperá tu acceso" copy="Te enviaremos instrucciones para restablecer tu contraseña." />
      <form className="auth-form" onSubmit={submit} noValidate>
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          error={error}
          autoComplete="email"
          onChange={(event) => { setEmail(event.target.value); setError(""); }}
        />
        <SubmitButton loading={loading}>Enviar instrucciones</SubmitButton>
      </form>
      <p className="auth-switch"><AuthLink to="/login" navigate={navigate}>← Volver a ingresar</AuthLink></p>
    </>
  );
}

export default function AuthExperience() {
  const [route, setRoute] = useState<AuthRoute>(() => normalizeRoute(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => setRoute(normalizeRoute(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (next: AuthRoute) => {
    window.history.pushState({}, "", next);
    setRoute(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const content = useMemo(() => {
    if (route === "/register") return <RoleSelection navigate={navigate} />;
    if (route === "/register/tutor") return <TutorRegister navigate={navigate} />;
    if (route === "/register/veterinarian") return <VetRegister navigate={navigate} />;
    if (route === "/forgot-password") return <ForgotPassword navigate={navigate} />;
    return <Login navigate={navigate} />;
  }, [route]);

  return <AuthShell professional={route === "/register/veterinarian"}>{content}</AuthShell>;
}
