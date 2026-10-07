import { useEffect, useRef, type ReactNode } from "react";

export type IconName =
  | "home"
  | "paw"
  | "video"
  | "calendar"
  | "message"
  | "file"
  | "bell"
  | "user"
  | "settings"
  | "heart"
  | "arrow"
  | "plus"
  | "clock"
  | "check"
  | "search"
  | "send"
  | "paperclip"
  | "download"
  | "trash"
  | "shield"
  | "menu"
  | "close"
  | "chevron"
  | "edit"
  | "phone"
  | "alert"
  | "filter"
  | "image"
  | "zap"
  | "mic"
  | "micoff"
  | "stethoscope"
  | "pill"
  | "expand"
  | "left"
  | "qr"
  | "users"
  | "repeat"
  | "x";

const iconPaths: Record<IconName, ReactNode> = {
  alert: <><path d="M12 3 2 20h20Z"/><path d="M12 10v4M12 17h.01"/></>,
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8Z"/>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-9 9"/></>,
  zap: <path d="M13 2 4 14h7l-1 8 9-12h-7Z"/>,
  mic: <><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/></>,
  micoff: <><path d="m3 3 18 18M9 9v2a3 3 0 0 0 5 2M15 9V5a3 3 0 0 0-5.7-1.3M5 11a7 7 0 0 0 11 5.7M12 18v4"/></>,
  stethoscope: <><path d="M5 3v6a4 4 0 0 0 8 0V3M9 13v2a5 5 0 0 0 10 0v-2"/><circle cx="19" cy="11" r="2"/></>,
  pill: <><rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="m8.5 8.5 7 7"/></>,
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>,
  left: <path d="m15 18-6-6 6-6"/>,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h3M20 17v4"/></>,
  users: <><circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M22 21a7 7 0 0 0-4-6.3"/></>,
  repeat: <><path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></>,
  x: <path d="m6 6 12 12M18 6 6 18"/>,
  home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
  paw: <><circle cx="8" cy="8" r="2.2"/><circle cx="16" cy="8" r="2.2"/><circle cx="5" cy="13" r="2"/><circle cx="19" cy="13" r="2"/><path d="M8 18c0-2.4 1.8-4.5 4-4.5s4 2.1 4 4.5c0 1.8-1.5 3-4 3s-4-1.2-4-3Z"/></>,
  video: <><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
  message: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 10h8M8 14h5"/></>,
  file: <><path d="M6 2h8l4 4v16H6Z"/><path d="M14 2v5h5M9 13h6M9 17h6"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a2 2 0 0 0 .4 2.2l.1.1-2.6 2.6-.1-.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.2 1.8v.2h-3.6v-.2A2 2 0 0 0 9 19.4a2 2 0 0 0-2.2.4l-.1.1-2.6-2.6.1-.1A2 2 0 0 0 4.6 15a2 2 0 0 0-1.8-1.2h-.2v-3.6h.2A2 2 0 0 0 4.6 9a2 2 0 0 0-.4-2.2l-.1-.1 2.6-2.6.1.1A2 2 0 0 0 9 4.6a2 2 0 0 0 1.2-1.8v-.2h3.6v.2A2 2 0 0 0 15 4.6a2 2 0 0 0 2.2-.4l.1-.1 2.6 2.6-.1.1a2 2 0 0 0-.4 2.2 2 2 0 0 0 1.8 1.2h.2v3.6h-.2A2 2 0 0 0 19.4 15Z"/></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  send: <path d="m3 3 18 9-18 9 4-9-4-9Zm4 9h14"/>,
  paperclip: <path d="m20 12-7.5 7.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/>,
  download: <><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></>,
  shield: <><path d="M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5Z"/><path d="m8 12 2.5 2.5L16 9"/></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  edit: <><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10Z"/><path d="m14 7 3 3"/></>,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 1.9Z"/>,
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>;
}

export const photos = {
  milo: "https://images.unsplash.com/photo-1628616109355-96eb0aaa4d2b?auto=format&fit=crop&w=600&q=82",
  luna: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=600&q=82",
  nube: "https://images.unsplash.com/photo-1707220316773-f14bc4439212?auto=format&fit=crop&w=600&q=82",
  kiwi: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=600&q=82",
  toby: "https://images.unsplash.com/photo-1619980296991-5c0d64b23950?auto=format&fit=crop&w=600&q=82",
};

export function go(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function Button({ children, variant = "primary", icon, onClick, disabled = false, className = "", ariaLabel }: { children?: ReactNode; variant?: "primary" | "secondary" | "soft" | "danger" | "icon"; icon?: IconName; onClick?: () => void; disabled?: boolean; className?: string; ariaLabel?: string }) {
  return <button className={`button button--${variant} ${className}`} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>{icon && <Icon name={icon} size={18}/>} {children}</button>;
}

export function Status({ children, tone = "teal" }: { children: ReactNode; tone?: "teal" | "amber" | "gray" | "red" }) {
  return <span className={`status status--${tone}`}><span className="status__dot"/>{children}</span>;
}

export function Logo({ to = "/client/dashboard" }: { to?: string }) {
  return <button className="logo" onClick={() => go(to)} aria-label="Ir al inicio"><span className="logo__mark"><Icon name="heart" size={20}/></span><span>VetConnect</span></button>;
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-header"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>;
}

export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (tab: string) => void }) {
  return <div className="tabs" role="tablist">{tabs.map((tab) => <button role="tab" aria-selected={active === tab} className={active === tab ? "is-active" : ""} onClick={() => onChange(tab)} key={tab}>{tab}</button>)}</div>;
}

export type MessageState = "sending" | "sent" | "read" | "error";

export function MessageBubble({ text, time, mine = false, state = mine ? "read" : undefined, onRetry }: { text: string; time: string; mine?: boolean; state?: MessageState; onRetry?: () => void }) {
  const labels: Record<MessageState, string> = { sending: "Enviando", sent: "Enviado", read: "Leído", error: "No se pudo enviar" };
  return <div className={`message-bubble ${mine ? "message-bubble--mine" : ""} ${state ? `message-bubble--${state}` : ""}`}>
    <p>{text}</p>
    <span>{time}{state && <> · {labels[state]} {state !== "sending" && <Icon name={state === "error" ? "alert" : "check"} size={13}/>}</>}</span>
    {state === "error" && onRetry && <button className="message-bubble__retry" onClick={onRetry}><Icon name="repeat" size={13}/> Reintentar</button>}
  </div>;
}

export type NoticeTone = "info" | "success" | "warning" | "error" | "clinical";
const noticeIcons: Record<NoticeTone, IconName> = { info: "bell", success: "check", warning: "alert", error: "alert", clinical: "stethoscope" };

export function Alert({ tone = "info", title, children, action }: { tone?: NoticeTone; title: string; children?: ReactNode; action?: ReactNode }) {
  return <div className={`alert alert--${tone}`} role={tone === "error" ? "alert" : "status"}><Icon name={noticeIcons[tone]} size={20}/><div><strong>{title}</strong>{children && <p>{children}</p>}</div>{action}</div>;
}

export function Toast({ message, tone = "success", leaving = false }: { message: string; tone?: NoticeTone; leaving?: boolean }) {
  return <div className={`toast toast--${tone} ${leaving ? "is-leaving" : ""}`} role={tone === "error" ? "alert" : "status"} aria-live={tone === "error" ? "assertive" : "polite"}><Icon name={noticeIcons[tone]} size={17}/>{message}</div>;
}

export function Field({ label, value, editing }: { label: string; value: string; editing: boolean }) {
  return <label className="field"><span>{label}</span><input value={value} readOnly={!editing}/></label>;
}

export function EmptyState({ icon, title, text, action, onAction }: { icon: IconName; title: string; text: string; action?: string; onAction?: () => void }) {
  const handleClick = () => {
    if (onAction) {
      onAction();
    } else if (action === "Volver al inicio") {
      go("/client/dashboard");
    }
  };
  return <div className="empty-state"><span><Icon name={icon} size={27}/></span><h2>{title}</h2><p>{text}</p>{action && <Button icon="plus" onClick={handleClick}>{action}</Button>}</div>;
}

export function Modal({ title, text, cancel, confirm, destructive, onClose, onConfirm }: { title: string; text: string; cancel: string; confirm: string; destructive?: boolean; onClose: () => void; onConfirm?: () => void }) {
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const previous = useRef<HTMLElement | null>(null);
  useEffect(() => {
    previous.current = document.activeElement as HTMLElement;
    close.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialog.current) return;
      const focusable = [...dialog.current.querySelectorAll<HTMLElement>("button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); previous.current?.focus(); };
  }, [onClose]);
  return <div className="modal-layer" role="presentation"><button className="modal-scrim" onClick={onClose} aria-label="Cerrar modal"/><div ref={dialog} className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description"><button ref={close} className="button button--icon modal__close" onClick={onClose} aria-label="Cerrar"><Icon name="close" size={18}/></button><span className={`modal__icon ${destructive ? "is-danger" : ""}`}><Icon name={destructive ? "trash" : "file"}/></span><h2 id="modal-title">{title}</h2><p id="modal-description">{text}</p><div><Button variant="secondary" onClick={onClose}>{cancel}</Button><Button variant={destructive ? "danger" : "primary"} onClick={onConfirm ?? onClose}>{confirm}</Button></div></div></div>;
}
