import { useEffect, useState, useRef, useCallback } from "react";
import "./vet.css";
import { Button, Icon, Modal, go } from "../shared";
import { getPatient, initialConsults, initialQueue, registerPatient, type Consult, type QueueItem, type Triage } from "./data";
import { TriageBadge, VetProvider, useVet } from "./vetkit";
import { EvolutionEditor, FichaClinica } from "./Consultations";
import { useAuth } from "../context/AuthContext";
import api, { getAccessToken, getDeviceId } from "../services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, Consultation as BackendConsultation } from "../types";
import { mapBackendPetToPatient } from "./mappers";
import { io, Socket } from "socket.io-client";
import { LiveKitRoom, VideoConference, useLocalParticipant } from "@livekit/components-react";
import "@livekit/components-styles";
import { ReviewModal } from "../components/ui/ReviewModal";
import { HamsterMascot } from "../components/ui/HamsterMascot";
import { parseConsultationNotes } from "../lib/consultationNotes";

const WAITING_TIPS = [
  "Habilitá la cámara y el micrófono en tu navegador para que el veterinario pueda ver y escuchar a tu mascota.",
  "Ponete cerca de una ventana o prendé una luz: con buena luz se ve mejor.",
  "Dejá a tu mascota en un lugar seguro y tené a mano su carnet de vacunas."
];

const TRIAGE_BY_TIER: Record<"ROJO" | "AMARILLO" | "VERDE", Triage> = {
  ROJO: "Crítico",
  AMARILLO: "Moderado",
  VERDE: "General"
};

const WAITING_STATUS_MSGS = [
  "Recibimos la historia clínica",
  "Buscando veterinario de guardia",
  "Abriendo la sala de video",
  "¡Veterinario encontrado!"
];

const HUELLICAM_LETTERS = [
  { char: "H", isTeal: false },
  { char: "u", isTeal: false },
  { char: "e", isTeal: false },
  { char: "l", isTeal: false },
  { char: "l", isTeal: false },
  { char: "i", isTeal: false },
  { char: "C", isTeal: true },
  { char: "a", isTeal: true },
  { char: "m", isTeal: true }
];

function WaitingRoomExperience({
  petName,
  tutorName,
  symptom,
  clock,
  tierLabel,
  onBack,
  onCancel,
}: {
  petName: string;
  tutorName: string;
  symptom: string;
  clock: string;
  tierLabel: string | null;
  onBack: () => void;
  onCancel: () => void;
}) {
  const [tipIndex, setTipIndex] = useState(0);
  const [tipOut, setTipOut] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const logoRef = useRef<SVGSVGElement | null>(null);
  const wordRef = useRef<HTMLDivElement | null>(null);
  const ecgBaseRef = useRef<SVGPathElement | null>(null);
  const ecgFillRef = useRef<SVGPathElement | null>(null);
  const ecgHeadRef = useRef<SVGCircleElement | null>(null);
  const ecgHaloRef = useRef<SVGCircleElement | null>(null);

  // Logo entrance animations
  useEffect(() => {
    const g = (id: string) => logoRef.current?.querySelector<SVGElement>(`#${id}`) || null;
    const pop = (el: SVGElement | null, delay: number, rot = 0) => {
      if (!el || typeof el.animate !== "function") return;
      el.style.transformBox = "fill-box";
      el.style.transformOrigin = "50% 50%";
      el.animate(
        [
          { opacity: 0, transform: `scale(0) rotate(${rot}deg)` },
          { opacity: 1, transform: `scale(1.18) rotate(${rot ? 6 : 0}deg)`, offset: 0.6 },
          { opacity: 1, transform: "none" }
        ],
        { duration: 380, delay, easing: "cubic-bezier(.3,.7,.3,1)", fill: "backwards" }
      );
    };

    const draw = (ids: string[], delay: number, dur: number) => {
      ids.forEach((id) => {
        const p = g(id);
        if (!p || typeof p.animate !== "function") return;
        p.style.strokeDasharray = "100 100";
        const anim = p.animate(
          [{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }],
          { duration: dur, delay, easing: "cubic-bezier(.5,0,.3,1)", fill: "backwards" }
        );
        anim.onfinish = () => {
          p.style.strokeDasharray = "none";
        };
      });
    };

    draw(["tp1", "tp2"], 100, 800);
    pop(g("tipL"), 150);
    pop(g("tipR"), 800);
    pop(g("joint"), 500);
    pop(g("fill"), 250);
    pop(g("arc_top"), 380, -40);
    pop(g("tail"), 450, -40);
    pop(g("arc_right"), 520, -40);
    ["pad_t", "pad_l", "pad_r", "pad_m", "pad_b"].forEach((id, i) => pop(g(id), 620 + i * 70));
    pop(g("cam"), 980);
    draw(["cp1", "cp2"], 560, 800);
    pop(g("chest"), 1300);

    const partIds = ["arc_top", "arc_right", "tail", "pad_t", "pad_l", "pad_r", "pad_m", "pad_b", "cam", "tipL", "tipR", "chest"];
    partIds.forEach((id) => {
      const e = g(id);
      if (e) {
        e.style.transformBox = "fill-box";
        e.style.transformOrigin = "50% 50%";
      }
    });

    const liveTimer = window.setTimeout(() => setIsLive(true), 1900);
    return () => window.clearTimeout(liveTimer);
  }, []);

  // Cycle animation for word and mascot
  const triggerCycle = useCallback(() => {
    const word = wordRef.current;
    if (!word) return;
    const letters = word.querySelectorAll<HTMLElement>(".v-wait__ch");
    const g = (id: string) => logoRef.current?.querySelector<SVGElement>(`#${id}`) || null;
    const partIds = ["arc_top", "arc_right", "tail", "pad_t", "pad_l", "pad_r", "pad_m", "pad_b", "cam", "tipL", "tipR", "chest"];
    const mascotParts = partIds.map(g).filter(Boolean) as SVGElement[];

    const jump = () => {
      if (typeof word.animate === "function") {
        word.animate(
          [
            { transform: "scale(1)" },
            { transform: "scale(1.18)", offset: 0.45 },
            { transform: "scale(1)" }
          ],
          { duration: 650, easing: "cubic-bezier(.3,.7,.3,1)" }
        );
      }
    };

    letters.forEach((e, i) => {
      if (typeof e.animate === "function") {
        e.animate(
          [{ transform: "scale(1)" }, { transform: "scale(1.4)", offset: 0.45 }, { transform: "scale(1)" }],
          { duration: 320, delay: i * 85, easing: "ease-out" }
        );
      }
    });

    mascotParts.forEach((e, i) => {
      if (typeof e.animate === "function") {
        e.animate(
          [{ transform: "scale(1)" }, { transform: "scale(1.1)", offset: 0.45 }, { transform: "scale(1)" }],
          { duration: 320, delay: i * 60, easing: "ease-out" }
        );
      }
    });

    window.setTimeout(jump, letters.length * 85 + 300);
  }, []);

  // Wordmark letters initial entrance + periodic bounce
  useEffect(() => {
    const word = wordRef.current;
    if (!word) return;
    const letters = word.querySelectorAll<HTMLElement>(".v-wait__ch");

    letters.forEach((e, i) => {
      if (typeof e.animate === "function") {
        e.animate(
          [{ opacity: 0, transform: "scale(0)" }, { opacity: 1, transform: "scale(1.35)", offset: 0.6 }, { opacity: 1, transform: "scale(1)" }],
          { duration: 420, delay: 1700 + i * 90, easing: "ease-out", fill: "backwards" }
        );
      }
    });

    let cycleInterval: number;
    const initialCycleTimeout = window.setTimeout(() => {
      triggerCycle();
      cycleInterval = window.setInterval(triggerCycle, 6400);
    }, 4900);

    return () => {
      window.clearTimeout(initialCycleTimeout);
      window.clearInterval(cycleInterval);
    };
  }, [triggerCycle]);

  // Status transitions
  useEffect(() => {
    const t1 = window.setTimeout(() => setStatusIndex(1), 2200);
    const t2 = window.setTimeout(() => setStatusIndex(2), 7500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  // ECG progress waveform
  useEffect(() => {
    const W = 300;
    const N = 4;
    let d = "M0 22";
    for (let i = 0; i < N; i++) {
      const s = ((i + 0.5) * W) / N - 22;
      d += ` H${s} l5 -3 l5 3 h3 l5 -17 l7 34 l7 -17 h3 l5 -3 l5 3`;
    }
    d += ` H${W}`;

    const base = ecgBaseRef.current;
    const fill = ecgFillRef.current;
    const head = ecgHeadRef.current;
    const halo = ecgHaloRef.current;

    if (!base || !fill || !head || !halo) return;

    base.setAttribute("d", d);
    fill.setAttribute("d", d);

    const len = typeof base.getTotalLength === "function" ? base.getTotalLength() : 300;
    let p = 0;
    const target = 0.38;
    let creep = 0;
    let animId: number;

    const frame = () => {
      p += (target + creep - p) * 0.035;
      creep = Math.min(creep + 0.0004, 0.12);
      const q = Math.min(p, 1);
      fill.setAttribute("stroke-dashoffset", String(1000 * (1 - q)));
      if (typeof base.getPointAtLength === "function") {
        const pt = base.getPointAtLength(len * q);
        head.setAttribute("cx", String(pt.x));
        head.setAttribute("cy", String(pt.y));
        halo.setAttribute("cx", String(pt.x));
        halo.setAttribute("cy", String(pt.y));
      }
      animId = requestAnimationFrame(frame);
    };

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Tips rotation
  useEffect(() => {
    const interval = window.setInterval(() => {
      setTipOut(true);
      window.setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % WAITING_TIPS.length);
        setTipOut(false);
      }, 1500);
    }, 8000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main
      data-testid="waiting-room-experience"
      className="v-wait"
      role="region"
      aria-live="polite"
      aria-label="Sala de espera de guardia"
    >
      <div className="v-wait__inner">
        <header className="v-wait__header">
          <button type="button" className="v-wait__back" onClick={onBack} aria-label="Volver">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="v-wait__pet" role="group" aria-label={`${petName}, de ${tutorName}. Prioridad ${tierLabel || "general"}`}>
            <span className="v-wait__ava">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <ellipse cx="12" cy="16" rx="5.5" ry="4.5" />
                <ellipse cx="5" cy="10.5" rx="2.2" ry="3" />
                <ellipse cx="9.5" cy="5.5" rx="2.2" ry="3" />
                <ellipse cx="14.5" cy="5.5" rx="2.2" ry="3" />
                <ellipse cx="19" cy="10.5" rx="2.2" ry="3" />
              </svg>
              <i className="v-wait__urg"></i>
            </span>
            <span className="v-wait__nm">
              <b>{petName}</b>
              <span>de {tutorName}</span>
            </span>
          </div>
          <div className="v-wait__timer" role="timer" aria-label="Tiempo de espera">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <circle className="v-wait__tr" cx="24" cy="24" r="21" />
              <circle className="v-wait__tf" cx="24" cy="24" r="21" pathLength={100} />
            </svg>
            <span className="v-wait__clock">{clock}</span>
          </div>
        </header>

        <p className="v-wait__reason">
          <i></i>
          <span>{symptom || "Consulta veterinaria de guardia"}</span>
        </p>

        <section className="v-wait__center">
          <button
            type="button"
            className={`v-wait__mark ${isLive ? "live" : ""}`}
            onClick={triggerCycle}
            aria-label="HuelliCam interactivo"
          >
            <svg ref={logoRef} id="logo" viewBox="40 140 965 751" aria-hidden="true">
              <defs>
                <pattern id="ht" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <circle cx="4.5" cy="4.5" r="1.7" fill="#1d4a43" />
                </pattern>
                <linearGradient id="gx" x1="0" x2="1">
                  <stop offset="0" stopColor="#fff" />
                  <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <mask id="mcam">
                  <rect x="715" y="335" width="180" height="165" fill="url(#gx)" />
                </mask>
                <radialGradient id="gp" cx="0.15" cy="0.95" r="0.9">
                  <stop offset="0" stopColor="#fff" />
                  <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
                <mask id="mpad">
                  <rect x="480" y="500" width="190" height="165" fill="url(#gp)" />
                </mask>
              </defs>
              <g id="fill">
                <circle cx="583" cy="495" r="255" fill="#fdf1d9" />
                <path d="M365 650L338 748L452 706Z" fill="#fdf1d9" stroke="#fdf1d9" strokeWidth="16" strokeLinejoin="round" />
              </g>
              <g id="tail" fill="none" stroke="#6aa49b" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round">
                <path pathLength={100} d="M327 578C340 610 360 635 378 655L340 745L450 703C520 735 620 735 686 702" />
              </g>
              <g id="arc_top" fill="none" stroke="#6aa49b" strokeWidth="24" strokeLinecap="round">
                <path d="M436 312C500 262 560 250 610 252C680 255 735 285 768 322" />
              </g>
              <g id="arc_right" fill="none" stroke="#6aa49b" strokeWidth="22" strokeLinecap="round">
                <path d="M829 507C835 535 828 560 815 583" />
              </g>
              <g id="pad_t">
                <ellipse cx="577" cy="417" rx="43" ry="60" fill="#528f8a" />
              </g>
              <g id="pad_l">
                <ellipse cx="485" cy="467" rx="42" ry="52" transform="rotate(-22 485 467)" fill="#528f8a" />
              </g>
              <g id="pad_r">
                <ellipse cx="658" cy="490" rx="41" ry="51" transform="rotate(22 658 490)" fill="#528f8a" />
              </g>
              <g id="pad_m">
                <path d="M565 508C595 508 618 535 645 568C667 594 665 626 638 636C612 646 590 628 560 650C530 664 495 652 488 622C483 595 520 535 540 515C548 510 556 508 565 508Z" fill="#528f8a" />
                <path d="M565 508C595 508 618 535 645 568C667 594 665 626 638 636C612 646 590 628 560 650C530 664 495 652 488 622C483 595 520 535 540 515C548 510 556 508 565 508Z" fill="url(#ht)" opacity="0.28" mask="url(#mpad)" />
              </g>
              <g id="pad_b">
                <ellipse cx="443" cy="551" rx="42" ry="37" transform="rotate(-25 443 551)" fill="#528f8a" />
              </g>
              <g id="cam">
                <path d="M722 368Q722 340 750 340H860Q888 340 888 368V398L975 340Q990 332 990 350V485Q990 500 975 493L888 440V464Q888 492 860 492H750Q722 492 722 464Z" fill="#6ba39d" stroke="#4f8c87" strokeWidth="7" strokeLinejoin="round" />
                <path d="M722 368Q722 340 750 340H860Q888 340 888 368V398L975 340Q990 332 990 350V485Q990 500 975 493L888 440V464Q888 492 860 492H750Q722 492 722 464Z" fill="url(#ht)" opacity="0.30" mask="url(#mcam)" />
                <path d="M890 400L975 342Q988 336 988 350V485Q988 498 975 491L890 440Z" fill="url(#ht)" opacity="0.30" />
              </g>
              <g id="tube">
                <path id="tp1" pathLength={100} fill="none" stroke="#245257" strokeWidth="42" strokeLinecap="round" strokeLinejoin="round" d="M138 193C95 205 72 245 74 300C76 360 98 410 118 450C140 515 185 548 232 548C280 548 328 515 348 452C372 410 396 360 398 300C400 245 378 205 340 190" />
                <path id="tp2" pathLength={100} fill="none" stroke="#3f7476" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" d="M138 193C95 205 72 245 74 300C76 360 98 410 118 450C140 515 185 548 232 548C280 548 328 515 348 452C372 410 396 360 398 300C400 245 378 205 340 190" />
              </g>
              <g id="joint">
                <rect x="86" y="418" width="64" height="56" rx="20" transform="rotate(22 118 446)" fill="#2f6a6c" stroke="#245257" strokeWidth="5" />
                <rect x="326" y="418" width="64" height="56" rx="20" transform="rotate(-22 358 446)" fill="#2f6a6c" stroke="#245257" strokeWidth="5" />
                <rect x="203" y="540" width="58" height="84" rx="12" fill="#2f6a6c" stroke="#245257" strokeWidth="5" />
              </g>
              <g id="tipL">
                <circle cx="168" cy="187" r="31" fill="#f6ebd0" stroke="#245257" strokeWidth="8" />
              </g>
              <g id="tipR">
                <circle cx="312" cy="185" r="31" fill="#f6ebd0" stroke="#245257" strokeWidth="8" />
              </g>
              <g id="cord">
                <path id="cp1" pathLength={100} fill="none" stroke="#245257" strokeWidth="34" strokeLinecap="round" d="M232 600V690C232 800 330 858 470 858C610 858 710 800 785 698" />
                <path id="cp2" pathLength={100} fill="none" stroke="#3f7476" strokeWidth="22" strokeLinecap="round" d="M232 600V690C232 800 330 858 470 858C610 858 710 800 785 698" />
              </g>
              <g id="chest">
                <circle cx="797" cy="676" r="80" fill="#fdf1d9" />
                <circle cx="797" cy="676" r="80" fill="none" stroke="#245257" strokeWidth="28" />
                <circle cx="797" cy="676" r="80" fill="none" stroke="#5b9a93" strokeWidth="15" />
                <path d="M748 722L797 674" stroke="#245257" strokeWidth="34" strokeLinecap="round" />
                <path d="M748 722L797 674" stroke="#3f7476" strokeWidth="22" strokeLinecap="round" />
                <circle cx="797" cy="674" r="34" fill="#2f6a6c" stroke="#245257" strokeWidth="5" />
                <circle cx="797" cy="674" r="34" fill="url(#ht)" opacity="0.25" />
              </g>
            </svg>
            <div className="v-wait__pulse">
              <i></i>
              <i></i>
              <i></i>
            </div>
          </button>

          <div ref={wordRef} className="v-wait__word" aria-hidden="true">
            {HUELLICAM_LETTERS.map((item, idx) => (
              <span key={idx} className={`v-wait__ch ${item.isTeal ? "c" : ""}`}>
                {item.char}
              </span>
            ))}
            <svg className="v-wait__spark" viewBox="0 0 26 26" aria-hidden="true">
              <path d="M6 20L2 24" />
              <path d="M12 12L10 4" />
              <path d="M20 14L25 9" />
            </svg>
          </div>

          <div className="v-wait__status">
            <div className="v-wait__line" aria-live="polite">
              <span key={statusIndex}>
                {WAITING_STATUS_MSGS[statusIndex]}
                {statusIndex < 3 && (
                  <span className="v-wait__dots">
                    <b>.</b>
                    <b>.</b>
                    <b>.</b>
                  </span>
                )}
              </span>
            </div>

            <svg className="v-wait__ecg" viewBox="0 0 300 44" aria-hidden="true">
              <path ref={ecgBaseRef} className="base" />
              <path
                ref={ecgFillRef}
                className="fill"
                pathLength={1000}
                strokeDasharray="1000"
                strokeDashoffset="1000"
              />
              <circle ref={ecgHaloRef} className="halo" r="5" />
              <circle ref={ecgHeadRef} className="head" r="4.5" />
            </svg>

            <p className={`v-wait__tip ${tipOut ? "out" : ""}`}>
              {WAITING_TIPS[tipIndex]}
            </p>
          </div>
        </section>

        <footer className="v-wait__foot">
          <button
            type="button"
            className="v-wait__cancel"
            onClick={() => {
              setIsCancelling(true);
              onCancel();
            }}
          >
            {isCancelling ? "Cancelando..." : "Cancelar solicitud de consulta"}
          </button>
        </footer>
      </div>
    </main>
  );
}

export function LiveKitTrackSynchronizer({ mic, cam }: { mic: boolean; cam: boolean }) {
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    if (!localParticipant) return;
    localParticipant.setMicrophoneEnabled(mic).catch((err) => {
      console.warn("LiveKit mic toggle notice:", err);
    });
  }, [mic, localParticipant]);

  useEffect(() => {
    if (!localParticipant) return;
    localParticipant.setCameraEnabled(cam).catch((err) => {
      console.warn("LiveKit cam toggle notice:", err);
    });
  }, [cam, localParticipant]);

  return null;
}

export const getWsUrl = () => {
  if (typeof window !== "undefined") {
    const envWs = import.meta.env.VITE_WS_URL;
    if (envWs && !envWs.includes("localhost") && !envWs.includes("127.0.0.1")) {
      return envWs;
    }
    // If running via Dev Tunnels or external domain, connect to current origin so Vite proxy forwards /socket.io
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return window.location.origin;
    }
  }
  return import.meta.env.VITE_WS_URL || "http://localhost:3001";
};

export function WhatsAppCheck({ state = "read" }: { state?: "sending" | "sent" | "delivered" | "read" | "failed" }) {
  if (state === "sending") {
    return (
      <svg
        width="13"
        height="13"
        viewBox="0 0 16 16"
        fill="none"
        aria-label="Enviando…"
        className="wa-sending-spin"
        style={{ animation: "waSpin 0.9s linear infinite", display: "inline-block", verticalAlign: "middle" }}
      >
        <circle cx="8" cy="8" r="6" stroke="#8696a0" strokeWidth="1.6" strokeDasharray="26" strokeDashoffset="8" />
        <polyline points="8 4.5 8 8 10.5 8" stroke="#8696a0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (state === "sent") {
    return (
      <svg width="15" height="11" viewBox="0 0 16 11" fill="none" aria-label="Enviado">
        <path d="M1.5 6L5.5 10L14.5 1" stroke="#8696a0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  const color = state === "read" ? "#53bdeb" : "#8696a0";
  return (
    <svg width="16" height="11" viewBox="0 0 18 11" fill="none" aria-label={state === "read" ? "Leído" : "Entregado"}>
      <path d="M1 6L5 10L14 1" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 6L9 10L18 1" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CallChatPanel({
  consultationId,
  otherName,
  user,
}: {
  consultationId: string;
  otherName: string;
  user: any;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wsUrl = getWsUrl();
    const token = getAccessToken();
    const s = io(wsUrl, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnection: true,
      auth: {
        token: token ? `Bearer ${token}` : undefined,
      },
    });
    setSocket(s);

    s.on("connect", () => {
      setConnected(true);
      s.emit("join:consultation", { consultationId });
    });

    s.on("connect_error", (err) => {
      console.warn("Socket connect error in CallChatPanel:", err.message);
    });

    s.on("disconnect", () => setConnected(false));

    s.on("message:new", (msg: any) => {
      setMessages((prev) => {
        const existingIdx = prev.findIndex(
          (m) => (m.id && m.id === msg.id) || (m.clientMsgId && m.clientMsgId === msg.clientMsgId)
        );
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = { ...msg, status: "sent" };
          return updated;
        }
        return [...prev, { ...msg, status: "sent" }];
      });
    });

    api
      .get<ApiResponse<any[]>>(`/api/consultations/${consultationId}/messages`)
      .then((res) => {
        if (res.data.success && res.data.data) {
          setMessages(res.data.data);
        }
      })
      .catch(() => {});

    return () => {
      s.disconnect();
    };
  }, [consultationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const clientMsgId = `call-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newContent = text.trim();
    setText("");

    // Optimistic message insertion: display immediately with WhatsApp 'sending' animated clock
    const optimisticMsg = {
      id: clientMsgId,
      clientMsgId,
      consultationId,
      content: newContent,
      senderId: user?.id,
      sender: user ? { firstName: user.firstName, lastName: user.lastName } : undefined,
      createdAt: new Date().toISOString(),
      status: "sending" as const,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    if (socket && connected) {
      socket.emit(
        "message:send",
        {
          consultationId,
          content: newContent,
          clientMsgId,
        },
        (res: any) => {
          if (res?.success && res?.data) {
            setMessages((prev) =>
              prev.map((m) =>
                m.clientMsgId === clientMsgId
                  ? { ...res.data, status: "sent" }
                  : m
              )
            );
          }
        }
      );
    } else {
      // Fallback via HTTP REST
      try {
        const res = await api.post<ApiResponse<any>>(`/api/consultations/${consultationId}/messages`, {
          content: newContent,
          clientMsgId,
        });
        if (res.data.success && res.data.data) {
          setMessages((prev) =>
            prev.map((m) =>
              m.clientMsgId === clientMsgId
                ? { ...res.data.data, status: "sent" }
                : m
            )
          );
        }
      } catch (err) {
        console.error("Error sending message via HTTP fallback:", err);
        setMessages((prev) =>
          prev.map((m) =>
            m.clientMsgId === clientMsgId
              ? { ...m, status: "failed" }
              : m
          )
        );
      }
    }
  };

  return (
    <div className="wa-chat-pane" style={{ display: "flex", flexDirection: "column", height: "100%", background: "#efeae2" }}>
      <style>{`
        @keyframes waSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="wa-chat-body" style={{ flex: 1, padding: "14px 16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="wa-encryption-pill" style={{ alignSelf: "center", margin: "4px auto 8px" }}>
          <span>🔒</span>
          <span>Llamada y chat cifrados de extremo a extremo · SENASA</span>
        </div>
        <div className="wa-date-pill" style={{ alignSelf: "center", margin: "0 auto 6px" }}>HOY</div>

        {messages.length === 0 ? (
          <div className="v-chat__empty" style={{ textAlign: "center", padding: "32px 16px", color: "var(--ink-soft)" }}>
            <Icon name="message" size={26} />
            <p style={{ marginTop: 8, fontSize: 13 }}>Todavía no hay mensajes con {otherName}. Escribí abajo para comenzar.</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === user?.id;
            const time = m.createdAt
              ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Ahora";
            return (
              <div
                key={m.id || m.clientMsgId}
                className={`wa-bubble ${mine ? "wa-bubble--sent" : "wa-bubble--received"}`}
                style={{
                  alignSelf: mine ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                }}
              >
                {!mine && (
                  <div className="wa-bubble__sender" style={{ fontSize: 11.5, fontWeight: 700, color: "#008069", marginBottom: 2 }}>
                    {m.sender?.firstName || otherName}
                  </div>
                )}
                <p className="wa-bubble__text" style={{ margin: 0, fontSize: 13, lineHeight: 1.45, color: "#111b21" }}>
                  {m.content}
                </p>
                <div className="wa-bubble__meta" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 3, fontSize: 10, color: "#667781" }}>
                  <span>{time}</span>
                  {mine && <WhatsAppCheck state={m.status || "read"} />}
                </div>
              </div>
            );
          })
        )}
        <div style={{ fontSize: 11, padding: "4px 8px", color: connected ? "#008069" : "#64748b", display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: "auto" }}>
          <i className={connected ? "is-online" : "is-offline"} style={{ width: 7, height: 7, borderRadius: "50%" }} />
          {connected ? "Canal telemático seguro conectado" : "Conectando al servidor…"}
        </div>
        <div ref={endRef} />
      </div>

      <footer className="wa-chat-footer" style={{ padding: "8px 12px", background: "#f0f2f5", display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid #e9edef" }}>
        <div className="wa-input-pill" style={{ flex: 1, background: "#ffffff", borderRadius: 8, height: 40, display: "flex", alignItems: "center", padding: "0 12px" }}>
          <input
            aria-label="Escribir mensaje"
            placeholder={`Escribir a ${otherName}…`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            style={{ width: "100%", border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#111b21" }}
          />
        </div>
        <button
          className="wa-send-btn"
          disabled={!text.trim()}
          onClick={handleSend}
          aria-label="Enviar mensaje"
          style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: text.trim() ? "#00a884" : "#8696a0", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: text.trim() ? "pointer" : "default" }}
        >
          <Icon name="send" size={17} />
        </button>
      </footer>
    </div>
  );
}

export type CallRoomPanel = "" | "Chat" | "Ficha" | "Evolución";

function Room({ id }: { id: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { consults, queue, finish } = useVet();

  // Fetch real consultation data from PostgreSQL
  const { data: consultation, refetch: refetchConsultation } = useQuery<BackendConsultation | null>({
    queryKey: ["consultation", id],
    queryFn: async () => {
      try {
        const res = await api.get<ApiResponse<BackendConsultation>>(`/api/consultations/${id}`);
        return res.data.success && res.data.data ? res.data.data : null;
      } catch {
        return null;
      }
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "WAITING" ? 3000 : status === "ACTIVE" ? 4000 : false;
    },
  });

  // Dynamically register pet into local dictionary if loaded
  useEffect(() => {
    if (consultation?.pet) {
      const mapped = mapBackendPetToPatient(consultation.pet, consultation.client);
      registerPatient(mapped);
    }
  }, [consultation?.pet, consultation?.client]);

  const fallbackConsult = consults.find((c: Consult) => c.id === id) ?? initialConsults.find((c: Consult) => c.id === id);
  const fallbackQueued = queue.find((q: QueueItem) => q.id === id) ?? initialQueue.find((q: QueueItem) => q.id === id);
  const petId = consultation?.petId ?? fallbackConsult?.petId ?? fallbackQueued?.petId ?? "milo";
  const p = getPatient(petId);
  const triage = fallbackQueued?.triage ?? fallbackConsult?.triage;

  const [secs, setSecs] = useState(0);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  // Inicialización limpia: iniciar siempre en "" (cerrado) para dar prioridad
  // total a la cámara/video del paciente y médico, evitando que el drawer
  // fixed de 66vh tape la pantalla al ingresar (BUG-01 test1.md):
  const [panel, setPanel] = useState<CallRoomPanel>("");
  const [celebrating, setCelebrating] = useState(false);
  const wasWaitingRef = useRef(false);
  const [ending, setEnding] = useState(false);
  const endingRef = useRef(false);
  const disconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  endingRef.current = ending;
  const [showReviewModal, setShowReviewModal] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const cachedUser = (() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("vetconnect_user") : null;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const effectiveUser = user || cachedUser;
  const isVet = effectiveUser?.role === "VET";
  const fromClient = effectiveUser
    ? effectiveUser.role === "CLIENT"
    : typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("from") === "client" ||
        window.location.pathname.startsWith("/client")
      : false;

  // Auto-asignación defensiva e idempotente para rol VET si la consulta sigue en WAITING
  const assignAttemptedRef = useRef(false);

  useEffect(() => {
    if (consultation?.status === "WAITING" && isVet && !assignAttemptedRef.current) {
      assignAttemptedRef.current = true;
      api
        .patch<ApiResponse<BackendConsultation>>(`/api/consultations/${id}/assign`)
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            queryClient.setQueryData(["consultation", id], res.data.data);
            queryClient.invalidateQueries({ queryKey: ["consultation", id] });
            queryClient.invalidateQueries({ queryKey: ["consultations"] });
          }
        })
        .catch((err) => {
          console.warn("Defensive assign in CallRoom notice:", err);
        });
    }
  }, [consultation?.status, isVet, id, queryClient]);

  // Participant naming derived directly from DB
  const petName = consultation?.pet?.name || p.name || "Mascota";
  const petKind = consultation?.pet?.species || p.kind || "Canino";
  const petBreed = consultation?.pet?.breed ? ` · ${consultation.pet.breed}` : "";
  const reason = consultation?.notes || fallbackConsult?.reason || fallbackQueued?.reason || "Videoconsulta telemática";

  const tutorName = consultation?.client
    ? [consultation.client.firstName, consultation.client.lastName].filter(Boolean).join(" ") || "Tutor"
    : (p.tutor || "Tutor");

  const tutorInitials = consultation?.client
    ? `${consultation.client.firstName?.[0] || "T"}${consultation.client.lastName?.[0] || ""}`.toUpperCase()
    : "TU";

  const hasVetAssigned = Boolean(consultation?.vet);
  const vetName = consultation?.vet
    ? (consultation.vet.lastName ? `Dr. ${consultation.vet.firstName} ${consultation.vet.lastName}` : `Dr. ${consultation.vet.firstName}`)
    : (isVet && user
      ? (user.lastName ? `Dr. ${user.firstName} ${user.lastName}` : `Dr. ${user.firstName}`)
      : (consultation?.status === "WAITING" ? "Guardia Veterinaria" : "Veterinario de guardia"));

  const vetInitials = consultation?.vet
    ? `${consultation.vet.firstName?.[0] || "V"}${consultation.vet.lastName?.[0] || ""}`.toUpperCase()
    : (isVet && user ? `${user.firstName?.[0] || "V"}${user.lastName?.[0] || ""}`.toUpperCase() : "VC");

  const remoteName = fromClient ? (hasVetAssigned ? vetName : "Guardia Veterinaria") : `${tutorName} · ${petName}`;
  const remoteInitials = fromClient ? vetInitials : tutorInitials;
  const selfInitials = user ? `${user.firstName?.[0] || "U"}${user.lastName?.[0] || ""}`.toUpperCase() : "VO";
  const chatOtherName = fromClient
    ? (hasVetAssigned ? vetName : "la guardia veterinaria")
    : (tutorName || "el tutor");

  // Derive callState from consultation lifecycle
  const [callState, setCallState] = useState<"connecting" | "waiting" | "connected" | "reconnecting" | "ended" | "error">(
    fromClient ? "waiting" : "connecting"
  );

  useEffect(() => {
    if (consultation?.status === "WAITING") {
      setCallState("waiting");
    } else if (consultation?.status === "COMPLETED" || consultation?.status === "CANCELLED") {
      setCallState("ended");
    } else if (consultation?.status === "ACTIVE") {
      setCallState("connected");
    } else if (!consultation) {
      setCallState(fromClient ? "waiting" : "connecting");
    }
  }, [consultation?.status, consultation, fromClient]);

  // WAITING -> ACTIVE: celebrate for 1.2s before mounting the call console
  useEffect(() => {
    if (consultation?.status === "WAITING") {
      wasWaitingRef.current = true;
    } else if (consultation?.status === "ACTIVE" && wasWaitingRef.current) {
      wasWaitingRef.current = false;
      setCelebrating(true);
      const t = window.setTimeout(() => setCelebrating(false), 1200);
      return () => window.clearTimeout(t);
    }
  }, [consultation?.status]);

  // LiveKit WebRTC state
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitWsUrl, setLivekitWsUrl] = useState<string | undefined>(undefined);
  const [livekitFailed, setLivekitFailed] = useState(false);

  useEffect(() => {
    if (consultation?.status === "ACTIVE" && !livekitToken && !livekitFailed) {
      api
        .post<ApiResponse<{ token: string; wsUrl: string }>>(`/api/calls/${id}/token`)
        .then((res) => {
          if (res.data.success && res.data.data?.token) {
            setLivekitToken(res.data.data.token);
            if (res.data.data.wsUrl) setLivekitWsUrl(res.data.data.wsUrl);
          }
        })
        .catch((err) => {
          console.warn("LiveKit token notice:", err);
          setLivekitFailed(true);
        });
    }
  }, [consultation?.status, id, livekitToken, livekitFailed]);

  // Mobile WebView handshake
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: "page:ready" }));
    }
  }, []);

  // Screen WakeLock during call/waiting
  useEffect(() => {
    let wakeLockSentinel: any = null;
    const requestWakeLock = async () => {
      try {
        if (typeof navigator !== "undefined" && "wakeLock" in navigator && (navigator as any).wakeLock?.request) {
          wakeLockSentinel = await (navigator as any).wakeLock.request("screen");
        }
      } catch {}
    };
    if (callState === "waiting" || callState === "connected") {
      requestWakeLock();
    }
    const handleVis = () => {
      if (document.visibilityState === "visible" && (callState === "waiting" || callState === "connected")) {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVis);
    return () => {
      document.removeEventListener("visibilitychange", handleVis);
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
        wakeLockSentinel = null;
      }
    };
  }, [callState]);

  // Local camera preview via getUserMedia (only when LiveKit is not active)
  useEffect(() => {
    if (!cam || livekitToken) {
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
        localVideoRef.current.srcObject = null;
      }
      return;
    }
    let activeStream: MediaStream | null = null;
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          activeStream = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {});
    }
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cam, livekitToken]);

  // Listen for socket events (like call:ended) in Room
  useEffect(() => {
    const wsUrl = getWsUrl();
    const token = getAccessToken();
    const deviceId = getDeviceId();
    const roomSocket = io(wsUrl, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnection: true,
      auth: { token: token ? `Bearer ${token}` : undefined, deviceId },
    });

    roomSocket.on("connect", () => {
      roomSocket.emit("join:consultation", { consultationId: id });
    });

    roomSocket.on("session:invalidated", (data: { reason?: string; message?: string }) => {
      roomSocket.disconnect();
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("vetconnect:session_terminated", {
            detail: {
              reason: data?.reason || "MULTIPLE_DEVICES_DETECTED",
              message: data?.message || "Tu sesión fue transferida a otro dispositivo.",
            },
          })
        );
      }
    });

    roomSocket.on("call:ended", () => {
      setCallState("ended");
      queryClient.invalidateQueries({ queryKey: ["consultation", id] });
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      if (fromClient) {
        setShowReviewModal(true);
      }
    });

    return () => {
      roomSocket.off("call:ended");
      roomSocket.off("session:invalidated");
      roomSocket.disconnect();
    };
  }, [id, queryClient, fromClient]);

  // Duration timer
  useEffect(() => {
    const t = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  const clock = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;

  // Call completion handler
  const handleFinalize = async () => {
    if (disconnectTimerRef.current) {
      clearTimeout(disconnectTimerRef.current);
      disconnectTimerRef.current = null;
    }
    setEnding(false);
    try {
      await api.patch(`/api/consultations/${id}/complete`, {
        diagnosisNotes: fromClient ? "Consulta finalizada por el tutor." : "Consulta telemática finalizada con éxito.",
      });
    } catch (err) {
      console.warn("Notice completing consultation:", err);
    }

    queryClient.invalidateQueries({ queryKey: ["consultation", id] });
    queryClient.invalidateQueries({ queryKey: ["consultations"] });

    // Inform socket room
    try {
      const wsUrl = getWsUrl();
      const token = getAccessToken();
      const s = io(wsUrl, {
        withCredentials: true,
        transports: ["polling", "websocket"],
        reconnection: true,
        auth: { token: token ? `Bearer ${token}` : undefined },
      });
      s.emit("call:ended", { consultationId: id });
      setTimeout(() => s.disconnect(), 1000);
    } catch {}

    if (!fromClient) {
      void finish(id);
    }
    setCallState("ended");
    if (fromClient) {
      setShowReviewModal(true);
    }
  };

  if (callState === "ended") {
    return (
      <main className="v-call-summary">
        <section className="v-call-summary__card">
          <span className="v-call-summary__icon">
            <Icon name="check" size={28} />
          </span>
          <span className="eyebrow">Videoconsulta</span>
          <h1>Consulta finalizada</h1>
          <p>La llamada finalizó exitosamente. Podés revisar los detalles de la atención.</p>
          <dl>
            <div>
              <dt>{fromClient ? "Veterinario" : "Tutor"}</dt>
              <dd>{fromClient ? vetName : tutorName}</dd>
            </div>
            <div>
              <dt>Mascota</dt>
              <dd>{petName} · {petKind}{petBreed}</dd>
            </div>
            <div>
              <dt>Fecha y duración</dt>
              <dd>Hoy · {clock}</dd>
            </div>
            <div>
              <dt>Motivo</dt>
              <dd>{reason}</dd>
            </div>
            <div className="is-wide">
              <dt>Diagnóstico / Evolución</dt>
              <dd>{consultation?.diagnosisNotes || "Atención telemática realizada y registrada en el historial clínico."}</dd>
            </div>
          </dl>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {fromClient && (
              <Button variant="secondary" onClick={() => setShowReviewModal(true)}>
                ⭐ Calificar atención
              </Button>
            )}
            <Button
              icon="arrow"
              onClick={() => go(fromClient ? "/client/consultations" : `/vet/consultations/${id}`)}
            >
              {fromClient ? "Volver a mis consultas" : "Volver a la consulta"}
            </Button>
          </div>
        </section>

        {fromClient && (
          <ReviewModal
            isOpen={showReviewModal}
            consultationId={id}
            onClose={() => setShowReviewModal(false)}
            onSuccess={() => {
              setShowReviewModal(false);
              go("/client/consultations");
            }}
          />
        )}
      </main>
    );
  }

  const stateCopy = {
    connecting: [fromClient ? "Conectando con el veterinario…" : "Conectando con el tutor…", "Estamos preparando la sala de telemedicina."],
    waiting: [
      fromClient ? "Sala de espera de guardia" : "Esperando que el tutor se conecte…",
      fromClient
        ? "Tu solicitud está en la cola de atención médica. Te conectaremos automáticamente apenas un veterinario de guardia tome la consulta."
        : "Podés quedarte en esta pantalla. Te avisamos en cuanto ingrese.",
    ],
    reconnecting: ["Se perdió momentáneamente la conexión.", "Estamos intentando reconectar la llamada."],
    error: ["No pudimos conectar la videollamada.", "Revisá tu conexión e intentá nuevamente."],
    connected: ["", ""],
    ended: ["", ""],
  }[callState];

  const parsedNotes = parseConsultationNotes(reason);
  const cleanReason = parsedNotes.cleanNotes;
  const effectiveTriage = triage ?? (parsedNotes.priority ? TRIAGE_BY_TIER[parsedNotes.priority] : undefined);

  // FEAT-07: the tutor never sees the call console until a vet has accepted and call is ACTIVE
  if (fromClient && consultation?.status !== "ACTIVE") {
    const tierLabel = parsedNotes.priority
      ? { ROJO: "CRÍTICO", AMARILLO: "MODERADO", VERDE: "RUTINA" }[parsedNotes.priority]
      : null;
    return (
      <WaitingRoomExperience
        petName={petName}
        tutorName={tutorName}
        symptom={cleanReason}
        clock={clock}
        tierLabel={tierLabel}
        onBack={() => go("/client/consultations")}
        onCancel={async () => {
          try {
            await api.patch(`/api/consultations/${id}/cancel`);
          } catch (err) {
            console.warn("Notice cancelling consultation:", err);
          }
          queryClient.invalidateQueries({ queryKey: ["consultation", id] });
          queryClient.invalidateQueries({ queryKey: ["consultations"] });
          go("/client/consultations");
        }}
      />
    );
  }

  if (fromClient && celebrating) {
    return (
      <main className="v-wait" role="status" aria-live="assertive" data-testid="waiting-room-connected">
        <section className="v-wait__center">
          <span className="v-wait__core is-pulse"><HamsterMascot size="md" /></span>
          <h1>¡Veterinario conectado!</h1>
          <p>Ingresando a la consulta...</p>
        </section>
      </main>
    );
  }

  return (
    <div className={`v-call ${panel ? "has-panel" : ""} h-[100dvh] max-h-[100dvh] overflow-hidden`}>
      <header className="v-call__top">
        <button className="v-call__back" onClick={() => setEnding(true)} aria-label="Salir de la videollamada">
          <Icon name="left" size={20} />
        </button>
        <div>
          <b>{petName} · {tutorName}</b>
          <span>{cleanReason}</span>
        </div>
        {effectiveTriage && <TriageBadge level={effectiveTriage} compact />}
        <span className={`v-call__net ${callState === "reconnecting" ? "is-warning" : ""}`}>
          <Icon name={callState === "reconnecting" ? "repeat" : "check"} size={13} />
          {callState === "reconnecting" ? "Reconectando" : "Conexión estable"}
        </span>
        <time className="v-call__time" aria-label={`Duración ${Math.floor(secs / 60)} minutos`}>
          {clock}
        </time>
      </header>

      <main className="v-call__stage">
        <div className="v-call__remote">
          {/* LiveKit WebRTC active feed if available */}
          {livekitToken ? (
            <LiveKitRoom
              video={cam}
              audio={mic}
              token={livekitToken}
              serverUrl={livekitWsUrl}
              connect={true}
              data-lk-theme="default"
              style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
              onConnected={() => {
                if (disconnectTimerRef.current) {
                  clearTimeout(disconnectTimerRef.current);
                  disconnectTimerRef.current = null;
                }
                setCallState("connected");
              }}
              onDisconnected={(reason) => {
                if (endingRef.current) {
                  handleFinalize();
                  return;
                }
                console.warn("LiveKit transient disconnect notice, waiting 5s for reconnect...", reason);
                setCallState("reconnecting");
                if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
                disconnectTimerRef.current = setTimeout(() => {
                  handleFinalize();
                }, 5000);
              }}
            >
              <LiveKitTrackSynchronizer mic={mic} cam={cam} />
              <VideoConference />
            </LiveKitRoom>
          ) : callState !== "connected" ? (
            <div className={`v-call__state v-call__state--${callState}`} role="status" aria-live="assertive">
              <span>
                <Icon name={callState === "error" ? "alert" : "repeat"} size={26} />
              </span>
              <h1>{stateCopy[0]}</h1>
              <p>{stateCopy[1]}</p>
              {callState === "waiting" && (
                <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, padding: "6px 14px", borderRadius: 20, background: "#254d4a", color: "#609f9c", border: "1px solid #3d6f6c" }}>
                  <i className="is-online" style={{ width: 8, height: 8 }} />
                  <span>Sala de espera activa · Notificando a médicos de guardia</span>
                </div>
              )}
              {callState === "error" && (
                <Button variant="secondary" icon="repeat" onClick={() => refetchConsultation()}>
                  Reintentar
                </Button>
              )}
            </div>
          ) : (
            <div className="v-call__professional" role="img" aria-label={`Video de ${remoteName}`}>
              <span className="avatar">{remoteInitials}</span>
              <small>{remoteName}</small>
              <span style={{ fontSize: 12, color: "#d9e8e4", marginTop: 4 }}>
                Canal telemático HD activo
              </span>
            </div>
          )}

          {/* Clinical identification tag */}
          <span className="v-call__tag">
            {callState === "waiting" ? "Sala de espera · Guardia VetConnect" : remoteName}
          </span>

          {/* Legal compliance badge */}
          <span
            className="v-call__tag"
            style={{
              top: 14,
              left: 14,
              bottom: "auto",
              fontSize: 11,
              background: "#183c3a",
              border: "1px solid #315f5d",
              color: "#609f9c",
            }}
          >
            Canal Cifrado • SENASA Res. 1442/2021
          </span>
        </div>

        {/* Local user pip with live webcam stream - only when LiveKit room is not active */}
        {!livekitToken && (
          <div className={`v-call__self ${cam ? "" : "is-off"} ${callState === "waiting" ? "v-call__self--waiting" : "v-call__self--active bottom-20 right-3 z-20 w-24 h-32 rounded-xl overflow-hidden shadow-lg"}`}>
            {cam ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
              />
            ) : (
              <>
                <Icon name="video" size={18} />
                <small>Cámara apagada</small>
              </>
            )}
            <em className="v-call__self-name">Vos ({selfInitials})</em>
            {!mic && (
              <span className="v-call__muted">
                <Icon name="micoff" size={13} />
              </span>
            )}
          </div>
        )}
      </main>

      <nav className="v-call__bar" aria-label="Controles de la llamada">
        <button
          className={`v-ctl ${mic ? "" : "is-off"}`}
          aria-label={mic ? "Silenciar micrófono" : "Activar micrófono"}
          aria-pressed={!mic}
          onClick={() => setMic(!mic)}
        >
          <Icon name={mic ? "mic" : "micoff"} size={20} />
          <span>{mic ? "Silenciar" : "Activar mic"}</span>
        </button>
        <button
          className={`v-ctl ${cam ? "" : "is-off"}`}
          aria-label={cam ? "Apagar cámara" : "Encender cámara"}
          aria-pressed={!cam}
          onClick={() => setCam(!cam)}
        >
          <Icon name={cam ? "video" : "micoff"} size={20} />
          <span>{cam ? "Apagar cámara" : "Encender"}</span>
        </button>
        <button
          className={`v-ctl ${panel === "Chat" ? "is-on" : ""}`}
          aria-pressed={panel === "Chat"}
          onClick={() => setPanel(panel === "Chat" ? "" : "Chat")}
        >
          <Icon name="message" size={20} />
          <span>Chat</span>
        </button>
        <button
          className={`v-ctl ${panel === "Ficha" ? "is-on" : ""}`}
          aria-pressed={panel === "Ficha"}
          onClick={() => setPanel(panel === "Ficha" ? "" : "Ficha")}
        >
          <Icon name="file" size={20} />
          <span>Ficha</span>
        </button>
        {!fromClient && (
          <button
            className={`v-ctl ${panel === "Evolución" ? "is-on" : ""}`}
            aria-pressed={panel === "Evolución"}
            onClick={() => setPanel(panel === "Evolución" ? "" : "Evolución")}
          >
            <Icon name="edit" size={20} />
            <span>Evolución</span>
          </button>
        )}
        <button className="v-ctl v-ctl--end" onClick={() => setEnding(true)}>
          <Icon name="phone" size={20} />
          <span>Finalizar</span>
        </button>
      </nav>

      <aside
        className={`v-call__panel ${panel ? "is-open" : "is-closed"}`}
        style={{ display: panel ? "flex" : "none" }}
        aria-label={
          panel === "Chat"
            ? `Chat con ${chatOtherName}`
            : panel === "Ficha"
            ? "Ficha clínica"
            : "Evolución clínica"
        }
      >
        <header>
          <b>
            {panel === "Chat"
              ? `Chat con ${chatOtherName}`
              : panel === "Ficha"
              ? "Ficha clínica"
              : "Evolución clínica"}
          </b>
          <button className="button button--icon" onClick={() => setPanel("")} aria-label="Cerrar panel">
            <Icon name="close" size={16} />
          </button>
        </header>
        <div className="v-call__panel-body" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ display: panel === "Chat" ? "flex" : "none", flex: 1, flexDirection: "column", height: "100%", minHeight: 0 }}>
            <CallChatPanel consultationId={id} otherName={chatOtherName} user={user} />
          </div>
          {panel === "Ficha" && <FichaClinica p={p} />}
          {panel === "Evolución" && <EvolutionEditor p={p} />}
        </div>
      </aside>

      {ending && (
        <Modal
          title="Finalizar videollamada"
          text="La llamada terminará para todas las personas. Vas a poder revisar el resumen de la consulta."
          cancel="Seguir en la llamada"
          confirm="Finalizar llamada"
          destructive
          onClose={() => setEnding(false)}
          onConfirm={handleFinalize}
        />
      )}
    </div>
  );
}

export default function CallRoom({ id }: { id: string }) {
  return (
    <VetProvider forceEmpty={false}>
      <Room id={id} />
    </VetProvider>
  );
}
