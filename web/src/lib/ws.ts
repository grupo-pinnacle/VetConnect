export const getWsUrl = (): string => {
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
