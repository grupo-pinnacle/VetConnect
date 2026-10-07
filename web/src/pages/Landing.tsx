import { useEffect, useState, type ReactNode } from "react";

const photos = {
  rabbit:
    "https://images.unsplash.com/photo-1774218318818-c201207699d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGF0JTIwaG9tZSUyMHdpdGglMjBwZXQlMjByYWJiaXQlMjB3YXJtJTIwbmF0dXJhbCUyMGxpZ2h0fGVufDF8fHx8MTc5MTIyODc4Mnww&ixlib=rb-4.1.0&q=85&w=1400",
  rabbitClose:
    "https://images.unsplash.com/photo-1774218308330-df953d1e334b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHx3b21hbiUyMGF0JTIwaG9tZSUyMHdpdGglMjBwZXQlMjByYWJiaXQlMjB3YXJtJTIwbmF0dXJhbCUyMGxpZ2h0fGVufDF8fHx8MTc5MTIyODc4Mnww&ixlib=rb-4.1.0&q=85&w=1200",
  vet:
    "https://images.unsplash.com/photo-1770836037793-95bdbf190f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHx2ZXRlcmluYXJpYW4lMjBjbGluaWMlMjB3b3JraW5nJTIwYW5pbWFsJTIwZG9jdG9yJTIwY2FuZGlkfGVufDF8fHx8MTc5MTIyODgwMXww&ixlib=rb-4.1.0&q=85&w=1200",
  parrot:
    "https://images.unsplash.com/photo-1728145289384-a2a38506e9d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxwZXQlMjBwYXJyb3QlMjBvd25lciUyMGhvbWUlMjBuYXR1cmFsJTIwbGlnaHR8ZW58MXx8fHwxNzkxMjI4NzgzfDA&ixlib=rb-4.1.0&q=85&w=900",
  ferret:
    "https://images.unsplash.com/photo-1440500122534-703c6966f83d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxwZXQlMjBmZXJyZXQlMjBob21lJTIwcG9ydHJhaXQlMjB3YXJtfGVufDF8fHx8MTc5MTIyODc4M3ww&ixlib=rb-4.1.0&q=85&w=1000",
  turtle:
    "https://images.unsplash.com/photo-1691211237213-8b84884acdda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjB0dXJ0bGUlMjByZXB0aWxlJTIwaG9tZSUyMHBvcnRyYWl0fGVufDF8fHx8MTc5MTIyODc4NHww&ixlib=rb-4.1.0&q=85&w=900",
};

export type IconName =
  | "arrow"
  | "calendar"
  | "camera"
  | "check"
  | "clock"
  | "close"
  | "heart"
  | "home"
  | "history"
  | "location"
  | "menu"
  | "message"
  | "bell"
  | "paw"
  | "plus"
  | "profile"
  | "shield"
  | "search"
  | "spark"
  | "star";

export function Icon({ name, className = "icon" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4m8-4v4M3 10h18m-13 4h3m2 0h3m-8 3h3" />
      </>
    ),
    camera: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="4" />
        <path d="m9 6 1.2-2h3.6L15 6m-6 6.5a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 7" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    heart: <path d="M20 8.5c0 5-8 10-8 10s-8-5-8-10a4.5 4.5 0 0 1 8-2.7A4.5 4.5 0 0 1 20 8.5Z" />,
    home: <path d="m3 11 9-8 9 8m-2-2v12h-5v-6h-4v6H5V9" />,
    history: (
      <>
        <path d="M4 12a8 8 0 1 0 2-5.3L4 9" />
        <path d="M4 4v5h5m3-2v5l3 2" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    menu: <path d="M4 8h16M4 16h16" />,
    message: (
      <>
        <path d="M4 5h16v12H9l-5 4V5Z" />
        <path d="M8 10h8m-8 3h5" />
      </>
    ),
    bell: <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8Zm-8 11h4" />,
    paw: (
      <>
        <ellipse cx="12" cy="15" rx="5" ry="4" />
        <circle cx="6.5" cy="10" r="2" />
        <circle cx="10" cy="6.5" r="2" />
        <circle cx="14" cy="6.5" r="2" />
        <circle cx="17.5" cy="10" r="2" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c.5-5 3-7 8-7s7.5 2 8 7" />
      </>
    ),
    shield: <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Zm-3 9 2 2 4-5" />,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></>,
    spark: <path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Zm6 13 .8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8L18 16Z" />,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <a className={`logo ${light ? "logo--light" : ""}`} href="/#inicio" aria-label="VetConnect, inicio">
      <span className="logo__mark">
        <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <path d="M9 11.5c5.8 0 10.5 4.7 10.5 10.5v8.5C13.7 30.5 9 25.8 9 20V11.5Z" fill="currentColor" />
          <path d="M31 11.5c-5.8 0-10.5 4.7-10.5 10.5v8.5C26.3 30.5 31 25.8 31 20V11.5Z" fill="currentColor" opacity=".72" />
          <circle cx="20" cy="9" r="4" fill="currentColor" />
        </svg>
      </span>
      <span>VetConnect</span>
    </a>
  );
}

export function Button({
  children,
  href = "#",
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "cream" | "ghost";
  className?: string;
}) {
  return (
    <a className={`button button--${variant} ${className}`} href={href}>
      <span>{children}</span>
      {variant !== "ghost" && <Icon name="arrow" />}
    </a>
  );
}

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`eyebrow ${light ? "eyebrow--light" : ""}`}>{children}</p>;
}

function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "left",
  light = false,
}: {
  eyebrow: string;
  title: ReactNode;
  copy?: string;
  align?: "left" | "center";
  light?: boolean;
}) {
  return (
    <div className={`section-heading section-heading--${align} ${light ? "section-heading--light" : ""}`}>
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}

function PetProfile() {
  return (
    <div className="product-card pet-profile">
      <div className="product-card__top">
        <span className="ui-label">Perfil de paciente</span>
        <span className="status-dot">Actualizado</span>
      </div>
      <div className="pet-profile__identity">
        <div className="pet-avatar pet-avatar--rabbit" />
        <div>
          <h4>Olivia</h4>
          <p>Conejo belier · 3 años</p>
        </div>
        <button aria-label="Más opciones">•••</button>
      </div>
      <div className="pet-profile__stats">
        <div><span>Peso</span><strong>2.1 kg</strong></div>
        <div><span>Última consulta</span><strong>12 Jun</strong></div>
        <div><span>Estado</span><strong className="good">Estable</strong></div>
      </div>
      <div className="pet-profile__note">
        <Icon name="history" />
        <div><strong>Seguimiento nutricional</strong><span>Próximo control en 8 días</span></div>
      </div>
    </div>
  );
}

function ScheduleCard() {
  return (
    <div className="product-card schedule-card">
      <div className="product-card__top">
        <span className="ui-label">Agenda de hoy</span>
        <Icon name="calendar" />
      </div>
      <div className="schedule-card__date"><strong>18</strong><span>JUN<br />MIÉRCOLES</span></div>
      {[
        ["09:30", "Olivia · Conejo", "Seguimiento"],
        ["11:00", "Mango · Ave", "Consulta"],
        ["15:30", "Tito · Hurón", "Prevención"],
      ].map((item, index) => (
        <div className={`appointment ${index === 1 ? "appointment--active" : ""}`} key={item[0]}>
          <span>{item[0]}</span><div><strong>{item[1]}</strong><small>{item[2]}</small></div>
        </div>
      ))}
    </div>
  );
}

const faqs = [
  ["¿Qué es VetConnect?", "VetConnect es una plataforma que conecta tutores de mascotas con profesionales veterinarios para recibir orientación y atención online de forma simple y cercana."],
  ["¿Cómo funciona una consulta online?", "Elegís el tipo de atención, completás la información básica de tu mascota y seleccionás un profesional disponible. La consulta se realiza por videollamada dentro de la plataforma."],
  ["¿Qué animales puedo atender?", "La plataforma está pensada para perros, gatos y también animales no convencionales como conejos, aves, hurones, reptiles, roedores y peces."],
  ["¿Puedo consultar por una emergencia?", "Podés recibir orientación rápida para entender los próximos pasos. Ante riesgo vital o una urgencia grave, siempre debés acudir a un centro veterinario presencial."],
  ["¿Las consultas online reemplazan una visita presencial?", "No siempre. La consulta online complementa la atención presencial y permite orientar, acompañar y definir cuándo es necesario un examen físico."],
  ["¿Cómo encuentro un veterinario?", "Podés filtrar profesionales por especialidad, especies atendidas, disponibilidad y tipo de consulta."],
  ["¿Cómo trabajan los veterinarios en VetConnect?", "Los profesionales gestionan su perfil, disponibilidad, consultas y seguimiento desde un espacio diseñado específicamente para la atención veterinaria."],
  ["¿Qué información necesito para comenzar?", "Datos básicos de tu mascota, el motivo de la consulta y, si los tenés, antecedentes o estudios recientes. Podés completar el perfil progresivamente."],
];

export function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="site-shell" id="inicio">
      <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
        <div className="container site-header__inner">
          <Logo />
          <nav className="desktop-nav" aria-label="Navegación principal">
            <a className="active" href="#inicio">Inicio</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#tutores">Para tutores</a>
            <a href="#veterinarios">Para veterinarios</a>
            <a href="#preguntas">Preguntas frecuentes</a>
          </nav>
          <div className="site-header__actions">
            <Button href="/login" variant="ghost">Ingresar</Button>
            <Button href="/register">Comenzar consulta</Button>
          </div>
          <button
            className="menu-button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav" aria-label="Navegación móvil">
            {[
              ["Inicio", "#inicio"],
              ["Cómo funciona", "#como-funciona"],
              ["Para tutores", "#tutores"],
              ["Para veterinarios", "#veterinarios"],
              ["Preguntas frecuentes", "#preguntas"],
            ].map(([label, href]) => (
              <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}<Icon name="arrow" /></a>
            ))}
            <Button href="/register">Comenzar consulta</Button>
          </nav>
        )}
      </header>

      <section className="hero section">
        <div className="hero__wash" />
        <div className="container hero__grid">
          <div className="hero__copy">
            <Eyebrow>Atención veterinaria online</Eyebrow>
            <h1>Tu mascota.<br />Tu veterinario.<br /><span>Conectados.</span></h1>
            <p>Conectamos tutores con profesionales veterinarios para acceder a orientación y atención online de manera simple, humana y cercana.</p>
            <div className="hero__actions">
              <Button href="/register">Comenzar consulta</Button>
              <Button href="#como-funciona" variant="secondary">Conocer cómo funciona</Button>
            </div>
            <div className="hero__proof">
              <div className="avatar-stack">
                <span className="avatar avatar--one" />
                <span className="avatar avatar--two" />
                <span className="avatar avatar--three" />
              </div>
              <p><strong>Profesionales verificados</strong><br />para cuidar a cada especie</p>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-visual__orb" />
            <div className="hero-visual__photo">
              <img src={photos.rabbit} alt="Tutora sosteniendo con cuidado a su conejo" />
            </div>
            <div className="floating-card floating-card--vet">
              <span className="mini-avatar mini-avatar--vet" />
              <div><strong>Dra. Paula López</strong><span>Animales no convencionales</span></div>
              <span className="online-dot" />
            </div>
            <div className="floating-card floating-card--call">
              <span className="floating-card__icon"><Icon name="camera" /></span>
              <div><strong>Consulta conectada</strong><span>Videollamada segura</span></div>
            </div>
            <div className="connection-line connection-line--one" />
            <div className="connection-line connection-line--two" />
            <div className="species-pill species-pill--bird">Aves</div>
            <div className="species-pill species-pill--rabbit">Conejos</div>
          </div>
        </div>
      </section>

      <section className="trust-band">
        <div className="container trust-band__inner">
          <div className="trust-band__intro">
            <Icon name="heart" />
            <h2>Cuando necesitás orientación, no siempre podés esperar.</h2>
          </div>
          <div className="trust-band__items">
            {[
              ["camera", "Atención online"],
              ["shield", "Profesionales veterinarios"],
              ["paw", "Diferentes mascotas"],
              ["location", "Desde cualquier lugar"],
            ].map(([icon, label]) => (
              <div className="trust-item" key={label}><Icon name={icon as IconName} /><span>{label}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section how" id="como-funciona">
        <div className="container">
          <SectionHeading eyebrow="Cómo funciona" title={<>Cuidar también puede<br />ser más simple.</>} copy="Un camino claro desde tu primera duda hasta el seguimiento, siempre acompañado por un profesional." />
          <div className="steps">
            {[
              ["01", "profile", "Contanos sobre tu mascota.", "Completá su perfil y el motivo de tu consulta."],
              ["02", "shield", "Encontrá un profesional.", "Elegí por especie, especialidad y disponibilidad."],
              ["03", "camera", "Conectate a la consulta.", "Conversá online desde donde te resulte cómodo."],
              ["04", "history", "Recibí seguimiento.", "Guardá indicaciones e información en un solo lugar."],
            ].map(([number, icon, title, copy], index) => (
              <article className={`step step--${index + 1}`} key={number}>
                <span className="step__number">{number}</span>
                <span className="step__icon"><Icon name={icon as IconName} /></span>
                <h3>{title}</h3>
                <p>{copy}</p>
                {index < 3 && <span className="step__connector"><Icon name="arrow" /></span>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section care-types">
        <div className="container">
          <SectionHeading
            eyebrow="Tipos de atención"
            title={<>Cada momento necesita un tipo<br />de cuidado diferente.</>}
            align="center"
          />
          <div className="care-grid">
            <article className="care-card care-card--urgent">
              <div className="care-card__art"><Icon name="message" /><span className="pulse-ring" /></div>
              <span className="care-card__index">01</span>
              <h3>Emergencia</h3>
              <p>Orientación ante una situación que no puede esperar y claridad para decidir el próximo paso.</p>
              <a href="/register">Recibir orientación <Icon name="arrow" /></a>
            </article>
            <article className="care-card care-card--consult">
              <div className="care-card__image"><img src={photos.vet} alt="Profesional veterinario trabajando durante una consulta" /></div>
              <div className="care-card__body">
                <span className="care-card__index">02</span>
                <h3>Consulta</h3>
                <p>Resolvé dudas y conversá con un profesional desde un espacio tranquilo y cercano.</p>
                <a href="/register">Iniciar consulta <Icon name="arrow" /></a>
              </div>
            </article>
            <article className="care-card care-card--prevent">
              <div className="care-card__art"><Icon name="heart" /><span className="orbit-dot" /></div>
              <span className="care-card__index">03</span>
              <h3>Prevención</h3>
              <p>Acompañá el bienestar de tu mascota antes de que aparezcan problemas.</p>
              <a href="/register">Planificar cuidado <Icon name="arrow" /></a>
            </article>
          </div>
        </div>
      </section>

      <section className="section species">
        <div className="container species__grid">
          <div className="species__copy">
            <SectionHeading
              eyebrow="Todas las especies"
              title={<>Porque no todas las<br />mascotas son iguales.</>}
              copy="Encontrar atención adecuada puede ser especialmente difícil cuando tu compañero no es un perro o un gato. VetConnect también fue pensado para ellos."
            />
            <Button href="/register" variant="secondary">Encontrar un especialista</Button>
          </div>
          <div className="species-collage" aria-label="Diversidad de mascotas atendidas">
            <figure className="species-photo species-photo--parrot"><img src={photos.parrot} alt="Ave de compañía" /><figcaption>Aves</figcaption></figure>
            <figure className="species-photo species-photo--ferret"><img src={photos.ferret} alt="Hurón doméstico" /><figcaption>Hurones</figcaption></figure>
            <figure className="species-photo species-photo--turtle"><img src={photos.turtle} alt="Tortugas domésticas" /><figcaption>Reptiles</figcaption></figure>
            <div className="species-chip species-chip--one">Conejos</div>
            <div className="species-chip species-chip--two">Roedores</div>
            <div className="species-chip species-chip--three">Peces</div>
          </div>
        </div>
      </section>

      <section className="section tutors" id="tutores">
        <div className="container tutors__grid">
          <div className="interface-composition">
            <div className="interface-composition__blob" />
            <PetProfile />
            <div className="mini-notification">
              <span><Icon name="check" /></span>
              <div><strong>Consulta finalizada</strong><small>Indicaciones guardadas</small></div>
            </div>
            <div className="health-ring"><span>92%</span><small>Perfil completo</small></div>
          </div>
          <div className="tutors__copy">
            <SectionHeading
              eyebrow="Para tutores"
              title={<>Todo empieza por conocer<br />a quien cuidás.</>}
              copy="Creá un perfil para cada mascota, reuní su información y mantené el hilo de cada consulta. Menos datos sueltos, más continuidad."
            />
            <ul className="feature-list">
              {["Perfil e información básica", "Historial veterinario organizado", "Consultas y seguimiento"].map((item) => (
                <li key={item}><span><Icon name="check" /></span>{item}</li>
              ))}
            </ul>
            <Button href="/register/tutor">Crear perfil de mascota</Button>
          </div>
        </div>
      </section>

      <section className="section vets" id="veterinarios">
        <div className="container vets__grid">
          <div className="vets__copy">
            <Eyebrow light>Para profesionales</Eyebrow>
            <h2>Tu conocimiento también<br />puede llegar <span>más lejos.</span></h2>
            <p>VetConnect brinda un espacio profesional para ofrecer atención online, organizar la disponibilidad y acompañar a cada paciente con contexto.</p>
            <div className="vets__features">
              {[
                ["calendar", "Agenda y disponibilidad"],
                ["profile", "Pacientes organizados"],
                ["history", "Historial y seguimiento"],
                ["message", "Consultas centralizadas"],
              ].map(([icon, text]) => (
                <div key={text}><Icon name={icon as IconName} /><span>{text}</span></div>
              ))}
            </div>
            <Button href="/register/veterinarian" variant="cream">Quiero ser veterinario en VetConnect</Button>
          </div>
          <div className="vet-interface">
            <ScheduleCard />
            <div className="vet-interface__metric"><span>Pacientes activos</span><strong>48</strong><small>+12% este mes</small></div>
            <div className="vet-interface__availability"><span className="online-dot" /><strong>Disponible ahora</strong><small>Hasta las 18:00</small></div>
          </div>
        </div>
      </section>

      <section className="section platform" id="plataforma">
        <div className="container">
          <SectionHeading
            eyebrow="La plataforma"
            title={<>Una experiencia conectada<br />de principio a fin.</>}
            copy="La información, las consultas y el acompañamiento conviven en un mismo ecosistema, tanto para tutores como para profesionales."
            align="center"
          />
          <div className="device-stage">
            <div className="device-stage__shape" />
            <div className="laptop">
              <div className="laptop__screen">
                <div className="app-sidebar">
                  <Logo />
                  {["profile", "calendar", "message", "history"].map((icon, i) => <span className={i === 0 ? "active" : ""} key={icon}><Icon name={icon as IconName} /></span>)}
                </div>
                <div className="video-ui">
                  <div className="video-ui__header"><span>Consulta con Olivia</span><span className="status-dot">En curso · 18:42</span></div>
                  <div className="video-ui__main">
                    <img src={photos.rabbitClose} alt="Tutora y conejo durante una consulta online" />
                    <div className="doctor-tile"><img src={photos.vet} alt="Veterinaria en videollamada" /></div>
                    <div className="call-controls"><span><Icon name="camera" /></span><span><Icon name="message" /></span><span className="end-call"><Icon name="close" /></span></div>
                  </div>
                  <aside className="video-ui__notes"><span className="ui-label">Ficha rápida</span><strong>Olivia</strong><small>Conejo · 3 años</small><hr /><small>Motivo</small><p>Cambio de alimentación y menor actividad.</p></aside>
                </div>
              </div>
              <div className="laptop__base" />
            </div>
            <div className="phone">
              <div className="phone__notch" />
              <div className="phone__header"><Logo /><span className="tiny-avatar" /></div>
              <p className="ui-label">PRÓXIMA CONSULTA</p>
              <div className="phone__appointment">
                <span><Icon name="camera" /></span><strong>Hoy · 15:30</strong><small>con Dra. Paula López</small>
              </div>
              <PetProfile />
            </div>
          </div>
        </div>
      </section>

      <section className="section benefits">
        <div className="container">
          <SectionHeading eyebrow="Lo que cambia" title={<>Más cerca. Más simple.<br />Más conectado.</>} />
          <div className="benefit-grid">
            {[
              ["01", "location", "Acceso", "Consultas veterinarias sin depender de la distancia."],
              ["02", "message", "Cercanía", "Una forma más directa de comunicarse con profesionales."],
              ["03", "paw", "Variedad", "Una plataforma pensada para diferentes tipos de mascotas."],
              ["04", "history", "Continuidad", "Información y seguimiento dentro del mismo ecosistema."],
            ].map(([num, icon, title, copy]) => (
              <article className="benefit" key={num}>
                <span className="benefit__num">{num}</span>
                <span className="benefit__icon"><Icon name={icon as IconName} /></span>
                <h3>{title}</h3><p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section professional-trust">
        <div className="container professional-trust__grid">
          <div className="professional-trust__copy">
            <SectionHeading
              eyebrow="Confianza profesional"
              title={<>Tecnología para conectar.<br />Profesionales para cuidar.</>}
              copy="La tecnología facilita el encuentro y organiza la información. La atención, el criterio y las decisiones siguen estando a cargo de profesionales veterinarios."
            />
          </div>
          <div className="trust-cards">
            {[
              ["shield", "Profesionales verificados", "Perfiles e información profesional validados."],
              ["heart", "Privacidad por diseño", "Tu información se trata con cuidado y propósito."],
              ["history", "Información organizada", "El contexto correcto, disponible en cada consulta."],
              ["message", "Comunicación segura", "Un entorno pensado para conversar con tranquilidad."],
            ].map(([icon, title, copy], index) => (
              <article className={`trust-card trust-card--${index + 1}`} key={title}>
                <Icon name={icon as IconName} /><h3>{title}</h3><p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section ai-section">
        <div className="container ai-section__grid">
          <div className="ai-visual">
            <div className="ai-visual__card">
              <div className="ai-visual__head"><span><Icon name="spark" /></span><div><strong>Resumen de apoyo</strong><small>Revisado por el profesional</small></div></div>
              <div className="summary-line summary-line--long" />
              <div className="summary-line" />
              <div className="summary-line summary-line--medium" />
              <div className="ai-visual__tag"><Icon name="check" /> Información organizada</div>
            </div>
            <span className="ai-orbit ai-orbit--one" />
            <span className="ai-orbit ai-orbit--two" />
          </div>
          <div>
            <SectionHeading
              eyebrow="Tecnología de apoyo"
              title={<>Tecnología que acompaña<br />al profesional.</>}
              copy="La inteligencia artificial puede colaborar en tareas de organización, métricas y apoyo. El profesional veterinario siempre revisa la información y mantiene la responsabilidad sobre la atención."
            />
            <div className="human-first"><Icon name="profile" /><span><strong>Decisión humana, siempre.</strong><small>La tecnología acompaña; no reemplaza.</small></span></div>
          </div>
        </div>
      </section>

      <section className="section testimonials">
        <div className="container">
          <SectionHeading eyebrow="Historias reales" title={<>Cuidar también es<br />sentirse acompañado.</>} align="center" />
          <div className="testimonial-grid">
            {[
              ["LC", "Lucía y Pipa", "Conejo belier", "Mi conejo necesitaba orientación y no encontraba fácilmente un profesional cerca. Poder consultar online me dio claridad y mucha tranquilidad."],
              ["MR", "Martín y Kiwi", "Cotorra argentina", "Me gustó poder elegir a alguien con experiencia en aves. La consulta fue clara, sin apuro, y quedó todo ordenado para el seguimiento."],
              ["AS", "Ana y Bruno", "Hurón", "No reemplazó la visita que después necesitábamos, pero nos ayudó a entender qué hacer y a llegar mejor preparados."],
            ].map(([initials, name, pet, quote], index) => (
              <article className={`testimonial testimonial--${index + 1}`} key={name}>
                <div className="stars" aria-label="5 estrellas">{[1, 2, 3, 4, 5].map((n) => <Icon name="star" key={n} />)}</div>
                <blockquote>“{quote}”</blockquote>
                <div className="testimonial__person"><span>{initials}</span><div><strong>{name}</strong><small>{pet}</small></div></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section faq" id="preguntas">
        <div className="container faq__grid">
          <div className="faq__intro">
            <SectionHeading eyebrow="Preguntas frecuentes" title={<>Todo lo que<br />necesitás saber.</>} copy="Si todavía tenés dudas, nuestro equipo puede orientarte antes de comenzar." />
            <Button href="mailto:hola@vetconnect.com" variant="secondary">Hablar con el equipo</Button>
          </div>
          <div className="accordion">
            {faqs.map(([question, answer], index) => {
              const open = openFaq === index;
              return (
                <div className={`accordion__item ${open ? "accordion__item--open" : ""}`} key={question}>
                  <button onClick={() => setOpenFaq(open ? -1 : index)} aria-expanded={open}>
                    <span><small>{String(index + 1).padStart(2, "0")}</small>{question}</span>
                    <span className="accordion__toggle"><Icon name={open ? "close" : "plus"} /></span>
                  </button>
                  <div className="accordion__content"><p>{answer}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section final-cta" id="comenzar">
        <div className="container final-cta__panel">
          <div className="final-cta__copy">
            <Eyebrow light>Estamos para acompañarte</Eyebrow>
            <h2>Cuando necesitás<br />respuestas, <span>conectate.</span></h2>
            <p>Tu mascota te necesita. Nosotros te ayudamos a encontrar el acompañamiento veterinario adecuado.</p>
            <Button href="/register" variant="cream">Comenzar consulta</Button>
          </div>
          <div className="final-cta__visual">
            <div className="final-cta__photo"><img src={photos.rabbitClose} alt="Tutora junto a su conejo" /></div>
            <div className="final-cta__badge"><Icon name="heart" /><span>Cuidado que<br /><strong>se siente cerca</strong></span></div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer__top">
            <div className="footer__brand">
              <Logo light />
              <p>Conectamos para cuidar<br />lo que más querés.</p>
              <div className="socials"><a href="#" aria-label="Instagram">ig</a><a href="#" aria-label="LinkedIn">in</a><a href="#" aria-label="Facebook">f</a></div>
            </div>
            {[
              ["VetConnect", ["Inicio", "Cómo funciona", "Sobre nosotros"]],
              ["Atención", ["Consultas", "Emergencias", "Prevención"]],
              ["Profesionales", ["Para veterinarios", "Registrarse", "Información profesional"]],
              ["Ayuda", ["Preguntas frecuentes", "Contacto", "Términos y condiciones", "Privacidad"]],
            ].map(([title, links]) => (
              <div className="footer__column" key={title as string}>
                <h3>{title as string}</h3>
                {(links as string[]).map((link) => <a href="#" key={link}>{link}</a>)}
              </div>
            ))}
          </div>
          <div className="footer__bottom"><span>© 2025 VetConnect. Todos los derechos reservados.</span><span>Hecho para conectar y cuidar.</span></div>
        </div>
      </footer>
    </main>
  );
}

export default Landing;
