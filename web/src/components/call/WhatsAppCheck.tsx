export function WhatsAppCheck({
  state = "read",
}: {
  state?: "sending" | "sent" | "delivered" | "read" | "failed";
}) {
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
        <path d="M1.5 6L5.5 10L14.5 1" stroke="#8696a0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  const color = state === "read" ? "#53bdeb" : "#8696a0";
  return (
    <svg width="16" height="11" viewBox="0 0 18 11" fill="none" aria-label={state === "read" ? "Leído" : "Entregado"}>
      <path d="M1 6L5 10L14 1" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 6L9 10L18 1" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
