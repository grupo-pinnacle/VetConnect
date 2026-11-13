import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Icon, Brand, Logo, Button, type IconName } from "../components/common/Brand";
import { clamp, prefersReducedMotion } from "../lib/motion";
import LandingScopedStyle from "../styles/LandingScopedStyle";

export { Icon, Brand, Logo, Button, type IconName };

const A = "/assets";

const collagePhotos = [
  { src: `${A}/73fa8.png`, webp: `${A}/73fa8.webp`, webpSmall: `${A}/73fa8-480.webp`, width: 640, height: 853, alt: "Tutor con su perro" },
  { src: `${A}/8ad0f.png`, webp: `${A}/8ad0f.webp`, webpSmall: `${A}/8ad0f-480.webp`, width: 640, height: 853, alt: "Veterinaria atendiendo una mascota" },
  { src: `${A}/7c30e.png`, webp: `${A}/7c30e.webp`, webpSmall: `${A}/7c30e-480.webp`, width: 640, height: 853, alt: "Veterinario con un gato" },
  { src: `${A}/2b648.png`, webp: `${A}/2b648.webp`, webpSmall: `${A}/2b648-480.webp`, width: 640, height: 958, alt: "Veterinario revisando un gato" },
  { src: `${A}/3c2ad.png`, webp: `${A}/3c2ad.webp`, webpSmall: `${A}/3c2ad-480.webp`, width: 640, height: 853, alt: "Veterinario sonriendo con su paciente" },
];

const steps = [
  {
    image: "6f3a5.png",
    webpSmall: "6f3a5-480.webp",
    title: "Paso 1",
    copy: "Completa tu perfil y contanos el motivo de la consulta.",
  },
  {
    image: "6aa55.png",
    webpSmall: "6aa55-480.webp",
    title: "Paso 2",
    copy: "Encontrá un profesional según la especialidad y disponibilidad.",
  },
  {
    image: "f4604.png",
    webpSmall: "f4604-480.webp",
    title: "Paso 3",
    copy: "Conectate a la consulta y conversá online desde donde estés.",
  },
];

const faqItems = [
  {
    question: "¿Cómo puedo realizar una consulta?",
    answer: "Comenzá desde el botón “Comenzar consulta” y completá los datos de tu mascota.",
  },
  {
    question: "¿Necesito registrarme?",
    answer: "Sí, crear un perfil permite guardar tus consultas y hacer un seguimiento.",
  },
  {
    question: "¿Cuánto cuesta una consulta?",
    answer: "El valor se informa antes de confirmar la consulta con el profesional.",
  },
  {
    question: "¿Puedo consultar desde cualquier lugar?",
    answer: "Sí, podés conectarte online desde cualquier lugar con acceso a internet.",
  },
];

// Shared brand components imported from ../components/common/Brand

function Header({
  scrolled,
  dashboardUrl,
}: {
  scrolled: boolean;
  dashboardUrl: string;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout().then(() => {
      navigate("/login", { replace: true });
    });
  };

  return (
    <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
      <Logo />
      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? "Cerrar navegación" : "Abrir navegación"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav
        className={menuOpen ? "main-nav main-nav-open" : "main-nav"}
        aria-label="Navegación principal"
      >
        <a className="active" href="#inicio" onClick={() => setMenuOpen(false)}>
          Inicio
        </a>
        <a href="#como-funciona" onClick={() => setMenuOpen(false)}>
          Cómo funciona
        </a>
        <a href="#como-funciona" onClick={() => setMenuOpen(false)}>
          Para tutores
        </a>
        <a href="#descargar" onClick={() => setMenuOpen(false)}>
          Para veterinarios
        </a>
        <a href="#preguntas" onClick={() => setMenuOpen(false)}>
          Preguntas frecuentes
        </a>
        {menuOpen &&
          (user ? (
            <>
              <Link className="access-button mobile-only-action" to={dashboardUrl} onClick={() => setMenuOpen(false)}>
                Mi panel ({user.firstName || "Usuario"})
              </Link>
              <button
                type="button"
                className="access-button access-button--ghost mobile-only-action"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link className="access-button mobile-only-action" to="/login" onClick={() => setMenuOpen(false)}>
              <img src={`${A}/95e3a.svg`} alt="" />
              Ingresar
            </Link>
          ))}
      </nav>
      <div className="site-header-actions">
        {user ? (
          <>
            <Link className="access-button" to={dashboardUrl}>
              Mi panel ({user.firstName || "Usuario"})
            </Link>
            <button
              type="button"
              className="access-button access-button--ghost"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link className="access-button" to="/login">
            <img src={`${A}/95e3a.svg`} alt="" width={14} height={18} />
            Ingresar
          </Link>
        )}
      </div>
    </header>
  );
}

type RevealCssVars = CSSProperties & Record<"--hc-delay", string>;

function revealDelay(ms: number): RevealCssVars {
  return { "--hc-delay": `${ms}ms` };
}

type TeleportEntry = { index: number; side: "left" | "right" };

function Hero({
  heroRef,
  dashboardUrl,
}: {
  heroRef: { current: HTMLElement | null };
  dashboardUrl: string;
}) {
  const { user } = useAuth();
  const [photoOffset, setPhotoOffset] = useState(0);
  const [teleporting, setTeleporting] = useState<TeleportEntry[]>([]);
  const [paused, setPaused] = useState(false);
  const rafRef1 = useRef<number | null>(null);
  const rafRef2 = useRef<number | null>(null);
  const totalPhotos = collagePhotos.length;
  const slotClasses = [
    "pet-photo-1",
    "pet-photo-2",
    "pet-photo-main",
    "pet-photo-4",
    "pet-photo-5",
  ];

  const getSlotIndex = (photoIndex: number, offset: number) =>
    (photoIndex - offset + totalPhotos) % totalPhotos;

  const clearScheduledFrame = () => {
    if (rafRef1.current !== null) {
      window.cancelAnimationFrame(rafRef1.current);
      rafRef1.current = null;
    }
    if (rafRef2.current !== null) {
      window.cancelAnimationFrame(rafRef2.current);
      rafRef2.current = null;
    }
  };

  const shiftCarousel = (delta: number) => {
    if (delta === 0) return;
    setPhotoOffset((prev) => {
      const next = ((prev + delta) % totalPhotos + totalPhotos) % totalPhotos;
      const wrappedEntries: TeleportEntry[] = [];
      for (let idx = 0; idx < totalPhotos; idx++) {
        const prevSlot = getSlotIndex(idx, prev);
        const nextSlot = getSlotIndex(idx, next);
        if (Math.abs(nextSlot - prevSlot) > 1) {
          wrappedEntries.push({
            index: idx,
            side: nextSlot >= 2 ? "right" : "left",
          });
        }
      }
      clearScheduledFrame();
      if (wrappedEntries.length > 0 && typeof window !== "undefined" && !prefersReducedMotion()) {
        setTeleporting(wrappedEntries);
        rafRef1.current = window.requestAnimationFrame(() => {
          rafRef2.current = window.requestAnimationFrame(() => {
            setTeleporting([]);
          });
        });
      } else {
        setTeleporting([]);
      }
      return next;
    });
  };

  useEffect(() => {
    return () => {
      clearScheduledFrame();
    };
  }, []);

  useEffect(() => {
    if (paused) return;
    if (prefersReducedMotion()) {
      return;
    }
    const timer = window.setInterval(() => {
      shiftCarousel(1);
    }, 5400);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section ref={heroRef} className="hero" id="inicio">
      <div className="hero-copy">
        <p className="eyebrow">Atención veterinaria online</p>
        <h1>
          Tu mascota y tu veterinario.
          <strong>Conectados.</strong>
        </h1>
        <p className="lead">
          Conectamos tutores con profesionales veterinarios para acceder a orientación y atención
          online de manera simple, humana y cercana.
        </p>
        <Link className="primary-button" to={user ? dashboardUrl : "/register"}>
          Comenzar consulta
        </Link>
      </div>
      <div
        className="pet-collage"
        aria-label="Veterinarios y mascotas"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {collagePhotos.map((item, idx) => {
          const slotIndex = getSlotIndex(idx, photoOffset);
          const slotClass = slotClasses[slotIndex];
          const isMain = slotIndex === 2;
          const teleportEntry = teleporting.find((entry) => entry.index === idx);
          const teleportClass = teleportEntry
            ? `pet-photo--teleport-${teleportEntry.side}`
            : "";
          if (isMain) {
            return (
              <div
                className={`pet-photo ${slotClass} is-main ${teleportClass}`}
                key={item.src}
                aria-current="true"
              >
                <picture>
                  <source
                    type="image/webp"
                    srcSet={`${item.webpSmall} 480w, ${item.webp} 640w`}
                    sizes="(max-width: 560px) 75vw, 370px"
                  />
                  <img
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    decoding="async"
                    fetchpriority="high"
                  />
                </picture>
              </div>
            );
          }
          return (
            <button
              type="button"
              className={`pet-photo ${slotClass} ${teleportClass}`}
              key={item.src}
              aria-label={`Destacar foto: ${item.alt}`}
              onClick={() => shiftCarousel(slotIndex - 2)}
            >
              <picture>
                <source
                  type="image/webp"
                  srcSet={`${item.webpSmall} 480w, ${item.webp} 640w`}
                  sizes="(max-width: 560px) 52vw, 280px"
                />
                <img
                  src={item.src}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  decoding="async"
                  fetchpriority="low"
                />
              </picture>
            </button>
          );
        })}
        <button
          className="collage-arrow collage-arrow-left"
          type="button"
          aria-label="Foto anterior"
          onClick={() => shiftCarousel(-1)}
        >
          <img src={`${A}/db2a8.svg`} alt="" width={20} height={20} />
        </button>
        <button
          className="collage-arrow collage-arrow-right"
          type="button"
          aria-label="Foto siguiente"
          onClick={() => shiftCarousel(1)}
        >
          <img src={`${A}/669c4.svg`} alt="" width={20} height={20} />
        </button>
      </div>
    </section>
  );
}

function HowItWorks({
  sectionRef,
}: {
  sectionRef: { current: HTMLElement | null };
}) {
  return (
    <section ref={sectionRef} className="how hc-sheet" id="como-funciona">
      <div className="sheet-stage">
        <div className="section-heading hc-reveal" data-reveal="" style={revealDelay(0)}>
          <p className="eyebrow">Cómo funciona</p>
          <h2>
            Cuidar también puede ser{" "}
            <span className="heading-highlight">
              <img className="heading-swash" src={`${A}/a4e0b.svg`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
              <span>más simple.</span>
            </span>
          </h2>
          <p>
            Un camino claro desde tu primera duda hasta el seguimiento, siempre acompañado por un
            profesional.
          </p>
        </div>
        <div className="steps">
          {steps.map((step, index) => (
            <article className="step hc-reveal" data-reveal="" style={revealDelay(60 + index * 85)} key={step.title}>
              <span className={`step-number step-number-${index + 1}`} aria-hidden="true">
                <img src={`${A}/8e0f7.png`} alt="" width={480} height={160} loading="lazy" decoding="async" />
              </span>
              <div className="step-art">
                <picture>
                  <source media="(max-width: 560px)" type="image/webp" srcSet={`${A}/${step.webpSmall}`} />
                  <img src={`${A}/${step.image}`} alt="" width={960} height={540} loading="lazy" decoding="async" />
                </picture>
              </div>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq({
  sectionRef,
}: {
  sectionRef: { current: HTMLElement | null };
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section ref={sectionRef} className="faq hc-sheet" id="preguntas">
      <div className="sheet-stage">
        <div className="section-heading hc-reveal" data-reveal="" style={revealDelay(0)}>
          <p className="eyebrow">Tus dudas, resueltas</p>
          <h2>Preguntas frecuentes</h2>
          <p>
            Todo lo que necesitas saber. Si todavía tenés dudas, nuestro equipo puede orientarte antes
            de comenzar.
          </p>
        </div>
        <div className="faq-list">
          {faqItems.map((item, index) => {
            const expanded = open === index;
            return (
              <div
                className="faq-item-slot hc-reveal"
                data-reveal=""
                style={revealDelay(Math.min(index * 50, 200))}
                key={item.question}
              >
                <div className={`faq-item ${expanded ? "faq-item-open" : ""}`}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpen(expanded ? null : index)}
                  >
                    <span className="question-mark">?</span>
                    <span>{item.question}</span>
                    <img src={`${A}/8ca24.svg`} alt="" width={43} height={43} loading="lazy" decoding="async" />
                  </button>
                  <div className="faq-answer-wrap" aria-hidden={!expanded}>
                    <div className="faq-answer-clip">
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AppDownload({
  downloadRef,
}: {
  downloadRef: { current: HTMLElement | null };
}) {
  const [showWebNotice, setShowWebNotice] = useState(false);

  return (
    <section ref={downloadRef} className="download hc-sheet" id="descargar">
      <div className="sheet-stage">
        <div className="download-panel hc-reveal" data-reveal="" style={revealDelay(0)}>
          <div className="download-copy">
            <h2>Todo HuelliCam, al alcance de tu mano.</h2>
            <p>
              Descargá nuestra aplicación y disfrutá de una experiencia más simple para cuidar la
              salud de tu mascota.
            </p>
            <button
              type="button"
              className="download-button"
              onClick={() => setShowWebNotice((open) => !open)}
            >
              <img src={`${A}/57ab3.svg`} alt="" width={37} height={37} loading="lazy" decoding="async" />
              Descargar App
            </button>
            {showWebNotice && (
              <p className="download-notice" role="status">
                La app móvil está en acceso anticipado. Mientras tanto podés{" "}
                <Link to="/register">usar HuelliCam desde tu navegador</Link>.
              </p>
            )}
          </div>
          <picture>
            <source media="(max-width: 560px)" type="image/webp" srcSet={`${A}/3c9f8-480.webp`} />
            <img
              className="phone"
              src={`${A}/3c9f8.png`}
              alt="Aplicación HuelliCam en un smartphone"
              width={760}
              height={879}
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <Logo light />
        <div className="footer-column">
          <h2>Navegación</h2>
          <a href="#inicio">Inicio</a>
          <a href="#como-funciona">Cómo funciona</a>
          <Link to="/register/veterinarian">Para veterinarios</Link>
          <a href="#preguntas">Preguntas frecuentes</a>
        </div>
        <div className="footer-column">
          <h2>Redes Sociales</h2>
          <a href="https://www.instagram.com/huellicam?psln=dmo4bjFyMHl2a243" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <img src={`${A}/ebe3f.png`} alt="" width={30} height={30} loading="lazy" decoding="async" /> Instagram
          </a>
          <span className="footer-social-muted" aria-label="Facebook (próximamente)">
            <img src={`${A}/9ea40.png`} alt="" width={30} height={30} loading="lazy" decoding="async" /> Facebook <small>(próximamente)</small>
          </span>
          <a href="mailto:HuelliCam@gmail.com">
            <img src={`${A}/533fc.png`} alt="" width={30} height={30} loading="lazy" decoding="async" /> HuelliCam@gmail.com
          </a>
        </div>
        <div className="footer-column">
          <h2>Legal</h2>
          <Link to="/terms">Términos y condiciones</Link>
          <Link to="/privacy">Políticas de privacidad</Link>
          <Link to="/cookies">Política de cookies</Link>
          <Link to="/refunds">Política de reembolsos</Link>
        </div>
      </div>
      <div className="footer-legal">
        <p>© 2026 Huellicam. Todos los derechos reservados.</p>
        <p>Hecho para conectar y cuidar.</p>
      </div>
    </footer>
  );
}

export function Landing() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [revealReady, setRevealReady] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const heroScrollRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const howRef = useRef<HTMLElement | null>(null);
  const faqRef = useRef<HTMLElement | null>(null);
  const downloadRef = useRef<HTMLElement | null>(null);

  const dashboardUrl =
    user?.role === "VET"
      ? "/vet/dashboard"
      : user?.role === "ADMIN"
      ? "/admin/dashboard"
      : "/client/dashboard";

  useEffect(() => {
    let scrollRaf = 0;
    const motionDisabled = prefersReducedMotion();

    const syncScroll = () => {
      scrollRaf = 0;
      const sy = window.scrollY;
      const nextScrolled = sy > 24;
      setScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));

      const rootEl = rootRef.current;
      const vh = window.innerHeight || 840;

      if (rootEl) {
        const pending = rootEl.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)");
        for (const el of pending) {
          if (el.getBoundingClientRect().top <= vh * 0.99) {
            el.classList.add("is-visible");
          }
        }
      }

      if (motionDisabled) return;

      const heroTrackEl = heroScrollRef.current;
      const heroEl = heroRef.current;
      const howEl = howRef.current;
      const faqEl = faqRef.current;
      const dlEl = downloadRef.current;

      if (heroEl && howEl) {
        const howRect = howEl.getBoundingClientRect();
        const heroSpan = Math.max(vh * 0.72, 340);
        const rawHeroProgress = (vh - howRect.top) / heroSpan;
        const heroProgress = clamp(rawHeroProgress, 0, 1);
        heroEl.style.setProperty("--hc-hero-scroll", heroProgress.toFixed(4));
      } else if (heroEl && heroTrackEl) {
        const heroH = Math.max(heroTrackEl.offsetHeight, 1);
        const heroProgress = clamp(sy / (heroH * 0.65), 0, 1);
        heroEl.style.setProperty("--hc-hero-scroll", heroProgress.toFixed(4));
      }

      if (howEl && faqEl) {
        const faqTop = faqEl.getBoundingClientRect().top;
        const exitSpan = Math.max(vh * 0.45, 240);
        const howExit = clamp((vh * 0.92 - faqTop) / exitSpan, 0, 1);
        howEl.style.setProperty("--hc-sheet-exit", howExit.toFixed(4));
      }

      if (faqEl && dlEl) {
        const dlTop = dlEl.getBoundingClientRect().top;
        const exitSpan = Math.max(vh * 0.45, 240);
        const faqExit = clamp((vh * 0.92 - dlTop) / exitSpan, 0, 1);
        faqEl.style.setProperty("--hc-sheet-exit", faqExit.toFixed(4));
      }

      if (dlEl) {
        const dlRect = dlEl.getBoundingClientRect();
        const centerOffset = (dlRect.top + dlRect.height * 0.5 - vh * 0.5) / vh;
        const clamped = clamp(centerOffset, -1, 1);
        dlEl.style.setProperty("--hc-phone-progress", clamped.toFixed(4));
      }
    };

    const onScroll = () => {
      if (!scrollRaf) {
        scrollRaf = window.requestAnimationFrame(syncScroll);
      }
    };

    syncScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
    };
  }, []);

  useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl || prefersReducedMotion() || typeof IntersectionObserver !== "function") {
      return;
    }

    const targets = Array.from(rootEl.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (targets.length === 0) return;

    const vh = window.innerHeight || 900;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top <= vh * 0.99) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -12px 0px" },
    );

    for (const el of targets) {
      if (el.getBoundingClientRect().top <= vh * 0.99) {
        el.classList.add("is-visible");
      } else {
        observer.observe(el);
      }
    }

    setRevealReady(true);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <main ref={rootRef} className={`hc-landing ${revealReady ? "hc-reveal-ready" : ""}`}>
      <LandingScopedStyle />
      <style>{`
        @media (max-width: 1023px) {
          .hc-landing .main-nav:not(.main-nav-open) {
            display: none !important;
          }
          .hc-landing .menu-toggle {
            display: flex !important;
            margin-left: auto !important;
          }
        }
      `}</style>
      <Header scrolled={scrolled} dashboardUrl={dashboardUrl} />
      <div ref={heroScrollRef} className="hero-scroll">
        <Hero heroRef={heroRef} dashboardUrl={dashboardUrl} />
      </div>
      <HowItWorks sectionRef={howRef} />
      <Faq sectionRef={faqRef} />
      <AppDownload downloadRef={downloadRef} />
      <Footer />
    </main>
  );
}

export default Landing;
